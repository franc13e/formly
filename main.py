from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, StringConstraints, field_validator
from typing import Annotated, Literal, Optional
import httpx
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

GROQ_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-20b"
REASONING_HEADROOM = 600


class PromptRequest(BaseModel):
    prompt: str
    system: str = ""
    max_tokens: int = 800
    temperature: float = 0.7


async def call_groq_messages(messages: list[dict], max_tokens: int = 800, temperature: float = 0.7):
    """Sends a full chat `messages` list ({role, content}) to Groq and returns the reply text."""
    if not GROQ_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set in .env")

    async with httpx.AsyncClient(timeout=90) as client:
        res = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={
                "model": MODEL,
                "messages": messages,
                # gpt-oss is a reasoning model: its hidden reasoning counts toward the
                # token limit, so keep reasoning short and leave headroom for the answer.
                "reasoning_effort": "low",
                "max_tokens": max_tokens + REASONING_HEADROOM,
                "temperature": temperature,
            },
        )

    if res.status_code != 200:
        print(f"Groq error {res.status_code}: {res.text[:500]}")
        raise HTTPException(status_code=res.status_code, detail=res.text)

    data = res.json()
    print(f"Groq response keys: {list(data.keys())}")
    if "choices" not in data:
        raise HTTPException(status_code=500, detail=f"Unexpected response: {str(data)[:300]}")
    return data["choices"][0]["message"]["content"]


async def call_groq(prompt: str, system: str = "", max_tokens: int = 800, temperature: float = 0.7):
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    return await call_groq_messages(messages, max_tokens=max_tokens, temperature=temperature)


def strip_markdown(text: str) -> str:
    """Removes **bold** / *italic* emphasis and stray heading hashes from model output."""
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text, flags=re.S)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"\1", text)
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.M)
    return text.strip()


# ── Routes ────────────────────────────────────────────────────────────────────

def _first_env(*names: str) -> str:
    for name in names:
        value = os.getenv(name, "").strip()
        if value:
            return value
    return ""


