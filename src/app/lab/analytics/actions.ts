'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY || '')

export async function getSeoSuggestions() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `Jesteś "Harbor SEO AI" — najbardziej zaawansowanym systemem analitycznym dla agencji WUYO (Dobra Grafa i strony WWW w React/Next.js).
        Skanujesz stan sieci z perspektywy roku 2026 (AI Overviews, Zero-Click searches, Core Web Vitals 2.0).
        
        TWOJE ZADANIE: Wygeneruj agresywną strategię SEO na najbliższe 30 dni dla marki WUYO.
        
        KONTEKST WUYO:
        - Biznes: Premium Design & Next.js Dev.
        - Brand Voice: "Graficzny ziomek", hakerski zapał, brak korpo-bełkotu.
        
        WYTYCZNE (BEZWZGLĘDNIE PRZESTRZEGAJ):
        1. ZERO KORPO-AI-IZMÓW. Żadnych słów "synergia", "odkryj", "pamiętaj, że". Pisz twardo, konkretnie i z jajem.
        2. BĄDŹ TECHNICZNY. Mów o strukturze DOM, INP, optymalizacji pod AI Scrapery i o linkach, które faktycznie rankują.
        3. WYMAGANE CZĘŚCI:
           - [KLIN] 1 potężna taktyka "pod prąd", która da nam przewagę.
           - [OFF-SITE] Gdzie się pokazać, by Google uznało nas za ekspertów w 2026.
           - [SEMANTYKA] Jakie konkretne frazy (LSI/Entity) wrzucić do portfolio, by przyciągać bogatych klientów.
        
        Zwróć odpowiedź w czystym Markdown, hakerska narracja.`;

        const result = await model.generateContent(prompt)
        return { success: true, data: result.response.text() }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udało się połączyć z SEO Specjalistą. Sprawdź limity AI: ' + (error.message || '') }
    }
}
