import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const indexSource = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const contentConfig = readFileSync(new URL('../src/content.config.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const changelogSource = readFileSync(new URL('../src/pages/changelog/index.astro', import.meta.url), 'utf8');
const baseLayoutSource = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const curatedHomePath = new URL('../src/data/curated-home.mjs', import.meta.url);
const curatedHomeSource = existsSync(curatedHomePath) ? readFileSync(curatedHomePath, 'utf8') : '';

describe('home overview and dedicated changelog route', () => {
  it('keeps update history off the terminal overview and exposes changelog through primary nav', () => {
    assert.doesNotMatch(indexSource, /getCollection\('updates'\)/, 'overview should not load update entries for an embedded changelog');
    assert.doesNotMatch(indexSource, /overview-tab-overview/, 'overview should not include an Overview tab control');
    assert.doesNotMatch(indexSource, /overview-tab-changelog/, 'overview should not include a Changelog tab control');
    assert.match(indexSource, /Latest signal/i, 'overview should lead with the terminal-style latest-signal surface');
    assert.match(indexSource, /signal-table-title/, 'overview should include an accessible latest-signal table heading');
    assert.match(baseLayoutSource, /\['\/changelog\/',\s*'changelog'/, 'primary navigation should link to the standalone changelog route');
    assert.match(baseLayoutSource, /navGroups/, 'primary navigation should expose the changelog route as its own top-level item');
    assert.match(changelogSource, /getCollection\('updates'\)/, 'changelog route should load update entries');
    assert.match(changelogSource, /<h1 id="changelog-title">Changelog<\/h1>/, 'changelog route should render update-history content');
    assert.match(contentConfig, /const updates = defineCollection/, 'content config should define an updates collection');
    assert.match(contentConfig, /collections = \{ knowledge, updates \}/, 'updates collection should be exported');
    assert.match(styles, /\.watch-board/, 'global styles should include the terminal overview board layout');
    assert.match(styles, /\.signal-terminal/, 'global styles should include latest-signal terminal table styles');
    assert.match(styles, /\.changelog-list/, 'global styles should include changelog list styles');
  });

  it('keeps the latest curated signal table high on the page with source-aware framing', () => {
    assert.ok(indexSource.indexOf('watch-board') < indexSource.indexOf('watch-lower'), 'terminal signal board should appear before lower reference paths');
    assert.match(indexSource, /<section class="signal-terminal" aria-labelledby="signal-table-title">/, 'latest signals should render as a terminal table surface');
    for (const label of ['DATE', 'TAG', 'CONTENT', 'SOURCES']) {
      assert.match(indexSource, new RegExp(`<span>${label}<\\/span>`), `signal table should include ${label} column label`);
    }
    assert.match(indexSource, /sourceLabel\(item\.sources\.length\)/, 'each signal row should show source count instead of engagement/update-history metadata');
    assert.match(indexSource, /source-aware summaries/, 'overview heading should frame summaries as source-aware');
    assert.match(indexSource, /claims stay framed as Johnson's position rather than clinical advice/, 'next-watch copy should preserve medical caution framing');
    assert.match(baseLayoutSource, /not personal medical advice/, 'shared layout should preserve site-wide medical caution');
  });

  it('wires overview recent news to the curated high-signal set, not updated knowledge-page order', () => {
    assert.doesNotMatch(indexSource, /const recentNews\s*=\s*entries\.slice\(0,\s*3\)/, 'overview must not use generic recently-updated knowledge pages');
    assert.match(indexSource, /curatedRecentNews/, 'overview should render explicit curated recent-news cards');

    for (const phrase of [
      'Kate Tolo launches female-specific Blueprint measurement protocol',
      'Blueprint biomarker platform: 100+ biomarkers, AI action plan, retesting',
      'Microplastics become a Blueprint testing/product theme',
      'Blueprint starts certifying partner products',
      "Blueprint/Don't Die positioning",
    ]) {
      assert.match(curatedHomeSource, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing curated overview item: ${phrase}`);
    }
  });

  it('keeps background company biography out of concise overview core topics', () => {
    assert.match(indexSource, /coreTopicSlugs/, 'overview should choose explicit core topic slugs');
    assert.doesNotMatch(curatedHomeSource, /coreTopicSlugs[\s\S]*['"]braintree['"]/, 'Braintree should not be a concise overview core topic');
  });

  it('includes curated dated changelog rows, including the 2026-05-23 curation pass', () => {
    for (const file of [
      '../src/content/updates/2026-05-23-recent-news-changelog-curation-pass.md',
      '../src/content/updates/2026-05-22-blueprint-biomarkers-page-captured.md',
      '../src/content/updates/2026-04-20-years-critique-biomarker-limits.md',
      '../src/content/updates/2026-01-23-bryan-johnsons-protocol-dont-die-refresh.md',
      '../src/content/updates/2026-01-05-time-profile-longevity-critique.md',
    ]) {
      assert.ok(existsSync(new URL(file, import.meta.url)), `missing changelog update file: ${file}`);
    }
  });
});
