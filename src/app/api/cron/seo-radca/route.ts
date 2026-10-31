import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { runSeoRadca } from '@/lib/lab/seo-radca/run'
import { SEO_TAG } from '@/lib/seo-overrides'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** SEO-radca: codzienny przegląd wuyo.pl (vercel.json, 5:30 UTC). Wynik w /lab/seo, mail przy nowym alarmie. */
export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const result = await runSeoRadca(createAdminClient())
    if (result.overridesChanged) revalidateTag(SEO_TAG, 'max')
    return NextResponse.json(result)
}
