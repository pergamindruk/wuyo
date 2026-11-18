import { describe, expect, it } from 'vitest'
import { brandFromName, charLimitFor, platformFromProvider } from './channels'

describe('platformFromProvider', () => {
    it('rozpoznaje dostawców Postiz', () => {
        expect(platformFromProvider('instagram-standalone')).toBe('instagram')
        expect(platformFromProvider('instagram')).toBe('instagram')
        expect(platformFromProvider('facebook')).toBe('facebook')
        expect(platformFromProvider('tiktok')).toBe('tiktok')
        expect(platformFromProvider('youtube')).toBe('youtube')
        expect(platformFromProvider('linkedin-page')).toBe('inna')
    })
})

describe('brandFromName', () => {
    it('bierze markę z nazwy klienta albo konta', () => {
        expect(brandFromName('Pergamin Studio', 'pergamin.druk')).toBe('Pergamin Studio')
        expect(brandFromName(undefined, 'Prompteusz PL')).toBe('Prompteusz')
        expect(brandFromName(null, 'WUYO Studio')).toBe('WUYO')
        expect(brandFromName()).toBe('WUYO')
    })
})

describe('charLimitFor', () => {
    it('zwraca najniższy limit wybranych platform', () => {
        expect(charLimitFor(['facebook'])).toBe(63206)
        expect(charLimitFor(['facebook', 'instagram'])).toBe(2200)
        expect(charLimitFor([])).toBe(2200)
    })
})
