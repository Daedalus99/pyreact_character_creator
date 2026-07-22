#!/usr/bin/env python3
"""
Perchance Website Automation for Image Generation
Automates the actual website interface to generate images
"""

import asyncio
import base64
import os
import tempfile
from playwright.async_api import async_playwright
import aiofiles
import logging

# Set up logging
logger = logging.getLogger(__name__)

class PerchanceWebsiteAutomator:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
    
    async def initialize(self):
        """Initialize the browser and navigate to Perchance"""
        logger.info("Initializing Perchance website automation...")
        
        pw = await async_playwright().start()
        
        # Launch browser (visible for debugging, can be made headless later)
        self.browser = await pw.chromium.launch(
            headless=False,  # Set to True for production
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        )
        
        # Create context with realistic settings
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720},
            locale="en-US",
            timezone_id="America/New_York",
            # Accept downloads
            accept_downloads=True
        )
        
        self.page = await self.context.new_page()
        
        # Navigate to Perchance image generator
        logger.info("Navigating to Perchance AI Image Generator...")
        await self.page.goto("https://perchance.org/ai-text-to-image-generator", 
                           wait_until="networkidle", timeout=60000)
        
        # Wait for page to fully load and solve any Cloudflare challenges
        await self.page.wait_for_timeout(5000)
        
        # Wait specifically for the main input textarea to be ready
        logger.info("Waiting for main input field to be ready...")
        try:
            await self.page.wait_for_selector("textarea#input", timeout=30000)
            logger.info("Main input field found")
        except Exception as e:
            logger.warning(f"Main input field wait failed: {e}")
        
        # Wait a bit more for any dynamic content
        await self.page.wait_for_timeout(3000)
        
        logger.info("Perchance website loaded successfully")
    
    async def generate_images(self, prompt, art_style="anime", shape="portrait", batch_size=1):
        """
        Generate images using the website interface
        
        Args:
            prompt (str): The image prompt
            art_style (str): Art style (anime, realistic, etc.)
            shape (str): Image shape (portrait, square, landscape)
            batch_size (int): Number of images to generate
        
        Returns:
            list: List of generated image data
        """
        if not self.page:
            raise Exception("Browser not initialized. Call initialize() first.")
        
        logger.info(f"Starting image generation: prompt='{prompt[:50]}...', style={art_style}, shape={shape}, batch={batch_size}")
        
        try:
            # Find and fill the prompt input
            await self._input_prompt(prompt)
            
            # Set art style if possible
            await self._set_art_style(art_style)
            
            # Set image shape if possible  
            await self._set_image_shape(shape)
            
            # Set batch size if possible
            await self._set_batch_size(batch_size)
            
            # Generate images
            images = await self._generate_and_download(batch_size)
            
            logger.info(f"Successfully generated {len(images)} images")
            return images
            
        except Exception as e:
            logger.error(f"Image generation failed: {e}")
            # Take screenshot for debugging
            await self.page.screenshot(path="generation_error.png")
            raise
    
    async def _input_prompt(self, prompt):
        """Find and fill the prompt input field"""
        logger.info("Inputting prompt...")
        
        # Wait a bit for the page to fully load
        await self.page.wait_for_timeout(3000)
        
        # Take a debug screenshot
        await self.page.screenshot(path="debug_input_search.png")
        
        # Based on debugging, the main prompt input is textarea#input
        prompt_selectors = [
            'textarea#input',  # Main prompt field found during debugging
            'textarea[placeholder*="prompt"]',
            'textarea[placeholder*="describe"]',
            'input[placeholder*="prompt"]',
            'textarea#prompt',
            '.prompt-input textarea',
            '.prompt textarea',
            'textarea',  # Fallback to any textarea
        ]
        
        for selector in prompt_selectors:
            try:
                element = self.page.locator(selector).first
                
                # Check if element exists and is visible
                exists = await element.count() > 0
                logger.info(f"Selector '{selector}': exists={exists}")
                
                if exists:
                    is_visible = await element.is_visible()
                    logger.info(f"Selector '{selector}': visible={is_visible}")
                    
                    if is_visible:
                        await element.clear()
                        await element.fill(prompt)
                        logger.info(f"Prompt entered using selector: {selector}")
                        return
                    elif selector == 'textarea#input':
                        # Special handling for the main input which might be hidden
                        logger.info("Main input found but hidden, trying to make it visible and interact with it...")
                        
                        try:
                            # Try to make it visible using JavaScript
                            await self.page.evaluate('''() => {
                                const input = document.querySelector('textarea#input');
                                if (input) {
                                    // Remove any display: none or visibility: hidden
                                    input.style.display = 'block';
                                    input.style.visibility = 'visible';
                                    input.style.opacity = '1';
                                    input.style.height = 'auto';
                                    input.style.width = 'auto';
                                }
                            }''')
                            
                            # Wait a moment for styles to apply
                            await self.page.wait_for_timeout(1000)
                            
                            # Try to interact with it now
                            if await element.is_visible():
                                await element.clear()
                                await element.fill(prompt)
                                logger.info("Successfully entered prompt in now-visible main input")
                                return
                            else:
                                # Use JavaScript to set the value directly
                                logger.info("Element still not visible, using JavaScript to set value...")
                                await self.page.evaluate(f'''(prompt) => {{
                                    const input = document.querySelector('textarea#input');
                                    if (input) {{
                                        input.value = prompt;
                                        // Trigger input events to notify the page
                                        input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                                        input.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                    }}
                                }}''', prompt)
                                logger.info("Prompt set via JavaScript")
                                return
                                
                        except Exception as js_error:
                            logger.error(f"JavaScript interaction failed: {js_error}")
                
            except Exception as e:
                logger.debug(f"Selector {selector} failed: {e}")
                continue
        
        # If no standard input found, try to find any text input
        logger.warning("Standard prompt input not found, trying alternative methods...")
        
        # Get ALL input elements and log their details
        all_inputs = await self.page.locator('input, textarea').all()
        logger.info(f"Found {len(all_inputs)} total input/textarea elements")
        
        for i, inp in enumerate(all_inputs):
            try:
                id_attr = await inp.get_attribute('id') or ""
                placeholder = await inp.get_attribute('placeholder') or ""
                name_attr = await inp.get_attribute('name') or ""
                type_attr = await inp.get_attribute('type') or ""
                tag_name = await inp.evaluate('el => el.tagName.toLowerCase()')
                is_visible = await inp.is_visible()
                
                logger.info(f"Input {i}: <{tag_name}> id='{id_attr}' name='{name_attr}' type='{type_attr}' placeholder='{placeholder}' visible={is_visible}")
                
                if is_visible:
                    # Check for known IDs or meaningful placeholders
                    if (id_attr == 'input' or 
                        any(word in placeholder.lower() for word in ['prompt', 'describe', 'text']) or
                        tag_name == 'textarea'):
                        logger.info(f"Attempting to use input {i} for prompt")
                        await inp.clear()
                        await inp.fill(prompt)
                        logger.info(f"Prompt entered in input {i} (id='{id_attr}')")
                        return
            except Exception as e:
                logger.error(f"Error checking input {i}: {e}")
                continue
        
        # Final debug: save page content
        page_content = await self.page.content()
        with open("debug_page_content.html", "w", encoding="utf-8") as f:
            f.write(page_content)
        logger.error("Page content saved to debug_page_content.html")
        
        raise Exception("Could not find prompt input field")
    
    async def _set_art_style(self, art_style):
        """Set the art style if controls are available"""
        logger.info(f"Setting art style: {art_style}")
        
        # Map our art styles to Perchance options
        style_mappings = {
            "anime": ["anime", "manga", "cartoon"],
            "realistic": ["realistic", "photorealistic", "photo"],
            "digital_art": ["digital art", "digital", "art"],
            "oil_painting": ["oil painting", "painting", "oil"],
            "watercolor": ["watercolor", "water color"],
            "sketch": ["sketch", "pencil", "drawing"]
        }
        
        target_styles = style_mappings.get(art_style, [art_style])
        
        # Look for style selection controls
        style_selectors = [
            'select[name*="style"]',
            'select[id*="style"]',
            '.style-selector select',
            '.art-style select',
            'select'  # Any select element
        ]
        
        for selector in style_selectors:
            try:
                select_element = self.page.locator(selector).first
                if await select_element.is_visible():
                    # Get all options
                    options = await select_element.locator('option').all()
                    
                    for option in options:
                        option_text = (await option.inner_text()).lower()
                        option_value = await option.get_attribute('value') or ""
                        
                        # Check if this option matches our target style
                        for target in target_styles:
                            if target.lower() in option_text or target.lower() in option_value.lower():
                                await select_element.select_option(value=option_value)
                                logger.info(f"Selected art style: {option_text}")
                                return
            except Exception as e:
                logger.debug(f"Style selector {selector} failed: {e}")
        
        logger.warning(f"Could not find art style selector for: {art_style}")
    
    async def _set_image_shape(self, shape):
        """Set the image shape if controls are available"""
        logger.info(f"Setting image shape: {shape}")
        
        # Map our shapes to Perchance options
        shape_mappings = {
            "portrait": ["portrait", "vertical", "9:16", "tall"],
            "square": ["square", "1:1", "equal"],
            "landscape": ["landscape", "horizontal", "16:9", "wide"]
        }
        
        target_shapes = shape_mappings.get(shape, [shape])
        
        # Look for shape/ratio selection controls
        shape_selectors = [
            'select[name*="ratio"]',
            'select[name*="shape"]', 
            'select[name*="size"]',
            'select[id*="ratio"]',
            'select[id*="shape"]',
            '.ratio-selector select',
            '.shape-selector select'
        ]
        
        for selector in shape_selectors:
            try:
                select_element = self.page.locator(selector).first
                if await select_element.is_visible():
                    options = await select_element.locator('option').all()
                    
                    for option in options:
                        option_text = (await option.inner_text()).lower()
                        option_value = await option.get_attribute('value') or ""
                        
                        for target in target_shapes:
                            if target.lower() in option_text or target.lower() in option_value.lower():
                                await select_element.select_option(value=option_value)
                                logger.info(f"Selected shape: {option_text}")
                                return
            except Exception as e:
                logger.debug(f"Shape selector {selector} failed: {e}")
        
        logger.warning(f"Could not find shape selector for: {shape}")
    
    async def _set_batch_size(self, batch_size):
        """Set batch size if controls are available"""
        logger.info(f"Setting batch size: {batch_size}")
        
        # Look for batch size controls
        batch_selectors = [
            'input[name*="batch"]',
            'input[name*="count"]',
            'input[name*="number"]',
            'select[name*="batch"]',
            'select[name*="count"]',
            '.batch-size input',
            '.count input'
        ]
        
        for selector in batch_selectors:
            try:
                element = self.page.locator(selector).first
                if await element.is_visible():
                    tag_name = await element.evaluate('el => el.tagName.toLowerCase()')
                    
                    if tag_name == 'select':
                        # Try to select the batch size from options
                        options = await element.locator('option').all()
                        for option in options:
                            option_value = await option.get_attribute('value') or ""
                            if str(batch_size) in option_value:
                                await element.select_option(value=option_value)
                                logger.info(f"Selected batch size: {batch_size}")
                                return
                    else:
                        # Input field
                        await element.clear()
                        await element.fill(str(batch_size))
                        logger.info(f"Set batch size: {batch_size}")
                        return
            except Exception as e:
                logger.debug(f"Batch selector {selector} failed: {e}")
        
        logger.warning(f"Could not find batch size control, will generate {batch_size} images manually")
    
    async def _generate_and_download(self, expected_count):
        """Click generate and download the resulting images"""
        logger.info("Starting image generation...")
        
        # Find and click generate button
        # From debugging, we know there are buttons with Unicode characters
        generate_selectors = [
            'button:has-text("Generate")',
            'button:has-text("Create")', 
            'input[type="submit"][value*="Generate"]',
            'button[type="submit"]',
            '.generate-button',
            '.generate',
            '#generate',
            'button',  # Fallback to any button - we'll check text manually
        ]
        
        generate_button = None
        
        # First try standard selectors
        for selector in generate_selectors[:-1]:  # Exclude the fallback 'button'
            try:
                element = self.page.locator(selector).first
                if await element.is_visible():
                    generate_button = element
                    logger.info(f"Found generate button: {selector}")
                    break
            except Exception as e:
                logger.debug(f"Selector {selector} failed: {e}")
        
        # If no standard button found, try to find any button that might generate
        if not generate_button:
            logger.info("Standard generate button not found, checking all buttons...")
            buttons = await self.page.locator('button').all()
            
            for i, btn in enumerate(buttons):
                try:
                    # Get button text and handle Unicode gracefully
                    try:
                        text = await btn.inner_text() or ''
                        text = text.lower().strip()
                    except:
                        text = ''
                    
                    # Look for button that might be the generate button
                    # Common words/patterns for generation buttons
                    if any(keyword in text for keyword in ['generate', 'create', 'make', 'render', 'start']):
                        if await btn.is_visible():
                            generate_button = btn
                            logger.info(f"Found generate button {i}: '{text[:20]}...'")
                            break
                    
                    # Also check for buttons with specific classes or attributes that might indicate generation
                    classes = await btn.get_attribute('class') or ''
                    if any(keyword in classes.lower() for keyword in ['generate', 'create', 'submit', 'primary']):
                        if await btn.is_visible():
                            generate_button = btn
                            logger.info(f"Found generate button {i} by class: '{classes}'")
                            break
                
                except Exception as e:
                    logger.debug(f"Error checking button {i}: {e}")
                    continue
        
        if not generate_button:
            # Take screenshot for debugging
            await self.page.screenshot(path="no_generate_button_found.png")
            raise Exception("Could not find generate button")
        
        # Set up download monitoring
        downloads = []
        
        def handle_download(download):
            downloads.append(download)
            logger.info(f"Download started: {download.suggested_filename}")
        
        self.page.on('download', handle_download)
        
        # Click generate
        await generate_button.click()
        logger.info("Generate button clicked, waiting for images...")
        
        # Wait for generation to complete and images to appear
        generated_images = []
        
        # Try multiple strategies to get the generated images
        for attempt in range(30):  # Wait up to 30 seconds
            await self.page.wait_for_timeout(1000)
            
            # Strategy 1: Look for download links or buttons
            download_links = await self.page.locator('a[download], button:has-text("Download")').all()
            if len(download_links) >= expected_count:
                logger.info(f"Found {len(download_links)} download links")
                
                for i, link in enumerate(download_links[:expected_count]):
                    try:
                        # Click download and wait for download to start
                        async with self.page.expect_download() as download_info:
                            await link.click()
                        
                        download = await download_info.value
                        
                        # Save to temporary file
                        temp_path = os.path.join(tempfile.gettempdir(), f"perchance_image_{i}.{download.suggested_filename.split('.')[-1]}")
                        await download.save_as(temp_path)
                        
                        # Read and encode as base64
                        async with aiofiles.open(temp_path, 'rb') as f:
                            image_bytes = await f.read()
                        
                        base64_image = base64.b64encode(image_bytes).decode('utf-8')
                        file_ext = temp_path.split('.')[-1].lower()
                        
                        generated_images.append({
                            "success": True,
                            "imageDataUrl": f"data:image/{file_ext};base64,{base64_image}",
                            "imageId": f"perchance_web_{i}",
                            "fileExtension": file_ext,
                            "seed": 0,
                            "width": 0,  # Will be determined by the image
                            "height": 0,
                            "maybeNsfw": False,
                            "prompt": "Generated via website automation"
                        })
                        
                        # Clean up temp file
                        os.unlink(temp_path)
                        
                    except Exception as e:
                        logger.error(f"Failed to download image {i}: {e}")
                
                break
            
            # Strategy 2: Look for generated images on page
            img_elements = await self.page.locator('img[src*="generated"], img[src*="perchance"], .generated-image img').all()
            if len(img_elements) >= expected_count:
                logger.info(f"Found {len(img_elements)} generated images on page")
                
                for i, img in enumerate(img_elements[:expected_count]):
                    try:
                        # Get image source
                        src = await img.get_attribute('src')
                        if src and src.startswith('data:'):
                            # Already base64 encoded
                            generated_images.append({
                                "success": True,
                                "imageDataUrl": src,
                                "imageId": f"perchance_web_{i}",
                                "fileExtension": "png",
                                "seed": 0,
                                "width": 0,
                                "height": 0,
                                "maybeNsfw": False,
                                "prompt": "Generated via website automation"
                            })
                        elif src:
                            # Download from URL
                            response = await self.page.context.request.get(src)
                            if response.ok:
                                image_bytes = await response.body()
                                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                                
                                # Determine file extension from URL or content type
                                content_type = response.headers.get('content-type', '')
                                if 'jpeg' in content_type:
                                    file_ext = 'jpeg'
                                elif 'png' in content_type:
                                    file_ext = 'png'
                                elif 'webp' in content_type:
                                    file_ext = 'webp'
                                else:
                                    file_ext = 'png'  # Default
                                
                                generated_images.append({
                                    "success": True,
                                    "imageDataUrl": f"data:image/{file_ext};base64,{base64_image}",
                                    "imageId": f"perchance_web_{i}",
                                    "fileExtension": file_ext,
                                    "seed": 0,
                                    "width": 0,
                                    "height": 0,
                                    "maybeNsfw": False,
                                    "prompt": "Generated via website automation"
                                })
                    except Exception as e:
                        logger.error(f"Failed to process image {i}: {e}")
                
                break
            
            logger.debug(f"Attempt {attempt + 1}/30: Found {len(download_links)} download links, {len(img_elements)} images")
        
        if not generated_images:
            # Take screenshot for debugging
            await self.page.screenshot(path="generation_failed.png")
            raise Exception(f"Could not find {expected_count} generated images after waiting")
        
        logger.info(f"Successfully collected {len(generated_images)} images")
        return generated_images
    
    async def cleanup(self):
        """Close browser and clean up resources"""
        if self.browser:
            logger.info("Closing browser...")
            await self.browser.close()
            self.browser = None
            self.context = None
            self.page = None


# Integration function for the Flask app
async def generate_images_via_website(prompt, art_style="anime", shape="portrait", batch_size=1):
    """
    Main function to generate images via website automation
    
    Returns:
        list: List of generated image objects
    """
    automator = PerchanceWebsiteAutomator()
    
    try:
        await automator.initialize()
        images = await automator.generate_images(prompt, art_style, shape, batch_size)
        return images
    
    finally:
        await automator.cleanup()


# Test function
async def test_automation():
    """Test the automation system"""
    try:
        images = await generate_images_via_website(
            prompt="cute cat sitting in a garden",
            art_style="anime", 
            shape="square",
            batch_size=1
        )
        
        print(f"Generated {len(images)} images:")
        for i, img in enumerate(images):
            print(f"Image {i + 1}: {img['imageId']}, {img['fileExtension']}")
            
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_automation())