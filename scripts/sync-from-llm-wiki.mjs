#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const WIKI = process.env.WIKI_PATH || `${process.env.HOME}/wiki`;
const OUT = new URL('../src/content/wiki/', import.meta.url).pathname;
const DATA = new URL('../src/data/', import.meta.url).pathname;

const sourceDirs = ['entities', 'concepts', 'comparisons', 'queries'];
const includeNeedles = [
  'bryan johnson', 'bryan-johnson', 'blueprint', "don't die", 'dont die', 'dont-die',
  'longevity', 'biohacking', 'biomarker', 'biomarkers', 'protocol', 'health',
  'kernel', 'braintree', 'os fund', 'os-fund', 'immortality'
];
const excludeNeedles = ['claude code', 'hermes agent', 'openclaw', 'agentic coding', 'agent skills'];

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : [];
  });
}

function splitFrontmatter(text) {
  if (!text.startsWith('---')) return [{}, text];
  const end = text.indexOf('\n---', 3);
  if (end < 0) return [{}, text];
  const raw = text.slice(3, end).trim();
  const body = text.slice(text.indexOf('\n', end + 4) + 1);
  return [parseYamlLite(raw), body];
}

function parseYamlLite(raw) {
  const obj = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, val] = match;
    obj[key] = parseValue(val.trim());
  }
  return obj;
}

function parseValue(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === '[]') return [];
  if (val.startsWith('[') && val.endsWith(']')) {
    const inner = val.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, ''));
  }
  return val.replace(/^['"]|['"]$/g, '');
}

function yamlString(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value == null) return 'null';
  return JSON.stringify(String(value));
}

function wikilinkToMarkdown(body) {
  return body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, slug, label) => {
    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    const cleanLabel = (label || slug).trim().replace(/-/g, ' ');
    return `[${cleanLabel}](/wiki/${cleanSlug}/)`;
  });
}

function sectionFor(meta, slug, body) {
  const tags = (meta.tags || []).map((t) => String(t).toLowerCase());
  const blob = `${slug} ${meta.title || ''} ${tags.join(' ')} ${body}`.toLowerCase();
  if (slug.includes('source-map') || meta.type === 'query') return 'sources';
  if (tags.includes('person') || tags.includes('company') || meta.type === 'entity') return 'entities';
  if (blob.includes('sleep') || blob.includes('diet') || blob.includes('exercise') || blob.includes('supplement') || blob.includes('biomarker') || blob.includes('protocol')) return 'health';
  if (blob.includes("don't die") || blob.includes('dont die') || blob.includes('worldview') || blob.includes('opinion') || blob.includes('claim')) return 'opinions';
  if (blob.includes('longevity') || blob.includes('immortality') || blob.includes('aging')) return 'longevity';
  return 'knowledge';
}

function descriptionFrom(body) {
  const paragraph = body
    .replace(/^# .+$/m, '')
    .split('\n\n')
    .map((p) => p.replace(/\n/g, ' ').trim())
    .find((p) => p && !p.startsWith('##') && !p.startsWith('|')) || '';
  return paragraph.replace(/\^\[[^\]]+\]/g, '').replace(/\[[^\]]+\]\([^\)]+\)/g, (m) => m.match(/^\[([^\]]+)/)?.[1] || m).slice(0, 180);
}

function shouldPublish(rel, meta, body) {
  const blob = `${rel} ${meta.title || ''} ${(meta.tags || []).join(' ')} ${body}`.toLowerCase();
  const included = includeNeedles.some((needle) => blob.includes(needle));
  const excluded = excludeNeedles.some((needle) => blob.includes(needle));
  return included && !excluded;
}

if (!existsSync(WIKI)) {
  throw new Error(`Wiki path does not exist: ${WIKI}`);
}
mkdirSync(OUT, { recursive: true });
mkdirSync(DATA, { recursive: true });
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const exported = [];
for (const dir of sourceDirs) {
  for (const file of walk(join(WIKI, dir))) {
    const rel = relative(WIKI, file);
    const slug = basename(file, '.md').toLowerCase();
    const text = readFileSync(file, 'utf8');
    const [meta, bodyRaw] = splitFrontmatter(text);
    if (!shouldPublish(rel, meta, bodyRaw)) continue;

    const body = wikilinkToMarkdown(bodyRaw)
      .replace(/\^\[([^\]]+)\]/g, ' <sup>source: `$1`</sup>')
      .trim();
    const section = sectionFor(meta, slug, bodyRaw);
    const frontmatter = {
      title: meta.title || slug.replace(/-/g, ' '),
      description: descriptionFrom(body),
      created: meta.created,
      updated: meta.updated,
      type: meta.type,
      section,
      tags: meta.tags || [],
      sources: meta.sources || [],
      confidence: meta.confidence,
      contested: meta.contested,
      wiki_path: rel,
    };
    const fm = Object.entries(frontmatter)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}: ${yamlString(v)}`)
      .join('\n');
    writeFileSync(join(OUT, `${slug}.md`), `---\n${fm}\n---\n\n${body}\n`);
    exported.push({ slug, title: frontmatter.title, section, wiki_path: rel, updated: frontmatter.updated });
  }
}

exported.sort((a, b) => a.title.localeCompare(b.title));
const state = {
  generated_at: new Date().toISOString(),
  wiki_path: WIKI,
  count: exported.length,
  content_hash: createHash('sha256').update(JSON.stringify(exported)).digest('hex'),
  pages: exported,
};
writeFileSync(join(DATA, 'wiki-export.json'), JSON.stringify(state, null, 2) + '\n');
console.log(`Exported ${exported.length} wiki pages from ${WIKI} to ${OUT}`);
