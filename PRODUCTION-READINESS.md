# Gibbs Hall Barn — production readiness audit

Audited against `website-production-checklist.md` on **9 August 2026**, for
deployment to **Vercel** at **gibbshallbarn.com**. A second, security-focused
sweep was carried out the same day — see *Security sweep* near the end.

**Status key:** `VERIFIED` implemented and tested · `PARTIAL` implemented but not
fully verified · `MISSING` required and absent · `UNKNOWN` cannot be verified
from the code · `N/A` genuinely irrelevant to this site.

---

## What this site is

A four-page static brochure site for a single holiday cottage. It has:

- no accounts, login, or admin area
- no forms, no user input of any kind
- no database, no API, no server-side code
- no payments taken on the site
- no file uploads
- no personal data collected by the website itself

Bookings and enquiries happen off-site: by phone, by email, or through the
managing agent (Dales & Lakes Holiday Cottages) and Independent Cottages.

That single fact removes roughly half the checklist. Sections 11–18 (auth,
authorization, sessions, database, multi-tenancy, uploads, API security) are
`N/A` and are marked as such below rather than left ambiguous — but note that
*if a booking form or online payment is ever added, they all come back*.

---

## Summary

| | |
|---|---|
| **P0 (blocks launch)** | 0 outstanding in code — 3 owner actions on Vercel/DNS |
| **P1 (should fix before launch)** | 4 outstanding, all owner actions |
| **P2 (shortly after launch)** | 5 |
| **P3 (nice to have)** | 4 |

Everything fixable in code has been fixed. What remains is dashboard
configuration, DNS, and decisions only the owner can make.

---

## Outstanding — owner actions

### P0 — before the site is public

1. **Point the domain at Vercel and confirm HTTPS.** Add `gibbshallbarn.com`
   and `www.gibbshallbarn.com` in the Vercel project, set `www` to redirect to
   the apex, and confirm the certificate is issued. Until the real domain is
   live, every canonical URL, the sitemap and the social preview tags point at
   a domain that does not resolve.
2. **Enable Vercel Web Analytics** in the project's Analytics tab. The consent
   banner promises analytics; until this is switched on the script 404s and
   nothing is measured. (Harmless to visitors, but the banner is then asking
   for consent to nothing.)
3. **Protect the accounts that control the site.** Two-factor authentication on
   the domain registrar, on GitHub, and on Vercel. A takeover of any of the
   three is a full site takeover, and there is no other credential in this
   project worth attacking.

3b. **Lock down the domain at DNS level** (details in *Security sweep* below):
    a CAA record, registrar transfer lock, and — because this domain sends no
    email — null SPF/DMARC/MX records so nobody can spoof booking emails from
    it. For a holiday let, a convincing "please pay your balance here" email
    from a spoofed address is a more realistic attack than anything aimed at
    the website itself.

### P1 — should be done before or immediately after launch

4. **Confirm you have the right to use the photographs.** Four images
   (`assets/img-src/gibbshallbarn*.jpg`) were originally hot-linked from
   `dalesandlakes.co.uk` and are now served from this site. That is better for
   reliability and privacy, but it means you are publishing them, so confirm
   with the agent that this is fine. `NOT VERIFIED — commercial question, not a
   technical one.`
5. **Uptime monitoring.** Nothing currently tells you if the site goes down.
   Vercel is reliable, but DNS mistakes and expired domains are not. A free
   monitor (UptimeRobot, Better Stack) checking the home page every five
   minutes and emailing on failure is enough for a site of this kind.
6. **Domain expiry.** Set the registrar to auto-renew and check the renewal
   date is more than a year out. An expired domain is the single most likely
   way this site disappears.
7. **Have a solicitor or the agent read the legal pages.** The privacy notice,
   cookie policy and booking terms are drafted and internally consistent, but
   they have not been reviewed by anyone qualified. The cancellation terms in
   particular ("deposits are non-refundable") interact with UK consumer law and
   with whatever the agent's own terms say. `UNKNOWN — needs a human decision.`

