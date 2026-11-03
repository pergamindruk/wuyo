// Klucz IndexNow (Bing, Yandex). Plik musi być pod https://wuyo.pl/<klucz>.txt.
// Jako route, bo *.txt jest w .gitignore. Zgłaszanie adresów: node scripts/indexnow.mjs
const INDEXNOW_KEY = "46827ee5b740f32b10f162c9a8e33a16";

export const dynamic = "force-static";

export function GET() {
    return new Response(INDEXNOW_KEY, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
