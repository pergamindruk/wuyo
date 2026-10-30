import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'
import { escapeHtml, isHoneypotTripped } from '@/lib/sanitize'
import { sendEmail, FROM_NOTIFICATION, TO_MATEUSZ } from '@/lib/email'
import { getPublicJob } from '@/lib/lab/public-job'

/** Klient akceptuje ofertę z linku /oferta/[token]. Zapis tylko raz (pierwsza akceptacja zostaje). */
export async function POST(req: NextRequest) {
    const supabase = createAdminClient()
    if (!(await rateLimit(supabase, `oferta:${getClientIp(req)}`, LIMITS.lead.limit, LIMITS.lead.windowMs))) {
        return NextResponse.json({ error: 'Za dużo prób. Spróbuj za minutę.' }, { status: 429 })
    }
    const body = (await req.json().catch(() => ({}))) as { token?: string; name?: string; hp?: string }
    if (isHoneypotTripped(body.hp)) return NextResponse.json({ ok: true })
    const name = (body.name ?? '').trim().slice(0, 120)
    if (name.length < 3) return NextResponse.json({ error: 'Wpisz imię i nazwisko.' }, { status: 400 })

    const job = await getPublicJob(body.token ?? '')
    if (!job || !job.offer) return NextResponse.json({ error: 'Nie znalazłem tej oferty.' }, { status: 404 })
    if (job.acceptedAt) return NextResponse.json({ ok: true })

    const { error } = await supabase.from('jobs')
        .update({ offer_accepted_at: new Date().toISOString(), offer_accepted_by: name, updated_at: new Date().toISOString() })
        .eq('id', job.id).is('offer_accepted_at', null)
    if (error) return NextResponse.json({ error: 'Nie udało się zapisać. Zadzwoń albo napisz.' }, { status: 500 })

    try {
        await sendEmail({
            from: FROM_NOTIFICATION,
            to: TO_MATEUSZ,
            subject: `✅ Oferta zaakceptowana: ${job.offer.title}`,
            html: `<p><b>${escapeHtml(name)}</b> zaakceptował(a) ofertę <b>${escapeHtml(job.offer.title)}</b> (${escapeHtml(job.clientCompany || job.clientName)}).</p><p>Następny krok: umowa i zaliczka 50%. Panel: https://wuyo.pl/lab/oferty</p>`,
        }, 'oferta-akceptacja')
    } catch {
        // Akceptacja jest zapisana w bazie i widać ją w panelu; brak maila nie może cofnąć jej klientowi.
    }
    return NextResponse.json({ ok: true })
}
