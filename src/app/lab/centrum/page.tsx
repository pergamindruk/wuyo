import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
    Activity, AlertTriangle, ArrowRight, Building2, CheckCircle2, Clock, FileText, Flame, FolderOpen, Globe,
    Mail, MailCheck, Moon, Phone, Radar, Send, Sparkles, WifiOff,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AutoRefresh } from './AutoRefresh'
import { PageHeader, SectionTitle } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'
import { AreaChart } from '@/components/lab/fx/AreaChart'
import type { CentrumData, Pair } from './types'

export const dynamic = 'force-dynamic'

const DAY = 86_400_000

function minutesAgo(iso: string): number {
    return Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
}

function agoLabel(min: number): string {
    if (min < 1) return 'przed chwilą'
    if (min < 60) return `${min} min temu`
    const h = Math.floor(min / 60)
    if (h < 24) return `${h} h temu`
    return `${Math.floor(h / 24)} dni temu`
}

function telHref(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`
}

/* ───────────── małe klocki UI ───────────── */

function Card({ title, icon, children, className = '', action }: {
    title: string
    icon?: LucideIcon
    children: React.ReactNode
    className?: string
    action?: React.ReactNode
}) {
    return (
        <section className={`lab-card min-w-0 p-5 sm:p-6 ${className}`}>
            <SectionTitle icon={icon} title={title} action={action} />
            {children}
        </section>
    )
}

function Kpi({ label, value, hint, icon: Icon, tone = 'default', href }: {
    label: string
    value: number
    hint?: string
    icon: LucideIcon
    tone?: 'default' | 'good' | 'warn' | 'bad'
    href?: string
}) {
    const toneCls = {
        default: 'text-white',
        good: 'text-emerald-300',
        warn: 'text-yellow-300',
        bad: 'text-red-300',
    }[tone]
    const hot = tone === 'warn'
    const inner = (
        <>
            {hot && <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-yellow-400/15 blur-2xl" />}
            <span className={`h-10 w-10 shrink-0 ${hot ? 'lab-chip' : 'flex items-center justify-center rounded-2xl bg-white/[0.06] text-zinc-300'}`}>
                <Icon size={18} strokeWidth={1.8} />
            </span>
            <p className="mt-3 truncate text-xs font-medium text-zinc-400">{label}</p>
            <p className={`mt-1 font-heading text-3xl font-bold leading-none tabular-nums ${toneCls}`}><CountUp value={value} /></p>
            {hint && <p className="mt-2 text-[11px] text-zinc-500 transition-colors group-hover:text-zinc-300">{hint}</p>}
        </>
    )
    return href
        ? <Link href={href} className="lab-card group min-w-0 p-4">{inner}</Link>
        : <div className="lab-card lab-hover min-w-0 p-4">{inner}</div>
}

function Bars({ rows, color = 'bg-yellow-400', empty }: {
    rows: Pair[]
    color?: string
    empty: string
}) {
    if (rows.length === 0) return <p className="text-sm text-zinc-500">{empty}</p>
    const max = Math.max(...rows.map(([, v]) => v), 1)
    return (
        <ul className="flex flex-col gap-3">
            {rows.map(([label, value]) => (
                <li key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
                    <span className="truncate text-xs text-zinc-300">{label}</span>
                    <span className="text-xs font-semibold tabular-nums text-zinc-400">{value}</span>
                    <span className="col-span-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <span
                            className={`lab-bar block h-full rounded-full ${color}`}
                            style={{ width: `${Math.max((value / max) * 100, 2)}%` }}
                        />
                    </span>
                </li>
            ))}
        </ul>
    )
}

function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
    const max = Math.max(steps[0]?.value ?? 1, 1)
    return (
        <ol className="flex flex-col gap-3">
            {steps.map((s, i) => {
                const prev = i > 0 ? steps[i - 1].value : null
                const conv = prev ? Math.round((s.value / prev) * 100) : null
                return (
                    <li key={s.label} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold tabular-nums text-zinc-400">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex justify-between gap-2 text-xs">
                                <span className="truncate text-zinc-300">{s.label}</span>
                                <span className="shrink-0 font-semibold tabular-nums text-white">
                                    {s.value}
                                    {conv !== null && <span className="font-normal text-zinc-500"> · {conv}%</span>}
                                </span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                                <div
                                    className="lab-bar h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300 shadow-[0_0_16px_-2px_rgba(255,214,10,0.6)]"
                                    style={{ width: `${s.value > 0 ? Math.max((s.value / max) * 100, 1.5) : 0}%` }}
                                />
                            </div>
                        </div>
                    </li>
                )
            })}
        </ol>
    )
}

function Spark({ rows, empty }: { rows: Pair[]; empty: string }) {
    if (rows.length === 0) return <p className="text-sm text-zinc-500">{empty}</p>
    const last = rows[rows.length - 1]
    return (
        <div>
            <AreaChart id="centrum-wyslane" values={rows.map(([, v]) => v)} height={140}
                label={`${last[0]} · ${last[1]}`} className="h-32" />
            <div className="mt-2 flex justify-between text-[10px] text-zinc-500">
                <span>{rows[0][0]}</span>
                <span>{last[0]}</span>
            </div>
        </div>
    )
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            ok ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-300'}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'animate-pulse bg-emerald-400' : 'bg-red-400'}`} />
            {label}
        </span>
    )
}

