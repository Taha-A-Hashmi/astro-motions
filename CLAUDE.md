# Astro Motions

Studio site in the "Signal" identity — **dark edition, heavy on 3D**
(branch `redesign-dark`, 2026-09-24). Near-black ground, electric cobalt
and a lime signal, Unbounded + Instrument Sans, square blocks, editorial
grid — with a WebGL layer built entirely from glowing dots. Was "Astra
Motions" until 2026-09-15; until 2026-09-24 it was a fixed full-screen
three.js ascent like Apex's ("Starlight": indigo void, gold, serif).

History of the redesign: the owner asked for a site that looks like Apex
**not at all** in a different colour theme. A light edition was built
first (branch `redesign`, kept as its own preview); the owner then asked
for "a darker theme and way more 3D" → this branch. Keep it unlike Apex:
no ember/obsidian, no camera flight through one world with scroll
"stages", no tracked-mono uppercase labels, no rail/HUD, no greeting veil,
no custom cursor ring, no Guide. The 3D here is DOM-anchored objects in an
editorial page, all made of dots.

## The 3D layer (`src/gl/`)

- `stage.js` — ONE fixed full-viewport canvas behind the content
  (`.gl-stage`, z-index 0; `main`, `.reviews`, `.ft` sit at z-index 1).
  Each `[data-gl]` placeholder is a *view*: every frame the stage renders
  that view's scene with scissor + viewport into the placeholder's rect,
  skips views off screen, and steps DPR down if frames run long.
  Placeholders (and their ancestors up to `main`) must stay transparent or
  they hide what is drawn behind them.
- `dots.js` — the additive, twinkling dot material (pointer push turns
  dots lime), the shape library (dust, sphere, ground, galaxy, torus,
  browser, helix, bars, network, cube, text sampled from a 2D canvas) and
  `Morph` (a GPU blend between two shapes: `scrub(s)` for scroll-driven,
  `goTo(i)` for animated).
- `views.js` — `stars` (full viewport, scroll parallax), `planet` (hero:
  halftone dot planet, lime ring, two dot moons, drag to spin), `manifesto`
  (pinned 420vh section: dust → ground → galaxy → the hero word; its `s`
  is owned by main.js, which also cross-fades the three lines), `services`
  (morphs to the hovered row; cycles by itself on touch), `orrery` (the
  process: a sun and a planet per step; the step in view lights up),
  `warp` (the CTA star tunnel; speeds up while the button is hovered),
  `shape` (content-page heroes: dust settling into a shape).
- `home.js` binds the home placeholders (lazy-loaded by main.js).
  `pages.js` is a second Vite entry built to the fixed name
  `dist/assets/pages-gl.js`, which server/pages.js links (`GL_SRC`);
  `SHAPES` there maps each page to its hero shape (web design → browser,
  SEO → helix, PPC → bars, social → network, hub → cube, portfolio/blog →
  galaxy, team → torus, contact/post → sphere, 404 → dust).
- Dev gotchas: Vite proxies `/assets` to the API server, so run
  `npm run build` before checking content pages in dev; and the API server
  caches dist/shell.html, so restart it after a build or the home page
  points at stale hashed CSS.
- Colour tokens kept their *roles*: `--paper #06070b` is the ground,
  `--ink #eeece6` the text, `--glass` a translucent band. Lime is only a
  background, always with dark `#06070b` text on it.

## The home page (`index.html`, top to bottom)

