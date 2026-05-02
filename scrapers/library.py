from __future__ import annotations

import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from upsert import upsert_events
from utils import clean_text, fetch_soup, parse_datetime_range


BASE_URL = "https://www.library.ucla.edu"
LIST_URL = f"{BASE_URL}/visit/events-exhibitions/"


def _category_from_type(event_type: str | None) -> str:
    normalized = (event_type or "").lower()
    if "workshop" in normalized:
        return "workshops"
    if any(keyword in normalized for keyword in ("screening", "performance")):
        return "fun"
    if any(keyword in normalized for keyword in ("presentation", "research")):
        return "academic"
    return "fun"


def _is_time_line(value: str | None) -> bool:
    if not value:
        return False
    return bool(re.search(r"\b\d{1,2}:\d{2}\s*(am|pm)\b", value, re.IGNORECASE))


def _is_location(value: str | None) -> bool:
    if not value:
        return False
    normalized = value.strip()
    if len(normalized) > 120:
        return False
    if re.search(r"[.!?]$", normalized):
        return False
    if normalized.lower().startswith(("co-sponsored", "led by", "hosted by")):
        return False
    return True


def _title_from_detail(soup: BeautifulSoup, fallback: str | None) -> str | None:
    heading = soup.find("h1")
    if heading:
        return clean_text(heading.get_text(" "))
    if soup.title:
        title = clean_text(soup.title.get_text(" "))
        if title:
            return re.sub(r"\s*\|\s*UCLA Library$", "", title).strip()
    return fallback


def _detail_lines(soup: BeautifulSoup) -> list[str]:
    main = soup.select_one("main") or soup
    return [line.strip() for line in main.get_text("\n", strip=True).split("\n") if line.strip()]


def _location_from_detail(soup: BeautifulSoup, date_text: str, time_text: str) -> str | None:
    lines = _detail_lines(soup)
    for index, line in enumerate(lines):
        if line == date_text and index + 1 < len(lines) and lines[index + 1] == time_text:
            if index + 2 < len(lines):
                candidate = clean_text(lines[index + 2])
                if candidate and candidate.lower() not in {"more details", "register", "rsvp"} and _is_location(candidate):
                    return candidate
    return None


def _description_from_detail(soup: BeautifulSoup, fallback: str | None) -> str | None:
    paragraphs: list[str] = []
    for node in soup.select("main p"):
        text = clean_text(node.get_text(" "))
        if not text:
            continue
        if text.startswith("We're here to help."):
            continue
        if text not in paragraphs:
            paragraphs.append(text)

    if paragraphs:
        return "\n\n".join(paragraphs[:8])
    return fallback


def _ticket_url(soup: BeautifulSoup) -> str | None:
    for anchor in soup.find_all("a", href=True):
        text = clean_text(anchor.get_text(" ")) or ""
        if "register" in text.lower() or "rsvp" in text.lower() or "more details" in text.lower():
            href = anchor["href"]
            if href.startswith("#"):
                continue
            return urljoin(BASE_URL, href)
    return None


def _image_url(soup: BeautifulSoup) -> str | None:
    for image in soup.select("main img[src]"):
        src = image.get("src")
        if not src:
            continue
        alt = clean_text(image.get("alt"))
        if alt and "UCLA Library" in alt:
            continue
        return urljoin(BASE_URL, src)
    return None


def _event_from_card(card: BeautifulSoup) -> dict[str, str | None] | None:
    anchor = card.find("a", href=True)
    if not anchor:
        return None

    lines = [line.strip() for line in card.get_text("\n", strip=True).split("\n") if line.strip()]
    if len(lines) < 4:
        return None

    event_type = clean_text(lines[0])
    title = clean_text(lines[1])
    date_text = clean_text(lines[2])
    time_text = clean_text(lines[3])
    if not date_text or not _is_time_line(time_text):
        return None

    url = urljoin(BASE_URL, anchor["href"])
    detail_soup = fetch_soup(url)
    start_datetime, end_datetime = parse_datetime_range(date_text, time_text)
    detail_location = _location_from_detail(detail_soup, date_text, time_text)

    listing_location = None
    if len(lines) > 4 and not lines[4].lower().startswith(("register", "more details")):
        if _is_location(lines[4]):
            listing_location = clean_text(lines[4])

    ticket_url = _ticket_url(detail_soup)
    return {
        "title": _title_from_detail(detail_soup, title),
        "description": _description_from_detail(detail_soup, None),
        "start_datetime": start_datetime,
        "end_datetime": end_datetime,
        "location": detail_location or listing_location,
        "url": url,
        "ticket_url": ticket_url,
        "price": "Free",
        "category": _category_from_type(event_type),
        "source": "library",
        "image_url": _image_url(detail_soup),
        "is_active": True,
        "status": "active",
    }


def scrape_library() -> list[dict[str, str | None]]:
    soup = fetch_soup(LIST_URL)
    events: list[dict[str, str | None]] = []
    seen_urls: set[str] = set()

    for card in soup.select("div.card-meta.event"):
        event = _event_from_card(card)
        if not event or not event.get("url"):
            continue
        if event["url"] in seen_urls:
            continue
        seen_urls.add(event["url"])
        events.append(event)

    return events


if __name__ == "__main__":
    scraped_events = scrape_library()
    print(f"Scraped {len(scraped_events)} UCLA Library event(s)")
    upsert_events(scraped_events)
