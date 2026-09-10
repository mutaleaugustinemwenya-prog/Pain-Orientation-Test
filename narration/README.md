# Narration audio

Drop recorded clips in this folder using the exact filenames listed in the
recording script. The site checks for a matching file before falling back
to the synthesized voice, so you can record clips gradually, nothing
breaks while some are missing.

## Naming

- Portal teaching (8 files, used by both the free and premium page):
  `portal-{lawId}.m4a`
  e.g. `portal-malevolence.m4a`, `portal-vulnerability.m4a`, ...

- Saga movement (40 files, premium page only):
  `saga-{archetypeId}-{movementNumber}.m4a`
  e.g. `saga-avoider-1.m4a` through `saga-avoider-8.m4a`

## Format

`.m4a` is what a phone's built-in recorder exports by default, and
`NARRATION_EXT` in `index.html` / `myth/index.html` is set to `.m4a` to
match, so recordings can go straight from phone to this folder with no
conversion step. If you ever record on a computer with something that
exports `.mp3` instead, change `NARRATION_EXT` in both files to `.mp3`
(one line each) rather than converting every clip.

## Where the text to read lives

See the recording script PDF for the exact text, in order, one page (or
section) per clip, with the filename to save each one as.
