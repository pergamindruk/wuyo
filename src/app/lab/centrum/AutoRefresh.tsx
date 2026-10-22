'use client'

// "use client": ekran jest otwarty cały czas, więc co kilka minut
// odświeżamy dane serwera bez przeładowania strony (router.refresh).
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AutoRefresh({ seconds = 300 }: { seconds?: number }) {
    const router = useRouter()
    useEffect(() => {
        const id = setInterval(() => router.refresh(), seconds * 1000)
        return () => clearInterval(id)
    }, [router, seconds])
    return null
}
