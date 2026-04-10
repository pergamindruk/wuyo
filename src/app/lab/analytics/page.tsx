'use client'

import { useState, useEffect } from 'react'
import { getSeoSuggestions, getVercelAnalytics } from './actions'
import type { AnalyticsData } from './actions'
import { TrendingUp, Users, Target, Activity, Brain, Fingerprint, Globe, ExternalLink, AlertTriangle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AnalyticsLab() {
    const [suggestionData, setSuggestionData] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [analyticsLoading, setAnalyticsLoading] = useState(true)

    useEffect(() => {
        (async () => {
            setAnalyticsLoading(true)
            const data = await getVercelAnalytics()
            setAnalytics(data)
            setAnalyticsLoading(false)
        })()
    }, [])

    const buildRealDataContext = () => {
        if (!analytics?.available) return undefined
        const lines: string[] = []
        if (analytics.pageViews) lines.push(`- Odslon: ${analytics.pageViews}`)
        if (analytics.visitors) lines.push(`- Unikalnych wizyt (est.): ${analytics.visitors}`)
        if (analytics.topPages?.length) {
            lines.push('- Top strony:')
            analytics.topPages.forEach(p => lines.push(`  - ${p.page}: ${p.views} odslon`))
        }
        if (analytics.topReferrers?.length) {
            lines.push('- Zrodla ruchu:')
            analytics.topReferrers.forEach(r => lines.push(`  - ${r.referrer}: ${r.views}`))
        }
        return lines.length > 0 ? lines.join('\n') : undefined
    }

    const fetchSeoInsights = async () => {
        setLoading(true)
        setError('')
        const realData = buildRealDataContext()
        const res = await getSeoSuggestions(realData)
        if (res.success && res.data) {
            setSuggestionData(res.data)
        } else {
            setError(res.error || 'Wystapil nieznany blad.')
        }
        setLoading(false)
    }

    const hasRealData = analytics?.available === true

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <Activity size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Harbor SEO AI</h1>
                    <p className="text-zinc-400 text-sm">
                        Twoj hakerski panel dowodzenia i mentor optymalizacyjny z 2026 r.
                        {hasRealData && <span className="text-emerald-400 ml-2">&#x2022; Live Data</span>}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

                {/* ── Left: Stats ── */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-white mb-2">
                        Twoje Liczby (Ostatnie 7 dni)
                        {hasRealData && (
                            <span className="ml-2 text-xs font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                LIVE
                            </span>
                        )}
                    </h2>

                    {analyticsLoading ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl animate-pulse">
                                    <div className="h-4 w-16 bg-zinc-800 rounded mb-4" />
                                    <div className="h-3 w-24 bg-zinc-800 rounded mb-2" />
                                    <div className="h-8 w-20 bg-zinc-800 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : hasRealData ? (
                        /* ── Real data cards ── */
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard
                                    icon={<Globe size={20} className="text-blue-400" />}
                                    label="Odslony"
                                    value={formatNum(analytics!.pageViews || 0)}
                                    live
                                />
                                <StatCard
                                    icon={<Users size={20} className="text-emerald-400" />}
                                    label="Unikalni (est.)"
                                    value={formatNum(analytics!.visitors || 0)}
                                    live
                                />
                            </div>

                            {/* Top Pages */}
                            {analytics!.topPages && analytics!.topPages.length > 0 && (
                                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Top Strony</h3>
                                    <div className="space-y-2">
                                        {analytics!.topPages.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <span className="text-zinc-300 truncate max-w-[200px]">{p.page}</span>
                                                <span className="text-yellow-400 font-medium">{formatNum(p.views)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Referrers */}
                            {analytics!.topReferrers && analytics!.topReferrers.length > 0 && (
                                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Zrodla Ruchu</h3>
                                    <div className="space-y-2">
                                        {analytics!.topReferrers.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <span className="text-zinc-300 truncate max-w-[200px] flex items-center gap-1.5">
                                                    <ExternalLink size={12} className="text-zinc-600 shrink-0" />
                                                    {r.referrer}
                                                </span>
                                                <span className="text-yellow-400 font-medium">{formatNum(r.views)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* ── Fallback: simulated cards ── */
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard
                                    icon={<Users size={20} className="text-blue-400" />}
                                    label="Odwiedziny WWW"
                                    value="1,402"
                                    trend="+14%"
                                    trendUp
                                />
                                <StatCard
                                    icon={<Target size={20} className="text-yellow-400" />}
                                    label="Konwersja z Bota"
                                    value="3.2%"
                                    trend="+5%"
                                    trendUp
                                />
                                <StatCard
                                    icon={<Activity size={20} className="text-purple-400" />}
                                    label="Bounce Rate"
                                    value="41%"
                                    trend="-2%"
                                />
                                <StatCard
                                    icon={<Fingerprint size={20} className="text-zinc-400" />}
                                    label="Klikniecia w Cennik"
                                    value="345"
                                />
                            </div>

                            {/* Banner: connect real data */}
                            <div className="bg-yellow-500/5 border border-dashed border-yellow-500/20 p-5 rounded-2xl flex items-start gap-3">
                                <AlertTriangle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm text-yellow-400/90 font-medium">Dane symulowane</p>
                                    {analytics?.debugError && (
                                        <p className="text-xs text-red-400 mt-1 font-mono bg-zinc-900 px-2 py-1 rounded">{analytics.debugError}</p>
                                    )}
                                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                        Dodaj <code className="text-yellow-400/70 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">VERCEL_API_TOKEN</code> i <code className="text-yellow-400/70 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">VERCEL_PROJECT_ID</code> do zmiennych srodowiskowych Vercel, aby zobaczyc prawdziwe dane z wuyo.pl.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Right: SEO Strategy ── */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col relative overflow-hidden group lg:max-h-[calc(100vh-120px)] min-h-[500px]">
                    <div className="absolute top-0 right-0 p-8 opacity-20 blur-2xl pointer-events-none">
                        <div className="w-64 h-64 bg-yellow-500 rounded-full mix-blend-screen" />
                    </div>

                    <div className="p-6 md:p-8 border-b border-zinc-800 bg-zinc-950/40 relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <Activity className="text-yellow-400" />
                                Harbor Core (2026)
                            </h2>
                            <p className="text-zinc-400 text-sm mt-1">
                                Twoj system wczesnego ostrzegania i strategii SEO.
                                {hasRealData && <span className="text-emerald-400"> Zasilany prawdziwymi danymi.</span>}
                            </p>
                        </div>
                        <button
                            onClick={fetchSeoInsights}
                            disabled={loading}
                            className="bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold px-5 py-2.5 rounded-lg transition-colors shadow-[0_0_15px_rgba(255,235,82,0.3)] shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {loading ? 'Analizowanie...' : 'Generuj Strategie'}
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
                                <p>Kliknij &quot;Generuj Strategie&quot;, aby polaczyc sie z modelem i pobrac najnowsze wytyczne optymalizacyjne.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-yellow-500 pt-10">
                                <span className="w-8 h-8 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
                                <span className="text-sm font-bold uppercase tracking-widest animate-pulse">Skanowanie Algorytmow...</span>
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

// ── Helpers ──

function formatNum(n: number): string {
    return n.toLocaleString('pl-PL')
}

function StatCard({ icon, label, value, trend, trendUp, live }: {
    icon: React.ReactNode
    label: string
    value: string
    trend?: string
    trendUp?: boolean
    live?: boolean
}) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                {icon}
                {trend && (
                    <span className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-green-400' : 'text-red-500'}`}>
                        {trend} <TrendingUp size={12} className={trendUp ? '' : 'rotate-180'} />
                    </span>
                )}
                {live && (
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-medium uppercase">Live</span>
                    </span>
                )}
            </div>
            <div>
                <p className="text-zinc-500 text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
        </div>
    )
}
