'use client'

import { useEffect, useState } from 'react'
import { getCalendar, addCalendarEvent, updateEventStatus } from './actions'
import { CalendarDays, Lightbulb, Target, MoreHorizontal, Bot, ChevronLeft, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'

export default function CalendarLab() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // formularz dodawania
    const [topic, setTopic] = useState('')
    const [platform, setPlatform] = useState('Instagram, Facebook')
    const [formatPost, setFormatPost] = useState('Post')
    const [goal, setGoal] = useState('Edukacja')
    const [date, setDate] = useState('')
    const [generateAI, setGenerateAI] = useState(false)
    const [saving, setSaving] = useState(false)

    // state kalendarza
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())

    async function loadData() {
        setLoading(true)
        const data = await getCalendar()
        setEvents(data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()))
        setLoading(false)
    }

    useEffect(() => {
        loadData()
        setDate(format(new Date(), 'yyyy-MM-dd'))
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        await addCalendarEvent({ topic, platform, format: formatPost, goal, date, status: 'Szkic', generateAI })
        setTopic('')
        setGenerateAI(false)
        setSaving(false)
        loadData()
    }

    const handleUpdate = async (id: string, newStatus: string) => {
        await updateEventStatus(id, newStatus)
        loadData()
    }

    const goalColors: any = {
        'Edukacja': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        'Zaangażowanie': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        'Sprzedaż': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    }

    const goalIcons: any = {
        'Edukacja': <Lightbulb size={14} />,
        'Zaangażowanie': <MoreHorizontal size={14} />,
        'Sprzedaż': <Target size={14} />
    }

    // Funkcje kalendarza
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const onDateClick = (dayStr: Date) => {
        setSelectedDate(dayStr)
        setDate(format(dayStr, 'yyyy-MM-dd'))
    }

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const calendarDays = []
    let currentDay = startDate
    while (currentDay <= endDate) {
        calendarDays.push(currentDay)
        currentDay = addDays(currentDay, 1)
    }

    const selectedDateEvents = events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd'))

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <CalendarDays size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Kalendarz Publikacji</h1>
                    <p className="text-zinc-400 text-sm">Planuj treść pod sprzedaż, z widokiem całego miesiąca i magicznym generatorem.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                {/* Kolumna Dodawania (Lewa) */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl sticky top-4">
                    <h2 className="text-lg font-bold text-white mb-4">Dodaj na wybrany dzień</h2>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Data Publikacji</label>
                            <input required type="date" value={date} onChange={e => {
                                setDate(e.target.value);
                                if (e.target.value) {
                                    setSelectedDate(new Date(e.target.value));
                                }
                            }} className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Temat wpisu</label>
                            <textarea required value={topic} onChange={e => setTopic(e.target.value)} rows={2} placeholder="O czym chces napisać?" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5 resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Platformy</label>
                                <input value={platform} onChange={e => setPlatform(e.target.value)} placeholder="IG, Facebook..." className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Format</label>
                                <input value={formatPost} onChange={e => setFormatPost(e.target.value)} placeholder="Rolka, Karuzela..." className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Cel Publikacji</label>
                            <select value={goal} onChange={e => setGoal(e.target.value)} className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5">
                                <option value="Edukacja">Edukacja (Tłumaczenie pojęć, procesy)</option>
                                <option value="Zaangażowanie">Zaangażowanie (Relacje, błędy, rozrywka)</option>
                                <option value="Sprzedaż">Sprzedaż (Case Study, Oferty, Pakiety)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 mt-2 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                            <input type="checkbox" id="ai-gen" checked={generateAI} onChange={e => setGenerateAI(e.target.checked)} className="w-4 h-4 accent-yellow-400 cursor-pointer" />
                            <label htmlFor="ai-gen" className="text-sm text-yellow-500 font-bold flex items-center gap-2 cursor-pointer select-none">
                                <Bot size={16} /> Generuj od razu treść (AI)
                            </label>
                        </div>

                        <button disabled={saving} className="bg-zinc-800 hover:bg-yellow-400 hover:text-black border border-zinc-700 hover:border-yellow-400 text-white font-bold py-2.5 rounded-lg transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-wait">
                            {saving ? 'Zapisuję w Systemie...' : 'Zapisz w Planie'}
                        </button>
                    </form>
                </div>

                {/* Tablica Kalendarza (Prawa) */}
                <div className="lg:col-span-3 flex flex-col gap-6">

                    {/* WIDOK MIESIĄCA - SIATKA */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl w-full">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={prevMonth} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"><ChevronLeft size={20} /></button>
                            <h2 className="text-xl font-bold text-white uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy', { locale: pl })}</h2>
                            <button onClick={nextMonth} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"><ChevronRight size={20} /></button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            <div>Pon</div><div>Wto</div><div>Śro</div><div>Czw</div><div>Pią</div><div>Sob</div><div>Nie</div>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day, idx) => {
                                const formattedDate = format(day, 'yyyy-MM-dd')
                                const dayEvents = events.filter(e => e.date === formattedDate)
                                const isSelected = isSameDay(day, selectedDate)
                                const isCurrentMonth = isSameMonth(day, currentMonth)

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => onDateClick(day)}
                                        className={`min-h-[80px] p-2 rounded-xl border cursor-pointer transition-all flex flex-col items-start justify-start ${!isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'border-yellow-400 bg-yellow-400/5 shadow-[0_0_15px_rgba(255,235,82,0.15)] ring-1 ring-yellow-400' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'}`}
                                    >
                                        <span className={`text-sm font-bold mb-1 ${isSelected ? 'text-yellow-400' : 'text-zinc-400'}`}>{format(day, 'd')}</span>
                                        <div className="flex flex-col gap-1 w-full overflow-hidden">
                                            {dayEvents.map(e => (
                                                <div key={e.id} className="w-full flex items-center justify-between" title={e.topic}>
                                                    <div className={`w-full h-1.5 md:h-2 opacity-80 rounded-full shrink-0 ${e.goal === 'Edukacja' ? 'bg-blue-400' :
                                                        e.goal === 'Zaangażowanie' ? 'bg-purple-400' :
                                                            'bg-yellow-400'
                                                        }`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* LEGENDA */}
                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-zinc-800/80 text-xs font-medium text-zinc-500">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Edukacja</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Zaangażowanie</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Sprzedaż</span>
                        </div>
                    </div>


                    {/* LISTA POSTÓW Z WYBRANEGO DNIA */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl w-full min-h-[300px]">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            Publikacje zaplanowane na: <span className="text-yellow-400">{format(selectedDate, 'dd MMMM yyyy', { locale: pl })}</span>
                        </h3>

                        {loading ? <p className="text-zinc-500">Wczytywanie...</p> : selectedDateEvents.length === 0 ? <p className="text-zinc-500 italic">Brak planu na ten dzień. Wykorzystaj panel po lewej stronie.</p> : (
                            <div className="space-y-6">
                                {selectedDateEvents.map((ev, idx) => (
                                    <div key={ev.id} className={`flex flex-col gap-4 p-5 rounded-xl border ${ev.status === 'Opublikowane' ? 'bg-zinc-950/50 border-zinc-800/30 opacity-60' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors'}`}>

                                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                                            <div className="flex flex-col gap-2 w-full">
                                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                                    <span>{ev.platform}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                                    <span>{ev.format}</span>
                                                    <span className={`px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1 inline-flex ${goalColors[ev.goal] || 'text-zinc-400'}`}>
                                                        {goalIcons[ev.goal]} {ev.goal}
                                                    </span>
                                                </div>

                                                <h3 className={`text-xl font-medium tracking-wide leading-relaxed font-sans ${ev.status === 'Opublikowane' ? 'text-zinc-500 line-through decoration-zinc-800' : 'text-zinc-200'}`}>
                                                    {ev.topic}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1 border border-zinc-800 shrink-0">
                                                <button onClick={() => handleUpdate(ev.id, 'Szkic')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${ev.status === 'Szkic' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>Szkic</button>
                                                <button onClick={() => handleUpdate(ev.id, 'Zaplanowane')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${ev.status === 'Zaplanowane' ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}>W kolejce</button>
                                                <button onClick={() => handleUpdate(ev.id, 'Opublikowane')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${ev.status === 'Opublikowane' ? 'bg-green-500/20 text-green-400' : 'text-zinc-500 hover:text-white'}`}>Opubliko.</button>
                                            </div>
                                        </div>

                                        {ev.content && (
                                            <div className="mt-2 bg-zinc-900 border border-yellow-500/20 p-5 rounded-lg">
                                                <p className="text-xs uppercase font-bold text-yellow-500 mb-4 flex items-center gap-1"><Bot size={14} /> Wygenerowana Treść (AI - Tone of WUYO)</p>
                                                <div className="prose prose-sm prose-invert prose-yellow max-w-none text-zinc-300 font-sans leading-relaxed">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {ev.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    )
}
