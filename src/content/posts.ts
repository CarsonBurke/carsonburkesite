import { byNewestFirst, parsePost, type Post } from "./frontmatter.ts";

const FILES = import.meta.glob<string>("./posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

export type { Post };

export const POSTS: Post[] = Object.entries(FILES)
  .map(([path, raw]) => parsePost(path.replace(/^\.\/posts\/|\.md$/g, ""), raw))
  .sort(byNewestFirst);

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
