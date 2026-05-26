#!/usr/bin/env node
/**
 * Wordlye Legal — Static site build script
 * Generates docs/ from src/ page definitions.
 * Run: node build.js
 * Injects: Open Graph, Twitter Card, JSON-LD, canonical, last-updated date.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://amiejoni.github.io/legal';
const ORG_NAME = 'Wordlye';
const ORG_EMAIL = 'contact@wordlye.com';
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const TODAY_DISPLAY = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // e.g. "April 2026"

// ---------------------------------------------------------------------------
// Inner page shared CSS (inlined to keep files self-contained for GH Pages)
// ---------------------------------------------------------------------------
const INNER_CSS = fs.readFileSync(path.join(__dirname, 'src/partials/style-inner.css'), 'utf8');

// ---------------------------------------------------------------------------
// Page definitions
// ---------------------------------------------------------------------------
const INDEX_PAGE = {
  title: `${ORG_NAME} — Legal`,
  description: 'Legal documents (Privacy Policy and Terms of Use) for all Wordlye applications: Haveno, Aidmap, Okayo, Telox, and Vivex.',
  url: `${BASE_URL}/`,
  outFile: 'docs/index.html',
  type: 'website',
};

const APPS = [
  {
    id: 'haveno',
    name: 'Haveno',
    tagline: 'Panic stabilization app — 100% offline, OLED, multilingual',
    schema: 'MobileApplication',
  },
  {
    id: 'aidmap',
    name: 'Aidmap',
    tagline: 'Anonymous offline-first GIS crisis resource mapping',
    schema: 'MobileApplication',
  },
  {
    id: 'okayo',
    name: 'Okayo',
    tagline: 'Crisis lifeline for civilians in conflict zones — SMS, GPS, Dead Man\'s Switch',
    schema: 'MobileApplication',
  },
  {
    id: 'telox',
    name: 'Telox',
    tagline: 'Decentralized mesh P2P messaging — BLE + Wi-Fi Direct, E2EE, zero server',
    schema: 'MobileApplication',
  },
  {
    id: 'vivex',
    name: 'Vivex',
    tagline: 'Offline first-aid emergency guide — 40 procedures, 8 categories',
    schema: 'MobileApplication',
  },
  {
    id: 'barberai',
    name: 'BarberAI',
    tagline: 'Barbershop management platform with AI-powered virtual hair try-on',
    schema: 'MobileApplication',
  },
];

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------
function head({ title, description, url, type = 'website', css = '', extraMeta = '' }) {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: BASE_URL + '/',
    email: ORG_EMAIL,
    description,
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">

<!-- Open Graph -->
<meta property="og:type" content="${type}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${ORG_NAME}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">

<!-- Last updated -->
<meta name="last-modified" content="${TODAY}">
${extraMeta}
<!-- JSON-LD structured data -->
<script type="application/ld+json">
${jsonLd}
</script>

<style>
${css}
</style>
</head>`;
}

// ---------------------------------------------------------------------------
// Index page generator
// ---------------------------------------------------------------------------
function buildIndex() {
  const css = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0D0D0F; color: #e0e0e0; min-height: 100vh; }
  .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
  h1 { color: #F5A623; font-size: 28px; margin-bottom: 8px; }
  .subtitle { color: #888; font-size: 14px; margin-bottom: 40px; }
  .app-card { background: #1C1C1E; border: 1px solid #333; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
  .app-card h2 { color: #fff; font-size: 20px; margin-bottom: 6px; }
  .app-card p { color: #999; font-size: 13px; margin-bottom: 16px; }
  .links { display: flex; gap: 12px; flex-wrap: wrap; }
  .links a { color: #F5A623; text-decoration: none; font-size: 13px; padding: 6px 14px; border: 1px solid #F5A623; border-radius: 6px; transition: all 0.2s; }
  .links a:hover { background: #F5A623; color: #000; }
  footer { text-align: center; color: #888; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #222; }
  footer a { color: #888; }`;

  const appCards = APPS.map(app => `
  <div class="app-card">
    <h2>${app.name}</h2>
    <p>${app.tagline}</p>
    <nav class="links" aria-label="${app.name} legal documents">
      <a href="${app.id}/privacy.html">Privacy Policy</a>
      <a href="${app.id}/terms.html">Terms of Use</a>
    </nav>
  </div>`).join('\n');

  const { title, description, url } = INDEX_PAGE;

  const html = `${head({ title, description, url, css })}
<body>
<div class="container">
  <header>
    <h1>${ORG_NAME}</h1>
    <p class="subtitle">Legal documents for our applications</p>
  </header>
  <main>
${appCards}
  </main>
  <footer>
    &copy; 2026 ${ORG_NAME} &middot; <a href="mailto:${ORG_EMAIL}">${ORG_EMAIL}</a>
    &middot; <span>Last updated: ${TODAY_DISPLAY}</span>
  </footer>
</div>
</body>
</html>
`;

  return html;
}

// ---------------------------------------------------------------------------
// Inner document page generator
// ---------------------------------------------------------------------------
function buildInnerPage({ app, docType, content }) {
  const isPrivacy = docType === 'privacy';
  const docLabel = isPrivacy ? 'Privacy Policy' : 'Terms of Use';
  const title = `${app.name} — ${docLabel}`;
  const description = isPrivacy
    ? `Privacy Policy for ${app.name} by ${ORG_NAME}. ${app.tagline}.`
    : `Terms of Use for ${app.name} by ${ORG_NAME}. ${app.tagline}.`;
  const url = `${BASE_URL}/${app.id}/${docType}.html`;

  const extraMeta = `<meta name="robots" content="index, follow">`;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      email: ORG_EMAIL,
      url: BASE_URL + '/',
    },
    dateModified: TODAY,
  }, null, 2);

  // Override JSON-LD in head() — build manually for inner pages
  const headHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${ORG_NAME}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">

<!-- Last updated -->
<meta name="last-modified" content="${TODAY}">
${extraMeta}

<!-- JSON-LD structured data -->
<script type="application/ld+json">
${jsonLd}
</script>

<style>
${INNER_CSS}
</style>
</head>`;

  return `${headHtml}
<body>
<nav aria-label="Site navigation">
  <a href="../" class="back" aria-label="Back to all apps">&larr; Back to all apps</a>
</nav>
<main>
${content}
</main>
<footer>
  &copy; 2026 ${ORG_NAME} &middot; <a href="mailto:${ORG_EMAIL}">${ORG_EMAIL}</a>
  &middot; <span>Last updated: ${TODAY_DISPLAY}</span>
</footer>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Page content definitions (the actual legal text — sourced from src/pages/)
// ---------------------------------------------------------------------------
function loadContent(appId, docType) {
  const contentPath = path.join(__dirname, `src/pages/${appId}/${docType}.html`);
  if (!fs.existsSync(contentPath)) {
    throw new Error(`Missing content file: ${contentPath}`);
  }
  return fs.readFileSync(contentPath, 'utf8');
}

// ---------------------------------------------------------------------------
// Main build
// ---------------------------------------------------------------------------
function build() {
  console.log(`Building Wordlye Legal — ${TODAY}`);

  // Index
  fs.writeFileSync(path.join(__dirname, INDEX_PAGE.outFile), buildIndex());
  console.log('  Written: docs/index.html');

  // Inner pages
  for (const app of APPS) {
    for (const docType of ['privacy', 'terms']) {
      const content = loadContent(app.id, docType);
      const html = buildInnerPage({ app, docType, content });
      const outPath = path.join(__dirname, `docs/${app.id}/${docType}.html`);
      fs.writeFileSync(outPath, html);
      console.log(`  Written: docs/${app.id}/${docType}.html`);
    }
  }

  console.log('Build complete.');
}

build();
