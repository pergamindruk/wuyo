'use client'

// "use client": formularz, podgląd dokumentu, PDF i przełączanie statusu płatności działają w przeglądarce.
import { useEffect, useState } from 'react'
import { FileText, Save, Printer, Info, Download, Trash2, AlertTriangle, Check, Clock, History, ChevronDown, ChevronUp, Eye, X, Pencil } from 'lucide-react'
import { createDocument, getEwidencja, deleteEwidencja, updatePaymentStatus, updateMarkdownContent } from './actions'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ReceiptDocument } from '@/components/lab/ReceiptDocument'
import { KIND_LABEL, SELLER, parseReceipt, type ReceiptData, type ReceiptKind } from '@/lib/lab/receipt'

/** Limit działalności nierejestrowanej od 1.01.2026: 225% płacy minimalnej (4806 zł) na KWARTAŁ (art. 5 ust. 1 Prawa przedsiębiorców). */
const QUARTER_LIMIT = 10813.5

async function savePdf(elementId: string, filename: string) {
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.getElementById(elementId)
    if (!element) return
    html2pdf().set({
        margin: 12,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, windowWidth: 794, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(element).save()
}

// Dzisiejsza data w Polsce (toISOString daje UTC, po północy byłby wczorajszy dzień).
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' })
const field = 'w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none'
const label = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-400'

export default function FinancesLab() {
    const [kind, setKind] = useState<ReceiptKind>('dn')
    const [buyer, setBuyer] = useState('')
    const [description, setDescription] = useState('')
    const [unit, setUnit] = useState('usł.')
    const [qty, setQty] = useState('1')
    const [amount, setAmount] = useState('')
    const [advance, setAdvance] = useState('')
    const [payment, setPayment] = useState('przelew')
    const [dueDays, setDueDays] = useState('7')
    const [notes, setNotes] = useState('')
    const [saleDate, setSaleDate] = useState(today())
    const [issueDate, setIssueDate] = useState(today())

    const [loading, setLoading] = useState(false)
    const [doc, setDoc] = useState<ReceiptData | null>(null)
    const [error, setError] = useState('')
    const [ewidencja, setEwidencja] = useState<any[]>([])

    const loadEwidencja = async () => setEwidencja(await getEwidencja())
    useEffect(() => { loadEwidencja() }, [])

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const r = await createDocument({
            kind, buyer, description, unit, qty: Number(qty) || 1,
            totalZl: Number(amount.replace(',', '.')) || 0, advanceZl: Number(advance.replace(',', '.')) || 0,
            saleDate, issueDate, payment, dueDays: Number(dueDays) || 0, notes,
        })
        if (r.success) {
            setDoc(r.data)
            loadEwidencja()
        } else setError(r.error)
        setLoading(false)
    }

    // ── Limit kwartalny (liczy się przychód należny wg daty wykonania usługi) ──
    const ref = new Date(saleDate)
    const year = ref.getFullYear()
    const quarter = Math.floor(ref.getMonth() / 3)
    const inQuarter = ewidencja
        .filter((e: any) => {
            if (!e.date) return false
            const d = new Date(e.date)
            return d.getFullYear() === year && Math.floor(d.getMonth() / 3) === quarter
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let running = 0
    const rows = inQuarter.map((e, i) => { running += e.amount; return { ...e, lp: i + 1, runningTotal: running } })
    const pct = Math.min(100, (running / QUARTER_LIMIT) * 100)
    const quarterLabel = `${['I', 'II', 'III', 'IV'][quarter]} kwartał ${year}`

    const handleDeleteEwidencja = async (id: string) => {
        if (confirm('Na pewno usunąć ten dokument z ewidencji?')) {
            await deleteEwidencja(id)
            loadEwidencja()
        }
    }
    const handlePaymentToggle = async (id: string, currentStatus: string) => {
        await updatePaymentStatus(id, currentStatus === 'Zaplacona' ? 'Wystawiona' : 'Zaplacona')
        loadEwidencja()
    }
    const getDisplayStatus = (item: any) => {
        if (item.paymentStatus === 'Zaplacona') return 'Zaplacona'
        const daysSince = Math.floor((Date.now() - new Date(item.date).getTime()) / 86_400_000)
        return daysSince > 14 ? 'Przeterminowana' : item.paymentStatus || 'Wystawiona'
    }
    const paymentStatusConfig: Record<string, { bg: string; text: string; border: string }> = {
        Wystawiona: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
        Zaplacona: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
        Przeterminowana: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    }

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6 print:block">
            <header className="flex flex-wrap items-end justify-between gap-3 print:hidden">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/80">Finanse i dokumenty</p>
                    <h1 className="mt-1 text-3xl font-bold text-white">Rachunki</h1>
                    <p className="mt-1 text-sm text-zinc-500">Działalność nierejestrowana · sprzedawca: {SELLER.join(', ')}</p>
                </div>
            </header>

            {/* Limit kwartalny + ewidencja */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5 print:hidden">
                <section className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6 xl:col-span-2">
                    <p className="text-xs text-zinc-400">Limit działalności nierejestrowanej · {quarterLabel}</p>
                    <p className="mt-3 text-4xl font-bold text-white">{running.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
                    <p className="text-sm text-zinc-500">z {QUARTER_LIMIT.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł na kwartał</p>
                    <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-400' : 'bg-yellow-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    {pct >= 80 && pct < 100 && <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange-400"><Info size={14} /> Zbliżasz się do limitu w tym kwartale.</p>}
                    {pct >= 100 && (
                        <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                            <AlertTriangle size={14} className="mr-1 inline" /> Limit przekroczony. Masz 7 dni od przekroczenia na rejestrację działalności w CEIDG.
                        </p>
                    )}
                    <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
                        225% płacy minimalnej (4806 zł) na kwartał, od 1.01.2026. Liczy się kwota należna według daty wykonania usługi, także niezapłacona.
                        Przychód wykazujesz w PIT-36 jako przychód z innych źródeł.
                    </p>
                </section>

                <section className="overflow-x-auto rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 xl:col-span-3">
                    <p className="mb-3 text-xs font-semibold text-zinc-400">Ewidencja sprzedaży · {quarterLabel}</p>
                    {rows.length === 0 ? (
                        <p className="text-xs italic text-zinc-600">Brak dokumentów w tym kwartale.</p>
                    ) : (
                        <table className="w-full text-left text-xs text-zinc-300">
                            <thead className="border-b border-white/10 text-zinc-500">
                                <tr>
                                    <th className="py-2 font-normal">Lp.</th><th className="py-2 font-normal">Data</th><th className="py-2 font-normal">Nabywca</th>
                                    <th className="py-2 font-normal">Kwota</th><th className="py-2 font-normal">Status</th><th className="py-2 font-normal">Narastająco</th><th />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[...rows].reverse().map((e: any) => {
                                    const st = getDisplayStatus(e)
                                    const c = paymentStatusConfig[st] || paymentStatusConfig.Wystawiona
                                    return (
                                        <tr key={e.id} className="group">
                                            <td className="py-2.5 text-zinc-500">{e.lp}.</td>
                                            <td className="py-2.5">{e.date}</td>
                                            <td className="max-w-[140px] truncate py-2.5 pr-2" title={e.clientInfo}>{e.clientInfo?.split(',')[0]}</td>
                                            <td className="py-2.5 font-semibold text-white">{e.amount.toFixed(2)} zł</td>
                                            <td className="py-2.5">
                                                <button onClick={() => handlePaymentToggle(e.id, st)} className={`${c.bg} ${c.text} ${c.border} inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold`}>
                                                    {st === 'Zaplacona' ? <Check size={10} /> : st === 'Przeterminowana' ? <AlertTriangle size={10} /> : <Clock size={10} />}
                                                    {st === 'Zaplacona' ? 'Zapłacony' : st === 'Przeterminowana' ? 'Po terminie' : 'Wystawiony'}
                                                </button>
                                            </td>
                                            <td className="py-2.5 text-zinc-400">{e.runningTotal.toFixed(2)} zł</td>
                                            <td className="py-2.5 text-right">
                                                <button onClick={() => handleDeleteEwidencja(e.id)} className="text-zinc-600 opacity-0 hover:text-red-500 group-hover:opacity-100" title="Usuń"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 print:block">
                <form onSubmit={handleGenerate} className="flex flex-col gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 lg:col-span-2 print:hidden">
                    <h2 className="text-lg font-bold text-white">Nowy dokument</h2>
                    <div className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-1">
                        {(['dn', 'dzielo', 'protokol'] as const).map((k) => (
                            <button key={k} type="button" onClick={() => setKind(k)}
                                className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${kind === k ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:text-white'}`}>
                                {k === 'dn' ? 'Rachunek' : k === 'dzielo' ? 'Umowa o dzieło' : 'Protokół odbioru'}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1.5"><span className={label}>{kind === 'protokol' ? 'Data odbioru' : 'Data wykonania'}</span>
                            <input required type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className={field} /></label>
                        <label className="flex flex-col gap-1.5"><span className={label}>Data wystawienia</span>
                            <input required type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={field} /></label>
                    </div>
                    <label className="flex flex-col gap-1.5"><span className={label}>Nabywca (każda linia osobno)</span>
                        <textarea required rows={3} value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder={'Nazwa firmy albo imię i nazwisko\nul. Przykładowa 1, 35-001 Rzeszów\nNIP 000-000-00-00'} className={`${field} resize-none`} /></label>
                    <label className="flex flex-col gap-1.5"><span className={label}>Nazwa usługi</span>
                        <input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Projekt i druk 500 wizytówek" className={field} /></label>
                    <div className="grid grid-cols-3 gap-3">
                        <label className="flex flex-col gap-1.5"><span className={label}>J.m.</span>
                            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={field}><option>usł.</option><option>szt.</option><option>kpl.</option><option>godz.</option></select></label>
                        <label className="flex flex-col gap-1.5"><span className={label}>Ilość</span>
                            <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className={field} /></label>
                        {kind !== 'protokol' && <label className="flex flex-col gap-1.5"><span className={label}>Do zapłaty zł</span>
                            <input required inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1500" className={field} /></label>}
                    </div>
                    {kind !== 'protokol' && (
                        <div className="grid grid-cols-3 gap-3">
                            <label className="flex flex-col gap-1.5"><span className={label}>Zaliczka zł</span>
                                <input inputMode="decimal" value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="0" className={field} /></label>
                            <label className="flex flex-col gap-1.5"><span className={label}>Zapłata</span>
                                <select value={payment} onChange={(e) => setPayment(e.target.value)} className={field}><option>przelew</option><option>gotówka</option><option>zapłacono</option></select></label>
                            <label className="flex flex-col gap-1.5"><span className={label}>Termin dni</span>
                                <input type="number" min="0" value={dueDays} onChange={(e) => setDueDays(e.target.value)} className={field} disabled={payment !== 'przelew'} /></label>
                        </div>
                    )}
                    <label className="flex flex-col gap-1.5"><span className={label}>Uwagi (opcjonalnie)</span>
                        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${field} resize-none`} /></label>
                    <button disabled={loading} className="mt-1 rounded-full bg-yellow-400 py-3 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                        {loading ? 'Zapisuję…' : `Wystaw: ${KIND_LABEL[kind].toLowerCase()}`}
                    </button>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <p className="text-[11px] text-zinc-500">Dokument powstaje ze stałego wzoru, bez AI: to, co wpiszesz, trafia na dokument. Numer nadaje się sam (kolejny w miesiącu).</p>
                </form>

                <div className="lg:col-span-3 print:w-full">
                    {doc ? (
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl print:rounded-none print:border-0 print:shadow-none">
                            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 print:hidden">
                                <span className="text-xs font-semibold text-zinc-600">{KIND_LABEL[doc.kind]} nr {doc.number} · zapisany w ewidencji</span>
                                <div className="flex gap-2">
                                    <button onClick={() => savePdf('printable-document', `${KIND_LABEL[doc.kind].replace(/\s+/g, '_')}_${doc.number.replace(/\//g, '-')}.pdf`)}
                                        className="flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"><Download size={13} /> PDF</button>
                                    <button onClick={() => window.print()} className="flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-500"><Printer size={13} /> Drukuj</button>
                                </div>
                            </div>
                            <ReceiptDocument data={doc} id="printable-document" />
                        </div>
                    ) : (
                        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 text-center text-zinc-500 print:hidden">
                            <FileText size={48} className="opacity-30" />
                            <p className="max-w-sm text-sm">Wypełnij formularz. Tu pojawi się gotowy dokument A4 do pobrania jako PDF albo wydruku.</p>
                        </div>
                    )}
                </div>
            </div>

            <TransactionHistory
                ewidencja={ewidencja}
                getDisplayStatus={getDisplayStatus}
                paymentStatusConfig={paymentStatusConfig}
                handlePaymentToggle={handlePaymentToggle}
                handleDeleteEwidencja={handleDeleteEwidencja}
            />
        </div>
    )
}

function DocumentModal({ item, onClose, onSaved }: { item: any; onClose: () => void; onSaved: (id: string, newMarkdown: string) => void }) {
    const [editMode, setEditMode] = useState(false)
    const [draft, setDraft] = useState(item.markdownContent ?? '')
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        const ok = await updateMarkdownContent(item.id, draft)
        setSaving(false)
        if (ok) {
            onSaved(item.id, draft)
            setEditMode(false)
        }
    }

    const handlePrint = () => window.print()

    const receipt = parseReceipt(item.markdownContent)
    const handleDownloadPDF = () => savePdf('modal-printable-document', receipt ? `${KIND_LABEL[receipt.kind].replace(/\s+/g, '_')}_${receipt.number.replace(/\//g, '-')}.pdf` : `Rachunek_${item.date}.pdf`)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm print:hidden" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:rounded-none print:shadow-none print:overflow-visible">

                {/* Toolbar */}
                <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between print:hidden">
                    <span className="text-sm font-bold text-zinc-700">
                        {editMode ? '✏️ Tryb edycji' : `Podgląd dokumentu · ${item.date}`}
                    </span>
                    <div className="flex items-center gap-2">
                        {!editMode && (
                            <>
                                <button onClick={handleDownloadPDF} title="Pobierz PDF" className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-zinc-900 hover:bg-yellow-500 transition-colors">
                                    <Download size={14} />
                                </button>
                                <button onClick={handlePrint} title="Drukuj" className="w-8 h-8 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:text-black transition-colors">
                                    <Printer size={14} />
                                </button>
                                {!receipt && <button onClick={() => setEditMode(true)} title="Edytuj dokument" className="w-8 h-8 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:text-black transition-colors">
                                    <Pencil size={14} />
                                </button>}
                            </>
                        )}
                        {editMode && (
                            <>
                                <button onClick={() => { setDraft(item.markdownContent ?? ''); setEditMode(false) }} className="px-3 py-1.5 text-xs border border-zinc-300 rounded-lg text-zinc-600 hover:text-black transition-colors">
                                    Anuluj
                                </button>
                                <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1">
                                    <Save size={12} />
                                    {saving ? 'Zapisuję...' : 'Zapisz'}
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="w-8 h-8 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:text-black transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Edytor */}
                {editMode && (
                    <div className="p-6 print:hidden">
                        <p className="text-xs text-zinc-500 mb-2">Edytujesz markdown dokumentu. Zmiany zobaczysz po kliknięciu Zapisz.</p>
                        <textarea
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            className="w-full h-[60vh] font-mono text-xs bg-zinc-950 text-green-400 border border-zinc-700 rounded-xl p-4 resize-none focus:outline-none focus:border-yellow-400"
                        />
                    </div>
                )}

                {/* Podgląd */}
                {!editMode && (receipt ? (
                    <ReceiptDocument data={receipt} id="modal-printable-document" />
                ) : (
                    <div id="modal-printable-document" className="p-8 print:p-0">
                        <div className="prose prose-sm md:prose-base prose-zinc max-w-none prose-headings:font-bold prose-headings:text-black text-black">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function TransactionHistory({ ewidencja, getDisplayStatus, paymentStatusConfig, handlePaymentToggle, handleDeleteEwidencja }: {
    ewidencja: any[]
    getDisplayStatus: (item: any) => string
    paymentStatusConfig: Record<string, { bg: string; text: string; border: string }>
    handlePaymentToggle: (id: string, status: string) => void
    handleDeleteEwidencja: (id: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [filterYear, setFilterYear] = useState<string>('all')
    const [previewItem, setPreviewItem] = useState<any | null>(null)

    const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"]

    const sorted = [...ewidencja].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const years = Array.from(new Set(sorted.map(e => new Date(e.date).getFullYear().toString()))).sort((a, b) => Number(b) - Number(a))

    const filtered = filterYear === 'all' ? sorted : sorted.filter(e => new Date(e.date).getFullYear().toString() === filterYear)

    const grouped: Record<string, any[]> = {}
    filtered.forEach(e => {
        const d = new Date(e.date)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(e)
    })

    const grandTotal = filtered.reduce((s, e) => s + e.amount, 0)
    const paidTotal = filtered.filter(e => getDisplayStatus(e) === 'Zaplacona').reduce((s, e) => s + e.amount, 0)

    return (
        <>
        {previewItem && (
            <DocumentModal
                item={previewItem}
                onClose={() => setPreviewItem(null)}
                onSaved={(id, newMarkdown) => {
                    setPreviewItem((prev: any) => prev ? { ...prev, markdownContent: newMarkdown } : null)
                }}
            />
        )}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl print:hidden">
            <button
                onClick={() => setIsOpen(v => !v)}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <div className="flex items-center gap-3">
                    <History size={20} className="text-yellow-400" />
                    <div>
                        <h2 className="text-lg font-bold text-white">Historia wszystkich transakcji</h2>
                        <p className="text-xs text-zinc-500">{ewidencja.length} wpisów · łącznie: {grandTotal.toFixed(2)} zł</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
            </button>

            {isOpen && (
                <div className="px-6 pb-6 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Rok:</span>
                            {['all', ...years].map(y => (
                                <button
                                    key={y}
                                    onClick={() => setFilterYear(y)}
                                    className={`px-3 py-1 text-xs rounded border transition-colors ${filterYear === y ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}
                                >
                                    {y === 'all' ? 'Wszystkie' : y}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-6 text-xs">
                            <span className="text-zinc-500">Wpłynęło: <span className="text-green-400 font-bold font-mono">{paidTotal.toFixed(2)} zł</span></span>
                            <span className="text-zinc-500">Łącznie: <span className="text-white font-bold font-mono">{grandTotal.toFixed(2)} zł</span></span>
                        </div>
                    </div>

                    {Object.keys(grouped).length === 0 ? (
                        <p className="text-zinc-600 text-sm italic text-center py-4">Brak transakcji.</p>
                    ) : (
                        Object.entries(grouped).map(([key, items]) => {
                            const [year, month] = key.split('-').map(Number)
                            const monthTotal = items.reduce((s, e) => s + e.amount, 0)
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{monthNames[month]} {year}</h3>
                                        <span className="text-xs text-zinc-500 font-mono">{monthTotal.toFixed(2)} zł</span>
                                    </div>
                                    <div className="overflow-x-auto rounded-xl border border-zinc-800">
                                        <table className="w-full text-left text-xs text-zinc-300">
                                            <thead className="text-zinc-500 border-b border-zinc-800 bg-zinc-950">
                                                <tr>
                                                    <th className="font-normal py-2 px-3">Data</th>
                                                    <th className="font-normal py-2 px-3">Klient</th>
                                                    <th className="font-normal py-2 px-3">Opis</th>
                                                    <th className="font-normal py-2 px-3">Dokument</th>
                                                    <th className="font-normal py-2 px-3">Kwota</th>
                                                    <th className="font-normal py-2 px-3">Status</th>
                                                    <th className="font-normal py-2 px-3 w-16"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-800/50">
                                                {items.map((e: any) => {
                                                    const displayStatus = getDisplayStatus(e)
                                                    const pCfg = paymentStatusConfig[displayStatus] || paymentStatusConfig.Wystawiona
                                                    return (
                                                        <tr key={e.id} className="hover:bg-zinc-800/30 transition-colors group">
                                                            <td className="py-2.5 px-3 whitespace-nowrap">{e.date}</td>
                                                            <td className="py-2.5 px-3 max-w-[140px] truncate" title={e.clientInfo}>{e.clientInfo?.split(',')[0]}</td>
                                                            <td className="py-2.5 px-3 max-w-[200px] truncate text-zinc-400" title={e.description}>{e.description}</td>
                                                            <td className="py-2.5 px-3 text-zinc-500 whitespace-nowrap">
                                                                {e.documentType?.includes('Faktura') ? 'Faktura' : e.documentType?.includes('Umowa') ? 'Umowa' : e.documentType?.includes('Protokół') ? 'Protokół' : 'Rachunek'}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-bold text-green-400 whitespace-nowrap font-mono">+{e.amount.toFixed(2)} zł</td>
                                                            <td className="py-2.5 px-3">
                                                                <button
                                                                    onClick={() => handlePaymentToggle(e.id, displayStatus)}
                                                                    className={`${pCfg.bg} ${pCfg.text} ${pCfg.border} border px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
                                                                >
                                                                    {displayStatus === 'Zaplacona' ? <Check size={10} /> : displayStatus === 'Przeterminowana' ? <AlertTriangle size={10} /> : <Clock size={10} />}
                                                                    {displayStatus}
                                                                </button>
                                                            </td>
                                                            <td className="py-2.5 px-3 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setPreviewItem(e)}
                                                                        className={`transition-colors ${e.markdownContent ? 'text-yellow-400 hover:text-yellow-300' : 'text-zinc-600 hover:text-zinc-400'}`}
                                                                        title={e.markdownContent ? 'Podgląd i edycja dokumentu' : 'Edytuj / wprowadź dokument ręcznie'}
                                                                    >
                                                                        {e.markdownContent ? <Eye size={14} /> : <Pencil size={14} />}
                                                                    </button>
                                                                    <button onClick={() => handleDeleteEwidencja(e.id)} className="text-zinc-700 hover:text-red-500 transition-colors" title="Usuń">
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}
        </div>
        </>
    )
}
