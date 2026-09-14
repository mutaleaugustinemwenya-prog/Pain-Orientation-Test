/**
 * Generates a print-ready self-scoring workbook PDF for Destinal Orientation.
 * Reads the same data/questions.json and data/vocations.json used by the
 * web app, plus data/scoring-rules.json for the scoring formula, so the
 * paper workbook and the web app always agree.
 *
 * Usage: node scripts/generate-pdf.js
 * Output: output/destinal-orientation-workbook.pdf
 */
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ROOT = path.join(__dirname, "..");
const questionsData = JSON.parse(fs.readFileSync(path.join(ROOT, "data/questions.json"), "utf8"));
const vocationsData = JSON.parse(fs.readFileSync(path.join(ROOT, "data/vocations.json"), "utf8"));
const scoringRules = JSON.parse(fs.readFileSync(path.join(ROOT, "data/scoring-rules.json"), "utf8"));

const OUTPUT_DIR = path.join(ROOT, "output");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const OUTPUT_PATH = path.join(OUTPUT_DIR, "destinal-orientation-workbook.pdf");

const INK = "#22201b";
const MUTED = "#6b665c";
const ACCENT = "#a8632c";
const ACCENT_DARK = "#7c481e";
const BORDER = "#cfc4ac";
const PAGE_MARGIN = 56;

const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, bufferPages: true });
doc.pipe(fs.createWriteStream(OUTPUT_PATH));

function heading(text, opts) {
  doc
    .fillColor(INK)
    .font("Helvetica-Bold")
    .fontSize((opts && opts.size) || 20)
    .text(text, { align: (opts && opts.align) || "left" });
  doc.moveDown(0.4);
}

function subheading(text, opts) {
  doc
    .fillColor(ACCENT_DARK)
    .font("Helvetica-Bold")
    .fontSize((opts && opts.size) || 13)
    .text(text, { align: (opts && opts.align) || "left" });
  doc.moveDown(0.25);
}

function body(text, opts) {
  doc
    .fillColor(INK)
    .font("Helvetica")
    .fontSize((opts && opts.size) || 10.5)
    .text(text, Object.assign({ align: "left", lineGap: 2 }, opts || {}));
}

function muted(text, opts) {
  doc
    .fillColor(MUTED)
    .font("Helvetica-Oblique")
    .fontSize((opts && opts.size) || 9.5)
    .text(text, Object.assign({ align: "left" }, opts || {}));
}

function ruleLine() {
  const y = doc.y + 2;
  doc
    .strokeColor(BORDER)
    .lineWidth(0.75)
    .moveTo(PAGE_MARGIN, y)
    .lineTo(doc.page.width - PAGE_MARGIN, y)
    .stroke();
  doc.moveDown(0.6);
}

function ensureSpace(neededHeight) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + neededHeight > bottom) {
    doc.addPage();
  }
}

// ---------- Cover page ----------
doc.fontSize(28).fillColor(ACCENT).font("Helvetica-Bold").text("Destinal Orientation", { align: "center" });
doc.moveDown(0.3);
doc.fontSize(15).fillColor(INK).font("Helvetica").text("A Self-Scoring Workbook", { align: "center" });
doc.moveDown(1.2);
doc
  .fontSize(11)
  .fillColor(MUTED)
  .text(
    "This workbook helps you find your dominant, secondary and shadow orientation of destiny using pen and paper. Answer every statement honestly, then follow the scoring steps at the back to find out what your answers mean.",
    { align: "center", width: doc.page.width - PAGE_MARGIN * 2, indent: 0 }
  );
doc.moveDown(2);
doc
  .fontSize(10)
  .fillColor(MUTED)
  .text(vocationsData.intro, { align: "left", width: doc.page.width - PAGE_MARGIN * 2 });

// ---------- Instructions page ----------
doc.addPage();
heading("How to use this workbook");
body(questionsData.instructions);
doc.moveDown(0.6);
subheading("The scale");
questionsData.scale.forEach(function (opt) {
  body(opt.value + " = " + opt.label);
});
doc.moveDown(0.6);
subheading("Steps");
body("1. Go through every question and tick ONE box (1-5) for each statement.");
body("2. When you reach the back of this workbook, use the Scoring Key to see which orientation each question belongs to.");
body("3. Add up your ticked numbers for each orientation to get a raw score.");
body("4. Use the Score Lookup Table to turn each raw score into a percentage.");
body("5. Your highest percentage is your Dominant orientation, your second-highest is your Secondary orientation, and your lowest is your Shadow orientation.");
doc.moveDown(0.6);
muted("Tip: it helps to answer quickly, with the first honest answer that comes to mind, rather than overthinking each statement.");