@app.get("/api/config")
async def public_config():
    """Public client config. The Supabase URL and anon/publishable key are meant to be
    exposed to browsers; access is enforced by row-level security in the database."""
    url = _first_env("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
    key = _first_env(
        "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    )
    return {"supabaseUrl": url or None, "supabaseAnonKey": key or None}


@app.get("/health")
@app.get("/api/health")
async def health():
    return {"status": "ok", "groq_key_set": bool(GROQ_KEY)}


@app.post("/api/nutrition")
async def nutrition_lookup(req: PromptRequest):
    import re, json

    food_match = re.search(r'for "([^"]+)"', req.prompt)
    grams_match = re.search(r'for (\d+)g', req.prompt)
    food = food_match.group(1) if food_match else "the food"
    grams = grams_match.group(1) if grams_match else "100"

    text = await call_groq(
        prompt=f"Return JSON nutrition facts for {grams}g of {food}. Keys: protein, carbs, fats, sugar, fiber, calories. All in grams except calories in kcal. Numbers only.",
        system="You are a nutrition database. Reply with ONLY valid JSON, no other text. Format: {\"protein\":0,\"carbs\":0,\"fats\":0,\"sugar\":0,\"fiber\":0,\"calories\":0}",
        max_tokens=80,
        temperature=0.0,
    )

    keys = ["protein", "carbs", "fats", "sugar", "fiber", "calories"]
    result = {}

    # Strategy 1: parse as JSON (works well with llama)
    try:
        clean = re.sub(r'```[a-z]*', "", text).strip().strip("`")
        match = re.search(r'\{[^{}]+\}', clean)
        if match:
            parsed = json.loads(match.group())
            for k in keys:
                if k in parsed:
                    result[k] = round(float(parsed[k]), 1)
    except Exception:
        pass

    # Strategy 2: line by line parsing as fallback
    if len(result) < 3:
        for line in text.strip().split("\n"):
            for k in keys:
                if k in line.lower():
                    m = re.search(r'([0-9]+\.?[0-9]*)', line)
                    if m:
                        result[k] = round(float(m.group(1)), 1)
                        break

    if len(result) >= 3:
        return {"result": json.dumps(result)}

    raise HTTPException(status_code=500, detail=f"Parse failed. Got: {repr(text[:200])}")


@app.post("/api/body-insight")
async def body_insight(req: PromptRequest):
    text = await call_groq(
        prompt=req.prompt,
        system="You are a warm, knowledgeable women's health and fitness coach. Give supportive, educational body insights. Never be judgemental. Acknowledge that women's bodies naturally fluctuate. Focus on health not aesthetics. Keep to 3-4 sentences. Be specific about how the current cycle phase affects what they're seeing.",
        max_tokens=280,
        temperature=0.7,
    )
    return {"result": text}


@app.post("/api/ai-plan")
async def ai_plan(req: PromptRequest):
    text = await call_groq(
        prompt=req.prompt,
        system="You are a women's fitness and nutrition coach. Be extremely concise. Rules: 1) Create EXACTLY the number of workout days specified. Format each day as: Day N: Name, then 3 exercises max as '- Exercise x sets x reps', then '- WHY: one sentence'. 2) After all days use these headers: FOODS TO FOCUS ON:, WHAT YOU WILL ACHIEVE:, COACH'S NOTE:. 3) Max 2 bullets per section after workout plan. 4) Finish every section. Do not cut off.",
        max_tokens=2500,
        temperature=0.3,
    )
    return {"result": text}


@app.post("/api/health-check")
async def health_check_goal(req: PromptRequest):
    text = await call_groq(
        prompt=req.prompt,
        system="You are a warm, supportive women's health advisor. Give honest but kind feedback about health goals. Keep to 2-3 sentences. Never be clinical or scary.",
        max_tokens=180,
        temperature=0.7,
    )
    return {"result": text}




@app.post("/api/suggest-goals")
async def suggest_goals(req: PromptRequest):
    text = await call_groq(
        prompt=req.prompt,
        system="""You are a warm, knowledgeable fitness coach helping someone understand which nutrients to prioritise for their goals. 
Your job is not to prescribe a strict diet — it's to help someone understand what to focus on and why, so they can experiment and find what works for their body.
Be specific about which macros matter most for their goal and why, but frame everything as a starting point to experiment from, not a rule to follow perfectly.
Keep your tone warm, practical and encouraging. Never be clinical or restrictive.
Structure your response with these exact headers on their own line:
WHAT TO PRIORITISE:
WHY IT MATTERS FOR YOUR GOAL:
A STARTING POINT TO EXPERIMENT WITH:
ONE THING TO REMEMBER:
Keep total under 300 words. Use simple bullet points (- item). Never mention BMI.""",
        max_tokens=450,
        temperature=0.7,
    )
    # Strip markdown
    import re
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    return {"result": text}


# ── Food chat ────────────────────────────────────────────────────────────────

MAX_CHAT_MESSAGES = 20
MAX_USER_MESSAGE_CHARS = 1500
MAX_ASSISTANT_MESSAGE_CHARS = 4000
MAX_CONTEXT_CHARS = 500

FOOD_CHAT_SYSTEM = """You are Formly's food coach: a warm, practical, cycle-aware nutrition coach for women.
How to answer:
- Be concise: a short direct answer, then a few practical ideas. Usually under 150 words.
- Plain text only. No markdown tables, headings or bold. Short bullet lines starting with "- " are fine.
- Food first: suggest real meals, snacks, drinks and simple swaps. Tie advice to the user's cycle phase and goal when they are given and relevant.
- Be encouraging and non-judgemental. Never moralise about food, never mention BMI, never suggest extreme diets, fasting protocols, very low calorie intakes or cutting out whole food groups without a medical reason.
- Never prescribe or dose medication or supplements; at most say a supplement is something to discuss with a doctor or pharmacist.
- If the user describes medical symptoms (severe or unusual pain, very heavy bleeding, missed periods, dizziness, suspected deficiency, allergies, pregnancy questions) or signs of disordered eating (restricting, bingeing, purging, fear of food, compensating with exercise), respond kindly and encourage them to see a doctor or registered dietitian.
- Stay on food, nutrition, hydration and how they relate to the menstrual cycle and training. If asked about something else, politely say you can only help with food and nutrition and offer a related food question instead."""


ChatContent = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MAX_ASSISTANT_MESSAGE_CHARS)]
OptionalShortText = Optional[Annotated[str, StringConstraints(strip_whitespace=True, max_length=MAX_CONTEXT_CHARS)]]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: ChatContent

    @field_validator("content")
    @classmethod
    def _user_messages_are_short(cls, content: str, info):
        if info.data.get("role") == "user" and len(content) > MAX_USER_MESSAGE_CHARS:
            raise ValueError(f"user messages must be at most {MAX_USER_MESSAGE_CHARS} characters")
        return content


class FoodChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=MAX_CHAT_MESSAGES)
    context: OptionalShortText = None

    @field_validator("messages")
    @classmethod
    def _ends_with_user(cls, messages: list[ChatMessage]):
        if messages[-1].role != "user":
            raise ValueError("the last message must be from the user")
        return messages


@app.post("/api/food-chat")
async def food_chat(req: FoodChatRequest):
    system = FOOD_CHAT_SYSTEM
    if req.context:
        system += f"\n\nWhat the app knows about this user (use it when relevant): {req.context}"
    messages = [{"role": "system", "content": system}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]
    text = await call_groq_messages(messages, max_tokens=500, temperature=0.6)
    return {"result": strip_markdown(text)}


# ── Recipe generator ─────────────────────────────────────────────────────────

PHASE_NUTRIENTS = {
    "menstrual": "iron (with vitamin C to absorb it), omega-3s and magnesium to ease cramps, and warm, easy-to-digest food; ginger helps",
    "follicular": "lean protein, complex carbs for rising energy, fermented foods and cruciferous or fresh vegetables",
    "ovulation": "zinc, antioxidant-rich fruit and veg, light proteins and plenty of hydration",
    "luteal": "magnesium, vitamin B6, calcium, complex carbs and anti-inflammatory foods like ginger and turmeric; go easy on salt and refined sugar",
}

RECIPE_SYSTEM = """You are a home cook and cycle-aware nutrition coach. Create ONE simple, tasty, realistic home recipe.
Rules: everyday ingredients, at most 10 ingredients and 6 steps, no medication or supplements, no extreme diets.
Reply in plain text (no markdown, no bold) using EXACTLY this format:
TITLE: <recipe name>
TIME: <total time, e.g. 15 min>
WHY: <one sentence on why it helps this cycle phase, naming the key nutrients>
INGREDIENTS:
- <quantity and ingredient>
STEPS:
1. <step>"""


class RecipeRequest(BaseModel):
    kind: Literal["meal", "drink"]
    ingredients: OptionalShortText = None
    phase: Optional[Literal["menstrual", "follicular", "ovulation", "luteal"]] = None
    context: OptionalShortText = None


@app.post("/api/recipe")
async def recipe(req: RecipeRequest):
    parts = [f"Make me a {req.kind}" + (" (a drink, e.g. smoothie, tea, latte or cooler)." if req.kind == "drink" else ".")]
    if req.phase:
        parts.append(f"I'm in my {req.phase} phase. Focus on {PHASE_NUTRIENTS[req.phase]}.")
    if req.ingredients:
        parts.append(f"Ingredients I have: {req.ingredients}. Use some of them; common pantry staples are fine too.")
    if req.context:
        parts.append(f"About me: {req.context}")
    text = await call_groq(prompt=" ".join(parts), system=RECIPE_SYSTEM, max_tokens=600, temperature=0.7)
    return {"result": strip_markdown(text)}


# ── Form tips ────────────────────────────────────────────────────────────────

FORM_TIPS_SYSTEM = """You are a certified personal trainer writing short, safe form tips for a beginner-friendly women's fitness app.
Rules: plain coaching language, no jargon, no markdown or bold. Never make medical or injury-treatment claims,
never promise specific results, and keep advice safe for a healthy beginner (suggest an easier option where useful).
If the workout name isn't a real exercise or workout, give general safe tips for a gentle full-body session.
Reply in plain text using EXACTLY this format:
CUES:
1. <short form cue, under 15 words>
2. <short form cue, under 15 words>
3. <short form cue, under 15 words>
AVOID: <one common mistake and how to fix it, one or two sentences>
HELPS: <two sentences on what it builds and why it's worth doing>"""


