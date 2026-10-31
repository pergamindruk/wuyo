import { describe, expect, it } from 'vitest'
import {
    contentCandidates, evaluate, metaCandidates, newAlarms, pageAlarms, parseHtmlMeta, pathOf, stripBrand, trafficAlarms, validateMeta,
} from '@/lib/lab/seo-radca/rules'

const page = (p: string, impressions: number, ctr: number, position: number) => ({ page: p, impressions, ctr, position, clicks: Math.round(impressions * ctr) })

describe('SEO-radca: wybór stron', () => {
    it('bierze stronę wysoko w Google z niskim CTR, pomija /en, /lab i świeżo zmienione', () => {
        const now = Date.parse('2026-10-31')
        const c = metaCandidates([
            page('/blog/a', 400, 0.005, 5),
            page('/blog/b', 400, 0.06, 5), // klikana, OK
            page('/en/blog/a', 900, 0, 4),
            page('/blog/c', 900, 0, 3), // zmieniona 10 dni temu
            page('/blog/d', 50, 0, 3), // za mało wyświetleń
            page('/blog/e', 500, 0, 30), // za nisko
        ], [{ path: '/blog/c', created_at: '2026-10-21' }], now)
        expect(c.map((x) => x.page)).toEqual(['/blog/a'])
    })

    it('frazy z pozycji 8-25, bez już proponowanych', () => {
        const q = (query: string, impressions: number, position: number) => ({ ...page('/logo', impressions, 0, position), query })
        const c = contentCandidates([q('logo cena', 100, 12), q('logo rzeszów', 200, 9), q('logo', 300, 3), q('stara', 300, 15)], ['STARA'])
        expect(c.map((x) => x.query)).toEqual(['logo rzeszów', 'logo cena'])
    })
})

describe('SEO-radca: kontrola tekstu od AI', () => {
    const before = { title: 'Logo dla firmy od 890 zł', description: 'Projekt logo od 890 zł, 3 koncepcje, pliki w cenie.' }
    const ok = { title: 'Projekt logo Rzeszów od 890 zł, 3 koncepcje', description: 'Zrobię Ci proste i czytelne logo. Trzy koncepcje do wyboru, pliki i prawa w cenie. Zobacz przykłady i napisz, co robisz.' }

    it('przepuszcza poprawny tytuł', () => {
        expect(validateMeta('/logo', ok, before)).toEqual([])
    })
    it('blokuje wymyśloną cenę, termin, markę, zakazane słowa i długość', () => {
        expect(validateMeta('/logo', { ...ok, title: 'Logo od 590 zł w Rzeszowie' }, before).join()).toContain('cena')
        expect(validateMeta('/logo', { ...ok, description: ok.description + ' Gotowe w 3 dni.' }, before).join()).toContain('termin')
        expect(validateMeta('/logo', { ...ok, title: 'Projekt logo Rzeszów | WUYO studio' }, before).join()).toContain('marka')
        expect(validateMeta('/logo', { ...ok, title: 'Profesjonalne logo dla firmy z Rzeszowa' }, before).join()).toContain('zakazane')
        expect(validateMeta('/logo', { ...ok, title: 'Logo' }, before).join()).toContain('tytuł')
        expect(validateMeta('/logo', { ...ok, title: 'Logo dla firmy — Rzeszów i okolice' }, before).join()).toContain('myślnik')
    })
})

describe('SEO-radca: ocena po 28 dniach', () => {
    it('czeka przy małej liczbie wyświetleń, cofa przy gorszym CTR', () => {
        expect(evaluate(page('/a', 300, 0.02, 5), page('/a', 20, 0.1, 5))).toBe('czekaj')
        expect(evaluate(page('/a', 300, 0.02, 5), page('/a', 300, 0.01, 5))).toBe('cofnij')
        expect(evaluate(page('/a', 300, 0.02, 5), page('/a', 300, 0.019, 5))).toBe('utrzymaj')
    })
})

describe('SEO-radca: alarmy', () => {
    it('strona padła, noindex, brak opisu', () => {
        const a = pageAlarms([
            { url: 'https://wuyo.pl/logo', status: 503, ms: 100, noindex: false },
            { url: 'https://wuyo.pl/druk', status: 200, ms: 100, noindex: true, title: 'Druk' },
            { url: 'https://wuyo.pl/', status: 200, ms: 100, noindex: false, title: 'WUYO', canonical: 'https://wuyo.pl' },
        ])
        expect(a.map((x) => x.key)).toEqual(['down:/logo', 'noindex:/druk', 'desc:/druk', 'desc:/'])
    })
    it('spadek ruchu tydzień do tygodnia', () => {
        expect(trafficAlarms({ clicks: 10, impressions: 500 }, { clicks: 12, impressions: 600 })).toEqual([])
        expect(trafficAlarms({ clicks: 2, impressions: 200 }, { clicks: 12, impressions: 600 }).map((a) => a.key)).toEqual(['drop:impressions', 'drop:clicks'])
    })
    it('mail tylko o nowych alarmach', () => {
        const a = { key: 'x', level: 'alarm' as const, text: 'x' }
        const b = { key: 'y', level: 'uwaga' as const, text: 'y' }
        expect(newAlarms([a, b], [a])).toEqual([b])
    })
})

describe('SEO-radca: odczyt HTML', () => {
    it('tytuł, opis, canonical, noindex', () => {
        const m = parseHtmlMeta('<head><title>Logo &amp; znak | WUYO</title><meta name="description" content="Opis"/><link rel="canonical" href="https://wuyo.pl/logo"/><meta name="robots" content="index, follow"/></head>')
        expect(m).toEqual({ title: 'Logo & znak | WUYO', description: 'Opis', canonical: 'https://wuyo.pl/logo', noindex: false })
        expect(stripBrand(m.title)).toBe('Logo & znak')
        expect(pathOf('https://www.wuyo.pl/')).toBe('/')
    })
})
