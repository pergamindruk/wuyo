'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateWithFallback } from '@/lib/gemini'
import { PRICING, REPLY_MARK, RULES, STUDIO_CONTEXT, VOICE } from '@/lib/lab/ai/context'

type Result = { success: true; data: string } | { success: false; error: string }

function errorText(e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (/503|overloaded|unavailable/i.test(msg)) return 'Gemini jest chwilowo przeciążony. Spróbuj za minutę.'
    return 'Nie udało się wygenerować: ' + msg.slice(0, 200)
}

// ─── Odpowiedz klientowi (wycena + gotowy mail) ─────────────────────────────

export type ClientAnswer = { analysis: string; reply: string }

export async function answerClient(clientMessage: string, channel: 'mail' | 'whatsapp'):
    Promise<{ success: true; data: ClientAnswer } | { success: false; error: string }> {
    const message = clientMessage.trim().slice(0, 6000)
    if (!message) return { success: false, error: 'Wklej wiadomość od klienta.' }
    const prompt = `${STUDIO_CONTEXT}

WIADOMOŚĆ OD KLIENTA:
"""
${message}
"""

ZADANIE: przygotuj dla Mateusza dwie rzeczy.

CZĘŚĆ 1 (dla Mateusza, markdown, krótko):
## Czego chce
1-2 zdania.
## Branża i etap
Branża (albo "nie wiem, dopytaj") i etap prowadzenia klienta 1-7.
## Wycena
Dwa warianty w tabeli (pozycja z cennika | cena netto), każdy z sumą netto i brutto (x1,23):
- Wariant A: minimum, które spełnia DOKŁADNIE to, o co prosi klient (pozycje osobno, najtańsze pasujące).
- Wariant B: pakiet z cennika, jeśli któryś pasuje, z jednym zdaniem, co klient dostaje ekstra.
Policz sumy naprawdę. Nie pisz, że pakiet jest tańszy, jeśli suma wariantu A jest niższa.
Jeśli czegoś nie da się wycenić z cennika: "wycena indywidualna".
## Zapytaj klienta
1-3 pytania o rzeczy, od których zależy cena albo start (np. czy ma zdjęcia i teksty, ile podstron, czy ma domenę). "nic" tylko gdy naprawdę wszystko wiadomo.

Potem linia dokładnie: ${REPLY_MARK}

CZĘŚĆ 2: gotowa odpowiedź do klienta ${channel === 'whatsapp'
        ? 'na WhatsApp: 2-5 krótkich zdań, bez powitania typu "Szanowny", bez podpisu'
        : 'mailem: max 3 akapity (wstęp / zakres i cena / zachęta do odpowiedzi), na końcu podpis "Mateusz Machos\\nWUYO, Rzeszów"'}.
Czysty tekst, bez markdownu. Głosem Mateusza, ale własnymi słowami (nie kopiuj zdań z sekcji GŁOS).
- Odpowiedz na KAŻDE pytanie klienta. Pyta o cenę: podaj wariant A (netto + dopisek o VAT), pakiet B wspomnij jednym zdaniem.
  Pyta o termin: "termin potwierdzę po sprawdzeniu kolejki, zwykle to kwestia dni, nie miesięcy" (bez konkretnej liczby dni).
- Zakres: maksymalnie 3-4 krótkie zdania, bez wyliczania wszystkiego z pakietu.
- Na końcu jedno pytanie z części "Zapytaj klienta" albo propozycja krótkiego telefonu.`
    try {
        const out = await generateWithFallback('quote', prompt)
        const [analysis, reply = ''] = out.split(REPLY_MARK)
        const data = { analysis: analysis.trim(), reply: reply.trim() }
        await saveGeneration('quote', { kind: 'odpowiedz', channel, clientMessage: message }, `${data.analysis}\n\n${REPLY_MARK}\n\n${data.reply}`)
        return { success: true, data }
    } catch (e) {
        return { success: false, error: errorText(e) }
    }
}

// ─── Poprawki jednym kliknięciem ─────────────────────────────────────────────

const REFINE: Record<string, string> = {
    krocej: 'Skróć o połowę. Zostaw tylko to, co najważniejsze.',
    luzniej: 'Napisz luźniej, bardziej jak w rozmowie. Dalej kulturalnie.',
    oficjalniej: 'Napisz trochę bardziej oficjalnie (Pan/Pani), ale dalej krótko i bez korporacyjnych zwrotów.',
    bez_ceny: 'Usuń wszystkie kwoty. Zamiast ceny zaproponuj krótką rozmowę telefoniczną, żeby dopytać szczegóły.',
    whatsapp: 'Przerób na wiadomość WhatsApp: 2-4 krótkie zdania, bez podpisu.',
    konkretniej: 'Dodaj jeden konkretny przykład albo liczbę z cennika, usuń ogólniki.',
}

