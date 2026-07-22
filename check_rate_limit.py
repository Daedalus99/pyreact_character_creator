#!/usr/bin/env python3
"""
Simple check to see if this is a rate limiting issue
"""

import asyncio
import requests
from datetime import datetime

def test_rate_limit_theory():
    print("=== Testing Rate Limit Theory ===")
    print(f"Current time: {datetime.now()}")
    
    # Simple HTTP check of verifyUser endpoint
    try:
        response = requests.get(
            "https://image-generation.perchance.org/api/verifyUser?thread=0",
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if "token_required" in response.text:
            print("\n🔍 ANALYSIS:")
            print("✅ Getting 'token_required' response")
            print("✅ This could indicate:")
            print("   - Rate limiting hit")
            print("   - Daily quota exceeded") 
            print("   - IP-based restrictions")
            print("   - Service changed to require registration")
            
            print("\n🕐 TO TEST IF IT'S RATE LIMITING:")
            print("1. Try again tomorrow morning")
            print("2. Try from a different IP/network")
            print("3. Try after waiting several hours")
            print("4. Check if registering an account helps")
            
        elif "userKey" in response.text:
            print("\n✅ SUCCESS: userKey found - rate limit may have reset!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_rate_limit_theory()