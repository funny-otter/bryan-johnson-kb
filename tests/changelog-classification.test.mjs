import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import matter from 'gray-matter';
import { partitionChangelogUpdates } from '../src/data/changelog-classification.mjs';

const loadUpdate = (relativePath) => {
  const fileUrl = new URL(relativePath, import.meta.url);
  const parsed = matter(readFileSync(fileUrl, 'utf8'));
  return {
    id: relativePath,
    body: parsed.content,
    data: parsed.data,
  };
};

describe('changelog classification', () => {
  it('routes reader-facing research-watch claims to protocol updates', () => {
    const viagraStatinUpdate = loadUpdate('../src/content/updates/2026-08-04-viagra-statin-cancer-claim-curation.md');
    const exVivoUpdate = loadUpdate('../src/content/updates/2026-07-17-ex-vivo-crosslink-research-curation.md');
    const { protocolUpdates, siteChangelog } = partitionChangelogUpdates([viagraStatinUpdate, exVivoUpdate]);

    assert.ok(protocolUpdates.includes(viagraStatinUpdate), 'Aug 4 Viagra/statin claim must be a protocol update');
    assert.ok(!siteChangelog.includes(viagraStatinUpdate), 'Aug 4 Viagra/statin claim must not be a site changelog entry');
    assert.ok(protocolUpdates.includes(exVivoUpdate), 'ex-vivo longevity research-watch claim must be a protocol update');
  });

  it('keeps explicit research-ingest operations in the site changelog', () => {
    const researchIngest = loadUpdate('../src/content/updates/2026-05-22-ingest-bryan-johnson-blueprint-dont-die-research.md');
    const { protocolUpdates, siteChangelog } = partitionChangelogUpdates([researchIngest]);

    assert.ok(siteChangelog.includes(researchIngest), 'source research and ingest maintenance must stay in the site changelog');
    assert.ok(!protocolUpdates.includes(researchIngest), 'site research operations must not become protocol updates');
  });
});
