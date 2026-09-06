import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
    title: "Blog – porady o grafice i stronach WWW | WUYO",
    description: "Praktyczne porady o projektowaniu logo, tworzeniu stron internetowych i identyfikacji wizualnej. Bez lania wody — konkretna wiedza od projektanta z Rzeszowa.",
    openGraph: {
        title: "Blog WUYO – grafika i strony WWW bez ściemy",
        description: "Ile kosztuje logo? Kiedy strona one-page wystarczy? Odpowiadam konkretnie.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/blog",
    },
    alternates: { canonical: "https://wuyo.pl/blog" },
};

export default function BlogPage() {
    const allPosts = getAllPosts();

    return (
        <main className="flex-1 w-full">
            <section className="relative min-h-[45vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-16 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">Wiedza bez ściemy</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Blog</h1>
                    <p className="text-lg text-white/70 max-w-xl mx-auto">
                        Piszę o grafice, stronach i brandingu tak, żebyś wiedział za co płacisz i jak rozpoznać dobrego wykonawcę.
                    </p>
                </AnimatedSection>
            </section>

            <section className="py-16 px-6 md:px-12">
                <div className="max-w-4xl mx-auto grid gap-8">
                    {allPosts.map((post, i) => (
                        <AnimatedSection key={post.slug} delay={i * 0.1}>
                            <Link href={`/blog/${post.slug}`} className="glass-card p-8 md:p-10 block group">
                                <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                                {post.image && (
                                    <div className="relative w-full md:w-56 shrink-0 aspect-[4/3] mb-6 md:mb-0 rounded-xl overflow-hidden border border-white/10">
                                        <Image
                                            src={post.image}
                                            alt={post.imageAlt ?? post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 224px"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <span className="eyebrow text-xs">{post.category}</span>
                                    <span className="text-white/20">·</span>
                                    <span className="text-white/40 text-xs flex items-center gap-1">
                                        <Clock size={12} /> {post.readTime} czytania
                                    </span>
                                    <span className="text-white/20">·</span>
                                    <span className="text-white/40 text-xs">{new Date(post.date).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-gold transition-colors leading-tight">
                                    {post.title}
                                </h2>
                                <p className="text-white/60 leading-relaxed mb-6">{post.excerpt}</p>
                                <span className="inline-flex items-center gap-2 text-gold font-bold text-sm group-hover:gap-3 transition-all">
                                    Czytaj artykuł <ArrowRight size={16} />
                                </span>
                                </div>
                                </div>
                            </Link>
                        </AnimatedSection>
                    ))}
                </div>
            </section>
        </main>
    );
}
