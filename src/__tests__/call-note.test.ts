import { describe, expect, it } from 'vitest'
import { analysisSummary, budgetSupported, extractJson, sanitizeAnalysis } from '@/lib/lab/call-note'

const NOTE = 'Pan Marek, warsztat w Łańcucie. Chce stronę z cennikiem napraw, budżet około 3000 zł, start na wiosnę. Zadzwonić w piątek.'

describe('extractJson', () => {
    it('czyta JSON z bloku kodu', () => {
        expect(extractJson('tekst\n```json\n{"a":1}\n```')).toEqual({ a: 1 })
    })
    it('zwraca null przy śmieciach', () => {
        expect(extractJson('brak')).toBeNull()
    })
})

describe('budgetSupported', () => {
    it('akceptuje kwotę z notatki, także z odstępem', () => {
        expect(budgetSupported('3000 zł', NOTE)).toBe(true)
        expect(budgetSupported('3 000 zł', NOTE)).toBe(true)
        expect(budgetSupported('3000 zł', 'budżet 3 tys')).toBe(true)
    })
    it('odrzuca zgadnięty budżet', () => {
        expect(budgetSupported('5000 zł', NOTE)).toBe(false)
        expect(budgetSupported('średni', NOTE)).toBe(false)
    })
})

describe('sanitizeAnalysis', () => {
    const base = {
        potrzeba: 'Strona z cennikiem napraw',
        uslugi: ['strona'],
        budzet: '3000 zł',
        termin: 'wiosna',
        obiekcje: [],
        nastepnyKrok: 'Wysłać ofertę',
        kontaktDnia: '2026-11-14',
        proponowanyWynik: 'chce_oferte',
        niepewne: [],
    }

    it('przepuszcza poprawną propozycję', () => {
        const a = sanitizeAnalysis(base, NOTE, '2026-11-12')!
        expect(a.budzet).toBe('3000 zł')
        expect(a.kontaktDnia).toBe('2026-11-14')
        expect(a.proponowanyWynik).toBe('chce_oferte')
    })

    it('usuwa wymyślony budżet i zapisuje to w niepewnych', () => {
        const a = sanitizeAnalysis({ ...base, budzet: '8000 zł' }, NOTE, '2026-11-12')!
        expect(a.budzet).toBeNull()
        expect(a.niepewne.join(' ')).toContain('8000')
    })

    it('odrzuca datę z przeszłości i zły wynik', () => {
        const a = sanitizeAnalysis({ ...base, kontaktDnia: '2026-11-01', proponowanyWynik: 'kup_teraz' }, NOTE, '2026-11-12')!
        expect(a.kontaktDnia).toBeNull()
        expect(a.proponowanyWynik).toBe('brak')
    })

    it('null gdy nie ma ani potrzeby, ani kroku', () => {
        expect(sanitizeAnalysis({ uslugi: [] }, NOTE, '2026-11-12')).toBeNull()
    })

    it('skrót do historii', () => {
        const a = sanitizeAnalysis(base, NOTE, '2026-11-12')!
        expect(analysisSummary(a)).toContain('Budżet: 3000 zł')
        expect(analysisSummary(a)).toContain('Dalej: Wysłać ofertę (2026-11-14)')
    })
})
