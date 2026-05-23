// @ts-nocheck
import wikiManifest from '../../../data/wiki-manifest.json';
import { opinionItems, timelineEvents } from '../../../data/dashboard-sections';
import {
  buildContentMetrics,
  buildSourceRecords,
  InvalidMetricQueryError,
} from '../../../lib/content-metrics.mjs';

export function GET({ request }) {
  const url = new URL(request.url);
  const query = {
    range: url.searchParams.get('range') ?? undefined,
    contentType: url.searchParams.get('contentType') ?? url.searchParams.get('content_type') ?? undefined,
  };

  try {
    const records = buildSourceRecords({
      manifestPages: wikiManifest.pages,
      dashboardSources: collectDashboardSources(),
    });
    const payload = buildContentMetrics(records, query);

    return json(payload, 200);
  } catch (error) {
    if (error instanceof InvalidMetricQueryError) {
      return json(
        {
          error: 'invalid_query',
          message: error.message,
          details: error.details,
        },
        400,
      );
    }

    return json(
      {
        error: 'metrics_unavailable',
        message: 'Unable to build content metrics.',
      },
      500,
    );
  }
}

function collectDashboardSources() {
  return [
    ...opinionItems.flatMap((item) => item.sources),
    ...timelineEvents.map((event) => event.source),
  ];
}

function json(payload, status) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
}
