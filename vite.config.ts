import { writeFileSync } from "node:fs";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * GitHub Pages serves no SPA fallback: an unknown path returns 404.html.
 * Shipping a byte-identical copy of index.html there lets deep links such as
 * /blog/screeps-rl resolve on a hard load instead of dying on refresh.
 */
function githubPagesSpaFallback(): Plugin {
  let outDir = "dist";
  return {
    name: "gh-pages-spa-fallback",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    writeBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (index && index.type === "asset") {
        writeFileSync(join(outDir, "404.html"), index.source);
      }
    },
  };
}

export default defineConfig({
  // Project pages live under /<repo>/. Override with BASE_PATH=/ for a custom domain.
  base: process.env.BASE_PATH ?? "/carsonburkesite/",
  plugins: [react(), tailwindcss(), githubPagesSpaFallback()],
  build: {
    target: "es2022",
    assetsInlineLimit: 2048,
  },
});
