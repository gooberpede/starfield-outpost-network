# CODEX AUDIT BRIEF — Tracked-Tree Transient Identifier Leakage

## Objective

Perform a **repository hygiene audit of the current tracked tree** to find temporary implementation-planning identifiers that have leaked into durable/current artifacts.

The motivating examples are tracked files such as:

```text
reference-source/localized-name-c6-fauna-ja-preview.csv
reference-source/localized-name-provenance-c5-fauna-lineage.csv
reference-source/localized-name-provenance-c6-fauna.csv
```

Identifiers such as `c5` / `c6` only make sense if a reader knows the historical localization implementation sequence. In current durable/source artifacts they are confusing and should normally be replaced with semantic names describing the artifact’s real role.

This audit must distinguish:

1. **historical sequence-owner documents**, where temporary identifiers legitimately belong;
2. **current durable/source/runtime artifacts**, where leaked task IDs should be removed/replaced;
3. **legitimate domain strings** that merely resemble task IDs and must not be touched.

This is an **audit only**. Do not rename or edit files in this task.

---

# 1. Baseline

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
```

Read first:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/DEPLOYMENT.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Pay particular attention to the repository rule that temporary planning identifiers must not leak into unrelated durable documentation/artifacts.

Do not modify the supplied audit brief.

---

# 2. Scope

Audit the **current tracked tree**.

Primary concern areas:

```text
reference-source/
src/
scripts/
tests/
public/
README.md
AGENTS.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/DEPLOYMENT.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/localization/
```

Also inspect:

```text
docs/audits/
docs/implementation-briefs/
```

but classify them differently, because many historical audits/briefs legitimately own their own sequence identifiers.

This is not a Git-history rewrite audit.

Do not search unreachable/deleted historical blobs unless needed to understand a current tracked reference.

---

# 3. Identifier families to search

Search both:

```text
tracked file paths
tracked file contents
```

for likely temporary planning identifiers, including at minimum:

```text
C1, C2, C3 ... C9
C10+ if present
c1, c2, c3 ... in filenames/paths where context suggests a task sequence
Parcel A/B/C/D...
Parcel C1/C2/etc.
Batch 1/2/3...
Phase 1/2/etc.
Step 1/2/etc.
Tranche 1/2/etc.
Wave 1/2/etc. if used as implementation sequencing
Pass 1/2/etc. if used as a temporary work breakdown
Stage 1/2/etc. where implementation-specific rather than product-semantic
```

Use context-aware matching.

Do not mechanically treat every number-letter combination as leakage.

---

# 4. False-positive protections

Explicitly exclude legitimate domain/data strings.

Examples:

```text
C6Hn
chemical/resource abbreviations
FormIDs
version identifiers
schema versions
locale identifiers
HTTP status codes
CSS class names where the letters/numbers are semantic and current
test fixture IDs
real product/domain concepts with stable names
```

Likewise, do not flag:

```text
"Phase" where it names a durable product concept
"Step" inside user-facing procedural documentation where the numbering belongs to that document
"Batch" where the document itself is the historical batch owner
```

Every finding must include a reason why it is or is not a leak.

---

# 5. Historical sequence-owner exemption

Historical implementation briefs, correction briefs, review briefs, and audits may retain identifiers such as:

```text
Parcel C6
Parcel D
Batch 3
C7
Phase 2
```

when the identifier is part of the document's own structure/history.

Examples likely to be legitimate:

```text
docs/implementation-briefs/CODEX_IMPLEMENTATION_BRIEF_localization-parcel-c6-...
docs/audits/codex-localization-c6-...
```

Do not recommend renaming such files merely for cosmetic consistency.

However, historical documents can still be findings if they:

- refer to a current artifact by an obsolete transient filename;
- instruct current workflows to use a transient identifier;
- are linked from durable owner docs in a way that makes the temporary identifier look current;
- contain copied identifiers that escaped beyond the document’s own sequence.

Distinguish:

```text
owner-use: legitimate
cross-boundary leak: actionable
```

---

# 6. Current durable/source artifact standard

A current durable/source/runtime artifact should use a semantic name that describes what it is.

Examples:

```text
localized-name-provenance-fauna.csv
localized-name-provenance-fauna-lineage.csv
localized-name-fauna-ja-preview.csv
```

These are examples only.

Do not preselect replacement names until the artifact’s actual role and consumers are understood.

For each leaked path/file, determine:

```text
what the file actually contains
who consumes it
whether it is canonical input, derived input, review evidence, preview output, or generated runtime input
whether its current temporary ID carries any real current semantic meaning
what semantic concept should replace that ID
```

---

# 7. File-consumer tracing

For every actionable filename/path finding, identify all current tracked consumers.

Search for:

```text
exact filename references
path joins
manifest entries
script inputs
test fixtures
README/docs references
generated-output metadata
hash/provenance manifests
package scripts
```

Record whether renaming the file would require updates to:

```text
scripts
tests
docs
manifests
generated artifacts
provenance records
build verification
```

Do not assume a rename is local.

---

# 8. Content leakage

Search current durable files for implementation-sequence language even when filenames are clean.

Examples of suspicious durable prose:

```text
"generated in C6"
"Parcel D output"
"use the C5 file"
"from Batch 2"
"Phase 3 source"
```

where the reader must know a historical task sequence to understand the current system.

For each content finding classify it as:

```text
A. historical context legitimately preserved
B. current durable prose should be rewritten semantically
C. current code comment should be rewritten semantically
D. current data field/value embeds a transient ID and needs design review
E. false positive / legitimate domain usage
```

---

# 9. Schema/data-field check

Look beyond filenames.

Inspect current structured files for field names or values that may encode temporary task IDs, for example:

```text
source: "c6"
phase: "C5"
parcel: "D"
batch: 3
provenanceStage: "C7"
```

Only flag these if they are truly temporary implementation identifiers rather than durable schema concepts.

If a transient ID has become part of a generated schema, manifest, or provenance contract, call that out explicitly because cleanup may be broader than a filename rename.

---

# 10. Generated-artifact relationship

For each actionable finding, determine whether the artifact is:

```text
canonical source
derived source
review evidence
generated runtime source
temporary preview
historical handoff
```

If an artifact can be safely regenerated under a semantic filename, say so.

If renaming would alter hash/provenance evidence or require regeneration, document that dependency.

Do not perform regeneration in this audit.

---

# 11. Rename strategy

For each actionable finding propose:

```text
current name/reference
semantic replacement name/reference
why the semantic name is better
consumer updates required
whether content must also change
whether regenerated outputs/manifests are affected
```

Replacement names should describe the artifact’s current meaning, not merely delete the transient token.

Avoid vague replacements like:

```text
final
new
latest
misc
temp
```

Prefer stable semantic terms such as:

```text
fauna
fauna-lineage
composed-fauna
official-master
localized-reference-names
canonical-provenance
review-preview
```

only where the actual file contents justify them.

---

# 12. Known examples to inspect first

Inspect these exact tracked files:

```text
reference-source/localized-name-c6-fauna-ja-preview.csv
reference-source/localized-name-provenance-c5-fauna-lineage.csv
reference-source/localized-name-provenance-c6-fauna.csv
```

Determine:

- exact role;
- current consumers;
- whether each remains active;
- semantic replacement candidate;
- whether one or more are obsolete and could instead be removed in a later implementation;
- whether any durable docs/scripts refer to `C5`/`C6` concepts around them.

Do not assume all three necessarily require only renaming.

---

# 13. Broader tracked-tree scan

Perform a complete tracked-path scan for likely transient identifiers.

Produce two lists:

## A. Historical-owner matches

Examples:

```text
docs/audits/...
docs/implementation-briefs/...
```

where the identifier is legitimate and no action is recommended.

## B. Potential leaks outside historical-owner context

Examples:

```text
reference-source/
src/
scripts/
tests/
public/
README/current owner docs
```

Every potential leak must be manually/contextually classified.

Do not produce a raw grep dump as the final result.

---

# 14. Durable-document cleanup boundary

Current owner documents should not depend on historical task numbering.

Inspect at minimum:

```text
README.md
AGENTS.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/DEPLOYMENT.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/localization/LOCALE-ONBOARDING.md
docs/THIRD-PARTY-REFERENCES.md
```

If they contain references like:

```text
Parcel C6
C7 output
Batch 2 file
```

recommend rewriting them to the underlying feature/artifact name.

Do not remove links to historical audit/brief filenames merely because those filenames contain the historical identifiers, unless the link text itself makes the temporary identifier part of current terminology.

---

# 15. Code-comment cleanup boundary

Inspect comments in:

```text
src/
scripts/
tests/
```

for references to temporary work sequence IDs.

Example:

```ts
// Added in C6
```

should generally become:

```ts
// Handles composed-fauna provenance
```

if that is the actual current concept.

Do not rewrite comments merely because they mention a historical decision when that history is materially useful.

---

# 16. Test-name cleanup boundary

Test descriptions may contain temporary sequence IDs if they were copied from implementation work.

Classify whether they:

```text
still describe a current behavior clearly
or
require historical context to understand
```

Recommend semantic names for the latter.

Do not rename every old test for stylistic reasons.

---

# 17. Public-repository readability standard

Assume a technically capable external reader arrives at the public repository with:

```text
no access to prior ChatGPT conversations
no knowledge of Parcel/C5/C6 implementation sequencing
```

The current durable tree should be understandable from:

```text
filenames
README
owner docs
source comments
script names
test names
```

without requiring the reader to reconstruct historical project management notation.

Use this as the main decision standard.

---

# 18. History policy

Do not recommend history rewriting for ordinary transient-ID leakage.

The existing development history is intentionally retained.

If current files are renamed later, historical commits may continue to contain the old names.

That is acceptable.

History rewrite should only be raised if the audit unexpectedly finds materially sensitive content unrelated to this naming issue.

---

# 19. Classification system

Classify each finding as:

```text
TID-A — historical owner-use; legitimate, no action
TID-B — current filename/path leak; rename recommended
TID-C — current durable prose/comment/test-name leak; semantic rewrite recommended
TID-D — current schema/data-field leak; design/implementation required
TID-E — obsolete transient artifact; removal may be better than rename
TID-F — false positive / legitimate domain identifier
```

For each actionable finding, assign one of B/C/D/E.

---

# 20. Release-blocker decision

End with one overall disposition:

```text
TREE-A — no actionable current-tree leakage found; release blocker cleared

