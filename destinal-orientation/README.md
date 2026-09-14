# Destinal Orientation

A self-authoring career guidance programme for Zambian Form 3/4 students, built around
the Seven Orientations of Destiny (Order, Form, Coordination, Discovery, Integration,
Preservation, Transformation).

This app is fully independent of anything else in this repository — it lives entirely
under this `destinal-orientation/` folder and is deployed on its own via GitHub Pages.

## Structure

- `data/vocations.json` — the seven orientation profiles, calling/shadow framing, and Zambian-context pathways
- `data/questions.json` — the Likert (1-5) question bank, tagged by orientation
- `data/scoring-rules.json` — the scoring spec (sum, normalize, classify dominant/secondary/shadow)
- `src/scoring.js` — pure JS scoring engine implementing `scoring-rules.json`; works in both the browser and Node
- `src/app.js` + `index.html` — the static, mobile-first quiz web app (no build step, no framework)
- `scripts/generate-pdf.js` — generates a print-ready, seminar-grade self-scoring workbook PDF from the same data files (custom typography, a wheel diagram, per-orientation icons/colors, a table of contents)
- `assets/fonts/` — Lora and Nunito Sans (SIL Open Font License), embedded in the generated PDF for consistent typography regardless of what's installed on the machine that opens it
- `output/` — where the generated PDF is written (not committed; regenerate with `npm run generate-pdf`)

## Running the web app locally

Data is loaded with `fetch`, which needs an HTTP server (not `file://`):

```
npm run serve
```

Then open the printed URL (defaults to http://localhost:8080).

## Generating the PDF workbook

```
npm install
npm run generate-pdf
```

This writes `output/destinal-orientation-workbook.pdf`.

## Deployment

`.github/workflows/deploy-destinal-orientation.yml` (at the repo root) builds and deploys
this folder to GitHub Pages whenever changes under `destinal-orientation/` are pushed to `main`.
