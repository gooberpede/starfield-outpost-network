# Codex Documentation Brief — Backlog Grooming and Release-Roadmap Update

## Objective

Perform a documentation-only grooming pass on:

```text
docs/BACKLOG.md
```

The goal is to make the backlog accurately reflect the current state of the Starfield Outpost Tracker after the recently completed shortcut work, game-rule verification, security/deployment work, and localization foundation.

This is **not** an implementation parcel.

Do not change application code, tests, localization files, deployment configuration, reference data, package files, or lockfiles.

Do not commit or push unless explicitly instructed.

---

## Branch and starting-state checks

Work on:

```text
staging
```

Before editing:

```text
git status
git branch --show-current
```

Confirm `staging`.

Identify unrelated working-tree changes and do not modify them.

---

## Scope

Edit only:

```text
docs/BACKLOG.md
```

unless a tiny formatting correction is required in the same file.

Do not create a replacement backlog document.

Do not move backlog content into another durable document.

The task is to:

1. remove stale or resolved backlog items;
2. update remaining items so they reflect current product decisions;
3. expand the localization section into a concrete V1 language roadmap;
4. add the newly identified pre-release polish items;
5. make the release-readiness section easier to read as an actual remaining-work summary;
6. preserve genuinely deferred post-V1/planner work without making it look release-blocking.

---

# Settled game-rule findings to record

## Duplicate outpost names

The in-game verification is complete.

Starfield **allows duplicate player outpost names**.

Therefore:

- remove the existing backlog investigation asking whether duplicate names are allowed;
- do not add duplicate-name validation;
- do not replace it with a warning;
- do not add any further backlog action unless a later concrete problem appears.

---

## Ocean biome boundaries

The in-game verification is complete.

Ocean biome resources **can be accessed from coastline/biome-boundary placement**.

Therefore:

- remove the backlog investigation asking whether coastal outposts can overlap/access Ocean biomes;
- do not change the current Biome selector model;
- do not add a replacement implementation item.

Other genuinely future biome/planner items should remain.

---

## Character-name maximum

In-game verification established:

```text
Starfield character-name maximum: 25 characters
```

Add a new backlog item for a future validator.

Product direction:

- likely severity: `INFO`;
- the tracker may still preserve longer names;
- this is a game-validity advisory, not an application storage/import error;
- the exact wording/UI can be decided when implemented.

Do not implement it now.

---

# Character-name defensive application limit

Keep the separate export/storage-oriented name-length concern distinct from the 25-character Starfield validator.

Current direction:

- the tracker currently has/retains a much higher defensive application limit around long persisted names;
- a tentative ceiling of **196 characters** remains under discussion;
- one reason is export-filename safety;
- another is that absurdly long names can dominate transient/status-bar feedback;
- do not collapse the 25-character game advisory and the defensive application/export constraint into one rule.

Backlog wording should make clear that these are separate concerns.

Do not settle the exact defensive ceiling in this documentation pass unless the existing backlog already treats it as settled.

---

# New pre-release polish items

Add the following backlog items.

## System selector shows `SOL` instead of localized `Sol`

Observed issue:

- the Sol system currently appears as `SOL` in the system selector;
- `SOL` is believed to be the xEdit/raw reference form;
- expected localized display for both `en-US` and `en-GB` is `Sol`.

Backlog item should frame this as an investigation/fix:

- identify where the displayed system name is sourced;
- determine why localization/reference-name presentation is not overriding the raw/canonical form;
- correct the presentation path;
- preserve canonical IDs/reference keys.

Do not assume the correct implementation is to mutate source data.

---

## Focused/interactable content can disappear beneath the status bar

Observed issue:

- outpost names can be keyboard-navigated to while hidden beneath the status bar;
- Planned Supply controls can also be reached by `Tab` or shortcuts while visually obscured;
- this is both a layout and accessibility polish defect.

Backlog item should require future correction so:

- focused/keyboard-targeted content is scrolled into a visible region above the status bar;
- normal scroll/layout geometry reserves sufficient bottom space;
- interactive content is not left focused while hidden under the status bar.

Do not prescribe a specific CSS/focus implementation yet.

---

# About dialog and application versioning

Add an explicit pre-release backlog item for expanding the About dialog.

The future About work should include, at minimum:

- application version;
- support/contact details;
- Ko-Fi link;
- existing attribution/about content retained as appropriate.

Also add/retain the associated versioning decision:

- establish an application versioning scheme before public release;
- SemVer is the likely direction;
- `package.json` is the likely canonical version source;
- decide the exact version-source/display mechanism when implemented.

