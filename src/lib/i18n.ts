/**
 * Dwie wersje językowe: polska pod / i angielska pod /en.
 *
 * Polska strona zostaje taka, jak była — komponenty dostają `locale` z domyślnym "pl".
 * Angielskie strony mają własne, angielskie adresy (lepsze w Google niż polskie słowa
 * w URL-u), a pary adresów są tutaj, w jednym miejscu: z nich korzysta przełącznik
 * języka, hreflang w metadanych i mapa strony.
 */
export type Locale = "pl" | "en";

export const LOCALES: readonly Locale[] = ["pl", "en"];

export function localeFromPath(pathname: string | null | undefined): Locale {
    if (!pathname) return "pl";
    return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pl";
}

/** Strony, które istnieją w obu językach. Klucz = nazwa strony w kodzie. */
export const ROUTES = {
    home: { pl: "/", en: "/en" },
    logo: { pl: "/logo", en: "/en/logo-design" },
    websites: { pl: "/strony-www", en: "/en/websites" },
    print: { pl: "/druk", en: "/en/printing" },
    apparel: { pl: "/odziez", en: "/en/apparel-printing" },
    portfolio: { pl: "/realizacje", en: "/en/portfolio" },
    blog: { pl: "/blog", en: "/en/blog" },
    about: { pl: "/o-mnie", en: "/en/about" },
    pricing: { pl: "/cennik", en: "/en/pricing" },
    calculator: { pl: "/kalkulator", en: "/en/price-calculator" },
    privacy: { pl: "/polityka-prywatnosci", en: "/en/privacy-policy" },
    designerRzeszow: { pl: "/grafik-rzeszow", en: "/en/graphic-designer-rzeszow" },
    websitesRzeszow: { pl: "/strony-internetowe-rzeszow", en: "/en/web-design-rzeszow" },
    printRzeszow: { pl: "/druk-rzeszow", en: "/en/printing-rzeszow" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof ROUTES;

export function route(key: RouteKey, locale: Locale): string {
    return ROUTES[key][locale];
}

/**
 * Odpowiednik bieżącego adresu w drugim języku, jeśli to strona stała.
 * Wpisy bloga mają różne adresy w obu językach — tych tu nie ma (zwraca null),
 * przełącznik bierze je wtedy z <link rel="alternate" hreflang> w <head>.
 */
export function counterpartPath(pathname: string, target: Locale): string | null {
    const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
    for (const pair of Object.values(ROUTES)) {
        if (pair.pl === clean || pair.en === clean) return pair[target];
    }
    return null;
}

/**
 * Metadane `alternates` dla strony stałej: canonical + hreflang obu wersji.
 * x-default wskazuje polską, bo to główny rynek.
 */
export function alternatesFor(key: RouteKey, locale: Locale) {
    return alternatesForPaths({ pl: ROUTES[key].pl, en: ROUTES[key].en }, locale);
}

export function alternatesForPaths(paths: Partial<Record<Locale, string>>, locale: Locale) {
    const abs = (p: string) => `https://wuyo.pl${p === "/" ? "" : p}`;
    const languages: Record<string, string> = {};
    if (paths.pl) languages["pl-PL"] = abs(paths.pl);
    if (paths.en) languages["en"] = abs(paths.en);
    if (paths.pl) languages["x-default"] = abs(paths.pl);
    const own = paths[locale];
    return {
        canonical: own ? abs(own) : undefined,
        languages,
    };
}
