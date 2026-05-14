"""
Konvertuje svaki Markdown fajl u zasebni Word dokument.

Ukloni:
- Cross-reference linkove ka drugim .md / .puml / relativnim fajlovima → zamijeni samo tekstom
- "Reference" sekcije na kraju koje samo nabrajaju linkove

Zadrži:
- Image embed-ove (![alt](img.png))
- Eksterne URL-ove (http://)
- Strukturu (heading, table, lista)

Za 02-projekat i 03-implementacija-demonstracija: embed-uj UML/demo PNG-ove inline.
"""
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).parent

# UML embeds za 02-projekat
UML_EMBEDS = [
    ("Slika 1: Klasni dijagram — domain model", "uml/render/01-klasni-dijagram.png"),
    ("Slika 2: Sequence dijagram UC5", "uml/render/02-sequence-uc5.png"),
    ("Slika 3: Sequence dijagram UC8", "uml/render/03-sequence-uc8.png"),
    ("Slika 4: Component dijagram", "uml/render/04-component-dijagram.png"),
    ("Slika 5: Package dijagram", "uml/render/05-package-dijagram.png"),
    ("Slika 6: Deployment dijagram", "uml/render/06-deployment-dijagram.png"),
]

DEMO_EMBEDS = [
    ("Slika 7: UC5 — Lista timova", "demo/screenshots/uc5-01-teams-list.png"),
    ("Slika 8: UC5 — Detalji ekipe sa 10 članova", "demo/screenshots/uc5-02-team-edit.png"),
    ("Slika 9: UC8 — Verify forma", "demo/screenshots/uc8-02-verify-page.png"),
    ("Slika 10: UC8 — Rezultat verifikacije (Razlika sa eDnevnik)", "demo/screenshots/uc8-04-after-queue.png"),
    ("Slika 11: UC10 — Rezultati popunjeni (Zlato/Srebro/Bronza)", "demo/screenshots/uc10-03-results-filled.png"),
    ("Slika 12: UC10 — Audit log nakon submita", "demo/screenshots/uc8-05-audit-log.png"),
]


# Mapping puml file name → (caption, PNG path)
PUML_TO_IMAGE = {
    "00-use-case-dijagram": ("Slika 1: Use Case dijagram — 3 primarna aktera + eDnevnik + 10 UC-ova", "uml/render/00-use-case-dijagram.png"),
    "01-klasni-dijagram": ("Slika 2: Klasni dijagram — domain model", "uml/render/01-klasni-dijagram.png"),
    "02-sequence-uc5": ("Slika 3: Sequence dijagram UC5 — async OCR upload + sync submit", "uml/render/02-sequence-uc5.png"),
    "03-sequence-uc8": ("Slika 4: Sequence dijagram UC8 — eDnevnik verifikacija (3 grane)", "uml/render/03-sequence-uc8.png"),
    "04-component-dijagram": ("Slika 5: Component dijagram — slojevita arhitektura", "uml/render/04-component-dijagram.png"),
    "05-package-dijagram": ("Slika 6: Package dijagram — Laravel struktura", "uml/render/05-package-dijagram.png"),
    "06-deployment-dijagram": ("Slika 7: Deployment dijagram — dev vs prod", "uml/render/06-deployment-dijagram.png"),
}


def replace_puml_with_image_inline(md: str) -> str:
    """
    Zamijeni linkove ka .puml fajlovima sa inline PNG image embed-om.
    Linkove unutar tabela (| ... |) zamijeni samo bold tekstom da ne lomimo table layout.
    """
    lines = md.split("\n")
    out_lines = []
    in_table = False
    table_uml_keys: list[str] = []

    for line in lines:
        is_table_row = line.lstrip().startswith("|") and "|" in line.lstrip()[1:]
        if is_table_row:
            if not in_table:
                in_table = True
                table_uml_keys = []
            # Find all puml links in this row, collect for after-table embedding
            for m in re.finditer(r"\[([^\]]+)\]\(uml/([\w-]+)\.puml\)", line):
                key = m.group(2)
                if key in PUML_TO_IMAGE and key not in table_uml_keys:
                    table_uml_keys.append(key)
            # Strip puml links to plain bold text
            line = re.sub(
                r"\[([^\]]+)\]\(uml/[\w-]+\.puml\)",
                lambda m: f"**{m.group(1)}**",
                line,
            )
            out_lines.append(line)
        else:
            if in_table:
                # End of table — dump collected images
                in_table = False
                for key in table_uml_keys:
                    caption, path = PUML_TO_IMAGE[key]
                    out_lines.append("")
                    out_lines.append(f"![{caption}]({path})")
                    out_lines.append("")
                    out_lines.append(f"*{caption}*")
                    out_lines.append("")
                table_uml_keys = []

            # Out-of-table line: replace puml refs with images inline
            def code_repl(m):
                key = m.group(1)
                if key in PUML_TO_IMAGE:
                    caption, path = PUML_TO_IMAGE[key]
                    return f"\n\n![{caption}]({path})\n\n*{caption}*\n"
                return m.group(0)

            line = re.sub(r"\[`uml/([\w-]+)\.puml`\]\(uml/[\w-]+\.puml\)", code_repl, line)

            def gen_repl(m):
                label = m.group(1)
                key = m.group(2)
                if key in PUML_TO_IMAGE:
                    caption, path = PUML_TO_IMAGE[key]
                    return f"\n\n![{caption}]({path})\n\n*{caption}*\n"
                return f"**{label}**"

            line = re.sub(r"\[([^\]]+)\]\(uml/([\w-]+)\.puml\)", gen_repl, line)
            out_lines.append(line)

    # Table at end of file
    if in_table and table_uml_keys:
        for key in table_uml_keys:
            caption, path = PUML_TO_IMAGE[key]
            out_lines.append("")
            out_lines.append(f"![{caption}]({path})")
            out_lines.append("")
            out_lines.append(f"*{caption}*")
            out_lines.append("")

    return "\n".join(out_lines)


