'use server'

import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini'
import { revalidatePath } from 'next/cache'
import { PRICING, RULES, clean } from '@/lib/lab/ai/context'
import { warsawIsoDate } from '@/lib/lab/today/format'

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

const AI_PROMPT = (platform: string, format: string, topic: string, goal: string) => `Piszesz post na social media studia WUYO (Mateusz, grafika, druk i strony dla małych firm z Rzeszowa).

${RULES}

${PRICING}

${POST_RULES}

PLATFORMA: ${platform}
FORMAT: ${format}
TEMAT: "${topic}"
CEL: ${goal}

JAK PISAĆ POST:
- Pierwsze zdanie konkretne, z życia małej firmy. Bez clickbaitu.
- Środek: jeden przykład albo jedna rada, którą właściciel firmy może od razu sprawdzić u siebie.
- Koniec: luźne zaproszenie do kontaktu albo pytanie do czytelników. Cena tylko z cennika i tylko gdy cel to Sprzedaż.
- Karuzela lub rolka: podziel na [Slajd 1], [Slajd 2]... po 1-2 krótkie zdania.
- Max 1 emoji, 2-3 hashtagi na końcu (#Rzeszów #WUYO + jeden tematyczny). Max 900 znaków.
- Zwróć tylko gotowy tekst posta, bez komentarzy.`

