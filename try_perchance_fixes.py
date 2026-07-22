#!/usr/bin/env python3
"""
Try different approaches to fix Perchance authentication
"""

import asyncio
import os
from perchance import ImageGenerator

async def try_different_approaches():
    
    print("=== Attempt 1: Check for environment variables ===")
    # Check if there are any Perchance-related env vars expected
    perchance_envs = {k: v for k, v in os.environ.items() if 'perchance' in k.lower()}
    print(f"Perchance-related env vars: {perchance_envs}")
    
    print("\n=== Attempt 2: Try with different parameters ===")
    # Check if there's an undocumented parameter
    try:
        async with ImageGenerator() as gen:
            # Try to access private attributes for debugging
            private_attrs = [attr for attr in dir(gen) if attr.startswith('_') and not attr.startswith('__')]
            print(f"Private attributes: {private_attrs}")
            
            for attr in private_attrs[:5]:  # Check first 5 private attrs
                try:
                    value = getattr(gen, attr)
                    print(f"  {attr}: {type(value)} = {str(value)[:100]}")
                except Exception as e:
                    print(f"  {attr}: Error accessing - {e}")
    except Exception as e:
        print(f"Failed to create generator: {e}")
    
    print("\n=== Attempt 3: Check BASE_URL ===")
    print(f"ImageGenerator.BASE_URL: {ImageGenerator.BASE_URL}")
    
    print("\n=== Attempt 4: Try simple generation with minimal params ===")
    try:
        async with ImageGenerator() as gen:
            # Try with absolute minimum parameters
            result = await gen.image("cat")
            print("SUCCESS: Simple generation worked!")
    except Exception as e:
        print(f"Simple generation failed: {e}")
        
    print("\n=== Attempt 5: Check if it's a rate limiting issue ===")
    try:
        import time
        print("Waiting 5 seconds before retry...")
        await asyncio.sleep(5)
        
        async with ImageGenerator() as gen:
            result = await gen.image("dog", shape="square")
            print("SUCCESS: Generation after delay worked!")
    except Exception as e:
        print(f"Generation after delay failed: {e}")

if __name__ == "__main__":
    asyncio.run(try_different_approaches())