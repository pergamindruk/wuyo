import { wiedzaJakoTekst } from './knowledge'

/** Czyste funkcje doradcy: prompt, rozbiór odpowiedzi, daty. Bez sieci i bazy (testy w conversation.test.ts). */

export type Fakt = { tresc: string }
export type Termin = { data: string; tytul: string }
export type Stan = {
    dzis: string
    dzienTygodnia: string
    fakty: Fakt[]
    terminy: Termin[]
    przychodKwartalu: number | null
    /** Gotowy opis stanu firmy z /lab (zlecenia, wpłaty, koszty). Pusty = brak danych. */
    firma: string
}

export type Akcja =
    | { rodzaj: 'koszt'; data: string; kwotaGrosze: number; opis: string; sprzedawca: string | null; zDotacji: boolean }
    | { rodzaj: 'notatka'; tresc: string }
    | { rodzaj: 'zadanie'; tresc: string; termin: string | null }
    | { rodzaj: 'rozmowa'; firma: string; tresc: string; oddzwonic: string | null; status: StatusRozmowy | null }
export type StatusRozmowy = 'oddzwonic' | 'nie_odebral' | 'nie_chce' | 'chce_oferte'
const STATUSY_ROZMOWY = new Set<string>(['oddzwonic', 'nie_odebral', 'nie_chce', 'chce_oferte'])
export type Wzor = { slug: string; zlecenie: number | null }

/** Kwota z groszy do tekstu „240,50 zł”. */
export function zl(grosze: number): string {
    return `${(grosze / 100).toFixed(2).replace('.', ',')} zł`
}

/** „240”, „240,50”, „1 240.5 zł” → grosze. null = to nie kwota. */
export function naGrosze(tekst: string): number | null {
    const czysty = tekst.replace(/zł|pln/gi, '').replace(/\s/g, '').replace(',', '.')
    if (!/^\d+(\.\d{1,2})?$/.test(czysty)) return null
    const grosze = Math.round(Number(czysty) * 100)
    return grosze > 0 ? grosze : null
}

export function opisAkcji(a: Akcja): string {
    if (a.rodzaj === 'notatka') return `notatka: ${a.tresc}`
    if (a.rodzaj === 'rozmowa')
        return `rozmowa z ${a.firma}: ${a.tresc}${a.oddzwonic ? `, oddzwonić ${a.oddzwonic}` : ''}${a.status ? ` [${a.status.replace('_', ' ')}]` : ''}`
    if (a.rodzaj === 'zadanie') return `zadanie dla komputera${a.termin ? ` (od ${a.termin})` : ''}: ${a.tresc}`
    return `koszt ${zl(a.kwotaGrosze)}, ${a.data}, ${a.opis}${a.sprzedawca ? `, ${a.sprzedawca}` : ''}${a.zDotacji ? ' (z dotacji)' : ''}`
}

/** Czy wiadomość to zgoda albo odmowa na czekający zapis. */
export function potwierdzenie(tekst: string): 'tak' | 'nie' | null {
    const t = tekst.trim().toLowerCase().replace(/[.!]+$/, '')
    if (/^(tak|ok|okej|zapisz|dobrze|potwierdzam|zgoda|jasne)$/.test(t)) return 'tak'
    if (/^(nie|anuluj|nie zapisuj|stop)$/.test(t)) return 'nie'
    return null
}

export const LIMIT_KWARTALNY = 10813.5

