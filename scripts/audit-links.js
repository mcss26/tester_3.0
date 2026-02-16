#!/usr/bin/env node
/**
 * Audits local links in Markdown and HTML files.
 * Fails when a local reference points to a non-existing path.
 *
 * Usage:
 *   node scripts/audit-links.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const FILE_EXT = /\.(md|html)$/i;
const SKIP_DIRS = new Set([".git", "node_modules"]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    if (entry.isDirectory() && entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (entry.isFile() && FILE_EXT.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function isExternal(link) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(link);
}

function isTemplatePlaceholder(link) {
  return /\[[^\]]+\]/.test(link);
}

function normalize(link) {
  return link.trim().split("#")[0].split("?")[0];
}

function resolveLink(fromFile, link) {
  if (link.startsWith("/")) return path.join(ROOT, link.slice(1));
  return path.resolve(path.dirname(fromFile), link);
}

function checkLink(fromFile, rawLink, kind, issues) {
  const normalized = normalize(rawLink);
  if (!normalized) return;
  if (isExternal(normalized)) return;
  if (isTemplatePlaceholder(normalized)) return;
  if (normalized.startsWith("<")) return;

  const target = resolveLink(fromFile, normalized);
  if (fs.existsSync(target)) return;

  issues.push({
    file: rel(fromFile),
    kind,
    link: rawLink,
    target: rel(target),
  });
}

function scanFile(filePath, issues) {
  const content = fs.readFileSync(filePath, "utf8");
  if (filePath.toLowerCase().endsWith(".md")) {
    const mdRx = /\[[^\]]*]\(([^)]+)\)/g;
    for (const m of content.matchAll(mdRx)) {
      checkLink(filePath, m[1], "md", issues);
    }
  }
  if (filePath.toLowerCase().endsWith(".html")) {
    const htmlRx = /(?:href|src)=["']([^"']+)["']/g;
    for (const m of content.matchAll(htmlRx)) {
      checkLink(filePath, m[1], "html", issues);
    }
  }
}

function main() {
  const files = walk(ROOT);
  const issues = [];
  const dedupe = new Set();

  for (const filePath of files) {
    scanFile(filePath, issues);
  }

  const uniqueIssues = issues.filter((issue) => {
    const key = `${issue.file}|${issue.link}`;
    if (dedupe.has(key)) return false;
    dedupe.add(key);
    return true;
  });

  console.log(`Files scanned: ${files.length}`);
  console.log(`Broken local links: ${uniqueIssues.length}`);

  for (const issue of uniqueIssues) {
    console.log(`- ${issue.file} -> ${issue.link} [target:${issue.target}]`);
  }

  process.exitCode = uniqueIssues.length > 0 ? 1 : 0;
}

main();
