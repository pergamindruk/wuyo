'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GRAPH_API_VERSION = 'v21.0'

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
        const containerRes = await fetch(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_url: imageUrl,
                    caption: cleanCaption,
                    access_token: accessToken,
                }),
            }
        )
        const containerData = await containerRes.json()
        if (!containerData.id) {
            return {
                success: false,
                error: `Instagram: ${containerData.error?.message || 'Błąd tworzenia media container'}`,
            }
        }

        // Krok 2: Opublikuj
        const publishRes = await fetch(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media_publish`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creation_id: containerData.id,
                    access_token: accessToken,
                }),
            }
        )
        const publishData = await publishRes.json()
        if (!publishData.id) {
            return {
                success: false,
                error: `Instagram: ${publishData.error?.message || 'Błąd publikacji'}`,
            }
        }

        // Zapisz wynik w Supabase
        const supabase = await createClient()
        await supabase
            .from('calendar_events')
            .update({
                status: 'Opublikowane',
                ig_post_id: publishData.id,
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

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        const data = await res.json()

        if (!data.id) {
            return {
                success: false,
                error: `Facebook: ${data.error?.message || 'Błąd publikacji'}`,
            }
        }

        const supabase = await createClient()
        await supabase
            .from('calendar_events')
            .update({
                status: 'Opublikowane',
                fb_post_id: data.id,
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
    const geminiKey = process.env.WUYO_GEMINI_KEY
    if (!geminiKey) {
        return { success: false, error: 'Brak WUYO_GEMINI_KEY w .env.local' }
    }

    try {
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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
