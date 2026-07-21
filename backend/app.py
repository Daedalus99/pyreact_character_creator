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

# Store settings in memory
app_settings = {}
selected_provider = 'lmstudio'

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

@app.post('/api/settings/update')
def update_settings():
    global app_settings
    data = request.get_json(silent=True) or {}
    app_settings = data
    return jsonify({'status': 'success', 'message': 'Settings updated'})

@app.get('/api/settings')
def get_settings():
    return jsonify(app_settings)

@app.post('/api/provider/select')
def select_provider():
    global selected_provider
    data = request.get_json(silent=True) or {}
    provider = data.get('provider', 'lmstudio')
    
    if provider in ['lmstudio', 'openai', 'gemini', 'grok']:
        selected_provider = provider
        return jsonify({'status': 'success', 'provider': selected_provider})
    else:
        return jsonify({'error': 'Invalid provider'}), 400

@app.get('/api/provider/current')
def get_current_provider():
    return jsonify({'provider': selected_provider})

def build_chat_prompt_payload(data: dict) -> list[dict[str, str]]:
    chat = data.get("chat") or {}
    messages = data.get("messages") or []
    responding_character = data.get("respondingCharacter") or {}
    user_persona = data.get("userPersona") or {}
    characters = data.get("characters") or []

    character_name = responding_character.get("label") or "Assistant"
    user_name = user_persona.get("label") or "User"

    def build_character_description(character):
        """Build a rich character description from creation data"""
        if not character:
            return None
            
        draft = character.get("draft", {})
        name = draft.get("name") or character.get("label")
        age = draft.get("age")
        selected_options = draft.get("selectedOptionIdsByGroup", {})
        custom_text = draft.get("customTextByGroup", {})
        
        # Build description parts
        desc_parts = [f"Name: {name}"]
        
        if age:
            desc_parts.append(f"Age: {age}")
            
        # Include ALL traits, not just a subset
        # Skip only artstyle as that's for image generation, not roleplay
        excluded_groups = ["artstyle"]
        
        for group_id, selected_value in selected_options.items():
            if group_id in excluded_groups or not selected_value:
                continue
                
            # Handle both single values and arrays
            if isinstance(selected_value, list):
                # For arrays, clean up each value and join them
                cleaned_values = []
                for val in selected_value:
                    cleaned_val = val.replace(f"{group_id}_", "").replace("_", " ").title()
                    cleaned_values.append(cleaned_val)
                cleaned_value = ", ".join(cleaned_values)
            else:
                # For single values, clean up the formatting
                cleaned_value = selected_value.replace(f"{group_id}_", "").replace("_", " ").title()
            
            # Create readable group names
            group_display_names = {
                "eyeColor": "Eye Color",
                "hairColor": "Hair Color", 
                "hairStyle": "Hair Style",
                "bodyType": "Body Type",
                "breastSize": "Breast Size",
                "cockSize": "Cock Size",
                "buttSize": "Butt Size",
                "relationshipStatus": "Relationship Status",
                "typicalOutfit": "Typical Outfit",
                "notableFeatures": "Notable Features"
            }
            
            group_name = group_display_names.get(group_id, group_id.title())
            desc_parts.append(f"{group_name}: {cleaned_value}")
        
        # Add custom text
        for group_id, text in custom_text.items():
            if text and text.strip():
                group_name = group_display_names.get(group_id, group_id.title())
                desc_parts.append(f"{group_name}: {text.strip()}")
        
        # Add lore entries
        lore_entries = draft.get("loreEntries", [])
        if lore_entries and isinstance(lore_entries, list):
            valid_lore = [entry.strip() for entry in lore_entries if entry and entry.strip()]
            if valid_lore:
                desc_parts.append(f"Background: {' '.join(valid_lore)}")
                
        # Add basic summary if no detailed info
        if len(desc_parts) == 1 and character.get("summary"):
            desc_parts.append(character["summary"])
            
        return "; ".join(desc_parts)

    # Build character descriptions for context
    character_descriptions = []
    for character in characters:
        if character.get("label"):
            desc = build_character_description(character)
            if desc:
                character_descriptions.append(f"- {character['label']}: {desc}")
    
    # Handle multi-character scenarios
    if len(characters) > 1:
        character_list = [char.get("label") for char in characters if char.get("label")]
        system_parts = [
            f"You are writing for all characters in this roleplay scenario.",
            f"The user is roleplaying as {user_name}.",
            f"Characters available: {', '.join(character_list)}.",
            "Write responses for the character(s) that would logically respond next.",
            "If multiple characters would respond, include all of their responses.",
            "Format multi-character responses as: 'Character1: message' and 'Character2: message'.",
            "Stay true to each character's personality and traits.",
            "Do not speak for the user.",
        ]
        
        if character_descriptions:
            system_parts.append("Character details:")
            system_parts.extend(character_descriptions)
    else:
        # Single character scenario
        responding_desc = build_character_description(responding_character)
        
        system_parts = [
            f"You are roleplaying as {character_name}.",
            f"The user is roleplaying as {user_name}.",
            "Stay in character at all times.",
            "Write only the next message for your character.",
            "Do not speak for the user.",
        ]
        
        if responding_desc:
            system_parts.append(f"Your character details: {responding_desc}")
        elif responding_character.get("summary"):
            system_parts.append(f"Character description: {responding_character['summary']}")

    # Add chat context
    if chat.get("scenario"):
        system_parts.append(f"Scenario: {chat['scenario']}")

    if chat.get("setting"):
        system_parts.append(f"Setting: {chat['setting']}")

    if chat.get("genre"):
        system_parts.append(f"Genre: {chat['genre']}")

    if chat.get("tone"):
        system_parts.append(f"Tone: {chat['tone']}")

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
                    "content": content,  # Assistant messages may already be formatted
                }
            )
    return api_messages

