# HSTS follow-up decision · 21 November 2026

**HSTS-FU-B — retain the 30-day apex policy.** Production served exactly one `Strict-Transport-Security: max-age=2592000` on both the application and a static file. The owner verified the same policy by 23 September, 59 calendar days before this review. Continued operation is a reasonable inference. The owner has now confirmed the authenticated staging response. The remaining decision evidence covers production deployment and incident history, current Cloudflare settings and certificate renewal, and planned changes affecting HTTPS. No material production fault surfaced in the samples. Keep both `includeSubDomains` and `preload` omitted.

## Baseline and observation period

Reviewed 21 November 2026, approximately 09:59–10:02 AEDT (Australia/Sydney). Checkout was `staging`. HEAD, local `main` and `staging`, both remote-tracking refs, and both heads read directly from GitHub with `git ls-remote` were **`9e3005aff9487f11343b39a7534a2070b429ad5f`**. The initial worktree had no tracked edits. Only the supplied audit brief appeared in short status.

The 17 September Pages benchmark observed no HSTS. On 22 September, the review verified one 24-hour policy on the apex. The account then had six DNS records, no resolving `www`, dashboard HSTS disabled, no response-header transform, Full TLS and active Universal SSL. Those settings describe September. The launch record subsequently documented a working `www` redirect. [Benchmark](../benchmarks/CLOUDFLARE-CSP-SECURITY-HEADERS.md) · [September audit](HSTS-POLICY-REVIEW.md) · [Deployment and launch record](../DEPLOYMENT.md)

