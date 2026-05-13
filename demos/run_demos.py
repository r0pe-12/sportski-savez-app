"""
Playwright demo recorder za UC5/UC8/UC10 sa VIDLJIVIM kursorom i click ripple-om.

Svaki demo:
- snima video u docs/zavrsni-izvjestaj/demo/raw/ (webm format)
- pravi screenshote u docs/zavrsni-izvjestaj/demo/screenshots/
- inject-uje JS overlay (kursor + click ripple) preko add_init_script
- pauzira između koraka da se vidi šta klikće

Pre-rekviziti:
- Laravel server na :8000
- Queue worker za OCR (UC5) i eDnevnik (UC8)
- DB seeded (DatabaseSeeder)
- Vite asseti build-ovani (npm run build)
"""
import os
import time
import traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("APP_URL", "http://localhost:8000")
DEMO_DIR = Path("docs/zavrsni-izvjestaj/demo")
RAW_DIR = DEMO_DIR / "raw"
SHOT_DIR = DEMO_DIR / "screenshots"
FIXTURES_DIR = Path("demos/fixtures").absolute()

RAW_DIR.mkdir(parents=True, exist_ok=True)
SHOT_DIR.mkdir(parents=True, exist_ok=True)

VIEWPORT = {"width": 1600, "height": 900}

# JS koji se inject-uje u svaku stranicu: vidljivi kursor + click ripple
CURSOR_JS = r"""
(() => {
  if (window.__demoCursorInjected) return;
  window.__demoCursorInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    #__demo_cursor {
      position: fixed;
      width: 28px;
      height: 28px;
      background: radial-gradient(circle, rgba(220,38,38,0.95) 0%, rgba(220,38,38,0.4) 60%, rgba(220,38,38,0) 100%);
      border: 3px solid #dc2626;
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483647;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 12px rgba(220,38,38,0.6);
      transition: top 0.05s linear, left 0.05s linear;
      left: -100px;
      top: -100px;
    }
    .__demo_ripple {
      position: fixed;
      width: 60px;
      height: 60px;
      border: 4px solid #dc2626;
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483646;
      transform: translate(-50%, -50%);
      animation: __demoRipple 0.8s cubic-bezier(0.2,0.8,0.4,1) forwards;
    }
    @keyframes __demoRipple {
      0%   { transform: translate(-50%,-50%) scale(0.4); opacity: 1; }
      100% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; }
    }
    #__demo_label {
      position: fixed;
      bottom: 16px;
      left: 16px;
      background: rgba(15,23,42,0.92);
      color: #f8fafc;
      font: 600 16px/1.3 system-ui, -apple-system, sans-serif;
      padding: 8px 14px;
      border-radius: 8px;
      pointer-events: none;
      z-index: 2147483645;
      max-width: 600px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
  `;
  document.documentElement.appendChild(style);

  const cursor = document.createElement('div');
  cursor.id = '__demo_cursor';
  document.documentElement.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }, true);

  const fireRipple = (x, y) => {
    const r = document.createElement('div');
    r.className = '__demo_ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    document.documentElement.appendChild(r);
    setTimeout(() => r.remove(), 850);
  };

  document.addEventListener('mousedown', (e) => fireRipple(e.clientX, e.clientY), true);

  window.__demoLabel = (text) => {
    let el = document.getElementById('__demo_label');
    if (!el) {
      el = document.createElement('div');
      el.id = '__demo_label';
      document.documentElement.appendChild(el);
    }
    el.textContent = text;
    el.style.display = text ? 'block' : 'none';
  };
})();
"""


def screenshot(page, name):
    path = SHOT_DIR / f"{name}.png"
    try:
        page.screenshot(path=str(path), full_page=False)
        print(f"  [shot] {path.name}")
    except Exception as e:
        print(f"  [FAIL] screenshot: {e}")


def label(page, text):
    """Prikazi labelu na dnu stranice — vidljivo u video-u."""
    try:
        page.evaluate(f"window.__demoLabel && window.__demoLabel({text!r})")
    except Exception:
        pass


def slow_click(page, locator, hint=None, settle=1.0):
    """Klikni sa visible kursor animacijom i pauzom posle."""
    try:
        if hint:
            label(page, hint)
        box = locator.bounding_box(timeout=3000)
        if box:
            cx = box["x"] + box["width"] / 2
            cy = box["y"] + box["height"] / 2
            # Animiraj kretanje kursora ka cilju
            page.mouse.move(cx, cy, steps=15)
            time.sleep(0.3)
        locator.click(timeout=5000)
        page.wait_for_load_state("networkidle", timeout=10000)
        time.sleep(settle)
        return True
    except Exception as e:
        print(f"  [WARN] click failed [{hint or locator}]: {type(e).__name__}: {e}")
        return False


def slow_fill(page, locator, value, hint=None, settle=0.3):
    try:
        if hint:
            label(page, hint)
        box = locator.bounding_box(timeout=3000)
        if box:
            page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, steps=10)
            time.sleep(0.15)
        locator.fill(value, timeout=5000)
        time.sleep(settle)
        return True
    except Exception as e:
        print(f"  [WARN] fill failed [{hint or locator}]: {type(e).__name__}")
        return False


