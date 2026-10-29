/**
 * Rachunek / protokół z formularza, bez AI: dane wpisane = dane na dokumencie.
 * W bazie (finances.markdown_content) zapisujemy je jako blok ```rachunek-json, żeby stare
 * dokumenty w markdownie dalej się wyświetlały, a nowe miały stały, porządny układ.
 */

export type ReceiptKind = 'dn' | 'dzielo' | 'protokol'

export type ReceiptData = {
    kind: ReceiptKind
    number: string
    place: string
    issueDate: string
    saleDate: string
    seller: string[]
    buyer: string[]
    items: { name: string; unit: string; qty: number; amountGrosze: number }[]
    advanceGrosze: number
    totalGrosze: number
    payment: string
    dueDays: number
    notes: string
}

/** Dane sprzedawcy. Po rejestracji firmy podmienić na nazwę firmy, NIP i adres z CEIDG. */
export const SELLER = ['Mateusz Machoś', 'ul. Siemieńskiego 17A/38', '35-203 Rzeszów']

export const KIND_LABEL: Record<ReceiptKind, string> = {
    dn: 'Rachunek',
    dzielo: 'Rachunek do umowy o dzieło',
    protokol: 'Protokół odbioru',
}

export const LEGAL: Record<ReceiptKind, string[]> = {
    dn: [
        'Sprzedawca prowadzi działalność nierejestrowaną w rozumieniu art. 5 ust. 1 ustawy z dnia 6 marca 2018 r. Prawo przedsiębiorców.',
        'Sprzedawca korzysta ze zwolnienia z podatku od towarów i usług na podstawie art. 113 ust. 1 ustawy o VAT.',
    ],
    dzielo: [
        'Rachunek wystawiony do umowy o dzieło. Z chwilą zapłaty wynagrodzenia autorskie prawa majątkowe do dzieła przechodzą na Zamawiającego w zakresie określonym w umowie.',
    ],
    protokol: [
        'Zamawiający potwierdza odbiór wykonanej usługi / dzieła bez zastrzeżeń, chyba że wskazano je w uwagach.',
    ],
}

const RECEIPT_TAG = 'rachunek-json'

export function serializeReceipt(d: ReceiptData): string {
    return '```' + RECEIPT_TAG + '\n' + JSON.stringify(d) + '\n```'
}

export function parseReceipt(markdown: string | null | undefined): ReceiptData | null {
    const m = (markdown ?? '').match(new RegExp('^```' + RECEIPT_TAG + '\\n([\\s\\S]*)\\n```$'))
    if (!m) return null
    try {
        return JSON.parse(m[1]) as ReceiptData
    } catch {
        return null
    }
}

export function formatPln(grosze: number): string {
    return (grosze / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł'
}

export function formatDatePl(iso: string): string {
    const [y, m, d] = iso.split('-')
    return y && m && d ? `${d}.${m}.${y}` : iso
}

// ── Kwota słownie ────────────────────────────────────────────────────────────

const ONES = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć']
const TEENS = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście']
const TENS = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt']
const HUNDREDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset']

function form(n: number, one: string, few: string, many: string) {
    if (n === 1) return one
    const d = n % 10, h = n % 100
    return d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many
}

function triple(n: number): string {
    const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10
    const parts = [HUNDREDS[h]]
    if (t === 1) parts.push(TEENS[o])
    else parts.push(TENS[t], ONES[o])
    return parts.filter(Boolean).join(' ')
}

/** 1234.56 zł -> „jeden tysiąc dwieście trzydzieści cztery złote 56/100” */
export function amountInWords(grosze: number): string {
    const zl = Math.floor(Math.abs(grosze) / 100)
    const gr = Math.abs(grosze) % 100
    if (zl === 0) return `zero złotych ${String(gr).padStart(2, '0')}/100`
    const groups: [number, string, string, string][] = [
        [Math.floor(zl / 1_000_000) % 1000, 'milion', 'miliony', 'milionów'],
        [Math.floor(zl / 1000) % 1000, 'tysiąc', 'tysiące', 'tysięcy'],
    ]
    const words: string[] = []
    for (const [n, one, few, many] of groups) {
        if (n) words.push(`${triple(n)} ${form(n, one, few, many)}`)
    }
    const rest = zl % 1000
    if (rest) words.push(triple(rest))
    return `${words.join(' ')} ${form(zl, 'złoty', 'złote', 'złotych')} ${String(gr).padStart(2, '0')}/100`
}
