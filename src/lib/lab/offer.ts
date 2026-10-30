/**
 * Oferta w formacie studia: wstęp / zakres / cena / CTA (CLAUDE.md).
 * Cena zawsze z cennika albo wpisana ręcznie przez Mateusza, nigdy z AI.
 * Zapis: ai_generations (input_data.kind = 'oferta', input_data.jobId), output = JSON tej struktury.
 */

export type OfferData = {
    number: string
    date: string
    validDays: number
    clientName: string
    clientCompany: string
    title: string
    intro: string
    scope: string[]
    priceGrosze: number
    priceNote: string
    timeline: string
    cta: string
}

export type BriefAnswers = { question: string; answer: string }[]

/** Pytania briefu wg rodzaju usługi. Klient odpowiada na stronie /brief/[token]. */
export const BRIEF_QUESTIONS: Record<'logo' | 'strona' | 'druk' | 'ogolne', string[]> = {
    logo: [
        'Jak nazywa się firma i czym się zajmuje (2-3 zdania)?',
        'Kto jest Twoim klientem? (wiek, kim są, skąd przychodzą)',
        'Jakie 3 słowa mają się kojarzyć z Twoją marką?',
        'Masz już jakieś logo albo kolory, które chcesz zachować?',
        'Podaj 1-3 marki (dowolna branża), których wygląd Ci się podoba, i dlaczego.',
        'Czego na pewno NIE chcesz w logo?',
        'Gdzie logo będzie używane najczęściej? (szyld, auto, odzież, internet, druk)',
    ],
    strona: [
        'Jak nazywa się firma i czym się zajmuje (2-3 zdania)?',
        'Co ma zrobić osoba, która wejdzie na stronę? (zadzwonić, napisać, zarezerwować, kupić)',
        'Jakie usługi lub produkty mają być na stronie?',
        'Masz logo, zdjęcia i teksty, czy trzeba je przygotować?',
        'Masz już domenę (adres strony) i skrzynkę mailową? Jeśli tak, jaką?',
        'Podaj 1-3 strony, które Ci się podobają, i co w nich lubisz.',
        'Kto jest Twoją największą konkurencją w okolicy?',
    ],
    druk: [
        'Co drukujemy? (wizytówki, ulotki, plakaty, naklejki, inne)',
        'Ile sztuk i w jakim formacie?',
        'Masz gotowy projekt, czy trzeba go zrobić?',
        'Jakie informacje mają się znaleźć na materiale?',
        'Masz logo i kolory firmowe? Prześlij je mailem albo opisz.',
        'Na kiedy potrzebujesz materiały?',
    ],
    ogolne: [
        'Jak nazywa się firma i czym się zajmuje (2-3 zdania)?',
        'Czego potrzebujesz? Opisz własnymi słowami.',
        'Kto jest Twoim klientem?',
        'Co już masz (logo, strona, materiały), a czego brakuje?',
        'Jaki masz budżet orientacyjnie? (nie musisz podawać)',
        'Na kiedy to potrzebujesz?',
    ],
}

export type BriefKind = keyof typeof BRIEF_QUESTIONS

export function briefKindForService(service: string | null | undefined): BriefKind {
    const s = (service ?? '').toLowerCase()
    if (s.includes('logo') || s.includes('marka')) return 'logo'
    if (s.includes('strona') || s.includes('one_page') || s.includes('firma_w_internecie') || s.includes('pelny')) return 'strona'
    if (s.includes('druk') || s.includes('wizyt') || s.includes('ulot')) return 'druk'
    return 'ogolne'
}

export function newPublicToken(): string {
    const bytes = new Uint8Array(12)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20)
}

export function parseOffer(output: string | null | undefined): OfferData | null {
    try {
        const d = JSON.parse(output ?? '') as OfferData
        return d && typeof d.priceGrosze === 'number' ? d : null
    } catch {
        return null
    }
}
