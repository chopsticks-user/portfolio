import {
  $,
  component$,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  type DocumentHead,
  routeLoader$,
  useLocation,
} from "@builder.io/qwik-city";
import { FeaturedCarousel } from "~/components/blog/featured-carousel";
import { FilterBar } from "~/components/blog/filter-bar";
import { PostCard } from "~/components/blog/post-card";
import { type Category, postMatchesCategory } from "~/lib/categories";
import { getAllPosts } from "~/lib/blog";
import styles from "./index.module.css";

export const useBlogData = routeLoader$(() => getAllPosts());

export default component$(() => {
  const posts = useBlogData();
  const loc = useLocation();
  const params = loc.url.searchParams;

  const activeCategory = useSignal<Category>(
    (params.get("category") as Category) || "All"
  );
  const sortOrder = useSignal(params.get("sort") || "date-desc");
  const activeTags = useSignal<string[]>(
    params.get("tags")?.split(",").filter(Boolean).sort() || []
  );
  const searchQuery = useSignal(params.get("q") || "");

  const allTags = useComputed$(() => {
    const set = new Set<string>();
    for (const p of posts.value) {
      for (const t of p.tags) set.add(t);
    }
    return Array.from(set).sort();
  });

  const syncUrl = $(() => {
    const sp = new URLSearchParams();
    if (activeCategory.value !== "All")
      sp.set("category", activeCategory.value);
    if (activeTags.value.length > 0)
      sp.set("tags", [...activeTags.value].sort().join(","));
    if (searchQuery.value) sp.set("q", searchQuery.value);
    if (sortOrder.value !== "date-desc") sp.set("sort", sortOrder.value);
    const qs = sp.toString();
    const newUrl = qs ? `/blog?${qs}` : "/blog";
    history.replaceState(null, "", newUrl);
  });

  useVisibleTask$(() => {
    syncUrl();
  });

  const filteredPosts = useComputed$(() => {
    let filtered = posts.value;

    if (activeCategory.value !== "All") {
      filtered = filtered.filter((p) =>
        postMatchesCategory(p.tags, activeCategory.value)
      );
    }

    if (activeTags.value.length > 0) {
      const lower = activeTags.value.map((t) => t.toLowerCase());
      filtered = filtered.filter((p) =>
        lower.every((selected) =>
          p.tags.some((t) => t.toLowerCase() === selected)
        )
      );
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(q));
    }

    return filtered.sort((a, b) => {
      switch (sortOrder.value) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title-az":
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  });

  return (
    <div class={styles.page}>
      <FeaturedCarousel posts={posts.value.slice(0, 5)} />
      <FilterBar
        activeCategory={activeCategory}
        sortOrder={sortOrder}
        activeTags={activeTags}
        allTags={allTags}
        searchQuery={searchQuery}
        onFilterChange$={syncUrl}
      />
      <div class={styles.postGrid}>
        {filteredPosts.value.map((post) => (
          <PostCard key={post.slug} post={post} variant="compact" />
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Blog",
};
