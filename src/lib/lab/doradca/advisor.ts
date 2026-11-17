import type { SupabaseClient } from '@supabase/supabase-js'
import { LEGAL_TEMPLATES, WYKONAWCA_DANE, fillTemplate, type LegalFields } from '@/lib/lab/legal-templates'
import { JOB_STAGES } from '@/lib/lab/today/constants'
import { askAdvisor, type Part, type Turn } from './ai'
import {
    czasWarszawa,
    kwartal,
    opisAkcji,
    potwierdzenie,
    promptPoranny,
    rozbierzOdpowiedz,
    systemPrompt,
    zl,
    type Akcja,
    type Stan,
    type Wzor,
} from './conversation'
import { downloadFile, sendDocument, sendMessage, sendTyping } from './telegram'

/** Doradca: łączy bazę (pamięć, terminy, historia, dane /lab), Gemini i Telegram. */

const HISTORIA = 16
const WAZNOSC_ZAPISU_MS = 30 * 60 * 1000

type Plik = { file_id: string; mime_type?: string }
export type TelegramUpdate = {
    update_id: number
    message?: {
        chat: { id: number; type: string }
        text?: string
        caption?: string
        voice?: Plik
        audio?: Plik
        photo?: { file_id: string; width: number; height: number }[]
        document?: Plik & { file_name?: string }
    }
}

type Zlecenie = {
    id: string
    title: string | null
    stage: number
    price_grosze: number | null
    deposit_grosze: number | null
    deadline: string | null
    next_step: string | null
    clients: { name: string | null; company: string | null; email: string | null; address: string | null; nip: string | null } | null
}

type Kontekst = { stan: Stan; zlecenia: Zlecenie[] }

function opisFirmy(
    dzis: string,
    zlecenia: Zlecenie[],
    wplatyMiesiaca: number,
    kosztyMiesiaca: { suma: number; zDotacji: number },
    ostatnieKoszty: { data: string; kwota_grosze: number; opis: string; z_dotacji: boolean }[],
    nieoplacone: { number: string | null; client_info: string; amount: number; due_date: string | null }[],
): string {
    const linie: string[] = []
    linie.push(`Wpłaty od klientów w tym miesiącu: ${zl(wplatyMiesiaca)}.`)
    linie.push(`Koszty zapisane w tym miesiącu: ${zl(kosztyMiesiaca.suma)}${kosztyMiesiaca.zDotacji ? `, w tym z dotacji ${zl(kosztyMiesiaca.zDotacji)}` : ''}.`)
    if (ostatnieKoszty.length) {
        linie.push('Ostatnie koszty:')
        for (const k of ostatnieKoszty) linie.push(`- ${k.data}: ${zl(k.kwota_grosze)}, ${k.opis}${k.z_dotacji ? ' (z dotacji)' : ''}`)
    }
    if (nieoplacone.length) {
        linie.push('Wystawione, nieopłacone dokumenty:')
        for (const f of nieoplacone) {
            const po = f.due_date && f.due_date < dzis ? ' PO TERMINIE' : ''
            linie.push(`- ${f.number ?? 'bez numeru'}: ${f.client_info}, ${zl(Math.round(Number(f.amount) * 100))}, termin ${f.due_date ?? 'brak'}${po}`)
        }
    }
    if (!zlecenia.length) linie.push('Zlecenia w toku: brak.')
    else {
        linie.push('Zlecenia w toku (numer do wzorów na początku):')
        zlecenia.forEach((z, i) => {
            const etap = JOB_STAGES.find((s) => s.stage === z.stage)?.label ?? `etap ${z.stage}`
            const klient = z.clients?.company || z.clients?.name || 'klient bez nazwy'
            const cena = z.price_grosze ? zl(z.price_grosze) : 'bez ceny'
            const reszta = [z.deadline && `termin ${z.deadline}`, z.next_step && `następny krok: ${z.next_step}`].filter(Boolean).join(', ')
            linie.push(`- Z${i + 1}: ${z.title ?? 'bez tytułu'} dla ${klient}, ${etap}, ${cena}${reszta ? `, ${reszta}` : ''}`)
        })
    }
    return linie.join('\n')
}

