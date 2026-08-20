#!/usr/bin/env node
/**
 * Fetch a published Google Form and print Vite env vars for .env
 * Usage: node scripts/extract-google-form.mjs "https://docs.google.com/forms/d/e/.../viewform"
 */
const url = process.argv[2];
if (!url) {
  console.error("Pass a published Google Form URL (viewform).");
  process.exit(1);
}

const html = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0" },
}).then((r) => r.text());

const idMatch = url.match(/\/forms\/d\/e\/([^/]+)/);
const formId = idMatch?.[1] ?? "";

const dataMatch = html.match(/var FB_PUBLIC_LOAD_DATA_ = ([\s\S]*?);<\/script>/);
if (!dataMatch) {
  console.error("Could not read form fields. Make sure the form is public.");
  process.exit(1);
}

const data = JSON.parse(dataMatch[1]);
const questions = data[1][1] ?? [];

console.log(`VITE_GOOGLE_FORM_ID=${formId}\n`);
for (const q of questions) {
  const title = String(q[1] ?? "").trim();
  const entryId = q[4]?.[0]?.[0];
  if (entryId == null) continue;
  const key = title.toLowerCase().includes("journal") || title.toLowerCase().includes("source")
    ? "ROLE"
    : title.toUpperCase().replace(/[^A-Z]+/g, "_").replace(/^_|_$/g, "");
  console.log(`${title}`);
  console.log(`VITE_ENTRY_${key}=entry.${entryId}\n`);
}
