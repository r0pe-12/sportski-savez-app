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
    "00-use-case-dijagram": ("Slika 1: Use Case dijagram — 3 primarna aktera + eDnevnik (eksterni) + 10 UC-ova sa <<include>> relacijama (UC5→UC6, UC7→UC8)", "uml/render/00-use-case-dijagram.png"),
    "01-klasni-dijagram": ("Slika 2: Klasni dijagram — domain model (11 entiteta + 7 enum-a + STI hijerarhija User → Professor)", "uml/render/01-klasni-dijagram.png"),
    "02-sequence-uc5": ("Slika 3: Sequence dijagram UC5 — async OCR upload + sync submit", "uml/render/02-sequence-uc5.png"),
    "03-sequence-uc8": ("Slika 4: Sequence dijagram UC8 — eDnevnik verifikacija (3 grane)", "uml/render/03-sequence-uc8.png"),
    "04-component-dijagram": ("Slika 5: Component dijagram — slojevita arhitektura sa adapter pattern", "uml/render/04-component-dijagram.png"),
    "05-package-dijagram": ("Slika 6: Package dijagram — Laravel struktura sa split route-ovima", "uml/render/05-package-dijagram.png"),
    "06-deployment-dijagram": ("Slika 7: Deployment dijagram — dev (lokalno SQLite + Fake adapteri) vs prod (Laravel Cloud)", "uml/render/06-deployment-dijagram.png"),
    "07-activity-uc5": ("Slika 8: Activity dijagram UC5 — prijava ekipe (preduslovi, loop dodavanja članova sa OCR fork-om, potpis, submit)", "uml/render/07-activity-uc5.png"),
    "08-activity-uc8": ("Slika 9: Activity dijagram UC8 — eDnevnik verifikacija (5 HTTP response grana: 200, 404, 503 sa 3× retry, 401, 429)", "uml/render/08-activity-uc8.png"),
    "09-state-team": ("Slika 10: State machine — Team (draft → submitted → active → completed; rejected/cancelled/withdrawn terminalna)", "uml/render/09-state-team.png"),
    "10-state-medical-certificate": ("Slika 11: State machine — MedicalCertificate (pending, valid, expired, invalid, manual_review, superseded)", "uml/render/10-state-medical-certificate.png"),
    "11-state-student-verification": ("Slika 12: State machine — Student.verification_status (unverified, pending, verified, mismatched, failed)", "uml/render/11-state-student-verification.png"),
    "12-er-diagram": ("Slika 13: ER dijagram — logički model baze (12 tabela sa kardinalitetom)", "uml/render/12-er-diagram.png"),
    "13-object-diagram": ("Slika 14: Object dijagram — snapshot demo data-e nakon DemoResetSeeder (admin, demoSchool, profPetar, studentMarko, stoniTenis, demoCompetition, demoTeam, demoMember, demoMc, auditEntry)", "uml/render/13-object-diagram.png"),
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


