#!/usr/bin/env python3
"""
Test the Perchance image detection directly with improved logic
"""

import asyncio
import sys
import os
from urllib.parse import urlencode

# Add the backend directory to path
sys.path.append('backend')

async def test_perchance_detection():
    try:
        from playwright.async_api import async_playwright
        
        # Use your exact prompt that works manually
        prompt = "87 year old futanari, middleEastern, amber eyes, pink hair, tall build, flat breasts, micropenis cock, flat butt, sitting, happy expression, wearing formal, forest background, high quality, detailed, masterpiece, anime style, high quality anime art"
        resolution = "512x768"
        full_prompt = f"{prompt}(resolution:::{resolution})"
        
        # Construct the URL using proper URL encoding  
        url = "https://perchance.org/imageapi?" + urlencode({"prompt": full_prompt})
        print("Testing image detection with your working URL...")
        
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(
                headless=False,  # Show browser so you can see what happens
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
                print("Loading page...")
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                
                title = await page.title()
                print(f"Page title: {title}")
                
                # Wait for initial content
                print("Waiting 5 seconds for initial load...")
                await page.wait_for_timeout(5000)
                
                # Check what's on the page
                page_info = await page.evaluate("""
                    () => {
                        const bodyText = document.body.innerText;
                        return {
                            bodyLength: bodyText.length,
                            bodyPreview: bodyText.substring(0, 300),
                            imageCount: document.images.length,
                            url: window.location.href,
                            title: document.title
                        };
                    }
                """)
                print("Page info:")
                print(f"  Body text length: {page_info['bodyLength']}")
                print(f"  Image count: {page_info['imageCount']}")
                print(f"  Body preview: {page_info['bodyPreview']}")
                
                # Wait for image generation (you can watch this happen in the browser)
                print("Waiting for image generation - watch the browser...")
                print("Looking for images every 10 seconds...")
                
                for attempt in range(12):  # Check for 2 minutes
                    await page.wait_for_timeout(10000)  # Wait 10 seconds between checks
                    
                    images_check = await page.evaluate("""
                        () => {
                            const allImages = [...document.images];
                            const relevantImages = allImages.filter(img => {
                                const src = img.src || '';
                                return (
                                    img.complete && 
                                    img.naturalWidth > 50 && 
                                    img.naturalHeight > 50 &&
                                    (
                                        src.includes('perchance') ||
                                        src.includes('temporaryImage') ||
                                        src.startsWith('blob:') ||
                                        src.startsWith('data:image/') ||
                                        img.naturalWidth >= 200
                                    )
                                );
                            });
                            
                            return {
                                totalImages: allImages.length,
                                relevantImages: relevantImages.map(img => ({
                                    src: img.src.substring(0, 100),
                                    size: `${img.naturalWidth}x${img.naturalHeight}`,
                                    complete: img.complete
                                }))
                            };
                        }
                    """)
                    
                    print(f"Attempt {attempt + 1}/12:")
                    print(f"  Total images: {images_check['totalImages']}")
                    print(f"  Relevant images: {len(images_check['relevantImages'])}")
                    
                    if images_check['relevantImages']:
                        print("Found generated images:")
                        for i, img in enumerate(images_check['relevantImages']):
                            print(f"    {i+1}. {img['src']} ({img['size']})")
                        
                        # Found images, let's try to download one
                        best_image = images_check['relevantImages'][0]
                        print(f"Using image: {best_image['src']}")
                        
                        try:
                            # Try to get the image data
                            if best_image['src'].startswith('blob:'):
                                print("Converting blob URL to data URL...")
                                data_url = await page.evaluate("""
                                    async (src) => {
                                        const response = await fetch(src);
                                        const blob = await response.blob();
                                        return await new Promise((resolve) => {
                                            const reader = new FileReader();
                                            reader.onload = () => resolve(reader.result);
                                            reader.readAsDataURL(blob);
                                        });
                                    }
                                """, best_image['src'])
                                print(f"SUCCESS! Got data URL: {len(data_url)} characters")
                                break
                            else:
                                print(f"Image source: {best_image['src']}")
                                break
                        except Exception as e:
                            print(f"Error processing image: {e}")
                            continue
                
                # Keep browser open for you to inspect manually
                print("Keeping browser open for 30 seconds for manual inspection...")
                await page.wait_for_timeout(30000)
                
            except Exception as e:
                print(f"Error: {e}")
            finally:
                await browser.close()
                
    except ImportError as e:
        print(f"Playwright not available: {e}")

if __name__ == "__main__":
    asyncio.run(test_perchance_detection())