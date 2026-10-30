import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SERVICES } from '@/lib/lab/today/constants'
import { parseOffer, type OfferData } from '@/lib/lab/offer'
import { OfferStudio, type StudioJob } from './OfferStudio'

export const dynamic = 'force-dynamic'

export default async function OffersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const [{ data: jobs }, { data: offers }, { data: briefs }] = await Promise.all([
        supabase.from('jobs').select('id, title, service, stage, price_grosze, public_token, offer_sent_at, offer_accepted_at, offer_accepted_by, clients(name, company, email)')
            .eq('outcome', 'w_toku').lte('stage', 4).order('updated_at', { ascending: false }),
        supabase.from('ai_generations').select('input_data, output, created_at').eq('input_data->>kind', 'oferta').order('created_at', { ascending: false }).limit(200),
        supabase.from('leads').select('job_id, details, created_at').eq('type', 'Brief klienta').not('job_id', 'is', null).order('created_at', { ascending: false }),
    ])

    const offerByJob = new Map<string, OfferData>()
    for (const o of offers ?? []) {
        const id = (o.input_data as { jobId?: string } | null)?.jobId
        const d = parseOffer(o.output as string)
        if (id && d && !offerByJob.has(id)) offerByJob.set(id, d)
    }
    const briefByJob = new Map<string, { text: string; at: string }>()
    for (const b of briefs ?? []) {
        if (b.job_id && !briefByJob.has(b.job_id as string)) briefByJob.set(b.job_id as string, { text: (b.details as string) ?? '', at: b.created_at as string })
    }

    const list: StudioJob[] = (jobs ?? []).map((j) => {
        const c = (Array.isArray(j.clients) ? j.clients[0] : j.clients) as { name?: string; company?: string; email?: string } | null
        return {
            id: j.id as string,
            title: (j.title as string) ?? '',
            service: SERVICES.find((s) => s.key === j.service)?.label ?? ((j.service as string) || 'Inne'),
            serviceKey: (j.service as string) ?? 'inne',
            stage: j.stage as number,
            priceGrosze: (j.price_grosze as number) || SERVICES.find((s) => s.key === j.service)?.priceGrosze || 0,
            token: (j.public_token as string) ?? null,
            offerSentAt: (j.offer_sent_at as string) ?? null,
            acceptedAt: (j.offer_accepted_at as string) ?? null,
            acceptedBy: (j.offer_accepted_by as string) ?? null,
            clientName: c?.name ?? '',
            clientCompany: c?.company ?? '',
            clientEmail: c?.email ?? '',
            offer: offerByJob.get(j.id as string) ?? null,
            brief: briefByJob.get(j.id as string) ?? null,
        }
    })

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <header>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/80">Krok 1 i 2 z 7</p>
                <h1 className="mt-1 text-3xl font-bold text-white">Brief i oferta</h1>
                <p className="mt-1 text-sm text-zinc-500">Wyślij klientowi link do briefu, przygotuj ofertę z jego odpowiedzi, klient akceptuje ją jednym kliknięciem.</p>
            </header>
            {list.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
                    Brak zleceń w toku. Dodaj klienta w <Link href="/lab/crm" className="text-yellow-400 hover:underline">CRM</Link> przyciskiem „Do lejka” albo w <Link href="/lab/lejek" className="text-yellow-400 hover:underline">Lejku</Link>.
                </div>
            ) : (
                <OfferStudio jobs={list} />
            )}
        </div>
    )
}
