import { component$ } from "@builder.io/qwik";
import styles from "./under-construction.module.css";

interface UnderConstructionProps {
  title: string;
}

export const UnderConstruction = component$<UnderConstructionProps>(
  ({ title }) => {
    return (
      <div class={styles.container}>
        <img
          class={styles.image}
          src="/status/under-construction.png"
          alt="Under construction"
          width={320}
          height={320}
        />
        <h1 class={styles.title}>{title}</h1>
        <p class={styles.subtitle}>Coming soon</p>
      </div>
    );
  },
);
