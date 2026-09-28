/* ═══════════════════════════════════════════════════════════════════════
   server/pages.js — the server-rendered content pages: one page per
   service, Portfolio, Contact, the blog (index, posts, RSS), the HTML and
   XML sitemaps, /llms.txt and the styled 404. (The Services hub and the
   Team page were retired on 2026-09-28 — see LEGACY_REDIRECTS.)

   Pages are plain HTML (no WebGL) so they are fast on phones and fully
   readable by search engines. Their copy comes from the dashboard: saved
   values first, then the defaults in cms/pages.js. Layout and chrome come
   from `site` in cms/schema.js; the look is public/pages/pages.css.

   Astro's markup diverged from the Apex copy of this file in the 2026-09
   redesign (editorial grid, cobalt/lime, square blocks). The data plumbing
   — getCtx, publishedPosts, sitemap, feed, the router — is still the same
   shape as Apex's, so structural fixes can be carried across by hand.
   ═══════════════════════════════════════════════════════════════════════ */
import express from 'express';
import fs from 'node:fs';
import { site, sections, fields } from '../cms/schema.js';
import { esc, multiline, lists } from '../cms/templates.js';
import { cleanHtml, textOf } from './sanitize.js';
import { loadContent } from './content.js';
import { readShell, readDefaults } from './cms.js';
import { countryOptions } from '../cms/countries.js';

const VERSION = (process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())).slice(0, 8);
const ORIGIN = site.url.replace(/\/$/, '');

// The content pages' 3D (src/gl/pages.js). Built to a fixed name; in Vite
// dev (no build yet) the source is served through the dev server's proxy.
const GL_SRC =
  process.env.VERCEL || fs.existsSync('dist/assets/pages-gl.js') ? `/assets/pages-gl.js?v=${VERSION}` : '/src/gl/pages.js';

// Which dot shape each page's hero settles into (src/gl/dots.js shapes).
const SHAPES = {
  'web-design': 'browser',
  'organic-seo': 'helix',
  'ppc-marketing': 'bars',
  'social-media-marketing': 'network',
  portfolio: 'galaxy',
  sitemap: 'cube',
  contact: 'sphere',
  blog: 'galaxy',
  post: 'sphere',
  404: 'dust',
};
const glShape = (name, cls = 'phero-gl') => `<div class="${cls}" data-gl="shape" data-shape="${name}" aria-hidden="true"></div>`;

export const pageSections = sections.filter((s) => s.page);
const byPath = new Map(pageSections.map((s) => [s.page.path, s]));
const serviceSections = pageSections.filter((s) => s.page.template === 'service');
const blogSection = pageSections.find((s) => s.page.template === 'blog');

/* ── Small helpers ──────────────────────────────────────────────────── */
const abs = (u) => {
  const s = String(u || '');
  if (/^https?:\/\//i.test(s)) return s;
  return ORIGIN + (s.startsWith('/') ? s : `/${s}`);
};
const pad = (n) => String(n).padStart(2, '0');
const ldScript = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const arr = (v) => (Array.isArray(v) ? v : []);
const fmtDate = (d) => {
  const date = new Date(`${d}T12:00:00Z`);
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};
const readingTime = (html) => Math.max(1, Math.round(textOf(html).split(' ').filter(Boolean).length / 220));
const tagList = (tags) =>
  String(tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

/* ── Content context: saved value → schema default → shell default ── */
let shellDefaults = null;
async function getCtx() {
  let values = {};
  try {
    values = await loadContent();
  } catch (err) {
    console.error('[pages] content load failed, using defaults:', err.message);
  }
  if (!shellDefaults) {
    const shell = await readShell();
    if (shell) shellDefaults = readDefaults(shell);
  }
  const defaults = shellDefaults || {};
  const get = (key) => {
    const v = values[key];
    if (v !== undefined && v !== '') return v;
    if (defaults[key] !== undefined && defaults[key] !== '') return defaults[key];
    return fields[key]?.default ?? '';
  };
  const brand = get('brand.name') || site.name;
  const wordmark = get('brand.wordmark') || brand;
  return { get, brand, wordmark };
}
const pv = (ctx, sec) => (k) => ctx.get(`${sec.prefix}.${k}`);

const serviceLinks = (ctx) =>
  serviceSections.map((s) => ({
    href: s.page.path,
    name: ctx.get(`${s.prefix}.name`),
    summary: ctx.get(`${s.prefix}.summary`),
  }));

export function publishedPosts(ctx) {
  return arr(ctx.get('blog.posts'))
    .filter((p) => p && p.status === 'published' && p.slug)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.updated || '').localeCompare(String(a.updated || '')));
}

/* ── Atoms ──────────────────────────────────────────────────────────── */
const ico = (glyph) => `<i class="btn-ico" aria-hidden="true">${glyph}</i>`;
const btn = (label, href, kind = 'solid', glyph = '→', extra = '') =>
  `<a class="btn btn-${kind}${extra}" href="${esc(href)}"><span>${esc(label)}</span>${ico(glyph)}</a>`;
const ctaButton = (label, href = site.cta.href, kind = 'solid') => btn(label, href, kind);
const label = (n, text, light = false) =>
  `<p class="label${light ? ' label--light' : ''}"><span class="label-n">${esc(n)}</span><span>${esc(text)}</span></p>`;

