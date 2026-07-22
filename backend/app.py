import os
import requests
import asyncio
import base64
from flask import Flask, jsonify, request
from flask_cors import CORS
from perchance import ImageGenerator
from perchance_website_automation import generate_images_via_website

LM_STUDIO_URL = os.getenv(
    "LM_STUDIO_URL",
    "http://localhost:7095/v1/chat/completions",
)

LM_STUDIO_MODEL = os.getenv(
    "LM_STUDIO_MODEL",
    "gemma-4-26b-a4b-it",
)

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:5173"])

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
    
    # Create comprehensive readable group names for ALL possible traits
    group_display_names = {
        "gender": "Gender",
        "race": "Race",
        "eyeColor": "Eye Color",
        "hairColor": "Hair Color", 
        "hairStyle": "Hair Style",
        "bodyType": "Body Type",
        "breastSize": "Breast Size",
        "cockSize": "Cock Size",
        "buttSize": "Butt Size",
        "personality": "Personality",
        "occupation": "Occupation",
        "hobbies": "Hobbies",
        "relationshipStatus": "Relationship Status",
        "typicalOutfit": "Typical Outfit",
        "notableFeatures": "Notable Features",
        "kinks": "Kinks",
        "skills": "Skills",
        "fears": "Fears",
        "goals": "Goals",
        "backstory": "Backstory",
        "mannerisms": "Mannerisms",
        "speechPattern": "Speech Pattern",
        "favoriteThings": "Favorite Things",
        "dislikes": "Dislikes"
    }
    
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
        
        group_name = group_display_names.get(group_id, group_id.replace("_", " ").title())
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


def build_chat_prompt_payload(data: dict) -> list[dict[str, str]]:
    chat = data.get("chat") or {}
    messages = data.get("messages") or []
    responding_character = data.get("respondingCharacter") or {}
    user_persona = data.get("userPersona") or {}
    characters = data.get("characters") or []

    character_name = responding_character.get("label") or "Assistant"
    user_name = user_persona.get("label") or "User"

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
        user_desc = build_character_description(user_persona) if user_persona else None
        
        system_parts = [
            f"You are roleplaying as {character_name}.",
            f"The user is roleplaying as {user_name}.",
            "Stay in character at all times.",
            "Write only the next message for your character.",
            "Do not speak for the user.",
        ]
        
        # Add your character details
        if responding_desc:
            system_parts.append(f"Your character details: {responding_desc}")
        elif responding_character.get("summary"):
            system_parts.append(f"Character description: {responding_character['summary']}")
        
        # Add user persona details
        if user_desc:
            system_parts.append(f"User character details: {user_desc}")
        
        # Add any other characters present (even if not actively responding)
        if character_descriptions:
            other_characters = [desc for desc in character_descriptions 
                             if not desc.startswith(f"- {character_name}:")]
            if other_characters:
                system_parts.append("Other characters present:")
                system_parts.extend(other_characters)

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
                "temperature": 0.5,
                "max_tokens": 750,
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


@app.post("/api/prompt/enhance")
def enhance_prompt():
    """Enhance a prompt using Perchance's prompt enhancement tool"""
    data = request.get_json(silent=True) or {}
    
    prompt = data.get("prompt", "").strip()
    prompt_type = data.get("type", "normal")  # "normal" or "random"
    
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    try:
        app.logger.info(f"Enhancing prompt: {prompt}")
        app.logger.info(f"Enhancement type: {prompt_type}")
        
        # Try LM Studio first (more reliable), fallback to Perchance if needed
        result = asyncio.run(enhance_prompt_with_lm_studio(prompt, prompt_type))
        
        if result.get("success"):
            return jsonify(result)
        else:
            return jsonify({
                "error": "Enhancement failed",
                "details": result.get("error", "Unknown error"),
            }), 502
            
    except Exception as error:
        app.logger.error(f"Prompt enhancement failed: {error}")
        return jsonify({
            "error": "Failed to enhance prompt",
            "details": str(error),
        }), 502


