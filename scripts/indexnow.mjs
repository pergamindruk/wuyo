// Zgłasza adresy wuyo.pl do IndexNow (Bing, a przez niego ChatGPT).
// Użycie: node scripts/indexnow.mjs            -> wszystkie adresy z sitemap.xml
//         node scripts/indexnow.mjs /blog/slug  -> tylko podane ścieżki
const KEY = "d8167398114a5c4f9fa8792fb8bde877";
const HOST = "wuyo.pl";

async function urlsFromSitemap() {
    const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
// Git Bash zamienia "/blog/x" na "C:/Program Files/Git/blog/x" — cofamy to.
// Przyjmuje też pełny adres albo ścieżkę bez ukośnika na początku.
function toUrl(arg) {
    if (arg.startsWith("http")) return arg;
    const path = arg.replace(/^[A-Za-z]:[\\/].*?[\\/]Git(?=[\\/])/, "").replace(/\\/g, "/");
    return `https://${HOST}${path.startsWith("/") ? path : `/${path}`}`;
}
const urlList = args.length ? args.map(toUrl) : await urlsFromSitemap();

// Wyszukiwarki z IndexNow przekazują sobie zgłoszenia. Gdy jedna odrzuca, próbujemy następnej.
const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList });
for (const endpoint of ["https://www.bing.com/indexnow", "https://api.indexnow.org/indexnow", "https://yandex.com/indexnow"]) {
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body });
    const detail = res.ok ? "" : ` ${(await res.text()).slice(0, 200)}`;
    console.log(`IndexNow ${endpoint}: ${res.status} ${res.statusText}, ${urlList.length} adresów${detail}`);
    if (res.ok) break;
}
