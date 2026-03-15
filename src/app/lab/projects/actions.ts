'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function createProject(data: any) {
    const supabase = await createClient()
    
    // Debug: Sprawdź czy zmienne środowiskowe istnieją
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.error("❌ BRAK NEXT_PUBLIC_SUPABASE_URL w środowisku lokalnym!")
    }

    const newProject = {
        id: Math.random().toString(36).substring(2, 12),
        name: data.name,
        client: data.client,
        status: 'Briefing',
        progress: 10,
        updates: []
    }

    console.log("🚀 Próba zapisu projektu do Supabase:", newProject)

    const { data: inserted, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single()

    if (error) {
        console.error('❌ BŁĄD SUPABASE:', error.message, error.details, error.hint)
        throw new Error(`Błąd: ${error.message}`)
    }

    console.log("✅ Projekt zapisany pomyślnie!")
    revalidatePath('/lab/projects')
    return inserted
}

export async function updateProjectStatus(id: string, status: string, progress: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('projects')
        .update({ status, progress })
        .eq('id', id)

    if (error) {
        console.error('Error updating project:', error)
        throw new Error('Nie udało się zaktualizować statusu')
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
        throw new Error('Nie udało się usunąć projektu')
    }

    revalidatePath('/lab/projects')
    return true
}
