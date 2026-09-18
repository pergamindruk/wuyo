'use client'

// Ustawienie nowego hasła po kliknięciu linku z maila.
// Klient, bo `updateUser` musi pójść z sesji, którą trasa /auth/confirm
// zapisała w ciasteczkach tej przeglądarki.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Odbicie reguł ustawionych w Supabase (Authentication → Sign In / Providers).
// Sprawdzamy je też tutaj, żeby nie odbijać się od serwera przy każdej literówce.
const MIN_ZNAKOW = 12

function bledyHasla(haslo: string): string[] {
    const bledy: string[] = []
    if (haslo.length < MIN_ZNAKOW) bledy.push(`co najmniej ${MIN_ZNAKOW} znaków`)
    if (!/[a-z]/.test(haslo)) bledy.push('małą literę')
    if (!/[A-Z]/.test(haslo)) bledy.push('wielką literę')
    if (!/[0-9]/.test(haslo)) bledy.push('cyfrę')
    if (!/[^a-zA-Z0-9]/.test(haslo)) bledy.push('znak specjalny')
    return bledy
}

/**
 * Sprawdza hasło w bazie wykradzionych haseł HaveIBeenPwned.
 *
 * To samo, co robi płatna opcja „Prevent use of leaked passwords" w Supabase —
 * ona też pyta HaveIBeenPwned, tylko jest dostępna od planu Pro. API jest
 * publiczne i bezpłatne, więc pytamy sami.
 *
 * Hasło NIE opuszcza przeglądarki. Liczymy z niego skrót SHA-1 i wysyłamy
 * pierwsze pięć znaków tego skrótu. Serwer odsyła wszystkie znane końcówki
 * pasujące do tego prefiksu (kilkaset), a dopasowanie robimy już u siebie.
 *
 * Zwraca liczbę wyciekow albo 0. `null` = nie udało się sprawdzić.
 */
async function ileWyciekow(haslo: string): Promise<number | null> {
    try {
        const bajty = new TextEncoder().encode(haslo)
        const skrot = await crypto.subtle.digest('SHA-1', bajty)
        const hex = Array.from(new Uint8Array(skrot))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()

        const odpowiedz = await fetch(`https://api.pwnedpasswords.com/range/${hex.slice(0, 5)}`)
        if (!odpowiedz.ok) return null

        const koncowka = hex.slice(5)
        for (const linia of (await odpowiedz.text()).split('\n')) {
            const [sufiks, ile] = linia.trim().split(':')
            if (sufiks === koncowka) return Number(ile) || 1
        }
        return 0
    } catch {
        // Brak sieci albo API nie odpowiada. Nie blokujemy ustawienia hasła —
        // zamknięcie jedynego konta administratora przez awarię cudzego serwera
        // byłoby gorsze niż brak tego jednego sprawdzenia.
        return null
    }
}

export default function NoweHasloPage() {
    const router = useRouter()
    const [haslo, setHaslo] = useState('')
    const [powtorzone, setPowtorzone] = useState('')
    const [blad, setBlad] = useState<string | null>(null)
    const [zapisuje, setZapisuje] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    const brakujace = bledyHasla(haslo)
    const zgodne = haslo.length > 0 && haslo === powtorzone
    const mozeZapisac = brakujace.length === 0 && zgodne && !zapisuje

    const zapisz = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mozeZapisac) return

        setZapisuje(true)
        setBlad(null)
        setStatus('Sprawdzam, czy hasło nie wyciekło…')

        const wycieki = await ileWyciekow(haslo)
        if (wycieki && wycieki > 0) {
            setBlad(
                `To hasło jest w bazach wykradzionych haseł — znalezione ${wycieki.toLocaleString('pl-PL')} razy. Wybierz inne.`
            )
            setStatus(null)
            setZapisuje(false)
            return
        }

        setStatus('Zapisuję hasło…')
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({ password: haslo })

        if (error) {
            setBlad(error.message)
            setStatus(null)
            setZapisuje(false)
            return
        }

        router.push('/lab')
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center text-zinc-950 font-bold text-2xl mx-auto mb-4">
                        W
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Nowe hasło</h1>
                    <p className="text-zinc-400 text-sm">Ustaw hasło do panelu WUYO Lab</p>
                </div>

                {blad && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {blad}
                    </div>
                )}

                <form onSubmit={zapisz} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="haslo" className="text-sm font-medium text-zinc-300">Nowe hasło</label>
                        <input
                            id="haslo"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={haslo}
                            onChange={(e) => setHaslo(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                            placeholder="••••••••••••"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="powtorzone" className="text-sm font-medium text-zinc-300">Powtórz hasło</label>
                        <input
                            id="powtorzone"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={powtorzone}
                            onChange={(e) => setPowtorzone(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                            placeholder="••••••••••••"
                        />
                    </div>

                    <p className="text-xs text-zinc-400" aria-live="polite">
                        {haslo.length === 0
                            ? `Minimum ${MIN_ZNAKOW} znaków, mała i wielka litera, cyfra i znak specjalny.`
                            : brakujace.length > 0
                                ? `Brakuje: ${brakujace.join(', ')}.`
                                : zgodne
                                    ? 'Hasło spełnia wymagania.'
                                    : 'Hasła się różnią.'}
                    </p>

                    <button
                        type="submit"
                        disabled={!mozeZapisac}
                        className="bg-yellow-400 text-zinc-950 font-bold rounded-lg px-4 py-2.5 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {zapisuje ? (status ?? 'Zapisuję…') : 'Ustaw hasło i wejdź'}
                    </button>
                </form>
            </div>
        </div>
    )
}
