import { describe, expect, it } from 'vitest'
import { czasWarszawa, kwartal, naGrosze, opisAkcji, potnij, potwierdzenie, rozbierzOdpowiedz, systemPrompt, zl } from './conversation'
import { secretMatches } from './telegram'
import { zrodlaZOdpowiedzi } from './ai'

describe('zrodlaZOdpowiedzi', () => {
    it('bez powtórek, najwyżej 5, pomija puste', () => {
        const chunk = (n: number) => ({ web: { uri: `https://a.pl/${n}`, title: `a.pl ${n}` } })
        const zrodla = zrodlaZOdpowiedzi({
            candidates: [{ groundingMetadata: { groundingChunks: [chunk(1), chunk(1), { web: {} }, chunk(2), chunk(3), chunk(4), chunk(5), chunk(6)] } }],
        })
        expect(zrodla.map((z) => z.url)).toEqual(['https://a.pl/1', 'https://a.pl/2', 'https://a.pl/3', 'https://a.pl/4', 'https://a.pl/5'])
    })
    it('brak wyszukiwania = pusta lista', () => {
        expect(zrodlaZOdpowiedzi({ candidates: [{}] })).toEqual([])
    })
})

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

describe('zapis do panelu', () => {
    it('koszt z poprawnej linii, kwota w groszach', () => {
        const odp = rozbierzOdpowiedz('Odczytałem paragon.\n[KOSZT] 2026-11-17 | 240,50 zł | toner do drukarki | Media Expert | dotacja:nie')
        expect(odp.tekst).toBe('Odczytałem paragon.')
        expect(odp.akcje).toEqual([
            { rodzaj: 'koszt', data: '2026-11-17', kwotaGrosze: 24050, opis: 'toner do drukarki', sprzedawca: 'Media Expert', zDotacji: false },
        ])
    })
    it('koszt z dotacji i bez sprzedawcy', () => {
        const [a] = rozbierzOdpowiedz('[KOSZT] 2026-12-05 | 4999 | laptop | - | dotacja:tak').akcje
        expect(a).toMatchObject({ kwotaGrosze: 499900, sprzedawca: null, zDotacji: true })
    })
    it('odrzuca koszt bez kwoty, z zerem albo ze złą datą', () => {
        expect(rozbierzOdpowiedz('[KOSZT] 2026-11-17 | około 200 | toner | - | dotacja:nie').akcje).toEqual([])
        expect(rozbierzOdpowiedz('[KOSZT] 2026-11-17 | 0 | toner | - | dotacja:nie').akcje).toEqual([])
        expect(rozbierzOdpowiedz('[KOSZT] wczoraj | 200 | toner | - | dotacja:nie').akcje).toEqual([])
        expect(rozbierzOdpowiedz('[KOSZT] 2026-11-17 | 200 |  | - | dotacja:nie').akcje).toEqual([])
    })
    it('notatka i wzory', () => {
        const odp = rozbierzOdpowiedz('Jasne.\n[NOTATKA] Klient chce wizytówki na styczeń\n[WZOR] umowa | Z2\n[WZÓR] rodo | -\n[WZOR] nieznany | Z1')
        expect(odp.akcje).toEqual([{ rodzaj: 'notatka', tresc: 'Klient chce wizytówki na styczeń' }])
        expect(odp.wzory).toEqual([
            { slug: 'umowa', zlecenie: 2 },
            { slug: 'rodo', zlecenie: null },
        ])
    })
    it('kwoty: zapis i odczyt', () => {
        expect(naGrosze('1 240,5')).toBe(124050)
        expect(naGrosze('240.00 PLN')).toBe(24000)
        expect(naGrosze('-5')).toBeNull()
        expect(naGrosze('12,345')).toBeNull()
        expect(zl(24050)).toBe('240,50 zł')
        expect(opisAkcji({ rodzaj: 'koszt', data: '2026-12-05', kwotaGrosze: 499900, opis: 'laptop', sprzedawca: null, zDotacji: true })).toBe(
            'koszt 4999,00 zł, 2026-12-05, laptop (z dotacji)',
        )
    })
    it('potwierdzenie tylko na jednoznaczne słowo', () => {
        expect(potwierdzenie('Tak')).toBe('tak')
        expect(potwierdzenie(' ok. ')).toBe('tak')
        expect(potwierdzenie('nie')).toBe('nie')
        expect(potwierdzenie('tak, ale zmień kwotę na 250')).toBeNull()
        expect(potwierdzenie('a ile to będzie podatku?')).toBeNull()
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
            firma: '- Z1: Logo dla Piekarni Kowalski, Realizacja, 890,00 zł',
        })
        expect(p).toContain('Z1: Logo dla Piekarni Kowalski')
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
