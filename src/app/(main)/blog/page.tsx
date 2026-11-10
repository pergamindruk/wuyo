import type { Metadata } from "next";
import { seoMeta } from "@/lib/seo-overrides";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { getAllPosts } from "@/lib/blog";
import { alternatesFor } from "@/lib/i18n";

const metadata: Metadata = {
    title: "Blog: porady o grafice i stronach WWW",
    description: "Praktyczne porady o projektowaniu logo, tworzeniu stron internetowych i identyfikacji wizualnej. Bez lania wody — konkretna wiedza od projektanta z Rzeszowa.",
    openGraph: {
        title: "Blog WUYO – grafika i strony WWW bez ściemy",
        description: "Ile kosztuje logo? Kiedy strona one-page wystarczy? Odpowiadam konkretnie.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/blog",
    },
    alternates: alternatesFor("blog", "pl"),
};

// Tytuł i opis może podmienić SEO-radca (/lab/seo) bez wdrożenia.
export async function generateMetadata(): Promise<Metadata> {
    return seoMeta("/blog", metadata);
}

export default function BlogPage() {
    return (
        <main className="flex-1 w-full">
            <BlogIndex posts={getAllPosts()} locale="pl" />
        </main>
    );
}
