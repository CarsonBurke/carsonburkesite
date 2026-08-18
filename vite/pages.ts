import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import type { Plugin } from "vite";
import { byNewestFirst, parsePost, type Post } from "../src/content/frontmatter.ts";

const POSTS_DIR = "src/content/posts";
const MEDIA_DIR = "src/assets/media";
const CARD = { width: 1200, height: 630 };
/** Bars behind a letterboxed card when the source image has no opaque corner. */
const CARD_FALLBACK_BG = { r: 0x1d, g: 0x1d, b: 0x20 };

const SITE = {
  name: "Carson Burke",
  description:
    "Machine learning, Rust, and Linux desktop software. Trading agents, a Screeps colony policy, CleanRL ablations, COSMIC applets.",
  // Pages serves this project under /<repo>/; override both for a custom domain.
  origin: process.env.SITE_ORIGIN ?? "https://carsonburke.github.io",
};

const MARKER = "<!--meta-->";

type PageMeta = {
  /** The card's headline. Unfurlers print og:site_name above it already. */
  title: string;
  /** The browser tab, where the site name has to be spelled out. */
  documentTitle: string;
  description: string;
  /** Route without the base or a leading slash: "" for home. */
  path: string;
  image: { url: string; alt: string; width: number; height: number; type: string };
  article?: Post;
};

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const tag = (attribute: "name" | "property", key: string, value: string) =>
  `    <meta ${attribute}="${key}" content="${escape(value)}" />`;

/**
 * Every head tag a link unfurler reads. Discord, Slack and Twitter all want an
 * absolute image URL with its dimensions declared, and Twitter needs the card
 * type spelled out or it shows nothing at all.
 */
function headTags(page: PageMeta, base: string): string {
  const url = `${SITE.origin}${base}${page.path}`;
  const large = page.image.width >= 600;
  const lines = [
    `    <title>${escape(page.documentTitle)}</title>`,
    tag("name", "description", page.description),
    `    <link rel="canonical" href="${escape(url)}" />`,
    tag("name", "author", SITE.name),
    // Matches the window background so mobile browser chrome stays neutral;
    // Discord paints its embed stripe with whichever one it reads.
    `    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fafafb" />`,
    `    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#222226" />`,
    tag("property", "og:site_name", SITE.name),
    tag("property", "og:type", page.article ? "article" : "website"),
    tag("property", "og:url", url),
    tag("property", "og:title", page.title),
    tag("property", "og:description", page.description),
    tag("property", "og:image", page.image.url),
    tag("property", "og:image:type", page.image.type),
    tag("property", "og:image:width", String(page.image.width)),
    tag("property", "og:image:height", String(page.image.height)),
    tag("property", "og:image:alt", page.image.alt),
    tag("name", "twitter:card", large ? "summary_large_image" : "summary"),
    tag("name", "twitter:title", page.title),
    tag("name", "twitter:description", page.description),
    tag("name", "twitter:image", page.image.url),
    tag("name", "twitter:image:alt", page.image.alt),
  ];

  if (page.article) {
    lines.push(tag("property", "article:published_time", page.article.date));
    for (const topic of page.article.tags) lines.push(tag("property", "article:tag", topic));
  }

  const structured = page.article
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: page.article.title,
        description: page.article.summary,
        datePublished: page.article.date,
        keywords: page.article.tags.join(", "),
        image: page.image.url,
        url,
        author: { "@type": "Person", name: SITE.name, url: `${SITE.origin}${base}` },
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        description: SITE.description,
        url,
      };
  lines.push(
    `    <script type="application/ld+json">${JSON.stringify(structured).replace(/</g, "\\u003c")}</script>`,
  );

  return lines.join("\n");
}

/** The card sits on the source image's own corner colour, so the bars vanish. */
async function cardBackground(source: string) {
  const { data } = await sharp(source, { animated: false })
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [r, g, b, alpha] = data;
  return alpha === 0 || r === undefined || g === undefined || b === undefined
    ? CARD_FALLBACK_BG
    : { r, g, b };
}

