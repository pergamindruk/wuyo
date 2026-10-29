import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
        supabase.from('calendar_events').select('status').gte('date', warsawIsoDate(-weekday)).lte('date', warsawIsoDate(6 - weekday)),
    ])
    const mailsWaiting = mailsRes.count ?? 0
    const weekPosts = postsRes.data ?? []
    const drafts = weekPosts.filter((p) => p.status === 'Szkic').length
    const activeJobs = jobs.filter((j) => j.outcome === 'w_toku').length
    const greeting = hour < 5 ? 'Dobranoc' : hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór'

    const todayActivities = weekActivities.filter((a) => new Date(a.created_at).getTime() >= midnight)
    const thing = pickOneThing({ systems, jobs, queue })

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-5">
            <DashboardAlerts alerts={alerts} />

            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-sm text-zinc-500">
                        {now.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })}
                    </p>
                    <h1 className="mt-1 text-3xl font-bold leading-tight text-white sm:text-4xl">{greeting}, Mateusz</h1>
                </div>
                <SystemsStrip systems={systems} />
            </header>

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
                { label: 'Maile do decyzji', value: mailsWaiting, hint: 'Harvey czeka na Ciebie', href: '/lab/maile', icon: KPI_ICONS.Mail, hot: mailsWaiting > 0 },
                { label: 'Telefony na dziś', value: queue.length, hint: 'kolejka niżej', href: '#kolejka', icon: KPI_ICONS.Phone, hot: queue.length > 0 },
                { label: 'Posty w tym tygodniu', value: weekPosts.length, hint: drafts ? `${drafts} szkiców do przejrzenia` : 'wszystko przejrzane', href: '/lab/calendar', icon: KPI_ICONS.CalendarDays, hot: drafts > 0 },
                { label: 'Zlecenia w toku', value: activeJobs, hint: 'lejek', href: '/lab/lejek', icon: KPI_ICONS.Kanban },
            ]} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="lg:col-span-3"><GoalBar goal={goal} /></div>
                <div className="lg:col-span-2"><OneThingCard thing={thing} /></div>
            </div>
            {systems.dyrygent && <ConductorCard raport={systems.dyrygent} />}
            <div id="kolejka" className="scroll-mt-6"><CallQueue initialItems={queue} /></div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <FollowUpsCard jobs={jobs} renewals={renewals} subscriptions={subscriptions} />
                <WeekStatsCard activities={weekActivities} />
                <EveningCard todayActivities={todayActivities} />
            </div>
        </div>
    )
}
