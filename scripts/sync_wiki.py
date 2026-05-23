#!/usr/bin/env python3
"""Sync curated LLM Wiki pages into Astro content collections.

Raw sources are intentionally not published. This script copies only curated pages
from entities/, concepts/, comparisons/, and queries/ into src/content/knowledge/.
"""
from __future__ import annotations

import datetime as dt
import os
import re
import shutil
import sys
from pathlib import Path

WIKI = Path(os.environ.get("WIKI_PATH", "/home/chad/wiki")).expanduser()
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "content" / "knowledge"
PUBLIC_DIRS = {
    "entities": "entity",
    "concepts": "concept",
    "comparisons": "comparison",
    "queries": "query",
}

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n?", re.S)
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]")
INDEX_SUMMARY_RE = re.compile(r"^- \[\[([^\]]+)\]\]\s+—\s+(.+)$")


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "untitled"


def parse_frontmatter(markdown: str) -> tuple[dict[str, object], str]:
    match = FRONTMATTER_RE.match(markdown)
    if not match:
        return {}, markdown
    raw = match.group(1)
    body = markdown[match.end():]
    data: dict[str, object] = {}
    for line in raw.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if value.startswith("[") and value.endswith("]"):
            items = [x.strip().strip('"\'') for x in value[1:-1].split(",") if x.strip()]
            data[key] = items
        else:
            data[key] = value.strip('"\'')
    return data, body


def load_index_summaries() -> dict[str, str]:
    index = WIKI / "index.md"
    if not index.exists():
        return {}
    summaries: dict[str, str] = {}
    for line in index.read_text(errors="replace").splitlines():
        match = INDEX_SUMMARY_RE.match(line.strip())
        if match:
            summaries[slugify(match.group(1))] = match.group(2).strip()
    return summaries


def first_heading(body: str, fallback: str) -> str:
    for line in body.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback.replace("-", " ").title()


def yaml_scalar(value: str) -> str:
    escaped = value.replace('"', '\\"')
    return f'"{escaped}"'


def yaml_list(values: list[str]) -> str:
    if not values:
        return "[]"
    return "[" + ", ".join(yaml_scalar(str(v)) for v in values) + "]"


def convert_wikilinks(body: str) -> str:
    def repl(match: re.Match[str]) -> str:
        target = slugify(match.group(1))
        label = match.group(2) or match.group(1).replace("-", " ").title()
        return f"[{label}](/knowledge/{target}/)"
    return WIKILINK_RE.sub(repl, body)


def clean_body(body: str, title: str) -> str:
    # Astro page already renders the title; remove a duplicate H1 if present.
    lines = body.strip().splitlines()
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
    body = "\n".join(lines).strip() + "\n"
    return convert_wikilinks(body)


def sync() -> int:
    if not WIKI.exists():
        raise SystemExit(f"Wiki path does not exist: {WIKI}")

    summaries = load_index_summaries()
    tmp = OUT.with_suffix(".tmp")
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir(parents=True)

    count = 0
    today = dt.date.today().isoformat()
    for directory, default_type in PUBLIC_DIRS.items():
        source_dir = WIKI / directory
        if not source_dir.exists():
            continue
        for src in sorted(source_dir.glob("*.md")):
            slug = slugify(src.stem)
            raw = src.read_text(errors="replace")
            fm, body = parse_frontmatter(raw)
            title = str(fm.get("title") or first_heading(body, src.stem))
            summary = str(fm.get("summary") or summaries.get(slug) or "")
            page_type = str(fm.get("type") or default_type)
            if page_type not in {"entity", "concept", "comparison", "query", "summary"}:
                page_type = default_type
            updated = str(fm.get("updated") or fm.get("created") or today)
            tags_raw = fm.get("tags")
            tags = tags_raw if isinstance(tags_raw, list) else []
            content = [
                "---",
                f"title: {yaml_scalar(title)}",
                f"summary: {yaml_scalar(summary)}",
                f"type: {page_type}",
                f"sourcePath: {yaml_scalar(str(src.relative_to(WIKI)))}",
                f"updated: {updated}",
                f"tags: {yaml_list([str(t) for t in tags])}",
                "---",
                "",
                clean_body(body, title),
            ]
            (tmp / f"{slug}.md").write_text("\n".join(content).rstrip() + "\n")
            count += 1

    if OUT.exists():
        shutil.rmtree(OUT)
    tmp.rename(OUT)
    print(f"Synced {count} wiki pages from {WIKI} to {OUT}")
    return count


if __name__ == "__main__":
    try:
        synced = sync()
    except Exception as exc:
        print(f"sync_wiki failed: {exc}", file=sys.stderr)
        raise
    raise SystemExit(0 if synced >= 0 else 1)
