---
name: design-preview
description: Build multiple full design variants of a page or screen and present them in a side-by-side switcher the user can click through. Use whenever the user asks to see design options, alternatives, versions, or "a few different looks" to pick from — e.g. "build me 5 designs", "show me some options", "redesign this, give me choices", "let me compare", or any time a visual direction is undecided and describing it in words would be worse than showing it. Also use when a previously shown design was rejected and fresh alternatives are needed.
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
- **`←` / `→` arrow keys** switch designs.
- **`localStorage`** remembers the selected design and width across reloads.

Copy [templates/switcher.astro](templates/switcher.astro) (or
[templates/switcher.html](templates/switcher.html) for projects with no framework) and
edit only the `designs` array. Everything else stays as written.

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

## After the user picks

Promote the chosen variant into the real page, then **delete the preview routes, the
switcher, and any now-unused variant assets**. Leaving ten dead routes in the repo is the
default failure of this workflow. Keep the shared content module if the real page uses it.

## Pitfalls

Read [reference/pitfalls.md](reference/pitfalls.md) before writing the variants. It
covers the component-scoped-CSS trap that silently breaks icons, brand-mark usage, and
the mobile checks that matter. These are mistakes this workflow produces every time, not
hypotheticals.
