'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
        type: l.type,
        details: l.details
    }))
}

export async function deleteLeadOrBrief(id: string, isBrief: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting lead:', error)
        throw new Error('Nie udało się usunąć zapisu')
    }

    revalidatePath('/lab/crm')
    return true
}
