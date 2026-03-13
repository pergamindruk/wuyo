'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

// Inicjalizacja Gemini API
const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY || '')

export async function generateContent(topic: string, platform: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `Jesteś ekspertem ds. marketingu i copywritingu z roku 2026 dla marki WUYO (tworzenie stron internetowych premium, UI/UX, identyfikacja wizualna, grafika "Dobra Grafa"). Masz świadomość najnowszych trendów, algorytmów i standardów technologicznych.
    Ton marki: nowoczesny, lekko hakerski, pewny siebie, premium, konkretny (unikaj lania wody, używaj technicznego, ale zrozumiałego żargonu, stawiaj na jakość i oszczędność w pakiecie).
    
    Zadanie: Napisz angażujący post na platformę: ${platform}, na temat: "${topic}".
    Użyj odpowiedniego formatowania dla tej platformy (np. akapity, hasztagi, ewentualnie emoji, ale bez przesady). Wpis ma zachęcić do interakcji lub pokazania ekspertyzy WUYO.`

        const result = await model.generateContent(prompt)
        return { success: true, data: result.response.text() }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udało się wygenerować treści. Błąd: ' + (error.message || JSON.stringify(error)) }
    }
}

export async function generateQuote(clientMessage: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) // Fallback na flash z powodu limitów Pro

        const prompt = `Jesteś głównym analitykiem projektowym ("AI Mentor") z roku 2026 dla agencji WUYO ("Dobra Grafa"). Masz pełną wiedzę o najnowocześniejszych standardach wyceny, technologiach i oczekiwaniach biznesowych klientów premium.
    Oto wiadomość od potencjalnego klienta z zapytaniem o projekt:
    
    "${clientMessage}"
    
    Zadanie: Przeanalizuj to zapytanie i przygotuj odpowiedź dla właściciela WUYO. Odpowiedź ma zawierać:
    1. **Krótkie streszczenie:** Czego dokładnie chce klient i na czym mu zależy (wymagania techniczne/wizualne).
    2. **Sugerowany pakiet:** (Wybierz najbardziej pasujący z naszej oferty: Strona One-Page, Strona Multi-Page, Sklep E-Commerce, czy może identyfikacja wizualna).
    3. **Estymacja wyceny:** (Podaj widełki cenowe, żeby właściciel wiedział od czego zacząć negocjacje - pamiętaj, że jesteśmy butikową agencją premium - wyceniaj konkretnie, ale solidnie).
    4. **Szkic Odpowiedzi:** (Zaproponuj gotowy tekst profesjonalnej, ale "luźnej i z pazurem" odpowiedzi do klienta, gotowy do skopiowania i edycji).
    
    Sformatuj odpowiedź czytelnym Markdownem, używaj boldów, list.`

        const result = await model.generateContent(prompt)
        return { success: true, data: result.response.text() }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udało się wygenerować estymacji wyceny. Błąd: ' + (error.message || JSON.stringify(error)) }
    }
}
