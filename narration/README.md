# Narration audio

Drop recorded clips in this folder using the exact filenames listed in the
recording script. The site checks for a matching file before falling back
to the synthesized voice, so you can record clips gradually, nothing
breaks while some are missing.

## Naming

- Portal teaching (8 files, used by both the free and premium page):
  `portal-{lawId}.mp3`
  e.g. `portal-malevolence.mp3`, `portal-vulnerability.mp3`, ...

- Saga movement (40 files, premium page only):
  `saga-{archetypeId}-{movementNumber}.mp3`
  e.g. `saga-avoider-1.mp3` through `saga-avoider-8.mp3`

## Format

Any format `<audio>` supports works (`.mp3` is assumed by the code, adjust
the extension in `index.html` / `myth/index.html` if you record in `.m4a`
or `.ogg` instead). Keep files reasonably compressed, this folder is
served straight from the repo.

## Where the text to read lives

See the recording script PDF for the exact text, in order, one page (or
section) per clip, with the filename to save each one as.
