import { useCallback, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link, useHref } from "react-router";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalIcon,
  GithubIcon,
  GridIcon,
  ListIcon,
  MailIcon,
} from "../components/Icon.tsx";
import { useToast } from "../components/Toast.tsx";
import { POSTS, formatDate } from "../content/posts.ts";
import { PROJECTS, SMALLER_THINGS, type Project } from "../data/projects.ts";
import { NEW_TAB, REPOS } from "../lib/links.ts";

const EMAIL = "carsonburke22@gmail.com";

const FACTS: { label: string; value: string }[] = [
  { label: "Focus", value: "Machine learning, mostly reinforcement learning" },
  { label: "Languages", value: "Rust, TypeScript, Python" },
  { label: "Work", value: "Software development" },
  { label: "Training hardware", value: "One RTX 5090" },
  { label: "Desktop", value: "Linux, CachyOS with niri" },
];

export function Home() {
  return (
    <>
      <Hero />
      <Writing />
      <Projects />
      <Smaller />
      <About />
    </>
  );
}

function Section({
  id,
  title,
  trailing,
  children,
}: {
  id: string;
  title: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-5xl scroll-mt-[4.5rem] px-4 pb-14">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 className="title-3">{title}</h2>
        {trailing}
      </div>
      {children}
    </section>
  );
}

const VIEWS = ["list", "gallery"] as const;
type ViewMode = (typeof VIEWS)[number];

const VIEW_STEP: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

function useRadioKeys<T extends string>(ids: readonly T[], select: (id: T) => void) {
  return useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const step = VIEW_STEP[event.key];
      const index = ids.findIndex(
        (id) => id === (event.target as HTMLElement).dataset.radioId,
      );
      if (index === -1) return;

      let next = index;
      if (step !== undefined) next = (index + step + ids.length) % ids.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = ids.length - 1;
      else return;

      event.preventDefault();
      const id = ids[next];
      if (!id) return;
      select(id);
      event.currentTarget.querySelector<HTMLElement>(`[data-radio-id="${id}"]`)?.focus();
    },
    [ids, select],
  );
}

function ViewSwitcher({
  value,
  onChange,
  label,
}: {
  value: ViewMode;
  onChange: (view: ViewMode) => void;
  label: string;
}) {
  const onKeyDown = useRadioKeys(VIEWS, onChange);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="adw-toggle-group shrink-0"
    >
      {VIEWS.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          data-radio-id={id}
          aria-label={id === "list" ? "List" : "Gallery"}
          aria-checked={value === id}
          tabIndex={value === id ? 0 : -1}
          className="adw-toggle"
          onClick={() => onChange(id)}
        >
          {id === "list" ? <ListIcon /> : <GridIcon />}
        </button>
      ))}
    </div>
  );
}

/**
 * A reference in the bio: the phrase stays plain body text and only the icon
 * carries the link, so the paragraph is not several coloured phrases deep. The
 * tail word rides along in the same nowrap span, or a line break can leave the
 * icon stranded at the start of the next line. Every reference behaves the same
 * way the icon claims, including the one pointing at this site's own writing.
 */
function Ref({ tail, href, label }: { tail: string; href: string; label: string }) {
  return (
    <span className="whitespace-nowrap">
      {tail}
      <a
        className="link-accent pl-[3px] align-baseline"
        href={href}
        aria-label={`Open ${label}`}
        title={label}
        {...NEW_TAB}
      >
        <ExternalIcon size={12} className="inline align-baseline" />
      </a>
    </span>
  );
}

