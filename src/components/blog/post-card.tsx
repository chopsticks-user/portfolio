import { component$ } from "@builder.io/qwik";
import type { BlogPost } from "~/lib/types";
import { getTagColor } from "~/lib/tag-colors";
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
      <article class={styles.compact}>
        <a
          href={`/blog/${post.slug}`}
          class={styles.cover}
          style={{ background: post.coverGradient }}
        >
          <img
            src={`https://picsum.photos/seed/${post.slug}/600/338`}
            alt=""
            width={600}
            height={338}
            loading="lazy"
            class={styles.coverImg}
          />
        </a>
        <div class={styles.body}>
          <a href={`/blog/${post.slug}`} class={styles.titleLink}>
            <h4 class={styles.title}>{post.title}</h4>
          </a>
          <p class={styles.excerpt}>{post.excerpt}</p>
          <div class={styles.meta}>{formattedDate}</div>
          <div class={styles.tags}>
            {post.tags.map((tag) => (
              <a
                key={tag}
                href={"/blog?tags=" + encodeURIComponent(tag)}
                class={styles.tag}
                style={{
                  color: getTagColor(tag),
                  borderColor: getTagColor(tag),
                }}
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </article>
    );
  }

  const TitleTag = variant === "featured" ? "h2" : "h3";

  return (
    <article class={variant === "featured" ? styles.featured : styles.trending}>
      <span class={styles.label}>//.{labelText}</span>
      <a
        href={`/blog/${post.slug}`}
        class={styles.cover}
        style={{ background: post.coverGradient }}
      >
        <img
          src={`https://picsum.photos/seed/${post.slug}/800/450`}
          alt=""
          width={800}
          height={450}
          loading="lazy"
          class={styles.coverImg}
        />
      </a>
      <TitleTag class={styles.title}>{post.title}</TitleTag>
      <div class={styles.meta}>
        by{" "}
        <a href={post.authorLink} target="_blank" rel="noopener noreferrer">
          {post.author}
        </a>{" "}
        · {formattedDate}
      </div>
      {variant === "featured" && <p class={styles.excerpt}>{post.excerpt}</p>}
      <a href={`/blog/${post.slug}`} class={styles.readLink}>
        KEEP READING →
      </a>
    </article>
  );
});
