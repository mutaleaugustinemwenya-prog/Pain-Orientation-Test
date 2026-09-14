/**
 * Generates a print-ready, seminar-grade self-scoring workbook PDF for
 * Pathway Orientation. Reads the same data/questions.json and
 * data/vocations.json used by the web app, plus data/scoring-rules.json
 * for the scoring formula, so the paper workbook and the web app always
 * agree.
 *
 * Usage: node scripts/generate-pdf.js
 * Output: output/pathway-orientation-workbook.pdf
 */
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ROOT = path.join(__dirname, "..");
const FONT_DIR = path.join(ROOT, "assets/fonts");
const questionsData = JSON.parse(fs.readFileSync(path.join(ROOT, "data/questions.json"), "utf8"));
const vocationsData = JSON.parse(fs.readFileSync(path.join(ROOT, "data/vocations.json"), "utf8"));
const scoringRules = JSON.parse(fs.readFileSync(path.join(ROOT, "data/scoring-rules.json"), "utf8"));

const OUTPUT_DIR = path.join(ROOT, "output");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const OUTPUT_PATH = path.join(OUTPUT_DIR, "pathway-orientation-workbook.pdf");

// ---------------------------------------------------------------------
// Design system
// ---------------------------------------------------------------------
const INK = "#221F1A";
const MUTED = "#6E6858";
const FAINT = "#9C9585";
const PAPER = "#FFFDF9";
const CREAM = "#F6EFE1";
const BORDER = "#E1D6BE";
const ROW_BAND = "#FBF6EC";
const BRAND = "#A8632C";
const BRAND_DARK = "#7C481E";

const ORIENTATION_COLOR = {
  order: "#3B5F86",
  form: "#8C3F72",
  coordination: "#2F7D6E",
  discovery: "#C1631F",
  integration: "#9C7A26",
  preservation: "#3D6B45",
  transformation: "#5B4090"
};

const ORIENTATION_ICON = {
  order: "square",
  form: "star",
  coordination: "venn",
  discovery: "compass",
  integration: "target",
  preservation: "shield",
  transformation: "spiral"
};

const PAGE_MARGIN = 56;
const CONTENT_TOP = 92;
const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;

const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, bufferPages: true });
doc.pipe(fs.createWriteStream(OUTPUT_PATH));

// ---------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------
doc.registerFont("Serif", path.join(FONT_DIR, "Lora-Regular.ttf"));
doc.registerFont("Serif-Medium", path.join(FONT_DIR, "Lora-Medium.ttf"));
doc.registerFont("Serif-Semibold", path.join(FONT_DIR, "Lora-SemiBold.ttf"));
doc.registerFont("Serif-Bold", path.join(FONT_DIR, "Lora-Bold.ttf"));
doc.registerFont("Serif-Italic", path.join(FONT_DIR, "Lora-Italic.ttf"));
doc.registerFont("Sans", path.join(FONT_DIR, "NunitoSans-Regular.ttf"));
doc.registerFont("Sans-Semibold", path.join(FONT_DIR, "NunitoSans-SemiBold.ttf"));
doc.registerFont("Sans-Bold", path.join(FONT_DIR, "NunitoSans-Bold.ttf"));
doc.registerFont("Sans-ExtraBold", path.join(FONT_DIR, "NunitoSans-ExtraBold.ttf"));

// ---------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------
function h1(text, opts) {
  doc
    .fillColor(INK)
    .font("Serif-Bold")
    .fontSize((opts && opts.size) || 22)
    .text(text, Object.assign({ align: "left" }, opts || {}));
  doc.moveDown(0.35);
}

function h2(text, opts) {
  doc
    .fillColor((opts && opts.color) || BRAND_DARK)
    .font("Serif-Semibold")
    .fontSize((opts && opts.size) || 13.5)
    .text(text, Object.assign({ align: "left" }, opts || {}));
  doc.moveDown(0.2);
}

function label(text, opts) {
  doc
    .fillColor((opts && opts.color) || MUTED)
    .font("Sans-Bold")
    .fontSize((opts && opts.size) || 8.6)
    .text(String(text).toUpperCase(), Object.assign({ align: "left", characterSpacing: 0.6 }, opts || {}));
  doc.moveDown(0.12);
}

function body(text, opts) {
  doc
    .fillColor(INK)
    .font("Sans")
    .fontSize((opts && opts.size) || 10.3)
    .text(text, Object.assign({ align: "left", lineGap: 2.4 }, opts || {}));
}

function muted(text, opts) {
  doc
    .fillColor(MUTED)
    .font("Serif-Italic")
    .fontSize((opts && opts.size) || 9.8)
    .text(text, Object.assign({ align: "left", lineGap: 1.5 }, opts || {}));
}

