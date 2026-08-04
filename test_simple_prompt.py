#!/usr/bin/env python3
"""
Test with a very simple prompt to see if Perchance works with basic requests
"""

import requests
import json

def test_simple_prompt():
    print("Testing with a simple prompt...")
    
    url = "http://127.0.0.1:5000/api/image/generate"
    
    # Very simple prompt
    payload = {
        "prompt": "cat",
        "artStyle": "anime",
        "shape": "portrait",
        "batchSize": 1
    }
    
    print(f"Sending simple prompt: '{payload['prompt']}'")
    
    try:
        response = requests.post(url, json=payload, timeout=400)  # Longer timeout
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get("success"):
                images = result.get("images", [])
                print(f"SUCCESS: Generated {len(images)} images")
                
                for i, img in enumerate(images):
                    image_data = img.get('imageDataUrl', '')
                    is_placeholder = img.get('isPlaceholder', False)
                    
                    print(f"  Image {i+1}:")
                    print(f"    Is placeholder: {is_placeholder}")
                    print(f"    Data length: {len(image_data)} chars")
                    
                    if not is_placeholder and image_data.startswith('data:image/'):
                        print(f"    ✅ SUCCESS: Real image generated!")
                        return True
                    elif is_placeholder:
                        print(f"    ❌ FAILED: Placeholder returned")
                        
                return False
            else:
                print("FAILED: Generation reported failure")
                return False
        else:
            print(f"FAILED: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"FAILED: {e}")
        return False

if __name__ == "__main__":
    success = test_simple_prompt()
    print()
    if success:
        print("Simple prompt works! The issue might be prompt complexity.")
    else:
        print("Even simple prompts fail. The issue is with Perchance integration.")