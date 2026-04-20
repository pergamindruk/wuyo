'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTestimonial(data: {
    quote: string
    name: string
    role: string
    company: string
    service: string
    featured: boolean
}) {
    const supabase = await createClient()
    const { error } = await supabase.from('testimonials').insert([data])
    if (error) throw new Error(error.message)
    revalidatePath('/lab/testimonials')
    revalidatePath('/')
}

export async function deleteTestimonial(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('testimonials').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/lab/testimonials')
    revalidatePath('/')
}

export async function toggleFeatured(id: string, featured: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('testimonials')
        .update({ featured })
        .eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/lab/testimonials')
    revalidatePath('/')
}
