'use server'

import { createClient } from '@supabase/supabase-js'

export type AnalyticsData = {
    available: boolean
    debugError?: string
    pageViews?: number
    visitors?: number
    topPages?: { page: string; views: number }[]
    topReferrers?: { referrer: string; views: number }[]
}

export async function getVercelAnalytics(): Promise<AnalyticsData> {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

        const { data, error } = await supabase
            .from('page_views')
            .select('page, referrer, created_at')
            .gte('created_at', since)
            .limit(5000)

        if (error) return { available: false, debugError: error.message }
        if (!data) return { available: false }

        const pageCount: Record<string, number> = {}
        for (const row of data) {
            pageCount[row.page] = (pageCount[row.page] || 0) + 1
        }

        const topPages = Object.entries(pageCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([page, views]) => ({ page, views }))

        const refCount: Record<string, number> = {}
        for (const row of data) {
            if (!row.referrer) continue
            let domain = row.referrer
            try { domain = new URL(row.referrer).hostname.replace('www.', '') } catch {}
            if (!domain) continue
            refCount[domain] = (refCount[domain] || 0) + 1
        }

        const topReferrers = Object.entries(refCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([referrer, views]) => ({ referrer, views }))

        return {
            available: true,
            pageViews: data.length,
            visitors: data.length,
            topPages,
            topReferrers,
        }
    } catch (error: any) {
        return { available: false, debugError: `Exception: ${error?.message}` }
    }
}
