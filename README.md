# cafs

A curated index of the best anime resources on the internet.

**cafs** is a wiki-style discovery hub for anime, manga, reading, gaming, and tool resources. Every site is hand-picked, reviewed, and kept up to date.

## Features

- **566 curated sites** across 12 pages (Anime, Manga, Novels, Tokusatsu, Comics, Software, Music, Tools, Misc, Art, Games, NSFW)
- **Instant fuzzy search** powered by Fuse.js (Ctrl+K to open)
- **Wiki index and link lists** with a right-side “On this page” outline that tracks the section you are reading
- **Favorites** — save sites to your personal list (localStorage)
- **Browsing history** — recently visited sites with timestamps (localStorage)
- **Personal notes** — private annotations per site (localStorage)
- **Statistics dashboard** with category distribution and a tag cloud
- **Dark & light mode** with persistent preference
- **Keyboard-first navigation** with command palette search
- **Markdown-driven content** — each category is one Markdown file in `public/`

## Tech Stack

- [Vite](https://vitejs.dev/) — Build tool
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Fuse.js](https://fusejs.io/) — Client-side fuzzy search
- [Marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify) — Markdown rendering and HTML sanitization
- Vanilla CSS — No framework, no Tailwind
- Markdown — All content in `public/*.md`, loaded at build time
- localStorage — User preferences and personal data
- GitHub Pages — Hosting

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck
```

## Project Structure

```
cafs/
├── index.html              # Entry point
├── public/
│   ├── Anime.md            # One Markdown file per category
│   ├── Manga.md
│   ├── Misc.md
│   ├── ...
│   ├── 404.html            # SPA fallback for GitHub Pages
│   └── favicon/            # Local icons
├── src/
│   ├── content/            # Markdown catalog loader
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Utilities (router, search, markdown, etc.)
│   ├── components/         # UI components
│   │   ├── collection/     # Wiki index and link-list renderers
│   │   ├── ui/             # Primitives (Tag, Breadcrumbs)
│   │   ├── layout/         # Layout (Navbar, Sidebar, Footer)
│   │   ├── search/         # Search overlay
│   │   └── stats/          # Stats components
│   ├── pages/              # Page renderers (Home, Browse, etc.)
│   ├── styles/             # CSS (tokens, reset, layout, components, pages, fmhy)
│   └── main.ts             # Entry point
└── README.md
```

## Content Format

All wiki content lives in `public/` as one Markdown file per category. The file
name becomes the category ID (`Anime.md` → `anime`, `NSFW.md` → `nsfw`).

Each file starts with frontmatter describing the category and its sections:

```md
---
name: Anime
icon: star
order: 0
description: Websites and services for watching, downloading, and tracking anime.
subcategories:
  - id: anime-stream
    name: Streaming Sites
  - id: anime-download
    name: Downloads & Torrents
---
```

The body then lists every resource under a section heading. The heading ID must
match a `subcategories[].id` from the frontmatter:

```md
## Streaming Sites {#anime-stream}

- [KickassAnime](https://kaa.lt/) — Popular anime streaming site with a large library. <!-- tags: streaming, popular; featured: true; order: 0 -->
- [Miruro](https://www.miruro.to/) — Modern streaming site with multilingual subtitles. <!-- tags: streaming, scraper; featured: true; order: 1 -->
```

Resource metadata lives in the trailing HTML comment so it never renders:

| Field | Required | Notes |
| --- | --- | --- |
| `tags` | yes | Comma-separated list |
| `order` | no | Curated sort index; lower numbers appear first, entries without one appear last |
| `id` | no | Defaults to a slug of the name; set only when the legacy ID differs (e.g. `id: reanime`) |
| `featured` | no | `true`, `false`, or `unknown`; defaults to `false` |
| `addedAt` | no | Defaults to `2025-01-01` |
| `updatedAt` | no | Defaults to `2025-06-01` |
| `language` | no | Defaults to `en` |
| `requires` | no | Defaults to empty |
| `curatorNote` | no | Defaults to empty |

Fields in the comment are separated by semicolons. The description between the
link and the comment is rendered as safe inline Markdown, so links, `code`,
`**bold**`, and *italics* are supported.

## Adding or Editing Content

1. Edit the relevant category file in `public/`.
2. Add a resource under the right `## Section {#id}` heading.
3. Rebuild with `npm run build` (or let the dev server hot-reload).

No TypeScript changes are needed. The catalog loader reads every
`public/*.md` file at build time, validates category and section IDs, and
sanitizes all rendered Markdown.

## Deployment

```bash
npm run build
# Deploy dist/ to GitHub Pages
```
