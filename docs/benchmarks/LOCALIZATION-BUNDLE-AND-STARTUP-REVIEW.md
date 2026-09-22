# Localization Bundle and Startup Review

## Outcome

**Decision B — further profiling is warranted before an architecture change.**

The completed ten-locale runtime produces one 1,484,485-byte JavaScript chunk.
Its locally compressed size is 367,128 bytes with gzip and 236,262 bytes with
Brotli. The Vite 500 kB advisory remains present, but the local production build
became usable in 149–167 ms across eight warm reload observations. No startup or
interaction defect was observed. Startup performance therefore does not justify
an architecture change by itself.

The network-transfer question remains open. Raw size and local gzip/Brotli
estimates are not actual Cloudflare cold-load transfer bytes, and warm local
startup latency does not establish how much unused locale data reaches a user.
Further transfer-size and loading-strategy profiling is warranted before
deciding whether locale-on-demand loading would provide worthwhile bandwidth
savings without harming startup or locale-switch performance.

## Scope and environment

Measured 22 September 2026 on branch `staging` with:

- Windows local development environment;
- Node.js 24.21.0;
- Vite 8.2.1;
- the production build served by `vite preview` on `127.0.0.1`;
- the Codex in-app Chromium browser for reload-to-usable observations.

The runtime set was English (US), English (UK), French, German, Italian,
Japanese, Polish, Portuguese (Brazil), Simplified Chinese, and Spanish (Spain).
`en-GB` remained a sparse override.

## Production footprint

Local compression uses Node `zlib` defaults on individual files. These are
transfer estimates, not observed CDN bytes.

| Artifact | Raw bytes | gzip bytes | Brotli bytes |
| --- | ---: | ---: | ---: |
| Main JavaScript chunk | 1,484,485 | 367,128 | 236,262 |
| Main CSS | 56,400 | 9,333 | 8,107 |
| Reference-data JSON, including manifest | 2,764,610 | 159,197 | 106,372 |
| Complete built output excluding source maps | 4,313,377 | 540,131 | 354,771 |

The complete-output compression total is the sum of files compressed
individually and includes HTML, icons, headers, and small static files. It is
not a prediction of one combined HTTP response.

## Localization source contribution

Source-file size is a repeatable broad attribution measure; it is not exact
post-minification ownership within the shared bundle. Runtime helpers, shared
keys, bundler transforms, and cross-file compression prevent exact attribution
without a more specialized profiler.

| Locale | Semantic catalogue + generated overlay raw bytes | gzip bytes | Brotli bytes |
| --- | ---: | ---: | ---: |
| `en-US` | 28,654 | 6,731 | 5,675 |
| `en-GB` | 179 | 159 | 113 |
| `fr-FR` | 159,323 | 34,255 | 26,455 |
| `de-DE` | 154,101 | 33,784 | 26,165 |
| `it-IT` | 156,092 | 33,495 | 25,863 |
| `ja-JP` | 185,464 | 36,022 | 27,293 |
| `pl-PL` | 155,250 | 34,482 | 26,635 |
| `pt-BR` | 156,228 | 33,796 | 25,865 |
| `zh-Hans` | 153,959 | 34,820 | 25,691 |
| `es-ES` | 157,331 | 33,858 | 25,920 |

Across source categories, the ten semantic catalogue modules total 283,773 raw
bytes (69,069 gzip; 60,130 Brotli). The eight generated non-English reference
overlays total 1,022,808 raw bytes (209,920 gzip; 155,528 Brotli). Overlays are
therefore the larger localization source category. English reference names
continue to come from canonical reference data rather than a generated overlay.

## Parse and startup observations

Twelve isolated Node processes parsed and compiled the production JavaScript as
a classic-script proxy in 27.744–31.902 ms; the median was 28.253 ms. This is a
V8 parse proxy, not Chromium module evaluation or React startup time.

Eight local production-browser reloads reached a visible Outpost Details name
field in 149, 150, 151, 151, 166, 166, 167, and 167 ms. The median was 158.5 ms.
This wall-clock observation includes the local manifest/reference-data gate,
browser automation overhead, React mount, and rendering. It excludes network
latency and does not isolate parse, evaluation, layout, or paint.

The build completed in 231 ms and emitted the existing large-chunk advisory.
No build error, missing locale, catalogue fallback, or startup failure occurred.

## Startup and transfer conclusions

The main chunk has grown substantially since the earlier general performance
review, and static reference overlays are the dominant localization source
category. The local editor became usable in under 170 ms in every observed warm
run, and no user-facing startup delay was demonstrated. Static registration
also keeps locale switching immediate and avoids deployment-version
coordination between a shell and independently loaded catalogues.

Those observations support the current startup behavior, but they do not close
the bandwidth question. The locally calculated 236 kB Brotli figure is an
estimate for the main JavaScript file, not an observed response from the
deployed Cloudflare application. Nor does it show how much of the initial
transfer consists of semantic catalogues or localized reference overlays that
the active session may not use.

Do not implement lazy loading solely because of the chunk advisory, and do not
reject it solely because warm local startup is fast. A later focused
measurement/design investigation should cover:

- actual deployed Cloudflare cold-load transfer bytes and delivered HTTP
  compression;
- cache behavior on repeat visits;
- the initial-transfer contribution of statically bundled semantic catalogues
  and localized reference-name overlays;
- the feasibility of loading only the active locale's catalogue and overlay;
- additional request/module-loading cost;
- locale-switch latency with on-demand loading; and
- browser caching of previously loaded locale assets.

That evidence should determine whether the static architecture remains the
better tradeoff or whether locale-on-demand loading merits a dedicated design
and implementation brief.

## Repeatable commands

```powershell
npm run build
npx vite build --sourcemap --outDir .local-work/bundle-review
npm run preview -- --host 127.0.0.1 --port 5177
```

Raw/gzip/Brotli sizes were computed with `fs.readFileSync`, `zlib.gzipSync`, and
`zlib.brotliCompressSync`. The source-map build was diagnostic and remained
under ignored `.local-work`; no profiling dependency was added.
