"""
ИИ-ассистент FoxNet: генерация текста (GPT-4o), картинок (DALL-E 3), описание видео.
"""
import json
import os
import base64
import urllib.request
import urllib.error


OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")
HEADERS = {
    "Authorization": f"Bearer {OPENAI_KEY}",
    "Content-Type": "application/json",
}
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def openai_post(path: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"https://api.openai.com/v1{path}",
        data=data,
        headers=HEADERS,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if not OPENAI_KEY:
        return {
            "statusCode": 503,
            "headers": CORS,
            "body": json.dumps({"error": "OPENAI_API_KEY не настроен. Добавьте ключ в секреты проекта."}),
        }

    try:
        body = json.loads(event.get("body") or "{}")
        mode = body.get("mode", "text")   # text | image | video_idea
        prompt = body.get("prompt", "").strip()

        if not prompt:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пустой запрос"})}

        # ── TEXT (GPT-4o) ──────────────────────────────────────────────────
        if mode == "text":
            resp = openai_post("/chat/completions", {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "Ты дружелюбный ИИ-помощник социальной сети FoxNet. Отвечай кратко, живо и по делу. Используй эмодзи там, где уместно."},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 800,
                "temperature": 0.8,
            })
            text = resp["choices"][0]["message"]["content"]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"result": text, "mode": "text"})}

        # ── IMAGE (DALL-E 3) ───────────────────────────────────────────────
        if mode == "image":
            resp = openai_post("/images/generations", {
                "model": "dall-e-3",
                "prompt": prompt,
                "n": 1,
                "size": "1024x1024",
                "quality": "standard",
                "response_format": "url",
            })
            url = resp["data"][0]["url"]
            revised = resp["data"][0].get("revised_prompt", prompt)
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"result": url, "revised_prompt": revised, "mode": "image"})}

        # ── VIDEO IDEA (GPT-4o — сценарий / описание ролика) ──────────────
        if mode == "video":
            resp = openai_post("/chat/completions", {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "Ты сценарист-эксперт для коротких видео в соцсетях. Создавай яркие, цепляющие концепции видео. Формат: 🎬 Название, 📝 Описание (2-3 предложения), 🎭 Сцены (3-5 шагов), 🎵 Музыкальное настроение, ⏱️ Хронометраж."},
                    {"role": "user", "content": f"Придумай концепцию видео для соцсети на тему: {prompt}"},
                ],
                "max_tokens": 600,
                "temperature": 0.9,
            })
            text = resp["choices"][0]["message"]["content"]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"result": text, "mode": "video"})}

        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Неизвестный режим"})}

    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        return {"statusCode": 502, "headers": CORS, "body": json.dumps({"error": f"OpenAI ошибка: {err_body}"})}
    except Exception as e:
        return {"statusCode": 500, "headers": CORS, "body": json.dumps({"error": str(e)})}
