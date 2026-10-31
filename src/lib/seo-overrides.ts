import 'server-only'
import type { Metadata } from 'next'

/**
 * Podmiany tytułu i opisu strony od SEO-radcy (tabela seo_changes, status 'aktywna' albo 'utrzymana').
 * Działają bez wdrożenia: cron zapisuje zmianę i odświeża tag SEO_TAG.
 * Gdy baza nie odpowiada, strona dostaje swoje zwykłe metadane.
 */
export const SEO_TAG = 'seo-overrides'

type Override = { path: string; after: { title?: string; description?: string } }

async function loadOverrides(): Promise<Map<string, Override['after']>> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return new Map()
    try {
        const res = await fetch(`${url}/rest/v1/seo_changes?select=path,after&status=in.(aktywna,utrzymana)&kind=eq.meta`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            next: { tags: [SEO_TAG], revalidate: 86_400 },
            signal: AbortSignal.timeout(3_000),
        })
        if (!res.ok) return new Map()
        const rows = (await res.json()) as Override[]
        return new Map(rows.map((r) => [r.path, r.after]))
    } catch {
        return new Map()
    }
}

/** Metadane strony z ewentualną podmianą tytułu i opisu. Strona główna ma tytuł bez szablonu „| WUYO”. */
export async function seoMeta(path: string, base: Metadata): Promise<Metadata> {
    const o = (await loadOverrides()).get(path)
    if (!o?.title && !o?.description) return base
    return {
        ...base,
        ...(o.title ? { title: path === '/' ? { absolute: o.title } : o.title } : {}),
        ...(o.description ? { description: o.description } : {}),
    }
}
