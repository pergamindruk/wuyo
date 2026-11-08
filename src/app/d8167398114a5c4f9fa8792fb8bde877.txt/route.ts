// Klucz IndexNow (Bing, Yandex). Plik musi być pod https://wuyo.pl/<klucz>.txt.
// Jako route, bo *.txt jest w .gitignore. Zgłaszanie adresów: node scripts/indexnow.mjs
const INDEXNOW_KEY = "d8167398114a5c4f9fa8792fb8bde877";

export const dynamic = "force-static";

export function GET() {
    return new Response(INDEXNOW_KEY, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
