## Audit result

The visible Navigation pane should be **17.5rem** wide—**315px** at the normal 18px root size.

A measured **17rem / 306px** is the bare practical threshold for the tested 25-character names, but provides only about 1px of spare text width. The recommended 17.5rem gives roughly 10px of tolerance while preserving all existing controls.

### Current geometry

Relevant implementation:

- [WorkspaceLayout.css](D:/Projects/starfield-outpost-network/src/ui/layout/WorkspaceLayout.css)
- [WorkspaceLayout.tsx](D:/Projects/starfield-outpost-network/src/ui/layout/WorkspaceLayout.tsx)
- [OutpostList.css](D:/Projects/starfield-outpost-network/src/ui/components/OutpostList.css)
- [OutpostList.tsx](D:/Projects/starfield-outpost-network/src/ui/components/OutpostList.tsx)
- [CargoPadsEditor.css](D:/Projects/starfield-outpost-network/src/ui/components/CargoPadsEditor.css)
- [CargoPadsEditor.tsx](D:/Projects/starfield-outpost-network/src/ui/components/CargoPadsEditor.tsx)
- [App.tsx](D:/Projects/starfield-outpost-network/src/App.tsx)
- [index.css](D:/Projects/starfield-outpost-network/src/index.css)

The outer workspace is CSS Grid:

```css
/* Locked */
minmax(10rem, 3fr) minmax(0, 22fr)

/* Reshuffle */
minmax(13rem, 3fr) minmax(0, 22fr)
```

The Navigation header and action row use flexbox. The outpost list is a vertical flex container. Individual rows use:

```css
/* Locked */
minmax(0, 1fr)

/* Reshuffle */
1.25rem minmax(0, 1fr) 4.25rem
```

At an 18px root size:

| Element | Current width | Minimum practical | Can compress? | Notes |
|---|---:|---:|---|---|
| Pane | 180px Locked / 234px Reshuffle | 306px Reshuffle | No, for target | Recommend 315px |
| Pane inner width | 165.5px / 219.5px | — | Slightly | Pane has 13.5px right padding and 1px border |
| Drag gutter | 22.5px | 22.5px | No | Usable keyboard focus outline |
| Name button | 165.5px / 107.9px | ≈179px | Flexible | Recommended pane produces 188.9px |
| Selected-name text area | 142.8px / 85.2px | 156.25px | Flexible | Includes selected-marker inset |
| Move controls | 76.5px | 76.5px | No | Two 36px buttons plus 4.5px gap |
| Row column gaps | 12.6px total | ≈9px possible | Slightly | Compressing saves only 3.6px |
| Selected marker | 3.6px | 3.6px | No | Overlaid inside the name button |

The Add Outpost and Lock Order controls are about 94.8px and 78.1px respectively. They fit comfortably at both the current and recommended widths.

### Viewport measurements

| Viewport | Locked pane | Locked name button | Reshuffle pane | Reshuffle name button |
|---:|---:|---:|---:|---:|
| 1024px | 160px | 147px | 208px | 95.8px |
| 1280px | 180px | 165.5px | 234px | 107.9px |
| 1440px | 180px | 165.5px | 234px | 107.9px |
| 1600px | 182.6px | 168.1px | 234px | 107.9px |
| 1920px | 221px | 206.5px | 234px | 107.9px |

The 13rem Reshuffle minimum dominates through ordinary desktop widths, so extra viewport space does not reach the name column. This fixed minimum is the direct cause of the excessive truncation.

At 1024px the root font becomes 16px. There is no separate responsive workspace layout or stacking breakpoint.

### Typography findings

Measurements used the actual selected-row type treatment:

```text
Barlow Semi Condensed
600 weight
0.82rem / 14.76px
normal letter spacing
```

Representative rendered widths:

| Sample | Characters | Width |
|---|---:|---:|
| Vega Ir Hub | 11 | 66.0px |
| Feynman III Mine | 16 | 96.4px |
| Volii III Li Ir Ti V U II | 25 | 109.8px |
| Alpha Ternion III Outpost | 25 | 142.8px |
| Proxima Ternion III Cargo | 25 | 145.8px |
| Xi Ophiuchi VII-b Gateway | 25 | 149.0px |
| Feynman III Manufacturing | 25 | 154.0px |
| Feynman III Cargo Gateway | 25 | 156.25px |
| 25 × `W` stress case | 25 | 284.5px |
| Feynman III Manufacturing Annex | 31 | 193.5px |

For the realistic 25-character corpus:

- Typical width: approximately **143–150px**
- Median: **145.8px**
- Practical upper range: **154–156px**
- Widest realistic sample: **156.25px**
- Pathological all-wide-glyph case: **284.5px**

The current Reshuffle text area is only approximately **85px**, so shared-prefix names lose their distinguishing suffix. A browser screenshot at 1440px showed the existing names reduced to forms such as `Feynman VI-…`.

Names use `overflow: hidden`, `text-overflow: ellipsis`, and `white-space: nowrap`. Every selection button also has the complete name in its `title`, and the accessible name remains complete, so truncated names are discoverable without adding another tooltip system.

### Required widths

- Locked-mode practical minimum: **11rem / 198px**
- Reshuffle-mode bare minimum: **17rem / 306px**
- Recommended stable visible width: **17.5rem / 315px**
- Recommended name text capacity: approximately **166.2px**
- Expected coverage: all tested realistic names up to 25 characters
- Stress behavior: very wide or modded names continue to ellipsize cleanly

Reshuffle can therefore support realistic 25-character names **without shrinking the drag handle, arrow controls, font, row height, or focus outlines**. The current pane is simply too narrow.

### Workspace cost

A temporary 17.5rem browser experiment produced:

| Viewport | Matrix width | Cargo width |
|---:|---:|---:|
| 1024px | 369px | 288px |
| 1280px | 545px | 324px |
| 1440px | 705px | 324px |
| 1600px | 865px | 324px |
| 1920px | 1131.8px | 377.3px |

Compared with the current 13rem Reshuffle pane, Navigation becomes **81px / 4.5rem wider** at normal desktop sizing.

- Through 1600px, Cargo remains at its existing 18rem minimum; the Matrix absorbs the 81px.
- At 1920px, the Matrix loses approximately 60.8px and Cargo approximately 20.3px.
- A future fully hidden Navigation would recover approximately **315px**, or **333px including the removable 1rem outer gap**.
- At the 1024px font breakpoint, those values become approximately 280px and 296px.

The planned collapse behavior therefore makes the wider visible pane a sensible tradeoff: visible means genuinely useful; hidden returns substantial workspace width.

### Future implementation recommendation

The smallest robust strategy is CSS-only:

- use `minmax(17.5rem, 3fr)` for the normal Navigation track;
- keep that width stable between Locked and Reshuffle modes;
- remove the mode-dependent 13rem override;
- retain the existing row grid and control sizes.

Minor reduction of the two 0.35rem row gaps to 0.25rem would save only 3.6px and is unnecessary. No structural row rebalance or runtime text measurement is warranted.

### Repository state

All temporary measurement HTML and CSS changes were removed.

- `git diff --check`: passed; Git emitted only the repository’s LF/CRLF advisory
- `git status`: only the user-supplied untracked brief remains
- Build/lint: not run because this was research-only and no source changes remain
- Commit/push: not performed