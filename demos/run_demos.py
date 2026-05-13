"""
Playwright demo recorder za UC5/UC8/UC10.

Svaki demo:
- snima video u docs/zavrsni-izvjestaj/demo/raw/ (webm format)
- pravi screenshote u docs/zavrsni-izvjestaj/demo/screenshots/
- defanzivno: try/except oko svake interakcije, screenshot kao dokaz čak i ako nešto pukne

Pre-rekviziti (van skripte):
- Laravel server na :8000
- Queue worker za OCR job (uc5)
- DB seeded (DatabaseSeeder)
- Vite asseti build-ovani (npm run build)
"""
import os
import time
import traceback
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeoutError

BASE_URL = os.environ.get("APP_URL", "http://localhost:8000")
DEMO_DIR = Path("docs/zavrsni-izvjestaj/demo")
RAW_DIR = DEMO_DIR / "raw"
SHOT_DIR = DEMO_DIR / "screenshots"
FIXTURES_DIR = Path("demos/fixtures").absolute()

RAW_DIR.mkdir(parents=True, exist_ok=True)
SHOT_DIR.mkdir(parents=True, exist_ok=True)

VIEWPORT = {"width": 1600, "height": 900}


def screenshot(page, name):
    """Snimi screenshot, vrati path."""
    path = SHOT_DIR / f"{name}.png"
    try:
        page.screenshot(path=str(path), full_page=False)
        print(f"  [shot] {path.name}")
    except Exception as e:
        print(f"  [FAIL] screenshot: {e}")
    return path


def safe_click(page, selector, name="action", timeout=5000):
    """Try click, return success bool."""
    try:
        page.locator(selector).first.click(timeout=timeout)
        page.wait_for_load_state("networkidle", timeout=10000)
        print(f"  [click] {selector}")
        return True
    except Exception as e:
        print(f"  [WARN] click failed [{selector}]: {type(e).__name__}")
        return False


def safe_fill(page, selector, value, timeout=5000):
    try:
        page.locator(selector).first.fill(value, timeout=timeout)
        print(f"  [fill] {selector}")
        return True
    except Exception as e:
        print(f"  [WARN] fill failed [{selector}]: {type(e).__name__}")
        return False


def login(page, email, password, role_label):
    """Universal login flow preko Fortify forme."""
    print(f"  >> login {role_label}: {email}")
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")
    screenshot(page, f"00-{role_label}-login-form")

    # Fortify forma — input[name=email], input[name=password]
    safe_fill(page, 'input[name="email"]', email)
    safe_fill(page, 'input[name="password"]', password)
    time.sleep(0.5)  # vizuelna pauza za video
    screenshot(page, f"00-{role_label}-login-filled")

    safe_click(page, 'button[type="submit"]')
    time.sleep(2)  # post-login redirect
    page.wait_for_load_state("networkidle")
    screenshot(page, f"00-{role_label}-dashboard")
    print(f"  [OK] logged in as {role_label}")


# ============================================================
# UC8 — eDnevnik verifikacija (najjednostavniji, prvi)
# ============================================================
def demo_uc8(browser):
    print("\n=== UC8 — eDnevnik verifikacija ===")
    context = browser.new_context(
        viewport=VIEWPORT,
        record_video_dir=str(RAW_DIR),
        record_video_size=VIEWPORT,
    )
    page = context.new_page()

    try:
        login(page, "admin@savez.test", "password", "admin-uc8")

        # 1. Admin students list
        page.goto(f"{BASE_URL}/admin/students")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        screenshot(page, "uc8-01-students-list")

        # 2. Klik na verify za prvog studenta
        # Tražimo dugme/link sa tekstom "Verifikuj" ili "Verify"
        try:
            verify_btn = page.locator(
                'a:has-text("Verifikuj"), a:has-text("Verify"), button:has-text("Verifikuj")'
            ).first
            verify_btn.click(timeout=5000)
            page.wait_for_load_state("networkidle")
            screenshot(page, "uc8-02-verify-page")
            time.sleep(1)
        except Exception as e:
            print(f"  [WARN] verify btn not found via text: {e}")
            # fallback: navigate to first student verify URL directly
            page.goto(f"{BASE_URL}/admin/students/2/verify")
            page.wait_for_load_state("networkidle")
            screenshot(page, "uc8-02-verify-page-direct")

        # 3. Dispatch verifikaciju
        if safe_click(page, 'button[type="submit"]'):
            time.sleep(3)  # job processing
            screenshot(page, "uc8-03-verify-dispatched")

        # 4. Provjeri status nazad na listi
        page.goto(f"{BASE_URL}/admin/students")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        screenshot(page, "uc8-04-status-after")

        # 5. Audit log dokaz
        page.goto(f"{BASE_URL}/admin/audit-log")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        screenshot(page, "uc8-05-audit-log")
        time.sleep(2)  # za video da prikaže audit
    except Exception:
        traceback.print_exc()
        screenshot(page, "uc8-99-error")
    finally:
        context.close()
        # rename most recent video to uc8
        rename_latest_video("uc8-ednevnik-verifikacija")


