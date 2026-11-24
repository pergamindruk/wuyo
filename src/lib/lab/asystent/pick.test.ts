import { describe, expect, it } from 'vitest'
import { buildSignals, followUpStep, pickMoves, plural, rankMoves, type AssistantJob } from './pick'
import { LINK_TOKEN, buildPrompt, parseDraft } from './draft'
import type { QueueItem, SystemsStatus } from '@/lib/lab/today/types'

const NOW = new Date('2026-11-24T09:00:00Z')

function job(p: Partial<AssistantJob>): AssistantJob {
    return {
        id: 'j1', client_id: 'c1', client_name: 'Kwiaciarnia', title: 'Oferta: Kwiaciarnia', service: 'firma_w_internecie',
        stage: 1, outcome: 'w_toku', price_grosze: 349_000, deposit_grosze: 0, next_step: null, next_contact_at: null,
        offer_sent_at: null, updated_at: '2026-11-09T10:00:00Z', created_at: '2026-11-09T10:00:00Z',
        email: '', phone: '600100200', notes: null, queue: null, ...p,
    }
}

function queue(p: Partial<QueueItem>): QueueItem {
    return {
        id: 'q1', name: 'Mechanik', industry: 'mechanik', phone: '600', website: '', source: 'bez_strony', reason: 'brak strony',
        problems: [], score: 60, status: 'do_kontaktu', attempts: 0, next_at: '2026-11-20T00:00:00Z', notes: null,
        client_id: null, job_id: null, ...p,
    }
}

const systems: SystemsStatus = { syncMinutesAgo: 5, online: true, harveyOk: true, nightShift: null, outboxPending: 0, replies: 0, dyrygent: null }

describe('rankMoves', () => {
    it('oferta, na którą klient czeka, wyprzedza telefon z kolejki', () => {
        const moves = rankMoves({ jobs: [job({})], queue: [queue({ score: 90 })], now: NOW })
        expect(moves.map((m) => m.kind)).toEqual(['oferta', 'telefon'])
        expect(moves[0].daysWaiting).toBe(14)
        expect(moves[0].why).toContain('14 dni')
    })

    it('starsza oferta wyżej niż świeża', () => {
        const moves = rankMoves({ jobs: [job({ id: 'a', created_at: '2026-11-22T10:00:00Z' }), job({ id: 'b' })], queue: [], now: NOW })
        expect(moves.map((m) => m.jobId)).toEqual(['b', 'a'])
    })

    it('zaległy umówiony kontakt jest pierwszy, przypomnienie dopiero po 2 dniach', () => {
        const moves = rankMoves({
            jobs: [
                job({ id: 'oferta' }),
                job({ id: 'zalegly', stage: 2, offer_sent_at: '2026-11-15T10:00:00Z', next_contact_at: '2026-11-20' }),
                job({ id: 'swieza', stage: 2, offer_sent_at: '2026-11-23T10:00:00Z' }),
            ],
            queue: [], now: NOW,
        })
        expect(moves.map((m) => m.jobId)).toEqual(['zalegly', 'oferta'])
    })

    it('pomija firmę z kolejki, która ma już zlecenie, i tę z terminem w przyszłości', () => {
        const moves = rankMoves({
            jobs: [job({ id: 'j9' })],
            queue: [queue({ id: 'x', job_id: 'j9' }), queue({ id: 'y', next_at: '2026-12-01T00:00:00Z' }), queue({ id: 'z', status: 'oddzwonic' })],
            now: NOW,
        })
        expect(moves.map((m) => m.key)).toEqual(['job:j9', 'queue:z'])
    })

    it('pickMoves bierze 3 najlepsze bez pominiętych', () => {
        const ranked = rankMoves({ jobs: [job({ id: 'a' }), job({ id: 'b' }), job({ id: 'c' }), job({ id: 'd' })], queue: [], now: NOW })
        const picked = pickMoves(ranked, new Set(['job:a']))
        expect(picked).toHaveLength(3)
        expect(picked.some((m) => m.key === 'job:a')).toBe(false)
    })
})

