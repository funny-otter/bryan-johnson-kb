export class InvalidMetricQueryError extends Error {
  code: 'invalid_query';
  details: Record<string, unknown>;
}

export type MetricRange = '24h' | '7d' | '30d';
export type MetricContentType = 'all' | 'x_post' | 'blog';

export type MetricQuery = {
  range?: MetricRange | string;
  contentType?: MetricContentType | string;
  content_type?: MetricContentType | string;
  anchor?: string;
};

export type SourceRecord = {
  id?: string;
  title?: string;
  sourcePath?: string;
  contentType?: MetricContentType;
  date?: string;
};

export function validateMetricQuery(query?: MetricQuery): {
  range: MetricRange;
  contentType: MetricContentType;
};

export function buildContentMetrics(records?: SourceRecord[], query?: MetricQuery): Record<string, unknown>;

export function buildSourceRecords(input?: {
  manifestPages?: SourceRecord[];
  dashboardSources?: string[];
}): SourceRecord[];
