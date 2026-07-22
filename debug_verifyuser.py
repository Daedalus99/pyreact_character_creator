#!/usr/bin/env python3
"""
Debug what Perchance verifyUser endpoint actually returns
"""

import asyncio
import random
from playwright.async_api import async_playwright

async def debug_verify_user():
    print("=== Debugging Perchance verifyUser endpoint ===")
    
    async with async_playwright() as pw:
        # Try both headless and headed modes
        for headless in [True, False]:
            print(f"\n--- Testing with headless={headless} ---")
            
            browser = await pw.chromium.launch(headless=headless)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 720},
                locale="en-US",
                timezone_id="America/New_York"
            )
            page = await context.new_page()
            
            try:
                # Build the verifyUser URL like the library does
                base_url = "https://image-generation.perchance.org/api"
                cache_bust = random.random()
                verify_url = f"{base_url}/verifyUser?thread=0&__cacheBust={cache_bust}"
                
                print(f"Requesting: {verify_url}")
                
                # Navigate to the URL
                response = await page.goto(verify_url, wait_until="networkidle", timeout=30000)
                
                print(f"Response status: {response.status}")
                print(f"Response headers: {response.headers}")
                
                # Get page content
                content = await page.content()
                print(f"Content length: {len(content)}")
                print(f"First 2000 chars of content:")
                print("-" * 50)
                print(content[:2000])
                print("-" * 50)
                
                # Check for specific patterns
                has_user_key = '"userKey":"' in content
                has_too_many = "too_many_requests" in content
                has_cloudflare = "cloudflare" in content.lower()
                has_challenge = "challenge" in content.lower()
                
                print(f"Contains 'userKey:': {has_user_key}")
                print(f"Contains 'too_many_requests': {has_too_many}")
                print(f"Contains 'cloudflare': {has_cloudflare}")
                print(f"Contains 'challenge': {has_challenge}")
                
                # Try direct fetch like ChatGPT suggested
                print("\n--- Testing direct fetch ---")
                try:
                    raw_response = await page.evaluate("""
                        async (url) => {
                            const response = await fetch(url, {
                                method: "GET",
                                credentials: "include",
                                cache: "no-store",
                            });
                            
                            return JSON.stringify({
                                status: response.status,
                                url: response.url,
                                contentType: response.headers.get("content-type"),
                                text: await response.text(),
                            });
                        }
                    """, verify_url)
                    
                    import json
                    fetch_data = json.loads(raw_response)
                    print(f"Fetch status: {fetch_data['status']}")
                    print(f"Fetch content-type: {fetch_data['contentType']}")
                    print(f"Fetch response length: {len(fetch_data['text'])}")
                    print(f"Fetch first 1000 chars:")
                    print(fetch_data['text'][:1000])
                    
                    # Check for userKey in fetch response
                    fetch_has_key = '"userKey":"' in fetch_data['text']
                    print(f"Fetch contains 'userKey:': {fetch_has_key}")
                    
                    if fetch_has_key:
                        import re
                        match = re.search(r'"userKey"\s*:\s*"([^"]+)"', fetch_data['text'])
                        if match:
                            print(f"Found userKey: {match.group(1)[:20]}...")
                    
                except Exception as fetch_error:
                    print(f"Fetch failed: {fetch_error}")
                
                # Wait a bit if we're in headed mode to see what happens
                if not headless:
                    print("Waiting 5 seconds in headed mode...")
                    await asyncio.sleep(5)
                
            except Exception as e:
                print(f"Error testing headless={headless}: {e}")
                import traceback
                traceback.print_exc()
            
            finally:
                await browser.close()
                
            # Only test headed mode once
            if not headless:
                break

if __name__ == "__main__":
    asyncio.run(debug_verify_user())