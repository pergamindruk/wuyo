import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Skrót z miejsc, które znają tylko zlecenie (np. Zapytania): przekierowanie na kartę klienta. */
export default async function JobToClient({ params }: { params: Promise<{ jobId: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')
    const { jobId } = await params
    const { data } = await supabase.from('jobs').select('client_id').eq('id', jobId).maybeSingle()
    if (!data?.client_id) notFound()
    redirect(`/lab/klienci/${data.client_id}`)
}
