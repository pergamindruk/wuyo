import type { Metadata } from "next";
import Link from "next/link";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { getAllPosts } from "@/lib/blog";
import { alternatesFor, route } from "@/lib/i18n";

export const metadata: Metadata = {
    title: "Blog: advice on design, websites and print",
    description: "Practical advice on logo design, business websites, print and branding for small businesses. No waffle, straight answers from a designer in Rzeszów.",
    alternates: alternatesFor("blog", "en"),
    openGraph: {
        title: "WUYO blog: design and websites without the fluff",
        description: "How much does a logo cost? When is a one-page site enough? Straight answers.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/blog",
        locale: "en_GB",
    },
};

export default function BlogEnPage() {
    const posts = getAllPosts("en");

    if (posts.length === 0) {
        return (
            <div className="flex-1 w-full px-6 pt-40 pb-24 text-center">
                <p className="text-white/70">
                    English articles are on their way. Meanwhile, see the{" "}
                    <Link href={route("blog", "pl")} hrefLang="pl" className="text-gold hover:underline">Polish blog</Link>.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full">
            <BlogIndex posts={posts} locale="en" />
        </div>
    );
}