// ---------- Question pages ----------
doc.addPage();
heading("Questions", { size: 18 });
muted("Tick one box per statement.");
doc.moveDown(0.4);

const scaleValues = questionsData.scale.map(function (s) {
  return s.value;
});
const colWidth = 24;
const boxSize = 12;
const rightBlockWidth = colWidth * scaleValues.length;
const textWidth = doc.page.width - PAGE_MARGIN * 2 - rightBlockWidth - 16;

// Column header legend, repeated at top of each question page
function drawScaleLegend() {
  const startX = doc.page.width - PAGE_MARGIN - rightBlockWidth;
  let x = startX;
  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED);
  scaleValues.forEach(function (v) {
    doc.text(String(v), x, doc.y, { width: colWidth, align: "center" });
    x += colWidth;
  });
  doc.moveDown(0.9);
}

drawScaleLegend();

questionsData.questions.forEach(function (q, idx) {
  ensureSpace(40);
  const rowTop = doc.y;
  const number = idx + 1;

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(INK)
    .text(number + ". " + q.text, PAGE_MARGIN, rowTop, { width: textWidth, lineGap: 1 });

  const textBottom = doc.y;
  const rowHeight = Math.max(textBottom - rowTop, boxSize + 4);

  const boxY = rowTop + (rowHeight - boxSize) / 2 - 2;
  let boxX = doc.page.width - PAGE_MARGIN - rightBlockWidth;
  scaleValues.forEach(function () {
    doc
      .rect(boxX + (colWidth - boxSize) / 2, boxY, boxSize, boxSize)
      .strokeColor(BORDER)
      .lineWidth(1)
      .stroke();
    boxX += colWidth;
  });

  doc.y = rowTop + rowHeight + 6;

  if ((idx + 1) % 10 === 0 && idx !== questionsData.questions.length - 1) {
    doc.addPage();
    heading("Questions (continued)", { size: 18 });
    drawScaleLegend();
  }
});

// ---------- Scoring key ----------
doc.addPage();
heading("Scoring Key");
body(
  "Find each question number below and note which orientation it belongs to. Then add up your ticked scores (1-5) for every question that shares the same orientation."
);
doc.moveDown(0.5);

const orientationById = {};
vocationsData.orientations.forEach(function (o) {
  orientationById[o.id] = o;
});

scoringRules.orientations.forEach(function (orientationId) {
  ensureSpace(70);
  const vocation = orientationById[orientationId];
  const relatedQuestions = questionsData.questions
    .map(function (q, i) {
      return { num: i + 1, q: q };
    })
    .filter(function (item) {
      return item.q.orientation === orientationId;
    });

  subheading(vocation.name + " (" + vocation.archetype + ")", { size: 12 });
  body(
    "Questions: " +
      relatedQuestions
        .map(function (item) {
          return item.num;
        })
        .join(", ")
  );
  body("Your raw score for this orientation = the sum of your ticks for those " + relatedQuestions.length + " questions (range " + relatedQuestions.length * scoringRules.scale.min + "-" + relatedQuestions.length * scoringRules.scale.max + ").");
  doc.moveDown(0.5);
});

// ---------- Score lookup table ----------
doc.addPage();
heading("Score Lookup Table");
body(
  "Every orientation in this workbook has " +
    questionsData.questions.filter(function (q) {
      return q.orientation === scoringRules.orientations[0];
    }).length +
    " questions, so your raw score for each orientation will fall between " +
    questionsData.questions.filter(function (q) {
      return q.orientation === scoringRules.orientations[0];
    }).length * scoringRules.scale.min +
    " and " +
    questionsData.questions.filter(function (q) {
      return q.orientation === scoringRules.orientations[0];
    }).length * scoringRules.scale.max +
    ". Find your raw score in the left column below, and read off your percentage on the right. Do this for all seven orientations."
);
doc.moveDown(0.5);

const countPerOrientation = questionsData.questions.filter(function (q) {
  return q.orientation === scoringRules.orientations[0];
}).length;
const minSum = countPerOrientation * scoringRules.scale.min;
const maxSum = countPerOrientation * scoringRules.scale.max;