function ensureSpace(neededHeight) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + neededHeight > bottom) {
    addContentPage(currentSection);
  }
}

// Writing text/shapes at an explicit y within a few points of the page's
// bottom margin makes PDFKit silently start a new page underneath the
// call. Anything drawn in the footer/margin band must go through this so
// that behaviour can't sneak in.
function drawInBottomMargin(fn) {
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  fn();
  doc.page.margins.bottom = originalBottomMargin;
}

// ---------------------------------------------------------------------
// Icon drawing (small vector glyphs, no external assets needed)
// ---------------------------------------------------------------------
function starPoints(cx, cy, outerR, innerR, points) {
  const pts = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + i * step;
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return pts;
}

function drawIcon(orientationId, x, y, size, color) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const kind = ORIENTATION_ICON[orientationId];
  doc.save();

  if (kind === "square") {
    const s = size * 0.72;
    doc
      .lineWidth(size * 0.09)
      .strokeColor(color)
      .rect(cx - s / 2, cy - s / 2, s, s)
      .stroke();
    doc
      .lineWidth(size * 0.045)
      .moveTo(cx - s / 2, cy)
      .lineTo(cx + s / 2, cy)
      .moveTo(cx, cy - s / 2)
      .lineTo(cx, cy + s / 2)
      .stroke();
  } else if (kind === "star") {
    const pts = starPoints(cx, cy, size * 0.48, size * 0.19, 5);
    doc.fillColor(color).polygon(...pts).fill();
  } else if (kind === "venn") {
    const r = size * 0.3;
    const off = r * 0.62;
    doc.fillOpacity(0.62).fillColor(color);
    doc.circle(cx, cy - off, r).fill();
    doc.circle(cx - off * 0.92, cy + off * 0.55, r).fill();
    doc.circle(cx + off * 0.92, cy + off * 0.55, r).fill();
    doc.fillOpacity(1);
  } else if (kind === "compass") {
    doc
      .lineWidth(size * 0.06)
      .strokeColor(color)
      .circle(cx, cy, size * 0.42)
      .stroke();
    doc
      .fillColor(color)
      .moveTo(cx, cy - size * 0.32)
      .lineTo(cx + size * 0.1, cy)
      .lineTo(cx, cy + size * 0.32)
      .lineTo(cx - size * 0.1, cy)
      .closePath()
      .fill();
    doc.circle(cx, cy, size * 0.035).fill();
  } else if (kind === "target") {
    doc
      .lineWidth(size * 0.06)
      .strokeColor(color)
      .circle(cx, cy, size * 0.42)
      .stroke();
    doc.lineWidth(size * 0.055).circle(cx, cy, size * 0.26).stroke();
    doc.fillColor(color).circle(cx, cy, size * 0.1).fill();
  } else if (kind === "shield") {
    const r = size * 0.44;
    const pts = [
      [cx - r * 0.78, cy - r * 0.85],
      [cx + r * 0.78, cy - r * 0.85],
      [cx + r * 0.78, cy + r * 0.15],
      [cx, cy + r],
      [cx - r * 0.78, cy + r * 0.15]
    ];
    doc.fillColor(color).polygon(...pts).fill();
  } else if (kind === "spiral") {
    const maxR = size * 0.44;
    const steps = 56;
    const turns = 1.7;
    doc.lineWidth(size * 0.09).strokeColor(color).lineCap("round");
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * 2 * Math.PI - Math.PI / 2;
      const r = maxR * (0.12 + 0.88 * (1 - t));
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) doc.moveTo(px, py);
      else doc.lineTo(px, py);
    }
    doc.stroke();
  }

  doc.restore();
}

function pieSlice(cx, cy, outerR, innerR, startAngle, endAngle, color) {
  const steps = 28;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + (endAngle - startAngle) * (i / steps);
    pts.push([cx + outerR * Math.cos(a), cy + outerR * Math.sin(a)]);
  }
  for (let i = steps; i >= 0; i--) {
    const a = startAngle + (endAngle - startAngle) * (i / steps);
    pts.push([cx + innerR * Math.cos(a), cy + innerR * Math.sin(a)]);
  }
  doc.fillColor(color).polygon(...pts).fill();
}

// ---------------------------------------------------------------------
// Page scaffolding: running header + section tracking for auto page breaks
// ---------------------------------------------------------------------
let currentSection = "";
const tocEntries = [];