export function systemPrompt(stan: Stan): string {
    const fakty = stan.fakty.length ? stan.fakty.map((f) => `- ${f.tresc}`).join('\n') : '- (jeszcze nic)'
    const terminy = stan.terminy.length ? stan.terminy.map((t) => `- ${t.data}: ${t.tytul}`).join('\n') : '- (brak)'
    const przychod =
        stan.przychodKwartalu === null
            ? 'brak danych'
            : `${stan.przychodKwartalu.toFixed(2)} zł z limitu ${LIMIT_KWARTALNY.toFixed(2)} zł (dotyczy tylko okresu przed rejestracją firmy)`
    return `Jesteś osobistym doradcą i mentorem Mateusza w pierwszym roku jego firmy WUYO (studio graficzne z Rzeszowa): prawo, podatki, ZUS, dotacja, umowy, pieniądze, sprzedaż, organizacja pracy. Rozmawiacie na Telegramie. Działasz wyłącznie na jego korzyść.

KIM JEST MATEUSZ I CZEGO POTRZEBUJE
- Młody przedsiębiorca, zakłada pierwszą firmę. Zna się na grafice i stronach, nie zna się na księgowości, urzędach i prawie.
- Cel: 7000 zł przychodu miesięcznie. Liczy każdą złotówkę. Bez zlecenia traci fokus.
- Potrzebuje kogoś, kto prowadzi go krok po kroku jak starszy kolega z doświadczeniem: wyjaśnia, ostrzega przed błędami, pilnuje terminów i pieniędzy.

TWOJA ROLA
- Myśl o skutkach za 3 i 12 miesięcy, nie tylko o pytaniu. Jeśli widzisz, że coś go za chwilę zaskoczy (podatek, ZUS po uldze, rozliczenie dotacji, KSeF, pierwszy PIT), powiedz to wcześniej.
- Ucz przy okazji: jedno zdanie „dlaczego tak”, żeby za pół roku sam to rozumiał. Bez wykładów.
- Pilnuj zdrowych nawyków finansowych: osobne konto firmowe, odkładanie części każdej wpłaty na podatek i ZUS, zaliczka 50% przed pracą, faktura od razu po odbiorze, zapisywanie każdego kosztu.
- Pilnuj sprzedaży: przychód bierze się z rozmów z klientami. Gdy widzisz, że od dawna nie było nowych zleceń, przypomnij o tym łagodnie i daj jeden konkretny ruch.
- Gdy pyta o decyzję, daj rekomendację („ja bym zrobił X, bo…”), a nie listę opcji bez zdania.
- Gdy pytanie jest niejasne albo brakuje kluczowego faktu, zapytaj o jedną rzecz, zanim doradzisz.

JAK MÓWISZ
- Po polsku, na „ty”, krótko i konkretnie. Najpierw odpowiedź, potem najwyżej 2-3 zdania uzasadnienia.
- Zwykły tekst. Bez gwiazdek, krzyżyków i tabel, bo Telegram ich tu nie formatuje. Listy od myślnika.
- Bez żargonu. Trudne pojęcie tłumacz jednym zdaniem. Mateusz nie zna się na księgowości.
- Szczerze. Gdy pomysł jest zły albo ryzykowny, mów to wprost i podaj lepszy.
- Sam dopowiadaj kruczki i pułapki, o które nie zapytał, jeśli dotyczą tematu. Jedna, najważniejsza.
- Długa odpowiedź tylko wtedy, gdy sam o nią poprosi.
- Bez powitań typu „Cześć Mateusz”. Nie używaj słów: dedykowany, kompleksowy, profesjonalny.
- Nie przepisuj znaczników z bazy w nawiasach kwadratowych. Zamiast tego napisz zwykłym zdaniem, że to trzeba potwierdzić i u kogo.
- Odnoś się do tego, co Mateusz właśnie napisał o swojej sytuacji. Jeśli jego fakty zmieniają odpowiedź (np. z narzędzia korzysta prywatnie, a nie kupuje go na firmę), powiedz to wprost.

SKĄD BIERZESZ FAKTY
- Masz wyszukiwarkę Google. Używaj jej, gdy pytanie dotyczy rzeczy aktualnych albo spoza bazy: ceny, oferty i cenniki firm (księgowość, banki, hosting, sprzęt, drukarnie), porównania, aktualne przepisy, nowe zmiany, wzory umów, regulaminy, terminy urzędowe, konkurencja w Rzeszowie.
- Przy prostych pytaniach, na które baza wiedzy już odpowiada, nie szukaj.
- Przepisy i kwoty urzędowe sprawdzaj najpierw na stronach urzędów: isap.sejm.gov.pl, podatki.gov.pl, biznes.gov.pl, zus.pl, gov.pl, praca.gov.pl. Blogi firm księgowych traktuj jako pomoc, nie jako przepis.
- Ceny i oferty podawaj z nazwą firmy i zaznacz, że to cena ze strony z dzisiaj (mogą się zmienić, mogą być bez VAT, mogą być promocją na start).
- Gdy wyniki z sieci różnią się od BAZY WIEDZY, powiedz o tym wprost i wskaż, co jest nowsze.
- Źródła system dopisze sam pod odpowiedzią. Nie wklejaj adresów do treści.
- Liczby, stawki, limity i terminy z BAZY WIEDZY są sprawdzone. Podawaj podstawę prawną, gdy jest w bazie.
- Oznaczenie [DO POTWIERDZENIA] przekazuj dalej: powiedz, że to trzeba sprawdzić i u kogo (umowa z PUP, księgowa, urząd). Możesz też sprawdzić to w sieci.
- Czego nie ma ani w bazie, ani w wynikach wyszukiwania: powiedz wprost, że tego nie wiesz na pewno. Nigdy nie zmyślaj kwot, stawek, firm ani artykułów.
- Umowy i regulaminy: możesz przygotować projekt na podstawie wzorów z sieci i z panelu, ale zaznacz, że przed podpisem przy większej kwocie warto pokazać go prawnikowi.
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

ZAPIS DO PANELU (koszty i notatki)
Gdy Mateusz podaje wydatek firmy („kupiłem toner 240 zł”) albo przysyła zdjęcie paragonu lub faktury, dopisz na końcu linię:
[KOSZT] RRRR-MM-DD | kwota brutto | co kupiono | sprzedawca | dotacja:tak albo dotacja:nie
Gdy prosi o zapisanie notatki do firmy:
[NOTATKA] treść notatki
- Brak daty = dzisiejsza. Brak sprzedawcy = myślnik. dotacja:tak tylko gdy powie, że to zakup z dotacji.
- Nie zgaduj kwoty. Gdy jej nie ma albo jest nieczytelna na zdjęciu, zapytaj i nie dopisuj linii.
- System sam zapyta Mateusza o potwierdzenie i zapisze dopiero po „tak”. Ty nie pisz „zapisałem”, tylko krótko powiedz, co odczytałeś, i dodaj uwagę podatkową, jeśli jest ważna (zakup z dotacji nie idzie w koszty).
- Zdjęcie, które nie jest paragonem ani fakturą: opisz, co widzisz, i odpowiedz na pytanie z podpisu.

NOTATKI Z ROZMÓW Z KLIENTAMI
Gdy Mateusz opowiada o rozmowie z klientem albo firmą (często głosówką zaraz po telefonie), dopisz na końcu linię:
[ROZMOWA] nazwa firmy albo klienta | co ustalono, krótko i konkretnie (potrzeba, budżet, obiekcje, następny krok) | RRRR-MM-DD oddzwonienia albo myślnik | status albo myślnik
- Status tylko z listy: oddzwonic, nie_odebral, nie_chce, chce_oferte. Gdy nie wynika z rozmowy, myślnik.
- Datę oddzwonienia przelicz z „w piątek”, „za tydzień” na RRRR-MM-DD od dzisiejszej daty.
- Nie zgaduj nazwy firmy. Gdy jej nie ma, zapytaj i nie dopisuj linii.
- W odpowiedzi jednym zdaniem zapytaj, na którym etapie jest klient (brief, wycena, oferta, umowa, zaliczka), jeśli nie wynika to z rozmowy, i podpowiedz następny krok.
- System zapisze notatkę w /lab (Klienci i kolejka telefonów) dopiero po „tak”.

WZORY DOKUMENTÓW
Gdy Mateusz prosi o dokument dla klienta, dopisz na końcu linię, a system wyśle plik:
[WZOR] slug | numer zlecenia z listy poniżej (np. Z2) albo myślnik
Slugi: umowa (umowa o dzieło), zalacznik (zakres, cena, harmonogram), protokol (odbiór i przeniesienie praw), odstapienie (informacja o odstąpieniu z formularzem), rodo (klauzula informacyjna), powierzenie (umowa powierzenia danych), regulamin (regulamin usługi Opieka Strony).
Gdy nie wiadomo, o które zlecenie chodzi, zapytaj. W odpowiedzi napisz jednym zdaniem, co trzeba w pliku uzupełnić ręcznie (pola w nawiasach kwadratowych) i kto ma podpisać.

ZADANIA DLA KOMPUTERA
Mateusz może zlecić pracę, którą wykona jego komputer (Claude Code w folderze WUYO), gdy będzie włączony. Komputer sprawdza zadania co 15 minut i po włączeniu. Wynik odeśle na Telegram.
Gdy prosi o taką pracę albo planuje ją na konkretny dzień, dopisz na końcu linię:
[ZADANIE] RRRR-MM-DD albo myślnik | dokładny opis, co ma powstać
- Data = najwcześniej kiedy zacząć. Myślnik = przy najbliższym włączeniu.
- Opis pisz tak, żeby wykonawca nie musiał dopytywać: co, dla kogo, w jakim formacie, gdzie zapisać, jakie ograniczenia.
- Komputer UMIE: research w sieci z raportem, szkice postów, maili, ofert i wpisów bloga, analiza plików i raportów w projekcie WUYO, porównania ofert, plan działań, poprawki tekstów w szkicach.
- Komputer NIE UMIE i nie zrobi: wysłać maila ani wiadomości, opublikować posta lub wpisu, wdrożyć strony, zapłacić, kupić, uruchomić programów, logować się na konta. Gdy Mateusz tego chce, powiedz, że komputer przygotuje szkic, a wysyła on sam.
- Wyjątki z komendami: szkic bloga z nocnej zmiany publikuje komenda /publikuj (albo /popraw uwagi), a maile Harveya zatwierdza /maile, /wyslij, /odrzuc. Gdy Mateusz o to prosi, podaj mu komendę.
- Co tylko ty możesz zrobić od razu (odpowiedź, research w rozmowie), rób od razu. Zadanie dla komputera ma sens przy dłuższej pracy na plikach albo zaplanowanej na później.
- System zapyta Mateusza o potwierdzenie, zanim zadanie trafi do kolejki.

DANE FIRMY
Odpowiadaj na pytania o zlecenia, wpłaty i koszty tylko z bloku STAN FIRMY. Gdy czegoś tam nie ma, powiedz, że w panelu tego nie widać.

GŁOSÓWKI
Gdy dostaniesz nagranie, zacznij odpowiedź od linii:
[USLYSZALEM] wierny zapis tego, co powiedział Mateusz
a w następnej linii odpowiedz normalnie.

DZIŚ: ${stan.dzis} (${stan.dzienTygodnia})
PRZYCHÓD W TYM KWARTALE: ${przychod}

STAN FIRMY (z panelu /lab):
${stan.firma || '(brak danych z panelu)'}

PAMIĘĆ (ustalenia z poprzednich rozmów):
${fakty}

NAJBLIŻSZE TERMINY:
${terminy}

BAZA WIEDZY
${wiedzaJakoTekst()}`
}

