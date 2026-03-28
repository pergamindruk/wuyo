'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { writeFile, readdir, readFile } from 'fs/promises'
import path from 'path'
import { addCalendarEvent } from '../calendar/actions'

// ─── Graph API helpers (self-contained to avoid 'use server' export issues) ───
const GRAPH_API_VERSION = 'v21.0'

async function postGraph(url: string, body: Record<string, string>) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(body).toString(),
    })
    return await res.json()
}

async function getGraph(url: string, params: Record<string, string>) {
    const u = new URL(url)
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
    const res = await fetch(u.toString(), { method: 'GET' })
    return await res.json()
}

function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim()
}

async function waitForIgContainer(userId: string, containerId: string, accessToken: string) {
    const deadline = Date.now() + 25_000
    while (Date.now() < deadline) {
        const status = await getGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${containerId}`,
            { fields: 'status_code', access_token: accessToken }
        )
        const code = status?.status_code as string | undefined
        if (code === 'FINISHED') return { ok: true as const }
        if (code === 'ERROR') return { ok: false as const, error: 'Instagram: blad przetwarzania kontenera mediow' }
        await new Promise(r => setTimeout(r, 1500))
    }
    return { ok: false as const, error: 'Instagram: timeout (sprobuj ponownie)' }
}

const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY || '')
const OUTPUT_DIR = path.join(process.cwd(), 'output')

function timestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

const WUYO_CONTEXT = `Jesteś Wuyo Social Engine — autonomicznym systemem automatyzacji social media dla marki WUYO.pl.
WUYO to butikowa agencja premium: strony internetowe, identyfikacja wizualna, grafika ("Dobra Grafa"), druk.
Ton: pewny siebie, lekko hakerski, premium, techniczny ale zrozumiały. ZERO lania wody. ZERO AI slopu.
Grupa docelowa: właściciele firm, startupy, personal brandy w Polsce.
USP: Ciemna estetyka + złote akcenty. Jakość butiku w cenie pakietu.
Rok: 2026. Masz świadomość najnowszych trendów i algorytmów.`

// ═══════════════════════════════════════════════════════
// [MAP] — Research Trendów FB/IG
// ═══════════════════════════════════════════════════════
export async function runMAP() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `${WUYO_CONTEXT}

ZADANIE [MAP — Research Trendów]:
Przeprowadź research trendów na Facebook i Instagram dla agencji designu/druku premium w Polsce (marzec 2026).

Odpowiedz w formacie:

## Trendy na Facebooku (marzec 2026)
- 3-5 aktualnych trendów contentowych (formaty, typy postów, algorytm)
- Co działa na fanpage'ach usługowych/kreatywnych

## Trendy na Instagramie (marzec 2026)
- 3-5 aktualnych trendów (Reels, karuzele, Stories)
- Jakie formaty mają najwyższy engagement

## Viralowe Formaty do Wykorzystania
- 3 konkretne formaty postów, które WUYO może zaadaptować
- Dlaczego każdy z nich działa (psychologia + algorytm)

## Hashtagi & Timing
- Top 10 hashtagów dla branży design/print w PL
- Optymalne godziny publikacji na FB i IG

## Rekomendacja Tygodniowa
- Konkretny plan: ile postów, na jakiej platformie, w jakim formacie

Bądź KONKRETNY. Zero ogólników. Każdy insight musi być actionable.`

        const result = await model.generateContent(prompt)
        const content = result.response.text()
        const filename = `MAP_${timestamp()}.md`
        await writeFile(path.join(OUTPUT_DIR, filename), `# [MAP] Research Trendów — ${new Date().toLocaleDateString('pl-PL')}\n\n${content}`)
        return { success: true, data: content, filename }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        return { success: false, error: msg }
    }
}

