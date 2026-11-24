import {
    Activity, AlertTriangle, Check, CheckCircle2, Clock, Eye, History, Inbox, ListTodo, MousePointerClick, RefreshCw,
    RotateCcw, SearchCheck, Sparkles, X,
} from 'lucide-react'
import { PageHeader, SectionTitle, StatCard } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Alarm, PageStat } from '@/lib/lab/seo-radca/rules'
import { acceptChange, doneProposal, rejectChange, revertChange, runNow } from './actions'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // „Sprawdź teraz” odpala cały przegląd

const card = 'lab-card p-5 sm:p-6'
const ROW = 'rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]'
const btn = 'rounded-full px-3.5 py-1.5 text-xs font-semibold transition'
const fmtDate = (s?: string | null) => s ? new Date(s).toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'short' }) : ''
const fmtTime = (s: string) => new Date(s).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const ctr = (s?: PageStat | null) => s ? `${(s.ctr * 100).toFixed(1)}%` : '–'

type Meta = { title?: string; description?: string }
type Plan = { typ?: string; tytul?: string; plan?: string[] }
type Change = {
    id: string; created_at: string; path: string; kind: 'meta' | 'propozycja'; status: string; auto: boolean; query: string | null
    reason: string; before: Meta; after: Meta & Plan; metrics_before: PageStat | null; metrics_after: PageStat | null
    applied_at: string | null; evaluate_after: string | null; decided_at: string | null
}
type Run = { created_at: string; alarms: Alarm[]; stats: { week?: { clicks: number; impressions: number }; prevWeek?: { clicks: number; impressions: number }; pages?: number; topPages?: PageStat[] }; actions: string[]; error: string | null }

const STATUS: Record<string, string> = {
    aktywna: 'działa, w ocenie', utrzymana: 'sprawdziła się', cofnieta: 'cofnięta', odrzucona: 'odrzucona',
    zastapiona: 'zastąpiona', zaakceptowana: 'do zrobienia', zrobiona: 'zrobiona', do_akceptacji: 'czeka',
}

function MetaDiff({ before, after }: { before: Meta; after: Meta }) {
    return (
        <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
            <div className="rounded-2xl bg-white/[0.03] p-3"><p className="mb-1 text-[10px] uppercase tracking-wide text-zinc-500">Teraz</p><p className="font-semibold text-zinc-300">{before.title ?? '–'}</p><p className="mt-1 text-zinc-500">{before.description ?? '–'}</p></div>
            <div className="rounded-2xl bg-yellow-400/[0.06] p-3"><p className="mb-1 text-[10px] uppercase tracking-wide text-yellow-400/80">Nowe</p><p className="font-semibold text-white">{after.title}</p><p className="mt-1 text-zinc-300">{after.description}</p></div>
        </div>
    )
}

