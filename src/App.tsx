import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { HeaderBar } from "./components/HeaderBar.tsx";
import { ToastProvider } from "./components/Toast.tsx";

export function App() {
  const { pathname, hash } = useLocation();
  const main = useRef<HTMLElement>(null);

  // react-router does not scroll on navigation, so do it here: a fragment goes
  // to its section (sections carry scroll-mt), anything else to the top.
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  // A client-side route change is silent otherwise: nothing tells a screen
  // reader the page it is reading has been replaced.
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <ToastProvider>
      <HeaderBar />
      <main id="content" ref={main} tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
    </ToastProvider>
  );
}