def strip_cross_refs(md: str) -> str:
    """
    Ukloni linkove ka relativnim .md / .puml fajlovima.
    PUML linkovi → inline PNG image embed.
    Ostali relativni → samo tekst.
    """
    # Step 1: replace puml links with image embeds inline
    md = replace_puml_with_image_inline(md)

    # Step 2: ostatak relativnih linkova → plain tekst
    def replace(m):
        text = m.group(1)
        target = m.group(2)
        if target.startswith(('http://', 'https://')):
            return m.group(0)
        return text

    md = re.sub(r'(?<!\!)\[([^\]]+)\]\(([^)]+)\)', replace, md)
    return md


def strip_reference_section(md: str) -> str:
    """Ukloni '## Reference' sekciju na kraju koja samo lista linkove."""
    lines = md.split('\n')
    out = []
    skipping = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## Reference') or stripped == '## Referenca':
            skipping = True
            continue
        if skipping and stripped.startswith('## '):
            skipping = False
        if not skipping:
            out.append(line)
    return '\n'.join(out)


def strip_meta_blockquote(md: str) -> str:
    """Skini > Pokriva: / > Konsolidacija: meta blokove."""
    lines = md.split('\n')
    out = []
    for line in lines:
        if line.startswith('> **Pokriva:**') or line.startswith('> **Konsolidacija:**'):
            continue
        out.append(line)
    return '\n'.join(out)


def add_image_section(md: str, after_section: str, images: list) -> str:
    """Ubaci sliku poslije date sekcije."""
    if after_section not in md:
        return md
    embeds = "\n\n"
    for caption, path in images:
        embeds += f"\n![{caption}]({path})\n\n*{caption}*\n\n"
    idx = md.find(after_section)
    next_h2 = md.find("\n## ", idx + len(after_section))
    if next_h2 == -1:
        return md + embeds
    return md[:next_h2] + embeds + md[next_h2:]


def convert(src: Path, out: Path, transform=None, resource_path=None):
    md = src.read_text(encoding='utf-8')

    # Skini YAML frontmatter ako postoji
    if md.startswith('---\n'):
        end = md.find('\n---\n', 4)
        if end != -1:
            md = md[end + 5:]

    md = strip_meta_blockquote(md)
    md = strip_reference_section(md)
    md = strip_cross_refs(md)

    if transform:
        md = transform(md)

    # Privremeni md
    tmp = out.with_suffix('.tmp.md')
    tmp.write_text(md, encoding='utf-8')

    cmd = [
        'pandoc', str(tmp), '-o', str(out),
        '--from=gfm', '--toc', '--toc-depth=2',
        '--number-sections', '--standalone',
        '--resource-path', str(resource_path or src.parent),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    tmp.unlink()
    if result.returncode != 0:
        print(f"  [FAIL] {out.name}: {result.stderr.strip()[:200]}")
        return False
    size = out.stat().st_size // 1024
    print(f"  [OK] {out.name} ({size} KB)")
    return True


def main():
    print("=== Word per-chapter build ===\n")

    # 1. 4 glavna poglavlja
    convert(HERE / "01-vizija-i-analiza.md", HERE / "01-vizija-i-analiza.docx",
            resource_path=HERE)

    # 02-projekat: UML images su sad embed-ovani inline preko replace_puml_with_image_inline
    # u strip_cross_refs, pa ne treba dodatni add_image_section.
    convert(HERE / "02-projekat.md", HERE / "02-projekat.docx",
            resource_path=HERE)

    convert(HERE / "03-implementacija-demonstracija.md", HERE / "03-implementacija-demonstracija.docx",
            transform=lambda md: add_image_section(md, "## 6. Demo scenariji", DEMO_EMBEDS),
            resource_path=HERE)

    convert(HERE / "04-vv-i-ai-u-sdlc.md", HERE / "04-vv-i-ai-u-sdlc.docx",
            resource_path=HERE)

    # 2. Deployment (3 docs)
    dep = HERE / "deployment"
    convert(dep / "01-lokalna-instalacija.md", dep / "01-lokalna-instalacija.docx",
            resource_path=dep)
    convert(dep / "02-staging-rollout.md", dep / "02-staging-rollout.docx",
            resource_path=dep)
    convert(dep / "03-production-readiness.md", dep / "03-production-readiness.docx",
            resource_path=dep)

    print("\n=== Done ===")


if __name__ == "__main__":
    main()
