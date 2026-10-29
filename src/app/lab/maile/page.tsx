import { redirect } from 'next/navigation'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
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

const STATUS_COLOR: Record<string, string> = {
    pending_review: 'text-yellow-400',
    approved: 'text-emerald-400',
    sent: 'text-emerald-400',
    failed: 'text-red-400',
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
        <details className="group border-t border-zinc-800 first:border-t-0">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 hover:bg-zinc-900/60">
                <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {KROK[m.krok] ?? `Krok ${m.krok}`}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-white">{m.temat || '(bez tematu)'}</span>
                <span className="text-[11px] text-zinc-500">{when(m.wyslano ?? m.zaplanowano)}</span>
                <span className={`text-[11px] font-semibold ${STATUS_COLOR[m.status] ?? 'text-zinc-500'}`}>
                    {pending && m.decyzja ? (m.decyzja === 'approve' ? 'Zatwierdzasz' : 'Odrzucasz') : (STATUS[m.status] ?? m.status)}
                </span>
            </summary>
            <div className="flex flex-col gap-3 px-3 pb-3 pl-3 sm:pl-[7.5rem]">
                <p className="whitespace-pre-wrap rounded-md bg-zinc-900/60 p-3 text-sm leading-relaxed text-zinc-300">{m.tresc}</p>
                {m.krok > 1 && pending && (
                    <p className="text-[11px] text-zinc-500">Wyjdzie tylko wtedy, gdy klient nie odpisze na wcześniejszy mail.</p>
                )}
                {pending && (m.zastosowano_at && m.blad
                    ? <p className="text-xs text-red-400">Harvey: {m.blad}</p>
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
    const firms = [...byFirm.entries()].map(([firm, mails]) => {
        const open = mails.filter((m) => m.status === 'pending_review')
        return { firm, mails: open.length ? open : mails, email: mails[0].do_email, waiting: open.filter((m) => !m.decyzja).length, hasOpen: open.length > 0 }
    }).sort((a, b) => Number(b.hasOpen) - Number(a.hasOpen) || b.waiting - a.waiting)

    const waiting = firms.reduce((n, f) => n + f.waiting, 0)

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8">
            <AutoRefresh seconds={120} />
            <header className="flex flex-col gap-1">
                <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
                    <Mail size={22} className="text-yellow-400" /> Maile
                </h1>
                <p className="text-sm text-zinc-400">
                    {waiting > 0 ? <><b className="text-yellow-400">{waiting}</b> czeka na decyzję · </> : 'Nic nie czeka na decyzję · '}
                    {firms.length} firm · decyzja idzie do Harveya co 30 min, Harvey nie wysyła 17:00–8:00
                </p>
            </header>

            {firms.length === 0 && <p className="text-sm text-zinc-500">Harvey nie ma teraz żadnych maili.</p>}

            {firms.map(({ firm, mails, email, waiting: w, hasOpen }) => {
                const domain = email.split('@')[1]
                return (
                    <section key={firm} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-800 px-3 py-2.5">
                            <h2 className="min-w-0 truncate font-heading text-base font-bold text-white">{firm}</h2>
                            <div className="flex items-center gap-3 text-[11px]">
                                {domain && (
                                    <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer"
                                        className="text-zinc-400 underline-offset-2 hover:text-yellow-400 hover:underline">{domain}</a>
                                )}
                                <span className={w ? 'font-semibold text-yellow-400' : 'text-zinc-500'}>
                                    {w ? `${w} do decyzji` : hasOpen ? 'zdecydowane' : 'historia'}
                                </span>
                            </div>
                        </header>
                        <div>{mails.sort((a, b) => a.krok - b.krok).map((m) => <MailRow key={m.id} m={m} />)}</div>
                        <div className="border-t border-zinc-800 p-2">
                            <FirmScript firm={firm} initial={scriptByFirm.get(firm) ?? null} />
                        </div>
                    </section>
                )
            })}
        </div>
    )
}
