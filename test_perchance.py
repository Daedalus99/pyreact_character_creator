#!/usr/bin/env python3
"""Test script to debug Perchance image generation and download"""

import asyncio
import sys
import os

# Add the backend directory to path so we can import the function
sys.path.append('backend')

from app import generate_perchance_image

async def test_perchance():
    print("Testing Perchance image generation with updated library...")
    
    prompt = "simple test image, blue cat, cartoon style"
    
    try:
        result = await generate_perchance_image(prompt, "", "square")
        
        if result["success"]:
            print("✅ Success! Image generated and downloaded.")
            print(f"Image ID: {result['imageId']}")
            print(f"Dimensions: {result['width']}x{result['height']}")
            print(f"Data URL length: {len(result['imageDataUrl'])} chars")
        else:
            print("❌ Generation succeeded but download failed.")
            print(f"Error: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_perchance())