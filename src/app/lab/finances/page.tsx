'use client'

import { useEffect, useState } from 'react'
import { FileText, Save, Bot, Printer, Info, Wallet, TrendingUp, Download, Trash2, AlertTriangle } from 'lucide-react'
import { generateDocument, getEwidencja, deleteEwidencja } from './actions'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function FinancesLab() {
    const defaultDocType = 'Faktura (zwolnienie z VAT na podst. art. 113 ust. 1 i 9 ustawy o VAT)'
    const [docType, setDocType] = useState(defaultDocType)
    const [clientInfo, setClientInfo] = useState('')
    const [amount, setAmount] = useState('1500')
    const [description, setDescription] = useState('Wykonanie projektu strony internetowej One-Page')
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])

    const [loading, setLoading] = useState(false)
    const [markdown, setMarkdown] = useState('')
    const [error, setError] = useState('')
    const [ewidencja, setEwidencja] = useState<any[]>([])

    const loadEwidencja = async () => {
        const data = await getEwidencja()
        setEwidencja(data)
    }

    useEffect(() => {
        loadEwidencja()
    }, [])

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMarkdown('')

        const result = await generateDocument(docType, clientInfo, amount, description, saleDate, issueDate)
        if (result.success && result.markdown) {
            setMarkdown(result.markdown)
            loadEwidencja()
        } else {
            setError(result.error || 'Wystąpił nieznany błąd podczas generowania dokumentu.')
        }
        setLoading(false)
    }

    // --- LIMIT MIESIĘCZNY I LOGIKA KALENDARZA 2026 ---
    const selectedDateObj = new Date(saleDate)
    const currentMonth = selectedDateObj.getMonth() // 0-11
    const currentYear = selectedDateObj.getFullYear()

    // Limity dla pierwszej i drugiej połowy roku
    const LIMIT_H1 = 3604.50 // Styczeń - Czerwiec (75% z 4806)
    const LIMIT_H2 = 3604.50 // Lipiec - Grudzień (do ew. aktualizacji, gdy ustawa zmieni minimalną)
    const currentLimit = currentMonth < 6 ? LIMIT_H1 : LIMIT_H2

    // Sumowanie wpisów wyłącznie z aktualnie wybranego miesiąca i roku (na podstawie daty sprzedaży)
    const currentMonthEwidencja = ewidencja
        .filter((e: any) => {
            if (!e.date) return false;
            const d = new Date(e.date)
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // sort by oldest

    let runningTotal = 0;
    const ewidencjaWithRunningTotal = currentMonthEwidencja.map((e, index) => {
        runningTotal += e.amount;
        return { ...e, lp: index + 1, runningTotal }
    })

    const progressPercent = Math.min(100, (runningTotal / currentLimit) * 100)
    
    // Miesiące po polsku do wyświetlenia
    const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"]
    const monthLabel = `${monthNames[currentMonth]} ${currentYear}`

    const handlePrint = () => {
        window.print()
    }

    const handleDownloadPDF = async () => {
        // @ts-ignore
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.getElementById('printable-document');

        if (element) {
            const opt = {
                margin: 15,
                filename: `Dokument_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };
            html2pdf().set(opt).from(element).save();
        }
    }

    const handleDeleteEwidencja = async (id: string) => {
        if (confirm('Na pewno usunąć ten dowód sprzedaży z systemu? Zmieni to twój limit ewidencji na Pasku Postępu.')) {
            await deleteEwidencja(id)
            loadEwidencja()
        }
    }

    return (
        <div className="flex flex-col gap-8 print:gap-0 print:block">
            <div className="flex items-center gap-3 print:hidden">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <FileText size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Generator Umów i Rachunków</h1>
                    <p className="text-zinc-400 text-sm">Finanse skrojone pod regulacje z Działalności Nierejestrowanej (Limity na 2026 r.)</p>
                </div>
            </div>

            {/* Powiadomienie o załączeniu wtyczki wiedzy */}
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-4 print:hidden">
                <Info className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-blue-400 font-bold mb-1">System prawny: Aktywny z Wuyo Knowledge Base</p>
                    <p className="text-xs text-blue-300/80 leading-relaxed">Agent AI połączony z wygenerowanymi źródłami (Biznes.gov.pl, Działalność nierejestrowana: Przewodnik po rewolucji 2026 z krzywicka.pl). System uwzględnia kwartalny limit DN na rok 2026: <strong>10 813,50 zł</strong> (225% płacy minimalnej) i generuje formularze pozbawione danych m.in. PESEL jako podstawę Twojego zwolnienia podmiotowego po zmianach w podatkach.</p>
                </div>
            </div>

            {/* Monitorowanie Przychodów (Ewidencja miesięczna) */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col xl:flex-row gap-8 items-start justify-between print:hidden">
                <div className="flex-1 w-full">
                    <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Wallet className="text-yellow-400" /> Przychód w tym miesiącu ({monthLabel})</h2>
                    <div className="flex justify-between text-sm text-zinc-400 mb-2">
                        <span>Wykorzystano limitu działalności</span>
                        <span className="font-bold text-white">{runningTotal.toFixed(2)} PLN / {currentLimit.toFixed(2)} PLN</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-4 border border-zinc-800 overflow-hidden relative">
                        <div className={`h-full transition-all duration-1000 ${progressPercent >= 100 ? 'bg-red-600' : progressPercent >= 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    {progressPercent >= 80 && progressPercent < 100 && (
                        <p className="text-orange-400 text-xs mt-3 font-bold flex items-center gap-1"><Info size={14} /> Uważaj! Zbliżasz się do limitu działalności nierejestrowanej.</p>
                    )}
                    {progressPercent >= 100 && (
                        <div className="mt-4 p-4 border border-red-500/30 bg-red-500/10 rounded-xl">
                            <p className="text-red-500 text-sm font-bold flex items-center gap-2 uppercase tracking-wide"><AlertTriangle size={18} /> UWAGA! Przekroczyłeś limit.</p>
                            <p className="text-red-400/90 text-xs mt-1">Zgodnie z prawem prowadzisz już działalność gospodarczą. Masz 7 dni na złożenie wniosku CEIDG-1 w celu jej sformalizowania.</p>
                        </div>
                    )}
                    
                    {/* Podsumowanie PIT-36 */}
                    <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
                        <span className="block font-bold text-zinc-300 mb-1">Do zeznania rocznego (PIT-36 / Przychody z innych źródeł):</span>
                        Suma uzyskana w miesiącu {monthLabel}: <span className="font-mono bg-zinc-950 px-2 py-0.5 rounded text-white">{runningTotal.toFixed(2)} zł</span>
                    </div>
                </div>

                {/* Tabela Ewidencji w formacie US */}
                <div className="xl:w-[50%] w-full bg-zinc-950 p-4 border border-zinc-800 rounded-xl overflow-x-auto">
                    <p className="text-xs uppercase font-bold text-zinc-500 mb-3 flex items-center gap-2">
                        <TrendingUp size={14} /> Uproszczona Ewidencja Sprzedaży ({monthLabel})
                    </p>
                    {ewidencjaWithRunningTotal.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">Brak dokumentów datowanych na ten miesiąc.</p>
                    ) : (
                        <table className="w-full text-left text-xs text-zinc-300">
                            <thead className="text-zinc-500 border-b border-zinc-800">
                                <tr>
                                    <th className="font-normal py-2 font-mono">Lp.</th>
                                    <th className="font-normal py-2">Data sprz.</th>
                                    <th className="font-normal py-2">Dowód</th>
                                    <th className="font-normal py-2">Kwota</th>
                                    <th className="font-normal py-2 w-20">Narastająco</th>
                                    <th className="font-normal py-2 w-8 text-center"><Trash2 size={12} className="inline opacity-50" /></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {[...ewidencjaWithRunningTotal].reverse().map((e: any) => (
                                    <tr key={e.id} className="hover:bg-zinc-900/50 transition-colors">
                                        <td className="py-2.5 font-mono text-zinc-500">{e.lp}.</td>
                                        <td className="py-2.5">{e.date}</td>
                                        <td className="py-2.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] pr-2" title={e.clientInfo}>{e.clientInfo?.split(',')[0]}</td>
                                        <td className="py-2.5 font-bold text-green-400">+{e.amount} zł</td>
                                        <td className="py-2.5 text-zinc-400">{e.runningTotal.toFixed(2)} zł</td>
                                        <td className="py-2.5 text-right">
                                            <button onClick={() => handleDeleteEwidencja(e.id)} className="text-zinc-600 hover:text-red-500 transition-colors" title="Usuń z ewidencji">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:block">

                {/* Lewa: Formularz */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl sticky top-4 print:hidden">
                    <h2 className="text-lg font-bold text-white mb-4">Ustawienie Wytycznych</h2>
                    <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Rodzaj Dokumentu</label>
                            <select value={docType} onChange={e => setDocType(e.target.value)} className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5">
                                <option value="Faktura (zwolnienie z VAT na podst. art. 113 ust. 1 i 9 ustawy o VAT)">Faktura (zwolnienie z VAT)</option>
                                <option value="Umowa o Dzieło z przeniesieniem praw autorskich">Umowa o Dzieło z Prawami Autorskimi</option>
                                <option value="Protokół Zleceniodawczy z przekazaniem">Protokół Odbiorczy (zakończenie projektu)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold" title="To determinuje przypisanie do miesiąca ewidencji">Data sprzedaży / dostawy</label>
                                <input required value={saleDate} onChange={e => setSaleDate(e.target.value)} type="date" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Data wystawienia</label>
                                <input required value={issueDate} onChange={e => setIssueDate(e.target.value)} type="date" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Dane Klienta (Nabywcy)</label>
                            <textarea required value={clientInfo} onChange={e => setClientInfo(e.target.value)} rows={3} placeholder="Marek Kowalski, Ul. Zwykła 2, NIP: 1234..." className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5 resize-none" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Przedmiot Transakcji (Opis)</label>
                            <input required value={description} onChange={e => setDescription(e.target.value)} type="text" placeholder="Przygotowanie Key-Visualu Marki" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Kwota (brutto=netto w DN) w zł</label>
                            <input required value={amount} onChange={e => setAmount(e.target.value)} type="number" min="0" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                        </div>

                        <button disabled={loading} className="bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 mt-4 shadow-[0_0_15px_rgba(255,235,82,0.3)] disabled:opacity-50 disabled:cursor-wait">
                            {loading ? (
                                <>Generowanie (2026 AI)...</>
                            ) : (
                                <><Bot size={18} /> Stwórz Gotowy Dokument</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Prawa: Przeglądarka Wygenerowanego Dokumentu */}
                <div className="lg:col-span-2 print:w-full">
                    <div className="bg-zinc-100 print:bg-white text-black p-8 md:p-12 rounded-2xl shadow-xl min-h-[70vh] relative border border-zinc-300 print:border-none print:shadow-none print:m-0 print:p-0 print:min-h-0">

                        {/* Narzędzia (Tylko ekran) */}
                        {markdown && (
                            <div className="absolute top-4 right-4 flex gap-2 print:hidden z-10">
                                <button onClick={handleDownloadPDF} title="Pobierz PDF na dysk" className="w-10 h-10 bg-yellow-400 border border-yellow-500 rounded-full flex items-center justify-center text-zinc-900 hover:bg-yellow-500 transition-colors shadow-sm">
                                    <Download size={18} />
                                </button>
                                <button onClick={handlePrint} title="Drukuj do PDF (Systemowe drukuj)" className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:text-black hover:border-black transition-colors shadow-sm">
                                    <Printer size={18} />
                                </button>
                            </div>
                        )}

                        {!markdown && !loading && !error && (
                            <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 gap-4 mt-20 print:hidden">
                                <FileText size={64} className="opacity-20 text-black" />
                                <p className="text-center md:container font-medium text-lg text-zinc-600">
                                    Kliknij po lewej, a wygeneruję autorski, legalny dokument zabezpieczony przed pomyłkami podatkowymi z 2026.
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full w-full flex flex-col items-center justify-center text-yellow-500 gap-4 mt-32 print:hidden">
                                <span className="w-10 h-10 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin text-black"></span>
                                <span className="font-bold text-black uppercase tracking-widest text-sm animate-pulse">Łączenie z Bazą Prawa i Analiza Kosztów...</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-600 text-sm mt-8 print:hidden">
                                {error}
                            </div>
                        )}

                        {markdown && !loading && (
                            <div id="printable-document" className="bg-white text-black p-2 print:p-0 relative">
                                <div className="border-b border-zinc-300 pb-4 mb-8">
                                    <h1 className="text-3xl font-black tracking-tighter text-black uppercase">
                                        DOBRAGRAFA <span className="text-zinc-400">WUYO</span>
                                    </h1>
                                    <p className="text-sm text-zinc-500 font-medium">Oficjalny Dokument / Potwierdzenie Transakcji</p>
                                </div>
                                <div className="prose prose-sm md:prose-base prose-zinc max-w-none prose-headings:font-bold prose-headings:text-black text-black print:text-black pt-4">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {markdown}
                                    </ReactMarkdown>
                                </div>
                                <div className="mt-16 pt-8 border-t border-zinc-200 text-xs text-zinc-400 flex justify-between items-center opacity-80">
                                    <span>Wygenerowano autonomicznie przez System WUYO Lab</span>
                                    <span>Nierejestrowana 2026</span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

        </div>
    )
}
