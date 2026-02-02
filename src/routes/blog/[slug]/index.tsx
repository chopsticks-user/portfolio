import { component$ } from "@builder.io/qwik";
import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { getPostBySlug } from "~/lib/blog";
import styles from "./index.module.css";

export const usePost = routeLoader$(async ({ params, redirect }) => {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    throw redirect(302, "/blog");
  }
  return post;
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default component$(() => {
  const post = usePost();

  return (
    <article class={styles.page}>
      <header class={styles.header}>
        <div class={styles.tags}>
          {post.value.tags.map((tag: string) => (
            <span key={tag} class={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <h1 class={styles.title}>{post.value.title}</h1>
        <div class={styles.meta}>
          by {post.value.author} ·{" "}
          {dateFormatter.format(new Date(post.value.date))}
        </div>
      </header>
      <div
        class={styles.content}
        dangerouslySetInnerHTML={post.value.content}
      />
    </article>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const post = resolveValue(usePost);
  return {
    title: post.title,
    meta: [
      { name: "description", content: post.excerpt },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.excerpt },
    ],
  };
};
