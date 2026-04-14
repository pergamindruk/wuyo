// ─── Lab domain types ────────────────────────────────────────────────────────

export type LeadStatus = 'Nowy' | 'Kontakt' | 'Wycena' | 'Zamkniety' | 'Utracony'

export interface Lead {
    id: string
    name: string
    email: string
    date: string       // formatted locale string
    rawDate: string    // ISO timestamp
    type: string
    details: string
    status: LeadStatus
}

export interface ProjectUpdate {
    date: string
    status: string
    progress: number
    note: string
}

export interface Project {
    id: string
    name: string
    client: string
    status: string
    progress: number
    updates: ProjectUpdate[]
    created_at?: string
}

export interface CalendarEvent {
    id: string
    topic: string
    platform: string
    format: string
    goal: string
    date: string
    status: string
    content?: string
    image_url?: string
    scheduled_at?: string
    published_at?: string
    fb_post_id?: string
    ig_post_id?: string
    created_at?: string
}

export interface DashboardAlert {
    type: 'danger' | 'warning' | 'success'
    title: string
    description: string
    href: string
}
