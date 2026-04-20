import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllSlugs, getPost } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/MDXComponents";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const post = getPost(slug);
        return {
            title: `${post.title} | WUYO`,
            description: post.excerpt,
            openGraph: {
                title: post.title,
                description: post.excerpt,
                type: "article",
                url: `https://wuyo.pl/blog/${slug}`,
                images: ["/logo_wuya2.webp"],
            },
            twitter: {
                card: "summary_large_image",
                title: post.title,
                description: post.excerpt,
                images: ["/logo_wuya2.webp"],
            },
            alternates: { canonical: `https://wuyo.pl/blog/${slug}` },
        };
    } catch {
        return {};
    }
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    let post;
    try {
        post = getPost(slug);
    } catch {
        notFound();
    }

    return (
        <main id="main-content" className="flex-1 w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: post.title,
                        description: post.excerpt,
                        datePublished: post.date,
                        dateModified: post.dateModified ?? post.date,
                        author: { "@type": "Person", name: "Mateusz Machoś", url: "https://wuyo.pl" },
                        publisher: {
                            "@type": "Organization",
                            name: "WUYO – Dobra Grafa",
                            url: "https://wuyo.pl",
                            logo: { "@type": "ImageObject", url: "https://wuyo.pl/logo_wuya2.webp" },
                        },
                        mainEntityOfPage: { "@type": "WebPage", "@id": `https://wuyo.pl/blog/${slug}` },
                    }),
                }}
            />

            <section className="relative pt-40 pb-12 px-6 md:pt-48">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm mb-8"
                    >
                        <ArrowLeft size={14} aria-hidden="true" /> Wróć do bloga
                    </Link>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="eyebrow text-xs">{post.category}</span>
                        <span className="text-white/20" aria-hidden="true">·</span>
                        <span className="text-white/40 text-xs">{post.readTime} czytania</span>
                        <span className="text-white/20" aria-hidden="true">·</span>
                        <time className="text-white/40 text-xs" dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
                        </time>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">{post.title}</h1>
                    <p className="text-lg text-white/60 leading-relaxed">{post.excerpt}</p>
                </div>
            </section>

            <article className="px-6 pb-20">
                <div className="max-w-3xl mx-auto">
                    <MDXRemote source={post.content} components={mdxComponents} />
                </div>
            </article>

            <div className="px-6 pb-20 max-w-3xl mx-auto">
                <div className="pt-10 border-t border-white/10">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm">
                        <ArrowLeft size={14} aria-hidden="true" /> Więcej artykułów
                    </Link>
                </div>
            </div>
        </main>
    );
}
