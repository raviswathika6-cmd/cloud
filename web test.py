"""
W3Schools Python Content Test - Playwright Script
This script automates testing the W3Schools website to:
1. Open https://www.w3schools.com/
2. Navigate to Python section
3. Capture screenshots for documentation
"""

from playwright.sync_api import sync_playwright
from datetime import datetime
import os

def test_w3schools_python():
    """Automated test for W3Schools Python content"""
    
    # Create screenshots directory
    screenshots_dir = "screenshots"
    if not os.path.exists(screenshots_dir):
        os.makedirs(screenshots_dir)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_path = os.path.join(screenshots_dir, f"w3schools_python_{timestamp}.png")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Step 1: Open W3Schools
            print("Step 1: Opening https://www.w3schools.com/")
            page.goto("https://www.w3schools.com/", wait_until="networkidle")
            page.wait_for_timeout(1000)
            print(" Homepage loaded successfully")
            
            # Step 2: Navigate to Python section
            print("Step 2: Navigating to Python tutorial...")
            page.goto("https://www.w3schools.com/python/", wait_until="networkidle")
            page.wait_for_timeout(2000)
            print(" Python section loaded successfully")
            
            # Step 3: Take screenshot
            print(f"Step 3: Capturing screenshot...")
            page.screenshot(path=screenshot_path, full_page=False)
            print(f"Screenshot saved: {screenshot_path}")
            
            # Log page details
            page_title = page.title()
            page_url = page.url
            print(f"\n Page Title: {page_title}")
            print(f" Page URL: {page_url}")
            print("\n Test completed successfully!")
            
            return True
            
        except Exception as e:
            print(f"Error: {str(e)}")
            return False
        finally:
            browser.close()

if __name__ == "__main__":
    test_w3schools_python()