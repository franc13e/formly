from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"


class PromptRequest(BaseModel):
    prompt: str
    system: str = ""
    max_tokens: int = 800
    temperature: float = 0.7


async def call_groq(prompt: str, system: str = "", max_tokens: int = 800, temperature: float = 0.7):
    if not GROQ_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set in .env")

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={"model": MODEL, "messages": messages, "max_tokens": max_tokens, "temperature": temperature},
        )

    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    return res.json()["choices"][0]["message"]["content"]


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
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
        system="You are a women's fitness and nutrition coach. Rules: 1) Create EXACTLY the number of workout days specified, no more, no less. Number them Day 1, Day 2 etc. 2) Under each day write one WHY line explaining how it suits the current cycle phase if provided. 3) Use these headers exactly: WEEKLY WORKOUT PLAN:, FOODS TO FOCUS ON:, WHAT YOU WILL ACHIEVE:, COACH'S NOTE:. 4) Every header must appear. 5) Use bullet points only.",
        max_tokens=700,
        temperature=0.7,
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

@app.get("/api/test")
async def test_key():
    try:
        text = await call_groq("Reply with only the word: OK", max_tokens=10, temperature=0)
        return {"ok": True, "response": text}
    except HTTPException as e:
        return {"ok": False, "error": e.detail}
    except Exception as e:
        return {"ok": False, "error": str(e)}