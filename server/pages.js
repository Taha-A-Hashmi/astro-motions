/* ═══════════════════════════════════════════════════════════════════════
   server/pages.js — the server-rendered content pages: the Services hub,
   one page per service, the blog (index, posts, RSS), the sitemap, the
   styled 404, and — on sites that define them — Portfolio, Team and
   Contact.

   Pages are plain HTML (no WebGL) so they are fast on phones and fully
   readable by search engines. Their copy comes from the dashboard: saved
   values first, then the defaults in cms/pages.js. Layout and chrome come
   from `site` in cms/schema.js; the look is public/pages/pages.css.
   ═══════════════════════════════════════════════════════════════════════ */
import express from 'express';
import { site, sections, fields } from '../cms/schema.js';
import { esc, multiline, lists, safeHref } from '../cms/templates.js';
import { cleanHtml, textOf } from './sanitize.js';
import { loadContent } from './content.js';
import { readShell, readDefaults } from './cms.js';
import { BUDGETS } from './validate.js';

const VERSION = (process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())).slice(0, 8);
const ORIGIN = site.url.replace(/\/$/, '');

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

/* ── Chrome ─────────────────────────────────────────────────────────── */
const spark = '<span class="spark" aria-hidden="true"></span>';
const ctaButton = (label, href = site.cta.href, extra = '') =>
  `<a class="btn btn-cta${extra}" href="${esc(href)}">${spark}<span>${esc(label)}</span></a>`;

function header(ctx, current) {
  const svc = serviceLinks(ctx);
  const items = site.nav
    .map((n) => {
      const label = (n.key && ctx.get(n.key)) || n.label;
      const exact = current === n.href;
      const within =
        (n.services && svc.some((s) => s.href === current)) || (n.href === '/blog/' && current.startsWith('/blog/') && !exact);
      const attrs = exact ? ' aria-current="page"' : within ? ' class="is-active"' : '';
      if (!n.services) return `<li><a href="${esc(n.href)}"${attrs}>${esc(label)}</a></li>`;
      return `<li class="has-sub"><a href="${esc(n.href)}"${attrs}>${esc(label)}</a><button class="sub-toggle" type="button" aria-expanded="false" aria-label="Show ${esc(label)}"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></button><ul class="sub">${svc
        .map(
          (s) =>
            `<li><a href="${s.href}"${current === s.href ? ' aria-current="page"' : ''}><span class="sub-name">${esc(s.name)}</span><span class="sub-sum">${esc(s.summary)}</span></a></li>`
        )
        .join('')}<li class="sub-all"><a href="/services/">All services <span aria-hidden="true">→</span></a></li></ul></li>`;
    })
    .join('');
  return `<header class="ph">
  <div class="ph-in">
    <a class="brand" href="/" aria-label="${esc(ctx.brand)} — home">${site.mark}<span class="brand-word">${esc(ctx.wordmark)}</span></a>
    <nav class="ph-nav" aria-label="Main"><ul>${items}</ul></nav>
    ${ctaButton(ctx.get(site.cta.key) || site.cta.label, site.cta.href, ' ph-cta')}
    <button class="ph-menu" type="button" aria-expanded="false" aria-controls="pm"><span>Menu</span><i aria-hidden="true"></i></button>
  </div>
</header>`;
}