export async function refineText(text: string, mode: string, custom = ''): Promise<Result> {
    const instruction = mode === 'wlasne' ? custom.trim().slice(0, 500) : REFINE[mode]
    if (!instruction || !text.trim()) return { success: false, error: 'Brak tekstu albo polecenia.' }
    const prompt = `${VOICE}\n\n${RULES}\n\n${PRICING}\n\nTEKST:\n"""\n${text.slice(0, 8000)}\n"""\n\nPOLECENIE: ${instruction}\n\nZwróć TYLKO poprawiony tekst, bez komentarzy i bez cudzysłowów.`
    try {
        return { success: true, data: (await generateWithFallback('content', prompt)).trim() }
    } catch (e) {
        return { success: false, error: errorText(e) }
    }
}

// ─── Skrypt rozmowy dla firmy z kolejki telefonów ───────────────────────────

export type CallCandidate = {
    id: string
    name: string
    industry: string
    phone: string
    website: string
    reason: string
    problems: string[]
    score: number
}

export async function getCallCandidates(limit = 12): Promise<CallCandidate[]> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('call_queue')
        .select('id, name, industry, phone, website, reason, problems, score')
        .in('status', ['do_kontaktu', 'nie_odebral', 'oddzwonic'])
        .lte('next_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(limit)
    return (data ?? []) as CallCandidate[]
}

export async function generateCallScript(queueId: string): Promise<Result> {
    const supabase = await createClient()
    const { data: firm } = await supabase
        .from('call_queue')
        .select('name, industry, phone, website, reason, problems, notes')
        .eq('id', queueId)
        .maybeSingle()
    if (!firm) return { success: false, error: 'Nie znalazłem tej firmy w kolejce.' }
    const prompt = `${VOICE}\n\n${RULES}\n\n${PRICING}

FIRMA: ${firm.name} (${firm.industry || 'branża nieznana'})
Strona: ${firm.website || 'brak'}
Powód telefonu: ${firm.reason}
Problemy z audytu: ${(firm.problems as string[] | null)?.join('; ') || 'brak danych'}
Notatki z wcześniejszych prób: ${firm.notes || 'brak'}

ZADANIE: ściągawka do telefonu dla Mateusza. Markdown, krótko, mówione zdania (do przeczytania na głos):
## Otwarcie (20 sekund)
Kim jest, skąd dzwoni, jedno zdanie o tym, co zauważył u NICH (z problemów wyżej, prostymi słowami). Na końcu pytanie o zgodę na minutę rozmowy.
## 2 pytania
Pytania, które otwierają rozmowę o ich klientach (np. skąd dziś przychodzą klienci).
## Jeśli powie...
- "mam już stronę / mam kogoś"
- "nie mam czasu"
- "ile to kosztuje" (podaj widełki z cennika, netto + VAT)
- "proszę wysłać maila"
## Cel rozmowy
Jeden następny krok (np. zgoda na wysłanie 2-3 uwag mailem albo spotkanie 15 min). Bez naciskania.
Nie wymyślaj faktów o firmie spoza danych wyżej.`
    try {
        const out = (await generateWithFallback('content', prompt)).trim()
        await saveGeneration('quote', { kind: 'telefon', queueId, firm: firm.name }, out)
        return { success: true, data: out }
    } catch (e) {
        return { success: false, error: errorText(e) }
    }
}

// ─── Post Creator ────────────────────────────────────────────────────────────

const PLATFORM_GUIDE: Record<string, string> = {
    instagram: 'krótkie akapity, emoji z umiarem (max 3), 5-8 hashtagów na końcu (w tym #rzeszów), max 2200 znaków',
    facebook: 'jak rozmowa, może być dłuższy, 2-3 hashtagi na końcu',
    both: 'pasuje na Instagram i Facebook: krótkie akapity, max 3 emoji, 5-7 hashtagów, max 2200 znaków',
    linkedin: 'rzeczowo, konkretne liczby, 3-5 hashtagów na końcu, max 3000 znaków',
    blog: 'artykuł z nagłówkami (##), min 600 słów, pierwsze zdanie = krótka odpowiedź, sekcja FAQ, bez hashtagów',
}

const TONE_GUIDE: Record<string, string> = {
    poradnik: 'daj jedną konkretną rzecz, którą właściciel firmy może sprawdzić albo zrobić sam dziś',
    realizacja: 'pokaż realizację: dla kogo, jaki był problem, co zrobiłeś, co się zmieniło. Tylko fakty z kontekstu, nic nie dopisuj',
    pytanie: 'zacznij od pytania, które zadaje właściciel małej firmy (np. "ile to kosztuje"), odpowiedz konkretnie',
    oferta: 'pokaż jedną usługę z ceną z cennika (netto + VAT), co klient dostaje, i zaproś do kontaktu',
    za_kulisami: 'z życia studia: jak pracujesz, sprzęt, proces, coś szczerego. Pierwsza osoba',
}

