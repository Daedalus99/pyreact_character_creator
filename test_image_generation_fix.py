#!/usr/bin/env python3
"""
Comprehensive test script to diagnose and fix image generation issues
"""

import subprocess
import time
import sys
import os
import requests
import json

def check_virtual_env():
    """Check if we're running in the virtual environment"""
    print("Checking virtual environment...")
    venv_python = os.path.join(".venv", "Scripts", "python.exe")
    
    if not os.path.exists(venv_python):
        print("[ERROR] Virtual environment not found at .venv")
        return False
        
    # Check if current Python is the venv Python
    current_python = sys.executable
    if ".venv" in current_python:
        print("[OK] Running in virtual environment")
        return True
    else:
        print("[WARNING] Not running in virtual environment")
        print(f"Current Python: {current_python}")
        print(f"Expected Python: {os.path.abspath(venv_python)}")
        return False

def check_dependencies():
    """Check if required dependencies are installed"""
    print("Checking dependencies...")
    try:
        import flask
        print("[OK] Flask available")
    except ImportError:
        print("[ERROR] Flask not available")
        return False
        
    try:
        import playwright
        print("[OK] Playwright available")
    except ImportError:
        print("[ERROR] Playwright not available")
        return False
        
    return True

def check_backend_health():
    """Check if backend is running and healthy"""
    print("Checking backend health...")
    try:
        response = requests.get("http://127.0.0.1:5000/api/health", timeout=5)
        if response.status_code == 200:
            print("[OK] Backend is running and healthy")
            return True
        else:
            print(f"[ERROR] Backend unhealthy: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("[ERROR] Backend not running")
        return False
    except Exception as e:
        print(f"[ERROR] Backend check failed: {e}")
        return False

def start_backend():
    """Start the backend server"""
    print("Starting backend server...")
    
    # Use the batch file to start the backend
    try:
        # Start backend in a new process
        process = subprocess.Popen([
            os.path.join(".venv", "Scripts", "python.exe"),
            os.path.join("backend", "app.py")
        ], 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE,
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
        )
        
        print(f"Backend started with PID: {process.pid}")
        
        # Wait for backend to start
        print("Waiting for backend to start...")
        for i in range(10):
            time.sleep(2)
            if check_backend_health():
                return True
            print(f"Waiting... ({i+1}/10)")
            
        print("[ERROR] Backend failed to start within 20 seconds")
        return False
        
    except Exception as e:
        print(f"[ERROR] Failed to start backend: {e}")
        return False

def test_image_generation():
    """Test image generation API"""
    print("Testing image generation...")
    
    url = "http://127.0.0.1:5000/api/image/generate"
    payload = {
        "prompt": "test image, simple blue cat",
        "artStyle": "anime",
        "shape": "square",
        "batchSize": 1
    }
    
    try:
        print("Sending image generation request...")
        response = requests.post(url, json=payload, timeout=180)  # 3 minute timeout
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                images = result.get("images", [])
                print(f"[SUCCESS] Image generation successful! Generated {len(images)} images")
                for i, img in enumerate(images):
                    data_url_length = len(img.get('imageDataUrl', ''))
                    print(f"  Image {i+1}: {data_url_length} characters (image data)")
                return True
            else:
                print("[ERROR] Image generation failed")
                print(f"Error: {result.get('error', 'Unknown error')}")
                return False
        else:
            result = response.json()
            print("[ERROR] Image generation request failed")
            print(f"Error: {result.get('error', 'Unknown error')}")
            print(f"Details: {result.get('details', 'No details')}")
            return False
            
    except requests.exceptions.Timeout:
        print("[ERROR] Image generation timed out (>3 minutes)")
        return False
    except Exception as e:
        print(f"[ERROR] Image generation test failed: {e}")
        return False

def main():
    print("=== Image Generation Diagnostic Tool ===")
    print()
    
    # Check environment
    if not check_virtual_env():
        print()
        print("FIX: Run this script with the virtual environment Python:")
        print("   .venv\\Scripts\\python.exe test_image_generation_fix.py")
        return
    
    if not check_dependencies():
        print()
        print("FIX: Install missing dependencies:")
        print("   pip install -r backend/requirements.txt")
        print("   playwright install chromium")
        return
    
    # Check if backend is already running
    if not check_backend_health():
        print()
        print("Backend not running, attempting to start it...")
        if not start_backend():
            print()
            print("FIX: Manually start the backend:")
            print("   .venv\\Scripts\\python.exe backend/app.py")
            return
    
    print()
    print("=== Testing Image Generation ===")
    if test_image_generation():
        print()
        print("SUCCESS: Image generation is working correctly!")
    else:
        print()
        print("ERROR: Image generation is not working. Check the backend logs for details.")
        print("   Common issues:")
        print("   - Perchance.org may be down or have changed their interface")
        print("   - Network connectivity issues")
        print("   - Browser automation issues")

if __name__ == "__main__":
    main()