'use client'

// Bezpieczne wywołanie GA4 — działa tylko gdy gtag załadowany
export function gtagEvent(eventName: string, params?: Record<string, unknown>) {
    if (typeof window === 'undefined') return
    if (typeof (window as any).gtag !== 'function') return
    ;(window as any).gtag('event', eventName, params)
}

// Bezpieczne wywołanie Meta Pixel
export function fbqEvent(eventName: string, params?: Record<string, unknown>) {
    if (typeof window === 'undefined') return
    if (typeof (window as any).fbq !== 'function') return
    ;(window as any).fbq('track', eventName, params)
}

// Konwersja: wysłanie formularza kontaktowego
export function trackFormSubmit(formType: 'quick' | 'branding' | 'web') {
    gtagEvent('generate_lead', {
        event_category: 'contact',
        event_label: formType,
    })
    fbqEvent('Lead', { content_name: formType })
}

// Konwersja: kliknięcie w numer telefonu
export function trackPhoneClick() {
    gtagEvent('click', {
        event_category: 'contact',
        event_label: 'phone',
    })
    fbqEvent('Contact')
}

// Konwersja: kliknięcie WhatsApp
export function trackWhatsAppClick() {
    gtagEvent('click', {
        event_category: 'contact',
        event_label: 'whatsapp',
    })
    fbqEvent('Contact')
}