export async function generatePostForPlatform(topic: string, tone: string, platform: string, extraContext: string): Promise<Result> {
    const prompt = `${VOICE}\n\n${PRICING}

Piszesz post Mateusza (WUYO, Rzeszów). Odbiorca: właściciel małej firmy, 40-55 lat, nie zna się na grafice.
Platforma: ${platform}. Wytyczne: ${PLATFORM_GUIDE[platform] ?? PLATFORM_GUIDE.facebook}
Rodzaj: ${TONE_GUIDE[tone] ?? TONE_GUIDE.poradnik}
Temat: "${topic.slice(0, 1000)}"${extraContext ? `\nKontekst od Mateusza (fakty): "${extraContext.slice(0, 1500)}"` : ''}

Nie wymyślaj realizacji, klientów, opinii ani liczb spoza kontekstu i cennika.
Zwróć TYLKO gotowy post do skopiowania.`
    try {
        const out = (await generateWithFallback('content', prompt)).trim()
        await saveGeneration('content', { topic, tone, platform, extraContext }, out)
        return { success: true, data: out }
    } catch (e) {
        return { success: false, error: errorText(e) }
    }
}

// ─── Pipeline: Create project from quote ─────────────────────────────────────

export async function createProjectFromQuote(clientName: string, projectName: string, leadId?: string) {
    const { createProject } = await import('../projects/actions')
    const project = await createProject({ name: projectName, client: clientName })

    if (leadId) {
        try {
            const { updateLeadStatus } = await import('../crm/actions')
            await updateLeadStatus(leadId, 'Wycena')
        } catch (e) {
            console.error('Failed to update lead status:', e)
        }
    }

    return project
}

// ─── History (ai_generations table) ──────────────────────────────────────────

export type Generation = {
    id: string
    type: 'content' | 'quote'
    inputData: Record<string, string>
    output: string
    createdAt: string
}

async function saveGeneration(type: 'content' | 'quote', inputData: Record<string, string>, output: string) {
    try {
        const supabase = await createClient()
        await supabase.from('ai_generations').insert({ type, input_data: inputData, output })
    } catch (e) {
        console.error('saveGeneration error:', e)
    }
}

export async function getGenerations(limit = 20): Promise<Generation[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ai_generations')
        .select('id, type, input_data, output, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error || !data) {
        console.error('getGenerations error:', error)
        return []
    }

    return data.map((g) => ({
        id: g.id as string,
        type: g.type as Generation['type'],
        inputData: (g.input_data ?? {}) as Record<string, string>,
        output: g.output as string,
        createdAt: g.created_at as string,
    }))
}

export async function deleteGeneration(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('ai_generations').delete().eq('id', id)
    if (error) {
        console.error('deleteGeneration error:', error)
        throw new Error('Nie udało się usunąć wpisu')
    }
    revalidatePath('/lab/ai-studio')
    return true
}

// ─── Publikacja ──────────────────────────────────────────────────────────────

export async function publishDirectPost(
    topic: string,
    content: string,
    targets: string[],
    imageUrl?: string
): Promise<Record<string, { success: boolean; postId?: string; error?: string }>> {
    const { publishToFB, publishToIG } = await import('@/lib/social-publish')
    const supabase = await createClient()

    const { data: record } = await supabase
        .from('calendar_events')
        .insert({
            topic,
            content,
            platform: targets.join('+'),
            format: 'Post',
            goal: 'Publikacja z Post Creatora',
            date: new Date().toISOString().split('T')[0],
            status: 'Szkic',
            image_url: imageUrl || null,
        })
        .select('id')
        .single()

    const results: Record<string, { success: boolean; postId?: string; error?: string }> = {}

    if (targets.includes('facebook')) {
        const res = await publishToFB(content, imageUrl)
        results.facebook = res
        if (res.success && record) {
            await supabase.from('calendar_events')
                .update({ fb_post_id: res.postId, status: 'Opublikowane', published_at: new Date().toISOString() })
                .eq('id', record.id)
        }
    }

    if (targets.includes('instagram')) {
        if (!imageUrl) {
            results.instagram = { success: false, error: 'Brak URL grafiki — Instagram wymaga zdjęcia' }
        } else {
            const res = await publishToIG(imageUrl, content)
            results.instagram = res
            if (res.success && record) {
                await supabase.from('calendar_events')
                    .update({ ig_post_id: res.postId, status: 'Opublikowane', published_at: new Date().toISOString() })
                    .eq('id', record.id)
            }
        }
    }

    revalidatePath('/lab/social-dashboard')
    return results
}
