import { login, wyslijReset } from './actions'

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

                <form action={login} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                            placeholder="admin@wuyo.pl"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-sm font-medium text-zinc-300">Hasło</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            formAction={login}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center"
                        >
                            Zaloguj się
                        </button>
                        {/* formNoValidate — reset potrzebuje tylko adresu, nie hasła,
                            a pole hasła jest w tym formularzu wymagane. */}
                        <button
                            formAction={wyslijReset}
                            formNoValidate
                            className="w-full text-zinc-400 hover:text-white text-sm py-1 transition-colors"
                        >
                            Nie pamiętam hasła — wyślij link
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
