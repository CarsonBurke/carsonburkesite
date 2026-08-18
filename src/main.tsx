import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { App } from "./App.tsx";
import "./index.css";
import { ErrorPage } from "./routes/ErrorPage.tsx";
import { Home } from "./routes/Home.tsx";
import { NotFound } from "./routes/NotFound.tsx";

const router = createBrowserRouter(
  [
    {
      element: <App />,
      errorElement: <ErrorPage />,
      // A direct load of a post URL starts on a lazy route; without a fallback
      // react-router renders nothing at all until the chunk arrives.
      hydrateFallbackElement: <div className="min-h-screen" />,
      children: [
        { index: true, element: <Home /> },
        {
          path: "writing/:slug",
          // Deliberately split: the markdown renderer is the heaviest dependency in the
          // bundle and only post pages need it, so a static import would make the front
          // page pay for it.
          lazy: async () => ({ Component: (await import("./routes/Post.tsx")).Post }),
        },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") },
);

const root = document.getElementById("root");
if (!root) throw new Error("#root is missing from index.html");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
