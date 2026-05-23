#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/chad/projects/bryan-johnson-kb"
export WIKI_PATH="${WIKI_PATH:-/home/chad/wiki}"
export PATH="/home/chad/.local/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"

cd "$REPO_DIR"

# Keep local checkout up to date before generating content.
git fetch origin main --quiet || true
if git rev-parse --verify origin/main >/dev/null 2>&1; then
  git merge --ff-only origin/main --quiet || true
fi

npm run build

if git diff --quiet && git diff --cached --quiet; then
  echo "No website changes after wiki sync."
  exit 0
fi

git add package.json package-lock.json astro.config.mjs tsconfig.json wrangler.toml README.md public scripts src .gitignore

git -c user.name="funny-otter-bot" \
    -c user.email="funny-otter@users.noreply.github.com" \
    commit -m "chore: sync website from llm wiki"

git push origin main