class FormTipsRequest(BaseModel):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
    muscle: Optional[Annotated[str, StringConstraints(strip_whitespace=True, max_length=40)]] = None


@app.post("/api/form-tips")
async def form_tips(req: FormTipsRequest):
    prompt = f"Workout: {req.name}"
    if req.muscle:
        prompt += f"\nMuscle group: {req.muscle}"
    text = await call_groq(prompt=prompt, system=FORM_TIPS_SYSTEM, max_tokens=300, temperature=0.4)
    return {"result": strip_markdown(text)}


# ── Recipe photos (Pexels, else Openverse) ───────────────────────────────────

PEXELS_URL = "https://api.pexels.com/v1/search"
OPENVERSE_URL = "https://api.openverse.org/v1/images/"
OPENVERSE_HEADERS = {"User-Agent": "Formly/1.0 (+https://formly-teal.vercel.app)"}
OPENVERSE_MAX_QUERIES = 4
OPENVERSE_IMAGE_TYPES = {"jpg", "jpeg", "png", "webp"}
# Openverse license code → the label shown in the photo credit. Only these licenses are requested and accepted.
OPENVERSE_LICENSES = {"by": "CC BY", "by-sa": "CC BY-SA", "cc0": "CC0", "pdm": "Public domain"}
MAX_PHOTO_QUERY_CHARS = 120
PHOTO_CACHE_MAX = 500
PHOTO_CACHE_HEADER = "public, max-age=86400"
# Names that already read as a dish or drink get searched on Pexels as-is; anything else gets " food".
DISH_WORDS = re.compile(
    r"\b(food|dish|meal|breakfast|lunch|dinner|snack|salad|soup|stew|curry|dal|dhal|chilli|chili|"
    r"stir[- ]?fry|bowl|wrap|sandwich|toast|tacos?|burrito|pasta|noodles?|risotto|rice|omelet(te)?|"
    r"frittata|eggs|porridge|oats|pancakes?|muffins?|cake|cookies?|bars?|bites|pudding|parfait|"
    r"drink|smoothie|juice|tea|latte|coffee|cocoa|chocolate|milk|lemonade|cooler|tonic|shake|mocktail)\b",
    re.I,
)
# Filler words dropped when shortening a name for Openverse (which AND-matches every word).
PHOTO_STOP_WORDS = {"with", "and", "a", "an", "the", "of", "on", "in", "my", "easy", "quick", "for", "to"}

# Normalised name → response body. Per warm instance only; saves upstream calls on repeat lookups.
_photo_cache: dict[str, dict] = {}


def photo_cache_key(name: str) -> str:
    return " ".join(name.lower().split())


def photo_search_query(name: str) -> str:
    """Normalised Pexels query for a recipe name: lower-cased, single-spaced, with food context."""
    query = photo_cache_key(name)
    return query if DISH_WORDS.search(query) else f"{query} food"


def openverse_queries(name: str) -> list[str]:
    """Openverse queries to try, most specific first: the cleaned name, then without filler words,
    then its last two, first two and last word. De-duplicated and capped at OPENVERSE_MAX_QUERIES."""
    words = re.findall(r"[a-z0-9]+", name.lower())
    core = [w for w in words if w not in PHOTO_STOP_WORDS] or words
    out: list[str] = []
    for candidate in (words, core, core[-2:], core[:2], core[-1:]):
        query = " ".join(candidate)
        if query and query not in out:
            out.append(query)
    return out[:OPENVERSE_MAX_QUERIES]


async def pexels_search(query: str, key: str) -> dict:
    """Calls the Pexels search API and returns its JSON. Raises on HTTP / network errors."""
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(
            PEXELS_URL,
            headers={"Authorization": key},
            params={"query": query, "per_page": 1, "orientation": "landscape"},
        )
    res.raise_for_status()
    return res.json()


async def openverse_search(query: str) -> dict:
    """Calls the keyless Openverse image search and returns its JSON. Raises on HTTP / network errors."""
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(
            OPENVERSE_URL,
            headers=OPENVERSE_HEADERS,
            params={"q": query, "page_size": 5, "mature": "false", "license": ",".join(OPENVERSE_LICENSES)},
        )
    res.raise_for_status()
    return res.json()


