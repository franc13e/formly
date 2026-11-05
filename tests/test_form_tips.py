"""Tests for /api/form-tips. Groq is always monkeypatched; no network calls."""

import os
import sys

os.environ["GROQ_API_KEY"] = ""
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402
from api.index import app  # noqa: E402

client = TestClient(app)

REPLY = (
    "CUES:\n1. **Brace** your core.\n2. Keep your knees soft.\n3. Move slowly.\n"
    "AVOID: Rushing the reps. Slow down.\nHELPS: Builds strength. Worth doing."
)


@pytest.fixture
def fake_prompt(monkeypatch):
    calls = []

    async def fake(prompt, system="", max_tokens=800, temperature=0.7):
        calls.append({"prompt": prompt, "system": system, "max_tokens": max_tokens})
        return REPLY

    monkeypatch.setattr(main, "call_groq", fake)
    return calls


def test_form_tips_returns_plain_text(fake_prompt):
    r = client.post("/api/form-tips", json={"name": "  Kettlebell swing ", "muscle": "Glutes"})
    assert r.status_code == 200
    result = r.json()["result"]
    assert result.startswith("CUES:\n1. Brace your core.")
    assert "**" not in result
    call = fake_prompt[0]
    assert call["prompt"] == "Workout: Kettlebell swing\nMuscle group: Glutes"
    assert "certified personal trainer" in call["system"]
    assert "AVOID:" in call["system"] and "HELPS:" in call["system"]


def test_form_tips_muscle_is_optional(fake_prompt):
    r = client.post("/api/form-tips", json={"name": "Stair climber"})
    assert r.status_code == 200
    assert fake_prompt[0]["prompt"] == "Workout: Stair climber"


@pytest.mark.parametrize("body", [
    {},
    {"name": ""},
    {"name": "   "},
    {"name": "x" * 81},
    {"name": "Squat", "muscle": "m" * 41},
    {"name": 5},
])
def test_form_tips_validation(fake_prompt, body):
    assert client.post("/api/form-tips", json=body).status_code == 422
    assert fake_prompt == []


def test_form_tips_fails_clearly_without_key():
    r = client.post("/api/form-tips", json={"name": "Squat"})
    assert r.status_code == 500
    assert "GROQ_API_KEY" in r.json()["detail"]
