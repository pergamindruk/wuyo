import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Archive, Building2, ChevronDown, Globe, Inbox, Mail, MapPinned } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatCard } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'
import { AutoRefresh } from '../centrum/AutoRefresh'
import { DecisionButtons } from './DecisionButtons'
import { FirmScript } from './FirmScript'
import type { Decision } from './actions'

export const dynamic = 'force-dynamic'

type OutboxRow = {
    id: string
    firma: string
    do_email: string
    temat: string
    tresc: string
    krok: number
    zaplanowano: string | null
    wyslano: string | null
    status: string
    decyzja: Decision | null
    zastosowano_at: string | null
    blad: string | null
}

const STATUS: Record<string, string> = {
    pending_review: 'Do decyzji',
    approved: 'Zatwierdzony',
    sending: 'Wysyła się',
    sent: 'Wysłany',
    rejected: 'Odrzucony',
    cancelled: 'Anulowany',
    failed: 'Nie wyszedł',
}

// Pigułki statusów (system /lab v2): żółta = czeka, zielona = poszło, czerwona = błąd, szara = reszta.
const STATUS_COLOR: Record<string, string> = {
    pending_review: 'bg-yellow-400/15 text-yellow-300',
    approved: 'bg-emerald-400/15 text-emerald-300',
    sent: 'bg-emerald-400/15 text-emerald-300',
    failed: 'bg-red-400/15 text-red-300',
}

const KROK: Record<number, string> = { 1: 'Mail 1', 2: 'Przypomnienie', 3: 'Ostatni' }

