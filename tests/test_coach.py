"""Tests for /api/coach-chat and /api/plan-week. Groq is always monkeypatched; no network calls."""

import os
import sys

os.environ["GROQ_API_KEY"] = ""
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402
from api.index import app  # noqa: E402

client = TestClient(app)

DAYS = [
    {"date": "2026-11-16", "weekday": "Mon", "phase": "follicular"},
    {"date": "2026-11-17", "weekday": "Tue", "phase": "ovulation"},
    {"date": "2026-11-18", "weekday": "Wed", "phase": "ovulation"},
]
CANDIDATES = [
    {"id": 2, "name": "Barbell Squat", "muscle": "Legs", "kind": "strength"},
    {"id": 7, "name": "Yoga Flow", "muscle": "Recovery", "kind": "recovery"},
    {"id": 9, "name": "Zone 2 Run", "muscle": "Cardio", "kind": "cardio"},
]


@pytest.fixture
def fake_prompt(monkeypatch):
    calls = []
    reply = {"text": ""}

    async def fake(prompt, system="", max_tokens=800, temperature=0.7):
        calls.append({"prompt": prompt, "system": system})
        return reply["text"]

    monkeypatch.setattr(main, "call_groq", fake)
    return calls, reply


def test_coach_chat_uses_training_system_and_context(monkeypatch):
    seen = {}

    async def fake(messages, max_tokens=800, temperature=0.7):
        seen["messages"] = messages
        return "Try **three** sets."

    monkeypatch.setattr(main, "call_groq_messages", fake)
    r = client.post("/api/coach-chat", json={"messages": [{"role": "user", "content": "How many sets?"}], "context": "Luteal phase"})
    assert r.status_code == 200
    assert r.json()["result"] == "Try three sets."
    system = seen["messages"][0]["content"]
    assert "training coach" in system and "Luteal phase" in system


def test_plan_week_keeps_only_known_ids_and_dates(fake_prompt):
    calls, reply = fake_prompt
    reply["text"] = (
        'Sure! ```json {"summary": "A **strong** week.", "days": ['
        '{"date": "2026-11-16", "ids": [2, 99, 2, 7, 9], "note": "Legs day."},'
        '{"date": "2026-11-20", "ids": [9], "note": "Not asked for."},'
        '{"date": "2026-11-18", "ids": ["9"], "note": "Rest."}]} ```'
    )
    r = client.post("/api/plan-week", json={"days": DAYS, "candidates": CANDIDATES, "sessions": 2, "context": "Energy today: great"})
    assert r.status_code == 200
    plan = r.json()["plan"]
    assert plan["summary"] == "A strong week."
    assert [d["date"] for d in plan["days"]] == ["2026-11-16", "2026-11-17", "2026-11-18"]
    assert plan["days"][0]["ids"] == [2, 7]
    assert plan["days"][1] == {"date": "2026-11-17", "ids": [], "note": ""}
    assert plan["days"][2]["ids"] == []
    prompt = calls[0]["prompt"]
    assert "2026-11-17 (Tue): ovulation" in prompt and "7 | Yoga Flow | Recovery | recovery" in prompt and "Energy today: great" in prompt


def test_plan_week_errors_when_the_reply_has_no_usable_plan(fake_prompt):
    _, reply = fake_prompt
    reply["text"] = "I can't do that."
    r = client.post("/api/plan-week", json={"days": DAYS, "candidates": CANDIDATES, "sessions": 2})
    assert r.status_code == 502


@pytest.mark.parametrize("body", [
    {"days": [], "candidates": CANDIDATES, "sessions": 2},
    {"days": DAYS, "candidates": [], "sessions": 2},
    {"days": DAYS, "candidates": CANDIDATES, "sessions": 0},
    {"days": [{"date": "16/11/2026", "weekday": "Mon"}], "candidates": CANDIDATES, "sessions": 1},
    {"days": DAYS, "candidates": [{"id": 1, "name": "X", "kind": "dance"}], "sessions": 1},
])
def test_plan_week_validates_input(body, fake_prompt):
    assert client.post("/api/plan-week", json=body).status_code == 422
