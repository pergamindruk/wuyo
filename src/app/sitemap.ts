import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://wuyo.pl";

    // Auto-include new MDX articles (legacy articles listed manually below)
    const mdxPosts = getAllPosts();
    const legacySlugs = new Set([
        "ile-kosztuje-logo",
        "ile-kosztuje-strona-internetowa",
        "jak-wybrac-projektanta-logo",
        "identyfikacja-wizualna-firmy",
        "strona-one-page-czy-multi-page",
        "jak-stworzyc-strone-internetowa-dla-firmy",
        "jak-napisac-brief-dla-projektanta",
    ]);
    const newMdxEntries: MetadataRoute.Sitemap = mdxPosts
        .filter((p) => !legacySlugs.has(p.slug))
        .map((p) => ({
            url: `${baseUrl}/blog/${p.slug}`,
            lastModified: new Date(p.dateModified ?? p.date),
            changeFrequency: "monthly" as const,
            priority: 0.9,
        }));

    return [
        ...newMdxEntries,
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
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
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/ile-kosztuje-logo`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog/ile-kosztuje-strona-internetowa`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog/jak-wybrac-projektanta-logo`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog/identyfikacja-wizualna-firmy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog/strona-one-page-czy-multi-page`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog/jak-stworzyc-strone-internetowa-dla-firmy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog/jak-napisac-brief-dla-projektanta`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/polityka-prywatnosci`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}
