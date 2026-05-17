'use server'

import { addCalendarEvent } from '../calendar/actions'
import { getModel } from '@/lib/gemini'

// ─── Graph API helpers ────────────────────────────────
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

async function askClaude(prompt: string): Promise<string> {
    const model = getModel('content')
    const result = await model.generateContent(prompt)
    return result.response.text()
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
        const now = new Date()
        const monthYear = now.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })

        const prompt = `${WUYO_CONTEXT}

ZADANIE [MAP — Research Trendów & Growth Intelligence]:
Przeprowadź pełny research dla agencji designu/druku premium w Polsce (${monthYear}).

## Trendy na Facebooku
- 3-5 aktualnych trendów contentowych (formaty, typy postów)
- Co algorytm FB nagradza teraz na fanpage'ach usługowych
- Jakie posty generują największy zasięg organiczny

## Trendy na Instagramie
- 3-5 aktualnych trendów (Reels, karuzele, Stories)
- Jakie formaty mają najwyższy engagement i zasięg
- Jak algorytm IG dystrybuuje treści teraz (co premiuje)

## Growth Mechanics — jak rosnąć na IG/FB
- Konkretne taktyki zwiększania zasięgu organicznego (nie płatnego)
- Jak zbierać followersów z właściwej grupy (MŚP, lokalne firmy)
- Błędy które zabijają zasięg — czego unikać
- Timing i częstotliwość publikacji dla małego konta usługowego

## Viralowe Formaty do Zaadaptowania
- 3 konkretne formaty które WUYO może wdrożyć od razu
- Dlaczego każdy działa (psychologia + algorytm)
- Szacowany czas realizacji każdego

## Hashtagi & Timing
- Top 10 hashtagów dla branży design/print w PL
- Optymalne godziny publikacji na FB i IG

## Rekomendacja Tygodniowa
- Konkretny plan: ile postów, platforma, format, cel (zasięg / leady / trust)

Bądź KONKRETNY. Zero ogólników. Każdy insight musi być actionable dla 1-osobowego studia.`

        const data = await askClaude(prompt)
        return { success: true, data }
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
}

// ═══════════════════════════════════════════════════════
// [NAIL] — Strategia & Hooki (5 pomysłów z Pain Blockami)
// ═══════════════════════════════════════════════════════
export async function runNAIL(context?: string) {
    try {
        // model via Claude
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

        const data = await askClaude(prompt)
        return { success: true, data }
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
}

// ═══════════════════════════════════════════════════════
// [EXECUTE] — Gotowe Copy + Prompty graficzne
// ═══════════════════════════════════════════════════════
export async function runEXECUTE(postIdea: string) {
    try {
        // model via Claude

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

        const data = await askClaude(prompt)
        return { success: true, data }
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
}

// ═══════════════════════════════════════════════════════
// [WD-40] — Analiza & Wyostrzanie przekazu
// ═══════════════════════════════════════════════════════
export async function runWD40(recentContent: string) {
    try {
        // model via Claude

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

        const data = await askClaude(prompt)
        return { success: true, data }
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
        if (!wait.ok) return { success: false as const, error: wait.error }

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
        // model via Claude
        const prompt = `${WUYO_CONTEXT}

Oto hook na post social media: "${originalHook}"

Wygeneruj ALTERNATYWNY hook na ten sam temat. Zmień kąt ataku, użyj innej emocji lub struktury.
Hook musi zatrzymać scroll — max 15 słów. Zero slopu.

Odpowiedz TYLKO hookiem — jedna linia, bez cudzysłowów, bez wyjaśnień.`

        const data = await askClaude(prompt)
        return { success: true as const, data: data.trim() }
    } catch (error: unknown) {
        return { success: false as const, error: error instanceof Error ? error.message : String(error) }
    }
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
            content,
        })
        if (!result) return { success: false as const, error: 'Nie udalo sie dodac do kalendarza' }
        return { success: true as const, eventId: result.id }
    } catch (error: unknown) {
        return { success: false as const, error: error instanceof Error ? error.message : String(error) }
    }
}

