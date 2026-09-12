# CODEX IMPLEMENTATION BRIEF — Localization Parcel B4: Japanese Catalogue Closure Gate

## Purpose

Perform a **lightweight closure and release-readiness verification** for the tracker-authored Japanese catalogue.

This is **not** a new implementation parcel.

The heavy translation work was completed in B1–B3. Parcel B4 exists to confirm the committed state is internally consistent, complete, and ready to hand off to:

- Parcel C: canonical localized-string provenance;
- Parcel D: official Bethesda terminology extraction/generated overlays;
- Parcel E: Japanese search/font/layout hardening.

Do not broaden B4 into any of those later parcels.

Do not commit or push.

---

# Cost / scope classification

**Local / low-cost verification task.**

Expected work:

- verification;
- small test/doc adjustments only if genuinely needed;
- short Japanese browser smoke test;
- backlog/audit closure notes.

Do not perform opportunistic refactors.

If B4 reveals a real defect, fix only if it is clearly within tracker-authored Japanese catalogue scope and is small.

Otherwise record it under the appropriate later parcel.

---

# Current state

B1–B3 are committed and synced.

The intended committed Japanese localization state includes:

- complete `ja-JP` tracker-authored catalogue;
- 330 semantic messages;
- exact key parity with `en-US`;
- reviewed placeholder parity;
- reviewed protected tokens;
- reviewed ICU message syntax;
- Japanese locale registration and Automatic locale matching;
- self-label `日本語`;
- comparative adjudication against an independent DeepL pass;
- explicit Bethesda terminology deferrals;
- durable Japanese glossary/style guide;
- durable translation audit;
- third-party provenance documentation.

B3 adjudication result:

- `AUTO_ACCEPT_AGREEMENT`: 60
- `ACCEPT_CODEX`: 147
- `ACCEPT_DEEPL`: 3
- `REWRITE`: 6
- `DEFER_BETHESDA`: 114
- confidence:
  - 217 HIGH
  - 113 MEDIUM
- 13 difficult HIGH-risk rows received a genuine second reasoning pass;
- total B3 catalogue changes from the B1 draft: 25.

Treat the current repository state as authoritative.

Do not reopen adjudication unless verification identifies an actual defect.

---

# Important source boundaries

B4 verifies **tracker-authored Japanese** only.

Do not attempt to resolve Bethesda-owned reference terminology here.

Known deferred areas include examples such as:

- X-Tech;
- X-Tech Power Cores;
- Outpost;
- Cargo Pad;
- Inter-System cargo terminology;
- official Starfield skill names;
- systems;
- planetary bodies;
- biomes;
- resources;
- products;
- species.

These belong to Parcels C/D.

Do not machine-translate those terms as part of B4.

---

# Working files

The user's untracked translation working area is:

`D:\Projects\starfield-outpost-network\.local-work\translation\jp`

B4 should **not depend** on the working folder for correctness if the committed repository already contains all durable results needed for closure.

If useful for cross-checking, you may inspect local working artifacts there, including the final adjudication CSV.

Do not move or commit working-only translation files.

---

# Required verification

## 1. Catalogue completeness

Verify:

- `ja-JP` contains exactly the same tracker-authored keys as `en-US`;
- expected key count is still 330;
- no missing Japanese tracker message;
- no duplicate semantic key;
- no stale key removed from `en-US`;
- no extra accidental `ja-JP` key.

If the current localization tooling already proves this, reuse it.

Do not add redundant infrastructure.

---

## 2. Placeholder and ICU integrity

Verify:

- placeholder names match `en-US` exactly for every key;
- no placeholder identifier was translated;
- ASCII braces remain valid;
- ICU plural/select syntax remains structurally valid;
- no DeepL-corrupted ICU syntax entered runtime catalogue.

Pay special attention to the rows previously known to have DeepL placeholder/token/ICU damage.

---

## 3. Protected tokens

Verify representative protected/invariant content remains intact where required, including categories such as:

- `Starfield`
- `X-Tech`
- `X-Tech Power Cores`
- `He-3`
- `JSON`
- `.json`
- keyboard tokens such as `Ctrl`, `Shift`, `Esc`, `Z`
- stable/raw IDs where surfaced
- legal/credit wording where protected.

Do not assume all English-looking words are protected.

Use the glossary/current localization metadata as the authority.

---

## 4. Residual English tracker-owned fallback

Perform a focused audit for unintended English in Japanese mode.

Important distinction:

### Expected English / non-Japanese content

Do **not** flag as a B4 failure when English originates from:

- Bethesda-owned reference names awaiting C/D;
- player-authored names;
- technical tokens;
- stable IDs;
- abbreviations;
- filenames/extensions;
- deliberately invariant proper names.

### Unexpected English

Flag tracker-authored UI text that:

- should have a `ja-JP` catalogue entry;
- incorrectly falls back to `en-US`;
- is still hard-coded English in a visible/accessibility/status/help/history path.

Prefer semantic/key-based verification over naive ASCII regex scanning.

If a genuine tracker-authored English fallback is found, fix it only if the correction is small and clearly B4-local.

---

## 5. Runtime locale behavior

Verify:

- Japanese is selectable as `日本語`;
- closed selector displays `日本語`;
- `ja`, `ja-JP`, and `ja-*` browser locales still resolve correctly;
- `<html lang>` becomes `ja-JP`;
- user locale preference remains presentation-only and does not affect domain/persistence/history ownership;
- switching locale does not persist Japanese presentation text into domain records.