Do not implement version injection in this documentation parcel.

If useful, note that About may also include the public project/site link, but keep this optional unless already decided elsewhere.

External links should eventually follow the app's established accessibility/localization conventions.

---

# Localization roadmap

The current localization backlog understates the remaining work.

Rewrite the localization section so that V1 explicitly targets the full Starfield interface/text language set.

The Bethesda-supported text/interface language target is:

```text
English
French
German
Spanish (Spain)
Japanese
Italian
Polish
Portuguese (Brazil)
Simplified Chinese
```

Current tracker state:

```text
en-US    complete baseline
en-GB    sparse override
ja-JP    complete
```

Remaining substantial locale onboarding:

```text
French
German
Spanish (Spain)
Italian
Polish
Portuguese (Brazil)
Simplified Chinese
```

The backlog should state that these seven remaining locales are planned V1 work.

Do not invent final locale tags if they are not already established in project conventions. If tags are needed in prose, use only obvious/common forms and avoid pretending a final implementation decision has been made where it has not.

---

## Localization parceling

Record that the remaining seven locales should be implemented in **manageable batches**, rather than one giant parcel.

Do not prescribe an exact grouping in this backlog pass unless there is already a settled grouping elsewhere.

The purpose is to make clear that:

- localization is the next major development phase;
- the work should be split into coherent parcels;
- each parcel should preserve the existing localization architecture, parity tooling, review process, and reference-name provenance/overlay approach where applicable.

---

## Existing localization foundation to preserve

Keep or restate, as appropriate:

- `en-US` remains the complete baseline;
- `en-GB` remains a sparse override;
- `ja-JP` remains complete;
- tracker-authored UI/accessibility/help/validation/status/history labels are inside the semantic localization boundary;
- exact key/placeholder parity checks remain part of locale closure;
- `Intl` remains the current formatting/collation mechanism where adequate;
- richer ICU/FormatJS-style formatting remains deferred unless real future content requires it;
- user-visible date/time localization remains future work if/when such display is introduced;
- persisted/schema formats and export filename timestamps remain invariant unless explicitly redesigned.

Do not rewrite historical Japanese implementation details unnecessarily.

---

## Japanese follow-up

Retain as non-blocking/manual follow-up:

- final Japanese release verification;
- native-speaker review when available.

Do not make native-speaker review a hard V1 blocker unless the backlog already says so.

---

## Post-localization bundle review

Retain this item.

After all planned locale onboarding is complete:

- remeasure bundle composition and startup performance;
- pay particular attention to statically bundled locale catalogues and reference-name overlays;
- consider lazy locale loading only if measurements show meaningful benefit.

This remains the useful performance follow-up.

---

# Remove stale completed performance section

The existing backlog section:

```text
Production performance and bundle review
```

is stale.

A bounded production performance review has already been completed.

Its conclusion did **not** justify code splitting merely to remove the Vite large-chunk warning.

Therefore:

- remove the stale pre-release "perform production performance review" item;
- do not create a replacement optimization parcel;
- retain only the separate post-localization bundle review described above.

---

# TypeScript fixture agreement section

The backlog currently contains a completed section for:

```text
TypeScript test fixture type agreement — complete
```

This is implemented and no longer deferred work.

Remove that completed section from `BACKLOG.md`.

Durable completed behavior belongs elsewhere, not in the backlog.

---

# Node runtime alignment note

The current backlog contains a completed/verified Node 24 alignment note.

This is not deferred work.

Remove the completed Node 24 runtime-alignment item from the backlog unless the surrounding section requires one short sentence of context.

Do not remove actual deployment-policy documentation from other files.

---

# HSTS follow-up

Keep the HSTS follow-up as deferred release/infrastructure work.

Current settled state:

- initial HSTS is already implemented;
- current policy is `max-age=86400`;
- `includeSubDomains` and `preload` are intentionally omitted;
- rollout has been verified;
- any policy lengthening/review is deferred until the appropriate later grooming point.

Do not rewrite this as if HSTS is unimplemented.

Keep the wording concise and forward-looking.

---

# Fatal-state recovery review

Retain the pre-release decision:

- review whether the reference-data fatal screen should expose a raw, read-only browser-storage backup/export action.

Do not imply that this feature has already been approved.

This remains a product/recovery review item.

---

# Public-release indexing / launch controls

If `BACKLOG.md` currently contains or should reasonably contain release-gate reminders, preserve the fact that:

- pre-release `noindex` / robots controls are temporary;
- removal should happen as part of the public-launch parcel.

Do not invent deployment steps if they are already documented more appropriately in `docs/DEPLOYMENT.md`.

