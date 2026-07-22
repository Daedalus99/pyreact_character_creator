#!/usr/bin/env python3
"""
Test manual browser setup for Perchance
"""

import asyncio
from perchance import ImageGenerator

async def test_manual_setup():
    print("=== Testing manual browser setup ===")
    
    try:
        gen = ImageGenerator()
        
        # Check if there's a manual start method
        if hasattr(gen, '_start'):
            print("Found _start method, trying to call it...")
            await gen._start()
            print("_start called successfully")
            
        # Check browser status after start
        print(f"Browser after start: {gen._browser}")
        print(f"Context after start: {gen._context}")
        
        # Now try image generation
        try:
            result = await gen.image("test cat")
            print("SUCCESS: Image generation worked after manual start!")
        except Exception as e:
            print(f"Still failed after manual start: {e}")
            
        # Clean up
        await gen.close()
        
    except Exception as e:
        print(f"Manual setup failed: {e}")

async def test_context_manager():
    print("\n=== Testing context manager internals ===")
    
    try:
        async with ImageGenerator() as gen:
            print(f"Browser in context: {gen._browser}")
            print(f"Context in context: {gen._context}")
            print(f"Playwright in context: {gen._pw}")
            
            # If browser is still None, something's wrong with startup
            if gen._browser is None:
                print("ERROR: Browser is still None in context manager!")
                print("The _start method might not be called automatically")
                
    except Exception as e:
        print(f"Context manager test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_manual_setup())
    asyncio.run(test_context_manager())