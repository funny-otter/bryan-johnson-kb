# Bryan Johnson KB

Static Astro knowledge site generated from the local LLM Wiki at `/home/chad/wiki`.

## Architecture

```text
LLM Wiki (/home/chad/wiki)
  -> scripts/sync-from-wiki.mjs
  -> Astro content collections
  -> static HTML in dist/
  -> Cloudflare Pages deploy from GitHub
```

## Commands

```bash
npm run sync:wiki   # regenerate src/content from the wiki
npm run build       # sync, build Astro, and generate Pagefind search index
npm run dev         # local development server
```

## Cloudflare Pages

Use:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22`

The site is static. GitHub pushes trigger Cloudflare Pages deploys.