function Hero() {
  const toast = useToast();
  // A raw href needs the deploy's base in front of it; the router knows it.
  const postHref = useHref("/writing/screeps-reinforcement-learning");

  return (
    <section className="mx-auto max-w-5xl px-4 pt-14 pb-12">
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <h1 className="title-1 text-[2.4rem] leading-[1.1] sm:text-[3rem]">Carson Burke</h1>
          <p className="mt-4 text-[1.15rem] leading-[1.55]">
            I'm a self-taught machine learning programmer and software developer. My notable
            work includes trading agents in{" "}
            <Ref tail="Rust" href={REPOS.tradingBot} label="trading_bot_0 on GitHub" />, a ViT
            and entity transformer that plays a whole Screeps{" "}
            <Ref tail="colony" href={postHref} label="Reinforcement learning in Screeps" />
            , and a fork of{" "}
            <Ref tail="CleanRL" href={REPOS.cleanrl} label="CarsonBurke/cleanrl on GitHub" />{" "}
            where I do many ablations, as well as private solutions for Kaggle{" "}
            <Ref tail="challenges" href={REPOS.kaggle} label="Kaggle competitions" />.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <a
              className="adw-button pill suggested no-underline"
              href={REPOS.github}
              {...NEW_TAB}
            >
              <GithubIcon />
              GitHub
            </a>

            {/* AdwSplitButton: the address opens a mail client, the second half copies it. */}
            <div className="adw-linked max-w-full">
              <a className="adw-button pill min-w-0 no-underline" href={`mailto:${EMAIL}`}>
                <MailIcon className="shrink-0" />
                {/* Below 380px the address alone is wider than the viewport. */}
                <span className="truncate min-[380px]:hidden">Email</span>
                <span className="hidden truncate min-[380px]:inline">{EMAIL}</span>
              </a>
              <button
                type="button"
                className="adw-button pill !px-4"
                aria-label="Copy email address"
                onClick={() => {
                  // navigator.clipboard is undefined on insecure origins, and the
                  // property access itself would throw before any promise exists.
                  if (!navigator.clipboard) {
                    toast("Could not reach the clipboard");
                    return;
                  }
                  void navigator.clipboard
                    .writeText(EMAIL)
                    .then(() => toast("Email address copied"))
                    .catch(() => toast("Could not reach the clipboard"));
                }}
              >
                <CopyIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="boxed-list self-start">
          {FACTS.map(({ label, value }) => (
            <div key={label} className="px-4 py-3">
              <p className="caption dimmed">{label}</p>
              <p className="mt-0.5 leading-[1.45]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Writing() {
  return (
    <Section id="writing" title="Writing">
      <div className="boxed-list">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            to={`/writing/${post.slug}`}
            className="row-activatable flex items-center gap-4 px-4 py-4 no-underline"
          >
            <div className="min-w-0 flex-1">
              <h3 className="heading">{post.title}</h3>
              <p className="dimmed mt-1 text-[0.95rem] leading-[1.5]">{post.summary}</p>
              <p className="caption dimmed numeric mt-2">
                {formatDate(post.date)} • {post.minutes} min read • handwritten
              </p>
            </div>
            <ChevronRightIcon className="dimmed shrink-0" />
          </Link>
        ))}
      </div>
    </Section>
  );
}

function Projects() {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <Section
      id="projects"
      title="Projects"
      trailing={<ViewSwitcher value={view} onChange={setView} label="Projects view" />}
    >
      {view === "list" ? (
        <div className="space-y-4">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {PROJECTS.map((project) => (
            <ProjectTile key={project.id} project={project} />
          ))}
        </div>
      )}
    </Section>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return project.links.map(({ label, href, external }) =>
    external ? (
      <a key={href} className="adw-button no-underline" href={href} {...NEW_TAB}>
        {label}
        <ExternalIcon size={13} className="dimmed" />
      </a>
    ) : (
      <Link key={href} className="adw-button suggested no-underline" to={href}>
        {label}
        <ChevronRightIcon size={13} />
      </Link>
    ),
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="card overflow-hidden">
      <div className="p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="title-4">{project.name}</h3>
          <span className="caption dimmed">{project.kicker}</span>
        </div>

        <p className="mt-2 max-w-[52rem] leading-[1.6]">{project.summary}</p>

        {project.stats && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            {project.stats.map(({ label, value }) => (
              <div key={label}>
                <p className="numeric text-[1.12rem] font-bold">{value}</p>
                <p className="caption dimmed">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* The caveat sits beside the numbers it qualifies, not behind a disclosure. */}
        {project.caveat && <p className="caption dimmed mt-3">{project.caveat}</p>}

        {project.media && (
          <div
            className={
              project.media.length > 1 ? "mt-5 grid gap-4 sm:grid-cols-2" : "mt-5 grid gap-4"
            }
          >
            {project.media.map(({ src, width, height, alt, caption }) => (
              <figure key={src} className="m-0">
                {/* Terminal captures are far wider than the column, so a click gets the pixels back. */}
                <a href={src} className="block" {...NEW_TAB}>
                  <img
                    src={src}
                    width={width}
                    height={height}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full cursor-zoom-in rounded-[9px]"
                    style={{ boxShadow: "0 0 0 1px var(--card-shade-color)" }}
                  />
                </a>
                <figcaption className="caption dimmed mt-2">{caption}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <ProjectLinks project={project} />
          <button
            type="button"
            className="adw-button flat ml-auto"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Fewer details" : "More detail"}
            <ChevronDownIcon
              size={13}
              className={open ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="px-5 pt-4 pb-5"
          style={{
            borderTop: "1px solid var(--card-shade-color)",
            backgroundColor: "color-mix(in srgb, currentColor 3%, transparent)",
          }}
        >
          <p className="caption dimmed mb-3">ai summary</p>
          <ul className="grid gap-3 lg:grid-cols-2 lg:gap-x-8">
            {project.details.map((detail) => (
              <li key={detail} className="flex gap-3 leading-[1.6]">
                <span aria-hidden style={{ color: "var(--accent-color)" }}>
                  &bull;
                </span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="pill-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function ProjectTile({ project }: { project: Project }) {
  const image = project.media?.[0];

  return (
    <article className="card overflow-hidden">
      {image && (
        <a href={image.src} className="block" {...NEW_TAB}>
          <img
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="aspect-[16/9] w-full object-cover object-top"
          />
        </a>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="title-4">{project.name}</h3>
          <span className="caption dimmed">{project.kicker}</span>
        </div>
        <p className="mt-2 line-clamp-3 leading-[1.5]">{project.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

function Smaller() {
  const [view, setView] = useState<ViewMode>("gallery");

  return (
    <Section
      id="smaller"
      title="Smaller things"
      trailing={
        <ViewSwitcher value={view} onChange={setView} label="Smaller things view" />
      }
    >
      {view === "gallery" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SMALLER_THINGS.map(({ name, note, href }) => (
            <a
              key={href}
              href={href}
              className="card row-activatable flex flex-col gap-1 p-4 no-underline"
              {...NEW_TAB}
            >
              <span className="heading flex items-center gap-2">
                {name}
                <ExternalIcon size={12} className="dimmed" />
              </span>
              <span className="dimmed text-[0.95rem] leading-[1.5]">{note}</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="boxed-list">
          {SMALLER_THINGS.map(({ name, note, href }) => (
            <a
              key={href}
              href={href}
              className="row-activatable flex items-center gap-4 px-4 py-4 no-underline"
              {...NEW_TAB}
            >
              <div className="min-w-0 flex-1">
                <span className="heading">{name}</span>
                <p className="dimmed mt-1 text-[0.95rem] leading-[1.5]">{note}</p>
              </div>
              <ExternalIcon size={12} className="dimmed shrink-0" />
            </a>
          ))}
        </div>
      )}
    </Section>
  );
}

function About() {
  return (
    <Section id="about" title="About">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="card space-y-4 p-5 leading-[1.65]">
          <p>
            I'm a self-taught machine learning enthusiast who trains models on my own
            hardware. I work on pretraining, reinforcement learning, and tooling.
          </p>
          <p>
            If you want to talk about any of it, send me an email or open an issue on one of
            the repositories.
          </p>
        </div>

        <div className="boxed-list self-start">
          <a
            className="row-activatable flex items-center gap-3 px-4 py-3 no-underline"
            href={REPOS.github}
            {...NEW_TAB}
          >
            <GithubIcon size={15} className="dimmed" />
            <span className="flex-1">GitHub</span>
            <ExternalIcon size={12} className="dimmed" />
          </a>
          <a
            className="row-activatable flex items-center gap-3 px-4 py-3 no-underline"
            href={`mailto:${EMAIL}`}
          >
            <MailIcon size={15} className="dimmed" />
            <span className="min-w-0 flex-1 truncate">{EMAIL}</span>
          </a>
          <a
            className="row-activatable flex items-center gap-3 px-4 py-3 no-underline"
            href={REPOS.site}
            {...NEW_TAB}
          >
            <span className="flex-1">Source for this site</span>
            <ExternalIcon size={12} className="dimmed" />
          </a>
        </div>
      </div>
    </Section>
  );
}
