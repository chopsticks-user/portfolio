import { $, component$, useOnWindow, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import styles from "./header.module.css";

export const Header = component$(() => {
  const scrolled = useSignal(false);

  useOnWindow(
    "scroll",
    $(() => {
      scrolled.value = window.scrollY > 0;
    }),
  );

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
