'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Przekierowanie z komunikatem dla użytkownika.
 *
 * Komunikat MUSI być zakodowany. `redirect()` w akcji serwerowej Next wkłada
 * adres do nagłówka HTTP `x-action-redirect`, a nagłówki przyjmują tylko ASCII —
 * samo „ł" czy „ś" w adresie wywala żądanie błędem ERR_INVALID_CHAR i użytkownik
 * widzi „Coś poszło nie tak" zamiast komunikatu.
 */
function przekierujZKomunikatem(tekst: string): never {
    redirect(`/lab/login?message=${encodeURIComponent(tekst)}`)
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        przekierujZKomunikatem('Nieprawidłowy e-mail lub hasło')
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

    przekierujZKomunikatem('Jeśli konto istnieje, link jest już w skrzynce')
}

