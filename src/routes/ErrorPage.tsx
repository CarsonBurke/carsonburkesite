import { isRouteErrorResponse, useRouteError } from "react-router";

/**
 * A failed chunk load is the normal outcome of navigating after a redeploy. Without
 * this page, react-router would show its developer stack trace to a visitor.
 */
export function ErrorPage() {
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="title-2">Something broke</h1>
      <p className="dimmed mt-2 leading-[1.6]">
        Most likely the site was redeployed while this page was open, and a file it wanted is
        no longer there. Reloading should fix it.
      </p>
      <button
        type="button"
        className="adw-button pill suggested mt-6"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
      <p className="caption dimmed mt-6 font-mono">{detail}</p>
    </div>
  );
}
