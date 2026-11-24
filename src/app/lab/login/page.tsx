import Image from 'next/image'
import { AlertTriangle, KeyRound, Mail, MailCheck } from 'lucide-react'
import { login, wyslijLinkLogowania, wyslijReset } from './actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; rodzaj?: string }>
}) {
    const { message, rodzaj } = await searchParams
    // Komunikat o wysłanym linku to nie awaria, na czerwono wyglądałby jak błąd.
    const info = rodzaj === 'info'

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
                    <h1 className="mb-2 font-heading text-3xl font-bold tracking-tight text-white">Autoryzacja wymagana</h1>
                    <p className="text-sm text-zinc-400">Zaloguj się do panelu WUYO Lab</p>
                </div>

                {message && (
                    <div
                        className={`mb-5 flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm ${
                            info
                                ? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20'
                                : 'bg-red-400/10 text-red-300 ring-1 ring-red-400/20'
                        }`}
                    >
                        {info ? <MailCheck size={18} className="mt-px shrink-0" /> : <AlertTriangle size={18} className="mt-px shrink-0" />}
                        <span>{message.replace(/_/g, ' ')}</span>
                    </div>
                )}

                {/* Główna droga: link na maila, bez hasła. */}
                <form action={wyslijLinkLogowania} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            className="lab-input px-4 py-3 text-white placeholder:text-zinc-600"
                            placeholder="admin@wuyo.pl"
                        />
                    </div>

                    <button className="lab-btn flex min-h-12 w-full items-center justify-center gap-2 font-bold">
                        <Mail size={18} strokeWidth={2} /> Wyślij link do logowania
                    </button>
                    <p className="-mt-1 text-center text-xs text-zinc-500">
                        Kliknij link w mailu i otwórz go w tej samej przeglądarce.
                    </p>
                </form>

                {/* Zapasowo: stare logowanie hasłem. */}
                <details className="group mt-6 border-t border-white/[0.07] pt-4">
                    <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 text-sm text-zinc-400 transition hover:text-white">
                        <KeyRound size={15} /> Zaloguj hasłem
                    </summary>
                    <form action={login} className="mt-4 flex flex-col gap-3">
                        <input
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            aria-label="Email"
                            className="lab-input px-4 py-3 text-white placeholder:text-zinc-600"
                            placeholder="admin@wuyo.pl"
                        />
                        <input
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            aria-label="Hasło"
                            className="lab-input px-4 py-3 text-white placeholder:text-zinc-600"
                            placeholder="••••••••"
                        />
                        <button
                            formAction={login}
                            className="min-h-12 w-full rounded-full bg-white/[0.06] font-bold text-white ring-1 ring-white/10 transition hover:bg-white/[0.1]"
                        >
                            Zaloguj się
                        </button>
                        {/* formNoValidate: reset potrzebuje tylko adresu, nie hasła. */}
                        <button
                            formAction={wyslijReset}
                            formNoValidate
                            className="w-full py-1 text-sm text-zinc-400 transition-colors hover:text-yellow-400"
                        >
                            Nie pamiętam hasła, wyślij link
                        </button>
                    </form>
                </details>
            </div>
        </div>
    )
}
