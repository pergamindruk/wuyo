'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project } from '@/lib/types'

export async function getProjects() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching projects:', error)
        return []
    }
    return data
}

export async function createProject(data: Pick<Project, 'name' | 'client'>) {
    const supabase = await createClient()

    const now = new Date().toISOString()
    const newProject = {
        id: Math.random().toString(36).substring(2, 12),
        name: data.name,
        client: data.client,
        status: 'Briefing',
        progress: 10,
        updates: [{ date: now, status: 'Briefing', progress: 10, note: 'Projekt utworzony' }],
    }

    const { data: inserted, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single()

    if (error) {
        console.error('Supabase insert error:', error.message)
        throw new Error(`Blad: ${error.message}`)
    }

    revalidatePath('/lab/projects')
    return inserted
}

export async function updateProjectStatus(id: string, status: string, progress: number, note?: string) {
    const supabase = await createClient()

    // Fetch current updates array
    const { data: current } = await supabase
        .from('projects')
        .select('updates')
        .eq('id', id)
        .single()

    const updates = Array.isArray(current?.updates) ? current.updates : []
    updates.push({
        date: new Date().toISOString(),
        status,
        progress,
        note: note || undefined,
    })

    const { error } = await supabase
        .from('projects')
        .update({ status, progress, updates })
        .eq('id', id)

    if (error) {
        console.error('Error updating project:', error)
        throw new Error('Nie udalo sie zaktualizowac statusu')
    }

    revalidatePath('/lab/projects')
    revalidatePath(`/c/${id}`)
}

export async function deleteProject(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting project:', error)
        throw new Error('Nie udalo sie usunac projektu')
    }

    revalidatePath('/lab/projects')
    return true
}
