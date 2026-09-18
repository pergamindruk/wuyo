import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Klient z kluczem serwisowym — omija RLS.
 *
 * Do publicznych tras API, które muszą zapisać coś do tabeli zamkniętej przed
 * światem (`leads`, `page_views`). Klucz `SUPABASE_SERVICE_ROLE_KEY` nie ma
 * przedrostka NEXT_PUBLIC_, więc nie trafia do przeglądarki — i nie może trafić.
 *
 * Nigdy nie importuj tego pliku w komponencie klienckim ani nigdzie, gdzie kod
 * idzie do przeglądarki. Tylko trasy API i akcje serwerowe.
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
        throw new Error(
            'Brak NEXT_PUBLIC_SUPABASE_URL albo SUPABASE_SERVICE_ROLE_KEY — zapis do bazy nie zadziała.'
        )
    }

    return createSupabaseClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    })
}
