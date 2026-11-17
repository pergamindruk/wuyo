import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { warsawIsoDate } from '@/lib/lab/today/format'
import { zl } from '@/lib/lab/doradca/conversation'
import { Tile, statCard } from '@/components/lab/stats/StatBlocks'
import { CostForm, CostRowActions, DeadlineForm, DeadlineRowActions, FactForm, FactRowActions } from './AdvisorControls'

export const dynamic = 'force-dynamic'

const MIESIACE = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']

function przesun(miesiac: string, o: number): string {
    const d = new Date(Date.UTC(Number(miesiac.slice(0, 4)), Number(miesiac.slice(5, 7)) - 1 + o, 1))
    return d.toISOString().slice(0, 7)
}

export default async function AdvisorPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const dzis = warsawIsoDate()
    const param = (await searchParams).m
    const miesiac = param && /^\d{4}-\d{2}$/.test(param) ? param : dzis.slice(0, 7)
    const od = `${miesiac}-01`
    const doDnia = new Date(Date.UTC(Number(miesiac.slice(0, 4)), Number(miesiac.slice(5, 7)), 0)).toISOString().slice(0, 10)

    const [koszty, terminy, fakty, rok] = await Promise.all([
        supabase.from('koszty').select('id, data, kwota_grosze, opis, sprzedawca, z_dotacji, zrodlo').gte('data', od).lte('data', doDnia).order('data', { ascending: false }),
        supabase.from('doradca_terminy').select('id, data, tytul, zrobione').order('zrobione').order('data').limit(50),
        supabase.from('doradca_fakty').select('id, tresc, created_at').order('created_at', { ascending: false }),
        supabase.from('koszty').select('kwota_grosze, z_dotacji').gte('data', `${miesiac.slice(0, 4)}-01-01`).lte('data', `${miesiac.slice(0, 4)}-12-31`),
    ])

    const brakTabel = [koszty.error, terminy.error, fakty.error].some((e) => e?.code === '42P01')
    const lista = koszty.data ?? []
    const suma = lista.reduce((s, k) => s + k.kwota_grosze, 0)
    const zDotacji = lista.filter((k) => k.z_dotacji).reduce((s, k) => s + k.kwota_grosze, 0)
    const rokSuma = (rok.data ?? []).reduce((s, k) => s + k.kwota_grosze, 0)
    const rokDotacja = (rok.data ?? []).filter((k) => k.z_dotacji).reduce((s, k) => s + k.kwota_grosze, 0)
    const etykieta = `${MIESIACE[Number(miesiac.slice(5, 7)) - 1]} ${miesiac.slice(0, 4)}`

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <header>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/80">Doradca</p>
                <h1 className="mt-1 text-3xl font-bold text-white">Koszty, terminy i pamięć</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    To samo, co widzi bot na Telegramie. Zmiana tutaj = bot wie o niej przy następnej wiadomości.
                </p>
            </header>

            {brakTabel && (
                <p className="rounded-2xl border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
                    Brak tabel doradcy w bazie. Odpal migracje 013 i 014 w Supabase.
                </p>
            )}

            <section className={statCard}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-white">Koszty</h2>
                    <nav className="flex items-center gap-1 rounded-full border border-zinc-800 p-1" aria-label="Miesiąc">
                        <Link href={`/lab/doradca?m=${przesun(miesiac, -1)}`} className="rounded-full p-1.5 text-zinc-400 hover:text-white" aria-label="Poprzedni miesiąc">
                            <ChevronLeft size={16} />
                        </Link>
                        <span className="min-w-36 text-center text-sm text-zinc-200">{etykieta}</span>
                        <Link href={`/lab/doradca?m=${przesun(miesiac, 1)}`} className="rounded-full p-1.5 text-zinc-400 hover:text-white" aria-label="Następny miesiąc">
                            <ChevronRight size={16} />
                        </Link>
                    </nav>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Tile label="W miesiącu" value={zl(suma)} sub={`${lista.length} pozycji`} />
                    <Tile label="Do kosztów podatkowych" value={zl(suma - zDotacji)} sub="bez zakupów z dotacji" />
                    <Tile label="Z dotacji w miesiącu" value={zl(zDotacji)} sub="nie idą w koszty" />
                    <Tile label={`Rok ${miesiac.slice(0, 4)}`} value={zl(rokSuma)} sub={rokDotacja ? `w tym z dotacji ${zl(rokDotacja)}` : undefined} />
                </div>

                <CostForm defaultDate={miesiac === dzis.slice(0, 7) ? dzis : od} />

                {lista.length === 0 ? (
                    <p className="mt-4 text-sm text-zinc-500">Brak kosztów w tym miesiącu.</p>
                ) : (
                    <ul className="mt-4 divide-y divide-white/[0.06]">
                        {lista.map((k) => (
                            <li key={k.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
                                <span className="w-24 shrink-0 tabular-nums text-zinc-500">{k.data}</span>
                                <span className="min-w-0 flex-1 text-zinc-200">
                                    {k.opis}
                                    {k.sprzedawca && <span className="text-zinc-500">, {k.sprzedawca}</span>}
                                    {k.zrodlo === 'telegram' && <span className="ml-2 text-xs text-zinc-600">z Telegrama</span>}
                                </span>
                                <span className="w-28 shrink-0 text-right font-semibold tabular-nums text-white">{zl(k.kwota_grosze)}</span>
                                <CostRowActions id={k.id} zDotacji={k.z_dotacji} />
                            </li>
                        ))}
                    </ul>
                )}
                <p className="mt-4 text-xs text-zinc-600">
                    Zapisuj koszty brutto, tak jak na paragonie. Oryginały paragonów i faktur trzymaj, ta lista ich nie zastępuje.
                </p>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className={statCard}>
                    <h2 className="text-lg font-semibold text-white">Terminy</h2>
                    <p className="mt-1 text-xs text-zinc-500">Bot przypomina o nich w porannej wiadomości na 7 dni przed.</p>
                    <DeadlineForm defaultDate={dzis} />
                    {(terminy.data ?? []).length === 0 ? (
                        <p className="mt-4 text-sm text-zinc-500">Nie pilnuję jeszcze żadnego terminu.</p>
                    ) : (
                        <ul className="mt-4 divide-y divide-white/[0.06]">
                            {(terminy.data ?? []).map((t) => {
                                const po = !t.zrobione && t.data < dzis
                                return (
                                    <li key={t.id} className="flex items-center gap-3 py-2.5 text-sm">
                                        <span className={`w-24 shrink-0 tabular-nums ${po ? 'font-semibold text-red-400' : 'text-zinc-500'}`}>{t.data}</span>
                                        <span className={`min-w-0 flex-1 ${t.zrobione ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>{t.tytul}</span>
                                        <DeadlineRowActions id={t.id} zrobione={t.zrobione} />
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </section>

                <section className={statCard}>
                    <h2 className="text-lg font-semibold text-white">Pamięć bota</h2>
                    <p className="mt-1 text-xs text-zinc-500">Ustalenia, które bot bierze pod uwagę w każdej odpowiedzi. Usuń, co nieaktualne.</p>
                    <FactForm />
                    {(fakty.data ?? []).length === 0 ? (
                        <p className="mt-4 text-sm text-zinc-500">Jeszcze nic nie zapamiętał.</p>
                    ) : (
                        <ul className="mt-4 divide-y divide-white/[0.06]">
                            {(fakty.data ?? []).map((f) => (
                                <li key={f.id} className="flex items-start gap-3 py-2.5 text-sm">
                                    <span className="min-w-0 flex-1 text-zinc-200">{f.tresc}</span>
                                    <FactRowActions id={f.id} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    )
}
