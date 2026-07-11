import os
import requests
from flask import Flask, jsonify, request

LM_STUDIO_URL = os.getenv(
    "LM_STUDIO_URL",
    "http://localhost:7095/v1/chat/completions",
)

LM_STUDIO_MODEL = os.getenv(
    "LM_STUDIO_MODEL",
    "gemma-4-26b-a4b-it",
)

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5173"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.get('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.get('/api/hello')
def hello():
    return jsonify({'message': 'Hello from Python backend!'})

def build_chat_prompt_payload(data: dict) -> list[dict[str, str]]:
    chat = data.get("chat") or {}
    messages = data.get("messages") or []
    responding_character = data.get("respondingCharacter") or {}
    user_persona = data.get("userPersona") or {}
    characters = data.get("characters") or []

    character_name = responding_character.get("label") or "Assistant"
    user_name = user_persona.get("label") or "User"

    system_parts = [
        f"You are roleplaying as {character_name}.",
        f"The user is roleplaying as {user_name}.",
        "Stay in character.",
        "Write only the next message for your character.",
        "Do not speak for the user.",
    ]

    if chat.get("scenario"):
        system_parts.append(f"Scenario: {chat['scenario']}")

    if characters:
        character_names = [
            character.get("label")
            for character in characters
            if character.get("label")
        ]

        if character_names:
            system_parts.append(
                f"Characters in this chat: {', '.join(character_names)}."
            )

    api_messages = [
        {
            "role": "system",
            "content": "\n\n".join(system_parts),
        }
    ]

    for message in messages:
        role = message.get("role")
        content = (message.get("content") or "").strip()
        speaker_label = message.get("speakerLabel")

        if not content:
            continue

        if role == "user":
            api_messages.append(
                {
                    "role": "user",
                    "content": f"{speaker_label or user_name}: {content}",
                }
            )
        elif role == "assistant":
            api_messages.append(
                {
                    "role": "assistant",
                    "content": f"{speaker_label or character_name}: {content}",
                }
            )

    return api_messages

@app.post("/api/chat/generate")
def generate_chat_response():
    data = request.get_json(silent=True) or {}

    api_messages = build_chat_prompt_payload(data)

    try:
        response = requests.post(
            LM_STUDIO_URL,
            json={
                "model": LM_STUDIO_MODEL,
                "messages": api_messages,
                "temperature": 0.8,
                "max_tokens": 600,
                "stream": False,
            },
            timeout=120,
        )

        response.raise_for_status()
        payload = response.json()

        content = (
            payload.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

        if not content:
            return jsonify({"error": "LM Studio returned an empty response."}), 502

        return jsonify({"content": content})

    except requests.RequestException as error:
        return (
            jsonify(
                {
                    "error": "Failed to generate response from LM Studio.",
                    "details": str(error),
                }
            ),
            502,
        )


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

