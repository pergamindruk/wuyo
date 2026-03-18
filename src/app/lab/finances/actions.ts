'use server'

import fs from 'fs'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEwidencja() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('finances')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching finances:', error)
        return []
    }
    
    return data.map((item: any) => ({
        id: item.id,
        documentType: item.document_type,
        date: item.date,
        clientInfo: item.client_info,
        description: item.description,
        amount: Number(item.amount)
    }))
}

export async function addEwidencja(entry: any) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('finances')
        .insert([{
            document_type: entry.documentType,
            date: entry.date,
            client_info: entry.clientInfo,
            description: entry.description,
            amount: entry.amount
        }])
        .select()
        .single()

    if (error) {
        console.error('Error adding finance entry:', error)
        return null
    }

    revalidatePath('/lab/finances')
    return {
        id: data.id,
        documentType: data.document_type,
        date: data.date,
        clientInfo: data.client_info,
        description: data.description,
        amount: Number(data.amount)
    }
}

export async function deleteEwidencja(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('finances')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting finance entry:', error)
        return false
    }
    
    revalidatePath('/lab/finances')
    return true
}

const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY || '')

export async function generateDocument(documentType: string, clientInfo: string, amount: string, description: string) {
    try {
        const kbPath = path.join(process.cwd(), 'src', 'app', 'lab', 'knowledge', 'nierejestrowana-2026.md')
        let knowledge = ''
        if (fs.existsSync(kbPath)) {
            knowledge = fs.readFileSync(kbPath, 'utf-8')
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `Jesteś zautomatyzowanym systemem księgowym WUYO (rok 2026). Twoim jedynym zadaniem jest wygenerowanie perfekcyjnego, sformalizowanego i gotowego do druku dokumentu: ${documentType}.
        
        WAŻNY PRAWNY KONTEKST (DZIAŁALNOŚĆ NIEREJESTROWANA):
        ${knowledge}
        
        DANE DO DOKUMENTU:
        - Nabywca/Klient: ${clientInfo}
        - Sprzedawca (Wystawca): Mateusz Machoś (WUYO Dobra Grafa)
        - Kwota transakcji (Do zapłaty): ${amount} PLN
        - Opis przedmiotu transakcji: ${description}
        - Data wystawienia: ${new Date().toLocaleDateString('pl-PL')}
        - Miejsce wystawienia: Rzeszów

        WYTYCZNE DLA GENERATORA (MUSISZ ICH DOKŁADNIE PRZESTRZEGAĆ):
        1. Zwróć TYLKO I WYŁĄCZNIE "czysty" kod Markdown (bez języka HTML naokoło, to ma być zwykły tekst formatowany na markown) reprezentujący dokument. ZERO WSTĘPÓW typu "Oto Twój rachunek:" ani żadnych podsumowań na końcu. Wynikiem zapytania ma być gotowy, sformatowany obszar wydruku.
        2. Układ dokumentu musi być estetyczny i w pełni profesjonalny:
           - Rozpocznij od napisania z prawej strony symulowanego nagłówka w Markdown np: \`**Miejscowość:** Rzeszów  \n**Data:** ${new Date().toLocaleDateString('pl-PL')}\`.
           - Duży Nagłówek np. \`# Rachunek nr ... / Umowa ...\`.
           - Sekcja SPRZEDAWCA: Tylko imię i nazwisko (Mateusz Machoś) ze znakiem WUYO (zgodnie z przepisami nie podajemy adresu i PESEL-u).
           - Sekcja NABYWCA: Dane podane przez użytkownika.
           - Elegancka tabela w formacie Markdown określająca: Lp., Nazwę usługi / produktu, Jednostkę miary, Ilość, Kwotę.
           - Zdecydowane i wyraźne podsumowanie \`**Kwota do zapłaty: ${amount} PLN**\`.
           - Zawsze dodaj dopisek o zwolnieniu (jeśli to Rachunek / Faktura załącz, że dostawa jest zwolniona z VAT).
           - Na samym dole ułóż dwa miejsca na podpisy: "Podpis Sprzedawcy: ........................" i "Podpis Nabywcy: ........................".
        3. Upewnij się, że nie ma śladów języka potocznego. Dokument to dowód księgowy. Nie używaj cudzysłowów naokoło wygenerowanego wyniku.`

        const result = await model.generateContent(prompt)

        // Dodaj wpis do ewidencji automatycznie w tle
        await addEwidencja({
            documentType,
            date: new Date().toISOString().split('T')[0],
            clientInfo,
            description,
            amount: parseFloat(amount)
        })

        return { success: true, markdown: result.response.text() }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udało się wygenerować dokumentu. Błąd: ' + (error.message || '') }
    }
}