/* ── Chrome ─────────────────────────────────────────────────────────── */
function header(ctx, current) {
  const svc = serviceLinks(ctx);
  const items = site.nav
    .map((n) => {
      const text = (n.key && ctx.get(n.key)) || n.label;
      const exact = current === n.href;
      const within =
        (n.services && svc.some((s) => s.href === current)) || (n.href === '/blog/' && current.startsWith('/blog/') && !exact);
      const attrs = exact ? ' aria-current="page"' : within ? ' class="is-active"' : '';
      if (!n.services) return `<li><a href="${esc(n.href)}"${attrs}>${esc(text)}</a></li>`;
      return `<li class="has-sub"><a href="${esc(n.href)}"${attrs}>${esc(text)}</a><button class="sub-toggle" type="button" aria-expanded="false" aria-label="Show ${esc(text)}"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button><div class="sub"><ul>${svc
        .map(
          (s, i) =>
            `<li><a href="${s.href}"${current === s.href ? ' aria-current="page"' : ''}><span class="sub-n">${pad(i + 1)}</span><span class="sub-name">${esc(s.name)}</span><span class="sub-sum">${esc(s.summary)}</span></a></li>`
        )
        .join('')}</ul></div></li>`;
    })
    .join('');
  return `<header class="hd">
  <a class="hd-brand" href="/" aria-label="${esc(ctx.brand)} — home">${site.mark('hd')}<span class="hd-word">${esc(ctx.wordmark)}</span></a>
  <nav class="hd-nav" aria-label="Main"><ul>${items}</ul></nav>
  ${btn(ctx.get(site.cta.key) || site.cta.label, site.cta.href, 'solid', '→', ' hd-cta')}
  <button class="hd-menu" type="button" aria-expanded="false" aria-controls="pm"><span class="hd-menu-label">Menu</span><i aria-hidden="true"></i></button>
</header>`;
}

function mobileMenu(ctx, current) {
  const svc = serviceLinks(ctx);
  const socials = lists.socials(ctx.get('social.links'));
  let n = 0;
  const link = (href, text, sub = '') =>
    `<li><a href="${esc(href)}"${current === href ? ' aria-current="page"' : ''}><span class="menu-n">${pad(++n)}</span><span>${esc(text)}</span></a>${sub}</li>`;
  const homeItem = link('/', site.homeLink.menuLabel || 'Home');
  const items = site.nav
    .map((item) => {
      const text = (item.key && ctx.get(item.key)) || item.label;
      const sub = item.services
        ? `<ul class="menu-sub">${svc.map((s) => `<li><a href="${s.href}"${current === s.href ? ' aria-current="page"' : ''}>${esc(s.name)}</a></li>`).join('')}</ul>`
        : '';
      return link(item.href, text, sub);
    })
    .join('');
  return `<div class="menu" id="pm" hidden>
  <nav aria-label="Menu"><ul class="menu-nav">${homeItem}${items}${link('/contact/', 'Contact')}</ul></nav>
  <div class="menu-foot">
    ${btn(ctx.get(site.cta.key) || site.cta.label, site.cta.href, 'lime')}
    ${socials ? `<div class="social-links">${socials}</div>` : ''}
  </div>
</div>`;
}

function footer(ctx) {
  const svc = serviceLinks(ctx);
  const socials = lists.socials(ctx.get('social.links'));
  const copyright = ctx.get('footer.copyright') || `© ${new Date().getFullYear()} ${ctx.brand}`;
  const studio = site.footerStudio
    .map((l) => `<li><a href="${esc(l.href)}">${esc((l.key && ctx.get(l.key)) || l.label)}</a></li>`)
    .join('');
  return `<aside class="reviews" aria-label="Reviews">
  <div class="wrap reviews-in">
    <p class="reviews-text">Launched something with us? Tell others how it went.</p>
    <div class="reviews-widget">
      <!-- TrustBox widget - Review Collector -->
      <div class="trustpilot-widget" data-locale="en-US" data-template-id="56278e9abfbbba0bdcd568bc" data-businessunit-id="6ab1b1954865ce6dfe8fb174" data-style-height="52px" data-style-width="100%" data-token="3c274bce-4945-47eb-89a2-6b71b47095ef">
        <a href="https://www.trustpilot.com/review/astromotions.com" target="_blank" rel="noopener">Trustpilot</a>
      </div>
      <!-- End TrustBox widget -->
    </div>
  </div>
</aside>
<footer class="ft">
  <div class="wrap ft-cols">
    <div class="ft-brand">
      <p class="ft-tag">${esc(ctx.get('hero.tagline') || site.tagline)}</p>
      <p class="ft-about">${multiline(ctx.get('footer.about') || site.about)}</p>
      ${socials ? `<div class="social-links">${socials}</div>` : ''}
    </div>
    <nav class="ft-col" aria-label="Services"><h2>${esc(ctx.get('nav.services') || 'Services')}</h2><ul>${svc
      .map((s) => `<li><a href="${s.href}">${esc(s.name)}</a></li>`)
      .join('')}</ul></nav>
    <nav class="ft-col" aria-label="Company"><h2>Company</h2><ul>${studio}</ul></nav>
    <div class="ft-col ft-contact"><h2>Contact</h2><ul><li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li><li class="ft-note">${esc(ctx.get('footer.response') || site.response)}</li><li><a href="/contact/">Start a project →</a></li></ul></div>
  </div>
  <p class="ft-giant" aria-hidden="true"><span>${esc(ctx.brand)}</span></p>
  <div class="wrap ft-bottom"><p class="ft-legal"><span>${esc(copyright)}</span> <span class="ft-legal-sep" aria-hidden="true">·</span> <span>${esc(ctx.get('footer.legal') || site.legal)}</span></p><a href="#top" class="to-top">${esc(ctx.get('footer.top') || 'Back to top ↑')}</a></div>
</footer>`;
}

/* ── Structured data shared by every page ───────────────────────────── */
const ORG_ID = `${ORIGIN}/#organization`;
const WEBSITE_ID = `${ORIGIN}/#website`;
const orgRef = (ctx) => ({ '@type': 'Organization', '@id': ORG_ID, name: ctx.brand, url: site.url });

