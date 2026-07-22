#!/usr/bin/env python3
"""
Debug script to inspect the actual Perchance website structure
"""

import asyncio
from playwright.async_api import async_playwright

async def inspect_perchance_page():
    print("=== Inspecting Perchance Website Structure ===")
    
    pw = await async_playwright().start()
    
    try:
        # Launch visible browser for debugging
        browser = await pw.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        # Navigate to Perchance
        print("Navigating to Perchance...")
        await page.goto("https://perchance.org/ai-text-to-image-generator", wait_until="networkidle", timeout=60000)
        
        # Wait for page to load
        await page.wait_for_timeout(5000)
        
        # Take screenshot
        await page.screenshot(path="perchance_page.png")
        print("Screenshot saved as: perchance_page.png")
        
        # Check if we're blocked by Cloudflare
        page_title = await page.title()
        print(f"Page title: {page_title}")
        
        page_text = await page.inner_text("body")
        if "just a moment" in page_text.lower() or "cloudflare" in page_text.lower():
            print("DETECTED: Cloudflare challenge page!")
            print("We need to solve the challenge first...")
            
            # Wait for challenge to be solved (manually or automatically)
            print("Waiting 30 seconds for Cloudflare challenge to resolve...")
            await page.wait_for_timeout(30000)
            
            # Check again
            await page.screenshot(path="perchance_after_challenge.png") 
            page_title = await page.title()
            print(f"Page title after challenge: {page_title}")
        
        # Look for all input fields and textareas
        print("\n=== Finding Input Fields ===")
        inputs = await page.locator('input, textarea').all()
        print(f"Found {len(inputs)} input elements:")
        
        for i, inp in enumerate(inputs):
            try:
                tag = await inp.evaluate('el => el.tagName')
                type_attr = await inp.get_attribute('type') or 'text'
                placeholder = await inp.get_attribute('placeholder') or ''
                name = await inp.get_attribute('name') or ''
                id_attr = await inp.get_attribute('id') or ''
                classes = await inp.get_attribute('class') or ''
                
                print(f"  {i+1}. <{tag.lower()} type='{type_attr}' id='{id_attr}' name='{name}' class='{classes}' placeholder='{placeholder}'>")
                
                # Check if this might be a prompt field
                if any(keyword in (placeholder + name + id_attr + classes).lower() 
                       for keyword in ['prompt', 'describe', 'text', 'input']):
                    print(f"      ^^^ POTENTIAL PROMPT FIELD ^^^")
                
            except Exception as e:
                print(f"  {i+1}. Error inspecting input: {e}")
        
        # Look for buttons
        print("\n=== Finding Buttons ===")
        buttons = await page.locator('button, input[type="submit"], input[type="button"]').all()
        print(f"Found {len(buttons)} button elements:")
        
        for i, btn in enumerate(buttons):
            try:
                tag = await btn.evaluate('el => el.tagName')
                text = await btn.inner_text() or ''
                type_attr = await btn.get_attribute('type') or ''
                value = await btn.get_attribute('value') or ''
                classes = await btn.get_attribute('class') or ''
                
                btn_text = text or value
                print(f"  {i+1}. <{tag.lower()}> '{btn_text}' type='{type_attr}' class='{classes}'")
                
                # Check if this might be a generate button
                if any(keyword in btn_text.lower() 
                       for keyword in ['generate', 'create', 'make']):
                    print(f"      ^^^ POTENTIAL GENERATE BUTTON ^^^")
                
            except Exception as e:
                print(f"  {i+1}. Error inspecting button: {e}")
        
        # Look for select elements
        print("\n=== Finding Select Elements ===")
        selects = await page.locator('select').all()
        print(f"Found {len(selects)} select elements:")
        
        for i, sel in enumerate(selects):
            try:
                name = await sel.get_attribute('name') or ''
                id_attr = await sel.get_attribute('id') or ''
                classes = await sel.get_attribute('class') or ''
                
                print(f"  {i+1}. <select> id='{id_attr}' name='{name}' class='{classes}'")
                
                # Get options
                options = await sel.locator('option').all()
                option_texts = []
                for opt in options[:5]:  # Show first 5 options
                    text = await opt.inner_text()
                    option_texts.append(text)
                
                if option_texts:
                    print(f"      Options: {', '.join(option_texts)}")
                    
                    # Check if this might be style/shape selection
                    options_str = ' '.join(option_texts).lower()
                    if any(keyword in options_str for keyword in ['anime', 'realistic', 'portrait', 'landscape', 'square']):
                        print(f"      ^^^ POTENTIAL STYLE/SHAPE SELECTOR ^^^")
                
            except Exception as e:
                print(f"  {i+1}. Error inspecting select: {e}")
        
        # Get page URL and check for redirects
        current_url = page.url
        print(f"\n=== Page Information ===")
        print(f"Current URL: {current_url}")
        print(f"Original URL: https://perchance.org/ai-text-to-image-generator")
        
        if current_url != "https://perchance.org/ai-text-to-image-generator":
            print("WARNING: Page was redirected! This might indicate blocking or site changes.")
        
        # Wait for user to manually interact if needed
        print("\n=== Manual Inspection ===")
        print("Browser window is open for manual inspection.")
        print("You can manually interact with the page to understand its structure.")
        print("Press Enter in this terminal when you're done inspecting...")
        
        # Keep browser open for manual inspection
        input("Press Enter to close browser and continue...")
        
    except Exception as e:
        print(f"Error during inspection: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await browser.close()
        await pw.stop()

if __name__ == "__main__":
    asyncio.run(inspect_perchance_page())