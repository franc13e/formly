"""Backend smoke tests: routing and error handling without calling Groq."""

import os
import sys

os.environ["GROQ_API_KEY"] = ""
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402

from api.index import app  # noqa: E402

client = TestClient(app)


def test_health_reports_missing_key():
    assert client.get("/api/health").json() == {"status": "ok", "groq_key_set": False}


def test_ai_routes_fail_clearly_without_key():
    for path in ("/api/nutrition", "/api/body-insight", "/api/ai-plan", "/api/health-check", "/api/suggest-goals"):
        r = client.post(path, json={"prompt": "test"})
        assert r.status_code == 500, path
        assert "GROQ_API_KEY" in r.json()["detail"], path


def test_prompt_is_required():
    assert client.post("/api/nutrition", json={}).status_code == 422
