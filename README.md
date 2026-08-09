# Gibbs Hall Barn — website

A static marketing site for Gibbs Hall Barn, a self-catering holiday cottage in
Dentdale, Yorkshire Dales National Park. Hand-written HTML and CSS with a small
amount of vanilla JavaScript. No framework, no build step, no server code, no
database, and no forms — enquiries and bookings go to the managing agent, Dales
& Lakes Holiday Cottages.

Production: <https://gibbshallbarn.com> (hosted on Vercel)

---

## Layout

```
index.html                  Home page (the whole marketing site)
privacy-policy.html         Legal pages
cookie-policy.html
terms-and-conditions.html
404.html                    Served automatically by Vercel for unknown paths
assets/styles.css           Home-page styles
assets/legal.css            Shared styles for legal pages + 404
assets/fonts.css            @font-face rules for the self-hosted typefaces
assets/main.js              All site behaviour (nav, reveals, cookie consent)
assets/fonts/               Self-hosted woff2 font files
assets/img/                 Optimised WebP images actually served to visitors
assets/img-src/             Photo originals downloaded from the agent's site
vercel.json                 Security headers, caching, clean URLs
robots.txt, sitemap.xml     Search engine directives
favicon.svg                 Site icon
.well-known/security.txt    Security contact (RFC 9116)
.vercelignore               Keeps originals and docs out of the deployment
image*.jpeg, *.png (root)   Photo originals — kept for re-encoding, not deployed
```

There is no `package.json` and there are no dependencies. That is deliberate:
nothing to install, nothing to patch, no supply-chain surface.

## Running it locally

Any static file server works. From the project root:

```sh
python -m http.server 8000
```

then open <http://127.0.0.1:8000>. Note that clean URLs (`/privacy-policy`) are
a Vercel feature, so locally you need `/privacy-policy.html`. To preview exactly
what production will serve, including headers and clean URLs, use `vercel dev`.

## Deploying

Vercel builds nothing — it uploads the repository as static files.

1. Push to `main`. Vercel deploys automatically and every pull request gets its
   own preview URL.
2. Watch the deployment in the Vercel dashboard; the smoke test below takes two
   minutes.

**Rollback:** Vercel → project → Deployments → pick the last good deployment →
"Promote to Production". This is instant and needs no git operation. Because the
site is static with no database, a rollback is always safe.

### First-time Vercel setup

These are one-off dashboard steps, not code:

- **Domains** — add `gibbshallbarn.com` and `www.gibbshallbarn.com`, with `www`
  redirecting to the apex domain. Vercel issues and renews the TLS certificate
  and redirects HTTP to HTTPS automatically.
- **Web Analytics** — enable it in the project's Analytics tab. Until it is
  enabled, `/_vercel/insights/script.js` returns 404 and the site simply records
  nothing (visitors see no error). The script is only ever loaded after a
  visitor presses "Accept" on the cookie banner.
- **Deployment protection** — leave preview deployments password-protected, or
  they can be indexed and shown to the public.

## Editing content

- **Text, prices, policies:** edit `index.html` directly. Prices also appear in
  `terms-and-conditions.html`; keep them consistent.
- **Photos:** put the original in `assets/img-src/`, then re-encode it into
  `assets/img/` as WebP. The originals here were produced with:

  ```sh
  ffmpeg -i assets/img-src/photo.jpg -vf "scale=1200:-2:flags=lanczos" \
         -frames:v 1 -c:v libwebp -quality 80 -compression_level 6 \
         assets/img/photo.webp
  ```

  Update the `width`/`height` attributes on the `<img>` tag to the new
  dimensions — they prevent the page from jumping as images load — and write
  alt text that describes what is actually in the photo.
- **A new page:** copy `privacy-policy.html` as a starting point, then add the
  URL to `sitemap.xml`.

### Fonts

Playfair Display, Cormorant Garamond and DM Mono are **self-hosted** in
`assets/fonts/` — the site loads nothing from Google. To add a weight or style,
request it from Google Fonts once, save the `woff2` files locally, and add
matching `@font-face` rules to `assets/fonts.css` with `font-display: swap` and
the `unicode-range` for the latin and latin-ext subsets. Do not re-add a
`<link>` to `fonts.googleapis.com`: the CSP now blocks it, so the page would
silently lose its typography.

Some weights share a file — Google serves one variable font per family and
style, so e.g. Playfair 400 and 700 are the same `woff2`.

## Things worth knowing

- **The Content-Security-Policy in `vercel.json` allows this origin and nothing
  else** — no inline `<script>`, no inline `style=""`, no third-party host of
  any kind. If you add any of those, the browser silently refuses to load it.
  Put JavaScript in `assets/main.js` and styles in the stylesheets. If you ever
  add a third-party embed (a map, a video, a booking widget), its domain must
  be added to the relevant CSP directive or it will be blocked — and that is
  the moment to ask whether it is worth reopening the door.
- **Images are WebP.** Every browser released since 2020 supports it.
- **The site must work without JavaScript.** Content is visible with JS
  disabled; `assets/main.js` only adds animation and the consent banner.
- **Nothing is measured before consent.** Analytics loads only after "Accept",
  and the "Cookie Settings" link in the footer lets a visitor change their mind.

See `PRODUCTION-READINESS.md` for the launch audit, the outstanding items, and
the post-launch checks.
