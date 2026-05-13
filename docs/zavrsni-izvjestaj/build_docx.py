"""
Build konsolidovan Word dokument iz svih markdown fajlova u docs/zavrsni-izvjestaj/.

Spaja:
- Cover (naslov + meta)
- README executive summary
- 01-vizija-i-analiza
- 02-projekat (sa embed-ovanim UML PNG)
- 03-implementacija-demonstracija (sa embed-ovanim demo screenshot-ovima)
- 04-vv-i-ai-u-sdlc
- Appendix: Deployment (01, 02, 03)

Output: docs/zavrsni-izvjestaj/Zavrsni-izvjestaj-Sistem-skolskog-sporta-CG.docx
"""
import subprocess
from pathlib import Path
import re

HERE = Path(__file__).parent  # docs/zavrsni-izvjestaj
OUT = HERE / "Zavrsni-izvjestaj-Sistem-skolskog-sporta-CG.docx"
MASTER_MD = HERE / "_master.md"

COVER = """---
title: "Sistem školskog sporta Crne Gore"
subtitle: "Konsolidovani finalni izvještaj (v1.0)"
author: "Petar Simonović"
date: "2026"
lang: sr
---

# Sistem školskog sporta Crne Gore

**Konsolidovani finalni izvještaj — v1.0**

**Predmet:** Analiza i dizajn informacionih sistema (ADIS)
**Univerzitet Donja Gorica · 2026**
**Vlasnik:** Petar Simonović

---

"""

# UML slike koje treba embed-ovati u Poglavlje 2
UML_EMBEDS = {
    "01-klasni-dijagram": ("Slika 1: Klasni dijagram — domain model (11 entiteta + 7 enum-a + STI hijerarhija User → Professor)", "uml/render/01-klasni-dijagram.png"),
    "02-sequence-uc5": ("Slika 2: Sequence dijagram UC5 — async OCR upload + sync submit", "uml/render/02-sequence-uc5.png"),
    "03-sequence-uc8": ("Slika 3: Sequence dijagram UC8 — eDnevnik verifikacija (3 grane)", "uml/render/03-sequence-uc8.png"),
    "04-component-dijagram": ("Slika 4: Component dijagram — slojevita arhitektura sa adapter pattern", "uml/render/04-component-dijagram.png"),
    "05-package-dijagram": ("Slika 5: Package dijagram — Laravel struktura sa split route-ovima", "uml/render/05-package-dijagram.png"),
    "06-deployment-dijagram": ("Slika 6: Deployment dijagram — dev (lokalno SQLite + Fake adapteri) vs prod (Laravel Cloud)", "uml/render/06-deployment-dijagram.png"),
}

# Demo screenshot-ovi koje treba embed-ovati u Poglavlje 3
DEMO_EMBEDS = [
    ("Slika 7: UC5 — Lista timova (profesor view)", "demo/screenshots/uc5-01-teams-list.png"),
    ("Slika 8: UC5 — Detalji ekipe sa 10 članova i statusima potvrda", "demo/screenshots/uc5-02-team-edit.png"),
    ("Slika 9: UC8 — Verify forma sa dispatch dugmetom", "demo/screenshots/uc8-02-verify-page.png"),
    ("Slika 10: UC8 — Audit log sa zapisima verifikacije", "demo/screenshots/uc8-05-audit-log.png"),
    ("Slika 11: UC10 — Forma za unos rezultata (Atletika 2025)", "demo/screenshots/uc10-02-results-form.png"),
    ("Slika 12: UC10 — Popunjeni rezultati: 1=gold, 2=silver, 3=bronze", "demo/screenshots/uc10-03-results-filled.png"),
]


def read(p: Path) -> str:
    """Učitaj markdown bez frontmatter-a (ako postoji)."""
    txt = p.read_text(encoding="utf-8")
    if txt.startswith("---\n"):
        # Skip frontmatter
        end = txt.find("\n---\n", 4)
        if end != -1:
            txt = txt[end + 5:]
    # Skraćeni "> Pokriva:" blok ostavi
    return txt


def strip_blockquote_meta(md: str) -> str:
    """Skini > Pokriva: linije koje su redundantne kad su u Word-u."""
    lines = md.split("\n")
    out = []
    for line in lines:
        if line.startswith("> **Pokriva:**") or line.startswith("> **Konsolidacija:**") or line.startswith("> **Predmet:**") or line.startswith("> **Univerzitet"):
            continue
        out.append(line)
    return "\n".join(out)


def downshift_headings(md: str, by: int = 1) -> str:
    """Spusti sve heading levele za `by` (npr. # → ##) — koristimo da master TOC ima glavne sekcije."""
    return re.sub(
        r"^(#{1,5}) ",
        lambda m: ("#" * min(6, len(m.group(1)) + by)) + " ",
        md,
        flags=re.MULTILINE,
    )


