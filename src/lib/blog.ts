import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src/content/blog");

export interface PostMeta {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    category: string;
    dateModified?: string;
    image?: string;
    imageAlt?: string;
}

export interface ImageSize {
    width: number;
    height: number;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface Post extends PostMeta {
    content: string;
    imageSize?: ImageSize;
}

/**
 * Czyta wymiary obrazka z nagłówka pliku w /public — bez zewnętrznych zależności.
 * Dzięki temu next/image dostaje prawdziwe proporcje i strona nie skacze przy wczytywaniu.
 * Obsługuje WebP (VP8, VP8L, VP8X) i PNG. Zwraca undefined, jeśli formatu nie rozpoznano.
 */
export function getImageSize(publicPath: string): ImageSize | undefined {
    const file = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    if (!fs.existsSync(file)) return undefined;

    const head = Buffer.alloc(64);
    const handle = fs.openSync(file, "r");
    try {
        fs.readSync(handle, head, 0, 64, 0);
    } finally {
        fs.closeSync(handle);
    }

    if (head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WEBP") {
        const format = head.toString("ascii", 12, 16);
        if (format === "VP8X") {
            return { width: head.readUIntLE(24, 3) + 1, height: head.readUIntLE(27, 3) + 1 };
        }
        if (format === "VP8 ") {
            return { width: head.readUInt16LE(26) & 0x3fff, height: head.readUInt16LE(28) & 0x3fff };
        }
        if (format === "VP8L") {
            const bits = head.readUInt32LE(21);
            return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
        }
        return undefined;
    }

    if (head.toString("ascii", 1, 4) === "PNG") {
        return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
    }

    return undefined;
}

export function getAllPosts(): PostMeta[] {
    if (!fs.existsSync(POSTS_DIR)) return [];
    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
    return files
        .map((file) => {
            const slug = file.replace(".mdx", "");
            const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
            const { data } = matter(raw);
            return { slug, ...data } as PostMeta;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): Post {
    const file = path.join(POSTS_DIR, `${slug}.mdx`);
    const raw = fs.readFileSync(file, "utf-8");
    const { data, content } = matter(raw);
    const post = { slug, ...data, content } as Post;
    if (post.image) post.imageSize = getImageSize(post.image);
    return post;
}

export function getAllSlugs(): string[] {
    if (!fs.existsSync(POSTS_DIR)) return [];
    return fs
        .readdirSync(POSTS_DIR)
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => f.replace(".mdx", ""));
}

/** Zamienia markdown na czysty tekst — schema.org nie przyjmuje formatowania. */
function stripMarkdown(text: string): string {
    return text
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/[*_`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Wyciąga pary pytanie/odpowiedź z sekcji "## FAQ" artykułu.
 * Format: **Pytanie?** + pusta linia + akapit odpowiedzi.
 * Zwraca pustą tablicę, jeśli artykuł nie ma sekcji FAQ.
 */
export function extractFaq(content: string): FaqItem[] {
    const afterHeading = content.split(/^##\s+FAQ\s*$/m)[1];
    if (!afterHeading) return [];

    const section = afterHeading.split(/^##\s+/m)[0];
    const items: FaqItem[] = [];
    let current: FaqItem | null = null;

    for (const raw of section.split(/\n\s*\n/)) {
        const block = raw.trim();
        if (!block) continue;

        const question = block.match(/^\*\*([\s\S]+?)\*\*$/);
        if (question) {
            if (current) items.push(current);
            current = { question: stripMarkdown(question[1]), answer: "" };
        } else if (current) {
            const answer = stripMarkdown(block);
            current.answer = current.answer ? `${current.answer} ${answer}` : answer;
        }
    }
    if (current) items.push(current);

    return items.filter((item) => item.question && item.answer);
}
