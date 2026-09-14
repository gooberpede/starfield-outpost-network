# CODEX MICRO-CORRECTION BRIEF — Character Header Blur-Time Rejection Announcement

## Purpose

Apply one final, very narrow correction to the Character Header invalid-entry accessibility behavior.

The current implementation still announces range guidance unreliably **during typing** because `aria-describedby` / invalid state is attached while the user is editing.

That is not the desired interaction.

The desired model is:

```text
typing -> silent
blur -> validate/commit decision
invalid -> restore prior value
then announce restoration + reason once
```

Do **not** touch any other Slice 3 behavior.

Do **not** commit or push.

---

# Current observed Narrator problem

Manual testing shows:

```text
focus Level
-> Narrator announces field/value

type one invalid character slowly
-> Narrator may announce allowed range immediately

type several invalid characters quickly
-> Narrator may announce nothing

Tab away
-> value restores
-> Narrator announces next field
-> restoration/rejection may never be announced
```

This is timing-dependent and inconsistent.

The cause is that validation semantics are being exposed while the user is still typing, while the separate rejection announcement competes with the blur/focus transition.

---

# Required interaction model

## While focused / editing

Allow any draft text.

Do **not** announce validation while the user is typing.

Specifically:

- do not dynamically add invalid range guidance through `aria-describedby` during typing;
- do not publish a live-region validation message during typing;
- do not move focus;
- do not revert the draft while focused.

The field is an edit buffer until blur.

---

# Validation moment

Treat **blur** as the validation/commit boundary.

On blur:

## Blank draft

- commit `null` according to existing semantics;
- no rejection announcement.

## Valid draft

- commit normally;
- preserve one commit/history operation;
- no rejection announcement.

## Invalid non-empty draft

Perform this sequence:

1. capture the invalid draft;
2. capture the previous committed valid value;
3. restore the previous committed value;
4. allow focus to move naturally to the next control;
5. after focus settles, publish one concise screen-reader-only announcement.

Do not leave the invalid text persisted.

Do not create a network Validation issue.

---

# Announcement timing

The announcement must occur **after** the blur/focus transition settles.

Use a deterministic deferred mechanism, preferably:

```text
blur
-> restore value
-> next animation frame
-> publish announcement
```

If one frame is not sufficient in the current component architecture, use the smallest clean deferred step.

Do not use arbitrary long delays.

Do not steal focus back to the field.

Do not block Tab navigation.

---

# Announcement content

The announcement should explain:

```text
what was rejected
what value was restored
why
```

Example meaning:

```text
Invalid level. Restored to 12. Enter a level from 1 to 999.
```

For a skill:

```text
Invalid rank. Restored to 2. Enter a rank from 0 to 4.
```

Exact wording should follow the existing localization style.

All text must be localized.

If the previous committed value is `null` / blank, use wording that makes sense without inventing a numeric restored value.

For example:

```text
Invalid level. Previous value restored. Enter a level from 1 to 999.
```

Use the smallest number of new localization strings practical.

---

# `aria-invalid` policy

Do not mark the field invalid on every intermediate draft while the user is typing.

Preferred behavior:

- no `aria-invalid` during ordinary focused editing;
- blur performs validation;
- invalid draft is immediately replaced by the prior valid value;
- therefore there is no need to leave an invalid field state behind.

If the implementation briefly sets invalid state internally during blur processing, it should not produce a persistent or user-visible invalid state.

The accessibility behavior should describe the commit boundary, not police every keystroke.

---

# Live-region structure

Use a stable screen-reader-only announcement region.

Preferred:

```html
<div role="status" aria-live="polite">
  ...
</div>
```

or another existing suitable stable announcement mechanism.

Requirements:

- mounted stably;
- populated only after invalid blur restoration;
- one announcement per rejected blur event;
- no duplicate announcement from `aria-describedby`;
- no announcement while typing;
- no visible prose;
- no focus movement.

If an existing stable local status region can be reused safely, do that.

Do not reuse the application-wide import/export status bar.

---

# Duplicate/stale prevention

Prevent:

- duplicate speech for one rejection;
- stale rejection speech after a later valid edit;
- repeated speech on unrelated future focus changes.

If using an event ID or sequence token is the cleanest way to ensure the deferred announcement belongs to the current blur event, use one.

