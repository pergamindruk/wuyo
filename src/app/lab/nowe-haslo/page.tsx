'use client'

// Ustawienie nowego hasła po kliknięciu linku z maila.
// Klient, bo `updateUser` musi pójść z sesji, którą trasa /auth/confirm
// zapisała w ciasteczkach tej przeglądarki.

import { useState } from 'react'
import Image from 'next/image'
import { AlertTriangle, KeyRound, ShieldCheck } from 'lucide-react'
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
                `To hasło jest w bazach wykradzionych haseł, znalezione ${wycieki.toLocaleString('pl-PL')} razy. Wybierz inne.`
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

    const pole = 'lab-input px-4 py-3 text-white placeholder:text-zinc-600'
    const podpowiedzOk = haslo.length > 0 && brakujace.length === 0 && zgodne

    return (
        // Strona bez menu: nie jest w .lab-ui z layoutu, więc owijamy sami.
        <div className="lab-ui relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 text-zinc-50">
            <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-[60%] rounded-full bg-yellow-400/[0.09] blur-3xl" />
            <div className="lab-card w-full max-w-md p-8 sm:p-10">
                <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-yellow-400/15 blur-3xl" />
                <div className="mb-8 text-center">
                    <Image
                        src="/favicon-wuyo.png"
                        alt="WUYO"
                        width={56}
                        height={56}
                        priority
                        className="mx-auto mb-5 h-14 w-14 rounded-2xl shadow-[0_12px_36px_-10px_rgba(255,214,10,.7)]"
                    />
                    <h1 className="mb-2 font-heading text-3xl font-bold tracking-tight text-white">Nowe hasło</h1>
                    <p className="text-sm text-zinc-400">Ustaw hasło do panelu WUYO Lab</p>
                </div>

                {blad && (
                    <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-400/20">
                        <AlertTriangle size={18} className="mt-px shrink-0" />
                        <span>{blad}</span>
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
                            className={pole}
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
                            className={pole}
                            placeholder="••••••••••••"
                        />
                    </div>

                    <p
                        className={`flex items-start gap-2 rounded-2xl px-3.5 py-2.5 text-xs ${
                            podpowiedzOk ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/[0.04] text-zinc-400'
                        }`}
                        aria-live="polite"
                    >
                        {podpowiedzOk ? <ShieldCheck size={15} className="shrink-0" /> : <KeyRound size={15} className="shrink-0" />}
                        <span>
                            {haslo.length === 0
                                ? `Minimum ${MIN_ZNAKOW} znaków, mała i wielka litera, cyfra i znak specjalny.`
                                : brakujace.length > 0
                                    ? `Brakuje: ${brakujace.join(', ')}.`
                                    : zgodne
                                        ? 'Hasło spełnia wymagania.'
                                        : 'Hasła się różnią.'}
                        </span>
                    </p>

                    <button
                        type="submit"
                        disabled={!mozeZapisac}
                        className="lab-btn flex min-h-12 w-full items-center justify-center font-bold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {zapisuje ? (status ?? 'Zapisuję…') : 'Ustaw hasło i wejdź'}
                    </button>
                </form>
            </div>
        </div>
    )
}
