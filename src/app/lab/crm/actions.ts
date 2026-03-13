'use server'

import fs from 'fs'
import path from 'path'

export async function getLeads() {
    const leadsPath = path.join(process.cwd(), 'leads.json')
    let leads = []
    if (fs.existsSync(leadsPath)) {
        try {
            leads = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'))
        } catch { }
    }

    const briefsPath = path.join(process.cwd(), 'briefs.json')
    let briefs = []
    if (fs.existsSync(briefsPath)) {
        try {
            briefs = JSON.parse(fs.readFileSync(briefsPath, 'utf-8'))
        } catch { }
    }

    // Ujednolicamy format dla wspólnej tablicy
    const formattedLeads = leads.map((l: any) => ({
        id: l.id || Math.random().toString(),
        name: l.name,
        email: l.email,
        date: new Date(l.timestamp).toLocaleString('pl-PL'),
        type: 'Chatbot',
        details: 'Wiadomość zostawiona w bocie.'
    }))

    const formattedBriefs = briefs.map((b: any) => ({
        id: b.id || Math.random().toString(),
        name: b.name,
        email: b.email,
        date: new Date(b.timestamp).toLocaleString('pl-PL'),
        type: b.path === 'branding' ? 'Branding' : (b.path === 'web' ? 'Strona WWW' : 'Szybki Kontakt'),
        details: `Budżet: ${b.budget || 'Brak'}. Inspiracje: ${b.inspiration || b.webInspiration || 'Brak'}. ${b.note || ''}`
    }))

    return [...formattedBriefs, ...formattedLeads].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function deleteLeadOrBrief(id: string, isBrief: boolean) {
    // Proste usuwanie dla MVP
    const p = path.join(process.cwd(), isBrief ? 'briefs.json' : 'leads.json')
    if (fs.existsSync(p)) {
        try {
            const data = JSON.parse(fs.readFileSync(p, 'utf-8'))
            const filtered = data.filter((item: any) => item.id !== id)
            fs.writeFileSync(p, JSON.stringify(filtered, null, 2))
        } catch { }
    }
}