| Section | id / class | Editable keys |
|---|---|---|
| Header — mark + wordmark, nav, cobalt "Book a launch" | `.hd` | `brand.wordmark`, `nav.*` |
| Hero — tagline, intro, buttons, the 3D dot planet, huge two-line wordmark | `#top.hero`, `[data-gl=planet]` | `hero.tagline/intro/cta/word/sub`, `nav.workLink` |
| Cobalt marquee — service names + disciplines | `.marquee` | `svc.<slug>.name`, `stage3.d1-3` |
| Manifesto — pinned; three lines over the particle morph, then the disciplines | `#studio.manifesto`, `.disciplines-band` | `stage1-3.index/line`, `stage3.d1-3` |
| Services — rows that flood cobalt on hover + the morphing cloud | `#services`, `[data-gl=services]` | `home.services*`, `svc.<slug>.name/summary` |
| Launch log — glass band, staggered work cards | `#work` | `work.*` (list `work`) |
| Process — the orrery pinned left, steps scrolling right | `#process`, `[data-gl=orrery]` | `stage4.index/line`, `process.items` (list `process`) |
| Launch — CTA over the warp tunnel | `#launch`, `[data-gl=warp]` | `stage5.index/line`, `cta.text`, `cta.summit` |
| Reviews strip (Trustpilot) + footer with full-width cobalt wordmark | `.reviews`, `.ft` | `footer.*`, `social.links` |
| Contact drawer (slides from the right) | `#contact.drawer` | `contact.*` |
| Phone menu (cobalt, ≤1100px) | `#menu` | `nav.*` |

The `stageN.*` keys are historical names from the old scroll stages; they
now feed the sections above (labels in the dashboard say what goes where).
`[data-open="contact"]` opens the drawer (header, hero, work, CTA, menu);
the links fall back to `/contact/` without JS. `/?open=contact|work` opens
the drawer / scrolls to the work after load and is stripped from the URL.

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173 (proxies `/api` → 8787)
- `npm run server` — backend API on http://localhost:8787 (auto-reloads)
- `npm run dev:all` — both of the above in one terminal
- `npm run build` — production build to `dist/`
- `npm start` — production: one Node process serves `dist/` **and** `/api`

## Architecture — frontend

- `src/main.js` — Lenis smooth scroll + GSAP ScrollTrigger; header (solid
  once scrolled, hides on the way down); hero entrance (`html.is-ready`,
  letters rise); the pinned manifesto (progress → `manifestoState.s` +
  which line shows); reveal-on-scroll (`[data-reveal]`, below the fold); the
  lime "View ↗" disc over work images (fine pointers); `[data-open]`
  routing; footer wordmark fit-to-width. A 2.6 s failsafe always reveals
  the hero. Loads `gl/home.js` lazily and `content.js` only in Vite dev.
- `src/quality.js` — tier (`high`/`mid`/`low`, `?q=` forces) → dot counts
  in every 3D view and the stage DPR cap.
- `src/contact.js` — the drawer: open/close, focus trap, Esc, validation,
  POST `/api/contact` (422 field errors, 429, sent state).
- `src/menu.js` — phone menu; `src/content.js` — dev-only dashboard apply.
- `src/style.css` — the home page. `public/pages/pages.css` repeats the
  same tokens/atoms for the content pages — change both together.

## Architecture — backend (`server/`)

Identical to Apex: Express 5 on Node ≥ 22.13, storage on `node:sqlite`.
Same app runs long-lived (`server/index.js`) or as a Vercel function
(`api/index.js` + `vercel.json` rewrite). Routes: `GET /api/health`,
`POST /api/contact` (honeypot `company`, `elapsed` guard, 5/10 min per IP),
admin `GET/PATCH /api/inquiries[/:id]` behind `Authorization: Bearer ADMIN_TOKEN`.

**The SEO dashboard** lives at `/admin/` (password = `ADMIN_TOKEN` on the
Vercel project; see it in Vercel → Settings → Environment Variables). Files:
`cms/schema.js` (every editable field, its label/type/limits and where it
lands: `sel` → `data-cms="key"` element, `meta`/`prop`/`title`/`link`/
`jsonld`/`headHtml`, or `list` → `data-cms-list="work|process|socials"`),
`cms/templates.js` (escaping + the work-card, process-step and social
templates), `server/content.js` (storage: Vercel Blob store `astro-cms` via
`BLOB_READ_WRITE_TOKEN`, else `DATA_DIR/cms/`), `server/cms.js` (renders
`dist/shell.html` with saved values injected + the `/api/admin/*` routes),
`src/content.js` (dev-only client apply), `public/admin/*` (the editor UI,
shared with Apex). The Vite build renames `index.html` → `shell.html` and
`vercel.json` rewrites `/` to the function, so crawlers see edited copy
without a rebuild; saved values also ride on `window.__CMS__`. To add an
editable field: add it to the schema and put `data-cms="key"` on the element
(wrap button text in a span if the button also holds an arrow). The same
key may sit on several elements (service names appear in the marquee, the
rows and the footer) — all are replaced. Service `name`/`summary` fields
carry a `sel` target (cms/fields.js) for exactly that reason. Empty value =
"use the HTML default". The function reads the shell from disk
(`includeFiles`) or fetches `/shell.html` from the CDN as fallback;
`/api/health` reports which (`shell`).

