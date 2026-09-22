# CODEX IMPLEMENTATION BRIEF — Post-Localization Cleanup Foundation

## Objective

Begin the repository-wide **post-localization cleanup** programme now that the full V1 locale-onboarding programme is complete.

This is no longer a Simplified Chinese onboarding task.

Treat the supported V1 locale set as complete within its documented scope and move the project onto program-level cleanup, measurement, and cross-locale review.

This first cleanup tranche should:

1. finalize locale-selector ordering;
2. relocate working XLIFF handoff artifacts out of durable tracked documentation into the ignored local-work area;
3. update the tooling/docs/tests that assume the old XLIFF location;
4. measure the final production localization/bundle/startup footprint now that all V1 locales exist;
5. perform a read-only cross-locale compact-layout capacity review using the real completed catalogues;
6. reconcile the known shared accessibility follow-up inventory against the now-complete locale set;
7. create a clean handoff to later targeted work without implementing speculative fixes.

Do **not** reopen any completed locale onboarding work unless this tranche finds a concrete cross-locale defect.

---

# 1. Programme boundary

The localization onboarding programme is complete.

Supported V1 locale/runtime set:

```text
English (US)
English (UK)
French
German
Italian
Japanese
Polish
Portuguese (Brazil)
Simplified Chinese
Spanish (Spain)
```

`en-GB` remains a sparse English override rather than a separate Bethesda-language source population.

Simplified Chinese is closed/supported within the documented tested Windows/Chromium scope. Its onboarding plan and QA audit are historical/durable evidence and are no longer the active parent context for new work.

Do not append new cleanup findings back into:

`docs/audits/SIMPLIFIED-CHINESE-LOCALE-ONBOARDING-PLAN.md`

except to correct a factual historical error if one is discovered.

Future cleanup findings should live in program-level documentation appropriate to their concern.

---

# 2. Durable sources to inspect first

Before editing, inspect at minimum:

```text
AGENTS.md
docs/BACKLOG.md
docs/localization/LOCALE-ONBOARDING.md
docs/audits/SIMPLIFIED-CHINESE-LOCALE-QA.md
docs/audits/SIMPLIFIED-CHINESE-LOCALE-ONBOARDING-PLAN.md
package.json
src/localization/
scripts/localization/
tests/
docs/localization/
```

Also inspect any existing bundle/performance or layout/accessibility audit/benchmark documents relevant to the work below.

Respect the repository-wide documentation convention in `AGENTS.md`:

- temporary numbered Steps/Parcels/Batches/Phases/Tranches must not leak into unrelated durable documents;
- durable documents should describe the actual state, feature, finding, or work directly;
- document-owned sequences may retain their own numbering internally.

Do not propagate onboarding-plan numbering into new cleanup reports.

---

# 3. Settled product decisions

The following decisions are already approved and are not open questions for this tranche.

## 3.1 Final locale-selector ordering

Use this final selector order:

```text
English (US)
English (UK)
French
German
Italian
Japanese
Polish
Portuguese (Brazil)
Simplified Chinese
Spanish (Spain)
```

Rule:

- English variants first;
- all other locales alphabetically by their English language name.

Do not sort by onboarding chronology.
Do not make ordering depend on the currently selected locale.
Do not use script/collation order for the selector itself.

Preserve self-identifying localized display labels.

---

## 3.2 XLIFF policy

Tracked `.xliff` files under durable documentation are working handoff artifacts, not the durable proof of localization decisions.

Move working XLIFF handoffs to an ignored local path under:

```text
.local-work/localization/
```

Use a deterministic per-locale structure consistent with current tooling conventions.

After tooling/defaults/docs/tests have been updated and verified:

- remove the tracked working `.xliff` handoff files from the live repository tree;
- do not retain duplicate tracked copies under `docs/localization/`;
- Git history is sufficient historical retention of previously committed handoff files.

Durable evidence that **must remain tracked** includes, as applicable:

```text
review CSVs
glossaries
locale profiles/status documentation
provenance manifests
reference-name manifests
final semantic catalogues
generated/runtime reference overlays
fauna/reference evidence
audit/closure records
```

Do not delete durable adjudication/review evidence merely because the working XLIFF moves.

---

## 3.3 Measurement before optimization

Do not implement lazy locale loading in this tranche.

