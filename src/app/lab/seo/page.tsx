import { AlertTriangle, CheckCircle2, RotateCcw, Search } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Alarm, PageStat } from '@/lib/lab/seo-radca/rules'
import { acceptChange, doneProposal, rejectChange, revertChange, runNow } from './actions'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // „Sprawdź teraz” odpala cały przegląd

const card = 'rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5'
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
        <div className="mx-auto flex max-w-5xl flex-col gap-5 p-4 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Search size={22} className="text-yellow-400" /> SEO-radca</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Codziennie o 7:30 sprawdza wuyo.pl i Search Console. Tytuły zwykłych stron i wpisów zmienia sam (najwyżej 1 na tydzień, po 28 dniach ocenia i cofa, jeśli gorzej). Strony sprzedażowe i większe zmiany czekają tu na Ciebie.
                    </p>
                </div>
                <form action={runNow}><button className={`${btn} bg-yellow-400 text-black hover:bg-yellow-300`}>Sprawdź teraz</button></form>
            </div>

            {runErr && <div className={`${card} text-sm text-red-300`}>Brak tabel radcy. Uruchom migrację supabase/migrations/010_seo_radca.sql.</div>}

            <div className="grid gap-4 md:grid-cols-3">
                <div className={card}>
                    <p className="text-xs text-zinc-400">Ostatni przegląd</p>
                    <p className="mt-2 text-xl font-bold text-white">{last ? fmtTime(last.created_at) : 'jeszcze nie było'}</p>
                    {last && <p className="mt-1 text-[11px] text-zinc-500">{last.stats.pages ?? 0} stron sprawdzonych</p>}
                </div>
                <div className={card}>
                    <p className="text-xs text-zinc-400">Kliknięcia z Google (7 dni)</p>
                    <p className="mt-2 text-xl font-bold text-white">{w?.clicks ?? '–'} <span className="text-xs font-normal text-zinc-500">tydzień wcześniej {pw?.clicks ?? '–'}</span></p>
                </div>
                <div className={card}>
                    <p className="text-xs text-zinc-400">Wyświetlenia w Google (7 dni)</p>
                    <p className="mt-2 text-xl font-bold text-white">{w?.impressions ?? '–'} <span className="text-xs font-normal text-zinc-500">tydzień wcześniej {pw?.impressions ?? '–'}</span></p>
                </div>
            </div>

            <div className={card}>
                <p className="mb-3 text-sm font-semibold text-white">Stan strony</p>
                {!last ? <p className="text-xs text-zinc-500">Kliknij „Sprawdź teraz” albo poczekaj do rana.</p>
                    : alarms.length === 0 ? <p className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle2 size={16} /> Wszystko działa.</p>
                        : (
                            <ul className="flex flex-col gap-1.5">
                                {alarms.map((a) => (
                                    <li key={a.key} className={`flex items-start gap-2 text-sm ${a.level === 'alarm' ? 'text-red-300' : 'text-amber-200'}`}>
                                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />{a.text}
                                    </li>
                                ))}
                            </ul>
                        )}
                {last?.actions?.length ? (
                    <div className="mt-4 border-t border-white/[0.06] pt-3">
                        <p className="mb-1 text-xs text-zinc-400">Co zrobił w ostatnim przeglądzie</p>
                        <ul className="list-disc pl-5 text-xs text-zinc-300">{last.actions.map((a) => <li key={a}>{a}</li>)}</ul>
                    </div>
                ) : null}
            </div>

            <div className={card}>
                <p className="mb-3 text-sm font-semibold text-white">Czeka na Ciebie ({waiting.length})</p>
                {waiting.length === 0 ? <p className="text-xs text-zinc-500">Nic.</p> : (
                    <div className="flex flex-col gap-4">
                        {waiting.map((c) => (
                            <div key={c.id} className="rounded-2xl border border-white/[0.06] p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-white">
                                        {c.kind === 'meta' ? 'Nowy tytuł i opis' : c.after.typ === 'nowy_wpis' ? 'Nowy wpis na blog' : 'Rozbudowa strony'} · <a href={c.path} target="_blank" className="text-yellow-400 hover:underline">{c.path}</a>
                                    </p>
                                    <div className="flex gap-2">
                                        <form action={acceptChange.bind(null, c.id)}><button className={`${btn} bg-emerald-500/90 text-black hover:bg-emerald-400`}>Akceptuję</button></form>
                                        <form action={rejectChange.bind(null, c.id)}><button className={`${btn} bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]`}>Odrzuć</button></form>
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
                    <p className="mb-1 text-sm font-semibold text-white">Do zrobienia ({todo.length})</p>
                    <p className="mb-3 text-xs text-zinc-500">Zaakceptowane propozycje. Nowe wpisy nocna zmiana bierze w pierwszej kolejności do szkicu bloga. Rozbudowę strony zrób sam albo poproś Claude w terminalu.</p>
                    <ul className="flex flex-col gap-2">
                        {todo.map((c) => (
                            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                <span className="text-zinc-300"><b className="text-white">{c.after.tytul}</b> · {c.path} · „{c.query}”</span>
                                <form action={doneProposal.bind(null, c.id)}><button className={`${btn} bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]`}>Zrobione</button></form>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={card}>
                <p className="mb-3 text-sm font-semibold text-white">Zmiany działające na stronie ({live.length})</p>
                {live.length === 0 ? <p className="text-xs text-zinc-500">Strona ma tytuły z kodu.</p> : (
                    <ul className="flex flex-col gap-3">
                        {live.map((c) => (
                            <li key={c.id} className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                                <div className="min-w-0 text-xs">
                                    <p className="text-sm text-white"><a href={c.path} target="_blank" className="text-yellow-400 hover:underline">{c.path}</a> · {c.after.title}</p>
                                    <p className="mt-0.5 text-zinc-500">
                                        {c.auto ? 'zmienił radca' : 'zaakceptowałeś'} {fmtDate(c.applied_at)} · {STATUS[c.status]}
                                        {c.status === 'aktywna' && c.evaluate_after ? ` · ocena ${fmtDate(c.evaluate_after)}` : ''}
                                        {c.metrics_after ? ` · CTR ${ctr(c.metrics_before)} → ${ctr(c.metrics_after)}` : ` · CTR przed ${ctr(c.metrics_before)}`}
                                    </p>
                                    <p className="mt-0.5 text-zinc-600">było: {c.before.title}</p>
                                </div>
                                <form action={revertChange.bind(null, c.id)}><button className={`${btn} inline-flex items-center gap-1 bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]`}><RotateCcw size={12} /> Cofnij</button></form>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {history.length > 0 && (
                <div className={card}>
                    <p className="mb-3 text-sm font-semibold text-white">Historia</p>
                    <ul className="flex flex-col gap-1 text-xs text-zinc-400">
                        {history.map((c) => (
                            <li key={c.id}>{fmtDate(c.decided_at ?? c.created_at)} · {c.path} · {c.kind === 'meta' ? c.after.title : c.after.tytul} · <span className="text-zinc-300">{STATUS[c.status] ?? c.status}</span></li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
