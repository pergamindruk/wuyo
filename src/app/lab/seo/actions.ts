'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runSeoRadca } from '@/lib/lab/seo-radca/run'
import { EVALUATE_AFTER_DAYS } from '@/lib/lab/seo-radca/rules'
import { SEO_TAG } from '@/lib/seo-overrides'

// Akcja serwera to publiczny adres: każda najpierw sprawdza, czy to zalogowany Mateusz.
async function guard() {
    const { data: { user } } = await (await createClient()).auth.getUser()
    if (!user) throw new Error('Brak dostępu')
    return createAdminClient()
}

export async function acceptChange(id: string) {
    const db = await guard()
    const { data: c } = await db.from('seo_changes').select('path, kind, status').eq('id', id).single()
    if (!c || c.status !== 'do_akceptacji') return
    if (c.kind === 'meta') {
        await db.from('seo_changes').update({ status: 'zastapiona' }).eq('path', c.path).eq('kind', 'meta').in('status', ['aktywna', 'utrzymana'])
        await db.from('seo_changes').update({
            status: 'aktywna', decided_at: new Date().toISOString(), applied_at: new Date().toISOString(),
            evaluate_after: new Date(Date.now() + EVALUATE_AFTER_DAYS * 86_400_000).toISOString().slice(0, 10),
        }).eq('id', id)
        updateTag(SEO_TAG)
    } else {
        await db.from('seo_changes').update({ status: 'zaakceptowana', decided_at: new Date().toISOString() }).eq('id', id)
    }
    revalidatePath('/lab/seo')
}

export async function rejectChange(id: string) {
    const db = await guard()
    await db.from('seo_changes').update({ status: 'odrzucona', decided_at: new Date().toISOString() }).eq('id', id).eq('status', 'do_akceptacji')
    revalidatePath('/lab/seo')
}

/** Cofa podmianę tytułu: strona wraca do tytułu i opisu z kodu. */
export async function revertChange(id: string) {
    const db = await guard()
    await db.from('seo_changes').update({ status: 'cofnieta', decided_at: new Date().toISOString() }).eq('id', id).in('status', ['aktywna', 'utrzymana'])
    updateTag(SEO_TAG)
    revalidatePath('/lab/seo')
}

/** Propozycja zrobiona (wpis napisany, strona rozbudowana): znika z listy do zrobienia. */
export async function doneProposal(id: string) {
    const db = await guard()
    await db.from('seo_changes').update({ status: 'zrobiona', decided_at: new Date().toISOString() }).eq('id', id).eq('status', 'zaakceptowana')
    revalidatePath('/lab/seo')
}

export async function runNow() {
    const db = await guard()
    const r = await runSeoRadca(db)
    if (r.overridesChanged) updateTag(SEO_TAG)
    revalidatePath('/lab/seo')
}
