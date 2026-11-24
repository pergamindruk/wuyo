'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { generateWithFallback } from '@/lib/gemini'
import { geminiTarget } from '@/lib/ai-endpoint'
import { askAdvisor } from '@/lib/lab/doradca/ai'
import { getAllPosts } from '@/lib/blog'
import { getGoogleStats } from '@/lib/lab/google-stats'
import { clean } from '@/lib/lab/ai/context'
import { warsawIsoDate } from '@/lib/lab/today/format'
import {
    COVER_PHOTO_STYLE, COVER_RULES, CTA_GOALS, FORMATS, HOOK_WORKSHOP, PILLARS, SHORTS_RULES, SOCIAL_RULES,
    type CtaGoal, type Pillar, type PostFormat,
} from '@/lib/lab/social/playbook'

type Fail = { ok: false; error: string }

export type TopicIdea = {
    temat: string
    filar: Pillar
    format: PostFormat
    cel: CtaGoal
    dlaczego: string
    wpis: string
}

export type Research = { trendy: string; tematy: TopicIdea[]; zrodla: { tytul: string; url: string }[] }

export type GeneratedPost = {
    temat: string
    filar: Pillar
    format: PostFormat
    cel: CtaGoal
    hooki: { tekst: string; haczyk: string }[]
    facebook: string
    instagram: string
    slajdy: { naglowek: string; tekst: string }[]
    rolka: string
    /** Tylko przy rolce: to samo nagranie na YouTube Shorts. */
    shorts: { tytul: string; opis: string; tagi: string[] } | null
    okladka: { haslo: string; akcent: string; scena: string }
    czemu_zapisze: string
    wpis: string
    alt: string
}

const PILLAR_KEYS = Object.keys(PILLARS) as Pillar[]
const FORMAT_KEYS = Object.keys(FORMATS) as PostFormat[]
const CTA_KEYS = Object.keys(CTA_GOALS) as CtaGoal[]

async function requireUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user ? supabase : null
}

/** JSON z odpowiedzi modelu: bez płotków ```json i tekstu dookoła. */
function parseJson<T>(text: string): T {
    const s = text.replace(/```(?:json)?/g, '')
    const start = s.search(/[[{]/)
    const end = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'))
    if (start < 0 || end < start) throw new Error('brak JSON')
    return JSON.parse(s.slice(start, end + 1)) as T
}

const pick = <T extends string>(v: unknown, allowed: T[], fallback: T): T =>
    allowed.includes(v as T) ? (v as T) : fallback

function blogList() {
    return getAllPosts('pl').map((p) => `- ${p.slug} | ${p.title} | ${p.category}`).join('\n')
}

async function recentTopics(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data } = await supabase.from('calendar_events').select('topic, date').order('date', { ascending: false }).limit(20)
    const topics = [...new Set((data ?? []).map((r) => String(r.topic)))]
    return topics.map((t) => `- ${t}`).join('\n') || '- (brak)'
}

async function searchQueries(): Promise<string> {
    try {
        const { gsc } = await getGoogleStats(28)
        if (!gsc) return '(brak danych z Search Console)'
        return gsc.queries.slice(0, 25)
            .map((q) => `- "${q.query}": ${q.impressions} wyświetleń, ${q.clicks} kliknięć, pozycja ${q.position.toFixed(1)}`)
            .join('\n')
    } catch {
        return '(brak danych z Search Console)'
    }
}

// ─── 1. Research: trendy, okazje, pytania z Google → 3 tematy ───────────────

export async function researchTopics(hint?: string): Promise<({ ok: true } & Research) | Fail> {
    const supabase = await requireUser()
    if (!supabase) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }

    const [recent, queries] = await Promise.all([recentTopics(supabase), searchQueries()])
    const today = warsawIsoDate()

    const system = `Jesteś strategiem treści studia WUYO (Mateusz, Rzeszów: grafika, logo, druk na miejscu, strony www dla małych firm).
Twoje zadanie: zrobić research i zaproponować 3 tematy postów na Facebook i Instagram, które zbudują markę eksperta i przyprowadzą ruch na wuyo.pl.
Odbiorca: właściciel małej firmy z Rzeszowa i Podkarpacia, 40-55 lat, nie zna się na grafice.

FILARY (proporcje w miesiącu):
${Object.values(PILLARS).map((p) => `- ${p}`).join('\n')}

Zasady: to content, nie oferta (bez cen i promocji studia). Nie wymyślaj realizacji ani liczb. Każdy temat ma uzasadnienie z researchu albo z danych Mateusza.
Ton tematów: bezpośredni i pewny, ale miły i kulturalny (bez "nienawidzę", wyśmiewania i straszenia). Proste polskie słowa, bez anglicyzmów.`

    const user = `Dziś: ${today}. Planujemy posty na najbliższe 7-10 dni.
${hint?.trim() ? `\nCO MATEUSZ CHCE: "${hint.trim().slice(0, 500)}"\n` : ''}
RESEARCH (użyj wyszukiwarki Google, max 6 wyszukiwań):
a) jakie formaty i tematy niosą się TERAZ na Instagramie i Facebooku w niszy grafika / branding / druk / strony dla małych firm (najlepiej artykuły z ostatnich tygodni),
b) daty, święta, sezon i terminy w Polsce w najbliższych 2-3 tygodniach, przy których mała firma potrzebuje materiałów albo zmian (np. grudzień: vouchery, kalendarze, godziny otwarcia, faktury, nowy rok),
c) o co właściciele małych firm teraz pytają albo z czym mają problem (przepisy, Google, druk, AI, ceny).