def add_uml_embeds(md: str) -> str:
    """U 02-projekat.md sekcija 8 (UML), embed-uj sve PNG-ove poslije reference tabele."""
    # Naci sekciju "## 8. UML dijagrami" i ubaciti slike posle tabele
    marker = "## 8. UML dijagrami"
    new_md = md
    if marker in md:
        embeds = "\n\n"
        for key, (caption, path) in UML_EMBEDS.items():
            embeds += f"\n\n![{caption}]({path})\n\n*{caption}*\n"
        # Insert AFTER the marker section's table (insert at the end of "## 8" section, before "## Diff" if exists)
        # Just append all images right after the table block.
        # Strategy: find marker, then find next "## " heading, insert before it
        idx = md.find(marker)
        next_h2 = md.find("\n## ", idx + len(marker))
        if next_h2 == -1:
            # Add at end
            new_md = md + embeds
        else:
            new_md = md[:next_h2] + embeds + md[next_h2:]
    return new_md


def add_demo_embeds(md: str) -> str:
    """U 03-implementacija-demonstracija.md sekcija 6 (Demo scenariji), embed key screenshots."""
    marker = "## 6. Demo scenariji"
    new_md = md
    if marker in md:
        embeds = "\n\n**Demonstracioni screenshots (snimano preko Playwright Chromium headless):**\n\n"
        for caption, path in DEMO_EMBEDS:
            embeds += f"\n\n![{caption}]({path})\n\n*{caption}*\n"
        idx = md.find(marker)
        next_h2 = md.find("\n## ", idx + len(marker))
        if next_h2 == -1:
            new_md = md + embeds
        else:
            new_md = md[:next_h2] + embeds + md[next_h2:]
    return new_md


def section(title: str, body: str) -> str:
    return f"\n\n\\newpage\n\n# {title}\n\n" + body


def main():
    parts = [COVER]

    # Executive summary iz README-a (prvi paragraf + key results)
    readme = strip_blockquote_meta(read(HERE / "README.md"))
    # Iz README izvuci samo prve dvije sekcije ("# Sistem..." i "## Executive summary")
    parts.append(section("Sažetak", "\n\n".join(readme.split("\n\n")[:6])))

    # 1. Vizija i analiza
    md = strip_blockquote_meta(read(HERE / "01-vizija-i-analiza.md"))
    md = downshift_headings(md, 1)  # # → ##, ## → ###
    parts.append(section("Vizija i analiza", md))

    # 2. Projekat (sa UML embeds)
    md = strip_blockquote_meta(read(HERE / "02-projekat.md"))
    md = add_uml_embeds(md)
    md = downshift_headings(md, 1)
    parts.append(section("Projekat — arhitektura, tehnologije, UML", md))

    # 3. Implementacija i demonstracija (sa demo screenshots)
    md = strip_blockquote_meta(read(HERE / "03-implementacija-demonstracija.md"))
    md = add_demo_embeds(md)
    md = downshift_headings(md, 1)
    parts.append(section("Implementacija i demonstracija", md))

    # 4. V&V + AI u SDLC
    md = strip_blockquote_meta(read(HERE / "04-vv-i-ai-u-sdlc.md"))
    md = downshift_headings(md, 1)
    parts.append(section("Verifikacija, validacija i AI u SDLC", md))

    # Appendix: Deployment
    parts.append("\n\n\\newpage\n\n# Dodatak: Deployment uputstva\n\n")
    for fname in ("01-lokalna-instalacija.md", "02-staging-rollout.md", "03-production-readiness.md"):
        md = strip_blockquote_meta(read(HERE / "deployment" / fname))
        md = downshift_headings(md, 1)
        parts.append(md + "\n\n")

    MASTER_MD.write_text("\n".join(parts), encoding="utf-8")
    print(f"Master markdown: {MASTER_MD} ({MASTER_MD.stat().st_size // 1024} KB)")

    # Pandoc konverzija
    cmd = [
        "pandoc",
        str(MASTER_MD),
        "-o", str(OUT),
        "--from=gfm+yaml_metadata_block",
        "--toc",
        "--toc-depth=3",
        "--number-sections",
        "--standalone",
        "--resource-path", str(HERE),
    ]
    print("Running:", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(HERE))
    if result.returncode != 0:
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        raise SystemExit(result.returncode)

    print(f"DOCX: {OUT} ({OUT.stat().st_size // 1024} KB)")

    # Cleanup master
    MASTER_MD.unlink()
    print("Cleanup OK")


if __name__ == "__main__":
    main()
