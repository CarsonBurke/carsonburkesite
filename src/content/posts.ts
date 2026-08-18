const FILES = import.meta.glob<string>("./posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  code?: string;
  discussion?: string;
  body: string;
  minutes: number;
};

/** Frontmatter here is flat `key: value` lines, so a YAML parser would be dead weight. */
function parse(slug: string, raw: string): Post {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) throw new Error(`${slug}: missing frontmatter`);
  const [, header = "", body = ""] = match;

  const fields: Record<string, string> = {};
  for (const line of header.split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  const required = (key: string) => {
    const value = fields[key];
    if (!value) throw new Error(`${slug}: frontmatter is missing ${key}`);
    return value;
  };

  return {
    slug,
    title: required("title"),
    date: required("date"),
    summary: required("summary"),
    tags: (fields.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    code: fields.code,
    discussion: fields.discussion,
    body,
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
  };
}

export const POSTS: Post[] = Object.entries(FILES)
  .map(([path, raw]) => parse(path.replace(/^\.\/posts\/|\.md$/g, ""), raw))
  .sort((a, b) => b.date.localeCompare(a.date));

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
