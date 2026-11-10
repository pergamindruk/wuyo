"use client";

// Wyspa kliencka: zakładki działów filtrują siatkę wpisów bez przeładowania strony.
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { PostMeta } from "@/lib/blog";
import type { Locale } from "@/lib/i18n";

interface Group {
    id: string;
    label: string;
    /** Kategorie z frontmattera, które należą do działu. Brak = wszystkie. */
    categories?: string[];
}

const GROUPS: Record<Locale, Group[]> = {
    pl: [
        { id: "all", label: "Wszystkie" },
        { id: "www", label: "Strony WWW", categories: ["Strony WWW"] },
        { id: "logo", label: "Logo i marka", categories: ["Logo i marka", "Grafika"] },
        { id: "druk", label: "Druk i odzież", categories: ["Druk", "Odzież"] },
        { id: "porady", label: "Porady", categories: ["Marketing", "Przewodnik"] },
    ],
    en: [
        { id: "all", label: "All" },
        { id: "www", label: "Websites", categories: ["Websites"] },
        { id: "logo", label: "Logo & branding", categories: ["Logo & Branding", "Design"] },
        { id: "druk", label: "Print & apparel", categories: ["Print", "Apparel"] },
        { id: "porady", label: "Guides", categories: ["Marketing", "Guide"] },
    ],
};

const TEXT = {
    pl: { read: "czytania", empty: "W tym dziale nie ma jeszcze wpisów.", dateLocale: "pl-PL" },
    en: { read: "read", empty: "No articles in this section yet.", dateLocale: "en-GB" },
} as const;

interface Props {
    posts: PostMeta[];
    locale: Locale;
    basePath: string;
}

export function BlogGrid({ posts, locale, basePath }: Props) {
    const groups = GROUPS[locale].filter(
        (g) => !g.categories || posts.some((p) => g.categories?.includes(p.category)),
    );
    const [active, setActive] = useState("all");
    const group = groups.find((g) => g.id === active);
    const visible = group?.categories ? posts.filter((p) => group.categories?.includes(p.category)) : posts;
    const t = TEXT[locale];

    return (
        <>
            <div role="tablist" className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {groups.map((g) => {
                    const count = g.categories ? posts.filter((p) => g.categories?.includes(p.category)).length : posts.length;
                    const on = g.id === active;
                    return (
                        <button
                            key={g.id}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            onClick={() => setActive(g.id)}
                            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-colors border ${
                                on
                                    ? "bg-gold text-black border-gold"
                                    : "border-white/15 text-white/80 hover:border-gold/60 hover:text-white"
                            }`}
                        >
                            {g.label} <span className={on ? "text-black/60" : "text-white/40"}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {visible.length === 0 ? (
                <p className="text-white/70">{t.empty}</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((post) => (
                        <Link
                            key={post.slug}
                            href={`${basePath}/${post.slug}`}
                            className="glass-card group flex flex-col overflow-hidden"
                        >
                            {post.image && (
                                <div className="relative aspect-[3/2] overflow-hidden border-b border-white/10">
                                    <Image
                                        src={post.image}
                                        alt={post.imageAlt ?? post.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            )}
                            <div className="flex flex-1 flex-col p-6">
                                <span className="eyebrow mb-3">{post.category}</span>
                                <h3 className="text-xl font-bold leading-snug text-white mb-3 group-hover:text-gold transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-white/75 leading-relaxed line-clamp-3 mb-5">{post.excerpt}</p>
                                <p className="mt-auto flex items-center gap-2 text-sm text-white/60">
                                    <Clock size={14} aria-hidden /> {post.readTime} {t.read}
                                    <span className="text-white/25">·</span>
                                    {new Date(post.date).toLocaleDateString(t.dateLocale, { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}
