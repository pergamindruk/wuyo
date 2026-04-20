'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Lead } from '@/lib/types'
import { logAuditEvent } from '@/lib/audit'

const VALID_STATUSES = ['Nowy', 'Kontakt', 'Wycena', 'Zamkniety', 'Utracony'] as const
type ValidStatus = typeof VALID_STATUSES[number]

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

    return data.map((l: Record<string, unknown>): Lead => ({
        id: l.id as string,
        name: l.name as string,
        email: l.email as string,
        date: new Date(l.created_at as string).toLocaleString('pl-PL'),
        rawDate: l.created_at as string,
        type: (l.type as string) ?? '',
        details: (l.details as string) ?? '',
        status: (l.status as ValidStatus) || 'Nowy',
    }))
}

const PAGE_SIZE = 20

export async function getFilteredLeads(
    search?: string,
    status?: string,
    sortAsc?: boolean,
    page = 0,
): Promise<{ items: Lead[]; total: number; pageSize: number }> {
    const supabase = await createClient()
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('leads').select('*', { count: 'exact' })

    if (search && search.trim()) {
        const s = `%${search.trim()}%`
        query = query.or(`name.ilike.${s},email.ilike.${s}`)
    }

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: !!sortAsc }).range(from, to)

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching filtered leads:', error)
        return { items: [], total: 0, pageSize: PAGE_SIZE }
    }

    const items = (data ?? []).map((l: Record<string, unknown>): Lead => ({
        id: l.id as string,
        name: l.name as string,
        email: l.email as string,
        date: new Date(l.created_at as string).toLocaleString('pl-PL'),
        rawDate: l.created_at as string,
        type: (l.type as string) ?? '',
        details: (l.details as string) ?? '',
        status: (l.status as ValidStatus) || 'Nowy',
    }))

    return { items, total: count ?? 0, pageSize: PAGE_SIZE }
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

    await logAuditEvent('lead_status_change', { id, status })
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

    await logAuditEvent('lead_delete', { id })
    revalidatePath('/lab/crm')
    return true
}
