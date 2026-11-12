import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, CalendarClock, FileSignature, Kanban, Mail, Phone, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPLN, telHref } from '@/lib/lab/today/format'
import { loadClientCard, stageLabel, type TimelineKind } from '@/lib/lab/client-timeline'
import { CallNoteBox } from '@/components/lab/CallNoteBox'
import { statCard } from '@/components/lab/stats/StatBlocks'

export const dynamic = 'force-dynamic'

const DOT: Record<TimelineKind, string> = {
    zapytanie: 'bg-sky-400', zlecenie: 'bg-zinc-400', telefon: 'bg-zinc-500', rozmowa: 'bg-yellow-400', oferta: 'bg-yellow-300',
    akceptacja: 'bg-emerald-400', wplata: 'bg-emerald-500', zamkniete: 'bg-emerald-300', przegrane: 'bg-red-400', ai: 'bg-violet-400', mail: 'bg-sky-300',
}

const when = (iso: string) => new Date(iso).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })

export default async function ClientCardPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
    const card = await loadClientCard(supabase, id)
    if (!card) notFound()
    const { client, jobs, openJob, timeline, paidGrosze, queueIds } = card

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <Link href="/lab/klienci" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white"><ArrowLeft size={14} /> Klienci</Link>

            <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="break-words text-3xl font-bold text-white">{client.company || client.name}</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        {[client.company && client.name !== client.company ? client.name : null, client.nip && `NIP ${client.nip}`, client.address, client.source && `źródło: ${client.source}`].filter(Boolean).join(' · ')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {client.phone && (
                            <a href={telHref(client.phone)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-bold text-zinc-950 hover:bg-yellow-300"><Phone size={15} /> {client.phone}</a>
                        )}
                        {client.email && (
                            <a href={`mailto:${client.email}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm text-zinc-200 hover:border-yellow-400/50"><Mail size={15} /> {client.email}</a>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-zinc-500">Wpłacił łącznie</p>
                    <p className="text-2xl font-bold text-white">{formatPLN(paidGrosze)}</p>
                </div>
            </header>

            <section className={`${statCard} border-yellow-400/25`}>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-yellow-400/80"><CalendarClock size={14} /> Następny krok</p>
                {openJob ? (
                    <>
                        <p className="mt-2 text-lg font-semibold text-white">{openJob.next_step || 'Brak. Ustal go w lejku albo zapisz notatkę z rozmowy.'}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                            {openJob.next_contact_at ? `Kontakt: ${openJob.next_contact_at}` : 'Bez daty kontaktu'} · {openJob.title} · {openJob.stage}. {stageLabel(openJob.stage)}
                        </p>
                    </>
                ) : (
                    <p className="mt-2 text-sm text-zinc-400">Brak otwartego zlecenia.</p>
                )}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <Link href="/lab/lejek" className="inline-flex min-h-10 items-center gap-1.5 text-yellow-400 hover:text-yellow-300"><Kanban size={15} /> {openJob ? 'Otwórz lejek' : 'Dodaj zlecenie w lejku'}</Link>
                    <Link href="/lab/oferty" className="inline-flex min-h-10 items-center gap-1.5 text-yellow-400 hover:text-yellow-300"><FileSignature size={15} /> Brief i oferta</Link>
                    {queueIds[0] && (
                        <Link href={`/lab/ai-studio?tab=telefon&firma=${encodeURIComponent(queueIds[0])}`} className="inline-flex min-h-10 items-center gap-1.5 text-yellow-400 hover:text-yellow-300"><Sparkles size={15} /> Ściągawka do rozmowy</Link>
                    )}
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <section className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold text-white">Historia</h2>
                    {timeline.length === 0 ? (
                        <p className="text-sm text-zinc-600">Jeszcze nic się nie wydarzyło.</p>
                    ) : (
                        <ol className="relative flex flex-col gap-4 border-l border-zinc-800 pl-5">
                            {timeline.map((t, i) => (
                                <li key={`${t.at}-${i}`} className="relative">
                                    <span className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ${DOT[t.kind]}`} />
                                    <p className="text-[11px] text-zinc-600">{when(t.at)}</p>
                                    <p className="text-sm font-medium text-zinc-100">{t.title}</p>
                                    {t.body && <p className="mt-0.5 whitespace-pre-line text-sm text-zinc-400">{t.body}</p>}
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                <aside className="flex flex-col gap-4">
                    <CallNoteBox clientId={client.id} jobId={openJob?.id ?? null} />

                    <section className={statCard}>
                        <h2 className="mb-3 text-sm font-semibold text-white">Zlecenia</h2>
                        {jobs.length === 0 ? <p className="text-xs text-zinc-600">Brak.</p> : (
                            <ul className="flex flex-col gap-2.5">
                                {jobs.map((j) => (
                                    <li key={j.id} className="text-sm">
                                        <p className="font-medium text-white">{j.title}</p>
                                        <p className="text-xs text-zinc-500">
                                            {j.outcome === 'zakonczone' ? 'zakończone' : j.outcome === 'przegrane' ? `przegrane${j.lost_reason ? `: ${j.lost_reason}` : ''}` : `${j.stage}. ${stageLabel(j.stage)}`}
                                            {' · '}{formatPLN(j.price_grosze ?? 0)} netto
                                            {j.public_token && <> · <Link href={`/oferta/${j.public_token}`} target="_blank" className="text-yellow-400 hover:text-yellow-300">oferta</Link></>}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {client.notes && (
                        <section className={statCard}>
                            <h2 className="mb-2 text-sm font-semibold text-white">Notatki o kliencie</h2>
                            <p className="whitespace-pre-line text-sm text-zinc-400">{client.notes}</p>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    )
}
