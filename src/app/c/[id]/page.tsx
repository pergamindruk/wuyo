import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CheckCircle2, Circle } from 'lucide-react'

export const dynamic = 'force-dynamic'

type UpdateEntry = { date: string; status: string; progress: number; note?: string }

async function getProjectData(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) return null
    return data
}

const phases = [
    { name: 'Opracowanie Koncepcji', status: 'Briefing', threshold: 10 },
    { name: 'Szkic i Architektura', status: 'Koncept', threshold: 40 },
    { name: 'Wdrazanie Poprawek', status: 'Poprawki', threshold: 75 },
    { name: 'Finalizacja Projektu', status: 'Final', threshold: 100 },
]

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('pl-PL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export default async function ClientPortalPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const project = await getProjectData(resolvedParams.id)

    if (!project) {
        return notFound()
    }

    const updates: UpdateEntry[] = Array.isArray(project.updates) ? project.updates : []
    const hasTimeline = updates.length > 0

    // Build phase data with real dates from updates
    const phaseData = phases.map(phase => {
        const update = updates.find(u => u.status === phase.status)
        return {
            ...phase,
            date: update?.date,
            note: update?.note,
        }
    })

    return (
        <div className="min-h-screen bg-zinc-950 font-sans text-white py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-zinc-950 font-bold text-3xl mx-auto mb-6 shadow-[0_0_30px_#facc1540]">
                        W
                    </div>
                    <h2 className="text-yellow-400 font-bold tracking-widest text-sm uppercase mb-2">Prywatna Strefa Klienta</h2>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.client}</h1>
                    <p className="text-zinc-400 text-lg">Twoj projekt: <span className="text-white font-medium">{project.name}</span></p>
                </div>

                {/* Main Card */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    {/* Progress bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                        <div className="h-full bg-yellow-400 shadow-[0_0_20px_#facc15]" style={{ width: `${project.progress}%`, transition: 'width 1s ease-in-out' }} />
                    </div>

                    <h3 className="text-2xl font-bold mb-8">Postep prac realizacyjnych</h3>

                    {/* Timeline */}
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                        {phaseData.map((phase, idx) => {
                            const isCompleted = project.progress >= phase.threshold
                            const isCurrent = project.status === phase.status

                            return (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 ${isCompleted ? 'bg-yellow-400 border-yellow-900/30 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-600'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10 transition-colors`}>
                                        {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={10} />}
                                    </div>
                                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border ${isCurrent ? 'bg-zinc-800/80 border-yellow-400/50 shadow-[0_0_20px_#facc1510]' : isCompleted ? 'bg-zinc-900/80 border-zinc-700/50 opacity-80' : 'bg-transparent border-transparent opacity-40'} transition-all`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={`font-bold ${isCurrent ? 'text-yellow-400' : 'text-white'}`}>{phase.name}</h4>
                                        </div>

                                        {/* Dynamic date from updates */}
                                        {phase.date && (
                                            <p className="text-[11px] text-zinc-500 mb-1">{formatDate(phase.date)}</p>
                                        )}

                                        <p className="text-sm text-zinc-400">
                                            {phase.note
                                                ? phase.note
                                                : isCurrent ? 'Trwaja prace nad tym etapem.'
                                                : isCompleted ? 'Etap zakonczony pomyslnie.'
                                                : 'Etap oczekuje w kolejce.'}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-16 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 text-center">
                        <h4 className="text-yellow-400 font-bold mb-2">Potrzebujesz wrzucic uwagi lub materialy?</h4>
                        <p className="text-zinc-400 text-sm mb-4">Przygotowujemy dla Ciebie specjalny dysk na pliki i panel zglaszania poprawek.</p>
                        <a href="mailto:kontakt@wuyo.pl" className="inline-block px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium text-sm">
                            Na ten moment, wyslij nam maila
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
