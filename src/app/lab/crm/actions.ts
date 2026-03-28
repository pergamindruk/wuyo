'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_STATUSES = ['Nowy', 'Kontakt', 'Wycena', 'Zamkniety', 'Utracony'] as const

export async function getLeads() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching leads:', error)
        return []
    }

    return data.map((l: any) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        date: new Date(l.created_at).toLocaleString('pl-PL'),
        rawDate: l.created_at,
        type: l.type,
        details: l.details,
        status: l.status || 'Nowy',
    }))
}

export async function getFilteredLeads(
    search?: string,
    status?: string,
    sortAsc?: boolean
) {
    const supabase = await createClient()
    let query = supabase.from('leads').select('*')

    if (search && search.trim()) {
        const s = `%${search.trim()}%`
        query = query.or(`name.ilike.${s},email.ilike.${s}`)
    }

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: !!sortAsc })

    const { data, error } = await query

    if (error) {
        console.error('Error fetching filtered leads:', error)
        return []
    }

    return data.map((l: any) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        date: new Date(l.created_at).toLocaleString('pl-PL'),
        rawDate: l.created_at,
        type: l.type,
        details: l.details,
        status: l.status || 'Nowy',
    }))
}

export async function updateLeadStatus(id: string, status: string) {
    if (!VALID_STATUSES.includes(status as any)) {
        throw new Error(`Nieprawidlowy status: ${status}`)
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)

    if (error) {
        console.error('Error updating lead status:', error)
        throw new Error('Nie udalo sie zaktualizowac statusu')
    }

    revalidatePath('/lab/crm')
    return true
}

export async function deleteLeadOrBrief(id: string, isBrief: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting lead:', error)
        throw new Error('Nie udalo sie usunac zapisu')
    }

    revalidatePath('/lab/crm')
    return true
}