export const sameAsOf = (links) =>
  arr(links)
    .map((s) => String(s?.url || '').trim())
    .filter((u) => /^https?:\/\//i.test(u));

function organizationLd(ctx) {
  const sameAs = sameAsOf(ctx.get('social.links'));
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: ctx.brand,
    url: site.url,
    logo: { '@type': 'ImageObject', url: abs(site.logoLarge || site.logo) },
    image: abs(ctx.get('seo.ogImage') || site.ogImage),
    description: ctx.get('seo.orgDescription') || ctx.get('footer.about') || site.about,
    email: site.email,
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'sales', email: site.email, url: abs('/contact/'), availableLanguage: ['English'], areaServed: 'Worldwide' },
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };
}

const websiteLd = (ctx) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: site.url,
  name: ctx.brand,
  inLanguage: 'en',
  publisher: { '@id': ORG_ID },
});

export function layout(ctx, page) {
  const canonical = abs(page.path);
  const ogImage = abs(page.ogImage || ctx.get('seo.ogImage') || site.ogImage);
  const robots = page.noindex ? 'noindex, nofollow' : ctx.get('seo.robots') || 'index, follow';
  const headCode = String(ctx.get('seo.headHtml') || '').trim();
  const ld = [organizationLd(ctx), websiteLd(ctx), ...(page.jsonld || [])];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}" />
<meta name="robots" content="${esc(robots)}" />
<link rel="canonical" href="${esc(canonical)}" />
<meta name="theme-color" content="${esc(site.themeColor)}" />
<meta property="og:type" content="${page.ogType || 'website'}" />
<meta property="og:site_name" content="${esc(ctx.brand)}" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:title" content="${esc(page.title)}" />
<meta property="og:description" content="${esc(page.description)}" />
<meta property="og:image" content="${esc(ogImage)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(page.title)}" />
<meta name="twitter:description" content="${esc(page.description)}" />
<meta name="twitter:image" content="${esc(ogImage)}" />
${page.extraHead || ''}
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="alternate" type="application/rss+xml" title="${esc(ctx.brand)} — Blog" href="/blog/feed.xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="${esc(site.fontsHref)}" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="${esc(site.fontsHref)}" /></noscript>
<link rel="stylesheet" href="/pages/pages.css?v=${VERSION}" />
<!-- the Trustpilot TrustBox script is added by pages.js when the reviews strip nears -->
<script>document.documentElement.classList.add('js')</script>
${ld.map(ldScript).join('\n')}
${headCode ? `<!-- custom head code (dashboard) -->\n${headCode}` : ''}
</head>
<body class="pg ${page.bodyClass || ''}" id="top">
<a class="skip" href="#main">Skip to content</a>
${page.banner || ''}
${header(ctx, page.path)}
<main id="main">
${page.body}
</main>
${footer(ctx)}
${mobileMenu(ctx, page.path)}
<script src="/pages/pages.js?v=${VERSION}" defer></script>
<script type="module" src="${GL_SRC}"></script>
</body>
</html>`;
}

/* ── Building blocks ────────────────────────────────────────────────── */
function crumbs(trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail
    .map((c, i) =>
      i === trail.length - 1 ? `<li aria-current="page">${esc(c.label)}</li>` : `<li><a href="${esc(c.href)}">${esc(c.label)}</a></li>`
    )
    .join('')}</ol></nav>`;
}
const crumbsLd = (trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: abs(c.href) })),
});

/* The page hero: crumbs, an index chip, a huge H1 across the grid, then
   the lede and actions offset to the right column. `n` is the chip text
   (a service's number, "Blog", …); `planet` adds the halftone sticker. */
function hero({ trail, n = '→', eyebrow, h1, lede, actions = '', shape = 'sphere', className = '' }) {
  return `<section class="phero ${className}">
  ${shape ? glShape(shape) : ''}
  <div class="wrap">
    <div class="phero-top">${trail ? crumbs(trail) : '<span></span>'}</div>
    ${eyebrow ? label(n, eyebrow) : ''}
    <h1 class="phero-h1">${esc(h1)}</h1>
    ${lede || actions ? `<div class="phero-foot">${lede ? `<p class="lede">${multiline(lede)}</p>` : '<span></span>'}${actions ? `<div class="actions">${actions}</div>` : ''}</div>` : ''}
  </div>
</section>`;
}

function secHead(n, title, extra = '') {
  return `<div class="sec-head">${label(n, title.label || '')}<h2 class="h-sec">${esc(title.text)}</h2>${extra}</div>`;
}

function ctaBand(title, text, labelText) {
  if (!title && !text) return '';
  return `<section class="launch">
  <div class="launch-gl" data-gl="warp" aria-hidden="true"></div>
  <div class="wrap launch-in">
    ${title ? `<h2 class="launch-line">${esc(title)}</h2>` : ''}
    ${text ? `<p class="launch-text">${multiline(text)}</p>` : ''}
    ${btn(labelText || site.cta.label, site.cta.href, 'lime', '→', ' btn-xl')}
  </div>
</section>`;
}

function prose(html, heading = 'In depth') {
  const clean = cleanHtml(html);
  if (!clean) return '';
  return `<section class="band longform"><div class="wrap longform-in">
  <div class="longform-side">${label('§', heading)}</div>
  <div class="prose">${clean}</div>
</div></section>`;
}

const serviceRows = (svc, current = '') => `<ol class="svc-rows">${svc
  .map(
    (s) => `<li><a class="svc-row" href="${s.href}"${current === s.href ? ' aria-current="page"' : ''}>
    <span class="svc-n">${pad(s.i)}</span>
    <span class="svc-name">${esc(s.name)}</span>
    <span class="svc-sum">${esc(s.summary)}</span>
    <span class="svc-go" aria-hidden="true">↗</span>
  </a></li>`
  )
  .join('')}</ol>`;

