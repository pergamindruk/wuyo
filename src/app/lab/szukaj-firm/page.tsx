import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LeadFinder } from '@/components/lab/leads/LeadFinder'
import { apifyConfigured } from '@/lib/apify'

export const dynamic = 'force-dynamic'

export default async function LeadFinderPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Szukaj firm</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Lokalne firmy z Google Maps po branży i mieście. Filtr „bez strony WWW” wyłapuje kandydatów na stronę od WUYO.
                </p>
            </header>
            {!apifyConfigured() && (
                <p className="rounded-2xl border border-yellow-400/30 bg-yellow-400/5 px-4 py-3 text-sm text-yellow-200">
                    Brak tokenu Apify. Dodaj <code className="text-yellow-300">APIFY_API_TOKEN</code> w Vercel (Settings → Environment Variables) i zrób redeploy.
                </p>
            )}
            <LeadFinder />
        </div>
    )
}
