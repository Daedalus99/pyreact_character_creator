#!/usr/bin/env python3
"""
Test the manual _start() fix for Perchance
"""

import asyncio
from perchance import ImageGenerator

async def test_fix():
    print("=== Testing Manual Start Fix ===")
    
    gen = ImageGenerator()
    try:
        print("Manually starting ImageGenerator...")
        await gen._start()
        print(f"Browser created: {gen._browser is not None}")
        print(f"Context created: {gen._context is not None}")
        
        print("\nTesting image generation...")
        result = await gen.image("cute cat", shape="square")
        print("SUCCESS! Image generation worked!")
        print(f"Result type: {type(result)}")
        print(f"Image ID: {getattr(result, 'image_id', 'No ID')}")
        
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        print("Cleaning up...")
        try:
            await gen.close()
            print("Cleanup successful")
        except Exception as e:
            print(f"Cleanup failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_fix())