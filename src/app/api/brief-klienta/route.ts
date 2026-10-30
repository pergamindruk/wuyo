import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'
import { escapeHtml, isHoneypotTripped } from '@/lib/sanitize'
import { sendEmail, FROM_NOTIFICATION, TO_MATEUSZ } from '@/lib/email'
import { getPublicJob } from '@/lib/lab/public-job'

/** Odpowiedzi z /brief/[token] -> CRM (leads, typ „Brief klienta”, powiązane ze zleceniem) + mail do Mateusza. */
export async function POST(req: NextRequest) {
    const supabase = createAdminClient()
    if (!(await rateLimit(supabase, `brief-klienta:${getClientIp(req)}`, LIMITS.brief.limit, LIMITS.brief.windowMs))) {
        return NextResponse.json({ error: 'Za dużo prób. Spróbuj za minutę.' }, { status: 429 })
    }
    const body = (await req.json().catch(() => ({}))) as { token?: string; hp?: string; answers?: { question?: string; answer?: string }[] }
    if (isHoneypotTripped(body.hp)) return NextResponse.json({ ok: true })

    const job = await getPublicJob(body.token ?? '')
    if (!job) return NextResponse.json({ error: 'Link jest nieaktualny. Napisz na kontakt@wuyo.pl.' }, { status: 404 })

    const qa = (Array.isArray(body.answers) ? body.answers : []).slice(0, 15)
        .map((a) => ({ q: String(a.question ?? '').slice(0, 300), a: String(a.answer ?? '').trim().slice(0, 2000) }))
        .filter((x) => x.q && x.a)
    if (qa.length === 0) return NextResponse.json({ error: 'Odpowiedz chociaż na jedno pytanie.' }, { status: 400 })

    const details = qa.map((x) => `${x.q}\n→ ${x.a}`).join('\n\n')
    const { error } = await supabase.from('leads').insert({
        name: job.clientName || job.clientCompany || 'Klient',
        email: job.clientEmail || null,
        type: 'Brief klienta',
        details,
        status: 'Nowy',
        job_id: job.id,
    })
    if (error) return NextResponse.json({ error: 'Nie udało się zapisać. Spróbuj jeszcze raz.' }, { status: 500 })

    try {
        await sendEmail({
            from: FROM_NOTIFICATION,
            to: TO_MATEUSZ,
            subject: `📋 Brief od klienta: ${job.clientCompany || job.clientName}`,
            html: `<p>Klient wypełnił brief do zlecenia <b>${escapeHtml(job.title || job.service)}</b>.</p>`
                + qa.map((x) => `<p><b>${escapeHtml(x.q)}</b><br>${escapeHtml(x.a).replace(/\n/g, '<br>')}</p>`).join('')
                + '<p>Oferta: https://wuyo.pl/lab/oferty</p>',
        }, 'brief-klienta')
    } catch {
        // Odpowiedzi są w bazie i w panelu; brak maila nie może kazać klientowi wysyłać drugi raz.
    }
    return NextResponse.json({ ok: true })
}
