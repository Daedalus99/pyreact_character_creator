#!/usr/bin/env python3
"""
Try to extract working session tokens from the website approach
"""

import asyncio
from playwright.async_api import async_playwright

async def extract_session():
    print("=== Extracting Working Session from Website ===")
    
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            # Go to the main Perchance page
            print("Navigating to Perchance...")
            await page.goto("https://perchance.org/ai-text-to-image-generator", wait_until="networkidle")
            
            # Wait for the page to load and capture all cookies
            await page.wait_for_timeout(3000)
            
            # Get all cookies
            cookies = await context.cookies()
            print(f"Found {len(cookies)} cookies:")
            for cookie in cookies:
                print(f"  {cookie['name']}: {cookie['value'][:50]}...")
            
            # Monitor network traffic for any verification calls
            verify_calls = []
            
            def handle_response(response):
                if 'verifyUser' in response.url or 'verify' in response.url.lower():
                    verify_calls.append({
                        'url': response.url,
                        'status': response.status,
                        'headers': dict(response.headers)
                    })
                    print(f"Verify call: {response.status} {response.url}")
            
            page.on('response', handle_response)
            
            # Wait a bit more and refresh to see if any verify calls are made
            print("Waiting for automatic verification calls...")
            await page.wait_for_timeout(5000)
            
            # Try to manually call the verifyUser endpoint with browser context
            print("Testing verifyUser with browser context...")
            verify_result = await page.evaluate("""
                async () => {
                    try {
                        const response = await fetch('/api/verifyUser?thread=0&__cacheBust=' + Math.random(), {
                            credentials: 'include'
                        });
                        const text = await response.text();
                        return {
                            status: response.status,
                            text: text
                        };
                    } catch (error) {
                        return {
                            error: error.message
                        };
                    }
                }
            """)
            
            print(f"VerifyUser result: {verify_result}")
            
            # Try the full URL
            print("Testing full verifyUser URL...")
            verify_full_result = await page.evaluate("""
                async () => {
                    try {
                        const response = await fetch('https://image-generation.perchance.org/api/verifyUser?thread=0&__cacheBust=' + Math.random(), {
                            credentials: 'include'
                        });
                        const text = await response.text();
                        return {
                            status: response.status,
                            text: text
                        };
                    } catch (error) {
                        return {
                            error: error.message
                        };
                    }
                }
            """)
            
            print(f"Full verifyUser result: {verify_full_result}")
            
            # Check if the browser-based call gets a different response
            if verify_full_result.get('text') and 'userKey' in verify_full_result['text']:
                print("SUCCESS! Browser context gets userKey!")
                print(f"Response: {verify_full_result['text']}")
            elif 'token_required' in str(verify_full_result.get('text', '')):
                print("Browser context also gets token_required - same issue")
            
            print(f"Captured verify calls: {len(verify_calls)}")
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(extract_session())