Measure first:

```text
bundle composition
raw size
gzip/Brotli size where available
locale catalogue contribution
reference-overlay contribution
parse/startup cost where measurable
initial application startup behavior
```

Only after measurements exist may a later brief decide whether lazy loading or another bundle architecture change is justified.

A Vite chunk-size advisory alone is not evidence that architectural change is required.

---

## 3.4 Audit before layout correction

Do not implement cross-locale geometry/layout fixes in this tranche unless required to repair a regression caused directly by the selector/XLIFF work.

The compact-layout review is evidence gathering.

If it finds real defects:

```text
record them
classify them
identify affected locales/surfaces
recommend a later targeted UI brief
```

Do not opportunistically change control widths, wrapping, matrix geometry, header geometry, responsive breakpoints, or shared layout CSS.

---

## 3.5 Accessibility follow-up boundary

Reconcile the known shared Narrator/shortcut/focus issues now that all locales are complete, but do not implement corrections here unless a documentation-only reconciliation is required.

This tranche may:

- confirm which issues remain reproducible/shared;
- distinguish platform behavior from application behavior where evidence supports it;
- retire stale findings that are demonstrably obsolete;
- consolidate duplicate backlog/audit references.

It must not:

- reassign keyboard shortcuts;
- redesign focus behavior;
- change accessible names/descriptions;
- alter screen-reader-specific runtime code;
- introduce locale-specific accessibility workarounds.

Any correction-worthy accessibility result should become a separate later brief.

---

# 4. Locale-selector implementation

Update the selector ordering to the settled final order.

Prefer a clear centralized source rather than scattered per-component ordering.

Preserve:

- stable `SupportedLocale` identities;
- runtime registry membership;
- browser-locale resolution behavior;
- automatic locale behavior;
- display labels;
- semantic catalogues;
- persistence behavior;
- `document.lang`;
- search/collation behavior.

Do not reorder internal IDs, manifests, build verification, or any unrelated structure merely to match the selector UI unless ordering is explicitly user-visible and intended.

Add or update tests that assert the final selector order.

---

# 5. XLIFF relocation

## 5.1 Inventory

Identify every tracked working `.xliff` handoff currently under durable repository paths.

Record:

- locale;
- current path;
- generator/export command or default that produces it;
- import/adjudication path that consumes it;
- tests/docs that assume its current location.

Do not infer that every `.xliff` file is disposable without checking its role.

---

## 5.2 New working location

Move the active working handoff convention under ignored local work, e.g.:

```text
.local-work/localization/<locale>/
```

Choose deterministic filenames consistent with existing locale tooling.

Update:

- generator defaults;
- import/adjudication defaults;
- documentation examples;
- tests that intentionally assert working paths;
- `.gitignore` only if needed and only narrowly.

Do not weaken validation of:

```text
locale identity
stable keys
source hashes
placeholder/protected-token integrity
XLIFF structure
adjudication inputs
```

Relocation is a storage/workflow change, not a relaxation of the localization contract.

---

## 5.3 Remove tracked working handoffs

Once new defaults/tests are green:

- delete tracked working XLIFF handoff files from the live repository tree;
- retain durable review evidence;
- verify no build/runtime path depends on those tracked handoffs.

Do not regenerate or alter accepted translations during this relocation.

No locale catalogue or official reference-name value should change.

---

# 6. Final localization bundle/startup measurement

Create a **read-only measurement report** under the established benchmark/documentation convention.

Preferred location:

```text
docs/benchmarks/
```

Use an appropriately descriptive filename such as:

```text
LOCALIZATION-BUNDLE-AND-STARTUP-REVIEW.md
```

Exact filename may follow existing repository naming conventions.

Measure the final all-locale production state.

At minimum report:

```text
production build total raw size
main JS chunk raw size
main JS chunk gzip/Brotli size if tooling exposes it reliably
CSS size
reference-data asset size
semantic catalogue source/bundled contribution where measurable
localized reference-overlay source/bundled contribution where measurable
per-locale broad contribution where practical
startup/load/parse measurements available from the existing environment
existing Vite chunk warning status
```

Where precise attribution is not technically reliable, say so rather than inventing numbers.

Use repeatable commands and record the environment/runtime used.