const home = { label: 'Home', href: '/' };

/* ── Templates ──────────────────────────────────────────────────────── */
const templates = {
  service(sec, ctx) {
    const P = pv(ctx, sec);
    const name = P('name');
    const features = arr(P('features'));
    const steps = arr(P('process'));
    const faqs = arr(P('faqs')).filter((q) => q && q.q);
    const trail = [home, { label: name, href: sec.page.path }];
    const all = serviceLinks(ctx).map((s, i) => ({ ...s, i: i + 1 }));
    const me = all.find((s) => s.href === sec.page.path);
    const others = all.filter((s) => s.href !== sec.page.path);
    const body = `
${hero({
  trail,
  shape: SHAPES[sec.page.path.replace(/\//g, '')] || 'sphere',
  n: pad(me?.i || 1),
  eyebrow: P('eyebrow'),
  h1: P('h1'),
  lede: P('lede'),
  actions: `${ctaButton(P('ctaLabel') || site.cta.label)}${features.length ? btn(P('featuresTitle'), '#included', 'line', '↓') : ''}`,
})}
${
  features.length
    ? `<section class="band" id="included"><div class="wrap">
  ${secHead('A', { label: name, text: P('featuresTitle') })}
  <ol class="deliver">${features
    .map((f, i) => `<li class="deliver-item"><span class="deliver-n">${pad(i + 1)}</span><h3>${esc(f.title)}</h3><p>${multiline(f.text)}</p></li>`)
    .join('')}</ol>
</div></section>`
    : ''
}
${
  steps.length
    ? `<section class="band band-ink"><div class="wrap">
  ${secHead('B', { label: 'Process', text: P('processTitle') })}
  <ol class="steps">${steps
    .map((s, i) => `<li class="step"><span class="step-n">${pad(i + 1)}</span><h3 class="step-title">${esc(s.title)}</h3><p class="step-text">${multiline(s.text)}</p></li>`)
    .join('')}</ol>
</div></section>`
    : ''
}
${prose(P('body'))}
${
  faqs.length
    ? `<section class="band" id="faq"><div class="wrap faq-in">
  <div class="faq-side">${label('?', 'FAQ')}<h2 class="h-sec h-sec--sm">${esc(P('faqTitle'))}</h2></div>
  <div class="faqs">${faqs
    .map(
      (q) =>
        `<details class="faq"><summary><span>${esc(q.q)}</span><span class="faq-icon" aria-hidden="true"></span></summary><div class="faq-a"><p>${multiline(q.a)}</p></div></details>`
    )
    .join('')}</div>
</div></section>`
    : ''
}
${
  others.length
    ? `<section class="band band-soft"><div class="wrap">
  ${secHead('+', { label: ctx.get('nav.services') || 'Services', text: 'Other services' })}
  ${serviceRows(others)}
</div></section>`
    : ''
}
${ctaBand(P('ctaTitle'), P('ctaText'), P('ctaLabel'))}`;
    const jsonld = [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        serviceType: name,
        description: P('metaDescription'),
        url: abs(sec.page.path),
        provider: orgRef(ctx),
        areaServed: 'Worldwide',
        ...(features.length
          ? {
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: P('featuresTitle') || name,
                itemListElement: features.map((f) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: f.title, description: f.text } })),
              },
            }
          : {}),
      },
      crumbsLd(trail),
    ];
    if (faqs.length) {
      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
      });
    }
    return { title: P('seoTitle'), description: P('metaDescription'), ogImage: P('ogImage'), body, jsonld, bodyClass: 'pg-service' };
  },

  portfolio(sec, ctx) {
    const P = pv(ctx, sec);
    const trail = [home, { label: ctx.get('nav.portfolio') || 'Portfolio', href: sec.page.path }];
    const items = arr(ctx.get('work.items')).filter((it) => it && it.title);
    const body = `
${hero({ trail, shape: SHAPES.portfolio, n: pad(items.length), eyebrow: P('eyebrow'), h1: P('h1'), lede: P('lede') })}
<section class="band band-ink"><div class="wrap">
  ${secHead(pad(items.length), { label: ctx.get('work.eyebrow') || 'Launch log', text: String(ctx.get('work.title') || 'Selected launches').replace(/\*/g, '') })}
  <div class="work-grid">${lists.work(items)}</div>
</div></section>
${prose(P('body'), 'About the work')}
${ctaBand(P('ctaTitle'), P('ctaText'), P('ctaLabel'))}`;
    const jsonld = [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: P('h1'),
        description: P('metaDescription'),
        url: abs(sec.page.path),
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORG_ID },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'CreativeWork',
              name: it.title,
              ...(it.description ? { description: it.description } : {}),
              ...(/^https?:\/\//i.test(String(it.href || '')) ? { url: it.href } : {}),
              ...(it.image ? { image: abs(it.image) } : {}),
            },
          })),
        },
      },
      crumbsLd(trail),
    ];
    return { title: P('seoTitle'), description: P('metaDescription'), ogImage: P('ogImage'), body, jsonld, bodyClass: 'pg-portfolio' };
  },

  contact(sec, ctx) {
    const P = pv(ctx, sec);
    const trail = [home, { label: 'Contact', href: sec.page.path }];
    const socials = lists.socials(ctx.get('social.links'));
    const email = String(P('email') || site.email || '').trim();
    const response = P('responseLine') || ctx.get('footer.response') || site.response;
    const L = (k, fb) => ctx.get(`contact.${k}`) || fb;
    const body = `
<section class="contact-page">
  <div class="contact-side">
    <div class="contact-side-in">
      ${crumbs(trail)}
      ${label('→', P('eyebrow'), true)}
      <h1 class="contact-h1">${esc(P('h1'))}</h1>
      <p class="lede">${multiline(P('lede'))}</p>
      <ul class="facts">
        ${email ? `<li><span class="fact-k">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></li>` : ''}
        ${response ? `<li><span class="fact-k">Response</span><span>${esc(response)}</span></li>` : ''}
        <li><span class="fact-k">Studio</span><span>Independent studio · clients worldwide</span></li>
      </ul>
      ${socials ? `<div class="social-links">${socials}</div>` : ''}
      ${glShape(SHAPES.contact, 'contact-gl')}
    </div>
  </div>
  <div class="contact-main">
    <h2 class="contact-form-title">${esc(P('formTitle'))}</h2>
    <form class="cform" data-contact novalidate>
      <div class="field-row">
        <label class="field"><span>${esc(L('firstNameLabel', 'First name'))}</span><input name="firstName" type="text" autocomplete="given-name" placeholder="First name" required /><em class="err" data-for="firstName">Please enter your first name</em></label>
        <label class="field"><span>${esc(L('lastNameLabel', 'Last name'))}</span><input name="lastName" type="text" autocomplete="family-name" placeholder="Last name" required /><em class="err" data-for="lastName">Please enter your last name</em></label>
      </div>
      <label class="field"><span>${esc(L('emailLabel', 'Email'))}</span><input name="email" type="email" autocomplete="email" placeholder="you@company.com" required /><em class="err" data-for="email">Enter a valid email address</em></label>
      <div class="field-row">
        <label class="field"><span>${esc(L('countryLabel', 'Country'))}</span><select name="country" autocomplete="country-name" required>${countryOptions()}</select><em class="err" data-for="country">Please choose your country</em></label>
        <label class="field"><span>${esc(L('phoneLabel', 'Phone'))}</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+1 555 000 0000" required /><em class="err" data-for="phone">Enter a valid phone number</em></label>
      </div>
      <label class="field"><span>${esc(L('messageLabel', 'Description'))}</span><textarea name="message" rows="5" minlength="10" placeholder="What it is, who it's for, and when it needs to fly." required></textarea><em class="err" data-for="message">Please write at least 10 characters</em></label>
      <label class="hp" aria-hidden="true">Company<input name="company" type="text" tabindex="-1" autocomplete="off" /></label>
      <div class="form-actions"><button class="btn btn-solid" type="submit"><span>${esc(L('submit', 'Send'))}</span>${ico('↑')}</button><p class="form-status" role="status"></p></div>
    </form>
    <div class="form-done" hidden role="status"><span class="done-mark" aria-hidden="true"></span><h3>${esc(L('doneTitle', 'Received.'))}</h3><p>${multiline(L('doneText', 'We will reply soon.'))}</p></div>
  </div>
</section>`;
    const jsonld = [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: P('h1'),
        description: P('metaDescription'),
        url: abs(sec.page.path),
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: {
          '@type': 'Organization',
          '@id': ORG_ID,
          name: ctx.brand,
          url: site.url,
          ...(email ? { email } : {}),
          contactPoint: { '@type': 'ContactPoint', contactType: 'sales', ...(email ? { email } : {}), url: abs(sec.page.path), areaServed: 'Worldwide' },
        },
      },
      crumbsLd(trail),
    ];
    return { title: P('seoTitle'), description: P('metaDescription'), ogImage: P('ogImage'), body, jsonld, bodyClass: 'pg-contact' };
  },

  blog(sec, ctx) {
    const P = pv(ctx, sec);
    const trail = [home, { label: ctx.get('nav.blog') || 'Blog', href: sec.page.path }];
    const posts = publishedPosts(ctx);
    const body = `
${hero({ trail, shape: SHAPES.blog, n: pad(posts.length), eyebrow: P('eyebrow'), h1: P('h1'), lede: P('lede') })}
<section class="band band-tight"><div class="wrap">${
      posts.length
        ? `<div class="posts">${posts.map((p, i) => postCard(p, i, i === 0)).join('')}</div>`
        : `<p class="empty">${esc(P('emptyText'))}</p>`
    }</div></section>
${ctaBand(P('ctaTitle'), P('ctaText'), P('ctaLabel'))}`;
    const jsonld = [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: P('h1'),
        url: abs(sec.page.path),
        blogPost: posts.slice(0, 20).map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(`/blog/${p.slug}/`), datePublished: p.date })),
      },
      crumbsLd(trail),
    ];
    return { title: P('seoTitle'), description: P('metaDescription'), ogImage: P('ogImage'), body, jsonld, bodyClass: 'pg-blog' };
  },
};

