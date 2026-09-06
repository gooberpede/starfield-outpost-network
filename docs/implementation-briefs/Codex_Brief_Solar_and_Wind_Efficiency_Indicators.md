# Codex Implementation Brief — Solar and Wind Efficiency Indicators

## Objective

Add compact qualitative solar and wind efficiency indicators to Outpost Details using the canonical planetary power-reference fields already present in runtime reference data.

Implement:
1. domain-level solar/wind efficiency classification;
2. passive fixed-width Solar and Wind indicators between Body and Biome;
3. qualitative labels only;
4. no power-generation, throughput, or generator-planning calculations.

Do not commit or push.

---

## 1. Read first

Read:
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`

Inspect:
- `src/domain/referenceData.ts`
- Outpost Details component/CSS
- current System / Body / Biome layout
- reference-data loading
- regression-test conventions

---

## 2. Canonical source semantics

Runtime body fields:

```ts
solarArrayPower: number | null
windTurbinePower: number | null
```

These represent the output of the base generator on that body. The nominal base output for both the base Solar Array and base Wind Turbine is 6.

Canonical buckets:

### Solar
```text
2 -> Very Poor
4 -> Poor
6 -> Normal
8 -> Good
```

### Wind
```text
0  -> None
3  -> Poor
6  -> Normal
10 -> Good
```

The current canonical directory contains no populated values outside these sets.

Do not modify canonical reference values.

---

## 3. Domain classification

Add a small domain helper/module.

Preferred conceptual types:

```ts
type SolarEfficiency =
  | 'very-poor'
  | 'poor'
  | 'normal'
  | 'good'
  | 'unknown'

type WindEfficiency =
  | 'none'
  | 'poor'
  | 'normal'
  | 'good'
  | 'unknown'
```

Possible helpers:

```ts
getSolarEfficiency(solarArrayPower: number | null): SolarEfficiency
getWindEfficiency(windTurbinePower: number | null): WindEfficiency
```

Exact names may follow repository conventions.

Keep this logic out of React.

### Null semantics

```text
null -> unknown
```

Do not treat null wind as `None`.

`None` specifically means:

```text
windTurbinePower === 0
```

If a selected/current body cannot resolve, presentation should fall back to unknown.

### Optional multipliers

It is acceptable to retain or expose the corresponding multiplier internally for future planner use if this remains simple, e.g. `8 / 6`.

Do not expose multipliers in the current UI.

Do not add generator-output calculations or rounding rules.

---

## 4. UI placement

Insert two passive fields between Body and Biome:

```text
System              Body             Solar    Wind     Biome
[ Select system... ][              ] [ Good ] [ Poor ] [B1] [B2] [B3]
```

Required order:

```text
System
Body
Solar
Wind
Biome
```

Do not change System, Body, or Biome behaviour.

---

## 5. Display labels

Use compact labels:

### Solar
```text
Very Poor -> V.Poor
Poor      -> Poor
Normal    -> Norm.
Good      -> Good
Unknown   -> —
```

### Wind
```text
None      -> None
Poor      -> Poor
Normal    -> Norm.
Good      -> Good
Unknown   -> —
```

These labels are presentation-only.

---

## 6. Fixed-width indicators

Solar and Wind indicators must have a fixed width.

Switching between outposts must not cause the controls to shift horizontally.

Both fields should use the same compact width sufficient for:

```text
V.Poor
Norm.
Good
None
—
```

Do not size by content.

---

## 7. Visual treatment

These are passive status indicators, not buttons.

They should look like compact read-only/status values rather than biome toggles.

Do not add:
- click handlers;
- editable state;
- icons;
- numeric output;
- multiplier tooltips.

Do not rely on colour alone to communicate the value.

---

## 8. Derived presentation only

Do not persist efficiency.

When Body changes:
- indicators update immediately from reference data;
- no extra Undo entry;
- no schema changes.

When no body is selected:

```text
Solar = —
Wind = —
```

If a persisted body resolves despite other validation issues, show its efficiency normally.

If it does not resolve, show `—`.

---

## 9. Layout constraints

Preserve the current top-aligned location-field grammar.

Biome buttons must continue wrapping only inside the Biome region.

Adding Solar/Wind must not make wrapped biome rows flow under System/Body/Solar/Wind.

A modest Outpost Details grid-column adjustment is acceptable if necessary.

Do not alter:
- navigation width;
- Cargo Pads width;
- workspace shell;
- scrollbars.

---

## 10. No numeric or planning UI

Do not display:
- raw values 2/4/6/8 or 0/3/6/10;
- multipliers;
- percentages;
- power units;
- Solar Dome output;
- Advanced Wind Turbine output;
- generator counts;
- outpost power balance.

This app iteration is not modelling quantitative power generation.

---

## 11. Tests

Add regression coverage.

### Solar
```text
2    -> very-poor
4    -> poor
6    -> normal
8    -> good
null -> unknown
```

### Wind
```text
0    -> none
3    -> poor
6    -> normal
10   -> good
null -> unknown
```

Also test display mapping where practical:

```text
very-poor -> V.Poor
normal    -> Norm.
unknown   -> —
```

For unsupported future populated values, either:
- return `unknown` with a documented contract; or
- fail/assert clearly in the domain layer.

Do not silently map arbitrary values to the nearest bucket.

---

## 12. Canonical-data sanity check

Verify current generated/reference data contains only:

```text
Solar: {2, 4, 6, 8}
Wind:  {0, 3, 6, 10}
```

for populated values.

Report any exception.

Do not modify source data.

---

## 13. Documentation

Update `docs/DOMAIN-RULES.md` with:
- raw fields are base-generator output on the body;
- bucket mappings;
- wind `0` = no wind power;
- null = unknown/not applicable;
- current UI is qualitative only.

Update `docs/ARCHITECTURE.md` with:
- efficiency is derived from reference data;
- no persisted efficiency state.

Update `docs/BACKLOG.md`:
- remove/adjust completed qualitative-indicator item;
- retain deferred power calculations, advanced generator output, generator counts, planner preference logic, throughput, and future rounding semantics.

---

## 14. Scope exclusions

Do not implement:
- power demand/supply calculations;
- generator planning;
- numeric outputs;
- heatmaps;
- icons;
- persistence/schema changes;
- validation rules;
- network lifecycle changes;
- Ocean-biome logic;
- scrollbars;
- broad visual redesign.

---

## 15. Verification

Run the full regression suite, then:

```text
npm run lint
npm run build
git diff --check
```

Browser smoke-test at minimum:

1. no body -> `— / —`;
2. Solar Very Poor -> `V.Poor`;
3. Solar Normal -> `Norm.`;
4. Solar Good -> `Good`;
5. Wind 0 -> `None`;
6. Wind Poor -> `Poor`;
7. Wind Normal -> `Norm.`;
8. Wind Good -> `Good`;
9. switching bodies does not shift Biome horizontally;
10. indicator widths stay fixed;
11. biome wrapping remains contained;
12. no console errors;
13. no temporary test edits remain.

---

## 16. Completion report

Report:
1. files changed;
2. final bucket types/helper API;
3. whether multipliers were retained internally;
4. raw-value -> bucket mapping;
5. bucket -> display-label mapping;
6. UI placement and fixed width;
7. canonical-data sanity result;
8. tests added/updated and total passing;
9. lint result;
10. build result;
11. `git diff --check` result;
12. browser smoke-test result;
13. confirmation no persistence/schema/power-calculation behaviour changed;
14. any future power-planning follow-up discovered.

Do not commit or push.
