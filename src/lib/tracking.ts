'use client'

// Nazwy zdarzeń trzymamy w konwencji GA4: własna nazwa + parametry.
// Stary schemat (event_category / event_label z Universal Analytics) nie pojawia się
// w żadnym raporcie GA4, a nazwa "click" koliduje ze zdarzeniem, które GA4 zbiera
// samo dla kliknięć wychodzących — dlatego kontakt ma własne "contact_click".

type GtagParams = Record<string, string | number | boolean | undefined>

type TrackingWindow = Window & {
    gtag?: (command: 'event', eventName: string, params?: GtagParams) => void
    fbq?: (command: 'track', eventName: string, params?: GtagParams) => void
}

export type LeadType = 'quick' | 'branding' | 'web' | 'audyt' | 'druk' | 'czatbot'
export type ContactMethod = 'phone' | 'whatsapp'

// Bezpieczne wywołanie GA4 — działa tylko gdy gtag załadowany
export function gtagEvent(eventName: string, params?: GtagParams) {
    if (typeof window === 'undefined') return
    const gtag = (window as TrackingWindow).gtag
    if (typeof gtag !== 'function') return
    gtag('event', eventName, params)
}

// Bezpieczne wywołanie Meta Pixel
export function fbqEvent(eventName: string, params?: GtagParams) {
    if (typeof window === 'undefined') return
    const fbq = (window as TrackingWindow).fbq
    if (typeof fbq !== 'function') return
    fbq('track', eventName, params)
}

// Konwersja: wysłanie formularza kontaktowego
export function trackFormSubmit(formType: Extract<LeadType, 'quick' | 'branding' | 'web'>) {
    gtagEvent('generate_lead', { lead_type: formType })
    fbqEvent('Lead', { content_name: formType })
}

// Konwersja: kliknięcie w numer telefonu
export function trackPhoneClick() {
    gtagEvent('contact_click', { method: 'phone' satisfies ContactMethod })
    fbqEvent('Contact', { method: 'phone' })
}

// Konwersja: kliknięcie WhatsApp
export function trackWhatsAppClick() {
    gtagEvent('contact_click', { method: 'whatsapp' satisfies ContactMethod })
    fbqEvent('Contact', { method: 'whatsapp' })
}

// Konwersja: czatbot wyciagnal od kogos imie i adres e-mail.
// Lead zapisuje serwer, ale zdarzenie musi polecieć z przeglądarki — inaczej
// cały kanał byłby niewidoczny w statystykach.
export function trackChatLead() {
    gtagEvent('generate_lead', { lead_type: 'czatbot' })
    fbqEvent('Lead', { content_name: 'czatbot' })
}

// Konwersja: zgloszenie do bezplatnego audytu strony
export function trackAuditSubmit() {
    gtagEvent('generate_lead', { lead_type: 'audyt' })
    fbqEvent('Lead', { content_name: 'audyt' })
}

// Konwersja: zlozenie zamowienia na druk.
// Liczba pozycji idzie w osobnym parametrze — "value" w GA4 znaczy kwotę,
// więc wrzucanie tam sztuk psuje raporty przychodu.
export function trackOrderSubmit(itemCount: number) {
    gtagEvent('generate_lead', { lead_type: 'druk', num_items: itemCount })
    fbqEvent('Lead', { content_name: 'zamowienie-druk', num_items: itemCount })
}
