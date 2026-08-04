# Image Generation Fix Guide

## Issues Found

1. **Backend Server Not Running** - The Flask backend needs to be running for image generation
2. **Virtual Environment** - Dependencies are installed in `.venv` but may not be activated
3. **Perchance.org Integration** - Browser automation is timing out when looking for generated images

## Quick Fixes

### 1. Start the Backend Server
```bash
# Method 1: Use the batch file
.\start_backend.bat

# Method 2: Manual activation
.\.venv\Scripts\activate.bat
python backend\app.py
```

### 2. Test if Backend is Running
Create a simple health check:
```bash
curl http://127.0.0.1:5000/api/health
```
Or visit `http://127.0.0.1:5000/api/health` in your browser.

### 3. Fix Perchance Integration

The current issue is that the browser automation is not finding generated images. This could be due to:

#### Option A: Page Structure Changed
Perchance.org may have updated their interface. You can:
- Check the saved `debug_page_content.html` for the actual page structure
- Update the image detection selectors in `backend/app.py`

#### Option B: Use Alternative Image Generation
Consider switching to a more reliable service:
- Use OpenAI's DALL-E API (requires API key)
- Use Stable Diffusion through Hugging Face API
- Use a local Stable Diffusion model

## Immediate Test Steps

1. **Start Backend:**
```bash
.\start_backend.bat
```

2. **Test Health Endpoint:**
```bash
.\.venv\Scripts\python.exe -c "import requests; print(requests.get('http://127.0.0.1:5000/api/health').json())"
```

3. **Test Image Generation:**
```bash
.\.venv\Scripts\python.exe test_backend_directly.py
```

## Long-term Recommendations

### 1. Add Fallback Image Generation
Modify `backend/app.py` to include better fallback options when Perchance fails.

### 2. Improve Error Handling
Add better error messages and retry logic for image generation failures.

### 3. Consider Alternative Services
- **Hugging Face Inference API** (free tier available)
- **Replicate API** (pay-per-use)
- **Local Stable Diffusion** (requires more setup but fully offline)

## Debugging Steps

If image generation still fails:

1. **Check Browser Automation:**
   - Run `debug_perchance_page_content.py` to see what's on the page
   - Check if Perchance requires user verification or has rate limiting

2. **Check Network Issues:**
   - Ensure internet connection is working
   - Check if Perchance.org is accessible from your location

3. **Check Dependencies:**
   - Verify Playwright browsers are installed: `.\.venv\Scripts\playwright.exe install chromium`

## Manual Testing

You can manually test Perchance.org by visiting:
```
https://perchance.org/ai-text-to-image-generator
```

And trying to generate an image to see if the service is working normally.