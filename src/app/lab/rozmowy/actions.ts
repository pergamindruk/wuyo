'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini'
import { PRICING } from '@/lib/lab/ai/context'
import { warsawIsoDate } from '@/lib/lab/today/format'
import { logAuditEvent } from '@/lib/audit'
import { recordCallOutcome } from '@/app/lab/dzis/actions'
import {
    CALL_NOTE_OUTCOMES, analysisSummary, extractJson, sanitizeAnalysis,
    type CallNoteAnalysis, type CallNoteOutcome,
} from '@/lib/lab/call-note'

type Ctx = { queueId?: string | null; jobId?: string | null; clientId?: string | null }
type Result<T> = { ok: true; data: T } | { ok: false; error: string }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const MIGRATION_HINT = 'Brak tabeli call_notes. Odpal migrację 011_sprzedaz.sql w Supabase.'

async function authed() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user ? supabase : null
}

/** Notatka → propozycja (zapis w call_notes bez stosowania). */
export async function analyzeCallNote(text: string, ctx: Ctx): Promise<Result<{ noteId: string; analiza: CallNoteAnalysis }>> {
    const supabase = await authed()
    if (!supabase) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }
    const note = text.trim()
    if (note.length < 15) return { ok: false, error: 'Napisz trochę więcej: co klient powiedział?' }
    if (note.length > 6000) return { ok: false, error: 'Notatka za długa (max 6000 znaków).' }

    let kontekst = ''
    let clientId = ctx.clientId ?? null
    let jobId = ctx.jobId ?? null
    if (ctx.queueId) {
        const { data } = await supabase.from('call_queue').select('name, industry, website, reason, client_id, job_id').eq('id', ctx.queueId).maybeSingle()
        if (data) {
            kontekst += `Firma: ${data.name}, branża: ${data.industry || 'brak'}, strona: ${data.website || 'brak'}, powód kontaktu: ${data.reason || 'brak'}.\n`
            clientId = clientId ?? data.client_id ?? null
            jobId = jobId ?? data.job_id ?? null
        }
    }
    if (jobId) {
        const { data } = await supabase.from('jobs').select('title, service, stage, client_id').eq('id', jobId).maybeSingle()
        if (data) {
            kontekst += `Zlecenie: ${data.title} (${data.service}), etap ${data.stage}/7.\n`
            clientId = clientId ?? data.client_id ?? null
        }
    }

    const today = warsawIsoDate()
    const prompt = `Jesteś asystentem jednoosobowego studia graficznego WUYO z Rzeszowa. Dziś jest ${today} (dzień tygodnia: ${new Date().toLocaleDateString('pl-PL', { weekday: 'long', timeZone: 'Europe/Warsaw' })}).
Właściciel wkleił notatkę z rozmowy telefonicznej z klientem. Wyciągnij z niej fakty i zaproponuj następny krok.

ZASADY:
- Tylko to, co jest w notatce. Nic nie dopisuj, nie zgaduj.
- budzet: tylko jeśli klient podał kwotę wprost, inaczej null.
- termin: termin klienta (np. "przed świętami"), inaczej null.
- kontaktDnia: data YYYY-MM-DD następnego kontaktu, jeśli wynika z notatki (np. "zadzwonić w piątek" = najbliższy piątek), inaczej null.
- proponowanyWynik: chce_oferte (prosi o ofertę/wycenę), oddzwonic (umówiony kolejny kontakt), nie_chce (odmówił), brak (nic z tego).
- nastepnyKrok: jedno krótkie zdanie, co mam zrobić (np. "Wysłać ofertę na stronę z cennikiem").
- niepewne: rzeczy niejasne w notatce, które warto dopytać.
- Usługi nazywaj jak w cenniku poniżej.

CENNIK (tylko do nazw usług):
${PRICING.slice(0, 2500)}

KONTEKST:
${kontekst || 'brak'}

NOTATKA:
"""${note}"""

Odpowiedz WYŁĄCZNIE obiektem JSON:
{"potrzeba":"","uslugi":[],"budzet":null,"termin":null,"obiekcje":[],"nastepnyKrok":"","kontaktDnia":null,"proponowanyWynik":"brak","niepewne":[]}`

    let analiza: CallNoteAnalysis | null = null
    try {
        analiza = sanitizeAnalysis(extractJson(await generateWithFallback('quote', prompt)), note, today)
    } catch {
        return { ok: false, error: 'AI nie odpowiada. Spróbuj za chwilę.' }
    }
    if (!analiza) return { ok: false, error: 'AI nie rozpisało notatki. Spróbuj jeszcze raz albo dopisz szczegóły.' }

    const { data: row, error } = await supabase
        .from('call_notes')
        .insert({ tresc: note, analiza, queue_id: ctx.queueId ?? null, job_id: jobId, client_id: clientId })
        .select('id').single()
    if (error || !row) return { ok: false, error: MIGRATION_HINT }

    return { ok: true, data: { noteId: row.id as string, analiza } }
}

