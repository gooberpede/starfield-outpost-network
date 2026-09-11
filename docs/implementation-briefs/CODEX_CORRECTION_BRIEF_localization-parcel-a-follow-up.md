# CODEX CORRECTION BRIEF — Localization Parcel A Follow-Up

## Purpose

Apply a **small, focused correction pass** to the completed Localization Parcel A implementation before it is committed.

Do **not** revisit the broader semantic localization migration unless required to fix the two issues below.

The two required corrections are:

1. restore locale-independent persisted `CargoPad.label` generation; and
2. correct biome localization lookups so they use the actual stable `BiomeReference.id`, not body-biome IDs, group keys, or derived English labels.

Add regression tests for both.

Afterward, rerun the full verification suite.

---

## Context

The main Parcel A implementation is otherwise considered sound.

Keep intact:

- the 330-key `en-US` semantic catalogue;
- sparse `en-GB`;
- validator semantic descriptors;
- localized validation presentation;
- history descriptors;
- status/import localization;
- formatter helpers;
- document `<html lang>` synchronization;
- accessibility/help/tooltip migration;
- current test additions;
- documentation updates.

Do not perform unrelated cleanup.

---

# Correction 1 — Do not persist locale-dependent Cargo Pad labels

## Problem

The Parcel A diff changed persisted Cargo Pad label generation from an invariant English value such as:

```ts
label: `Pad ${index + 1}`
```

to localized presentation text such as:

```ts
label: t('cargo.pad.summary', { ordinal: index + 1 })
```

in multiple `App.tsx` paths.

`CargoPad.label` is persisted network data.

This means that once `ja-JP` exists, creating/reordering pads under Japanese could write Japanese presentation text into the saved network, while the same operations under English write English.

That violates the intended localization/state boundary.

Visible Cargo Pad ordinals are already presentation-derived and should be localized at render time.

## Required fix

Restore persisted `CargoPad.label` generation to a locale-independent invariant value.

For now, retain the existing legacy form:

```ts
label: `Pad ${index + 1}`
```

or an exactly equivalent invariant construction.

Do not localize the persisted field.

Where visible UI needs to show `Pad 1`, `Pad 2`, etc., continue using localized presentation:

```ts
t('cargo.pad.summary', { ordinal })
```

or the appropriate existing semantic key.

## Scope

Find **all** paths that create, regenerate, reorder, duplicate, normalize, or otherwise rewrite `CargoPad.label`.

Ensure none of them depend on the active locale.

Do not redesign or remove the persisted `CargoPad.label` field in this correction.

That remains a separate backlog/migration concern.

## Regression tests

Add tests proving at minimum:

- Cargo Pad persisted labels are identical under `en-US` and `en-GB`;
- changing locale does not mutate existing `CargoPad.label` values;
- any operation that regenerates/reorders pads does not persist localized text;
- visible presentation can still localize the derived pad ordinal independently.

If existing tests already cover some of this, extend them rather than duplicating them.

---

# Correction 2 — Use stable BiomeReference identity for localization

## Problem

The Parcel A implementation correctly started routing more biome names through `getReferenceDisplayName(...)`, but several new calls use the wrong key.

Examples observed in the diff include lookups conceptually like:

```ts
getReferenceDisplayName('biome', bodyBiomeId, biome?.name, locale)
```

or:

```ts
getReferenceDisplayName('biome', group.key, group.label, locale)
```

or:

```ts
getReferenceDisplayName('biome', name, name, locale)
```

These identifiers are not the stable biome reference identity.

The important distinction is:

```text
BiomeReference.id
    = stable localization/reference identity

BodyBiome.id
    = body-specific occurrence/selection identity

BiomeButtonGroup.key
    = UI grouping identity, possibly concatenated BodyBiome IDs

BiomeButtonGroup.label
    = derived presentation text
```

Future Japanese reference-name overlays will be keyed by stable biome reference IDs.

If current lookups use body-biome IDs, group keys, or English names, those overlays will silently fail and fall back to English.

## Required fix

Audit every call to:

```ts
getReferenceDisplayName('biome', ...)
```

and ensure the `id` argument is the actual stable `BiomeReference.id`.

When starting from a `BodyBiomeId`:

```text
BodyBiome.id
    -> BodyBiome.biomeId
    -> BiomeReference.id
```

Use `BodyBiome.biomeId` as the localization key.

When starting from a grouped biome UI structure, ensure the structure retains enough stable biome identity to localize the base biome name correctly.

Do not use:

- `BodyBiome.id`;
- concatenated body-biome group keys;
- derived labels;
- canonical English biome names;

as the localization key.

---

## Numbered/derived biome-group labels

