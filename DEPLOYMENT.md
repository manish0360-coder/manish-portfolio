# DEPLOYMENT.md — The Observatory / Institute · V1.0 Public Launch

Deployment runbook for this repository. **Static site, no build step** (plain HTML +
ES-module engine served as-is). Host target: **Vercel**. This document is the single
source of truth for shipping V1.0 and recovering from a bad deploy.

> Code is frozen for launch. Touch code only if a step below surfaces a production bug.

---

## 0. Repository facts the deploy depends on

| Thing | Value |
|---|---|
| Entry page | `/index.html` (fully standalone — no JS/asset deps beyond `/assets`) |
| Interactive wing | `/institute-engine/index.html` (ES modules + importmap) |
| Runtime 3rd-party dep | **three.js `0.160.0` from `unpkg.com`** (importmap in `institute-engine/index.html`) |
| Host config | `/vercel.json` (security headers + caching) |
| Deploy excludes | `/.vercelignore` (uploads, archive, screenshots, *.dc.html, *.export-src.html, support.js, tests) |
| Test suite | `/institute-engine/tests/integration.html` → `window.__testResult` = `{pass:78, fail:0}` |
| Placeholder domain | `manish-kumar.vercel.app` — appears in `index.html` (canonical/OG/Twitter/JSON-LD), `sitemap.xml`, `robots.txt` |

### Files that MUST be edited once the real domain is known
Search-and-replace `manish-kumar.vercel.app` → `<final-domain>` in exactly these files:
- `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, JSON-LD `url`
- `sitemap.xml` — both `<loc>` entries
- `robots.txt` — `Sitemap:` line

> If launching on the free `*.vercel.app` URL, **no edit needed** — the placeholder already matches.

---

## 1. Pre-deploy checklist (run locally before pushing)

- [ ] `git status` clean; on the branch you intend to release from.
- [ ] Serve locally over HTTP and smoke-test:
      `python3 -m http.server 8080` → open `http://localhost:8080/`
- [ ] Open `/institute-engine/tests/integration.html` → console/page shows **78 passed, 0 failed**.
- [ ] Hard-refresh `/` — hero renders, starfield animates, demo video autoplays muted.
- [ ] Open `/institute-engine/index.html` — loader fades, "enter the institute" prompt appears,
      a click reveals the wayfinder and the scene is navigable.
- [ ] Click every nav anchor (`#philosophy #miniflywire #noetica #velith #systems #contact`) — all scroll.
- [ ] External links open: GitHub repos (×3), LinkedIn, `mailto:`, résumé PDF.
- [ ] Visit a bogus path (`/nope`) — confirm `404.html` renders and "Return to Observatory" works.
- [ ] Decide domain strategy (vercel.app subdomain vs custom). If custom, do the URL replace above and re-commit.
- [ ] Confirm `assets/og-image.png` is 1200×630 (already verified) and `assets/Manish-Kumar-Resume.pdf` opens.

**Recommended (not launch-blocking):** vendor three.js to remove the unpkg runtime dependency —
download `three.module.js` + the used addons (`EffectComposer`, `RenderPass`, `UnrealBloomPass`,
`OutputPass`, `ShaderPass`) into `/institute-engine/vendor/three/` and repoint the importmap in
`institute-engine/index.html`. Re-run the integration suite after. Until then the CDN preconnect
hint already in the engine head mitigates latency.

---

## 2. GitHub release checklist

- [ ] Create repo (if new): `gh repo create <user>/observatory --public --source=. --remote=origin`
- [ ] `.gitignore` excludes local cruft (`.DS_Store`, editor dirs). (Deploy excludes live in `.vercelignore`.)
- [ ] Commit: `git add -A && git commit -m "release: V1.0 — The Observatory"`
- [ ] Push: `git push -u origin main`
- [ ] Tag the release:
      `git tag -a v1.0.0 -m "V1.0 — public launch"` then `git push origin v1.0.0`
- [ ] Cut a GitHub Release from tag `v1.0.0`. Title "V1.0 — The Observatory". Notes:
      three flagship systems (MiniFlyWire / Noetica / Velith), interactive Institute engine,
      78/78 integration tests, security headers + caching configured.
