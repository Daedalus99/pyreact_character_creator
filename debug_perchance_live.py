#!/usr/bin/env python3
"""
Debug script to see what's actually happening on the Perchance page with a real prompt
"""

import asyncio
import sys
import os
from urllib.parse import urlencode

# Add the backend directory to path
sys.path.append('backend')

async def debug_perchance_real_prompt():
    try:
        from playwright.async_api import async_playwright
        
        # Use the same prompt that's failing
        prompt = "87 year old futanari, middleEastern, amber eyes, pink hair, tall build, flat breasts, micropenis cock, flat butt, sitting, happy expression, wearing formal, forest background, high quality, detailed, masterpiece, anime style, high quality anime art"
        resolution = "512x768"
        full_prompt = f"{prompt}(resolution:::{resolution})"
        
        # Construct the URL using proper URL encoding
        url = "https://perchance.org/imageapi?" + urlencode({"prompt": full_prompt})
        print(f"Testing URL (truncated): {url[:100]}...")
        
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(
                headless=False,  # Show browser for debugging
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled'
                ]
            )
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080},
            )
            page = await context.new_page()
            
            try:
                # Navigate to the page
                print("Navigating to the page...")
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                
                # Get page title
                title = await page.title()
                print(f"Page title: {title}")
                
                # Wait and check for any content changes
                print("Waiting 10 seconds for dynamic content...")
                await page.wait_for_timeout(10000)
                
                # Check page text content for clues
                page_text = await page.evaluate("() => document.body.innerText")
                print(f"Page text content (first 500 chars): {page_text[:500]}")
                
                # Check for specific error messages or status indicators
                error_indicators = await page.evaluate("""
                    () => {
                        const text = document.body.innerText.toLowerCase();
                        const indicators = [];
                        if (text.includes('error')) indicators.push('contains error text');
                        if (text.includes('failed')) indicators.push('contains failed text');
                        if (text.includes('blocked')) indicators.push('contains blocked text');
                        if (text.includes('not allowed')) indicators.push('contains not allowed text');
                        if (text.includes('inappropriate')) indicators.push('contains inappropriate text');
                        if (text.includes('violation')) indicators.push('contains violation text');
                        return indicators;
                    }
                """)
                
                if error_indicators:
                    print(f"POTENTIAL ISSUES DETECTED: {error_indicators}")
                
                # Try to find any elements that might be loading indicators
                loading_elements = await page.evaluate("""
                    () => {
                        const elements = document.querySelectorAll('*');
                        const loadingElements = [];
                        for (let el of elements) {
                            const text = el.innerText || el.textContent || '';
                            if (text.toLowerCase().includes('loading') || 
                                text.toLowerCase().includes('generating') || 
                                text.toLowerCase().includes('processing')) {
                                loadingElements.push(text.trim());
                            }
                        }
                        return loadingElements;
                    }
                """)
                
                if loading_elements:
                    print(f"Loading elements found: {loading_elements}")
                    print("Waiting additional 30 seconds for generation...")
                    await page.wait_for_timeout(30000)
                
                # Final check for images
                final_images = await page.evaluate("""
                    () => {
                        const imgs = [...document.images];
                        return imgs.map(img => ({
                            src: img.src.substring(0, 100),
                            complete: img.complete,
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight,
                            alt: img.alt || '',
                            className: img.className || '',
                            id: img.id || ''
                        }));
                    }
                """)
                
                print(f"Final image check - found {len(final_images)} images:")
                for i, img in enumerate(final_images):
                    print(f"  Image {i+1}: {img}")
                
                # Save current page content for manual inspection
                content = await page.content()
                with open("debug_perchance_current.html", "w", encoding="utf-8") as f:
                    f.write(content)
                print("Saved current page to debug_perchance_current.html")
                
                # Keep browser open for manual inspection
                print("Browser staying open for 60 seconds for manual inspection...")
                print("Check the browser window and see what's displayed")
                await page.wait_for_timeout(60000)
                
            except Exception as e:
                print(f"Error during debugging: {e}")
                
            finally:
                await browser.close()
                
    except ImportError as e:
        print(f"Playwright not available: {e}")

if __name__ == "__main__":
    asyncio.run(debug_perchance_real_prompt())