// ═══════════════════════════════════════════════════════
// [BATCH] — Generuj Tydzień (3×FB + 3×IG → Kalendarz)
// ═══════════════════════════════════════════════════════

export type WeeklyBatchStep =
    | { step: 'map'; label: 'Research trendów...' }
    | { step: 'nail'; label: 'Generowanie hooków...' }
    | { step: 'execute'; label: string }
    | { step: 'calendar'; label: 'Zapisuję do kalendarza...' }
    | { step: 'done'; label: 'Gotowe!' }

export type WeeklyBatchResult = {
    success: true
    created: number
    dates: string[]
    posts: Array<{ hook: string; date: string; fbId?: string; igId?: string }>
    errors: string[]
} | {
    success: false
    error: string
}

// Oblicza datę najbliższego wystąpienia danego dnia tygodnia (target: 1=pon, 3=śr, 5=pt)
function getNextWeekday(target: number): string {
    const today = new Date()
    const dayOfWeek = today.getDay()
    let diff = target - dayOfWeek
    if (diff <= 0) diff += 7
    const d = new Date(today)
    d.setDate(d.getDate() + diff)
    return d.toISOString().split('T')[0]
}

export async function generateWeeklyBatch(contextHint?: string): Promise<WeeklyBatchResult> {
    try {
        // ── KROK 1: MAP (skrócony) ────────────────────────────────────────────
        const now = new Date()
        const monthYear = now.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })

        const mapText = await askClaude(`${WUYO_CONTEXT}
${contextHint ? `\nDodatkowy kontekst od właściciela: "${contextHint}"` : ''}

ZADANIE [MAP — Research Trendów, wersja skrócona]:
Podaj 3 najważniejsze trendy contentowe i 1 growth tip dla agencji designu premium w Polsce (IG + FB, ${monthYear}).
Format: 4 punkty, każdy max 2 zdania. Tylko actionable insighty.`)

        // ── KROK 2: NAIL → 3 hooki ────────────────────────────────────────────
        const nailText = await askClaude(`${WUYO_CONTEXT}

AKTUALNE TRENDY: ${mapText.slice(0, 500)}
${contextHint ? `\nKontekst: "${contextHint}"` : ''}

ZADANIE [NAIL — 3 Hooki do postów]:
Wygeneruj DOKŁADNIE 3 hooki dla WUYO. Każdy musi:
- Adresować inny pain point właściciela firmy / personal brand
- Być gotowy do użycia jako pierwsze zdanie posta
- Max 15 słów, zero slopu, zero AI bełkotu

Odpowiedz DOKŁADNIE w tym formacie (nic poza tym):
HOOK_1: [treść hooka]
HOOK_2: [treść hooka]
HOOK_3: [treść hooka]`)

        // Parsuj hooki
        const hooks: string[] = []
        const hookRegex = /HOOK_[123]:\s*(.+)/g
        let m: RegExpExecArray | null
        while ((m = hookRegex.exec(nailText)) !== null) {
            const h = m[1].trim().replace(/^["'„]|["'"']$/g, '')
            if (h.length > 10) hooks.push(h)
        }
        // Fallback: wyciągnij niepuste linie
        if (hooks.length < 3) {
            nailText.split('\n')
                .map(l => l.replace(/^HOOK_\d:\s*/, '').trim())
                .filter(l => l.length > 15 && !l.startsWith('#') && !l.startsWith('ZADANIE'))
                .slice(0, 3 - hooks.length)
                .forEach(l => hooks.push(l))
        }
        if (hooks.length < 1) {
            return { success: false, error: 'AI nie wygenerował hooków. Spróbuj ponownie.' }
        }
        const hooksToUse = hooks.slice(0, 3)

        // ── KROK 3: EXECUTE × 3 → copy FB + IG ──────────────────────────────
        const dates = [
            getNextWeekday(1), // poniedziałek
            getNextWeekday(3), // środa
            getNextWeekday(5), // piątek
        ]

        // Rotacja celów: Pon=Edukacja, Śr=Zaangażowanie, Pt=Sprzedaż
        const goals = ['Edukacja', 'Zaangażowanie', 'Sprzedaż']
        const goalContext = [
            'Cel: EDUKACJA — wytłumacz coś wartościowego, pokaż ekspertyzę, daj actionable tip.',
            'Cel: ZAANGAŻOWANIE — wywołaj emocje, zadaj pytanie, pokaż kulisy, buduj relację.',
            'Cel: SPRZEDAŻ — pokaż case study, konkretny rezultat, ofertę lub wezwanie do kontaktu.',
        ]

        const errors: string[] = []
        let created = 0
        const posts: Array<{ hook: string; date: string }> = []

        for (let i = 0; i < hooksToUse.length; i++) {
            const hook = hooksToUse[i]
            const date = dates[i] ?? dates[dates.length - 1]
            const goal = goals[i] ?? 'Zaangażowanie'
            const goalCtx = goalContext[i] ?? goalContext[1]

            try {
                const execText = await askClaude(`${WUYO_CONTEXT}

HOOK DO POSTA: "${hook}"
${goalCtx}

ZADANIE [EXECUTE — Copy gotowe do publikacji]:
Na podstawie tego hooka napisz gotowe copy na dwie platformy. Treść musi realizować podany cel.

## COPY_FACEBOOK
[Pełny post. Zacznij od hooka. Ludzki ton WUYO. Max 800 znaków. 1-2 hashtagi na końcu.]

## COPY_INSTAGRAM
[Pełny post. Zacznij od hooka. Zoptymalizowany pod IG. Max 500 znaków. 3-5 hashtagów na końcu.]

## PROMPT_GRAFIKA
[Opis grafiki w 1-2 zdaniach: co pokazuje, styl dark/gold WUYO, bez tekstu na grafice]

ZASADY: Zaczyna się od hooka. Bez AI slopu. Bez korporacyjnego języka. Gotowe do wklejenia.`)

                // Parsuj sekcje
                const fbMatch = execText.match(/## COPY_FACEBOOK\s*\n([\s\S]*?)(?=\n## COPY_INSTAGRAM|$)/)
                const igMatch = execText.match(/## COPY_INSTAGRAM\s*\n([\s\S]*?)(?=\n## PROMPT_GRAFIKA|$)/)
                const imgMatch = execText.match(/## PROMPT_GRAFIKA\s*\n([\s\S]*)$/)

                const fbCopy = fbMatch ? fbMatch[1].trim() : execText.slice(0, 600)
                const igCopy = igMatch ? igMatch[1].trim() : execText.slice(0, 400)
                const imgPrompt = imgMatch ? imgMatch[1].trim() : ''

                const promptSuffix = imgPrompt
                    ? `\n\n---\n🎨 **Prompt grafiki:** ${imgPrompt}`
                    : ''

                // Dodaj do kalendarza: FB
                await addCalendarEvent({
                    topic: hook.slice(0, 80),
                    platform: 'Facebook',
                    format: 'Post z grafiką',
                    goal,
                    date,
                    status: 'Szkic',
                    content: fbCopy + promptSuffix,
                })

                // Dodaj do kalendarza: IG
                await addCalendarEvent({
                    topic: hook.slice(0, 80),
                    platform: 'Instagram',
                    format: 'Post z grafiką',
                    goal,
                    date,
                    status: 'Szkic',
                    content: igCopy + promptSuffix,
                })

                posts.push({ hook: hook.slice(0, 60), date })
                created += 2
            } catch (e: unknown) {
                errors.push(`Post ${i + 1} (${hook.slice(0, 30)}...): ${e instanceof Error ? e.message : String(e)}`)
            }
        }

        if (created === 0) {
            return { success: false, error: errors.join(' | ') || 'Nie udało się zapisać postów' }
        }

        return { success: true, created, dates, posts, errors }
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
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
