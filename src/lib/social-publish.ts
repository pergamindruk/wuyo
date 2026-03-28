// Shared Graph API helpers for social media publishing
// Used by: social-dashboard/actions.ts, social-media/actions.ts, api/cron/publish

export const GRAPH_API_VERSION = 'v21.0'

export async function postGraph(url: string, body: Record<string, string>): Promise<any> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(body).toString(),
    })
    return await res.json()
}

export async function getGraph(url: string, params: Record<string, string>): Promise<any> {
    const u = new URL(url)
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
    const res = await fetch(u.toString(), { method: 'GET' })
    return await res.json()
}

export function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim()
}

export async function waitForIgContainer(
    userId: string,
    containerId: string,
    accessToken: string
): Promise<{ ok: true } | { ok: false; error: string }> {
    const deadline = Date.now() + 25_000
    while (Date.now() < deadline) {
        const status = await getGraph(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${containerId}`,
            { fields: 'status_code', access_token: accessToken }
        )
        const code = status?.status_code as string | undefined
        if (code === 'FINISHED') return { ok: true }
        if (code === 'ERROR') return { ok: false, error: 'Instagram: blad przetwarzania kontenera mediow' }
        await new Promise(r => setTimeout(r, 1500))
    }
    return { ok: false, error: 'Instagram: timeout (sprobuj ponownie)' }
}

// ─── High-level publish functions (for cron) ─────────────────

export async function publishToFB(message: string, imageUrl?: string) {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    const pageId = process.env.FACEBOOK_PAGE_ID
    if (!accessToken || !pageId) return { success: false as const, error: 'Brak konfiguracji Facebook' }

    const cleanMessage = stripMarkdown(message)
    let endpoint: string
    let body: Record<string, string>

    if (imageUrl) {
        endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/photos`
        body = { url: imageUrl, caption: cleanMessage, access_token: accessToken }
    } else {
        endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`
        body = { message: cleanMessage, access_token: accessToken }
    }

    const data = await postGraph(endpoint, body)
    if (!data.id) return { success: false as const, error: data.error?.message || 'Blad publikacji FB' }
    return { success: true as const, postId: data.id }
}

export async function publishToIG(imageUrl: string, caption: string) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const userId = process.env.INSTAGRAM_USER_ID
    if (!accessToken || !userId) return { success: false as const, error: 'Brak konfiguracji Instagram' }

    const cleanCaption = stripMarkdown(caption)

    // Step 1: Create media container
    const containerData = await postGraph(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media`,
        { image_url: imageUrl, caption: cleanCaption, access_token: accessToken }
    )
    if (!containerData.id) return { success: false as const, error: containerData.error?.message || 'Blad tworzenia kontenera IG' }

    // Step 2: Wait for container
    const wait = await waitForIgContainer(userId, containerData.id, accessToken)
    if (!wait.ok) return { success: false as const, error: wait.error }

    // Step 3: Publish
    const publishData = await postGraph(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media_publish`,
        { creation_id: containerData.id, access_token: accessToken }
    )
    if (!publishData.id) return { success: false as const, error: publishData.error?.message || 'Blad publikacji IG' }

    return { success: true as const, postId: publishData.id }
}
