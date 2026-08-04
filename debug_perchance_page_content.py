#!/usr/bin/env python3
"""
Debug script to see what's actually on the Perchance page
"""

import asyncio
import sys
import os
from urllib.parse import urlencode

# Add the backend directory to path so we can import the function
sys.path.append('backend')

async def debug_perchance_page():
    try:
        from playwright.async_api import async_playwright
        
        prompt = "simple test image, blue cat, cartoon style"
        resolution = "512x512"
        full_prompt = f"{prompt}(resolution:::{resolution})"
        
        # Construct the URL using proper URL encoding
        url = "https://perchance.org/imageapi?" + urlencode({"prompt": full_prompt})
        print(f"Testing URL: {url}")
        
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)  # Use headless to avoid encoding issues
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080},
            )
            page = await context.new_page()
            
            try:
                # Navigate to the page
                print("Navigating to the page...")
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                
                # Wait a bit for dynamic content
                await page.wait_for_timeout(5000)
                
                # Get page title and content
                title = await page.title()
                print(f"Page title: {title}")
                
                # Get page content
                content = await page.content()
                print(f"Page content length: {len(content)} characters")
                
                # Save page content to file for inspection
                with open("debug_page_content.html", "w", encoding="utf-8") as f:
                    f.write(content)
                print("Saved page content to debug_page_content.html")
                
                # Check for images
                images = await page.evaluate("""
                    () => {
                        const imgs = [...document.images];
                        return imgs.map(img => ({
                            src: img.src.substring(0, 100),
                            complete: img.complete,
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight,
                            alt: img.alt || ''
                        }));
                    }
                """)
                print(f"Found {len(images)} images:")
                for i, img in enumerate(images):
                    print(f"  {i+1}. {img}")
                
                # Check for any error messages or status indicators
                error_elements = await page.evaluate("""
                    () => {
                        const text = document.body.innerText;
                        if (text.includes('error') || text.includes('Error') || text.includes('ERROR')) {
                            return text.substring(0, 500);
                        }
                        return null;
                    }
                """)
                
                if error_elements:
                    print(f"Potential error content found: {error_elements}")
                
                # Wait a bit more to see if images load
                print("Waiting 30 more seconds to see if images appear...")
                await page.wait_for_timeout(30000)
                
                # Check images again
                images_after = await page.evaluate("""
                    () => {
                        const imgs = [...document.images];
                        return imgs.map(img => ({
                            src: img.src.substring(0, 100),
                            complete: img.complete,
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight,
                            alt: img.alt || ''
                        }));
                    }
                """)
                print(f"After waiting, found {len(images_after)} images:")
                for i, img in enumerate(images_after):
                    print(f"  {i+1}. {img}")
                
                # Done with inspection
                print("Page inspection complete.")
                
            except Exception as e:
                print(f"Error during page interaction: {e}")
                
            finally:
                await browser.close()
                
    except ImportError as e:
        print(f"Playwright not available: {e}")

if __name__ == "__main__":
    asyncio.run(debug_perchance_page())