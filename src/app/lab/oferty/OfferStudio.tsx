'use client'

// "use client": wybór zlecenia, edycja oferty na żywo z podglądem, kopiowanie linków i PDF.
import { useState, useTransition } from 'react'
import { Check, ClipboardList, Copy, Download, FileText, Save, Send, Sparkles } from 'lucide-react'
import { SectionTitle } from '@/components/lab/ui/PageHeader'
import { OfferDocument } from '@/components/lab/OfferDocument'
import type { OfferData } from '@/lib/lab/offer'
import { offerTemplate } from '@/lib/lab/offer-templates'
import { draftOffer, ensureJobToken, saveOffer } from './actions'

export type StudioJob = {
    id: string
    title: string
    service: string
    serviceKey: string
    stage: number
    priceGrosze: number
    token: string | null
    offerSentAt: string | null
    acceptedAt: string | null
    acceptedBy: string | null
    clientName: string
    clientCompany: string
    clientEmail: string
    offer: OfferData | null
    brief: { text: string; at: string } | null
}

// Pola: zaokrąglenie i żółty fokus z lab-input (globals.css).
const field = 'lab-input w-full px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600'
const label = 'text-xs font-medium text-zinc-400'
const todayPl = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' })

function emptyOffer(j: StudioJob): OfferData {
    const d = todayPl()
    return {
        number: `${d.slice(2, 4)}${d.slice(5, 7)}/${j.id.slice(0, 4).toUpperCase()}`,
        date: d,
        validDays: 14,
        clientName: j.clientName,
        clientCompany: j.clientCompany,
        ...offerTemplate(j.serviceKey, j.clientCompany || j.clientName),
        priceGrosze: j.priceGrosze,
        priceNote: 'Cena netto, do ceny doliczam 23% VAT. Płatność: 50% zaliczki na start, reszta po odbiorze.',
        timeline: '',
    }
}