function postCard(p, i = 0, featured = false) {
  return `<article class="post-card${featured ? ' post-card--featured' : ''}">
  <a href="/blog/${esc(p.slug)}/">
    <div class="pc-media">${
      p.cover
        ? `<img src="${esc(p.cover)}" alt="${esc(p.coverAlt || p.title)}" loading="lazy" decoding="async" />`
        : `<span class="halftone halftone--${(i % 4) + 1}" aria-hidden="true"></span>`
    }</div>
    <div class="pc-body">
      <p class="pc-meta"><time datetime="${esc(p.date)}">${esc(fmtDate(p.date))}</time><span aria-hidden="true">·</span>${readingTime(p.body)} min read</p>
      <h2 class="pc-title">${esc(p.title)}</h2>
      ${p.excerpt ? `<p class="pc-excerpt">${esc(p.excerpt)}</p>` : ''}
      <span class="link-go">Read <i aria-hidden="true">→</i></span>
    </div>
  </a>
</article>`;
}

/* ── A single post ──────────────────────────────────────────────────── */
/* The author credited on every post (Blog page → Post author). Astro has
   no named people by default, so an empty name credits the studio. */
const STUDIO_BIO =
  'Written by the Astro Motions studio team — the designers, developers and marketers who build and grow websites for our clients. Every article is reviewed before publishing and updated when the advice changes.';