@app.route('/api/image/generate/stream', methods=['GET', 'POST', 'OPTIONS'])
def generate_image_stream():
    """Generate images with real-time progress updates via Server-Sent Events"""
    from flask import Response
    import json

    # Handle both GET (EventSource) and POST requests
    if request.method == 'GET':
        prompt = request.args.get('prompt', '')
        art_style = request.args.get('artStyle', 'realistic')
        shape = request.args.get('shape', 'square')
        batch_size = int(request.args.get('batchSize', 1))
        negative_prompt = request.args.get('negativePrompt', '')
    else:  # POST
        data = request.get_json(silent=True) or {}
        prompt = data.get("prompt", "").strip()
        negative_prompt = data.get("negativePrompt", "")
        art_style = data.get("artStyle", "anime")
        shape = data.get("shape", "portrait")
        batch_size = min(data.get("batchSize", 1), 5)

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    def generate_stream():
        try:
            app.logger.info("Starting streaming response generation")
            # Send initial progress
            start_data = f"data: {json.dumps({'type': 'start', 'batchSize': batch_size, 'message': f'Starting generation of {batch_size} images...'})}\n\n"
            app.logger.info(f"Sending start data: {start_data[:100]}...")
            yield start_data

            # Map art styles and create styled prompt
            style_mappings = {
                "anime": "anime style, high quality anime art",
                "realistic": "photorealistic, detailed, high resolution",
                "cartoon": "cartoon style, western animation style", 
                "digital_art": "digital art, digital painting, high quality",
                "oil_painting": "oil painting style, traditional art, painterly",
                "watercolor": "watercolor painting, soft colors, artistic",
                "sketch": "pencil sketch, hand drawn, artistic sketch",
                "pixel_art": "pixel art style, retro, 8-bit style"
            }

            style_addition = style_mappings.get(art_style, f"{art_style} style")
            styled_prompt = f"{prompt}, {style_addition}"

            # Generate images one by one for real-time feedback
            results = []
            for i in range(batch_size):
                try:
                    # Send progress update
                    progress_data = {
                        'type': 'progress', 
                        'imageIndex': i, 
                        'message': f'Generating image {i+1} of {batch_size}...'
                    }
                    progress_msg = f"data: {json.dumps(progress_data)}\n\n"
                    app.logger.info(f"Sending progress for image {i+1}: {progress_msg[:100]}...")
                    yield progress_msg

                    # Create batch prompt
                    if batch_size > 1:
                        batch_prompt = f"{styled_prompt}, variation {i+1}"
                    else:
                        batch_prompt = styled_prompt

                    # Generate single image (run async function in event loop)
                    result = asyncio.run(generate_image_with_fallback(batch_prompt, negative_prompt, shape, art_style))

                    if result.get("success"):
                        # Send successful image
                        success_data = {
                            'type': 'image_complete',
                            'imageIndex': i,
                            'image': result,
                            'message': f'Image {i+1} generated successfully!'
                        }
                        yield f"data: {json.dumps(success_data)}\n\n"
                        results.append(result)
                    else:
                        # Send error for this image
                        error_data = {
                            'type': 'image_error',
                            'imageIndex': i,
                            'error': result.get('error', 'Unknown error'),
                            'message': f'Image {i+1} failed to generate'
                        }
                        yield f"data: {json.dumps(error_data)}\n\n"

                except Exception as e:
                    # Send error for this image
                    error_data = {
                        'type': 'image_error',
                        'imageIndex': i,
                        'error': str(e),
                        'message': f'Image {i+1} failed with exception'
                    }
                    yield f"data: {json.dumps(error_data)}\n\n"

            # Send final completion
            final_data = {
                'type': 'complete',
                'successCount': len(results),
                'totalImages': batch_size,
                'message': f'Batch complete: {len(results)} of {batch_size} images generated'
            }
            yield f"data: {json.dumps(final_data)}\n\n"
                
        except Exception as error:
            error_data = {
                'type': 'error',
                'error': str(error),
                'message': 'Batch generation failed'
            }
            yield f"data: {json.dumps(error_data)}\n\n"

    return Response(
        generate_stream(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'X-Accel-Buffering': 'no'  # Disable nginx buffering
        }
    )


