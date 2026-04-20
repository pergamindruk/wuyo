'use client'

import { useState, useEffect } from 'react'
import { getVercelAnalytics } from './actions'
import type { AnalyticsData } from './actions'
import { TrendingUp, Users, Activity, Globe, ExternalLink, AlertTriangle } from 'lucide-react'

export default function AnalyticsLab() {
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

    const hasRealData = analytics?.available === true

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <Activity size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-zinc-400 text-sm">
                        Statystyki wuyo.pl z ostatnich 7 dni
                        {hasRealData && <span className="text-emerald-400 ml-2">&#x2022; Live Data</span>}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-4 max-w-2xl">
                <h2 className="text-lg font-bold text-white">
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
                    <div className="bg-zinc-900 border border-dashed border-zinc-700 p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-4 min-h-[280px]">
                        <AlertTriangle size={32} className="text-zinc-600" />
                        <div>
                            <p className="text-sm text-zinc-400 font-medium mb-1">Brak danych analitycznych</p>
                            <p className="text-xs text-zinc-600 leading-relaxed max-w-xs">
                                Dodaj <code className="text-yellow-400/70 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">VERCEL_API_TOKEN</code> i <code className="text-yellow-400/70 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">VERCEL_PROJECT_ID</code> w Vercel, aby zobaczyc statystyki wuyo.pl.
                            </p>
                            {analytics?.debugError && (
                                <p className="text-xs text-red-400 mt-3 font-mono bg-zinc-950 px-2 py-1 rounded">{analytics.debugError}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

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
