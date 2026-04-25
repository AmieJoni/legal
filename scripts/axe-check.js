#!/usr/bin/env node
/**
 * Accessibility audit using axe-core via Playwright.
 * Checks every generated HTML file and fails if any violations are found.
 * Run: node scripts/axe-check.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');

// Collect all HTML files under docs/
function collectHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  const htmlFiles = collectHtmlFiles(DOCS_DIR);
  if (htmlFiles.length === 0) {
    console.error('No HTML files found in docs/. Run node build.js first.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  let totalViolations = 0;

  for (const filePath of htmlFiles) {
    const fileUrl = `file://${filePath}`;
    const relativePath = path.relative(DOCS_DIR, filePath);
    const page = await context.newPage();

    try {
      await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });

      // Inject axe-core and run analysis
      await page.addScriptTag({ path: require.resolve('axe-core') });
      const results = await page.evaluate(async () => {
        return await window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'best-practice'],
          },
        });
      });

      if (results.violations.length > 0) {
        console.error(`\nFAIL: ${relativePath}`);
        for (const v of results.violations) {
          console.error(`  [${v.impact}] ${v.id}: ${v.description}`);
          for (const node of v.nodes) {
            console.error(`    Target: ${node.target.join(', ')}`);
          }
        }
        totalViolations += results.violations.length;
      } else {
        console.log(`  PASS: ${relativePath}`);
      }
    } catch (err) {
      console.error(`  ERROR auditing ${relativePath}: ${err.message}`);
      totalViolations++;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  if (totalViolations > 0) {
    console.error(`\nAccessibility check FAILED — ${totalViolations} violation(s) found.`);
    process.exit(1);
  } else {
    console.log(`\nAccessibility check PASSED — all ${htmlFiles.length} file(s) clean.`);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
