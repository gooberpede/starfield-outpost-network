# CODEX IMPLEMENTATION BRIEF — Pre-release polish: Sol, character-name advisory, and export filename safeguard

## Objective

Implement one small, bounded pre-release polish batch covering three already-approved items:

1. Correct English presentation of the **Sol** star system name.
2. Add a **25-character informational advisory** for the player's character name.
3. Bound only the **character-name fragment of exported filenames** to 64 characters.

These are presentation/validation/export-filename changes only. Do not change save schemas, stable IDs, canonical reference identity, import envelopes, or persisted character-name data.

Work on the current `staging` branch and follow `AGENTS.md` plus the relevant domain, UX, localization, import/export, and testing documentation.

Do not commit, push, tag, publish, deploy, or change remote settings unless separately authorized.

---

## Settled decisions

The following decisions are already made and must not be reopened during implementation.

### Sol

- English presentation should use **Sol** where the tracker currently falls back to an undesired canonical/localized form.
- This is a **presentation/localization correction only**.
- Stable system IDs, stored values, canonical reference records, provenance records, and reference-data semantics must remain unchanged.
- Prefer the existing localized-reference-name overlay mechanism rather than altering canonical source/reference data merely to change display text.

### Character-name advisory

- Starfield's ordinary in-game character-name convention is treated here as **25 characters**.
- The tracker should surface this as an **INFO/advisory**, not an error or hard limit.
- It must not prevent typing, saving, importing, exporting, or preserving a longer name.
- It must not mutate or truncate the stored name.
- It must integrate with the established domain-validation architecture rather than adding ad-hoc component-only warning logic.

### Export filename safeguard

- The **character-name-derived fragment of the export filename** is capped at **64 characters**.
- The full character name in application state and exported JSON remains unchanged.
- The 64-character cap applies **after the existing filename sanitization/normalization step**.
- Use deterministic hard truncation to 64 characters.
- Do **not** append an ellipsis.
- Preserve the rest of the filename structure, including timestamp and `.json` suffix, in full.
- Preserve the existing fallback behavior if sanitization leaves the character-name fragment empty.
- This task does **not** change the external import string envelope or attempt to solve the separate 4,096/4,097-character round-trip boundary.

---

# 1. Baseline inspection

Before editing, inspect the current implementation and identify the exact owners for:

- localized reference-name overrides / `Sol` display resolution;
- character-name field/model and current validation rules;
- validation severity/INFO presentation and localization;
- export filename construction and sanitization;
- tests covering localization/reference names;
- tests covering validation;
- tests covering export filenames / import-export behavior.

Record any material discrepancy between this brief and the current implementation before making a broader architectural change.

Do not infer a new requirement from adjacent code or backlog items.

---

# 2. Sol correction

## Required behavior

For both English runtime locales:

```text
en-US
en-GB
```

the relevant star-system display name must resolve to:

```text
Sol
```

Use the existing stable reference identity for that system.

The correction should be made at the localized presentation layer if that is consistent with the current architecture. Do not alter:

- system IDs;
- serialized network data;
- canonical reference JSON/CSV solely for this display fix;
- import/export schema;
- search identity semantics;
- non-English localized names.

## Regression expectations

Verify that:

- system selectors display `Sol` in `en-US` and `en-GB`;
- search/reference lookup still resolves the system normally;
- locale switching remains stable;
- stored references remain IDs rather than localized display strings;
- non-English locales retain their existing official/localized value.

If the current code already contains a sparse English reference override mechanism, use it rather than adding a second localization path.

---

# 3. Character-name 25-character INFO advisory

## Intent

The tracker should inform users when a character name exceeds the ordinary in-game 25-character convention, while preserving the tracker's deliberately permissive data model.

This is guidance, not enforcement.

## Validation semantics

Add one focused validation rule with the repository's established stable-rule-ID pattern.

Trigger when the character name length is greater than 25 according to the project's existing string-length convention for user-entered validation. Do not invent a special grapheme-counting system solely for this task unless the repository already uses one consistently.

Expected boundaries:

```text
24 -> no advisory
25 -> no advisory
26 -> INFO advisory
```

Blank names remain allowed.

The advisory must:

- have INFO/informational severity;
- not mark the network invalid;
- not block save/import/export;
- not auto-correct or truncate the name;
- not change Undo/Redo semantics except insofar as ordinary validation recomputes from current state;
- not create persisted state.

## Message meaning

Use concise wording equivalent to:

> Character names in Starfield are limited to 25 characters.

or, if the existing validation-copy style favors softer wording:

> Starfield character names normally use up to 25 characters.

Do not imply the tracker itself enforces the limit.

Choose wording that is accurate in every locale and consistent with existing validation tone.

## Localization

Add the advisory message across the complete runtime locale set using the existing catalogue/fallback architecture.

Do not leave a new user-facing validation string untranslated where the project's localization verification requires complete coverage.

Preserve `en-GB` sparse-fallback conventions where applicable.

## Presentation

Use the normal Validation UI. Do not add a second inline counter/warning beside the character-name field unless the existing architecture already derives validation there from the shared validation system.

This brief authorizes the validation advisory, not a redesign of the character editor.

---

# 4. Export filename character-name fragment cap

## Intent

Prevent exceptionally long character names from generating unwieldy export filenames while preserving all actual user data.

## Required transformation

Use the current export-filename pipeline and preserve its sanitization rules.

Conceptually:

```text
original character name
    -> existing filename sanitization
    -> cap sanitized character-name fragment to 64 characters
    -> compose existing filename suffix/components
```

The cap applies only to the sanitized character-name fragment.

### Important distinction

If the user has a 500-character character name:

```text
Persisted/exported JSON characterName: all 500 characters
Filename character-name fragment: at most 64 characters after sanitization
```

Do not modify the canonical name in memory merely to construct the filename.

## Preserve filename structure

Do not truncate the completed filename from the right or apply a generic whole-filename cap that could remove:

- level or other established metadata;
- timestamp;
- separators;
- `.json`.

The 64-character budget belongs specifically to the character-name fragment.

## No ellipsis

A truncated fragment should simply stop at the 64-character boundary.

Do not add `…`, `...`, or any other truncation marker.

## Empty/sanitized fallback

If the current sanitizer produces no usable character-name fragment, preserve the current fallback behavior exactly.

Do not invent a new fallback label as part of this task unless the existing behavior is demonstrably broken.

## Unicode and sanitization

Preserve the existing sanitizer's Unicode/ASCII policy. This task does not authorize changing which characters are replaced, removed, normalized, transliterated, or slugified.

Apply the 64-character cap to the sanitizer's current output using the repository's established JavaScript/TypeScript string-length semantics.

Do not add a grapheme-segmentation dependency.

---

# 5. Explicit non-goals

Do not implement any of the following in this batch:

- hard character-name input limit;
- `maxLength=25` on the character field;
- truncation of imported names;
- truncation of exported JSON data;
- schema migration;
- import-envelope changes;
- raising or lowering the existing 4,096-character external-import string limit;
- resolving the 4,097-character exported-name/import mismatch;
- generalized maximum filename-length policy for every filename component;
- browser-specific download-name workarounds beyond the approved 64-character character-name fragment cap;
- token geometry (`R-COOH`, `SiH3Cl`, etc.);
- reference-data caching changes;
- on-demand localization overlays;
- Apple/WebKit fixes;
- other release polish or backlog work.

If an adjacent defect prevents the requested behavior from being implemented safely, report it instead of silently broadening scope.

---

# 6. Tests — Sol

Add or update focused automated coverage proving at minimum:

```text
en-US system display -> Sol
en-GB system display -> Sol
non-English locale -> existing localized/canonical behavior preserved
stable system ID -> unchanged
```

Use the existing reference-name/localization test layer where possible.

Do not test only a hardcoded helper if the real selector/display path can be covered cheaply by an established component/localization test.

---

# 7. Tests — character-name advisory

Add focused validation tests for:

```text
blank -> no advisory
24 characters -> no advisory
25 characters -> no advisory
26 characters -> one INFO advisory
longer name -> one INFO advisory, no duplicate issue
```

Also verify:

- the rule severity is informational;
- the name remains untouched;
- serialization preserves the full name;
- no new import rejection occurs because of the advisory;
- localized message coverage passes the normal localization verification.

