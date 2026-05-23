# Bryan Johnson KB

Curated static Astro knowledge site derived from the local LLM Wiki at `/home/chad/wiki`.

## Architecture

```text
LLM Wiki (/home/chad/wiki)
  -> Hermes/Librarian agent reviews recent changes
  -> agent decides what belongs on the public dashboard
  -> agent edits Astro content/pages deliberately
  -> static HTML in dist/
  -> Cloudflare Pages deploy from GitHub
```

The website is **not** a one-to-one mirror of the wiki. The wiki is the canonical research base; this repo is a curated public presentation layer.

## Commands

```bash
npm run build       # build Astro and generate Pagefind search index when supported
npm run dev         # local development server
npm run check       # Astro/TypeScript checks
```

`npm run sync:wiki` exists only as a manual/bootstrap helper. It should not run automatically in Cloudflare builds or cron publishing; agent jobs should evaluate wiki changes and update the site intentionally.

## Cloudflare Pages

Use:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22`

The site is static. GitHub pushes trigger Cloudflare Pages deploys.
