# Public release preparation verification

Prepared 24 September 2026. This is implementation evidence, not release-candidate
acceptance, publication clearance or a record of launch.

## Baseline and preserved boundaries

- Starting checkout: `staging`, `0cc1010bb24b99cfa07088ebc422e98f860a8845`.
- Initial tracked worktree was clean; only the supplied public-release preparation
  brief was untracked. It remains unchanged. No reset to the brief's older SHA.
- The ignored overlay prototype, historical assets/briefs/benchmarks and Git
  history were preserved. No game inputs were used or altered.
- No domain, schema, serialization, storage, import/export, fatal-state routing,
  history, reference-data/manifest/overlay, indexing, security-header or main
  workspace implementation changed. Source-diff checks confirmed those paths
  unchanged; production reference integrity checks also passed.

## Prepared implementation

Application version remains **0.0.0**, from package.json with both lockfile roots
consistent and npm privacy retained. GPL metadata is GPL-3.0-or-later. Later
deliberate candidate testing uses 1.0.0-rc.1; accepted launch uses 1.0.0; tags use
`v<version>`. None was created here.

The typed build-identity resolver prefers actual checkout HEAD over configurable
Pages metadata, includes non-ignored untracked changes in modified status, and
exposes only version, full commit, status and conditional source URL. A valid
Pages SHA without checkout/status proof remains unverified. Git-free archives
build with unknown identity. Only clean verified checkout metadata enables an
exact source link. No branch names, environment dumps, machine paths, timestamps,
secrets or runtime GitHub requests enter this identity.

The official unmodified GNU GPLv3 text was downloaded directly from
https://www.gnu.org/licenses/gpl-3.0.txt : 35,149 bytes; SHA-256
`3972dc9744f6499f0f9b2dbf76696f2ae7ad8af9b23dde66d6af86c9dfb36986`.
README and the root notice explicitly choose version 3 **or any later version**
for project-authored application/build/test code for which the project holds
rights, Copyright 2026 Gooberpede. Upstream rights and combined-work obligations
remain intact. The grant does not relicense artwork or game-derived content.

The supplied favicon certificate was read without publishing its licensee
identifier, embedded image or original PDF. Its specified credit is visible:
“designed by gravisio from Flaticon”. Current PNGs and historical favicon.svg
remain under the owner's chosen separate-licence arrangement, with the existing
category URL identified honestly. No bespoke permission or legal clearance is
claimed. The private source certificate was not modified.

Actual emitted module inspection found React/React DOM/Scheduler, Vite's
modulepreload polyfill and Rolldown runtime. Full installed MIT notices, including
Rolldown's accompanying notices, are retained. csv-parse is build/review tooling,
not in that browser module graph. Fonts remain external with OFL provenance.
The authoritative root legal files are emitted verbatim under `dist/legal` and
served as readable text; neither is bundled into JS or fetched at startup.

Confirmed unused current-tree removals: `src/assets/hero.png`,
`src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg`. Inspection
covered imports, HTML, CSS, scripts and outputs: only icons.svg was automatically
copied before removal; none was referenced. The final build emits none of them.
Favicons remain byte-identical. Historical versions were not deleted.

About retains the app name/description and shared modal behavior, with localized
version/status, scoped GPL/no-warranty copy, legal/source/Issues/email/funding
links, independent/unofficial meaning and local-save/export reminder. Exact
repository, Issues, mailbox and Ko-Fi destinations match the approved brief.
All ten locales are covered; en-GB adds only two genuine licence-spelling
overrides. New/replaced copy is Codex-drafted and reviewed, not new DeepL/native
review. Seven adjudicated review CSVs preserve unchanged historical rows and
record 17 new/replaced About rows honestly; Japanese retains its generated
catalogue-derived snapshot. Tests separately preserve historical comparative
evidence and assert the new single-source provenance. Full catalogue parity is
430 keys with unchanged placeholder guarantees.

README, notice/ledger, Architecture, UX, Workflow, Deployment, Backlog and locale
handbook now distinguish preparation from launch and reconcile the supplied
mailbox, HSTS, iPhone, funding and paused-prototype status. The dated readiness
audit retains its findings with a current-disposition link. Temporary sequence
names were removed from current guidance being reconciled; historical filenames
and reports were preserved.

## Automated evidence

Node 24.21.0 / npm 11.19.0. Commands below ran on the prepared source:

