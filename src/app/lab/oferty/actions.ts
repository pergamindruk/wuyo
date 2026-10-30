'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini'
import { PRICING, RULES, VOICE, clean } from '@/lib/lab/ai/context'
import { newPublicToken, type OfferData } from '@/lib/lab/offer'

type R<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

async function authed() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user ? supabase : null
}

/** Link publiczny zlecenia (brief i oferta). Tworzy token przy pierwszym użyciu. */
export async function ensureJobToken(jobId: string): Promise<R<string>> {
    const supabase = await authed()
    if (!supabase) return { ok: false, error: 'Brak dostępu.' }
    const { data: job } = await supabase.from('jobs').select('public_token').eq('id', jobId).maybeSingle()
    if (!job) return { ok: false, error: 'Nie ma takiego zlecenia.' }
    if (job.public_token) return { ok: true, data: job.public_token as string }
    const token = newPublicToken()
    const { error } = await supabase.from('jobs').update({ public_token: token }).eq('id', jobId)
    if (error) return { ok: false, error: 'Nie udało się utworzyć linku.' }
    revalidatePath('/lab/oferty')
    return { ok: true, data: token }
}

export type DraftInput = { jobId: string; service: string; priceGrosze: number; notes: string; clientName: string; clientCompany: string; brief: string }

/** AI pisze tylko słowa (tytuł, wstęp, zakres, CTA). Cena przychodzi z formularza. */
export async function draftOffer(input: DraftInput): Promise<R<Pick<OfferData, 'title' | 'intro' | 'scope' | 'cta'>>> {
    if (!(await authed())) return { ok: false, error: 'Brak dostępu.' }
    const prompt = `${VOICE}\n\n${RULES}\n\n${PRICING}

Piszesz ofertę dla klienta studia WUYO. Format studia: wstęp / zakres / cena / CTA. Cenę wstawi system, Ty jej NIE podajesz.
KLIENT: ${input.clientName}${input.clientCompany ? `, ${input.clientCompany}` : ''}
USŁUGA: ${input.service}
NOTATKI MATEUSZA (z rozmowy): ${input.notes || 'brak'}
BRIEF OD KLIENTA: ${input.brief.slice(0, 3000) || 'brak'}

Zwróć TYLKO JSON: {"title": "...", "intro": "...", "scope": ["...", "..."], "cta": "..."}
- title: krótki tytuł oferty, np. "Logo i wizytówki dla Piekarni Kowalski".
- intro: 2-3 zdania. BEZ powitania ("Dzień dobry", "panie Janie") - zacznij od ich sytuacji (z notatek i briefu). Na "Ty" albo bezosobowo, bez "Pan/Pani". Bez wazeliny.
- scope: 4-7 punktów, konkretnie co klient dostaje (z opisu pakietu w cenniku + to, co wynika z briefu). Każdy punkt jedno zdanie.
- cta: 2 zdania: zaakceptuj przyciskiem „Akceptuję ofertę” pod ofertą (albo odpisz na maila), potem dostajesz umowę i dane do zaliczki 50%. Nie obiecuj terminu.
Nie wymyślaj faktów o firmie.`
    try {
        const raw = await generateWithFallback('content', prompt)
        const json = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
        const d = JSON.parse(json) as { title: string; intro: string; scope: string[]; cta: string }
        return { ok: true, data: { title: clean(d.title), intro: clean(d.intro), scope: (d.scope ?? []).map(clean).filter(Boolean), cta: clean(d.cta) } }
    } catch {
        return { ok: false, error: 'AI nie przygotowało tekstu. Spróbuj jeszcze raz.' }
    }
}

/** Zapisuje ofertę (nowa wersja w ai_generations) i opcjonalnie oznacza zlecenie jako „oferta wysłana”. */
export async function saveOffer(jobId: string, data: OfferData, markSent: boolean): Promise<R<string>> {
    const supabase = await authed()
    if (!supabase) return { ok: false, error: 'Brak dostępu.' }
    const { error } = await supabase.from('ai_generations').insert({ type: 'quote', input_data: { kind: 'oferta', jobId }, output: JSON.stringify(data) })
    if (error) return { ok: false, error: 'Nie udało się zapisać oferty.' }
    const token = await ensureJobToken(jobId)
    if (markSent) {
        await supabase.from('jobs').update({ offer_sent_at: new Date().toISOString(), stage: 2, price_grosze: data.priceGrosze, updated_at: new Date().toISOString() })
            .eq('id', jobId).lte('stage', 2)
    }
    revalidatePath('/lab/oferty')
    revalidatePath('/lab/lejek')
    return token.ok ? { ok: true, data: token.data } : token
}
