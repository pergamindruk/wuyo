import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getAllSlugs, getPost, extractFaq } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/MDXComponents";
import type { Metadata } from "next";
import remarkGfm from "remark-gfm";

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
        const ogImage = post.image ?? "/og-image.webp";
        return {
            title: `${post.title} | WUYO`,
            description: post.excerpt,
            openGraph: {
                title: post.title,
                description: post.excerpt,
                type: "article",
                url: `https://wuyo.pl/blog/${slug}`,
                images: [ogImage],
            },
            twitter: {
                card: "summary_large_image",
                title: post.title,
                description: post.excerpt,
                images: [ogImage],
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

    const faq = extractFaq(post.content);
    const imageUrl = post.image ? `https://wuyo.pl${post.image}` : "https://wuyo.pl/og-image.webp";
    // Zdjęcia pionowe zwężamy, żeby nie spychały treści artykułu poza ekran.
    const isPortrait = !!post.imageSize && post.imageSize.height > post.imageSize.width;

    return (
        <div className="flex-1 w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: post.title,
                        description: post.excerpt,
                        image: [imageUrl],
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

            {faq.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            mainEntity: faq.map((item) => ({
                                "@type": "Question",
                                name: item.question,
                                acceptedAnswer: { "@type": "Answer", text: item.answer },
                            })),
                        }),
                    }}
                />
            )}

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

                    {post.image && (
                        <figure className={`mt-10 ${isPortrait ? "max-w-sm mx-auto" : ""}`}>
                            <Image
                                src={post.image}
                                alt={post.imageAlt ?? post.title}
                                width={post.imageSize?.width ?? 1200}
                                height={post.imageSize?.height ?? 800}
                                priority
                                sizes={isPortrait ? "(max-width: 768px) 100vw, 384px" : "(max-width: 768px) 100vw, 768px"}
                                className="w-full h-auto rounded-2xl border border-white/10"
                            />
                            {post.imageAlt && (
                                <figcaption className="text-white/40 text-xs mt-3">{post.imageAlt}</figcaption>
                            )}
                        </figure>
                    )}
                </div>
            </section>

            <article className="px-6 pb-20">
                <div className="max-w-3xl mx-auto">
                    <MDXRemote
                        source={post.content}
                        components={mdxComponents}
                        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                    />
                </div>
            </article>

            <div className="px-6 pb-20 max-w-3xl mx-auto">
                <div className="pt-10 border-t border-white/10">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm">
                        <ArrowLeft size={14} aria-hidden="true" /> Więcej artykułów
                    </Link>
                </div>
            </div>
        </div>
    );
}
