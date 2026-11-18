import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireLabUser } from '@/lib/lab/require-user'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const schema = z.object({
    contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
})
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const

/** POST: jednorazowy link do wysyłki obrazu z przeglądarki prosto do bucketu „social” (omija limit body funkcji). */
export async function POST(request: Request) {
    const denied = await requireLabUser()
    if (denied) return denied
    const parsed = schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Dozwolone: JPG, PNG, WEBP.' }, { status: 400 })

    const admin = createAdminClient()
    const path = `publikuj/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${EXT[parsed.data.contentType]}`
    const { data, error } = await admin.storage.from('social').createSignedUploadUrl(path)
    if (error || !data) return NextResponse.json({ error: 'Nie udało się przygotować wysyłki.' }, { status: 500 })
    const publicUrl = admin.storage.from('social').getPublicUrl(path).data.publicUrl
    return NextResponse.json({ path, token: data.token, publicUrl })
}