function drawRunningHeader(title) {
  drawInBottomMargin(function () {}); // no-op, kept for symmetry/clarity
  doc
    .fillColor(FAINT)
    .font("Sans-Bold")
    .fontSize(7.6)
    .text("PATHWAY ORIENTATION", PAGE_MARGIN, 34, { characterSpacing: 1.2 });
  doc
    .fillColor(FAINT)
    .font("Sans-Bold")
    .fontSize(7.6)
    .text(String(title || "").toUpperCase(), PAGE_MARGIN, 34, {
      width: PAGE_W - PAGE_MARGIN * 2,
      align: "right",
      characterSpacing: 1.2
    });
  doc
    .strokeColor(BORDER)
    .lineWidth(0.75)
    .moveTo(PAGE_MARGIN, 50)
    .lineTo(PAGE_W - PAGE_MARGIN, 50)
    .stroke();
  doc.x = PAGE_MARGIN;
  doc.y = CONTENT_TOP;
}

function addContentPage(sectionTitle) {
  doc.addPage();
  currentSection = sectionTitle || currentSection;
  drawRunningHeader(currentSection);
}

function sectionOpener(sectionTitle, tocLabel) {
  addContentPage(sectionTitle);
  const pageNum = doc.bufferedPageRange().count; // 1-indexed physical page
  if (tocLabel) tocEntries.push({ label: tocLabel, page: pageNum, indent: false });
  return pageNum;
}

// ---------------------------------------------------------------------
// Cover
// ---------------------------------------------------------------------
doc.rect(0, 0, PAGE_W, PAGE_H).fill(CREAM);

// Decorative ring of small dots, one per orientation colour
(function drawCoverMotif() {
  const cx = PAGE_W / 2;
  const cy = 210;
  const R = 64;
  const ids = vocationsData.canonicalOrder;
  ids.forEach(function (id, i) {
    const angle = -Math.PI / 2 + (i / ids.length) * Math.PI * 2;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    doc.fillColor(ORIENTATION_COLOR[id]).circle(x, y, 8).fill();
  });
  doc.fillColor(PAPER).circle(cx, cy, 34).fill();
  doc.lineWidth(1.5).strokeColor(BRAND).circle(cx, cy, 34).stroke();
  doc
    .fillColor(BRAND_DARK)
    .font("Serif-Bold")
    .fontSize(15)
    .text("7", cx - 20, cy - 12, { width: 40, align: "center" });
})();

doc
  .fillColor(BRAND)
  .font("Serif-Bold")
  .fontSize(34)
  .text("Pathway Orientation", 0, 320, { align: "center", width: PAGE_W });
doc
  .fillColor(INK)
  .font("Serif-Italic")
  .fontSize(15)
  .text("Find your path among the Seven Orientations", 0, 366, {
    align: "center",
    width: PAGE_W
  });

doc
  .strokeColor(BRAND)
  .lineWidth(1)
  .moveTo(PAGE_W / 2 - 60, 402)
  .lineTo(PAGE_W / 2 + 60, 402)
  .stroke();

doc
  .fillColor(MUTED)
  .font("Sans")
  .fontSize(11)
  .text(
    "A self-scoring workbook for Form 3 and Form 4 students — discover your dominant, secondary and shadow orientation using nothing but a pen.",
    PAGE_W / 2 - 190,
    422,
    { width: 380, align: "center", lineGap: 3 }
  );

doc
  .fillColor(FAINT)
  .font("Sans-Bold")
  .fontSize(9)
  .text("SEMINAR & FACILITATOR EDITION", 0, PAGE_H - 96, {
    align: "center",
    width: PAGE_W,
    characterSpacing: 1.4
  });
doc
  .fillColor(FAINT)
  .font("Sans")
  .fontSize(9)
  .text("Order · Form · Coordination · Discovery · Integration · Preservation · Transformation", 0, PAGE_H - 78, {
    align: "center",
    width: PAGE_W
  });

// ---------------------------------------------------------------------
// Table of contents (filled in at the very end, once page numbers are known)
// ---------------------------------------------------------------------
doc.addPage();
const TOC_PAGE_INDEX = doc.bufferedPageRange().count - 1;
drawRunningHeader("Contents");
h1("Contents");

// ---------------------------------------------------------------------
// Introduction + how the result works
// ---------------------------------------------------------------------
sectionOpener("Introduction", "Introduction");
h1("Welcome");
body(vocationsData.intro);
doc.moveDown(1);

label("How your result works");
doc.moveDown(0.3);

