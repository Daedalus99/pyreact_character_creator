#!/usr/bin/env python3
"""
Test the Perchance text generator API to see if it's also rate limited
"""

import requests
from datetime import datetime

def test_text_api():
    print("=== Testing Perchance Text Generator API ===")
    print(f"Time: {datetime.now()}")
    
    # Test the text generator API from the tutorial
    try:
        url = "https://perchance.org/api/generateList.php?generator=fantasy-character&count=1"
        print(f"Testing URL: {url}")
        
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Length: {len(response.text)}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    print("SUCCESS: Text generator API is working!")
                    print(f"Generated text: {data[0]}")
                else:
                    print("SUCCESS: Got response but no data")
            except:
                print("Got response but couldn't parse JSON")
        else:
            print(f"FAILED: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"ERROR: {e}")

def test_image_api_comparison():
    print("\n=== Comparing with Image API ===")
    
    try:
        # Test the image API verifyUser endpoint
        url = "https://image-generation.perchance.org/api/verifyUser?thread=0"
        print(f"Testing image API: {url}")
        
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if "token_required" in response.text:
            print("CONCLUSION: Image API is rate limited/requires auth")
        elif "userKey" in response.text:
            print("CONCLUSION: Image API is working!")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_text_api()
    test_image_api_comparison()