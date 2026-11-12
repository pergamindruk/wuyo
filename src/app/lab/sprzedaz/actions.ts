'use server'

import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini'
import { RULES, VOICE, clean } from '@/lib/lab/ai/context'
import { getMonthGoal } from '@/lib/lab/today/queries'
import { computeSalesStats, salesSummaryText } from '@/lib/lab/sales/stats'
import { loadSalesInput, parsePeriod } from '@/lib/lab/sales/load'

/** 3 pomysły na miesiąc. Liczby liczy serwer, AI dostaje tylko gotowe podsumowanie. */
export async function getSalesTips(period: number): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Brak dostępu.' }

    const days = parsePeriod(String(period))
    const [input, goal] = await Promise.all([loadSalesInput(supabase, days), getMonthGoal(supabase)])
    const summary = salesSummaryText(computeSalesStats(input, days), goal)

    const prompt = `${VOICE}\n\n${RULES}

Jesteś doradcą sprzedaży jednoosobowego studia WUYO z Rzeszowa (logo, druk, strony dla małych firm). Cel: 7000 zł miesięcznie.
Klient: właściciel małej firmy 40-55 lat. Firma startuje w grudniu 2026, wcześniej brak ruchu to nie alarm.

LICZBY Z PANELU (policzone z bazy, jedyne źródło faktów):
${summary}

ZADANIE: markdown, krótko.
"## Co mówią liczby": 3 zdania tylko z liczb wyżej. Jeśli jest UWAGA o małej próbie, powiedz to wprost i nie wyciągaj wniosków z procentów.
"## Gdzie stoi sprzedaż": jedno miejsce w lejku, gdzie ginie najwięcej (z liczb).
"## 3 pomysły na ten miesiąc": każdy = co zrobić, z kim (np. zlecenia z etapu X), ile czasu, po czym poznasz, że działa.
Nie wymyślaj liczb, klientów ani wyników. Jeśli danych brakuje, napisz czego.`
    try {
        return { ok: true, text: clean(await generateWithFallback('content', prompt)) }
    } catch {
        return { ok: false, error: 'AI nie odpowiada. Spróbuj za chwilę.' }
    }
}
