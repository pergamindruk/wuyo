import { MetadataRoute } from "next";

const DISALLOW = ["/lab/", "/api/", "/auth/", "/c/"];

// Boty wyszukiwarek i asystentów AI wpisane wprost (ChatGPT szuka przez Binga).
const AI_AND_SEARCH_BOTS = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Perplexity-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "Claude-Web",
    "anthropic-ai",
    "Google-Extended",
    "Bingbot",
    "CCBot",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { userAgent: "*", allow: "/", disallow: DISALLOW },
            ...AI_AND_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
        ],
        sitemap: "https://wuyo.pl/sitemap.xml",
    };
}
