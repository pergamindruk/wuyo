'use server'

import { createClient } from '@/lib/supabase/server'
import { JOB_STAGES } from '@/lib/lab/today/constants'

export type SearchResultKind = 'call' | 'client' | 'job'

export interface SearchResult {
    kind: SearchResultKind
    id: string
    title: string
    subtitle: string
    phone: string | null
    href: string
}

interface CallRow {
    id: string | number
    name: string | null
    industry: string | null
    phone: string | null
    website: string | null
}
interface ClientRow {
    id: string | number
    name: string | null
    company: string | null
    phone: string | null
    email: string | null
}
interface JobRow {
    id: string | number
    title: string | null
    stage: number | null
}

const LIMIT = 5

/** Usuwa znaki psujące składnię filtra PostgREST i escapuje wildcardy LIKE. */
function sanitize(q: string): string {
    return q
        .trim()
        .slice(0, 80)
        .replace(/[,()"'\\]/g, ' ')
        .replace(/[%_]/g, (c) => `\\${c}`)
        .replace(/\s+/g, ' ')
        .trim()
}

export async function searchLab(q: string): Promise<SearchResult[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const clean = sanitize(typeof q === 'string' ? q : '')
    if (clean.length < 2) return []
    const p = `%${clean}%`

    const [calls, clients, jobs] = await Promise.all([
        supabase
            .from('call_queue')
            .select('id, name, industry, phone, website')
            .or(`name.ilike.${p},industry.ilike.${p},phone.ilike.${p}`)
            .limit(LIMIT),
        supabase
            .from('clients')
            .select('id, name, company, phone, email')
            .or(`name.ilike.${p},company.ilike.${p},email.ilike.${p},phone.ilike.${p}`)
            .limit(LIMIT),
        supabase
            .from('jobs')
            .select('id, title, stage')
            .ilike('title', p)
            .limit(LIMIT),
    ])

    const out: SearchResult[] = []

    for (const r of (calls.data ?? []) as CallRow[]) {
        out.push({
            kind: 'call',
            id: String(r.id),
            title: r.name ?? 'Bez nazwy',
            subtitle: [r.industry, r.phone].filter(Boolean).join(' · ') || 'Kolejka telefonów',
            phone: r.phone,
            href: '/lab#kolejka',
        })
    }
    for (const r of (clients.data ?? []) as ClientRow[]) {
        out.push({
            kind: 'client',
            id: String(r.id),
            title: r.company || r.name || 'Bez nazwy',
            subtitle: [r.company ? r.name : null, r.phone ?? r.email].filter(Boolean).join(' · ') || 'Klient',
            phone: r.phone,
            href: '/lab/crm',
        })
    }
    for (const r of (jobs.data ?? []) as JobRow[]) {
        const stage = JOB_STAGES.find((s) => s.stage === r.stage)
        out.push({
            kind: 'job',
            id: String(r.id),
            title: r.title ?? 'Zlecenie',
            subtitle: stage ? `Etap ${stage.stage}: ${stage.label}` : 'Zlecenie',
            phone: null,
            href: '/lab/lejek',
        })
    }
    return out
}
