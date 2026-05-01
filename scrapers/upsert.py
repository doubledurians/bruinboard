from __future__ import annotations

import os
import sys
from datetime import datetime
from typing import Any

from supabase import Client, create_client

from utils import load_local_env


VALID_CATEGORIES = {"academic", "popup", "fun"}
VALID_SOURCES = {"burkle", "cap_ucla", "library"}
WRITABLE_FIELDS = {
    "title",
    "description",
    "start_datetime",
    "end_datetime",
    "location",
    "url",
    "ticket_url",
    "price",
    "category",
    "source",
    "image_url",
    "is_active",
    "scraped_at",
    "status",
}


def supabase_client() -> Client:
    load_local_env()
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. "
            "Add them to .env.local for local runs or GitHub Actions secrets."
        )
    return create_client(url, key)


def _validate_event(event: dict[str, Any]) -> dict[str, Any]:
    missing = [field for field in ("title", "start_datetime", "url", "category", "source") if not event.get(field)]
    if missing:
        raise ValueError(f"missing required field(s): {', '.join(missing)}")

    if event["category"] not in VALID_CATEGORIES:
        raise ValueError(f"invalid category: {event['category']}")
    if event["source"] not in VALID_SOURCES:
        raise ValueError(f"invalid source: {event['source']}")

    for field in ("start_datetime", "end_datetime"):
        if event.get(field):
            datetime.fromisoformat(str(event[field]).replace("Z", "+00:00"))

    cleaned = {key: value for key, value in event.items() if key in WRITABLE_FIELDS and value is not None}
    cleaned.setdefault("is_active", True)
    cleaned.setdefault("status", "active")
    cleaned["scraped_at"] = datetime.utcnow().isoformat() + "Z"
    return cleaned


def upsert_events(events: list[dict[str, Any]]) -> dict[str, int]:
    client = supabase_client()
    stats = {"processed": 0, "inserted": 0, "updated": 0, "failed": 0}

    for raw_event in events:
        stats["processed"] += 1
        try:
            event = _validate_event(raw_event)
            existing = (
                client.table("events")
                .select("id")
                .eq("url", event["url"])
                .limit(1)
                .execute()
            )

            if existing.data:
                event_id = existing.data[0]["id"]
                client.table("events").update(event).eq("id", event_id).execute()
                stats["updated"] += 1
            else:
                client.table("events").insert(event).execute()
                stats["inserted"] += 1
        except Exception as exc:
            stats["failed"] += 1
            print(f"ERROR upserting {raw_event.get('url', '<missing url>')}: {exc}", file=sys.stderr)

    print(
        "Upsert complete: "
        f"processed={stats['processed']} inserted={stats['inserted']} "
        f"updated={stats['updated']} failed={stats['failed']}"
    )
    if stats["failed"]:
        raise RuntimeError(f"{stats['failed']} event(s) failed to upsert")
    return stats
