import type { Metadata } from "next";
import Link from "next/link";
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
        images: ["/logo_wuya2.webp"],
        url: "https://wuyo.pl/blog",
    },
    alternates: { canonical: "https://wuyo.pl/blog" },
};

export const posts = [
    {
        slug: "jak-napisac-brief-dla-projektanta",
        title: "Jak napisać brief dla projektanta graficznego? Gotowy szablon 2026",
        excerpt: "Brief to różnica między projektem, który trafił w dziesiątkę za pierwszym razem, a projektem, który przerabiasz cztery razy. Kompletna lista pytań + 7 błędów których unikać.",
        date: "2026-03-27",
        readTime: "8 min",
        category: "Logo & Branding",
    },
    {
        slug: "jak-stworzyc-strone-internetowa-dla-firmy",
        title: "Jak stworzyć stronę internetową dla firmy? Kompletny przewodnik 2026",
        excerpt: "3 sposoby tworzenia strony (Wix, WordPress, Next.js), kiedy każdy ma sens, ile kosztują — i jak wybrać wykonawcę, który przyniesie Ci rzeczywisty zwrot z inwestycji.",
        date: "2026-03-27",
        readTime: "12 min",
        category: "Strony WWW",
    },
    {
        slug: "jak-wybrac-projektanta-logo",
        title: "Jak wybrać projektanta logo? 8 pytań zanim zapłacisz",
        excerpt: "Rynek projektantów logo pełen jest szablonów i Canvy. Podaję Ci konkretną checklistę — 8 pytań które w 10 minut pokażą czy masz do czynienia z profesjonalistą czy z amatorem.",
        date: "2026-03-27",
        readTime: "7 min",
        category: "Logo & Branding",
    },
    {
        slug: "identyfikacja-wizualna-firmy",
        title: "Identyfikacja wizualna firmy — czym jest i ile kosztuje w 2026?",
        excerpt: "Logo to dopiero początek. Tłumaczę czym jest identyfikacja wizualna, co powinna zawierać (z listą must-have), dlaczego mała firma potrzebuje jej bardziej niż korporacja — i ile to naprawdę kosztuje.",
        date: "2026-03-27",
        readTime: "8 min",
        category: "Logo & Branding",
    },
    {
        slug: "strona-one-page-czy-multi-page",
        title: "Strona one-page czy multi-page? Konkretna odpowiedź dla Twojej firmy",
        excerpt: "One-page czy multi-page — każdy projektant powie \"to zależy\". Ja mówię od czego zależy: porównuję SEO, konwersję i koszty, i daję 5-pytaniowy test żebyś wiedział co wybrać.",
        date: "2026-03-27",
        readTime: "7 min",
        category: "Strony WWW",
    },
    {
        slug: "ile-kosztuje-strona-internetowa",
        title: "Ile kosztuje strona internetowa dla firmy w 2026?",
        excerpt: "Od 500 zł za szablon po 50 000 zł+ za aplikację webową — ceny stron są wszędzie. Tłumaczę co naprawdę decyduje o cenie, kiedy one-page wystarczy i ile powinieneś zapłacić za swoją stronę.",
        date: "2026-03-27",
        readTime: "8 min",
        category: "Strony WWW",
    },
    {
        slug: "ile-kosztuje-logo",
        title: "Ile kosztuje logo w 2026? Uczciwy cennik projektanta",
        excerpt: "Od 100 zł w Canva po 50 000 zł w dużej agencji — rozpiętość cen za logo jest ogromna. Tłumaczę co tak naprawdę wpływa na cenę i ile powinieneś zapłacić za logo dla swojej firmy.",
        date: "2026-03-27",
        readTime: "7 min",
        category: "Logo & Branding",
    },
];

export default function BlogPage() {
    // Merge MDX articles (new ones) with hardcoded legacy posts, deduplicated by slug
    const mdxPosts = getAllPosts();
    const legacySlugs = new Set(posts.map((p) => p.slug));
    const allPosts = [...mdxPosts.filter((p) => !legacySlugs.has(p.slug)), ...posts];

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
                                <div className="flex items-center gap-3 mb-4">
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
                            </Link>
                        </AnimatedSection>
                    ))}
                </div>
            </section>
        </main>
    );
}
