---
name: design-preview
description: Build multiple working design variants of a page or screen and present them in one preview switcher. Use when the user asks for visual design options, alternative looks, or fresh directions after rejecting a design. Do not use for a single specified design or nonvisual alternatives.
---

# Design preview switcher

Never ask someone to choose a visual direction from prose, palette chips, or a
generated mockup image. Build the real thing, several times, and let them click.
A rejected design costs one file; a wrong guess defended in words costs the session.

## The output contract

The deliverable is always two things:

1. **N standalone design routes** — each a complete, working page with the real content.
2. **One switcher route** at the parent path — the only URL the user needs.

The switcher always looks and behaves the same way. Do not redesign it per project:

- **Left sidebar** listing every design: three-band colour swatch, zero-padded number,
  name, one-line note. Selected row is highlighted.
- **Top bar** with viewport toggle (`Phone` 390 / `Tablet` 768 / `Full`), the current
  design's `NN · Name`, and an `Open ↗` link to that design in its own tab.
- **Stage** holding an `<iframe>` of the selected design on a chequered ground.
- **`←` / `→` arrow keys** switch designs while the switcher chrome has focus.
  Leave keyboard interactions inside the preview to the variant itself.
- **`localStorage`** remembers the selected design and width per switcher across reloads
  when storage is available. Fixed widths remain exact; the stage scrolls if needed.

Use the requested count; if none is given, build three distinct directions.

Copy [templates/switcher.astro](templates/switcher.astro) for Astro: save it as
`src/pages/<preview-base>/index.astro`, set `projectName` and `previewBase`, and fill the
`variants` array. Create each variant at `src/pages/<preview-base>/<id>.astro`.
The switcher includes the project's configured Astro base path automatically.

For plain HTML, copy [templates/switcher.html](templates/switcher.html) to
`<preview-dir>/index.html`, replace `PROJECT_NAME`, and fill `DESIGNS`. Save variants
beside it as `<id>.html` and serve the folder over HTTP.

For other frameworks, adapt the HTML template to the project's route system or serve it
from its public directory. Set `urlFor` to the actual variant routes, including any
deployment base path. Keep the switcher layout and behavior as written; do not add a new
framework just for previews. Each id must be a unique positive integer; gaps are fine.

## Building the variants

**One shared content module.** Extract the real copy, links, and data to a single file
that every variant imports. Variants differ in design only — never in content, or the
comparison is worthless. Never fill variants with lorem ipsum or invented facts; if a
number or testimonial does not exist, it does not appear in any variant.

**One file per variant, fully standalone.** Each renders its own complete document
(`<html>`, `<head>`, its own fonts, its own scoped `<style>`). No shared stylesheet
between variants — a shared stylesheet is how ten designs quietly become one design in
ten colours.

**Make them genuinely different.** Vary the structural idea, not the accent colour.
Different ground (light/dark), type voice, density, and layout model. If two variants
would screenshot the same in greyscale, one of them is wasted.

**Give each a `<title>`** of `NN · Name — <Project>`. The switcher does not set it and
the browser tab is how the user orients when they open one directly.

**Keep previews temporary.** Add `<meta name="robots" content="noindex">` to each
variant, as the switcher already does. This controls indexing, not access: preview routes
are public if included in a deployment. Keep private content in local previews.

## Before handing over

Run the project's existing dev server (or a static HTTP server for HTML). Check every
variant at 390px and a desktop width, verify its controls and links, and fix console
errors and missing assets. Test switching, width toggles, reload persistence, and the
Open link. Hand over one working switcher URL with the server running.

## After the user picks

Promote the chosen variant into the real page and verify it there, then **delete the
preview routes, switcher, and unused variant assets created for this comparison**. Preserve
pre-existing previews and assets still used elsewhere. Remove the preview's `noindex`
when promoting it unless the real page should remain unindexed. Keep the shared content
module if the real page uses it.

## Pitfalls

Read [reference/pitfalls.md](reference/pitfalls.md) before writing the variants. It
covers the component-scoped-CSS trap that silently breaks icons, brand-mark usage, and
the mobile checks that matter. These are mistakes this workflow produces every time, not
hypotheticals.
