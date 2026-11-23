# Domain-only navigation

## Requested behavior

After loading any supported view, the address bar remains at the canonical
`https://www.aiubroboticcrew.com/`. Moving among the website's pages does not expose
`/mars-rover`, `.html` or section fragments in the **top-level address**. Refreshing
the tab restores its current view and saved scroll position.

## Implementation

- `index.html` is a lightweight full-viewport same-origin shell with an accessible
  named frame. The original home document is preserved as `home.html`.
- `navigation-state.js` validates the finite route list and reads/writes a small
  `sessionStorage` record: page filename, fragment, scroll position and title.
  It stores no forms, credentials, visitor identifiers or telemetry.
- `root-navigation.js` selects the saved view and updates the tab/frame title.
  Messages are accepted only from the current frame and the exact same origin;
  payloads and the frame's current route are checked before use.
- `view-navigation.js` runs in each existing page. It redirects old direct links
  into the shell, maps internal links to the existing documents, and remembers
  navigation/scroll state. The destination is persisted before loading, so a fast
  refresh cannot restore the outgoing view. Native iframe history supports
  Back/Forward without changing the top-level address.
- Existing page styles, galleries, scripts, fonts, content and API versions stay
  intact. No frontend framework, build step, package dependency or DNS change is
  introduced. The original home markup is moved, not rewritten.

Allowlisted views: home, Mars Rover, sponsorship, previous workshops, School
Community, drone, line-following, NDC and robo-soccer. Both existing `.html` links
and extensionless equivalents are recognized. Root/index links select Home; old
section links such as `/mars-rover#teams` still select that view and section before
redirecting to `/`. The old path may appear briefly while the initial document
loads; no client-side solution can prevent the browser showing a URL someone
explicitly opened before its JavaScript runs.

## Security boundary

The root CSP changes only `frame-src` from `none` to `self`, as required to host the
existing trusted pages. Each child retains `frame-src 'none'` and the existing
hashed script policy, no-referrer metadata and resource restrictions. No external
page can be selected by stored state or a navigation message. Ordinary external
web links with no target open separately with `noopener,noreferrer` rather than
being embedded. Existing explicit new-tab links and mailto links remain usable.

If server headers are added later, the root can use `frame-ancestors 'none'` /
`X-Frame-Options: DENY`; the child views must permit same-origin framing, e.g.
`frame-ancestors 'self'` / `X-Frame-Options: SAMEORIGIN`. Applying deny-framing to all
pages would block this deliberate same-origin architecture. See SECURITY.md.

## Trade-offs and fallbacks

- The address alone cannot identify/share/bookmark the current view. This is the
  explicit trade-off of keeping one URL. Old specific links remain recognized.
- This does not improve page-level SEO; search engines may index the retained
  content documents separately or handle the JavaScript shell differently.
- JavaScript and tab session storage are needed for domain-only refresh retention.
  If storage is blocked/corrupt, root navigation safely defaults to Home. A direct
  page remains usable at its original URL if its state cannot be saved; no
  redirect loop, `window.name` workaround or tracking cookie is used.
- With JavaScript disabled, the shell presents a link to the standard home page;
  ordinary static URLs then remain visible. This is an honest usable fallback,
  not a promise to conceal URLs without script support.
- The canonical `www` domain and HTTPS enforcement are unchanged.

## Verification

From the repository root:

```sh
python tools/security_policy.py --check
python -m unittest discover -s tests -v
node --test tests/*.test.cjs
```

The CSP checker recognizes the root-only frame exception and still hashes each
inline gallery/faculty script exactly. Local Chromium checks cover all nine views,
all eight cross-page menu destinations followed by immediate refresh, old deep
links, section scrolling, native Back/Forward and stored-scroll restoration.
Home-page nav/hero dimensions and fonts match the original at 1440px desktop and
390px mobile. Page-level CSP/hash, no-backend form and DOM/SVG regression tests
remain in place. This is not a claim of remote CI/deployment success.

For a local server without GitHub Pages extensionless URL resolution, use `.html`
legacy entry points; normal internal navigation maps to `.html` files itself.
After merging, verify the actual deployed canonical domain, not a stale local tab.