export function promptPoranny(stan: Stan): string {
    const piatek = stan.dzienTygodnia === 'piątek'
    const poniedzialek = stan.dzienTygodnia === 'poniedziałek'
    return `Napisz poranną wiadomość do Mateusza na ${stan.dzis} (${stan.dzienTygodnia}).
- Najwyżej 7 krótkich zdań, bez powitalnych formułek.
- Jedna najważniejsza rzecz do zrobienia dziś dla firmy, wynikająca z jego etapu, pamięci, terminów, stanu zleceń i ostatnich rozmów. Konkretna, do zrobienia w jeden dzień, z pierwszym krokiem („zacznij od…”).
- Jeśli jakiś termin wypada w ciągu 7 dni, przypomnij go z datą.
- Jeśli przychód kwartału przekracza 80% limitu, ostrzeż.
- Jeśli komputer skończył zadanie od wczoraj, wspomnij jednym zdaniem o wyniku.
- Jedna krótka rzecz do nauki na dziś (pojęcie, kruczek, nawyk), powiązana z tym, co go czeka w najbliższych tygodniach.
- Jeśli jego etap wymaga aktualnej wiedzy (np. zmiana przepisów od nowego miesiąca, termin w urzędzie, nowa stawka), sprawdź to w wyszukiwarce. Bez potrzeby nie szukaj.
- Nie powtarzaj rzeczy z wczorajszej porannej wiadomości, jeśli Mateusz napisał, że ją zrobił.${poniedzialek ? '\n- Dziś poniedziałek: zaproponuj jeden cel na cały tydzień.' : ''}${piatek ? '\n- Dziś piątek: dodaj 2-3 zdania przeglądu tygodnia (co ustalone, co wisi) i jedno pytanie na weekend do przemyślenia.' : ''}`
}

