import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const { page, referrer } = await req.json()
        if (!page || typeof page !== 'string' || page.startsWith('/lab')) {
            return new Response(null, { status: 204 })
        }
        await supabase.from('page_views').insert({
            page: page.split('?')[0],
            referrer: referrer || '',
        })
    } catch {}
    return new Response(null, { status: 204 })
}
