import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getLeads } from './crm/actions'
import { getProjects } from './projects/actions'
import { getCalendar } from './calendar/actions'
import { getAlerts } from './actions'
import { Bot, Play, Inbox, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { DashboardAlerts } from '@/components/lab/DashboardAlerts'

export default async function LabDashboard() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/lab/login')
    }

    const [leads, projects, calendar, alerts] = await Promise.all([
        getLeads(),
        getProjects(),
        getCalendar(),
        getAlerts(),
    ])

    // Analyze status for Mentor
    let mentorMessage = "System dziala poprawnie. Oczekuje na nowe zdarzenia."
    let mentorCTALabel = "Przejdz do AI Studio"
    let mentorCTAHref = "/lab/ai-studio"

    if (leads.length > 0) {
        mentorMessage = `Masz w skrzynce ${leads.length} zapytan. Skocz do AI Studio, by przygotowac wyceny!`
        mentorCTALabel = "Przejdz do AI Studio"
        mentorCTAHref = "/lab/ai-studio"
    } else if (projects.length > 0) {
        const activeProjects = projects.filter((p: { progress: number }) => p.progress < 100)
        if (activeProjects.length > 0) {
            mentorMessage = `Pracujesz nad ${activeProjects.length} projektami. Pamietaj o aktualizacji statusow w Portalu Klienta!`
            mentorCTALabel = "Otworz Portal Klienta"
            mentorCTAHref = "/lab/projects"
        }
    }

    const unposted = calendar.filter((c: { status: string }) => c.status !== 'Opublikowane')
    if (unposted.length > 0 && leads.length === 0) {
        mentorMessage = `Masz ${unposted.length} zaplanowanych postow do publikacji. Wygeneruj tresc i zrealizuj plan!`
        mentorCTALabel = "Generuj tresci"
        mentorCTAHref = "/lab/social-dashboard"
    }

    const activeProjectsCount = projects.filter((p: { progress: number }) => p.progress < 100).length

    const alertIcons = {
        danger: <AlertTriangle size={18} className="text-red-400 shrink-0" />,
        warning: <AlertCircle size={18} className="text-yellow-400 shrink-0" />,
        success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
    }

    const alertStyles = {
        danger: 'border-l-red-500/60 hover:border-l-red-500/80 hover:bg-zinc-900',
        warning: 'border-l-yellow-500/60 hover:border-l-yellow-500/80 hover:bg-zinc-900',
        success: 'border-l-emerald-500/60 hover:border-l-emerald-500/80 hover:bg-zinc-900',
    }

    const avgProgress = projects.length > 0
        ? Math.round(projects.reduce((sum: number, p: { progress: number }) => sum + (p.progress ?? 0), 0) / projects.length)
        : 0

    return (
        <div className="flex flex-col gap-8 max-w-5xl">
            <DashboardAlerts alerts={alerts} />

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500/80 mb-2">
                        Panel Operacyjny
                    </p>
                    <h1 className="text-2xl font-bold text-white leading-tight">Laboratorium WUYO</h1>
                    <p className="text-zinc-600 text-sm mt-1">
                        {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    AI aktywny
                </div>
            </div>

            {/* ── Smart Alerts ── */}
            {alerts.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-700">
                        Alerty · {alerts.length}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {alerts.map((alert, i) => (
                            <Link
                                key={i}
                                href={alert.href}
                                className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-2 border border-zinc-800/50 transition-colors ${alertStyles[alert.type]}`}
                            >
                                {alertIcons[alert.type]}
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-white">{alert.title}</p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{alert.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Skrzynka Odbiorcza */}
                <Link href="/lab/crm" className="group bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 p-5 rounded-xl transition-colors">
                    <div className="flex items-center justify-between mb-5">
                        <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">Skrzynka</span>
                        <Inbox size={14} className="text-zinc-700 group-hover:text-yellow-400/70 transition-colors" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className={`font-heading text-5xl font-bold leading-none ${leads.length > 0 ? 'text-yellow-400' : 'text-zinc-700'}`}>
                            {leads.length > 0 ? leads.length : '—'}
                        </span>
                        {leads.length > 0 && <span className="text-xs text-zinc-600">leadów</span>}
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-3">
                        {leads.length > 0 ? 'Wymaga uwagi' : 'Brak nowych leadów'}
                    </p>
                </Link>

                {/* Strefy Klienta */}
                <Link href="/lab/projects" className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl transition-colors">
                    <div className="flex items-center justify-between mb-5">
                        <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">Projekty</span>
                        <Play size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className={`font-heading text-5xl font-bold leading-none ${projects.length > 0 ? 'text-white' : 'text-zinc-700'}`}>
                            {projects.length > 0 ? projects.length : '—'}
                        </span>
                        {projects.length > 0 && <span className="text-xs text-zinc-600">aktywnych</span>}
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-3">
                        {projects.length > 0 ? 'Strefy Klienta' : 'Brak projektów'}
                    </p>
                </Link>

                {/* Aktywne projekty — registration mark signature */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl relative overflow-hidden">
                    {/* Registration mark corners — print studio signature */}
                    <div className="absolute top-3 left-3 w-3 h-3 border-l border-t border-yellow-400/25" />
                    <div className="absolute top-3 right-3 w-3 h-3 border-r border-t border-yellow-400/25" />
                    <div className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-yellow-400/25" />
                    <div className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-yellow-400/25" />

                    <div className="flex items-center justify-between mb-5">
                        <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">Produkcja</span>
                        <Bot size={14} className="text-yellow-500/50" />
                    </div>
                    {activeProjectsCount > 0 ? (
                        <>
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-heading text-5xl font-bold leading-none text-yellow-400">{activeProjectsCount}</span>
                                <span className="text-xs text-zinc-600">w toku</span>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between font-heading text-[9px] uppercase tracking-[0.15em] text-zinc-700 mb-2">
                                    <span>Średni postęp</span>
                                    <span>{avgProgress}%</span>
                                </div>
                                <div className="w-full h-px bg-zinc-800">
                                    <div className="h-px bg-yellow-400/70 transition-all duration-700" style={{ width: `${avgProgress}%` }} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <span className="font-heading text-5xl font-bold leading-none text-zinc-700">—</span>
                    )}
                </div>
            </div>

            {/* ── AI Mentor ── */}
            <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg border border-yellow-500/20 bg-yellow-500/5 flex items-center justify-center text-yellow-500/70 shrink-0">
                        <Bot size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-700 mb-2">
                            AI Mentor
                        </p>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-4 max-w-xl">{mentorMessage}</p>
                        <Link
                            href={mentorCTAHref}
                            className="inline-flex items-center bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold px-4 py-2 rounded-lg transition-colors text-xs"
                        >
                            {mentorCTALabel}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
