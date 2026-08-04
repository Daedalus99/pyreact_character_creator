#!/usr/bin/env python3
"""Test the backend API directly without frontend"""

import requests
import json

def test_image_generation_api():
    print("Testing backend image generation API directly...")
    
    url = "http://127.0.0.1:5000/api/image/generate"
    payload = {
        "prompt": "simple test, blue cat, cartoon style",
        "artStyle": "anime",
        "shape": "portrait",
        "batchSize": 1
    }
    
    print(f"Sending request to: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=120)
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        try:
            result = response.json()
            print("Response JSON:")
            print(json.dumps(result, indent=2))
            
            if response.status_code == 200:
                if result.get("success"):
                    print("✓ Image generation successful!")
                    images = result.get("images", [])
                    print(f"Generated {len(images)} images")
                    for i, img in enumerate(images):
                        print(f"  Image {i+1}: {img.get('imageId', 'No ID')}, size: {len(img.get('imageDataUrl', ''))} chars")
                else:
                    print("✗ Generation reported failure")
            else:
                print("✗ HTTP error occurred")
                print(f"Error: {result.get('error', 'Unknown error')}")
                print(f"Details: {result.get('details', 'No details')}")
                
        except json.JSONDecodeError:
            print(f"Response is not JSON: {response.text[:500]}...")
            
    except requests.exceptions.ConnectionError:
        print("✗ Backend server is not running! Start it with: python backend/app.py")
    except requests.exceptions.Timeout:
        print("✗ Request timed out (took more than 120 seconds)")
    except Exception as e:
        print(f"✗ Request failed: {e}")

if __name__ == "__main__":
    test_image_generation_api()