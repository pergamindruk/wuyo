import type { CallOutcome, JobStage, QueueSource } from './types'

/** 7 kroków prowadzenia klienta (CLAUDE.md studia). Kolumny lejka. */
export const JOB_STAGES: { stage: JobStage; label: string; short: string }[] = [
    { stage: 1, label: 'Brief i wycena', short: 'Brief' },
    { stage: 2, label: 'Oferta wysłana', short: 'Oferta' },
    { stage: 3, label: 'Umowa', short: 'Umowa' },
    { stage: 4, label: 'Zaliczka 50%', short: 'Zaliczka' },
    { stage: 5, label: 'Realizacja', short: 'Realizacja' },
    { stage: 6, label: 'Odbiór', short: 'Odbiór' },
    { stage: 7, label: 'Rachunek końcowy', short: 'Rozliczone' },
]

/** Usługi z CENNIK.md (netto, grosze) — domyślna cena nowego zlecenia. */
export const SERVICES: { key: string; label: string; priceGrosze: number }[] = [
    { key: 'firma_w_internecie', label: 'Pakiet Firma w Internecie', priceGrosze: 349_000 },
    { key: 'strona_5', label: 'Strona firmowa do 5 podstron', priceGrosze: 299_000 },
    { key: 'one_page', label: 'Strona jednostronicowa', priceGrosze: 199_000 },
    { key: 'marka_start', label: 'Pakiet Marka Start', priceGrosze: 149_000 },
    { key: 'marka_mini', label: 'Pakiet Marka Mini', priceGrosze: 109_000 },
    { key: 'logo', label: 'Logo', priceGrosze: 89_000 },
    { key: 'pelny_start', label: 'Pakiet Pełny Start', priceGrosze: 590_000 },
    { key: 'inne', label: 'Inne', priceGrosze: 0 },
]

export const DEFAULT_MONTH_GOAL_GROSZE = 700_000 // 7 000 zł

/** Po ilu dniach oferta bez ruchu świeci na czerwono. */
export const STALE_OFFER_DAYS = 5

export const OUTCOMES: { key: CallOutcome; label: string; hotkey: string; tone: string }[] = [
    { key: 'nie_odebral', label: 'Nie odebrał', hotkey: '1', tone: 'zinc' },
    { key: 'nie_chce', label: 'Nie chce', hotkey: '2', tone: 'red' },
    { key: 'oddzwonic', label: 'Oddzwonić', hotkey: '3', tone: 'yellow' },
    { key: 'chce_oferte', label: 'Chce ofertę', hotkey: '4', tone: 'emerald' },
]

/** Po ilu dniach „nie odebrał” wraca do kolejki. */
export const NO_ANSWER_RETRY_DAYS = 2
export const MAX_ATTEMPTS = 3

export const SOURCE_LABEL: Record<QueueSource, string> = {
    bez_strony: 'Brak strony',
    slaba_strona: 'Słaba strona',
    strona_nie_dziala: 'Strona nie działa',
    ceidg: 'Nowa firma (CEIDG)',
    reczny: 'Dodany ręcznie',
}

/** Początek rozmowy (2 zdania) wg źródła — bez żargonu, na „Pan/Pani”. */
export const CALL_OPENERS: Record<QueueSource, string> = {
    bez_strony:
        'Dzień dobry, Mateusz Machos, robię strony dla firm z Rzeszowa. Szukałem Państwa w Google i nie znalazłem strony, a klienci właśnie tam szukają. Mogę wysłać krótką propozycję?',
    strona_nie_dziala:
        'Dzień dobry, Mateusz Machos z Rzeszowa. Wszedłem na Państwa stronę i się nie otwiera, klient widzi błąd. Wiedzą Państwo o tym?',
    slaba_strona:
        'Dzień dobry, Mateusz Machos, robię strony dla lokalnych firm. Oglądałem Państwa stronę na telefonie i zauważyłem jedną rzecz, przez którą klienci mogą nie dzwonić. Mogę powiedzieć jaką?',
    ceidg:
        'Dzień dobry, Mateusz Machos z Rzeszowa. Widzę, że firma dopiero ruszyła, gratuluję. Robię logo, wizytówki i strony na start. Mogę wysłać krótką propozycję?',
    reczny: 'Dzień dobry, Mateusz Machos, studio WUYO z Rzeszowa.',
}
