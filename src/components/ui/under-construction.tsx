import { component$ } from "@builder.io/qwik";
import UnderConstructionImg from "~/media/status/under-construction.png?jsx";
import styles from "./under-construction.module.css";

interface UnderConstructionProps {
  title: string;
}

export const UnderConstruction = component$<UnderConstructionProps>(
  ({ title }) => {
    return (
      <div class={styles.container}>
        <UnderConstructionImg class={styles.image} alt="Under construction" />
        <h1 class={styles.title}>{title}</h1>
        <p class={styles.subtitle}>Coming soon</p>
      </div>
    );
  },
);