@app.route('/api/image/generate', methods=['POST', 'OPTIONS'])
def generate_image():
    """Generate image using Perchance AI Text-to-Image Generator"""
    if request.method == 'OPTIONS':
        # Handle CORS preflight
        return '', 200
    
    app.logger.info("Image generation endpoint called")
    data = request.get_json(silent=True) or {}
    app.logger.info(f"Received data: {data}")

    prompt = data.get("prompt", "").strip()
    negative_prompt = data.get("negativePrompt", "")
    art_style = data.get("artStyle", "anime")
    shape = data.get("shape", "portrait")  # portrait, square, or landscape
    batch_size = min(data.get("batchSize", 1), 5)  # Limit to max 5 images

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        app.logger.info(f"Generating {batch_size} image(s) with prompt: {prompt}")
        app.logger.info(f"Art style: {art_style}")
        app.logger.info(f"Shape: {shape}")
        app.logger.info(f"Negative prompt: {negative_prompt}")
        app.logger.info(f"Batch size: {batch_size}")

        # Map our art styles to better Perchance prompts
        style_mappings = {
            "anime": "anime style, high quality anime art",
            "realistic": "photorealistic, detailed, high resolution",
            "cartoon": "cartoon style, western animation style", 
            "digital_art": "digital art, digital painting, high quality",
            "oil_painting": "oil painting style, traditional art, painterly",
            "watercolor": "watercolor painting, soft colors, artistic",
            "sketch": "pencil sketch, hand drawn, artistic sketch",
            "pixel_art": "pixel art style, retro, 8-bit style"
        }
        
        # Add art style to the prompt
        style_addition = style_mappings.get(art_style, f"{art_style} style")
        styled_prompt = f"{prompt}, {style_addition}"

        # Generate multiple images concurrently for batch generation
        async def generate_batch():
            app.logger.info(f"Starting batch generation of {batch_size} images")
            tasks = []
            for i in range(batch_size):
                # Add slight variation to each image in the batch if batch_size > 1
                if batch_size > 1:
                    # Add a small random seed variation to each image
                    batch_prompt = f"{styled_prompt}, variation {i+1}"
                    app.logger.info(f"Batch image {i+1}: {batch_prompt}")
                else:
                    batch_prompt = styled_prompt
                    app.logger.info(f"Single image: {batch_prompt}")
                    
                task = generate_image_with_fallback(batch_prompt, negative_prompt, shape, art_style)
                tasks.append(task)
            
            app.logger.info(f"Created {len(tasks)} generation tasks, starting concurrent execution")
            
            # Wait for all images to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            app.logger.info(f"Batch generation completed, processing {len(results)} results")
            
            # Process results
            successful_images = []
            errors = []
            
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    app.logger.error(f"Image {i+1} failed with exception: {result}")
                    errors.append(f"Image {i+1}: {str(result)}")
                elif isinstance(result, dict) and result.get("success"):
                    app.logger.info(f"Image {i+1} generated successfully")
                    successful_images.append(result)
                elif isinstance(result, dict) and result.get("placeholder"):
                    app.logger.warning(f"Image {i+1} returned placeholder due to service issue: {result.get('error')}")
                    errors.append(f"Image {i+1}: {result.get('error')} - {result.get('details')}")
                else:
                    app.logger.warning(f"Image {i+1} failed: {result.get('error', 'Unknown error') if isinstance(result, dict) else result}")
                    errors.append(f"Image {i+1}: {result.get('error', 'Unknown error') if isinstance(result, dict) else str(result)}")
            
            app.logger.info(f"Batch complete: {len(successful_images)} successful, {len(errors)} errors")
            return successful_images, errors

        successful_images, errors = asyncio.run(generate_batch())

        if successful_images:
            return jsonify({
                "success": True,
                "images": successful_images,
                "batchSize": batch_size,
                "successCount": len(successful_images),
                "errors": errors if errors else None
            })
        else:
            return jsonify({
                "error": "All images in batch failed to generate",
                "details": errors,
                "batchSize": batch_size
            }), 502

    except Exception as error:
        app.logger.error(f"Perchance image generation failed: {error}")
        return jsonify({
            "error": "Failed to generate image with Perchance",
            "details": str(error),
        }), 502


