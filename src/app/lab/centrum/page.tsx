import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    Activity, AlertTriangle, Building2, CheckCircle2, Clock, FileText, Flame, Globe,
    Mail, MailCheck, Moon, Phone, Send, Sparkles, WifiOff,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AutoRefresh } from './AutoRefresh'
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

function Card({ title, icon, children, className = '' }: {
    title: string
    icon?: React.ReactNode
    children: React.ReactNode
    className?: string
}) {
    return (
        <section className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 min-w-0 ${className}`}>
            <h2 className="flex items-center gap-2 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">
                {icon}
                {title}
            </h2>
            {children}
        </section>
    )
}

function Kpi({ label, value, hint, icon, tone = 'default' }: {
    label: string
    value: number | string
    hint?: string
    icon: React.ReactNode
    tone?: 'default' | 'good' | 'warn' | 'bad'
}) {
    const toneCls = {
        default: 'text-white',
        good: 'text-emerald-400',
        warn: 'text-yellow-400',
        bad: 'text-red-400',
    }[tone]
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-w-0">
            <div className="flex items-center gap-2 text-zinc-500 text-[11px] mb-2">
                {icon}
                <span className="truncate">{label}</span>
            </div>
            <p className={`text-3xl font-bold tabular-nums leading-none ${toneCls}`}>{value}</p>
            {hint && <p className="text-[11px] text-zinc-500 mt-2">{hint}</p>}
        </div>
    )
}

function Bars({ rows, color = 'bg-yellow-400', empty }: {
    rows: Pair[]
    color?: string
    empty: string
}) {
    if (rows.length === 0) return <p className="text-sm text-zinc-600">{empty}</p>
    const max = Math.max(...rows.map(([, v]) => v), 1)
    return (
        <ul className="flex flex-col gap-2.5">
            {rows.map(([label, value]) => (
                <li key={label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 items-center">
                    <span className="text-xs text-zinc-300 truncate">{label}</span>
                    <span className="text-xs text-zinc-400 tabular-nums">{value}</span>
                    <span className="col-span-2 h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <span
                            className={`block h-full rounded-full ${color}`}
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
        <ol className="flex flex-col gap-2">
            {steps.map((s, i) => {
                const prev = i > 0 ? steps[i - 1].value : null
                const conv = prev ? Math.round((s.value / prev) * 100) : null
                return (
                    <li key={s.label} className="flex items-center gap-3">
                        <span className="w-6 text-[10px] text-zinc-600 tabular-nums">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs mb-1 gap-2">
                                <span className="text-zinc-300 truncate">{s.label}</span>
                                <span className="text-zinc-400 tabular-nums shrink-0">
                                    {s.value}
                                    {conv !== null && <span className="text-zinc-600"> · {conv}%</span>}
                                </span>
                            </div>
                            <div className="h-6 rounded-md bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full rounded-md bg-gradient-to-r from-yellow-500 to-yellow-300"
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
    if (rows.length === 0) return <p className="text-sm text-zinc-600">{empty}</p>
    const max = Math.max(...rows.map(([, v]) => v), 1)
    return (
        <div>
            <div className="flex items-end gap-1 h-24">
                {rows.map(([d, v]) => (
                    <div key={d} className="flex-1 flex flex-col justify-end h-full" title={`${d}: ${v}`}>
                        <div className="bg-yellow-400/80 rounded-t" style={{ height: `${(v / max) * 100}%` }} />
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                <span>{rows[0][0]}</span>
                <span>{rows[rows.length - 1][0]}</span>
            </div>
        </div>
    )
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border ${
            ok ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                : 'border-red-500/30 text-red-400 bg-red-500/5'}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {label}
        </span>
    )
}

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
            <div className="max-w-3xl">
                <h1 className="text-2xl font-bold text-white">Centrum Dowodzenia</h1>
                <p className="text-zinc-500 mt-2 text-sm">
                    Brak danych. Uruchom na komputerze studia: <code>python -I sync_centrum.py</code>
                </p>
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
        <div className="flex flex-col gap-6 max-w-7xl">
            <AutoRefresh seconds={300} />

            {/* ── Nagłówek ── */}
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500/80 mb-2">
                        Komputer studia · na żywo
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Centrum Dowodzenia</h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Ostatnia synchronizacja: {agoLabel(syncMin)}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <StatusPill ok={online} label={online ? 'Komputer online' : 'Brak sygnału z komputera'} />
                    <StatusPill ok={harveyOk} label={harveyOk ? 'Harvey pracuje' : 'Harvey wyłączony'} />
                    <StatusPill
                        ok={d.nocna.ostatnia !== null}
                        label={`Nocna zmiana: ${d.nocna.ostatnia ?? 'jeszcze nie było'}`}
                    />
                </div>
            </header>

            {!online && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                    <WifiOff size={18} className="shrink-0 mt-0.5" />
                    Dane mają ponad 45 minut. Komputer jest wyłączony, uśpiony albo nie działa synchronizacja.
                </div>
            )}

            {/* ── KPI ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                <Kpi label="Firmy w bazie" value={h.firmy} icon={<Building2 size={14} />} />
                <Kpi label="Bez strony" value={h.bez_strony} hint={`${h.bez_strony_z_tel} z telefonem`}
                    icon={<Globe size={14} />} tone="warn" />
                <Kpi label="Strona nie działa" value={a?.nie_dziala ?? 0} hint="gotowy temat rozmowy"
                    icon={<AlertTriangle size={14} />} tone="bad" />
                <Kpi label="Adresy zweryfikowane" value={h.z_mailem_zweryfikowanym} hint={`z ${h.prospekty} znalezionych`}
                    icon={<MailCheck size={14} />} />
                <Kpi label="Do zatwierdzenia" value={doZatwierdzenia} hint="Outbox Harveya"
                    icon={<Mail size={14} />} tone={doZatwierdzenia > 0 ? 'warn' : 'default'} />
                <Kpi label="Wysłane" value={wyslane} icon={<Send size={14} />} />
                <Kpi label="Odpowiedzi" value={h.rozmowy} icon={<Sparkles size={14} />}
                    tone={h.rozmowy > 0 ? 'good' : 'default'} />
            </div>

            {/* ── Lejek + rozgrzewka ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title="Lejek sprzedaży" icon={<Activity size={12} />} className="lg:col-span-2">
                    <Funnel steps={funnel} />
                </Card>
                <Card title="Rozgrzewka skrzynki" icon={<Flame size={12} />}>
                    {warmLeft > 0 ? (
                        <>
                            <p className="text-4xl font-bold text-yellow-400 tabular-nums">{warmLeft}</p>
                            <p className="text-sm text-zinc-400 mt-1">
                                {warmLeft === 1 ? 'dzień' : 'dni'} do pierwszych zimnych maili
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="flex items-center gap-2 text-lg font-bold text-emerald-400">
                                <CheckCircle2 size={20} /> Skrzynka gotowa
                            </p>
                            <p className="text-sm text-zinc-400 mt-1">Limit rośnie do {warm.max_daily} maili dziennie.</p>
                        </>
                    )}
                    <div className="h-2 rounded-full bg-zinc-800 mt-4 overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${warmPct}%` }} />
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-2">
                        Start {warm.start_date ?? '—'} · {warm.min_days} dni bez zimnych maili
                    </p>
                </Card>
            </div>

            {/* ── Wykresy ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title="Firmy wg branży" icon={<Building2 size={12} />}>
                    <Bars rows={h.per_branza} empty="Brak firm w bazie." />
                </Card>
                <Card title="Najczęstsze błędy na stronach" icon={<AlertTriangle size={12} />}>
                    <Bars rows={a?.problemy.slice(0, 8) ?? []} color="bg-red-400/80"
                        empty="Audyt jeszcze się nie odbył." />
                    {a && (
                        <p className="text-[11px] text-zinc-600 mt-3">
                            {a.sprawdzone} stron sprawdzonych · {a.bez_problemow} bez uwag · {a.data}
                        </p>
                    )}
                </Card>
                <Card title="Wysłane maile dziennie" icon={<Send size={12} />}>
                    <Spark rows={h.wyslane_per_dzien}
                        empty={warmLeft > 0 ? `Wysyłka ruszy za ${warmLeft} dni.` : 'Jeszcze nic nie wysłano.'} />
                </Card>
            </div>

            {/* ── Leady ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card title="Najsłabsze strony — dzwoń lub pisz" icon={<Globe size={12} />}>
                    {a && a.najslabsze.length > 0 ? (
                        <ul className="divide-y divide-zinc-800">
                            {a.najslabsze.map((s) => (
                                <li key={s.strona} className="py-2.5 flex gap-3">
                                    <span className={`shrink-0 w-8 h-8 rounded-md grid place-items-center text-xs font-bold tabular-nums ${
                                        s.punkty >= 10 ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}
                                    >
                                        {s.punkty}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm text-white truncate">{s.nazwa}</p>
                                        <a href={s.strona} target="_blank" rel="noopener noreferrer"
                                            className="text-[11px] text-zinc-500 hover:text-yellow-400 break-all">
                                            {s.strona}
                                        </a>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">{s.problemy.join(' · ')}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-zinc-600">Brak danych z audytu.</p>}
                </Card>

                <Card title={`Firmy bez strony z telefonem · ${h.bez_strony_z_tel}`} icon={<Phone size={12} />}>
                    {d.bez_strony_top.length > 0 ? (
                        <ul className="divide-y divide-zinc-800">
                            {d.bez_strony_top.map((f) => (
                                <li key={f.nazwa + f.telefon} className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm text-white truncate">{f.nazwa}</p>
                                        <p className="text-[11px] text-zinc-500">{f.branza}</p>
                                    </div>
                                    <a href={telHref(f.telefon)}
                                        className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-zinc-700 hover:border-yellow-400/50 px-2.5 py-1.5 text-xs text-zinc-200 tabular-nums">
                                        <Phone size={12} /> {f.telefon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-zinc-600">Brak firm bez strony z numerem telefonu.</p>}
                    <p className="text-[11px] text-zinc-600 mt-3">Pełna lista: raporty/firmy-bez-strony.csv</p>
                </Card>
            </div>

            {/* ── CEIDG + nocna zmiana + blog ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title={`Nowe firmy z CEIDG · ${d.ceidg.ile}`} icon={<Sparkles size={12} />}>
                    {d.ceidg.firmy.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                            {d.ceidg.firmy.map((f) => (
                                <li key={f.nazwa + f.adres} className="text-sm">
                                    <p className="text-white truncate">{f.nazwa}</p>
                                    <p className="text-[11px] text-zinc-500 truncate">
                                        {f.adres}{f.telefon && ` · ${f.telefon}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-zinc-500">
                            Czeka na token CEIDG. Po wklejeniu do <code>lead-generator/.env</code> nowe firmy
                            pojawią się tu po najbliższej nocy.
                        </p>
                    )}
                </Card>

                <Card title="Raport nocnej zmiany" icon={<Moon size={12} />}>
                    {rano.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                            {rano.map((l) => (
                                <li key={l} className="flex gap-2 text-xs text-zinc-300">
                                    <span className="text-yellow-400">•</span>
                                    <span className="break-words min-w-0">{l.slice(2)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-zinc-600">Nocna zmiana jeszcze nie działała.</p>}
                    <p className="flex items-center gap-1.5 text-[11px] text-zinc-600 mt-3">
                        <Clock size={11} /> Codziennie o 2:30
                    </p>
                </Card>

                <Card title={`Szkice bloga · ${d.blog.length}`} icon={<FileText size={12} />}>
                    {d.blog.length > 0 ? (
                        <ul className="flex flex-col gap-3">
                            {d.blog.map((b) => (
                                <li key={b.slug}>
                                    <p className="text-sm text-white leading-snug">{b.tytul}</p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">
                                        {b.data} · drafty-bloga/{b.slug}.mdx
                                        {b.posty && <span className="text-emerald-400"> · 3 posty gotowe</span>}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-zinc-600">Brak szkiców.</p>}
                    <Link href="/lab/calendar" className="inline-block text-[11px] text-yellow-400/80 hover:text-yellow-400 mt-3">
                        Kalendarz postów →
                    </Link>
                </Card>
            </div>
        </div>
    )
}