# ============================================================
# UC10 — Rezultati + medalje
# ============================================================
def demo_uc10(browser):
    print("\n=== UC10 — Rezultati + medalje ===")
    context = browser.new_context(
        viewport=VIEWPORT,
        record_video_dir=str(RAW_DIR),
        record_video_size=VIEWPORT,
    )
    page = context.new_page()

    try:
        login(page, "admin@savez.test", "password", "admin-uc10")

        # 1. Admin competitions
        page.goto(f"{BASE_URL}/admin/competitions")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        screenshot(page, "uc10-01-competitions-list")

        # 2. Rezultati za completed atletika (id=3)
        page.goto(f"{BASE_URL}/admin/competitions/3/results")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        screenshot(page, "uc10-02-results-form")

        # 3. Skroluj forma do dna i screenshot
        try:
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1)
            screenshot(page, "uc10-03-results-form-bottom")
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(0.5)
        except Exception:
            pass

        # 4. Pređi nazad na javni raspored — student perspective
        page.goto(f"{BASE_URL}/schedule")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        screenshot(page, "uc10-04-public-schedule")
        time.sleep(2)
    except Exception:
        traceback.print_exc()
        screenshot(page, "uc10-99-error")
    finally:
        context.close()
        rename_latest_video("uc10-rezultati-medalje")


# ============================================================
# UC5 — Prijava ekipe (najsloženiji)
# ============================================================
def demo_uc5(browser):
    print("\n=== UC5 — Prijava ekipe ===")
    context = browser.new_context(
        viewport=VIEWPORT,
        record_video_dir=str(RAW_DIR),
        record_video_size=VIEWPORT,
    )
    page = context.new_page()

    try:
        login(page, "prof.os-pg-001.1@savez.test", "password", "prof-uc5")

        # 1. Lista timova
        page.goto(f"{BASE_URL}/teams")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        screenshot(page, "uc5-01-teams-list")

        # 2. Otvori draft tim 1 (Košarka, OS-PG-001)
        page.goto(f"{BASE_URL}/teams/1/edit")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        screenshot(page, "uc5-02-team-edit")

        # 3. Scroll kroz formu da se vide članovi
        try:
            page.evaluate("window.scrollTo(0, 400)")
            time.sleep(1)
            screenshot(page, "uc5-03-team-members")
            page.evaluate("window.scrollTo(0, 800)")
            time.sleep(1)
            screenshot(page, "uc5-04-team-members-scroll")
        except Exception:
            pass

        # 4. Pokušaj upload medical cert (file input)
        try:
            file_input = page.locator('input[type="file"]').first
            pdf_path = str(FIXTURES_DIR / "Marko_Markovic_2027-12-31.pdf")
            file_input.set_input_files(pdf_path, timeout=5000)
            time.sleep(2)  # Inertia submit
            page.wait_for_load_state("networkidle")
            screenshot(page, "uc5-05-cert-uploaded")
            print(f"  [OK] uploaded {Path(pdf_path).name}")
        except Exception as e:
            print(f"  [WARN] file upload failed: {type(e).__name__}")
            screenshot(page, "uc5-05-upload-issue")

        # 5. Čekaj OCR job
        time.sleep(8)
        page.reload()
        page.wait_for_load_state("networkidle")
        screenshot(page, "uc5-06-after-ocr-wait")

        # 6. Review stranica (signoff)
        page.goto(f"{BASE_URL}/teams/1/review")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        screenshot(page, "uc5-07-team-review")
        time.sleep(2)
    except Exception:
        traceback.print_exc()
        screenshot(page, "uc5-99-error")
    finally:
        context.close()
        rename_latest_video("uc5-prijava-ekipe")


_video_counter = 0


def rename_latest_video(new_name):
    """Playwright snima video sa random imenom -- preimenuj na human-readable."""
    time.sleep(0.5)
    videos = sorted(RAW_DIR.glob("*.webm"), key=lambda p: p.stat().st_mtime)
    if not videos:
        print(f"  [WARN] nema novog video fajla za {new_name}")
        return
    latest = videos[-1]
    target = DEMO_DIR / f"{new_name}.webm"
    if target.exists():
        target.unlink()
    latest.rename(target)
    print(f"  [SAVE] {target.name} ({target.stat().st_size // 1024}KB)")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            demo_uc8(browser)
            demo_uc10(browser)
            demo_uc5(browser)
        finally:
            browser.close()

    # cleanup raw dir
    leftover = list(RAW_DIR.glob("*.webm"))
    if leftover:
        print(f"\n  cleanup: {len(leftover)} preostali webm fajlova u raw/")
        for f in leftover:
            f.unlink()
    try:
        RAW_DIR.rmdir()
    except OSError:
        pass

    print("\n=== DONE ===")
    print(f"Videos: {DEMO_DIR}/*.webm")
    print(f"Screenshots: {SHOT_DIR}/*.png")


if __name__ == "__main__":
    main()
