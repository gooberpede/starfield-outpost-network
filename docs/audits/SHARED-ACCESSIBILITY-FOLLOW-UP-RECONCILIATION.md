# Shared Accessibility Follow-up Reconciliation

## Outcome

The completed locale set does not expose a locale-specific accessibility
regression. Two shared application issues have current reproducible evidence:
Resource Matrix shortcut focus lacks a visible outline in the tested browser,
and high-reflow programmatic focus can land outside the usable viewport behind
fixed chrome. Narrator-specific shortcut and announcement questions remain
open but platform/environment constrained. The compact Matrix semantic-context
concern is superseded by current structure. A separate Cargo Link Undo issue is
a confirmed presentation-state regression rather than an accessibility defect.

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

Apple/WebKit, Safari, VoiceOver, iPhone, touchpad, and touchscreen checks were
not available and remain deferred platform coverage.

## Reconciled inventory

| Item | Current status | Evidence and next action |
| --- | --- | --- |
| Narrator interception of global shortcuts | Still open; platform/environment constrained | Completed manual QA recorded `Ctrl+Alt+ArrowUp/Down` interception and intermittent `/` interception with Narrator. Ordinary browser shortcut tests remain green. A dedicated Windows Narrator/browser interaction brief is needed before changing bindings. |
| Narrator omission of shortcut chord speech | Still open; platform/environment constrained | The Help dialog exposes localized action names and accessible `kbd` labels, but controls do not use `aria-keyshortcuts`, and current automation cannot establish spoken output. Investigate in the same Narrator brief. |
| Ambiguous Solar announcement | Still open; intermittent and platform constrained | Prior manual evidence is cross-locale. No current source change proves it obsolete, and a non-Narrator browser cannot reproduce speech. Investigate actual focus ownership before changing the Solar control. |
| Resource Matrix visible focus | Still reproducible; needs dedicated correction brief | `Ctrl+Alt+G` focused the Matrix region and `Ctrl+Alt+1` focused the first editable state button, but computed `outline-style` remained `none` for both in the tested browser. Bindings and focus movement worked. |
| Compact Resource Matrix context | Superseded structurally | The accessibility tree exposed table/row/cell context plus full action/item descriptions such as “Toggle Present for Lead”; automated component tests cover localized compact semantics. Do not retain a duplicate generic context item unless Narrator testing identifies a concrete missing announcement. |
| Compact Cargo Link marker/context | Still open; needs targeted Narrator verification | Automated tests cover a localized full-name collapsed summary, but prior manual evidence found no new utterance from mouse activation of the marker. This may be expected tooltip/click behavior; do not change it without a precise speech/focus failure. |
| Cargo Undo collapse/presentation behavior | Confirmed presentation-state regression; needs dedicated correction brief | Current Edge runtime evidence shows that deleting one of at least two expanded Cargo Links preserves the remaining links' presentation state immediately after deletion, but Undo restores the deleted link collapsed and also collapses every other Cargo Link. Preserve unrelated Cargo Link presentation state through Undo where consistent with the established history/presentation contract. The restored link's desired state remains a later design decision. |
| Fixed-chrome focus visibility | Still reproducible; needs dedicated correction brief | At the 683×384 reflow-equivalent viewport, a shortcut-focused Matrix button had top/bottom 397/422 px while the viewport ended at 384 px and the fixed status region occupied 313–369 px. |
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

This is current direct runtime evidence and takes precedence over an inference
from stable presentation-state keys. The regression belongs to a dedicated
history/presentation-state correction brief. That brief should preserve
unrelated Cargo Link presentation state through Undo where consistent with the
existing contract; it should separately decide whether the restored Cargo Link
returns expanded or collapsed.

## Recommended follow-up boundaries

1. A focused high-magnification/focus-visibility brief should address scrolling
   focused content into the usable area and the Matrix `:focus-visible`
   interaction without redesigning Matrix geometry.
2. A Windows Narrator/browser brief should jointly investigate shortcut event
   interception, chord speech, Solar focus ambiguity, and the compact Cargo
   marker. It should preserve bindings until collision evidence supports a
   product decision.
3. Apple/WebKit/VoiceOver remains a platform-validation brief when suitable
   hardware exists; no pass or failure is inferred here.
