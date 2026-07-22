#!/usr/bin/env python3
"""
Test accessing the actual Perchance web interface to see if there are rate limit messages
"""

import asyncio
from playwright.async_api import async_playwright

async def test_perchance_website():
    print("=== Testing Perchance Website Directly ===")
    
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        try:
            # Go to the main Perchance image generator
            print("Navigating to Perchance AI Image Generator...")
            await page.goto("https://perchance.org/ai-text-to-image-generator", timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Check if there are any rate limit or authentication messages on the page
            content = await page.content()
            
            # Look for rate limit indicators
            rate_limit_keywords = [
                "rate limit", "daily limit", "quota exceeded", "too many requests",
                "limit reached", "try again tomorrow", "usage limit",
                "authentication required", "login required", "sign up"
            ]
            
            found_indicators = []
            for keyword in rate_limit_keywords:
                if keyword.lower() in content.lower():
                    found_indicators.append(keyword)
            
            if found_indicators:
                print(f"Found potential limit indicators: {found_indicators}")
                
                # Try to find the specific text around these keywords
                for keyword in found_indicators[:3]:  # Check first 3
                    start = content.lower().find(keyword.lower())
                    if start != -1:
                        context_text = content[max(0, start-100):start+200]
                        print(f"Context around '{keyword}':")
                        print(context_text)
                        print("-" * 50)
            else:
                print("No obvious rate limit indicators found")
            
            # Try to interact with the image generator
            print("\nTesting image generation interface...")
            
            # Look for the prompt input
            try:
                prompt_input = page.locator('textarea, input[type="text"]').first
                if await prompt_input.is_visible():
                    print("Found prompt input, trying to generate an image...")
                    await prompt_input.fill("simple test cat")
                    
                    # Look for generate button
                    generate_button = page.locator('button:has-text("Generate"), button:has-text("Create"), [data-testid="generate"]').first
                    if await generate_button.is_visible():
                        await generate_button.click()
                        print("Clicked generate button, waiting for response...")
                        
                        # Wait for any error messages or results
                        await page.wait_for_timeout(5000)
                        
                        # Check for error messages
                        error_indicators = await page.locator('.error, .message, .alert').all()
                        for error in error_indicators:
                            if await error.is_visible():
                                error_text = await error.inner_text()
                                print(f"Error message found: {error_text}")
                    else:
                        print("Generate button not found")
                else:
                    print("Prompt input not found")
            except Exception as interaction_error:
                print(f"Error interacting with page: {interaction_error}")
            
            # Wait to see what happens
            print("Waiting 10 seconds to observe page behavior...")
            await page.wait_for_timeout(10000)
            
            # Take a screenshot for reference
            await page.screenshot(path="perchance_test.png")
            print("Screenshot saved as perchance_test.png")
            
        except Exception as e:
            print(f"Error testing website: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_perchance_website())