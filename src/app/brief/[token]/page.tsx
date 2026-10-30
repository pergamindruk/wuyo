import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPublicJob } from '@/lib/lab/public-job'
import { BRIEF_QUESTIONS, briefKindForService } from '@/lib/lab/offer'
import { BriefForm } from './BriefForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Brief', robots: { index: false, follow: false } }

export default async function BriefPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const job = await getPublicJob(token)
    if (!job) return notFound()
    const questions = BRIEF_QUESTIONS[briefKindForService(job.service)]
    const first = job.clientName.split(' ')[0]

    return (
        <div className="min-h-screen bg-[#0b0b0d] px-4 py-8 text-zinc-100 sm:py-12" style={{ backgroundImage: 'radial-gradient(900px 500px at 85% -10%, rgba(255,235,82,0.10), transparent 60%)' }}>
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
                <Image src="/logo_wuya2.webp" alt="WUYO" width={2866} height={1421} className="h-10 w-auto self-start" priority />
                <header>
                    <h1 className="text-3xl font-bold leading-tight text-white">{first ? `${first}, ` : ''}kilka pytań przed startem</h1>
                    <p className="mt-2 text-zinc-400">
                        Odpowiedzi pomogą mi przygotować ofertę i projekt pod Twoją firmę, a nie z szablonu. Zajmie to ok. 5 minut.
                        Pisz własnymi słowami, krótko wystarczy. Pytania, na które nie znasz odpowiedzi, pomiń.
                    </p>
                </header>
                <BriefForm token={token} questions={questions} />
                <p className="text-center text-xs text-zinc-600">Pliki (logo, zdjęcia) wyślij na kontakt@wuyo.pl albo WhatsApp 725 182 053.</p>
            </div>
        </div>
    )
}