def login(page, email, password, role_label):
    print(f"  >> login {role_label}: {email}")
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")
    label(page, f"Login: {email}")
    screenshot(page, f"00-{role_label}-login-form")
    slow_fill(page, page.locator('input[name="email"]'), email, "Unos email-a")
    slow_fill(page, page.locator('input[name="password"]'), password, "Unos lozinke")
    screenshot(page, f"00-{role_label}-login-filled")
    slow_click(page, page.locator('button[type="submit"]'), "Klik: Prijavi se", settle=2)
    label(page, "Login uspješan — dashboard")
    screenshot(page, f"00-{role_label}-dashboard")


# ============================================================
# UC8 — eDnevnik verifikacija (sa stvarnim dispatch-em)
# ============================================================
def demo_uc8(browser, student_id):
    print("\n=== UC8 — eDnevnik verifikacija ===")
    context = browser.new_context(
        viewport=VIEWPORT,
        record_video_dir=str(RAW_DIR),
        record_video_size=VIEWPORT,
    )
    context.add_init_script(CURSOR_JS)
    page = context.new_page()

    try:
        login(page, "admin@savez.test", "password", "admin-uc8")

        page.goto(f"{BASE_URL}/admin/students")
        page.wait_for_load_state("networkidle")
        label(page, "Admin lista učenika sa statusima verifikacije")
        time.sleep(1.5)
        screenshot(page, "uc8-01-students-list")

        # Direktna navigacija na verify formu (kraće od kliktanja kroz tabelu)
        page.goto(f"{BASE_URL}/admin/students/{student_id}/verify")
        page.wait_for_load_state("networkidle")
        label(page, "Verifikuj učenika kroz eDnevnik (mock adapter)")
        time.sleep(1)
        screenshot(page, "uc8-02-verify-page")

        # Klik dugme "Pokreni verifikaciju" (React onClick, ne form submit)
        slow_click(
            page,
            page.locator('button:has-text("Pokreni verifikaciju")'),
            "Klik: Pokreni verifikaciju (dispatch async job)",
            settle=3,
        )
        label(page, "Job dispatched, queue procesira...")
        screenshot(page, "uc8-03-after-dispatch")

        # Sačekaj queue da obradi
        time.sleep(4)
        page.reload()
        page.wait_for_load_state("networkidle")
        label(page, "Status nakon obrade (Verifikovan / Nepodudaranje / Nedostupno)")
        screenshot(page, "uc8-04-after-queue")
        time.sleep(2)

        # Audit log dokaz
        page.goto(f"{BASE_URL}/admin/audit-log")
        page.wait_for_load_state("networkidle")
        label(page, "Audit log — student.verified zapis")
        time.sleep(2)
        screenshot(page, "uc8-05-audit-log")
        time.sleep(2)
    except Exception:
        traceback.print_exc()
        screenshot(page, "uc8-99-error")
    finally:
        context.close()
        rename_latest_video("uc8-ednevnik-verifikacija")


# ============================================================
# UC10 — Rezultati + medalje (sa stvarnim submit-om)
# ============================================================
def demo_uc10(browser, competition_id):
    print(f"\n=== UC10 — Rezultati + medalje (competition {competition_id}) ===")
    context = browser.new_context(
        viewport=VIEWPORT,
        record_video_dir=str(RAW_DIR),
        record_video_size=VIEWPORT,
    )
    context.add_init_script(CURSOR_JS)
    page = context.new_page()

    try:
        login(page, "admin@savez.test", "password", "admin-uc10")

        page.goto(f"{BASE_URL}/admin/competitions")
        page.wait_for_load_state("networkidle")
        label(page, "Lista takmičenja — Admin")
        time.sleep(1.5)
        screenshot(page, "uc10-01-competitions-list")

        # Otvori results formu za completed takmičenje
        page.goto(f"{BASE_URL}/admin/competitions/{competition_id}/results")
        page.wait_for_load_state("networkidle")
        label(page, "Forma za unos rezultata — Atletika 2025")
        time.sleep(1.5)
        screenshot(page, "uc10-02-results-form")

        # Popuni rezultate: 1=gold, 2=silver, 3=bronze (za prva 3 učesnika)
        placements = [("1", "gold"), ("2", "silver"), ("3", "bronze")]
        for idx, (place, medal) in enumerate(placements):
            mjesto_input = page.locator('input[placeholder="Mjesto"]').nth(idx)
            slow_fill(page, mjesto_input, place, f"Unos: mjesto = {place}")
            medal_select = page.locator('select').nth(idx)
            try:
                box = medal_select.bounding_box(timeout=3000)
                if box:
                    page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, steps=10)
                    time.sleep(0.2)
                medal_select.select_option(medal, timeout=3000)
                label(page, f"Izbor: medalja = {medal}")
                time.sleep(0.6)
            except Exception as e:
                print(f"  [WARN] select medal {medal}: {e}")
        screenshot(page, "uc10-03-results-filled")

        # Submit
        slow_click(
            page,
            page.locator('button:has-text("Sačuvaj rezultate")'),
            "Klik: Sačuvaj rezultate",
            settle=3,
        )
        label(page, "Rezultati sačuvani, audit log zapis kreiran")
        screenshot(page, "uc10-04-submitted")
        time.sleep(2)

        # Public schedule — student perspektiva
        page.goto(f"{BASE_URL}/schedule")
        page.wait_for_load_state("networkidle")
        label(page, "Javni raspored takmičenja (svi vide)")
        time.sleep(2)
        screenshot(page, "uc10-05-public-schedule")
    except Exception:
        traceback.print_exc()
        screenshot(page, "uc10-99-error")
    finally:
        context.close()
        rename_latest_video("uc10-rezultati-medalje")