async def call_lm_studio(messages):
    """Make an async call to LM Studio API"""
    import aiohttp
    
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "model": LM_STUDIO_MODEL,
                "messages": messages,
                "temperature": 0.7,  # Slightly higher for creativity
                "max_tokens": 1000,  # More tokens for detailed prompts
                "stream": False,
            }
            
            async with session.post(LM_STUDIO_URL, json=payload, timeout=120) as response:
                if response.status == 200:
                    result = await response.json()
                    content = (
                        result.get("choices", [{}])[0]
                        .get("message", {})
                        .get("content", "")
                        .strip()
                    )
                    return content
                else:
                    raise Exception(f"LM Studio API returned status {response.status}")
                    
    except Exception as e:
        app.logger.error(f"LM Studio API call failed: {e}")
        raise


async def enhance_prompt_with_lm_studio(prompt, prompt_type="normal"):
    """Enhance a prompt using LM Studio (more reliable)"""
    try:
        app.logger.info(f"Using LM Studio to enhance prompt: {prompt}")
        app.logger.info(f"Enhancement type: {prompt_type}")
        
        # Create enhancement instruction based on type
        if prompt_type == "random":
            system_prompt = """You are an expert AI image prompt enhancer. Transform basic prompts into extremely detailed, vivid descriptions with Perchance-style random choice blocks using curly braces.

Use {option1|option2|option3} syntax to add variety for:
- Technical quality terms like {hyper-realistic 8k masterpiece|breathtakingly detailed digital painting|cinematic high-fidelity render}
- Descriptive adjectives for appearance, lighting, composition, emotions
- Environmental and atmospheric details
- Camera angles and artistic styles

Make the enhanced prompt rich, professional, and highly detailed while preserving the original subject and intent.

IMPORTANT: Return ONLY the enhanced prompt. Do not include explanations, notes, formatting markers, or any meta-text. Just the raw enhanced prompt itself."""
        else:
            system_prompt = """You are an expert AI image prompt enhancer. Transform basic prompts into extremely detailed, vivid, professional-quality descriptions for AI image generation.

Add rich visual details including:
- Technical specifications (8k, hyper-realistic, masterpiece, cinematic, etc.)
- Detailed physical descriptions with specific adjectives
- Atmospheric and lighting details
- Composition and camera angles
- Environmental context and backgrounds
- Texture, material, and fabric descriptions
- Emotional expressions and body language
- Professional photography/art terminology

Make it extremely detailed and vivid while preserving the original subject and intent.

IMPORTANT: Return ONLY the enhanced prompt. Do not include explanations, notes, formatting markers, or any meta-text. Just the raw enhanced prompt itself."""

        user_prompt = f"Enhance this image prompt:\n\n{prompt}"
        
        # Use the existing LM Studio chat function
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        enhanced_text = await call_lm_studio(messages)
        
        if enhanced_text and enhanced_text.strip():
            # Clean up the response (remove any meta-text)
            enhanced_text = enhanced_text.strip()
            
            # Remove everything before "**Enhanced Prompt:**" if it exists
            enhanced_marker = "**Enhanced Prompt:**"
            if enhanced_marker in enhanced_text:
                enhanced_text = enhanced_text.split(enhanced_marker, 1)[1].strip()
            
            # Remove everything after explanation markers
            explanation_markers = [
                "***",
                "### Key Enhancements Made:",
                "### Enhancements:",
                "**Key Enhancements:**",
                "**Note:",
                "\n\n###",
                "\n\n**",
                "\n***"
            ]
            
            for marker in explanation_markers:
                if marker in enhanced_text:
                    enhanced_text = enhanced_text.split(marker)[0].strip()
            
            # Remove common prefixes that might still be there
            prefixes_to_remove = [
                "Enhanced prompt:",
                "Enhanced version:",
                "Here's the enhanced prompt:",
                "Enhanced:",
                "Here is the enhanced version",
            ]
            
            for prefix in prefixes_to_remove:
                if enhanced_text.lower().startswith(prefix.lower()):
                    enhanced_text = enhanced_text[len(prefix):].strip()
                    # Remove any remaining colons or formatting
                    enhanced_text = enhanced_text.lstrip(":").strip()
            
            # Final cleanup - remove any leading/trailing formatting characters
            enhanced_text = enhanced_text.strip("*:- \n\t")
            
            app.logger.info(f"LM Studio enhancement successful: {enhanced_text[:100]}...")
            return {
                "success": True,
                "originalPrompt": prompt,
                "enhancedPrompt": enhanced_text,
                "type": prompt_type,
                "method": "LM Studio"
            }
        else:
            raise Exception("Empty response from LM Studio")
            
    except Exception as e:
        app.logger.warning(f"LM Studio enhancement failed: {e}, trying Perchance")
        # Fallback to Perchance
        return await enhance_perchance_prompt(prompt, prompt_type)