TREE-B — small bounded rename/rewrite cleanup required before release

TREE-C — several cross-cutting renames/consumer updates required before release

TREE-D — transient IDs have entered schema/generated contracts and need a broader cleanup design before release
```

Do not use TREE-D unless the evidence shows genuine contract/schema entanglement.

---

# 21. Expected report structure

Create:

```text
docs/audits/TRACKED-TREE-TRANSIENT-IDENTIFIER-REVIEW.md
```

or an equally clear repository-consistent filename.

Include:

1. baseline;
2. search strategy;
3. identifier families scanned;
4. false-positive rules;
5. known `reference-source` findings;
6. complete actionable findings table;
7. historical-owner findings summary;
8. durable-doc findings;
9. code/script/test findings;
10. schema/data findings;
11. consumer/dependency map for each actionable path;
12. semantic replacement recommendations;
13. remove-vs-rename decisions where relevant;
14. implementation scope estimate;
15. TREE-A/B/C/D disposition;
16. exact pre-release cleanup recommendation.

---

# 22. No implementation

This audit is read-only.

Do not:

```text
rename files
edit file contents
change scripts
change tests
regenerate data
change manifests
update hashes
change package scripts
rewrite history
commit
push
deploy
```

Only create the audit report.

---

# 23. Verification

Run:

```text
git diff --check
```

Confirm:

```text
only the audit report is created
the supplied audit brief remains untouched
no tracked source/data/runtime/doc-owner file changed
no commit/push/deployment/history rewrite occurred
```

No full build/test run is required for report-only work.

---

# Expected Codex summary

Report:

1. branch/commit;
2. report path;
3. overall TREE-A/B/C/D disposition;
4. number of tracked-path matches scanned;
5. number of actionable filename/path leaks;
6. number of actionable content leaks;
7. known `reference-source` C5/C6 findings;
8. whether any artifact is obsolete rather than rename-worthy;
9. current consumers for each actionable artifact;
10. whether schemas/manifests/generated contracts contain transient IDs;
11. proposed semantic replacements;
12. historical-owner matches intentionally retained;
13. false-positive categories;
14. exact implementation scope recommended;
15. checks run;
16. confirmation no implementation occurred.

Suggested commit message:

```text
docs: audit transient identifier leakage
```