If validation issues carry context/stable IDs, follow the existing conventions so the rule behaves consistently with other validation items.

---

# 8. Tests — export filename cap

Add focused tests around the sanitized character-name fragment.

Required boundaries:

```text
63-character sanitized fragment -> unchanged
64-character sanitized fragment -> unchanged
65-character sanitized fragment -> exactly 64 characters in filename fragment
very long name -> exactly 64-character fragment
```

Also include:

```text
name containing characters affected by existing sanitization
Unicode-heavy name
name that sanitizes to the existing empty/fallback case
```

For every truncation test confirm:

- the timestamp remains intact;
- `.json` remains intact;
- other established filename components remain intact;
- exported/serialized JSON still contains the full original character name;
- re-import of an otherwise normal-size exported collection preserves that full name.

Do not make test expectations depend on a new sanitizer behavior not authorized by this brief.

---

# 9. Documentation

Update durable documentation only where the new settled behavior belongs.

Likely candidates:

- `docs/DOMAIN-RULES.md` or validation documentation for the informational name advisory, if current validation rules are documented there;
- `docs/UX-DESIGN.md` only if it owns validation severity/presentation semantics and an update is necessary;
- `docs/BACKLOG.md` to mark the three corresponding pre-release polish items complete/remove stale open wording;
- import/export documentation only if it currently describes filename construction closely enough that the 64-character presentation cap belongs there.

Do not propagate temporary implementation-batch numbering into unrelated durable documentation.

Do not rewrite historical audit findings; add/update current status where appropriate.

---

# 10. Accessibility

The new validation advisory must use the existing accessible Validation presentation.

Do not:

- encode the advisory through color alone;
- create a new focus trap;
- add unnecessary focusable elements;
- rely on a tooltip as the sole message carrier.

No new Narrator investigation is authorized by this batch. Existing confirmed Narrator issues remain separately deferred.

---

# 11. Verification

Run the repository's relevant focused tests plus the full required checks for a coherent implementation batch.

At minimum:

```sh
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run build
npm run lint
git diff --check
```

If the current checkout still has the known ignored-prototype lint/root conflict, do not silently report lint as green. Use the already-established isolated-copy technique if appropriate and state exactly where lint passed and why the ordinary checkout could not run it cleanly.

Run focused tests for the changed localization/reference-name, validation, and filename helpers before the whole suite where useful.

Do not claim a check passed unless it was actually run.

---

# 12. Manual acceptance checklist

Provide a short manual checklist for the user after implementation.

At minimum:

### Sol

- Switch to `en-US`; verify the star system displays as `Sol`.
- Switch to `en-GB`; verify `Sol` remains `Sol`.
- Switch to at least one non-English locale; verify its existing official/localized presentation is unaffected.

### Character-name advisory

- Enter a 25-character name: no INFO advisory.
- Enter a 26-character name: INFO advisory appears.
- Confirm editing/saving/export remain available.
- Reduce the name to 25: advisory disappears.

### Export filename

- Export with a normal short name: filename remains unchanged in normal form.
- Export with a name whose sanitized filename fragment exceeds 64 characters: fragment is capped, but timestamp and `.json` remain visible/intact.
- Open the JSON or re-import a normal-size test export and confirm the full original character name was preserved.

No broad ten-locale visual sweep is required for this batch unless implementation touches shared layout unexpectedly.

---

# 13. Handoff requirements

At completion report:

1. files changed;
2. exact `Sol` implementation path;
3. character-name validation rule ID/severity and boundary behavior;
4. exact filename-cap implementation path and order relative to sanitization;
5. tests added/updated;
6. documentation updated;
7. automated verification results;
8. any manual checks Codex performed;
9. the short remaining user manual checklist;
10. any assumptions or deliberately deferred items.

Explicitly confirm:

- no persisted name was truncated;
- no save/import schema changed;
- no stable reference IDs changed;
- no canonical reference data was rewritten solely for `Sol`;
- no import envelope changed;
- no commit/push/deployment/publication occurred.

Suggested commit message after user acceptance:

```text
fix: finish pre-release name and reference polish
```