async def enhance_perchance_prompt(prompt, prompt_type="normal"):
    """Enhance a prompt using Perchance's TextGenerator with custom instructions"""
    from perchance import TextGenerator
    
    # Simpler, more direct instructions that work better with text generators
    NORMAL_PROMPT_ENHANCER_INSTRUCTION = """Enhance this image prompt by adding rich visual details, professional photography terms, atmospheric descriptions, and technical quality specifications. Make it extremely detailed and vivid.

{prompt}

Enhanced version:"""

    CURLY_BLOCK_PROMPT_ENHANCER_INSTRUCTION = """Enhance this image prompt by adding rich visual details with random choice variations using curly brackets like {{option1|option2|option3}}. Include technical specs, atmospheric details, and varied descriptive options.

{prompt}

Enhanced version with choices:"""
    
    try:
        # Choose the appropriate instruction based on prompt_type
        if prompt_type == "random":
            instruction = CURLY_BLOCK_PROMPT_ENHANCER_INSTRUCTION.format(prompt=prompt)
        else:
            instruction = NORMAL_PROMPT_ENHANCER_INSTRUCTION.format(prompt=prompt)
        
        app.logger.info(f"Using Perchance TextGenerator to enhance prompt: {prompt}")
        app.logger.info(f"Enhancement type: {prompt_type}")
        
        async with TextGenerator() as gen:
            enhanced_text = ""
            
            # Stream the text generation and collect the result
            async for text_chunk in gen.stream(
                prompt=instruction,
                timeout=45.0  # Longer timeout for detailed responses
            ):
                enhanced_text += text_chunk
                
                # More generous limit for detailed enhancements, but prevent runaway generation
                if len(enhanced_text) > 2000:  # Much higher limit for detailed prompts
                    break
                
                # Stop if we detect a natural ending (double newline, period followed by newline, etc.)
                if enhanced_text.endswith('\n\n') or enhanced_text.endswith('.\n'):
                    break
            
            # Clean up the response
            enhanced_text = enhanced_text.strip()
            
            if enhanced_text:
                app.logger.info(f"Prompt enhanced successfully: {enhanced_text[:100]}...")
                return {
                    "success": True,
                    "originalPrompt": prompt,
                    "enhancedPrompt": enhanced_text,
                    "type": prompt_type
                }
            else:
                raise Exception("Empty response from TextGenerator")
                
    except Exception as e:
        app.logger.error(f"Perchance TextGenerator enhancement failed: {e}")
        # Fallback to mock enhancement
        return await enhance_prompt_fallback(prompt, prompt_type)


