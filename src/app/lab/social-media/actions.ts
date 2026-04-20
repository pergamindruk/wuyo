'use server'

import { createClient } from '@/lib/supabase/server'
import { getModel } from '@/lib/gemini'

const GRAPH_API_VERSION = 'v21.0'

async function postGraph(
    url: string,
    body: Record<string, string>
): Promise<any> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(body).toString(),
    })
    return await res.json()
}

async function getGraph(
    url: string,
    params: Record<string, string>
): Promise<any> {
    const u = new URL(url)
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
    const res = await fetch(u.toString(), { method: 'GET' })
    return await res.json()
}

// Usuwa proste formatowanie Markdown przed wysłaniem do API platform
function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim()
}

// ─── Status połączeń ─────────────────────────────────────────────────────────

export async function getPlatformStatus() {
    return {
        instagram: !!(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID),
        facebook: !!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
        youtube: !!(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_REFRESH_TOKEN),
    }
}

// ─── Opublikowane posty ───────────────────────────────────────────────────────

export async function getPublishedPosts() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('calendar_events')
        .select('id, topic, platform, published_at, ig_post_id, fb_post_id, yt_video_id')
        .eq('status', 'Opublikowane')
        .order('published_at', { ascending: false })
        .limit(30)
    return data || []
}

// ─── Instagram ────────────────────────────────────────────────────────────────

async function waitForIgContainer(
    userId: string,
    containerId: string,
    accessToken: string
): Promise<{ ok: true } | { ok: false; error: string }> {
    // IG potrafi zwrócić błąd, jeśli opublikujesz zanim container będzie gotowy.
    // Krótki polling (max ~25s) stabilizuje publikację.
    const deadline = Date.now() + 25_000
    while (Date.now() < deadline) {
        const status = await getGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${containerId}`,
            { fields: 'status_code', access_token: accessToken }
        )
        const code = status?.status_code as string | undefined
        if (code === 'FINISHED') return { ok: true }
        if (code === 'ERROR') return { ok: false, error: 'Instagram: błąd przetwarzania kontenera mediów' }
        await new Promise(r => setTimeout(r, 1500))
    }
    return { ok: false, error: 'Instagram: timeout podczas przygotowania publikacji (spróbuj ponownie za chwilę)' }
}

export async function publishToInstagram(
    postId: string,
    imageUrl: string,
    caption: string
): Promise<{ success: true; postId: string } | { success: false; error: string }> {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const userId = process.env.INSTAGRAM_USER_ID

    if (!accessToken || !userId) {
        return {
            success: false,
            error: 'Brak konfiguracji Instagram. Dodaj INSTAGRAM_ACCESS_TOKEN i INSTAGRAM_USER_ID do .env.local',
        }
    }

    try {
        const cleanCaption = stripMarkdown(caption)

        // Krok 1: Utwórz kontener mediów
        const containerData = await postGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media`,
            {
                image_url: imageUrl,
                caption: cleanCaption,
                access_token: accessToken,
            }
        )
        if (!containerData.id) {
            return {
                success: false,
                error: `Instagram: ${containerData.error?.message || 'Błąd tworzenia media container'}`,
            }
        }

        const wait = await waitForIgContainer(userId, containerData.id, accessToken)
        if (!wait.ok) {
            return { success: false, error: wait.error }
        }

        // Krok 2: Opublikuj
        const publishData = await postGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media_publish`,
            {
                creation_id: containerData.id,
                access_token: accessToken,
            }
        )
        if (!publishData.id) {
            return {
                success: false,
                error: `Instagram: ${publishData.error?.message || 'Błąd publikacji'}`,
            }
        }

        const mediaInfo = await getGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${publishData.id}`,
            { fields: 'permalink', access_token: accessToken }
        )
        const permalink: string | undefined = mediaInfo?.permalink

        // Zapisz wynik w Supabase
        const supabase = await createClient()
        await supabase
            .from('calendar_events')
            .update({
                status: 'Opublikowane',
                image_url: imageUrl,
                ig_post_id: permalink || publishData.id,
                published_at: new Date().toISOString(),
            })
            .eq('id', postId)

        return { success: true, postId: publishData.id }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

export async function publishToFacebook(
    postId: string,
    message: string,
    imageUrl?: string
): Promise<{ success: true; postId: string } | { success: false; error: string }> {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    const pageId = process.env.FACEBOOK_PAGE_ID

    if (!accessToken || !pageId) {
        return {
            success: false,
            error: 'Brak konfiguracji Facebook. Dodaj FACEBOOK_PAGE_ACCESS_TOKEN i FACEBOOK_PAGE_ID do .env.local',
        }
    }

    try {
        const cleanMessage = stripMarkdown(message)

        let endpoint: string
        let body: Record<string, string>

        if (imageUrl) {
            // Post ze zdjęciem
            endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/photos`
            body = { url: imageUrl, caption: cleanMessage, access_token: accessToken }
        } else {
            // Tekstowy post na wall
            endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`
            body = { message: cleanMessage, access_token: accessToken }
        }

        const data = await postGraph(endpoint, body)

        if (!data.id) {
            return {
                success: false,
                error: `Facebook: ${data.error?.message || 'Błąd publikacji'}`,
            }
        }

        const fbInfo = await getGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${data.id}`,
            { fields: 'permalink_url', access_token: accessToken }
        )
        const fbPermalink: string | undefined = fbInfo?.permalink_url

        const supabase = await createClient()
        await supabase
            .from('calendar_events')
            .update({
                status: 'Opublikowane',
                image_url: imageUrl ?? null,
                fb_post_id: fbPermalink || data.id,
                published_at: new Date().toISOString(),
            })
            .eq('id', postId)

        return { success: true, postId: data.id }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}

// ─── YouTube – generowanie metadanych (nie upload wideo) ─────────────────────

export type YtMetadata = {
    title: string
    description: string
    tags: string[]
    hashtags: string[]
}

export async function generateYouTubeMetadata(
    topic: string,
    content: string
): Promise<{ success: true; data: YtMetadata } | { success: false; error: string }> {
    if (!process.env.WUYO_GEMINI_KEY) {
        return { success: false, error: 'Brak WUYO_GEMINI_KEY w .env.local' }
    }

    try {
        const model = getModel('content')

        const prompt = `Jesteś ekspertem YouTube SEO. Wygeneruj metadane dla wideo marki WUYO (grafika, strony WWW, branding, studio designu "Dobra Grafa").

Temat: "${topic}"
${content ? `Treść posta: "${content.substring(0, 400)}"` : ''}

Zwróć TYLKO czysty JSON (bez markdown, bez komentarzy):
{
  "title": "...",
  "description": "...",
  "tags": ["...", "..."],
  "hashtags": ["#...", "#..."]
}

Zasady:
- Tytuł: max 90 znaków, zawiera słowo kluczowe, po polsku
- Opis: max 400 znaków, angażujący, z CTA "Link w opisie"
- Tagi: 10-12 tagów, mix polskie + angielskie
- Hashtagi: 4-5 hashtagów`

        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return { success: false, error: 'AI nie zwróciło poprawnego JSON' }
        }
        return { success: true, data: JSON.parse(jsonMatch[0]) as YtMetadata }
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message }
    }
}