async function wczytajKontekst(db: SupabaseClient): Promise<Kontekst> {
    const { data: dzis, dzienTygodnia } = czasWarszawa()
    const q = kwartal(dzis)
    const miesiacOd = `${dzis.slice(0, 7)}-01`
    const [fakty, terminy, finanse, jobs, wplaty, koszty, nieoplacone] = await Promise.all([
        db.from('doradca_fakty').select('tresc').order('created_at', { ascending: true }).limit(60),
        db.from('doradca_terminy').select('data, tytul').eq('zrobione', false).gte('data', dzis).order('data').limit(15),
        db.from('finances').select('amount').gte('date', q.od).lte('date', q.do),
        db
            .from('jobs')
            .select('id, title, stage, price_grosze, deposit_grosze, deadline, next_step, clients(name, company, email, address, nip)')
            .is('closed_at', null)
            .order('stage', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(20),
        db.from('payments').select('amount_grosze').gte('paid_at', miesiacOd).lte('paid_at', dzis),
        db.from('koszty').select('data, kwota_grosze, opis, z_dotacji').gte('data', miesiacOd).order('data', { ascending: false }).limit(200),
        db.from('finances').select('number, client_info, amount, due_date').neq('payment_status', 'Zaplacona').order('due_date').limit(10),
    ])
    const zlecenia = (jobs.data ?? []) as unknown as Zlecenie[]
    const listaKosztow = koszty.data ?? []
    const firma = opisFirmy(
        dzis,
        zlecenia,
        (wplaty.data ?? []).reduce((s, p) => s + Number(p.amount_grosze ?? 0), 0),
        {
            suma: listaKosztow.reduce((s, k) => s + k.kwota_grosze, 0),
            zDotacji: listaKosztow.filter((k) => k.z_dotacji).reduce((s, k) => s + k.kwota_grosze, 0),
        },
        listaKosztow.slice(0, 8),
        nieoplacone.data ?? [],
    )
    const przychod = finanse.error ? null : (finanse.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0)
    return {
        stan: { dzis, dzienTygodnia, fakty: fakty.data ?? [], terminy: terminy.data ?? [], przychodKwartalu: przychod, firma },
        zlecenia,
    }
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

/** Wykonuje zapisy, na które Mateusz odpowiedział „tak”. Zwraca opis tego, co się udało i co nie. */
async function wykonajAkcje(db: SupabaseClient, akcje: Akcja[]): Promise<string> {
    const linie: string[] = []
    for (const a of akcje) {
        const wynik =
            a.rodzaj === 'koszt'
                ? await db.from('koszty').insert({ data: a.data, kwota_grosze: a.kwotaGrosze, opis: a.opis, sprzedawca: a.sprzedawca, z_dotacji: a.zDotacji })
                : await db.from('activity_log').insert({ kind: 'notatka_dnia', note: a.tresc })
        linie.push(wynik.error ? `Nie udało się zapisać: ${opisAkcji(a)}` : `Zapisane: ${opisAkcji(a)}`)
        if (wynik.error) console.error('Doradca: zapis akcji', wynik.error.message)
    }
    return linie.join('\n')
}

/**
 * Jeśli czeka zapis do potwierdzenia: „tak” zapisuje, „nie” kasuje, cokolwiek innego też kasuje
 * (żeby stare „tak” nie zapisało czegoś po godzinie). Zwraca true, gdy wiadomość została obsłużona.
 */
async function obsluzPotwierdzenie(db: SupabaseClient, chatId: number, tekst: string | undefined): Promise<boolean> {
    // Kasujemy od razu przy odczycie: powtórzona dostawa z Telegrama nie zapisze drugi raz.
    const { data } = await db.from('doradca_oczekujace').delete().not('id', 'is', null).select('akcje, created_at')
    const czeka = (data ?? []).filter((w) => Date.now() - new Date(w.created_at as string).getTime() < WAZNOSC_ZAPISU_MS)
    if (!czeka.length || !tekst) return false
    const decyzja = potwierdzenie(tekst)
    if (!decyzja) return false
    const odpowiedz = decyzja === 'tak' ? await wykonajAkcje(db, czeka.flatMap((w) => w.akcje as Akcja[])) : 'Nie zapisuję.'
    await sendMessage(chatId, odpowiedz)
    await db.from('doradca_wiadomosci').insert({ rola: 'model', tresc: odpowiedz })
    return true
}

const dataPl = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`

async function wyslijWzory(chatId: number, wzory: Wzor[], zlecenia: Zlecenie[], dzis: string) {
    const data = dataPl(dzis)
    for (const w of wzory) {
        const tpl = LEGAL_TEMPLATES.find((t) => t.slug === w.slug)
        if (!tpl) continue
        const z = w.zlecenie ? zlecenia[w.zlecenie - 1] : undefined
        const k = z?.clients
        const pola: LegalFields = {
            WYKONAWCA: WYKONAWCA_DANE,
            ZAMAWIAJACY: [k?.company || k?.name, k?.address, k?.nip && `NIP ${k.nip}`].filter(Boolean).join(', ') || '[DANE ZAMAWIAJĄCEGO: imię i nazwisko / firma, adres, NIP]',
            EMAIL: k?.email || '[e-mail]',
            DATA: data,
            NR: z ? `${z.id.slice(0, 4).toUpperCase()}/${data.slice(3)}` : `[NR]/${data.slice(3)}`,
            DZIELO: z?.title || '[opis dzieła z oferty]',
            KWOTA: z?.price_grosze ? zl(z.price_grosze) : '[KWOTA] zł',
            ZALICZKA: z?.price_grosze ? zl(z.deposit_grosze || Math.round(z.price_grosze / 2)) : '[KWOTA] zł',
        }
        await sendDocument(chatId, `${tpl.slug}-${dzis}.md`, fillTemplate(tpl.body, pola), `${tpl.title}. Podpis: ${tpl.sign}`)
    }
}

async function komenda(db: SupabaseClient, chatId: number, tekst: string): Promise<boolean> {
    const cmd = tekst.trim().split(/\s+/)[0].toLowerCase().replace(/@.*$/, '')
    if (cmd === '/start' || cmd === '/pomoc') {
        await sendMessage(
            chatId,
            'Jestem Twoim doradcą do prowadzenia WUYO. Pisz albo nagrywaj pytania o firmę, podatki, ZUS, dotację, umowy.\n\nCo jeszcze umiem:\n- zapisać koszt: napisz „toner 240 zł” albo wyślij zdjęcie paragonu, zapytam o potwierdzenie\n- zapisać notatkę: „zanotuj, że…”\n- wysłać wzór: „daj umowę dla zlecenia…”\n- powiedzieć, co ze zleceniami i wpłatami\n\n/pamiec pokazuje, co o Tobie zapamiętałem\n/terminy pokazuje pilnowane terminy\n/koszty pokazuje koszty z tego miesiąca\n\nCodziennie o 8 rano wyślę jedną rzecz na dziś. Nie wysyłaj tu numerów kont, PESEL-u ani haseł.',
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
    if (cmd === '/koszty') {
        const { data: dzis } = czasWarszawa()
        const { data } = await db.from('koszty').select('data, kwota_grosze, opis, z_dotacji').gte('data', `${dzis.slice(0, 7)}-01`).order('data')
        const suma = (data ?? []).reduce((s, k) => s + k.kwota_grosze, 0)
        await sendMessage(
            chatId,
            data?.length
                ? `${data.map((k) => `- ${k.data}: ${zl(k.kwota_grosze)}, ${k.opis}${k.z_dotacji ? ' (z dotacji)' : ''}`).join('\n')}\n\nRazem w tym miesiącu: ${zl(suma)}`
                : 'W tym miesiącu nie ma zapisanych kosztów.',
        )
        return true
    }
    return false
}

/** Załącznik z wiadomości: głosówka, zdjęcie albo plik (obraz, PDF). */
function zalacznik(msg: NonNullable<TelegramUpdate['message']>): { plik: Plik; rodzaj: 'glos' | 'obraz' } | null {
    const glos = msg.voice ?? msg.audio
    if (glos) return { plik: { file_id: glos.file_id, mime_type: glos.mime_type ?? 'audio/ogg' }, rodzaj: 'glos' }
    if (msg.photo?.length) {
        const najwieksze = [...msg.photo].sort((a, b) => b.width * b.height - a.width * a.height)[0]
        return { plik: { file_id: najwieksze.file_id, mime_type: 'image/jpeg' }, rodzaj: 'obraz' }
    }
    const typ = msg.document?.mime_type ?? ''
    if (msg.document && (typ.startsWith('image/') || typ === 'application/pdf')) return { plik: { file_id: msg.document.file_id, mime_type: typ }, rodzaj: 'obraz' }
    return null
}

/** Obsługa jednej wiadomości z Telegrama. Wywoływana po sprawdzeniu sekretu i właściciela czatu. */
export async function obsluzWiadomosc(db: SupabaseClient, update: TelegramUpdate): Promise<void> {
    const msg = update.message
    if (!msg) return
    const chatId = msg.chat.id
    const zal = zalacznik(msg)
    if (!msg.text && !zal) {
        await sendMessage(chatId, 'Rozumiem tekst, głosówki, zdjęcia i PDF-y.')
        return
    }
    if (msg.text?.startsWith('/') && (await komenda(db, chatId, msg.text))) return

    // Wpis z update_id jako pierwszy: Telegram ponawia dostawę, drugi raz nie przejdzie (UNIQUE).
    const opisWejscia = msg.text ?? (zal?.rodzaj === 'glos' ? '[głosówka]' : `[zdjęcie albo dokument]${msg.caption ? ` ${msg.caption}` : ''}`)
    const wstawiono = await db
        .from('doradca_wiadomosci')
        .insert({ update_id: update.update_id, rola: 'user', rodzaj: zal?.rodzaj === 'glos' ? 'glos' : 'rozmowa', tresc: opisWejscia })
        .select('id')
        .single()
    if (wstawiono.error) {
        if (wstawiono.error.code === '23505') return
        throw new Error(`Zapis wiadomości: ${wstawiono.error.message}`)
    }
    const wiadomoscId = wstawiono.data.id as string

    try {
        if (await obsluzPotwierdzenie(db, chatId, msg.text)) return

        await sendTyping(chatId)
        let teraz: Part[]
        if (zal) {
            const dane = await downloadFile(zal.plik.file_id)
            if (!dane) {
                await sendMessage(chatId, zal.rodzaj === 'glos' ? 'To nagranie jest za długie. Nagraj krócej albo podziel na dwa.' : 'Ten plik jest za duży. Wyślij mniejsze zdjęcie.')
                return
            }
            const polecenie =
                zal.rodzaj === 'glos'
                    ? 'To głosówka od Mateusza. Zacznij od linii [USLYSZALEM], potem odpowiedz.'
                    : `Mateusz przysłał zdjęcie albo dokument.${msg.caption ? ` Podpis: ${msg.caption}` : ''} Jeśli to paragon albo faktura, odczytaj datę, kwotę brutto, co kupiono i sprzedawcę, i zaproponuj zapis kosztu.`
            teraz = [{ inlineData: { mimeType: zal.plik.mime_type ?? 'application/octet-stream', data: dane } }, { text: polecenie }]
        } else {
            teraz = [{ text: msg.text as string }]
        }

        const [kontekst, historia] = await Promise.all([wczytajKontekst(db), wczytajHistorie(db, wiadomoscId)])
        const surowa = await askAdvisor(systemPrompt(kontekst.stan), [...historia, { role: 'user', parts: teraz }])
        const odp = rozbierzOdpowiedz(surowa)

        if (zal?.rodzaj === 'glos' && odp.uslyszane) await db.from('doradca_wiadomosci').update({ tresc: odp.uslyszane }).eq('id', wiadomoscId)
        let tekst = odp.tekst || 'Nie mam na to odpowiedzi. Napisz to inaczej.'
        if (odp.akcje.length) {
            await db.from('doradca_oczekujace').insert({ akcje: odp.akcje })
            tekst += `\n\nZapisać w panelu?\n${odp.akcje.map((a) => `- ${opisAkcji(a)}`).join('\n')}\nOdpisz: tak albo nie.`
        }
        await sendMessage(chatId, tekst)
        await db.from('doradca_wiadomosci').insert({ rola: 'model', tresc: tekst })
        await zapiszPamiec(db, odp.fakty, odp.terminy)
        if (odp.wzory.length) await wyslijWzory(chatId, odp.wzory, kontekst.zlecenia, kontekst.stan.dzis)
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

    const [kontekst, historia] = await Promise.all([wczytajKontekst(db), wczytajHistorie(db)])
    const surowa = await askAdvisor(systemPrompt(kontekst.stan), [...historia, { role: 'user', parts: [{ text: promptPoranny(kontekst.stan) }] }])
    const odp = rozbierzOdpowiedz(surowa)
    if (!odp.tekst) return 'pominięto: pusta odpowiedź AI'
    await sendMessage(chatId, odp.tekst)
    await db.from('doradca_wiadomosci').insert({ rola: 'model', rodzaj: 'poranek', tresc: odp.tekst })
    await zapiszPamiec(db, odp.fakty, odp.terminy)
    return 'wyslano'
}
