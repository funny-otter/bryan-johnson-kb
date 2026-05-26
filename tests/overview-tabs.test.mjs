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
const signalsPath = new URL('../src/data/signals.mjs', import.meta.url);
const signalsSource = existsSync(signalsPath) ? readFileSync(signalsPath, 'utf8') : '';
const protocolsPath = new URL('../src/data/protocols.mjs', import.meta.url);
const protocolsSource = existsSync(protocolsPath) ? readFileSync(protocolsPath, 'utf8') : '';
const conceptsPagePath = new URL('../src/pages/concepts/index.astro', import.meta.url);
const conceptsPageSource = existsSync(conceptsPagePath) ? readFileSync(conceptsPagePath, 'utf8') : '';
const nutritionPagePath = new URL('../src/pages/nutrition/index.astro', import.meta.url);
const nutritionPageSource = existsSync(nutritionPagePath) ? readFileSync(nutritionPagePath, 'utf8') : '';
const sleepPagePath = new URL('../src/pages/sleep/index.astro', import.meta.url);
const sleepPageSource = existsSync(sleepPagePath) ? readFileSync(sleepPagePath, 'utf8') : '';

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
    assert.match(indexSource, /source trails and medical caution visible|claims stay framed as Johnson's position rather than clinical advice/, 'overview copy should preserve medical caution framing');
    assert.match(baseLayoutSource, /not personal medical advice/, 'shared layout should preserve site-wide medical caution');
  });

  it('turns the desktop sidebar into an accessible mobile drawer and hides side panels on phones', () => {
    assert.match(baseLayoutSource, /button class="terminal-menu-toggle"/, 'layout should expose a hamburger button for mobile navigation');
    assert.match(baseLayoutSource, /aria-controls="terminal-sidebar"/, 'hamburger button should control the sidebar drawer');
    assert.match(baseLayoutSource, /aria-expanded="false"/, 'hamburger button should advertise its collapsed state by default');
    assert.match(baseLayoutSource, /id="terminal-sidebar"/, 'sidebar should be addressable by aria-controls');
    assert.match(baseLayoutSource, /terminal-drawer-backdrop/, 'layout should include a click-away backdrop for closing the drawer');
    assert.match(baseLayoutSource, /data-close-nav/, 'drawer should include explicit close affordances');
    assert.match(baseLayoutSource, /Escape/, 'drawer script should close on Escape');
    assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.terminal-sidebar[\s\S]*transform: translateX\(-100%\)/, 'mobile CSS should move the left sidebar off-canvas by default');
    assert.match(styles, /body\.nav-open[\s\S]*\.terminal-sidebar[\s\S]*transform: translateX\(0\)/, 'mobile CSS should slide the sidebar in when opened');
    assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.watch-side[\s\S]*display: none/, 'mobile CSS should hide the right analysis sidebar');
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

  it('matches the reference left-sidebar information architecture and order', () => {
    const expectedOrder = [
      "['/', 'overview'",
      "['/health/', 'health'",
      "['/longevity/', 'longevity'",
      "['/nutrition/', 'nutrition'",
      "['/sleep/', 'sleep'",
      "['/concepts/', 'concepts'",
      "['/metrics/', 'metrics'",
      "['/changelog/', 'changelog'",
    ];
    let cursor = -1;
    for (const marker of expectedOrder) {
      const next = baseLayoutSource.indexOf(marker);
      assert.ok(next > cursor, `sidebar item should appear after previous item: ${marker}`);
      cursor = next;
    }
    assert.match(baseLayoutSource, /label: 'FEED'[\s\S]*'overview'[\s\S]*label: 'PROTOCOLS'[\s\S]*'health'[\s\S]*'longevity'[\s\S]*'nutrition'[\s\S]*'sleep'[\s\S]*label: 'REFERENCE'[\s\S]*'concepts'[\s\S]*label: 'SIGNAL'[\s\S]*'metrics'[\s\S]*'changelog'/, 'sidebar groups should match reference labels and order');
    assert.doesNotMatch(baseLayoutSource, /\['\/search\/',\s*'search'/, 'reference sidebar should not include search in the primary reference IA');
  });

  it('surfaces llm-wiki X/Twitter material as source-aware dashboard signals', () => {
    assert.ok(existsSync(signalsPath), 'curated signals data file should exist');
    for (const required of [
      '2058671232002990136',
      '2058383135868666111',
      '2058227392024560022',
      '2057816322583728479',
      'x-twitter-daily-2026-05-25.md',
      'x-twitter-bryan-johnson-2026-05-22.md',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `signals should cite ${required}`);
    }
    assert.match(indexSource, /curatedSignals/, 'overview should render curatedSignals rather than only generic curated cards');
    assert.match(indexSource, /Recent tweets\/signals/, 'right sidebar should include a recent tweets/signals panel');
    assert.doesNotMatch(indexSource, /Synthetic activity heatmap/i, 'activity panel must not identify itself as synthetic');
  });

  it('replaces right-sidebar placeholders with real watch queue, source counts, and curated activity', () => {
    for (const phrase of ['watchQueue', 'sourceCounts', 'curatedActivity', 'Protocol tabs backed']) {
      assert.match(indexSource, new RegExp(phrase), `overview should use real sidebar data: ${phrase}`);
    }
    for (const phrase of ['Enhanced Games follow-up', 'Kate Tolo baseline', 'Microplastics testing', '82 unique tweet URLs', '11 tweets with engagement']) {
      assert.match(signalsSource, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `signals/sidebar data should include ${phrase}`);
    }
    assert.doesNotMatch(indexSource, /index \* 17|updateCards\[0\]|next curated publish pass/, 'right sidebar should not use deterministic placeholder formulas or newest-card watch copy');
  });

  it('adds source-aware protocol and concept routes for all reference categories', () => {
    for (const file of [conceptsPagePath, nutritionPagePath, sleepPagePath]) {
      assert.ok(existsSync(file), `missing route: ${file.pathname}`);
    }
    for (const category of ['health', 'longevity', 'nutrition', 'sleep']) {
      assert.match(protocolsSource, new RegExp(`category:\\s*['"]${category}['"]`), `protocol data missing ${category}`);
    }
    assert.match(conceptsPageSource, /conceptEntries/, 'concepts route should render curated concept entries');
    assert.match(conceptsPageSource, /Female-specific Blueprint/, 'concepts route should include source-aware concepts without dedicated wiki pages');
    assert.match(nutritionPageSource, /source-aware|not medical advice/i, 'nutrition page should preserve source-aware medical caution');
    assert.match(sleepPageSource, /source-aware|not medical advice/i, 'sleep page should preserve source-aware medical caution');
  });
});
