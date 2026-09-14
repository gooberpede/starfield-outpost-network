# CODEX MICRO-CORRECTION BRIEF — Deferred Import Failure Announcement

## Purpose

Apply one final, extremely narrow accessibility experiment for failed import announcements.

Current state:

- focus-ring work is complete and should not be touched;
- Search focus hand-off is complete and should not be touched;
- import success announcements work;
- import failure messages are visibly rendered but Narrator still does not announce them;
- stable pre-mounted polite and assertive live regions are already in place.

Do **not** commit or push.

---

# Problem statement

Manual Narrator testing shows this sequence for an invalid import:

```text
Import button receives focus
-> Narrator announces Import button
-> native Open File dialog opens
-> invalid JSON file is selected
-> Open is clicked
-> browser regains focus
-> Narrator announces return to browser/app/import button context
-> visible import-failure status message appears
-> Narrator does not announce the failure text
```

The current semantic structure is already correct:

```text
stable role="status" polite region
stable role="alert" assertive region
```

The likely remaining problem is announcement timing around the native file-picker -> browser focus transition.

This brief is about **timing only**.

---

# Required correction

Separate:

```text
visible status message state
```

from:

```text
screen-reader announcement text
```

For failed imports:

1. render the visible failure message immediately;
2. do not delay the visible UI;
3. defer populating the assertive live-region announcement until the browser has regained focus and the native file-dialog transition has settled.

Preferred mechanism:

- schedule the accessibility announcement on the next animation frame after focus returns;
- if one frame is insufficient in the existing architecture, use the smallest deterministic deferred tick;
- avoid arbitrary long timeouts.

Conceptually:

```text
visible error state -> update immediately

window/browser focus restored
-> requestAnimationFrame(...)
-> set assertive announcement text
```

Exact implementation may differ.

---

# Important constraints

Do not:

- remount the live region;
- change `role="alert"` / `aria-live="assertive"`;
- merge polite and assertive regions;
- alter export announcement behavior;
- alter import success behavior;
- delay visible failure feedback;
- add a long timeout such as 500ms/1000ms merely to force speech;
- refocus the status message or steal keyboard focus;
- change the dismiss-button behavior;
- touch focus-ring CSS;
- touch Search focus logic;
- touch Safari/WebKit backlog work.

---

# Focus-transition handling

Use the smallest clean hook into the existing import lifecycle.

Good options may include:

- waiting for `window` focus after the file picker closes;
- scheduling announcement text with `requestAnimationFrame`;
- scheduling a microtask/frame only after the visible failure state is committed.

Avoid adding persistent global listeners unless necessary.

Clean up any temporary listener reliably.

Do not announce stale prior import errors when focus returns later for unrelated reasons.

The announcement should correspond only to the current failed import event.

---

# Announcement clearing

Preserve current no-duplicate behavior.

Before/when publishing a new assertive announcement:

- ensure the previous assertive text cannot cause duplicate speech;
- keep the polite region empty for an error;
- leave visible status rendering independent.

If the existing announcement helper already clears old text, reuse it rather than inventing a second mechanism.

---

# Tests

Add/update the smallest practical rendered tests.

JSDOM cannot prove Narrator speech, so test the timing contract instead.

At minimum verify:

1. failed import visible status text appears immediately;
2. assertive live-region text is not populated before the deferred announcement step;
3. after simulated focus restoration/deferred frame, the assertive region receives the failure text;
4. polite region remains empty for failure;
5. import success behavior remains unchanged;
6. export success/failure announcement behavior remains unchanged;
7. no duplicate assertive message is emitted.

Use fake timers / mocked `requestAnimationFrame` only if needed and keep the test simple.

---

# Manual re-check

After implementation, manually test exactly one failed import with Narrator:

```text
Import
-> choose invalid file
-> Open
-> return to browser
```

Expected:

- visible error message appears immediately;
- Narrator announces the import failure once after browser focus settles;
- dismiss button remains separately accessible;
- no duplicate announcement.

If Narrator still does not announce the failure after this timing adjustment, stop iterating and report the result.

At that point classify it as:

```text
Narrator/native file-dialog announcement timing limitation
```

provided the DOM semantics remain correct and import success/export announcements still work.

Do not attempt further UI restructuring in this pass.

---

# Verification

Run at minimum:

```text
npm test
npm run test:components
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify
npm run localization:terminology:verify
npm run build
npm run lint
git diff --check
```

---

# Acceptance criteria

Complete when:

1. visible import failure remains immediate;
2. assertive announcement is deferred until after browser focus restoration / settled frame;
3. stable pre-mounted assertive region remains in use;
4. no focus is stolen;
5. import success still works;
6. export announcements still work;
7. no duplicate announcement is introduced;
8. all tests/build/lint/verifiers pass;
9. no unrelated files/behaviors are changed;
10. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- exact timing mechanism used;
- how browser focus restoration is detected;
- whether `requestAnimationFrame` or another deferred step is used;
- how stale/duplicate announcements are prevented;
- tests added/updated;
- full verification results;
- manual Narrator result if performed;
- confirmation that no unrelated Parcel F work was touched.