const MORE = 'inline-flex items-center gap-1 text-xs font-medium text-yellow-400/80 transition hover:text-yellow-300'
const ROW = 'rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]'

/* ───────────── strona ───────────── */

export default async function CentrumPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const { data: row } = await supabase
        .from('centrum_snapshot')
        .select('data, updated_at')
        .eq('key', 'latest')
        .maybeSingle()

    if (!row) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <PageHeader icon={Radar} title="Centrum Dowodzenia" subtitle="Co robi komputer studia: Harvey, audyt stron, nocna zmiana." />
                <div className="lab-card flex flex-col items-center gap-3 p-10 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400"><WifiOff size={22} strokeWidth={1.8} /></span>
                    <p className="text-sm text-zinc-400">
                        Brak danych. Uruchom na komputerze studia: <code className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-yellow-300">python -I sync_centrum.py</code>
                    </p>
                </div>
            </div>
        )
    }

    const d = row.data as CentrumData
    const h = d.harvey
    const syncMin = minutesAgo(row.updated_at as string)
    const online = syncMin <= 45
    const harveyOk = d.harvey_status.procesy >= 2 && d.harvey_status.panel

    // Rozgrzewka skrzynki
    const warm = d.rozgrzewka
    const warmEnd = warm.start_date ? new Date(warm.start_date).getTime() + warm.min_days * DAY : null
    const warmLeft = warmEnd ? Math.max(Math.ceil((warmEnd - Date.now()) / DAY), 0) : 0
    const warmPct = warmEnd && warm.min_days
        ? Math.min(100, Math.round(((warm.min_days - warmLeft) / warm.min_days) * 100)) : 100

    const ob = h.outbox
    const doZatwierdzenia = ob.pending_review ?? 0
    const wyslane = ob.sent ?? 0
    const napisane = Object.values(ob).reduce((a, b) => a + b, 0)

    const funnel = [
        { label: 'Firmy w bazie', value: h.firmy },
        { label: 'Znaleziony adres e-mail', value: h.prospekty },
        { label: 'Adres zweryfikowany (Reoon)', value: h.z_mailem_zweryfikowanym },
        { label: 'Maile napisane', value: napisane },
        { label: 'Maile wysłane', value: wyslane },
        { label: 'Odpowiedzi', value: h.rozmowy },
    ]

    const a = d.audyt
    const rano = d.nocna.rano.split('\n').filter((l) => l.startsWith('- '))

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <AutoRefresh seconds={300} />

            {/* ── Nagłówek ── */}
            <PageHeader
                icon={Radar}
                eyebrow="Komputer studia · na żywo"
                title="Centrum Dowodzenia"
                subtitle={`Ostatnia synchronizacja: ${agoLabel(syncMin)}`}
                actions={
                    <Link href="/lab/centrum/pliki" className="lab-pill inline-flex h-10 items-center gap-2 px-4 text-sm font-medium text-white">
                        <FolderOpen size={16} strokeWidth={1.8} className="text-yellow-400" /> Raporty i pliki
                    </Link>
                }
            />
            <div className="-mt-2 flex flex-wrap items-center gap-2">
                <StatusPill ok={online} label={online ? 'Komputer online' : 'Brak sygnału z komputera'} />
                <StatusPill ok={harveyOk} label={harveyOk ? 'Harvey pracuje' : 'Harvey wyłączony'} />
                <StatusPill
                    ok={d.nocna.ostatnia !== null}
                    label={`Nocna zmiana: ${d.nocna.ostatnia ?? 'jeszcze nie było'}`}
                />
            </div>

            {!online && (
                <div className="lab-card flex items-start gap-3 border-red-400/30 p-4 text-sm text-red-300">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-400/15"><WifiOff size={18} strokeWidth={1.8} /></span>
                    <p className="pt-1.5">Dane mają ponad 45 minut. Komputer jest wyłączony, uśpiony albo nie działa synchronizacja.</p>
                </div>
            )}

            {/* ── KPI ── */}
            <div className="lab-stagger grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
                <Kpi label="Firmy w bazie" value={h.firmy} icon={Building2} />
                <Kpi label="Bez strony" value={h.bez_strony} hint={`${h.bez_strony_z_tel} z telefonem`}
                    icon={Globe} tone="warn" />
                <Kpi label="Strona nie działa" value={a?.nie_dziala ?? 0} hint="gotowy temat rozmowy"
                    icon={AlertTriangle} tone="bad" />
                <Kpi label="Adresy zweryfikowane" value={h.z_mailem_zweryfikowanym} hint={`z ${h.prospekty} znalezionych`}
                    icon={MailCheck} />
                <Kpi label="Do zatwierdzenia" value={doZatwierdzenia} hint="Outbox Harveya · czytaj maile →"
                    icon={Mail} tone={doZatwierdzenia > 0 ? 'warn' : 'default'} href="/lab/centrum/pliki" />
                <Kpi label="Wysłane" value={wyslane} icon={Send} />
                <Kpi label="Odpowiedzi" value={h.rozmowy} icon={Sparkles}
                    tone={h.rozmowy > 0 ? 'good' : 'default'} />
            </div>

            {/* ── Lejek + rozgrzewka ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <Card title="Lejek sprzedaży" icon={Activity} className="lg:col-span-2">
                    <Funnel steps={funnel} />
                </Card>
                <Card title="Rozgrzewka skrzynki" icon={Flame}>
                    {warmLeft > 0 ? (
                        <>
                            <p className="font-heading text-5xl font-bold tabular-nums text-yellow-400"><CountUp value={warmLeft} /></p>
                            <p className="mt-1 text-sm text-zinc-400">
                                {warmLeft === 1 ? 'dzień' : 'dni'} do pierwszych zimnych maili
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="flex items-center gap-2 text-lg font-bold text-emerald-300">
                                <CheckCircle2 size={20} strokeWidth={1.8} /> Skrzynka gotowa
                            </p>
                            <p className="mt-1 text-sm text-zinc-400">Limit rośnie do {warm.max_daily} maili dziennie.</p>
                        </>
                    )}
                    <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="lab-bar h-full rounded-full bg-yellow-400 shadow-[0_0_16px_-2px_rgba(255,214,10,0.7)]" style={{ width: `${warmPct}%` }} />
                    </div>
                    <p className="mt-2 text-[11px] text-zinc-500">
                        Start {warm.start_date ?? 'brak'} · {warm.min_days} dni bez zimnych maili
                    </p>
                </Card>
            </div>

            {/* ── Wykresy ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <Card title="Firmy wg branży" icon={Building2}>
                    <Bars rows={h.per_branza} empty="Brak firm w bazie." />
                </Card>
                <Card title="Najczęstsze błędy na stronach" icon={AlertTriangle}>
                    <Bars rows={a?.problemy.slice(0, 8) ?? []} color="bg-red-400/80"
                        empty="Audyt jeszcze się nie odbył." />
                    {a && (
                        <p className="mt-4 text-[11px] text-zinc-500">
                            {a.sprawdzone} stron sprawdzonych · {a.bez_problemow} bez uwag · {a.data}
                        </p>
                    )}
                </Card>
                <Card title="Wysłane maile dziennie" icon={Send}>
                    <Spark rows={h.wyslane_per_dzien}
                        empty={warmLeft > 0 ? `Wysyłka ruszy za ${warmLeft} dni.` : 'Jeszcze nic nie wysłano.'} />
                </Card>
            </div>

            {/* ── Leady ── */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
                <Card title="Najsłabsze strony: dzwoń lub pisz" icon={Globe}
                    action={<Link href="/lab/centrum/pliki?p=raporty%2Faudyt-stron.csv" className={MORE}>Cały ranking <ArrowRight size={14} /></Link>}>
                    {a && a.najslabsze.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                            {a.najslabsze.map((s) => (
                                <li key={s.strona} className={`flex gap-3 ${ROW}`}>
                                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold tabular-nums ${
                                        s.punkty >= 10 ? 'bg-red-400/15 text-red-300' : 'bg-yellow-400/15 text-yellow-300'}`}
                                    >
                                        {s.punkty}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white">{s.nazwa}</p>
                                        <a href={s.strona} target="_blank" rel="noopener noreferrer"
                                            className="break-all text-[11px] text-zinc-500 hover:text-yellow-400">
                                            {s.strona}
                                        </a>
                                        <p className="mt-0.5 text-[11px] text-zinc-400">{s.problemy.join(' · ')}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-zinc-500">Brak danych z audytu.</p>}
                </Card>

                <Card title={`Firmy bez strony z telefonem · ${h.bez_strony_z_tel}`} icon={Phone}
                    action={<Link href="/lab/centrum/pliki?p=raporty%2Ffirmy-bez-strony.csv" className={MORE}>Pełna lista <ArrowRight size={14} /></Link>}>
                    {d.bez_strony_top.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                            {d.bez_strony_top.map((f) => (
                                <li key={f.nazwa + f.telefon} className={`flex items-center justify-between gap-3 ${ROW}`}>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white">{f.nazwa}</p>
                                        <p className="text-[11px] text-zinc-500">{f.branza}</p>
                                    </div>
                                    <a href={telHref(f.telefon)}
                                        className="lab-pill inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-medium tabular-nums text-zinc-100">
                                        <Phone size={13} strokeWidth={1.8} className="text-yellow-400" /> {f.telefon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-zinc-500">Brak firm bez strony z numerem telefonu.</p>}
                </Card>
            </div>

            {/* ── CEIDG + nocna zmiana + blog ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <Card title={`Nowe firmy z CEIDG · ${d.ceidg.ile}`} icon={Sparkles}>
                    {d.ceidg.firmy.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                            {d.ceidg.firmy.map((f) => (
                                <li key={f.nazwa + f.adres} className={`text-sm ${ROW}`}>
                                    <p className="truncate font-semibold text-white">{f.nazwa}</p>
                                    <p className="truncate text-[11px] text-zinc-500">
                                        {f.adres}{f.telefon && ` · ${f.telefon}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-zinc-400">
                            Czeka na token CEIDG. Po wklejeniu do <code className="rounded bg-white/[0.06] px-1.5 text-yellow-300">lead-generator/.env</code> nowe firmy
                            pojawią się tu po najbliższej nocy.
                        </p>
                    )}
                </Card>

                <Card title="Raport nocnej zmiany" icon={Moon}>
                    {rano.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                            {rano.map((l) => (
                                <li key={l} className="flex gap-2.5 text-xs text-zinc-300">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                                    <span className="min-w-0 break-words">{l.slice(2)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-zinc-500">Nocna zmiana jeszcze nie działała.</p>}
                    <div className="mt-4 flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                            <Clock size={12} /> Codziennie o 2:30
                        </p>
                        {d.nocna.ostatnia && (
                            <Link href={`/lab/centrum/pliki?p=raporty%2Flog-${d.nocna.ostatnia}.txt`} className={MORE}>
                                Pełny log <ArrowRight size={14} />
                            </Link>
                        )}
                    </div>
                </Card>

                <Card title={`Szkice bloga · ${d.blog.length}`} icon={FileText}
                    action={<Link href="/lab/calendar" className={MORE}>Kalendarz <ArrowRight size={14} /></Link>}>
                    {d.blog.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                            {d.blog.map((b) => (
                                <li key={b.slug} className={ROW}>
                                    <Link href={`/lab/centrum/pliki?p=drafty-bloga%2F${b.slug}.mdx`}
                                        className="text-sm font-semibold leading-snug text-white hover:text-yellow-400">
                                        {b.tytul}
                                    </Link>
                                    <p className="mt-0.5 text-[11px] text-zinc-500">
                                        {b.data} · drafty-bloga/{b.slug}.mdx
                                        {b.posty && (
                                            <Link href={`/lab/centrum/pliki?p=raporty%2Fposty-${b.slug}.md`} className="text-emerald-300 hover:underline">
                                                {' '}· 3 posty gotowe
                                            </Link>
                                        )}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-zinc-500">Brak szkiców.</p>}
                </Card>
            </div>
        </div>
    )
}