function postAuthor(ctx, B) {
  const name = String(B('authorName') || '').trim();
  const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '');
  if (name) {
    return { person: true, name, role: B('authorRole'), bio: B('authorBio'), photo: B('authorPhoto'), url: safeUrl(B('authorUrl')) };
  }
  return { person: false, name: `${ctx.brand} Studio`, role: 'Editorial team', bio: B('authorBio') || STUDIO_BIO, photo: B('authorPhoto'), url: '' };
}
function authorBox(a, dates) {
  const name = a.url ? `<a href="${esc(a.url)}" rel="author">${esc(a.name)}</a>` : esc(a.name);
  return `<aside class="wrap author-box" aria-label="About the author">
    <div class="author-photo">${
      a.photo ? `<img src="${esc(a.photo)}" alt="${esc(a.name)}" width="240" height="240" loading="lazy" decoding="async" />` : `<span class="author-mark">${site.mark('author')}</span>`
    }</div>
    <div class="author-body">
      ${label('✎', 'Written by')}
      <p class="author-name">${name}</p>
      ${a.role ? `<p class="author-role">${esc(a.role)}</p>` : ''}
      ${a.bio ? `<p class="author-bio">${multiline(a.bio)}</p>` : ''}
      <p class="author-dates">${dates}</p>
    </div>
  </aside>`;
}

export function postPage(ctx, post, { preview = false } = {}) {
  const path = `/blog/${post.slug}/`;
  const B = blogSection ? pv(ctx, blogSection) : () => '';
  const trail = [home, { label: ctx.get('nav.blog') || 'Blog', href: '/blog/' }, { label: post.title, href: path }];
  const tags = tagList(post.tags);
  const body = cleanHtml(post.body);
  const description = post.metaDescription || post.excerpt || textOf(body).slice(0, 155);
  const more = publishedPosts(ctx)
    .filter((p) => p.id !== post.id)
    .slice(0, 3);
  const author = postAuthor(ctx, B);
  const published = String(post.date || '').slice(0, 10);
  const updated = String(post.updated || post.date || '').slice(0, 10);
  const dates = `<span>Published <time datetime="${esc(published)}">${esc(fmtDate(published))}</time></span><span aria-hidden="true">·</span><span>Updated <time datetime="${esc(updated)}">${esc(fmtDate(updated))}</time></span>`;
  const html = `
<article class="post">
  <header class="post-head"><div class="wrap">
    <div class="phero-top">${crumbs(trail)}</div>
    ${tags.length ? label('#', tags.join(' · ')) : ''}
    <h1 class="post-title">${esc(post.title)}</h1>
    <p class="post-meta"><span>By ${author.url ? `<a href="${esc(author.url)}" rel="author">${esc(author.name)}</a>` : esc(author.name)}</span><span aria-hidden="true">·</span>${dates}<span aria-hidden="true">·</span><span>${readingTime(body)} min read</span></p>
  </div></header>
  ${post.cover ? `<figure class="post-cover wrap"><img src="${esc(post.cover)}" alt="${esc(post.coverAlt || post.title)}" fetchpriority="high" decoding="async" /></figure>` : ''}
  <div class="wrap post-grid">
    <aside class="post-aside" aria-hidden="true">${glShape(SHAPES.post, 'post-gl')}</aside>
    <div class="prose post-body">${body}</div>
  </div>
  ${authorBox(author, dates)}
  <footer class="wrap post-foot">
    ${tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '<span></span>'}
    ${btn('All posts', '/blog/', 'line', '←')}
  </footer>
</article>
${
  more.length
    ? `<section class="band band-soft"><div class="wrap">
  ${secHead('+', { label: ctx.get('nav.blog') || 'Blog', text: B('moreTitle') || 'More posts' }, `<a class="link-go" href="/blog/">All posts <i aria-hidden="true">→</i></a>`)}
  <div class="posts posts--3">${more.map((p, i) => postCard(p, i + 1)).join('')}</div>
</div></section>`
    : ''
}
${ctaBand(B('ctaTitle'), B('ctaText'), B('ctaLabel'))}`;
  const image = post.cover ? abs(post.cover) : abs(ctx.get('seo.ogImage') || site.ogImage);
  return {
    path,
    title: post.seoTitle || `${post.title} | ${ctx.brand}`,
    description,
    ogImage: post.cover || '',
    ogType: 'article',
    noindex: preview,
    banner: preview ? '<div class="preview-bar">Preview — this is how the post will look once published. Nothing here is live yet.</div>' : '',
    extraHead: `<meta property="article:published_time" content="${esc(post.date)}" />${
      post.updated ? `\n<meta property="article:modified_time" content="${esc(post.updated)}" />` : ''
    }`,
    body: html,
    bodyClass: 'pg-post',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title.slice(0, 110),
        description,
        image: [image],
        datePublished: post.date,
        dateModified: updated,
        isPartOf: { '@id': WEBSITE_ID },
        inLanguage: 'en',
        author: author.person
          ? {
              '@type': 'Person',
              name: author.name,
              ...(author.role ? { jobTitle: author.role } : {}),
              ...(author.url ? { url: author.url } : {}),
              ...(author.photo ? { image: abs(author.photo) } : {}),
              ...(author.bio ? { description: author.bio } : {}),
              worksFor: { '@id': ORG_ID },
            }
          : { '@type': 'Organization', '@id': ORG_ID, name: ctx.brand, url: site.url },
        publisher: { '@type': 'Organization', '@id': ORG_ID, name: ctx.brand, logo: { '@type': 'ImageObject', url: abs(site.logoLarge || site.logo) } },
        mainEntityOfPage: abs(path),
        ...(tags.length ? { keywords: tags.join(', ') } : {}),
      },
      crumbsLd(trail),
    ],
  };
}

