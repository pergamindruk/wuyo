import { NextResponse } from 'next/server'
import { requireLabUser } from '@/lib/lab/require-user'
import { listChannels } from '@/lib/social/publisher'

export const dynamic = 'force-dynamic'

/** GET: podpięte konta (Postiz, a gdy śpi: ostatnia znana lista + zapas Graph API). */
export async function GET() {
    const denied = await requireLabUser()
    if (denied) return denied
    try {
        return NextResponse.json(await listChannels())
    } catch (e) {
        console.error('social/channels:', e)
        return NextResponse.json({ error: 'Nie udało się pobrać kont.' }, { status: 500 })
    }
}
