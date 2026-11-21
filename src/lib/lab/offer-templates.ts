/**
 * Szablony ofert WUYO w głosie Mateusza (CLAUDE.md: wstęp / zakres / cena / CTA).
 * Zakres i ceny zgodne z CENNIK.md (stan 27.10.2026). Cena przychodzi z SERVICES, nie stąd.
 * Termin celowo pusty: wpisujesz go ręcznie, tylko gdy go obiecujesz.
 * {firma} podmienia się na nazwę firmy klienta. Tekst w [nawiasach] uzupełnij przed wysłaniem.
 */
import type { OfferData } from './offer'

type Template = Pick<OfferData, 'title' | 'intro' | 'scope' | 'cta'>

const CTA =
    'Jeśli wszystko pasuje, kliknij „Akceptuję ofertę” pod spodem albo odpisz na maila. Potem wyślę Ci umowę i dane do zaliczki 50%, a zlecenia realizuję od grudnia 2026.'

const SITE_INTRO =
    '[Jedno zdanie o sytuacji klienta, np. „Klienci szukają Cię w Google, a dziś trafiają na konkurencję”.] Zrobię Ci stronę, która mówi jasno, czym się zajmujesz, i prowadzi klienta prosto do telefonu albo formularza. Działa na telefonie, szybko się wczytuje i jest gotowa pod Google.'