function notFoundPage(ctx, path) {
  const nf = site.notFound || {};
  return {
    path,
    title: `Page not found | ${ctx.brand}`,
    description: '',
    noindex: true,
    bodyClass: 'pg-404',
    body: `<section class="nf">
  ${glShape(SHAPES[404], 'nf-gl')}
  <div class="wrap">
    <p class="nf-code" aria-hidden="true">4<span class="sticker sticker--xl"><i></i></span>4</p>
    ${label('404', 'Lost signal')}
    <h1 class="phero-h1">${esc(nf.h1 || 'This page could not be found.')}</h1>
    <div class="phero-foot"><p class="lede">${esc(nf.lede || 'The link may be old or mistyped. Try one of these instead.')}</p>
    <div class="actions">${btn('Back to home', '/', 'solid', '←')}${btn('Services', '/#services', 'line')}${btn('Sitemap', '/sitemap/', 'line')}${btn('Blog', '/blog/', 'line')}</div></div>
  </div>
</section>`,
  };
}

/* ── Sending ────────────────────────────────────────────────────────── */
function send(res, html, status = 200) {
  res.status(status);
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=300');
  res.send(html);
}

export async function renderNotFound(req, res) {
  const ctx = await getCtx();
  send(res, layout(ctx, notFoundPage(ctx, req.path)), 404);
}

/** Admin preview of an unsaved post (the caller has already cleaned it). */
export async function renderPostPreview(post) {
  const ctx = await getCtx();
  return layout(ctx, postPage(ctx, post, { preview: true }));
}

/* ── The HTML sitemap (/sitemap/) ───────────────────────────────────── */
/* Every public page, grouped, for people (and crawlers that follow links
   rather than read XML). Listed in /sitemap.xml and linked in the footers. */
function mainPages(ctx) {
  const P = (path, key) => {
    const sec = byPath.get(path);
    return sec ? ctx.get(`${sec.prefix}.${key}`) : '';
  };
  return [
    { href: '/', name: 'Home', text: ctx.get('seo.description') || ctx.get('hero.intro') },
    { href: '/portfolio/', name: ctx.get('nav.portfolio') || 'Portfolio', text: P('/portfolio/', 'metaDescription') },
    { href: '/blog/', name: ctx.get('nav.blog') || 'Blog', text: P('/blog/', 'metaDescription') },
    { href: '/contact/', name: 'Contact', text: P('/contact/', 'metaDescription') },
    { href: '/sitemap/', name: 'Sitemap', text: 'Every page on the site, in one list.' },
  ].filter((p) => p.href === '/' || p.href === '/sitemap/' || byPath.has(p.href));
}

function sitemapPage(ctx) {
  const path = '/sitemap/';
  const trail = [home, { label: 'Sitemap', href: path }];
  const svc = serviceLinks(ctx);
  const posts = publishedPosts(ctx);
  const main = mainPages(ctx);
  const h1 = `Sitemap — every page on ${ctx.brand}`;
  const group = (n, title, items) => `<section class="smap-group">
    ${label(n, title)}
    <ul class="smap-list">${items.join('')}</ul>
  </section>`;
  const row = (href, name, text = '', meta = '') =>
    `<li><a class="smap-item" href="${esc(href)}"><span class="smap-name">${esc(name)}</span>${
      meta ? `<span class="smap-meta">${meta}</span>` : ''
    }${text ? `<span class="smap-text">${esc(text)}</span>` : ''}<span class="smap-go" aria-hidden="true">↗</span></a></li>`;
  const body = `
${hero({
  trail,
  shape: SHAPES.sitemap,
  n: pad(main.length + svc.length + posts.length),
  eyebrow: 'Sitemap',
  h1,
  lede: 'All of our pages in one place: the main pages, the four services and every article on the blog.',
})}
<section class="band"><div class="wrap smap">
  ${group('A', 'Main pages', main.map((p) => row(p.href, p.name, p.text)))}
  ${group('B', ctx.get('nav.services') || 'Services', svc.map((s) => row(s.href, s.name, s.summary)))}
  ${group(
    'C',
    'Blog posts',
    posts.length
      ? posts.map((p) => row(`/blog/${p.slug}/`, p.title, p.excerpt, `<time datetime="${esc(p.date)}">${esc(fmtDate(p.date))}</time>`))
      : ['<li class="smap-empty">No posts yet.</li>']
  )}
</div></section>`;
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: h1,
      url: abs(path),
      isPartOf: { '@id': WEBSITE_ID },
      hasPart: [...main, ...svc, ...posts.map((p) => ({ href: `/blog/${p.slug}/`, name: p.title }))]
        .filter((p) => p.href !== path)
        .map((p) => ({ '@type': 'WebPage', name: p.name, url: abs(p.href) })),
    },
    crumbsLd(trail),
  ];
  return {
    path,
    title: `Sitemap — Every Page on ${ctx.brand}`,
    description: `Every page on ${ctx.brand} in one list: web design, organic SEO, PPC and social media marketing services, our portfolio, contact details and every blog post.`,
    body,
    jsonld,
    bodyClass: 'pg-sitemap',
  };
}

