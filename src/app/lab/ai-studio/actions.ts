'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getModel } from '@/lib/gemini'

// ─── Content Generator ───────────────────────────────────────

export async function generateContent(topic: string, platform: string) {
    try {
        const model = getModel('content')

        const prompt = `Jestes ekspertem ds. marketingu i copywritingu z roku 2026 dla marki WUYO (tworzenie stron internetowych premium, UI/UX, identyfikacja wizualna, grafika "Dobra Grafa"). Masz swiadomosc najnowszych trendow, algorytmow i standardow technologicznych.
    Ton marki: nowoczesny, lekko hakerski, pewny siebie, premium, konkretny (unikaj lania wody, uzywaj technicznego, ale zrozumialego zargonu, stawiaj na jakosc i oszczednosc w pakiecie).

    Zadanie: Napisz angazujacy post na platforme: ${platform}, na temat: "${topic}".
    Uzyj odpowiedniego formatowania dla tej platformy (np. akapity, hasztagi, ewentualnie emoji, ale bez przesady). Wpis ma zachecic do interakcji lub pokazania ekspertyzy WUYO.`

        const result = await model.generateContent(prompt)
        const output = result.response.text()

        // Auto-save to history
        await saveGeneration('content', { topic, platform }, output)

        return { success: true, data: output }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udalo sie wygenerowac tresci. Blad: ' + (error.message || JSON.stringify(error)) }
    }
}

// ─── Quote Analyzer ──────────────────────────────────────────

export async function generateQuote(clientMessage: string) {
    try {
        const model = getModel('quote')

        const prompt = `Jestes glownym analitykiem projektowym ("AI Mentor") z roku 2026 dla agencji WUYO ("Dobra Grafa") z Rzeszowa. Wlasciciel ma wlasny sprzet do druku do formatu A3+, ciecia po konturze, laminowania i nadruku na odziezy - dzieki temu koszt materialu to ok. 1/3 ceny outsource.
    Oto wiadomosc od potencjalnego klienta z zapytaniem o projekt:

    "${clientMessage}"

    CENNIK REFERENCYJNY WUYO (ceny NETTO, do faktury dochodzi 23% VAT, 2026, rynek rzeszowski):

    Zrodlo: CENNIK.md (stan 27.09.2026). Nie podawaj cen spoza tej listy — przy nietypowym zakresie napisz "wycena indywidualna".

    DRUK wlasny — ZESTAW projekt dwustronny + druk (ceny calkowite dla klienta):
    - Wizytowki: 50 szt. 299 zl, 100 szt. 349 zl, 150 szt. 389 zl, 300 szt. 479 zl (papier 300 g, blysk)
    - Ulotki A5: 100 szt. 449 zl, 300 szt. 589 zl (kreda 130 g)
    - Vouchery: 50 szt. 289 zl, 100 szt. 359 zl
    - Naklejki: 50 szt. 219 zl, 100 szt. 279 zl (folia wodoodporna +25% do druku)
    - Menu restauracyjne projekt + druk: od 400 zl
    SAM DRUK z gotowego pliku klienta:
    - Wizytowki: 50 szt. 99 zl, 100 szt. 159 zl, 150 szt. 199 zl, 300 szt. 299 zl
    - Ulotki A5: 50 szt. 119 zl, 100 szt. 189 zl, 150 szt. 239 zl, 300 szt. 359 zl
    - Naklejki: 50 szt. 89 zl, 100 szt. 149 zl, 200 szt. 229 zl
    - Plakaty: od 29 zl/szt.
    Nigdy nie podawaj ceny samego druku klientowi, ktory nie ma jeszcze projektu.
    Rabat: stali klienci i znajomi do 20% na druk, nigdy na projekt.
    Ekspres 24-48h: +30% do calosci.

    PROJEKT GRAFICZNY (bez druku):
    - Logo (3 wersje: pozioma, pionowa, mono; 3 koncepcje do wyboru): od 890 zl
    - Logo + mini ksiega znaku: 1190 zl
    - Lifting istniejacego logo: od 1000 zl
    - Mini ksiega znaku do istniejacego logo: 590 zl
    - Wizytowka: jednostronna 160 zl, dwustronna 240 zl
    - Ulotka A5: jednostronna 260 zl, dwustronna 300 zl; ulotka A4 / skladana do DL: 330 zl
    - Plakat A3-A2: 350 zl; voucher: 220 zl; menu A4: 280 zl
    - Etykieta produktowa: od 180 zl; opakowanie (pudelko, torebka, sleeve): od 400 zl
    - Baner do 3 m2: od 260 zl; 3-8 m2: 390 zl; 8-15 m2: 490 zl; roll-up: 330 zl; szyld: od 450 zl
    - Social media: pojedyncza grafika 150 zl, karuzela do 6 slajdow od 220 zl, zestaw startowy od 550 zl, pakiet 4 / 8 / 12 grafik: 520 / 950 / 1350 zl
    - Praca godzinowa (poprawki, DTP): 100 zl/h, minimum 1 h

    PAKIETY JEDNORAZOWE:
    - Marka Mini (logo + 100 wizytowek projekt+druk): 1090 zl
    - Marka Start (logo + mini ksiega + 150 wizytowek projekt+druk + stopka mailowa): 1490 zl
    - Firma w Internecie (Marka Start + strona do 5 podstron, szkolenie, 1 mc opieki): 3490 zl
    - Pelny Start (Firma w Internecie + 300 wizytowek, ulotka A5, social, wizytowka Google, 3 mc Widocznosci i Opieki): 5900 zl

    STRONY WWW (domena i hosting na 1. rok w cenie; realizacja 7-14 dni roboczych):
    - Strona jednostronicowa (one-page): od 1990 zl
    - Strona firmowa do 5 podstron: 2990 zl
    - Sklep internetowy: od 6900 zl

    ABONAMENT MIESIECZNY:
    - Opieka Strony (serwer, domena, kopie, zabezpieczenia, 1 h drobnych zmian/mc): 199 zl/mc
    - Widocznosc i Opieka (jw. + wizytowka Google, opinie, 5-6 grafik/mc, raport): 690 zl/mc
    - Staly Opiekun (jw. + pelna grafika, prowadzenie social media, priorytet): 1290 zl/mc

    TERMINY: logo 7-10 dni roboczych, strona 7-14 dni roboczych, druk 1-3 dni robocze.

    Zadanie: Przeanalizuj to zapytanie i przygotuj odpowiedz dla wlasciciela WUYO. Odpowiedz ma zawierac:
    1. **Krotkie streszczenie:** Czego dokladnie chce klient i na czym mu zalezy.
    2. **Sugerowany pakiet / pozycje z oferty:** Dopasuj konkretne pozycje z cennika.
    3. **Estymacja wyceny:** Podaj konkretne kwoty (nie "od X") dla kazdej pozycji oraz lacznie. Jesli kilka elementow dla jednej marki - uwzglednij rabat pakietowy i zaznacz adaptacje. Wyceny musza byc zakorzenione w powyzszym cenniku - nie wymyslaj wyzsZych kwot.
    4. **Szkic odpowiedzi do klienta:** Gotowy tekst w stylu WUYO (konkretny, "luzny z pazurem", bez lania wody), gotowy do skopiowania i edycji.

    Sformatuj odpowiedz czytelnym Markdownem, uzywaj boldow, list.`

        const result = await model.generateContent(prompt)
        const output = result.response.text()

        // Auto-save to history
        await saveGeneration('quote', { clientMessage }, output)

        return { success: true, data: output }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udalo sie wygenerowac estymacji wyceny. Blad: ' + (error.message || JSON.stringify(error)) }
    }
}