export async function addCalendarEvent(event: {
    topic: string
    platform: string
    format: string
    goal: string
    date: string
    status?: string
    generateAI?: boolean
    content?: string
}) {
    const supabase = await createClient()

    let content: string | undefined
    if (event.generateAI) {
        try {
            content = postText(await generateWithFallback('document', AI_PROMPT(event.platform, event.format, event.topic, event.goal), { noThinking: true }))
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
            status: event.status ?? 'Szkic',
            content: content ?? event.content ?? null,
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

export async function schedulePost(eventId: string, scheduledAt: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('calendar_events')
        .update({
            scheduled_at: scheduledAt,
            status: 'Zaplanowane',
        })
        .eq('id', eventId)

    if (error) {
        console.error('schedulePost error:', error)
        throw new Error('Nie udalo sie zaplanowac publikacji')
    }
    return true
}

export async function updateEventImageUrl(id: string, imageUrl: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('calendar_events')
        .update({ image_url: imageUrl })
        .eq('id', id)

    if (error) {
        console.error('updateEventImageUrl error:', error)
        throw new Error('Nie udalo sie zapisac URL grafiki')
    }
    return true
}

export async function getScheduledPosts() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('status', 'Zaplanowane')
        .not('scheduled_at', 'is', null)
        .order('scheduled_at', { ascending: true })

    if (error) {
        console.error('getScheduledPosts error:', error)
        return []
    }
    return data || []
}

// ─── Zaplanuj tydzień: 3 posty (pon, śr, pt) × FB + IG jako szkice ──────────

const POST_RULES = `GŁOS W POSTACH (Mateusz, WUYO, Rzeszów):
- Luźno i konkretnie, krótkie zdania, pierwsza osoba liczby pojedynczej ("zrobiłem", "sprawdzam", "mam pakiet"), nie "my" ani "u nas". Miło, bez spiny, bez wykrzykników co zdanie.
- Bez powitań i bez przedstawiania się: NIE zaczynaj od "Dzień dobry", "Cześć", "Mateusz z WUYO". Pierwsze zdanie to od razu konkret.
- Do czytelników na "Ty" albo "Wy" ("Sprawdź", "Wpiszcie"). Nigdy "Pan/Pani" ani ukośników typu "zadowolony/a".
- Zakazane: kompleksowy, dedykowany, profesjonalny, rozwiązania, innowacyjny, premium, długie myślniki. Bez anglicyzmów, także w hashtagach (nie "feedback", "design", "tip", "mockup", "marketing", "must-have", "biznes online").
- NIE wymyślaj realizacji, klientów ani liczb. Realizację opisujesz tylko, jeśli Mateusz ją podał niżej. Bez tego post sprzedażowy opisuje pakiet z cennika.
- Temat do kalendarza zwykłym zdaniem, wielka litera tylko na początku.`

const WEEK_PLAN = [
    { weekday: 1, goal: 'Edukacja', angle: 'poradnik: jedna rzecz, którą właściciel firmy sprawdzi u siebie w 5 minut (strona, wizytówka Google, logo, ulotka)' },
    { weekday: 3, goal: 'Zaangażowanie', angle: 'za kulisami: jak wygląda jeden zwykły krok mojej pracy (dobór papieru do wizytówek, poprawki do logo, sprawdzanie strony na telefonie) i pytanie do czytelników. Bez wymyślonych historii i anegdot' },
    { weekday: 5, goal: 'Sprzedaż', angle: 'realizacja (tylko jeśli podana niżej) albo pakiet z cennika: co dokładnie się dostaje i ile to kosztuje (netto + 23% VAT), zaproszenie do wiadomości' },
] as const

type PlannedPost = { topic: string; facebook: string; instagram: string; grafika: string }

/** Najbliższy dzień tygodnia (1 = pon … 5 = pt) po dzisiejszym, w czasie warszawskim. */
function nextWeekday(target: number): string {
    const today = new Date(`${warsawIsoDate()}T12:00:00Z`).getUTCDay()
    let diff = target - today
    if (diff <= 0) diff += 7
    return warsawIsoDate(diff)
}

/** Zapas na wypadek, gdyby AI i tak zaczęło od powitania: ucina samo powitanie (do 2 razy, np. „Mateusz z WUYO. Dzień dobry!”). */
const GREETING = /^\s*(?:mateusz z wuyo|dzień dobry|cześć|hej)[^.!?\n]*[.!?,]?\s*/i

const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

function postText(text: string): string {
    const stripped = text
        .replace(GREETING, '').replace(GREETING, '')
        .replace(/[^.!?\n]*rozwiązani[^.!?\n]*[.!?]\s*/giu, '')
    return clean(capitalize(stripped))
}

/** Tekst między etykietą a następną etykietą (albo końcem bloku). */
function section(block: string, label: string): string {
    const re = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n(?:TEMAT|FACEBOOK|INSTAGRAM|GRAFIKA):|$)`)
    return (block.match(re)?.[1] ?? '').replace(/\*\*/g, '').trim()
}

/** Format z separatorami zamiast JSON: ucięta odpowiedź dalej daje kompletne posty sprzed ucięcia. */
function parsePosts(text: string): PlannedPost[] {
    return text
        .split(/^#{2,3}\s*POST\s*\d*\s*$/im)
        .map((block) => ({
            topic: capitalize(section(block, 'TEMAT').split('\n')[0] ?? ''),
            facebook: postText(section(block, 'FACEBOOK')),
            instagram: postText(section(block, 'INSTAGRAM')),
            grafika: section(block, 'GRAFIKA').split('\n')[0] ?? '',
        }))
        .filter((p) => p.topic && p.facebook && p.instagram)
}

export async function planWeek(hint?: string):
    Promise<{ ok: true; created: number; dates: string[] } | { ok: false; error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }

    const { data: recent } = await supabase
        .from('calendar_events').select('topic').order('date', { ascending: false }).limit(15)
    const recentTopics = (recent ?? []).map((r) => `- ${r.topic as string}`).join('\n') || '- (brak)'

    const prompt = `Zaplanuj 3 posty na social media studia WUYO na najbliższy tydzień.

${RULES}

${PRICING}

${POST_RULES}

${hint?.trim() ? `CO MATEUSZ CHCE W TYM TYGODNIU: "${hint.trim().slice(0, 500)}"\n` : ''}OSTATNIE TEMATY (nie powtarzaj):
${recentTopics}

POSTY:
${WEEK_PLAN.map((d, i) => `${i + 1}. ${d.angle}`).join('\n')}

Każdy post w dwóch wersjach: facebook (do 800 znaków, 1-2 hashtagi) i instagram (do 500 znaków, 3-4 hashtagi, w tym #Rzeszów).
grafika: 1 zdanie, co ma być na zdjęciu lub grafice (najlepiej prawdziwe zdjęcie z pracowni albo realizacji).

Zwróć DOKŁADNIE ten układ, 3 razy, bez wstępu i komentarzy:
## POST 1
TEMAT: krótki temat do kalendarza
FACEBOOK:
treść posta na Facebook
INSTAGRAM:
treść posta na Instagram
GRAFIKA: jedno zdanie`

    let posts: PlannedPost[] = []
    try {
        posts = parsePosts(await generateWithFallback('document', prompt, { noThinking: true }))
    } catch (e) {
        console.error('planWeek AI error:', e)
        return { ok: false, error: 'AI nie odpowiada. Spróbuj za chwilę.' }
    }
    if (posts.length === 0) return { ok: false, error: 'AI zwróciło coś nieczytelnego. Kliknij jeszcze raz.' }

    const dates: string[] = []
    const rows = posts.slice(0, WEEK_PLAN.length).flatMap((p, i) => {
        const plan = WEEK_PLAN[i]
        const date = nextWeekday(plan.weekday)
        dates.push(date)
        const photo = p.grafika ? `\n\n---\nGrafika: ${p.grafika}` : ''
        const base = { topic: p.topic.slice(0, 120), format: 'Post z grafiką', goal: plan.goal, date, status: 'Szkic' }
        return [
            ...(p.facebook ? [{ ...base, platform: 'Facebook', content: p.facebook + photo }] : []),
            ...(p.instagram ? [{ ...base, platform: 'Instagram', content: p.instagram + photo }] : []),
        ]
    })

    const { error } = await supabase.from('calendar_events').insert(rows)
    if (error) {
        console.error('planWeek insert error:', error)
        return { ok: false, error: 'Posty gotowe, ale nie zapisały się w kalendarzu.' }
    }
    revalidatePath('/lab/calendar')
    return { ok: true, created: rows.length, dates }
}
