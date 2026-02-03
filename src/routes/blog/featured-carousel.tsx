import { $, component$, useSignal } from "@builder.io/qwik";
import type { BlogPost } from "~/lib/types";
import { getTagColor } from "~/lib/tag-colors";
import styles from "./featured-carousel.module.css";

interface FeaturedCarouselProps {
  posts: BlogPost[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const FeaturedCarousel = component$<FeaturedCarouselProps>(
  ({ posts }) => {
    const activeIndex = useSignal(0);

    const goTo = $((index: number) => {
      activeIndex.value = index;
    });

    const post = posts[activeIndex.value];

    return (
      <section class={styles.carousel}>
        <div class={styles.slide}>
          <a
            href={`/blog/${post.slug}`}
            class={styles.cover}
            style={{ background: post.coverGradient }}
          >
            <img
              src={`https://picsum.photos/seed/${post.slug}/900/500`}
              alt=""
              width={900}
              height={500}
              class={styles.coverImg}
            />
          </a>
          <div class={styles.info}>
            <span class={styles.label}>Featured</span>
            <a href={`/blog/${post.slug}`} class={styles.titleLink}>
              <h2 class={styles.title}>{post.title}</h2>
            </a>
            <p class={styles.excerpt}>{post.excerpt}</p>
            <div class={styles.footer}>
              <div class={styles.tags}>
                {post.tags.slice(0, 2).map((tag) => (
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
                {post.tags.length > 2 && (
                  <span class={styles.tagOverflow}>
                    (+{post.tags.length - 2})
                  </span>
                )}
              </div>
              <div class={styles.meta}>
                <a
                  href={post.authorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {post.author}
                </a>{" "}
                · {dateFormatter.format(new Date(post.date))}
              </div>
            </div>
          </div>
        </div>
        <div class={styles.nav}>
          <button
            class={styles.navBtn}
            onClick$={() =>
              goTo((activeIndex.value - 1 + posts.length) % posts.length)
            }
            aria-label="Previous slide"
          >
            ‹
          </button>
          <div class={styles.dots}>
            {posts.map((_, i) => (
              <button
                key={i}
                class={[
                  styles.dot,
                  i === activeIndex.value && styles.dotActive,
                ]}
                onClick$={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            class={styles.navBtn}
            onClick$={() => goTo((activeIndex.value + 1) % posts.length)}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      </section>
    );
  }
);
