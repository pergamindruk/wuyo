'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY || '')

export async function getCalendar() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('date', { ascending: true })
    if (error) {
        console.error('getCalendar error:', error)
        return []
    }
    return data || []
}

const AI_PROMPT = (platform: string, format: string, topic: string, goal: string) => `
Jesteś grafikiem-freelancerem i web developerem (React/Next.js) tworzącym agencję WUYO ("Dobra Grafa").
Twoje zadanie to wygenerowanie luźnego, autentycznego posta na Twoje social media z 2026 roku.

KONTEKST PLATFORMY: ${platform}
FORMAT: ${format}
TEMAT: "${topic}"
CEL BIZNESOWY: ${goal}

ZASADY PISANIA (BEZWZGLĘDNIE PRZESTRZEGAJ):
1. PISZ JAK CZŁOWIEK, NIE JAK AI. Unikaj symetrii zdań, idealnego rytmu i pedantycznego słownictwa. Używaj potocznego języka, skrótów myślowych i czasem zacznij zdanie od "A", "I", "Więc".
2. ZERO KORPO-BEŁKOTU I AI-IZMÓW. Zakazane słowa: "innowacyjny", "kompleksowy", "na dzisiejszym rynku", "w dzisiejszym świecie", "zanurz się", "odkryj", "pamiętaj, że", "katalizator", "synergia", "krok po kroku", "zagłębmy się", "odpicuje", "odpicujemy".
3. TWOJA PERSONA: Jesteś do bólu szczery ("gramy w otwarte karty"), znasz swoją wartość ("wjeżdża dobra grafa", "zero syfu z neta", "kuloodporne bezpieczeństwo", "dowiozę to"), wkurza Cię bylejakość i amatorskie podejście do designu. Jesteś "graficznym ziomkiem", uderzasz w ból klienta bez owijania w bawełnę.
4. FORMATOWANIE: Maksymalnie proste. Jeśli to karuzela/rolka, podziel na [Slajd/Scena 1], [Slajd/Scena 2] itd. Każdy slajd to 1-2 krótkie zdania.
5. EMOJI: Użyj max 1-2 w całym tekście. Nie używaj emoji rakiety.
6. DŁUGOŚĆ: Krótko. Max 1000 znaków. Im krócej, tym lepiej. Mięso, zero lania wody.

PROMPT STRUKTURALNY DLA POSTA:
- Start: Zacznij od mocnego hooka, często negatywnego lub kontrowersyjnego stwierdzenia.
- Środek: Bardzo szybko powiedz o co chodzi w temacie posta. Używaj przykładów z życia (np. "Kolejny klient przyszedł z logiem za 5 dych...").
- Koniec: Call To Action luźno rzucone na koniec (np. "Chcesz ogarnąć swój wizerunek? Link w bio.", "Jak u Was z tym tematem?"). Dwa hashtagi na krzyż (np. #Wuyo #DobraGrafa).`

export async function addCalendarEvent(event: {
    topic: string
    platform: string
    format: string
    goal: string
    date: string
    status?: string
    generateAI?: boolean
}) {
    const supabase = await createClient()

    let content: string | undefined
    if (event.generateAI) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
            const result = await model.generateContent(
                AI_PROMPT(event.platform, event.format, event.topic, event.goal)
            )
            content = result.response.text()
        } catch (e) {
            console.error('Calendar AI Gen error', e)
            content = 'Nie udało się wygenerować wpisu. Błąd sieci lub limitów API.'
        }
    }

    const { data, error } = await supabase
        .from('calendar_events')
        .insert({
            topic: event.topic,
            platform: event.platform,
            format: event.format,
            goal: event.goal,
            date: event.date,
            status: 'Szkic',
            content: content ?? null,
        })
        .select()
        .single()

    if (error) {
        console.error('addCalendarEvent error:', error)
        return null
    }
    return data
}

export async function updateEventStatus(id: string, status: string) {
    const supabase = await createClient()
    await supabase
        .from('calendar_events')
        .update({ status })
        .eq('id', id)
}

export async function updateEventContent(id: string, content: string) {
    const supabase = await createClient()
    await supabase
        .from('calendar_events')
        .update({ content })
        .eq('id', id)
}
