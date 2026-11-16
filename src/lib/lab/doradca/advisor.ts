import type { SupabaseClient } from '@supabase/supabase-js'
import { askAdvisor, type Part, type Turn } from './ai'
import { czasWarszawa, kwartal, promptPoranny, rozbierzOdpowiedz, systemPrompt, type Stan } from './conversation'
import { downloadFile, sendMessage, sendTyping } from './telegram'

/** Doradca: łączy bazę (pamięć, terminy, historia), Gemini i Telegram. */

const HISTORIA = 16

export type TelegramUpdate = {
    update_id: number
    message?: {
        chat: { id: number; type: string }
        text?: string
        voice?: { file_id: string; mime_type?: string }
        audio?: { file_id: string; mime_type?: string }
    }
}

async function wczytajStan(db: SupabaseClient): Promise<Stan> {
    const { data: dzis, dzienTygodnia } = czasWarszawa()
    const q = kwartal(dzis)
    const [fakty, terminy, finanse] = await Promise.all([
        db.from('doradca_fakty').select('tresc').order('created_at', { ascending: true }).limit(60),
        db.from('doradca_terminy').select('data, tytul').eq('zrobione', false).gte('data', dzis).order('data').limit(15),
        db.from('finances').select('amount').gte('date', q.od).lte('date', q.do),
    ])
    const przychod = finanse.error ? null : (finanse.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0)
    return { dzis, dzienTygodnia, fakty: fakty.data ?? [], terminy: terminy.data ?? [], przychodKwartalu: przychod }
}

async function wczytajHistorie(db: SupabaseClient, pominId?: string): Promise<Turn[]> {
    const { data } = await db
        .from('doradca_wiadomosci')
        .select('id, rola, tresc')
        .order('created_at', { ascending: false })
        .limit(HISTORIA + 1)
    const wiersze = (data ?? []).filter((w) => w.id !== pominId).slice(0, HISTORIA).reverse()
    const tury: Turn[] = wiersze.map((w) => ({ role: w.rola as Turn['role'], parts: [{ text: w.tresc as string }] }))
    // Gemini wymaga, żeby rozmowa zaczynała się od użytkownika.
    while (tury.length && tury[0].role !== 'user') tury.shift()
    return tury
}

async function zapiszPamiec(db: SupabaseClient, fakty: string[], terminy: { data: string; tytul: string }[]) {
    if (fakty.length) await db.from('doradca_fakty').insert(fakty.map((tresc) => ({ tresc })))
    if (terminy.length) await db.from('doradca_terminy').upsert(terminy, { onConflict: 'data,tytul', ignoreDuplicates: true })
}

async function komenda(db: SupabaseClient, chatId: number, tekst: string): Promise<boolean> {
    const cmd = tekst.trim().split(/\s+/)[0].toLowerCase().replace(/@.*$/, '')
    if (cmd === '/start' || cmd === '/pomoc') {
        await sendMessage(
            chatId,
            'Jestem Twoim doradcą do prowadzenia WUYO. Pisz albo nagrywaj pytania o firmę, podatki, ZUS, dotację, umowy.\n\n/pamiec pokazuje, co o Tobie zapamiętałem\n/terminy pokazuje pilnowane terminy\n\nCodziennie o 8 rano wyślę jedną rzecz na dziś. Nie wysyłaj tu numerów kont, PESEL-u ani haseł.',
        )
        return true
    }
    if (cmd === '/pamiec') {
        const { data } = await db.from('doradca_fakty').select('tresc').order('created_at', { ascending: true })
        await sendMessage(chatId, data?.length ? data.map((f) => `- ${f.tresc}`).join('\n') : 'Jeszcze nic nie zapamiętałem.')
        return true
    }
    if (cmd === '/terminy') {
        const { data } = await db.from('doradca_terminy').select('data, tytul').eq('zrobione', false).order('data')
        await sendMessage(chatId, data?.length ? data.map((t) => `- ${t.data}: ${t.tytul}`).join('\n') : 'Nie pilnuję jeszcze żadnego terminu.')
        return true
    }
    return false
}

