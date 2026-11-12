// Notatka z rozmowy → propozycja następnego kroku. AI tylko proponuje; tu pilnujemy,
// żeby propozycja nie zawierała rzeczy, których w notatce nie było (budżet, złe daty).

export const CALL_NOTE_OUTCOMES = ['chce_oferte', 'oddzwonic', 'nie_chce', 'brak'] as const
export type CallNoteOutcome = (typeof CALL_NOTE_OUTCOMES)[number]

export const CALL_NOTE_OUTCOME_LABEL: Record<CallNoteOutcome, string> = {
    chce_oferte: 'Chce ofertę',
    oddzwonic: 'Oddzwonić',
    nie_chce: 'Nie chce',
    brak: 'Bez zmiany statusu',
}

export interface CallNoteAnalysis {
    potrzeba: string
    uslugi: string[]
    budzet: string | null
    termin: string | null
    obiekcje: string[]
    nastepnyKrok: string
    kontaktDnia: string | null
    proponowanyWynik: CallNoteOutcome
    niepewne: string[]
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function str(v: unknown, max = 300): string {
    return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function strList(v: unknown, maxItems = 6): string[] {
    return Array.isArray(v) ? v.map((x) => str(x, 160)).filter(Boolean).slice(0, maxItems) : []
}

/** Wyciąga obiekt JSON z odpowiedzi modelu (może być w ```json …```). */
export function extractJson(raw: string): unknown {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
    const body = fenced ? fenced[1] : raw
    const start = body.indexOf('{')
    const end = body.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    try {
        return JSON.parse(body.slice(start, end + 1))
    } catch {
        return null
    }
}

/** Budżet zostaje tylko, jeśli jego liczby padły w notatce. Inaczej AI go zgadło. */
export function budgetSupported(budzet: string, note: string): boolean {
    const nums = budzet.match(/\d[\d\s]*/g)?.map((n) => n.replace(/\s/g, '')) ?? []
    if (nums.length === 0) return false
    const noteDigits = note.replace(/(\d)\s+(?=\d)/g, '$1')
    return nums.every((n) => noteDigits.includes(n) || noteDigits.includes(String(Number(n) / 1000) + ' tys') || noteDigits.includes(String(Number(n) / 1000) + 'k'))
}

/** Waliduje propozycję AI. today = YYYY-MM-DD wg Europe/Warsaw. */
export function sanitizeAnalysis(raw: unknown, note: string, today: string): CallNoteAnalysis | null {
    if (!raw || typeof raw !== 'object') return null
    const o = raw as Record<string, unknown>
    const niepewne = strList(o.niepewne)

    let budzet: string | null = str(o.budzet, 80) || null
    if (budzet && !budgetSupported(budzet, note)) {
        niepewne.push(`AI podało budżet „${budzet}”, którego nie ma w notatce. Usunięty.`)
        budzet = null
    }

    let kontaktDnia: string | null = str(o.kontaktDnia, 10) || null
    if (kontaktDnia && (!DATE_RE.test(kontaktDnia) || kontaktDnia < today)) kontaktDnia = null

    const wynik = str(o.proponowanyWynik, 20) as CallNoteOutcome
    const proponowanyWynik = (CALL_NOTE_OUTCOMES as readonly string[]).includes(wynik) ? wynik : 'brak'

    const nastepnyKrok = str(o.nastepnyKrok, 200)
    const potrzeba = str(o.potrzeba, 300)
    if (!nastepnyKrok && !potrzeba) return null

    return {
        potrzeba,
        uslugi: strList(o.uslugi),
        budzet,
        termin: str(o.termin, 80) || null,
        obiekcje: strList(o.obiekcje),
        nastepnyKrok,
        kontaktDnia,
        proponowanyWynik,
        niepewne,
    }
}

/** Jedna linia do historii i notatek kolejki. */
export function analysisSummary(a: CallNoteAnalysis): string {
    const parts = [
        a.potrzeba && `Potrzeba: ${a.potrzeba}`,
        a.uslugi.length > 0 && `Usługi: ${a.uslugi.join(', ')}`,
        a.budzet && `Budżet: ${a.budzet}`,
        a.termin && `Termin: ${a.termin}`,
        a.obiekcje.length > 0 && `Obiekcje: ${a.obiekcje.join('; ')}`,
        a.nastepnyKrok && `Dalej: ${a.nastepnyKrok}${a.kontaktDnia ? ` (${a.kontaktDnia})` : ''}`,
    ]
    return parts.filter(Boolean).join(' · ')
}
