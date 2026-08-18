/// <reference types="vite/client" />

declare module "virtual:media-sizes" {
  /** Filled by the `media-sizes` plugin in vite.config.ts, keyed by filename. */
  const sizes: Record<string, { width: number; height: number }>;
  export default sizes;
}