Commit `837048879b3b2867f3fabaa2729e831e283a1d54` changed 86400 to 2592000 on 22 September at 20:17:42 AEST. All subsequent main revisions retained the same HSTS line. The only later edit to that file removed the indexing header for launch. The following times are successful Cloudflare Pages check completions in Sydney local time. GitHub exposes deployment IDs in the check summaries but labels their links “Preview URL” even for the documented production launch. Production attribution therefore needs separate evidence. [Transition commit](https://github.com/gooberpede/starfield-outpost-network/commit/837048879b3b2867f3fabaa2729e831e283a1d54)

| Date and local time | Revision and deployment | Evidence for production |
| --- | --- | --- |
| 22 Sep 20:22:59 AEST | `8370488` · `cba13bf3-cdcb-4039-9688-678e8471eeac` | Likely first production rollout. The other success (`ed899d92`, 20:18:28) preceded the recorded 20:21:55 main push. The owner confirmed the exact staging and production policy by the next day's review. The environment label and first serving time remain open. [Pages check](https://github.com/gooberpede/starfield-outpost-network/runs/106706432129) · [Owner verification](RELEASE-READINESS-REVIEW.md) |
| 23 Sep 13:34:55 AEST | `57e17c6` · `f8d71a76-a7db-400b-8547-6812ab4a243a` | Later of two successful runs, after the main push. Production attribution inferred. |
| 24 Sep 20:50:06 AEST | `a215305` · `794f2d95-155e-42ab-84ae-204ba0cd880d` | Launch record identifies this specific deployment as the previous known-good production build. [Pages check](https://github.com/gooberpede/starfield-outpost-network/runs/107599984763) |
| 25 Sep 23:56:54 AEST | `236b222` · `9c66e935` | Success preceded the main push. No evidence of production promotion from this check. |
| 29 Sep 15:08:43 AEST | `be4539e` · `0dca360b-2d60-4341-926a-9156a9f3d483` | Recorded 1.0.0 production launch and successful header smoke check. [Pages check](https://github.com/gooberpede/starfield-outpost-network/runs/109265325300) |
| 29 Sep 15:19:53 AEST | `18567e8` · `5dc44233` | Documentation commit, one successful check. Environment unresolved. |
| 5 Oct 22:01:35 AEDT | `9e3005a` · `8159d0e5-ed01-4fd4-b670-e9c5931db8d2` | Likely production 1.1.0 run after main promotion. The earlier 21:46:58 run preceded the push. Today's live shell references `/assets/index-CEp1NMon.js`, which contains the full 1.1.0 release SHA. [Pages check](https://github.com/gooberpede/starfield-outpost-network/runs/111731101414) · [Published release](https://github.com/gooberpede/starfield-outpost-network/releases/tag/v1.1.0) |

**Confidence.** The policy was deployed at least 30 calendar days ago, with no known intervening incident in the records reviewed. Even the 24 September production deployment is more than 57 elapsed days before the sample. Confidence is high in the sampled policy and release source, moderate in uninterrupted delivery. No complete production ledger, rollback log, incident log or continuous response series was available. A successful build does not establish every response served during its lifetime. No reviewed record identifies a conflicting apex value, missing apex header, failed renewal or broken redirect during the interval.

## Public response matrix

Bounded GETs used normal certificate and hostname validation, with redirects disabled to measure each response separately. Each paired row below represents two requests with the same outcome. **R** is `/` and **P** is `/robots.txt?probe=hsts-review`. “Same” means the Location retained the entire requested path and query. Follow the destination row for the next hop.

| Requested scheme and host | Route | TLS | HTTP | Location or final response | HSTS field count and exact value |
| --- | --- | --- | --- | --- | --- |
| HTTP starfieldoutposts.com | R, P | — | 301 | HTTPS starfieldoutposts.com, same | 0 |
| HTTP www.starfieldoutposts.com | R, P | — | 301 | HTTPS starfieldoutposts.com, same | 0 |
| HTTPS www.starfieldoutposts.com | R, P | Pass | 301 | HTTPS starfieldoutposts.com, same | 0 |
| HTTPS starfield-outpost-network.pages.dev | R, P | Pass | 301 | HTTPS starfieldoutposts.com, same | 0 |
| HTTPS starfieldoutposts.com | R | Pass | 200 | HTML titled Starfield Outpost Network with app script and root element | 1 · `max-age=2592000` |
| HTTPS starfieldoutposts.com | P | Pass | 200 | Final static response | 1 · `max-age=2592000` |
| HTTPS staging.starfield-outpost-network.pages.dev | R | Pass | 302 | Cloudflare Access login for the staging hostname | 0 |
| HTTPS 9b356e75.starfield-outpost-network.pages.dev | R | Pass | 302 | Cloudflare Access login for this versioned hostname | 0 |

Both preview Locations used the project's Access login host and a host-specific `/cdn-cgi/access/login/` path. The bare-host redirect excluded both probes. The browser reached the staging sign-in page. The independent staging probe ended at Access.

**Owner-observed staging evidence, supplied 21 November 2026.** After authenticating through Cloudflare Access, the owner inspected `https://staging.starfield-outpost-network.pages.dev/` in Edge DevTools. The application returned `200 OK` with `Strict-Transport-Security: max-age=2592000` on Cloudflare build `9e3005a`. This closes the authenticated staging check.

## Current DNS, certificates and policy ownership

Public DNS queries via Google Public DNS returned the same A records (`104.21.45.248`, `172.67.221.121`) and AAAA records (`2606:4700:3031::ac43:dd79`, `2606:4700:3032::6815:2df8`) for apex and `www`. Neither query exposed a CNAME. Apex NS answers were `katja.ns.cloudflare.com` and `nile.ns.cloudflare.com`. The `www` NS query had no answer. Literal `*.starfieldoutposts.com` returned NXDOMAIN for A, AAAA, CNAME and NS. These results and the Cloudflare HTTP response support edge routing. Public DNS cannot enumerate configured records, flattened targets, deeper delegations or proxy switches.

| Validated hostname | Sampled leaf issuer and DNS SANs | Validity in UTC |
| --- | --- | --- |
| Apex | Google Trust Services WE1 · `starfieldoutposts.com` | 15 Nov 2026 21:00:16 to 13 Feb 2027 22:00:06 |
| www | Let's Encrypt YE2 · `*.starfieldoutposts.com`, `starfieldoutposts.com` | 15 Nov 2026 19:54:50 to 13 Feb 2027 19:54:49 |

Both handshakes succeeded with certificates issued after September. This demonstrates recent issuance and current coverage on this edge. Automatic renewal configuration and future issuance health require account evidence.

The repository declares one site-wide HSTS field in `public/_headers`. Both sampled apex responses agree with it. An identical replacement field at the edge could produce the same wire result. Pages applies this file to static responses, and redirects can take precedence. The live matrix establishes which hosts emitted the field. [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/) · [Cloudflare Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/) (accessed 21 Nov 2026).

## Policy decisions and recovery

- **Duration.** Retain 2592000 seconds. A year would protect returning apex visitors whose visits are more than 30 days apart against an HTTP downgrade. It would also require a viable HTTPS recovery path through certificate, DNS and hosting changes for up to a year after the last qualifying response. Current certificates and the longer observation interval favor reconsideration once the owner checks below are complete. [Cloudflare HSTS guidance](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/) (accessed 21 Nov 2026).
- **Subdomains.** Omit `includeSubDomains`. The known `www` host works over TLS and redirects independently. A parent policy would cover current and future descendants, including delegated names, after a browser learns it. The complete inventory and future naming requirements remain open.
- **Preload.** Omit `preload`. Browser-list inclusion is a separate commitment involving submission, HTTPS across subdomains, additional directives, and delayed removal through browser updates. A longer apex lifetime alone gives no first-visit preload protection. [Preload service guidance](https://hstspreload.org/) (accessed 21 Nov 2026).
- **www.** A visitor entering an HTTP `www` URL sends a plaintext first request unless the browser independently upgrades it. The observed 301 goes straight to the HTTPS apex. The apex response teaches a host-only policy. Even a visitor starting at HTTPS `www` receives no policy for `www` on its 301. Increasing the apex duration leaves this behavior intact. Retaining the redirect is compatible with the current decision. If repeat-visit protection for `www` is wanted, separately evaluate a host-specific header on its validated HTTPS redirect, then test that response directly. A browser could learn that policy only by reaching HTTPS `www`.
- **Rollback.** A qualifying HTTPS response refreshes the issuing host's expiry. Removing the field leaves previously learned expiry in place. A shorter lifetime or `max-age=0` changes cached state only for clients that receive it over valid HTTPS. An HTTP header is ignored. After a one-year rollout, even a brief exposure can leave absent clients enforcing HTTPS for their remaining year. Maintain or restore valid TLS, DNS and routing through migrations, including on the recovery host serving the same hostname. HSTS clients cannot click through a certificate failure to receive a corrective response. [RFC 6797, §§8.1, 8.3–8.4](https://www.rfc-editor.org/rfc/rfc6797#section-8.1) (accessed 21 Nov 2026).

## Owner verification before reconsideration

At approximately 10:33 AEDT on 21 November the in-app dashboard again required sign-in. Computer Use could not verify the current Edge URL to inspect another dashboard session, and no authenticated Cloudflare API connection was available. No specific infrastructure or certificate change threatening HTTPS was identified in the records reviewed. Future owner plans remain unverified. September's account values provide comparison points only. If this recommendation is accepted, keep the current header and collect the following dated read-only evidence.

1. **Pages deployments and incidents.** Filter to Production from 22 September through this review. Confirm the first successful production ID and serving time, every subsequent deployment or rollback, its active interval and SHA, and the current production ID. Match each revision to the header. Review failed attempts and whether they displaced a working deployment. Reconcile available uptime records, incident and security notifications with this report’s deployment table. Deployment and incident records can support continuity without sampling every individual response.
2. **Zone and DNS.** Verify active/unpaused state, the complete DNS inventory, configured targets and proxy status for apex and `www`, wildcard and delegated names, and active Pages custom-domain associations. Record which service owns the `www` redirect.
3. **TLS and continuity.** In SSL/TLS Overview and Edge Certificates, verify encryption mode, Universal SSL status, active packs, SANs and expiry for both hosts. Check automatic renewal, pending domain validation, issuance or renewal errors, relevant notifications and domain renewal ownership. Confirm any planned nameserver, proxy, host, certificate or subdomain changes over the next year and the HTTPS recovery path.
4. **Redirects and competing headers.** Check zone HSTS and all directives, Always Use HTTPS, account Bulk Redirects, zone Redirect Rules, response-header transforms, the single-redirect, bulk-redirect and response-header phases (`http_request_dynamic_redirect`, `http_request_redirect`, `http_response_headers_transform`) and Worker routes/Pages Functions. Record matched hosts, priorities, path/query settings and any header override. Resolve any conflict with the observed responses.
5. **Pages environments and Access.** Confirm manual production from `main`, preview triggers restricted to `staging`, and Access policy coverage for branch/version aliases.

Review those results against the live matrix. If they establish continuity, one effective apex header source and a viable year-long recovery commitment, seek separate implementation authorization for `max-age=31536000` alone. A material fault warrants separate remediation first.

## Future release sequencing

At the initial audit the local and remote branches were identical, with zero commits unique to either side. The public 1.1.0 tag resolves to HEAD and the live script contains that SHA. At the continuation, local staging had advanced one commit to `3d499d1` while main remained at `9e3005a`. The delta contained only the audit and its supplied brief. The older candidate wording in the deployment guide predates the published release.

At implementation time, recheck both remote tips **and the live production revision**. If still aligned, verify the isolated header change on authenticated staging, review the complete production delta, and use the separately authorized manual production release. If staging has advanced, wait for its next accepted release or base an explicitly authorized header-only hotfix on the verified production baseline and reconcile it into staging. Preserve existing release tags and verify the live apex, redirects and preview boundary after deployment. A header rollback should use a compatible application build because 1.0 cannot read upgraded 1.1 saves. [Deployment and save compatibility](../DEPLOYMENT.md)

This report is the only audit-created file. The review made no source, hosting, DNS, policy, deployment or remote Git changes.
