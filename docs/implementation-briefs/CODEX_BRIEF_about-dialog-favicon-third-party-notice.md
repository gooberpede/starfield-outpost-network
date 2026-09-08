# Codex Implementation Brief — About Dialog, Favicon, and Third-Party Notice

## Objective

Finish the application's visual identity by implementing:

1. the Starfield Outpost Network favicon;
2. a quiet `About` control in the top-right application title bar;
3. a compact application-owned About dialog;
4. a repository-side third-party attribution notice.

This should be a small, polished visual-completion batch.

---

## 1. Assets supplied

The user will provide both icon PNGs:

```text
16x16
32x32
```

Use the **32x32 PNG as the primary favicon asset**.

Use the **16x16 PNG as an explicit small-size fallback** if straightforward in the current app structure.

Do not upscale either asset.

Do not generate new icon artwork.

---

## 2. Attribution supplied by Flaticon

Use the supplied attribution exactly in substance:

```html
<a href="https://www.flaticon.com/free-icons/cosmos" title="cosmos icons">
  Cosmos icons created by gravisio - Flaticon
</a>
```

User-facing text:

```text
Cosmos icons created by gravisio - Flaticon
```

The attribution must link to:

```text
https://www.flaticon.com/free-icons/cosmos
```

Do not invent alternate author wording.

---

# PART A — FAVICON

## 3. Replace default app/tab icon

Replace the current default React/Node/Vite favicon with the supplied icon.

Preferred use:

```text
32x32 primary favicon
16x16 fallback if practical
```

Use the existing Vite/public asset conventions.

Confirm the browser tab displays the new icon after rebuild/reload.

---

## 4. Preserve aspect and transparency

Do not:

```text
stretch
crop
add background
recolor
add effects
```

unless the supplied PNG itself requires no such change.

Use the files as supplied.

---

# PART B — ABOUT CONTROL

## 5. Placement

Add a quiet `About` control in the **top-right title bar**, opposite:

```text
STARFIELD OUTPOST NETWORK
```

This belongs in application chrome, not the network action row.

It should visually read as application-level information rather than an operational network action.

---

## 6. Label

Use exactly:

```text
About
```

Do not use an icon-only `i` control.

---

## 7. Visual treatment

Keep the control visually restrained.

Preferred characteristics:

```text
quiet text-button treatment
small footprint
square / near-square geometry
B1 palette
thin/low-emphasis border if needed
no glow
no shadow
```

It should not compete with:

```text
Delete Network
Delete Outpost
Undo
Redo
Export
Import
```

---

# PART C — ABOUT DIALOG

## 8. Dialog type

Implement a genuine application-owned modal dialog.

Do **not** use:

```text
anchored popover
browser alert
browser confirm
hover tooltip
```

The About content is application-level information.

---

## 9. Locked copy

Use:

```text
Starfield Outpost Network

A tracking tool for Starfield outpost networks.

Cosmos icons created by gravisio - Flaticon
```

The attribution line must be a working link to the supplied Flaticon URL.

Do not add extra explanatory copy unless necessary for accessibility.

---

## 10. Layout

Preferred dialog structure:

```text
ABOUT                                  ×

Starfield Outpost Network

A tracking tool for Starfield
outpost networks.

Cosmos icons created by
gravisio - Flaticon

                                Close
```

Exact line wrapping may vary naturally.

Use:

```text
left-aligned content
compact width
roughly 22–28rem
flat pale surface
thin border
square / near-square geometry
restrained backdrop
no decorative shadow
```

Do not center all body text.

---

## 11. Dialog heading

Use an application-level heading such as:

```text
ABOUT
```

consistent with existing uppercase structural labels.

The app name inside the body should remain:

```text
Starfield Outpost Network
```

---

## 12. Close affordances

Provide:

```text
explicit Close button
optional top-right × close control
Escape closes
```

If both Close and × are used, they must share the same close path.

Do not make closing behavior inconsistent between controls.

---

## 13. Backdrop behavior

Use the existing application modal conventions where practical.

If the current confirmation-dialog pattern deliberately prevents backdrop dismissal, it is acceptable to keep About consistent.

If non-destructive app modals already allow backdrop dismissal, follow that established pattern.

Do not introduce a new inconsistent modal grammar solely for About.

---

# PART D — FOCUS / ACCESSIBILITY

## 14. On open

