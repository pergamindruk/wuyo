import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Check, Mail, MessageCircle, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Strefa klienta to prywatny link: nie indeksujemy jej.
export const metadata: Metadata = { title: 'Twój projekt | WUYO', robots: { index: false, follow: false } }

type UpdateEntry = { date: string; status: string; progress: number; note?: string }

/** Etapy w języku klienta: co się dzieje i co jest potrzebne od niego. */
const PHASES = [
    { status: 'Briefing', name: 'Rozmowa i brief', now: 'Zbieram informacje o Twojej firmie i o tym, czego potrzebujesz.', you: 'Odpowiedz na pytania z briefu i podeślij logo, teksty albo zdjęcia, jeśli je masz.' },
    { status: 'Koncept', name: 'Pierwszy projekt', now: 'Przygotowuję pierwszą wersję projektu.', you: 'Nic. Dam znać, kiedy projekt będzie gotowy do obejrzenia.' },
    { status: 'Poprawki', name: 'Poprawki', now: 'Nanoszę Twoje uwagi do projektu.', you: 'Przejrzyj projekt i napisz, co zmienić. Wszystkie uwagi najlepiej w jednej wiadomości.' },
    { status: 'W druku', name: 'Druk i wdrożenie', now: 'Projekt jest zaakceptowany. Drukuję albo publikuję.', you: 'Nic. Napiszę, kiedy wszystko będzie gotowe do odbioru.' },
    { status: 'Final', name: 'Gotowe', now: 'Projekt jest skończony i przekazany.', you: 'Odbierz pliki albo wydruki. Jeśli coś jest nie tak, napisz.' },
] as const

const PHONE = '+48725182053'
const PHONE_LABEL = '725 182 053'

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('pl-PL', {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw',
    })
}

export default async function ClientPortalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: project } = await supabase.from('projects').select('id, name, client, status, progress, updates').eq('id', id).maybeSingle()
    if (!project) return notFound()

    const updates: UpdateEntry[] = Array.isArray(project.updates) ? (project.updates as UpdateEntry[]) : []
    const currentIdx = Math.max(0, PHASES.findIndex((p) => p.status === project.status))
    const phase = PHASES[currentIdx]
    const done = project.status === 'Final'
    const progress = Math.min(100, Math.max(0, Number(project.progress) || 0))
    const lastUpdate = updates.at(-1)
    const r = 54
    const circ = 2 * Math.PI * r

    return (
        <div className="min-h-screen bg-[#0b0b0d] text-zinc-100" style={{
            backgroundImage: 'radial-gradient(900px 500px at 85% -10%, rgba(255,235,82,0.10), transparent 60%), radial-gradient(700px 500px at -10% 110%, rgba(255,150,60,0.06), transparent 60%)',
        }}>
            <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8 sm:py-12">
                <header className="flex items-center justify-between">
                    <Image src="/logo_wuya2.webp" alt="WUYO" width={2866} height={1421} className="h-10 w-auto" priority />
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-400">Prywatna strefa klienta</span>
                </header>

                {/* Główna karta: gdzie jesteśmy */}
                <section className="rounded-[2rem] border border-white/[0.07] bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-6 sm:p-8">
                    <p className="text-sm text-zinc-400">{project.client}</p>
                    <h1 className="mt-1 text-2xl font-bold leading-tight text-white sm:text-3xl">{project.name}</h1>

                    <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                        <div className="relative h-36 w-36 shrink-0">
                            <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
                                <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                                <circle cx="64" cy="64" r={r} fill="none" stroke="#FFEB52" strokeWidth="10" strokeLinecap="round"
                                    strokeDasharray={circ} strokeDashoffset={circ * (1 - progress / 100)} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-white">{progress}%</span>
                                <span className="text-[11px] text-zinc-500">gotowe</span>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-yellow-400">Teraz: {phase.name}</p>
                                <p className="mt-1 text-base text-zinc-200">{phase.now}</p>
                            </div>
                            <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.06] p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-yellow-400">{done ? 'Na koniec' : 'Co potrzebuję od Ciebie'}</p>
                                <p className="mt-1 text-sm text-zinc-200">{phase.you}</p>
                            </div>
                            {lastUpdate && <p className="text-xs text-zinc-500">Ostatnia zmiana: {formatDate(lastUpdate.date)}</p>}
                        </div>
                    </div>
                </section>

                {/* Etapy */}
                <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
                    <h2 className="text-sm font-semibold text-white">Etapy</h2>
                    <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-5">
                        {PHASES.map((p, i) => {
                            const state = i < currentIdx || done ? 'done' : i === currentIdx ? 'now' : 'next'
                            return (
                                <li key={p.status} className={`flex items-center gap-3 rounded-2xl p-3 sm:flex-col sm:items-start sm:gap-2 ${state === 'now' ? 'bg-yellow-400/10 ring-1 ring-yellow-400/40' : ''}`}>
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${state === 'done' ? 'bg-yellow-400 text-zinc-950' : state === 'now' ? 'border-2 border-yellow-400 text-yellow-400' : 'border border-white/15 text-zinc-500'}`}>
                                        {state === 'done' ? <Check size={14} /> : i + 1}
                                    </span>
                                    <span className={`text-sm ${state === 'next' ? 'text-zinc-500' : 'text-zinc-100'}`}>{p.name}</span>
                                </li>
                            )
                        })}
                    </ol>
                </section>

                {/* Historia */}
                {updates.length > 0 && (
                    <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
                        <h2 className="text-sm font-semibold text-white">Co się działo</h2>
                        <ul className="mt-4 flex flex-col">
                            {[...updates].reverse().map((u, i) => {
                                const name = PHASES.find((p) => p.status === u.status)?.name ?? u.status
                                return (
                                    <li key={`${u.date}-${i}`} className="relative border-l border-white/10 pb-5 pl-5 last:pb-0">
                                        <span className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-yellow-400' : 'bg-zinc-600'}`} />
                                        <p className="text-xs text-zinc-500">{formatDate(u.date)}</p>
                                        <p className="text-sm font-medium text-zinc-100">{name}</p>
                                        {u.note && <p className="mt-0.5 text-sm text-zinc-400">{u.note}</p>}
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                )}

                {/* Kontakt */}
                <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
                    <h2 className="text-sm font-semibold text-white">Masz pytanie albo uwagi?</h2>
                    <p className="mt-1 text-sm text-zinc-400">Pisz albo dzwoń śmiało. Odpowiadam w dni robocze.</p>
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <a href={`tel:${PHONE}`} className="flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-yellow-300">
                            <Phone size={16} /> {PHONE_LABEL}
                        </a>
                        <a href={`https://wa.me/${PHONE.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-zinc-100 hover:border-white/30">
                            <MessageCircle size={16} /> WhatsApp
                        </a>
                        <a href={`mailto:kontakt@wuyo.pl?subject=${encodeURIComponent(`Projekt: ${project.name}`)}`} className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-zinc-100 hover:border-white/30">
                            <Mail size={16} /> Mail
                        </a>
                    </div>
                </section>

                <p className="text-center text-[11px] text-zinc-600">Ten link jest tylko dla Ciebie. Nie udostępniaj go dalej.</p>
            </div>
        </div>
    )
}