| Command | Result |
| --- | --- |
| `npm test` | PASS: 260 tests, 0 failures, including 3 new build-identity tests. |
| `npm run test:components` | PASS: 96 tests across 10 files, including all ten About locales and clean-source/escaping coverage. |
| `npm run typecheck:tests` | PASS. |
| `npm run localization:verify` | PASS: default Japanese closure, provenance and overlay checks; full catalogue coverage also exercised by npm test. |
| `npm run localization:terminology:verify` | PASS: default Japanese, 37 evidence rows / 19 terms. |
| `npm run localization:provenance:verify` | PASS: 3,561 entities, 4,818 rows, zero unresolved; 922 composed fauna. |
| `npm run build` | PASS: full TypeScript/Vite/reference checks, including all eight non-English overlay verifiers. Existing >500 kB bundle advisory remains; no optimization undertaken. |
| `node --experimental-strip-types scripts/verify-release-dist.ts` | PASS: actual licence/notice bytes, official licence hash, full upstream notices, retained favicon/security files, identity/source-link condition, no legal-text JS bundle and no removed assets. |
| `npm run lint` | PASS in isolated checkout-shaped copy. Main-worktree invocation failed because ESLint discovers the pre-existing ignored prototype's second tsconfig root (395 parser errors); prototype/config left untouched. |
| `git diff --check` | PASS. |

A separate non-Git copy of current repository files excluded node_modules,
ignored prototypes and game inputs. `npm ci --no-audit --no-fund` installed 230
packages successfully. Production build, legal-output verification and lint
passed there. This verifies a source archive/clean install, not a newly committed
release candidate. Clean commit identity is covered by resolver/component tests;
no temporary commit or branch was created to manufacture a clean release build.

## Browser evidence and limits

Disposable loopback preview origins were used; the user's real browser storage
was not cleared or modified. In-app Chromium checks covered all ten locales at
1366×768 and 1600×900. About had seven reachable links in the modified build,
no dialog or document horizontal overflow, and initial focus inside the modal.
Measured dialog width was 684 CSS pixels; height ranged 616.44–661.16 pixels.
French/German were tallest. Visual inspection confirmed wrapping and separation
of the links, paragraphs and Close control.

The actual built modified checkout displayed `0.0.0 · 0cc1010b · local / modified`.
The separately built Git-free archive displayed `0.0.0 · — · local / unverified`
and no exact-source link. Final UK spelling overrides were checked after rebuild.
Legal HTTP routes returned 200 and `text/plain`; emitted files also passed exact
byte comparisons with their authoritative sources.

Keyboard Enter opened About. Tab/Shift+Tab wrapped, Escape restored the trigger,
and all links/Close controls remained visible while traversing a 683×384
constrained viewport, with solid 2px focus outlines. This is viewport testing,
**not true 200% browser zoom**. A disposable outpost survived opening/closing
About; Undo removed the creation, Redo restored it, and reload preserved it.
The tested workspace width was unchanged by About. Component tests additionally
verify backdrop behavior, Close activation, concise accessible description,
exact destinations, isolated external links and no fetch/storage writes.

Forced-colors CSS explicitly uses the system Highlight focus color, but the
available browser interface did not expose forced-colors emulation. No actual
Windows High Contrast, Narrator, true browser zoom or new Apple test was claimed.
No screenshot is required or retained as durable verification evidence.

## About initial-focus correction

The original inside-modal focus check did not catch scrolling caused by focusing
the bottom Close button. About now initially focuses its semantic heading with
`tabIndex={-1}`. The heading stays outside ordinary Tab order; initial Shift+Tab
wraps to the final Close button, while forward Tab reaches the header Close
button. Existing Escape, close actions and opener focus restoration remain.

In the corrected production build, constrained 683×384 Chromium checks in English
and German measured `scrollTop === 0`, with the focused heading and app name
visible. The modal was genuinely scrollable: 350px client height against 566px
and 586px content heights respectively. English keyboard checks confirmed
backward/forward wrapping and Escape restoration. The accessibility tree exposes
the body text, and the German semantic snapshot includes all eight paragraphs.
No paragraphs have tabindex; the concise description and link semantics remain
unchanged. Actual Narrator reading/scan navigation still requires manual testing.

Correction verification passed: 260 Node tests, 96 component tests across ten
files, test typecheck, all three localization verification commands, production
build, legal-output verification, isolated-copy lint and `git diff --check`.
The all-locale component tests now assert heading focus, zero initial scroll,
non-tabbable paragraphs and interactive-only Tab stops. JSDOM scroll assertions
are supplemented by the real-browser measurements above. Main-worktree lint
still encounters the ignored prototype's multiple-tsconfig-root problem (396
parser errors); the isolated copy passed without changing that prototype.

