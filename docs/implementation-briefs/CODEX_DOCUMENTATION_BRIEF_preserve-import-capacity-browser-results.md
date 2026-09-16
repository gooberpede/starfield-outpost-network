# Codex Documentation Update Brief — Preserve Manual Browser Validation Results

## Objective

Preserve the completed manual browser-validation results in the existing import-capacity validation report, and perform the agreed documentation housekeeping before this benchmark/validation work is committed.

This is a **documentation and repository-organization task only**.

Do not implement production capacity limits or change application behavior.

## Important naming rule

Audit/slice identifiers used in discussion are transient shorthand only.

Do **not** introduce those identifiers into:
- filenames;
- source code;
- tests;
- comments;
- documentation text;
- localization keys;
- generated artifacts.

Use durable descriptive naming only.

## Repository housekeeping convention

From now on:

- benchmark/performance/capacity validation reports belong under `docs/benchmarks/`;
- audit reports belong under `docs/audits/`;
- top-level `docs/` remains for durable project/design/architecture documentation.

Apply that convention to the import-capacity benchmark and browser-validation report in this task, if they have not already been moved.

## Required file moves

If they have not already been moved, move:

- `docs/IMPORT-CAPACITY-BENCHMARK.md`
  to
  `docs/benchmarks/IMPORT-CAPACITY-BENCHMARK.md`

- `docs/IMPORT-CAPACITY-BROWSER-VALIDATION.md`
  to
  `docs/benchmarks/IMPORT-CAPACITY-BROWSER-VALIDATION.md`

Do not duplicate the files.

Preserve Git history as a normal rename/move where possible.

Update any repository-internal references to those paths.

Because both reports will remain in the same directory, their relative cross-link may remain simple if appropriate.

## Manual browser results to preserve

Update the browser-validation report with the following completed manual testing.

### Microsoft Edge

Version:

`153.0.4234.32 (Official build) (64-bit)`

#### Dense fixture

Observed:
- no loss of functionality during the suggested manual tests;
- import Undo/Redo worked;
- representative edit Undo/Redo worked;
- file exported successfully;
- exported filename was truncated because of the very long character name;
- the timestamp was not appended/preserved in the resulting filename;
- the exported file imported successfully;
- minor but noticeable lag occurred during operations;
- the lag remained below approximately one second per operation;
- no crash, browser-unresponsive warning, or functional failure occurred.

#### Broad fixture

Observed:
- no loss of functionality during the suggested manual tests;
- import Undo/Redo worked;
- representative edit Undo/Redo worked;
- file exported successfully;
- the relevant user-derived name was short enough that no filename truncation occurred;
- the timestamp was appended normally;
- the exported file imported successfully;
- no noticeable lag was observed.

### Google Chrome

Version:

`152.0.7977.83 (Official Build) (64-bit)`

#### Dense fixture

Observed:
- same functional result as Edge;
- import/edit/history/export/re-import/reload behavior succeeded;
- minor but noticeable sub-second lag remained;
- no crash or browser-unresponsive warning occurred.

#### Broad fixture

Observed:
- same successful result as Edge;
- no noticeable lag observed.

### Mozilla Firefox

Version:

`156.0 (64-bit)`

#### Dense fixture

Observed:
- same successful functional result as Edge and Chrome;
- minor but noticeable sub-second lag of approximately the same magnitude;
- no crash or browser-unresponsive warning occurred.

#### Broad fixture

Observed:
- same successful result as Edge and Chrome;
- no noticeable lag observed.

## 12 Cargo Link structure conclusion

Update the report to reflect the completed product/performance conclusion:

- 12 Cargo Link structures per outpost is technically operable;
- all tested browsers preserved functionality at that density;
- the UI becomes unwieldy/cumbersome when navigating or expanding many structures;
- this is considered an acceptable upper technical boundary;
- do **not** recommend raising the ceiling above 12;
- do **not** recommend lowering it below 12 based on the current evidence.

Keep the existing backlog item concerning legitimate imports above 12 Cargo Link structures.

Do not design or implement the special handling in this task.

## Browser-gate conclusion

The previous report correctly left the candidate envelope provisional because Edge/Chrome/Firefox had not been tested.

Update that conclusion.

The named-browser validation gate is now complete across:
- Edge;
- Chrome;
- Firefox.

The manual evidence shows:
- dense fixture: functional with minor, noticeable, sub-second latency;
- broad fixture: functional with no noticeable latency;
- normal Undo/Redo remained available;
- save/reload remained functional;
- real export produced files;
- exported files re-imported successfully.

The report should now state that the tested candidate envelope is **validated for the tested desktop browser environment** and may proceed to the production implementation stage.

Avoid claiming guarantees for:
- untested operating systems;
- mobile browsers;
- Safari/WebKit;
- arbitrary hardware;
- all future browser versions.

## Candidate envelope conclusion

Preserve the currently tested envelope:

| Boundary | Intended ceiling |
| --- | ---: |
| Input file | 4 MiB |
| Saved networks | 64 |
| Outposts per network | 96 |
| Cargo Link structures / cargo pads per outpost | 12 |
| Cargo Links per network | 256 |
| Manufacturing entries per outpost | 256 |
| Planned Supply entries per outpost | 256 |
| Outbound items per cargo pad | 128 |
| Aggregate persisted array members | 25,000 |
| Any persisted string | 4,096 UTF-16 code units |

Clarify the aggregate-member definition as:

> the sum of the lengths of all arrays recursively in the persisted collection.

Do not implement these limits in production in this task.

## Export filename finding

Preserve the finding from manual testing:

- a 4,096-character character name can make the generated export filename exceed a practical filesystem/browser filename length;
- Edge truncated the resulting filename;
- the timestamp suffix was lost;
- export itself still succeeded and the file re-imported successfully.

Record this as a **separate follow-up concern**, not as evidence that the persisted-string technical ceiling should automatically be reduced.

The likely future direction is:
- retain the broader technical persisted-string ceiling;
- bound/sanitize the user-derived character-name fragment used in export filenames;
- guarantee enough filename budget remains for stable suffixes such as timestamp and `.json`.

Do not implement export-filename truncation/sanitization in this task.

If appropriate, add a concise backlog item for bounded export filenames.

Do not commit to an exact final fragment limit unless the repository already has a settled value elsewhere.

## Existing in-app-browser evidence

Do not remove the prior Codex in-app-browser observations.

Keep them as an earlier validation layer, but clearly distinguish them from the later manual named-browser results.

The report should make the chronology clear:

1. generated fixture verification;
2. Codex in-app-browser probe;
3. manual Edge/Chrome/Firefox confirmation.

## Production behavior

Production behavior must remain unchanged.

Do not:
- implement file-size/count/string limits;
- change import validation;
- change history behavior;
- change storage;
- change export filename construction;
- change localization;
- change accessibility behavior;
- optimize validation rules;
- change UI behavior.

## Verification

Run:
- repository link/path checks needed after moving the reports;
- `npm test`;
- `npm run test:components`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If no code changed, do not add unnecessary tests.

## Completion response

Return:

1. concise summary of the documentation update;
2. files moved;
3. internal references updated;
4. exact manual browser versions recorded;
5. confirmation that dense and broad results were preserved;
6. final 12-Cargo-Link-structure conclusion;
7. confirmation that the named-browser gate is now closed for the tested desktop environment;
8. confirmation that the tested capacity envelope is retained;
9. confirmation that the export-filename truncation issue is recorded separately;
10. verification commands/results;
11. confirmation that production behavior is unchanged;
12. confirmation that no commit/push was performed.

Do not commit or push unless explicitly instructed.
