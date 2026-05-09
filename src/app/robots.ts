import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/lab/", "/api/", "/auth/", "/c/"],
            },
            {
                userAgent: "GPTBot",
                allow: "/",
                disallow: ["/lab/", "/api/", "/auth/", "/c/"],
            },
            {
                userAgent: "PerplexityBot",
                allow: "/",
                disallow: ["/lab/", "/api/", "/auth/", "/c/"],
            },
            {
                userAgent: "Claude-Web",
                allow: "/",
                disallow: ["/lab/", "/api/", "/auth/", "/c/"],
            },
            {
                userAgent: "Google-Extended",
                allow: "/",
                disallow: ["/lab/", "/api/", "/auth/", "/c/"],
            },
            {
                userAgent: "CCBot",
                allow: "/",
                disallow: ["/lab/", "/api/", "/auth/", "/c/"],
            },
            {
                userAgent: "anthropic-ai",
                allow: "/",
                disallow: ["/lab/", "/api/", "/auth/", "/c/"],
            },
        ],
        sitemap: "https://wuyo.pl/sitemap.xml",
    };
}
