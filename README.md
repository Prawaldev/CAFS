# cafs

A curated index of the best anime resources on the internet.

**cafs** is a wiki-style discovery hub for anime, manga, reading, gaming, and tool resources. Every site is hand-picked, reviewed, and kept up to date.

## Features

- **560+ curated sites** across 12 pages (Anime, Manga, Novels, Tokusatsu, Comics, Software, Music, Tools, Misc, Art, Games, NSFW)
- **Instant fuzzy search** powered by Fuse.js (Ctrl+K to open)
- **Wiki index and link lists** with a right-side “On this page” outline
- **Favorites** — save sites to your personal list (localStorage)
- **Browsing history** — recently visited sites with timestamps (localStorage)
- **Personal notes** — private annotations per site (localStorage)
- **Statistics dashboard** with category distribution and a tag cloud
- **Dark & light mode** with persistent preference
- **Keyboard-first navigation** with command palette search

## Tech Stack

- [Vite](https://vitejs.dev/) — Build tool
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Fuse.js](https://fusejs.io/) — Client-side fuzzy search
- Vanilla CSS — No framework, no Tailwind
- JSON — All data in static files
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
│   ├── 404.html            # SPA fallback for GitHub Pages
│   ├── data/               # Static JSON data
│   │   ├── sites.json
│   │   └── categories.json
│   └── favicon_io/         # Local icons
├── src/
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Utilities (router, search, storage, etc.)
│   ├── components/         # UI components
│   │   ├── collection/     # Wiki index and link-list renderers
│   │   ├── ui/             # Primitives (Tag, Breadcrumbs)
│   │   ├── layout/         # Layout (Navbar, Sidebar, Footer)
│   │   ├── site/           # Site-specific components
│   │   ├── search/         # Search overlay
│   │   └── stats/          # Stats components
│   ├── pages/              # Page renderers (Home, Browse, SiteDetail, etc.)
│   ├── styles/             # CSS (tokens, reset, layout, components, pages, fmhy)
│   └── main.ts             # Entry point
├── scripts/
│   └── migrate-data.js     # Data migration tool
└── README.md
```

## Adding Sites

All site data lives in `public/data/sites.json`. Categories live in `public/data/categories.json`.
Edit the JSON files and rebuild.

## Deployment

```bash
npm run build
# Deploy dist/ to GitHub Pages
```
