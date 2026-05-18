#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const matter = require("gray-matter");

const REPO_ROOT = path.resolve(__dirname, "..");
const DOCS_ROOT = path.join(REPO_ROOT, "content", "english", "documentation");
const OUT_DIR = path.join(REPO_ROOT, "public", "mcp");
const BASE_URL = "https://www.jobrunr.io";
const SCHEMA_VERSION = "1";

const MIN_CHUNK_CHARS = 200;
const MAX_CHUNK_CHARS = 1500;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && full.endsWith(".md")) out.push(full);
  }
  return out;
}

function toRelPath(absFile) {
  const rel = path.relative(DOCS_ROOT, absFile).split(path.sep).join("/");
  if (rel.endsWith("/_index.md")) return rel.slice(0, -"/_index.md".length);
  if (rel === "_index.md") return "";
  return rel.replace(/\.md$/, "");
}

function pathToUrl(relPath) {
  const suffix = relPath ? `${relPath}/` : "";
  return `${BASE_URL}/en/documentation/${suffix}`;
}

function pathToSection(relPath) {
  if (!relPath) return "introduction";
  const first = relPath.split("/")[0];
  return first || "introduction";
}

function tierOf(relPath) {
  return relPath.startsWith("pro/") || relPath === "pro" ? "pro" : "oss";
}

function stripShortcodes(md) {
  return md
    .replace(/\{\{<\s*ref\s+["']([^"']+)["']\s*>\}\}/g, "$1")
    .replace(/\{\{<\s*\/?[^>]+>\}\}/g, "")
    .replace(/\{\{%\s*\/?[^%]+%\}\}/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<figure[\s\S]*?<\/figure>/gi, "")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractHeadings(md) {
  const headings = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (m) headings.push(m[2].trim());
  }
  return headings;
}

function splitOnH2(md) {
  const blocks = [];
  let current = { heading: null, lines: [] };
  for (const line of md.split("\n")) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      if (current.lines.length || current.heading) blocks.push(current);
      current = { heading: m[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length || current.heading) blocks.push(current);
  return blocks
    .map((b) => ({ heading: b.heading, text: b.lines.join("\n").trim() }))
    .filter((b) => b.heading || b.text);
}

function splitOversized(block) {
  if (block.text.length <= MAX_CHUNK_CHARS) return [block];
  const parts = [];
  let buffer = { heading: block.heading, lines: [] };
  let bufferLen = 0;
  const flush = () => {
    if (buffer.lines.length) {
      parts.push({ heading: buffer.heading, text: buffer.lines.join("\n").trim() });
      buffer = { heading: block.heading, lines: [] };
      bufferLen = 0;
    }
  };
  for (const line of block.text.split("\n")) {
    const sub = line.match(/^###\s+(.+?)\s*$/);
    if (sub && bufferLen > MIN_CHUNK_CHARS) {
      flush();
      buffer.heading = `${block.heading || ""} › ${sub[1].trim()}`.trim();
      continue;
    }
    if (bufferLen + line.length > MAX_CHUNK_CHARS && bufferLen > MIN_CHUNK_CHARS) {
      flush();
    }
    buffer.lines.push(line);
    bufferLen += line.length + 1;
  }
  flush();
  return parts.length ? parts : [block];
}

function chunkPage(relPath, title, cleanMd) {
  const raw = splitOnH2(cleanMd);
  const blocks = raw.flatMap(splitOversized).filter((b) => b.text.trim().length >= 40);
  if (blocks.length === 0) {
    return [
      {
        id: `${relPath}#0`,
        heading: title,
        text: cleanMd.slice(0, MAX_CHUNK_CHARS).trim(),
      },
    ];
  }
  return blocks.map((b, i) => ({
    id: `${relPath}#${i}`,
    heading: b.heading || title,
    text: b.text,
  }));
}

function buildPage(absFile) {
  const raw = fs.readFileSync(absFile, "utf8");
  const { data, content } = matter(raw);
  const relPath = toRelPath(absFile);
  const cleanMd = stripShortcodes(content);
  const title = (data.title || relPath || "Introduction").toString();
  const subtitle = data.subtitle ? String(data.subtitle) : null;
  const description = data.description ? String(data.description) : null;
  const keywords = Array.isArray(data.keywords) ? data.keywords.map(String) : [];
  const headings = extractHeadings(cleanMd);
  const chunks = chunkPage(relPath || "introduction", title, cleanMd);

  return {
    path: relPath || "introduction",
    url: pathToUrl(relPath),
    title,
    subtitle,
    description,
    section: pathToSection(relPath),
    tier: tierOf(relPath),
    keywords,
    headings,
    chunks,
  };
}

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    console.error(`Docs root not found: ${DOCS_ROOT}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = walk(DOCS_ROOT).sort();
  const pages = files.map(buildPage);

  const builtAt = new Date().toISOString();
  const catalog = { version: SCHEMA_VERSION, builtAt, pages };
  const catalogJson = JSON.stringify(catalog, null, 2);
  const sha256 = crypto.createHash("sha256").update(catalogJson).digest("hex");

  fs.writeFileSync(path.join(OUT_DIR, "docs.json"), catalogJson);
  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(
      {
        version: SCHEMA_VERSION,
        builtAt,
        count: pages.length,
        chunks: pages.reduce((n, p) => n + p.chunks.length, 0),
        sha256,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    `mcp index: ${pages.length} pages, ${pages.reduce((n, p) => n + p.chunks.length, 0)} chunks, sha256=${sha256.slice(0, 12)}…`,
  );
}

main();
