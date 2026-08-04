#!/usr/bin/env python3
"""
Test Perchance with a clean, non-sexual prompt to isolate content filtering issues
"""

import requests
import json

def test_clean_image_generation():
    print("Testing image generation with clean prompt...")
    
    url = "http://127.0.0.1:5000/api/image/generate"
    
    # Clean, family-friendly prompt
    payload = {
        "prompt": "beautiful landscape, mountains, blue sky, anime style",
        "artStyle": "anime",
        "shape": "portrait",
        "batchSize": 1
    }
    
    print(f"Sending clean prompt: {payload['prompt']}")
    
    try:
        response = requests.post(url, json=payload, timeout=180)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                images = result.get("images", [])
                print(f"SUCCESS: Generated {len(images)} images with clean prompt")
                for i, img in enumerate(images):
                    data_length = len(img.get('imageDataUrl', ''))
                    print(f"  Image {i+1}: {data_length} chars of image data")
                    
                    # Check if it's actually a real image or placeholder
                    image_url = img.get('imageDataUrl', '')
                    if image_url.startswith('data:image/'):
                        print(f"  Image {i+1}: Real image data detected")
                    else:
                        print(f"  Image {i+1}: May be placeholder or invalid data")
                        
                return True
            else:
                print("FAILED: Generation reported failure")
                print(f"Error: {result.get('error', 'Unknown')}")
                return False
        else:
            print("FAILED: HTTP error")
            result = response.json()
            print(f"Error: {result.get('error', 'Unknown')}")
            return False
            
    except Exception as e:
        print(f"FAILED: Exception occurred: {e}")
        return False

if __name__ == "__main__":
    success = test_clean_image_generation()
    print()
    if success:
        print("CONCLUSION: Perchance works with clean prompts.")
        print("The issue is likely content filtering of adult/sexual terms.")
        print()
        print("RECOMMENDATIONS:")
        print("1. Use more generic/clean prompts for image generation")
        print("2. Remove explicit sexual terms from character descriptions")
        print("3. Consider alternative image generation services for adult content")
        print("4. Implement content filtering in your app before sending to Perchance")
    else:
        print("CONCLUSION: Perchance integration has deeper technical issues.")
        print("The problem is not just content filtering.")