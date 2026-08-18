import type { Element } from "hast";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { media } from "../lib/media.ts";
import { ExternalIcon } from "./Icon.tsx";

const FIGURE_SHADOW = "0 0 0 1px var(--card-shade-color)";

/** ```pipeline: one stage per line, fields separated by `|`, drawn as chained chips. */
function Pipeline({ source }: { source: string }) {
  const stages = source
    .trim()
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()));

  return (
    <div className="my-8 flex flex-wrap items-stretch gap-2">
      {stages.map((parts, index) => (
        <div key={parts.join()} className="flex items-stretch gap-2">
          {index > 0 && (
            // The arrow leads its own chip so a wrapped row never starts orphaned.
            <span
              aria-hidden
              className="self-center text-lg"
              style={{ color: "var(--accent-color)" }}
            >
              &rarr;
            </span>
          )}
          <div
            className="card flex min-w-[8.5rem] flex-col justify-center px-3 py-2"
            style={{ boxShadow: FIGURE_SHADOW }}
          >
            <span className="caption-heading">{parts[0]}</span>
            {parts.slice(1).map((part) => (
              <span key={part} className="caption dimmed numeric">
                {part}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** ```youtube: `videoId :: caption` on one line, embedded at 16 by 9. */
function Youtube({ source }: { source: string }) {
  const [id = "", caption = ""] = source
    .trim()
    .split("::")
    .map((part) => part.trim());

  return (
    <figure className="my-8">
      <div
        className="card overflow-hidden"
        style={{ aspectRatio: "16 / 9", boxShadow: FIGURE_SHADOW }}
      >
        <iframe
          className="h-full w-full border-0"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={caption || "Video"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {caption && <figcaption className="caption dimmed mt-2">{caption}</figcaption>}
    </figure>
  );
}

/** ```gallery: `file.webp :: caption [:: alt]` per line, laid out as a figure row. */
function Gallery({ source }: { source: string }) {
  const items = source
    .trim()
    .split("\n")
    .map((line) => {
      const [file = "", caption = "", alt = ""] = line.split("::").map((part) => part.trim());
      return { file, caption, alt };
    });

  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {items.map(({ file, caption, alt }) => {
        const { src, width, height } = media(file);
        return (
          <figure key={file} className="m-0">
            <img
              src={src}
              width={width}
              height={height}
              // Empty alt when the caption already carries the description, so a
              // screen reader reads the sentence once instead of twice.
              alt={alt}
              loading="lazy"
              decoding="async"
              className="h-auto w-full rounded-[12px]"
              style={{ boxShadow: FIGURE_SHADOW }}
            />
            <figcaption className="caption dimmed mt-2">{caption}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}

/** Reads the `language-x` class off a fence's inner <code>. */
function fenceLanguage(node: Element | undefined) {
  const code = node?.children[0];
  if (!code || code.type !== "element") return undefined;
  const classes = code.properties.className;
  if (!Array.isArray(classes)) return undefined;
  return classes
    .find(
      (value): value is string =>
        typeof value === "string" && value.startsWith("language-"),
    )
    ?.slice("language-".length);
}

const loneImage = (node: Element | undefined) => {
  const only = node?.children.length === 1 ? node.children[0] : undefined;
  return only?.type === "element" && only.tagName === "img" ? only : undefined;
};

const components: Components = {
  h2: ({ children }) => <h2 className="title-2 mt-12 mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="title-4 mt-8 mb-2">{children}</h3>,
  p: ({ children, node }) => {
    // A standalone image becomes a figure; a <figure> may not sit inside a <p>.
    const image = loneImage(node);
    if (image) {
      const caption = image.properties.title;
      return (
        <figure className="my-8">
          {children}
          {typeof caption === "string" && (
            <figcaption className="caption dimmed mt-2">{caption}</figcaption>
          )}
        </figure>
      );
    }
    return <p className="my-4 leading-[1.65]">{children}</p>;
  },
  ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-[1.6]">{children}</li>,
  hr: () => <hr className="separator my-10 h-px border-0" />,
  blockquote: ({ children }) => (
    <blockquote
      className="my-6 pl-4"
      style={{ borderLeft: "3px solid var(--accent-bg-color)" }}
    >
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => {
    const external = href?.startsWith("http") ?? false;
    return (
      <a
        className="link-accent"
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
      >
        {children}
        {external && <ExternalIcon size={12} className="ml-[3px] inline align-baseline" />}
      </a>
    );
  },
  img: ({ src, alt }) => {
    const { src: resolved, width, height } = media(typeof src === "string" ? src : "");
    return (
      <img
        src={resolved}
        width={width}
        height={height}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-[12px]"
        style={{ boxShadow: FIGURE_SHADOW }}
      />
    );
  },
  table: ({ children }) => (
    <div className="card my-8 overflow-x-auto">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ borderBottom: "1px solid var(--card-shade-color)" }}>{children}</thead>
  ),
  tr: ({ children }) => (
    <tr className="[&:not(:first-child)]:border-t [&:not(:first-child)]:border-[var(--card-shade-color)]">
      {children}
    </tr>
  ),
  th: ({ children, style }) => (
    <th
      className="caption-heading px-4 py-3"
      style={{ textAlign: style?.textAlign ?? "left" }}
    >
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td
      className="numeric px-4 py-3 align-top"
      style={{ textAlign: style?.textAlign ?? "left" }}
    >
      {children}
    </td>
  ),
  code: ({ className, children }) => {
    const language = /language-(\w+)/.exec(className ?? "")?.[1];
    const source = String(children);

    if (language === "pipeline") return <Pipeline source={source} />;
    if (language === "gallery") return <Gallery source={source} />;
    if (language === "youtube") return <Youtube source={source} />;
    if (!language)
      return (
        <code
          className="rounded-[6px] px-[5px] py-[2px] font-mono text-[0.88em]"
          style={{ backgroundColor: "color-mix(in srgb, currentColor 8%, transparent)" }}
        >
          {children}
        </code>
      );

    // whitespace-pre because the wrapping <pre> is replaced by a styled div.
    return (
      <code className="block overflow-x-auto p-4 font-mono text-[0.85rem] leading-relaxed whitespace-pre">
        {children}
      </code>
    );
  },
  pre: ({ children, node }) => {
    const language = fenceLanguage(node);
    // Block-level custom fences render their own layout; a card would box them.
    if (language === "pipeline" || language === "gallery" || language === "youtube")
      return <>{children}</>;
    return <div className="card my-6 overflow-hidden">{children}</div>;
  },
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
