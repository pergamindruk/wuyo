'use client'

// "use client": nasłuch kliknięć, zmian strony i powiadomień w przeglądarce, żeby zagrać dźwięk.

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { playSound } from '@/lib/lab/sound'

/**
 * Dźwięki w całym /lab bez dopisywania ich do każdego przycisku:
 * - klik w przycisk albo link: „tick” (data-sound="off" wyłącza, data-sound="pop" itp. zmienia),
 * - zmiana strony: „nav”,
 * - powiadomienie sonner: sukces = „success”, błąd = „error”, reszta = „notify”.
 */
export function LabFx() {
    const pathname = usePathname()
    const first = useRef(true)

    useEffect(() => {
        if (first.current) { first.current = false; return }
        playSound('nav')
    }, [pathname])

    useEffect(() => {
        const onDown = (e: PointerEvent) => {
            if (e.button !== 0) return
            const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('button, a, [role="button"], summary, select, input[type="checkbox"], input[type="radio"]')
            if (!el || el.closest('[data-sound="off"]') || (el as HTMLButtonElement).disabled) return
            const custom = el.closest<HTMLElement>('[data-sound]')?.dataset.sound
            // Linki zmieniające stronę dostaną dźwięk „nav” po przejściu.
            if (!custom && el.tagName === 'A' && (el as HTMLAnchorElement).href && !(el as HTMLAnchorElement).href.includes('#')) return
            playSound((custom as 'pop' | 'success' | 'tick' | undefined) ?? 'tick')
        }

        const seen = new WeakSet<Element>()
        const observer = new MutationObserver((records) => {
            for (const r of records) {
                r.addedNodes.forEach((n) => {
                    if (!(n instanceof HTMLElement)) return
                    const toast = n.matches('[data-sonner-toast]') ? n : n.querySelector('[data-sonner-toast]')
                    if (!toast || seen.has(toast)) return
                    seen.add(toast)
                    const type = toast.getAttribute('data-type')
                    playSound(type === 'success' ? 'success' : type === 'error' ? 'error' : 'notify')
                })
            }
        })
        document.addEventListener('pointerdown', onDown, { capture: true })
        observer.observe(document.body, { childList: true, subtree: true })
        return () => {
            document.removeEventListener('pointerdown', onDown, { capture: true })
            observer.disconnect()
        }
    }, [])

    return null
}