When `About` is activated:

- open the dialog;
- move focus into the dialog;
- prefer the Close control or dialog heading/container according to current modal conventions.

---

## 15. On close

When the dialog closes through:

```text
Close
×
Escape
```

restore focus to the `About` trigger.

---

## 16. Modal keyboard behavior

Use accessible dialog behavior consistent with the existing app-owned confirmation modal.

At minimum:

```text
keyboard reachable controls
Escape closes
focus remains inside while modal is open
clear focus-visible styling
aria-modal / dialog semantics
```

If an existing reusable modal/focus-trap implementation exists, reuse it rather than building another.

---

# PART E — THIRD-PARTY NOTICE

## 17. Create repository notice

Create:

```text
THIRD-PARTY-NOTICE.md
```

at the repository root unless the project already has a clear convention for third-party notices elsewhere.

If a similarly named notice already exists, update it instead of creating a duplicate.

---

## 18. Required notice content

Include at least:

```md
# Third-Party Notice

## Application Icon

The application icon is based on an icon from Flaticon.

Attribution:

Cosmos icons created by gravisio - Flaticon

Source:
https://www.flaticon.com/free-icons/cosmos

License:
Flaticon Free License, attribution required.
```

Also preserve the original supplied attribution snippet, either directly below or in a compact reference block:

```html
<a href="https://www.flaticon.com/free-icons/cosmos" title="cosmos icons">
  Cosmos icons created by gravisio - Flaticon
</a>
```

Do not add legal claims beyond the supplied attribution/licence context.

---

# PART F — FUTURE-READY BUT NOT OVER-ENGINEERED

## 19. Keep About extensible

Structure the About dialog so future content can be added cleanly, such as:

```text
version/build
repository link
additional third-party notices
licence information
data-source acknowledgements
```

But do **not** add empty sections or placeholder headings now.

---

## 20. No unnecessary abstraction

Do not create:

```text
plugin system
credits registry
dynamic notice loader
complex modal framework
```

unless the project already has an existing abstraction that naturally fits.

Keep the implementation proportionate to the current need.

---

# PART G — VISUAL CONSISTENCY

## 21. Follow established B1 visual language

Use:

```text
pale surfaces
structural dark sparingly
thin rules
square corners
Barlow Semi Condensed
IBM Plex Mono only where appropriate
no glossy treatment
no card-dashboard styling
```

The About dialog should feel native to the current app shell.

---

# PART H — EXPLICITLY OUT OF SCOPE

## 22. Do not change

Do not modify:

```text
Navigation layout
Cargo layout
Resource Matrix
network actions
multiple-network behavior
workspace resizing
status bar behavior
domain state
Undo/Redo semantics
```

Do not add an About shortcut in this batch.

---

# PART I — VERIFICATION

## 23. Browser checks

Verify:

```text
new favicon appears in browser tab
About control appears top-right in title bar
About dialog opens
attribution link works
Close works
× works if included
Escape works
focus returns to About
dialog traps focus appropriately
no layout shift in title bar
no browser console errors
```

Check representative desktop widths.

---

## 24. Automated checks

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Add focused tests only where the project already has a suitable component interaction-testing path.

Do not add brittle screenshot or pixel-perfect tests.

---

# PART J — DOCUMENTATION

## 25. UX-DESIGN.md

Update `docs/UX-DESIGN.md` only if the About dialog establishes a reusable application-level modal convention not already covered.

If the existing modal grammar already covers it sufficiently, no UX documentation update is necessary.

Do not duplicate settled modal rules unnecessarily.

---

# PART K — COMPLETION REPORT

## 26. Report

Provide:

```text
files changed
favicon asset paths
favicon wiring
About control placement
dialog implementation approach
focus behavior
attribution link
THIRD-PARTY-NOTICE.md contents/location
tests/checks run
browser verification
```

Explicitly state whether:

- any domain logic changed;
- any persisted schema changed;
- any Undo/Redo behavior changed;
- any workspace layout changed.

Do not commit or push unless explicitly asked.

---

## 27. Suggested commit message

If accepted:

```text
feat: add app icon and about dialog
```

---

## 28. Final instruction

Finish the app identity cleanly:

> **Use the supplied favicon, provide a quiet top-right About entry point, show the exact Flaticon attribution in a compact accessible modal, and preserve the same notice in the repository.**
