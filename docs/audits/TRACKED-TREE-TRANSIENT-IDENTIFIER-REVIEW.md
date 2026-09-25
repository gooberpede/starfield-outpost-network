# Tracked-tree transient identifier review

## 1. Baseline

- Branch: `staging`
- Commit: `a215305380c94c213ad4c7845b5091d5be6a1d11`
- Initial working-tree state: no tracked modifications; one untracked supplied audit brief at
  `docs/implementation-briefs/CODEX_AUDIT_BRIEF_tracked-tree-transient-identifier-leakage.md`.
- Tracked files audited: 685.
- Scope: the current tracked tree only. Git history and unreachable/deleted blobs were not searched.

The supplied audit brief was not part of the committed tree and was treated as the task input, not as
a tracked finding. It was not modified.

## 2. Search strategy

The audit used `git ls-files` for the tracked-path inventory and `git grep` for tracked contents. It
searched the primary runtime/source/documentation areas and separately reviewed `docs/audits/` and
`docs/implementation-briefs/` as historical sequence-owner locations. Exact-name searches then traced
the three known `reference-source` artifacts through scripts, tests, manifests, package commands, and
documentation. Structured CSV/JSON values and JavaScript identifiers were inspected in addition to
human-readable prose.

The tracked-path expression produced 46 matches. All 46 were manually classified rather than treated
as leaks by pattern alone:

- 39 implementation-brief paths: historical owner-use;
- 4 audit paths: historical owner-use;
- 3 current `reference-source` paths: actionable leaks.

The focused non-historical content scan found 80 whole-word sequence references in 18 files. Thirteen
of those lines are the current, self-contained onboarding procedure's `Step 1` through `Step 13` and
are legitimate. Broader identifier-aware inspection also found camel-case/API identifiers, diagnostic
codes, a generated-data classification, and a manifest tool version that whole-word prose matching
alone would miss.

## 3. Identifier families scanned

The scan covered:

- upper- and lower-case `C1` through `C9` and multi-digit variants where context suggested a task
  sequence;
- `Parcel` letter/number identifiers;
- numbered `Batch`, `Phase`, `Step`, `Tranche`, `Wave`, `Pass`, and `Stage` labels;
- filename/path variants separated by hyphens, underscores, spaces, slashes, or periods;
- embedded code identifiers such as `buildC5Targets`, `C6_EXPECTED`, and `c6Result`;
- structured values such as `RESOLVED_COMPOSED_FAUNA_C6` and version suffixes such as `-c8`.

## 4. False-positive rules and results

The following matches are not transient planning leakage:

- `C6Hn` is the stable Starfield abbreviation for Benzene in canonical/runtime resource data
  (`TID-F`).
- FormIDs, hashes, game version `1.16.244.0`, schema version `1`, locale identifiers, CSS colour
  `#c75452`, and test fixture IDs such as outpost ID `c1` are domain or technical values (`TID-F`).
- `Step 1` through `Step 13` in `docs/localization/LOCALE-ONBOARDING.md` form that document's current,
  self-contained procedure. A reader does not need historical implementation context to understand
  them (`TID-F`).
- Historical briefs and audits own their Parcel/Batch/Pass/C-number sequences. Their owner-use is
  retained (`TID-A`).
- Links to historical reports were not considered leaks merely because a target filename owns a
  historical identifier. No current owner document was found using such a link's label as current
  terminology.

## 5. Known `reference-source` findings

| Classification | Current path | Actual role and status | Recommendation |
| --- | --- | --- | --- |
| TID-B + TID-D | `reference-source/localized-name-provenance-c6-fauna.csv` | Active, deterministic derived source and validation contract. It is the exact 922-entity composed-fauna target boundary and resolved handoff. Its `Classification` field contains `RESOLVED_COMPOSED_FAUNA_C6` in all 922 data rows. | Rename to `localized-name-provenance-composed-fauna.csv`; change the classification to `RESOLVED_COMPOSED_FAUNA` (and the corresponding deferred reason to `DEFERRED_COMPOSED_FAUNA`) as one contract migration. Regenerate and review the deterministic output. |
| TID-B | `reference-source/localized-name-provenance-c5-fauna-lineage.csv` | Active, deterministic derived source. Its five rows preserve canonical NPC -> leveled list -> leveled NPC -> encounter NPC lineage for template-named fauna. Its content is semantic; the leak is the path. | Rename to `localized-name-provenance-template-fauna-lineage.csv` and update generation/validation references. Regenerate or byte-preservingly rename after proving the builder emits the same content. |
| TID-B | `reference-source/localized-name-c6-fauna-ja-preview.csv` | Active derived review/verification evidence for the 922 composed-fauna Japanese assemblies. It is not read by the browser runtime, but repository verification reads it and the provenance builder deterministically emits it. | Rename to `localized-name-composed-fauna-ja-preview.csv` and update generation/validation/documentation references. Regenerate or byte-preservingly rename after verification. |

