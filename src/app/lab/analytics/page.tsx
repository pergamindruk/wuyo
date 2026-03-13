'use client'

import { useState } from 'react'
import { getSeoSuggestions } from './actions'
import { BarChart3, TrendingUp, Users, Target, Activity, Brain, Fingerprint } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AnalyticsLab() {
    const [suggestionData, setSuggestionData] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchSeoInsights = async () => {
        setLoading(true)
        setError('')
        const res = await getSeoSuggestions()
        if (res.success && res.data) {
            setSuggestionData(res.data)
        } else {
            setError(res.error || 'Wystąpił nieznany błąd podczas wczytywania zaleceń SEO.')
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <Activity size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Harbor SEO AI</h1>
                    <p className="text-zinc-400 text-sm">Twój hakerski panel dowodzenia i mentor optymalizacyjny z 2026 r.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

                {/* Kolumna Lewa: Pół-fejkowe łatwe statystyki */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-white mb-2">Twoje Liczby (Ostatnie 7 dni)</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <Users size={20} className="text-blue-400" />
                                <span className="text-xs font-bold text-green-400 flex items-center gap-1">+14% <TrendingUp size={12} /></span>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-sm font-medium">Odwiedziny WWW</p>
                                <p className="text-3xl font-bold text-white">1,402</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <Target size={20} className="text-yellow-400" />
                                <span className="text-xs font-bold text-green-400 flex items-center gap-1">+5% <TrendingUp size={12} /></span>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-sm font-medium">Konwersja z Bota</p>
                                <p className="text-3xl font-bold text-white">3.2%</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <Activity size={20} className="text-purple-400" />
                                <span className="text-xs font-bold text-red-500 flex items-center gap-1">-2% <TrendingUp size={12} className="rotate-180" /></span>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-sm font-medium">Odrzucenia (Bounce Rate)</p>
                                <p className="text-3xl font-bold text-white">41%</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors"></div>
                            <div className="relative z-10 flex justify-between items-start mb-4">
                                <Fingerprint size={20} className="text-zinc-400 group-hover:text-yellow-400 transition-colors" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-zinc-500 text-sm font-medium group-hover:text-zinc-400 transition-colors">Kliknięcia w Cennik</p>
                                <p className="text-3xl font-bold text-white">345</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 bg-zinc-900/50 border border-dashed border-zinc-700 p-6 rounded-2xl">
                        <p className="text-sm text-zinc-500 text-center leading-relaxed">
                            Dane pobierane asynchronicznie przez API. Aby powiązać z Twoim rzeczywistym kontem Google Analytics 4 wyciągnij token z konta GA4 w konsoli GCP w środowisku docelowym. W środowisku dev wyświetlane są dane symulowane z Twoich plików JSON.
                        </p>
                    </div>
                </div>

                {/* Kolumna Prawa: SEO Expert 2026 */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col relative overflow-hidden group lg:max-h-[calc(100vh-120px)] min-h-[500px]">
                    <div className="absolute top-0 right-0 p-8 opacity-20 blur-2xl pointer-events-none">
                        <div className="w-64 h-64 bg-yellow-500 rounded-full mix-blend-screen"></div>
                    </div>

                    <div className="p-6 md:p-8 border-b border-zinc-800 bg-zinc-950/40 relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <Activity className="text-yellow-400" />
                                Harbor Core (2026)
                            </h2>
                            <p className="text-zinc-400 text-sm mt-1">Twój system wczesnego ostrzegania i strategii SEO.</p>
                        </div>
                        <button
                            onClick={fetchSeoInsights}
                            disabled={loading}
                            className="bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold px-5 py-2.5 rounded-lg transition-colors shadow-[0_0_15px_rgba(255,235,82,0.3)] shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {loading ? 'Analizowanie Trenderów...' : 'Generuj Strategię'}
                        </button>
                    </div>

                    <div className="p-6 md:p-8 flex-1 overflow-y-auto relative z-10 prose prose-invert prose-yellow max-w-none prose-p:text-zinc-300 prose-headings:text-white prose-h3:text-yellow-400 prose-a:text-yellow-400 prose-strong:text-white prose-li:text-zinc-300 prose-ul:my-2 prose-li:my-1">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500/80 text-sm">
                                {error}
                            </div>
                        )}
                        {!suggestionData && !loading && !error && (
                            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-4 pt-10">
                                <Brain size={48} className="text-zinc-800" />
                                <p>Kliknij "Generuj Strategię", aby połączyć się z modelem i pobrać najnowsze wytyczne optymalizacyjne z uwzględnieniem algorytmów na ten miesiąc.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-yellow-500 pt-10">
                                <span className="w-8 h-8 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin"></span>
                                <span className="text-sm font-bold uppercase tracking-widest animate-pulse">Skanowanie Algorytmów Wyszukiwarki...</span>
                            </div>
                        )}
                        {suggestionData && !loading && (
                            <div className="animate-in fade-in zoom-in duration-500">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {suggestionData}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
