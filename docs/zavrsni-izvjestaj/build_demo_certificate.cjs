// Generates a demo medical certificate PDF for the FakeOcrAdapter demo flow.
// Filename convention is parsed by FakeOcrAdapter: ^(ime)_(prezime)_(YYYY-MM-DD)$
// This is a synthetic document for demo purposes only — NOT a real medical record.

const path = require('path');
const fs = require('fs');

// pdfkit is hoisted to the project root node_modules
const projectRoot = path.resolve(__dirname, '..', '..');
const PDFDocument = require(path.join(projectRoot, 'node_modules', 'pdfkit'));

const outDir = path.join(__dirname, 'demo');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'marko_markovic_2027-12-31.pdf');

// A4: 595.28 x 841.89 pt; margins ~2cm = ~56.7pt
const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 57, bottom: 57, left: 57, right: 57 },
    info: {
        Title: 'Ljekarska potvrda - Marko Markovic',
        Author: 'Demo - Sistem skolskog sporta CG',
        Subject: 'Demo medicinska potvrda za sportsko takmicenje',
        Keywords: 'demo, ADIS, sportski savez, ljekarska potvrda',
    },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

// pdfkit's built-in Helvetica covers Latin-1 (incl. č, ć, š, ž, đ via WinAnsi)
const FONT_REGULAR = 'Helvetica';
const FONT_BOLD = 'Helvetica-Bold';
const FONT_ITALIC = 'Helvetica-Oblique';

const pageWidth = doc.page.width;
const leftMargin = doc.page.margins.left;
const rightMargin = doc.page.margins.right;
const contentWidth = pageWidth - leftMargin - rightMargin;

// --- HEADER ---
doc.font(FONT_BOLD).fontSize(18);
doc.text('LJEKARSKA POTVRDA', leftMargin, 70, {
    width: contentWidth,
    align: 'center',
});

doc.moveDown(0.3);
doc.font(FONT_BOLD).fontSize(13);
doc.text('o sposobnosti za sportsko takmičenje', {
    width: contentWidth,
    align: 'center',
});

// Horizontal line under header
doc.moveDown(0.8);
const lineY1 = doc.y;
doc.moveTo(leftMargin, lineY1)
    .lineTo(pageWidth - rightMargin, lineY1)
    .lineWidth(1)
    .strokeColor('#000000')
    .stroke();

doc.moveDown(1.5);

// --- BODY ---
doc.font(FONT_REGULAR).fontSize(11);

const lineHeight = 16;
let y = doc.y;

const writeLine = (label, value, opts = {}) => {
    const labelText = label;
    doc.font(FONT_BOLD).fontSize(11).text(labelText, leftMargin, y, {
        continued: true,
        lineGap: 4,
    });
    doc.font(FONT_REGULAR).text(' ' + value, {
        lineGap: 4,
    });
    y = doc.y + (opts.extraGap || 0);
};

writeLine('Ime i prezime:', 'Marko Marković');
writeLine('Datum rođenja:', '01.03.2010.');
writeLine('JMB:', '0103010250001');
writeLine('Adresa:', 'Bulevar Demo 1, Podgorica');
writeLine('Škola:', 'OŠ Demo Škola');
writeLine('Razred:', '8-2');
writeLine('Sport:', 'Stoni tenis', { extraGap: 8 });

writeLine('Datum izdavanja:', '31.12.2026.');
writeLine('Datum isteka:   ', '31.12.2027.', { extraGap: 12 });

// Nalaz section
doc.font(FONT_BOLD).fontSize(11).text('Nalaz:', leftMargin, y, { lineGap: 4 });
y = doc.y + 4;

doc.font(FONT_REGULAR).fontSize(11);
const nalazText =
    'Na osnovu izvršenog opšteg fizičkog pregleda, antropometrijskih ' +
    'mjerenja, kardiovaskularnog testa i pregleda lokomotornog sistema, ' +
    'imenovani je SPOSOBAN za bavljenje sportom — stoni tenis — ' +
    'u rekreativnom i takmičarskom obliku.';
doc.text(nalazText, leftMargin, y, {
    width: contentWidth,
    align: 'justify',
    lineGap: 3,
});

doc.moveDown(0.8);

doc.font(FONT_BOLD).text('Posebne napomene: ', { continued: true });
doc.font(FONT_REGULAR).text('nema kontraindikacija.');

// --- FOOTER ---
// Position footer near the bottom of the page
const footerTopY = 670;

// Horizontal line above footer
doc.moveTo(leftMargin, footerTopY)
    .lineTo(pageWidth - rightMargin, footerTopY)
    .lineWidth(0.8)
    .strokeColor('#000000')
    .stroke();

const footerStartY = footerTopY + 18;
doc.font(FONT_ITALIC).fontSize(10);

const footerLines = [
    { text: 'Dr. Jovana Vuković', bold: true },
    { text: 'Specijalista sportske medicine' },
    { text: 'Klinički centar Crne Gore' },
    { text: 'Podgorica, 31.12.2026.' },
];

let fy = footerStartY;
for (const line of footerLines) {
    doc.font(line.bold ? FONT_BOLD : FONT_ITALIC).fontSize(10);
    doc.text(line.text, leftMargin, fy, {
        width: contentWidth,
        align: 'right',
    });
    fy = doc.y + 2;
}

fy += 18;
doc.font(FONT_REGULAR).fontSize(10);
doc.text('___________________________', leftMargin, fy, {
    width: contentWidth,
    align: 'right',
});
fy = doc.y + 2;
doc.font(FONT_ITALIC).fontSize(10);
doc.text('Potpis i pečat', leftMargin, fy, {
    width: contentWidth,
    align: 'right',
});

doc.end();

stream.on('finish', () => {
    const stat = fs.statSync(outPath);
    console.log('OK: ' + outPath);
    console.log('Size: ' + stat.size + ' bytes (' + (stat.size / 1024).toFixed(1) + ' KB)');
});

stream.on('error', (err) => {
    console.error('ERROR writing PDF:', err);
    process.exitCode = 1;
});