async def enhance_prompt_fallback(prompt, prompt_type="normal"):
    """Simple fallback enhancement when Perchance TextGenerator fails"""
    app.logger.warning("Using fallback prompt enhancement")
    
    # Basic enhancement based on prompt type
    if prompt_type == "random":
        # Add some curly block variations
        enhanced = f"{prompt}, {{highly detailed|masterfully crafted|professionally rendered}}, {{photorealistic|cinematic|artistic}} quality, {{soft|dramatic|ambient}} lighting, {{vibrant|muted|rich}} colors, masterpiece"
    else:
        # Simple quality enhancement
        enhanced = f"{prompt}, highly detailed, masterpiece, best quality, intricate details, professional artwork, cinematic lighting"
    
    return {
        "success": True,
        "originalPrompt": prompt,
        "enhancedPrompt": enhanced,
        "type": prompt_type,
        "isMock": True
    }


async def generate_perchance_image_original(prompt, negative_prompt="", shape="portrait"):
    """Generate image using Perchance ImageGenerator - Original working version"""
    from perchance import ImageGenerator
    app.logger.info("Using original Perchance function to test PyPI version")

    async with ImageGenerator() as gen:
        app.logger.info("Starting Perchance image generation...")
        
        result = await gen.image(
            prompt,
            negative_prompt=negative_prompt,
            shape=shape,
            guidance_scale=7.0,
        )

        app.logger.info(f"Image generated successfully. ID: {result.image_id}, Extension: {result.file_extension}")
        
        # Download the image
        binary = await result.download()
        image_bytes = binary.getvalue() if hasattr(binary, 'getvalue') else binary.read()
        app.logger.info(f"Download successful, got {len(image_bytes)} bytes")

        mime_type = f"image/{result.file_extension}"
        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        return {
            "success": True,
            "imageDataUrl": f"data:{mime_type};base64,{base64_image}",
            "imageId": result.image_id,
            "fileExtension": result.file_extension,
            "seed": result.seed,
            "width": result.width,
            "height": result.height,
            "maybeNsfw": result.maybe_nsfw,
            "prompt": prompt
        }


async def generate_perchance_image(prompt, negative_prompt="", shape="portrait"):
    """Generate image using Perchance ImageGenerator - DEPRECATED due to API changes"""
    app.logger.warning("Perchance image generation is currently disabled due to API changes")
    app.logger.info(f"Perchance now requires token verification that the library doesn't support")
    app.logger.info(f"The /verifyUser endpoint returns: {{'status':'failed_verification','reason':'token_required'}}")
    
    # Return a structured error response instead of crashing
    return {
        "success": False,
        "error": "Perchance service unavailable",
        "details": "Perchance has changed their API requirements and now requires token authentication that the current library doesn't support. This is a known issue: https://github.com/eeemoon/perchance/issues/7",
        "placeholder": True,
        "prompt": prompt
    }


async def generate_placeholder_image(prompt, negative_prompt="", shape="portrait"):
    """Generate a placeholder response for testing purposes"""
    app.logger.info(f"Generating placeholder for prompt: {prompt[:100]}...")
    
    # Simulate processing time
    await asyncio.sleep(1)
    
    # Create a simple base64 placeholder image (1x1 pixel)
    import base64
    
    # 1x1 transparent PNG
    placeholder_png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    placeholder_base64 = base64.b64encode(placeholder_png).decode('utf-8')
    
    return {
        "success": True,
        "imageDataUrl": f"data:image/png;base64,{placeholder_base64}",
        "imageId": "placeholder",
        "fileExtension": "png",
        "seed": 12345,
        "width": 1,
        "height": 1,
        "maybeNsfw": False,
        "prompt": prompt,
        "isPlaceholder": True
    }


