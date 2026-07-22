#!/usr/bin/env python3
"""
Test if we can generate images through the website interface vs API
"""

import asyncio
from playwright.async_api import async_playwright

async def test_website_generation():
    print("=== Testing Website Image Generation ===")
    
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        try:
            # Navigate to the image generator
            print("Navigating to Perchance AI Image Generator...")
            await page.goto("https://perchance.org/ai-text-to-image-generator", wait_until="networkidle")
            
            # Look for the prompt input
            print("Looking for prompt input...")
            
            # Common selectors for prompt inputs
            prompt_selectors = [
                'textarea[placeholder*="prompt"]',
                'textarea[placeholder*="describe"]', 
                'input[type="text"][placeholder*="prompt"]',
                'textarea',
                '.prompt-input',
                '#prompt',
                '[data-testid="prompt"]'
            ]
            
            prompt_input = None
            for selector in prompt_selectors:
                try:
                    element = page.locator(selector).first
                    if await element.is_visible():
                        prompt_input = element
                        print(f"Found prompt input with selector: {selector}")
                        break
                except:
                    continue
            
            if not prompt_input:
                print("Could not find prompt input, taking screenshot...")
                await page.screenshot(path="perchance_page.png")
                
                # Try to find any input elements
                inputs = await page.locator('input, textarea').all()
                print(f"Found {len(inputs)} input elements")
                for i, inp in enumerate(inputs[:3]):
                    try:
                        placeholder = await inp.get_attribute('placeholder')
                        print(f"Input {i}: placeholder='{placeholder}'")
                    except:
                        pass
                return
            
            # Try to enter a prompt
            print("Entering test prompt...")
            await prompt_input.fill("simple cat")
            
            # Look for generate button
            print("Looking for generate button...")
            generate_selectors = [
                'button:has-text("Generate")',
                'button:has-text("Create")',
                'button[type="submit"]',
                '.generate-button',
                '#generate',
                '[data-testid="generate"]'
            ]
            
            generate_button = None
            for selector in generate_selectors:
                try:
                    element = page.locator(selector).first
                    if await element.is_visible():
                        generate_button = element
                        print(f"Found generate button with selector: {selector}")
                        break
                except:
                    continue
            
            if not generate_button:
                print("Could not find generate button")
                buttons = await page.locator('button').all()
                print(f"Found {len(buttons)} buttons")
                for i, btn in enumerate(buttons[:5]):
                    try:
                        text = await btn.inner_text()
                        print(f"Button {i}: '{text}'")
                    except:
                        pass
                return
            
            # Click generate and monitor network requests
            print("Setting up network monitoring...")
            
            # Track API calls
            api_calls = []
            
            def handle_request(request):
                if 'perchance' in request.url and 'api' in request.url:
                    api_calls.append({
                        'url': request.url,
                        'method': request.method,
                        'headers': dict(request.headers)
                    })
                    print(f"API Call: {request.method} {request.url}")
            
            def handle_response(response):
                if 'perchance' in response.url and 'api' in response.url:
                    print(f"API Response: {response.status} {response.url}")
                    
            page.on('request', handle_request)
            page.on('response', handle_response)
            
            # Click generate
            print("Clicking generate button...")
            await generate_button.click()
            
            # Wait for network activity
            print("Waiting for generation to complete...")
            await page.wait_for_timeout(10000)
            
            # Check what API calls were made
            print(f"\nCaptured {len(api_calls)} API calls:")
            for call in api_calls:
                print(f"- {call['method']} {call['url']}")
                
            # Check for any error messages on the page
            error_selectors = ['.error', '.message', '.alert', '[class*="error"]']
            for selector in error_selectors:
                try:
                    errors = await page.locator(selector).all()
                    for error in errors:
                        if await error.is_visible():
                            error_text = await error.inner_text()
                            if error_text.strip():
                                print(f"Error message found: {error_text}")
                except:
                    pass
            
            # Take a screenshot of the result
            await page.screenshot(path="generation_result.png")
            print("Screenshot saved as generation_result.png")
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Keep browser open briefly to see result
            print("Keeping browser open for 10 seconds to observe...")
            await page.wait_for_timeout(10000)
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_website_generation())