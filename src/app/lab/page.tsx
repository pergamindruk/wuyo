import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getLeads } from './crm/actions'
import { getProjects } from './projects/actions'
import { getCalendar } from './calendar/actions'
import { Bot, Play, Inbox } from 'lucide-react'

export default async function LabDashboard() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/lab/login')
    }

    const leads = await getLeads()
    const projects = await getProjects()
    const calendar = await getCalendar()

    // Analyze status for Mentor
    let mentorMessage = "System działa poprawnie. Oczekuję na nowe zdarzenia."
    if (leads.length > 0) {
        mentorMessage = `Cześć! Widzę, że masz w skrzynce **${leads.length} nieodpowiedzianych zapytań** (leadów/briefów). Może skoczymy do AI Studio, by szybko przygotować dla nich wyceny?`
    } else if (projects.length > 0) {
        const activeProjects = projects.filter((p: any) => p.progress < 100)
        mentorMessage = `Cześć! Pracujesz obecnie nad **${activeProjects.length} projektami**. Pamiętaj, żeby regularnie podbijać statusy w Portalu Klienta, aby klienci byli na bieżąco!`
    }

    // Nadpisanie kalendarzem jeśli brakuje postów
    const unposted = calendar.filter((c: any) => c.status !== 'Opublikowane')
    if (unposted.length > 0 && leads.length === 0) {
        mentorMessage = `Mamy w kalendarzu zaplanowane posty (${unposted.length} szt.), które nie zostały opublikowane. Skocz do AI Studio by wygenerować ich treść i zrealizować plan uwzględniając marketing na rok 2026!`
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Witaj z powrotem w Laboratorium, Twórco!</h1>
                <p className="text-zinc-400">Twój panel dowodzenia jest aktywny. Co dzisiaj optymalizujemy?</p>
            </div>

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
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-transparent blur-xl"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <h2 className="text-zinc-400 font-medium mb-1">Status Systemu (AI)</h2>
                        <Bot size={20} className="text-yellow-500" />
                    </div>
                    <p className="text-4xl font-bold text-zinc-300">ON</p>
                    <p className="text-sm text-yellow-500/80 mt-2 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        Optymalne warunki
                    </p>
                </div>
            </div>

            {/* AI Mentor Module */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-yellow-900/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                    <div className="w-48 h-48 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500">
                            <Bot size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Raport od AI Mentora</h2>
                    </div>
                    <p className="text-zinc-300 mb-6 max-w-2xl leading-relaxed" dangerouslySetInnerHTML={{ __html: mentorMessage.replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>') }}>
                    </p>
                    <div className="flex gap-3">
                        <Link href="/lab/ai-studio" className="bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-medium px-5 py-2 rounded-lg transition-colors text-sm shadow-lg shadow-yellow-500/20 text-center flex items-center justify-center">
                            Przejdź do AI Studio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