/** Obsługa jednej wiadomości z Telegrama. Wywoływana po sprawdzeniu sekretu i właściciela czatu. */
export async function obsluzWiadomosc(db: SupabaseClient, update: TelegramUpdate): Promise<void> {
    const msg = update.message
    if (!msg) return
    const chatId = msg.chat.id
    const glos = msg.voice ?? msg.audio
    if (!msg.text && !glos) {
        await sendMessage(chatId, 'Na razie rozumiem tekst i głosówki.')
        return
    }
    if (msg.text?.startsWith('/') && (await komenda(db, chatId, msg.text))) return

    // Wpis z update_id jako pierwszy: Telegram ponawia dostawę, drugi raz nie przejdzie (UNIQUE).
    const wstawiono = await db
        .from('doradca_wiadomosci')
        .insert({ update_id: update.update_id, rola: 'user', rodzaj: glos ? 'glos' : 'rozmowa', tresc: msg.text ?? '[głosówka]' })
        .select('id')
        .single()
    if (wstawiono.error) {
        if (wstawiono.error.code === '23505') return
        throw new Error(`Zapis wiadomości: ${wstawiono.error.message}`)
    }
    const wiadomoscId = wstawiono.data.id as string

    try {
        await sendTyping(chatId)
        let teraz: Part[]
        if (glos) {
            const audio = await downloadFile(glos.file_id)
            if (!audio) {
                await sendMessage(chatId, 'To nagranie jest za długie. Nagraj krócej albo podziel na dwa.')
                return
            }
            teraz = [
                { inlineData: { mimeType: glos.mime_type ?? 'audio/ogg', data: audio } },
                { text: 'To głosówka od Mateusza. Zacznij od linii [USLYSZALEM], potem odpowiedz.' },
            ]
        } else {
            teraz = [{ text: msg.text as string }]
        }

        const [stan, historia] = await Promise.all([wczytajStan(db), wczytajHistorie(db, wiadomoscId)])
        const surowa = await askAdvisor(systemPrompt(stan), [...historia, { role: 'user', parts: teraz }])
        const odp = rozbierzOdpowiedz(surowa)

        if (glos && odp.uslyszane) await db.from('doradca_wiadomosci').update({ tresc: odp.uslyszane }).eq('id', wiadomoscId)
        const tekst = odp.tekst || 'Nie mam na to odpowiedzi. Napisz to inaczej.'
        await sendMessage(chatId, tekst)
        await db.from('doradca_wiadomosci').insert({ rola: 'model', tresc: tekst })
        await zapiszPamiec(db, odp.fakty, odp.terminy)
    } catch (e) {
        console.error('Doradca: błąd obsługi wiadomości', e instanceof Error ? e.message : e)
        await sendMessage(chatId, 'Coś się wysypało po mojej stronie. Wyślij to jeszcze raz za chwilę.').catch(() => undefined)
    }
}

/** Poranna wiadomość. Zwraca powód pominięcia albo 'wyslano'. */
export async function wyslijPoranna(db: SupabaseClient, chatId: string, wymus = false): Promise<string> {
    const { data: dzis, godzina } = czasWarszawa()
    if (!wymus && godzina !== 8) return `pominięto: w Polsce jest ${godzina}:00`

    // Początek dzisiejszej doby w Polsce jako chwila UTC (zimą +01:00, latem +02:00).
    const offset = (godzina - new Date().getUTCHours() + 24) % 24
    const startDoby = new Date(`${dzis}T00:00:00${offset === 2 ? '+02:00' : '+01:00'}`).toISOString()
    const { count } = await db
        .from('doradca_wiadomosci')
        .select('id', { count: 'exact', head: true })
        .eq('rodzaj', 'poranek')
        .gte('created_at', startDoby)
    if (!wymus && (count ?? 0) > 0) return 'pominięto: dziś już wysłano'

    const [stan, historia] = await Promise.all([wczytajStan(db), wczytajHistorie(db)])
    const surowa = await askAdvisor(systemPrompt(stan), [...historia, { role: 'user', parts: [{ text: promptPoranny(stan) }] }])
    const odp = rozbierzOdpowiedz(surowa)
    if (!odp.tekst) return 'pominięto: pusta odpowiedź AI'
    await sendMessage(chatId, odp.tekst)
    await db.from('doradca_wiadomosci').insert({ rola: 'model', rodzaj: 'poranek', tresc: odp.tekst })
    await zapiszPamiec(db, odp.fakty, odp.terminy)
    return 'wyslano'
}