**Mail: info@astromotions.com** is a Namecheap **Private Email** mailbox
(MX mx1/mx2.privateemail.com, SPF includes spf.privateemail.com — unlike
Apex, which is cPanel shared hosting). SMTP: `mail.privateemail.com`, 465,
SSL, user = the address, pass = the mailbox password (Vercel env only,
never committed). `CONTACT_TO` and `CONTACT_FROM` are the same address.
Until those env vars are on the Vercel project, live submissions are only
stored in /tmp (effectively lost).

**The contact form** (home drawer + /contact/): first name, last name,
email, country (`<select>` from cms/countries.js — index.html's copy is
generated from the same list), phone, description (≥10 chars); all
required, checked in the browser and again in server/validate.js. db.js
adds the first_name/last_name/country/phone columns to older databases on
open; `name` keeps the full name. Budget and services pickers were removed
(2026-09-24).

## Content pages & blog (server-rendered, no WebGL)

Routes (exact, trailing slash canonical — `/web-design` 301s to `/web-design/`):
`/services/` hub · `/web-design/` · `/organic-seo/` · `/ppc-marketing/` ·
`/social-media-marketing/` · `/portfolio/` · `/team/` · `/contact/` ·
`/blog/` · `/blog/<slug>/` · `/blog/feed.xml` (RSS) · `/sitemap.xml`.
Unknown paths get a styled 404 (`site.notFound`, a giant "4◐4").

- `server/pages.js` — renders every page (layout, header with Services
  mega-dropdown, cobalt phone menu, ink footer, breadcrumbs +
  BreadcrumbList/Service/FAQPage/BlogPosting JSON-LD) from dashboard values
  → schema defaults → shell defaults. Templates: service, services,
  portfolio, team, contact, blog, post, 404. **Its markup diverged from
  Apex's copy in the 2026-09-24 redesign** — the data plumbing (getCtx,
  publishedPosts, sitemap, feed, router) is the same shape, so carry
  structural fixes across by hand, never the markup.
  Page anatomy: `.phero` (crumbs + halftone `.sticker`, index chip, huge
  H1, ruled foot with lede + actions) → bands (`.deliver` ruled grid,
  `.steps` on ink, `.longform` prose with a side label, sticky-side FAQ,
  `.svc-rows`) → cobalt `.launch` CTA. Cards without images get CSS
  `.halftone` art.
- `cms/pages.js` — Astro's page sections and ALL their default copy (the
  four services, hub, portfolio, team, contact, blog page, starter post).
  `cms/fields.js` — the reusable section builders (`serviceSection` etc.)
  and field helpers. Each page is a dashboard section with `page: { path,
  template }` and flat keys `svc.<slug>.*` / `page.<name>.*`.
- `public/pages/pages.css` + `pages.js` — the look and the small behaviours
  (phone menu, header tuck-away, dropdown, reveal, footer wordmark fit,
  contact form → `/api/contact`).
- Chrome config lives in `site` (cms/schema.js): nav, cta, footer links,
  fonts, `mark(id)` (the mark SVG — masks need a unique id per copy),
  notFound, budget label.
- Blog posts are one field, `blog.posts` (type `posts`), edited by the
  WordPress-style editor in the dashboard (Blog → Posts): title, permalink
  (slug set from the title on first save, then stable), rich text body
  (`type: 'html'` — sanitised by `server/sanitize.js` on save and render),
  featured image, excerpt, tags, SEO title/description, draft/publish,
  preview (`POST /api/admin/preview`). Drafts 404 publicly and are never
  sent to the browser (`/api/content` and `window.__CMS__` only carry
  home-page keys — `shellValues()` in server/cms.js).
