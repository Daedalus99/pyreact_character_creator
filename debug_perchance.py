#!/usr/bin/env python3
"""
Debug script to test Perchance ImageGenerator and understand authentication issues
"""

import asyncio
import inspect
from perchance import ImageGenerator

async def debug_perchance():
    print("=== Perchance Debug Information ===")
    
    # Check ImageGenerator constructor
    sig = inspect.signature(ImageGenerator.__init__)
    print(f"ImageGenerator constructor signature: {sig}")
    
    # Check for auth-related methods
    auth_methods = [attr for attr in dir(ImageGenerator) if 'auth' in attr.lower() or 'login' in attr.lower() or 'key' in attr.lower() or 'session' in attr.lower()]
    print(f"Auth-related attributes/methods: {auth_methods}")
    
    # Check all methods
    all_methods = [attr for attr in dir(ImageGenerator) if not attr.startswith('_')]
    print(f"All public methods: {all_methods}")
    
    print("\n=== Testing ImageGenerator Initialization ===")
    try:
        async with ImageGenerator() as gen:
            print("[OK] ImageGenerator created successfully")
            
            # Check generator attributes
            gen_attrs = [attr for attr in dir(gen) if not attr.startswith('_')]
            print(f"Generator instance attributes: {gen_attrs}")
            
            # Try to get user info or session info
            if hasattr(gen, 'user'):
                print(f"User attribute: {getattr(gen, 'user', 'None')}")
            if hasattr(gen, 'session'):
                print(f"Session attribute: {getattr(gen, 'session', 'None')}")
            if hasattr(gen, '_session'):
                print(f"Private session attribute: {getattr(gen, '_session', 'None')}")
                
            print("\n=== Testing Image Generation ===")
            try:
                result = await gen.image(
                    "simple test image of a cat",
                    shape="square",
                    guidance_scale=7.0,
                )
                print("[OK] Image generation successful!")
                print(f"Result type: {type(result)}")
                print(f"Result attributes: {[attr for attr in dir(result) if not attr.startswith('_')]}")
                
            except Exception as gen_error:
                print(f"[FAIL] Image generation failed: {gen_error}")
                print(f"Error type: {type(gen_error)}")
                print(f"Error args: {getattr(gen_error, 'args', 'No args')}")
                
                # Check if it's the user key error
                if "Failed to retrieve user key" in str(gen_error):
                    print("\n[DEBUG] AUTHENTICATION ISSUE DETECTED")
                    print("This suggests that Perchance now requires user authentication")
                    print("Possible solutions:")
                    print("1. The service might need a login session")
                    print("2. An API key might be required")
                    print("3. The GitHub version might have different requirements")
                
    except Exception as init_error:
        print(f"[FAIL] ImageGenerator initialization failed: {init_error}")
        print(f"Error type: {type(init_error)}")

if __name__ == "__main__":
    print("Starting Perchance debug test...")
    asyncio.run(debug_perchance())
    print("Debug test complete.")