/* ── /llms.txt (llmstxt.org): a plain-text map of the site for LLMs ─── */
async function llmsTxt(req, res) {
  const ctx = await getCtx();
  const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const line = (href, name, text) => `- [${clean(name)}](${abs(href)})${clean(text) ? `: ${clean(text)}` : ''}`;
  const main = mainPages(ctx).filter((p) => p.href !== '/');
  const posts = publishedPosts(ctx);
  const summary =
    clean(ctx.get('seo.description')) ||
    `${ctx.brand} is a web design and digital marketing agency: websites, organic SEO, PPC and social media marketing.`;
  const about = clean(ctx.get('footer.about') || site.about);
  const out = [
    `# ${ctx.brand}`,
    '',
    `> ${summary}`,
    '',
    `${about} New projects start through the contact form or by email at ${site.email} (${clean(ctx.get('footer.response') || site.response).toLowerCase()}).`,
    '',
    '## Services',
    '',
    ...serviceLinks(ctx).map((s) => line(s.href, s.name, s.summary)),
    '',
    '## Portfolio & company',
    '',
    line('/', `${ctx.brand} — home`, ctx.get('hero.intro')),
    ...main.map((p) => line(p.href, p.name, p.text)),
    '',
    '## Blog',
    '',
    ...(posts.length ? posts.map((p) => line(`/blog/${p.slug}/`, p.title, p.excerpt || p.metaDescription)) : ['- No posts yet.']),
    '',
    '## Optional',
    '',
    line('/sitemap.xml', 'XML sitemap', 'Every URL with its last-modified date.'),
    line('/blog/feed.xml', 'Blog RSS feed', 'The latest posts in full.'),
    '',
  ];
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=0, s-maxage=300');
  res.send(out.join('\n'));
}

/* ── XML: sitemap + RSS ─────────────────────────────────────────────── */
const xmlEsc = (s) => String(s ?? '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

async function sitemap(req, res) {
  const ctx = await getCtx();
  const urls = [
    { loc: abs('/'), priority: '1.0' },
    ...pageSections.map((s) => ({ loc: abs(s.page.path), priority: s.page.template === 'service' ? '0.9' : '0.7' })),
    { loc: abs('/sitemap/'), priority: '0.3' },
    ...publishedPosts(ctx).map((p) => ({ loc: abs(`/blog/${p.slug}/`), lastmod: String(p.updated || p.date).slice(0, 10), priority: '0.6' })),
  ];
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=0, s-maxage=300');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${xmlEsc(u.loc)}</loc>${u.lastmod ? `<lastmod>${xmlEsc(u.lastmod)}</lastmod>` : ''}<priority>${u.priority}</priority></url>`)
  .join('\n')}
</urlset>
`);
}

async function feed(req, res) {
  const ctx = await getCtx();
  const B = blogSection ? pv(ctx, blogSection) : () => '';
  const posts = publishedPosts(ctx).slice(0, 30);
  res.set('Content-Type', 'application/rss+xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=0, s-maxage=300');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${xmlEsc(`${ctx.brand} — ${B('h1') || 'Blog'}`)}</title>
  <link>${xmlEsc(abs('/blog/'))}</link>
  <description>${xmlEsc(B('metaDescription'))}</description>
  <language>en</language>
  <atom:link href="${xmlEsc(abs('/blog/feed.xml'))}" rel="self" type="application/rss+xml" />
${posts
  .map((p) => {
    const url = abs(`/blog/${p.slug}/`);
    return `  <item>
    <title>${xmlEsc(p.title)}</title>
    <link>${xmlEsc(url)}</link>
    <guid isPermaLink="true">${xmlEsc(url)}</guid>
    <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
    <description>${xmlEsc(p.excerpt || textOf(p.body).slice(0, 200))}</description>
    <content:encoded><![CDATA[${cleanHtml(p.body).replace(/]]>/g, ']]&gt;')}]]></content:encoded>
  </item>`;
  })
  .join('\n')}
</channel>
</rss>
`);
}

/* ── Router ─────────────────────────────────────────────────────────── */
/* Retired and renamed URLs → their new home (301, so links and rankings
   carry over). Keys are matched with and without the trailing slash. */
const LEGACY_REDIRECTS = {
  '/services/': '/#services', // the Services hub (retired 2026-09-28)
  '/team/': '/', // the Team page (retired 2026-09-28)
  '/blog/why-a-beautiful-website-can-still-be-invisible/': '/blog/website-not-showing-on-google/',
};

export function pagesRouter() {
  const r = express.Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

  r.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const to = LEGACY_REDIRECTS[req.path.endsWith('/') ? req.path : `${req.path}/`];
    if (!to) return next();
    const i = req.originalUrl.indexOf('?');
    const qs = i >= 0 ? req.originalUrl.slice(i) : '';
    const [base, hash] = to.split('#');
    res.redirect(301, `${base}${qs}${hash ? `#${hash}` : ''}`);
  });

  // /web-design → /web-design/ (and /blog/x → /blog/x/): one canonical URL
  r.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const p = req.path;
    if (p.endsWith('/') || p.includes('.')) return next();
    if (byPath.has(`${p}/`) || p === '/sitemap' || /^\/blog\/[^/]+$/.test(p)) {
      return res.redirect(301, `${p}/${req.originalUrl.slice(p.length)}`);
    }
    next();
  });

  for (const sec of pageSections) {
    r.get(
      sec.page.path,
      wrap(async (req, res) => {
        const ctx = await getCtx();
        const page = templates[sec.page.template](sec, ctx);
        send(res, layout(ctx, { ...page, path: sec.page.path }));
      })
    );
  }

  r.get('/blog/feed.xml', wrap(feed));
  r.get('/sitemap.xml', wrap(sitemap));
  r.get('/llms.txt', wrap(llmsTxt));
  r.get(
    '/sitemap/',
    wrap(async (req, res) => {
      const ctx = await getCtx();
      send(res, layout(ctx, sitemapPage(ctx)));
    })
  );
  r.get(
    '/blog/:slug/',
    wrap(async (req, res, next) => {
      // /blog/<file>.webp etc. are static files (public/blog/), not posts
      if (req.params.slug.includes('.')) return next();
      const ctx = await getCtx();
      const post = publishedPosts(ctx).find((p) => p.slug === req.params.slug);
      if (!post) return renderNotFound(req, res);
      send(res, layout(ctx, postPage(ctx, post)));
    })
  );
  return r;
}