### P2 — shortly after launch

8. **Submit the site to Google Search Console** and check `sitemap.xml` is read
   and the pages are indexed.
9. **Check the social preview** by pasting the URL into WhatsApp, Facebook and
   LinkedIn once the domain is live.
10. **Test on real devices** — an actual iPhone and an actual Android phone.
    Emulation is good but not the same thing.
11. **Run Lighthouse** against the live URL for a real-world performance and
    accessibility score; the local numbers here do not include CDN behaviour.
12. **Diary a yearly review** of the legal pages, the security contact expiry in
    `.well-known/security.txt` (set to expire 9 August 2027), and the prices.

### P3 — improvements

13. Add a proper photograph of the *outside* of the barn to the gallery — the
    gallery is currently all interiors plus one exterior in the heritage band.
14. Consider a small "Frequently asked" section (check-in times, dogs, travel
    cot) — the questions the agent gets asked most.
15. Add `apple-touch-icon` variants at other sizes if the site is ever pinned to
    home screens a lot.
16. Add a CSP `report-uri`/`report-to` endpoint if you ever want visibility of
    blocked resources. Not worth a third-party dependency on its own.

---

## Section-by-section

### 1–2. Requirements & project structure — `VERIFIED`

Static site, no build. Styles and behaviour separated into `assets/`, shared
legal styling deduplicated into one file, no dead code, no dependencies at all.

Removed during this pass: the `index.html.html` stale copy (a second, outdated
version of the whole site that would have been publicly reachable and
indexable), an unused photo, and the availability-calendar scraper.

### 3. Frontend — `VERIFIED`

Renders correctly and identically at 390 / 820 / 1440 px. No horizontal
overflow at any breakpoint (measured, not eyeballed). 404 page present and
styled. Works with JavaScript disabled — the `.no-js` class keeps every
scroll-reveal section visible, which the previous version did not do (with JS
off, most of the page was invisible).

No forms, so client/server validation is `N/A`.

### 4–5. UI/UX & responsive — `VERIFIED`

Mobile navigation opens, closes on link click, closes on Escape, and reports
`aria-expanded` correctly. Buttons show a pointer cursor again on devices where
the custom cursor is disabled.

### 6. Accessibility — `PARTIAL`

Fixed in this pass:

- **Custom cursor no longer hides the real one unconditionally.** It is now
  limited to fine pointers with motion enabled; touch, stylus and reduced-motion
  users keep the native cursor. Previously `cursor: none` applied to everyone,
  and if the JavaScript failed there was no visible cursor at all.
- **`prefers-reduced-motion` is honoured** — no zooms, no slide-ins, no smooth
  scrolling, content fully visible. Verified.
- **Visible keyboard focus** on every interactive element (there was none).
- **Skip-to-content link** as the first tab stop. Verified.
- **Colour contrast** raised across roughly twenty rules that failed WCAG AA —
  footer text, pricing captions, amenity descriptions, section eyebrows. Body
  text now meets 4.5:1. Accent orange on cream was 3.9:1 and now uses a darker
  shade (`--ember-text`) for text while keeping the brand orange for fills.
- **Alt text on every image**, describing what is actually in the photo. One
  image had no `alt` at all, and several alt texts described the wrong room —
  the "bathroom" was a bedroom, the "bedroom" was a living room. Verified: 0
  images missing alt, 1 `h1`, headings in order.
- Landmarks: `<main>`, `<nav aria-label>`, `<footer>`; decorative elements
  marked `aria-hidden`.

`PARTIAL` because this has not been tested with a real screen reader or by a
person who uses one. Automated checks passing is not the same as usable.

Note: the site correctly states the property itself is not suitable for
wheelchair users. That is a fact about the building, not a website defect.

### 7. Domain & DNS — `MISSING` (owner action P0-1)

