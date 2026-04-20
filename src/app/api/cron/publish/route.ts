import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { publishToFB, publishToIG } from '@/lib/social-publish'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = request.headers.get('authorization')
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    // Use service role client (bypasses RLS, no cookies needed for cron)
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const now = new Date().toISOString()

    // Get events scheduled for now or earlier that are still pending
    const { data: events, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('status', 'Zaplanowane')
        .not('scheduled_at', 'is', null)
        .lte('scheduled_at', now)
        .limit(10)

    if (error) {
        console.error('Cron: error fetching scheduled events:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!events || events.length === 0) {
        return NextResponse.json({ published: 0, message: 'No scheduled posts ready' })
    }

    let published = 0
    const results: any[] = []

    for (const event of events) {
        const platform = (event.platform || '').toLowerCase()
        const content = event.content || event.topic || ''
        const imageUrl = event.image_url

        let publishResult: { success: boolean; postId?: string; error?: string } = { success: false, error: 'Unknown platform' }

        try {
            if (platform.includes('facebook') || platform.includes('fb')) {
                publishResult = await publishToFB(content, imageUrl)
            } else if (platform.includes('instagram') || platform.includes('ig')) {
                if (imageUrl) {
                    publishResult = await publishToIG(imageUrl, content)
                } else {
                    publishResult = { success: false, error: 'Instagram wymaga obrazka (image_url)' }
                }
            }

            if (publishResult.success) {
                // Update event as published
                const updateData: Record<string, any> = {
                    status: 'Opublikowane',
                    published_at: new Date().toISOString(),
                }
                if (platform.includes('facebook')) updateData.fb_post_id = publishResult.postId
                if (platform.includes('instagram')) updateData.ig_post_id = publishResult.postId

                await supabase
                    .from('calendar_events')
                    .update(updateData)
                    .eq('id', event.id)

                published++
            }

            results.push({ id: event.id, topic: event.topic, ...publishResult })
        } catch (e: any) {
            results.push({ id: event.id, topic: event.topic, success: false, error: e.message })
        }
    }

    return NextResponse.json({ published, total: events.length, results })
}
