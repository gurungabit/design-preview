# Pitfalls

## Scoped styles do not cross component boundaries

In Astro (and Vue SFCs, CSS Modules, and styled-jsx), a variant's `<style>` block only
reaches elements written in that file. An imported component renders in its own scope, so
a selector like `.row .ico { width: .85rem }` silently does nothing and the icon renders at
its intrinsic size — often enormous, and often only on some variants, which makes it look
like a layout bug rather than a CSS-scope bug.

Two fixes that work:

- **Size from an inherited property.** Have the shared component use `width: 1em; height: 1em`
  and control it with `font-size` on a wrapper the variant owns. Custom properties
  (`--size`) inherit the same way and work too.
- **Wrap it.** Put the component inside a `<span>` declared in the variant's own file and
  style that span for size, placement, colour, and opacity.

Anything that does *not* inherit — `grid-row`, `opacity`, `width` — must live on a wrapper
the variant owns. `color` is safe if the component uses `fill: currentColor`.

After adding any shared component to variants, **look at a screenshot of every variant that
uses it.** This class of bug is invisible in a type check and invisible in the source.

## Brand icons

Using Instagram, GitHub, X, YouTube, LinkedIn etc. marks to link to the account you own is
ordinary referential use and is fine. Pull the paths from [Simple Icons](https://simpleicons.org)
rather than redrawing by eye — the SVG files are CC0, the marks themselves remain the
owners' trademarks, which does not block this use.

Do not: redraw or restretch a mark, lock it up with the project's own logo, arrange it so it
reads as sponsorship, or recolour a brand's gradient into something custom. Flat single-colour
renderings are explicitly allowed by both Meta's and GitHub's guidelines.

Third-party *products* are different from platforms. If there is an affiliate or partner
relationship, use the asset pack that programme provides rather than scraping a favicon; the
terms usually require it. When in doubt, set the product as text — a name and a description
outperform a blurry logo anyway.

## Check the variants at phone width, not just desktop

Most link pages, portfolios, and profile surfaces are opened on a phone. Capture every variant
at 390px before showing the set.

**Never let a variant drop content at narrow widths.** A table that hides its description column
under a media query is not responsive, it is lossy — and it will be the variant the user picks
before anyone notices the missing copy. Reflow it (stack the detail under the name) instead of
hiding it.

Also verify at phone width: no horizontal scroll, tap targets stay comfortable, long strings like
email addresses wrap or ellipsize rather than overflow.

## Motion and captures

Entrance animations make screenshots lie — an element mid-fade reads as missing and gets "fixed"
into a regression. Keep variants' content visible by default and animate only transforms, or settle
the animation before capturing. Honour `prefers-reduced-motion` in every variant; it is three lines
and its absence is the most common accessibility miss in this workflow.

## Interactive affordances must actually work

If a variant shows a search field, command palette, filter, or tab bar, wire it up. A decorative
search box that does nothing is worse than no search box: the user picks the design partly for that
feature and discovers later it was a drawing.