Nothing is configured yet. SPF/DKIM/DMARC are `N/A` for the website; the
booking address is on `dalesandlakes.co.uk`, which is the agent's domain to
manage. If `@gibbshallbarn.com` email is ever set up, those records become
required.

### 8. HTTPS & TLS — `PARTIAL`

Vercel issues and renews certificates and redirects HTTP → HTTPS automatically.
HSTS is configured (`max-age=31536000; includeSubDomains`). Not `VERIFIED`
because it cannot be until the domain resolves. Preload is deliberately *not*
requested — it is hard to undo and unnecessary here.

### 9. Security headers — `PARTIAL` (configured in `vercel.json`, verify after deploy)

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'`; no `unsafe-inline` anywhere; fonts limited to Google's two hosts; `frame-ancestors 'none'`; `base-uri 'none'`; `form-action 'none'`; `object-src 'none'` |
| `Strict-Transport-Security` | 1 year, includeSubDomains |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, payment, USB, topics etc. all denied |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |

The CSP is genuinely strict rather than decorative: it required moving all CSS
and JavaScript out of the HTML, removing every `style=""` attribute and the one
inline `onerror` handler. Nothing on the page needs `unsafe-inline` any more.
This is what makes the policy worth having — a CSP with `unsafe-inline` stops
almost nothing.

Verify after the first deploy with <https://securityheaders.com>.

CORS is `N/A` — no API.

### 10. Input security — `N/A`, mostly

No forms, no query-string handling, no `innerHTML` from any external source, no
database, no shell, no file paths from user input. The one remaining
consideration is third-party links: every `target="_blank"` now carries
`rel="noopener noreferrer"` (previously five did not, which allowed reverse
tabnabbing — the opened page could rewrite this one).

### 11–18. Auth, authorization, sessions, database, multi-tenancy, uploads, APIs — `N/A`

None of these exist. See "What this site is".

### 14. Secrets — `VERIFIED`

There are no secrets. No API keys, no tokens, no environment variables, no
`.env`. Git history reviewed for the files removed in this pass; nothing
sensitive was committed. `.gitignore` now covers `.env*` so that stays true.

### 19. Rate limiting — `N/A`

No endpoints to abuse. Vercel's platform-level DDoS protection applies.

### 20. Dependencies — `VERIFIED`

Zero. `package.json`, `package-lock.json`, `node_modules/` and the Playwright
dependency were removed with the calendar scraper. Nothing to audit, nothing to
patch, no supply-chain risk.

### 21. Performance — `VERIFIED`

Images were the entire problem and are now fixed:

| | Before | After |
|---|---|---|
| Images shipped | ~6.8 MB of JPEG/PNG, several over 2 MB | 1.3 MB of WebP |
| Largest single image | 2.4 MB | 213 KB |
| Hero image | 207 KB JPEG from a third-party server | 114 KB WebP (40 KB on phones) |

Also: every image has explicit `width`/`height` so nothing jumps as the page
loads; below-the-fold images are `loading="lazy"`; the hero is preloaded with
`fetchpriority="high"`; CSS and JS are external so they cache between pages;
`preconnect` to both font hosts.

Four images were being hot-linked from `dalesandlakes.co.uk` — if the agent
moved or renamed them the site would have shown broken images, and every
visitor's IP was exposed to that server. They are now served locally.

### 22. Caching — `VERIFIED`

HTML and CSS/JS revalidate on every request (so a content fix is live
immediately); images cache for a day with a week of stale-while-revalidate.
Deliberately *not* `immutable`, because the filenames are not content-hashed and
a replaced photo needs to appear without a rename.

No private data exists, so no risk of it reaching a shared cache.

### 23. Reliability — `VERIFIED`

Static files on a CDN — no runtime to fail. The JavaScript degrades safely:
`localStorage` access is wrapped for private-browsing mode, missing elements are
checked before use, `IntersectionObserver` has a fallback, and a total failure
of `main.js` leaves the page fully readable.

### 24–25. Testing & coverage — `PARTIAL`

