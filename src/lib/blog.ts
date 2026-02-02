import matter from "gray-matter";
import type { BlogPost, BlogPostFull } from "./types";

const blogFiles = import.meta.glob("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

async function createProcessor() {
  const { unified } = await import("unified");
  const { default: remarkParse } = await import("remark-parse");
  const { default: remarkGfm } = await import("remark-gfm");
  const { default: remarkRehype } = await import("remark-rehype");
  const { default: rehypeHighlight } = await import("rehype-highlight");
  const { default: rehypeStringify } = await import("rehype-stringify");

  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify);
}

export function getAllPosts(): BlogPost[] {
  return Object.values(blogFiles)
    .map((raw) => {
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
  for (const raw of Object.values(blogFiles)) {
    const { data, content: markdownBody } = matter(raw);

    if (data.slug === slug && data.published) {
      const processor = await createProcessor();
      const result = await processor.process(markdownBody);
      return {
        ...(data as Omit<BlogPostFull, "content">),
        content: String(result),
      };
    }
  }

  return null;
}
