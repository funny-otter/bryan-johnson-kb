import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexSource = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const contentConfig = readFileSync(new URL('../src/content.config.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

assert.match(indexSource, /getCollection\('updates'\)/, 'home page should load update entries for the changelog tab');
assert.match(indexSource, /overview-tab-overview/, 'home page should include an Overview tab control');
assert.match(indexSource, /overview-tab-changelog/, 'home page should include a Changelog tab control');
assert.match(indexSource, /Recent news/i, 'overview should label prominent recent news separately from update history');
assert.match(indexSource, /changelog/i, 'home page should render changelog/update-history content');
assert.match(contentConfig, /const updates = defineCollection/, 'content config should define an updates collection');
assert.match(contentConfig, /collections = \{ knowledge, updates \}/, 'updates collection should be exported');
assert.match(styles, /\.overview-tabs/, 'global styles should include tab layout styles');
assert.match(styles, /\.news-card/, 'global styles should include readable recent-news card styles');
assert.match(styles, /\.changelog-list/, 'global styles should include changelog list styles');
