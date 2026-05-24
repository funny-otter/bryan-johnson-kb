import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';

const repoRoot = process.cwd();
const wikiRoot = process.env.WIKI_PATH || '/home/chad/wiki';
const outDir = path.join(repoRoot, 'src/content/knowledge');
const updatesDir = path.join(repoRoot, 'src/content/updates');
const manifestPath = path.join(repoRoot, 'src/data/wiki-manifest.json');
const manifestModulePath = path.join(repoRoot, 'src/data/wiki-manifest.mjs');

const publishDirs = ['entities', 'concepts', 'comparisons', 'queries'];
const includeTerms = [
  'bryan johnson', 'bryan-johnson', 'blueprint', "don't die", 'dont-die', 'dont die',
  'longevity', 'biomarker', 'protocol', 'health', 'kernel', 'os fund', 'os-fund', 'braintree',
  'venmo', 'immortality', 'algorithmic-health', 'aging', 'biohacking'
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
  return [String(value)];
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

function recentBryanUpdates(logText, pages) {
  const sections = logText
    .split(/\n(?=## \[\d{4}-\d{2}-\d{2}\])/g)
    .map((section) => section.trim())
    .filter((section) => /^## \[\d{4}-\d{2}-\d{2}\]/.test(section))
    .filter((section) => /Bryan Johnson|Blueprint|Don'?t Die|longevity|health/i.test(section))
    .slice(-12);
  if (sections.length > 0) return sections;
  return [`## [${new Date().toISOString().slice(0, 10)}] sync | Site generation\n- Exported ${pages.length} publishable Bryan Johnson related wiki pages.`];
}

async function writeUpdates(pages) {
  await fs.rm(updatesDir, { recursive: true, force: true });
  await fs.mkdir(updatesDir, { recursive: true });
  const logText = await fs.readFile(path.join(wikiRoot, 'log.md'), 'utf8').catch(() => '');
  for (const section of recentBryanUpdates(logText, pages)) {
    const match = section.match(/^## \[(\d{4}-\d{2}-\d{2})\]\s+([^|]+)\|\s*(.+)$/m);
    const date = match?.[1] || new Date().toISOString().slice(0, 10);
    const action = match?.[2]?.trim() || 'sync';
    const subject = match?.[3]?.trim() || 'Wiki update';
    const slug = slugify(`${date}-${action}-${subject}`).slice(0, 90);
    const body = section.replace(/^## .*$/m, '').trim();
    const out = matter.stringify(`# ${subject}\n\n${body || `Exported ${pages.length} pages.`}\n`, {
      title: subject,
      date,
      source: 'llm-wiki',
      wikiPaths: pages.map((page) => page.sourcePath),
    });
    await fs.writeFile(path.join(updatesDir, `${slug}.md`), out);
  }
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

async function exists(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // Cloudflare Pages builds from committed content and does not have access to
  // the private local llm-wiki. In that environment, skip sync instead of
  // deleting committed Markdown files and producing an empty deployment.
  if (!(await exists(wikiRoot))) {
    console.log(`Wiki path ${wikiRoot} is unavailable; using committed site content.`);
    return;
  }

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
    const frontmatter = matter.stringify(body, data);
    await fs.writeFile(path.join(outDir, `${slug}.md`), frontmatter);
    pages.push({ title: data.title, slug, type: data.type, updated: data.updated, sourcePath: rel, tags: data.tags });
  }

  pages.sort((a, b) => a.title.localeCompare(b.title));
  await writeUpdates(pages);
  const manifest = {
    wikiRoot,
    pageCount: pages.length,
    sourceHash: crypto.createHash('sha256').update(JSON.stringify(pages)).digest('hex'),
    pages,
  };
  const manifestJson = JSON.stringify(manifest, null, 2);
  await fs.writeFile(manifestPath, `${manifestJson}\n`);
  await fs.writeFile(manifestModulePath, `const wikiManifest = ${manifestJson};\n\nexport default wikiManifest;\n`);
  console.log(`Synced ${pages.length} publishable wiki pages from ${wikiRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
