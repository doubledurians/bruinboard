from __future__ import annotations

import sys
from datetime import UTC, datetime

from upsert import VALID_SOURCES, supabase_client


def validate_source(source: str) -> bool:
    if source not in VALID_SOURCES:
        raise ValueError(f"source must be one of: {', '.join(sorted(VALID_SOURCES))}")

    client = supabase_client()
    response = (
        client.table("events")
        .select("id,title,start_datetime,source,url")
        .eq("source", source)
        .eq("status", "active")
        .eq("is_active", True)
        .execute()
    )
    rows = response.data or []
    now = datetime.now(UTC)

    failures: list[str] = []
    warnings: list[str] = []

    if len(rows) == 0:
        failures.append("row count is 0")

    null_start = [row for row in rows if not row.get("start_datetime")]
    if null_start:
        failures.append(f"{len(null_start)} event(s) have null start_datetime")

    null_title = [row for row in rows if not row.get("title")]
    if null_title:
        failures.append(f"{len(null_title)} event(s) have null title")

    wrong_source = [row for row in rows if row.get("source") != source]
    if wrong_source:
        failures.append(f"{len(wrong_source)} event(s) have an incorrect source value")

    past_dated = []
    for row in rows:
        start_datetime = row.get("start_datetime")
        if not start_datetime:
            continue
        parsed = datetime.fromisoformat(start_datetime.replace("Z", "+00:00"))
        if parsed < now:
            past_dated.append(row)
    if past_dated:
        warnings.append(f"{len(past_dated)} event(s) have start_datetime in the past")

    print(f"Validation for source={source}")
    print(f"row_count={len(rows)}")
    print(f"null_start_datetime={len(null_start)}")
    print(f"null_title={len(null_title)}")
    print(f"wrong_source={len(wrong_source)}")
    print(f"past_dated={len(past_dated)}")

    for warning in warnings:
        print(f"WARNING: {warning}")
    for failure in failures:
        print(f"FAIL: {failure}")

    if failures:
        return False

    print("PASS")
    return True


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scrapers/validate.py <burkle|cap_ucla|library>", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(0 if validate_source(sys.argv[1]) else 1)