function mobileMenu(ctx, current) {
  const svc = serviceLinks(ctx);
  const socials = lists.socials(ctx.get('social.links'));
  const items = site.nav
    .map((n) => {
      const label = (n.key && ctx.get(n.key)) || n.label;
      const sub = n.services
        ? `<ul class="pm-sub">${svc.map((s) => `<li><a href="${s.href}"${current === s.href ? ' aria-current="page"' : ''}>${esc(s.name)}</a></li>`).join('')}</ul>`
        : '';
      return `<li><a href="${esc(n.href)}"${current === n.href ? ' aria-current="page"' : ''}>${esc(label)}</a>${sub}</li>`;
    })
    .join('');
  return `<div class="pm" id="pm" hidden>
  <div class="pm-in">
    <nav aria-label="Menu"><ul class="pm-list"><li><a href="/">${esc(site.homeLink.menuLabel || 'Home')}</a></li>${items}</ul></nav>
    ${ctaButton(ctx.get(site.cta.key) || site.cta.label)}
    ${socials ? `<div class="socials">${socials}</div>` : ''}
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
  return `<footer class="pf">
  <div class="wrap pf-in">
    <div class="pf-brand">
      <a class="brand" href="/">${site.mark}<span class="brand-word">${esc(ctx.wordmark)}</span></a>
      <p>${esc(site.tagline)}</p>
      ${socials ? `<div class="socials">${socials}</div>` : ''}
    </div>
    <nav class="pf-col" aria-label="Services"><h2>${esc(ctx.get('nav.services') || 'Services')}</h2><ul>${svc
      .map((s) => `<li><a href="${s.href}">${esc(s.name)}</a></li>`)
      .join('')}<li><a href="/services/">All services</a></li></ul></nav>
    <nav class="pf-col" aria-label="Studio"><h2>Studio</h2><ul>${studio}</ul></nav>
    <div class="pf-col"><h2>Explore</h2><ul><li><a href="${esc(site.homeLink.href)}">${esc(site.homeLink.label)} <span aria-hidden="true">↗</span></a></li><li><a href="/blog/feed.xml">RSS feed</a></li><li><a href="/sitemap.xml">Sitemap</a></li></ul></div>
  </div>
  <div class="wrap pf-bottom"><span>${esc(copyright)}</span><a href="#top" class="pf-top">Back to top <span aria-hidden="true">↑</span></a></div>
</footer>`;
}

function organizationLd(ctx) {
  const sameAs = arr(ctx.get('social.links'))
    .map((s) => String(s?.url || '').trim())
    .filter((u) => /^https?:\/\//i.test(u));
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ctx.brand,
    url: site.url,
    logo: abs(site.logo),
    description: ctx.get('seo.orgDescription') || undefined,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function layout(ctx, page) {
  const canonical = abs(page.path);
  const ogImage = abs(page.ogImage || ctx.get('seo.ogImage') || site.ogImage);
  const robots = page.noindex ? 'noindex, nofollow' : ctx.get('seo.robots') || 'index, follow';
  const headCode = String(ctx.get('seo.headHtml') || '').trim();
  const ld = [organizationLd(ctx), ...(page.jsonld || [])];
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
<link rel="stylesheet" href="${esc(site.fontsHref)}" />
<link rel="stylesheet" href="/pages/pages.css?v=${VERSION}" />
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

function hero({ trail, eyebrow, h1, lede, actions = '', art = true, className = '' }) {
  return `<section class="hero ${className}">
  <div class="wrap hero-in">
    <div class="hero-copy">
      ${trail ? crumbs(trail) : ''}
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
      <h1 class="h1">${esc(h1)}</h1>
      ${lede ? `<p class="lede">${multiline(lede)}</p>` : ''}
      ${actions ? `<div class="actions">${actions}</div>` : ''}
    </div>
    ${art ? `<div class="hero-art" aria-hidden="true">${site.heroArt}</div>` : ''}
  </div>
</section>`;
}

function ctaBand(title, text, label) {
  if (!title && !text) return '';
  return `<section class="cta-band">
  <div class="wrap cta-in">
    ${title ? `<h2 class="h2">${esc(title)}</h2>` : ''}
    ${text ? `<p>${multiline(text)}</p>` : ''}
    ${ctaButton(label || site.cta.label)}
  </div>
</section>`;
}

function prose(html) {
  const clean = cleanHtml(html);
  if (!clean) return '';
  return `<section class="band"><div class="wrap narrow"><div class="prose">${clean}</div></div></section>`;
}

const serviceCard = (s, i) => `<a class="svc-card" href="${s.href}">
  <span class="card-num">${pad(i)}</span>
  <h3>${esc(s.name)}</h3>
  <p>${esc(s.summary)}</p>
  <span class="more">Explore <span aria-hidden="true">→</span></span>
</a>`;

const home = { label: 'Home', href: '/' };

/* ── Templates ──────────────────────────────────────────────────────── */
const templates = {
  service(sec, ctx) {
    const P = pv(ctx, sec);
    const name = P('name');
    const features = arr(P('features'));
    const steps = arr(P('process'));
    const faqs = arr(P('faqs')).filter((q) => q && q.q);
    const trail = [home, { label: ctx.get('nav.services') || 'Services', href: '/services/' }, { label: name, href: sec.page.path }];
    const others = serviceLinks(ctx)
      .map((s, i) => ({ ...s, i: i + 1 }))
      .filter((s) => s.href !== sec.page.path);
    const body = `
${hero({
  trail,
  eyebrow: P('eyebrow'),
  h1: P('h1'),
  lede: P('lede'),
  actions: `${ctaButton(P('ctaLabel') || site.cta.label)}${features.length ? `<a class="btn btn-ghost" href="#included">${esc(P('featuresTitle'))} <span aria-hidden="true">↓</span></a>` : ''}`,
})}
${
  features.length
    ? `<section class="band" id="included"><div class="wrap">
  <div class="band-head"><h2 class="h2">${esc(P('featuresTitle'))}</h2></div>
  <div class="cards">${features
    .map((f, i) => `<article class="card"><span class="card-num">${pad(i + 1)}</span><h3>${esc(f.title)}</h3><p>${multiline(f.text)}</p></article>`)
    .join('')}</div>
</div></section>`
    : ''
}
${
  steps.length
    ? `<section class="band band-soft"><div class="wrap">
  <div class="band-head"><h2 class="h2">${esc(P('processTitle'))}</h2></div>
  <ol class="steps">${steps
    .map((s, i) => `<li class="step"><span class="step-num">${pad(i + 1)}</span><h3>${esc(s.title)}</h3><p>${multiline(s.text)}</p></li>`)
    .join('')}</ol>
</div></section>`
    : ''
}
${prose(P('body'))}
${
  faqs.length
    ? `<section class="band" id="faq"><div class="wrap narrow">
  <h2 class="h2">${esc(P('faqTitle'))}</h2>
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
    ? `<section class="band"><div class="wrap">
  <div class="band-head"><h2 class="h2">Other services</h2><a class="btn btn-ghost" href="/services/">All services <span aria-hidden="true">→</span></a></div>
  <div class="svc-grid svc-grid--3">${others.map((s) => serviceCard(s, s.i)).join('')}</div>
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
        provider: { '@type': 'Organization', name: ctx.brand, url: site.url },
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

  services(sec, ctx) {
    const P = pv(ctx, sec);
    const trail = [home, { label: ctx.get('nav.services') || 'Services', href: sec.page.path }];
    const svc = serviceLinks(ctx);
    const body = `
${hero({ trail, eyebrow: P('eyebrow'), h1: P('h1'), lede: P('lede'), actions: ctaButton(P('ctaLabel') || site.cta.label) })}
<section class="band"><div class="wrap">
  <div class="band-head"><h2 class="h2">${esc(P('cardsTitle'))}</h2></div>
  <div class="svc-grid">${svc.map((s, i) => serviceCard(s, i + 1)).join('')}</div>
</div></section>
${prose(P('body'))}
${ctaBand(P('ctaTitle'), P('ctaText'), P('ctaLabel'))}`;
    const jsonld = [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: svc.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: abs(s.href) })),
      },
      crumbsLd(trail),
    ];
    return { title: P('seoTitle'), description: P('metaDescription'), ogImage: P('ogImage'), body, jsonld, bodyClass: 'pg-services' };
  },

  portfolio(sec, ctx) {
    const P = pv(ctx, sec);
    const trail = [home, { label: ctx.get('nav.portfolio') || 'Portfolio', href: sec.page.path }];
    const items = arr(ctx.get('work.items')).filter((it) => it && it.title);
    const body = `
${hero({ trail, eyebrow: P('eyebrow'), h1: P('h1'), lede: P('lede'), art: true })}
<section class="band"><div class="wrap">
  <div class="work-grid">${items
    .map(
      (it, i) => `<a class="work-card" href="${esc(safeHref(it.href))}" target="_blank" rel="noopener">
    <div class="work-thumb"><span class="card-num">${pad(i + 1)}</span>${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.alt || it.title)}" loading="lazy" />` : ''}</div>
    <div class="work-body">
      <p class="work-meta">${esc(it.meta)}</p>
      <h2 class="work-title">${esc(it.title)} <span aria-hidden="true">↗</span></h2>
      <p>${multiline(it.description)}</p>
      <ul class="tags">${tagList(it.tags).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>
  </a>`
    )
    .join('')}</div>
</div></section>
${ctaBand(P('ctaTitle'), P('ctaText'), P('ctaLabel'))}`;
    return { title: P('seoTitle'), description: P('metaDescription'), ogImage: P('ogImage'), body, jsonld: [crumbsLd(trail)], bodyClass: 'pg-portfolio' };
  },

  team(sec, ctx) {
    const P = pv(ctx, sec);
    const trail = [home, { label: ctx.get('nav.team') || 'Team', href: sec.page.path }];
    const members = arr(P('members')).filter((m) => m && (m.name || m.role));
    const values = arr(P('values')).filter((v) => v && v.title);
    const body = `
${hero({ trail, eyebrow: P('eyebrow'), h1: P('h1'), lede: P('lede') })}
${
  members.length
    ? `<section class="band"><div class="wrap">
  <div class="band-head"><h2 class="h2">${esc(P('membersTitle'))}</h2></div>
  <div class="team-grid">${members
    .map(
      (m, i) => `<article class="member">
    <div class="member-photo${m.photo ? '' : ' member-photo--art'}">${
        m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.alt || m.name || m.role)}" loading="lazy" />` : `<span class="card-num">${pad(i + 1)}</span>${site.mark}`
      }</div>
    <div class="member-body">
      ${m.name ? `<p class="member-role">${esc(m.role)}</p><h3>${esc(m.name)}</h3>` : `<h3>${esc(m.role)}</h3>`}
      ${m.bio ? `<p>${multiline(m.bio)}</p>` : ''}
    </div>
  </article>`
    )
    .join('')}</div>
</div></section>`
    : ''
}
${
  values.length
    ? `<section class="band band-soft"><div class="wrap">
  <div class="band-head"><h2 class="h2">${esc(P('valuesTitle'))}</h2></div>
  <div class="cards cards--3">${values
    .map((v, i) => `<article class="card"><span class="card-num">${pad(i + 1)}</span><h3>${esc(v.title)}</h3><p>${multiline(v.text)}</p></article>`)
    .join('')}</div>
</div></section>`
    : ''
}
${ctaBand(P('ctaTitle'), P('ctaText'), P('ctaLabel'))}`;
    return { title: P('seoTitle'), description: P('metaDescription'), ogImage: P('ogImage'), body, jsonld: [crumbsLd(trail)], bodyClass: 'pg-team' };
  },

  contact(sec, ctx) {
    const P = pv(ctx, sec);
    const trail = [home, { label: 'Contact', href: sec.page.path }];
    const socials = lists.socials(ctx.get('social.links'));
    const email = String(P('email') || '').trim();
    const svc = serviceLinks(ctx);
    const L = (k, fb) => ctx.get(`contact.${k}`) || fb;
    const budgetLabel = (b) => (b === 'Undecided' ? site.budgetUndecided || 'Not sure yet' : b);
    const body = `
<section class="hero hero--contact">
  <div class="wrap contact-in">
    <div class="contact-copy">
      ${crumbs(trail)}
      <p class="eyebrow">${esc(P('eyebrow'))}</p>
      <h1 class="h1">${esc(P('h1'))}</h1>
      <p class="lede">${multiline(P('lede'))}</p>
      <ul class="facts">
        ${email ? `<li><span class="fact-k">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></li>` : ''}
        ${P('responseLine') ? `<li><span class="fact-k">Response</span><span>${esc(P('responseLine'))}</span></li>` : ''}
      </ul>
      ${socials ? `<div class="socials socials--lg">${socials}</div>` : ''}
    </div>
    <div class="contact-card">
      <h2 class="h3">${esc(P('formTitle'))}</h2>
      <form class="cform" data-contact novalidate>
        <label class="field"><span>${esc(L('nameLabel', 'Name'))}</span><input name="name" type="text" autocomplete="name" required /><em class="err" data-for="name">Please enter your name</em></label>
        <label class="field"><span>${esc(L('emailLabel', 'Email'))}</span><input name="email" type="email" autocomplete="email" required /><em class="err" data-for="email">Enter a valid email address</em></label>
        <fieldset class="field chips"><legend>${esc(P('servicesLabel'))}</legend>${svc
          .map((s) => `<label class="chip"><input type="checkbox" name="services" value="${esc(s.name)}" /><span>${esc(s.name)}</span></label>`)
          .join('')}</fieldset>
        <label class="field"><span>${esc(L('messageLabel', 'Message'))}</span><textarea name="message" rows="5" required></textarea><em class="err" data-for="message">Tell us a little more (10+ characters)</em></label>
        <fieldset class="field chips"><legend>${esc(L('budgetLabel', 'Budget'))}</legend>${BUDGETS.map(
          (b) => `<label class="chip"><input type="radio" name="budget" value="${esc(b)}"${b === 'Undecided' ? ' checked' : ''} /><span>${esc(budgetLabel(b))}</span></label>`
        ).join('')}</fieldset>
        <label class="hp" aria-hidden="true">Company<input name="company" type="text" tabindex="-1" autocomplete="off" /></label>
        <div class="form-actions"><button class="btn btn-cta" type="submit">${spark}<span>${esc(L('submit', 'Send'))}</span></button><p class="form-status" role="status"></p></div>
      </form>
      <div class="form-done" hidden role="status"><span class="spark spark--lg" aria-hidden="true"></span><h3 class="h3">${esc(L('doneTitle', 'Received.'))}</h3><p>${multiline(L('doneText', 'We will reply soon.'))}</p></div>
    </div>
  </div>
</section>`;
    return { title: P('seoTitle'), description: P('metaDescription'), ogImage: P('ogImage'), body, jsonld: [crumbsLd(trail)], bodyClass: 'pg-contact' };
  },

  blog(sec, ctx) {
    const P = pv(ctx, sec);
    const trail = [home, { label: ctx.get('nav.blog') || 'Blog', href: sec.page.path }];
    const posts = publishedPosts(ctx);
    const body = `
${hero({ trail, eyebrow: P('eyebrow'), h1: P('h1'), lede: P('lede') })}
<section class="band"><div class="wrap">${
      posts.length
        ? `<div class="posts">${posts.map((p, i) => postCard(p, i === 0 && posts.length > 2)).join('')}</div>`
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

function postCard(p, featured = false) {
  return `<article class="post-card${featured ? ' post-card--featured' : ''}">
  <a href="/blog/${esc(p.slug)}/">
    <div class="pc-media">${p.cover ? `<img src="${esc(p.cover)}" alt="${esc(p.coverAlt || p.title)}" loading="lazy" />` : `<div class="pc-art" aria-hidden="true">${site.mark}</div>`}</div>
    <div class="pc-body">
      <p class="pc-meta"><time datetime="${esc(p.date)}">${esc(fmtDate(p.date))}</time> · ${readingTime(p.body)} min read</p>
      <h2 class="pc-title">${esc(p.title)}</h2>
      ${p.excerpt ? `<p class="pc-excerpt">${esc(p.excerpt)}</p>` : ''}
      <span class="more">Read <span aria-hidden="true">→</span></span>
    </div>
  </a>
</article>`;
}

/* ── A single post ──────────────────────────────────────────────────── */
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
  const html = `
<article class="post">
  <header class="post-head"><div class="wrap narrow">
    ${crumbs(trail)}
    ${tags.length ? `<p class="eyebrow">${esc(tags.join(' · '))}</p>` : ''}
    <h1 class="h1 post-title">${esc(post.title)}</h1>
    <p class="post-meta"><time datetime="${esc(post.date)}">${esc(fmtDate(post.date))}</time><span aria-hidden="true">·</span><span>${readingTime(body)} min read</span><span aria-hidden="true">·</span><span>${esc(ctx.brand)}</span></p>
  </div></header>
  ${post.cover ? `<figure class="post-cover wrap"><img src="${esc(post.cover)}" alt="${esc(post.coverAlt || post.title)}" /></figure>` : ''}
  <div class="wrap narrow">
    <div class="prose post-body">${body}</div>
    <footer class="post-foot">
      ${tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      <a class="btn btn-ghost" href="/blog/"><span aria-hidden="true">←</span> All posts</a>
    </footer>
  </div>
</article>
${
  more.length
    ? `<section class="band"><div class="wrap">
  <div class="band-head"><h2 class="h2">${esc(B('moreTitle') || 'More posts')}</h2><a class="btn btn-ghost" href="/blog/">All posts <span aria-hidden="true">→</span></a></div>
  <div class="posts posts--3">${more.map((p) => postCard(p)).join('')}</div>
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
        dateModified: (post.updated || post.date).slice(0, 10),
        author: { '@type': 'Organization', name: ctx.brand, url: site.url },
        publisher: { '@type': 'Organization', name: ctx.brand, logo: { '@type': 'ImageObject', url: abs(site.logo) } },
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
    body: hero({
      eyebrow: '404',
      h1: nf.h1 || 'This page could not be found.',
      lede: nf.lede || 'The link may be old or mistyped. Try one of these instead.',
      actions: `${ctaButton('Back to home', '/')}<a class="btn btn-ghost" href="/services/">Services <span aria-hidden="true">→</span></a><a class="btn btn-ghost" href="/blog/">Blog <span aria-hidden="true">→</span></a>`,
    }),
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

/* ── XML: sitemap + RSS ─────────────────────────────────────────────── */
const xmlEsc = (s) => String(s ?? '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

async function sitemap(req, res) {
  const ctx = await getCtx();
  const urls = [
    { loc: abs('/'), priority: '1.0' },
    ...pageSections.map((s) => ({ loc: abs(s.page.path), priority: s.page.template === 'service' ? '0.9' : '0.7' })),
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
export function pagesRouter() {
  const r = express.Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

  // /web-design → /web-design/ (and /blog/x → /blog/x/): one canonical URL
  r.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const p = req.path;
    if (p.endsWith('/') || p.includes('.')) return next();
    if (byPath.has(`${p}/`) || /^\/blog\/[^/]+$/.test(p)) {
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
  r.get(
    '/blog/:slug/',
    wrap(async (req, res) => {
      const ctx = await getCtx();
      const post = publishedPosts(ctx).find((p) => p.slug === req.params.slug);
      if (!post) return renderNotFound(req, res);
      send(res, layout(ctx, postPage(ctx, post)));
    })
  );
  return r;
}
