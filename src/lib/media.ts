import SIZES from "virtual:media-sizes";

const URLS = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../assets/media/*", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ).map(([path, url]) => [path.split("/").pop() as string, url]),
);

export type Media = {
  src: string;
  width: number;
  height: number;
};

/**
 * Resolves a bundled image by bare filename, with the intrinsic dimensions the
 * build read off the file. Unknown names throw here rather than shipping as a
 * broken lazy image nobody notices.
 */
export function media(file: string): Media {
  const src = URLS[file];
  const size = SIZES[file];
  if (!src || !size) throw new Error(`No media named ${file} in src/assets/media`);
  return { src, ...size };
}
