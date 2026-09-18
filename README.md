# design-preview

A [Claude Code](https://claude.com/claude-code) skill that stops design decisions from
happening in prose.

When you ask an agent for "a few design options", the usual answer is a wall of
adjectives, a palette swatch, or a generated mockup that the real build never matches.
This skill makes the agent build every option for real and hand you one URL where you
can click between them.

<p align="center">
  <em>One switcher, N real pages, your actual content.</em>
</p>

```
┌────────────────────┬───────────────────────────────────────────┐
│ Project            │ [Phone] Tablet  Full   03 · Swiss  Open ↗ │
│ 10 designs         ├───────────────────────────────────────────┤
│                    │                                           │
│ ▌▌▌ 01 Quiet       │           ┌───────────────┐               │
│ ▌▌▌ 02 Paper       │           │               │               │
│ ▌▌▌ 03 Swiss    ◀  │           │  the actual   │               │
│ ▌▌▌ 04 Console     │           │  page, live   │               │
│ ▌▌▌ 05 Palette     │           │  in an iframe │               │
│ ▌▌▌ ...            │           │               │               │
│                    │           └───────────────┘               │
│ ← → to switch      │                                           │
└────────────────────┴───────────────────────────────────────────┘
```

## Install

Drop it in a project, or in your home directory to have it everywhere:

```bash
git clone https://github.com/gurungabit/design-preview.git ~/.claude/skills/design-preview
```

```bash
git clone https://github.com/gurungabit/design-preview.git .claude/skills/design-preview
```

Claude picks it up automatically. You can also invoke it directly with `/design-preview`.

## What it does

Ask for options in whatever words you'd normally use — *"build me 5 designs"*, *"show me
some directions"*, *"I don't like this, try some other looks"* — and you get:

- **N standalone routes**, each a complete working page with your real content
- **One switcher route** with a sidebar, viewport toggle, arrow-key navigation, and
  a remembered selection

The switcher's layout is fixed by the skill so it never gets redesigned per project and
never competes visually with the work it's showing.

## Why it's shaped this way

Three rules do most of the work:

**One shared content module.** Every variant imports the same copy and data. Variants that
differ in content aren't comparable, and lorem ipsum hides exactly the overflow problems
you're trying to catch.

**One file per variant, fully standalone.** Each renders its own document with its own
fonts and scoped styles. A shared stylesheet is how ten designs quietly become one design
in ten colours.

**Delete the previews after the pick.** The default failure of this workflow is ten dead
routes living in the repo forever.

## What's inside

| Path | |
|---|---|
| `SKILL.md` | The workflow and the switcher's output contract |
| `templates/switcher.astro` | Drop-in switcher for Astro projects |
| `templates/switcher.html` | Same switcher, no framework — plain HTML/JS |
| `reference/pitfalls.md` | The mistakes this workflow reliably produces |

## The pitfalls file

Written from bugs that actually shipped during the build, not hypotheticals:

- **Scoped styles don't cross component boundaries.** In Astro, Vue SFCs, CSS Modules and
  styled-jsx, a variant's `<style>` can't reach into an imported component. Icon sizing
  rules silently do nothing and the icon renders at intrinsic size — invisible in a type
  check, invisible in the source, obvious only in a screenshot.
- **Brand marks.** Using platform icons to link to accounts you own is ordinary
  referential use. Pull paths from [Simple Icons](https://simpleicons.org) rather than
  redrawing. Third-party *products* with affiliate relationships are a different case.
- **Never drop content at narrow widths.** A table that hides a column under a media query
  is lossy, not responsive — and it'll be the variant someone picks before anyone notices
  the missing copy.
- **Decorative controls are worse than none.** If a variant shows a search field or filter,
  wire it up. People choose designs partly for features that turn out to be drawings.

## Licence

MIT