function when(iso: string | null): string {
    if (!iso) return '—'
    return new Intl.DateTimeFormat('pl-PL', {
        timeZone: 'Europe/Warsaw', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
}

function MailRow({ m }: { m: OutboxRow }) {
    const pending = m.status === 'pending_review'
    return (
        <details className="group rounded-2xl bg-white/[0.03] transition hover:bg-white/[0.06] open:bg-white/[0.05]">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3">
                <span className="w-28 shrink-0">
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                        {KROK[m.krok] ?? `Krok ${m.krok}`}
                    </span>
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{m.temat || '(bez tematu)'}</span>
                <span className="text-[11px] text-zinc-500">{when(m.wyslano ?? m.zaplanowano)}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    pending && m.decyzja ? (m.decyzja === 'approve' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.06] text-zinc-300') : (STATUS_COLOR[m.status] ?? 'bg-white/[0.06] text-zinc-300')
                }`}>
                    {pending && m.decyzja ? (m.decyzja === 'approve' ? 'Zatwierdzasz' : 'Odrzucasz') : (STATUS[m.status] ?? m.status)}
                </span>
                <ChevronDown size={16} className="text-zinc-600 transition-transform group-open:rotate-180" />
            </summary>
            <div className="flex flex-col gap-3 px-4 pb-4">
                <p className="whitespace-pre-wrap rounded-2xl bg-black/30 p-4 text-sm leading-relaxed text-zinc-300">{m.tresc}</p>
                {m.krok > 1 && pending && (
                    <p className="text-[11px] text-zinc-500">Wyjdzie tylko wtedy, gdy klient nie odpisze na wcześniejszy mail.</p>
                )}
                {pending && (m.zastosowano_at && m.blad
                    ? <p className="rounded-2xl bg-red-400/10 px-4 py-2.5 text-xs text-red-300">Harvey: {m.blad}</p>
                    : <DecisionButtons id={m.id} current={m.decyzja} />)}
            </div>
        </details>
    )
}

export default async function MailsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const [{ data }, { data: scripts }] = await Promise.all([
        supabase.from('harvey_outbox')
            .select('id, firma, do_email, temat, tresc, krok, zaplanowano, wyslano, status, decyzja, zastosowano_at, blad')
            .order('krok', { ascending: true }),
        supabase.from('ai_generations').select('input_data, output')
            .eq('input_data->>kind', 'scenariusz').order('created_at', { ascending: false }).limit(100),
    ])
    const rows = (data ?? []) as OutboxRow[]
    const scriptByFirm = new Map<string, string>()
    for (const s of scripts ?? []) {
        const firm = (s.input_data as { firm?: string } | null)?.firm
        if (firm && !scriptByFirm.has(firm)) scriptByFirm.set(firm, s.output as string)
    }

    const byFirm = new Map<string, OutboxRow[]>()
    for (const r of rows) {
        const key = r.firma || r.do_email
        byFirm.set(key, [...(byFirm.get(key) ?? []), r])
    }
    const allFirms = [...byFirm.entries()].map(([firm, mails]) => {
        const open = mails.filter((m) => m.status === 'pending_review')
        return { firm, mails: open.length ? open : mails, email: mails[0].do_email, waiting: open.filter((m) => !m.decyzja).length, hasOpen: open.length > 0 }
    }).sort((a, b) => Number(b.hasOpen) - Number(a.hasOpen) || b.waiting - a.waiting)
    // Firmy, w których wszystko odrzucone/anulowane, nie zaśmiecają listy — lądują zwinięte na dole.
    const isDone = (f: (typeof allFirms)[number]) => !f.hasOpen && f.mails.every((m) => m.status === 'rejected' || m.status === 'cancelled')
    const firms = allFirms.filter((f) => !isDone(f))
    const rejected = allFirms.filter(isDone)

    const waiting = firms.reduce((n, f) => n + f.waiting, 0)

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
            <AutoRefresh seconds={120} />
            <PageHeader
                icon={Mail}
                title="Maile Harveya"
                subtitle="Decyzja idzie do Harveya co 30 min. Harvey nie wysyła między 17:00 a 8:00."
            />

            <div className="lab-stagger grid grid-cols-2 gap-4">
                <StatCard icon={Mail} label="Czeka na decyzję" value={<CountUp value={waiting} />} hot={waiting > 0} hint={waiting > 0 ? 'zatwierdź albo odrzuć niżej' : 'nic nie czeka'} />
                <StatCard icon={Building2} label="Firmy w kolejce" value={<CountUp value={firms.length} />} hint={rejected.length ? `${rejected.length} odrzuconych na dole` : undefined} />
            </div>

            {firms.length === 0 && (
                <div className="lab-card flex flex-col items-center gap-3 px-6 py-14 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400"><Inbox size={20} strokeWidth={1.8} /></span>
                    <p className="text-sm text-zinc-400">Harvey nie ma teraz żadnych maili. Dodaj firmy do listy w Szukaj firm.</p>
                    <Link href="/lab/szukaj-firm" className="inline-flex items-center gap-2 bg-yellow-400 px-5 py-2.5 text-sm font-bold text-zinc-950"><MapPinned size={16} strokeWidth={1.8} /> Szukaj firm</Link>
                </div>
            )}

            {firms.map(({ firm, mails, email, waiting: w, hasOpen }) => {
                const domain = email.split('@')[1]
                return (
                    <section key={firm} className={`lab-card p-4 sm:p-5 ${w ? 'border-yellow-400/25' : ''}`}>
                        <header className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                            <h2 className="flex min-w-0 items-center gap-2.5 text-base font-bold text-white">
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${w ? 'bg-yellow-400/10 text-yellow-400' : 'bg-white/[0.06] text-zinc-400'}`}><Building2 size={16} /></span>
                                <span className="truncate">{firm}</span>
                            </h2>
                            <div className="flex items-center gap-3 text-[11px]">
                                {domain && (
                                    <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-zinc-400 underline-offset-2 hover:text-yellow-400 hover:underline"><Globe size={12} /> {domain}</a>
                                )}
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${w ? 'bg-yellow-400/15 text-yellow-300' : hasOpen ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.06] text-zinc-300'}`}>
                                    {w ? `${w} do decyzji` : hasOpen ? 'zdecydowane' : 'historia'}
                                </span>
                            </div>
                        </header>
                        <div className="flex flex-col gap-1.5">{mails.sort((a, b) => a.krok - b.krok).map((m) => <MailRow key={m.id} m={m} />)}</div>
                        <div className="mt-3">
                            <FirmScript firm={firm} initial={scriptByFirm.get(firm) ?? null} />
                        </div>
                    </section>
                )
            })}

            {rejected.length > 0 && (
                <details className="lab-card group p-4 sm:p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-1 text-sm text-zinc-500 hover:text-zinc-300">
                        <span className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400"><Archive size={16} /></span>
                            <span className="truncate">Odrzucone ({rejected.length}): {rejected.map((f) => f.firm).join(', ')}</span>
                        </span>
                        <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-3 flex flex-col gap-1.5">
                        {rejected.flatMap((f) => f.mails.sort((a, b) => a.krok - b.krok).map((m) => <MailRow key={m.id} m={{ ...m, temat: `${f.firm} · ${m.temat}` }} />))}
                    </div>
                </details>
            )}
        </div>
    )
}
