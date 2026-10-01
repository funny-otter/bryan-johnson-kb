---
title: 'Sea-level rebound curation'
date: '2026-10-01'
source: builder-tweet-check
wikiPaths:
  - knowledge/raw/x/2026-10-01/2026-10-01-bryan-johnson-batch.md
---
# Sea-level rebound curation

- Reviewed the single daily tweet-check batch that arrived after the September 30 publication: the October 1 capture (1 post from September 30, 14:30 UTC). The wiki itself has been quiet since September 5, so the durable raw-store capture under `knowledge/raw/x/` is the source of this pass.
- Ran a bounded read-only Bird timeline audit (`bird user-tweets @bryan_johnson -n 200 --json`, 194 posts spanning August 14–September 30) to verify there was no coverage gap between the September 30 publication (last covered post September 29 22:28 UTC) and the October 1 batch window. Result: no gap—the September 30 14:30 UTC rebound post is the newest item on the timeline, and nothing exists after it.
- Promoted the September 30 sea-level rebound post: the epilogue to the September 29 altitude readout, posted as mirror wearable deltas—sleep up 13%, “nervous system” up 17%, resting heart rate down 12%—“my body slingshotted in rebound from 5 days of acute hypoxic stress.” Verified the direction against published descent research: Deflorin et al., J Clin Sleep Med, published July 22, 2026 (10.1007/s44470-026-00128-1; Crossref-verified; NCT05826808), a randomized crossover trial in 44 healthy moderate-altitude residents where two nights at 590 m reduced nocturnal hypoxemia (T90 5→1 min), sleep-disordered breathing (AHI 14.2→9.2/h, ODI 10.0→6.0/h), and raised mean nocturnal SpO₂ 93.8%→95.2% versus living above 1,000 m, with more slow-wave sleep on the second low-altitude night. Kept the boundary visible: the same proprietary wearable-index percentages over a single recovery night with no baseline window, an unmeasured “slingshot” claim, and trial descenders who live at altitude rather than a sea-level traveler returning from 7,000 ft, measuring breathing and oxygen rather than any wearable index.
- Added: one curated signal, one timeline row, two curated-activity rows (September 30), rotated source counts (latest capture October 1 batch; 194-post audit; Deflorin 2026 verified; prior captures and altitude literature demoted to earlier labels), one sleep-protocol guidance row, one sleep-protocol dossier card, and dated paragraphs on the bryan-johnson, biomarker-driven-longevity-protocols, and algorithmic-health knowledge pages.
- Source provenance: the October 1 tweet-check batch under `knowledge/raw/x/` plus the live read-only Bird timeline audit at curation time; no posts newer than the September 30 14:30 UTC capture were present.
