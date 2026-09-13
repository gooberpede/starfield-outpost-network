# CODEX CORRECTION BRIEF — Durable Naming Cleanup for Localization Input Config

## Purpose

Apply one narrow naming cleanup before committing the Japanese official reference-name overlay generator.

Do **not** redesign the generator.

Do **not** change generated Japanese values, runtime behavior, provenance logic, manifest semantics, or build commands.

The only goal is to stop new durable code from depending on a transient roadmap-style filename:

```text
.local-work/localization/provenance/c2-inputs.json
```

No commit or push.

---

# Naming rule

Durable implementation names must describe function or domain purpose.

Avoid ad-hoc roadmap identifiers such as:

```text
C2
C7
D1
```

in:

- filenames;
- exported functions;
- config paths;
- generated artifact names;
- durable documentation references.

Those labels may remain in historical audit/report prose where they describe past planning, but they should not be required to understand active code.

---

# Current issue

The new Japanese reference-name generator currently defaults to or references:

```text
.local-work/localization/provenance/c2-inputs.json
```

That filename encodes a transient project parcel identifier rather than what the file actually contains.

The generator should instead depend on a functionally named local config.

---

# Required correction

Rename the local configuration file to a durable functional name.

Preferred name:

```text
.local-work/localization/provenance/localization-provenance-inputs.json
```

A similarly clear alternative is acceptable if it better matches existing repository naming conventions, for example:

```text
official-localization-inputs.json
```

or:

```text
provenance-inputs.json
```

Prefer the most explicit name that remains reasonably concise.

---

# Update active references

Update all active implementation references to use the new durable filename.

Search the repository for:

```text
c2-inputs.json
```

and classify every occurrence.

For each occurrence:

## Active code/config/documentation

Update it to the durable functional name.

## Historical audit/prose

It may remain unchanged if it is clearly documenting a past artifact and changing it would distort history.

Do not mechanically rewrite historical audit evidence merely to erase the label.

---

# Backward compatibility

If the old file is only an ignored local developer config and there is no strong reason to preserve the filename, prefer a clean rename.

If existing tooling or developer workflows still depend on the old path, temporary backward compatibility is acceptable.

Preferred compatibility pattern:

```text
1. look for new durable filename;
2. if absent, optionally fall back to legacy c2-inputs.json;
3. emit a clear deprecation note;
4. keep the new name as the documented/default path.
```

Do not make the legacy name the primary path.

If backward compatibility is unnecessary, do not add extra migration machinery.

---

# Local ignored file handling

Because the config lives under:

```text
.local-work/
```

it may be untracked.

If the actual local file exists, rename/move it locally so the generator continues to run.

Do not commit ignored local config contents.

Do not copy sensitive or machine-specific local paths into tracked files.

---

# Documentation

Update any durable regeneration/setup documentation that tells developers to create or edit:

```text
c2-inputs.json
```

Use the new functional filename.

Prefer wording based on purpose, for example:

```text
localization provenance input configuration
```

rather than:

```text
C2 inputs
```

Historical audit documents may preserve old naming where appropriate.

---

# Tests

Add or adjust focused tests only if configuration-path behavior is already tested.

At minimum verify:

- default path points to the new durable filename;
- generator still loads the intended local config;
- any deliberate legacy fallback works only as documented;
- no generated output changes solely because of the rename.

Do not add a large config abstraction for this cleanup.

---

# Generated artifacts

These must remain unchanged:

```text
src/localization/generated/ja-JP-reference-names.ts
reference-source/localized-reference-names-manifest.json
```

unless an existing sidecar intentionally records the local config filename.

If a committed manifest currently records `c2-inputs.json`, replace it with a functional descriptor/path only if that field is part of the durable contract.

Do not create generated-value churn.

---

# Verification

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:build
npm run localization:reference-names:verify
npm run build
npm run lint
git diff --check
```

Expected result:

```text
3,561 generated Japanese reference names
4,818 qualified Japanese IDs/components resolved
0 reference-name drift
0 provenance drift
```

The committed generated Japanese module and reproducibility sidecar should remain byte-stable unless the durable config path is intentionally represented in the sidecar.

---

# Acceptance criteria

The correction is complete when:

1. active code no longer depends on `c2-inputs.json` as its primary config filename;
2. the replacement filename describes the config's function;
3. all active durable documentation uses the new name;
4. historical audit references are preserved where appropriate;
5. ignored local config is renamed or supported compatibly;
6. no transient roadmap identifier is introduced as a replacement;
7. Japanese generated output is unchanged;
8. provenance output is unchanged;
9. reference-name verify reports zero drift;
10. provenance verify reports zero drift;
11. all required tests/build/lint/checks pass;
12. no unrelated refactor is introduced;
13. no commit or push is performed.

---

# Final Codex report

Report:

- chosen durable filename;
- files/references updated;
- whether legacy fallback was retained;
- whether any historical references were intentionally left unchanged;
- whether generated artifacts changed;
- reference-name verification result;
- provenance verification result;
- full test/build/lint result;
- confirmation that no runtime/localization behavior changed.

Do not proceed to runtime integration in this correction.
