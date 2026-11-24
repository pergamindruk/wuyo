import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Bot, Brain, CalendarClock, CalendarRange, Calculator, ChevronLeft, ChevronRight, Gift, Receipt, Wallet } from 'lucide-react'
import { PageHeader, SectionTitle } from '@/components/lab/ui/PageHeader'
import { createClient } from '@/lib/supabase/server'
import { warsawIsoDate } from '@/lib/lab/today/format'
import { zl } from '@/lib/lab/doradca/conversation'
import { Tile, statCard } from '@/components/lab/stats/StatBlocks'
import { CostForm, CostRowActions, DeadlineForm, DeadlineRowActions, FactForm, FactRowActions, TaskForm, TaskRowActions } from './AdvisorControls'

const STATUS: Record<string, { label: string; cls: string }> = {
    oczekuje: { label: 'czeka na komputer', cls: 'bg-white/[0.06] text-zinc-300' },
    w_toku: { label: 'komputer pracuje', cls: 'bg-yellow-400/15 text-yellow-300' },
    zrobione: { label: 'zrobione', cls: 'bg-emerald-400/15 text-emerald-300' },
    blad: { label: 'nie wyszło', cls: 'bg-red-400/15 text-red-300' },
}

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

    const [koszty, terminy, fakty, rok, zadania] = await Promise.all([
        supabase.from('koszty').select('id, data, kwota_grosze, opis, sprzedawca, z_dotacji, zrodlo').gte('data', od).lte('data', doDnia).order('data', { ascending: false }),
        supabase.from('doradca_terminy').select('id, data, tytul, zrobione').order('zrobione').order('data').limit(50),
        supabase.from('doradca_fakty').select('id, tresc, created_at').order('created_at', { ascending: false }),
        supabase.from('koszty').select('kwota_grosze, z_dotacji').gte('data', `${miesiac.slice(0, 4)}-01-01`).lte('data', `${miesiac.slice(0, 4)}-12-31`),
        supabase.from('doradca_zadania').select('id, tresc, termin, status, wynik, plik, created_at, finished_at').order('created_at', { ascending: false }).limit(30),
    ])

    const brakTabel = [koszty.error, terminy.error, fakty.error, zadania.error].some((e) => e?.code === '42P01')
    const lista = koszty.data ?? []
    const suma = lista.reduce((s, k) => s + k.kwota_grosze, 0)
    const zDotacji = lista.filter((k) => k.z_dotacji).reduce((s, k) => s + k.kwota_grosze, 0)
    const rokSuma = (rok.data ?? []).reduce((s, k) => s + k.kwota_grosze, 0)
    const rokDotacja = (rok.data ?? []).filter((k) => k.z_dotacji).reduce((s, k) => s + k.kwota_grosze, 0)
    const etykieta = `${MIESIACE[Number(miesiac.slice(5, 7)) - 1]} ${miesiac.slice(0, 4)}`

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <PageHeader
                icon={Wallet}
                eyebrow="Doradca"
                title="Zadania, koszty, terminy i pamięć"
                subtitle="To samo, co widzi bot na Telegramie. Zmiana tutaj = bot wie o niej przy następnej wiadomości."
            />

            {brakTabel && (
                <div className="lab-card flex items-center gap-3 border-red-400/30 px-4 py-3 text-sm text-red-300">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-400/15"><AlertTriangle size={18} strokeWidth={1.8} /></span>
                    Brak tabel doradcy w bazie. Odpal migracje 013, 014 i 015 w Supabase.
                </div>
            )}

            <section className={statCard}>
                <SectionTitle icon={Bot} title="Zadania dla komputera" />
                <p className="-mt-2 text-xs text-zinc-500">
                    Komputer sprawdza kolejkę co 15 minut, gdy jest włączony, i odsyła wynik na Telegram. Robi szkice i research, niczego nie wysyła ani nie publikuje.
                </p>
                <TaskForm />
                {(zadania.data ?? []).length === 0 ? (
                    <Empty icon={Bot} text="Brak zadań. Wpisz pierwsze w polu wyżej." />
                ) : (
                    <ul className="mt-4 flex flex-col gap-2">
                        {(zadania.data ?? []).map((z) => {
                            const s = STATUS[z.status] ?? STATUS.oczekuje
                            return (
                                <li key={z.id} className={`${ROW} text-sm`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>
                                        <span className="min-w-0 flex-1 whitespace-pre-line text-zinc-200">
                                            {z.tresc}
                                            {z.termin && <span className="ml-2 text-xs text-zinc-500">od {z.termin}</span>}
                                        </span>
                                        <TaskRowActions id={z.id} status={z.status} />
                                    </div>
                                    {z.wynik && (
                                        <details className="mt-2 rounded-2xl bg-black/25 px-4 py-2">
                                            <summary className="cursor-pointer text-xs font-medium text-zinc-400 hover:text-yellow-300">
                                                Wynik{z.plik ? `, plik: ${z.plik}` : ''}
                                            </summary>
                                            <p className="mt-2 whitespace-pre-line text-zinc-300">{z.wynik}</p>
                                        </details>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>

            <section className={statCard}>
                <SectionTitle
                    icon={Wallet}
                    title="Koszty"
                    action={
                        <nav className="lab-pill flex items-center gap-1 p-1" aria-label="Miesiąc">
                            <Link href={`/lab/doradca?m=${przesun(miesiac, -1)}`} className="rounded-full p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white" aria-label="Poprzedni miesiąc">
                                <ChevronLeft size={16} strokeWidth={1.8} />
                            </Link>
                            <span className="min-w-36 text-center text-sm font-medium text-zinc-100">{etykieta}</span>
                            <Link href={`/lab/doradca?m=${przesun(miesiac, 1)}`} className="rounded-full p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white" aria-label="Następny miesiąc">
                                <ChevronRight size={16} strokeWidth={1.8} />
                            </Link>
                        </nav>
                    }
                />

                <div className="lab-stagger grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Tile icon={Receipt} label="W miesiącu" value={zl(suma)} sub={`${lista.length} pozycji`} />
                    <Tile icon={Calculator} label="Do kosztów podatkowych" value={zl(suma - zDotacji)} sub="bez zakupów z dotacji" />
                    <Tile icon={Gift} label="Z dotacji w miesiącu" value={zl(zDotacji)} sub="nie idą w koszty" />
                    <Tile icon={CalendarRange} label={`Rok ${miesiac.slice(0, 4)}`} value={zl(rokSuma)} sub={rokDotacja ? `w tym z dotacji ${zl(rokDotacja)}` : undefined} />
                </div>

                <CostForm defaultDate={miesiac === dzis.slice(0, 7) ? dzis : od} />

                {lista.length === 0 ? (
                    <Empty icon={Receipt} text="Brak kosztów w tym miesiącu. Dodaj pierwszy w formularzu wyżej." />
                ) : (
                    <ul className="mt-4 flex flex-col gap-2">
                        {lista.map((k) => (
                            <li key={k.id} className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${ROW}`}>
                                <span className="w-24 shrink-0 tabular-nums text-zinc-500">{k.data}</span>
                                <span className="min-w-0 flex-1 text-zinc-200">
                                    {k.opis}
                                    {k.sprzedawca && <span className="text-zinc-500">, {k.sprzedawca}</span>}
                                    {k.zrodlo === 'telegram' && <span className="ml-2 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-zinc-400">z Telegrama</span>}
                                </span>
                                <span className="w-28 shrink-0 text-right font-semibold tabular-nums text-white">{zl(k.kwota_grosze)}</span>
                                <CostRowActions id={k.id} zDotacji={k.z_dotacji} />
                            </li>
                        ))}
                    </ul>
                )}
                <p className="mt-4 text-xs text-zinc-500">
                    Zapisuj koszty brutto, tak jak na paragonie. Oryginały paragonów i faktur trzymaj, ta lista ich nie zastępuje.
                </p>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className={statCard}>
                    <SectionTitle icon={CalendarClock} title="Terminy" />
                    <p className="-mt-2 text-xs text-zinc-500">Bot przypomina o nich w porannej wiadomości na 7 dni przed.</p>
                    <DeadlineForm defaultDate={dzis} />
                    {(terminy.data ?? []).length === 0 ? (
                        <Empty icon={CalendarClock} text="Nie pilnuję jeszcze żadnego terminu." />
                    ) : (
                        <ul className="mt-4 flex flex-col gap-2">
                            {(terminy.data ?? []).map((t) => {
                                const po = !t.zrobione && t.data < dzis
                                return (
                                    <li key={t.id} className={`flex items-center gap-3 text-sm ${ROW}`}>
                                        <span className={`w-24 shrink-0 tabular-nums ${po ? 'font-semibold text-red-300' : 'text-zinc-500'}`}>{t.data}</span>
                                        <span className={`min-w-0 flex-1 ${t.zrobione ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>{t.tytul}</span>
                                        <DeadlineRowActions id={t.id} zrobione={t.zrobione} />
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </section>

                <section className={statCard}>
                    <SectionTitle icon={Brain} title="Pamięć bota" />
                    <p className="-mt-2 text-xs text-zinc-500">Ustalenia, które bot bierze pod uwagę w każdej odpowiedzi. Usuń, co nieaktualne.</p>
                    <FactForm />
                    {(fakty.data ?? []).length === 0 ? (
                        <Empty icon={Brain} text="Jeszcze nic nie zapamiętał." />
                    ) : (
                        <ul className="mt-4 flex flex-col gap-2">
                            {(fakty.data ?? []).map((f) => (
                                <li key={f.id} className={`flex items-start gap-3 text-sm ${ROW}`}>
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

const ROW = 'rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]'

/** Pusty stan w karcie: ikona w szarym kółku + jedno zdanie. */
function Empty({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
    return (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/[0.02] px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-500"><Icon size={18} strokeWidth={1.8} /></span>
            <p className="text-sm text-zinc-500">{text}</p>
        </div>
    )
}