export interface CallNoteApply {
    nastepnyKrok: string
    kontaktDnia: string | null
    wynik: CallNoteOutcome
}

/** Zapis propozycji po kliknięciu: status w kolejce, następny krok w zleceniu, wpis w historii. */
export async function applyCallNote(noteId: string, edits: CallNoteApply): Promise<Result<{ clientId: string | null }>> {
    const supabase = await authed()
    if (!supabase) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }
    if (!(CALL_NOTE_OUTCOMES as readonly string[]).includes(edits.wynik)) return { ok: false, error: 'Zły wynik rozmowy.' }
    if (edits.kontaktDnia && !DATE_RE.test(edits.kontaktDnia)) return { ok: false, error: 'Zła data.' }
    if (edits.wynik === 'oddzwonic' && !edits.kontaktDnia) return { ok: false, error: 'Wybierz, kiedy oddzwonić.' }

    const { data: n } = await supabase.from('call_notes').select('*').eq('id', noteId).maybeSingle()
    if (!n) return { ok: false, error: 'Nie znaleziono notatki.' }
    if (n.zastosowano_at) return { ok: false, error: 'Ta notatka jest już zapisana.' }

    const analiza = { ...(n.analiza as CallNoteAnalysis), nastepnyKrok: edits.nastepnyKrok.trim(), kontaktDnia: edits.kontaktDnia, proponowanyWynik: edits.wynik }
    const summary = analysisSummary(analiza)
    let jobId: string | null = n.job_id
    let clientId: string | null = n.client_id

    // 1. Kolejka telefonów: ten sam zapis co przyciski 1–4 (przy „chce ofertę” powstaje klient i zlecenie).
    if (n.queue_id && edits.wynik !== 'brak') {
        const { data: q } = await supabase.from('call_queue').select('job_id, client_id').eq('id', n.queue_id).maybeSingle()
        const alreadyInPipeline = !!q?.job_id
        if (!(edits.wynik === 'chce_oferte' && alreadyInPipeline)) {
            const res = await recordCallOutcome(n.queue_id, edits.wynik, {
                note: summary,
                callbackAt: edits.wynik === 'oddzwonic' && edits.kontaktDnia ? `${edits.kontaktDnia}T08:00:00.000Z` : undefined,
            })
            if (!res.ok) return { ok: false, error: res.error }
        }
        const { data: after } = await supabase.from('call_queue').select('job_id, client_id').eq('id', n.queue_id).maybeSingle()
        jobId = jobId ?? after?.job_id ?? null
        clientId = clientId ?? after?.client_id ?? null
    }

    // 2. Zlecenie: następny krok i data kontaktu.
    if (jobId) {
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (analiza.nastepnyKrok) patch.next_step = analiza.nastepnyKrok
        if (edits.kontaktDnia) patch.next_contact_at = edits.kontaktDnia
        const { data: job } = await supabase.from('jobs').update(patch).eq('id', jobId).select('client_id').maybeSingle()
        clientId = clientId ?? job?.client_id ?? null
    }

    // 3. Historia + oznaczenie notatki.
    await supabase.from('activity_log').insert({ kind: 'rozmowa', outcome: edits.wynik, queue_id: n.queue_id, job_id: jobId, note: summary })
    await supabase.from('call_notes').update({ analiza, job_id: jobId, client_id: clientId, zastosowano_at: new Date().toISOString() }).eq('id', noteId)
    await logAuditEvent('call_note_apply', { noteId, wynik: edits.wynik, jobId })

    revalidatePath('/lab')
    revalidatePath('/lab/lejek')
    if (clientId) revalidatePath(`/lab/klienci/${clientId}`)
    return { ok: true, data: { clientId } }
}