DANE MATEUSZA:
Frazy, po których ludzie trafiają na wuyo.pl (Google Search Console, 28 dni):
${queries}

Wpisy na blogu wuyo.pl (slug | tytuł | dział). Do każdego tematu dobierz pasujący wpis, żeby post prowadził na stronę:
${blogList()}

Tematy postów z ostatnich tygodni (nie powtarzaj tematu ani kąta):
${recent}

Zwróć TYLKO JSON:
{"trendy": "3-5 zdań po polsku: co znalazłeś i co z tego wynika dla WUYO (z nazwą źródła)",
 "tematy": [
  {"temat": "konkretny temat jednym zdaniem", "filar": "${PILLAR_KEYS.join('|')}", "format": "${FORMAT_KEYS.join('|')}",
   "cel": "${CTA_KEYS.join('|')}", "dlaczego": "1-2 zdania: konkret z researchu albo z danych (źródło)", "wpis": "slug wpisu z listy albo pusty"}
 ]}
Trzy tematy z RÓŻNYCH filarów i w różnych formatach. Najmocniejszy pierwszy.`

    try {
        const { tekst, zrodla } = await askAdvisor(system, [{ role: 'user', parts: [{ text: user }] }], { szukaj: true })
        const raw = parseJson<{ trendy?: string; tematy?: Partial<TopicIdea>[] }>(tekst)
        const slugs = new Set(getAllPosts('pl').map((p) => p.slug))
        const tematy = (raw.tematy ?? []).filter((t) => t.temat).slice(0, 3).map((t) => ({
            temat: clean(String(t.temat)),
            filar: pick(t.filar, PILLAR_KEYS, 'ekspert'),
            format: pick(t.format, FORMAT_KEYS, 'karuzela'),
            cel: pick(t.cel, CTA_KEYS, 'zapis'),
            dlaczego: clean(String(t.dlaczego ?? '')),
            wpis: slugs.has(String(t.wpis)) ? String(t.wpis) : '',
        }))
        if (tematy.length === 0) return { ok: false, error: 'Research nie dał tematów. Kliknij jeszcze raz.' }
        return { ok: true, trendy: clean(String(raw.trendy ?? '')), tematy, zrodla }
    } catch (e) {
        console.error('researchTopics error:', e)
        return { ok: false, error: 'Research się nie udał (AI albo wyszukiwarka). Spróbuj za chwilę.' }
    }
}

// ─── 2. Post: warsztat hooków, FB + IG, slajdy / rolka, okładka ─────────────

export type PostInput = {
    temat: string
    filar: Pillar
    format: PostFormat
    cel: CtaGoal
    fakty?: string
    dlaczego?: string
    wpis?: string
}

export async function generatePost(input: PostInput): Promise<({ ok: true; post: GeneratedPost }) | Fail> {
    const supabase = await requireUser()
    if (!supabase) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }
    const temat = input.temat.trim().slice(0, 600)
    if (!temat) return { ok: false, error: 'Podaj temat albo zrób research.' }

    const posts = getAllPosts('pl')
    const wpis = posts.find((p) => p.slug === input.wpis)
    const recent = await recentTopics(supabase)

    const prompt = `Piszesz post na Facebook i Instagram studia WUYO. Ma być na poziomie najlepszych twórców w niszy: zatrzymać kciuk, dać realną wartość i zbudować zaufanie do Mateusza jako eksperta.

${SOCIAL_RULES}

FILAR: ${PILLARS[input.filar]}
FORMAT: ${FORMATS[input.format]}
CEL POSTA: ${CTA_GOALS[input.cel]}

