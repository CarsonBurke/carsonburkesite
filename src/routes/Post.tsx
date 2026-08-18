import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { ExternalIcon, PlayIcon } from "../components/Icon.tsx";
import { Markdown } from "../components/Markdown.tsx";
import { POSTS, formatDate, type Post as PostData } from "../content/posts.ts";
import { NotFound } from "./NotFound.tsx";

export function Post() {
  const { slug } = useParams();
  const post = POSTS.find((candidate) => candidate.slug === slug);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title}, Carson Burke`;
    return () => {
      document.title = "Carson Burke";
    };
  }, [post]);

  if (!post) return <NotFound />;

  return (
    <article className="mx-auto max-w-[46rem] px-4 pt-12 pb-16">
      <header>
        <p className="caption-heading mb-2" style={{ color: "var(--accent-color)" }}>
          Writing
        </p>
        <h1 className="title-1 text-[2.1rem] leading-[1.15] sm:text-[2.6rem]">
          {post.title}
        </h1>
        <p className="caption dimmed numeric mt-3">
          {formatDate(post.date)}, {post.minutes} min read
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="pill-tag">
              {tag}
            </span>
          ))}
        </div>
        <SourceLinks post={post} />
      </header>

      <div className="separator mt-8 mb-2 h-px" />

      <Markdown>{post.body}</Markdown>

      <div className="separator mt-12 mb-6 h-px" />

      <SourceLinks post={post} />

      <div className="mt-6">
        <Link className="adw-button flat no-underline" to="/#writing">
          Back to writing
        </Link>
      </div>
    </article>
  );
}

/** The video and the code are the two things a reader asks for, so both ends of the post carry them. */
function SourceLinks({ post }: { post: PostData }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {post.video && (
        <a className="adw-button suggested no-underline" href={post.video}>
          <PlayIcon size={13} />
          Watch the run
        </a>
      )}
      {post.code && (
        <a className="adw-button no-underline" href={post.code}>
          Code
          <ExternalIcon size={13} className="dimmed" />
        </a>
      )}
      {post.discussion && (
        <a className="adw-button no-underline" href={post.discussion}>
          Discussion on Reddit
          <ExternalIcon size={13} className="dimmed" />
        </a>
      )}
    </div>
  );
}
