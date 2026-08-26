# carsonburkesite

My personal site, at [carsonburke.com](https://carsonburke.com/).

It is built with Vite, React and Tailwind, and it uses the GNOME design language. The
colours, radii, metrics and type scale are transcribed from libadwaita's own stylesheet
rather than approximated, so each value can be checked against its source.

| What | Source |
|---|---|
| Colour tokens, light and dark | [libadwaita CSS variables](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/css-variables.html) |
| Type scale (181/136/136/118/100/82%) | [`widgets/_labels.scss`](https://gitlab.gnome.org/GNOME/libadwaita/-/raw/main/src/stylesheet/widgets/_labels.scss) |
| 9px controls, 12px cards, 15px dialogs | [`_common.scss`](https://gitlab.gnome.org/GNOME/libadwaita/-/raw/main/src/stylesheet/_common.scss) |
| Boxed lists, cards, header bars | [`widgets/`](https://gitlab.gnome.org/GNOME/libadwaita/-/tree/main/src/stylesheet/widgets) |
| Layout and behaviour | [GNOME HIG](https://developer.gnome.org/hig/) |

The theme follows the system preference by default. The palette button in the header opens a
small version of GNOME Settings, Appearance, offering light, dark or system, plus the nine
system accent colours. An explicit choice is saved in `localStorage`, and `system` keeps
tracking the operating system.

## Development

```bash
bun install
bun run dev        # http://localhost:5173/
bun run typecheck
bun run build      # tsc --noEmit, then vite build into dist/
bun run preview
```

## Writing a post

Add a markdown file to `src/content/posts/`. The filename is the slug, and the frontmatter is
a set of flat `key: value` lines.

```markdown
---
title: Reinforcement learning in Screeps
date: 2026-08-17
summary: One sentence for the index row.
tags: RL, PPO
code: https://github.com/...
video: https://youtu.be/...
discussion: https://reddit.com/...
---
```

Beyond GitHub flavoured markdown there are three extra fences.

- ` ```gallery ` takes one `file.webp :: caption` per line and lays the images out as a
  figure row. Images are referenced by bare filename and resolved from `src/assets/media/`.
- ` ```pipeline ` takes one stage per line, with fields separated by `|`, and draws them as
  chained chips.
- ` ```youtube ` takes `videoId :: caption` and embeds the video at 16 by 9.

Reading time is computed from the body, and images are loaded lazily with their intrinsic
size set at build time.

## Deployment

Vercel hosts the production site at [carsonburke.com](https://carsonburke.com/).
`bunx vercel --prod` builds and deploys the current checkout. The build writes
`dist/404.html` as a copy of `index.html`, so a hard load of an unknown client route
still reaches React Router.

## Licences

The site code is MIT licensed, in `LICENSE`. Adwaita Sans and Adwaita Mono in
`src/assets/fonts/` are subset from
[adwaita-fonts](https://gitlab.gnome.org/GNOME/adwaita-fonts) and remain under the SIL Open
Font License 1.1, included as `src/assets/fonts/LICENSE-adwaita-fonts.txt`. The favicon is my
GitHub profile picture. Screenshots and recordings belong to the projects they came from.