Do not reopen Parcel A architecture unless an actual regression is found.

---

# Targeted Japanese browser smoke test

Perform one short representative browser pass.

Do not conduct visual-polish work.

Cover enough surfaces to catch runtime fallback or integration regressions:

- locale selector;
- navigation;
- Outpost Details;
- Resource Matrix;
- Planned Supply;
- Cargo Pads;
- Search;
- validation panel;
- About;
- import/export controls;
- a confirmation dialog;
- status feedback;
- Undo/Redo history text.

Verify:

- tracker-authored text renders in Japanese;
- expected Bethesda-owned names may remain English;
- no console errors;
- no broken placeholders/ICU output;
- no obvious raw semantic keys exposed;
- `<html lang="ja-JP">`;
- no page-level horizontal overflow.

If wrapping or font-fallback issues are visible but still usable, record them for Parcel E rather than fixing them.

---

# Parcel-boundary triage

Every issue found in B4 should be classified as one of:

```text
B4_BLOCKER
C_D_BETHESDA_TERMINOLOGY
E_LAYOUT_FONT_SEARCH
F_RELEASE_VERIFICATION
BACKLOG_NONLOCALIZATION
```

Use:

## B4_BLOCKER

Only for defects that mean the tracker-authored Japanese catalogue is not actually complete/integrated, such as:

- missing Japanese tracker key;
- English fallback from tracker copy;
- broken placeholder/ICU syntax;
- locale-selection regression;
- runtime rendering failure.

## C_D_BETHESDA_TERMINOLOGY

For unresolved official game terminology or reference-name localization.

## E_LAYOUT_FONT_SEARCH

For:

- Japanese font quality;
- glyph fallback;
- line wrapping;
- control sizing;
- Japanese search behavior;
- NFKC/search normalization;
- English alias behavior;
- other layout/search hardening.

## F_RELEASE_VERIFICATION

For whole-product release checks not specific to Japanese catalogue closure.

Do not fix later-parcel issues in B4.

---

# Durable documentation

Update existing durable documentation only as needed to record that Parcel B is closed.

Likely candidates:

- `docs/ARCHITECTURE.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- `docs/audits/codex-japanese-translation-review.md`

Do not create a large new audit unless the project already has a convention requiring one.

Preferred documentation outcome:

- mark B1–B4 tracker-authored Japanese catalogue work complete;
- note that 114 Bethesda-dependent decisions remain intentionally provisional pending C/D;
- note that visual/font/search hardening remains deferred to E;
- note that no native-speaker review was available, while future native review remains useful if it becomes available;
- confirm B4 did not perform Bethesda string extraction or Japanese layout hardening.

Keep documentation concise.

---

# Third-party provenance

No change to `docs/THIRD-PARTY-REFERENCES.md` is needed merely because B4 reruns verification.

Only update it if B4 actually introduces another third-party tool/service or materially changes how an existing one was used.

The OpenAI/Codex entry should remain broad and category-based rather than being updated parcel-by-parcel.

Do not turn the provenance ledger into a chronological implementation diary.

---

# Tests

Reuse existing tests wherever possible.

Only add/modify tests if B4 uncovers an uncovered regression or a missing closure assertion.

Useful existing guarantees should include:

- Japanese locale registration;
- browser-locale resolution;
- complete Japanese catalogue;
- placeholder parity;
- protected-token handling;
- representative Japanese rendering;
- document language;
- history/status/help/validation Japanese paths.

Avoid broad snapshot tests.

---

# Verification commands

Run at minimum:

```text
npm run localization:review
npm test
npm run reference:test
npm run reference:build
npm run build
npm run lint
git diff --check
```

If there is a dedicated localization integrity/review generation command beyond the above, run it too.

Report exact pass counts where useful.

---

# Expected code change profile

The ideal B4 result is:

- zero production-code changes;
- possibly small documentation/status changes;
- possibly small test correction if verification exposes a real gap.

A zero-code B4 is a successful outcome.

Do not manufacture code changes to make the parcel look substantive.

---

# B4 completion report

Report:

- whether catalogue parity remains 330/330;
- placeholder/ICU result;
- protected-token result;
- residual-English audit result;
- runtime locale-selector and `<html lang>` result;
- browser smoke-test result;
- any B4 blockers found/fixed;
- any issues deferred to C/D;
- any issues deferred to E;
- docs updated;
- tests/build/lint/reference results;
- confirmation that no BA2/string extraction, reference-name overlay, font/layout hardening, search hardening, persistence, or schema work occurred.

Do not commit or push.

---

# Acceptance criteria

Parcel B4 is complete when:

- the committed Japanese tracker catalogue still has full 330-key parity;
- no tracker-authored Japanese key is missing;
- no unintended tracker-authored English fallback remains;
- placeholder/ICU/protected-token integrity passes;
- Japanese locale selection and Automatic resolution work;
- `<html lang>` is correct;
- representative runtime Japanese paths render successfully;
- expected Bethesda-owned English/reference fallback is correctly distinguished from localization failure;
- later-parcel issues are recorded rather than fixed;
- documentation marks tracker-authored Japanese catalogue work complete;
- all required checks pass;
- no commit or push is performed.

At that point Parcel B is closed and the project is ready to proceed to Parcel C.
