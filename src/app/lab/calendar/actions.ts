'use server'

import fs from 'fs'
import path from 'path'

export async function getCalendar() {
    const calendarPath = path.join(process.cwd(), 'calendar.json')
    if (!fs.existsSync(calendarPath)) {
        return []
    }
    try {
        return JSON.parse(fs.readFileSync(calendarPath, 'utf-8'))
    } catch {
        return []
    }
}

import { GoogleGenerativeAI } from '@google/generative-ai'
const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY || '')

export async function addCalendarEvent(event: any) {
    const calendar = await getCalendar()
    event.id = Math.random().toString(36).substring(7)

    if (event.generateAI) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
            const prompt = `Jesteś grafikiem-freelancerem i web developerem (React/Next.js) tworzącym agencję WUYO ("Dobra Grafa").
            Twoje zadanie to wygenerowanie luźnego, autentycznego posta na Twoje social media z 2026 roku.
            
            KONTEKST PLATFORMY: ${event.platform}
            FORMAT: ${event.format}
            TEMAT: "${event.topic}"
            CEL BIZNESOWY: ${event.goal}
            
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
            - Koniec: Call To Action luźno rzucone na koniec (np. "Chcesz ogarnąć swój wizerunek? Link w bio.", "Jak u Was z tym tematem?"). Dwa hashtagi na krzyż (np. #Wuyo #DobraGrafa).`;

            const result = await model.generateContent(prompt)
            event.content = result.response.text()
        } catch (e) {
            console.error("Calendar AI Gen error", e);
            event.content = "Nie udało się wygenerować wpisu. Błąd sieci lub limitów API."
        }
    }

    // Usuń flage przed zapisem
    delete event.generateAI

    calendar.push(event)
    fs.writeFileSync(path.join(process.cwd(), 'calendar.json'), JSON.stringify(calendar, null, 2))
    return event
}

export async function updateEventStatus(id: string, status: string) {
    const calendar = await getCalendar()
    const index = calendar.findIndex((c: any) => c.id === id)
    if (index > -1) {
        calendar[index].status = status
        fs.writeFileSync(path.join(process.cwd(), 'calendar.json'), JSON.stringify(calendar, null, 2))
    }
}