Do not add a new dependency merely to obtain prettier metrics if existing tooling/platform capabilities are sufficient.

---

# 7. Decision gate for lazy loading

The report should end with one of these evidence-based outcomes:

```text
A. No architecture change currently justified.
B. Further profiling warranted before architecture change.
C. Lazy loading or another loading strategy is worth a dedicated design/implementation brief.
```

Do **not** implement the recommendation in this tranche.

If the current app remains comfortably small/fast, explicitly preserve the existing simple static architecture.

---

# 8. Cross-locale compact-layout capacity review

Create a read-only program-level review using **all completed real catalogues**.

Preferred durable location:

```text
docs/audits/
```

Use a program-level title, not a Simplified Chinese title.

Review the actual final locale set across the known high-pressure surfaces, including at minimum:

```text
application/page header
locale selector
Navigation
Outpost Details
Solar/Wind indicators
Resource Matrix headings/cells
Planned Supply
Cargo Links
Search field/placeholder/results
Validation/status surfaces
Help
About
destructive dialogs
```

Use representative real strings from every supported locale rather than synthetic placeholder expansion where practical.

At minimum assess:

```text
1366×768 baseline
1600-class desktop baseline
true browser 200% zoom where the environment supports repeatable testing
visible clipping
overflow
ellipsis/truncation
misalignment
control collision
unexpected vertical growth
fixed/nowrap capacity pressure
page-level horizontal overflow
```

Do not mistake intentional ellipsis or internally scrollable regions for defects without reference to existing UX contracts.

---

# 9. Capacity-review classification

For every finding, classify it as one of:

```text
locale-specific defect
shared cross-locale defect
shared capacity pressure / polish debt
expected/intentional behavior
environment/platform limitation
no issue
```

Do not create a correction simply because one language is longer.

Prefer evidence about whether meaning, operability, focus visibility, or layout integrity is actually compromised.

Where the current backlog already records the issue, reconcile rather than duplicate it.

Known examples worth checking include:

```text
localized Search placeholder truncation
localized Very Poor Solar/Wind capacity
Polish/shared compact header pressure
long flora/fauna names
fixed-chrome focus occlusion at high magnification
```

Do not assume those findings remain current; verify.

---

# 10. Shared accessibility follow-up reconciliation

Review the current durable accessibility follow-up items now that locale onboarding is complete.

At minimum inspect known/shared issues around:

```text
Narrator interception of global shortcuts
Narrator omission of shortcut chord speech
Solar announcement/focus ambiguity
Resource Matrix visible focus indication
compact Cargo/Matrix context
Cargo Undo collapse/presentation behavior where accessibility context overlaps
fixed-chrome focus visibility
```

This should primarily be a **reconciliation/inventory pass**.

For each item state:

```text
still reproducible / still open
not reproduced
superseded
duplicate of another finding
platform/environment constrained
needs dedicated correction brief
```

Do not reopen already closed Windows/Chromium accessibility findings gratuitously.

Do not use the Simplified Chinese Narrator environment limitation as evidence that Chinese accessible-name wiring is defective; the completed Chinese QA already distinguishes structural accessibility from unverified Chinese speech.

---

# 11. Apple/WebKit/VoiceOver

Do not block this tranche on unavailable Apple hardware.

If suitable Apple/WebKit/VoiceOver access is unavailable:

- retain the work as deferred platform follow-up;
- document that it was not performed;
- do not simulate or infer a pass.

If suitable hardware/environment happens to be available to Codex, it may inspect only if the repository workflow supports it without external assumptions, but no Apple-specific code change is authorized in this tranche.

---

# 12. Localization-tooling simplification review

Do not broadly refactor localization tooling.

Review the completed locale programme for **demonstrated repeated maintenance cost**.

Candidate examples may include:

```text
explicit per-locale command enumeration
duplicated metadata plumbing
repeated test registration
repeated overlay verification declarations
handoff-path assumptions
```

For each candidate:

- identify the repeated cost;
- estimate how often it was encountered across completed locales;
- distinguish harmless explicitness from genuine maintenance burden;
- recommend simplification only where evidence warrants it.

No tooling refactor should be implemented in this tranche except changes strictly required for XLIFF relocation.

Any broader simplification becomes a later dedicated brief.

---

# 13. Documentation handoff

