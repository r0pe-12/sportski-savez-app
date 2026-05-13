"""Generišu minimalni važeći PDF za demo upload."""
import os

# Minimal valid PDF (PDF 1.4, jedan prazan page)
PDF_BYTES = (
    b"%PDF-1.4\n"
    b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
    b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<<>>>>endobj\n"
    b"4 0 obj<</Length 44>>stream\n"
    b"BT /F1 24 Tf 100 700 Td (Ljekarska potvrda) Tj ET\n"
    b"endstream endobj\n"
    b"xref\n"
    b"0 5\n"
    b"0000000000 65535 f \n"
    b"0000000009 00000 n \n"
    b"0000000052 00000 n \n"
    b"0000000101 00000 n \n"
    b"0000000183 00000 n \n"
    b"trailer<</Size 5/Root 1 0 R>>\n"
    b"startxref\n"
    b"260\n"
    b"%%EOF\n"
)

out_dir = os.path.dirname(__file__)
fixtures = [
    "Marko_Markovic_2027-12-31.pdf",
    "Petar_Petrovic_2027-06-30.pdf",
    "Jovana_Jovanovic_2027-09-15.pdf",
]
for name in fixtures:
    path = os.path.join(out_dir, name)
    with open(path, "wb") as f:
        f.write(PDF_BYTES)
    print(f"OK: {path} ({len(PDF_BYTES)}B)")
