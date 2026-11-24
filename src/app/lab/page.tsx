import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPinned, Sticker } from 'lucide-react'
import { SearchPill } from '@/components/lab/fx/SearchPill'
import { getAlerts } from './actions'
import { DashboardAlerts } from '@/components/lab/DashboardAlerts'
import { TZ, warsawIsoDate, warsawMidnightMs, warsawParts } from '@/lib/lab/today/format'
import { KpiRow, KPI_ICONS } from '@/components/lab/today/KpiRow'
import {
    getActivities, getJobs, getMonthGoal, getQueue, getRenewalsDue, getSubscriptions, getSystems, pickOneThing,
} from '@/lib/lab/today/queries'
import { GoalBar } from '@/components/lab/today/GoalBar'
import { OneThingCard } from '@/components/lab/today/OneThingCard'
import { CallQueue } from '@/components/lab/today/CallQueue'
import { SystemsStrip } from '@/components/lab/today/SystemsStrip'
import { FollowUpsCard } from '@/components/lab/today/FollowUpsCard'
import { WeekStatsCard } from '@/components/lab/today/WeekStatsCard'
import { EveningCard } from '@/components/lab/today/EveningCard'
import { ConductorCard } from '@/components/lab/today/ConductorCard'
import { SocialPublisher } from '@/components/lab/social/SocialPublisher'

export const dynamic = 'force-dynamic'

const ALERT_DOT = { danger: 'bg-red-500', warning: 'bg-yellow-400', success: 'bg-emerald-400' } as const

