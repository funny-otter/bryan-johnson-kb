import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildContentMetrics,
  validateMetricQuery,
} from '../src/lib/content-metrics.mjs';

const records = [
  { id: 'x-new', sourcePath: 'raw/articles/bryan-johnson-x-new-2026-05-22.md' },
  { id: 'x-old', sourcePath: 'raw/articles/bryan-johnson-x-old-2026-05-21.md' },
  { id: 'blog-new', sourcePath: 'raw/articles/bryan-johnson/blog-home-2026-05-22.md' },
  { id: 'blog-old', sourcePath: 'raw/articles/bryan-johnson/blog-protocol-2026-05-15.md' },
];

describe('validateMetricQuery', () => {
  it('accepts supported ranges and content types with sensible defaults', () => {
    assert.deepEqual(validateMetricQuery({}), { range: '7d', contentType: 'all' });
    assert.deepEqual(validateMetricQuery({ range: '24h', contentType: 'x_post' }), {
      range: '24h',
      contentType: 'x_post',
    });
  });

  it('rejects unsupported ranges and content types', () => {
    assert.throws(() => validateMetricQuery({ range: '90d' }), /invalid_query/);
    assert.throws(() => validateMetricQuery({ contentType: 'video' }), /invalid_query/);
  });
});

describe('buildContentMetrics', () => {
  it('returns daily buckets and totals split by all supported content types', () => {
    const response = buildContentMetrics(records, { range: '7d', contentType: 'all' });

    assert.equal(response.range, '7d');
    assert.equal(response.granularity, 'day');
    assert.equal(response.anchor, '2026-05-22T23:59:59.999Z');
    assert.deepEqual(response.totals, { all: 3, x_post: 2, blog: 1 });
    assert.equal(response.series.all.buckets.length, 7);
    assert.equal(response.series.x_post.buckets.at(-1).count, 1);
    assert.equal(response.series.blog.buckets.at(-1).count, 1);
    assert.equal(response.series.blog.buckets[0].count, 0);
  });

  it('returns 24 hourly buckets when range is 24h', () => {
    const response = buildContentMetrics(records, { range: '24h', contentType: 'all' });

    assert.equal(response.granularity, 'hour');
    assert.equal(response.series.all.buckets.length, 24);
    assert.equal(response.totals.all, 2);
    assert.equal(response.series.all.buckets.at(-1).count, 2);
  });

  it('can filter the visible series by content type while preserving split totals', () => {
    const response = buildContentMetrics(records, { range: '30d', contentType: 'x_post' });

    assert.deepEqual(Object.keys(response.series), ['x_post']);
    assert.deepEqual(response.totals, { all: 4, x_post: 2, blog: 2 });
  });

  it('handles no data with a deterministic zero-filled response', () => {
    const response = buildContentMetrics([], {
      range: '7d',
      contentType: 'all',
      anchor: '2026-05-22T23:59:59.999Z',
    });

    assert.equal(response.total, 0);
    assert.deepEqual(response.totals, { all: 0, x_post: 0, blog: 0 });
    assert.equal(response.series.all.buckets.length, 7);
    assert.ok(response.series.all.buckets.every((bucket) => bucket.count === 0));
  });
});
