# CODEX AUDIT BRIEF — Documentation Archive Classification for 1.0

## Objective

Classify the current release-era documentation into:

```text
KEEP LOOSE
ARCHIVE — IMPLEMENTATION HISTORY
ARCHIVE — SUPERSEDED AUDIT
ARCHIVE — SUPERSEDED / EXPLORATORY BENCHMARK
KEEP LOOSE — ACTIVE / CURRENT EVIDENCE
KEEP LOOSE — CURRENT OPERATIONAL / MAINTAINER GUIDANCE
```

This audit is preparation for the public `1.0.0` repository.

The goal is to avoid publishing hundreds of loose transitional documents while preserving current authoritative documentation, current release evidence, still-relevant operational guidance, active/post-release decision evidence, and durable historical material in a searchable archive.

Do **not** create ZIP files in this audit. Do **not** move, rename, delete, edit, compress, or rewrite any existing document. This is classification and dependency analysis only.

## 1. Read first

Read:

```text
AGENTS.md
docs/CODE-STYLE.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/DEPLOYMENT.md
README.md
```

Also read the current release evidence most relevant to publication and launch, including:

```text
docs/audits/RELEASE-CANDIDATE-1.0.0-RC.1-ACCEPTANCE.md
docs/audits/RELEASE-PREPARATION-VERIFICATION.md
docs/audits/RELEASE-READINESS-REVIEW.md
docs/audits/PUBLIC-REPOSITORY-PUBLICATION-SIGNOFF.md
```

Inspect other documents only as required to classify them accurately.

Do not modify the supplied audit brief.

## 2. Scope

Classify every tracked file in:

```text
docs/implementation-briefs/
docs/audits/
docs/benchmarks/
```

Also include:

```text
docs/HISTORY-BENCHMARK.md
```

and any other clearly benchmark/audit/brief-style historical document outside those directories if it belongs to the same archival problem.

Do not classify normal durable docs such as:

```text
ARCHITECTURE.md
DOMAIN-RULES.md
UX-DESIGN.md
BACKLOG.md
DEPLOYMENT.md
IMPLEMENTATION-WORKFLOW.md
CODE-STYLE.md
localization handbooks/glossaries
```

unless they are discovered to be misfiled historical artifacts.

## 3. Governing principle

Use this rule:

> Keep loose anything that is still authoritative, currently actionable, or directly relevant to understanding, operating, verifying, maintaining, or releasing the 1.0 product. Archive material whose remaining value is historical rather than operational.

Age alone is not a classification criterion.

Do not archive a document merely because it is old.

Do not keep a document loose merely because another file links to it. Instead, evaluate whether the dependency should remain live or be updated during later archive implementation.

## 4. Implementation briefs — default posture

Implementation briefs are presumed archival once their work is complete.

A completed implementation brief normally stops being authoritative after:

```text
the implementation has landed
the implementation has been accepted
current durable docs/code describe the resulting behavior
```

Therefore classify most completed briefs as:

```text
ARCHIVE — IMPLEMENTATION HISTORY
```

Keep a brief loose only if it is still:

```text
actively governing unfinished release work
needed as current maintainer procedure
needed to interpret an active current audit/report
or intentionally retained as a live operational specification
```

Examples likely to remain loose temporarily may include current launch/runbook work, if present.

Do not keep large families of superseded briefs loose merely for chronological completeness.

## 5. Audits — curate, do not blanket archive

For each audit, determine whether it is:

### Current release evidence

Examples may include:

```text
RC acceptance
release-preparation verification
publication signoff
current security/release disposition
```

These should usually remain loose.

### Active post-release evidence

An audit supporting a deliberately deferred item may remain loose if current durable docs or backlog rely on it as the evidence base for later work.

Examples might include:

```text
reference-overlay prototype
specific unresolved accessibility evidence
HSTS policy evidence
```

Retain only where current relevance is real.

### Superseded transitional audit

If a later audit/correction/reassessment has replaced its practical conclusion, and current docs no longer need the earlier document as active evidence, classify:

```text
ARCHIVE — SUPERSEDED AUDIT
```

The historical chain remains available in Git history and later ZIP archive.

## 6. Benchmarks — retain only current contract/evidence

For each benchmark, determine whether its measured result still constrains or informs the released product.

Keep loose if current release behavior, capacity guidance, deployment assumptions, or backlog reasoning still relies on the benchmark.

Typical examples may include:

```text
import-capacity limits
browser-storage capacity
performance/bundle evidence
hosting/security-header evidence
```

Archive if:

```text
superseded by newer measurement
exploratory only
prototype-specific
no current durable doc relies on it
or current behavior no longer matches the measured configuration
```