None of the three is demonstrably obsolete. The Japanese preview is non-runtime evidence, but current
verification consumes it and the current workflow describes it as a reviewed handoff. Removal would
be a separate evidence-retention decision, not a hygiene-only cleanup. Therefore no `TID-E` finding is
recommended.

## 6. Complete actionable findings

Counts in this report use files as the unit for content leakage: 3 actionable filename/path leaks and
22 tracked files with actionable content leakage. A file can appear in both counts. Repeated generated
rows are one contract finding, not 922 separate findings.

| Classification | Area/files | Finding | Required semantic repair |
| --- | --- | --- | --- |
| TID-B | The three `reference-source` paths in section 5 | Current artifact names require knowledge of Parcels C5/C6. | Apply the three semantic names in section 5 and update every current consumer atomically. |
| TID-C | `docs/ARCHITECTURE.md` | `Batch 1` / `Batch 3` and the two transient filenames make current architecture depend on old work sequencing. | Describe the reference-data migration and biome-aware production behavior directly; use semantic artifact names. |
| TID-C | `docs/localization/JAPANESE-GLOSSARY.md` | `Codex B1` and `Parcel B3` describe current glossary provenance using historical work-package labels. | Describe the Codex draft and independent comparative adjudication semantically; make the heading `Comparative adjudication decisions` or equivalent. |
| TID-C | `docs/localization/LOCALIZATION-INPUTS.md` | The active operator workflow is organized around `C2`-`C7`, `Parcel C`, and `Parcel D`, and names all three transient artifacts. | Reframe sections around direct-name, star-system, body, organic, composed-fauna, provider-chain, and overlay responsibilities; update artifact names. |
| TID-C | `scripts/localization/body-provenance.mjs`, `star-system-provenance.mjs` | Purpose/change comments and exported builder names use C3/C4. | Use `buildStarSystemTargets`, `buildBodyTargets`, and semantic comments. |
| TID-C | `scripts/localization/localized-name-provenance.mjs`, `localization-input-manifest.mjs`, `localized-field-map.mjs` | Direct-name contracts, comments, errors, and helper names use C2/C5/C6 labels. | Rename direct-name APIs and rewrite comments/errors around direct names, canonical fauna, and composed-fauna failures. |
| TID-C + TID-D | `scripts/localization/organic-provenance.mjs` | Public constants, classification/reason values, comments, diagnostics, validation variables, and exact filenames embed C5/C6. | Replace with organic/template/composed-fauna terminology and migrate the structured values and file references together. |
| TID-C + TID-D | `scripts/localization/composed-fauna-provenance.mjs` | Exported constants and stable-looking error codes (`C6_*`) embed the temporary parcel ID throughout the generator and validator. | Adopt `COMPOSED_FAUNA_*` names/codes and semantic diagnostics; keep the behavioral gates unchanged. |
| TID-C + TID-D | `scripts/localization/build-localized-name-provenance.mjs` | Source/output keys (`c6Fauna`, `c6Handoff`, `c6Preview`, `c5Lineage`), result keys, diagnostics, and exact paths expose C2/C5/C6/C7/C8. Local build-report keys also inherit them. | Rename keys to `directNames`, `composedFauna`, `composedFaunaPreview`, and `templateFaunaLineage` (or equally precise terms); rewrite provider/closure messages semantically. This changes the local build-report shape and must be treated as a contract migration. |
| TID-C + TID-D | `scripts/localization/provenance-build-integration.mjs`, `scripts/localization/provenance-manifest.mjs` | Purpose prose says C8 and the persisted generator version is `8.0.0-c8`. | Describe integration gates directly and replace the task-derived prerelease suffix with an intentionally versioned semantic tool version. Regenerate the manifest under the chosen new version. |
| TID-C | `scripts/localization/starfield-plugin-reader.mjs` | Comments expose C3/C5 boundaries rather than the bounded star-system and organic relationship scans. | Rewrite comments semantically without changing scan scope. |
| TID-C | `scripts/localization/validate-localized-name-provenance.mjs` | Local names, exact paths, diagnostics, and output text expose C2-C8. | Rename locals and messages by responsibility, and update the three artifact paths and migrated classification values. |
| TID-C | `scripts/localization/localization-inputs.test.mjs`, `localized-name-provenance.test.mjs`, `organic-provenance.test.mjs`, `composed-fauna-provenance.test.mjs`, `official-master-provider-chains.test.mjs` | Test descriptions, fixture values, error-code assertions, imports, and a `c7-tes4-` temp prefix require historical context. | Rename tests/fixtures/assertions to current behavior and update migrated APIs/codes. Do not alter behavioral coverage. |
| TID-D | `reference-source/localized-name-provenance-c6-fauna.csv` | The persisted `Classification` value `RESOLVED_COMPOSED_FAUNA_C6` appears in all 922 rows. | Regenerate with `RESOLVED_COMPOSED_FAUNA`; support `DEFERRED_COMPOSED_FAUNA` consistently in generator validation and tests. No compatibility migration is needed for browser state because this is build/reference data, not user persistence. |
| TID-D | `reference-source/localized-name-provenance-manifest.json` | `generator.toolVersion` is `8.0.0-c8`, coupling current provenance identity to the temporary parcel. | Select a normal semantic tool version, regenerate the manifest, and review expected `generatedAt`/commit/version drift. Input hashes are unaffected by filename cleanup. |

