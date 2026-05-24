import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

function walk(dir, predicate) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) entries.push(...walk(path, predicate));
    else if (predicate(path)) entries.push(path);
  }
  return entries;
}

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('knowledge markdown does not link to unpublished internal knowledge pages', () => {
  const knowledgeDir = join(root, 'src/content/knowledge');
  const publishedSlugs = new Set(
    walk(knowledgeDir, (path) => extname(path) === '.md')
      .map((path) => path.split('/').pop().replace(/\.md$/, '')),
  );
  const offenders = [];

  for (const file of walk(knowledgeDir, (path) => extname(path) === '.md')) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\]\(\/knowledge\/([^/)]+)\/?\)/g)) {
      const slug = match[1];
      if (!publishedSlugs.has(slug)) offenders.push(`${file.replace(root, '')} -> /knowledge/${slug}/`);
    }
  }

  assert.deepEqual(offenders, []);
});

test('knowledge body CSS allows long prose and tables to stay inside the mobile viewport', () => {
  const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
  assert.match(css, /\.knowledge-body\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(css, /\.knowledge-body\s+table\s*\{[^}]*display:\s*block;[^}]*max-width:\s*100%;[^}]*overflow-x:\s*auto;/s);
  assert.match(css, /@media \(max-width:\s*850px\)[\s\S]*\.knowledge-body\s*\{[^}]*max-width:\s*100%;[^}]*box-sizing:\s*border-box;/);
});