async def generate_website_image(prompt, negative_prompt="", shape="portrait", art_style="anime"):
    """Generate image using website automation"""
    app.logger.info(f"Generating image via website automation: prompt='{prompt}', style={art_style}, shape={shape}")
    
    try:
        # Use the website automation to generate a single image
        images = await generate_images_via_website(prompt, art_style, shape, batch_size=1)
        
        if images and len(images) > 0:
            return images[0]  # Return the first (and only) image
        else:
            raise Exception("Website automation returned no images")
            
    except Exception as e:
        app.logger.error(f"Website automation failed: {e}")
        
        # Provide more specific error messages
        error_msg = str(e)
        if "Could not find generate button" in error_msg:
            error_msg = "Website automation is having trouble finding the generate button. The Perchance website may have changed its layout."
        elif "Could not find prompt input field" in error_msg:
            error_msg = "Website automation could not locate the prompt input field. The page may still be loading or the layout has changed."
        elif "timeout" in error_msg.lower():
            error_msg = "Website automation timed out. The Perchance service may be slow or unavailable."
        
        return {
            "success": False,
            "error": f"Website automation failed: {error_msg}",
            "details": str(e)
        }


async def generate_image_with_fallback(prompt, negative_prompt="", shape="portrait", art_style="anime"):
    """Generate image with fallback providers"""
    app.logger.info("Starting image generation with fallback system...")
    
    # Try website automation first, then fall back to placeholder
    providers = [
        ("website", lambda p, n, s: generate_website_image(p, n, s, art_style)),
        ("placeholder", generate_placeholder_image),
        # ("perchance", generate_perchance_image),  # Disabled due to API changes
        # Future: ("openai", generate_openai_image),
        # Future: ("stability", generate_stability_image),
    ]
    
    for provider_name, provider_func in providers:
        try:
            app.logger.info(f"Trying provider: {provider_name}")
            result = await provider_func(prompt, negative_prompt, shape)
            
            if result.get("success"):
                app.logger.info(f"Successfully generated image using {provider_name}")
                return result
            else:
                app.logger.warning(f"Provider {provider_name} failed: {result.get('error', 'Unknown error')}")
                
        except Exception as provider_error:
            app.logger.error(f"Provider {provider_name} crashed: {provider_error}")
    
    # If all providers fail, return an error
    app.logger.error("All image generation providers failed")
    return {
        "success": False,
        "error": "All image generation services unavailable",
        "details": "Perchance service is currently down due to API changes. Alternative providers not yet configured.",
        "placeholder": True,
        "prompt": prompt
    }


