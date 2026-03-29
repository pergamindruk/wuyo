export interface TrustedClient {
    src: string
    alt: string
    name: string
    desc: string
}

export const trustedClients: TrustedClient[] = [
    {
        src: "/logotypy/czysta-gablota-logo-realizacja.webp",
        alt: "Czysta Gablota",
        name: "Czysta Gablota",
        desc: "Logotyp + identyfikacja wizualna dla salonu detailingu samochodowego",
    },
    {
        src: "/logotypy/admar-logo-realizacja.webp",
        alt: "ADMAR",
        name: "ADMAR",
        desc: "Strona internetowa i materiały reklamowe dla firmy budowlanej",
    },
    {
        src: "/logotypy/pergamin-logo-realizacja.webp",
        alt: "Pergamin",
        name: "Pergamin",
        desc: "Logotyp, etykiety i opakowania dla studia twórczego",
    },
]
