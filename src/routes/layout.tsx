import { component$, Slot } from "@builder.io/qwik";
import { Header } from "~/components/ui/header";
import styles from "./layout.module.css";

export default component$(() => {
  return (
    <>
      <Header />
      <main class={styles.main}>
        <Slot />
      </main>
    </>
  );
});
