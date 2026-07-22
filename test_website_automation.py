#!/usr/bin/env python3
"""
Test the website automation for image generation
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from perchance_website_automation import generate_images_via_website

async def test_single_image():
    """Test generating a single image"""
    print("=== Testing Single Image Generation ===")
    
    try:
        images = await generate_images_via_website(
            prompt="a cute cat sitting in a garden",
            art_style="anime",
            shape="square",
            batch_size=1
        )
        
        print(f"SUCCESS! Generated {len(images)} image(s)")
        
        for i, img in enumerate(images):
            print(f"  Image {i+1}:")
            print(f"    ID: {img['imageId']}")
            print(f"    Extension: {img['fileExtension']}")
            print(f"    Success: {img['success']}")
            print(f"    Data URL length: {len(img.get('imageDataUrl', ''))}")
        
        return images
        
    except Exception as e:
        print(f"FAILED: Test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

async def test_batch_images():
    """Test generating multiple images"""
    print("\n=== Testing Batch Image Generation ===")
    
    try:
        images = await generate_images_via_website(
            prompt="a magical forest with glowing mushrooms",
            art_style="digital_art", 
            shape="landscape",
            batch_size=2
        )
        
        print(f"SUCCESS! Generated {len(images)} image(s)")
        
        for i, img in enumerate(images):
            print(f"  Image {i+1}:")
            print(f"    ID: {img['imageId']}")
            print(f"    Extension: {img['fileExtension']}")
            print(f"    Success: {img['success']}")
        
        return images
        
    except Exception as e:
        print(f"FAILED: Test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

async def main():
    """Run all tests"""
    print("=== Starting Website Automation Tests ===")
    print("This will open browser windows to test Perchance website automation")
    
    # Test single image
    single_result = await test_single_image()
    
    # Test batch images
    batch_result = await test_batch_images()
    
    if single_result and batch_result:
        print("\n=== All tests passed! ===")
        print("Website automation is working correctly.")
        
        # Save a test image to verify it works
        if single_result and len(single_result) > 0:
            img = single_result[0]
            if img.get('imageDataUrl'):
                # Save the image data to a file for verification
                import base64
                
                data_url = img['imageDataUrl']
                if ',' in data_url:
                    header, data = data_url.split(',', 1)
                    
                    try:
                        image_bytes = base64.b64decode(data)
                        filename = f"test_generated_image.{img['fileExtension']}"
                        
                        with open(filename, 'wb') as f:
                            f.write(image_bytes)
                        
                        print(f"Test image saved as: {filename}")
                        
                    except Exception as e:
                        print(f"Could not save test image: {e}")
        
    else:
        print("\n=== Some tests failed! ===")
        print("Website automation needs debugging.")

if __name__ == "__main__":
    asyncio.run(main())