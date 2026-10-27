import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { ROUTES } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://wuyo.pl";

    // Wszystkie artykuły pochodzą z plików MDX. Nie dopisuj wpisów bloga ręcznie —
    // lista i tak by się rozjechała, a ręczne wpisy podawały datę dzisiejszą,
    // czyli fałszywy sygnał świeżości przy każdym wdrożeniu.
    const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: new Date(p.dateModified ?? p.date),
        changeFrequency: "monthly" as const,
        priority: p.slug.includes("rzeszow") ? 0.95 : 0.9,
    }));

    // Strony stałe bez lastModified: nie znamy prawdziwej daty zmiany, a data wdrożenia
    // przy każdym buildzie uczy Google, że tej wartości nie warto ufać (także przy blogu).
    // Lista bloga zmienia się razem z najnowszym wpisem, więc dostaje jego datę.
    const newestPost = blogEntries[0]?.lastModified;

    // Wersja angielska: niższy priorytet, bo główny rynek i x-default to polska strona.
    const enPosts = getAllPosts("en");
    const englishEntries: MetadataRoute.Sitemap = [
        ...Object.values(ROUTES).map((r) => ({
            url: `${baseUrl}${r.en}`,
            ...(r.en === "/en/blog" && enPosts[0] ? { lastModified: new Date(enPosts[0].dateModified ?? enPosts[0].date) } : {}),
            changeFrequency: "monthly" as const,
            priority: r.en === "/en" ? 0.6 : 0.5,
        })),
        ...enPosts.map((p) => ({
            url: `${baseUrl}/en/blog/${p.slug}`,
            lastModified: new Date(p.dateModified ?? p.date),
            changeFrequency: "monthly" as const,
            priority: 0.4,
        })),
    ];

    return [
        ...blogEntries,
        {
            url: `${baseUrl}/grafik-rzeszow`,
            changeFrequency: "monthly" as const,
            priority: 0.95,
        },
        {
            url: `${baseUrl}/strony-internetowe-rzeszow`,
            changeFrequency: "monthly" as const,
            priority: 0.95,
        },
        {
            url: `${baseUrl}/druk-rzeszow`,
            changeFrequency: "monthly" as const,
            priority: 0.9,
        },
        {
            url: baseUrl,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/realizacje`,
            changeFrequency: "monthly",
            priority: 0.95,
        },
        {
            url: `${baseUrl}/kalkulator`,
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/o-mnie`,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/logo`,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/strony-www`,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/druk`,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/odziez`,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: newestPost,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        // /audyt świadomie poza mapą strony: link w stopce na każdej podstronie
        // dał 2 odsłony i jedno zgłoszenie przez pół roku. Strona nadal działa
        // pod swoim adresem, ale nie zgłaszamy jej już Google jako wartej uwagi.
        {
            url: `${baseUrl}/polityka-prywatnosci`,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        ...englishEntries,
    ];
}
