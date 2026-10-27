import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
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

    return (
        <div className="flex-1 w-full">
            <section className="relative min-h-[45vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-16 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">No-nonsense advice</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Blog</h1>
                    <p className="text-lg text-white/70 max-w-xl mx-auto">
                        I write about design, websites and branding so you know what you are paying for and how to spot a good contractor. Prices are for the Polish market, in PLN.
                    </p>
                </AnimatedSection>
            </section>

            <section className="py-16 px-6 md:px-12">
                <div className="max-w-4xl mx-auto grid gap-8">
                    {posts.length === 0 && (
                        <p className="text-center text-white/60">
                            English articles are on their way. Meanwhile, see the{" "}
                            <Link href={route("blog", "pl")} hrefLang="pl" className="text-gold hover:underline">Polish blog</Link>.
                        </p>
                    )}
                    {posts.map((post, i) => (
                        <AnimatedSection key={post.slug} delay={Math.min(i, 6) * 0.08}>
                            <Link href={`${route("blog", "en")}/${post.slug}`} className="glass-card p-8 md:p-10 block group">
                                <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                                    {post.image && (
                                        <div className="relative w-full md:w-56 shrink-0 aspect-[4/3] mb-6 md:mb-0 rounded-xl overflow-hidden border border-white/10">
                                            <Image src={post.image} alt={post.imageAlt ?? post.title} fill sizes="(max-width: 768px) 100vw, 224px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                                            <span className="eyebrow text-xs">{post.category}</span>
                                            <span className="text-white/20">·</span>
                                            <span className="text-white/60 text-xs flex items-center gap-1"><Clock size={12} /> {post.readTime} read</span>
                                            <span className="text-white/20">·</span>
                                            <span className="text-white/60 text-xs">{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-gold transition-colors leading-tight">{post.title}</h2>
                                        <p className="text-white/60 leading-relaxed mb-6">{post.excerpt}</p>
                                        <span className="inline-flex items-center gap-2 text-gold font-bold text-sm group-hover:gap-3 transition-all">
                                            Read article <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </AnimatedSection>
                    ))}
                </div>
            </section>
        </div>
    );
}
