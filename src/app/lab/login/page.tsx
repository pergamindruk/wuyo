import { login, wyslijLinkLogowania, wyslijReset } from './actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; rodzaj?: string }>
}) {
    const { message, rodzaj } = await searchParams
    // Komunikat o wysłanym linku to nie awaria — na czerwono wyglądałby jak błąd.
    const info = rodzaj === 'info'

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center text-zinc-950 font-bold text-2xl mx-auto mb-4">
                        W
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Autoryzacja Wymagana</h1>
                    <p className="text-zinc-400 text-sm">Zaloguj się do panelu WUYO Lab</p>
                </div>

                {message && (
                    <div
                        className={`mb-4 p-3 rounded-lg border text-sm text-center ${
                            info
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                    >
                        {message.replace(/_/g, ' ')}
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
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                            placeholder="admin@wuyo.pl"
                        />
                    </div>

                    <button
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center"
                    >
                        Wyślij link do logowania
                    </button>
                    <p className="text-zinc-500 text-xs text-center -mt-1">
                        Kliknij link w mailu — otwórz go w tej samej przeglądarce.
                    </p>
                </form>

                {/* Zapasowo: stare logowanie hasłem. */}
                <details className="mt-6 border-t border-zinc-800 pt-4">
                    <summary className="text-zinc-400 hover:text-white text-sm cursor-pointer text-center">
                        Zaloguj hasłem
                    </summary>
                    <form action={login} className="flex flex-col gap-4 mt-4">
                        <input
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            aria-label="Email"
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                            placeholder="admin@wuyo.pl"
                        />
                        <input
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            aria-label="Hasło"
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                            placeholder="••••••••"
                        />
                        <button
                            formAction={login}
                            className="w-full border border-zinc-700 hover:border-zinc-500 text-white font-bold py-2.5 rounded-lg transition-colors"
                        >
                            Zaloguj się
                        </button>
                        {/* formNoValidate — reset potrzebuje tylko adresu, nie hasła. */}
                        <button
                            formAction={wyslijReset}
                            formNoValidate
                            className="w-full text-zinc-400 hover:text-white text-sm py-1 transition-colors"
                        >
                            Nie pamiętam hasła — wyślij link
                        </button>
                    </form>
                </details>
            </div>
        </div>
    )
}
