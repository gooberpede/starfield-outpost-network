# CODEX CORRECTION BRIEF — Localization Parcel C8: Final Integration Corrections

## Purpose

Apply three small, focused corrections to the completed C8 implementation before commit.

Do **not** redesign C8.

Do **not** broaden scope.

Do **not** change the authoritative three-plugin policy, builder architecture, manifest model, provider-chain model, runtime boundaries, or Parcel D handoff.

The goal is only to fix:

1. duplicated documentation in `LOCALIZATION-INPUTS.md`;
2. a drift-classification test fixture that does not exercise the intended `plugin-hash-changed` path;
3. an integration-level composed-row validator that currently permits a composed fauna entity with no required species component.

No commit or push.

---

# Context

C8 is otherwise accepted architecturally.

The implementation already provides:

```text
npm run localization:provenance:build
npm run localization:provenance:build -- --write
```

with:

- explicit authoritative source policy;
- manifest-backed reproducibility;
- installed-game drift detection;
- semantic drift classification;
- coverage reconciliation;
- English verification;
- Japanese availability verification;
- C7 provider-chain integration;
- C6 composed-fauna integration;
- deterministic regeneration;
- Parcel D handoff documentation.

Preserve all of that.

---

# Correction 1 — Remove duplicated documentation block

## Problem

`docs/localization/LOCALIZATION-INPUTS.md` contains a duplicated consecutive block covering topics including:

```text
Patch and DLC review workflow
Parcel D handoff
repository verification / validation guidance
```

The duplicated section should appear only once.

## Required correction

Remove only the duplicate copy.

Do not rewrite or materially reword the surviving section unless required to repair heading flow after deletion.

Preserve:

- patch-review policy;
- future-DLC onboarding policy;
- Parcel D handoff description;
- repository-only vs installed-game validation guidance;
- authoritative plugin policy.

## Acceptance

After correction:

- the relevant documentation appears exactly once;
- heading hierarchy remains valid;
- no unique content from either duplicate copy is lost;
- `git diff --check` passes.

---

# Correction 2 — Fix manifest drift-classification test

## Problem

The manifest-comparison test fixture currently uses:

```text
plugins
```

while the implementation compares:

```text
authoritativePlugins
```

As a result, the test still detects a stable-manifest hash change, but it falls through to the generic drift category:

```text
input-policy-or-tool-changed
```

instead of actually proving the intended:

```text
plugin-hash-changed
```

classification.

## Required correction

Update the test fixture to use the same manifest shape as production:

```text
authoritativePlugins
```

Populate the fixture with enough fields to make the plugin comparison path deterministic.

Change only the relevant plugin hash between the baseline and changed fixture.

Assert the specific expected drift classification:

```text
plugin-hash-changed
```

and, if the production drift record includes them, assert the relevant:

```text
plugin
before hash
after hash
```

fields.

## Additional expectation

Keep at least one separate test for the generic:

```text
input-policy-or-tool-changed
```

path if one already exists or if it is otherwise untested.

Do not remove broader manifest drift coverage while fixing the specific plugin-hash case.

## Acceptance

The corrected test must fail if:

- `authoritativePlugins` stops being compared;
- plugin hash changes are misclassified as generic drift;
- plugin identity is lost from the drift detail.

---

# Correction 3 — Require species component in generic composed-row validation

## Problem

The integration-level provenance row-shape validator currently permits a composed entity whose present component roles are effectively:

```text
prefix + diet
```

with no species/body component.

That contradicts the C6 contract.

For the CCT fauna naming family:

```text
0 = prefix   optional
1 = species  required
2 = diet     optional
```

The real C6 generator already guarantees species presence, and current committed data is valid, so this is not a live output defect.

However, C8's generic integration validator should enforce the same invariant rather than depending on a separate C6-specific gate.

## Required correction

Tighten:

```text
validateProvenanceRowShapes(...)
```

or the equivalent integration validator so that every entity with:

```text
DisplayNameSourceKind = composed
```

must contain exactly one:

```text
ComponentOrder = 1
ComponentRole = species
```

or the repository's exact settled species-role spelling.

Continue to enforce:

```text
ComponentOrder 0 => prefix
ComponentOrder 1 => species
ComponentOrder 2 => diet
```

where those rows are present.

Absent optional roles remain valid.

Valid current shapes remain:

```text
prefix + species + diet
species + diet
prefix + species
```

Current C6 has no species-only rows, but do not reject species-only **solely** at the generic row-shape layer unless the existing C8 contract intentionally enforces the audited current-population shape counts separately.

The generic structural invariant is:

```text
species required
prefix optional
diet optional
```

Population-specific shape/count gates can remain stricter elsewhere.

## Tests

Add focused tests for:

### Valid

```text
prefix + species + diet
species + diet
prefix + species
species only
```

at the generic validator level, unless existing design deliberately forbids species-only there.

### Invalid

```text
prefix only
diet only
prefix + diet
duplicate species
wrong role for slot 1
wrong slot for species
```

Do not loosen any existing duplicate-component or order validation.

---

# Non-goals

Do not change:

- authoritative plugin list;
- future-DLC policy;
- `SFBGS050.esm` compatibility behavior;
- manifest schema beyond what is necessary for the test fixture;
- C7 provider-chain behavior;
- C6 component order;
- Japanese preview/output behavior;
- `--write` acceptance semantics;
- drift categories other than correcting the test to prove the intended one;
- runtime/UI/persistence/schema behavior;
- Parcel D implementation.

No new audit is required.

---

# Verification

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run build
npm run lint
git diff --check
```

Also run:

```text
npm run localization:provenance:build
```

against the current installed-game inputs.

Expected result:

```text
3,539 resolved entities
4,796 provenance rows
0 unresolved
0 English mismatches
0 Japanese missing qualified IDs
0 drift
```

No committed provenance data should change as a result of these corrections.

---

# Acceptance criteria

The correction is complete when:

1. the duplicated `LOCALIZATION-INPUTS.md` block appears only once;
2. no unique documentation content is lost;
3. the manifest drift test uses `authoritativePlugins`;
4. a plugin hash-only change is classified specifically as:
   ```text
   plugin-hash-changed
   ```
5. generic manifest drift coverage remains intact;
6. composed row-shape validation requires the species component;
7. `prefix + diet` without species fails;
8. valid C6 row shapes continue to pass;
9. current committed provenance remains unchanged;
10. installed-game rebuild still reports zero drift;
11. all required verification commands pass;
12. no unrelated refactor is introduced;
13. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- which duplicate documentation block was removed;
- corrected manifest test behavior;
- exact drift type now asserted;
- composed-row validator change;
- tests added/updated;
- whether any committed provenance artifact changed;
- installed-game rebuild result;
- full verification results;
- confirmation that no architectural/runtime scope changed.

Do not proceed beyond these corrections.
