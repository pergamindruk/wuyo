// Szkic asystenta dla jednego ruchu: wiadomość, scenariusz telefonu, warianty i (dla oferty) tekst oferty.
// Prompt i parser są tu, bez Supabase i bez wywołania AI, żeby dało się je testować.

import { PRICING, RULES, VOICE, clean } from '@/lib/lab/ai/context'
import { SERVICES } from '@/lib/lab/today/constants'
import { formatPLN } from '@/lib/lab/today/format'
import { PLAYBOOK, START_NOTE } from './playbook'
import { followUpStep, type Move } from './pick'

/** Wersja promptu. Podnieś ją przy zmianie promptu, a starsze zapisane szkice przygotują się od nowa. */
export const DRAFT_VERSION = 2

/** Znacznik w wiadomości, w który przy akceptacji wchodzi link do oferty. */
export const LINK_TOKEN = '{LINK}'

export interface DraftVariant {
    name: string
    price: string
    forWhom: string
    recommended: boolean
}

export interface DraftOffer {
    title: string
    intro: string
    scope: string[]
    cta: string
}

export interface Draft {
    channel: 'mail' | 'sms'
    subject: string
    message: string
    /** Scenariusz telefonu, markdown. */
    call: string
    variants: DraftVariant[]
    nextStep: string
    offer: DraftOffer | null
}

export function serviceLabel(key: string | null): string {
    if (!key) return ''
    return SERVICES.find((s) => s.key === key)?.label ?? key
}

function facts(m: Move): string {
    const lines = [
        `FIRMA: ${m.name}`,
        m.industry && `Branża: ${m.industry}`,
        m.website ? `Strona: ${m.website}` : 'Strona: brak albo nieznana',
        m.problems.length > 0 && `Co zauważyła nocna zmiana: ${m.problems.join(', ')}`,
        m.title && `Zlecenie w lejku: ${m.title}`,
        m.service && `Usługa: ${serviceLabel(m.service)}`,
        m.valueGrosze > 0 && `Kwota w lejku: ${formatPLN(m.valueGrosze)} netto`,
        `Powód: ${m.why}`,
        m.notes && `Notatki z rozmów (najważniejsze źródło faktów):\n${m.notes.slice(-1500)}`,
        `Kontakt: ${m.email ? `mail ${m.email}` : 'brak maila'}${m.phone ? `, telefon ${m.phone}` : ''}`,
    ]
    return lines.filter(Boolean).join('\n')
}

function task(m: Move): string {
    const channel = m.email ? 'mail' : 'sms'
    switch (m.kind) {
        case 'oferta':
            return `ZADANIE: firma chce oferty i czeka ${m.daysWaiting} dni. Przygotuj ofertę i ${channel === 'mail' ? 'maila' : 'SMS/WhatsApp'}, z którym ją wyślesz.
- "message": krótko przeproś za czekanie (bez tłumaczenia się), 1 zdanie o ich sytuacji, link do oferty jako ${LINK_TOKEN} (dokładnie ten znacznik), polecany wariant i jeden następny krok z dniem tygodnia.
- "offer": tekst oferty na polecany wariant (cenę wstawi system, Ty jej NIE podajesz w offer). Oferta to dokument, nie list:
  "intro" BEZ powitania i bez imienia na początku ("Panie Dawidzie", "Dzień dobry" są zakazane), bez terminu startu.
  Zacznij od sytuacji klienta z danych wyżej (branża, czego brakuje: np. strony albo logo), potem co to im da.
- "call": scenariusz telefonu, gdy po 2-3 dniach nie odpisze.`
        case 'zalegly':
        case 'przypomnienie': {
            const step = followUpStep(m.daysWaiting)
            return `ZADANIE: oferta wysłana ${m.daysWaiting} dni temu, brak odpowiedzi. Ten krok to: ${step.label}.
- "message": ${channel === 'mail' ? 'mail' : 'SMS/WhatsApp'} na ten krok, max 4 zdania, jedno pytanie na końcu, bez wyrzutów i bez "czy miał Pan okazję zapoznać się".
- "call": scenariusz telefonu z pytaniem o decyzję i odpowiedziami na "jeszcze się zastanawiam", "za drogo", "wybrałem kogoś innego".
- "offer": null.`
        }
        case 'oddzwon':
        case 'telefon':
            return `ZADANIE: ${m.kind === 'oddzwon' ? 'firma prosiła o telefon' : 'zimny telefon do firmy z kolejki'}.
- "call": NAJWAŻNIEJSZE. Scenariusz wg metody wyżej: otwarcie (20 s), 2 pytania, pytanie o lukę, odpowiedzi na "mam już kogoś", "nie mam czasu", "ile to kosztuje", "proszę wysłać maila", cel: jeden następny krok.
- "message": SMS po rozmowie (podsumowanie i następny krok), max 3 zdania.
- "offer": null.`
    }
}