async function savePdf(filename: string) {
    const html2pdf = (await import('html2pdf.js')).default
    const el = document.getElementById('offer-document')
    if (!el) return
    html2pdf().set({ margin: 0, filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, windowWidth: 794, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).save()
}

export function OfferStudio({ jobs }: { jobs: StudioJob[] }) {
    const [selId, setSelId] = useState(jobs[0]?.id)
    const job = jobs.find((j) => j.id === selId) ?? jobs[0]
    return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
            <aside className="lab-card flex flex-col gap-1.5 self-start p-3">
                <p className="px-2 pb-1 pt-1 text-xs font-medium text-zinc-500">Zlecenia ({jobs.length})</p>
                {jobs.map((j) => (
                    <button key={j.id} onClick={() => setSelId(j.id)}
                        className={`rounded-2xl px-4 py-3 text-left transition ${j.id === job.id ? 'bg-yellow-400/[0.09] ring-1 ring-yellow-400/40' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                        <p className="truncate text-sm font-semibold text-white">{j.clientCompany || j.clientName || 'Bez nazwy'}</p>
                        <p className="truncate text-xs text-zinc-500">{j.title || j.service}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${j.brief ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.06] text-zinc-400'}`}>{j.brief ? 'brief ✓' : 'brief brak'}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${j.acceptedAt ? 'bg-emerald-400/15 text-emerald-300' : j.offerSentAt ? 'bg-yellow-400/15 text-yellow-300' : 'bg-white/[0.06] text-zinc-400'}`}>
                                {j.acceptedAt ? 'oferta przyjęta' : j.offerSentAt ? 'oferta wysłana' : 'oferta brak'}
                            </span>
                        </div>
                    </button>
                ))}
            </aside>
            {job && <JobPanel key={job.id} job={job} />}
        </div>
    )
}

function JobPanel({ job }: { job: StudioJob }) {
    const [offer, setOffer] = useState<OfferData>(job.offer ?? emptyOffer(job))
    const [token, setToken] = useState(job.token)
    const [notes, setNotes] = useState('')
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
    const [pending, start] = useTransition()
    const set = <K extends keyof OfferData>(k: K, v: OfferData[K]) => setOffer((o) => ({ ...o, [k]: v }))
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wuyo.pl'

    const copyLink = (kind: 'brief' | 'oferta') => start(async () => {
        let t = token
        if (!t) {
            const r = await ensureJobToken(job.id)
            if (!r.ok) return setMsg({ ok: false, text: r.error })
            t = r.data
            setToken(t)
        }
        await navigator.clipboard?.writeText(`${origin}/${kind}/${t}`)
        setMsg({ ok: true, text: `Link do ${kind === 'brief' ? 'briefu' : 'oferty'} skopiowany. Wklej klientowi w mailu albo WhatsAppie.` })
    })

    const draft = () => start(async () => {
        setMsg(null)
        const r = await draftOffer({ jobId: job.id, service: job.service, priceGrosze: offer.priceGrosze, notes, clientName: offer.clientName, clientCompany: offer.clientCompany, brief: job.brief?.text ?? '' })
        if (r.ok) setOffer((o) => ({ ...o, ...r.data }))
        else setMsg({ ok: false, text: r.error })
    })

    const applyTemplate = () => {
        setOffer((o) => ({ ...o, ...offerTemplate(job.serviceKey, o.clientCompany || o.clientName) }))
        setMsg({ ok: true, text: 'Szablon wstawiony. Uzupełnij pola w [nawiasach] przed wysłaniem.' })
    }

    const save = (markSent: boolean) => start(async () => {
        const r = await saveOffer(job.id, offer, markSent)
        if (!r.ok) return setMsg({ ok: false, text: r.error })
        setToken(r.data)
        if (markSent) await navigator.clipboard?.writeText(`${origin}/oferta/${r.data}`)
        setMsg({ ok: true, text: markSent ? 'Zapisane, zlecenie w lejku na etapie „Oferta wysłana”. Link do oferty skopiowany.' : 'Oferta zapisana.' })
    })

    return (
        <div className="flex flex-col gap-5">
            {/* Brief */}
            <section className="lab-card p-5 sm:p-6">
                <SectionTitle
                    icon={ClipboardList}
                    title="Brief"
                    action={
                        <button onClick={() => copyLink('brief')} disabled={pending} className="flex items-center gap-1.5 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 disabled:opacity-50">
                            <Copy size={14} /> Kopiuj link do briefu
                        </button>
                    }
                />
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${job.brief ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.06] text-zinc-300'}`}>{job.brief ? 'wypełniony' : 'czeka na klienta'}</span>
                    <p className="text-xs text-zinc-500">{job.brief ? `Klient odpowiedział ${new Date(job.brief.at).toLocaleDateString('pl-PL')}` : 'Klient jeszcze nie wypełnił. Wyślij mu link, pytania dobierają się do usługi.'}</p>
                </div>
                {job.brief && <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/30 p-4 font-sans text-sm leading-relaxed text-zinc-300">{job.brief.text}</pre>}
            </section>

            {/* Oferta */}
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
                <div className="lab-card flex flex-col gap-3 p-5 sm:p-6">
                    <SectionTitle icon={FileText} title="Oferta" />
                    {job.acceptedAt && (
                        <p className="rounded-2xl bg-emerald-400/10 p-3 text-xs text-emerald-300">
                            <Check size={13} className="mr-1 inline" /> Zaakceptowana {new Date(job.acceptedAt).toLocaleString('pl-PL')} przez {job.acceptedBy}. Następny krok: umowa.
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1.5"><span className={label}>Klient</span><input value={offer.clientName} onChange={(e) => set('clientName', e.target.value)} className={field} /></label>
                        <label className="flex flex-col gap-1.5"><span className={label}>Firma</span><input value={offer.clientCompany} onChange={(e) => set('clientCompany', e.target.value)} className={field} /></label>
                    </div>
                    <label className="flex flex-col gap-1.5"><span className={label}>Notatki z rozmowy (dla AI)</span>
                        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Np. otwiera piekarnię w Łańcucie w grudniu, chce logo w stylu retro, 200 wizytówek" className={`${field} resize-none`} /></label>
                    <button onClick={draft} disabled={pending} className="lab-shine flex items-center justify-center gap-2 rounded-full bg-white/[0.06] py-2.5 text-sm font-semibold text-white ring-1 ring-yellow-400/30 transition hover:ring-yellow-400/60 disabled:opacity-50">
                        <Sparkles size={16} strokeWidth={1.8} className="text-yellow-400" /> {pending ? 'Chwila…' : 'Napisz wstęp, zakres i CTA (AI)'}
                    </button>
                    <button onClick={applyTemplate} disabled={pending} className="flex items-center justify-center gap-2 bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-200 disabled:opacity-50">
                        <FileText size={16} strokeWidth={1.8} className="text-yellow-400" /> Wstaw szablon ({job.service})
                    </button>
                    <label className="flex flex-col gap-1.5"><span className={label}>Tytuł</span><input value={offer.title} onChange={(e) => set('title', e.target.value)} className={field} /></label>
                    <label className="flex flex-col gap-1.5"><span className={label}>Wstęp</span><textarea rows={3} value={offer.intro} onChange={(e) => set('intro', e.target.value)} className={`${field} resize-y`} /></label>
                    <label className="flex flex-col gap-1.5"><span className={label}>Zakres (każdy punkt w nowej linii)</span>
                        <textarea rows={5} value={offer.scope.join('\n')} onChange={(e) => set('scope', e.target.value.split('\n'))} className={`${field} resize-y`} /></label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1.5"><span className={label}>Cena netto zł (cennik)</span>
                            <input inputMode="decimal" value={offer.priceGrosze / 100} onChange={(e) => set('priceGrosze', Math.round((Number(e.target.value.replace(',', '.')) || 0) * 100))} className={field} /></label>
                        <label className="flex flex-col gap-1.5"><span className={label}>Ważna dni</span>
                            <input type="number" min={1} value={offer.validDays} onChange={(e) => set('validDays', Number(e.target.value) || 14)} className={field} /></label>
                    </div>
                    <label className="flex flex-col gap-1.5"><span className={label}>Dopisek pod ceną</span><input value={offer.priceNote} onChange={(e) => set('priceNote', e.target.value)} className={field} /></label>
                    <label className="flex flex-col gap-1.5"><span className={label}>Termin (tylko jeśli obiecujesz)</span><input value={offer.timeline} onChange={(e) => set('timeline', e.target.value)} placeholder="np. start w grudniu, projekt w 7 dni roboczych" className={field} /></label>
                    <label className="flex flex-col gap-1.5"><span className={label}>CTA</span><textarea rows={2} value={offer.cta} onChange={(e) => set('cta', e.target.value)} className={`${field} resize-y`} /></label>
                    <div className="mt-1 flex flex-wrap gap-2">
                        <button onClick={() => save(false)} disabled={pending} className="flex items-center gap-1.5 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 disabled:opacity-50"><Save size={14} /> Zapisz</button>
                        <button onClick={() => save(true)} disabled={pending} className="flex items-center gap-1.5 bg-yellow-400 px-4 py-2.5 text-xs font-bold text-zinc-950 disabled:opacity-50"><Send size={14} /> Zapisz, oznacz wysłaną, kopiuj link</button>
                    </div>
                    {msg && <p className={`rounded-2xl px-4 py-2.5 text-xs font-medium ${msg.ok ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>{msg.text}</p>}
                </div>

                {/* Podgląd zostaje biały: tak zobaczy klient. */}
                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
                        <span className="text-xs font-semibold text-zinc-600">Podgląd · tak zobaczy klient</span>
                        <div className="flex gap-2">
                            <button onClick={() => copyLink('oferta')} className="flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-500"><Copy size={12} /> Link</button>
                            <button onClick={() => savePdf(`Oferta_WUYO_${(offer.clientCompany || offer.clientName).replace(/\s+/g, '_')}.pdf`)} className="flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"><Download size={12} /> PDF</button>
                        </div>
                    </div>
                    <OfferDocument data={{ ...offer, scope: offer.scope.filter((s) => s.trim()) }} id="offer-document" />
                </div>
            </section>
        </div>
    )
}
