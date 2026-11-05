"""Tests for GET /api/recipe-photo. Pexels and Openverse are always faked; no network calls."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx  # noqa: E402
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402
from api.index import app  # noqa: E402

client = TestClient(app)

PEXELS_REPLY = {
    "photos": [{
        "url": "https://www.pexels.com/photo/lentil-soup-123/",
        "photographer": "Ana Cook",
        "photographer_url": "https://www.pexels.com/@ana",
        "src": {"medium": "https://images.pexels.com/123/medium.jpeg", "large": "https://images.pexels.com/123/large.jpeg"},
    }],
}
PEXELS_PHOTO = {
    "url": "https://images.pexels.com/123/large.jpeg",
    "photographer": "Ana Cook",
    "photographer_url": "https://www.pexels.com/@ana",
    "source_url": "https://www.pexels.com/photo/lentil-soup-123/",
    "source": "Pexels",
    "license": "Pexels License",
}


def ov_result(**overrides):
    item = {
        "url": "https://live.staticflickr.com/1/2_b.jpg",
        "thumbnail": "https://api.openverse.org/v1/images/abc/thumb/",
        "title": "Overnight oats",
        "creator": "Sam Baker",
        "creator_url": "https://www.flickr.com/photos/sam",
        "foreign_landing_url": "https://www.flickr.com/photos/sam/2",
        "license": "by",
        "license_version": "2.0",
        "license_url": "https://creativecommons.org/licenses/by/2.0/",
        "source": "flickr",
        "filetype": "jpg",
    }
    item.update(overrides)
    return item


OPENVERSE_PHOTO = {
    "url": "https://live.staticflickr.com/1/2_b.jpg",
    "photographer": "Sam Baker",
    "photographer_url": "https://www.flickr.com/photos/sam",
    "source_url": "https://www.flickr.com/photos/sam/2",
    "source": "Openverse",
    "license": "CC BY 2.0",
}


@pytest.fixture(autouse=True)
def clean_cache(monkeypatch):
    main._photo_cache.clear()
    monkeypatch.delenv("PEXELS_API_KEY", raising=False)
    yield
    main._photo_cache.clear()


def fake_openverse(monkeypatch, replies=None, default=None):
    """Fakes openverse_search: `replies` maps query → JSON (or an exception to raise); others get `default`."""
    calls = []

    async def fake(query):
        calls.append(query)
        reply = (replies or {}).get(query, default if default is not None else {"results": [ov_result()]})
        if isinstance(reply, Exception):
            raise reply
        return reply

    monkeypatch.setattr(main, "openverse_search", fake)
    return calls


def fake_pexels(monkeypatch, reply=PEXELS_REPLY):
    calls = []

    async def fake(query, key):
        calls.append({"query": query, "key": key})
        if isinstance(reply, Exception):
            raise reply
        return reply

    monkeypatch.setattr(main, "pexels_search", fake)
    return calls


def get(q):
    return client.get("/api/recipe-photo", params={"q": q})


# ── Provider order ────────────────────────────────────────────────────────────

def test_no_key_uses_openverse(monkeypatch):
    pexels = fake_pexels(monkeypatch)
    ov = fake_openverse(monkeypatch)
    r = get("  Overnight   OATS ")
    assert r.status_code == 200
    assert r.json() == OPENVERSE_PHOTO
    assert r.headers["cache-control"] == "public, max-age=86400"
    assert pexels == []
    assert ov == ["overnight oats"]


def test_key_set_uses_pexels(monkeypatch):
    monkeypatch.setenv("PEXELS_API_KEY", "test-key")
    pexels = fake_pexels(monkeypatch)
    ov = fake_openverse(monkeypatch)
    r = get("  Red lentil & spinach dal  ")
    assert r.json() == PEXELS_PHOTO
    assert r.headers["cache-control"] == "public, max-age=86400"
    assert pexels == [{"query": "red lentil & spinach dal", "key": "test-key"}]
    assert ov == []
    assert "test-key" not in r.text


def test_pexels_adds_food_context_unless_dish_or_drink(monkeypatch):
    monkeypatch.setenv("PEXELS_API_KEY", "test-key")
    pexels = fake_pexels(monkeypatch)
    get("Baked salmon, sweet potato & greens")
    get("Kefir berry smoothie")
    assert [c["query"] for c in pexels] == ["baked salmon, sweet potato & greens food", "kefir berry smoothie"]


def test_pexels_falls_back_to_medium_src(monkeypatch):
    monkeypatch.setenv("PEXELS_API_KEY", "test-key")
    fake_pexels(monkeypatch, {"photos": [{**PEXELS_REPLY["photos"][0], "src": {"medium": "https://images.pexels.com/123/medium.jpeg"}}]})
    assert get("Oats").json()["url"] == "https://images.pexels.com/123/medium.jpeg"


@pytest.mark.parametrize("reply", [
    {"photos": []},
    {"photos": [{"src": {"large": "http://images.pexels.com/insecure.jpeg"}}]},
    httpx.ConnectError("down"),
])
def test_pexels_empty_or_failing_falls_back_to_openverse(monkeypatch, reply):
    monkeypatch.setenv("PEXELS_API_KEY", "test-key")
    pexels = fake_pexels(monkeypatch, reply)
    ov = fake_openverse(monkeypatch)
    r = get("Golden milk")
    assert r.json() == OPENVERSE_PHOTO
    assert len(pexels) == 1
    assert ov == ["golden milk"]


# ── Openverse query fallback ──────────────────────────────────────────────────

def test_long_name_falls_back_to_shorter_queries(monkeypatch):
    ov = fake_openverse(monkeypatch, {"fried egg": {"results": [ov_result()]}}, default={"results": []})
    r = get("Kimchi fried rice with a fried egg")
    assert r.json() == OPENVERSE_PHOTO
    assert ov == ["kimchi fried rice with a fried egg", "kimchi fried rice fried egg", "fried egg"]


def test_last_two_words(monkeypatch):
    ov = fake_openverse(monkeypatch, {"overnight oats": {"results": [ov_result()]}}, default={"results": []})
    assert get("Berry kefir overnight oats").json()["url"] == OPENVERSE_PHOTO["url"]
    assert ov == ["berry kefir overnight oats", "overnight oats"]


def test_caps_openverse_requests_and_caches_no_result(monkeypatch):
    ov = fake_openverse(monkeypatch, default={"results": []})
    r = get("Easy roasted broccoli and chickpea quinoa bowl")
    assert r.status_code == 200
    assert r.json() == {"url": None}
    assert r.headers["cache-control"] == "public, max-age=86400"
    assert ov == [
        "easy roasted broccoli and chickpea quinoa bowl",
        "roasted broccoli chickpea quinoa bowl",
        "quinoa bowl",
        "roasted broccoli",
    ]
    get("easy roasted broccoli and chickpea quinoa bowl")
    assert len(ov) == 4  # the miss was cached


def test_openverse_queries_dedupes():
    assert main.openverse_queries("Golden milk") == ["golden milk", "milk"]
    assert main.openverse_queries("Chai") == ["chai"]
    assert main.openverse_queries("The") == ["the"]
    assert len(main.openverse_queries("one two three four five six")) == main.OPENVERSE_MAX_QUERIES


# ── Openverse result mapping ──────────────────────────────────────────────────

@pytest.mark.parametrize("code,version,label", [
    ("by", "2.0", "CC BY 2.0"),
    ("by-sa", "4.0", "CC BY-SA 4.0"),
    ("cc0", "1.0", "CC0"),
    ("pdm", "1.0", "Public domain"),
    ("by", None, "CC BY"),
])
def test_license_labels(monkeypatch, code, version, label):
    fake_openverse(monkeypatch, default={"results": [ov_result(license=code, license_version=version)]})
    assert get("Matcha latte").json()["license"] == label


def test_skips_unusable_results(monkeypatch):
    good = ov_result(url="https://live.staticflickr.com/9/good_b.jpg")
    fake_openverse(monkeypatch, default={"results": [
        ov_result(url="http://insecure.example/x.jpg"),
        ov_result(url=None),
        {k: v for k, v in ov_result().items() if k != "url"},
        ov_result(filetype="gif"),
        ov_result(license="by-nc"),
        "not a dict",
        good,
    ]})
    assert get("Lentil soup").json()["url"] == "https://live.staticflickr.com/9/good_b.jpg"


def test_missing_credit_fields(monkeypatch):
    fake_openverse(monkeypatch, default={"results": [
        ov_result(creator=None, creator_url="http://flickr.com/x", foreign_landing_url=None, filetype=None, license="cc0"),
    ]})
    assert get("Turmeric latte").json() == {
        "url": "https://live.staticflickr.com/1/2_b.jpg",
        "photographer": "",
        "photographer_url": "",
        "source_url": "",
        "source": "Openverse",
        "license": "CC0",
    }


def test_no_usable_result_anywhere_returns_null(monkeypatch):
    fake_openverse(monkeypatch, default={"results": [ov_result(url="http://x/y.jpg")]})
    assert get("Mystery stew").json() == {"url": None}


# ── Errors, caching, validation ───────────────────────────────────────────────

@pytest.mark.parametrize("error", [
    httpx.HTTPStatusError("rate limited", request=httpx.Request("GET", main.OPENVERSE_URL), response=httpx.Response(429)),
    httpx.ConnectError("down"),
    ValueError("bad json"),
])
def test_openverse_error_returns_null_no_store(monkeypatch, error):
    ov = fake_openverse(monkeypatch, default=error)
    r = get("Golden milk")
    assert r.status_code == 200
    assert r.json() == {"url": None}
    assert r.headers["cache-control"] == "no-store"
    assert ov == ["golden milk"]  # stops the chain on an error
    # Errors are not cached: the next request tries again.
    get("Golden milk")
    assert len(ov) == 2


def test_error_after_a_miss_is_not_cached(monkeypatch):
    ov = fake_openverse(monkeypatch, {"golden milk": {"results": []}, "milk": httpx.ConnectError("down")})
    r = get("Golden milk")
    assert r.json() == {"url": None}
    assert r.headers["cache-control"] == "no-store"
    assert ov == ["golden milk", "milk"]


def test_cache_hit_makes_no_calls(monkeypatch):
    monkeypatch.setenv("PEXELS_API_KEY", "test-key")
    pexels = fake_pexels(monkeypatch, {"photos": []})
    ov = fake_openverse(monkeypatch)
    first = get("Kefir berry smoothie")
    second = get("  kefir   BERRY smoothie ")
    assert first.json() == second.json() == OPENVERSE_PHOTO
    assert second.headers["cache-control"] == "public, max-age=86400"
    assert len(pexels) == 1
    assert len(ov) == 1


@pytest.mark.parametrize("params", [{}, {"q": ""}, {"q": "   "}, {"q": "x" * 121}])
def test_validation_422(monkeypatch, params):
    monkeypatch.setenv("PEXELS_API_KEY", "test-key")
    pexels = fake_pexels(monkeypatch)
    ov = fake_openverse(monkeypatch)
    assert client.get("/api/recipe-photo", params=params).status_code == 422
    assert pexels == [] and ov == []


def test_accepts_120_chars(monkeypatch):
    fake_openverse(monkeypatch)
    assert get("x" * 120).status_code == 200


# ── Real HTTP helpers (via a mock transport) ──────────────────────────────────

def mock_transport(monkeypatch, handler):
    real_client = httpx.AsyncClient
    monkeypatch.setattr(main.httpx, "AsyncClient", lambda **kw: real_client(transport=httpx.MockTransport(handler), **kw))


def test_openverse_search_request(monkeypatch):
    seen = []

    def handler(request: httpx.Request):
        seen.append(request)
        return httpx.Response(200, json={"results": [ov_result()]})

    mock_transport(monkeypatch, handler)
    r = get("Golden milk")
    assert r.json() == OPENVERSE_PHOTO
    req = seen[0]
    assert req.url.host == "api.openverse.org"
    assert req.url.path == "/v1/images/"
    assert dict(req.url.params) == {"q": "golden milk", "page_size": "5", "mature": "false", "license": "by,by-sa,cc0,pdm"}
    assert req.headers["user-agent"].startswith("Formly/1.0")
    assert "authorization" not in req.headers


def test_pexels_search_request(monkeypatch):
    monkeypatch.setenv("PEXELS_API_KEY", "test-key")
    seen = []

    def handler(request: httpx.Request):
        seen.append(request)
        return httpx.Response(200, json=PEXELS_REPLY)

    mock_transport(monkeypatch, handler)
    assert get("Golden milk").json() == PEXELS_PHOTO
    req = seen[0]
    assert req.headers["authorization"] == "test-key"
    assert req.url.host == "api.pexels.com"
    assert dict(req.url.params) == {"query": "golden milk", "per_page": "1", "orientation": "landscape"}


def test_http_errors_via_transport(monkeypatch):
    monkeypatch.setenv("PEXELS_API_KEY", "test-key")
    hosts = []

    def handler(request: httpx.Request):
        hosts.append(request.url.host)
        return httpx.Response(500, text="boom")

    mock_transport(monkeypatch, handler)
    r = get("Golden milk")
    assert r.status_code == 200
    assert r.json() == {"url": None}
    assert r.headers["cache-control"] == "no-store"
    assert hosts == ["api.pexels.com", "api.openverse.org"]
