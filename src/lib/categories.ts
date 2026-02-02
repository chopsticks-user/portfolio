export const CATEGORIES = {
  Web: ["Qwik", "React", "Next.js", "GraphQL", ".NET", "Spring", "Performance"],
  Linux: ["Linux"],
  Compilers: ["Compilers"],
  Languages: ["C++", "TypeScript"],
  DevOps: ["DevOps"],
} as const;

export type Category = keyof typeof CATEGORIES | "All";
export const CATEGORY_LIST: Category[] = ["All", "Web", "Linux", "Compilers", "Languages", "DevOps"];

export function postMatchesCategory(
  tags: string[],
  category: Category,
): boolean {
  if (category === "All") return true;
  const categoryTags = CATEGORIES[category as keyof typeof CATEGORIES];
  return tags.some((tag) =>
    (categoryTags as readonly string[]).includes(tag),
  );
}
