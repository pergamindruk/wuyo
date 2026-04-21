'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function PageTracker() {
    const pathname = usePathname()

    useEffect(() => {
        if (pathname.startsWith('/lab')) return
        const ref = document.referrer
        const isExternal = ref && !ref.includes('wuyo.pl')
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: pathname, referrer: isExternal ? ref : '' }),
        }).catch(() => {})
    }, [pathname])

    return null
}
