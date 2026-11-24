import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Briefcase, CalendarClock, FileSignature, History, Kanban, Mail, Phone, Sparkles, StickyNote, Users, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPLN, telHref } from '@/lib/lab/today/format'
import { loadClientCard, stageLabel, type TimelineKind } from '@/lib/lab/client-timeline'
import { CallNoteBox } from '@/components/lab/CallNoteBox'
import { PageHeader, SectionTitle } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'

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

    const details = [client.company && client.name !== client.company ? client.name : null, client.nip && `NIP ${client.nip}`, client.address, client.source && `źródło: ${client.source}`].filter(Boolean).join(' · ')

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <Link href="/lab/klienci" className="inline-flex w-fit items-center gap-1.5 text-sm text-zinc-500 transition hover:text-white"><ArrowLeft size={14} /> Klienci</Link>

            <PageHeader
                icon={Users}
                eyebrow="Karta klienta"
                title={client.company || client.name}
                subtitle={details || undefined}
                actions={
                    <>
                        {client.phone && (
                            <a href={telHref(client.phone)} className="inline-flex min-h-11 items-center gap-2 bg-yellow-400 px-5 text-sm font-bold text-zinc-950"><Phone size={16} strokeWidth={1.8} /> {client.phone}</a>
                        )}
                        {client.email && (
                            <a href={`mailto:${client.email}`} className="inline-flex min-h-11 items-center gap-2 bg-zinc-800 px-5 text-sm text-zinc-200"><Mail size={16} strokeWidth={1.8} /> {client.email}</a>
                        )}
                    </>
                }
            />

            <div className="lab-stagger grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <section className="lab-card border-yellow-400/25 p-5 sm:p-6">
                    <span className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl" />
                    <SectionTitle icon={CalendarClock} title="Następny krok" />
                    {openJob ? (
                        <>
                            <p className="text-lg font-semibold text-white">{openJob.next_step || 'Brak. Ustal go w lejku albo zapisz notatkę z rozmowy.'}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">{openJob.stage}. {stageLabel(openJob.stage)}</span>
                                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">{openJob.next_contact_at ? `Kontakt: ${openJob.next_contact_at}` : 'Bez daty kontaktu'}</span>
                                <span className="text-sm text-zinc-400">{openJob.title}</span>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-zinc-400">Brak otwartego zlecenia.</p>
                    )}
                    <div className="mt-5 flex flex-wrap gap-2 text-sm">
                        <Link href="/lab/lejek" className="inline-flex min-h-10 items-center gap-2 bg-zinc-800 px-4 text-zinc-200"><Kanban size={16} strokeWidth={1.8} className="text-yellow-400" /> {openJob ? 'Otwórz lejek' : 'Dodaj zlecenie w lejku'}</Link>
                        <Link href="/lab/oferty" className="inline-flex min-h-10 items-center gap-2 bg-zinc-800 px-4 text-zinc-200"><FileSignature size={16} strokeWidth={1.8} className="text-yellow-400" /> Brief i oferta</Link>
                        {queueIds[0] && (
                            <Link href={`/lab/ai-studio?tab=telefon&firma=${encodeURIComponent(queueIds[0])}`} className="inline-flex min-h-10 items-center gap-2 bg-zinc-800 px-4 text-zinc-200"><Sparkles size={16} strokeWidth={1.8} className="text-yellow-400" /> Ściągawka do rozmowy</Link>
                        )}
                    </div>
                </section>

                <div className="lab-card lab-hover flex flex-col justify-between gap-4 p-5 sm:p-6">
                    <div className="flex items-center gap-4">
                        <span className="lab-chip h-12 w-12 shrink-0"><Wallet size={22} strokeWidth={1.8} /></span>
                        <div>
                            <p className="text-sm text-zinc-400">Wpłacił łącznie</p>
                            <p className="font-heading text-3xl font-bold leading-none text-white"><CountUp value={paidGrosze} format="pln" /></p>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500">Zleceń: {jobs.length}{openJob ? ' · jedno otwarte' : ''}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <section className="lab-card p-5 sm:p-6">
                    <SectionTitle icon={History} title="Historia" />
                    {timeline.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400"><History size={20} strokeWidth={1.8} /></span>
                            <p className="text-sm text-zinc-500">Jeszcze nic się nie wydarzyło. Zapisz notatkę z pierwszej rozmowy.</p>
                        </div>
                    ) : (
                        <ol className="relative ml-1 flex flex-col gap-4 border-l border-white/[0.08] pl-5">
                            {timeline.map((t, i) => (
                                <li key={`${t.at}-${i}`} className="relative rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]">
                                    <span className={`absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full ring-4 ring-[#0b0b0d] ${DOT[t.kind]}`} />
                                    <p className="text-[11px] text-zinc-500">{when(t.at)}</p>
                                    <p className="text-sm font-medium text-zinc-100">{t.title}</p>
                                    {t.body && <p className="mt-0.5 whitespace-pre-line text-sm text-zinc-400">{t.body}</p>}
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                <aside className="flex flex-col gap-4">
                    <CallNoteBox clientId={client.id} jobId={openJob?.id ?? null} />

                    <section className="lab-card p-5 sm:p-6">
                        <SectionTitle icon={Briefcase} title="Zlecenia" />
                        {jobs.length === 0 ? <p className="text-sm text-zinc-500">Brak zleceń.</p> : (
                            <ul className="flex flex-col gap-2">
                                {jobs.map((j) => (
                                    <li key={j.id} className="rounded-2xl bg-white/[0.03] px-4 py-3 text-sm transition hover:bg-white/[0.06]">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-medium text-white">{j.title}</p>
                                            <span className="shrink-0 font-semibold text-white">{formatPLN(j.price_grosze ?? 0)}</span>
                                        </div>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                                            {j.outcome === 'zakonczone' ? (
                                                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">zakończone</span>
                                            ) : j.outcome === 'przegrane' ? (
                                                <span className="rounded-full bg-red-400/15 px-2.5 py-1 text-[11px] font-semibold text-red-300">przegrane{j.lost_reason ? `: ${j.lost_reason}` : ''}</span>
                                            ) : (
                                                <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">{j.stage}. {stageLabel(j.stage)}</span>
                                            )}
                                            <span>netto</span>
                                            {j.public_token && <Link href={`/oferta/${j.public_token}`} target="_blank" className="text-yellow-400 hover:text-yellow-300">oferta</Link>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {client.notes && (
                        <section className="lab-card p-5 sm:p-6">
                            <SectionTitle icon={StickyNote} title="Notatki o kliencie" />
                            <p className="whitespace-pre-line text-sm text-zinc-400">{client.notes}</p>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    )
}