There is no automated test suite, which is a reasonable choice for a static
brochure site with no logic. What was actually run during this pass:

- Rendered and visually reviewed every section at desktop and mobile widths.
- Asserted no horizontal overflow at 390 / 820 / 1440 px.
- Functional tests: mobile nav open/close/Escape/`aria-expanded`; consent accept,
  decline, persistence across reload, and reopening via Cookie Settings;
  analytics absent before consent and present only after; skip link focus;
  single `h1`; all images have alt and dimensions; reduced-motion behaviour.
- Verified every internal link and asset reference resolves (50 references, 0
  broken) and that no CSS class or script element ID is dangling.
- Verified `vercel.json` and the JSON-LD parse.

All of the above passed. What has *not* been tested: real screen readers, real
iOS/Android devices, and the deployed headers.

### 26–27. Code review & CI — `PARTIAL`

No CI. For a dependency-free static site the value is low; Vercel's preview
deployments give a real check before merge. If you want one thing, an HTML/link
checker on pull requests is the highest-value addition (P3).

### 28–30. Deployment, staging, rollback — `VERIFIED`

Push to `main` deploys; every pull request gets a preview URL that acts as
staging; rollback is "Promote to Production" on a previous deployment in the
Vercel dashboard, is instant, and cannot corrupt data because there is none.
Documented in `README.md`.

### 31–33. Monitoring, alerting, logging — `MISSING` (owner action P1-5)

Vercel provides deployment logs and, once enabled, traffic analytics. There is
no uptime check and no alerting. For this site, one external uptime monitor is
proportionate; anything more would be noise.

### 34–35. Backups & disaster recovery — `VERIFIED`

The git repository *is* the backup: every file needed to rebuild the site is in
it, and GitHub plus every local clone are independent copies. Recovery from
total loss of the Vercel account is "connect the repo to a new Vercel project
and repoint DNS" — under an hour, no data to restore. There is no database and
no user-generated content, so RPO is effectively zero.

The photo originals are kept in the repository (excluded from deployment via
`.vercelignore`) precisely so images can be re-encoded later.

### 36–38. Data protection, privacy, cookies — `VERIFIED` in code, `UNKNOWN` legally

The website collects no personal data itself. Storage inventory, complete:

| What | Type | Consent needed |
|---|---|---|
| `ghb_cookie_consent` | local storage, first-party | No — it only records your choice |
| Vercel Web Analytics | cookieless, no device storage | Yes — loaded only after "Accept" |
| Google Maps embed (added 2 Oct 2026) | third-party cookies set by Google | Loads automatically, **not** consent-gated — see note below |

**Google Maps (2 Oct 2026).** The Location section embeds a Google map that
loads with the page, at the owner's request. Google may set cookies before the
visitor has made any choice, which UK PECR would normally require consent for.
The cookie policy, privacy policy and banner text disclose this honestly, but
the strictly compliant option is to load the map only after consent or behind a
"Show map" click. Flag this in the legal review (P1-7).

The cookie policy now lists exactly this, names Vercel and Google Fonts as the
third parties involved, and drops the vague "analytics (if enabled)" row. The
privacy policy gained legal bases, named processors, an international-transfer
statement, and a note that the site has no form.

Consent handling was materially improved: previously there was no way to change
your mind short of clearing browser storage, which does not meet the "as easy to
withdraw as to give" requirement. There is now a **Cookie Settings** link in the
footer, and withdrawing consent after analytics has loaded reloads the page so
the tag is genuinely gone.

Legal review is still `UNKNOWN` — see P1-7.

### 39. Legal — `PARTIAL`

Privacy notice, cookie policy and booking terms are present, linked from the
footer and from the booking call-to-action, and carry the company name, trading
name, registered address, phone and email. Accessibility limitations are stated
honestly. Not reviewed by a lawyer.

### 40. Payments — `N/A`

No payment is taken on the site. Card details are handled by the agent
off-site; the site correctly says so and stores nothing.

