import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getLeads } from './crm/actions'
import { getProjects } from './projects/actions'
import { getCalendar } from './calendar/actions'
import { getAlerts } from './actions'
import { Bot, Play, Inbox, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

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
        danger: 'border-l-red-500 bg-red-500/5 hover:bg-red-500/10',
        warning: 'border-l-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10',
        success: 'border-l-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10',
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Witaj z powrotem w Laboratorium!</h1>
                <p className="text-zinc-400">Twoj panel dowodzenia jest aktywny. Co dzisiaj optymalizujemy?</p>
            </div>

            {/* ── Smart Alerts ── */}
            {alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {alerts.map((alert, i) => (
                        <Link
                            key={i}
                            href={alert.href}
                            className={`flex items-start gap-3 p-4 rounded-xl border-l-4 border border-zinc-800/50 transition-colors ${alertStyles[alert.type]}`}
                        >
                            {alertIcons[alert.type]}
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white">{alert.title}</p>
                                <p className="text-xs text-zinc-400 mt-0.5">{alert.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/lab/crm" className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl hover:border-yellow-400/50 transition-colors group">
                    <div className="flex justify-between items-start">
                        <h2 className="text-zinc-400 font-medium mb-1 group-hover:text-zinc-300">Skrzynka Odbiorcza</h2>
                        <Inbox size={20} className="text-zinc-600 group-hover:text-yellow-400" />
                    </div>
                    <p className="text-4xl font-bold text-yellow-400">{leads.length}</p>
                    <p className="text-sm text-zinc-500 mt-2">Aktywne leady i briefy</p>
                </Link>
                <Link href="/lab/projects" className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl hover:border-white/20 transition-colors group">
                    <div className="flex justify-between items-start">
                        <h2 className="text-zinc-400 font-medium mb-1 group-hover:text-zinc-300">Strefy Klienta</h2>
                        <Play size={20} className="text-zinc-600 group-hover:text-white" />
                    </div>
                    <p className="text-4xl font-bold text-white">{projects.length}</p>
                    <p className="text-sm text-zinc-500 mt-2">Dostarczane projekty</p>
                </Link>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-transparent blur-xl" />
                    <div className="relative z-10 flex justify-between items-start">
                        <h2 className="text-zinc-400 font-medium mb-1">Aktywne projekty</h2>
                        <Bot size={20} className="text-yellow-500" />
                    </div>
                    <p className="text-4xl font-bold text-yellow-400 relative z-10">{activeProjectsCount}</p>
                    <p className="text-sm text-yellow-500/80 mt-2 flex items-center gap-1 relative z-10">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        AI System aktywny
                    </p>
                </div>
            </div>

            {/* ── AI Mentor ── */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-yellow-900/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                    <div className="w-48 h-48 bg-yellow-400 rounded-full" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500">
                            <Bot size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Raport od AI Mentora</h2>
                    </div>
                    <p className="text-zinc-300 mb-6 max-w-2xl leading-relaxed">{mentorMessage}</p>
                    <Link href={mentorCTAHref} className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-medium px-5 py-2 rounded-lg transition-colors text-sm shadow-lg shadow-yellow-500/20">
                        {mentorCTALabel}
                    </Link>
                </div>
            </div>
        </div>
    )
}