# ============================================================
# UC5 — Prijava ekipe (sa stvarnim upload-om i submit-om)
# ============================================================
def demo_uc5(browser, team_id):
    print(f"\n=== UC5 — Prijava ekipe (team {team_id}) ===")
    context = browser.new_context(
        viewport=VIEWPORT,
        record_video_dir=str(RAW_DIR),
        record_video_size=VIEWPORT,
    )
    context.add_init_script(CURSOR_JS)
    page = context.new_page()

    try:
        login(page, "prof.os-pg-001.1@savez.test", "password", "prof-uc5")

        page.goto(f"{BASE_URL}/teams")
        page.wait_for_load_state("networkidle")
        label(page, "Moje ekipe — lista")
        time.sleep(1.5)
        screenshot(page, "uc5-01-teams-list")

        page.goto(f"{BASE_URL}/teams/{team_id}/edit")
        page.wait_for_load_state("networkidle")
        label(page, "Detalji ekipe — Košarka, OŠ Sutjeska")
        time.sleep(1.5)
        screenshot(page, "uc5-02-team-edit")

        # File upload kroz expect_file_chooser pattern (klik na "Upload potvrdu" otvara dialog)
        pdf_path = str(FIXTURES_DIR / "Marko_Markovic_2027-12-31.pdf")
        try:
            upload_btn = page.locator('button:has-text("Upload potvrdu")').first
            box = upload_btn.bounding_box(timeout=3000)
            if box:
                page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, steps=15)
                time.sleep(0.3)
            label(page, "Klik: Upload potvrdu (PDF dialog)")

            with page.expect_file_chooser() as fc_info:
                upload_btn.click(timeout=5000)
            file_chooser = fc_info.value
            file_chooser.set_files(pdf_path)
            print(f"  [OK] file dialog: {Path(pdf_path).name}")
            label(page, "Inertia šalje multipart POST, OCR job u queue")
            time.sleep(3)
            page.wait_for_load_state("networkidle")
            screenshot(page, "uc5-03-cert-uploaded-pending")
        except Exception as e:
            print(f"  [WARN] file upload via chooser: {type(e).__name__}: {e}")
            # Fallback: direktan set_input_files
            try:
                page.locator('input[type="file"]').first.set_input_files(pdf_path, timeout=5000)
                time.sleep(3)
                page.wait_for_load_state("networkidle")
                screenshot(page, "uc5-03-cert-uploaded-pending")
            except Exception as e2:
                print(f"  [WARN] fallback fail: {e2}")
                screenshot(page, "uc5-03-upload-fail")

        # Sačekaj OCR queue da obradi
        label(page, "Čekamo OCR validaciju (queue worker)...")
        time.sleep(6)
        page.reload()
        page.wait_for_load_state("networkidle")
        label(page, "Status potvrde nakon OCR-a")
        time.sleep(1.5)
        screenshot(page, "uc5-04-after-ocr")

        # Review stranica
        page.goto(f"{BASE_URL}/teams/{team_id}/review")
        page.wait_for_load_state("networkidle")
        label(page, "Pregled i potpis ekipe pred submit")
        time.sleep(2)
        screenshot(page, "uc5-05-review-page")
        time.sleep(2)
    except Exception:
        traceback.print_exc()
        screenshot(page, "uc5-99-error")
    finally:
        context.close()
        rename_latest_video("uc5-prijava-ekipe")


def rename_latest_video(new_name):
    """Playwright snima video sa random imenom — preimenuj na human-readable."""
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
    # Defaultni demo IDs — mogu se overriede-ovati env varijablama
    student_id = int(os.environ.get("DEMO_STUDENT_ID", "2"))
    competition_id = int(os.environ.get("DEMO_COMP_ID", "3"))
    team_id = int(os.environ.get("DEMO_TEAM_ID", "1"))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            demo_uc8(browser, student_id)
            demo_uc10(browser, competition_id)
            demo_uc5(browser, team_id)
        finally:
            browser.close()

    # Cleanup
    for f in list(RAW_DIR.glob("*.webm")):
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