function normalizedPercent(sum) {
  const pct = ((sum - minSum) / (maxSum - minSum)) * 100;
  return Math.round(pct);
}

const tableStartY = doc.y;
const colGap = 18;
const rowsPerColumn = Math.ceil((maxSum - minSum + 1) / 3);
const tableColWidth = (doc.page.width - PAGE_MARGIN * 2 - colGap * 2) / 3;

doc.font("Helvetica-Bold").fontSize(9.5).fillColor(MUTED);
for (let c = 0; c < 3; c++) {
  doc.text("Raw score -> %", PAGE_MARGIN + c * (tableColWidth + colGap), tableStartY, { width: tableColWidth });
}
doc.moveDown(0.4);
const rowsStartY = doc.y;

for (let sum = minSum; sum <= maxSum; sum++) {
  const idxInFull = sum - minSum;
  const col = Math.floor(idxInFull / rowsPerColumn);
  const rowInCol = idxInFull % rowsPerColumn;
  const x = PAGE_MARGIN + col * (tableColWidth + colGap);
  const y = rowsStartY + rowInCol * 14;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(INK)
    .text(sum + "  ->  " + normalizedPercent(sum) + "%", x, y, { width: tableColWidth });
}

doc.y = rowsStartY + rowsPerColumn * 14 + 10;
doc.moveDown(0.8);
subheading("Working out your result");
body("1. Write your three raw scores' percentages next to each orientation name.");
body("2. The orientation with the HIGHEST percentage is your Dominant orientation.");
body("3. The orientation with the SECOND-HIGHEST percentage is your Secondary orientation.");
body("4. The orientation with the LOWEST percentage is your Shadow orientation.");
body(
  "5. If two orientations are tied, give priority to whichever one comes first in this order: " +
    scoringRules.orientations
      .map(function (id) {
        return orientationById[id].name;
      })
      .join(" > ") +
    "."
);

// ---------- Results interpretation ----------
doc.addPage();
heading("What Your Result Means");
body(
  "Once you know your Dominant, Secondary and Shadow orientation, turn to the matching section below. Read your Dominant section fully, your Secondary section for how it supports you, and your Shadow section gently — it is not a weakness, just the quietest part of you right now."
);
doc.moveDown(0.6);

vocationsData.canonicalOrder.forEach(function (orientationId, i) {
  const v = orientationById[orientationId];
  doc.addPage();
  subheading(v.name + " — " + v.archetype, { size: 16 });
  muted(v.essence);
  doc.moveDown(0.5);

  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(ACCENT_DARK).text("If this is your Dominant orientation:");
  body(v.callingStatement);
  body(v.dominantDescription);
  doc.moveDown(0.3);

  if (v.strengths && v.strengths.length) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(MUTED).text("Strengths:");
    body(v.strengths.join(", "));
  }
  if (v.watchOutFor && v.watchOutFor.length) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(MUTED).text("Watch out for:");
    body(v.watchOutFor.join(", "));
  }
  doc.moveDown(0.4);

  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(ACCENT_DARK).text("If this is your Secondary orientation:");
  body(v.secondaryDescription);
  doc.moveDown(0.4);

  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(ACCENT_DARK).text("If this is your Shadow orientation:");
  body(v.shadowDescription);
  doc.moveDown(0.4);

  if (v.pathways) {
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(ACCENT_DARK).text("Pathways to explore:");
    body("Subjects to focus on: " + v.pathways.subjectsToFocus.join(", "));
    body("Possible fields of study: " + v.pathways.tertiaryFields.join(", "));
    body("Zambian institutions to look into: " + v.pathways.zambianInstitutions.join(", "));
    body("Career examples: " + v.pathways.careerExamples.join(", "));
  }

  if (v.resonantFigure) {
    doc.moveDown(0.3);
    muted("Think of " + v.resonantFigure.name + " — " + v.resonantFigure.note + ".");
  }
});

// ---------- Page numbers ----------
// Writing this close to the bottom edge sits outside the page's content
// margin, which makes PDFKit silently insert an extra blank page per
// stamp unless the bottom margin is temporarily cleared first.
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text(String(i + 1), 0, doc.page.height - 36, { align: "center", width: doc.page.width });
  doc.page.margins.bottom = originalBottomMargin;
}

doc.end();

doc.on("end", function () {
  console.log("PDF written to " + OUTPUT_PATH);
});