Update program-level durable documentation to reflect that:

- locale onboarding is complete;
- post-localization cleanup is now active;
- final selector ordering is settled;
- working XLIFF handoffs now live outside tracked durable docs;
- bundle/startup measurements have been recorded;
- capacity/accessibility reviews have durable findings;
- any later correction work is separate and evidence-led.

Do not keep extending the Simplified Chinese onboarding plan with new cleanup work.

If `docs/BACKLOG.md` items are completed by this tranche:

- retire or rewrite them accurately;
- do not leave stale "future" wording.

If new findings emerge:

- add them to the appropriate audit/benchmark/backlog location;
- do not implement them incidentally.

Preserve the repository-wide rule against leaking temporary work-sequence identifiers into unrelated durable docs.

---

# 14. Expected file categories

Likely implementation/documentation changes may include:

```text
src/localization/registry.ts or another central selector-order source
src/localization/locale.ts if selector presentation order is owned there
tests for selector ordering

scripts/localization/... XLIFF default paths
docs/localization/... workflow docs
.gitignore if required
deletion of tracked working *.xliff handoffs

docs/benchmarks/... localization bundle/startup report
docs/audits/... cross-locale capacity review
docs/audits/... accessibility follow-up reconciliation, if a separate report is clearer
docs/BACKLOG.md
docs/localization/LOCALE-ONBOARDING.md
```

Exact files should follow actual repository ownership.

Do not modify unrelated production code.

---

# 15. Verification

Run all checks appropriate to the changed code/tooling.

At minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:terminology:verify
npm run reference:test
npm run build
npm run lint
git diff --check
```

Also run any focused localization/XLIFF tests affected by path/default changes.

Verify:

```text
all supported locales still appear
final selector order is exact
automatic locale behavior still works
all locale catalogues retain exact coverage
all reference overlays still verify
XLIFF generation/import uses ignored local-work paths
no tracked working XLIFF remains unintentionally
no durable review evidence was removed
no translation/reference value changed
production build remains valid
```

For browser/manual measurements, record the actual environment used.

Do not claim a browser/platform check was performed unless it was actually run.

---

# 16. Stop conditions

Stop and report rather than expanding scope if:

- XLIFF relocation reveals that a tracked XLIFF is actually required as durable authoritative input;
- selector ordering cannot be changed without altering locale identity or browser-resolution semantics;
- measurement requires a significant new profiling dependency/toolchain;
- a compact-layout defect appears to require structural geometry changes;
- accessibility review exposes a correction needing runtime/code changes;
- bundle measurements strongly suggest an architecture change;
- cleanup exposes contradictory durable localization rules;
- a tooling simplification would become a broad refactor.

In those cases, document the evidence and recommend a separate brief.

---

# 17. Expected Codex summary

Report:

1. branch used;
2. files modified/deleted/added;
3. final selector order implemented;
4. XLIFF files relocated and tracked handoffs removed;
5. tooling/docs/tests updated for the new handoff location;
6. durable evidence retained;
7. bundle/startup measurements and headline result;
8. whether lazy loading is recommended for later consideration;
9. cross-locale capacity findings by severity/classification;
10. accessibility-follow-up reconciliation result;
11. any tooling-simplification candidates identified;
12. Apple/WebKit/VoiceOver status;
13. backlog/docs reconciled;
14. all commands/checks run and results;
15. any stop condition encountered;
16. any recommended follow-up briefs;
17. suggested commit message;
18. confirmation that no commit/push was performed.

Suggested commit message, if the tranche remains one coherent commit:

`chore: complete post-localization cleanup foundation`

If the diff becomes too broad for one coherent commit, report a recommended split rather than committing anything.

---

# 18. Success criteria

This tranche is successful when:

- localization onboarding is clearly closed as a programme;
- final locale selector ordering is deliberate and tested;
- working XLIFF handoffs no longer live in tracked durable documentation;
- durable localization evidence remains intact;
- final all-locale bundle/startup cost is measured rather than guessed;
- final cross-locale compact-layout capacity is documented using real catalogues;
- shared accessibility follow-up is reconciled without opportunistic fixes;
- later optimization/correction work is clearly separated into evidence-driven follow-up briefs;
- no temporary onboarding sequence identifiers leak into unrelated durable documentation.