describe('followUpStep i plural', () => {
    it('kroki przypomnienia: mail, telefon, zamknięcie', () => {
        expect(followUpStep(3).channel).toBe('mail')
        expect(followUpStep(6).channel).toBe('telefon')
        expect(followUpStep(12).nextInDays).toBe(30)
    })
    it('odmiana', () => {
        expect(plural(1, 'firma', 'firmy', 'firm')).toBe('firma')
        expect(plural(3, 'firma', 'firmy', 'firm')).toBe('firmy')
        expect(plural(13, 'firma', 'firmy', 'firm')).toBe('firm')
        expect(plural(22, 'firma', 'firmy', 'firm')).toBe('firmy')
    })
})

describe('buildSignals', () => {
    it('czekające oferty i brak sprzedaży w tygodniu to alarmy', () => {
        const jobs = [job({}), job({ id: 'j2' })]
        const moves = rankMoves({ jobs, queue: [], now: NOW })
        const s = buildSignals({ jobs, moves, systems: { ...systems, harveyOk: false }, salesActivities7d: 0, harveyDecisions: 4 })
        expect(s[0]).toMatchObject({ tone: 'danger' })
        expect(s[0].text).toContain('2 firmy czekają na ofertę')
        expect(s.some((x) => x.text.startsWith('Zero telefonów'))).toBe(true)
        expect(s.some((x) => x.href === '/lab/maile')).toBe(true)
        expect(s.some((x) => x.text.startsWith('Harvey nie działa'))).toBe(true)
    })
    it('gdy nic nie czeka: jeden sygnał „na bieżąco”', () => {
        const s = buildSignals({ jobs: [], moves: [], systems, salesActivities7d: 5, harveyDecisions: 0 })
        expect(s).toEqual([expect.objectContaining({ tone: 'success' })])
    })
})

describe('draft', () => {
    const move = rankMoves({ jobs: [job({ email: 'a@b.pl' })], queue: [], now: NOW })[0]

    it('prompt ma metodę, cennik, znacznik linku i fakty firmy', () => {
        const p = buildPrompt(move, 'krócej')
        expect(p).toContain('METODA ROZMOWY')
        expect(p).toContain('CENNIK WUYO')
        expect(p).toContain(LINK_TOKEN)
        expect(p).toContain('FIRMA: Kwiaciarnia')
        expect(p).toContain('UWAGA MATEUSZA DO POPRAWKI (ma pierwszeństwo): krócej')
    })

    it('parseDraft czyta JSON z otoczką i pilnuje jednego polecanego wariantu', () => {
        const raw = 'Oto szkic:\n```json\n' + JSON.stringify({
            channel: 'mail', subject: 'Oferta', message: `Link: ${LINK_TOKEN}`, call: '## Otwarcie\n- Dzień dobry',
            variants: [{ name: 'A', price: '1 990 zł' }, { name: 'B', price: '3 490 zł' }, { name: 'C', price: '5 900 zł' }],
            nextStep: 'telefon w czwartek', offer: { title: 'Strona', intro: 'x', scope: ['a', 'b'], cta: 'y' },
        }) + '\n```'
        const d = parseDraft(raw, true)
        expect(d?.channel).toBe('mail')
        expect(d?.variants.filter((v) => v.recommended).map((v) => v.name)).toEqual(['B'])
        expect(d?.offer?.scope).toEqual(['a', 'b'])
    })

    it('parseDraft: śmieci → null, oferta tylko gdy chcemy', () => {
        expect(parseDraft('nie wiem', false)).toBeNull()
        const d = parseDraft(JSON.stringify({ message: 'hej', offer: { title: 't', scope: ['a'] } }), false)
        expect(d?.offer).toBeNull()
        expect(d?.channel).toBe('sms')
    })
})