export default async function TodayPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString()
    const midnight = warsawMidnightMs(now)

    const [goal, queue, jobs, renewals, subscriptions, weekActivities, systems, alerts] = await Promise.all([
        getMonthGoal(supabase),
        getQueue(supabase),
        getJobs(supabase),
        getRenewalsDue(supabase),
        getSubscriptions(supabase),
        getActivities(supabase, weekAgo),
        getSystems(supabase),
        getAlerts(),
    ])

    // Liczby do górnego pasa: maile Harveya do decyzji, posty w tym tygodniu.
    const { hour } = warsawParts(now)
    const weekday = (new Date(`${warsawIsoDate()}T12:00:00Z`).getUTCDay() + 6) % 7 // 0 = poniedziałek
    const [mailsRes, postsRes] = await Promise.all([
        supabase.from('harvey_outbox').select('id', { count: 'exact', head: true }).eq('status', 'pending_review').is('decyzja', null),
        supabase.from('calendar_events').select('status, date, topic').gte('date', warsawIsoDate(-weekday)).lte('date', warsawIsoDate(6 - weekday)),
    ])
    const mailsWaiting = mailsRes.count ?? 0
    // FB i IG tego samego posta to dwa wiersze: liczymy posty (data + temat).
    const postKeys = new Map<string, boolean>()
    for (const p of postsRes.data ?? []) {
        const k = `${p.date}|${p.topic}`
        postKeys.set(k, (postKeys.get(k) ?? false) || p.status === 'Szkic')
    }
    const weekPosts = [...postKeys.keys()]
    const drafts = [...postKeys.values()].filter(Boolean).length
    const activeJobs = jobs.filter((j) => j.outcome === 'w_toku').length
    const greeting = hour < 5 ? 'Dobranoc' : hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór'

    const todayActivities = weekActivities.filter((a) => new Date(a.created_at).getTime() >= midnight)
    const thing = pickOneThing({ systems, jobs, queue })

    // Wykresiki pod liczbami: prawdziwe zdarzenia z ostatnich 7 dni (bez danych = płaska linia).
    const days = Array.from({ length: 7 }, (_, i) => warsawIsoDate(i - 6))
    const perDay = (kinds: string[]) => days.map((d) =>
        weekActivities.filter((a) => kinds.includes(a.kind) && warsawIsoDate(0, new Date(a.created_at)) === d).length)
    const postsPerDay = Array.from({ length: 7 }, (_, i) => warsawIsoDate(i - weekday)).map((d) =>
        [...postKeys.keys()].filter((k) => k.startsWith(`${d}|`)).length)

    return (
        <div className="lab-stagger mx-auto flex max-w-7xl flex-col gap-5 lg:gap-6">
            <DashboardAlerts alerts={alerts} />

            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-zinc-500 sm:text-base">
                        {now.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })}
                    </p>
                    <h1 className="mt-1 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">{greeting}, Mateusz</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <SearchPill />
                    <Link href="/lab/doradca" className="lab-pill flex h-11 items-center gap-2 pl-1 pr-4 text-sm font-medium text-white">
                        <Image src="/mateusz-machos.webp" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-yellow-400/70" />
                        Mateusz
                    </Link>
                </div>
            </header>
            <SystemsStrip systems={systems} />

            {alerts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {alerts.map((a) => (
                        <Link
                            key={`${a.href}-${a.title}`}
                            href={a.href}
                            title={a.description}
                            className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-700"
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${ALERT_DOT[a.type]}`} />
                            {a.title}
                        </Link>
                    ))}
                </div>
            )}

            <KpiRow items={[
                { label: 'Maile do decyzji', value: mailsWaiting, hint: 'Harvey czeka na Ciebie · maile 7 dni', href: '/lab/maile', icon: KPI_ICONS.Mail, hot: mailsWaiting > 0, series: perDay(['mail']) },
                { label: 'Telefony na dziś', value: queue.length, hint: 'kolejka niżej · rozmowy 7 dni', href: '#kolejka', icon: KPI_ICONS.Phone, hot: queue.length > 0, series: perDay(['telefon', 'rozmowa']) },
                { label: 'Posty w tygodniu', value: weekPosts.length, hint: drafts ? `${drafts} szkiców do przejrzenia` : 'wszystko przejrzane', href: '/lab/calendar', icon: KPI_ICONS.CalendarDays, hot: drafts > 0, series: postsPerDay },
                { label: 'Zlecenia w toku', value: activeJobs, hint: 'lejek · oferty i wpłaty 7 dni', href: '/lab/lejek', icon: KPI_ICONS.Kanban, hot: activeJobs > 0, series: perDay(['oferta', 'zaliczka', 'platnosc']) },
            ]} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
                <div className="lg:col-span-3"><GoalBar goal={goal} /></div>
                <div className="lg:col-span-2"><OneThingCard thing={thing} /></div>
            </div>
            {/* Dół ekranu jak w koncepcji: kolejka telefonów szeroko, obok Dyrygent; niżej posty. */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <div className={`min-w-0 ${systems.dyrygent ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <CallQueue initialItems={queue} />
                </div>
                {systems.dyrygent && (
                    <div className="min-w-0"><ConductorCard raport={systems.dyrygent} /></div>
                )}
            </div>

            <SocialPublisher compact />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <FollowUpsCard jobs={jobs} renewals={renewals} subscriptions={subscriptions} />
                <WeekStatsCard activities={weekActivities} />
                <EveningCard todayActivities={todayActivities} />
            </div>

            {/* Narzędzia produkcyjne studia */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                <Link
                    href="/lab/szukaj-firm"
                    className="lab-card group flex items-center justify-between gap-4 p-5"
                >
                    <div className="flex items-center gap-4">
                        <div className="lab-chip h-12 w-12 shrink-0">
                            <MapPinned size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Szukaj firm (Google Maps)</p>
                            <p className="text-xs text-zinc-500">Lokalne firmy po branży i mieście, filtr „bez strony WWW”, eksport do CSV</p>
                        </div>
                    </div>
                    <span className="text-xs font-medium text-zinc-500 transition group-hover:text-yellow-400">Otwórz →</span>
                </Link>
                <Link
                    href="/lab/stickers"
                    className="lab-card group flex items-center justify-between gap-4 p-5"
                >
                    <div className="flex items-center gap-4">
                        <div className="lab-chip h-12 w-12 shrink-0">
                            <Sticker size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Sticker Studio A4</p>
                            <p className="text-xs text-zinc-500">Naklejki: Gemini lub plik → obwódka → arkusz 300 DPI + DXF do Cameo 5</p>
                        </div>
                    </div>
                    <span className="text-xs font-medium text-zinc-500 transition group-hover:text-yellow-400">Otwórz →</span>
                </Link>
            </div>
        </div>
    )
}