@app.post("/api/chat/generate")
def generate_chat_response():
    data = request.get_json(silent=True) or {}

    api_messages = build_chat_prompt_payload(data)
    app.logger.info(api_messages)

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

@app.post("/api/chat/extend")
def extend_message():
    data = request.get_json(silent=True) or {}

    # Extract the original message to extend
    messages = data.get("messages") or []
    responding_character = data.get("respondingCharacter") or {}
    character_name = responding_character.get("label") or "Assistant"
    
    if not messages:
        return jsonify({"error": "No message to extend"}), 400
    
    original_message = messages[0]
    original_content = original_message.get("content", "").replace("CONTINUE THIS MESSAGE: \"", "").replace("\"", "")
    
    # Remove character name prefix if present
    clean_content = original_content
    if ":" in clean_content:
        clean_content = clean_content.split(":", 1)[1].strip()
    
    # Build rich character description for extension context
    def build_character_description_simple(character):
        """Build a character description for extension prompts"""
        if not character:
            return None
            
        draft = character.get("draft", {})
        if not draft:
            return character.get("summary")
            
        desc_parts = []
        selected_options = draft.get("selectedOptionIdsByGroup", {})
        
        # Include more comprehensive traits for better context
        # Focus on roleplay-relevant traits for extensions
        priority_traits = ["personality", "occupation", "gender", "race", "relationshipStatus", "hobbies"]
        
        for trait in priority_traits:
            if trait in selected_options and selected_options[trait]:
                value = selected_options[trait]
                if isinstance(value, list):
                    cleaned_values = []
                    for val in value:
                        cleaned_val = val.replace(f"{trait}_", "").replace("_", " ").title()
                        cleaned_values.append(cleaned_val)
                    cleaned_value = ", ".join(cleaned_values)
                else:
                    cleaned_value = value.replace(f"{trait}_", "").replace("_", " ").title()
                
                # Use nice display names
                display_names = {
                    "relationshipStatus": "Relationship Status"
                }
                trait_name = display_names.get(trait, trait.title())
                desc_parts.append(f"{trait_name}: {cleaned_value}")
        
        # Add any custom personality/background text that's really important
        custom_text = draft.get("customTextByGroup", {})
        for group_id, text in custom_text.items():
            if group_id in ["personality", "background"] and text and text.strip():
                desc_parts.append(text.strip())
                
        return "; ".join(desc_parts) if desc_parts else character.get("summary")
    
    # Get character description for better context
    char_desc = build_character_description_simple(responding_character)
    
    # Create system prompt with character context
    system_content = f"You are {character_name}. Continue speaking naturally. Only provide the NEW additional text that comes next. Do NOT repeat or rewrite what was already said."
    if char_desc:
        system_content += f" Character context: {char_desc}"
    
    api_messages = [
        {
            "role": "system",
            "content": system_content
        },
        {
            "role": "user",
            "content": f"Your previous words were: \"{clean_content}\"\n\nContinue with NEW words only (don't repeat the previous words):"
        }
    ]

    try:
        response = requests.post(
            LM_STUDIO_URL,
            json={
                "model": LM_STUDIO_MODEL,
                "messages": api_messages,
                "temperature": 0.8,
                "max_tokens": 100,
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

        # Clean up the response - remove character name prefix if it got added
        cleaned_content = content
        if cleaned_content.startswith(f"{character_name}:"):
            cleaned_content = cleaned_content[len(f"{character_name}:"):].strip()
        
        # Remove quotes if the model wrapped the response in quotes
        if cleaned_content.startswith('"') and cleaned_content.endswith('"'):
            cleaned_content = cleaned_content[1:-1].strip()

        # Check if the response starts with the original content (repetition)
        # If so, extract only the new part
        if cleaned_content.lower().startswith(clean_content.lower()):
            # Remove the repeated part and any following punctuation/spaces
            remaining = cleaned_content[len(clean_content):].strip()
            # Remove leading punctuation that might separate original from new content
            while remaining and remaining[0] in '.,!?;: ':
                remaining = remaining[1:].strip()
            cleaned_content = remaining
        
        # If the cleaned content is empty or too short, return an error
        if not cleaned_content or len(cleaned_content.strip()) < 3:
            return jsonify({"error": "Model repeated the original content without adding new text. Try again."}), 502

        return jsonify({"content": cleaned_content})

    except requests.RequestException as error:
        return (
            jsonify(
                {
                    "error": "Failed to extend message from LM Studio.",
                    "details": str(error),
                }
            ),
            502,
        )


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

