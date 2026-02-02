import blogData from "virtual:blog-data";
import type { BlogPost, BlogPostFull } from "./types";

export function getAllPosts(): BlogPost[] {
  return Object.values(blogData)
    .map(({ frontmatter }) => frontmatter as unknown as BlogPostFull)
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
  for (const { frontmatter, html } of Object.values(blogData)) {
    if (frontmatter.slug === slug && frontmatter.published) {
      return {
        ...(frontmatter as unknown as Omit<BlogPostFull, "content">),
        content: html,
      };
    }
  }

  return null;
}
