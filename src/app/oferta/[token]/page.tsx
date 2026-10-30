import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { OfferDocument } from '@/components/lab/OfferDocument'
import { getPublicJob } from '@/lib/lab/public-job'
import { AcceptOffer } from './AcceptOffer'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Oferta', robots: { index: false, follow: false } }

export default async function OfferPublicPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const job = await getPublicJob(token)
    if (!job) return notFound()

    return (
        <div className="min-h-screen bg-zinc-100 px-3 py-6 sm:py-10">
            <div className="mx-auto max-w-[794px]">
                {job.offer ? (
                    <>
                        <div className="overflow-hidden rounded-2xl shadow-xl"><OfferDocument data={job.offer} /></div>
                        <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
                            <AcceptOffer token={token} acceptedAt={job.acceptedAt} acceptedBy={job.acceptedBy} defaultName={job.clientName} />
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl bg-white p-8 text-center text-zinc-600 shadow-sm">
                        Oferta jest jeszcze w przygotowaniu. Dostaniesz wiadomość, gdy będzie gotowa.
                    </div>
                )}
                <p className="mt-6 text-center text-xs text-zinc-500">Pytania? Zadzwoń: 725 182 053 albo napisz: kontakt@wuyo.pl</p>
            </div>
        </div>
    )
}
