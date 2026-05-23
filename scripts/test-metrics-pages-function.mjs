import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/api/metrics/content.json.js';

const okResponse = await onRequestGet({
  request: new Request('https://example.test/api/metrics/content.json?range=24h&contentType=x_post'),
});
assert.equal(okResponse.status, 200);
const okPayload = await okResponse.json();
assert.equal(okPayload.range, '24h');
assert.equal(okPayload.contentType, 'x_post');
assert.deepEqual(Object.keys(okPayload.series), ['x_post']);
assert.equal(okPayload.series.x_post.buckets.length, 24);

const invalidResponse = await onRequestGet({
  request: new Request('https://example.test/api/metrics/content.json?range=90d'),
});
assert.equal(invalidResponse.status, 400);
const invalidPayload = await invalidResponse.json();
assert.equal(invalidPayload.error, 'invalid_query');
assert.equal(invalidPayload.details.parameter, 'range');

console.log('metrics Pages function checks passed');
