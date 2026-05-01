from __future__ import annotations

from urllib.parse import urljoin

from bs4 import BeautifulSoup

from upsert import upsert_events
from utils import clean_text, fetch_soup, parse_datetime_range


BASE_URL = "https://www.international.ucla.edu"
LIST_URL = f"{BASE_URL}/burkle/events/"


def _description_from_detail(soup: BeautifulSoup, fallback: str | None) -> str | None:
    paragraphs: list[str] = []
    for node in soup.select(".main-body p"):
        text = clean_text(node.get_text(" "))
        if not text:
            continue
        if text.startswith("Sponsor(s):"):
            continue
        if text in paragraphs:
            continue
        paragraphs.append(text)

    useful = [
        text
        for text in paragraphs
        if not text.startswith("Wednesday,")
        and not text.startswith("Thursday,")
        and not text.startswith("Friday,")
        and not text.startswith("Saturday,")
        and not text.startswith("Sunday,")
        and not text.startswith("Monday,")
        and not text.startswith("Tuesday,")
    ]
    if useful:
        return "\n\n".join(useful)
    return fallback


def scrape_burkle() -> list[dict[str, str | None]]:
    soup = fetch_soup(LIST_URL)
    events: list[dict[str, str | None]] = []

    for block in soup.select(".current-place-element"):
        anchor = block.select_one(".current-place-text a[href*='/burkle/event/']")
        if not anchor:
            continue

        lines = [
            line.strip()
            for line in block.select_one(".current-place-text").get_text("\n", strip=True).split("\n")
            if line.strip()
        ]
        if len(lines) < 4:
            continue

        title = clean_text(anchor.get_text(" "))
        url = urljoin(BASE_URL, anchor.get("href", ""))
        abstract = clean_text(lines[1]) if len(lines) > 1 else None
        date_text = lines[2]
        time_text = lines[3] if len(lines) > 3 else None
        location = clean_text(lines[4]) if len(lines) > 4 else None
        start_datetime, end_datetime = parse_datetime_range(date_text, time_text)

        detail_soup = fetch_soup(url)
        description = _description_from_detail(detail_soup, abstract)

        events.append(
            {
                "title": title,
                "description": description,
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
                "location": location,
                "url": url,
                "ticket_url": None,
                "price": "Free",
                "category": "academic",
                "source": "burkle",
                "image_url": None,
                "is_active": True,
                "status": "active",
            }
        )

    return events


if __name__ == "__main__":
    scraped_events = scrape_burkle()
    print(f"Scraped {len(scraped_events)} Burkle event(s)")
    upsert_events(scraped_events)