Some biome groups may require labels such as conceptually:

```text
Frozen Plains 1
Frozen Plains 2
```

The base biome name and the disambiguating ordinal have different ownership.

Correct model:

```text
stable BiomeReference.id
    -> localized base biome name

group position/index
    -> tracker-owned disambiguating ordinal
```

Then render the combined presentation through semantic localization if sentence/order structure can vary by locale.

Do not make the full derived English label the localization identity.

If `BiomeButtonGroup` currently only exposes:

```ts
key
label
bodyBiomeIds
biomeIndex
```

and that is insufficient, make the **smallest** structural change necessary so presentation has access to the stable underlying `biomeId` plus any ordinal/disambiguation metadata.

A likely direction could be:

```ts
interface BiomeButtonGroup {
  key: string
  biomeId: BiomeId
  bodyBiomeIds: BodyBiomeId[]
  biomeIndex: number
  ordinal?: number
}
```

but use the repository's actual types and naming conventions.

Do not redesign biome grouping logic unnecessarily.

---

## Validation presentation

Pay particular attention to biome lookups in:

- `src/ui/validationPresentation.ts`;
- body/biome context formatting;
- unavailable-resource/biome diagnostics;
- issue navigation/presentation.

If a validation issue carries only a `BodyBiomeId`, resolve:

```text
BodyBiomeId
    -> BodyBiome
    -> BiomeReference
```

before calling the reference-name resolver.

Preserve raw unknown IDs where resolution fails.

---

## Other biome consumers

Audit all new Parcel A biome-reference localization paths, including:

- biome selector/group labels;
- help/context text;
- validation messages;
- tooltips;
- Outpost Details;
- any direct helper calls introduced in Parcel A.

The correction is complete only when every biome display lookup uses stable `BiomeReference.id` where a canonical biome exists.

---

## Regression tests

Add focused tests proving:

- a body-biome occurrence resolves display text through its underlying `BiomeReference.id`;
- multiple `BodyBiome` rows referencing the same biome use the same localization identity;
- a grouped biome key is not used as the reference-name key;
- numbered duplicate biome groups localize the base biome name while retaining distinct ordinals;
- canonical fallback still works when no overlay exists;
- unknown/missing biome references still degrade safely.

A useful future-facing test is to inject a synthetic biome-name override and prove it appears through:

- biome selector/group presentation;
- validation presentation;

without changing body-biome identity.

Do not add Japanese content just to test this. A synthetic/test override is sufficient.

---

# Non-blocking observations — do not expand scope

The following were noted during review but **should not block this correction** unless a small change is directly necessary for the two fixes:

## Import error mapping

Current import failure presentation appears to recognize some known errors by matching existing English `Error.message` text.

This is acceptable for Parcel A.

Do not refactor the serialization layer into typed domain errors in this correction.

That can be revisited later if needed.

## Message parameter typing

`MessageParameters` remains relatively broad and runtime/template validation handles missing/unexpected parameters.

This is acceptable for now.

Do not introduce a large key-specific type-system rewrite here.

## Residual-English scanner

The current targeted scanner is a guardrail rather than a proof of completeness.

Leave it as-is unless one of the two corrections requires updating its allowlist.

---

# Verification

Run the full Parcel A verification suite again:

```text
npm test
npm run build
npm run lint
npm run reference:test
npm run reference:build
git diff --check
```

Also run any focused tests added for these corrections.

Manual/browser smoke checks should include:

1. switch `en-US` ↔ `en-GB`;
2. create/reorder Cargo Pads;
3. verify displayed pad summaries remain localized as intended;
4. verify persisted `CargoPad.label` values do not change with locale;
5. exercise a body with repeated/grouped biome labels;
6. verify biome selector/help/validation display still renders correctly;
7. verify Undo/Redo and document language remain unaffected.

---

# Final report

Report:

- every Cargo Pad label-generation path corrected;
- confirmation that persisted pad labels are locale-independent;
- biome localization call sites corrected;
- any `BiomeButtonGroup` type/shape change made;
- tests added;
- full verification results;
- confirmation that no Japanese catalogue, Bethesda extraction, network schema migration, or unrelated feature work was introduced.

Do not commit or push unless explicitly instructed.

---

# Acceptance criteria

This correction is complete when:

- persisted `CargoPad.label` values no longer depend on locale;
- visible Cargo Pad ordinal text remains localizable;
- every biome reference-name lookup uses stable `BiomeReference.id`;
- body-biome/group identities remain separate from localization identity;
- numbered biome groups localize the base biome correctly;
- regression tests cover both fixes;
- the original Parcel A behavior remains intact;
- all verification checks pass.
