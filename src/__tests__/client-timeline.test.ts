import { describe, expect, it } from 'vitest'
import { buildTimeline, type CardJob } from '@/lib/lab/client-timeline'

const job: CardJob = {
    id: 'j1', title: 'Strona dla warsztatu', service: 'strona', stage: 4, outcome: 'w_toku', price_grosze: 299_000, deposit_grosze: 0,
    next_step: null, next_contact_at: null, offer_sent_at: '2026-11-05T10:00:00Z', offer_accepted_at: '2026-11-06T10:00:00Z',
    closed_at: null, created_at: '2026-11-04T10:00:00Z', updated_at: '2026-11-06T10:00:00Z', lead_id: 'l1', public_token: null, notes: null,
}

describe('buildTimeline', () => {
    const t = buildTimeline({
        jobs: [job],
        payments: [{ job_id: 'j1', amount_grosze: 149_500, paid_at: '2026-11-07', note: 'Zaliczka', created_at: '2026-11-07T09:00:00Z' }],
        activities: [
            { kind: 'telefon', outcome: 'chce_oferte', note: 'ok', created_at: '2026-11-04T09:00:00Z', job_id: null },
            { kind: 'zaliczka', outcome: null, note: '149500 gr', created_at: '2026-11-07T09:00:00Z', job_id: 'j1' },
            { kind: 'rozmowa', outcome: 'brak', note: 'x', created_at: '2026-11-08T09:00:00Z', job_id: 'j1' },
        ],
        notes: [
            { tresc: 'Klient chce cennik', created_at: '2026-11-08T09:00:00Z', zastosowano_at: '2026-11-08T09:01:00Z', analiza: { nastepnyKrok: 'Wysłać projekt' } },
            { tresc: 'szkic niezapisany', created_at: '2026-11-09T09:00:00Z', zastosowano_at: null, analiza: null },
        ],
        leads: [{ id: 'l1', type: 'Chatbot', details: 'Potrzebuję strony', created_at: '2026-11-03T10:00:00Z' }],
        generations: [{ created_at: '2026-11-04T08:00:00Z', input_data: { kind: 'telefon', queueId: 'q1' } }],
    })

    it('sortuje od najnowszego', () => {
        expect(t[0].kind).toBe('rozmowa')
        expect(t[t.length - 1].kind).toBe('zapytanie')
    })

    it('nie dubluje wpłat ani rozmów z dziennika', () => {
        expect(t.filter((i) => i.kind === 'wplata')).toHaveLength(1)
        expect(t.filter((i) => i.kind === 'rozmowa')).toHaveLength(1)
    })

    it('pomija niezapisane notatki i pokazuje następny krok', () => {
        expect(t.some((i) => i.body === 'szkic niezapisany')).toBe(false)
        expect(t[0].title).toContain('Wysłać projekt')
    })

    it('ma ofertę, akceptację i telefon z etykietą wyniku', () => {
        expect(t.map((i) => i.kind)).toEqual(expect.arrayContaining(['oferta', 'akceptacja', 'telefon', 'ai', 'zlecenie']))
        expect(t.find((i) => i.kind === 'telefon')!.title).toContain('Chce')
    })
})
