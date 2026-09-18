import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Wymienia jednorazowy token z maila na sesję.
 *
 * Tu trafiają linki z „Send password recovery" i z magic linka. Bez tej trasy
 * link z maila lądował na stronie głównej i nie robił nic — czyli nie było
 * żadnej drogi do odzyskania dostępu do panelu.
 *
 * Po udanej wymianie odsyłamy pod adres z `next` (domyślnie ustawienie nowego
 * hasła). Sesja jest już w ciasteczkach, więc `/lab` przepuści dalej.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/lab/nowe-haslo'

    // `next` tylko wewnątrz serwisu — inaczej link z maila da się przekierować
    // na cudzą stronę.
    const bezpiecznyNext = next.startsWith('/') && !next.startsWith('//') ? next : '/lab/nowe-haslo'

    if (tokenHash && type) {
        const supabase = await createClient()
        const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

        if (!error) {
            return NextResponse.redirect(new URL(bezpiecznyNext, request.url))
        }
    }

    return NextResponse.redirect(
        new URL('/lab/login?message=Link_wygasł_albo_został_już_użyty', request.url)
    )
}
