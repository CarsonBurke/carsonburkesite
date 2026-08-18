# carsonburkesite

My personal site: [carsonburke.github.io/carsonburkesite](https://carsonburke.github.io/carsonburkesite/).

Vite + React + Tailwind, wearing the GNOME design language. Colours, radii, metrics and the
type scale are transcribed from libadwaita's own stylesheet rather than approximated, so the
mapping stays checkable:

| What | Source |
|---|---|
| Colour tokens, light and dark | [libadwaita CSS variables](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/css-variables.html) |
| Type scale (181/136/136/118/100/82%) | [`widgets/_labels.scss`](https://gitlab.gnome.org/GNOME/libadwaita/-/raw/main/src/stylesheet/widgets/_labels.scss) |
| 9px controls, 12px cards, 15px dialogs | [`_common.scss`](https://gitlab.gnome.org/GNOME/libadwaita/-/raw/main/src/stylesheet/_common.scss) |
| Boxed lists, cards, header bars | [`widgets/`](https://gitlab.gnome.org/GNOME/libadwaita/-/tree/main/src/stylesheet/widgets) |
| Layout and behaviour | [GNOME HIG](https://developer.gnome.org/hig/) |

Theme follows the system preference by default. The header's palette button opens a
stand-in for GNOME Settings › Appearance: light, dark or system, plus the nine system
accent colours. An explicit choice persists in `localStorage`; `system` keeps tracking the
OS.

## Development

```bash
bun install
bun run dev        # http://localhost:5173/carsonburkesite/
bun run typecheck
bun run build      # tsc --noEmit, then vite build into dist/
bun run preview
```

`BASE_PATH=/ bun run build` builds for a root-hosted domain instead of the project-pages
subpath.

## Writing a post

Drop a markdown file in `src/content/posts/`. The filename is the slug, frontmatter is flat
`key: value` lines:

```markdown
---
title: Reinforcement learning in Screeps
date: 2026-08-17
summary: One sentence for the index row.
tags: RL, PPO
code: https://github.com/...
discussion: https://reddit.com/...
---
```

Beyond GitHub-flavoured markdown there are two fences:

- ` ```gallery ` — one `file.webp :: caption` per line, laid out as a figure row. Images are
  referenced by bare filename and resolved from `src/assets/media/`.
- ` ```pipeline ` — one stage per line, `·`-separated fields, drawn as chained chips.

Reading time is computed from the body; images use `loading="lazy"`.

## Deployment

Pushes to `main` build and publish to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Pages has no SPA fallback,
so the build writes `dist/404.html` as a copy of `index.html` — without it, a hard load of
`/writing/<slug>` would 404.

## Licences

Site code is MIT (`LICENSE`). Adwaita Sans and Adwaita Mono in `src/assets/fonts/` are
subset from [adwaita-fonts](https://gitlab.gnome.org/GNOME/adwaita-fonts) and remain under
the SIL Open Font License 1.1 (`src/assets/fonts/LICENSE-adwaita-fonts.txt`). Screenshots
and recordings belong to the projects they came from.
