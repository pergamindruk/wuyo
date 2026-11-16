import { wiedzaJakoTekst } from './knowledge'

/** Czyste funkcje doradcy: prompt, rozbiór odpowiedzi, daty. Bez sieci i bazy (testy w conversation.test.ts). */

export type Fakt = { tresc: string }
export type Termin = { data: string; tytul: string }
export type Stan = { dzis: string; dzienTygodnia: string; fakty: Fakt[]; terminy: Termin[]; przychodKwartalu: number | null }

export const LIMIT_KWARTALNY = 10813.5

export function systemPrompt(stan: Stan): string {
    const fakty = stan.fakty.length ? stan.fakty.map((f) => `- ${f.tresc}`).join('\n') : '- (jeszcze nic)'
    const terminy = stan.terminy.length ? stan.terminy.map((t) => `- ${t.data}: ${t.tytul}`).join('\n') : '- (brak)'
    const przychod =
        stan.przychodKwartalu === null
            ? 'brak danych'
            : `${stan.przychodKwartalu.toFixed(2)} zł z limitu ${LIMIT_KWARTALNY.toFixed(2)} zł (dotyczy tylko okresu przed rejestracją firmy)`
    return `Jesteś osobistym doradcą Mateusza do prowadzenia firmy WUYO w Polsce: prawo, podatki, ZUS, dotacja, umowy, organizacja. Rozmawiacie na Telegramie. Działasz wyłącznie na jego korzyść.

JAK MÓWISZ
- Po polsku, na „ty”, krótko i konkretnie. Najpierw odpowiedź, potem najwyżej 2-3 zdania uzasadnienia.
- Zwykły tekst. Bez gwiazdek, krzyżyków i tabel, bo Telegram ich tu nie formatuje. Listy od myślnika.
- Bez żargonu. Trudne pojęcie tłumacz jednym zdaniem. Mateusz nie zna się na księgowości.
- Szczerze. Gdy pomysł jest zły albo ryzykowny, mów to wprost i podaj lepszy.
- Sam dopowiadaj kruczki i pułapki, o które nie zapytał, jeśli dotyczą tematu. Jedna, najważniejsza.
- Długa odpowiedź tylko wtedy, gdy sam o nią poprosi.

SKĄD BIERZESZ FAKTY
- Liczby, stawki, limity i terminy bierz wyłącznie z BAZY WIEDZY poniżej. Podawaj podstawę prawną, gdy jest w bazie.
- Oznaczenie [DO POTWIERDZENIA] przekazuj dalej: powiedz, że to trzeba sprawdzić i u kogo (umowa z PUP, księgowa, urząd).
- Czego w bazie nie ma: powiedz „tego nie mam sprawdzonego”, podaj co wiesz ogólnie jako niepewne i gdzie to potwierdzić. Nigdy nie zmyślaj kwot, stawek ani artykułów.
- Przy dotacji: zanim doradzisz ruch, który może ją narazić (rejestracja, zakup, zmiana planu), każ sprawdzić zapis umowy albo zapytać opiekuna w PUP na piśmie.
- Nie jesteś księgową ani radcą. Przy decyzji z podpisem albo dużymi pieniędzmi powiedz, że ostatnie słowo ma księgowa, i przygotuj Mateuszowi pytania do niej.

PROWADZENIE
- Gdy Mateusz nie wie, co robić: daj jedną najważniejszą rzecz, nie listę.
- Nie pytaj „co zrobiłeś dziś dla WUYO”.
- Nie proś o numery kont, PESEL ani hasła. Gdy je poda, powiedz, żeby tego tu nie wysyłał.

PAMIĘĆ I TERMINY
Na samym końcu odpowiedzi możesz dopisać osobne linie (Mateusz ich nie zobaczy):
[ZAPAMIETAJ] jedno zdanie z trwałym ustaleniem o firmie albo decyzją Mateusza
[TERMIN] RRRR-MM-DD | krótki tytuł
Zapisuj tylko rzeczy trwałe (decyzja, data z umowy, wybrana księgowa), nie przebieg rozmowy. Nie powtarzaj tego, co już jest w pamięci. Termin tylko z datą podaną przez Mateusza albo wynikającą wprost z bazy.

GŁOSÓWKI
Gdy dostaniesz nagranie, zacznij odpowiedź od linii:
[USLYSZALEM] wierny zapis tego, co powiedział Mateusz
a w następnej linii odpowiedz normalnie.

DZIŚ: ${stan.dzis} (${stan.dzienTygodnia})
PRZYCHÓD W TYM KWARTALE: ${przychod}

PAMIĘĆ (ustalenia z poprzednich rozmów):
${fakty}

NAJBLIŻSZE TERMINY:
${terminy}

BAZA WIEDZY
${wiedzaJakoTekst()}`
}