export const OFFER_TEMPLATES: Record<string, Template> = {
    one_page: {
        title: 'Strona internetowa dla {firma}',
        intro: SITE_INTRO,
        scope: [
            'Jedna długa strona z sekcjami: kim jesteś, co robisz, opinie, kontakt.',
            'Wygląd dopasowany do Twojego logo i kolorów.',
            'Strona działa dobrze na telefonie, tablecie i komputerze.',
            'Podstawowe ustawienia pod Google: tytuły, opisy, mapa strony.',
            'Formularz kontaktowy i przycisk do dzwonienia.',
            'Domena i serwer na pierwszy rok w cenie.',
            'Poprawki do projektu w cenie, pracujemy do akceptacji.',
        ],
        cta: CTA,
    },
    strona_5: {
        title: 'Strona firmowa dla {firma}',
        intro: SITE_INTRO,
        scope: [
            'Do 5 podstron, np. start, oferta, o firmie, realizacje, kontakt.',
            'Wygląd dopasowany do Twojego logo i kolorów.',
            'Strona działa dobrze na telefonie, tablecie i komputerze.',
            'Ustawienia pod Google i pod wyszukiwanie w okolicy.',
            'Formularz kontaktowy, mapa dojazdu i przycisk do dzwonienia.',
            'Domena i serwer na pierwszy rok w cenie.',
            'Projekt i wdrożenie akceptujesz osobno, poprawki w cenie.',
        ],
        cta: CTA,
    },
    firma_w_internecie: {
        title: 'Logo i strona dla {firma}',
        intro:
            '[Jedno zdanie o sytuacji klienta, np. „Startujesz z firmą i potrzebujesz wszystkiego naraz”.] W jednym pakiecie dostajesz logo, wizytówki i stronę, które do siebie pasują. Nie musisz szukać trzech różnych osób ani pilnować, żeby kolory się zgadzały.',
        scope: [
            'Logo w trzech wersjach: poziomej, pionowej i jednokolorowej.',
            'Mini księga znaku: kolory, czcionki i zasady używania logo.',
            '150 wizytówek, projekt i druk.',
            'Stopka do maila.',
            'Strona do 5 podstron z formularzem i mapą dojazdu, gotowa pod Google w okolicy.',
            'Krótkie szkolenie z obsługi i pierwszy miesiąc opieki nad stroną.',
            'Domena i serwer na pierwszy rok w cenie.',
        ],
        cta: CTA,
    },
    pelny_start: {
        title: 'Pełny start dla {firma}',
        intro:
            '[Jedno zdanie o sytuacji klienta.] Dostajesz wszystko, czego firma potrzebuje na start: logo, materiały, stronę i trzy miesiące mojej pomocy, żeby klienci zaczęli Cię znajdować. Twoje zlecenie ma u mnie pierwszeństwo.',
        scope: [
            'Logo w trzech wersjach i mini księga znaku.',
            '300 wizytówek i ulotka A5, projekt i druk.',
            'Strona do 5 podstron z formularzem i mapą, gotowa pod Google w okolicy.',
            'Szablony grafik do Facebooka i Instagrama.',
            'Założona i uzupełniona wizytówka w Google oraz plan zbierania opinii.',
            'Trzy miesiące pakietu Widoczność i Opieka: grafiki co miesiąc, opinie, raport.',
            'Domena i serwer na pierwszy rok w cenie.',
        ],
        cta: CTA,
    },
    marka_start: {
        title: 'Logo i identyfikacja dla {firma}',
        intro:
            '[Jedno zdanie o sytuacji klienta.] Zrobię Ci logo, które da się użyć wszędzie: na szyldzie, aucie, wizytówce i w internecie. Do tego zasady, dzięki którym każdy materiał będzie wyglądał spójnie.',
        scope: [
            'Pierwsza koncepcja logo plus dwa inne kierunki do wyboru, dopracowujemy wybraną do akceptacji.',
            'Logo w trzech wersjach: poziomej, pionowej i jednokolorowej.',
            'Mini księga znaku: kolory, czcionki i zasady używania logo.',
            '150 wizytówek, projekt i druk.',
            'Stopka do maila.',
            'Po opłaceniu pełne prawa autorskie i pliki źródłowe.',
        ],
        cta: CTA,
    },
    marka_mini: {
        title: 'Logo i wizytówki dla {firma}',
        intro:
            '[Jedno zdanie o sytuacji klienta.] Zrobię Ci logo i wizytówki, z którymi możesz od razu iść do klienta. Szybko, konkretnie i bez dopłat po drodze.',
        scope: [
            'Pierwsza koncepcja logo plus dwa inne kierunki do wyboru, dopracowujemy wybraną do akceptacji.',
            'Logo w trzech wersjach: poziomej, pionowej i jednokolorowej.',
            '100 wizytówek, projekt i druk.',
            'Pliki do druku i do internetu.',
            'Po opłaceniu pełne prawa autorskie i pliki źródłowe.',
        ],
        cta: CTA,
    },
    logo: {
        title: 'Logo dla {firma}',
        intro:
            '[Jedno zdanie o sytuacji klienta.] Zrobię Ci logo, które będzie dobrze wyglądać i na szyldzie, i na małej ikonce w telefonie. Zaczynamy od krótkiego briefu, żeby pierwsza propozycja była blisko tego, czego szukasz.',
        scope: [
            'Pierwsza koncepcja logo plus dwa inne kierunki do wyboru.',
            'Dopracowujemy wybraną wersję do akceptacji, poprawki w cenie.',
            'Logo w trzech wersjach: poziomej, pionowej i jednokolorowej.',
            'Pliki do druku i do internetu.',
            'Po opłaceniu pełne prawa autorskie i pliki źródłowe.',
        ],
        cta: CTA,
    },
    inne: {
        title: '[Usługa] dla {firma}',
        intro: '[Jedno zdanie o sytuacji klienta.] [Co dla niego zrobisz i po co, jedno lub dwa zdania.]',
        scope: ['[Co dostaje, punkt 1]', '[Punkt 2]', '[Punkt 3]', 'Poprawki do wybranej koncepcji w cenie.', 'Po opłaceniu pełne prawa autorskie i pliki źródłowe.'],
        cta: CTA,
    },
}

/** Szablon dla usługi, z podstawioną nazwą firmy (albo imieniem, gdy firmy brak). */
export function offerTemplate(serviceKey: string, company: string): Template {
    const t = OFFER_TEMPLATES[serviceKey] ?? OFFER_TEMPLATES.inne
    const name = company.trim() || 'Twojej firmy'
    return { ...t, title: t.title.replace('{firma}', name), scope: [...t.scope] }
}
