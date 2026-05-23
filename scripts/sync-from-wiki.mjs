import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';

const repoRoot = process.cwd();
const wikiRoot = process.env.WIKI_PATH || '/home/chad/wiki';
const outDir = path.join(repoRoot, 'src/content/knowledge');
const manifestPath = path.join(repoRoot, 'src/data/wiki-manifest.json');

const publishDirs = ['entities', 'concepts', 'comparisons', 'queries'];
const includeTerms = [
  'bryan johnson', 'bryan-johnson', 'blueprint', "don't die", 'dont-die', 'dont die',
  'longevity', 'biomarker', 'protocol', 'health', 'kernel', 'os fund', 'os-fund', 'braintree',
  'venmo', 'immortality', 'algorithmic-health', 'aging'
];
const excludeTerms = ['hermes agent', 'claude code', 'openclaw', 'agentic coding'];

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/\.md$/, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';
}

function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item) => item !== undefined && item !== null).map(String);
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

function cleanData(data) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined && value !== null));
}

function toPlainDate(value) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value);
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : text;
}

function stripWikiProvenance(text) {
  return text.replace(/\^\[[^\]]+\]/g, '');
}

function convertWikiLinks(text) {
  return text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const cleanTarget = String(target).trim();
    const cleanLabel = String(label || target).trim().replace(/-/g, ' ');
    return `[${cleanLabel}](/knowledge/${slugify(cleanTarget)}/)`;
  });
}

function firstParagraph(markdown) {
  const cleaned = markdown
    .replace(/^---[\s\S]*?---\s*/, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('![') && !line.startsWith('|'))
    .join(' ')
    .replace(/\^\[[^\]]+\]/g, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => label || target)
    .replace(/\s+/g, ' ')
    .slice(0, 220);
  return cleaned || 'Compiled wiki synthesis from Bryan Johnson related source material.';
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

async function main() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });

  const sourceFiles = [];
  for (const dir of publishDirs) sourceFiles.push(...await walk(path.join(wikiRoot, dir)));

  const pages = [];
  for (const file of sourceFiles) {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = matter(raw);
    const rel = path.relative(wikiRoot, file);
    const slug = slugify(path.basename(file, '.md'));
    const title = parsed.data.title || path.basename(file, '.md').split('-').map((p) => p[0]?.toUpperCase() + p.slice(1)).join(' ');
    const haystack = `${title}\n${rel}\n${JSON.stringify(parsed.data)}\n${parsed.content}`.toLowerCase();
    if (!includeTerms.some((term) => haystack.includes(term))) continue;
    if (excludeTerms.some((term) => haystack.includes(term)) && !haystack.includes('bryan johnson')) continue;

    const body = convertWikiLinks(stripWikiProvenance(parsed.content)).trim() + '\n';
    const data = Object.fromEntries(Object.entries({
      title: String(title),
      slug,
      type: String(parsed.data.type || path.dirname(rel).split(path.sep)[0] || 'concept'),
      sourcePath: rel,
      created: toPlainDate(parsed.data.created),
      updated: toPlainDate(parsed.data.updated),
      tags: normalizeArray(parsed.data.tags),
      sources: normalizeArray(parsed.data.sources),
      confidence: parsed.data.confidence ? String(parsed.data.confidence) : undefined,
      contested: parsed.data.contested === true || parsed.data.contested === 'true' || undefined,
      summary: firstParagraph(parsed.content),
    }).filter(([, value]) => value !== undefined));
    const frontmatter = matter.stringify(body, cleanData(data));
    await fs.writeFile(path.join(outDir, `${slug}.md`), frontmatter);
    pages.push({ title: data.title, slug, type: data.type, updated: data.updated, sourcePath: rel, tags: data.tags });
  }

  pages.sort((a, b) => a.title.localeCompare(b.title));
  const manifest = {
    generatedAt: new Date().toISOString(),
    wikiRoot,
    pageCount: pages.length,
    sourceHash: crypto.createHash('sha256').update(JSON.stringify(pages)).digest('hex'),
    pages,
  };
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Synced ${pages.length} publishable wiki pages from ${wikiRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
