'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { writeFile, readdir, readFile } from 'fs/promises'
import path from 'path'

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