(function drawThreeRingDiagram() {
  const cx = PAGE_MARGIN + 80;
  const cy = doc.y + 80;
  doc.fillColor("#EDE3CE").circle(cx, cy, 78).fill();
  doc.fillColor("#DCC9A0").circle(cx, cy, 52).fill();
  doc.fillColor(BRAND).circle(cx, cy, 26).fill();
  doc.fillColor(PAPER).font("Sans-Bold").fontSize(8).text("DOMINANT", cx - 30, cy - 4, { width: 60, align: "center" });

  const textX = PAGE_MARGIN + 190;
  const textW = PAGE_W - PAGE_MARGIN - textX;
  doc.fillColor(INK).font("Sans-Bold").fontSize(10).text("Dominant — leads", textX, cy - 78, { width: textW });
  doc.fillColor(MUTED).font("Sans").fontSize(9.3).text("The orientation you lean on most. This is where your calling is loudest.", textX, doc.y, { width: textW, lineGap: 2 });

  doc.fillColor(INK).font("Sans-Bold").fontSize(10).text("Secondary — supports", textX, cy - 22, { width: textW });
  doc.fillColor(MUTED).font("Sans").fontSize(9.3).text("The orientation that backs up your dominant one and rounds out how you work.", textX, doc.y, { width: textW, lineGap: 2 });

  doc.fillColor(INK).font("Sans-Bold").fontSize(10).text("Shadow — quiet, not broken", textX, cy + 34, { width: textW });
  doc.fillColor(MUTED).font("Sans").fontSize(9.3).text("The orientation that is quietest in you right now. Not a flaw — simply the direction you have leaned on least.", textX, doc.y, { width: textW, lineGap: 2 });

  doc.y = cy + 100;
})();

// ---------------------------------------------------------------------
// The seven orientations at a glance (wheel + summary table)
// ---------------------------------------------------------------------
sectionOpener("The Seven Orientations at a Glance", "The Seven Orientations at a Glance");
h1("The Seven Orientations at a Glance", { size: 19 });
muted("Everyone carries all seven. What differs is which ones lead, which support, and which stay quiet.");
doc.moveDown(0.6);

(function drawWheel() {
  const cx = PAGE_W / 2;
  const cy = doc.y + 118;
  const outerR = 84;
  const innerR = 34;
  const ids = vocationsData.canonicalOrder;
  const orientationById = {};
  vocationsData.orientations.forEach(function (o) {
    orientationById[o.id] = o;
  });
  const sliceAngle = (2 * Math.PI) / ids.length;

  ids.forEach(function (id, i) {
    const start = -Math.PI / 2 + i * sliceAngle;
    const end = start + sliceAngle * 0.92; // small gap between slices
    pieSlice(cx, cy, outerR, innerR, start, end, ORIENTATION_COLOR[id]);
  });

  doc.fillColor(PAPER).circle(cx, cy, innerR - 4).fill();
  doc.fillColor(BRAND_DARK).font("Serif-Semibold").fontSize(9).text("SEVEN\nORIENTATIONS", cx - 40, cy - 14, { width: 80, align: "center", lineGap: 1 });

  const labelR = outerR + 46;
  ids.forEach(function (id, i) {
    const mid = -Math.PI / 2 + i * sliceAngle + sliceAngle * 0.46;
    const edgeX = cx + outerR * Math.cos(mid);
    const edgeY = cy + outerR * Math.sin(mid);
    const labelX = cx + labelR * Math.cos(mid);
    const labelY = cy + labelR * Math.sin(mid);

    doc.strokeColor(ORIENTATION_COLOR[id]).lineWidth(1).moveTo(edgeX, edgeY).lineTo(labelX, labelY).stroke();

    const rightSide = Math.cos(mid) >= -0.05;
    const boxW = 118;
    const iconSize = 15;
    const boxX = rightSide ? labelX : labelX - boxW;
    drawIcon(id, rightSide ? boxX : boxX + boxW - iconSize, labelY - iconSize / 2, iconSize, ORIENTATION_COLOR[id]);

    const textX = rightSide ? boxX + iconSize + 5 : boxX;
    const textW = boxW - iconSize - 5;
    doc
      .fillColor(INK)
      .font("Sans-Bold")
      .fontSize(8.4)
      .text(orientationById[id].archetype, textX, labelY - 10, {
        width: textW,
        align: rightSide ? "left" : "right"
      });
  });

  doc.y = cy + outerR + 96;
})();

doc.moveDown(0.4);
label("At a glance");
doc.moveDown(0.2);
vocationsData.canonicalOrder.forEach(function (id) {
  const v = vocationsData.orientations.filter(function (o) {
    return o.id === id;
  })[0];
  ensureSpace(30);
  const rowTop = doc.y;
  doc.fillColor(ORIENTATION_COLOR[id]).rect(PAGE_MARGIN, rowTop + 2, 3, 22).fill();
  drawIcon(id, PAGE_MARGIN + 10, rowTop, 20, ORIENTATION_COLOR[id]);
  doc
    .fillColor(INK)
    .font("Sans-Bold")
    .fontSize(9.6)
    .text(v.name + " — " + v.archetype, PAGE_MARGIN + 36, rowTop + 1, { width: 150 });
  doc
    .fillColor(MUTED)
    .font("Sans")
    .fontSize(9)
    .text(v.essence, PAGE_MARGIN + 190, rowTop + 1, { width: PAGE_W - PAGE_MARGIN * 2 - 190, lineGap: 1.5 });
  doc.y = Math.max(doc.y, rowTop + 26);
});