export function buildPrompt(m: Move, note?: string): string {
    return `${VOICE}

${RULES}

${PRICING}

${PLAYBOOK}

${START_NOTE}

${facts(m)}

${task(m)}
${note ? `\nUWAGA MATEUSZA DO POPRAWKI (ma pierwszeństwo): ${note.slice(0, 500)}\n` : ''}
Nie wymyślaj faktów o firmie spoza danych wyżej. Jeśli czegoś brakuje, zapytaj o to w rozmowie zamiast zgadywać.
Zwróć TYLKO JSON (bez markdownu wokół):
{"channel": "${m.email ? 'mail' : 'sms'}", "subject": "temat maila albo pusty dla SMS",
 "message": "...", "call": "markdown: ## Otwarcie, ## Pytania, ## Gdy powie..., ## Następny krok",
 "variants": [{"name": "pozycja z cennika", "price": "kwota z cennika", "forWhom": "1 zdanie", "recommended": false}, 3 sztuki, dokładnie jeden recommended: true],
 "nextStep": "jeden następny krok z dniem tygodnia",
 "offer": ${m.kind === 'oferta' ? '{"title": "...", "intro": "2-3 zdania o sytuacji klienta, bez powitania i imienia, bez terminu startu", "scope": ["4-7 punktów"], "cta": "2 zdania: akceptacja przyciskiem pod ofertą albo odpowiedź na maila, potem umowa"}' : 'null'}}`
}

/**
 * Sprzątanie każdego tekstu szkicu (długie pauzy, zakazane słowa: kompleksowy, dedykowany, profesjonalny…).
 * Używane po wygenerowaniu i przy odczycie zapisanych szkiców, więc stare zapisy też wychodzą czyste.
 */
const GREETING = /^\s*(dzień dobry|witam|witaj|cześć|hej|szanown\p{L}*(\s+pan\p{L}*)?(\s+\p{Lu}\p{L}*)?|pan(ie|i)\s+\p{Lu}\p{L}*)\s*[,!.]?\s*/iu

/** Wstęp oferty to dokument, nie list: zdejmuje powitanie z początku i wielką literą zaczyna resztę. */
export function stripGreeting(text: string): string {
    const rest = text.replace(GREETING, '')
    if (rest === text) return text
    return rest.charAt(0).toLocaleUpperCase('pl-PL') + rest.slice(1)
}

export function tidyDraft(d: Draft): Draft {
    return {
        ...d,
        subject: clean(d.subject ?? ''),
        message: clean(d.message ?? ''),
        call: clean(d.call ?? ''),
        nextStep: clean(d.nextStep ?? ''),
        variants: (d.variants ?? []).map((v) => ({ ...v, name: clean(v.name ?? ''), price: clean(v.price ?? ''), forWhom: clean(v.forWhom ?? '') })),
        offer: d.offer ? { title: clean(d.offer.title), intro: stripGreeting(clean(d.offer.intro)), scope: d.offer.scope.map(clean), cta: clean(d.offer.cta) } : null,
    }
}

const str = (v: unknown, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Wyciąga JSON z odpowiedzi modelu i sprawdza kształt. Zwraca null, gdy się nie da. */
export function parseDraft(raw: string, wantOffer: boolean): Draft | null {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    let d: Record<string, unknown>
    try {
        d = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>
    } catch {
        return null
    }
    const message = str(d.message)
    const call = str(d.call, 8000)
    if (!message && !call) return null

    const variants = (Array.isArray(d.variants) ? d.variants : []).slice(0, 3).map((v) => {
        const o = (v ?? {}) as Record<string, unknown>
        return { name: str(o.name, 120), price: str(o.price, 60), forWhom: str(o.forWhom, 200), recommended: o.recommended === true }
    }).filter((v) => v.name)
    if (variants.length > 0 && !variants.some((v) => v.recommended)) variants[Math.min(1, variants.length - 1)].recommended = true

    let offer: DraftOffer | null = null
    if (wantOffer && d.offer && typeof d.offer === 'object') {
        const o = d.offer as Record<string, unknown>
        const scope = (Array.isArray(o.scope) ? o.scope : []).map((s) => str(s, 300)).filter(Boolean).slice(0, 8)
        offer = { title: str(o.title, 160), intro: str(o.intro, 1200), scope, cta: str(o.cta, 600) }
        if (!offer.title || scope.length === 0) offer = null
    }

    return {
        channel: d.channel === 'mail' ? 'mail' : 'sms',
        subject: str(d.subject, 160),
        message,
        call,
        variants,
        nextStep: str(d.nextStep, 300),
        offer,
    }
}