The 22 content-bearing files are the three current documents, the 17 script/test files named above,
and the two structured `reference-source` files. No transient identifier was found in application
state schemas under `src/`, browser persistence, public runtime JSON contracts, package-script names,
or generated reference-name overlays.

## 7. Historical-owner findings summary

The 43 historical-owner path matches comprise 39 files in `docs/implementation-briefs/` and 4 files
in `docs/audits/`. Their identifiers include localization Parcels C/D and C1-C8, Batches 1-3,
visual-language Passes 1-6, and older lifecycle/UI polish passes. These files define or audit those
sequences, so their own paths, headings, and internal owner-use are `TID-A` and should remain unchanged.

Historical documents do contain exact references to the three current transient filenames. Those are
historically accurate references and are not themselves rename targets. After implementation, it is
acceptable for them to refer to the names that existed when the work was performed. Current consumers
and owner docs must use the new names; no history rewrite or cosmetic historical-document sweep is
recommended.

## 8. Durable-document findings

Three durable files need semantic rewriting:

1. `docs/ARCHITECTURE.md` (Batch language plus current transient artifact names);
2. `docs/localization/JAPANESE-GLOSSARY.md` (B1/B3 provenance language);
3. `docs/localization/LOCALIZATION-INPUTS.md` (the current regeneration and handoff workflow).

The other required owner documents were inspected and had no actionable sequence leakage:
`README.md`, `AGENTS.md`, `docs/DOMAIN-RULES.md`, `docs/UX-DESIGN.md`, `docs/BACKLOG.md`,
`docs/DEPLOYMENT.md`, `docs/IMPLEMENTATION-WORKFLOW.md`, `docs/localization/LOCALE-ONBOARDING.md`,
and `docs/THIRD-PARTY-REFERENCES.md`. The repository policy language in `AGENTS.md` discusses generic
numbered planning identifiers as a rule; it is not itself a leak.

## 9. Code, script, and test findings

Seventeen localization script/test files contain actionable sequence terminology. The impact is more
than comment cleanup: exported functions, constants, error codes, report keys, test assertions, and
operator-facing diagnostics use the old identifiers. The semantic conversion should preserve all
existing population, provider-precedence, fail-closed, and count invariants.

No actionable sequence-dependent names or comments were found in `src/` application code or the
top-level `tests/` suite. The `c1` values in `tests/collectionEditingSession.test.ts` are ordinary
fixture object IDs and are `TID-F`.

## 10. Schema and data findings

Transient IDs have entered two generated/reference contracts:

- CSV classification/reason vocabulary: `RESOLVED_COMPOSED_FAUNA_C6` is committed in 922 data rows,
  while `DEFERRED_COMPOSED_FAUNA_C6` remains an active generator/test contract for unresolved builds.
- Provenance manifest identity: `generator.toolVersion` is `8.0.0-c8` and is produced by
  `scripts/localization/provenance-manifest.mjs`.

The build report written under ignored `.local-work/` also exposes C-numbered keys through the current
builder. It is not a tracked artifact, but the implementation must update its shape and any local
review expectations. No user-data schema, browser-storage schema, public runtime reference-data schema,
or localization overlay schema contains these task identifiers.

## 11. Consumer and dependency map

