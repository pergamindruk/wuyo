import { describe, expect, it } from 'vitest'
import { computeSalesStats, lostReasonOf, salesSummaryText, sourceOf, type SalesInput, type SalesJob } from '@/lib/lab/sales/stats'

const NOW = new Date('2026-11-12T12:00:00Z')

function job(p: Partial<SalesJob> & { id: string }): SalesJob {
    return {
        client_id: null, lead_id: null, stage: 1, outcome: 'w_toku', price_grosze: 0, deposit_grosze: 0,
        created_at: '2026-11-01T10:00:00Z', offer_sent_at: null, offer_accepted_at: null, closed_at: null,
        lost_reason: null, notes: null, ...p,
    }
}

const input: SalesInput = {
    jobs: [
        job({ id: 'a', stage: 2, price_grosze: 299_000, deposit_grosze: 0, client_id: 'c1', offer_sent_at: '2026-11-03T10:00:00Z' }),
        job({ id: 'b', stage: 7, outcome: 'zakonczone', price_grosze: 100_000, client_id: 'c2', created_at: '2026-11-01T00:00:00Z', closed_at: '2026-11-11T00:00:00Z' }),
        job({ id: 'c', stage: 2, outcome: 'przegrane', closed_at: '2026-11-05T00:00:00Z', notes: 'x\nPrzegrane: Za drogo' }),
        job({ id: 'd', stage: 1, outcome: 'przegrane', closed_at: '2026-11-06T00:00:00Z', lost_reason: 'Za drogo' }),
        job({ id: 'old', stage: 7, outcome: 'zakonczone', price_grosze: 50_000, created_at: '2026-01-01T00:00:00Z', closed_at: '2026-02-01T00:00:00Z' }),
    ],
    payments: [{ job_id: 'b', amount_grosze: 100_000, paid_at: '2026-11-10' }],
    clients: [{ id: 'c1', source: 'kolejka' }, { id: 'c2', source: 'CRM: Chatbot' }],
    leads: [{ id: 'l1', type: 'Chatbot', created_at: '2026-11-02T00:00:00Z' }],
    activities: [
        { kind: 'telefon', outcome: 'nie_odebral', created_at: '2026-11-04T09:00:00Z' },
        { kind: 'telefon', outcome: 'chce_oferte', created_at: '2026-11-04T10:00:00Z' },
        { kind: 'telefon', outcome: 'nie_chce', created_at: '2026-11-04T11:00:00Z' },
        { kind: 'telefon', outcome: 'chce_oferte', created_at: '2026-01-04T11:00:00Z' },
    ],
}

describe('computeSalesStats', () => {
    const s = computeSalesStats(input, 30, NOW)

    it('liczy lejek tylko z otwartych zleceń, wartość = cena minus zaliczka', () => {
        const st2 = s.stages.find((x) => x.stage === 2)!
        expect(st2.count).toBe(1)
        expect(st2.valueGrosze).toBe(299_000)
        expect(s.stages).toHaveLength(7)
    })

    it('wygrane, przegrane i skuteczność tylko w okresie', () => {
        expect(s.won).toBe(1)
        expect(s.lost).toBe(2)
        expect(s.winRate).toBeCloseTo(1 / 3)
        expect(s.avgDealGrosze).toBe(100_000)
        expect(s.avgDaysToClose).toBe(10)
        expect(s.malaProba).toBe(true)
    })

    it('telefony liczy jak WeekStatsCard (rozmowa = odebrany)', () => {
        expect(s.calls).toEqual({ telefony: 3, rozmowy: 2, oferty: 1 })
    })

    it('lejek okresu: zapytanie + chęć oferty, wpłaty po zleceniu', () => {
        expect(s.funnel.find((f) => f.key === 'zainteresowani')!.count).toBe(2)
        expect(s.funnel.find((f) => f.key === 'oferty')!.count).toBe(1)
        expect(s.funnel.find((f) => f.key === 'wplaty')!.count).toBe(1)
        expect(s.paidGrosze).toBe(100_000)
    })

    it('grupuje przyczyny przegranych, także ze starych notatek', () => {
        expect(s.lostReasons).toEqual([{ reason: 'Za drogo', count: 2 }])
    })

    it('przypisuje źródła', () => {
        const czat = s.sources.find((x) => x.source === 'Czat')!
        expect(czat.won).toBe(1)
        expect(s.sources.find((x) => x.source === 'Telefon')!.jobs).toBe(1)
    })

    it('tekst dla AI zawiera ostrzeżenie o małej próbie', () => {
        const t = salesSummaryText(s, { goalGrosze: 700_000, earnedGrosze: 100_000, pipelineGrosze: 299_000, daysLeft: 19 })
        expect(t).toContain('UWAGA')
        expect(t).toContain('7000 zł')
    })
})

describe('pomocnicze', () => {
    it('lostReasonOf bierze ostatnią linię z notatek', () => {
        expect(lostReasonOf({ lost_reason: null, notes: 'Przegrane: a\nPrzegrane: b' })).toBe('b')
        expect(lostReasonOf({ lost_reason: null, notes: null })).toBe('bez podanego powodu')
    })
    it('sourceOf: brak danych = Inne', () => {
        expect(sourceOf({ lead_id: null, client_id: null }, new Map(), new Map())).toBe('Inne')
    })
})
