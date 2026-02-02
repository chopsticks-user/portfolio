const TAG_COLORS: Record<string, string> = {
  Qwik: "var(--tag-color-qwik)",
  React: "var(--tag-color-react)",
  "Next.js": "var(--tag-color-nextjs)",
  GraphQL: "var(--tag-color-graphql)",
  ".NET": "var(--tag-color-dotnet)",
  Spring: "var(--tag-color-spring)",
  Performance: "var(--tag-color-performance)",
  Linux: "var(--tag-color-linux)",
  System: "var(--tag-color-systems)",
  Compilers: "var(--tag-color-compilers)",
};

export function getTagColor(tag: string): string {
  return TAG_COLORS[tag] ?? "var(--color-text-secondary)";
}
