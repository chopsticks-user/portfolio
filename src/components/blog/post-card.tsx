import { component$ } from "@builder.io/qwik";
import type { BlogPost } from "~/lib/types";
import styles from "./post-card.module.css";

interface PostCardProps {
  post: BlogPost;
  variant: "featured" | "trending" | "compact";
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const labelMap = {
  featured: "featured_blog",
  trending: "trending",
  compact: "subject",
} as const;

export const PostCard = component$<PostCardProps>(({ post, variant }) => {
  const labelText = labelMap[variant];
  const formattedDate = dateFormatter.format(new Date(post.date));

  if (variant === "compact") {
    return (
      <a href={`/blog/${post.slug}`} class={styles.compact}>
        <span class={styles.label}>//.{labelText}</span>
        <h4 class={styles.title}>{post.title}</h4>
        <div class={styles.meta}>{formattedDate}</div>
        <div class={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag} class={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </a>
    );
  }

  const TitleTag = variant === "featured" ? "h2" : "h3";

  return (
    <article class={variant === "featured" ? styles.featured : styles.trending}>
      <span class={styles.label}>//.{labelText}</span>
      <div class={styles.cover} style={{ background: post.coverGradient }}>
        <span class={styles.codeText}>{"//"} ..</span>
      </div>
      <TitleTag class={styles.title}>{post.title}</TitleTag>
      <div class={styles.meta}>
        by {post.author} · {formattedDate}
      </div>
      {variant === "featured" && <p class={styles.excerpt}>{post.excerpt}</p>}
      <a href={`/blog/${post.slug}`} class={styles.readLink}>
        KEEP READING →
      </a>
    </article>
  );
});
