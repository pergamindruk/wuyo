import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAlerts } from './actions'
import { DashboardAlerts } from '@/components/lab/DashboardAlerts'
import { TZ, warsawMidnightMs } from '@/lib/lab/today/format'
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

    const todayActivities = weekActivities.filter((a) => new Date(a.created_at).getTime() >= midnight)
    const thing = pickOneThing({ systems, jobs, queue })

    return (
        <div className="flex max-w-6xl flex-col gap-6">
            <DashboardAlerts alerts={alerts} />

            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold leading-tight text-white">Dziś</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        {now.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })}
                    </p>
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

            <GoalBar goal={goal} />
            <OneThingCard thing={thing} />
            <CallQueue initialItems={queue} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <FollowUpsCard jobs={jobs} renewals={renewals} subscriptions={subscriptions} />
                <WeekStatsCard activities={weekActivities} />
                <EveningCard todayActivities={todayActivities} />
            </div>
        </div>
    )
}