### 41. Email — `N/A` for the website

A `mailto:` link only. If email is ever sent *from* this domain, SPF/DKIM/DMARC
become P1.

### 42. SEO — `VERIFIED`

Added in this pass (all four were absent): meta description, canonical URL,
Open Graph and Twitter card tags with a purpose-built 1200×630 preview image,
`LodgingBusiness` structured data with address, phone, price range and
amenities, `robots.txt`, `sitemap.xml`, a real 404 page, and a favicon. Page
title expanded to describe what the property actually is. Clean URLs are on, so
`/privacy-policy` works and the `.html` form redirects to it.

Indexing is deliberately allowed on the four real pages and denied on the 404.

### 43. Analytics — `VERIFIED` in code

Vercel Web Analytics, consent-gated, cookieless, no cross-site tracking. Needs
enabling in the dashboard (P0-2).

### 44. Third-party services — `VERIFIED`

The full list, after this pass:

| Service | Purpose | Data it sees | If it fails |
|---|---|---|---|
| Vercel | Hosting, analytics | IP, user agent, page path | Site is down |
| Dales & Lakes | Booking (outbound link) | Nothing until a visitor clicks | Booking button leads nowhere |
| Google Maps | Embedded location map (added 2 Oct 2026) | IP, user agent, may set cookies | Map area is blank; rest of page unaffected |

Reduced from four to two: the hot-linked images were pulled in-house and the
Google Fonts dependency was removed by self-hosting the typefaces. Vercel is now
the only third party a visitor's browser contacts, and it is the host — an
unavoidable dependency. (Since 2 October 2026 Google is a second one, via the
Location map embed.) Every outbound link is `rel="noopener noreferrer"`.

### 45. Administration — `N/A`

No admin interface exists. The only privileged access is the Vercel, GitHub and
registrar accounts — see P0-3.

### 46. Documentation — `VERIFIED`

`README.md` covers structure, local development, deployment, rollback, the
one-off Vercel setup, how to edit content and add photos, and the constraints
the CSP imposes on future edits. This file covers the audit.

### 47. Incident response — `PARTIAL`

For a static site the realistic incidents are: site down (check Vercel status,
then DNS, then rollback), account compromise (rotate password, revoke sessions,
re-enable 2FA, redeploy from git), and defacement via a compromised account
(rollback to a known-good deployment). All are covered by the rollback
procedure in the README. A formal incident-response document would be
disproportionate here.

### 48. Security auditing — `PARTIAL`

This audit is the baseline. Re-run the header check and a dependency review (of
which there are none) yearly, alongside the legal review.

### 49. Browser compatibility — `PARTIAL`

Verified in Chrome. The code uses only long-established features —
`IntersectionObserver`, CSS grid, `aspect-ratio`, WebP — all supported since
2020 across Chrome, Edge, Firefox and Safari including iOS. Not tested in
Safari or Firefox directly, so this is not claimed as verified.

### 50. Content — `VERIFIED`

No placeholder text, no debug content, no test data. Contact details, address
and phone number are consistent across every page; phone links are now in
international `tel:+44` format so they dial correctly from abroad. Prices carry
a "rates are a guide and confirmed at booking" note. Alt text corrected to match
the actual photographs. Favicon and social preview image added.

### 51. Production sanitisation — `VERIFIED`

No debug mode, no console logging, no development endpoints, no credentials, no
source maps. Removed: the stale `index.html.html` duplicate, an unused photo,
and the entire calendar scraper.

### 52–53. Smoke test & launch gate — run after the first deploy

```
[ ] https://gibbshallbarn.com loads over HTTPS
[ ] http:// and www. both redirect to it
[ ] /privacy-policy, /cookie-policy, /terms-and-conditions load
[ ] /nonsense shows the styled 404
[ ] securityheaders.com gives an A or better
[ ] "Call to Book" dials, "Email the Owner" opens a mail client
[ ] "Book Now" and "See Live Availability" reach the agent's page
[ ] Cookie banner appears; Decline loads no analytics; Accept does
[ ] Cookie Settings in the footer brings the banner back
[ ] Mobile menu opens and closes on a real phone
[ ] /sitemap.xml and /robots.txt load
[ ] Sharing the link in WhatsApp shows the barn photo and description
```