// ═══════════════════════════════════════════════════════
// [NAIL] — Strategia & Hooki (5 pomysłów z Pain Blockami)
// ═══════════════════════════════════════════════════════
export async function runNAIL(context?: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const extraContext = context ? `\n\nDodatkowy kontekst od użytkownika: "${context}"` : ''

        const prompt = `${WUYO_CONTEXT}${extraContext}

ZADANIE [NAIL — Strategia & Hooki]:
Wygeneruj 5 KONKRETNYCH pomysłów na posty na FB i IG dla WUYO. Każdy pomysł musi zawierać "Pain Block" — realne bolączki klientów.

Dla KAŻDEGO z 5 pomysłów podaj:

### Post #[numer]: [Tytuł roboczy]
**Pain Block:** [Jaki realny ból klienta adresujemy? np. "Mam stronę za 500zł i wstyd mi ją pokazać"]
**Hook (pierwsze zdanie):** [Zdanie otwierające — musi zatrzymać scroll. Max 15 słów]
**Angle:** [Z jakiego kąta atakujemy temat]
**Format:** [Karuzela / Reel / Post z grafiką / Story / Przed-Po]
**Platforma:** [FB / IG / Obie]
**CTA:** [Konkretne wezwanie do działania]
**Potencjał viralowy:** [Niski / Średni / Wysoki + dlaczego]

---

Na końcu dodaj sekcję:
## Priorytet publikacji
Ułóż te 5 postów w kolejności od najważniejszego, z uzasadnieniem.

ZASADY:
- Hooki muszą BIĆ — zero banalnych otwarć
- Pain Blocki muszą być REALNE (nie wymyślone)
- Każdy post musi mieć jasny cel biznesowy (lead, trust, authority)
- Język: potoczny-profesjonalny, nie korporacyjny`

        const result = await model.generateContent(prompt)
        const content = result.response.text()
        const filename = `NAIL_${timestamp()}.md`
        await writeFile(path.join(OUTPUT_DIR, filename), `# [NAIL] Strategia & Hooki — ${new Date().toLocaleDateString('pl-PL')}\n\n${content}`)
        return { success: true, data: content, filename }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        return { success: false, error: msg }
    }
}

// ═══════════════════════════════════════════════════════
// [EXECUTE] — Gotowe Copy + Prompty graficzne
// ═══════════════════════════════════════════════════════
export async function runEXECUTE(postIdea: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `${WUYO_CONTEXT}

ZADANIE [EXECUTE — Gotowe Copy + Prompty Graficzne]:
Na podstawie tego pomysłu na post: "${postIdea}"

Wygeneruj GOTOWE materiały do publikacji:

## Copy na Facebook
[Pełny tekst posta gotowy do wklejenia. Z emojis jeśli pasują. Z hashtagami. Z CTA.]

## Copy na Instagram
[Pełny tekst posta — zoptymalizowany pod IG. Inne formatowanie, inne hashtagi, Stories hook.]

## Prompt do Grafiki (Midjourney/DALL-E)
[Gotowy prompt w języku angielskim do wygenerowania grafiki. Styl: dark, premium, gold accents, WUYO branding]

## Prompt do Grafiki (Canva/Design)
[Opis grafiki: co ma być na niej, kolory, typografia, układ — dla designera lub Canvy]

## Prompt do Reelsa/Wideo (opcjonalnie)
[Scenariusz 15-30s: hook, treść, CTA. Krok po kroku co mówić/pokazać]

## Notatki techniczne
- Sugerowany rozmiar grafiki (FB vs IG)
- Najlepszy czas publikacji
- Cross-posting tips

ZASADY:
- Copy musi być GOTOWE do wklejenia — zero placeholderów
- Prompty do grafik muszą być precyzyjne i szczegółowe
- Wszystko w estetyce WUYO: dark mode, gold accents, minimalizm premium`

        const result = await model.generateContent(prompt)
        const content = result.response.text()
        const filename = `EXECUTE_${timestamp()}.md`
        await writeFile(path.join(OUTPUT_DIR, filename), `# [EXECUTE] Gotowe Copy — ${new Date().toLocaleDateString('pl-PL')}\n\n**Pomysł źródłowy:** ${postIdea}\n\n${content}`)
        return { success: true, data: content, filename }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        return { success: false, error: msg }
    }
}

// ═══════════════════════════════════════════════════════
// [WD-40] — Analiza & Wyostrzanie przekazu
// ═══════════════════════════════════════════════════════
export async function runWD40(recentContent: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `${WUYO_CONTEXT}

ZADANIE [WD-40 — Analiza & Wyostrzanie Przekazu]:
Przeanalizuj poniższe treści z social media WUYO i wyostrz przekaz:

"${recentContent}"

Odpowiedz w formacie:

## Diagnoza
- Co działa w tych treściach (mocne strony)
- Co NIE działa (słabe punkty, AI slop, lanie wody)
- Ocena spójności z tonem marki WUYO (1-10)

## Wyostrzony Przekaz
[Przepisz/popraw każdą treść — wersja po WD-40. Bez slopu, z pazurem, gotowa do publikacji]

## Pain Block Audit
- Czy treści trafiają w realne bolączki klientów?
- Jakie Pain Blocki powinny być dodane?

## Rekomendacje
- 3 konkretne zmiany do wdrożenia NATYCHMIAST
- Czego PRZESTAĆ używać w treściach
- Czego ZACZĄĆ używać

## Scoring
| Kryterium | Przed WD-40 | Po WD-40 |
|-----------|-------------|----------|
| Czytelność | ?/10 | ?/10 |
| Hook Power | ?/10 | ?/10 |
| Pain Block | ?/10 | ?/10 |
| CTA Clarity | ?/10 | ?/10 |
| Brand Voice | ?/10 | ?/10 |

Bądź BRUTALNIE szczery. Zero dyplomacji. Konkretne, actionable feedback.`

        const result = await model.generateContent(prompt)
        const content = result.response.text()
        const filename = `WD40_${timestamp()}.md`
        await writeFile(path.join(OUTPUT_DIR, filename), `# [WD-40] Analiza & Wyostrzanie — ${new Date().toLocaleDateString('pl-PL')}\n\n${content}`)
        return { success: true, data: content, filename }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        return { success: false, error: msg }
    }
}

