# CLAUDE.md — Wordlye Legal

Static HTML site hosting privacy policies and terms of use for all Wordlye apps. Built with a Node.js build script, served via GitHub Pages from the `docs/` folder.

## Apps Covered

Haveno, Aidmap, Okayo, Telox, Vivex — each has a `docs/<app>/privacy.html` and `docs/<app>/terms.html`.

**Live URL:** https://amiejoni.github.io/legal/

## Commands

```bash
# Regenerate all HTML in docs/ from src/
node build.js

# Lint HTML output
npm run lint:html

# Install dependencies
npm install
```

## Architecture

```
src/
├── pages/          # Page definitions (JS objects: title, description, url, outFile)
└── partials/       # Shared CSS (style-inner.css) and HTML templates
docs/               # Generated output — committed to git for GitHub Pages
    index.html
    haveno/privacy.html, terms.html
    aidmap/privacy.html, terms.html
    okayo/privacy.html, terms.html
    telox/privacy.html, terms.html
    vivex/privacy.html, terms.html
build.js            # Build script: reads src/, writes docs/
```

## Workflow

- **Edit content**: modify page definitions in `build.js` (BASE_URL, ORG_NAME, ORG_EMAIL) or templates in `src/`
- **Regenerate**: `node build.js` — overwrites `docs/` entirely
- **Deploy**: push to `main` → GitHub Pages auto-serves from `docs/`

## Key Details

- `docs/` is committed to the repo (required for GitHub Pages)
- `node_modules/` is gitignored
- Build injects Open Graph, Twitter Card, JSON-LD, canonical, and `last-updated` date automatically
- `TODAY` in build.js is dynamic — always reflects build date
- Contact email: `contact@wordlye.com`
