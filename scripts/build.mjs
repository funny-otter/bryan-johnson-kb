import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('astro', ['build']);

// Pagefind's Linux ARM binary currently fails on this Raspberry Pi due to the
// host page size / jemalloc combo. Cloudflare Pages runs on x64, so generate
// the search index there while keeping local/Hermes cron builds verifiable.
if (process.arch === 'arm64' || process.env.PAGEFIND === '0') {
  console.log('Skipping Pagefind on this host; Cloudflare Pages x64 build can generate it.');
} else {
  run('pagefind', ['--site', 'dist']);
}