/**
 * Cards are the post's own screenshots rather than generated typography: no
 * build host needs the site's fonts, and the picture a reader sees in Discord
 * is one they will meet again in the post. Whichever image is closest in shape
 * to the card wins, and it is fitted whole so no chart loses an axis.
 */
async function buildCard(post: Post, outDir: string) {
  const referenced = [...new Set(post.body.match(/[\w-]+\.(?:webp|png|jpe?g)/g) ?? [])].filter(
    (file) => readdirSync(MEDIA_DIR).includes(file),
  );
  if (referenced.length === 0) return null;

  const target = CARD.width / CARD.height;
  const shapes = await Promise.all(
    referenced.map(async (file) => {
      const { width = 1, height = 1 } = await sharp(join(MEDIA_DIR, file), {
        animated: false,
      }).metadata();
      // Log distance, or a square would beat a wide chart at a wide card:
      // 1.0 sits 0.91 from 1.91 in plain arithmetic while 3.0 sits 1.09 away,
      // yet the wide image is the one that fills the frame.
      return { file, distance: Math.abs(Math.log(width / height / target)) };
    }),
  );
  const best = shapes.reduce((a, b) => (b.distance < a.distance ? b : a));
  const source = join(MEDIA_DIR, best.file);
  const background = await cardBackground(source);

  const file = `og/${post.slug}.png`;
  mkdirSync(join(outDir, "og"), { recursive: true });
  await sharp(source, { animated: false })
    .resize({ ...CARD, fit: "contain", background })
    .flatten({ background })
    .png({ compressionLevel: 9 })
    .toFile(join(outDir, file));
  return file;
}

function readPosts(): Post[] {
  return readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) =>
      parsePost(file.replace(/\.md$/, ""), readFileSync(join(POSTS_DIR, file), "utf8")),
    )
    .sort(byNewestFirst);
}

function homeMeta(base: string): PageMeta {
  return {
    title: SITE.name,
    documentTitle: SITE.name,
    description: SITE.description,
    path: "",
    image: {
      // The square avatar, so unfurlers show a portrait thumbnail instead of
      // upscaling a 512px icon into a wide card.
      url: `${SITE.origin}${base}icon-512.png`,
      alt: "Carson Burke's profile picture",
      width: 512,
      height: 512,
      type: "image/png",
    },
  };
}

/**
 * GitHub Pages has no SPA rewrite: an unknown path returns 404.html, and a 404
 * status is also why a shared post link used to unfurl as nothing. Writing a
 * real page per post gives crawlers a 200 with the post's own title, summary
 * and card, and the 404 copy keeps deep links working for everything else.
 */
export function pages(): Plugin {
  let base = "/";

  return {
    name: "pages",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        // Dev serves the home meta; the build replaces this per page.
        return html.replace(MARKER, headTags(homeMeta(base), base));
      },
    },
    async writeBundle(options, bundle) {
      const outDir = options.dir;
      const index = bundle["index.html"];
      if (!outDir || !index || index.type !== "asset") return;
      const template = String(index.source);

      // transformIndexHtml already put the home meta in; both site-level pages
      // reuse it, and 404.html is the fallback for unknown deep links.
      writeFileSync(join(outDir, "index.html"), template);
      writeFileSync(join(outDir, "404.html"), template);

      const home = headTags(homeMeta(base), base);
      for (const post of readPosts()) {
        const card = await buildCard(post, outDir);
        const meta = headTags(
          {
            title: post.title,
            documentTitle: `${post.title}, ${SITE.name}`,
            description: post.summary,
            path: `writing/${post.slug}/`,
            image: card
              ? { url: `${SITE.origin}${base}${card}`, alt: post.title, ...CARD, type: "image/png" }
              : homeMeta(base).image,
            article: post,
          },
          base,
        );
        const page = template.replace(home, meta);
        // Pages resolves an extensionless request from <name>.html and a
        // directory request from its index.html, and a shared link may carry
        // either shape, so both exist with the same bytes.
        mkdirSync(join(outDir, "writing", post.slug), { recursive: true });
        writeFileSync(join(outDir, "writing", `${post.slug}.html`), page);
        writeFileSync(join(outDir, "writing", post.slug, "index.html"), page);
      }
    },
  };
}
