// Podłącza bota-doradcę z Telegrama do wuyo.pl. Uruchom z folderu portfolio_www:
//   node scripts/telegram-setup.mjs
// 1. Tworzy TELEGRAM_WEBHOOK_SECRET (jeśli go nie ma) i dopisuje do .env.local.
// 2. Zapisuje go w Vercel (Production).
// 3. Ustawia webhook bota na https://wuyo.pl/api/telegram.
// Niczego tajnego nie wypisuje. Po pierwszym uruchomieniu trzeba wdrożyć stronę od nowa,
// bo Vercel czyta zmienne przy wdrożeniu.
import { readFileSync, appendFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

const WEBHOOK_URL = 'https://wuyo.pl/api/telegram'

const raw = readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
    raw
        .split(/\r?\n/)
        .filter((l) => /^[A-Z_0-9]+=/.test(l))
        .map((l) => {
            const i = l.indexOf('=')
            return [l.slice(0, i), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
        }),
)

for (const key of ['TELEGRAM_BOT_TOKEN', 'VERCEL_API_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_TEAM_ID']) {
    if (!env[key]) {
        console.error(`Brak ${key} w .env.local`)
        process.exit(1)
    }
}

let secret = env.TELEGRAM_WEBHOOK_SECRET
if (!secret) {
    secret = randomBytes(32).toString('hex')
    appendFileSync('.env.local', `${raw.endsWith('\n') ? '' : '\n'}TELEGRAM_WEBHOOK_SECRET=${secret}\n`)
    console.log('1. Sekret utworzony i dopisany do .env.local')
} else {
    console.log('1. Sekret już jest w .env.local')
}

const vercel = await fetch(
    `https://api.vercel.com/v10/projects/${env.VERCEL_PROJECT_ID}/env?teamId=${env.VERCEL_TEAM_ID}&upsert=true`,
    {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.VERCEL_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'TELEGRAM_WEBHOOK_SECRET', value: secret, type: 'encrypted', target: ['production'] }),
    },
)
const vercelBody = await vercel.json().catch(() => ({}))
console.log(vercel.ok ? '2. Sekret zapisany w Vercel (Production)' : `2. Vercel: błąd ${vercel.status} ${vercelBody.error?.message ?? ''}`)
if (!vercel.ok) process.exit(1)

const hook = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: WEBHOOK_URL, secret_token: secret, allowed_updates: ['message'], drop_pending_updates: true }),
})
const hookBody = await hook.json().catch(() => ({}))
console.log(hookBody.ok ? `3. Webhook ustawiony na ${WEBHOOK_URL}` : `3. Telegram: błąd ${hookBody.description ?? hook.status}`)
if (!hookBody.ok) process.exit(1)
