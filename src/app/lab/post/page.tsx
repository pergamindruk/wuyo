import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostGenerator } from './PostGenerator'

// Research z wyszukiwarką, post z „myśleniem” i zdjęcie z modelu obrazu trwają po kilkadziesiąt sekund.
export const maxDuration = 180

export const metadata = { title: 'Generator postów | WUYO Lab' }

export default async function PostGeneratorPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')
    return <PostGenerator />
}