The backlog should contain only the deferred release action, not duplicate detailed deployment instructions.

---

# Apple/WebKit follow-up

Keep the Apple/WebKit compatibility section.

It remains verification/follow-up, not a known large implementation parcel.

Preserve the existing distinction:

- Safari/WebKit testing;
- VoiceOver/macOS smoke;
- Japanese font fallback on Apple platforms;
- iPhone/WebKit rendering/accessibility sanity;
- investigate blank-page behavior only if reproducible against the public build;
- Apple mobile is a compatibility/accessibility/font target, not a mobile-support commitment.

Do not elevate speculative issues into blockers without evidence.

---

# Accessibility follow-up

Keep the completed Windows/Chromium accessibility status clear.

Do not reopen the completed accessibility correction batch.

Retain only deferred/platform follow-up such as:

- touchpad/touchscreen checks;
- Safari/VoiceOver/iPhone checks;
- bounded browser-level regression tooling;
- representative reflow regression coverage.

---

# About the remaining backlog structure

Improve readability so the release path is easier to distinguish from long-term future work.

Under `Public release readiness`, aim for a structure conceptually similar to:

```text
Further localization coverage
Pre-release polish
Accessibility / compatibility follow-up
Security and deployment follow-up
```

Exact headings may vary if a cleaner edit fits the existing document better.

The key goal is to make clear that:

## Remaining major V1 development phase

- seven locale onboardings.

## Remaining pre-release polish / verification

Examples include:

- character-name INFO validator;
- `SOL` / `Sol`;
- status-bar occlusion;
- About/version/contact/Ko-Fi;
- fatal-state recovery review;
- HSTS review;
- launch indexing removal;
- final compatibility/smoke checks.

## Deferred/post-V1

Keep clearly separate:

- throughput modelling;
- history timeline/direct jump;
- broader workspace scrolling redesign;
- planner-facing biome/power/resource planning;
- richer feasibility explanations;
- advanced validation navigation;
- technical-capacity advisory design;
- other planner-direction items.

Do not delete legitimate long-term backlog items merely because they do not block V1.

---

# Status bar backlog wording

The existing broad status-bar review may remain if it still has independent value.

Add the concrete occlusion defect separately.

Do not bury the known keyboard-focus-under-status-bar problem inside a vague "review information hierarchy" item.

---

# Import/export backlog wording

Keep the existing future import/export work where still genuinely unresolved.

Preserve, as appropriate:

- >12 Cargo Link structures import/recovery decision;
- export filename character-name fragment bounding/sanitization;
- richer import diagnostics if warranted;
- migration/conflict reporting;
- optional import preview.

Ensure the export-filename item does not imply that the 25-character in-game name rule replaces the application/export safety concern.

---

# General backlog hygiene

Apply the file's own maintenance rules:

- describe unresolved problems/decisions, not assumed implementations;
- remove implemented/completed work;
- avoid duplicating requirements already captured elsewhere;
- preserve settled direction separately from open questions;
- keep the document focused on genuinely deferred work.

Do not turn the backlog into a project-history document.

---

# Things not to do

Do not:

- modify application code;
- modify tests;
- modify locale catalogues;
- modify Japanese review CSVs;
- modify reference data;
- modify deployment files;
- modify `package.json`;
- modify `.node-version`;
- modify lockfiles;
- create a versioning implementation;
- create an About implementation;
- implement validators;
- implement the Sol fix;
- implement the status-bar fix;
- onboard any locale;
- change Cloudflare;
- change HSTS;
- remove launch `noindex`;
- commit or push.

This is documentation-only grooming.

---

# Verification

Run:

```text
git diff --check
git diff -- docs/BACKLOG.md
```

No build or test suite is required for a documentation-only change unless repository policy or an incidental tooling constraint makes one necessary.

Confirm that no file other than `docs/BACKLOG.md` was intentionally changed by this task.

---

# Completion response

Return:

1. concise summary of backlog grooming;
2. branch;
3. files changed;
4. stale/resolved items removed;
5. newly added pre-release items;
6. localization roadmap now recorded;
7. current vs remaining locale count;
8. confirmation that the seven remaining locales are explicitly named;
9. About/version/contact/Ko-Fi item summary;
10. character-name validator/backstop distinction;
11. Sol localization issue summary;
12. status-bar occlusion issue summary;
13. post-localization bundle review status;
14. HSTS/fatal-state/Apple follow-up status;
15. confirmation long-term planner/deferred items were preserved;
16. `git diff --check` result;
17. confirmation no code/tests/localization/deployment files changed;
18. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