@app.route('/api/chat/extend', methods=['POST', 'OPTIONS'])
def extend_message():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json(silent=True) or {}

    # Extract the messages (context + message to extend)
    messages = data.get("messages") or []
    responding_character = data.get("respondingCharacter") or {}
    user_persona = data.get("userPersona") or {}
    chat = data.get("chat") or {}
    
    if not messages:
        return jsonify({"error": "No message to extend"}), 400
    
    # The last message is the one to extend, previous messages are context
    original_message = messages[-1]
    context_messages = messages[:-1] if len(messages) > 1 else []
    
    original_content = original_message.get("content", "").replace("CONTINUE THIS MESSAGE: \"", "").replace("\"", "")
    original_role = original_message.get("role")
    
    # Determine which persona we're extending based on the message role
    if original_role == "user":
        # Extending a user message - use user persona data
        extending_persona = user_persona
        character_name = user_persona.get("label") or "User"
    else:
        # Extending a character message - use character data
        extending_persona = responding_character
        character_name = responding_character.get("label") or "Assistant"
    


    # Remove character name prefix if present
    clean_content = original_content
    if ":" in clean_content:
        clean_content = clean_content.split(":", 1)[1].strip()

    # Get descriptions for ALL entities in the conversation
    extending_persona_desc = build_character_description(extending_persona)
    # Note: user_persona was already extracted earlier, but get characters fresh
    characters = data.get("characters") or []
    
    # Build comprehensive context like the chat function
    if original_role == "user":
        system_parts = [
            f"You are {character_name}. You are extending your own message. Continue speaking as yourself. Only provide the NEW additional text that comes next. Do NOT repeat or rewrite what was already said. Do not respond as other characters."
        ]
    else:
        system_parts = [
            f"You are {character_name}. Continue speaking naturally. Only provide the NEW additional text that comes next. Do NOT repeat or rewrite what was already said."
        ]
    
    # Add extending character/user details
    if extending_persona_desc:
        if original_role == "user":
            system_parts.append(f"Your persona details: {extending_persona_desc}")
        else:
            system_parts.append(f"Your character details: {extending_persona_desc}")
    
    # Add ALL other entities for context
    # Always include user persona if available (unless we're extending a user message)
    if original_role != "user" and user_persona and user_persona.get("selectedOptionIdsByGroup"):
        user_desc = build_character_description(user_persona)
        if user_desc:
            user_name = user_persona.get("label") or "User"
            system_parts.append(f"You are talking with {user_name}: {user_desc}")
    
    # Include the responding character if we're extending a user message
    if original_role == "user" and responding_character and responding_character.get("selectedOptionIdsByGroup"):
        char_desc = build_character_description(responding_character)
        if char_desc:
            char_name = responding_character.get("label") or "Character"
            system_parts.append(f"You are talking with {char_name}: {char_desc}")
    
    # Add any other characters present in the conversation
    if characters:
        for char in characters:
            char_name = char.get("label") or "Character"
            # Don't repeat the extending character OR the user (if extending user message) OR responding character (if extending character message)
            if (char_name != character_name and 
                (original_role != "user" or char_name != (responding_character.get("label") or "Character")) and
                (original_role == "user" or char_name != (user_persona.get("label") or "User"))):
                other_char_desc = build_character_description(char)
                if other_char_desc:
                    system_parts.append(f"Also present is {char_name}: {other_char_desc}")
    
    system_content = "\n\n".join(system_parts)

    api_messages = [
        {
            "role": "system",
            "content": system_content,
        }
    ]

    # Add conversation context if available
    user_name = user_persona.get("label") or "User"
    for context_msg in context_messages:
        role = context_msg.get("role")
        content = (context_msg.get("content") or "").strip()
        speaker_label = context_msg.get("speakerLabel")

        if not content:
            continue

        # Special handling for user message extensions - flip roles to maintain proper context
        if original_role == "user":
            # When extending user messages, show user messages as assistant and character messages as user
            if role == "user":
                api_messages.append({
                    "role": "assistant",
                    "content": content  # User's message becomes assistant response
                })
            else:
                api_messages.append({
                    "role": "user", 
                    "content": f"{speaker_label or 'Character'}: {content}"  # Character's message becomes user input
                })
        else:
            # Normal flow for character message extensions
            if role == "user":
                api_messages.append({
                    "role": "user",
                    "content": f"{speaker_label or user_name}: {content}",
                })
            else:
                api_messages.append({
                    "role": "assistant", 
                    "content": content
                })

    # Add the continuation prompt as a user message
    if original_role == "user":
        continuation_prompt = f'{character_name} (you) said: "{clean_content}"\n\nContinue {character_name}\'s message with NEW words only. Speak as {character_name}:'
    else:
        continuation_prompt = f'Your previous words were: "{clean_content}"\n\nContinue with NEW words only (don\'t repeat the previous words):'
    
    api_messages.append({
        "role": "user", 
        "content": continuation_prompt
    })
    try:
        response = requests.post(
            LM_STUDIO_URL,
            json={
                "model": LM_STUDIO_MODEL,
                "messages": api_messages,
                "temperature": 0.5,
                "max_tokens": 500,
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

