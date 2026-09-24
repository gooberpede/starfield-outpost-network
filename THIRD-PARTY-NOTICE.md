# Third-party notices and project licence boundary

Copyright (C) 2026 Gooberpede.

Project-authored application, build and test code for which the project holds
the relevant rights is free software: you may redistribute and/or modify it
under the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version. It is provided WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See LICENSE
for the complete, unmodified GPLv3 text.

This grant does not relicense third-party artwork, official game text or
game-derived records. Upstream software retains its notices and original
licences; these do not remove applicable combined-work GPL obligations.

## Favicon artwork — separately licensed

Asset: Space exploration. Author: gravisio, from Flaticon.

Required visible web credit:
[designed by gravisio from Flaticon](https://www.flaticon.com/free-icons/cosmos).
This is the existing category link, not a verified asset-specific URL.

Current derivatives: public/favicon-16x16.png and public/favicon-32x32.png.
Identifiable historical path: public/favicon.svg. These files and their
historical versions are separately licensed artwork excluded from the
project-authored-code GPL grant.

Owner evidence: user-supplied license-251033545.pdf, downloaded 23 September
2026, describing “Free for commercial use WITH ATTRIBUTION” under the standard
Flaticon terms. The original certificate remains private owner evidence and is
not distributed here. Its licensee identifier and embedded image are omitted.

The certificate permits website/software/application use and modification;
it separately restricts sublicensing, distribution and download offerings.
The full terms prevail: https://www.flaticon.com/terms-of-use . This is not an
open-source artwork licence. Retention in the existing repository and history
is the owner's chosen separate-licence arrangement, not bespoke permission,
rightsholder endorsement or legal clearance. Downstream recipients must assess
the artwork's own licence; the project grants no broader artwork rights.

## Shipped software

React, React DOM and Scheduler are bundled in the application JavaScript.
Sources: https://github.com/facebook/react (packages/react, packages/react-dom
and packages/scheduler). Their installed LICENSE files share the full MIT
notice reproduced below. The build dependency graph and lockfile identify the
exact versions. The emitted module graph also includes Vite's modulepreload
polyfill and Rolldown's runtime helper. Their upstream MIT notices (including
Rolldown's accompanying Rollup/esbuild notices) are retained below. Sources:
https://github.com/vitejs/vite and https://github.com/rolldown/rolldown . No other
installed package is presumed shipped merely because it appears in the lockfile.

## External fonts

The application requests Barlow Semi Condensed (400, 500, 600) and IBM Plex Mono
(400, 500) through Google Fonts CSS. Font binaries are served externally, not
checked in or self-hosted by this project. Sources and SIL Open Font License
evidence: https://github.com/google/fonts/tree/main/ofl/barlowsemicondensed and
https://github.com/google/fonts/tree/main/ofl/ibmplexmono . Existing Google Fonts
requests and security policy are unchanged.

## Game-derived content

Starfield, official names and game-derived records remain subject to their
rightsholders' rights; they are not Gooberpede's GPL-authored code. The repository
publishes extracted CSV/provenance records under reference-source and generated
JSON/official-name overlays under public/reference-data and
src/localization/generated. The overlays enter the application bundle. No
Bethesda plugin, BA2 archive or complete string-table binary is included.
Publication sign-off still requires disposition of these specific extracted
records and official text; extraction provenance does not itself establish
redistribution permission. See docs/THIRD-PARTY-REFERENCES.md for evidence and
remaining publication questions. No rightsholder approval is claimed.

This is an independent, unofficial project, not affiliated with or endorsed by
Bethesda Game Studios or Microsoft.

## React / React DOM / Scheduler — full MIT notice

MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Vite modulepreload polyfill — upstream core notice

# Vite core license
Vite is released under the MIT license:

MIT License

Copyright (c) 2019-present, VoidZero Inc. and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## Rolldown runtime helper — upstream notices

MIT License

Copyright (c) 2024-present VoidZero Inc. & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

end of terms and conditions

The licenses of externally maintained libraries from which parts of the Software is derived are listed [here](https://github.com/rolldown/rolldown/blob/main/THIRD-PARTY-LICENSE).

The MIT License (MIT)

Copyright (c) 2017 [these people](https://github.com/rollup/rollup/graphs/contributors)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

MIT License

Copyright (c) 2020 Evan Wallace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.