import { redirect } from 'next/navigation'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AutoRefresh } from '../centrum/AutoRefresh'
import { DecisionButtons } from './DecisionButtons'
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
    approved: 'Zatwierdzony, czeka na wysyłkę',
    sending: 'Wysyła się',
    sent: 'Wysłany',
    rejected: 'Odrzucony',
    cancelled: 'Anulowany (klient odpisał albo koniec sekwencji)',
    failed: 'Nie wyszedł',
}

const KROK: Record<number, string> = { 1: 'Pierwszy mail', 2: 'Przypomnienie', 3: 'Ostatni mail' }

function when(iso: string | null): string {
    if (!iso) return '—'
    return new Intl.DateTimeFormat('pl-PL', {
        timeZone: 'Europe/Warsaw', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
}

function MailCard({ m }: { m: OutboxRow }) {
    const pending = m.status === 'pending_review'
    return (
        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-3">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-400/80">
                        {KROK[m.krok] ?? `Krok ${m.krok}`}
                    </p>
                    <h3 className="text-sm font-semibold text-white break-words">{m.temat || '(bez tematu)'}</h3>
                    <p className="text-xs text-zinc-500 break-all">do: {m.do_email}</p>
                </div>
                <p className="text-xs text-zinc-400">
                    {m.wyslano ? `wysłany ${when(m.wyslano)}` : `plan: ${when(m.zaplanowano)}`}
                </p>
            </header>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{m.tresc}</p>
            {m.krok > 1 && pending && (
                <p className="text-xs text-zinc-500">
                    Wyjdzie dopiero w zaplanowanym dniu i tylko wtedy, gdy klient nie odpisze na wcześniejszy mail.
                </p>
            )}
            {pending ? (
                m.zastosowano_at && m.blad
                    ? <p className="text-xs text-red-400">Harvey: {m.blad}</p>
                    : <DecisionButtons id={m.id} current={m.decyzja} />
            ) : (
                <p className="text-xs text-zinc-400">{STATUS[m.status] ?? m.status}</p>
            )}
        </article>
    )
}

export default async function MailsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const { data } = await supabase
        .from('harvey_outbox')
        .select('id, firma, do_email, temat, tresc, krok, zaplanowano, wyslano, status, decyzja, zastosowano_at, blad')
        .order('zaplanowano', { ascending: true })
    const rows = (data ?? []) as OutboxRow[]

    const pending = rows.filter((r) => r.status === 'pending_review')
    const waiting = pending.filter((r) => !r.decyzja).length
    const byFirm = new Map<string, OutboxRow[]>()
    for (const r of pending) {
        const key = r.firma || r.do_email
        byFirm.set(key, [...(byFirm.get(key) ?? []), r])
    }
    const history = rows.filter((r) => r.status !== 'pending_review')
        .sort((a, b) => (b.wyslano ?? b.zaplanowano ?? '').localeCompare(a.wyslano ?? a.zaplanowano ?? ''))
        .slice(0, 30)

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
            <AutoRefresh seconds={120} />
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
                    <Mail size={22} className="text-yellow-400" /> Maile do zatwierdzenia
                </h1>
                <p className="text-sm text-zinc-400">
                    {waiting > 0 ? `${waiting} czeka na Twoją decyzję.` : 'Nic nie czeka na decyzję.'}{' '}
                    Decyzja trafia do Harveya na komputerze przy najbliższym syncu (co 30 min).
                    Harvey nie wysyła w godzinach 17:00–8:00.
                </p>
            </header>

            {[...byFirm.entries()].map(([firm, mails]) => (
                <section key={firm} className="flex flex-col gap-3">
                    <h2 className="font-heading text-sm font-bold uppercase tracking-[0.15em] text-zinc-400">{firm}</h2>
                    {mails.sort((a, b) => a.krok - b.krok).map((m) => <MailCard key={m.id} m={m} />)}
                </section>
            ))}

            {history.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="font-heading text-sm font-bold uppercase tracking-[0.15em] text-zinc-500">
                        Ostatnie 14 dni
                    </h2>
                    {history.map((m) => (
                        <div key={m.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-zinc-800/70 px-3 py-2 text-xs">
                            <span className="text-zinc-300 min-w-0 break-words">{m.firma || m.do_email} — {m.temat}</span>
                            <span className="text-zinc-500">{STATUS[m.status] ?? m.status} · {when(m.wyslano ?? m.zaplanowano)}</span>
                        </div>
                    ))}
                </section>
            )}
        </div>
    )
}
