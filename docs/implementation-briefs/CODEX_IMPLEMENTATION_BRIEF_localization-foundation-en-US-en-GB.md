# Codex Implementation Brief — Localization Foundation (en-US / en-GB)

## Objective

Implement the **first localization foundation** for Starfield Outpost Network.

This is a deliberately scoped first vertical slice, not a full application-wide localization conversion.

The implementation must establish a localization architecture that:

- supports `en-US` and `en-GB`;
- uses `en-US` as the default/fallback locale;
- supports browser-derived Automatic mode plus explicit persisted override;
- keeps locale preference outside `NetworkCollection`;
- presents a permanently visible locale selector on the main page beside About;
- localizes selected representative UI/reference/generated/validation/help cases;
- preserves stable reference identity and existing gameplay/network data;
- makes future locale additions straightforward for another developer working from the repository.

Do not turn this into a broad translation/refactor of every user-visible string.

---

# PART A — READ FIRST

Read:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Also read the supplied localization audit in full.

Treat these decisions as locked:

```text
fallback/default locale
    en-US

initial supported locales
    en-US
    en-GB

automatic mode
    derive from browser locale when possible
    unsupported/unresolvable browser locale => en-US

selector
    permanently visible on main page beside About

closed selector label
    effective locale tag, e.g. EN-US / EN-GB

automatic option label
    display current effective locale:
    Automatic (EN-US)
    Automatic (EN-GB)

locale option naming
    use self-identifying/autonym labels

reference display names
    canonical game terminology is fallback
    locale overlays contain deliberate presentation differences

locale ownership
    application preference, not gameplay/network state

extensibility
    adding a locale should require adding its locale module/catalogue and
    registering it in one obvious place, without component-level scaffolding
```

---

# PART B — SCOPE

Implement only the first vertical slice.

Required proof cases:

```text
1. Aluminium / Aluminum
2. Delete Network
3. one parameterized validation message
4. New Outpost / New Outpost (2)
5. one tooltip/help string
6. one plural/count string
```

Do not attempt to convert all UI strings, all validators, all history labels, or all reference-data names.

---

# PART C — LOCALE MODEL

Introduce a small typed locale model supporting:

```ts
'en-US'
'en-GB'
```

Prefer a compact structure conceptually like:

```text
src/localization/
  locale.ts
  types.ts
  catalog.ts
  formatters.ts
  referenceNames.ts
  LocalizationProvider.tsx
  locales/
    en-US.ts
    en-GB.ts
```

Exact filenames may vary.

Use `en-US` as the complete baseline/fallback catalogue. `en-GB` may initially contain overrides.

Use semantic keys, e.g.:

```text
network.delete.button
network.delete.confirmTitle
outpost.defaultName
validation.manufacturingInputUnavailable
```

Do not use English source text as keys.

Existing IDs such as `aluminium` must be treated as opaque stable identifiers. Do not regenerate IDs from localized names or migrate persisted gameplay/network data.

---

# PART D — APPLICATION PREFERENCE STORAGE

Add application-level preference storage separate from:

```text
NetworkCollection
OutpostNetwork
Undo/Redo history
import/export payloads
```

Store conceptually:

```ts
{
  localeOverride: 'en-US' | 'en-GB' | null
}
```

where `null` means Automatic.

Use a separate localStorage key.

Implement deterministic resolution:

```text
1. explicit supported override
2. supported browser locale match
3. unsupported/unresolvable browser locale => en-US
```

Initial English mapping:

```text
en-US => en-US
other en-* => en-GB
```

Examples:

```text
en-AU => en-GB
en-NZ => en-GB
```

Use `navigator.languages` where available, with sensible fallback to `navigator.language`.

Keep locale resolution testable outside React.

---

# PART E — LOCALE SELECTOR

Add a permanently visible locale selector in the main page chrome beside About.

Requirements:

- visible without opening Settings/About;
- compact and visually consistent with current institutional UI;
- no flags;
- accessible labels/titles;
- no new Settings dialog.

Closed state shows the **effective locale**:

```text
EN-US
EN-GB
```

Options:

```text
Automatic (EN-US)
English (US)
English (UK)
```

or, when Automatic resolves to UK English:

```text
Automatic (EN-GB)
English (US)
English (UK)
```

The Automatic row must update dynamically.

Locale names should identify themselves in their own language/autonym.

Changing the selector must:

- update UI immediately;
- persist explicit override or `null` for Automatic;
- not create Undo/Redo history;
- not alter network/gameplay data.

---

# PART F — LOCALIZATION API

Implement a small typed resolver supporting:

```text
stable message keys
parameter interpolation
locale fallback
missing-key detection
testability
```

Do not add a third-party localization dependency.

Do not build a custom ICU parser.

Keep the API replaceable later by something like FormatJS/react-intl.

Localized messages must own complete phrases/sentences. Do not localize fragments and concatenate them into English word order.

Prefer:

```ts
t('validation.issueCount', { count })
```

over manual singular/plural fragments.

Add only the minimal locale-aware formatting helpers required by the proof cases, using built-in `Intl` APIs where appropriate.

Do not localize export filename timestamps.

---

# PART G — REFERENCE-NAME RESOLUTION

Add a locale-aware reference display-name resolver keyed by stable identity.

Conceptual flow:

```text
stable reference record
    +
locale-specific name override
        ↓
localized display name
```

Fallback order:

```text
1. exact locale override
2. canonical runtime reference name
3. raw stable ID
```

Do not require canonical reference data to contain localized variants. Do not generate per-locale reference JSON.

## Aluminium / Aluminum proof

The stable resource ID:

```text
aluminium
```

must display as:

```text
en-US => Aluminum
en-GB => Aluminium
```

without changing identity, recipes, occurrences, saves, or reference relationships.

Important provenance:

- current `inorganic-resource-dictionary.csv` is hand-maintained and not authoritative;
- canonical game-derived data uses `Aluminum`;
- future regeneration may therefore align canonical runtime data to `Aluminum`.

The locale layer must keep working regardless of whether the canonical fallback is currently `Aluminium` or later `Aluminum`.

Therefore locale display lookup must be keyed by stable ID, not by current display text.

Keep initial reference-name overrides sparse.

---

# PART H — REQUIRED PROOF CASES

## Static UI — Delete Network

Migrate the Delete Network concept through localization, covering where practical:

```text
button/title/aria-label
confirmation dialog heading
confirmation/action label
associated explanatory copy
```

Do not leave duplicated English accessible text where the same concept is already localized.

## Parameterized validation

Choose one existing validation message containing reference names and parameters, preferably manufacturing-input-unavailable if it can be migrated cleanly.

Demonstrate:

```text
stable validation identity
structured facts/params
localized final rendering
localized reference display name
```

Do not rewrite all validators.

Use a minimal backward-compatible extension if necessary.

## Generated persisted name

Route:

```text
New Outpost
New Outpost (2)
```

through localization at creation time.

Policy:

- generate using effective locale;
- persist resulting string as ordinary outpost data;
- never rename existing outposts on locale change;
- do not infer whether an existing name is still “automatic”;
- do not add generated-name metadata.

## Tooltip/help

Migrate one representative tooltip/help path, preferably resource-aware, proving localized UI copy plus localized reference display name plus accessible/title ownership.

Do not convert the whole help system.

## Plural/count

Migrate one existing count/plural display, preferably validation issue count.

Avoid manual singular/plural fragments.

---

# PART I — HISTORY AND VALIDATION COMPATIBILITY

Do **not** restructure global history in this batch.

Preserve:

```text
global collection-level Undo/Redo
whole-collection before/after snapshots
Network + Outpost context restoration
existing history behavior
```

Existing history labels may remain final strings.

Locale changes must not create history entries.

For validation, do not force a full migration away from `message: string`.

If needed, introduce a backward-compatible structured-message path for the proof case while leaving legacy validators unchanged.

---

# PART J — DEVELOPER EXTENSIBILITY

A developer inspecting the repository should be able to add another locale by roughly:

```text
1. add locale module/catalogue
2. add reference-name overrides if needed
3. register locale in one obvious registry
4. run tests
```

Adding a locale must not require editing ordinary feature components.

Each supported locale should expose metadata conceptually equivalent to:

```ts
{
  id: 'en-GB',
  shortLabel: 'EN-GB',
  displayName: 'English (UK)'
}
```

