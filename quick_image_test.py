#!/usr/bin/env python3
"""
Quick test of image generation while backend is running
"""

import requests
import json

def test_image_generation():
    print("Testing image generation (backend should be running)...")
    
    url = "http://127.0.0.1:5000/api/image/generate"
    
    # Test with your original prompt
    payload = {
        "prompt": "87 year old futanari, middleEastern, amber eyes, pink hair, tall build, flat breasts, micropenis cock, flat butt, sitting, happy expression, wearing formal, forest background, high quality, detailed, masterpiece",
        "artStyle": "anime",
        "shape": "portrait",
        "batchSize": 1
    }
    
    print(f"Sending request to: {url}")
    print(f"Prompt: {payload['prompt'][:50]}...")
    
    try:
        response = requests.post(url, json=payload, timeout=200)  # 3+ minute timeout
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Response received!")
            
            if result.get("success"):
                images = result.get("images", [])
                print(f"SUCCESS: Generated {len(images)} images")
                
                for i, img in enumerate(images):
                    image_data = img.get('imageDataUrl', '')
                    is_placeholder = img.get('isPlaceholder', False)
                    
                    print(f"  Image {i+1}:")
                    print(f"    Data length: {len(image_data)} chars")
                    print(f"    Is placeholder: {is_placeholder}")
                    print(f"    Image ID: {img.get('imageId', 'N/A')}")
                    print(f"    Dimensions: {img.get('width', '?')}x{img.get('height', '?')}")
                    
                    if is_placeholder:
                        print(f"    NOTE: This is a placeholder - Perchance generation failed")
                    elif image_data.startswith('data:image/'):
                        print(f"    SUCCESS: Real image data detected")
                    else:
                        print(f"    WARNING: Unexpected image data format")
                        
                return True
            else:
                print("FAILED: Generation reported failure")
                print(f"Error: {result.get('error', 'Unknown')}")
                return False
        else:
            print(f"FAILED: HTTP {response.status_code}")
            try:
                error_info = response.json()
                print(f"Error: {error_info.get('error', 'Unknown')}")
            except:
                print(f"Raw response: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print("FAILED: Request timed out")
        return False
    except requests.exceptions.ConnectionError:
        print("FAILED: Could not connect to backend")
        print("Make sure the backend is running with: .\\start_backend.bat")
        return False
    except Exception as e:
        print(f"FAILED: {e}")
        return False

if __name__ == "__main__":
    success = test_image_generation()
    print()
    if not success:
        print("Image generation is not working properly.")
        print("Check the backend console for error messages.")
    else:
        print("Image generation test completed - check the results above.")