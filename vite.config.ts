import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { imageSize } from "image-size";
import { defineConfig, type Plugin } from "vite";
import { pages } from "./vite/pages.ts";

const MEDIA_DIR = "src/assets/media";
const MEDIA_SIZES_ID = "virtual:media-sizes";

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
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss(), mediaSizes(), pages()],
  build: {
    target: "es2022",
    assetsInlineLimit: 2048,
  },
});
