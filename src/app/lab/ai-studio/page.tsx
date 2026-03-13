'use client'

import { useState } from 'react'
import { generateContent, generateQuote } from './actions'
import { Bot, PenTool, Calculator, Send } from 'lucide-react'

export default function AIStudioPage() {
    const [activeTab, setActiveTab] = useState<'content' | 'quote'>('content')

    const [topic, setTopic] = useState('')
    const [platform, setPlatform] = useState('LinkedIn')
    const [clientMessage, setClientMessage] = useState('')

    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const handleContentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)
        const res = await generateContent(topic, platform)
        if (res.success && res.data) {
            setResult(res.data)
        } else {
            setResult('Wystąpił błąd: ' + res.error)
        }
        setLoading(false)
    }

    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)
        const res = await generateQuote(clientMessage)
        if (res.success && res.data) {
            setResult(res.data)
        } else {
            setResult('Wystąpił błąd: ' + res.error)
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <Bot size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">AI Studio & Mentor</h1>
                    <p className="text-zinc-400 text-sm">Twoje centrum generowania postów i wycen.</p>
                </div>
            </div>

            <div className="flex gap-4 border-b border-zinc-800 pb-2">
                <button
                    onClick={() => { setActiveTab('content'); setResult(null) }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'content' ? 'bg-zinc-800 text-yellow-400' : 'text-zinc-400 hover:text-white'}`}
                >
                    <PenTool size={16} />
                    Content Generator
                </button>
                <button
                    onClick={() => { setActiveTab('quote'); setResult(null) }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'quote' ? 'bg-zinc-800 text-yellow-400' : 'text-zinc-400 hover:text-white'}`}
                >
                    <Calculator size={16} />
                    Wyceniacz Zapytań
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Form Column */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
                    {activeTab === 'content' ? (
                        <form onSubmit={handleContentSubmit} className="flex flex-col gap-5">
                            <h2 className="text-lg font-bold text-white mb-2">Stwórz nowy wpis</h2>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-zinc-400">Platforma docelowa</label>
                                <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-2.5"
                                >
                                    <option value="LinkedIn">LinkedIn (Profesjonalny & Luźny)</option>
                                    <option value="Instagram">Instagram (Wizualny & Hasztagi)</option>
                                    <option value="Facebook">Facebook / Fanpage</option>
                                    <option value="Blog">Artykuł Biznesowy na Bloga</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-zinc-400">Temat / Pomysł na wpis</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="NP: Jak ważne jest ciemne tło i złote akcenty w budowaniu marek premium?"
                                    className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-2.5 resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Sztuczna Inteligencja pracuje...' : <><Send size={18} /> Generuj Wpis</>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleQuoteSubmit} className="flex flex-col gap-5">
                            <h2 className="text-lg font-bold text-white mb-2">Prześwietl zapytanie od klienta</h2>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-zinc-400">Wklej treść maila lub wiadomości od klienta</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={clientMessage}
                                    onChange={(e) => setClientMessage(e.target.value)}
                                    placeholder="Cześć! Potrzebuję małej stronki dla mechanika, tylko kontakt i mapka, ale żeby fajnie i nowocześnie wyglądało. Jaka cena i czas?"
                                    className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-2.5 resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Analizowanie zapytania...' : <><Bot size={18} /> Przygotuj wycenę & odpowiedź</>}
                            </button>
                        </form>
                    )}
                </div>

                {/* Output Column */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl min-h-[400px]">
                    <h2 className="text-lg font-bold text-zinc-300 mb-4 border-b border-zinc-800 pb-3">
                        {activeTab === 'content' ? 'Wygenerowany Wpis' : 'Wynik Analizy & Wycena'}
                    </h2>

                    <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-zinc-500 italic mt-20">
                                Pulsowanie serwerów... Kompilowanie idealnych słów...
                            </div>
                        ) : result ? (
                            <div dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>') }} />
                        ) : (
                            <div className="text-zinc-500 italic mt-20 text-center">
                                Wpisz dane po lewej i pozwól Agentowi wykonać magiczną robotę.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