- [ ] Confirm `README` / `institute-engine/README.md` render correctly on GitHub.
- [ ] Verify **no secrets** in history (`git log -p | grep -iE "key|token|secret"` — expect none; this is a static site).

---

## 3. Vercel deployment steps

**Option A — Git integration (recommended; gives preview deploys + instant rollback):**
1. vercel.com → **Add New… → Project** → **Import** the GitHub repo.
2. Framework Preset: **Other**. Build Command: **(none/empty)**. Output Directory: **`.` (root)**. Install: none.
3. `vercel.json` is auto-detected — confirm headers/caching show in the deploy summary.
4. **Deploy.** Wait for "Ready". Note the generated `*.vercel.app` Production URL.
5. (Optional) Project → Settings → Git: keep "Production Branch" = `main`. Every push to `main` redeploys; every PR gets a Preview URL.

**Option B — CLI (one-off / no Git):**
1. `npm i -g vercel` → `vercel login`
2. From repo root: `vercel` (creates a Preview) → review the Preview URL.
3. Promote to production: `vercel --prod`.

**Sanity after first deploy:**
- [ ] Production URL loads `/` with no console errors.
- [ ] `/institute-engine/` loads three.js from unpkg (Network tab: 200s) and renders.
- [ ] `curl -sI https://<domain>/ | grep -iE "x-content-type-options|strict-transport|referrer-policy"`
      returns the headers from `vercel.json`.
- [ ] `curl -sI https://<domain>/assets/og-image.png | grep -i cache-control` → `max-age=31536000, immutable`.

---

## 4. Domain connection steps (custom domain — skip if staying on *.vercel.app)

1. Vercel → Project → **Settings → Domains → Add** → enter `example.com` (and `www.example.com`).
2. Vercel shows the required DNS records (see §5). Choose:
   - **Apex/root** `example.com`: A record to Vercel, **or** use Vercel nameservers, **or** ALIAS/ANAME if your DNS supports it.
   - **www**: CNAME to `cname.vercel-dns.com`.
