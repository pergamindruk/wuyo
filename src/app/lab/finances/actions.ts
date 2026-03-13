'use server'

import fs from 'fs'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function getEwidencja() {
    const ewidencjaPath = path.join(process.cwd(), 'ewidencja.json')
    if (!fs.existsSync(ewidencjaPath)) return []
    try {
        return JSON.parse(fs.readFileSync(ewidencjaPath, 'utf-8'))
    } catch {
        return []
    }
}

export async function addEwidencja(entry: any) {
    const ewidencja = await getEwidencja()
    entry.id = Math.random().toString(36).substring(7)
    ewidencja.push(entry)
    fs.writeFileSync(path.join(process.cwd(), 'ewidencja.json'), JSON.stringify(ewidencja, null, 2))
    return entry
}

export async function deleteEwidencja(id: string) {
    const ewidencja = await getEwidencja()
    const updated = ewidencja.filter((e: any) => e.id !== id)
    fs.writeFileSync(path.join(process.cwd(), 'ewidencja.json'), JSON.stringify(updated, null, 2))
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
