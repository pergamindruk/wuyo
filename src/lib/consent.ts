// Zgody na ciasteczka analityczne i marketingowe.
//
// Domyślnie wszystko jest zablokowane — ustawia to skrypt w <head> (layout.tsx),
// który musi wykonać się przed wczytaniem tagu Google. Ten plik obsługuje to,
// co dzieje się po decyzji odwiedzającego: zapis wyboru i przekazanie go
// do GA4 (Consent Mode v2) oraz Piksela Meta.
//
// KLUCZ i kształt zapisu są zduplikowane w skrypcie w <head>. Zmiana tutaj
// wymaga zmiany tam — inaczej wracający odwiedzający zostanie zapytany od nowa.

export const CONSENT_STORAGE_KEY = 'wuyo-zgody-v1'

export type ConsentChoice = {
    analytics: boolean
    marketing: boolean
    /** ISO 8601. Dowód, kiedy padła zgoda — tego wymaga RODO. */
    decidedAt: string
}

type ConsentSignals = {
    analytics_storage: 'granted' | 'denied'
    ad_storage: 'granted' | 'denied'
    ad_user_data: 'granted' | 'denied'
    ad_personalization: 'granted' | 'denied'
}

type ConsentWindow = Window & {
    gtag?: (command: 'consent', action: 'update', signals: ConsentSignals) => void
    fbq?: (command: 'consent', action: 'grant' | 'revoke') => void
}

/** Wybór z pamięci przeglądarki. `null` = jeszcze nie zdecydował albo pamięć niedostępna. */
export function readConsent(): ConsentChoice | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
        if (!raw) return null
        const parsed: unknown = JSON.parse(raw)
        if (typeof parsed !== 'object' || parsed === null) return null
        const { analytics, marketing, decidedAt } = parsed as Partial<ConsentChoice>
        if (typeof analytics !== 'boolean' || typeof marketing !== 'boolean') return null
        return { analytics, marketing, decidedAt: decidedAt ?? new Date().toISOString() }
    } catch {
        // Tryb prywatny albo zablokowane dane witryny — traktujemy jak brak decyzji.
        return null
    }
}

export function saveConsent(choice: ConsentChoice) {
    try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice))
    } catch {
        // Zapis się nie udał, ale zgoda i tak działa do końca tej wizyty.
    }
}

/**
 * Piksel Meta ładuje się po hydratacji, więc w momencie decyzji `fbq` może jeszcze
 * nie istnieć. Czekamy na niego, bo bez tego zgoda na marketing przepadłaby
 * i piksel zostałby zablokowany do końca wizyty.
 */
function setPixelConsent(granted: boolean, attempt = 0) {
    const w = window as ConsentWindow
    if (typeof w.fbq === 'function') {
        w.fbq('consent', granted ? 'grant' : 'revoke')
        return
    }
    // Po ~10 s uznajemy, że piksela nie ma: wyłączony w konfiguracji albo zablokowany.
    if (attempt >= 40) return
    window.setTimeout(() => setPixelConsent(granted, attempt + 1), 250)
}

/** Przekazuje decyzję do GA4 i Piksela Meta. */
export function applyConsent(choice: Pick<ConsentChoice, 'analytics' | 'marketing'>) {
    if (typeof window === 'undefined') return
    const w = window as ConsentWindow
    const yes = (granted: boolean): 'granted' | 'denied' => (granted ? 'granted' : 'denied')

    w.gtag?.('consent', 'update', {
        analytics_storage: yes(choice.analytics),
        ad_storage: yes(choice.marketing),
        ad_user_data: yes(choice.marketing),
        ad_personalization: yes(choice.marketing),
    })

    // Piksel, jeśli już jest wczytany, dostaje 'grant' albo 'revoke'.
    // Jeśli go nie ma, dociągnie go MetaPixel po tym zdarzeniu.
    setPixelConsent(choice.marketing)

    window.dispatchEvent(
        new CustomEvent<Pick<ConsentChoice, 'analytics' | 'marketing'>>(CONSENT_CHANGED_EVENT, {
            detail: { analytics: choice.analytics, marketing: choice.marketing },
        })
    )
}

/** Zdarzenie, którym stopka prosi baner o ponowne otwarcie ustawień. */
export const CONSENT_REOPEN_EVENT = 'wuyo:zgody-otworz'

/**
 * Zdarzenie po każdej decyzji. Nasłuchuje go Piksel Meta, który dociąga swój
 * skrypt dopiero po zgodzie na marketing — zamiast wisieć na każdej stronie.
 */
export const CONSENT_CHANGED_EVENT = 'wuyo:zgody-zmienione'