// ═══════════════════════════════════════════════════════
// Lista plików w /output
// ═══════════════════════════════════════════════════════
export async function getOutputFiles() {
    try {
        const files = await readdir(OUTPUT_DIR)
        const mdFiles = files.filter(f => f.endsWith('.md')).sort().reverse()
        return mdFiles.map(f => ({
            name: f,
            type: f.split('_')[0] as 'MAP' | 'NAIL' | 'EXECUTE' | 'WD40',
            date: f.replace(/^[A-Z0-9]+_/, '').replace('.md', '').replace(/-/g, ':').slice(0, 16).replace('T', ' '),
        }))
    } catch {
        return []
    }
}

export async function getOutputFile(filename: string) {
    try {
        const safe = path.basename(filename)
        const content = await readFile(path.join(OUTPUT_DIR, safe), 'utf-8')
        return content
    } catch {
        return null
    }
}

// ═══════════════════════════════════════════════════════
// [Moduł 1] Zapis edytowanego pliku
// ═══════════════════════════════════════════════════════
export async function saveOutputFile(filename: string, content: string) {
    try {
        const safe = path.basename(filename)
        await writeFile(path.join(OUTPUT_DIR, safe), content)
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
}

// ═══════════════════════════════════════════════════════
// [Moduł 2] Publish na FB (bez calendar_events)
// ═══════════════════════════════════════════════════════
export async function publishDashboardToFB(message: string, imageUrl?: string) {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    const pageId = process.env.FACEBOOK_PAGE_ID

    if (!accessToken || !pageId) {
        return { success: false as const, error: 'Brak konfiguracji Facebook. Dodaj FACEBOOK_PAGE_ACCESS_TOKEN i FACEBOOK_PAGE_ID do .env.local' }
    }

    try {
        const cleanMessage = stripMarkdown(message)

        let endpoint: string
        let body: Record<string, string>

        if (imageUrl) {
            endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/photos`
            body = { url: imageUrl, caption: cleanMessage, access_token: accessToken }
        } else {
            endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`
            body = { message: cleanMessage, access_token: accessToken }
        }

        const data = await postGraph(endpoint, body)

        if (!data.id) {
            return { success: false as const, error: `Facebook: ${data.error?.message || 'Blad publikacji'}` }
        }

        const fbInfo = await getGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${data.id}`,
            { fields: 'permalink_url', access_token: accessToken }
        )

        return { success: true as const, postId: data.id, permalink: fbInfo?.permalink_url || null }
    } catch (e: unknown) {
        return { success: false as const, error: (e as Error).message }
    }
}

// ═══════════════════════════════════════════════════════
// [Moduł 2] Publish na IG (bez calendar_events)
// ═══════════════════════════════════════════════════════
export async function publishDashboardToIG(imageUrl: string, caption: string) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const userId = process.env.INSTAGRAM_USER_ID

    if (!accessToken || !userId) {
        return { success: false as const, error: 'Brak konfiguracji Instagram. Dodaj INSTAGRAM_ACCESS_TOKEN i INSTAGRAM_USER_ID do .env.local' }
    }

    try {
        const cleanCaption = stripMarkdown(caption)

        const containerData = await postGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media`,
            { image_url: imageUrl, caption: cleanCaption, access_token: accessToken }
        )

        if (!containerData.id) {
            return { success: false as const, error: `Instagram: ${containerData.error?.message || 'Blad tworzenia media container'}` }
        }

        const wait = await waitForIgContainer(userId, containerData.id, accessToken)
        if (!wait.ok) {
            return { success: false as const, error: wait.error }
        }

        const publishData = await postGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media_publish`,
            { creation_id: containerData.id, access_token: accessToken }
        )

        if (!publishData.id) {
            return { success: false as const, error: `Instagram: ${publishData.error?.message || 'Blad publikacji'}` }
        }

        const mediaInfo = await getGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${publishData.id}`,
            { fields: 'permalink', access_token: accessToken }
        )

        return { success: true as const, postId: publishData.id, permalink: mediaInfo?.permalink || null }
    } catch (e: unknown) {
        return { success: false as const, error: (e as Error).message }
    }
}