// ─── Pipeline: Create project from quote ─────────────────────

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

// ─── History (ai_generations table) ──────────────────────────

async function saveGeneration(type: 'content' | 'quote', inputData: Record<string, any>, output: string) {
    try {
        const supabase = await createClient()
        await supabase.from('ai_generations').insert({
            type,
            input_data: inputData,
            output,
        })
    } catch (e) {
        console.error('saveGeneration error:', e)
    }
}

export async function getGenerations(limit = 20) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ai_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('getGenerations error:', error)
        return []
    }

    return data.map((g: any) => ({
        id: g.id,
        type: g.type as 'content' | 'quote',
        inputData: g.input_data,
        output: g.output,
        createdAt: g.created_at,
    }))
}

export async function deleteGeneration(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ai_generations')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('deleteGeneration error:', error)
        throw new Error('Nie udalo sie usunac wpisu')
    }

    revalidatePath('/lab/ai-studio')
    return true
}

// ─── Post Creator ─────────────────────────────────────────────────────────────

export async function generatePostForPlatform(
    topic: string,
    tone: string,
    platform: string,
    extraContext: string
) {
    try {
        const model = getModel('content')

        const platformGuidelines: Record<string, string> = {
            instagram: 'angażujące, krótkie akapity, emoji z umiarem (max 5–8), 5–10 hashtagów na końcu, max 2200 znaków',
            facebook: 'konwersacyjny, może być dłuższy, 2–3 hashtagi na końcu, naturalne emoji bez przesady',
            both: 'pasuje na Instagram i Facebook jednocześnie: krótkie akapity, emoji z umiarem, 5–7 hashtagów, max 2200 znaków',
            linkedin: 'profesjonalny, konkretne fakty/liczby, akapity oddzielone spacją, hashtagi na końcu (3–5), max 3000 znaków',
            blog: 'strukturyzowany artykuł z nagłówkami (##), wstęp-rozwinięcie-zakończenie, min 400 słów, SEO-friendly, bez hashtagów',
        }

        const toneGuidelines: Record<string, string> = {
            ekspercki: 'buduj autorytet — dobre praktyki branżowe, konkretne liczby, pozycjonuj WUYO jako ekspertów',
            storytelling: 'zacznij od konkretnej historii lub sytuacji z życia, wciągnij emocją, dopiero potem meritum',
            edukacyjny: 'daj konkretną wartość: tipsy, lista "jak to zrobić", odpowiedź na pytanie "dlaczego warto"',
            sprzedazowy: 'podkreślaj korzyści (nie features), buduj lekkie FOMO, zakończ wyraźnym ale subtelnym CTA',
            viralowy: 'kontrowersyjna teza lub prowokujące pytanie otwierające post — cel: dyskusja w komentarzach',
        }

        const prompt = `Jesteś ekspertem od content marketingu marki WUYO — studio graficzne i web design "Dobra Grafa" z Rzeszowa. Ton marki: nowoczesny, pewny siebie, premium, konkretny (zero lania wody).

Platforma: ${platform.toUpperCase()}
Wytyczne platformy: ${platformGuidelines[platform] || platformGuidelines.facebook}

Ton: ${tone.toUpperCase()}
Wytyczne tonu: ${toneGuidelines[tone] || toneGuidelines.ekspercki}

Temat: "${topic}"${extraContext ? `\nDodatkowy kontekst: "${extraContext}"` : ''}

Zwróć TYLKO gotowy post do skopiowania. Zero wstępów, zero komentarzy, zero cudzysłowów owijających wynik.`

        const result = await model.generateContent(prompt)
        const output = result.response.text()

        await saveGeneration('content', { topic, tone, platform, extraContext }, output)

        return { success: true, data: output }
    } catch (error: any) {
        return { success: false, error: 'Błąd generowania: ' + (error.message || '') }
    }
}

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