// ---------------------------------------------------------------------
// How to use this workbook
// ---------------------------------------------------------------------
sectionOpener("How to Use This Workbook", "How to Use This Workbook");
h1("How to use this workbook");
body(questionsData.instructions);
doc.moveDown(0.7);

label("The scale");
doc.moveDown(0.3);
(function drawScaleLegend() {
  const startX = PAGE_MARGIN;
  const chipW = (PAGE_W - PAGE_MARGIN * 2 - 4 * 8) / 5;
  const y = doc.y;
  questionsData.scale.forEach(function (opt, i) {
    const x = startX + i * (chipW + 8);
    const shade = 0.35 + (opt.value / 5) * 0.65;
    doc
      .fillColor(BRAND)
      .fillOpacity(shade)
      .roundedRect(x, y, chipW, 46, 6)
      .fill();
    doc.fillOpacity(1);
    doc.fillColor(PAPER).font("Sans-ExtraBold").fontSize(15).text(String(opt.value), x, y + 7, { width: chipW, align: "center" });
    doc.fillColor(PAPER).font("Sans-Semibold").fontSize(6.6).text(opt.label, x + 4, y + 27, { width: chipW - 8, align: "center", lineGap: 1 });
  });
  doc.y = y + 58;
})();

doc.moveDown(0.5);
label("Steps");
doc.moveDown(0.2);
[
  "Go through every question and tick ONE box (1–5) for each statement.",
  "When you reach the back of this workbook, use the Scoring Key to see which orientation each question belongs to.",
  "Add up your ticked numbers for each orientation to get a raw score.",
  "Use the Score Lookup Table to turn each raw score into a percentage.",
  "Your highest percentage is your Dominant orientation, your second-highest is your Secondary orientation, and your lowest is your Shadow orientation."
].forEach(function (step, i) {
  ensureSpace(26);
  const y = doc.y;
  doc.fillColor(BRAND).circle(PAGE_MARGIN + 8, y + 7, 8).fill();
  doc.fillColor(PAPER).font("Sans-Bold").fontSize(8.5).text(String(i + 1), PAGE_MARGIN, y, { width: 16, align: "center" });
  doc.fillColor(INK).font("Sans").fontSize(10).text(step, PAGE_MARGIN + 24, y - 1, { width: PAGE_W - PAGE_MARGIN * 2 - 24, lineGap: 2 });
  doc.moveDown(0.35);
});

doc.moveDown(0.4);
muted("Tip: it helps to answer quickly, with the first honest answer that comes to mind, rather than overthinking each statement.");

// ---------------------------------------------------------------------
// Question pages
// ---------------------------------------------------------------------
sectionOpener("Questions", "Questions");
h1("Questions", { size: 19 });
muted("Tick one box per statement. There are no right or wrong answers.");
doc.moveDown(0.5);

const scaleValues = questionsData.scale.map(function (s) {
  return s.value;
});
const colWidth = 25;
const boxSize = 13;
const rightBlockWidth = colWidth * scaleValues.length;
const textWidth = PAGE_W - PAGE_MARGIN * 2 - rightBlockWidth - 16;

function drawScaleColumnLegend() {
  const startX = PAGE_W - PAGE_MARGIN - rightBlockWidth;
  const y = doc.y;
  let x = startX;
  doc.font("Sans-Bold").fontSize(8).fillColor(MUTED);
  scaleValues.forEach(function (v) {
    doc.text(String(v), x, y, { width: colWidth, align: "center" });
    x += colWidth;
  });
  doc.y = y + 12;
  doc.moveDown(0.7);
}

drawScaleColumnLegend();

