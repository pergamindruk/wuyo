'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/lab/login?message=Nieprawidłowy_email_lub_hasło')
    }

    revalidatePath('/lab', 'layout')
    redirect('/lab')
}

/**
 * Wysyła link do ustawienia nowego hasła na podany adres.
 *
 * Odpowiedź jest zawsze taka sama, niezależnie od tego, czy konto istnieje —
 * inaczej ten formularz mówiłby obcym, jakie adresy mają dostęp do panelu.
 */
export async function wyslijReset(formData: FormData) {
    const email = String(formData.get('email') ?? '').trim()

    if (email) {
        const supabase = await createClient()
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://wuyo.pl/auth/confirm?next=/lab/nowe-haslo',
        })
    }

    redirect('/lab/login?message=Jeśli_konto_istnieje,_link_jest_już_w_skrzynce')
}

