// Krótki opis firmy dla asystentów AI (ChatGPT, Perplexity, Claude). Jako route, bo *.txt
// jest w .gitignore. Ceny tylko te, które już są na stronach usług.
const LLMS_TXT = `# WUYO Dobra Grafa

> Studio graficzne Mateusza Machosia z Rzeszowa. Logo, identyfikacja wizualna, strony internetowe na Next.js, druk wizytówek i ulotek, nadruk na odzieży. Dla małych i średnich firm z Rzeszowa, Podkarpacia i całej Polski.

Kontakt: kontakt@wuyo.pl, +48 725 182 053. Adres: ul. Siemieńskiego 17A/38, 35-203 Rzeszów. Ocena w Google: 5,0 (7 opinii).

## Usługi

- [Projektowanie logo](https://wuyo.pl/logo): logo od 890 zł, identyfikacja wizualna 1 490 zł, 3 koncepcje, pliki i prawa autorskie w cenie.
- [Strony internetowe](https://wuyo.pl/strony-www): one-page od 1 990 zł, strona do 5 podstron 2 990 zł, sklep od 6 900 zł.
- [Druk](https://wuyo.pl/druk): wizytówki 50 szt. z projektem od 299 zł, sam druk od 99 zł, wysyłka w całej Polsce.
- [Odzież z nadrukiem](https://wuyo.pl/odziez): DTF od 1 sztuki, personalizacja, haft.
- [Kalkulator cen](https://wuyo.pl/kalkulator)

## Lokalnie, Rzeszów

- [Grafik Rzeszów](https://wuyo.pl/grafik-rzeszow)
- [Strony internetowe Rzeszów](https://wuyo.pl/strony-internetowe-rzeszow)
- [Druk Rzeszów](https://wuyo.pl/druk-rzeszow)

## Więcej

- [Realizacje](https://wuyo.pl/realizacje)
- [O mnie](https://wuyo.pl/o-mnie)
- [Blog: ceny i porady o grafice, stronach i druku](https://wuyo.pl/blog)
`;

export const dynamic = "force-static";

export function GET() {
    return new Response(LLMS_TXT, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