questionsData.questions.forEach(function (q, idx) {
  ensureSpace(42);
  const rowTop = doc.y;
  const number = idx + 1;

  if (idx % 2 === 0) {
    doc.fillColor(ROW_BAND).rect(PAGE_MARGIN - 6, rowTop - 3, PAGE_W - (PAGE_MARGIN - 6) * 2, 30).fill();
  }

  doc
    .font("Sans")
    .fontSize(10)
    .fillColor(INK)
    .text(number + ".  " + q.text, PAGE_MARGIN, rowTop, { width: textWidth, lineGap: 1.5 });

  const textBottom = doc.y;
  const rowHeight = Math.max(textBottom - rowTop, boxSize + 6);

  const boxY = rowTop + (rowHeight - boxSize) / 2 - 2;
  let boxX = PAGE_W - PAGE_MARGIN - rightBlockWidth;
  scaleValues.forEach(function () {
    doc
      .roundedRect(boxX + (colWidth - boxSize) / 2, boxY, boxSize, boxSize, 3)
      .strokeColor(BORDER)
      .lineWidth(1.1)
      .stroke();
    boxX += colWidth;
  });

  doc.y = rowTop + Math.max(rowHeight, 26) + 8;

  if ((idx + 1) % 9 === 0 && idx !== questionsData.questions.length - 1) {
    addContentPage("Questions (continued)");
    h1("Questions", { size: 16 });
    muted("(continued)");
    doc.moveDown(0.4);
    drawScaleColumnLegend();
  }
});

// ---------------------------------------------------------------------
// Scoring key
// ---------------------------------------------------------------------
sectionOpener("Scoring Key", "Scoring Key");
h1("Scoring key");
body(
  "Find each question number below and note which orientation it belongs to. Then add up your ticked scores (1–5) for every question that shares the same orientation."
);
doc.moveDown(0.6);

const orientationById = {};
vocationsData.orientations.forEach(function (o) {
  orientationById[o.id] = o;
});

scoringRules.orientations.forEach(function (orientationId) {
  ensureSpace(58);
  const vocation = orientationById[orientationId];
  const color = ORIENTATION_COLOR[orientationId];
  const relatedQuestions = questionsData.questions
    .map(function (q, i) {
      return { num: i + 1, q: q };
    })
    .filter(function (item) {
      return item.q.orientation === orientationId;
    });

  const rowTop = doc.y;
  doc.fillColor(color).rect(PAGE_MARGIN, rowTop, 3, 44).fill();
  drawIcon(orientationId, PAGE_MARGIN + 12, rowTop + 2, 22, color);
  doc
    .fillColor(color)
    .font("Serif-Semibold")
    .fontSize(12.5)
    .text(vocation.name + " (" + vocation.archetype + ")", PAGE_MARGIN + 44, rowTop, {
      width: PAGE_W - PAGE_MARGIN * 2 - 44
    });

  const chipStartX = PAGE_MARGIN + 44;
  let chipX = chipStartX;
  let chipY = doc.y + 3;
  const chipH = 15;
  doc.font("Sans-Semibold").fontSize(8);
  relatedQuestions.forEach(function (item) {
    const w = doc.widthOfString(String(item.num)) + 10;
    if (chipX + w > PAGE_W - PAGE_MARGIN) {
      chipX = chipStartX;
      chipY += chipH + 4;
    }
    doc.fillColor(color).fillOpacity(0.14).roundedRect(chipX, chipY, w, chipH, 3).fill();
    doc.fillOpacity(1);
    doc.fillColor(color).text(String(item.num), chipX, chipY + 3.5, { width: w, align: "center" });
    chipX += w + 5;
  });

  doc.y = chipY + chipH + 4;
  doc
    .fillColor(MUTED)
    .font("Sans")
    .fontSize(8.6)
    .text(
      "Raw score = sum of your ticks for these " +
        relatedQuestions.length +
        " questions (range " +
        relatedQuestions.length * scoringRules.scale.min +
        "–" +
        relatedQuestions.length * scoringRules.scale.max +
        ").",
      PAGE_MARGIN + 44,
      doc.y,
      { width: PAGE_W - PAGE_MARGIN * 2 - 44 }
    );
  doc.y = Math.max(doc.y, rowTop + 44) + 10;
});

// ---------------------------------------------------------------------
// Score lookup table
// ---------------------------------------------------------------------
sectionOpener("Score Lookup Table", "Score Lookup Table");
h1("Score lookup table");

const countPerOrientation = questionsData.questions.filter(function (q) {
  return q.orientation === scoringRules.orientations[0];
}).length;
const minSum = countPerOrientation * scoringRules.scale.min;
const maxSum = countPerOrientation * scoringRules.scale.max;

body(
  "Every orientation in this workbook has " +
    countPerOrientation +
    " questions, so your raw score for each will fall between " +
    minSum +
    " and " +
    maxSum +
    ". Find your raw score below and read off the percentage next to it — for all seven orientations."
);
doc.moveDown(0.6);

function normalizedPercent(sum) {
  const pct = ((sum - minSum) / (maxSum - minSum)) * 100;
  return Math.round(pct);
}

