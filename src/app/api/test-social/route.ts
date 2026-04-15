import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/test-social
 * Testuje połączenie z Facebook i Instagram API bez publikowania czegokolwiek.
 * Wywołaj po wdrożeniu lub po odświeżeniu tokenów.
 */
export async function GET() {
    const fbToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    const fbPageId = process.env.FACEBOOK_PAGE_ID
    const igToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const igUserId = process.env.INSTAGRAM_USER_ID

    const results: Record<string, { ok: boolean; detail: string }> = {}

    // ── Test Facebook Page ────────────────────────────────────────────────────
    if (!fbToken || !fbPageId) {
        results.facebook = { ok: false, detail: 'Brak FACEBOOK_PAGE_ACCESS_TOKEN lub FACEBOOK_PAGE_ID w .env.local' }
    } else {
        try {
            const url = `https://graph.facebook.com/v21.0/${fbPageId}?fields=name,id,fan_count&access_token=${fbToken}`
            const res = await fetch(url, { cache: 'no-store' })
            const data = await res.json()
            if (data.error) {
                results.facebook = {
                    ok: false,
                    detail: `Błąd API: ${data.error.message} (kod: ${data.error.code})`,
                }
            } else {
                results.facebook = {
                    ok: true,
                    detail: `Połączono ✓ | Strona: "${data.name}" | Obserwujący: ${data.fan_count ?? 'brak danych'}`,
                }
            }
        } catch (e) {
            results.facebook = { ok: false, detail: `Wyjątek: ${(e as Error).message}` }
        }
    }

    // ── Test Instagram Account ────────────────────────────────────────────────
    if (!igToken || !igUserId) {
        results.instagram = { ok: false, detail: 'Brak INSTAGRAM_ACCESS_TOKEN lub INSTAGRAM_USER_ID w .env.local' }
    } else {
        try {
            const url = `https://graph.facebook.com/v21.0/${igUserId}?fields=username,id,followers_count&access_token=${igToken}`
            const res = await fetch(url, { cache: 'no-store' })
            const data = await res.json()
            if (data.error) {
                results.instagram = {
                    ok: false,
                    detail: `Błąd API: ${data.error.message} (kod: ${data.error.code})`,
                }
            } else {
                results.instagram = {
                    ok: true,
                    detail: `Połączono ✓ | Konto: @${data.username} | Obserwujący: ${data.followers_count ?? 'brak danych'}`,
                }
            }
        } catch (e) {
            results.instagram = { ok: false, detail: `Wyjątek: ${(e as Error).message}` }
        }
    }

    // ── Sprawdź ważność tokenów (debug_token) ────────────────────────────────
    if (fbToken) {
        try {
            const url = `https://graph.facebook.com/debug_token?input_token=${fbToken}&access_token=${fbToken}`
            const res = await fetch(url, { cache: 'no-store' })
            const data = await res.json()
            const tokenData = data?.data
            if (tokenData) {
                const expiresAt = tokenData.expires_at
                    ? new Date(tokenData.expires_at * 1000).toLocaleDateString('pl-PL')
                    : 'nigdy (long-lived)'
                const isValid = tokenData.is_valid
                results.token_info = {
                    ok: !!isValid,
                    detail: isValid
                        ? `Token ważny ✓ | Wygasa: ${expiresAt} | Typ: ${tokenData.type || 'unknown'}`
                        : `Token NIEWAŻNY ✗ | Powód: ${tokenData.error?.message || 'nieznany'} — odśwież token w Meta Developers`,
                }
            }
        } catch {
            // non-critical
        }
    }

    const allOk = results.facebook?.ok && results.instagram?.ok
    const statusCode = allOk ? 200 : 207

    return NextResponse.json(
        {
            status: allOk ? '✅ Wszystkie połączenia aktywne' : '⚠️ Niektóre połączenia mają problemy',
            tested_at: new Date().toISOString(),
            results,
            next_steps: allOk
                ? 'API działa poprawnie. Możesz używać Social Dashboard do publikowania.'
                : 'Sprawdź błędy powyżej. Najczęstszy problem: wygasły token — odśwież go w https://developers.facebook.com/tools/explorer',
        },
        { status: statusCode }
    )
}
