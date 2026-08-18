import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { imageSize } from "image-size";
import { defineConfig, type Plugin } from "vite";

const MEDIA_DIR = "src/assets/media";
const MEDIA_SIZES_ID = "virtual:media-sizes";

/**
 * GitHub Pages serves no SPA fallback: an unknown path returns 404.html.
 * Shipping a byte-identical copy of index.html there lets deep links such as
 * /writing/screeps-reinforcement-learning resolve on a hard load.
 */
function githubPagesSpaFallback(): Plugin {
  return {
    name: "gh-pages-spa-fallback",
    apply: "build",
    writeBundle(options, bundle) {
      const index = bundle["index.html"];
      if (options.dir && index && index.type === "asset") {
        writeFileSync(join(options.dir, "404.html"), index.source);
      }
    },
  };
}

/**
 * Intrinsic dimensions for every bundled image, read from the files at build
 * time. Without width/height the lazily-loaded screenshots occupy no space
 * until they decode and then shove the following text down the page.
 */
function mediaSizes(): Plugin {
  return {
    name: "media-sizes",
    resolveId(id) {
      return id === MEDIA_SIZES_ID ? `\0${MEDIA_SIZES_ID}` : null;
    },
    load(id) {
      if (id !== `\0${MEDIA_SIZES_ID}`) return null;
      const sizes = Object.fromEntries(
        readdirSync(MEDIA_DIR).map((file) => {
          const { width, height } = imageSize(readFileSync(join(MEDIA_DIR, file)));
          return [file, { width, height }];
        }),
      );
      return `export default ${JSON.stringify(sizes)};`;
    },
  };
}

export default defineConfig({
  // Project pages live under /<repo>/. Override with BASE_PATH=/ for a custom domain.
  base: process.env.BASE_PATH ?? "/carsonburkesite/",
  plugins: [react(), tailwindcss(), mediaSizes(), githubPagesSpaFallback()],
  build: {
    target: "es2022",
    assetsInlineLimit: 2048,
  },
});
