"""Finds a wger demonstration image for each built-in workout and writes src/data/workoutImages.ts.

wger (https://wger.de) is a free, open exercise database; its images are CC BY-SA and
credited to their authors. Images are baked into the app so the guide loads instantly and
doesn't call wger at runtime. Re-run after changing the built-in workouts:

    python scripts/fetch_workout_images.py
"""

import json
import os
import re
import time

import httpx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/data/workoutImages.ts")
API = "https://wger.de/api/v2"
HEADERS = {"User-Agent": "Formly/1.0 (+https://formly-teal.vercel.app)", "Accept": "application/json"}
PAGE_SIZE = 100
ENGLISH = 2

# Built-in workout id → wger English exercise names to try, best first. Matching is on
# normalised names: an exact match wins, then a name that contains every word of the candidate.
# Yoga Flow (6), Zone 2 Run (9) and Pilates Core (12) have no single matching movement.
CANDIDATES: dict[int, list[str]] = {
    1: ["push-up", "push up", "pushups", "push-ups"],
    2: ["barbell squat", "squat", "squats"],
    3: ["glute bridge", "hip bridge", "bridge"],
    4: ["burpee", "burpees", "jumping jacks", "jumping jack"],
    5: ["pull-up", "pull up", "pull-ups", "lat pulldown", "lat pull down"],
    7: ["shoulder press", "overhead press", "military press", "dumbbell shoulder press"],
    8: ["plank", "front plank", "crunches", "crunch"],
    10: ["hip thrust", "barbell hip thrust", "glute bridge"],
    11: ["romanian deadlift", "stiff-legged deadlift", "stiff leg deadlift"],
}


def norm(text: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", text.lower().replace("-", " ")))


def license_label(client: httpx.Client, cache: dict, lic_id) -> str:
    if lic_id in cache:
        return cache[lic_id]
    label = "CC BY-SA"
    if isinstance(lic_id, int):
        try:
            res = client.get(f"{API}/license/{lic_id}/")
            res.raise_for_status()
            short = str(res.json().get("short_name") or "").strip()
            if short:
                label = short.replace("CC-BY-SA", "CC BY-SA").replace("CC-BY", "CC BY")
        except Exception as e:
            print(f"  license {lic_id}: {type(e).__name__}")
        time.sleep(0.5)
    cache[lic_id] = label
    return label


def fetch_all(client: httpx.Client) -> list[dict]:
    """Pages through /exerciseinfo/ once, keeping exercises with an English name and an https image."""
    out: list[dict] = []
    offset = 0
    while True:
        for attempt in range(3):
            try:
                res = client.get(f"{API}/exerciseinfo/", params={"limit": PAGE_SIZE, "offset": offset})
                res.raise_for_status()
                data = res.json()
                break
            except Exception as e:
                print(f"  retry offset {offset} ({type(e).__name__})")
                time.sleep(3 * (attempt + 1))
        else:
            raise SystemExit(f"wger unavailable at offset {offset}")
        for ex in data.get("results") or []:
            names = [t.get("name", "") for t in ex.get("translations") or [] if t.get("language") == ENGLISH]
            images = [i for i in ex.get("images") or [] if str(i.get("image") or "").startswith("https://")]
            if names and images:
                # Prefer human-made photos/drawings, then the exercise's main image.
                images.sort(key=lambda i: (bool(i.get("is_ai_generated")), not i.get("is_main")))
                out.append({"id": ex.get("id"), "name": names[0].strip(), "image": images[0], "ex": ex})
        print(f"  offset {offset}: {len(out)} usable so far")
        if not data.get("next"):
            return out
        offset += PAGE_SIZE
        time.sleep(1)


def best_match(exercises: list[dict], candidates: list[str]):
    for cand in candidates:
        c = norm(cand)
        exact = [e for e in exercises if norm(e["name"]) == c]
        if exact:
            return exact[0]
    for cand in candidates:
        words = set(norm(cand).split())
        loose = [e for e in exercises if words <= set(norm(e["name"]).split())]
        if loose:
            return min(loose, key=lambda e: len(e["name"]))  # the plainest variant
    return None


def run():
    with httpx.Client(headers=HEADERS, timeout=20) as client:
        exercises = fetch_all(client)
        licenses: dict = {}
        images: dict[str, dict] = {}
        for wid, candidates in CANDIDATES.items():
            match = best_match(exercises, candidates)
            if not match:
                print(f"{wid}: none")
                continue
            img = match["image"]
            history = ", ".join(a for a in img.get("author_history") or [] if isinstance(a, str))
            author = str(img.get("license_author") or history or match["ex"].get("license_author") or "").strip() or "wger contributors"
            lic = img.get("license", match["ex"].get("license"))
            images[str(wid)] = {
                "url": img["image"],
                "title": match["name"],
                "author": author,
                "license": license_label(client, licenses, lic),
                "source_url": f"https://wger.de/en/exercise/{match['id']}/view-base",
            }
            print(f"{wid}: {match['name']} ({img['image']})")
    body = json.dumps(images, indent=2, ensure_ascii=False)
    out = (
        "// Generated by scripts/fetch_workout_images.py. Do not edit by hand.\n"
        "import type { WorkoutImage } from \"../types\";\n\n"
        "/** wger demonstration images for the built-in workouts, keyed by workout id. */\n"
        f"export const WORKOUT_IMAGES: Partial<Record<string, WorkoutImage>> = {body};\n"
    )
    with open(OUT, "w", encoding="utf8", newline="\n") as f:
        f.write(out)
    print(f"wrote {len(images)}/{len(CANDIDATES)} images")


if __name__ == "__main__":
    run()