## Narrator defects and unsuccessful reading-region attempt

Owner Narrator testing rejected the preceding implementation: the title-bar
glyph was announced as “times”, and the informational paragraphs were unreadable.
These are confirmed defects. Earlier structural evidence did not establish
Narrator acceptance; the description and interactive-only Tab-path statements
above describe the superseded implementation.

The title-bar button now hides the decorative glyph with `aria-hidden="true"`
and takes its localized Close name from the existing visually hidden text
pattern, without a competing aria-label. Tooltip and action remain unchanged.
The attempted correction exposed one `role="document"` region with `tabIndex={0}`; its eight
paragraphs retain native semantics and no tabindex, and its links remain separate
Tab stops. The modal keeps its heading label and omits aria-describedby.
Initial focus remains on the top heading with tabindex -1. Forward Tab visits
header Close, the reading region, each link, then bottom Close.

This follows the [WAI-ARIA document role](https://www.w3.org/TR/wai-aria-1.2/#document)
for a focusable rich-text reading region and
[APG modal-dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
on top static initial focus and omitting descriptions for structured content.
The document region receives the same visible focus outline and forced-colors
focus treatment as the dialog controls.

Production-preview checks at 683×384 in English and German confirmed zero initial
scroll, focused heading, visible title/app name, and a scrollable dialog. The
accessibility tree names the header button Close / Schließen with no glyph text;
the semantic snapshot exposes a document containing paragraphs and distinct
links. Tab reaches that region. Backward wrapping, Enter on header Close, Escape
and opener restoration were checked in the browser. These are supporting checks,
not Narrator acceptance.

Verification rerun: 260 Node tests, 96 component tests, test typecheck, all three
localization verification commands, production build, legal-output verification
and git diff --check passed. Lint passed in the isolated source copy; the main
worktree still reports the existing ignored-prototype tsconfig-root conflict
(396 parser errors). No unrelated configuration was changed.

**Subsequent owner manual result: FAIL.** In Windows/Chromium Narrator testing,
the About title and interactive links/buttons are announced, but ordinary body
paragraphs are not read. The focusable document region exposed the heading but
did not make the remaining text readable. The implementation and automated
results above describe the unsuccessful attempt, not Narrator acceptance.

The document role, body-region tabindex and region-only focus CSS have now been
removed. Ordinary paragraph/link semantics remain. The localized Close name,
hidden decorative glyph, heading initial focus and open-at-top correction are
retained. Only links/buttons are ordinary Tab stops. The modal still omits
aria-describedby; no flattened body description was introduced.

The static-body failure is recorded in BACKLOG.md and the shared accessibility
follow-up reconciliation alongside Narrator browse/scan/focus-mode and
announcement issues. **About/Narrator is not closed.** The broader investigation
is deferred at the owner's request and was not reopened during this removal.

Removal verification passed: 260 Node tests, 96 component tests, test typecheck,
production build, isolated-copy lint and `git diff --check`. Updated component
tests retain localized Close/glyph assertions, heading focus, zero initial
scroll, links-only/button-only Tab traversal, Escape and opener restoration,
and assert that no document region remains. These checks do not overturn the
manual Narrator **FAIL**.

## Remaining gates and owner checklist

Decisions are settled and implementation is prepared. Manual acceptance and
publication sign-off remain pending; candidate freeze/acceptance and launch
operations have not occurred.

1. At true browser 200% zoom, traverse every About link and both Close controls
   in longer locales; verify local scrolling, Escape and focus restoration.
2. In actual Windows High Contrast, verify link/button focus and readability.
   Resolve and manually retest the deferred Narrator static-body defect; do not
   equate structural tests with fluent native speech.
3. Check external destinations without posting an issue, sending mail or making
   a payment. Mailbox delivery/reply is already owner-verified. Public
   unauthenticated repository/Issues/exact-source availability and deployed
   identity require the later authorized publication/deployment gate.
4. Complete separate Ko-Fi presentation/membership readiness, publication review
   and frozen-candidate acceptance. Specific non-favicon ledger questions remain:
   redistribution basis for extracted game records/official text/history;
   applicable terms for actual translation jobs; historical hero.png/icons.svg
   provenance/disposition. No broad legal certification is claimed.

No commit, push, branch, tag, release, publication, history rewrite, settings
change, deployment, message, payment, third-party contact, or Ko-Fi modification
was performed. Final indexing/runbook/launch execution remains separately
authorized work. Suggested combined commit: `feat: prepare public release identity and project information`.
