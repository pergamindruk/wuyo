import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { escapeHtml } from '@/lib/sanitize'
import { sendEmail, FROM_NOTIFICATION, TO_MATEUSZ } from '@/lib/email'
import { MAX_FILE_BYTES, MAX_FILES_PER_PROJECT, createUploadUrl, listClientFiles, projectExists } from '@/lib/lab/client-files'

/**
 * Wysyłka plików ze strefy klienta /c/[id].
 * action=start: sprawdza projekt, rozmiar i limit, zwraca jednorazowy podpisany link do wysyłki do prywatnego bucketu.
 * action=done: po wysłaniu plików mail do Mateusza z listą nazw.
 */
export async function POST(req: NextRequest) {
    const supabase = createAdminClient()
    if (!(await rateLimit(supabase, `strefa-upload:${getClientIp(req)}`, 30, 60_000))) {
        return NextResponse.json({ error: 'Za dużo plików naraz. Odczekaj minutę.' }, { status: 429 })
    }
    const body = (await req.json().catch(() => ({}))) as { action?: string; projectId?: string; fileName?: string; size?: number; names?: string[] }
    const projectId = String(body.projectId ?? '')
    if (!(await projectExists(projectId))) return NextResponse.json({ error: 'Nie znalazłem projektu.' }, { status: 404 })

    if (body.action === 'done') {
        const names = (Array.isArray(body.names) ? body.names : []).slice(0, 20).map((n) => escapeHtml(String(n).slice(0, 120)))
        if (names.length) {
            const { data: p } = await supabase.from('projects').select('name, client').eq('id', projectId).maybeSingle()
            try {
                await sendEmail({
                    from: FROM_NOTIFICATION,
                    to: TO_MATEUSZ,
                    subject: `📎 Pliki od klienta: ${p?.client ?? projectId}`,
                    html: `<p>${escapeHtml(p?.client ?? '')} wrzucił(a) pliki do projektu <b>${escapeHtml(p?.name ?? projectId)}</b>:</p><ul>${names.map((n) => `<li>${n}</li>`).join('')}</ul><p>Pobierz: https://wuyo.pl/lab/projects</p>`,
                }, 'strefa-pliki')
            } catch {
                // Pliki są już w buckecie i widać je w panelu; brak maila nie jest błędem dla klienta.
            }
        }
        return NextResponse.json({ ok: true })
    }

    const size = Number(body.size ?? 0)
    if (!body.fileName || size <= 0) return NextResponse.json({ error: 'Brak pliku.' }, { status: 400 })
    if (size > MAX_FILE_BYTES) return NextResponse.json({ error: 'Plik jest większy niż 25 MB. Wyślij link z Google Drive albo WeTransfer.' }, { status: 413 })
    if ((await listClientFiles(projectId)).length >= MAX_FILES_PER_PROJECT) {
        return NextResponse.json({ error: 'Limit plików w tym projekcie. Napisz do mnie, zrobię miejsce.' }, { status: 409 })
    }
    const up = await createUploadUrl(projectId, body.fileName)
    if (!up) return NextResponse.json({ error: 'Nie udało się przygotować wysyłki. Spróbuj jeszcze raz.' }, { status: 500 })
    return NextResponse.json(up)
}
