const SUPPORTED_RANGES = new Set(['24h', '7d', '30d']);
const SUPPORTED_CONTENT_TYPES = new Set(['all', 'x_post', 'blog']);

const RANGE_CONFIG = {
  '24h': { bucketCount: 24, granularity: 'hour', unitMs: 60 * 60 * 1000 },
  '7d': { bucketCount: 7, granularity: 'day', unitMs: 24 * 60 * 60 * 1000 },
  '30d': { bucketCount: 30, granularity: 'day', unitMs: 24 * 60 * 60 * 1000 },
};

export class InvalidMetricQueryError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'InvalidMetricQueryError';
    this.code = 'invalid_query';
    this.details = details;
  }
}

export function validateMetricQuery(query = {}) {
  const range = String(query.range ?? '7d');
  const contentType = String(query.contentType ?? query.content_type ?? 'all');

  if (!SUPPORTED_RANGES.has(range)) {
    throw new InvalidMetricQueryError(`invalid_query: unsupported range "${range}"`, {
      parameter: 'range',
      supported: [...SUPPORTED_RANGES],
    });
  }

  if (!SUPPORTED_CONTENT_TYPES.has(contentType)) {
    throw new InvalidMetricQueryError(`invalid_query: unsupported contentType "${contentType}"`, {
      parameter: 'contentType',
      supported: [...SUPPORTED_CONTENT_TYPES],
    });
  }

  return { range, contentType };
}

export function buildContentMetrics(records = [], query = {}) {
  const { range, contentType } = validateMetricQuery(query);
  const config = RANGE_CONFIG[range];
  const normalized = records.map(normalizeRecord).filter(Boolean);
  const anchor = normalizeAnchor(query.anchor, normalized, config.granularity);
  const buckets = createBuckets(anchor, config);
  const requestedTypes = contentType === 'all' ? ['all', 'x_post', 'blog'] : [contentType];
  const totals = { all: 0, x_post: 0, blog: 0 };
  const series = {};

  for (const type of requestedTypes) {
    series[type] = {
      contentType: type,
      total: 0,
      buckets: buckets.map((bucket) => ({ ...bucket, count: 0 })),
    };
  }

  for (const record of normalized) {
    const bucketIndex = buckets.findIndex(
      (bucket) => record.timestamp >= bucket.startMs && record.timestamp <= bucket.endMs,
    );
    if (bucketIndex < 0) continue;

    totals.all += 1;
    totals[record.contentType] += 1;

    if (series.all) {
      series.all.total += 1;
      series.all.buckets[bucketIndex].count += 1;
    }
    if (series[record.contentType]) {
      series[record.contentType].total += 1;
      series[record.contentType].buckets[bucketIndex].count += 1;
    }
  }

  for (const type of Object.keys(series)) {
    series[type].buckets = series[type].buckets.map(stripBucketInternals);
  }

  return {
    range,
    contentType,
    granularity: config.granularity,
    anchor: new Date(anchor).toISOString(),
    total: totals[contentType],
    totals,
    series,
  };
}

export function buildSourceRecords({ manifestPages = [], dashboardSources = [] } = {}) {
  const seen = new Set();
  const records = [];

  for (const page of manifestPages) {
    pushUnique(records, seen, {
      id: `page:${page.slug}`,
      title: page.title,
      sourcePath: page.sourcePath,
      date: page.updated ?? page.created,
    });
  }

  for (const sourcePath of dashboardSources) {
    pushUnique(records, seen, {
      id: `source:${sourcePath}`,
      title: sourcePath,
      sourcePath,
    });
  }

  return records;
}

function pushUnique(records, seen, record) {
  if (!record.sourcePath) return;
  const key = `${record.sourcePath}|${record.date ?? ''}`;
  if (seen.has(key)) return;
  seen.add(key);
  records.push(record);
}

function normalizeRecord(record) {
  const date = record.date ?? extractDate(record.sourcePath) ?? extractDate(record.id);
  if (!date) return null;

  return {
    id: record.id ?? record.sourcePath,
    sourcePath: record.sourcePath ?? record.id ?? '',
    contentType: record.contentType ?? classifyContentType(record.sourcePath ?? record.id ?? ''),
    timestamp: normalizeRecordTimestamp(date),
  };
}

function classifyContentType(sourcePath) {
  const path = sourcePath.toLowerCase();
  if (path.includes('x-twitter') || path.includes('-x-') || path.includes('/x-') || path.includes('twitter')) {
    return 'x_post';
  }
  return 'blog';
}

function extractDate(value = '') {
  const match = String(value).match(/(20\d{2})[-_/](\d{2})[-_/](\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function normalizeRecordTimestamp(dateLike) {
  if (typeof dateLike === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)) {
    return Date.parse(`${dateLike}T23:59:59.999Z`);
  }
  return Date.parse(dateLike);
}

function normalizeAnchor(anchor, records, granularity) {
  if (anchor) return Date.parse(anchor);
  if (records.length === 0) return Date.parse('1970-01-01T23:59:59.999Z');

  const latest = Math.max(...records.map((record) => record.timestamp));
  const latestDate = new Date(latest);

  if (granularity === 'day') {
    return Date.UTC(
      latestDate.getUTCFullYear(),
      latestDate.getUTCMonth(),
      latestDate.getUTCDate(),
      23,
      59,
      59,
      999,
    );
  }

  return Date.UTC(
    latestDate.getUTCFullYear(),
    latestDate.getUTCMonth(),
    latestDate.getUTCDate(),
    latestDate.getUTCHours(),
    59,
    59,
    999,
  );
}

function createBuckets(anchor, config) {
  const anchorDate = new Date(anchor);
  const anchorEnd = config.granularity === 'day'
    ? Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), anchorDate.getUTCDate(), 23, 59, 59, 999)
    : Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), anchorDate.getUTCDate(), anchorDate.getUTCHours(), 59, 59, 999);
  const firstStart = anchorEnd - (config.bucketCount * config.unitMs) + 1;

  return Array.from({ length: config.bucketCount }, (_, index) => {
    const startMs = firstStart + index * config.unitMs;
    const endMs = startMs + config.unitMs - 1;
    return {
      startMs,
      endMs,
      start: new Date(startMs).toISOString(),
      end: new Date(endMs).toISOString(),
    };
  });
}

function stripBucketInternals(bucket) {
  return {
    start: bucket.start,
    end: bucket.end,
    count: bucket.count,
  };
}