### 54–55. Post-launch & maintenance

Watch the analytics and the uptime monitor for the first week. Then, yearly:
re-read the legal pages, renew the `security.txt` expiry, confirm domain
auto-renewal, re-check prices, and re-run the header and Lighthouse checks.

---

## Security sweep — 9 August 2026

A second pass looking specifically for ways the site could be attacked.

### What was checked, and what was found

**Cross-site scripting.** Every DOM-writing path in `assets/main.js` was
reviewed. There is no `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
`document.write`, `eval`, `new Function`, string-argument `setTimeout`, or
`srcdoc` anywhere in the codebase. The only value read from storage
(`ghb_cookie_consent`) is compared against two string literals and never
rendered. The only dynamically created element is the analytics `<script>`, and
its `src` is a hardcoded same-origin path — no interpolation. No inline event
handlers remain in any page. **No XSS sink exists.**

**Injection generally.** There is no server, no database, no query-string
parsing, no template rendering, no shell, and no filesystem access from user
input. SQL/NoSQL/command/template/LDAP injection and path traversal are all
structurally impossible, not merely unlikely.

**Secrets.** The full git history (`git log --all -p`) was scanned for API
keys, tokens, private keys, AWS/GitHub/Stripe/Slack credential patterns and
password strings. **Nothing found.** Only HTML and images have ever been
committed to this repository. There are no environment variables and no
`.env` file; `.gitignore` now excludes `.env*` so this stays true.

**Third-party code.** This was the one real remaining weakness and it has been
closed. The site previously loaded a stylesheet from `fonts.googleapis.com` and
font files from `fonts.gstatic.com`. A third-party stylesheet is not harmless:
CSS can deface a page, and with attribute selectors it can exfiltrate page
content to an attacker's server. The three typefaces are now **self-hosted** in
`assets/fonts/` (288 KB, latin and latin-ext only) and the CSP no longer permits
any external origin at all.

Verified by instrumenting a real browser across all five pages: **55 requests,
every one of them to this site's own origin, zero third-party hosts, zero failed
requests, zero console errors.** All eight font faces load from local files and
the typography is pixel-identical to before.

The practical effect on the CSP:

Since 2 October 2026 `frame-src` allows `https://www.google.com` for the
Location map; it was `'none'` at the time of this audit.

```
default-src 'self'; base-uri 'none'; object-src 'none'; frame-src 'none';
frame-ancestors 'none'; worker-src 'none'; form-action 'none';
script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:;
connect-src 'self'; manifest-src 'self'; upgrade-insecure-requests
```

Nothing outside this origin can execute, style, frame, or be framed. There is no
`unsafe-inline` and no `unsafe-eval`. Also added in the sweep:
`X-Permitted-Cross-Domain-Policies: none`, and explicit `frame-src`/`worker-src`
denials so the policy does not depend on `default-src` staying tight.

**Clickjacking.** `frame-ancestors 'none'` plus `X-Frame-Options: DENY`.

**Tabnabbing.** All external links carry `rel="noopener noreferrer"`
(re-verified: zero `target="_blank"` without it).

**Open redirects, CSRF, session fixation, IDOR, privilege escalation.** All
require state, parameters or accounts. None exist here.

**Denial of service.** Static files on Vercel's CDN with no compute, no
database and no rate-limitable endpoint. Platform-level protection applies and
there is nothing expensive to trigger.

**Supply chain.** Zero dependencies, no build step, no lockfile, no CI that
executes third-party code. Nothing to poison.

### The realistic threat model

For a site like this, the code is not the attack surface — the *accounts and the
domain* are. Ranked by likelihood:

