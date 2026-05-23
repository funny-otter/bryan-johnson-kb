# Bryan Johnson KB Agent Instructions

This repo is a curated public dashboard, not a one-to-one mirror of `/home/chad/wiki`.

## Source of truth

- Canonical research source: `/home/chad/wiki` (`llm-wiki`).
- Public website: this Astro repo at `/home/chad/projects/bryan-johnson-kb`.
- The website should present synthesized, reader-friendly dashboard content about Bryan Johnson, Blueprint, Don't Die, health/longevity advice, claims, opinions, and source-aware context.

## Publishing rule

Do **not** blindly copy every changed wiki page into the website. Daily publishing must be agent-curated:

1. Orient to the wiki first: read `/home/chad/wiki/SCHEMA.md`, `/home/chad/wiki/index.md`, and recent `/home/chad/wiki/log.md`.
2. Identify recent Bryan Johnson / Blueprint / longevity-relevant changes.
3. Evaluate whether the change belongs on the public dashboard. Skip private, raw, low-signal, duplicate, or internal wiki maintenance material.
4. Synthesize changes into the existing site structure. Update prose, cards, timeline, sources, and pages deliberately.
5. Prefer concise explanatory summaries with source paths over verbatim wiki dumps.
6. Preserve medical caution: the site can summarize Bryan Johnson's advice and claims, but should not present it as personal medical advice.
7. Run `npm run build` and `npm run check` before committing.
8. Commit and push only if the site meaningfully changed.

## Useful commands

```bash
npm run dev
npm run build
npm run check
```

`npm run sync:wiki` is only a bootstrap/manual inspection helper. It is not the publishing workflow.
