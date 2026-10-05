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

Update a cloned installation with `git -C ~/.claude/skills/design-preview pull --ff-only`
(use the project path for a project installation). A project clone has its own `.git`
directory; remove that inner directory if you want to track the skill's files directly
in your project's repository rather than keep a separate clone.

## What it does

Ask for options in whatever words you'd normally use — *"build me 5 designs"*, *"show me
some directions"*, *"I don't like this, try some other looks"* — and you get:

- **N standalone routes**, each a complete working page with your real content
- **One switcher route** with a sidebar, viewport toggle, arrow-key navigation, and
  a remembered selection

Arrow keys work in the switcher chrome; keyboard interactions inside a variant belong
to that page. Phone and Tablet render at exactly 390px and 768px, with horizontal stage
scrolling when needed. Saved state is isolated by switcher path, and previews still work
when browser storage is blocked. With no requested count, the skill builds three options.

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
| `tests/switcher.test.mjs` | Dependency-free regression checks for both templates |

## Template setup

For Astro, copy `templates/switcher.astro` to `src/pages/preview/index.astro`, set
`projectName` and `previewBase`, and fill `variants`. Create `src/pages/preview/<id>.astro`
for each id. The switcher respects the configured Astro base path.

For HTML, copy `templates/switcher.html` to `preview/index.html`, replace `PROJECT_NAME`,
and fill `DESIGNS`. Put `<id>.html` beside it, then run `python3 -m http.server 8000` from
the project directory and open `http://localhost:8000/preview/`. For other frameworks,
adapt the HTML template to the existing route system and set `urlFor` to the variant URLs.

Each array entry has a unique positive integer `id`, a `name`, a short `note`, and three
swatch colors: `a` for the page ground, `b` for the primary ink, and `c` for the accent.
Ids do not need to be consecutive. Change configuration, not the switcher's appearance.

Preview pages include `noindex` and should be removed after a choice. They remain public
if deployed; `noindex` is not access control.

Run `node --test` with Node.js 22 or newer to check template behavior. No install needed.

## The pitfalls file

Written from bugs observed in real design-preview sessions:

- **Scoped styles don't cross component boundaries.** In Astro, Vue SFCs, CSS Modules and
  styled-jsx, a variant's `<style>` can't reach into an imported component. Icon sizing
  rules silently do nothing and the icon renders at intrinsic size — invisible in a type
  check, invisible in the source, obvious only in a screenshot.
- **Brand marks.** Using platform icons to link to accounts you own is ordinary
  referential use. Pull official assets or paths from [Simple Icons](https://simpleicons.org)
  rather than redrawing, and follow each brand's usage rules. See the
  [pitfalls reference](reference/pitfalls.md#brand-icons) for licensing details.
- **Never drop content at narrow widths.** A table that hides a column under a media query
  is lossy, not responsive — and it'll be the variant someone picks before anyone notices
  the missing copy.
- **Decorative controls are worse than none.** If a variant shows a search field or filter,
  wire it up. People choose designs partly for features that turn out to be drawings.

## Licence

MIT