1. **Account takeover** of the registrar, GitHub or Vercel → attacker replaces
   the site or repoints the domain. Mitigation is entirely off-site: 2FA on all
   three (P0-3). Nothing in the code can defend against this.
2. **Booking fraud by email spoofing.** A holiday let is a natural target for
   "your balance is due, pay to this account" emails. Because
   `gibbshallbarn.com` will never send mail, publish records that say so:
   - `TXT @` → `v=spf1 -all`
   - `TXT _dmarc` → `v=DMARC1; p=reject; rua=mailto:bookings@dalesandlakes.co.uk`
   - `MX @` → `.` (null MX, RFC 7505)

   That makes spoofed mail *from your domain* fail authentication at the
   recipient. It does not stop lookalike domains, so it is also worth telling
   guests, in the booking confirmation, that your bank details never change.
3. **Domain expiry or transfer.** Enable auto-renew and the registrar transfer
   lock; add a CAA record (`0 issue "letsencrypt.org"`, which is what Vercel
   uses) so no other certificate authority will issue for the domain. Enable
   DNSSEC if the registrar supports it.
4. **Subdomain takeover.** Not possible today — there are no dangling DNS
   records. It becomes possible the moment a subdomain is pointed at a service
   and later abandoned, so remove DNS records when you stop using a service.

### Honest limits of this sweep

- The response headers are configured but **have not been observed on a live
  response**, because the domain is not yet serving. Confirm with
  <https://securityheaders.com> after the first deploy; this is the one
  security item that cannot be verified from the repository.
- No penetration test was performed, and none is proportionate for a static
  brochure site with no input, no accounts and no data.
- The security of Vercel, and of the agent's booking system that visitors are
  handed off to, is outside this audit.

### Also fixed during the sweep

Hero contrast: the eyebrow line and the guest/bedroom statistics sat over a
bright part of the photograph and were close to illegible. The overlay gradient
now carries the contrast. Not a security issue — noticed while re-rendering.

---

## Changes made in this pass

**Removed**
- The availability calendar section, its styles, its JavaScript, and the daily
  GitHub Action + Playwright scraper that fed it (backed up outside the repo
  before deletion). The scraper depended on markers in `index.html` that no
  longer exist, and its cron would have failed every morning.
- `index.html.html` — a stale full copy of the site, publicly reachable.
- An unused photograph; `package.json`, `package-lock.json`, `node_modules/`.

**Security**
- Strict CSP: this origin only, no `unsafe-inline`, no external hosts at all.
  Plus HSTS, `nosniff`, `DENY` framing, `Referrer-Policy`, `Permissions-Policy`,
  COOP, CORP and `X-Permitted-Cross-Domain-Policies` (`vercel.json`).
- Self-hosted fonts — the last third-party origin removed, verified by a
  browser-level request audit across all five pages.
- `rel="noopener noreferrer"` on all five external links.
- All CSS and JavaScript moved out of the HTML; inline `style` attributes and
  the inline `onerror` handler removed.
- `.well-known/security.txt`; `.gitignore` extended to `.env*`.

**Privacy**
- Consent-gated cookieless analytics; withdrawable via a footer link.
- Cookie and privacy policies rewritten to describe what actually happens.

**Accessibility**
- Reduced-motion support; focus-visible styles; skip link; corrected and
  completed alt text; ~20 colour-contrast fixes; custom cursor limited to fine
  pointers; content readable without JavaScript.

**Performance**
- 6.8 MB of images → 1.3 MB of WebP; lazy loading; explicit dimensions; hero
  preload; four hot-linked images brought in-house.

**SEO / discoverability**
- Meta description, canonical, Open Graph + Twitter cards, 1200×630 preview
  image, `LodgingBusiness` structured data, `robots.txt`, `sitemap.xml`, 404
  page, favicon, clean URLs.

**Structure**
- Shared stylesheet for the legal pages (previously the same 120 lines were
  duplicated three times); `README.md`; this audit.
