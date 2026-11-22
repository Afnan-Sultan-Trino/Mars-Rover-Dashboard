# Security policy and deployment checklist

## Scope

This is a public static GitHub Pages site. It has no implemented application API,
login/session, payment processor or form-delivery backend. Do not put credentials,
personal submissions, backup ZIPs or `.git` metadata in a published artifact.

Report suspected vulnerabilities privately to the repository maintainers through
GitHub's available private reporting/contact mechanism. Do not post secrets or
exploit details in a public issue. If private reporting is unavailable, contact a
maintainer first to agree on a private channel. No unsupported security mailbox is
invented here.

## Implemented source protections

- Every HTML document declares a Content Security Policy before resource loads.
- Scripts are same-origin, plus exact SHA-256 allowlists for the existing inline
  gallery/faculty scripts. Arbitrary inline scripts, event attributes and eval are
  not allowed. Existing inline **styles** remain allowed to preserve the design.
- Images are same-origin or data images; Google Fonts CSS2 and fonts.gstatic.com
  remain allowed with the existing font families, weights and API unchanged.
- Connections, embedded frames, objects, base-URL changes and form submission are
  denied. There is currently no supported form backend. Revisit `connect-src` and
  `form-action` deliberately before enabling a real approved delivery integration;
  do not loosen them to `*`.
- Referrer metadata is `no-referrer` on every page.
- Roster and archive text use DOM/textContent construction rather than parsing
  data as HTML. SVG fallback filenames are escaped as XML text.
- Sponsorship contact information is not written to console logs.

These measures reduce attack surface. They do not authenticate site content,
replace HTTPS or protect against a maintainer-account/repository compromise.
The same-origin script allowlist trusts the existing publication boundary.

## Updating inline JavaScript safely

Changing even whitespace inside an inline script changes its hash. After editing:

```sh
python tools/security_policy.py
```

Copy the printed policy for the changed page into that page's existing CSP meta
content. Do not use a placeholder hash or add script `unsafe-inline` to work around
an error. HTML parser newline normalization is accounted for (CRLF/LF).

Then run from the repository root:

```sh
python tools/security_policy.py --check
python -m unittest discover -s tests -v
node --test tests/*.test.cjs
```

No frontend build system, package dependency or application API upgrade is needed.
Python is only used for maintenance checks; browsers execute the original HTML/JS.
Test every route and gallery/faculty/team interaction over a local HTTP server and
check for `securitypolicyviolation` events before deployment. Disabled/partially
restored forms now skip setup safely. Neither demo form claims delivery or clears
visitor input: no backend exists. If sponsorship controls are restored, the script
uses native form validity and native agreement-label activation, handles both click
and form-submit paths, and still does not send requests.

## Repository-owner actions: required and NOT completed by this code

The contributor used for the security branch has push permission, not admin
permission. The Pages API was readable and reported `https_enforced: false`.

1. **Enable HTTPS enforcement:** repository Settings -> Pages -> Enforce HTTPS.
   Confirm certificate/domain readiness first. With a fresh non-upgrading client,
   HTTP must redirect to the canonical HTTPS domain, not return the page with 200.
   HTTPS availability alone is insufficient. The HTML CSP does not protect the
   initial HTTP response from an on-path attacker.
2. Verify the custom domain in the account's Pages settings and keep the DNS TXT
   verification record. Avoid wildcard DNS and remove stale Pages records when
   retiring the site. Domain verification status was not established by this work.
3. Review GitHub and registrar MFA, contributor/publishing permissions, branch
   protection and token scope/expiry. Do not rotate public contact addresses or
   unrelated credentials without evidence of compromise.
4. Merge the reviewed security PR to the publishing branch and confirm deployment.

## Header-only controls: still require a supported serving layer

Meta CSP is not a response header and cannot enforce `frame-ancestors`. It also
cannot set HSTS, X-Frame-Options, X-Content-Type-Options or Permissions-Policy.
The source changes must not be described as fixing these response headers.

If an approved configurable edge/serving layer is available, stage and test:

- `Content-Security-Policy` header equivalent to the actual page policy, plus
  `frame-ancestors 'none'`. Keep script hashes synchronized or deliberately move
  inline scripts to same-origin files in a separate approved change.
- `X-Frame-Options: DENY` for legacy framing protection.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: no-referrer` (the source meta already establishes this).
- A suitable Permissions-Policy denying unused capabilities, for example camera,
  microphone and geolocation, only after confirming they are not required.
- HSTS after HTTPS is reliable. Start with a short tested max-age; do not add
  includeSubDomains or request preload without validating all subdomains.

GitHub Pages does not interpret arbitrary `.htaccess`, nginx configuration or an
unsupported `_headers` file. No DNS/CDN migration, registrar/account change or
header deployment is performed by this PR. Do not add misleading meta tags for
header-only controls or rely on JavaScript frame-busting as equivalent protection.

## Future untrusted data or forms

Keep API secrets on a real backend; validate/limit values and allowed tiers on the
server; add abuse controls and a retention/access policy. Assess CSRF against the
actual authentication model. The absence of a CSRF token is not a current exploit
in this no-backend site. For external image data use a validated asset allowlist;
CSP supplements, not replaces, contextual escaping and input validation.

No exposed credential or current remotely exploitable XSS was established in the
audit. The DOM changes are preventive hardening, not a claim of a confirmed attack.
