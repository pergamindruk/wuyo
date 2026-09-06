import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getAllPosts } from "@/lib/blog";

/**
 * Zajawka bloga na stronie głównej — trzy najnowsze artykuły.
 * Server Component: dane czytane z plików .mdx w czasie budowania.
 */
export function BlogTeaser() {
    const posts = getAllPosts().slice(0, 3);
    if (posts.length === 0) return null;

    return (
        <section id="blog" className="py-28 px-6 md:px-12 relative overflow-hidden">
            <div className="section-glow" />

            <AnimatedSection className="text-center mb-16 relative z-10">
                <p className="eyebrow mb-4">Wiedza bez ściemy</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Zanim wydasz pieniądze,<br />sprawdź za co płacisz
                </h2>
                <p className="text-white/60 mt-6 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                    Piszę o cenach, druku i stronach tak, żebyś wiedział, co jest warte swojej ceny,
                    a co jest naciąganiem. Bez teorii i bez agencyjnego żargonu.
                </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
                {posts.map((post, i) => (
                    <AnimatedSection key={post.slug} delay={i * 0.1}>
                        <Link
                            href={`/blog/${post.slug}`}
                            className="glass-card h-full group flex flex-col overflow-hidden transition-all duration-300 hover:border-gold/30"
                        >
                            {post.image && (
                                <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-white/10">
                                    <Image
                                        src={post.image}
                                        alt={post.imageAlt ?? post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 380px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="eyebrow text-[10px]">{post.category}</span>
                                    <span className="text-white/20" aria-hidden="true">·</span>
                                    <span className="text-white/40 text-[11px] flex items-center gap-1">
                                        <Clock size={11} aria-hidden="true" /> {post.readTime}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-gold transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-white/60 text-sm leading-relaxed mb-5 flex-1">{post.excerpt}</p>
                                <span className="inline-flex items-center gap-1 text-gold text-xs font-bold group-hover:gap-2 transition-all">
                                    Czytaj artykuł <ArrowRight size={12} aria-hidden="true" />
                                </span>
                            </div>
                        </Link>
                    </AnimatedSection>
                ))}
            </div>

            <AnimatedSection className="text-center mt-12 relative z-10">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold transition-all"
                >
                    Zobacz wszystkie artykuły <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </AnimatedSection>
        </section>
    );
}