3. Add the records at your registrar/DNS provider (§5).
4. Set the **primary** domain in Vercel (redirect the other, e.g. `www` → apex or vice-versa).
5. Wait for Vercel to show **"Valid Configuration"** and issue the TLS cert (automatic, Let's Encrypt; usually minutes, up to ~24h for DNS propagation).
6. **Now do the URL replace from §0** (canonical/OG/sitemap/robots) → commit → push → redeploy so social/SEO metadata matches the live domain.

---

## 5. DNS records required

Use the values **Vercel shows for your project** — the canonical targets are below. Set TTL low
(e.g. 300s) during cutover, raise afterward.

| Purpose | Type | Name / Host | Value | Notes |
|---|---|---|---|---|
| Apex domain | `A` | `@` | `76.76.21.21` | Vercel's apex A target (confirm in dashboard — may differ) |
| www subdomain | `CNAME` | `www` | `cname.vercel-dns.com` | Standard Vercel CNAME |
| (Alt apex) | `ALIAS`/`ANAME` | `@` | `cname.vercel-dns.com` | Use only if provider supports flattening (Cloudflare, DNSimple, etc.) |
| Cert validation | `TXT`/`CNAME` | as shown | as shown | Only if Vercel requests domain-verification records |

- **CAA (optional, recommended):** `0 issue "letsencrypt.org"` so the auto-cert can be issued.
- **Do not** keep stale A/AAAA/CNAME records pointing at a previous host — remove them to avoid split routing.
- After propagation: `dig +short example.com` and `dig +short www.example.com` should resolve to the Vercel targets.

---

## 6. Post-deployment verification checklist (against the LIVE production URL)

**Routing & assets**
- [ ] `/` 200; `/institute-engine/` 200; `/404-test-path` serves `404.html`.
- [ ] `/assets/Manish-Kumar-Resume.pdf`, `/assets/og-image.png`, `/assets/videos/miniflywire-demo.mp4`, `/assets/miniflywire-*.png` all 200.
- [ ] `/sitemap.xml` and `/robots.txt` 200 and reference the **correct** domain.
- [ ] Dev surfaces are **absent** from production (excluded by `.vercelignore`): `/uploads/…`, `/archive/…`, `/institute-engine/tests/…` → 404.

**Headers / security**
- [ ] `curl -sI` shows `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy`, `strict-transport-security`.
- [ ] HTTPS enforced; `http://` redirects to `https://`.

**Functional**
- [ ] Engine boots, loader clears, click-through reaches orientation/wayfinder (matches local smoke test).
- [ ] Reduced-motion: with OS "Reduce Motion" on, starfield/animations are static and content is fully visible.
- [ ] Mobile (real device or DevTools): nav, sections, contact card, and the engine's WebGL fallback message on no-WebGL devices.

**SEO / social**
- [ ] `<link rel="canonical">` = live domain (view-source).
- [ ] OG preview correct: validate with the link debuggers (LinkedIn Post Inspector, X Card Validator, Facebook Sharing Debugger) — image renders at 1200×630.
- [ ] Submit `sitemap.xml` in Google Search Console; request indexing of `/`.

---

## 7. Lighthouse verification workflow

Run against the **live production URL** (not localhost — caching headers and HTTPS only exist in prod).

1. Chrome → DevTools → **Lighthouse** → Mode **Navigation**, Device **Mobile** first, then **Desktop**.
   Categories: Performance, Accessibility, Best Practices, SEO.
2. Or CLI: `npx lighthouse https://<domain>/ --preset=desktop --view` then `--preset=perf`/mobile.
3. Run **both** pages: `/` and `/institute-engine/`.

**Targets / triage**
- **Performance ≥ 90** on `/`. The engine page is WebGL-heavy — expect lower mobile perf; that's acceptable for an interactive 3D experience, but check TBT/LCP aren't pathological.
- **Accessibility ≥ 95** — verify contrast on muted mono text, `aria-live` status regions, focus-visible states.
- **Best Practices ≥ 95** — should pass cleanly (HTTPS, headers, no console errors). If "uses 3rd-party cookies"/CDN flags appear, they trace to unpkg → resolved by vendoring three.js (§1 recommended).
- **SEO ≥ 95** — canonical, meta description, robots, sitemap, structured data should all pass.
- [ ] Save the JSON/HTML report; attach to the GitHub Release or `/docs` for the launch record.
- [ ] Re-run after any post-launch fix to confirm no regression.

---

## 8. Rollback plan

**Fastest (Vercel, Git integration) — instant, no rebuild:**
1. Vercel → Project → **Deployments**.
2. Find the last known-good deployment (the one tagged/used before the bad change).
3. **⋯ → Promote to Production** (a.k.a. "Rollback"). Traffic switches in seconds — Vercel keeps every prior immutable build.

**Git-level revert (also triggers a clean redeploy):**
- Revert the offending commit: `git revert <sha>` → `git push origin main` (Vercel redeploys automatically), **or**
- Re-point to the release tag: `git checkout v1.0.0 -- . && git commit -m "rollback to v1.0.0" && git push`.

**Domain/DNS rollback:**
- If a DNS cutover broke routing, restore the previous records at the registrar. Because TTL was lowered pre-cutover (§5), recovery is fast. Keep a copy of the old zone file before changing anything.

**Decision rule:** if the live site is broken (blank screen, JS error on load, broken nav, missing assets),
**promote the previous good deployment first**, then diagnose on a Preview deployment — never debug on production.

**Post-rollback:** re-run §6 verification against the restored production URL and note the incident in the GitHub Release notes.

---

### Launch gate (all must be true to go public)
- [ ] 78/78 integration tests pass on the deployed build.
- [ ] `/` and `/institute-engine/` load with zero console errors on the production URL.
- [ ] Security headers present; HTTPS enforced.
- [ ] Domain resolves and TLS valid (if custom).
- [ ] Placeholder domain replaced everywhere (or intentionally staying on `*.vercel.app`).
- [ ] Lighthouse reports captured and within targets.
- [ ] Rollback path confirmed (previous deployment exists to promote).
