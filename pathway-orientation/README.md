# Pathway Orientation

A self-authoring career guidance programme for Zambian Form 3/4 students, built around
the Seven Orientations (Order, Form, Coordination, Discovery, Integration,
Preservation, Transformation).

This app is fully independent of anything else in this repository — it lives entirely
under this `pathway-orientation/` folder and is deployed on its own via GitHub Pages.

## Structure

- `data/vocations.json` — the seven orientation profiles, calling/shadow framing, and Zambian-context pathways
- `data/questions.json` — the Likert (1-5) question bank, tagged by orientation
- `data/scoring-rules.json` — the scoring spec (sum, normalize, classify dominant/secondary/shadow)
- `src/scoring.js` — pure JS scoring engine implementing `scoring-rules.json`; works in both the browser and Node
- `src/app.js` + `index.html` — the static, mobile-first quiz web app (no build step, no framework)
- `scripts/generate-pdf.js` — generates a print-ready, seminar-grade self-scoring workbook PDF from the same data files (custom typography, a wheel diagram, per-orientation icons/colors, a table of contents)
- `assets/fonts/` — Lora and Nunito Sans (SIL Open Font License), embedded in the generated PDF for consistent typography regardless of what's installed on the machine that opens it
- `output/` — where the generated PDF is written (not committed; regenerate with `npm run generate-pdf`)
- `docs/syllabus-mapping.docx` — mapping of the workbook to the *2023 Zambia Education Curriculum Framework* (Ministry of Education / Curriculum Development Centre), with page-cited quotes: the four official Careers Guidance and Counselling areas (Personal, Social, Vocational, Educational — Section 5.10), the eight Ordinary Level pathways and five Advanced Level pathways (Section 4.3), and a cross-reference of all seven orientations to the specific official pathway each points toward. Also flags an honest gap (no orientation primarily leads to the Physical Education & Sport / Sports Science pathways). The three subject-name corrections it identified have been applied to `data/vocations.json`, and the Social-area gap it flagged has been closed in the facilitator's guide (see below) — both tracked as "Done" in the document's own Section 8. The source Framework PDF itself is not included in this repo — it carries a Ministry of Education "all rights reserved" notice — but is cited by section and page throughout. One open item remains: confirming with CDC whether a more granular, numbered Guidance and Counselling syllabus exists beyond this framework-level document (Section 2.3).
- `docs/facilitators-guide.docx` — guide for Guidance and Counselling teachers running the workbook: session plan, a script for each session, world-of-work notes and a decision-making worksheet, a small-group activity closing Session 3 that covers the Social area (comparing orientations against a shared task), sensitive-situation FAQs, and safeguarding notes (never use results to place/restrict subject choices). Uses the same Personal/Social/Vocational/Educational (PSVE) terms as the syllabus mapping document. Still DRAFT and unpiloted — see its own Section 1.
- `docs/pilot-plan.docx` — protocol and feedback toolkit for piloting the workbook in a real school before submission: permissions/ethics steps (school authorisation, parent notification, never recording a learner's actual result as pilot data), a suggested scope and timeline, a facilitator observation log, an anonymous student feedback form, a facilitator feedback form, and a Pilot Summary Report template to attach to the CDC submission package. No pilot has been run yet — this is the toolkit for running one, not evidence that one happened.

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

This writes `output/pathway-orientation-workbook.pdf`.

## Deployment

`.github/workflows/deploy-pathway-orientation.yml` (at the repo root) builds and deploys
this folder to GitHub Pages whenever changes under `pathway-orientation/` are pushed to `main`.
