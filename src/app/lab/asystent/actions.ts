'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini'
import { warsawIsoDate } from '@/lib/lab/today/format'
import { saveOffer } from '@/app/lab/oferty/actions'
import type { OfferData } from '@/lib/lab/offer'
import { buildPrompt, parseDraft, tidyDraft, type Draft, type DraftOffer } from '@/lib/lab/asystent/draft'
import { loadAssistant, loadCallNotes } from '@/lib/lab/asystent/load'
import { followUpStep, type Move } from '@/lib/lab/asystent/pick'

type R<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

const PATH = '/lab/asystent'
const brak = { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' } as const

async function authed() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user ? supabase : null
}

type Supa = NonNullable<Awaited<ReturnType<typeof authed>>>

async function findMove(supabase: Supa, key: string): Promise<Move | null> {
    const { ranked } = await loadAssistant(supabase)
    return ranked.find((m) => m.key === key) ?? null
}

/** Przygotowuje szkic (wiadomość, telefon, warianty, oferta) i zapisuje go w ai_generations (kind: asystent). */
export async function prepareDraft(key: string, note?: string): Promise<R<Draft>> {
    const supabase = await authed()
    if (!supabase) return brak
    const move = await findMove(supabase, key)
    if (!move) return { ok: false, error: 'Tego ruchu już nie ma na liście. Odśwież stronę.' }

    const callNotes = await loadCallNotes(supabase, move)
    const withNotes: Move = callNotes ? { ...move, notes: [move.notes, callNotes].filter(Boolean).join('\n') } : move

    try {
        const raw = await generateWithFallback('content', buildPrompt(withNotes, note?.trim() || undefined))
        const parsed = parseDraft(raw, move.kind === 'oferta')
        if (!parsed) return { ok: false, error: 'AI zwróciło coś nieczytelnego. Spróbuj jeszcze raz.' }
        const draft = tidyDraft(parsed)
        await supabase.from('ai_generations').insert({
            type: 'quote',
            input_data: { kind: 'asystent', key, note: note?.trim() || null, moveKind: move.kind },
            output: JSON.stringify(draft),
        })
        return { ok: true, data: draft }
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { ok: false, error: /503|429|overloaded|unavailable/i.test(msg) ? 'Gemini przeciążony, spróbuj za minutę.' : 'Nie udało się przygotować szkicu.' }
    }
}

/**
 * Akceptacja oferty: zapisuje ofertę (link publiczny), oznacza zlecenie jako „oferta wysłana”,
 * ustawia przypomnienie za 3 dni i zwraca link do wklejenia w wiadomość.
 */
export async function acceptOffer(key: string, offer: DraftOffer): Promise<R<{ link: string }>> {
    const supabase = await authed()
    if (!supabase) return brak
    const move = await findMove(supabase, key)
    if (!move || move.kind !== 'oferta' || !move.jobId) return { ok: false, error: 'To zlecenie nie czeka już na ofertę.' }
    if (!offer.title.trim() || offer.scope.length === 0) return { ok: false, error: 'Oferta potrzebuje tytułu i zakresu.' }
    if (move.valueGrosze <= 0) return { ok: false, error: 'Zlecenie nie ma ceny. Ustaw ją w Lejku albo w Ofertach.' }

    const { data: client } = await supabase.from('jobs').select('clients(name, company)').eq('id', move.jobId).maybeSingle()
    const c = (Array.isArray(client?.clients) ? client?.clients[0] : client?.clients) as { name?: string; company?: string } | null
    const d = new Date().toISOString().slice(0, 10)
    const data: OfferData = {
        number: `${d.slice(2, 4)}${d.slice(5, 7)}/${move.jobId.slice(0, 4).toUpperCase()}`,
        date: d,
        validDays: 14,
        clientName: c?.name ?? '',
        clientCompany: c?.company ?? move.name,
        title: offer.title.trim(),
        intro: offer.intro.trim(),
        scope: offer.scope.map((s) => s.trim()).filter(Boolean),
        priceGrosze: move.valueGrosze,
        priceNote: 'Cena netto, do ceny doliczam 23% VAT. Płatność: 50% zaliczki na start, reszta po odbiorze.',
        timeline: '',
        cta: offer.cta.trim(),
    }
    const saved = await saveOffer(move.jobId, data, true)
    if (!saved.ok) return saved

    await Promise.all([
        supabase.from('jobs').update({ next_step: 'Przypomnienie o ofercie', next_contact_at: warsawIsoDate(3), updated_at: new Date().toISOString() }).eq('id', move.jobId),
        supabase.from('activity_log').insert({ kind: 'oferta', outcome: 'wyslana', job_id: move.jobId, queue_id: move.queueId, note: 'Asystent: oferta zaakceptowana' }),
    ])
    revalidatePath(PATH)
    revalidatePath('/lab')
    return { ok: true, data: { link: `https://wuyo.pl/oferta/${saved.data}` } }
}

/** Akceptacja przypomnienia: zapisuje kontakt i ustawia kolejny krok według metody (2–3 / 5–7 / 10–14 dni). */
export async function acceptFollowUp(key: string): Promise<R<{ nextAt: string }>> {
    const supabase = await authed()
    if (!supabase) return brak
    const move = await findMove(supabase, key)
    if (!move || !move.jobId || (move.kind !== 'przypomnienie' && move.kind !== 'zalegly')) return { ok: false, error: 'To przypomnienie jest już nieaktualne.' }
    const step = followUpStep(move.daysWaiting)
    const nextAt = warsawIsoDate(step.nextInDays)
    const { error } = await supabase.from('jobs')
        .update({ next_step: step.nextInDays >= 30 ? 'Temat zamknięty, wrócić, gdy klient się odezwie' : 'Kolejne przypomnienie o ofercie', next_contact_at: nextAt, updated_at: new Date().toISOString() })
        .eq('id', move.jobId)
    if (error) return { ok: false, error: 'Nie udało się zapisać.' }
    await supabase.from('activity_log').insert({ kind: step.channel === 'telefon' ? 'telefon' : 'mail', outcome: 'przypomnienie', job_id: move.jobId, note: `Asystent: ${step.label}` })
    revalidatePath(PATH)
    revalidatePath('/lab')
    return { ok: true, data: { nextAt } }
}

/** Ukrywa ruch do końca dnia. */
export async function skipToday(key: string): Promise<R> {
    const supabase = await authed()
    if (!supabase) return brak
    const { error } = await supabase.from('ai_generations').insert({
        type: 'content',
        input_data: { kind: 'asystent_pomin', key, date: warsawIsoDate() },
        output: '',
    })
    if (error) return { ok: false, error: 'Nie udało się pominąć.' }
    revalidatePath(PATH)
    return { ok: true, data: undefined }
}