- `server/sanitize.js` is a dependency-free allowlist sanitizer. Do NOT
  add `sanitize-html` (its ESM-only htmlparser2 crashes the Vercel function
  at startup — it took astromotions.com down for ~6 minutes on 2026-09-18;
  fixed by `vercel rollback`, then a new build + `vercel promote`). The same
  file lives in the Apex repo — keep them identical.
- Portfolio reuses the home page's `work.items` (same `lists.work` card);
  the Contact page form reuses the `contact.*` labels. Team shows role
  cards (no names/photos by default — the owner removed people from Astro
  on 2026-09-13; they can add members with photos in Pages → Team).
- Socials: `social.links` list (Brand, menu & socials) → icons in the home
  and page footers, the phone menus and the contact page. Empty until the
  owner adds URLs.
- `vercel.json` rewrites every non-static path to the function
  (`/(.*)` → `/api/index`; Vercel serves real files first).
- Vite dev proxies the page routes to the API server (`npm run dev:all`).
  The API server reads `dist/shell.html` for defaults — run `npm run build`
  after editing index.html or the content pages show stale defaults.

## Conventions (the "Signal" system)

- Tokens (in both `src/style.css` and `public/pages/pages.css`):
  `--paper #eeece6` ground, `--paper-2 #e4e1d8`, `--ink #0d0d12`,
  `--cobalt #2b3bff` (the brand colour), `--lime #d4ff3f` (signal — only on
  ink or cobalt, never as text on paper), `--mute #66645e`.
- Type: Unbounded (display: 500 headings, 600–700 wordmarks, tight
  negative tracking) + Instrument Sans (text). No serif, no mono.
- Section label = cobalt index chip (`.label-n`, Unbounded 10.5px) + a plain
  word; on ink/cobalt the chip turns lime. No ✦, no tracked caps.
- Square corners everywhere. Buttons (`.btn`) are solid blocks with a
  square arrow "key" (`.btn-ico`) that turns −45° on hover while an ink
  (or white, for lime) fill wipes up: `btn-solid` cobalt, `btn-lime`,
  `btn-line` outline. Every `<button>` resets `appearance`/`background`.
- Rhythm: a 20% label column + content (`minmax(170px, 20%) 1fr`) on
  section heads, manifesto rows, service rows, prose and posts.
- Motion is opt-in: `html.js` gates hidden initial states, reduced motion
  disables smoothing, marquee, reveals and the planet's auto-spin.
- The mark: a cobalt planet cut by its ring (front arc masks the disc,
  back arc hidden behind it). Masks → unique ids per inline copy.
- Verify visually before shipping: headless Chrome (puppeteer-core +
  `C:\Program Files\Google\Chrome\Application\chrome.exe`), screenshot the
  home page desktop + 390px, every content-page template, the drawer, the
  phone menus and the dropdown; check console errors.

## Accounts / deployment (IMPORTANT)

- GitHub: https://github.com/Taha-A-Hashmi/astro-motions — owner is
  Taha-A-Hashmi (taha.a.hashmi@gmail.com). NEVER use or reference the
  knwn4official account or email anywhere in this project.
- Vercel: project `astro-motions` (renamed from astra-motions; team
  taha-a-hashmis-projects), connected to the GitHub repo, so every push to
  `main` deploys production; other branches get preview URLs.
  **Live domain: https://www.astromotions.com/** (owner-bought; apex
  308-redirects to www). Also astro-motions.vercel.app. Canonical/OG URLs
  in index.html point at www.astromotions.com.
- Brand assets: `branding/` (logo-mark, -horizontal, -stacked, on-dark and
  white variants; SVG masters with the wordmark outlined to paths + PNG
  exports), `public/favicon.svg|ico|-16|-32|-96.png`, `apple-touch-icon`,
  `icon-192/512` (white mark on a cobalt tile) and `og-image.jpg` (the
  hero poster with an SVG halftone planet). All generated together by the
  scratchpad `build-brand.mjs` pattern: opentype.js outlines Unbounded
  SemiBold "astro motions" at −0.03em, puppeteer rasterises, a tiny
  PNG-in-ICO writer makes favicon.ico. Regenerate all of them if the mark
  changes.
