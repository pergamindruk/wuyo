// Zgłasza adresy wuyo.pl do IndexNow (Bing, a przez niego ChatGPT).
// Użycie: node scripts/indexnow.mjs            -> wszystkie adresy z sitemap.xml
//         node scripts/indexnow.mjs /blog/slug  -> tylko podane ścieżki
const KEY = "46827ee5b740f32b10f162c9a8e33a16";
const HOST = "wuyo.pl";

async function urlsFromSitemap() {
    const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const urlList = args.length ? args.map((p) => `https://${HOST}${p}`) : await urlsFromSitemap();

// Wyszukiwarki z IndexNow przekazują sobie zgłoszenia. Gdy jedna odrzuca, próbujemy następnej.
const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList });
for (const endpoint of ["https://api.indexnow.org/indexnow", "https://yandex.com/indexnow"]) {
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body });
    console.log(`IndexNow ${endpoint}: ${res.status} ${res.statusText}, ${urlList.length} adresów`);
    if (res.ok) break;
}
