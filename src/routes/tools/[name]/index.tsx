import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { UnderConstruction } from "~/components/status/under-construction";

export default component$(() => {
  return <UnderConstruction title="Tool" />;
});

export const head: DocumentHead = { title: "Tool" };
