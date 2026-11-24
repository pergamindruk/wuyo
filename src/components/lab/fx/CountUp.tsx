'use client'

// "use client": licznik dochodzi do wartości w przeglądarce (requestAnimationFrame).

import { useEffect, useRef, useState } from 'react'

/** Liczba, która „dobiega” do wartości po wejściu na stronę. format = np. kwota w PLN. */
export function CountUp({ value, format = 'int', duration = 1100 }: { value: number; format?: 'int' | 'pln'; duration?: number }) {
    const [shown, setShown] = useState(value)
    const started = useRef(false)

    useEffect(() => {
        if (started.current) { setShown(value); return }
        started.current = true
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || value === 0) { setShown(value); return }
        let raf = 0
        const t0 = performance.now()
        const step = (t: number) => {
            const p = Math.min((t - t0) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setShown(Math.round(value * eased))
            if (p < 1) raf = requestAnimationFrame(step)
        }
        setShown(0)
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [value, duration])

    if (format === 'pln') {
        return <>{(shown / 100).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł</>
    }
    return <>{shown.toLocaleString('pl-PL')}</>
}
