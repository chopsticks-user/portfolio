import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { BlogPost, BlogPostFull } from "./types";

const CONTENT_DIR = join(process.cwd(), "src", "content", "blog");

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeHighlight)
  .use(rehypeStringify);

export function getAllPosts(): BlogPost[] {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const raw = readFileSync(join(CONTENT_DIR, file), "utf-8");
      const { data } = matter(raw);
      return data as BlogPostFull;
    })
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(({ content: _, published: __, ...post }) => post);
}

export function groupPostsByTag(
  posts: BlogPost[],
): Array<{ tag: string; posts: BlogPost[] }> {
  const map = new Map<string, BlogPost[]>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const existing = map.get(tag);
      if (existing) {
        existing.push(post);
      } else {
        map.set(tag, [post]);
      }
    }
  }

  return Array.from(map, ([tag, posts]) => ({ tag, posts }));
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPostFull | null> {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const raw = readFileSync(join(CONTENT_DIR, file), "utf-8");
    const { data, content: markdownBody } = matter(raw);

    if (data.slug === slug && data.published) {
      const result = await processor.process(markdownBody);
      return {
        ...(data as Omit<BlogPostFull, "content">),
        content: String(result),
      };
    }
  }

  return null;
}
