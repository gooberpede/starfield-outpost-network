# Shared Accessibility Follow-up Reconciliation

## Outcome

The completed locale set does not expose a locale-specific accessibility
regression. The previously reproduced Resource Matrix visible-focus and
fixed-chrome focus-visibility issues are addressed by the shared shell inset and
focus/reveal contract and are manually verified within the tested Windows/Edge
scope. Narrator-specific shortcut and announcement questions remain open but
platform/environment constrained. The compact Matrix semantic-context concern
is superseded by current structure. A separate Cargo Link Undo issue is a
confirmed presentation-state regression rather than an accessibility defect.

This was an inventory pass. No shortcut, focus, accessible-name, screen-reader,
or runtime correction was made.

## Evidence boundary

The review used current source, automated accessibility/component coverage, the
browser accessibility tree, completed locale QA records, and a local production
browser probe on 22 September 2026. A new Windows Narrator speech session was
not performed through the Codex in-app browser. Therefore Narrator speech and
browser interception results are retained from completed manual locale QA and
are not presented as newly reproduced speech evidence. The Cargo Link Undo
classification additionally uses the user's current repeatable Edge runtime
reproduction; it is presentation-state evidence rather than a screen-reader
result.

Subsequent user manual closure testing in Edge verified the fixed-chrome and
visible-focus correction at both 100% and true browser-controlled 200% zoom.
At each zoom level, a long Navigation list, the Resource Matrix, expanded Cargo
Links, and Planned Supply had no top or bottom occlusion. In regular contrast,
visible focus passed for Resource Matrix, Inorganic Resources, Organic Resource,
Manufacturing, and Cargo Links shortcut targets. The same five indicators
passed with Windows High Contrast enabled.

Apple/WebKit, Safari, VoiceOver, iPhone, touchpad, and touchscreen checks were
not available and remain deferred platform coverage.

## Reconciled inventory

| Item | Current status | Evidence and next action |
| --- | --- | --- |
| Narrator interception of global shortcuts | Still open; platform/environment constrained | Completed manual QA recorded `Ctrl+Alt+ArrowUp/Down` interception and intermittent `/` interception with Narrator. Ordinary browser shortcut tests remain green. A dedicated Windows Narrator/browser interaction brief is needed before changing bindings. |
| Narrator omission of shortcut chord speech | Still open; platform/environment constrained | The Help dialog exposes localized action names and accessible `kbd` labels, but controls do not use `aria-keyshortcuts`, and current automation cannot establish spoken output. Investigate in the same Narrator brief. |
| Ambiguous Solar announcement | Still open; intermittent and platform constrained | Prior manual evidence is cross-locale. No current source change proves it obsolete, and a non-Narrator browser cannot reproduce speech. Investigate actual focus ownership before changing the Solar control. |
| Resource Matrix visible focus | Corrected / manually verified within tested Windows/Edge scope | Matrix shortcut focus applies a transient authored indicator while retaining ordinary `:focus-visible` and pointer behavior. User manual checks passed for Resource Matrix, Inorganic Resources, Organic Resource, and Manufacturing focus in regular contrast and Windows High Contrast. |
| Compact Resource Matrix context | Superseded structurally | The accessibility tree exposed table/row/cell context plus full action/item descriptions such as “Toggle Present for Lead”; automated component tests cover localized compact semantics. Do not retain a duplicate generic context item unless Narrator testing identifies a concrete missing announcement. |
| Compact Cargo Link marker/context | Still open; needs targeted Narrator verification | Automated tests cover a localized full-name collapsed summary, but prior manual evidence found no new utterance from mouse activation of the marker. This may be expected tooltip/click behavior; do not change it without a precise speech/focus failure. |
| Cargo Undo collapse/presentation behavior | Corrected after this audit | The point-in-time Edge evidence below identified a presentation reset on Undo. The correction now preserves current unrelated Cargo Link expansion state, restores the removed link expanded, and applies the same rule through Redo and another Undo without changing history snapshots. |
| Fixed-chrome focus visibility | Corrected / manually verified within tested Windows/Edge scope | The shell measures Page Header height, shares Status Bar clearance across reachability and scroll insets, and routes application focus/restoration through one minimal reveal helper with nested-scroll and fixed-overlay handling. User manual checks at 100% and true browser-controlled 200% zoom passed for a long Navigation list, Resource Matrix, expanded Cargo Links, and Planned Supply, with no top or bottom occlusion. |
| One-off “international sort” locale utterance | Not reproduced; retire as informational | No application semantic defect has been identified. Reopen only with repeatable evidence. |

### Cargo Link Undo reproduction

The confirmed Edge reproduction is:

1. Navigate to an outpost with at least two Cargo Links.
2. Expand at least two Cargo Links.
3. Remove one Cargo Link.
4. Observe that the remaining Cargo Links retain their previous expanded or
   collapsed state.
5. Invoke Undo.
6. Observe that the removed Cargo Link returns collapsed and all other Cargo
   Links also become collapsed.

This was direct runtime evidence at the time of the audit and took precedence
over an inference from stable presentation-state keys. The regression was
assigned to a dedicated history/presentation-state correction brief.

Subsequent disposition: the dedicated correction established that a restored
Cargo Link returns expanded, because removal is available only from its
expanded editor. Unrelated Cargo Links retain their current presentation state;
the point-in-time reproduction above remains as historical audit evidence.

## Recommended follow-up boundaries

1. A Windows Narrator/browser brief should jointly investigate shortcut event
   interception, chord speech, Solar focus ambiguity, and the compact Cargo
   marker. It should preserve bindings until collision evidence supports a
   product decision.
2. Apple/WebKit/VoiceOver remains a platform-validation brief when suitable
   hardware exists; no pass or failure is inferred here.
