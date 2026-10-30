'use client'

// "use client": wybór wzoru i zlecenia, edycja pól i podgląd dokumentu na żywo, druk i PDF.
import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Download, ExternalLink, FileSignature, Printer } from 'lucide-react'
import { DOCS_MASTER_URL, LEGAL_TEMPLATES, WYKONAWCA_DANE, fillTemplate, type LegalFields } from '@/lib/lab/legal-templates'
import { getDocJobs, type DocJob } from './actions'

const field = 'w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none'
const label = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-400'
const pln = (g: number) => (g / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł'
const todayPl = () => {
    const d = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' })
    return `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}`
}

const EMPTY: LegalFields = {
    WYKONAWCA: WYKONAWCA_DANE, ZAMAWIAJACY: '[DANE ZAMAWIAJĄCEGO: imię i nazwisko / firma, adres, NIP]', EMAIL: '[e-mail]',
    DATA: todayPl(), NR: `[NR]/${todayPl().slice(3)}`, DZIELO: '[opis dzieła z oferty]', KWOTA: '[KWOTA] zł', ZALICZKA: '[KWOTA] zł',
}

export function ClientDocuments() {
    const [slug, setSlug] = useState(LEGAL_TEMPLATES[0].slug)
    const [jobs, setJobs] = useState<DocJob[]>([])
    const [jobId, setJobId] = useState('')
    const [f, setF] = useState<LegalFields>(EMPTY)
    const [copied, setCopied] = useState(false)

    useEffect(() => { getDocJobs().then(setJobs) }, [])

    const pickJob = (id: string) => {
        setJobId(id)
        const j = jobs.find((x) => x.id === id)
        if (!j) return setF(EMPTY)
        const half = Math.round(j.priceGrosze / 2)
        setF({
            ...EMPTY,
            ZAMAWIAJACY: [j.client, j.address, j.nip && `NIP ${j.nip}`].filter(Boolean).join(', ') || EMPTY.ZAMAWIAJACY,
            EMAIL: j.email || EMPTY.EMAIL,
            NR: `${j.id.slice(0, 4).toUpperCase()}/${todayPl().slice(3)}`,
            DZIELO: j.title || EMPTY.DZIELO,
            KWOTA: j.priceGrosze ? `${pln(j.priceGrosze)} netto` : EMPTY.KWOTA,
            ZALICZKA: j.priceGrosze ? pln(half) : EMPTY.ZALICZKA,
        })
    }

    const tpl = LEGAL_TEMPLATES.find((t) => t.slug === slug) ?? LEGAL_TEMPLATES[0]
    const text = useMemo(() => fillTemplate(tpl.body, f), [tpl, f])

    const pdf = async () => {
        const html2pdf = (await import('html2pdf.js')).default
        const el = document.getElementById('legal-doc')
        if (el) html2pdf().set({ margin: 14, filename: `${tpl.title.replace(/[^\p{L}\d]+/gu, '_')}_${f.NR.replace(/\//g, '-')}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, windowWidth: 794 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).save()
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] print:block">
            <aside className="flex flex-col gap-4 print:hidden">
                <div className="flex flex-col gap-1.5 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-3">
                    {LEGAL_TEMPLATES.map((t, i) => (
                        <button key={t.slug} onClick={() => setSlug(t.slug)}
                            className={`rounded-2xl px-3 py-2.5 text-left transition ${t.slug === slug ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-300 hover:bg-white/[0.05]'}`}>
                            <span className="text-[11px] font-bold opacity-60">{i + 1}.</span> <span className="text-sm font-semibold">{t.title}</span>
                            <span className={`mt-0.5 block text-[11px] ${t.slug === slug ? 'text-zinc-800' : 'text-zinc-500'}`}>{t.when}</span>
                        </button>
                    ))}
                    <a href={DOCS_MASTER_URL} target="_blank" rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs text-zinc-400 hover:text-yellow-400">
                        <ExternalLink size={13} /> Analiza prawna i wzory w Claude Docs
                    </a>
                </div>

                <div className="flex flex-col gap-3 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <label className="flex flex-col gap-1.5"><span className={label}>Zlecenie z lejka</span>
                        <select value={jobId} onChange={(e) => pickJob(e.target.value)} className={field}>
                            <option value="">— bez zlecenia, wpiszę ręcznie —</option>
                            {jobs.map((j) => <option key={j.id} value={j.id}>{j.client || 'Bez nazwy'} · {j.title}</option>)}
                        </select>
                    </label>
                    {(['ZAMAWIAJACY', 'EMAIL', 'NR', 'DATA', 'DZIELO', 'KWOTA', 'ZALICZKA'] as const).map((k) => (
                        <label key={k} className="flex flex-col gap-1.5">
                            <span className={label}>{{ ZAMAWIAJACY: 'Zamawiający (dane)', EMAIL: 'E-mail', NR: 'Nr umowy', DATA: 'Data', DZIELO: 'Dzieło', KWOTA: 'Wynagrodzenie', ZALICZKA: 'Zaliczka 50%' }[k]}</span>
                            {k === 'ZAMAWIAJACY' || k === 'DZIELO'
                                ? <textarea rows={2} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={`${field} resize-none`} />
                                : <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={field} />}
                        </label>
                    ))}
                    <p className="text-[11px] text-zinc-500">Pola w [nawiasach] w dokumencie uzupełniasz ręcznie albo w Załączniku nr 1.</p>
                </div>
            </aside>

            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.06] px-4 py-3 print:hidden">
                    <p className="flex items-center gap-2 text-xs text-zinc-200"><FileSignature size={15} className="shrink-0 text-yellow-400" /> <span><b>Podpis:</b> {tpl.sign}</span></p>
                    <div className="flex gap-2">
                        <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
                            className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-white/30"><Copy size={12} /> {copied ? 'Skopiowane' : 'Kopiuj tekst'}</button>
                        <button onClick={() => window.print()} className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-white/30"><Printer size={12} /> Drukuj</button>
                        <button onClick={pdf} className="flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-yellow-300"><Download size={12} /> PDF</button>
                    </div>
                </div>
                <div className="overflow-hidden rounded-3xl bg-white shadow-2xl print:rounded-none print:shadow-none">
                    <div id="legal-doc" className="mx-auto max-w-[794px] px-8 py-10 text-zinc-900 sm:px-12 print:px-0 print:py-0">
                        <div className="prose prose-sm max-w-none prose-zinc text-[12.5px] leading-relaxed prose-headings:text-zinc-900 prose-h1:text-xl prose-h1:mb-4 prose-h2:mt-5 prose-h2:mb-1.5 prose-h2:text-[13px] prose-p:my-1.5 prose-li:my-0.5 prose-table:text-[12px] prose-td:align-top">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
