import type { Element } from "hast";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalIcon } from "./Icon.tsx";

/** Media referenced from markdown by bare filename, resolved to hashed build URLs. */
const MEDIA = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../assets/media/*", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ).map(([path, url]) => [path.split("/").pop() as string, url]),
);

/** ```pipeline — one stage per line, drawn as chained Adwaita chips. */
function Pipeline({ source }: { source: string }) {
  const stages = source
    .trim()
    .split("\n")
    .map((line) => line.split("·").map((part) => part.trim()));

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
            style={{ boxShadow: "0 0 0 1px var(--card-shade-color)" }}
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

/** ```gallery — `file.webp :: caption` per line, laid out as a figure row. */
function Gallery({ source }: { source: string }) {
  const items = source
    .trim()
    .split("\n")
    .map((line) => {
      const [file = "", caption = ""] = line.split("::").map((part) => part.trim());
      return { file, caption };
    });

  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {items.map(({ file, caption }) => (
        <figure key={file} className="m-0">
          <img
            src={MEDIA[file] ?? file}
            alt={caption}
            loading="lazy"
            decoding="async"
            className="w-full rounded-[12px]"
            style={{ boxShadow: "0 0 0 1px var(--card-shade-color)" }}
          />
          <figcaption className="caption dimmed mt-2">{caption}</figcaption>
        </figure>
      ))}
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

const components: Components = {
  h2: ({ children }) => <h2 className="title-2 mt-12 mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="title-4 mt-8 mb-2">{children}</h3>,
  p: ({ children, node }) => {
    // A lone image becomes a <figure>, which may not sit inside a <p>.
    const only = node?.children.length === 1 ? node.children[0] : undefined;
    if (only?.type === "element" && only.tagName === "img") return <>{children}</>;
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
  img: ({ src, alt, title }) => {
    const file = typeof src === "string" ? src : "";
    return (
      <figure className="my-8">
        <img
          src={MEDIA[file] ?? file}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          className="w-full rounded-[12px]"
          style={{ boxShadow: "0 0 0 1px var(--card-shade-color)" }}
        />
        {title && <figcaption className="caption dimmed mt-2">{title}</figcaption>}
      </figure>
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
    if (!language)
      return (
        <code
          className="rounded-[6px] px-[5px] py-[2px] font-mono text-[0.88em]"
          style={{ backgroundColor: "color-mix(in srgb, currentColor 8%, transparent)" }}
        >
          {children}
        </code>
      );

    return (
      <code className="block overflow-x-auto p-4 font-mono text-[0.85rem] leading-relaxed">
        {children}
      </code>
    );
  },
  pre: ({ children, node }) => {
    // Block-level custom fences render their own layout; a card wrapper would box them.
    if (fenceLanguage(node) === "pipeline" || fenceLanguage(node) === "gallery")
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