Clean up pending animation frames/listeners on unmount.

---

# Preserve visual behavior

The Character Header must remain visually unchanged from the restored pre-guidance appearance.

No:

- visible range text;
- extra vertical height;
- red banner;
- inline validation row;
- persistent error icon;
- layout shift.

The only visible behavior for an invalid draft should be:

```text
user types draft
-> tabs away
-> previous valid value reappears
```

The explanation is screen-reader-only.

---

# Preserve optional-field semantics

Do not change:

```text
name optional
level optional
skills optional
blank numeric field -> valid optional state
```

Do not create Validator issues for missing or invalid drafts.

Do not change persistence schema.

Do not change import/export/history structures.

---

# Preserve all other Slice 3 work

Do not alter:

- collapsed Cargo semantic summaries;
- Validation panel relationship;
- Search deterministic submission;
- Search focus hand-off/restoration;
- Cargo Narrator behavior;
- Slice 2 visual cleanup backlog;
- Slice 1 workspace/semantic-shell changes.

The user has manually confirmed the collapsed Cargo summary narration is working.

---

# Tests

Update the Character Header rendered tests to match the real desired behavior.

## Slow invalid typing

Simulate invalid entry one character at a time.

Verify:

- no live announcement is produced while typing;
- no range guidance is attached for immediate speech;
- draft remains visible while focused;
- no commit occurs.

## Fast multi-character invalid typing

Simulate multiple invalid characters entered quickly.

Verify the same:

- no announcement while typing;
- draft remains visible;
- no commit occurs.

## Blur after invalid draft

Verify:

- previous committed value is restored immediately on blur;
- focus is allowed to move away normally;
- announcement is initially absent before deferred publication;
- after the deferred frame/tick, exactly one rejection announcement appears;
- announcement includes reason/range and restoration information;
- no duplicate announcement occurs.

## Valid draft

Verify:

- valid blur commits once;
- no rejection announcement;
- existing history semantics remain intact.

## Blank draft

Verify:

- blank remains valid optional input;
- commits `null` where existing semantics support it;
- no rejection announcement.

## Repeated edits

Verify:

- an invalid rejection followed by a later valid edit does not replay stale rejection text;
- a second invalid blur produces one new announcement.

Use fake/mocked animation-frame timing only if needed.

---

# Manual Narrator re-check

After implementation, perform exactly these manual checks:

## Case 1 — slow invalid entry

1. focus Level;
2. type invalid data slowly, one character at a time;
3. confirm Narrator does **not** announce range guidance while typing;
4. Tab away;
5. confirm value restores;
6. confirm Narrator announces the restoration/rejection once after the next field receives focus.

## Case 2 — fast invalid entry

1. focus Level;
2. quickly type at least two characters producing an invalid draft;
3. confirm Narrator does **not** announce validation while typing;
4. Tab away;
5. confirm value restores;
6. confirm Narrator announces the restoration/rejection once.

Repeat one equivalent check on a skill-rank field if practical.

Expected speech order:

```text
next field announcement
-> rejection/restoration announcement
```

The rejection announcement may follow immediately after the next field, but should not interrupt the user's navigation.

---

# Verification commands

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

1. no invalid-entry announcement occurs while typing;
2. no dynamic typing-time `aria-describedby` range announcement remains;
3. slow invalid typing is silent;
4. fast invalid typing is silent;
5. invalid non-empty draft restores previous committed value on blur;
6. focus moves naturally to the next control;
7. exactly one deferred screen-reader announcement occurs after restoration;
8. announcement explains rejection/restoration and valid range;
9. valid and blank edits do not trigger rejection speech;
10. no stale/duplicate announcement occurs;
11. Character Header remains visually unchanged;
12. no Validator issue is created;
13. all other Slice 3 work remains untouched;
14. all tests/build/lint/verifiers pass;
15. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- final blur-time validation sequence;
- whether `aria-invalid` is used at all after the correction;
- exact announcement timing mechanism;
- how duplicate/stale announcements are prevented;
- localization strings reused/added;
- tests added/updated;
- manual Narrator result for slow invalid typing;
- manual Narrator result for fast invalid typing;
- full verification results;
- confirmation Cargo/Validation/Search behavior was untouched;
- confirmation no commit or push was performed.
