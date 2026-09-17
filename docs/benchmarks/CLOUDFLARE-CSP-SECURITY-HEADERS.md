# Cloudflare Pages CSP and security headers

**Date:** 17 September 2026
**Scope:** Static Pages responses for `https://starfield-outpost-network.pages.dev/`. No deployment was made in this parcel.

## Pre-change live baseline

The five HTTPS responses below were sampled with `curl -I` before editing `public/_headers`. The asset names came from the live HTML, rather than from a local build. All were `200 OK` and carried `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Cache-Control: public, max-age=0, must-revalidate`. None carried `Content-Security-Policy`, `Permissions-Policy`, `X-Frame-Options`, or `Strict-Transport-Security` in the sampled HEAD response. No duplicate security-header values were observed.

| Resource | Content-Type | ETag in sampled HEAD response |
| --- | --- | --- |
| `/` | `text/html; charset=utf-8` | Absent |
| `/assets/index-CNt51fzb.js` | `application/javascript` | Present |
| `/assets/index-Tj8eYOeo.css` | `text/css; charset=utf-8` | Present |
| `/reference-data/inorganic-occurrences.json` | `application/json` | Present |
| `/robots.txt` | `text/plain; charset=utf-8` | Present |

The live `http://` root responded `301` to the HTTPS root. The live app rendered in a browser without baseline console errors. This baseline does **not** represent the changed headers.

## Implemented policy

The existing site-wide `/*` rule in `public/_headers` now supplies:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; style-src-elem 'self' https://fonts.googleapis.com; style-src-attr 'none'; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; img-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; worker-src 'none'
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Frame-Options: DENY
```

`X-Robots-Tag: noindex, nofollow` remains in that rule and `public/robots.txt` remains `User-agent: *` / `Disallow: /`. The three Permissions Policy capabilities are unused by the tracker. `X-Frame-Options: DENY` agrees with `frame-ancestors 'none'` and covers older clients. No default `data:` or `blob:` source was added: JSON export creates a Blob URL for an anchor download, which is not a script, connection, image, or frame load.

The source and built HTML load one same-origin script and CSS file. All 13 reference JSON fetches use fixed same-origin paths. Icons are same-origin. The only automatic external requests are a Google stylesheet and Google font files. The policy allows those two exact origins for their corresponding resource types. The CSS import uses `display=swap`; local/system font fallbacks remain in the stylesheet.

React's `style` props occur in the contextual help panel, Planned Supply grid/items, and item-search results panel. React writes individual element style properties. [`style-src-attr`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src-attr) blocks style attributes set as strings while allowing individual JavaScript style-property assignments. The local browser check below confirmed those components positioned/rendered under `style-src-attr 'none'` without an `unsafe-inline` exception. `style-src` provides a stylesheet fallback for clients without the separate `style-src-elem` directive.

Pages already supplied acceptable `nosniff` and referrer-policy values, so neither was duplicated. Cloudflare [documents](https://developers.cloudflare.com/pages/configuration/headers/) that `_headers` applies to static responses and can override defaults; it will not affect Pages Function responses, which this project does not use. The CSP line is below Cloudflare's 2,000-character line limit.

## Local verification with the proposed response headers

`npm run build` passed, including provenance checks and TypeScript compilation; Vite emitted its existing large-chunk advisory. `npm test` passed 183/183. Both `dist/_headers` and `dist/robots.txt` were present after build. A temporary local static server served the built files with the exact three proposed security headers and the existing noindex header. This is a browser compatibility check, **not** a Pages deployment or proof of live Pages header parsing.

In the Codex in-app browser, the app loaded and reloaded with a populated reference-dependent UI. The browser's asset inventory showed all 13 `/reference-data/*.json` fetches, the Google Fonts stylesheet, and four `fonts.gstatic.com` WOFF2 requests. There were no browser console warnings or errors, including CSP violations. Japanese locale switching worked and persisted after reload. An added outpost also persisted after reload, exercising the browser-storage path.

The contextual help panel had visible, nonzero positioned geometry; the Planned Supply grid/items had inline React-computed grid styles and nonzero geometry; and the item-search results panel was positioned visibly. The tested click, keyboard Escape, select, and search interactions produced no CSP violation. A generated valid local JSON file was selected through Import; the previously added outpost was replaced by the imported empty network, with no console error. Export displayed its expected filename feedback and produced no CSP violation, but the browser automation did not report a download event, so download completion is **unverified** in this check. Font fallback under a deliberately blocked Google connection was not exercised. Framing in an iframe was not directly exercised.

`npm run preview` does not apply Pages `_headers`; the temporary server was used specifically to make the browser enforce the candidate CSP. Its results cannot substitute for a deployed Pages smoke test.

## Deployment and follow-up classification

- **BLOCKER:** None found in the local implementation checks.
- **PRE-RELEASE:** This change was neither committed nor pushed, so neither `staging` nor `main` received it. After a reviewed deployment, inspect actual HTML and representative asset responses for the intended headers and no conflicting duplicates. Repeat load/reload, all 13 reference fetches, font requests/fallback, import/export download, inline-style interactions, and iframe rejection on the deployed preview or production hostname. Investigate the local browser's unobserved export download in a normal browser during that smoke test.
- **OPTIONAL:** Test fallback typography with Google Fonts intentionally unavailable and verify browser behavior in WebKit/Safari as part of broader release verification.
- **DEFER:** HSTS until the final custom domain, subdomain policy, and rollback plan are settled. HTTPS already serves the current host and HTTP redirects to HTTPS, while [Cloudflare warns](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/) that HSTS can make a host inaccessible for its max-age if HTTPS is removed. No HSTS, cache rule, custom domain, paid service, Worker, Function, or analytics configuration was introduced.

The current deployed site still has the **pre-change** headers recorded above. A future deployment must verify the proposed headers on the actual response before this parcel can be called deployed.
