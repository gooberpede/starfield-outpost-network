# CODEX MINI-CORRECTION BRIEF — Character Header Invalid-Entry Feedback

## Purpose

Apply one very small correction to Accessibility Slice 3.

The current Character Header implementation makes invalid level/rank guidance visibly prominent in the header strip. This is not acceptable for the product.

The character name, level, and skills are **optional metadata**. Their editing UI should remain visually lightweight.

This correction should:

- remove the visible range-guidance prose from the Character Header;
- preserve local accessibility feedback for invalid numeric drafts;
- keep invalid character metadata separate from the main network Validator;
- preserve the existing optional/null data model;
- preserve existing history semantics.

Do **not** touch any other Slice 3 work.

Do **not** commit or push.

---

# Current problem

The current implementation renders visible messages such as:

```text
ENTER A LEVEL FROM 1 TO 999.
ENTER A RANK FROM 0 TO 4.
```

directly under the fields.

This makes the Character Header read like a form-validation surface and visually overwhelms what should be optional, lightweight metadata.

The visible guidance must be removed.

---

# Required interaction model

## Valid entry

For valid numeric input:

- preserve existing commit behavior;
- preserve one history entry per committed change;
- clear any invalid state.

## Blank entry

Blank remains valid optional metadata.

Preserve existing behavior that commits the field as `null` where supported.

Do not show or announce an error for blank optional fields.

## Invalid non-empty draft

While the user is editing an invalid non-empty draft:

- keep the draft visible while the field has focus;
- set `aria-invalid="true"`;
- associate the field with concise localized range guidance that is **not visually rendered in the normal Character Header**;
- do not create a history entry;
- do not route the issue to the network Validation system.

On blur:

- restore the previous valid committed value;
- clear the invalid visual/programmatic state after restoration;
- preserve the existing domain model.

The user should never end up persisting arbitrary invalid numeric strings.

---

# Accessible guidance

Use a screen-reader-accessible but visually hidden description for the valid range.

Examples of meaning:

```text
Enter a level from 1 to 999.
Enter a rank from 0 to 4.
```

Reuse the localized strings already introduced in Slice 3 if suitable.

Preferred association:

```text
aria-describedby="<hidden-range-guidance-id>"
```

The hidden description should remain available to assistive technology while the field is invalid.

Do not expose this guidance as permanent visible prose in the Character Header.

---

# Rejection announcement on blur

When an invalid draft is rejected on blur and the prior value is restored, make the reason understandable to screen-reader users.

Preferred behavior:

- publish a concise, local screen-reader-only status announcement such as the existing localized range guidance;
- do not move focus;
- do not show a visible toast/banner;
- do not use the application-wide network Validation system.

Use the smallest stable announcement mechanism available.

Avoid duplicate speech.

If the associated invalid description plus restoration is already reliably announced by the current component behavior, do not add an unnecessary second live region. Prefer the simplest implementation that is testable and understandable.

---

# Visual requirements

After the correction, the Character Header should look essentially as it did before Slice 3.

Specifically:

- no visible range-guidance lines under Level;
- no visible range-guidance lines under skill rank fields;
- no extra vertical height caused by validation prose;
- optional fields should not appear required or alarming;
- no red error banners or large inline warning text.

A subtle native/structural invalid cue while actively editing is acceptable if already present and visually restrained, but do not introduce new prominent error styling.

---

# Validator boundary

Do **not** create network Validation issues for:

```text
invalid Character Level draft
invalid skill-rank draft
missing Character Level
missing skill rank
missing Character name
```

The distinction remains:

```text
missing optional metadata -> acceptable
invalid typed numeric draft -> local editing feedback
invalid network/domain state -> Validation system
```

Do not blur these responsibilities.

---

# Preserve all other Slice 3 work

Do not alter:

- collapsed Cargo semantic summaries;
- Validation `aria-controls`/panel relationship;
- deterministic Search submit behavior;
- Search focus hand-off/restoration;
- localization architecture;
- persistence/import/export/history schema;
- Slice 2 visual cleanup backlog;
- Slice 1 layout/semantic-shell work.

The user's Narrator check has already confirmed that collapsed Cargo summary narration is working.

---

# Tests

Update the smallest relevant Character Header tests.

Verify:

## Invalid level

- invalid non-empty draft remains visible while focused;
- `aria-invalid="true"` is present;
- hidden localized range guidance is associated;
- no visible range-guidance prose is rendered;
- no commit/history mutation occurs;
- blur restores the previous valid value;
- invalid state clears after restoration.

## Invalid skill rank

Same behavior as level.

## Blank optional value

- remains non-invalid;
- commits/nulls according to existing semantics;
- no visible or announced error solely because it is blank.

## Valid correction

- entering a valid value clears invalid state;
- valid commit still produces the existing single commit/history operation.

Do not weaken the existing Slice 3 tests for Cargo, Validation, or Search.

---

# Browser sanity check

Perform a very small browser check:

1. type an invalid Character Level value;
2. confirm no visible guidance prose appears;
3. confirm the header height/layout remains normal;
4. blur the field;
5. confirm the previous valid value returns;
6. repeat for one skill-rank field.

No full accessibility manual pass is required yet.

Narrator verification may remain part of the consolidated post-cleanup accessibility pass unless Codex can cheaply confirm the local announcement behavior.

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

1. visible Character Header range-guidance prose is removed;
2. optional Character Header fields no longer look like required validated form fields;
3. invalid non-empty numeric drafts expose `aria-invalid`;
4. concise localized range guidance remains available to assistive technology;
5. invalid drafts do not create history entries;
6. invalid drafts are restored to the previous valid value on blur;
7. blank optional values remain valid;
8. no Character Header issue is added to the network Validator;
9. no other Slice 3 behavior changes;
10. all tests/build/lint/verifiers pass;
11. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- Character Header behavior before/after;
- how hidden range guidance is associated;
- whether any live announcement is used on invalid blur/restoration;
- how duplicate announcements are avoided;
- test updates;
- browser sanity-check result;
- full verification results;
- confirmation that Cargo/Validation/Search Slice 3 work was untouched;
- confirmation that no commit or push was performed.
