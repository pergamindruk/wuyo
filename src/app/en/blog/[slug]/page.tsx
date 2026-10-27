import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import remarkGfm from "remark-gfm";
import { getAllSlugs, getPost, getRelatedPosts, extractFaq } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/MDXComponents";
import { BUSINESS_ID, BUSINESS_NAME } from "@/lib/business-schema";
import { alternatesForPaths, route } from "@/lib/i18n";

// Angielskie wpisy z src/content/blog-en. Każdy ma translationOf = slug polskiego
// oryginału, z tego są pary hreflang (i przełącznik języka bierze je z <head>).

interface Props {
    params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
    return getAllSlugs("en").map((slug) => ({ slug }));
}

const BLOG = route("blog", "en");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const post = getPost(slug, "en");
        const ogImage = post.image ?? "/og-image.webp";
        const description = post.seoDescription ?? post.excerpt;
        return {
            title: post.seoTitle ?? post.title,
            description,
            openGraph: { title: post.title, description, type: "article", url: `https://wuyo.pl${BLOG}/${slug}`, images: [ogImage], locale: "en_GB" },
            twitter: { card: "summary_large_image", title: post.title, description, images: [ogImage] },
            alternates: alternatesForPaths(
                { en: `${BLOG}/${slug}`, pl: post.translationOf ? `${route("blog", "pl")}/${post.translationOf}` : undefined },
                "en",
            ),
        };
    } catch {
        return {};
    }
}

export default async function ArticleEnPage({ params }: Props) {
    const { slug } = await params;
    let post;
    try {
        post = getPost(slug, "en");
    } catch {
        notFound();
    }

    const faq = extractFaq(post.content);
    const related = getRelatedPosts(slug, 3, "en");
    const imageUrl = post.image ? `https://wuyo.pl${post.image}` : "https://wuyo.pl/og-image.webp";
    const isPortrait = !!post.imageSize && post.imageSize.height > post.imageSize.width;
    const dateFmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

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
                        inLanguage: "en",
                        datePublished: post.date,
                        dateModified: post.dateModified ?? post.date,
                        author: { "@type": "Person", name: "Mateusz Machoś", url: "https://wuyo.pl/en/about" },
                        publisher: {
                            "@type": "Organization",
                            "@id": BUSINESS_ID,
                            name: BUSINESS_NAME,
                            url: "https://wuyo.pl",
                            logo: { "@type": "ImageObject", url: "https://wuyo.pl/logo_wuya2.webp" },
                        },
                        mainEntityOfPage: { "@type": "WebPage", "@id": `https://wuyo.pl${BLOG}/${slug}` },
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
                    <Link href={BLOG} className="inline-flex items-center gap-2 text-white/60 hover:text-gold transition-colors text-sm mb-8">
                        <ArrowLeft size={14} aria-hidden="true" /> Back to blog
                    </Link>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="eyebrow text-xs">{post.category}</span>
                        <span className="text-white/20" aria-hidden="true">·</span>
                        <span className="text-white/60 text-xs">{post.readTime} read</span>
                        <span className="text-white/20" aria-hidden="true">·</span>
                        <time className="text-white/60 text-xs" dateTime={post.date}>{dateFmt(post.date)}</time>
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
                            {post.imageAlt && <figcaption className="text-white/60 text-xs mt-3">{post.imageAlt}</figcaption>}
                        </figure>
                    )}
                </div>
            </section>

            <article className="px-6 pb-20">
                <div className="max-w-3xl mx-auto">
                    <MDXRemote source={post.content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
                </div>
            </article>

            {related.length > 0 && (
                <section className="px-6 pb-4 max-w-3xl mx-auto">
                    <div className="pt-10 border-t border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-8">Read next</h2>
                        <div className="grid gap-5 md:grid-cols-3">
                            {related.map((item) => (
                                <Link key={item.slug} href={`${BLOG}/${item.slug}`} className="glass-card p-5 block group">
                                    {item.image && (
                                        <div className="relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden border border-white/10">
                                            <Image src={item.image} alt={item.imageAlt ?? item.title} fill sizes="(max-width: 768px) 100vw, 220px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                        </div>
                                    )}
                                    <span className="eyebrow text-xs">{item.category}</span>
                                    <h3 className="text-base font-bold text-white mt-2 mb-2 leading-snug group-hover:text-gold transition-colors">{item.title}</h3>
                                    <span className="text-white/60 text-xs">{item.readTime} read</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <div className="px-6 pb-20 max-w-3xl mx-auto">
                <div className="pt-10 border-t border-white/10">
                    <Link href={BLOG} className="inline-flex items-center gap-2 text-white/60 hover:text-gold transition-colors text-sm">
                        <ArrowLeft size={14} aria-hidden="true" /> More articles
                    </Link>
                </div>
            </div>
        </div>
    );
}