def replace_puml_with_image(md: str) -> str:
    """
    Zamijeni sve markdown linkove ka .puml fajlovima sa inline PNG image embed-om.

    Pattern 1: [`uml/XX-name.puml`](uml/XX-name.puml)  → ![caption](uml/render/XX-name.png)
    Pattern 2: [Anything](uml/XX-name.puml)            → ![caption](uml/render/XX-name.png)
    Pattern 3: U tabelama (line items), ostavi NAZIV kao plain tekst i ubaci sliku ispod tabele.

    Captions su iz UML_EMBEDS dict-a.
    """
    new_md = md

    # Step 1: linkovi unutar tabela — zamijeni samo tekst, slike ćemo dodati posle tabele
    # Match: [Label](uml/XX-name.puml) gdje god se desi
    def table_link_replacer(m):
        label = m.group(1)
        return f"**{label}**"

    # Detect table rows and strip links inside them
    lines = new_md.split("\n")
    out_lines = []
    in_table = False
    table_uml_keys: list[str] = []
    for line in lines:
        is_table_row = line.lstrip().startswith("|") and "|" in line.lstrip()[1:]
        if is_table_row and not in_table:
            in_table = True
            table_uml_keys = []
        if in_table:
            # Find all puml links in this row
            for m in re.finditer(r"\[([^\]]+)\]\(uml/([\w-]+)\.puml\)", line):
                key = m.group(2)
                if key in UML_EMBEDS and key not in table_uml_keys:
                    table_uml_keys.append(key)
            # Strip puml links to plain bold text
            line = re.sub(r"\[([^\]]+)\]\(uml/[\w-]+\.puml\)", table_link_replacer, line)
            out_lines.append(line)
            continue
        else:
            if in_table:
                in_table = False
                # Dump collected images after table
                for key in table_uml_keys:
                    caption, path = UML_EMBEDS[key]
                    out_lines.append("")
                    out_lines.append(f"![{caption}]({path})")
                    out_lines.append("")
                    out_lines.append(f"*{caption}*")
                    out_lines.append("")
                table_uml_keys = []
        out_lines.append(line)

    # Handle case where table is at end of file
    if in_table and table_uml_keys:
        for key in table_uml_keys:
            caption, path = UML_EMBEDS[key]
            out_lines.append("")
            out_lines.append(f"![{caption}]({path})")
            out_lines.append("")
            out_lines.append(f"*{caption}*")
            out_lines.append("")

    new_md = "\n".join(out_lines)

    # Step 2: in-prose .puml references — replace with inline image
    # Match: [`uml/XX-name.puml`](uml/XX-name.puml)  (the code-styled label)
    def code_link_replacer(m):
        key = m.group(1)
        if key in UML_EMBEDS:
            caption, path = UML_EMBEDS[key]
            return f"\n\n![{caption}]({path})\n\n*{caption}*\n"
        return m.group(0)

    new_md = re.sub(
        r"\[`uml/([\w-]+)\.puml`\]\(uml/[\w-]+\.puml\)",
        code_link_replacer,
        new_md,
    )

    # Match remaining: [Label](uml/XX-name.puml)
    def remaining_link_replacer(m):
        label = m.group(1)
        key = m.group(2)
        if key in UML_EMBEDS:
            caption, path = UML_EMBEDS[key]
            return f"\n\n![{caption}]({path})\n\n*{caption}*\n"
        return f"**{label}**"

    new_md = re.sub(
        r"\[([^\]]+)\]\(uml/([\w-]+)\.puml\)",
        remaining_link_replacer,
        new_md,
    )

    return new_md


def add_uml_embeds(md: str) -> str:
    """Wrapper koji koristi replace_puml_with_image — zamijena umjesto append-a."""
    return replace_puml_with_image(md)


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

    # 1. Vizija i analiza (sa UML embeds umjesto puml linkova)
    md = strip_blockquote_meta(read(HERE / "01-vizija-i-analiza.md"))
    md = replace_puml_with_image(md)
    md = downshift_headings(md, 1)  # # → ##, ## → ###
    parts.append(section("Vizija i analiza", md))

    # 2. Projekat (sa UML embeds umjesto puml linkova)
    md = strip_blockquote_meta(read(HERE / "02-projekat.md"))
    md = add_uml_embeds(md)
    md = downshift_headings(md, 1)
    parts.append(section("Projekat — arhitektura, tehnologije, UML", md))

    # 3. Implementacija i demonstracija (sa demo screenshots + UML embeds)
    md = strip_blockquote_meta(read(HERE / "03-implementacija-demonstracija.md"))
    md = replace_puml_with_image(md)
    md = add_demo_embeds(md)
    md = downshift_headings(md, 1)
    parts.append(section("Implementacija i demonstracija", md))

    # 4. V&V + AI u SDLC (sa UML embeds umjesto puml linkova)
    md = strip_blockquote_meta(read(HERE / "04-vv-i-ai-u-sdlc.md"))
    md = replace_puml_with_image(md)
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
