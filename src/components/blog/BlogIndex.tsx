// Lista wpisów bloga (PL i EN): wyróżniony najnowszy wpis, siatka z działami, pasek kontaktu.
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MessageCircle } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { BlogGrid } from "@/components/blog/BlogGrid";
import type { PostMeta } from "@/lib/blog";
import { route, type Locale } from "@/lib/i18n";

const TEXT = {
    pl: {
        eyebrow: "Wiedza bez ściemy",
        intro: "Piszę o grafice, stronach i druku tak, żebyś wiedział, za co płacisz i jak rozpoznać dobrego wykonawcę.",
        featured: "Najnowszy wpis",
        readCta: "Czytaj artykuł",
        read: "czytania",
        all: "Wszystkie wpisy",
        ctaTitle: "Masz pytanie o cenę?",
        ctaText: "Napisz, czego potrzebujesz. Odpiszę z konkretną kwotą, bez zobowiązań.",
        ctaButton: "Zapytaj o wycenę",
        contact: "/#kontakt",
        dateLocale: "pl-PL",
    },
    en: {
        eyebrow: "No-nonsense advice",
        intro: "I write about design, websites and print so you know what you are paying for and how to spot a good contractor. Prices are for the Polish market, in PLN.",
        featured: "Latest article",
        readCta: "Read article",
        read: "read",
        all: "All articles",
        ctaTitle: "Got a question about price?",
        ctaText: "Tell me what you need. I'll reply with a specific amount, no strings attached.",
        ctaButton: "Ask for a quote",
        contact: "/en#kontakt",
        dateLocale: "en-GB",
    },
} as const;

interface Props {
    posts: PostMeta[];
    locale: Locale;
}

export function BlogIndex({ posts, locale }: Props) {
    const t = TEXT[locale];
    const basePath = route("blog", locale);
    const [featured, ...rest] = posts;

    return (
        <>
            <section className="relative overflow-hidden px-6 md:px-12 pt-44 md:pt-56 pb-12">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <div className="relative z-10 max-w-6xl mx-auto">
                    <AnimatedSection animateOnMount={true}>
                        <p className="eyebrow mb-3">{t.eyebrow}</p>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
                        <p className="text-lg text-white/75 max-w-2xl">{t.intro}</p>
                    </AnimatedSection>

                    {featured && (
                        <AnimatedSection animateOnMount={true} delay={0.1}>
                            <Link
                                href={`${basePath}/${featured.slug}`}
                                className="group mt-12 grid items-center gap-8 md:gap-12 md:grid-cols-2"
                            >
                                <div className="order-2 md:order-1">
                                    <p className="eyebrow mb-4">
                                        {t.featured} · {featured.category}
                                    </p>
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white mb-5 group-hover:text-gold transition-colors">
                                        {featured.title}
                                    </h2>
                                    <p className="text-lg text-white/75 leading-relaxed mb-6">{featured.excerpt}</p>
                                    <p className="flex items-center gap-2 text-sm text-white/60 mb-8">
                                        <Clock size={14} aria-hidden /> {featured.readTime} {t.read}
                                        <span className="text-white/25">·</span>
                                        {new Date(featured.date).toLocaleDateString(t.dateLocale, { day: "numeric", month: "long", year: "numeric" })}
                                    </p>
                                    <span className="btn-gold inline-flex items-center gap-2 rounded-full px-8 py-3 font-bold text-sm">
                                        {t.readCta} <ArrowRight size={16} aria-hidden />
                                    </span>
                                </div>
                                {featured.image && (
                                    <div className="order-1 md:order-2 relative aspect-[3/2] overflow-hidden rounded-3xl border border-white/10">
                                        <Image
                                            src={featured.image}
                                            alt={featured.imageAlt ?? featured.title}
                                            fill
                                            priority
                                            sizes="(max-width: 768px) 100vw, 680px"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                            </Link>
                        </AnimatedSection>
                    )}
                </div>
            </section>

            {rest.length > 0 && (
                <section className="px-6 md:px-12 py-12">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{t.all}</h2>
                        <BlogGrid posts={rest} locale={locale} basePath={basePath} />
                    </div>
                </section>
            )}

            <section className="px-6 md:px-12 pt-4 pb-24">
                <div className="max-w-6xl mx-auto glass-card hover:transform-none flex flex-col md:flex-row md:items-center gap-6 p-6 md:p-8">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold text-black">
                        <MessageCircle size={26} aria-hidden />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{t.ctaTitle}</h2>
                        <p className="text-white/75">{t.ctaText}</p>
                    </div>
                    <Link
                        href={t.contact}
                        className="btn-gold inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 font-bold text-sm shrink-0"
                    >
                        {t.ctaButton} <ArrowRight size={16} aria-hidden />
                    </Link>
                </div>
            </section>
        </>
    );
}