def _https(value) -> str:
    return value if isinstance(value, str) and value.startswith("https://") else ""


def _photo_from_pexels(data: dict) -> Optional[dict]:
    photos = data.get("photos") if isinstance(data, dict) else None
    if not photos:
        return None
    photo = photos[0]
    src = photo.get("src") or {}
    url = _https(src.get("large")) or _https(src.get("medium"))
    if not url:
        return None
    return {
        "url": url,
        "photographer": photo.get("photographer") or "",
        "photographer_url": _https(photo.get("photographer_url")),
        "source_url": _https(photo.get("url")),
        "source": "Pexels",
        "license": "Pexels License",
    }


def openverse_license_label(code: str, version) -> str:
    """e.g. ("by", "2.0") → "CC BY 2.0", ("cc0", "1.0") → "CC0", ("pdm", …) → "Public domain"."""
    label = OPENVERSE_LICENSES[code]
    if code in ("by", "by-sa") and isinstance(version, str) and version.strip():
        label += f" {version.strip()}"
    return label


def _photo_from_openverse(data: dict) -> Optional[dict]:
    """The first usable result: an https image url, an accepted license and (if given) an image file type."""
    results = data.get("results") if isinstance(data, dict) else None
    for item in results or []:
        if not isinstance(item, dict):
            continue
        url = _https(item.get("url"))
        code = str(item.get("license") or "").lower()
        filetype = item.get("filetype")
        if not url or code not in OPENVERSE_LICENSES:
            continue
        if filetype and str(filetype).lower() not in OPENVERSE_IMAGE_TYPES:
            continue
        return {
            "url": url,
            "photographer": str(item.get("creator") or "").strip(),
            "photographer_url": _https(item.get("creator_url")),
            "source_url": _https(item.get("foreign_landing_url")),
            "source": "Openverse",
            "license": openverse_license_label(code, item.get("license_version")),
        }
    return None


def _error_detail(e: Exception) -> str:
    return f"{e.response.status_code}" if isinstance(e, httpx.HTTPStatusError) else type(e).__name__


@app.get("/api/recipe-photo")
async def recipe_photo(response: Response, q: str = Query(...)):
    """A food photo for a recipe name: {url, photographer, photographer_url, source_url, source, license},
    or {"url": null} when nothing matches or the lookup fails. Tries Pexels first when PEXELS_API_KEY is
    set (the key never leaves the server); otherwise, or when Pexels has nothing, keyless Openverse."""
    name = q.strip()
    if not 1 <= len(name) <= MAX_PHOTO_QUERY_CHARS:
        raise HTTPException(status_code=422, detail=f"q must be 1-{MAX_PHOTO_QUERY_CHARS} characters")
    cache_key = photo_cache_key(name)

    if cache_key in _photo_cache:
        response.headers["Cache-Control"] = PHOTO_CACHE_HEADER
        return _photo_cache[cache_key]

    result: Optional[dict] = None
    key = os.getenv("PEXELS_API_KEY", "").strip()
    if key:
        try:
            result = _photo_from_pexels(await pexels_search(photo_search_query(name), key))
        except Exception as e:  # network errors, non-2xx, bad JSON: fall back to Openverse
            print(f"recipe-photo: Pexels error for {cache_key!r}: {_error_detail(e)}")

    if result is None:
        for query in openverse_queries(name):
            try:
                result = _photo_from_openverse(await openverse_search(query))
            except Exception as e:  # degrade to no photo, uncached so the next request retries
                print(f"recipe-photo: Openverse error for {query!r}: {_error_detail(e)}")
                response.headers["Cache-Control"] = "no-store"
                return {"url": None}
            if result:
                break

    body = result or {"url": None}
    if len(_photo_cache) >= PHOTO_CACHE_MAX:
        _photo_cache.pop(next(iter(_photo_cache)))
    _photo_cache[cache_key] = body
    response.headers["Cache-Control"] = PHOTO_CACHE_HEADER
    return body


@app.get("/api/test")
async def test_key():
    try:
        text = await call_groq("Reply with only the word: OK", max_tokens=10, temperature=0)
        return {"ok": True, "response": text}
    except HTTPException as e:
        return {"ok": False, "error": e.detail}
    except Exception as e:
        return {"ok": False, "error": str(e)}