'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY || '')

// ─── Vercel Analytics API ────────────────────────────────────

export type AnalyticsData = {
    available: boolean
    debugError?: string
    pageViews?: number
    visitors?: number
    topPages?: { page: string; views: number }[]
    topReferrers?: { referrer: string; views: number }[]
}

export async function getVercelAnalytics(): Promise<AnalyticsData> {
    const token = process.env.VERCEL_API_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID
    const teamId = process.env.VERCEL_TEAM_ID

    if (!token || !projectId) {
        return { available: false, debugError: `Brak zmiennych: ${!token ? 'VERCEL_API_TOKEN ' : ''}${!projectId ? 'VERCEL_PROJECT_ID' : ''}` }
    }

    try {
        const now = Date.now()
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
        const baseUrl = 'https://vercel.com/api/web/insights'
        const teamParam = teamId ? `&teamId=${teamId}` : ''

        // Fetch page views
        const pvRes = await fetch(
            `${baseUrl}/stats/path?projectId=${projectId}&from=${sevenDaysAgo}&to=${now}&limit=10${teamParam}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                next: { revalidate: 3600 },
            }
        )

        if (!pvRes.ok) {
            const errText = await pvRes.text()
            console.error('Vercel Analytics API error:', pvRes.status, errText)
            return { available: false, debugError: `API ${pvRes.status}: ${errText.slice(0, 200)}` }
        }

        const pvData = await pvRes.json()
        const topPages = (pvData?.data || []).slice(0, 5).map((p: any) => ({
            page: p.key || p.path || '/',
            views: p.total || p.count || 0,
        }))
        const totalViews = topPages.reduce((s: number, p: { views: number }) => s + p.views, 0)

        // Fetch referrers
        const refRes = await fetch(
            `${baseUrl}/stats/referrer?projectId=${projectId}&from=${sevenDaysAgo}&to=${now}&limit=5${teamParam}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                next: { revalidate: 3600 },
            }
        )

        let topReferrers: { referrer: string; views: number }[] = []
        if (refRes.ok) {
            const refData = await refRes.json()
            topReferrers = (refData?.data || []).slice(0, 5).map((r: any) => ({
                referrer: r.key || r.referrer || 'Direct',
                views: r.total || r.count || 0,
            }))
        }

        return {
            available: true,
            pageViews: totalViews,
            visitors: Math.round(totalViews * 0.7), // estimate unique
            topPages,
            topReferrers,
        }
    } catch (error: any) {
        console.error('Vercel Analytics fetch error:', error)
        return { available: false, debugError: `Exception: ${error?.message || String(error)}` }
    }
}

// ─── SEO Strategy Generator ──────────────────────────────────

export async function getSeoSuggestions(realData?: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const dataContext = realData
            ? `\n\nPRAWDZIWE DANE Z WITRYNY WUYO.PL (ostatnie 7 dni):\n${realData}\nUwzglednij te dane w swojej strategii — odwoluj sie do konkretnych liczb i stron.`
            : ''

        const prompt = `Jestes "Harbor SEO AI" — najbardziej zaawansowanym systemem analitycznym dla agencji WUYO (Dobra Grafa i strony WWW w React/Next.js).
        Skanujesz stan sieci z perspektywy roku 2026 (AI Overviews, Zero-Click searches, Core Web Vitals 2.0).
        ${dataContext}

        TWOJE ZADANIE: Wygeneruj agresywna strategie SEO na najblizsze 30 dni dla marki WUYO.

        KONTEKST WUYO:
        - Biznes: Premium Design & Next.js Dev.
        - Brand Voice: "Graficzny ziomek", hakerski zapal, brak korpo-belkotu.

        WYTYCZNE (BEZWZGLEDNIE PRZESTRZEGAJ):
        1. ZERO KORPO-AI-IZMOW. Zadnych slow "synergia", "odkryj", "pamietaj, ze". Pisz twardo, konkretnie i z jajem.
        2. BADZ TECHNICZNY. Mow o strukturze DOM, INP, optymalizacji pod AI Scrapery i o linkach, ktore faktycznie rankuja.
        3. WYMAGANE CZESCI:
           - [KLIN] 1 potezna taktyka "pod prad", ktora da nam przewage.
           - [OFF-SITE] Gdzie sie pokazac, by Google uznalo nas za ekspertow w 2026.
           - [SEMANTYKA] Jakie konkretne frazy (LSI/Entity) wrzucic do portfolio, by przyciagac bogatych klientow.

        Zwroc odpowiedz w czystym Markdown, hakerska narracja.`

        const result = await model.generateContent(prompt)
        return { success: true, data: result.response.text() }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udalo sie polaczyc z SEO Specjalista. Sprawdz limity AI: ' + (error.message || '') }
    }
}
