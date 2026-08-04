const protocolSignalPattern = /\b(protocol|biomarker|biomarkers|microplastics|metformin|longevity|time profile|years critique|blueprint biomarkers)\b/i;

// These titles describe publishing/research operations, not reader-facing medical or longevity claims.
const siteOperationTitlePattern = /@bryan_johnson|\b(changelog curation|curation pass|wiki reconciliation|index\/source-map cleanup|source[- ]?map cleanup|ingest|backfill)\b|^Bryan Johnson \/ Blueprint \/ Don't Die research$/i;

const updateSearchText = (update) => [
  update.data.title,
  update.body || '',
  ...(update.data.wikiPaths || []),
].join(' ');

export const isProtocolUpdate = (update) => {
  if (siteOperationTitlePattern.test(update.data.title)) return false;
  return protocolSignalPattern.test(updateSearchText(update));
};

export const partitionChangelogUpdates = (updates) => ({
  protocolUpdates: updates.filter(isProtocolUpdate),
  siteChangelog: updates.filter((update) => !isProtocolUpdate(update)),
});
