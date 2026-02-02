import { component$ } from "@builder.io/qwik";
import type { DocumentHead, RequestEvent } from "@builder.io/qwik-city";

// todo: remove this when / is implemented
export const onGet = async ({ redirect }: RequestEvent) => {
  throw redirect(302, "/blog");
};

export default component$(() => {
  return <></>;
});

export const head: DocumentHead = { title: "Home" };
