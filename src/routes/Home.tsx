import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalIcon,
  GithubIcon,
  MailIcon,
} from "../components/Icon.tsx";
import { useToast } from "../components/Toast.tsx";
import { POSTS, formatDate } from "../content/posts.ts";
import { PROJECTS, SMALLER_THINGS, type Project } from "../data/projects.ts";

const EMAIL = "carsonburke22@gmail.com";

const FACTS: { label: string; value: string }[] = [
  { label: "Working on", value: "Reinforcement learning that fits on one desktop GPU" },
  { label: "Languages", value: "Rust, TypeScript, Python" },
  { label: "Day job", value: "Redact — desktop client and deletion engines" },
  { label: "Hardware", value: "One RTX 5090, with a queue so runs stop fighting" },
  { label: "Desktop", value: "CachyOS, niri, and COSMIC applets on the side" },
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
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-3xl scroll-mt-[4.5rem] px-4 pb-14">
      <div className="mb-3 px-1">
        <h2 className="title-3">{title}</h2>
        {description && <p className="caption dimmed mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Hero() {
  const toast = useToast();

  return (
    <section className="mx-auto max-w-3xl px-4 pt-14 pb-12">
      <p className="caption-heading mb-2" style={{ color: "var(--accent-color)" }}>
        Reinforcement learning · Rust · Linux desktop
      </p>
      <h1 className="title-1 text-[2.4rem] leading-[1.1] sm:text-[3rem]">Carson Burke</h1>
      <p className="mt-4 max-w-[38rem] text-[1.15rem] leading-[1.55]">
        I train small models on one GPU and write the tooling that makes the runs
        trustworthy. Trading agents in Rust, a neural policy that plays a whole Screeps
        colony, ablation ledgers with the failed ideas left in, and desktop bits for Linux.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <a
          className="adw-button pill suggested no-underline"
          href="https://github.com/CarsonBurke"
        >
          <GithubIcon />
          GitHub
        </a>
        <a className="adw-button pill no-underline" href={`mailto:${EMAIL}`}>
          <MailIcon />
          {EMAIL}
        </a>
        <button
          type="button"
          className="adw-button pill"
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
          Copy
        </button>
      </div>

      <div className="boxed-list mt-10">
        {FACTS.map(({ label, value }) => (
          <div key={label} className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-3">
            <span className="heading min-w-[7.5rem]">{label}</span>
            <span className="dimmed flex-1">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Writing() {
  return (
    <Section
      id="writing"
      title="Writing"
      description="Long enough to include the numbers that made me change my mind."
    >
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
                {formatDate(post.date)} · {post.minutes} min read
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
  return (
    <Section
      id="projects"
      title="Projects"
      description="What I actually spend evenings on, with the measurements attached."
    >
      <div className="space-y-4">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </Section>
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

        <p className="mt-2 leading-[1.6]">{project.summary}</p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {project.stats.map(({ label, value }) => (
            <div key={label}>
              <p className="numeric text-[1.12rem] font-bold">{value}</p>
              <p className="caption dimmed">{label}</p>
            </div>
          ))}
        </div>

        {/* The caveat belongs beside the numbers it qualifies, not behind a disclosure. */}
        {project.caveat && <p className="caption dimmed mt-3">{project.caveat}</p>}

        {project.media && (
          <div className="mt-5 grid gap-4">
            {project.media.map(({ src, width, height, alt, caption }) => (
              <figure key={src} className="m-0">
                {/* Terminal captures are far wider than the column; a click gets the pixels back. */}
                <a href={src} target="_blank" rel="noreferrer" className="block">
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
          {project.links.map(({ label, href, external }) =>
            external ? (
              <a key={href} className="adw-button no-underline" href={href}>
                {label}
                <ExternalIcon size={13} className="dimmed" />
              </a>
            ) : (
              <Link key={href} className="adw-button suggested no-underline" to={href}>
                {label}
                <ChevronRightIcon size={13} />
              </Link>
            ),
          )}
          <button
            type="button"
            className="adw-button flat ml-auto"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Fewer details" : "How it works"}
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
          <ul className="space-y-3">
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

function Smaller() {
  return (
    <Section
      id="smaller"
      title="Smaller things"
      description="Tools that exist because the bigger projects needed them."
    >
      <div className="boxed-list">
        {SMALLER_THINGS.map(({ name, note, href }) => (
          <a
            key={href}
            href={href}
            className="row-activatable flex items-center gap-4 px-4 py-3 no-underline"
          >
            <div className="min-w-0 flex-1">
              <h3 className="heading">{name}</h3>
              <p className="dimmed mt-1 text-[0.95rem] leading-[1.5]">{note}</p>
            </div>
            <ExternalIcon size={14} className="dimmed shrink-0" />
          </a>
        ))}
      </div>
    </Section>
  );
}

function About() {
  return (
    <Section id="about" title="About">
      <div className="card space-y-4 p-5 leading-[1.65]">
        <p>
          I&rsquo;m Carson. Most of my work is reinforcement learning under a hard
          constraint: one desktop GPU, so a bad idea has to be cheap to kill. That turns out
          to be the useful part. It forces short falsifiable runs, matched comparisons, and
          writing the kill bar down before the run starts instead of after the graph looks
          nice.
        </p>
        <p>
          The rest is systems work in Rust and TypeScript — trading infrastructure, a job
          queue for my own experiments, terminal UIs, and small patches to the Linux desktop
          I use every day.
        </p>
        <p>
          If you want to talk about any of it,{" "}
          <a className="link-accent" href={`mailto:${EMAIL}`}>
            email me
          </a>{" "}
          or open an issue somewhere I&rsquo;ll see it.
        </p>
      </div>
    </Section>
  );
}
