"""
W3Schools Python Content Test - Playwright Script
This script automates testing the W3Schools website to:
1. Open https://www.w3schools.com/
2. Navigate to Python section
3. Capture screenshots for documentation
"""

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from datetime import datetime
import os
import sys


def test_w3schools_python():
    """Automated test for W3Schools Python content"""

    screenshots_dir = "screenshots"
    if not os.path.exists(screenshots_dir):
        os.makedirs(screenshots_dir)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_path = os.path.join(screenshots_dir, f"w3schools_python_{timestamp}.png")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            print("Step 1: Opening https://www.w3schools.com/")
            page.goto("https://www.w3schools.com/", wait_until="networkidle")
            page.wait_for_timeout(1000)
            print(" Homepage loaded successfully")

            print("Step 2: Navigating to Python tutorial...")
            page.goto("https://www.w3schools.com/python/", wait_until="networkidle")
            page.wait_for_timeout(2000)
            print(" Python section loaded successfully")

            print("Step 3: Capturing screenshot...")
            page.screenshot(path=screenshot_path, full_page=False)
            print(f"Screenshot saved: {screenshot_path}")

            page_title = page.title()
            page_url = page.url
            print(f"\n Page Title: {page_title}")
            print(f" Page URL: {page_url}")
            print("\n Test completed successfully!")

            return True

        except PlaywrightTimeout as e:
            print(f"Timeout error: page did not load in time: {e}", file=sys.stderr)
            raise
        except OSError as e:
            print(f"File system error (screenshot save failed): {e}", file=sys.stderr)
            raise
        except Exception as e:
            print(f"Unexpected error during test: {e}", file=sys.stderr)
            raise
        finally:
            browser.close()


if __name__ == "__main__":
    try:
        success = test_w3schools_python()
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"Test failed: {e}", file=sys.stderr)
        sys.exit(1)