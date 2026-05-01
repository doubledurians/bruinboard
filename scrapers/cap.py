from __future__ import annotations

import re
from datetime import datetime
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from dateutil import parser

from upsert import upsert_events
from utils import clean_text, fetch_soup, parse_datetime_range, to_utc_iso


BASE_URL = "https://cap.ucla.edu"
LIST_URL = f"{BASE_URL}/calendar"


def _year_from_detail(soup: BeautifulSoup) -> int:
    text = soup.get_text(" ", strip=True)
    match = re.search(r"\b(20\d{2})\b", text)
    if match:
        return int(match.group(1))
    return datetime.now().year


def _datetime_from_listing(listing_text: str, year: int) -> tuple[str, str | None]:
    date_part, _, time_part = listing_text.partition("|")
    date_part = date_part.strip()
    time_part = time_part.strip().split(" ", 2)[:2]
    time_text = " ".join(time_part) if time_part else ""

    first_date = date_part.split(" - ", 1)[0]
    first_date = re.sub(r"^[A-Za-z]{3},\s*", "", first_date)
    start = parser.parse(f"{first_date}, {year} {time_text}", fuzzy=True)
    return to_utc_iso(start), None


def _title_from_detail(soup: BeautifulSoup) -> str | None:
    if soup.title:
        title = clean_text(soup.title.get_text(" "))
        if title:
            return re.sub(r"\s*\|\s*CAP UCLA.*$", "", title).strip()
    h1 = soup.find("h1")
    return clean_text(h1.get_text(" ")) if h1 else None


def _header_lines(soup: BeautifulSoup) -> list[str]:
    header = soup.select_one(".event-header") or soup.select_one("article")
    if not header:
        return []
    return [line.strip() for line in header.get_text("\n", strip=True).split("\n") if line.strip()]


def _location_from_header(lines: list[str]) -> str | None:
    date_index = next((index for index, line in enumerate(lines) if re.search(r"\b20\d{2}\b", line)), None)
    candidates = lines[date_index + 1 :] if date_index is not None else lines
    for line in candidates:
        if line in {"The Nimoy", "Royce Hall", "Freud Playhouse", "UCLA Little Theater"}:
            return line
        if "Theater" in line or "Hall" in line or "Playhouse" in line:
            return line
    return None


def _description_from_detail(soup: BeautifulSoup) -> str | None:
    paragraphs: list[str] = []
    for node in soup.select("article p, .node-content p"):
        text = clean_text(node.get_text(" "))
        if not text:
            continue
        if text.upper() in {"GET TICKETS", "UCLA STUDENTS"}:
            continue
        if text not in paragraphs:
            paragraphs.append(text)
    return "\n\n".join(paragraphs[:8]) if paragraphs else None


def _ticket_url(soup: BeautifulSoup) -> str | None:
    for anchor in soup.find_all("a", href=True):
        text = clean_text(anchor.get_text(" ")) or ""
        if "TICKET" in text.upper() and text.upper() != "TICKETS":
            return urljoin(BASE_URL, anchor["href"])
    return None


def _image_url(soup: BeautifulSoup) -> str | None:
    for image in soup.select("article img[src], .node-content img[src]"):
        src = image.get("src")
        alt = clean_text(image.get("alt"))
        if not src or (alt and "Center for Art and Performance UCLA" in alt):
            continue
        return urljoin(BASE_URL, src)
    return None


def scrape_cap() -> list[dict[str, str | None]]:
    soup = fetch_soup(LIST_URL)
    events: list[dict[str, str | None]] = []
    seen_urls: set[str] = set()

    for anchor in soup.select('a[href^="/event/"]'):
        listing_text = clean_text(anchor.get_text(" ")) or ""
        url = urljoin(BASE_URL, anchor["href"])
        if url in seen_urls:
            continue
        seen_urls.add(url)

        detail_soup = fetch_soup(url)
        year = _year_from_detail(detail_soup)
        try:
            start_datetime, end_datetime = _datetime_from_listing(listing_text, year)
        except (ValueError, OverflowError):
            lines = _header_lines(detail_soup)
            date_line = next((line for line in lines if re.search(r"\b20\d{2}\b", line)), "")
            start_datetime, end_datetime = parse_datetime_range(date_line.replace(" at ", " "))

        ticket_url = _ticket_url(detail_soup)
        events.append(
            {
                "title": _title_from_detail(detail_soup),
                "description": _description_from_detail(detail_soup),
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
                "location": _location_from_header(_header_lines(detail_soup)),
                "url": url,
                "ticket_url": ticket_url,
                "price": "Tickets required" if ticket_url else "Free",
                "category": "popup",
                "source": "cap_ucla",
                "image_url": _image_url(detail_soup),
                "is_active": True,
                "status": "active",
            }
        )

    return events


if __name__ == "__main__":
    scraped_events = scrape_cap()
    print(f"Scraped {len(scraped_events)} CAP UCLA event(s)")
    upsert_events(scraped_events)
