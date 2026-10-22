// Kształt danych wysyłanych przez narzedzia/nocna-zmiana/sync_centrum.py

export type Pair = [string, number]

export interface WeakSite {
    nazwa: string
    strona: string
    punkty: number
    problemy: string[]
}

export interface CallLead {
    nazwa: string
    branza: string
    telefon: string
}

export interface CeidgFirm {
    nazwa: string
    telefon: string
    adres: string
    pkd: string
}

export interface BlogDraft {
    slug: string
    tytul: string
    data: string
    posty: boolean
}

export interface CentrumData {
    wygenerowano: string
    harvey: {
        firmy: number
        z_strona: number
        bez_strony: number
        bez_strony_z_tel: number
        per_branza: Pair[]
        dodane_per_dzien: Pair[]
        prospekty: number
        z_mailem_zweryfikowanym: number
        prospekty_status: Pair[]
        outbox: Record<string, number>
        wyslane_per_dzien: Pair[]
        rozmowy: number
        rozmowy_intencje: Pair[]
        kampanie: number
        claude_dzis: number
    }
    harvey_status: { procesy: number; panel: boolean }
    rozgrzewka: { start_date: string | null; min_days: number; max_daily: number }
    audyt: {
        sprawdzone: number
        nie_dziala: number
        bez_problemow: number
        problemy: Pair[]
        najslabsze: WeakSite[]
        data: string | null
    } | null
    bez_strony_top: CallLead[]
    ceidg: { plik: string | null; ile: number; firmy: CeidgFirm[] }
    blog: BlogDraft[]
    nocna: { rano: string; ostatnia: string | null }
}