(function drawLookupTable() {
  const cols = 3;
  const colGap = 16;
  const rowsPerColumn = Math.ceil((maxSum - minSum + 1) / cols);
  const tableColWidth = (PAGE_W - PAGE_MARGIN * 2 - colGap * (cols - 1)) / cols;
  const rowH = 15.5;
  const tableTop = doc.y;

  for (let c = 0; c < cols; c++) {
    const x = PAGE_MARGIN + c * (tableColWidth + colGap);
    doc.fillColor(BRAND).roundedRect(x, tableTop, tableColWidth, 18, 3).fill();
    doc.fillColor(PAPER).font("Sans-Bold").fontSize(8.4).text("RAW SCORE   ->   PERCENT", x, tableTop + 5, { width: tableColWidth, align: "center" });
  }

  const rowsStartY = tableTop + 24;
  for (let sum = minSum; sum <= maxSum; sum++) {
    const idxInFull = sum - minSum;
    const col = Math.floor(idxInFull / rowsPerColumn);
    const rowInCol = idxInFull % rowsPerColumn;
    const x = PAGE_MARGIN + col * (tableColWidth + colGap);
    const y = rowsStartY + rowInCol * rowH;

    if (rowInCol % 2 === 0) {
      doc.fillColor(ROW_BAND).rect(x, y - 2, tableColWidth, rowH).fill();
    }
    doc
      .font("Sans-Semibold")
      .fontSize(9)
      .fillColor(INK)
      .text(String(sum), x + 8, y, { width: tableColWidth * 0.4, align: "left" });
    doc
      .font("Sans")
      .fontSize(9)
      .fillColor(BRAND_DARK)
      .text(normalizedPercent(sum) + "%", x, y, { width: tableColWidth - 8, align: "right" });
  }

  doc.y = rowsStartY + rowsPerColumn * rowH + 14;
})();

label("Working out your result");
doc.moveDown(0.25);
[
  "Write your three raw scores' percentages next to each orientation name.",
  "The orientation with the HIGHEST percentage is your Dominant orientation.",
  "The orientation with the SECOND-HIGHEST percentage is your Secondary orientation.",
  "The orientation with the LOWEST percentage is your Shadow orientation.",
  "If two orientations are tied, give priority to whichever one comes first in this order: " +
    scoringRules.orientations
      .map(function (id) {
        return orientationById[id].name;
      })
      .join(" > ") +
    "."
].forEach(function (line) {
  body("•  " + line, { indent: 0 });
});

// ---------------------------------------------------------------------
// Results interpretation
// ---------------------------------------------------------------------
sectionOpener("What Your Result Means", "What Your Result Means");
h1("What your result means");
body(
  "Once you know your Dominant, Secondary and Shadow orientation, turn to the matching section below. Read your Dominant section fully, your Secondary section for how it supports you, and your Shadow section gently — it is not a weakness, just the quietest part of you right now."
);

