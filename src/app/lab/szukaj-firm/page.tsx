import { redirect } from 'next/navigation'
import { AlertTriangle, MapPinned } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/lab/ui/PageHeader'
import { LeadFinder } from '@/components/lab/leads/LeadFinder'
import { apifyConfigured } from '@/lib/apify'

export const dynamic = 'force-dynamic'

export default async function LeadFinderPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                icon={MapPinned}
                title="Szukaj firm"
                subtitle="Lokalne firmy z Google Maps po branży i mieście. Filtr „bez strony WWW” wyłapuje kandydatów na stronę od WUYO."
            />
            {!apifyConfigured() && (
                <p className="flex items-start gap-3 rounded-2xl bg-yellow-400/[0.07] px-4 py-3 text-sm text-yellow-200 ring-1 ring-yellow-400/25">
                    <AlertTriangle size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-yellow-400" />
                    <span>Brak tokenu Apify. Dodaj <code className="text-yellow-300">APIFY_API_TOKEN</code> w Vercel (Settings → Environment Variables) i zrób redeploy.</span>
                </p>
            )}
            <LeadFinder />
        </div>
    )
}
