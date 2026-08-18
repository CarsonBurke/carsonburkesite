import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { HeaderBar } from "./components/HeaderBar.tsx";
import { ToastProvider } from "./components/Toast.tsx";

export function App() {
  const { pathname, hash } = useLocation();

  // Route changes start at the top; in-page anchors keep their target.
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <ToastProvider>
      <HeaderBar />
      <main id="content">
        <Outlet />
      </main>
      <Footer />
    </ToastProvider>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-3xl px-4 pb-16">
      <div className="separator mb-6 h-px" />
      <p className="caption dimmed">
        Built with Vite, React and Tailwind, then dressed in{" "}
        <a
          className="link-accent"
          href="https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/css-variables.html"
        >
          libadwaita&rsquo;s own colours
        </a>{" "}
        and the{" "}
        <a className="link-accent" href="https://developer.gnome.org/hig/">
          GNOME HIG
        </a>
        . Type is Adwaita Sans and Adwaita Mono, subset from the GNOME originals under the
        SIL Open Font License 1.1.{" "}
        <a className="link-accent" href="https://github.com/CarsonBurke/carsonburkesite">
          Source
        </a>
        .
      </p>
    </footer>
  );
}
