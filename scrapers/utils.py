from __future__ import annotations

import json
import os
import re
from datetime import UTC, datetime, time
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag
from dateutil import parser
from zoneinfo import ZoneInfo


LOS_ANGELES = ZoneInfo("America/Los_Angeles")
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; BruinboardBot/1.0; "
        "+https://github.com/doubledurians/bruinboard)"
    )
}


def load_local_env() -> None:
    """Load local env files when scripts are run outside GitHub Actions."""
    root = Path(__file__).resolve().parents[1]
    for filename in (".env.local", ".env.local.txt"):
        path = root / filename
        if not path.exists():
            continue

        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def fetch_soup(url: str) -> BeautifulSoup:
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def clean_text(value: str | None) -> str | None:
    if value is None:
        return None
    text = re.sub(r"\s+", " ", value).strip()
    return text or None


def absolute_url(base_url: str, href: str | None) -> str | None:
    if not href:
        return None
    return urljoin(base_url, href)


def to_utc_iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=LOS_ANGELES)
    return dt.astimezone(UTC).isoformat().replace("+00:00", "Z")


def parse_datetime_range(date_text: str, time_text: str | None = None) -> tuple[str, str | None]:
    combined = clean_text(f"{date_text} {time_text or ''}") or date_text
    normalized = combined.replace("–", "-").replace("—", "-")
    parts = [part.strip() for part in normalized.split(" - ", 1)]

    start = parser.parse(parts[0], fuzzy=True, default=datetime.combine(datetime.now(), time(0, 0)))
    end: datetime | None = None

    if len(parts) == 2:
        end_text = parts[1]
        try:
            if re.search(r"[A-Za-z]+ \d{1,2}, \d{4}", end_text):
                end = parser.parse(end_text, fuzzy=True, default=start)
            else:
                end = parser.parse(
                    f"{start.strftime('%B %d, %Y')} {end_text}",
                    fuzzy=True,
                    default=start,
                )
        except (ValueError, OverflowError):
            end = None

    return to_utc_iso(start), to_utc_iso(end) if end else None


def parse_json_ld(soup: BeautifulSoup) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for script in soup.select('script[type="application/ld+json"]'):
        if not script.string:
            continue
        try:
            data = json.loads(script.string)
        except json.JSONDecodeError:
            continue
        stack = data if isinstance(data, list) else [data]
        for item in stack:
            if isinstance(item, dict) and "@graph" in item and isinstance(item["@graph"], list):
                items.extend(node for node in item["@graph"] if isinstance(node, dict))
            elif isinstance(item, dict):
                items.append(item)
    return items


def first_meta_content(soup: BeautifulSoup, *selectors: str) -> str | None:
    for selector in selectors:
        tag = soup.select_one(selector)
        if isinstance(tag, Tag):
            content = tag.get("content")
            if isinstance(content, str) and content.strip():
                return content.strip()
    return None


def page_title(soup: BeautifulSoup) -> str | None:
    title = soup.select_one("h1")
    if title:
        return clean_text(title.get_text(" "))
    if soup.title:
        return clean_text(soup.title.get_text(" "))
    return None


def main_text(soup: BeautifulSoup) -> str | None:
    for selector in ("main", "article", ".field--name-body", ".node__content", "#main-content"):
        node = soup.select_one(selector)
        if node:
            return clean_text(node.get_text(" "))
    return clean_text(soup.get_text(" "))
