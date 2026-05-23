#!/usr/bin/env bash
set -euo pipefail

log_file="$(mktemp)"
trap 'rm -f "$log_file"' EXIT

if /home/chad/projects/bryan-johnson-kb/scripts/cron-sync-and-push.sh >"$log_file" 2>&1; then
  if grep -q "No website changes after wiki sync" "$log_file"; then
    exit 0
  fi
  cat "$log_file"
else
  cat "$log_file"
  exit 1
fi
