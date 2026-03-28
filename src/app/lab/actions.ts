'use server'

import { createClient } from '@/lib/supabase/server'

export type Alert = {
    type: 'danger' | 'warning' | 'success'
    title: string
    description: string
    href: string
}

export async function getAlerts(): Promise<Alert[]> {
    const supabase = await createClient()
    const alerts: Alert[] = []

    // 1. Stale leads (Nowy status, older than 48h)
    try {
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        const { data: staleLeads } = await supabase
            .from('leads')
            .select('id')
            .eq('status', 'Nowy')
            .lt('created_at', twoDaysAgo)

        if (staleLeads && staleLeads.length > 0) {
            alerts.push({
                type: 'danger',
                title: `${staleLeads.length} nieodpowiedzian${staleLeads.length === 1 ? 'y lead' : 'e leady'}`,
                description: `Masz zapytania starsze niz 48h bez odpowiedzi.`,
                href: '/lab/crm',
            })
        }
    } catch (e) { /* ignore */ }

    // 2. Revenue limit check (current month)
    try {
        const now = new Date()
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const nextMonth = now.getMonth() === 11
            ? `${now.getFullYear() + 1}-01-01`
            : `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`

        const { data: finances } = await supabase
            .from('finances')
            .select('amount')
            .gte('date', monthStart)
            .lt('date', nextMonth)

        if (finances && finances.length > 0) {
            const total = finances.reduce((s, f) => s + Number(f.amount), 0)
            const limit = 3604.50
            const pct = (total / limit) * 100

            if (pct >= 90) {
                alerts.push({
                    type: 'danger',
                    title: `Przychod na ${Math.round(pct)}% limitu!`,
                    description: `${total.toFixed(0)} zl z ${limit.toFixed(0)} zl — mozesz przekroczyc limit DN.`,
                    href: '/lab/finances',
                })
            } else if (pct >= 80) {
                alerts.push({
                    type: 'warning',
                    title: `Przychod na ${Math.round(pct)}% limitu`,
                    description: `Zbliżasz sie do limitu dzialalnosci nierejestrowanej.`,
                    href: '/lab/finances',
                })
            }
        }
    } catch (e) { /* ignore */ }

    // 3. Tomorrow's posts
    try {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]

        const { data: tomorrowPosts } = await supabase
            .from('calendar_events')
            .select('id, status, content')
            .eq('date', tomorrowStr)

        if (!tomorrowPosts || tomorrowPosts.length === 0) {
            alerts.push({
                type: 'warning',
                title: 'Brak posta na jutro',
                description: 'Nie masz zaplanowanego posta na jutrzejszy dzien.',
                href: '/lab/calendar',
            })
        } else {
            const ready = tomorrowPosts.filter(p => p.content && p.status !== 'Szkic')
            if (ready.length > 0) {
                alerts.push({
                    type: 'success',
                    title: `${ready.length} post${ready.length > 1 ? 'y' : ''} na jutro gotow${ready.length > 1 ? 'e' : 'y'}`,
                    description: 'Jutrzejsze publikacje sa przygotowane.',
                    href: '/lab/calendar',
                })
            }
        }
    } catch (e) { /* ignore */ }

    // 4. Stale projects (no updates > 7 days)
    try {
        const { data: projects } = await supabase
            .from('projects')
            .select('id, name, updates, created_at, progress')
            .lt('progress', 100)

        if (projects) {
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
            const stale = projects.filter(p => {
                const updates = Array.isArray(p.updates) ? p.updates : []
                const lastDate = updates.length > 0
                    ? new Date(updates[updates.length - 1].date).getTime()
                    : new Date(p.created_at).getTime()
                return lastDate < sevenDaysAgo
            })

            if (stale.length > 0) {
                alerts.push({
                    type: 'warning',
                    title: `${stale.length} projekt${stale.length > 1 ? 'y' : ''} bez aktualizacji`,
                    description: `Projekty nieaktualizowane od ponad 7 dni.`,
                    href: '/lab/projects',
                })
            }
        }
    } catch (e) { /* ignore */ }

    // 5. Unpaid invoices (> 14 days)
    try {
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const { data: unpaid } = await supabase
            .from('finances')
            .select('id')
            .eq('payment_status', 'Wystawiona')
            .lt('date', fourteenDaysAgo)

        if (unpaid && unpaid.length > 0) {
            alerts.push({
                type: 'warning',
                title: `${unpaid.length} niezaplaczon${unpaid.length === 1 ? 'a faktura' : 'e faktury'}`,
                description: 'Faktury starsze niz 14 dni bez potwierdzenia zaplaty.',
                href: '/lab/finances',
            })
        }
    } catch (e) { /* ignore */ }

    return alerts
}
