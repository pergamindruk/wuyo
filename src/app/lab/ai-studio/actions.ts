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

        const prompt = `Jestes glownym analitykiem projektowym ("AI Mentor") z roku 2026 dla agencji WUYO ("Dobra Grafa") z Rzeszowa. Wlasciciel ma wlasny sprzet do druku (Epson L18050 A3+, ploter tnacy Cameo 5, laminator, gilotyna) - dzieki temu koszt materialu to ok. 1/3 ceny outsource.
    Oto wiadomosc od potencjalnego klienta z zapytaniem o projekt:

    "${clientMessage}"

    CENNIK REFERENCYJNY WUYO (brutto, 2026, rynek rzeszowski):

    DRUK wlasny (projekt + druk lacznie, ceny calkowite dla klienta):
    - Wizytowki 500 szt. (dwustronne): 200-250 zl/set
    - Ulotki A6 500 szt.: 250-300 zl/set
    - Ulotki A5 500 szt.: 300-370 zl/set
    - Plakat A3 (1 szt.): 60-100 zl
    - Vouchery 500 szt.: 200-280 zl/set
    Adaptacje/warianty tego samego projektu: 50% ceny zestawu bazowego.
    Rabat pakietowy przy 4+ pozycjach dla jednej marki: -10-15% od sumy.

    PROJEKT GRAFICZNY (bez druku):
    - Logo: od 800 zl (baza), od 1000 zl (pelne)
    - Identyfikacja wizualna: od 2500 zl
    - Wizytowka (sam projekt): 120-180 zl
    - Ulotka (sam projekt): 150-220 zl
    - Rollup/Banner (sam projekt): 300-400 zl

    STRONY WWW:
    - One-Page: 1200 zl
    - Multi-Page: 2900 zl
    - E-commerce: wycena ind. (min. 5000 zl)

    SOCIAL MEDIA / DIGITAL:
    - Social Media Kit: od 1200 zl
    - Karuzela IG/LinkedIn: od 150 zl/post
    - Pitch Deck: od 600 zl
    - Szablon newslettera: od 300 zl

    Zadanie: Przeanalizuj to zapytanie i przygotuj odpowiedz dla wlasciciela WUYO. Odpowiedz ma zawierac:
    1. **Krotkie streszczenie:** Czego dokladnie chce klient i na czym mu zalezy.
    2. **Sugerowany pakiet / pozycje z oferty:** Dopasuj konkretne pozycje z cennika.
    3. **Estymacja wyceny:** Podaj konkretne kwoty (nie "od X") dla kazdej pozycji oraz lacznie. Jesli kilka elementow dla jednej marki - uwzglednij rabat pakietowy i zaznacz adaptacje. Wyceny musza byc zakorzenione w powyzszym cenniku - nie wymyslaj wyzsZych kwot.
    4. **Szkic odpowiedzi do klienta:** Gotowy tekst w stylu WUYO (konkretny, "luzny z pazurem", bez lania wody), gotowy do skopiowania i edycji.

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
