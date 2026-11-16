import { describe, expect, it } from 'vitest'
import { czasWarszawa, kwartal, potnij, rozbierzOdpowiedz, systemPrompt } from './conversation'
import { secretMatches } from './telegram'

describe('rozbierzOdpowiedz', () => {
    it('wycina linie sterujące i zostawia tekst dla Mateusza', () => {
        const odp = rozbierzOdpowiedz(
            '[USLYSZALEM] czy mogę już kupić laptopa\nNie kupuj przed datą z umowy.\n\n[ZAPAMIETAJ] Umowa z PUP podpisana 1.12.2026\n[TERMIN] 2026-12-20 | Rozliczenie zakupów w PUP',
        )
        expect(odp.tekst).toBe('Nie kupuj przed datą z umowy.')
        expect(odp.uslyszane).toBe('czy mogę już kupić laptopa')
        expect(odp.fakty).toEqual(['Umowa z PUP podpisana 1.12.2026'])
        expect(odp.terminy).toEqual([{ data: '2026-12-20', tytul: 'Rozliczenie zakupów w PUP' }])
    })

    it('odrzuca termin bez poprawnej daty i puste znaczniki', () => {
        const odp = rozbierzOdpowiedz('Ok.\n[TERMIN] w grudniu | coś\n[TERMIN] 2026-13-45 | zła data\n[ZAPAMIETAJ]')
        expect(odp.terminy).toEqual([])
        expect(odp.fakty).toEqual([])
        expect(odp.tekst).toBe('Ok.')
    })

    it('rozumie znaczniki z polskimi znakami', () => {
        const odp = rozbierzOdpowiedz('[USŁYSZAŁEM] test\n[ZAPAMIĘTAJ] fakt\nTreść')
        expect(odp.uslyszane).toBe('test')
        expect(odp.fakty).toEqual(['fakt'])
    })
})

describe('potnij', () => {
    it('krótki tekst zostaje w całości', () => {
        expect(potnij('abc')).toEqual(['abc'])
    })
    it('długi tekst tnie na części w limicie, bez gubienia treści', () => {
        const tekst = Array.from({ length: 300 }, (_, i) => `Zdanie numer ${i} o podatkach.`).join('\n')
        const czesci = potnij(tekst, 1000)
        expect(czesci.length).toBeGreaterThan(1)
        expect(czesci.every((c) => c.length <= 1000)).toBe(true)
        expect(czesci.join('\n')).toBe(tekst)
    })
})

describe('daty', () => {
    it('godzina 8 w Polsce zimą i latem', () => {
        expect(czasWarszawa(new Date('2026-11-18T07:10:00Z'))).toMatchObject({ data: '2026-11-18', godzina: 8, dzienTygodnia: 'środa' })
        expect(czasWarszawa(new Date('2026-07-01T06:30:00Z')).godzina).toBe(8)
        expect(czasWarszawa(new Date('2026-07-01T07:30:00Z')).godzina).toBe(9)
    })
    it('data w Polsce po północy, gdy w UTC jeszcze wczoraj', () => {
        expect(czasWarszawa(new Date('2026-11-17T23:30:00Z')).data).toBe('2026-11-18')
    })
    it('granice kwartału', () => {
        expect(kwartal('2026-11-17')).toEqual({ od: '2026-10-01', do: '2026-12-31' })
        expect(kwartal('2027-02-10')).toEqual({ od: '2027-01-01', do: '2027-03-31' })
        expect(kwartal('2027-06-30')).toEqual({ od: '2027-04-01', do: '2027-06-30' })
    })
})

describe('systemPrompt', () => {
    it('zawiera pamięć, terminy i bazę wiedzy', () => {
        const p = systemPrompt({
            dzis: '2026-11-18',
            dzienTygodnia: 'środa',
            fakty: [{ tresc: 'Księgowa: inFakt' }],
            terminy: [{ data: '2026-12-01', tytul: 'Rejestracja CEIDG' }],
            przychodKwartalu: 1200,
        })
        expect(p).toContain('Księgowa: inFakt')
        expect(p).toContain('2026-12-01: Rejestracja CEIDG')
        expect(p).toContain('240 000 zł')
        expect(p).toContain('1200.00 zł')
    })
})

describe('secretMatches', () => {
    it('przepuszcza tylko zgodny sekret', () => {
        expect(secretMatches('abc123', 'abc123')).toBe(true)
        expect(secretMatches('abc124', 'abc123')).toBe(false)
        expect(secretMatches('abc', 'abc123')).toBe(false)
        expect(secretMatches(null, 'abc123')).toBe(false)
        expect(secretMatches('abc123', undefined)).toBe(false)
    })
})
