'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY || '')

// ─── Content Generator ───────────────────────────────────────

export async function generateContent(topic: string, platform: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `Jestes ekspertem ds. marketingu i copywritingu z roku 2026 dla marki WUYO (tworzenie stron internetowych premium, UI/UX, identyfikacja wizualna, grafika "Dobra Grafa"). Masz swiadomosc najnowszych trendow, algorytmow i standardow technologicznych.
    Ton marki: nowoczesny, lekko hakerski, pewny siebie, premium, konkretny (unikaj lania wody, uzywaj technicznego, ale zrozumialego zargonu, stawiaj na jakosc i oszczednosc w pakiecie).

    Zadanie: Napisz angazujacy post na platforme: ${platform}, na temat: "${topic}".
    Uzyj odpowiedniego formatowania dla tej platformy (np. akapity, hasztagi, ewentualnie emoji, ale bez przesady). Wpis ma zachecic do interakcji lub pokazania ekspertyzy WUYO.`

        const result = await model.generateContent(prompt)
        const output = result.response.text()

        // Auto-save to history
        await saveGeneration('content', { topic, platform }, output)

        return { success: true, data: output }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udalo sie wygenerowac tresci. Blad: ' + (error.message || JSON.stringify(error)) }
    }
}

// ─── Quote Analyzer ──────────────────────────────────────────

export async function generateQuote(clientMessage: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `Jestes glownym analitykiem projektowym ("AI Mentor") z roku 2026 dla agencji WUYO ("Dobra Grafa"). Masz pelna wiedze o najnowoczesniejszych standardach wyceny, technologiach i oczekiwaniach biznesowych klientow premium.
    Oto wiadomosc od potencjalnego klienta z zapytaniem o projekt:

    "${clientMessage}"

    Zadanie: Przeanalizuj to zapytanie i przygotuj odpowiedz dla wlasciciela WUYO. Odpowiedz ma zawierac:
    1. **Krotkie streszczenie:** Czego dokladnie chce klient i na czym mu zalezy (wymagania techniczne/wizualne).
    2. **Sugerowany pakiet:** (Wybierz najbardziej pasujacy z naszej oferty: Strona One-Page, Strona Multi-Page, Sklep E-Commerce, czy moze identyfikacja wizualna).
    3. **Estymacja wyceny:** (Podaj widelki cenowe, zeby wlasciciel wiedzial od czego zaczac negocjacje - pamietaj, ze jestesmy butikowa agencja premium - wyceniaj konkretnie, ale solidnie).
    4. **Szkic Odpowiedzi:** (Zaproponuj gotowy tekst profesjonalnej, ale "luznej i z pazurem" odpowiedzi do klienta, gotowy do skopiowania i edycji).

    Sformatuj odpowiedz czytelnym Markdownem, uzywaj boldow, list.`

        const result = await model.generateContent(prompt)
        const output = result.response.text()

        // Auto-save to history
        await saveGeneration('quote', { clientMessage }, output)

        return { success: true, data: output }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udalo sie wygenerowac estymacji wyceny. Blad: ' + (error.message || JSON.stringify(error)) }
    }
}

// ─── Pipeline: Create project from quote ─────────────────────

export async function createProjectFromQuote(clientName: string, projectName: string, leadId?: string) {
    const { createProject } = await import('../projects/actions')
    const project = await createProject({ name: projectName, client: clientName })

    if (leadId) {
        try {
            const { updateLeadStatus } = await import('../crm/actions')
            await updateLeadStatus(leadId, 'Wycena')
        } catch (e) {
            console.error('Failed to update lead status:', e)
        }
    }

    return project
}

// ─── History (ai_generations table) ──────────────────────────

async function saveGeneration(type: 'content' | 'quote', inputData: Record<string, any>, output: string) {
    try {
        const supabase = await createClient()
        await supabase.from('ai_generations').insert({
            type,
            input_data: inputData,
            output,
        })
    } catch (e) {
        console.error('saveGeneration error:', e)
    }
}

export async function getGenerations(limit = 20) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ai_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('getGenerations error:', error)
        return []
    }

    return data.map((g: any) => ({
        id: g.id,
        type: g.type as 'content' | 'quote',
        inputData: g.input_data,
        output: g.output,
        createdAt: g.created_at,
    }))
}

export async function deleteGeneration(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ai_generations')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('deleteGeneration error:', error)
        throw new Error('Nie udalo sie usunac wpisu')
    }

    revalidatePath('/lab/ai-studio')
    return true
}
