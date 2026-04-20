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
}

export interface Post extends PostMeta {
    content: string;
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
    return { slug, ...data, content } as Post;
}

export function getAllSlugs(): string[] {
    if (!fs.existsSync(POSTS_DIR)) return [];
    return fs
        .readdirSync(POSTS_DIR)
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => f.replace(".mdx", ""));
}
