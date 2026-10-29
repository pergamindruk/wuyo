'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini'
import { PRICING, RULES, VOICE, clean } from '@/lib/lab/ai/context'

export type DecisionResult = { ok: true } | { ok: false; error: string }
export type Decision = 'approve' | 'reject'

/** Zapisuje decyzję w panelu. Do Harveya trafia przy najbliższym syncu (co 30 min). */
export async function decideMail(id: string, decision: Decision | null): Promise<DecisionResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }
    if (decision !== null && decision !== 'approve' && decision !== 'reject') {
        return { ok: false, error: 'Nieznana decyzja.' }
    }

    const { data, error } = await supabase
        .from('harvey_outbox')
        .update({ decyzja: decision, decyzja_at: decision ? new Date().toISOString() : null })
        .eq('id', id)
        .eq('status', 'pending_review')
        .is('zastosowano_at', null)
        .select('id')
    if (error) return { ok: false, error: 'Nie udało się zapisać decyzji.' }
    if (!data?.length) return { ok: false, error: 'Ten mail już trafił do Harveya — zmień go w Outboxie.' }

    revalidatePath('/lab/maile')
    revalidatePath('/lab')
    return { ok: true }
}

// ─── Scenariusz rozmowy i odpowiedzi na maila (na firmę) ─────────────────────

export type ScriptResult = { ok: true; text: string } | { ok: false; error: string }

/** Generuje scenariusz dla firmy z kolejki maili i zapisuje go w ai_generations (kind: scenariusz). */
export async function prepareFirmScript(firm: string, regenerate = false): Promise<ScriptResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }

    if (!regenerate) {
        const { data: saved } = await supabase.from('ai_generations').select('output')
            .eq('input_data->>kind', 'scenariusz').eq('input_data->>firm', firm)
            .order('created_at', { ascending: false }).limit(1)
        if (saved?.[0]) return { ok: true, text: saved[0].output as string }
    }

    const { data: mails } = await supabase.from('harvey_outbox')
        .select('do_email, temat, tresc, krok').eq('firma', firm).order('krok')
    if (!mails?.length) return { ok: false, error: 'Brak maili tej firmy.' }
    const domain = (mails[0].do_email as string).split('@')[1] ?? ''
    const drafts = mails.slice(0, 3).map((m) => `Krok ${m.krok}: ${m.temat}\n${m.tresc}`).join('\n\n')

    const prompt = `${VOICE}\n\n${RULES}\n\n${PRICING}

FIRMA: ${firm}
Strona (z adresu mailowego): ${domain || 'brak'}
Maile, które Harvey przygotował do tej firmy (stąd wiesz, co zauważył):
${drafts.slice(0, 3000)}

ZADANIE: scenariusz kontaktu dla Mateusza. Markdown, krótko, zdania do powiedzenia na głos albo do wklejenia.
Zacznij od razu od "## Telefon", bez wstępu. Nie pisz "Pan/Pani" z ukośnikiem. Nie wymyślaj faktów o firmie spoza danych wyżej.
## Telefon
- Otwarcie (20 s): kim jesteś, jedno zdanie o tym, co zauważyłeś u nich, pytanie o minutę rozmowy.
- 2 pytania o ich klientów.
- Jeśli powie: "mam już kogoś", "nie mam czasu", "ile to kosztuje" (najtańsza pasująca opcja z cennika, netto + VAT), "proszę wysłać maila".
- Cel: jeden następny krok, bez naciskania.
## Gdy odpisze na maila
- "Tak, proszę wysłać": gotowa odpowiedź, max 5 zdań, 2-3 konkretne uwagi i propozycja krótkiej rozmowy.
- "Ile to kosztuje?": gotowa odpowiedź z ceną z cennika.
- "Nie, dziękuję": jedno uprzejme zdanie na zamknięcie.`

    try {
        const text = clean(await generateWithFallback('content', prompt))
        await supabase.from('ai_generations').insert({ type: 'quote', input_data: { kind: 'scenariusz', firm }, output: text })
        return { ok: true, text }
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { ok: false, error: /503|overloaded|unavailable/i.test(msg) ? 'Gemini przeciążony, spróbuj za minutę.' : 'Nie udało się przygotować scenariusza.' }
    }
}