The selector must be data-driven from the locale registry.

For migrated UI keys:

- `en-US` is the complete baseline;
- missing baseline keys should fail clearly in tests/development;
- `en-GB` may fall back to `en-US`.

For reference names:

```text
locale override
→ canonical name
→ raw ID
```

is acceptable.

---

# PART K — TESTING

Add focused tests for:

### Locale resolution

```text
explicit en-US
explicit en-GB
Automatic + browser en-US
Automatic + browser en-GB
Automatic + browser en-AU => en-GB
Automatic + unsupported/non-English => en-US
missing browser language => en-US
```

### Preference persistence

```text
Automatic/null
en-US
en-GB
invalid stored value fallback
```

### Reference names

```text
aluminium ID unchanged
en-US => Aluminum
en-GB => Aluminium
unknown/missing override fallback
```

### Selector

```text
closed label shows effective locale
Automatic row shows Automatic (effective locale)
selection updates UI
selection persists preference
locale change creates no Undo history
```

### Proof strings

Cover:

```text
Delete Network
parameterized validation
New Outpost generation path
tooltip/help
plural/count
```

Do not overfit tests to implementation-private names.

---

# PART L — PRESENTATION / UX

Match existing visual grammar:

- compact;
- pale/technical;
- no decorative card;
- no flags;
- no unnecessary panel;
- accessible focus state;
- stable placement beside About.

Apply:

> Adapt before overflowing.

Do not introduce a hard width without a demonstrated usability need.

Although the formal accessibility audit is deferred, the new control must still be keyboard-operable, semantically correct, visibly focusable, and clearly named.

---

# PART M — DOCUMENTATION

After implementation, update only durable docs genuinely affected.

Likely candidates:

```text
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
README.md
AGENTS.md
```

Record, where appropriate:

### Architecture

```text
application preference store
locale resolution/fallback
localization boundary
reference-name overlay
stable IDs remain opaque
```

### Domain

```text
locale is not gameplay/network state
generated defaults are localized at creation then persisted as ordinary data
```

### UX

```text
main-page visible locale selector
self-identifying locale labels
closed state shows effective locale
no flags
```

### Backlog

Only add future localization work where the backlog genuinely benefits, e.g.:

```text
broader UI-string migration
full validation migration
history action-key migration
future non-English translation
```

Do not add speculative locale features.

---

# PART N — OUT OF SCOPE

Do not:

```text
translate the whole application
add non-English locales
add a third-party i18n dependency
rewrite all validators
restructure all history labels
change NetworkCollection schema
include locale in import/export
rename stable reference IDs
regenerate reference datasets
rewrite CSVs
localize export filenames
redesign cargo-pad labels
perform the accessibility audit
perform the security audit
add a Settings dialog
add flags
commit
push
```

---

# PART O — VERIFICATION

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Also perform focused manual/browser checks for:

```text
Automatic locale resolution
explicit locale switch
selector placement beside About
Aluminum / Aluminium display switch
Delete Network localized path
New Outpost creation
localized validation proof
tooltip/help proof
plural/count proof
Undo/Redo unaffected
network import/export unaffected
```

If any check is not run, state why.

---

# PART P — COMPLETION REPORT

Report:

### Architecture implemented

```text
locale model
application-preference storage
resolution/fallback
localization resolver
reference-name resolver
```

### Selector behavior

```text
placement
closed-state label
Automatic row behavior
persistence
```

### Proof cases

Confirm each required proof case.

### Stable identity / persistence

Confirm:

- stable IDs unchanged;
- `NetworkCollection` schema unchanged;
- locale absent from import/export;
- existing saves remain compatible.

### Verification

Report exact results for:

```text
npm test
npm run build
npm run lint
git diff --check
```

### Files changed

List all added/modified files.

### Deferred localization work

State clearly what remains intentionally unconverted.

### Deviations

Explain any equivalent implementation chosen because of actual repository structure.

Do not commit or push.

---

## Final instruction

The goal is not maximum string coverage.

The goal is to establish a **clean, durable localization boundary** that proves:

> **The same stable application and reference-data identity can be presented correctly in en-US and en-GB, with a visible user-controlled locale selector, without contaminating network state or requiring future locale authors to modify feature components.**