Do not archive a benchmark solely because it is technical or old.

## 7. Inbound reference audit

Before assigning any archive classification, inspect references to the candidate document from:

```text
README.md
AGENTS.md
all current durable docs
current loose audits
current loose benchmarks
source comments if applicable
package/scripts if applicable
```

For each candidate document, record:

```text
inbound reference count
referring files
whether the reference is:
  current/authoritative
  historical/contextual
  superseded
  safe to update during later archive implementation
```

A live link does not automatically force `KEEP LOOSE`.

Instead classify one of:

```text
KEEP — reference remains valid and useful
ARCHIVE — later implementation must update referring document
ARCHIVE — reference is historical and can point to archive inventory instead
```

## 8. Outbound dependency audit

Also inspect whether a document itself is a key index or evidence hub pointing to many other historical files.

If archiving that document would make the current documentation graph harder to understand, consider keeping it loose even if its primary findings are historical.

Examples:

```text
release-readiness synthesis
publication signoff
release-preparation verification
```

The goal is a clean public tree, not a broken evidence graph.

## 9. Supersession relationships

Identify explicit or practical supersession chains.

Examples of patterns:

```text
audit -> correction -> reassessment
planning audit -> implementation audit -> release verification
initial localization review -> later closure QA
geometry review -> corrected geometry review
```

For each chain, identify:

```text
current governing document
historical predecessors
whether predecessors can all move to archive
```

Prefer keeping the final accepted/current synthesis loose and archiving intermediate stages.

## 10. Release-specific keep criteria

A document should strongly favor `KEEP LOOSE` if it directly establishes any of:

```text
1.0 RC acceptance
publication scope/signoff
current deployment policy
current security boundary
current legal/licence/third-party preparation evidence
current accessibility limitation evidence
current known deferred limitation evidence
current capacity envelope that users/maintainers rely on
current operational rollback/release assumption
```

Do not keep every underlying audit loose if a current synthesis already carries the accepted result and links are not operationally necessary.

## 11. Historical-value criterion

Archive material is not considered disposable.

The later archive implementation should preserve:

```text
original filename
original bytes
relative category
historical chronology
searchability after extraction
```

The audit should therefore classify with preservation in mind, not deletion.

Do not recommend history rewriting.

## 12. Proposed archive structure

Assume later implementation will likely produce something similar to:

```text
docs/
  implementation-briefs/
    ARCHIVE.md
    pre-1.0-implementation-history.zip
    <current loose briefs>

  audits/
    ARCHIVE.md
    pre-1.0-superseded-audits.zip
    <current loose audits>

  benchmarks/
    ARCHIVE.md
    pre-1.0-superseded-benchmarks.zip
    <current loose benchmarks>
```

This audit may recommend different names if there is a stronger reason, but preserve:

```text
one immutable pre-1.0 archive per category
clear current loose surface
short human-readable archive index
```

Do not create the archives yet.

## 13. Archive immutability policy

Recommend and document this policy:

```text
pre-1.0 archives become immutable once committed
future archival batches use new version/date-bounded archives
do not repeatedly rewrite old ZIPs
```

Reason:

```text
binary ZIP changes produce poor Git deltas
immutability preserves historical identity
```

The audit should state whether this model fits the repository.

## 14. Archive index requirements

For later implementation, each `ARCHIVE.md` should include:

```text
archive filename
release/date boundary
number of files
SHA-256
brief explanation of why the material is archived
filename inventory
```

If the inventory is very long, recommend a generated compact format, but it must remain possible to discover whether a historical document is in the archive without downloading/extracting the ZIP.

The ZIP is not the index.

## 15. Classification table

Produce one row for every file in scope.

Columns:

```text
Path
Category
Classification
Current relevance
Superseded by / governing replacement
Inbound references
Later action needed
Rationale
```

Use exact classifications:

```text
KEEP LOOSE — CURRENT AUTHORITATIVE
KEEP LOOSE — RELEASE EVIDENCE
KEEP LOOSE — ACTIVE POST-RELEASE EVIDENCE
KEEP LOOSE — CURRENT OPERATIONAL
ARCHIVE — IMPLEMENTATION HISTORY
ARCHIVE — SUPERSEDED AUDIT
ARCHIVE — SUPERSEDED / EXPLORATORY BENCHMARK
REVIEW REQUIRED
```

Use `REVIEW REQUIRED` only where evidence is genuinely ambiguous.

## 16. Summary counts

Report totals:

```text
implementation briefs:
  total
  keep loose
  archive
  review required

audits:
  total
  keep loose
  archive
  review required

benchmarks:
  total
  keep loose
  archive
  review required

other in-scope historical docs:
  total
  keep loose
  archive
  review required
```

