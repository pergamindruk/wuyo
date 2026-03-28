'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
    const [dark, setDark] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('wuyo-portal-theme')
        if (saved === 'light') setDark(false)
    }, [])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('wuyo-portal-theme', dark ? 'dark' : 'light')
        // Toggle class on the portal wrapper
        const wrapper = document.getElementById('portal-wrapper')
        if (wrapper) {
            if (dark) {
                wrapper.classList.add('dark')
            } else {
                wrapper.classList.remove('dark')
            }
        }
    }, [dark, mounted])

    if (!mounted) return null

    return (
        <button
            onClick={() => setDark(d => !d)}
            className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-zinc-800/80 dark:bg-zinc-800/80 border border-zinc-700 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-yellow-400 transition-colors backdrop-blur-sm shadow-lg"
            aria-label={dark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
        >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    )
}