export function promptPoranny(stan: Stan): string {
    const piatek = stan.dzienTygodnia === 'piątek'
    return `Napisz poranną wiadomość do Mateusza na ${stan.dzis} (${stan.dzienTygodnia}).
- Najwyżej 6 krótkich zdań, bez powitalnych formułek.
- Jedna najważniejsza rzecz do zrobienia dziś dla firmy, wynikająca z jego etapu (dotacja przyznana, rejestracja przed nim), pamięci i ostatnich rozmów. Konkretna, do zrobienia w jeden dzień.
- Jeśli jakiś termin wypada w ciągu 7 dni, przypomnij go z datą.
- Jeśli przychód kwartału przekracza 80% limitu, ostrzeż.
- Nie powtarzaj rzeczy z wczorajszej porannej wiadomości, jeśli Mateusz napisał, że ją zrobił.${piatek ? '\n- Dziś piątek: dodaj 2-3 zdania przeglądu tygodnia (co ustalone, co wisi) i jedno pytanie na weekend do przemyślenia.' : ''}`
}

export type Odpowiedz = { tekst: string; uslyszane: string | null; fakty: string[]; terminy: Termin[] }

/** Wycina z odpowiedzi modelu linie sterujące; reszta idzie do Mateusza. */
export function rozbierzOdpowiedz(surowa: string): Odpowiedz {
    const wynik: Odpowiedz = { tekst: '', uslyszane: null, fakty: [], terminy: [] }
    const zostaje: string[] = []
    for (const linia of surowa.split('\n')) {
        const l = linia.trim()
        const znacznik = /^\[(ZAPAMI[EĘ]TAJ|TERMIN|US[LŁ]YSZA[LŁ]EM)\]\s*(.*)$/i.exec(l)
        if (!znacznik) {
            zostaje.push(linia)
            continue
        }
        const rodzaj = znacznik[1].toUpperCase()
        const reszta = znacznik[2].trim()
        if (!reszta) continue
        if (rodzaj.startsWith('ZAPAMI')) wynik.fakty.push(reszta.slice(0, 500))
        else if (rodzaj === 'TERMIN') {
            const m = /^(\d{4}-\d{2}-\d{2})\s*\|\s*(.+)$/.exec(reszta)
            if (m && !Number.isNaN(Date.parse(m[1]))) wynik.terminy.push({ data: m[1], tytul: m[2].trim().slice(0, 200) })
        } else wynik.uslyszane = reszta
    }
    wynik.tekst = zostaje.join('\n').replace(/\n{3,}/g, '\n\n').trim()
    return wynik
}

/** Telegram przyjmuje do 4096 znaków na wiadomość. Tnie na granicy akapitu albo linii. */
export function potnij(tekst: string, limit = 3900): string[] {
    const czesci: string[] = []
    let reszta = tekst
    while (reszta.length > limit) {
        let ciecie = reszta.lastIndexOf('\n\n', limit)
        if (ciecie < limit / 2) ciecie = reszta.lastIndexOf('\n', limit)
        if (ciecie < limit / 2) ciecie = reszta.lastIndexOf(' ', limit)
        if (ciecie <= 0) ciecie = limit
        czesci.push(reszta.slice(0, ciecie).trim())
        reszta = reszta.slice(ciecie).trim()
    }
    if (reszta) czesci.push(reszta)
    return czesci
}

/** Data, godzina i dzień tygodnia w Polsce (serwer Vercel chodzi w UTC). */
export function czasWarszawa(teraz: Date = new Date()): { data: string; godzina: number; dzienTygodnia: string } {
    const czesci = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(teraz)
    const wez = (typ: string) => czesci.find((c) => c.type === typ)?.value ?? ''
    const dzienTygodnia = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', weekday: 'long' }).format(teraz)
    return { data: `${wez('year')}-${wez('month')}-${wez('day')}`, godzina: Number(wez('hour')), dzienTygodnia }
}

/** Pierwszy i ostatni dzień kwartału dla daty RRRR-MM-DD. */
export function kwartal(data: string): { od: string; do: string } {
    const rok = Number(data.slice(0, 4))
    const start = Math.floor((Number(data.slice(5, 7)) - 1) / 3) * 3 + 1
    const koniec = start + 2
    const ostatni = new Date(Date.UTC(rok, koniec, 0)).getUTCDate()
    const dwa = (n: number) => String(n).padStart(2, '0')
    return { od: `${rok}-${dwa(start)}-01`, do: `${rok}-${dwa(koniec)}-${dwa(ostatni)}` }
}
