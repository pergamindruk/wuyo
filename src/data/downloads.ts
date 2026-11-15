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
]

export const findDownload = (slug: string) => DOWNLOADS.find((d) => d.slug === slug)

export const MARKETING_CONSENT_TEXT =
    'Chcę dostawać od WUYO maile z poradami i ofertami na podany adres. Mogę z tego zrezygnować w każdej chwili, odpisując „wypisz”.'