export default async function SeoPage() {
    // Logowanie sprawdza layout /lab. Tabele są zamknięte RLS, czytamy kluczem serwisowym tylko na serwerze.
    const db = createAdminClient()
    const [{ data: runs, error: runErr }, { data: changes }] = await Promise.all([
        db.from('seo_runs').select('*').order('created_at', { ascending: false }).limit(7),
        db.from('seo_changes').select('*').order('created_at', { ascending: false }).limit(100),
    ])
    const last = (runs?.[0] ?? null) as Run | null
    const all = (changes ?? []) as Change[]
    const waiting = all.filter((c) => c.status === 'do_akceptacji')
    const todo = all.filter((c) => c.status === 'zaakceptowana')
    const live = all.filter((c) => c.kind === 'meta' && (c.status === 'aktywna' || c.status === 'utrzymana'))
    const history = all.filter((c) => !['do_akceptacji', 'zaakceptowana', 'aktywna', 'utrzymana'].includes(c.status)).slice(0, 15)
    const alarms = last?.alarms ?? []
    const w = last?.stats.week
    const pw = last?.stats.prevWeek

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <PageHeader
                icon={SearchCheck}
                title="SEO-radca"
                subtitle="Codziennie o 7:30 sprawdza wuyo.pl i Search Console. Tytuły zwykłych stron i wpisów zmienia sam (najwyżej 1 na tydzień, po 28 dniach ocenia i cofa, jeśli gorzej). Strony sprzedażowe i większe zmiany czekają tu na Ciebie."
                actions={
                    <form action={runNow}>
                        <button className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black hover:bg-yellow-300">
                            <RefreshCw size={16} strokeWidth={1.8} /> Sprawdź teraz
                        </button>
                    </form>
                }
            />

            {runErr && (
                <div className={`${card} flex items-center gap-3 border-red-400/30 text-sm text-red-300`}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-400/15"><AlertTriangle size={18} strokeWidth={1.8} /></span>
                    Brak tabel radcy. Uruchom migrację supabase/migrations/010_seo_radca.sql.
                </div>
            )}

            <div className="lab-stagger grid gap-4 md:grid-cols-3">
                <StatCard
                    icon={Clock}
                    label="Ostatni przegląd"
                    value={<span className="text-xl">{last ? fmtTime(last.created_at) : 'jeszcze nie było'}</span>}
                    hint={last ? `${last.stats.pages ?? 0} stron sprawdzonych` : undefined}
                />
                <StatCard
                    icon={MousePointerClick}
                    label="Kliknięcia z Google (7 dni)"
                    value={typeof w?.clicks === 'number' ? <CountUp value={w.clicks} /> : '–'}
                    hint={`tydzień wcześniej ${pw?.clicks ?? '–'}`}
                    hot={!!w && !!pw && w.clicks > pw.clicks}
                />
                <StatCard
                    icon={Eye}
                    label="Wyświetlenia w Google (7 dni)"
                    value={typeof w?.impressions === 'number' ? <CountUp value={w.impressions} /> : '–'}
                    hint={`tydzień wcześniej ${pw?.impressions ?? '–'}`}
                    hot={!!w && !!pw && w.impressions > pw.impressions}
                />
            </div>

            <div className={card}>
                <SectionTitle icon={Activity} title="Stan strony" />
                {!last ? <p className="text-sm text-zinc-500">Kliknij „Sprawdź teraz” albo poczekaj do rana.</p>
                    : alarms.length === 0 ? (
                        <p className="flex items-center gap-3 rounded-2xl bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-300"><CheckCircle2 size={18} strokeWidth={1.8} /> Wszystko działa.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {alarms.map((a) => (
                                <li key={a.key} className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${a.level === 'alarm' ? 'bg-red-400/10 text-red-300' : 'bg-yellow-400/10 text-yellow-200'}`}>
                                    <AlertTriangle size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" />{a.text}
                                </li>
                            ))}
                        </ul>
                    )}
                {last?.actions?.length ? (
                    <div className="mt-4 border-t border-white/[0.06] pt-4">
                        <p className="mb-2 text-xs font-medium text-zinc-400">Co zrobił w ostatnim przeglądzie</p>
                        <ul className="flex flex-col gap-1.5 text-xs text-zinc-300">
                            {last.actions.map((a) => (
                                <li key={a} className="flex gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />{a}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>

            <div className={card}>
                <SectionTitle
                    icon={Inbox}
                    title="Czeka na Ciebie"
                    action={<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${waiting.length ? 'bg-yellow-400/15 text-yellow-300' : 'bg-white/[0.06] text-zinc-300'}`}>{waiting.length}</span>}
                />
                {waiting.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.02] px-4 py-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-500"><CheckCircle2 size={18} strokeWidth={1.8} /></span>
                        <p className="text-sm text-zinc-500">Nic nie czeka. Radca da znać, gdy coś znajdzie.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {waiting.map((c) => (
                            <div key={c.id} className="rounded-2xl bg-white/[0.03] p-4 transition hover:bg-white/[0.05]">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-white">
                                        {c.kind === 'meta' ? 'Nowy tytuł i opis' : c.after.typ === 'nowy_wpis' ? 'Nowy wpis na blog' : 'Rozbudowa strony'} · <a href={c.path} target="_blank" className="text-yellow-400 hover:underline">{c.path}</a>
                                    </p>
                                    <div className="flex gap-2">
                                        <form action={acceptChange.bind(null, c.id)}><button className={`${btn} inline-flex items-center gap-1.5 bg-emerald-400 text-black hover:bg-emerald-300`}><Check size={14} strokeWidth={1.8} /> Akceptuję</button></form>
                                        <form action={rejectChange.bind(null, c.id)}><button className={`${btn} inline-flex items-center gap-1.5 bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]`}><X size={14} strokeWidth={1.8} /> Odrzuć</button></form>
                                    </div>
                                </div>
                                {c.query && <p className="mt-1 text-xs text-zinc-500">Fraza: „{c.query}” · pozycja {c.metrics_before?.position.toFixed(1)} · {c.metrics_before?.impressions} wyświetleń · CTR {ctr(c.metrics_before)}</p>}
                                {c.reason && <p className="mt-2 text-xs text-zinc-300">{c.reason}</p>}
                                {c.kind === 'meta' ? <MetaDiff before={c.before} after={c.after} /> : (
                                    <div className="mt-3 rounded-2xl bg-yellow-400/[0.06] p-3 text-xs">
                                        <p className="font-semibold text-white">{c.after.tytul}</p>
                                        <ul className="mt-1 list-disc pl-5 text-zinc-300">{c.after.plan?.map((p) => <li key={p}>{p}</li>)}</ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {todo.length > 0 && (
                <div className={card}>
                    <SectionTitle icon={ListTodo} title={`Do zrobienia (${todo.length})`} />
                    <p className="-mt-2 mb-4 text-xs text-zinc-500">Zaakceptowane propozycje. Nowe wpisy nocna zmiana bierze w pierwszej kolejności do szkicu bloga. Rozbudowę strony zrób sam albo poproś Claude w terminalu.</p>
                    <ul className="flex flex-col gap-2">
                        {todo.map((c) => (
                            <li key={c.id} className={`flex flex-wrap items-center justify-between gap-2 text-sm ${ROW}`}>
                                <span className="text-zinc-300"><b className="text-white">{c.after.tytul}</b> · {c.path} · „{c.query}”</span>
                                <form action={doneProposal.bind(null, c.id)}><button className={`${btn} inline-flex items-center gap-1.5 bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]`}><Check size={14} strokeWidth={1.8} /> Zrobione</button></form>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={card}>
                <SectionTitle
                    icon={Sparkles}
                    title="Zmiany działające na stronie"
                    action={<span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">{live.length}</span>}
                />
                {live.length === 0 ? <p className="text-sm text-zinc-500">Strona ma tytuły z kodu.</p> : (
                    <ul className="flex flex-col gap-2">
                        {live.map((c) => (
                            <li key={c.id} className={`flex flex-wrap items-start justify-between gap-2 ${ROW}`}>
                                <div className="min-w-0 text-xs">
                                    <p className="text-sm text-white"><a href={c.path} target="_blank" className="text-yellow-400 hover:underline">{c.path}</a> · {c.after.title}</p>
                                    <p className="mt-0.5 text-zinc-500">
                                        {c.auto ? 'zmienił radca' : 'zaakceptowałeś'} {fmtDate(c.applied_at)} · {STATUS[c.status]}
                                        {c.status === 'aktywna' && c.evaluate_after ? ` · ocena ${fmtDate(c.evaluate_after)}` : ''}
                                        {c.metrics_after ? ` · CTR ${ctr(c.metrics_before)} → ${ctr(c.metrics_after)}` : ` · CTR przed ${ctr(c.metrics_before)}`}
                                    </p>
                                    <p className="mt-0.5 text-zinc-600">było: {c.before.title}</p>
                                </div>
                                <form action={revertChange.bind(null, c.id)}><button className={`${btn} inline-flex items-center gap-1.5 bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]`}><RotateCcw size={14} strokeWidth={1.8} /> Cofnij</button></form>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {history.length > 0 && (
                <div className={card}>
                    <SectionTitle icon={History} title="Historia" />
                    <ul className="flex flex-col gap-1.5 text-xs text-zinc-400">
                        {history.map((c) => (
                            <li key={c.id} className="rounded-xl px-3 py-2 transition hover:bg-white/[0.04]">{fmtDate(c.decided_at ?? c.created_at)} · {c.path} · {c.kind === 'meta' ? c.after.title : c.after.tytul} · <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-zinc-300">{STATUS[c.status] ?? c.status}</span></li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
