/**
 * Pliki do pobrania za e-mail. Same pliki leżą w /pliki-do-pobrania (poza public,
 * więc nie da się ich ściągnąć bez linku z maila). Nowy plik = wpis tutaj + plik w folderze.
 */
export type DownloadFile = {
    slug: string
    file: string
    title: string
    desc: string
    /** Wpis na blogu, z którego zwykle ktoś przychodzi (link „wróć do artykułu”). */
    article?: string
}

export const DOWNLOADS: DownloadFile[] = [
    {
        slug: 'brief-dla-projektanta',
        file: 'brief-dla-projektanta-wuyo.pdf',
        title: 'Szablon briefu dla projektanta (PDF)',
        desc: '3 strony: pytania na logo i stronę internetową oraz lista rzeczy do sprawdzenia przed wysłaniem. Wydrukujesz i wypełnisz długopisem w 30 do 60 minut.',
        article: '/blog/jak-napisac-brief-dla-projektanta',
    },
    {
        slug: 'lista-nowa-firma',
        file: 'lista-nowa-firma-wuyo.pdf',
        title: 'Nowa firma: lista materiałów na start (PDF)',
        desc: '2 strony: co zamówić przed pierwszym klientem, co w pierwszych miesiącach, a co może poczekać. Do tego formalności, o których łatwo zapomnieć, i 5 najdroższych błędów.',
        article: '/blog/identyfikacja-wizualna-mala-firma-od-czego-zaczac',
    },
    {
        slug: 'plik-do-druku',
        file: 'plik-do-druku-wuyo.pdf',
        title: 'Plik do druku: ściąga przed wysłaniem (PDF)',
        desc: '2 strony: spady i wymiary formatów, kolory CMYK, rozdzielczość, czcionki, eksport z Canvy i lista kontrolna przed wysłaniem do drukarni. Plus wskazówki do nadruku na koszulki.',
        article: '/blog/jak-przygotowac-plik-do-druku',
    },
    {
        slug: 'strona-firmowa-lista',
        file: 'strona-firmowa-lista-wuyo.pdf',
        title: 'Strona firmowa: lista kontrolna w 25 punktach (PDF)',
        desc: '2 strony: co musi mieć strona małej firmy, żeby klient zadzwonił. Pierwszy ekran, treść, kontakt, telefon, Google, prawo i własność domeny.',
        article: '/blog/jak-stworzyc-strone-internetowa-dla-firmy',
    },
]

export const findDownload = (slug: string) => DOWNLOADS.find((d) => d.slug === slug)

export const MARKETING_CONSENT_TEXT =
    'Chcę dostawać od WUYO maile z poradami i ofertami na podany adres. Mogę z tego zrezygnować w każdej chwili, odpisując „wypisz”.'
