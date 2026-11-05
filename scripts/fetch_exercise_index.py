"""Builds src/data/exerciseImageIndex.ts: every wger exercise with an English name and an https image.

wger (https://wger.de) is a free, open exercise database; its images are CC licensed and
credited to their authors. The index is baked into the app so `findExerciseImage` can match
any exercise name (built-in, custom or typed) to a demonstration image without calling wger
at runtime. Re-run to refresh:

    python scripts/fetch_exercise_index.py

Set WGER_CACHE=<path.json> to save the raw exercise list on the first run and reuse it
afterwards (scripts/fetch_workout_images.py honours the same variable).
"""

import json
import os
import re
import time

import httpx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/data/exerciseImageIndex.ts")
API = "https://wger.de/api/v2"
HEADERS = {"User-Agent": "Formly/1.0 (+https://formly-teal.vercel.app)", "Accept": "application/json"}
PAGE_SIZE = 100
ENGLISH = 2


def norm(text: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", text.lower().replace("-", " ")))


def get_json(client: httpx.Client, url: str, params: dict | None = None) -> dict:
    for attempt in range(3):
        try:
            res = client.get(url, params=params)
            res.raise_for_status()
            return res.json()
        except Exception as e:
            print(f"  retry {url} {params or ''} ({type(e).__name__})")
            time.sleep(3 * (attempt + 1))
    raise SystemExit(f"wger unavailable: {url} {params or ''}")


def fetch_raw(client: httpx.Client) -> list[dict]:
    """Pages through /exerciseinfo/ once (100 per page, 1s apart)."""
    cache = os.environ.get("WGER_CACHE")
    if cache and os.path.exists(cache):
        with open(cache, encoding="utf8") as f:
            return json.load(f)
    out: list[dict] = []
    offset = 0
    while True:
        data = get_json(client, f"{API}/exerciseinfo/", {"limit": PAGE_SIZE, "offset": offset})
        out.extend(data.get("results") or [])
        print(f"  offset {offset}: {len(out)} exercises")
        if not data.get("next"):
            break
        offset += PAGE_SIZE
        time.sleep(1)
    if cache:
        with open(cache, "w", encoding="utf8") as f:
            json.dump(out, f)
    return out


def license_labels(client: httpx.Client) -> dict[int, str]:
    """License id → short label, e.g. 2 → "CC BY-SA 4"."""
    data = get_json(client, f"{API}/license/", {"limit": 100})
    return {lic["id"]: label(lic.get("short_name")) for lic in data.get("results") or [] if isinstance(lic.get("id"), int)}


def label(short) -> str:
    s = str(short or "").strip()
    return s.replace("CC-BY-SA", "CC BY-SA").replace("CC-BY", "CC BY") if s else "CC BY-SA"


def license_of(value, labels: dict[int, str]) -> str:
    if isinstance(value, dict):
        return label(value.get("short_name")) if value.get("short_name") else labels.get(value.get("id"), "CC BY-SA")
    return labels.get(value, "CC BY-SA") if isinstance(value, int) else "CC BY-SA"


def usable(raw: list[dict], labels: dict[int, str]) -> list[dict]:
    """Exercises with an English name and an https image, best image first, duplicates dropped."""
    out: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for ex in raw:
        names = [str(t.get("name") or "").strip() for t in ex.get("translations") or [] if t.get("language") == ENGLISH]
        names = [n for n in names if n]
        images = [i for i in ex.get("images") or [] if str(i.get("image") or "").startswith("https://")]
        if not names or not images:
            continue
        # Prefer human-made photos/drawings, then the exercise's main image.
        images.sort(key=lambda i: (bool(i.get("is_ai_generated")), not i.get("is_main")))
        img = images[0]
        name = names[0]
        key = (norm(name), img["image"])
        if key in seen:
            continue
        seen.add(key)
        history = ", ".join(a for a in img.get("author_history") or [] if isinstance(a, str))
        author = str(img.get("license_author") or history or ex.get("license_author") or "").strip() or "wger contributors"
        out.append({
            "name": name,
            "url": img["image"],
            "author": author,
            "license": license_of(img.get("license", ex.get("license")), labels),
            "source_url": f"https://wger.de/en/exercise/{ex.get('id')}/view-base",
            "_ai": bool(img.get("is_ai_generated")),
        })
    # When two exercises share a name, keep a single entry: the non-AI image if there is one.
    by_name: dict[str, dict] = {}
    for e in out:
        k = norm(e["name"])
        if k not in by_name or (by_name[k]["_ai"] and not e["_ai"]):
            by_name[k] = e
    kept = sorted(by_name.values(), key=lambda e: norm(e["name"]))
    for e in kept:
        e.pop("_ai")
    return kept


def load_exercises() -> list[dict]:
    """The usable index entries (fetching wger, or reading WGER_CACHE)."""
    with httpx.Client(headers=HEADERS, timeout=30) as client:
        raw = fetch_raw(client)
        labels = license_labels(client)
    return usable(raw, labels)


def run():
    entries = load_exercises()
    rows = ",\n".join("  " + json.dumps(e, ensure_ascii=False, separators=(",", ":")) for e in entries)
    out = (
        "// Generated by scripts/fetch_exercise_index.py. Do not edit by hand.\n"
        "// Images from wger (https://wger.de), credited to their authors under the listed licences.\n\n"
        "export interface IndexedExercise {\n"
        "  name: string;\n  url: string;\n  author: string;\n  license: string;\n  source_url: string;\n}\n\n"
        "/** Every wger exercise with an English name and an https demonstration image. */\n"
        f"export const EXERCISE_IMAGE_INDEX: IndexedExercise[] = [\n{rows}\n];\n"
    )
    with open(OUT, "w", encoding="utf8", newline="\n") as f:
        f.write(out)
    print(f"wrote {len(entries)} exercises to {OUT}")


if __name__ == "__main__":
    run()
