import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = async (path) => readFile(new URL(path, root), 'utf8');

const config = await read('astro.config.mjs');
assert.match(config, /output:\s*['"]static['"]/, 'Astro keeps static output for Cloudflare Pages');
assert.doesNotMatch(config, /@astrojs\/cloudflare/, 'Astro config does not switch the Pages site to the Workers adapter');

const endpoint = await read('src/pages/api/metrics/content.json.ts');
assert.match(endpoint, /new URL\(request\.url\)/, 'static-build metric JSON endpoint reads query params in dev');
assert.match(endpoint, /InvalidMetricQueryError/, 'static-build metric JSON endpoint returns explicit invalid query errors in dev');

const pagesFunction = await read('functions/api/metrics/content.json.js');
assert.match(pagesFunction, /onRequestGet/, 'Cloudflare Pages function exposes the production metric API route');
assert.match(pagesFunction, /new URL\(request\.url\)/, 'Cloudflare Pages function reads runtime request query params');
assert.match(pagesFunction, /buildContentMetrics/, 'Cloudflare Pages function reuses the metric aggregation implementation');
assert.match(pagesFunction, /InvalidMetricQueryError/, 'Cloudflare Pages function preserves invalid-query HTTP 400 handling');

console.log('metrics runtime contract checks passed');
