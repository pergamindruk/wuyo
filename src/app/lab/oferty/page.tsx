import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ClipboardList, FileSignature, Kanban, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatCard } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'
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

    const withBrief = list.filter((j) => j.brief).length
    const sent = list.filter((j) => j.offerSentAt && !j.acceptedAt).length
    const accepted = list.filter((j) => j.acceptedAt).length

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                icon={FileSignature}
                eyebrow="Krok 1 i 2 z 7"
                title="Brief i oferta"
                subtitle="Wyślij klientowi link do briefu, przygotuj ofertę z jego odpowiedzi, klient akceptuje ją jednym kliknięciem."
            />
            {list.length === 0 ? (
                <div className="lab-card flex flex-col items-center gap-3 px-6 py-14 text-center">
                    <span className="lab-chip h-12 w-12"><FileSignature size={20} strokeWidth={1.8} /></span>
                    <p className="max-w-md text-sm text-zinc-400">
                        Brak zleceń w toku. Dodaj klienta w <Link href="/lab/crm" className="text-yellow-400 hover:underline">Zapytaniach</Link> przyciskiem „Do lejka” albo w <Link href="/lab/lejek" className="text-yellow-400 hover:underline">Lejku</Link>.
                    </p>
                    <Link href="/lab/lejek?nowe=1" className="mt-1 inline-flex items-center gap-2 bg-yellow-400 px-5 py-2.5 text-sm font-bold text-zinc-950"><Kanban size={16} strokeWidth={1.8} /> Nowe zlecenie</Link>
                </div>
            ) : (
                <>
                    <div className="lab-stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <StatCard icon={Kanban} label="Zlecenia przed umową" value={<CountUp value={list.length} />} />
                        <StatCard icon={ClipboardList} label="Brief wypełniony" value={<CountUp value={withBrief} />} />
                        <StatCard icon={Send} label="Oferta czeka" value={<CountUp value={sent} />} hot={sent > 0} />
                        <StatCard icon={CheckCircle2} label="Oferta przyjęta" value={<CountUp value={accepted} />} />
                    </div>
                    <OfferStudio jobs={list} />
                </>
            )}
        </div>
    )
}
