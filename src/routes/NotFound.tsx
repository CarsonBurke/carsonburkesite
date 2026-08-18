import { Link } from "react-router";

/** AdwStatusPage: centred icon, title, description, one action. */
export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="numeric title-1 dimmed text-[4rem]">404</p>
      <h1 className="title-2 mt-2">Nothing here</h1>
      <p className="dimmed mt-2 leading-[1.6]">
        This page moved, or it never existed. The writing and projects are on the front page.
      </p>
      <Link className="adw-button pill suggested mt-6 no-underline" to="/">
        Go home
      </Link>
    </div>
  );
}
