'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { naGrosze } from '@/lib/lab/doradca/conversation'

type Result = { ok: true } | { ok: false; error: string }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const PATH = '/lab/doradca'

async function authed() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user ? supabase : null
}

const brak = { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' } as const

export async function addCost(form: { data: string; kwota: string; opis: string; sprzedawca: string; zDotacji: boolean }): Promise<Result> {
    const supabase = await authed()
    if (!supabase) return brak
    const kwotaGrosze = naGrosze(form.kwota)
    const opis = form.opis.trim()
    if (!DATE_RE.test(form.data)) return { ok: false, error: 'Podaj datę.' }
    if (kwotaGrosze === null) return { ok: false, error: 'Kwota w złotych, np. 240,50.' }
    if (!opis) return { ok: false, error: 'Napisz, co kupiłeś.' }
    const { error } = await supabase.from('koszty').insert({
        data: form.data,
        kwota_grosze: kwotaGrosze,
        opis: opis.slice(0, 300),
        sprzedawca: form.sprzedawca.trim().slice(0, 200) || null,
        z_dotacji: form.zDotacji,
        zrodlo: 'panel',
    })
    if (error) return { ok: false, error: error.message }
    revalidatePath(PATH)
    return { ok: true }
}

export async function toggleGrant(id: string, zDotacji: boolean): Promise<Result> {
    const supabase = await authed()
    if (!supabase) return brak
    const { error } = await supabase.from('koszty').update({ z_dotacji: zDotacji }).eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath(PATH)
    return { ok: true }
}

export async function deleteCost(id: string): Promise<Result> {
    const supabase = await authed()
    if (!supabase) return brak
    const { error } = await supabase.from('koszty').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath(PATH)
    return { ok: true }
}

export async function addDeadline(data: string, tytul: string): Promise<Result> {
    const supabase = await authed()
    if (!supabase) return brak
    if (!DATE_RE.test(data)) return { ok: false, error: 'Podaj datę.' }
    if (!tytul.trim()) return { ok: false, error: 'Napisz, czego pilnować.' }
    const { error } = await supabase.from('doradca_terminy').upsert({ data, tytul: tytul.trim().slice(0, 200) }, { onConflict: 'data,tytul', ignoreDuplicates: true })
    if (error) return { ok: false, error: error.message }
    revalidatePath(PATH)
    return { ok: true }
}

export async function setDeadlineDone(id: string, zrobione: boolean): Promise<Result> {
    const supabase = await authed()
    if (!supabase) return brak
    const { error } = await supabase.from('doradca_terminy').update({ zrobione }).eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath(PATH)
    return { ok: true }
}

export async function deleteDeadline(id: string): Promise<Result> {
    const supabase = await authed()
    if (!supabase) return brak
    const { error } = await supabase.from('doradca_terminy').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath(PATH)
    return { ok: true }
}

export async function addFact(tresc: string): Promise<Result> {
    const supabase = await authed()
    if (!supabase) return brak
    if (!tresc.trim()) return { ok: false, error: 'Wpisz treść.' }
    const { error } = await supabase.from('doradca_fakty').insert({ tresc: tresc.trim().slice(0, 500) })
    if (error) return { ok: false, error: error.message }
    revalidatePath(PATH)
    return { ok: true }
}

export async function deleteFact(id: string): Promise<Result> {
    const supabase = await authed()
    if (!supabase) return brak
    const { error } = await supabase.from('doradca_fakty').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath(PATH)
    return { ok: true }
}