| Proposed semantic artifact | Current tracked producers/consumers | Documentation/evidence references | Regeneration implications |
| --- | --- | --- | --- |
| `localized-name-provenance-composed-fauna.csv` | Produced and read by `build-localized-name-provenance.mjs`; parsed/validated by `organic-provenance.mjs` and `composed-fauna-provenance.mjs`; read by `validate-localized-name-provenance.mjs`; exercised by organic/composed provenance tests through shared headers and validators. | Current references in `docs/ARCHITECTURE.md` and `docs/localization/LOCALIZATION-INPUTS.md`; historical references in briefs/audits remain historical. | Regenerate because the classification contract should change with the filename. Verify 922 entities, 2,179 composed component rows, and all existing invariants. The tracked manifest does not store this artifact's hash. |
| `localized-name-provenance-template-fauna-lineage.csv` | Produced by `build-localized-name-provenance.mjs`; parsed/validated by `organic-provenance.mjs`; read by `validate-localized-name-provenance.mjs`; covered by organic provenance tests. | Current references in `docs/ARCHITECTURE.md` and `docs/localization/LOCALIZATION-INPUTS.md`; historical references retained. | Deterministic five-row output. Rename/update paths and prove content equivalence. No tracked artifact hash depends on its filename. |
| `localized-name-composed-fauna-ja-preview.csv` | Produced by `build-localized-name-provenance.mjs`; validated by `composed-fauna-provenance.mjs`; read by `validate-localized-name-provenance.mjs`; covered by composed-fauna validation. | Current references in `docs/localization/LOCALIZATION-INPUTS.md`; historical references retained. | Deterministic 922-row review preview. Rename/update paths and prove content equivalence. It is not a browser-runtime input and no tracked artifact hash depends on its filename. |

`package.json` reaches these consumers indirectly through `reference:build`,
`localization:provenance:build`, `localization:provenance:verify`, and the normal production `build`.
The package-script names are already semantic and do not require renaming.

## 12. Semantic replacement recommendations

The recommended vocabulary is responsibility-based:

- C2 -> direct localized-name targets/provenance;
- C3 -> star-system targets/provenance;
- C4 -> body targets/provenance;
- C5 -> organic or template-fauna provenance, as appropriate;
- C6 -> composed-fauna targets/provenance/preview;
- C7 -> official provider-chain validation;
- C8 -> integrated provenance closure/source-policy validation;
- Parcel D -> localized reference-name overlay generation/runtime integration.

This mapping should be applied to API names, diagnostics, tests, report keys, data values, and current
documentation, rather than merely deleting tokens. The concrete filename recommendations are those in
section 5.

## 13. Remove-versus-rename decisions

- Rename and regenerate the composed-fauna provenance artifact: it is active and contract-bearing.
- Rename the template-fauna lineage artifact: it is active validation/audit evidence.
- Rename the Japanese preview: it is active repository verification evidence despite not being a
  runtime input.
- Remove none of the three during hygiene cleanup. A later evidence-retention decision could reassess
  the preview, but the present tree supplies active consumers and documentation for it.

## 14. Implementation scope estimate

This is a cross-cutting but bounded localization-tooling migration:

- rename 3 tracked artifacts;
- update 17 localization script/test files, including semantic APIs, constants, diagnostics, test
  descriptions, fixture codes, exact paths, and ignored build-report keys;
- regenerate/review 2 tracked contract-bearing artifacts (the composed-fauna CSV and provenance
  manifest), while preserving the five-row lineage and Japanese preview content except for their paths;
- rewrite 3 current durable documents;
- leave 43 historical-owner paths and their historical narrative untouched;
- run the focused localization provenance tests/build/verify commands, reference build/verify as
  appropriate, then the repository-required test/build/lint and `git diff --check` checks.

Because some API identifiers may occur in tests beyond the 17 files that contain literal sequence
tokens, implementation should repeat exact symbol searches after renaming and let import/test failures
identify any additional semantic consumers. No dependency upgrade, user-data migration, history rewrite,
or runtime feature change is indicated.

## 15. Release disposition

**TREE-D — transient IDs have entered schema/generated contracts and need a broader cleanup design
before release.**

TREE-D is warranted by the 922 persisted CSV classification values, active deferred-reason/error-code
vocabulary, builder/report keys, and the persisted manifest generator version. The issue does not reach
browser/user persistence, so the cleanup is bounded to localization tooling, generated source evidence,
and current owner documentation.

## 16. Exact pre-release cleanup recommendation

Implement one atomic localization-provenance terminology migration before release:

1. settle the semantic vocabulary and the three filenames above;
2. migrate generator APIs, diagnostics/error codes, classification/reason values, build-report keys,
   validator inputs, and tests without altering behavior;
3. rename/regenerate the three artifacts and provenance manifest under a non-task-derived tool version;
4. update only the three current owner documents identified above;
5. retain historical audits/briefs unchanged and do not rewrite history;
6. verify that no C2-C8/Parcel/Batch terminology remains outside historical owners or legitimate
   document-owned/domain uses;
7. run the focused provenance/reference checks plus full test/build/lint and whitespace verification.

This audit performed no implementation, regeneration, commit, push, deployment, or history rewrite.
