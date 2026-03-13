import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/lab/", "/api/", "/auth/", "/c/"],
            },
        ],
        sitemap: "https://wuyo.pl/sitemap.xml",
    };
}
