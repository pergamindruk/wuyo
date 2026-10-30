import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseOffer, type OfferData } from '@/lib/lab/offer'

/**
 * Zlecenie po tokenie z linku (strony /brief/[token] i /oferta/[token]).
 * Klient nie jest zalogowany, więc czytamy kluczem serwisowym, tylko po stronie serwera
 * i tylko pola potrzebne na tych stronach.
 */
export type PublicJob = {
    id: string
    title: string
    service: string
    clientName: string
    clientCompany: string
    clientEmail: string
    acceptedAt: string | null
    acceptedBy: string | null
    offer: OfferData | null
}

const TOKEN_RE = /^[a-z0-9]{12,40}$/

export async function getPublicJob(token: string): Promise<PublicJob | null> {
    if (!TOKEN_RE.test(token)) return null
    const supabase = createAdminClient()
    const { data: j } = await supabase.from('jobs')
        .select('id, title, service, offer_accepted_at, offer_accepted_by, clients(name, company, email)')
        .eq('public_token', token).maybeSingle()
    if (!j) return null
    const c = (Array.isArray(j.clients) ? j.clients[0] : j.clients) as { name?: string; company?: string; email?: string } | null
    const { data: o } = await supabase.from('ai_generations').select('output')
        .eq('input_data->>kind', 'oferta').eq('input_data->>jobId', j.id as string)
        .order('created_at', { ascending: false }).limit(1)
    return {
        id: j.id as string,
        title: (j.title as string) ?? '',
        service: (j.service as string) ?? '',
        clientName: c?.name ?? '',
        clientCompany: c?.company ?? '',
        clientEmail: c?.email ?? '',
        acceptedAt: (j.offer_accepted_at as string) ?? null,
        acceptedBy: (j.offer_accepted_by as string) ?? null,
        offer: parseOffer(o?.[0]?.output as string | undefined),
    }
}