// ═══════════════════════════════════════════════════════
// [Moduł 4a] A/B Hook — generuj wariant
// ═══════════════════════════════════════════════════════
export async function generateHookVariant(originalHook: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        const prompt = `${WUYO_CONTEXT}

Oto hook na post social media: "${originalHook}"

Wygeneruj ALTERNATYWNY hook na ten sam temat. Zmień kąt ataku, użyj innej emocji lub struktury.
Hook musi zatrzymać scroll — max 15 słów. Zero slopu.

Odpowiedz TYLKO hookiem — jedna linia, bez cudzysłowów, bez wyjaśnień.`

        const result = await model.generateContent(prompt)
        return { success: true as const, data: result.response.text().trim() }
    } catch (error: unknown) {
        return { success: false as const, error: error instanceof Error ? error.message : String(error) }
    }
}

// ═══════════════════════════════════════════════════════
// [Moduł 4b] Hashtag Bank (file-based)
// ═══════════════════════════════════════════════════════
const HASHTAG_FILE = path.join(OUTPUT_DIR, 'hashtags.json')

type Hashtag = { tag: string; category: string; useCount: number }

export async function getHashtags(): Promise<Hashtag[]> {
    try {
        const raw = await readFile(HASHTAG_FILE, 'utf-8')
        return JSON.parse(raw) as Hashtag[]
    } catch {
        return []
    }
}

export async function addHashtag(tag: string, category: string = 'general') {
    const hashtags = await getHashtags()
    const clean = tag.startsWith('#') ? tag : `#${tag}`
    if (hashtags.some(h => h.tag === clean)) return { success: false, error: 'Hashtag juz istnieje' }
    hashtags.push({ tag: clean, category, useCount: 0 })
    await writeFile(HASHTAG_FILE, JSON.stringify(hashtags, null, 2))
    return { success: true }
}

export async function removeHashtag(tag: string) {
    const hashtags = await getHashtags()
    const filtered = hashtags.filter(h => h.tag !== tag)
    await writeFile(HASHTAG_FILE, JSON.stringify(filtered, null, 2))
    return { success: true }
}

export async function incrementHashtagUse(tag: string) {
    const hashtags = await getHashtags()
    const found = hashtags.find(h => h.tag === tag)
    if (found) found.useCount++
    await writeFile(HASHTAG_FILE, JSON.stringify(hashtags, null, 2))
}

// ═══════════════════════════════════════════════════════
// [Moduł 4c] Integracja z kalendarzem
// ═══════════════════════════════════════════════════════
export async function addDashboardToCalendar(content: string, platform: string, date: string) {
    try {
        const topic = content.slice(0, 80).replace(/[#*\n]/g, ' ').trim()
        const result = await addCalendarEvent({
            topic,
            platform,
            format: 'Post z grafiką',
            goal: 'Zaangażowanie',
            date,
            status: 'Zaplanowane',
            generateAI: false,
        })
        if (!result) return { success: false as const, error: 'Nie udalo sie dodac do kalendarza' }
        return { success: true as const, eventId: result.id }
    } catch (error: unknown) {
        return { success: false as const, error: error instanceof Error ? error.message : String(error) }
    }
}

// ═══════════════════════════════════════════════════════
// [Moduł 4d] Analytics — Insights z FB/IG
// ═══════════════════════════════════════════════════════
export async function getFBPostInsights(fbPostId: string) {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    if (!accessToken) return null

    try {
        const data = await getGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${fbPostId}`,
            { fields: 'likes.summary(true),comments.summary(true),shares', access_token: accessToken }
        )
        return {
            likes: data?.likes?.summary?.total_count ?? 0,
            comments: data?.comments?.summary?.total_count ?? 0,
            shares: data?.shares?.count ?? 0,
        }
    } catch {
        return null
    }
}

export async function getIGPostInsights(igMediaId: string) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    if (!accessToken) return null

    try {
        const data = await getGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${igMediaId}`,
            { fields: 'like_count,comments_count', access_token: accessToken }
        )
        return {
            likes: data?.like_count ?? 0,
            comments: data?.comments_count ?? 0,
        }
    } catch {
        return null
    }
}