TEMAT: "${temat}"
${input.dlaczego ? `DLACZEGO TERAZ (z researchu): ${input.dlaczego.slice(0, 600)}\n` : ''}${input.fakty?.trim() ? `FAKTY OD MATEUSZA (tylko tego się trzymaj przy realizacjach i liczbach): "${input.fakty.trim().slice(0, 1500)}"\n` : 'Brak faktów o realizacjach: nie opisuj żadnej realizacji ani klienta.\n'}${wpis ? `WPIS NA BLOGU do podlinkowania: "${wpis.title}" https://wuyo.pl/blog/${wpis.slug} (${wpis.excerpt.slice(0, 300)})
Na Facebooku wstaw ten link przed hashtagami z jednym zdaniem, co tam jest. Na Instagramie zamiast linku: "Cały poradnik: link w bio".
` : 'Bez linku do bloga.\n'}
TEMATY OSTATNICH POSTÓW (inny kąt i inne pierwsze zdanie):
${recent}

${HOOK_WORKSHOP}

${COVER_RULES}
${input.format === 'rolka' ? `\n${SHORTS_RULES}\n` : ''}

Zwróć TYLKO JSON (bez komentarzy):
{"temat": "temat do kalendarza, zwykłe zdanie",
 "hooki": [{"tekst": "hook do 10 słów", "haczyk": "ciekawość|strata|liczba|myśl odbiorcy|ostrzeżenie"}, x3, najlepszy pierwszy],
 "facebook": "gotowy post na FB, zaczyna się od najlepszego hooka",
 "instagram": "gotowy post na IG, zaczyna się od najlepszego hooka",
 "slajdy": [{"naglowek": "...", "tekst": "..."}],  // karuzela: 5-7 slajdów, slajd 1 = hasło okładki; inne formaty: []
 "rolka": "scenariusz z ujęciami, napisami na ekranie i [ZMIANA]; dla innych formatów pusty",
 "okladka": {"haslo": "...", "akcent": "...", "scena": "..."},${input.format === 'rolka' ? `
 "shorts": {"tytul": "...", "opis": "...", "tagi": ["...", "..."]},` : ''}
 "czemu_zapisze": "1 zdanie: dlaczego odbiorca zapisze albo udostępni",
 "alt": "opis grafiki po polsku, 1 zdanie"}`

    try {
        const raw = parseJson<Partial<GeneratedPost>>(await generateWithFallback('document', prompt))
        const okl = raw.okladka ?? { haslo: '', akcent: '', scena: '' }
        const haslo = String(okl.haslo ?? '').toUpperCase().slice(0, 40)
        const post: GeneratedPost = {
            temat: clean(String(raw.temat || temat)).slice(0, 120),
            filar: input.filar,
            format: input.format,
            cel: input.cel,
            hooki: (raw.hooki ?? []).slice(0, 3).map((h) => ({ tekst: clean(String(h.tekst ?? '')), haczyk: String(h.haczyk ?? '') })),
            facebook: clean(String(raw.facebook ?? '')),
            instagram: clean(String(raw.instagram ?? '')),
            slajdy: (raw.slajdy ?? []).slice(0, 8).map((s) => ({ naglowek: clean(String(s.naglowek ?? '')), tekst: clean(String(s.tekst ?? '')) })),
            rolka: String(raw.rolka ?? '').trim(),
            shorts: input.format === 'rolka' && raw.shorts?.tytul ? {
                tytul: clean(String(raw.shorts.tytul)).slice(0, 100),
                opis: clean(String(raw.shorts.opis ?? '')),
                tagi: (raw.shorts.tagi ?? []).map((t) => String(t).trim()).filter(Boolean).slice(0, 10),
            } : null,
            okladka: { haslo, akcent: String(okl.akcent ?? '').toUpperCase(), scena: String(okl.scena ?? '') },
            czemu_zapisze: clean(String(raw.czemu_zapisze ?? '')),
            wpis: wpis?.slug ?? '',
            alt: clean(String(raw.alt ?? '')),
        }
        if (!post.facebook || !post.instagram) return { ok: false, error: 'AI zwróciło niepełny post. Kliknij jeszcze raz.' }
        return { ok: true, post }
    } catch (e) {
        console.error('generatePost error:', e)
        return { ok: false, error: 'AI nie odpowiada albo zwróciło coś nieczytelnego. Spróbuj za chwilę.' }
    }
}

// ─── 3. Zdjęcie na okładkę (Nano Banana przez Vertex), napis dokłada przeglądarka ─

type ImageResponse = { candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[] }

export async function generateCoverPhoto(scena: string): Promise<({ ok: true; dataUrl: string }) | Fail> {
    if (!(await requireUser())) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }
    const target = await geminiTarget()
    if (!target) return { ok: false, error: 'Brak konfiguracji AI.' }
    const text = `${scena.slice(0, 1500)}\n\nStyle: ${COVER_PHOTO_STYLE}`
    // Pro daje lepsze twarze; przy błędzie albo przeciążeniu szybszy zapas.
    const models = target.provider === 'vertex' ? ['gemini-3-pro-image', 'gemini-2.5-flash-image'] : ['gemini-2.5-flash-image']
    for (const model of models) {
        try {
            const res = await fetch(target.url(model), {
                method: 'POST',
                headers: target.headers,
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text }] }],
                    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } },
                }),
                signal: AbortSignal.timeout(110_000),
            })
            if (!res.ok) {
                console.error('generateCoverPhoto', model, res.status, (await res.text()).slice(0, 200))
                continue
            }
            const data = (await res.json()) as ImageResponse
            const img = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData
            if (img?.data) return { ok: true, dataUrl: `data:${img.mimeType || 'image/png'};base64,${img.data}` }
        } catch (e) {
            console.error('generateCoverPhoto', model, e)
        }
    }
    return { ok: false, error: 'Nie udało się wygenerować zdjęcia. Spróbuj jeszcze raz albo wgraj własne.' }
}

// ─── 4. Zapis: grafika do bucketu „social”, post do kalendarza (FB + IG) ─────

const SOCIAL_BUCKET = 'social'

export async function createCoverUploadUrl():
    Promise<{ ok: true; path: string; token: string; publicUrl: string } | Fail> {
    if (!(await requireUser())) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }
    const admin = createAdminClient()
    const path = `generator/${warsawIsoDate()}-${crypto.randomUUID().slice(0, 8)}.jpg`
    const { data, error } = await admin.storage.from(SOCIAL_BUCKET).createSignedUploadUrl(path)
    if (error || !data) return { ok: false, error: 'Nie udało się przygotować wysyłki grafiki.' }
    return { ok: true, path, token: data.token, publicUrl: admin.storage.from(SOCIAL_BUCKET).getPublicUrl(path).data.publicUrl }
}

const FORMAT_LABEL: Record<PostFormat, string> = { karuzela: 'Karuzela', rolka: 'Rolka', post: 'Post z grafiką' }
const GOAL_LABEL: Record<Pillar, string> = { ekspert: 'Edukacja', dowod: 'Dowód', zasieg: 'Zasięg', czlowiek: 'Zaangażowanie' }

/** Notatki po „---”: panel i publikacja biorą tylko tekst przed nimi. */
function notes(post: GeneratedPost): string {
    const out = [
        `Filar: ${post.filar} · Format: ${post.format} · Cel: ${post.cel}`,
        `Hooki: ${post.hooki.map((h) => `${h.tekst} (${h.haczyk})`).join(' | ')}`,
        `Okładka: ${post.okladka.haslo} (żółte: ${post.okladka.akcent})`,
        post.czemu_zapisze && `Dlaczego zapisze: ${post.czemu_zapisze}`,
        post.slajdy.length > 0 && `Slajdy:\n${post.slajdy.map((s, i) => `${i + 1}. ${s.naglowek}: ${s.tekst}`).join('\n')}`,
        post.rolka && `Rolka (IG Reels + FB Reels + YouTube Shorts):\n${post.rolka}`,
        post.shorts && `YouTube Shorts:\nTytuł: ${post.shorts.tytul}\nOpis: ${post.shorts.opis}\nTagi: ${post.shorts.tagi.join(', ')}`,
    ]
    return out.filter(Boolean).join('\n')
}

export async function savePostToCalendar(post: GeneratedPost, date: string, imageUrl?: string):
    Promise<{ ok: true; ids: string[] } | Fail> {
    const supabase = await requireUser()
    if (!supabase) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: 'Zła data.' }
    if (imageUrl && !/^https:\/\//.test(imageUrl)) return { ok: false, error: 'Zły adres grafiki.' }

    const base = {
        topic: post.temat.slice(0, 120), format: FORMAT_LABEL[post.format], goal: GOAL_LABEL[post.filar],
        date, status: 'Szkic', image_url: imageUrl ?? null,
    }
    const n = notes(post)
    const { data, error } = await supabase.from('calendar_events').insert([
        { ...base, platform: 'Facebook', content: `${post.facebook}\n\n---\n${n}` },
        { ...base, platform: 'Instagram', content: `${post.instagram}\n\n---\n${n}` },
    ]).select('id')
    if (error) {
        console.error('savePostToCalendar error:', error)
        return { ok: false, error: 'Nie udało się zapisać w kalendarzu.' }
    }
    revalidatePath('/lab/calendar')
    return { ok: true, ids: (data ?? []).map((r) => String(r.id)) }
}
