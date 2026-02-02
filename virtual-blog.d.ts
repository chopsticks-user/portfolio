declare module "virtual:blog-data" {
  const data: Record<
    string,
    { frontmatter: Record<string, unknown>; html: string }
  >;
  export default data;
}