vocationsData.canonicalOrder.forEach(function (orientationId) {
  const v = orientationById[orientationId];
  const color = ORIENTATION_COLOR[orientationId];
  const pageNum = sectionOpener(v.name + " Profile");
  tocEntries.push({ label: v.name + " — " + v.archetype, page: pageNum, indent: true });

  // Header band
  const bandH = 74;
  doc.fillColor(color).rect(PAGE_MARGIN - 6, doc.y - 6, PAGE_W - (PAGE_MARGIN - 6) * 2, bandH).fill();
  drawIcon(orientationId, PAGE_MARGIN + 10, doc.y + 10, 40, PAPER);
  doc
    .fillColor(PAPER)
    .font("Serif-Bold")
    .fontSize(18)
    .text(v.name, PAGE_MARGIN + 62, doc.y - 2, { width: PAGE_W - PAGE_MARGIN * 2 - 62 });
  doc
    .fillColor(PAPER)
    .fillOpacity(0.9)
    .font("Sans-Semibold")
    .fontSize(11)
    .text(v.archetype, PAGE_MARGIN + 62, doc.y + 2, { width: PAGE_W - PAGE_MARGIN * 2 - 62 });
  doc.fillOpacity(1);
  doc.y += bandH - 34;

  doc.moveDown(0.6);
  muted(v.essence);
  doc.moveDown(0.4);

  if (v.resonantFigure) {
    const noteTop = doc.y;
    doc.fillColor(color).fillOpacity(0.08).roundedRect(PAGE_MARGIN, noteTop, PAGE_W - PAGE_MARGIN * 2, 30, 6).fill();
    doc.fillOpacity(1);
    doc
      .fillColor(BRAND_DARK)
      .font("Serif-Italic")
      .fontSize(9.4)
      .text("Think of " + v.resonantFigure.name + " — " + v.resonantFigure.note + ".", PAGE_MARGIN + 12, noteTop + 8, {
        width: PAGE_W - PAGE_MARGIN * 2 - 24
      });
    doc.y = noteTop + 38;
  }
  doc.moveDown(0.3);

  h2("If this is your Dominant orientation", { color: color, size: 11.5 });
  doc.fillColor(INK).font("Serif-Italic").fontSize(10.5).text(v.callingStatement);
  doc.moveDown(0.15);
  body(v.dominantDescription);
  doc.moveDown(0.35);

  if (v.strengths && v.strengths.length) {
    doc.fillColor(MUTED).font("Sans-Bold").fontSize(9).text("STRENGTHS", { characterSpacing: 0.5 });
    body(v.strengths.join("  ·  "), { size: 9.6 });
  }
  if (v.watchOutFor && v.watchOutFor.length) {
    doc.moveDown(0.15);
    doc.fillColor(MUTED).font("Sans-Bold").fontSize(9).text("WATCH OUT FOR", { characterSpacing: 0.5 });
    body(v.watchOutFor.join("  ·  "), { size: 9.6 });
  }
  doc.moveDown(0.45);

  h2("If this is your Secondary orientation", { color: color, size: 11.5 });
  body(v.secondaryDescription);
  doc.moveDown(0.45);

  h2("If this is your Shadow orientation", { color: color, size: 11.5 });
  body(v.shadowDescription);
  doc.moveDown(0.5);

  if (v.pathways) {
    ensureSpace(120);
    const boxTop = doc.y;
    doc.fillColor(CREAM).roundedRect(PAGE_MARGIN, boxTop, PAGE_W - PAGE_MARGIN * 2, 4, 4).fill(); // top accent shim
    doc.y = boxTop + 8;
    doc.fillColor(color).font("Sans-Bold").fontSize(10).text("PATHWAYS TO EXPLORE", { characterSpacing: 0.5 });
    doc.moveDown(0.25);

    doc.fillColor(MUTED).font("Sans-Bold").fontSize(8.6).text("Subjects to focus on");
    body(v.pathways.subjectsToFocus.join(", "), { size: 9.6 });
    doc.moveDown(0.15);

    doc.fillColor(MUTED).font("Sans-Bold").fontSize(8.6).text("Possible fields of study");
    body(v.pathways.tertiaryFields.join(", "), { size: 9.6 });
    doc.moveDown(0.15);

    doc.fillColor(MUTED).font("Sans-Bold").fontSize(8.6).text("Zambian institutions to look into");
    body(v.pathways.zambianInstitutions.join(", "), { size: 9.6 });
    doc.moveDown(0.15);

    doc.fillColor(MUTED).font("Sans-Bold").fontSize(8.6).text("Career examples");
    body(v.pathways.careerExamples.join(", "), { size: 9.6 });
  }
});

// ---------------------------------------------------------------------
// Fill in the table of contents now that every page number is known
// ---------------------------------------------------------------------
doc.switchToPage(TOC_PAGE_INDEX);
doc.x = PAGE_MARGIN;
doc.y = CONTENT_TOP + 46;
tocEntries.forEach(function (entry) {
  ensureSpace(20);
  const y = doc.y;
  const x = entry.indent ? PAGE_MARGIN + 20 : PAGE_MARGIN;
  const font = entry.indent ? "Sans" : "Sans-Bold";
  const size = entry.indent ? 9.6 : 10.6;
  doc.fillColor(entry.indent ? MUTED : INK).font(font).fontSize(size).text(entry.label, x, y, { continued: false, width: 340 });
  doc.fillColor(FAINT).font("Sans").fontSize(9).text(String(entry.page), x, y, { width: PAGE_W - PAGE_MARGIN - x, align: "right" });
  doc.moveDown(entry.indent ? 0.45 : 0.6);
});

// ---------------------------------------------------------------------
// Page numbers (skips the cover)
// ---------------------------------------------------------------------
const range = doc.bufferedPageRange();
for (let i = 1; i < range.count; i++) {
  doc.switchToPage(i);
  drawInBottomMargin(function () {
    doc.strokeColor(BORDER).lineWidth(0.75).moveTo(PAGE_MARGIN, PAGE_H - 46).lineTo(PAGE_W - PAGE_MARGIN, PAGE_H - 46).stroke();
    doc
      .font("Sans")
      .fontSize(8)
      .fillColor(FAINT)
      .text("Pathway Orientation · Self-Scoring Workbook", PAGE_MARGIN, PAGE_H - 38);
    doc
      .font("Sans-Semibold")
      .fontSize(8)
      .fillColor(FAINT)
      .text(String(i + 1), PAGE_MARGIN, PAGE_H - 38, { width: PAGE_W - PAGE_MARGIN * 2, align: "right" });
  });
}

doc.end();

doc.on("end", function () {
  console.log("PDF written to " + OUTPUT_PATH);
});
