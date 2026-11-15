import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLIENT_BUCKET } from '@/lib/lab/client-files'
import { errorResponse, requireLabUser } from '@/lib/lab/stickers/auth.server'
import { buildExport } from '@/lib/lab/stickers/export.server'
import { StickerError } from '@/lib/lab/stickers/image.server'
import { clampQty, clampSize, sanitizeSettings, type DesignInput } from '@/lib/lab/stickers/types'

export const runtime = 'nodejs'
export const maxDuration = 120

/** Vercel nie odda odpowiedzi większej niż 4,5 MB. Większą paczkę wrzucamy do prywatnego bucketu. */
const DIRECT_LIMIT = 4 * 1024 * 1024
const MAX_DESIGNS = 24

function parseDesigns(raw: unknown): DesignInput[] {
    if (!Array.isArray(raw) || !raw.length) throw new StickerError('Dodaj przynajmniej jedną naklejkę.')
    if (raw.length > MAX_DESIGNS) throw new StickerError(`Maksymalnie ${MAX_DESIGNS} projektów na arkusz.`)
    return raw.map((d: Record<string, unknown>, i) => ({
        id: typeof d.id === 'string' && /^[\w-]{1,40}$/.test(d.id) ? d.id : `d${i}`,
        name: typeof d.name === 'string' ? d.name.slice(0, 60) : `Naklejka ${i + 1}`,
        src: String(d.src ?? ''),
        sizeMm: clampSize(d.sizeMm),
        qty: clampQty(d.qty),
    }))
}

export async function POST(req: Request) {
    const denied = await requireLabUser()
    if (denied) return denied
    try {
        const body = (await req.json()) as { designs?: unknown; settings?: unknown }
        const designs = parseDesigns(body.designs)
        const settings = sanitizeSettings(body.settings)
        const out = await buildExport(designs, settings)
        const meta = { name: out.name, count: out.count, overflow: out.layout.overflow }

        // Lokalnie: kopia projektu w output/stickers (folder jest w .gitignore).
        if (process.env.NODE_ENV === 'development') {
            const dir = path.join(process.cwd(), 'output', 'stickers', out.name)
            await mkdir(dir, { recursive: true })
            await Promise.all(Object.entries(out.files).map(([f, data]) => writeFile(path.join(dir, f), data)))
        }

        if (out.zip.length <= DIRECT_LIMIT || !process.env.VERCEL) {
            return new NextResponse(Buffer.from(out.zip), {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename="${out.name}.zip"`,
                    'X-Sticker-Meta': encodeURIComponent(JSON.stringify(meta)),
                    'Cache-Control': 'no-store',
                },
            })
        }
        const admin = createAdminClient()
        const file = `_lab-stickers/${out.name}-${Date.now()}.zip`
        const up = await admin.storage.from(CLIENT_BUCKET).upload(file, Buffer.from(out.zip), { contentType: 'application/zip' })
        if (up.error) throw new Error(`zapis paczki: ${up.error.message}`)
        const { data } = await admin.storage.from(CLIENT_BUCKET).createSignedUrl(file, 3600, { download: `${out.name}.zip` })
        if (!data?.signedUrl) throw new Error('brak linku do paczki')
        return NextResponse.json({ ...meta, url: data.signedUrl })
    } catch (e) {
        return errorResponse(e, 'Nie udało się przygotować paczki')
    }
}
