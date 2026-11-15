'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/tracking'

// Licznik liczy tylko prawdziwą stronę. Localhost, podglądy Vercela i przeglądarki
// sterowane automatem (Playwright, testy, audyty) zaśmiecały page_views.
function shouldCount(): boolean {
    return location.hostname === 'wuyo.pl' && !navigator.webdriver
}

function send(body: Record<string, unknown>) {
    fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true, // kliknięcie w tel: może od razu opuścić stronę
    }).catch(() => {})
}

// Pierwsza odsłona po wczytaniu karty = wejście na stronę. Tylko wtedy liczy się
// źródło (Google, Facebook, link z kampanii); przejścia między podstronami już nie.
let firstView = true

type Kind = 'telefon' | 'whatsapp'

function classify(href: string): Kind | null {
    if (href.startsWith('tel:')) return 'telefon'
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) return 'whatsapp'
    return null
}

export function PageTracker() {
    const pathname = usePathname()

    useEffect(() => {
        if (pathname.startsWith('/lab') || !shouldCount()) return
        const ref = document.referrer
        let fromOutside = true
        try { fromOutside = !ref || new URL(ref).hostname !== 'wuyo.pl' } catch { /* zły adres = z zewnątrz */ }
        const landing = firstView && fromOutside
        firstView = false
        const q = new URLSearchParams(location.search)
        send({
            page: pathname,
            referrer: landing ? ref : '',
            landing,
            ...(landing ? { utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'), utm_campaign: q.get('utm_campaign') } : {}),
        })
    }, [pathname])

    // Jeden nasłuch na całą stronę: każdy link do telefonu i WhatsAppa jest liczony,
    // także te dopisane później, bez pamiętania o onClick przy każdym.
    // Zdarzenie idzie do GA4/Meta (gdy jest zgoda) i do własnego licznika (zawsze,
    // bez ciasteczek i danych osobowych), bo GA4 bez zgody większości wizyt nie widzi.
    // Pobrania plików liczy serwer (/api/pobierz), bo link przychodzi mailem.
    useEffect(() => {
        function onClick(e: MouseEvent) {
            const a = (e.target as Element | null)?.closest?.('a')
            const href = a?.getAttribute('href')
            if (!href) return
            const kind = classify(href)
            if (!kind) return
            if (kind === 'telefon') trackPhoneClick()
            else trackWhatsAppClick()
            if (!location.pathname.startsWith('/lab') && shouldCount()) {
                send({ page: `/zdarzenie/${kind}`, referrer: location.pathname })
            }
        }
        document.addEventListener('click', onClick, { capture: true })
        return () => document.removeEventListener('click', onClick, { capture: true })
    }, [])

    return null
}
