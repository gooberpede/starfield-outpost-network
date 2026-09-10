## Audit outcome

The Cargo pane is wide enough to materially improve name display without resizing it. Premature ellipsis is primarily caused by the header’s equal `1fr / 1fr` split: the identity column reserves half the row even though its visible content needs only a fraction of that space.

A simple CSS rebalance is sufficient. Structural reflow or a second line is not necessary for normal mode.

### Relevant implementation

- [CargoPadsEditor.tsx](D:/Projects/starfield-outpost-network/src/ui/components/CargoPadsEditor.tsx:716) — ordinal, expand/collapse control, `[INT]` indicator, destination name, cargo summaries, and reorder controls.
- [CargoPadsEditor.css](D:/Projects/starfield-outpost-network/src/ui/components/CargoPadsEditor.css:118) — item grid and reorder-mode geometry.
- [CargoPadsEditor.css](D:/Projects/starfield-outpost-network/src/ui/components/CargoPadsEditor.css:201) — compact two-row summary and equal header tracks.
- [CargoPadsEditor.css](D:/Projects/starfield-outpost-network/src/ui/components/CargoPadsEditor.css:271) — destination ellipsis.
- [WorkspaceLayout.css](D:/Projects/starfield-outpost-network/src/ui/layout/WorkspaceLayout.css:61) — Cargo pane’s `minmax(18rem, 1fr)` track.

Current visible order:

```text
Ordinal | [expand/collapse] [[INT]] | remote outpost name
                                      outbound/inbound cargo below
```

In Reshuffle mode, a 2rem up/down control column is added outside the card.

## Current geometry

Measurements used the loaded `600 18px Barlow Semi Condensed` destination font at normal widths and its 16px breakpoint size at 1024px and below.

| Element | 1280px viewport | 1024px viewport | Current behavior |
|---|---:|---:|---|
| Cargo pane | 324px | 288px | Workspace minimum dominates |
| Ordinal | 22.5px | 20px | Appropriately fixed |
| Ordinal/card gap | 6.3px | 5.6px | Small |
| Card | 295.2px | 262.4px | Flexible remainder |
| Summary horizontal padding | 10.8px each | 9.6px each | Modestly compressible |
| Header content row | 273.6px | 243.2px | Two equal tracks |
| Inter-column gap | 13.5px | 12px | Compressible |
| Identity track | 130.1px | 115.6px | Mostly unused |
| Regular identity content | 26.1px | 23.2px | Expand button only |
| Remote-name track | 130.1px | 115.6px | Receives only half |
| Reshuffle remote-name track | 108.9px | — | Reduced by 36px controls plus gap |

At 1280px, the regular identity track contains approximately 104px of unused space. The name is not receiving the available width efficiently.

The Cargo pane remains 324px at 1100, 1280, and 1440px because its 18rem minimum dominates the `3fr / 1fr` content split. It becomes 288px at the 16px root-font breakpoint. The pane itself is therefore not the main cause.

## Typography findings

| Test name | Characters | Rendered width |
|---|---:|---:|
| `New Outpost` | 11 | 93.0px |
| `Feynman I Li Cu xF4` | 19 | 144.5px |
| `Feynman III Cargo Gateway` | 25 | 195.1px |
| `Feynman III Manufacturing` | 25 | 192.4px |
| `Feynman III Cargo Alpha A` | 25 | 188.2px |
| `Feynman III Cargo Alpha B` | 25 | 188.1px |
| 25 lowercase `i` characters | 25 | 110.3px |
| 25 uppercase `W` characters | 25 | 351.5px |
| `Feynman III Manufacturing Annex` | 31 | 241.5px |

For realistic mixed 25-character names:

- Typical width: approximately **188–195px**
- Practical 90th-ish target among the tested names: approximately **195px**
- Pathological wide-glyph stress case: **351.5px**, which should remain ellipsized

The current 130px allocation fails even the existing 19-character name. Shared-prefix 25-character names both lose their distinguishing suffix under the current layout.

## Recommended width model

| Element | Current width/behavior | Minimum practical width | Compress? | Recommendation |
|---|---:|---:|---|---|
| Ordinal | 1.25rem | 1.25rem | No | Preserve |
| Expand control | ~26px | Current size | No | Preserve accessibility target |
| `[INT]` indicator | Auto-sized | Intrinsic width | No | Preserve visible label |
| Identity track | 130px equal track | Intrinsic `max-content` | Yes, substantially | Stop assigning half the row |
| Remote name | 130px | ~194px normal target | Should grow | Give remaining row width |
| Header gap | 0.75rem | 0.5rem | Yes | Small, low-cost recovery |
| Summary padding | 0.6rem each side | 0.5–0.6rem | Slightly | Leave initially |
| Reorder controls | 2rem column | Current size | Not safely | Accept temporary compression |

Recommended CSS direction:

```css
.cargo-pad__summary-top {
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 0.5rem;
}
```

Temporary measurements with this model:

| Case | 1280px | 1024px |
|---|---:|---:|
| Regular pad name space | ~238.5px | ~212px |
| Inter-System pad name space | ~193.5px | ~171.9px |

This fully preserves the realistic tested 25-character names on regular pads. On Inter-System pads, most fit fully; the widest realistic sample ellipsizes by only about 1–2px. At 1024px the same pattern holds because the font also drops to 16px.

Long modded names and deliberately wide-glyph strings continue to ellipsize cleanly. Reshuffle mode remains the constrained exception because its action column consumes approximately 48.6px including the additional grid gap; that temporary mode does not justify restructuring the stable compact summary.

## Ellipsis and accessibility defect

Ellipsis is correctly implemented with:

```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

However, `.cargo-pad__destination` has no `title`, tooltip, focus target, or other direct full-name discovery mechanism. This is a defect relative to the brief.

A future implementation should add the remote outpost name as a lightweight native `title` without making the non-interactive label focusable. Existing expand/collapse focus behavior and reorder controls can remain unchanged.

## Verification and cleanliness

- Measured at 1440, 1280, 1100, 1024, and 900px viewports.
- Used direct rendered DOM geometry and text-range measurements; no screenshots were retained.
- Temporary CSS and browser test names were restored.
- `git diff --check` passed, with only an existing LF/CRLF warning for `docs/UX-DESIGN.md`.
- No build was run because this was research-only and no source change remains.
- No commit or push was performed.

Final Git status contains only the pre-existing files:

```text
 M docs/UX-DESIGN.md
?? docs/implementation-briefs/CODEX_BRIEF_cargo-pad-header-name-width-audit.md
```