import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import styles from "./header.module.css";

export const Header = component$(() => {
  const scrolled = useSignal(false);

  useVisibleTask$(() => {
    const onScroll = () => {
      scrolled.value = window.scrollY > 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  return (
    <header class={[styles.header, scrolled.value && styles.scrolled]}>
      <div class={styles.inner}>
        <Link href="/" class={styles.logo}>
          frost
        </Link>
        <nav class={styles.nav}>
          <Link href="/blog" class={styles.navLink}>
            Blog
          </Link>
          <Link href="/projects" class={styles.navLink}>
            Projects
          </Link>
          <Link href="/tools" class={styles.navLink}>
            Tools
          </Link>
        </nav>
      </div>
    </header>
  );
});
