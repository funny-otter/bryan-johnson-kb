import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = async (path) => readFile(new URL(path, root), 'utf8');

const layout = await read('src/layouts/BaseLayout.astro');
assert.match(layout, /\['\/metrics\/',\s*'Metrics'\]/, 'top navigation exposes a Metrics tab');

const page = await read('src/pages/metrics/index.astro');
assert.match(page, /data-metrics-dashboard/, 'metrics page mounts an interactive dashboard');
assert.match(page, /data-range="24h"/, 'dashboard includes a 24h range selector');
assert.match(page, /data-range="7d"/, 'dashboard includes a 7d range selector');
assert.match(page, /data-range="30d"/, 'dashboard includes a 30d range selector');
assert.match(page, /Loading metrics/, 'dashboard includes a loading state');
assert.match(page, /No metric data/, 'dashboard includes an empty state');
assert.match(page, /Unable to load metrics/, 'dashboard includes an error state');
assert.match(page, /\/api\/metrics\/content\?/, 'dashboard integrates with the metric API endpoint');
assert.match(page, /x_post/, 'dashboard handles X post metrics');
assert.match(page, /blog/, 'dashboard handles blog metrics');
assert.match(page, /viewBox="0 0 100 40"/, 'dashboard renders responsive SVG graphs');

const css = await read('src/styles/global.css');
assert.match(css, /\.metric-dashboard/, 'global styles include metric dashboard layout');
assert.match(css, /\.metric-graph/, 'global styles include graph presentation');

console.log('metrics UI contract checks passed');
