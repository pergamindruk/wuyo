import { generateKeyPairSync } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const SA = {
    client_email: 'wuyo-vertex@test-project.iam.gserviceaccount.com',
    private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    project_id: 'test-project',
}

describe('ai-endpoint', () => {
    beforeEach(() => {
        vi.resetModules()
        delete process.env.GCP_SA_KEY_B64
        delete process.env.GCP_VERTEX_LOCATION
        delete process.env.WUYO_GEMINI_KEY
    })
    afterEach(() => vi.restoreAllMocks())

    it('bez konfiguracji zwraca null', async () => {
        const { geminiTarget, aiConfigured } = await import('@/lib/ai-endpoint')
        expect(aiConfigured()).toBe(false)
        expect(await geminiTarget()).toBeNull()
    })

    it('sam klucz AI Studio: Gemini API, klucz w nagłówku', async () => {
        process.env.WUYO_GEMINI_KEY = 'test-key'
        const { geminiTarget } = await import('@/lib/ai-endpoint')
        const t = await geminiTarget()
        expect(t?.provider).toBe('ai-studio')
        expect(t?.url('gemini-2.5-flash')).toContain('generativelanguage.googleapis.com')
        expect(t?.headers['x-goog-api-key']).toBe('test-key')
    })

    it('konto serwisowe: Vertex AI z tokenem OAuth (ma pierwszeństwo przed kluczem)', async () => {
        process.env.WUYO_GEMINI_KEY = 'test-key'
        process.env.GCP_SA_KEY_B64 = Buffer.from(JSON.stringify(SA)).toString('base64')
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true, json: async () => ({ access_token: 'tok-123', expires_in: 3600 }),
        })
        vi.stubGlobal('fetch', fetchMock)
        const { geminiTarget } = await import('@/lib/ai-endpoint')

        const t = await geminiTarget()
        expect(t?.provider).toBe('vertex')
        expect(t?.headers.Authorization).toBe('Bearer tok-123')
        expect(t?.url('gemini-2.5-flash')).toBe(
            'https://aiplatform.googleapis.com/v1/projects/test-project/locations/global/publishers/google/models/gemini-2.5-flash:generateContent')

        const body = new URLSearchParams(String(fetchMock.mock.calls[0][1].body))
        const [, claims] = String(body.get('assertion')).split('.')
        expect(JSON.parse(Buffer.from(claims, 'base64url').toString()).iss).toBe(SA.client_email)

        await geminiTarget() // token z pamięci, bez drugiego zapytania
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('region inny niż global: adres regionalny', async () => {
        process.env.GCP_SA_KEY_B64 = JSON.stringify(SA)
        process.env.GCP_VERTEX_LOCATION = 'europe-central2'
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true, json: async () => ({ access_token: 't', expires_in: 3600 }),
        }))
        const { geminiTarget } = await import('@/lib/ai-endpoint')
        expect((await geminiTarget())?.url('m')).toContain('https://europe-central2-aiplatform.googleapis.com/v1/projects/test-project/locations/europe-central2/')
    })
})
