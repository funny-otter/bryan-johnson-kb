import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const indexSource = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const contentConfig = readFileSync(new URL('../src/content.config.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const changelogSource = readFileSync(new URL('../src/pages/changelog/index.astro', import.meta.url), 'utf8');
const curatedHomePath = new URL('../src/data/curated-home.mjs', import.meta.url);
const curatedHomeSource = existsSync(curatedHomePath) ? readFileSync(curatedHomePath, 'utf8') : '';

describe('home overview and dedicated changelog route', () => {
  it('keeps changelog off overview and exposes it as a polished dedicated route', () => {
    assert.doesNotMatch(indexSource, /getCollection\('updates'\)/, 'overview should not load update entries for an embedded changelog');
    assert.doesNotMatch(indexSource, /overview-tab-overview/, 'overview should not include an Overview tab control');
    assert.doesNotMatch(indexSource, /overview-tab-changelog/, 'overview should not include a Changelog tab control');
    assert.match(indexSource, /Recent news/i, 'overview should label prominent recent news separately from update history');
    assert.match(indexSource, /href="\/changelog\/"/, 'overview should link to the standalone changelog route');
    assert.match(changelogSource, /getCollection\('updates'\)/, 'changelog route should load update entries');
    assert.match(changelogSource, /<h1 id="changelog-title">Changelog<\/h1>/, 'changelog route should render update-history content');
    assert.match(contentConfig, /const updates = defineCollection/, 'content config should define an updates collection');
    assert.match(contentConfig, /collections = \{ knowledge, updates \}/, 'updates collection should be exported');
    assert.match(styles, /\.overview-sections/, 'global styles should include non-tab overview section layout styles');
    assert.match(styles, /\.news-card/, 'global styles should include readable recent-news card styles');
    assert.match(styles, /\.changelog-list/, 'global styles should include changelog list styles');
  });

  it('keeps the overview hero compact with useful recent activity high on the page', () => {
    assert.doesNotMatch(styles, /\.activity-hero\s*\{[\s\S]*?min-height:\s*min\(760px,\s*calc\(100dvh - 150px\)\)/, 'overview hero should not reserve a near-full-screen banner height');
    assert.match(styles, /\.activity-copy h1\s*\{[^}]*font-size:\s*clamp\(34px,\s*5vw,\s*58px\)/, 'overview headline should be compact on desktop');
    assert.match(styles, /@media \(max-width: 850px\)[\s\S]*\.activity-stack\s*\{[^}]*order:\s*-1/, 'mobile overview should show recent activity before intro copy');
    assert.match(styles, /@media \(max-width: 850px\)[\s\S]*\.activity-copy h1\s*\{[^}]*font-size:\s*clamp\(30px,\s*8vw,\s*38px\)/, 'overview headline should stay compact on mobile');
    assert.ok(indexSource.indexOf('activity-copy') < indexSource.indexOf('activity-stack'), 'intro copy should be short before the activity cards');
    assert.match(indexSource, /<div class="activity-stack" id="recent-activity"/, 'recent activity cards should remain in the top overview surface');
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