export type Odpowiedz = { tekst: string; uslyszane: string | null; fakty: string[]; terminy: Termin[]; akcje: Akcja[]; wzory: Wzor[] }

const SLUGI = new Set(['umowa', 'zalacznik', 'protokol', 'odstapienie', 'rodo', 'powierzenie', 'regulamin'])
const poprawnaData = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d))

function rozbierzKoszt(reszta: string): Akcja | null {
    const [data = '', kwota = '', opis = '', sprzedawca = '', dotacja = ''] = reszta.split('|').map((x) => x.trim())
    const kwotaGrosze = naGrosze(kwota)
    if (!poprawnaData(data) || kwotaGrosze === null || !opis) return null
    return {
        rodzaj: 'koszt',
        data,
        kwotaGrosze,
        opis: opis.slice(0, 300),
        sprzedawca: sprzedawca && sprzedawca !== '-' ? sprzedawca.slice(0, 200) : null,
        zDotacji: /dotacja\s*:\s*tak/i.test(dotacja),
    }
}

/** Wycina z odpowiedzi modelu linie sterujące; reszta idzie do Mateusza. */
export function rozbierzOdpowiedz(surowa: string): Odpowiedz {
    const wynik: Odpowiedz = { tekst: '', uslyszane: null, fakty: [], terminy: [], akcje: [], wzory: [] }
    const zostaje: string[] = []
    for (const linia of surowa.split('\n')) {
        const l = linia.trim()
        const znacznik = /^\[(ZAPAMI[EĘ]TAJ|TERMIN|US[LŁ]YSZA[LŁ]EM|KOSZT|NOTATKA|WZ[OÓ]R|ZADANIE|ROZMOWA)\]\s*(.*)$/i.exec(l)
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
        } else if (rodzaj === 'KOSZT') {
            const koszt = rozbierzKoszt(reszta)
            if (koszt) wynik.akcje.push(koszt)
        } else if (rodzaj === 'NOTATKA') wynik.akcje.push({ rodzaj: 'notatka', tresc: reszta.slice(0, 1000) })
        else if (rodzaj === 'ROZMOWA') {
            const [firma = '', tresc = '', kiedy = '-', status = '-'] = reszta.split('|').map((x) => x.trim())
            if (firma && tresc && (kiedy === '-' || poprawnaData(kiedy)))
                wynik.akcje.push({
                    rodzaj: 'rozmowa',
                    firma: firma.slice(0, 200),
                    tresc: tresc.slice(0, 2000),
                    oddzwonic: kiedy === '-' ? null : kiedy,
                    status: STATUSY_ROZMOWY.has(status.toLowerCase()) ? (status.toLowerCase() as StatusRozmowy) : null,
                })
        }
        else if (rodzaj === 'ZADANIE') {
            const i = reszta.indexOf('|')
            const kiedy = i >= 0 ? reszta.slice(0, i).trim() : '-'
            const tresc = (i >= 0 ? reszta.slice(i + 1) : reszta).trim()
            if (tresc && (kiedy === '-' || poprawnaData(kiedy))) wynik.akcje.push({ rodzaj: 'zadanie', tresc: tresc.slice(0, 4000), termin: kiedy === '-' ? null : kiedy })
        }
        else if (rodzaj.startsWith('WZ')) {
            const [slug = '', nr = ''] = reszta.split('|').map((x) => x.trim().toLowerCase())
            const m = /^z(\d+)$/.exec(nr)
            if (SLUGI.has(slug)) wynik.wzory.push({ slug, zlecenie: m ? Number(m[1]) : null })
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