Also estimate the resulting loose-file count after archive implementation.

## 17. Recommended keep set

Provide a concise explicit list of all files recommended to remain loose.

This is important because the intended public surface should be reviewable without scanning hundreds of table rows.

Group by:

```text
implementation briefs
audits
benchmarks
other
```

For each kept file, give one sentence explaining why it remains current.

## 18. Recommended archive set

For archive candidates, group them into:

```text
pre-1.0 implementation history
pre-1.0 superseded audits
pre-1.0 superseded/exploratory benchmarks
```

Do not list only broad families; the detailed classification table must still enumerate every file.

## 19. Link-rewrite plan

Produce a later-implementation link plan:

```text
referring file
current link
target document classification
future replacement link or wording
```

Preferred replacement targets:

```text
current governing document
ARCHIVE.md inventory entry
durable current docs
```

Avoid linking directly into ZIP contents from Markdown.

Do not implement rewrites in this audit.

## 20. Current source comments / docs references

Search for direct references to historical brief/audit filenames in:

```text
src/
scripts/
README.md
AGENTS.md
docs/*.md
docs/localization/
```

Classify those references.

A source comment that depends on a historical brief should normally be rewritten later to explain intent directly rather than preserve a task-document dependency.

Record such cases explicitly.

## 21. Transitional naming / sequence IDs

Historical archived documents may retain their original filenames and contents, including old sequence/task identifiers.

Do not rename historical files merely to remove transitional identifiers.

The current loose documentation surface should continue to follow the repository's durable naming standard.

If any current loose candidate still exposes obsolete task-sequence naming in a way that is not historically necessary, flag it.

## 22. Public repository usability

Assess the resulting proposed loose documentation surface from the perspective of a new public visitor.

It should not require understanding:

```text
Codex workflow chronology
parcel/batch/tranche history
correction chains
temporary audit IDs
internal implementation sequence
```

to find current product/maintainer information.

The final recommendation should answer:

> Would a technically competent outsider encountering the 1.0 repository see a coherent current documentation set rather than internal development exhaust?

## 23. Do not archive these merely for tidiness

Do not recommend archiving any document if it remains the only durable evidence for:

```text
a known release limitation
a current security/deployment contract
a current capacity limit
a current legal/publication decision
a deliberately deferred high-risk feature
```

unless a current synthesis already carries that evidence adequately.

## 24. No implementation

Do not:

```text
create ZIP files
move files
delete files
rename files
edit current docs
update links
change README
change AGENTS.md
change source comments
change .gitignore
commit
push
tag
deploy
publish
```

Only create the classification audit report.

## 25. Output report

Create:

```text
docs/audits/DOCUMENTATION-ARCHIVE-CLASSIFICATION-REVIEW.md
```

Include:

1. baseline branch/commit;
2. scope and counts;
3. classification principles;
4. proposed archive structure;
5. immutable-archive policy;
6. complete classification table;
7. keep-loose summary;
8. archive summary;
9. ambiguous `REVIEW REQUIRED` items;
10. supersession chains;
11. inbound/outbound dependency findings;
12. link-rewrite plan;
13. source-comment references;
14. public-repository usability assessment;
15. summary counts;
16. recommended next implementation step.

## 26. Disposition

End with one:

```text
DOCARCH-A — classification is complete; archive implementation can proceed

DOCARCH-B — classification is mostly complete; finite maintainer decisions remain

DOCARCH-C — current documentation graph is too entangled for safe bulk archiving without prior cleanup
```

If `DOCARCH-B`, list the exact finite decisions required.

Do not use `DOCARCH-C` merely because there are many files; use it only if dependencies make classification genuinely unsafe.

## 27. Verification

Run:

```sh
git diff --check
git status --short
```

Confirm:

```text
only docs/audits/DOCUMENTATION-ARCHIVE-CLASSIFICATION-REVIEW.md is new/changed
the supplied audit brief remains untouched
no existing tracked document changed
no archive ZIP exists yet
no commit/push/deployment/publication action occurred
```

No build/test suite is required for this audit-only task.

## Expected Codex summary

Report:

1. baseline branch/commit;
2. report path;
3. disposition;
4. implementation-brief totals / keep / archive / review;
5. audit totals / keep / archive / review;
6. benchmark totals / keep / archive / review;
7. resulting estimated loose-file count;
8. exact keep-loose set summary;
9. number of inbound references requiring later rewrite;
10. any source comments that reference historical task documents;
11. ambiguous maintainer decisions, if any;
12. confirmation no files were moved/edited/compressed;
13. confirmation no commit/push/tag/deploy/publication occurred.

Suggested commit message after review, for the audit report only:

```text
docs: classify pre-1.0 documentation archives
```
