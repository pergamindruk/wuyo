import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

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

    return [
        ...blogEntries,
        {
            url: `${baseUrl}/grafik-rzeszow`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.95,
        },
        {
            url: `${baseUrl}/strony-internetowe-rzeszow`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.95,
        },
        {
            url: `${baseUrl}/druk-rzeszow`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.9,
        },
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/realizacje`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.95,
        },
        {
            url: `${baseUrl}/kalkulator`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/o-mnie`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/logo`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/strony-www`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/cennik`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/druk`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/odziez`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/audyt`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/polityka-prywatnosci`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}
