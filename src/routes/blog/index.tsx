import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { SearchBar } from "~/components/blog/search-bar";
import { PostCard } from "~/components/blog/post-card";
import { getAllPosts, groupPostsByTag } from "~/lib/blog";
import styles from "./index.module.css";

export const useBlogData = routeLoader$(() => {
  const posts = getAllPosts();
  return { posts, tagSections: groupPostsByTag(posts) };
});

export default component$(() => {
  const data = useBlogData();
  const [featuredPost, ...trendingPosts] = data.value.posts;

  return (
    <div class={styles.page}>
      <section class={styles.header}>
        <SearchBar />
        <h1 class={styles.heading}>
          Ideas, deep dives, and things I learned the hard way.
        </h1>
      </section>
      <section class={styles.grid}>
        <div>
          <PostCard post={featuredPost} variant="featured" />
        </div>
        <div class={styles.trendingColumn}>
          {trendingPosts.map((post) => (
            <PostCard key={post.slug} post={post} variant="trending" />
          ))}
        </div>
      </section>
      <div class={styles.subjects}>
        {data.value.tagSections.map((section) => (
          <section key={section.tag} class={styles.subjectSection}>
            <h2 class={styles.subjectHeading}>{section.tag}</h2>
            <div class={styles.subjectRow}>
              {section.posts.map((post) => (
                <PostCard key={post.slug} post={post} variant="compact" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Blog",
};
