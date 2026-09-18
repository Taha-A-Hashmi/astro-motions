/* ═══════════════════════════════════════════════════════════════════════
   cms/schema.js — everything the SEO dashboard can edit, in one place.

   Shared by the server (which injects values into the HTML and validates
   saves), the admin UI (which renders a form from it) and the dev client
   (which applies values in the browser when Vite serves the raw HTML).

   A field has a `key`, a `type`, and one or more `target`s describing where
   its value lands in the page:
     { sel: 'key' }            innerHTML of the element with data-cms="key"
     { sel, letters: true }    same, but one <span class="ch"> per character
     { meta: 'name' }          <meta name="…" content>
     { prop: 'og:…' }          <meta property="…" content>
     { title: true }           <title>
     { link: 'canonical' }     <link rel="…" href>
     { jsonld: 'field' }       a top-level field of the Organization JSON-LD
     { headHtml: true }        raw HTML inserted before </head>
     { list: 'work' }          the element with data-cms-list="work" is
                               re-rendered from the item template
   ═══════════════════════════════════════════════════════════════════════ */

import { text, area, list } from './fields.js';
import { pageSections, blogSections } from './pages.js';
import { socialNetworks } from './icons.js';

/* Site identity + the chrome of the server-rendered content pages
   (server/pages.js). Labels here are fallbacks; the dashboard wins. */
const MARK = `<svg class="mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><ellipse cx="24" cy="24" rx="20" ry="8.5" stroke="currentColor" stroke-width="1.1" transform="rotate(-24 24 24)" opacity="0.85"/><path d="M24 14.5 L25.9 22.1 L33.5 24 L25.9 25.9 L24 33.5 L22.1 25.9 L14.5 24 L22.1 22.1 Z" fill="currentColor" opacity="0.92"/><circle cx="40.5" cy="14.2" r="2.2" fill="#EFCD7A"/></svg>`;

export const site = {
  name: 'Astro Motions',
  accent: '#efcd7a',
  url: 'https://www.astromotions.com/',
  themeColor: '#05060d',
  ogImage: '/og-image.jpg',
  logo: '/apple-touch-icon.png',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400&display=swap',
  mark: MARK,
  tagline: 'Websites with their own gravity.',
  // header menu of the content pages; `services: true` opens the dropdown
  nav: [
    { label: 'Services', key: 'nav.services', href: '/services/', services: true },
    { label: 'Portfolio', key: 'nav.portfolio', href: '/portfolio/' },
    { label: 'Team', key: 'nav.team', href: '/team/' },
    { label: 'Blog', key: 'nav.blog', href: '/blog/' },
  ],
  cta: { label: 'Book a launch', key: 'nav.contact', href: '/contact/' },
  footerStudio: [
    { label: 'Portfolio', key: 'nav.portfolio', href: '/portfolio/' },
    { label: 'Team', key: 'nav.team', href: '/team/' },
    { label: 'Blog', key: 'nav.blog', href: '/blog/' },
    { label: 'Contact', href: '/contact/' },
  ],
  homeLink: { label: 'The 3D experience', href: '/', menuLabel: 'Home' },
  budgetUndecided: 'Not sure yet',
  notFound: {
    h1: 'This page drifted out of orbit.',
    lede: 'The link may be old or mistyped. Try one of these instead.',
  },
  // decorative hero art on content pages: the orbit from the logo
  heroArt: `<svg viewBox="0 0 400 400" fill="none"><defs><radialGradient id="hg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff1c4" stop-opacity=".55"/><stop offset=".25" stop-color="#efcd7a" stop-opacity=".18"/><stop offset="1" stop-color="#efcd7a" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="150" fill="url(#hg)"/><g transform="rotate(-24 200 200)"><ellipse cx="200" cy="200" rx="185" ry="72" stroke="rgba(242,240,234,.28)"/><ellipse cx="200" cy="200" rx="128" ry="50" stroke="rgba(242,240,234,.12)"/><circle r="5.5" fill="#efcd7a"><animateMotion dur="22s" repeatCount="indefinite" path="M15,200 a185,72 0 1,0 370,0 a185,72 0 1,0 -370,0"/></circle><circle r="3" fill="#f2f0ea" opacity=".7"><animateMotion dur="14s" repeatCount="indefinite" path="M328,200 a128,50 0 1,0 -256,0 a128,50 0 1,0 256,0"/></circle></g><path d="M200 162 L207 193 L238 200 L207 207 L200 238 L193 207 L162 200 L193 193 Z" fill="#f2f0ea" opacity=".9"/></svg>`,
};

const socialField = list(
  'social.links',
  'Social links',
  [
    { key: 'network', label: 'Network', type: 'select', options: socialNetworks },
    text('url', 'Profile URL', { type: 'url', help: 'The full address, e.g. https://www.instagram.com/yourstudio' }),
  ],
  {
    target: { list: 'socials' },
    default: [],
    itemLabel: 'network',
    addLabel: 'Add social link',
    help: 'Shown as icons in the footer of every page, the mobile menu and the contact page.',
  }
);

const settingsAndHome = [
  {
    id: 'seo',
    group: 'Settings',
    title: 'Site & SEO',
    intro: 'The home page title and description, plus site-wide settings — the fallback social image, search visibility and custom head code apply to every page.',
    fields: [
      text('seo.title', 'Page title', { max: 70, target: [{ title: true }, { sel: 'seo.title' }], help: 'The browser-tab title and the headline in Google results. Aim for 50–60 characters.' }),
      area('seo.description', 'Meta description', { max: 160, target: [{ meta: 'description' }, { sel: 'seo.description' }], help: 'The grey text under the headline in Google. 120–160 characters.' }),
      text('seo.canonical', 'Canonical URL', { type: 'url', target: { link: 'canonical' }, help: 'The one true address of this page. Leave as-is unless the domain changes.' }),
      { key: 'seo.robots', label: 'Search engine visibility', type: 'select', target: { meta: 'robots' }, options: [['index, follow', 'Visible — allow indexing'], ['noindex, nofollow', 'Hidden — discourage indexing']] },
      text('seo.ogTitle', 'Social title', { max: 70, target: [{ prop: 'og:title' }, { meta: 'twitter:title' }], help: 'Used when the link is shared on LinkedIn, X, Slack, WhatsApp…' }),
      area('seo.ogDescription', 'Social description', { max: 200, target: [{ prop: 'og:description' }, { meta: 'twitter:description' }] }),
      { key: 'seo.ogImage', label: 'Social image', type: 'image', target: [{ prop: 'og:image' }, { meta: 'twitter:image' }, { jsonld: 'image' }], help: '1200×630 JPG or PNG. Upload one or paste a URL.' },
      text('seo.siteName', 'Site name', { target: [{ prop: 'og:site_name' }, { meta: 'author' }, { jsonld: 'name' }] }),
      area('seo.orgDescription', 'Organisation description (structured data)', { max: 300, target: { jsonld: 'description' }, help: 'Feeds the schema.org Organization block that Google reads.' }),
      { key: 'seo.headHtml', label: 'Custom <head> code', type: 'code', target: { headHtml: true }, help: 'Verification tags (Google Search Console, Bing), analytics snippets, extra meta tags. Inserted verbatim before </head>.' },
    ],
  },
  {
    id: 'brand',
    group: 'Settings',
    title: 'Brand, menu & socials',
    intro: 'The studio name, the menu labels used on every page, the footer line and your social profiles.',
    fields: [
      text('brand.name', 'Studio name', { max: 40, target: { sel: 'brand.name' }, help: 'Loading screen, page footers, structured data and fallbacks.' }),
      text('brand.wordmark', 'Header wordmark', { max: 12, target: { sel: 'brand.wordmark' } }),
      text('nav.services', 'Menu · Services', { max: 24, target: { sel: 'nav.services' } }),
      text('nav.portfolio', 'Menu · Portfolio', { max: 24, target: { sel: 'nav.portfolio' } }),
      text('nav.team', 'Menu · Team', { max: 24, target: { sel: 'nav.team' } }),
      text('nav.blog', 'Menu · Blog', { max: 24, target: { sel: 'nav.blog' } }),
      text('nav.contact', 'Menu button · contact', { max: 24, target: { sel: 'nav.contact' } }),
      text('nav.workLink', 'Home page · link to the launch-log sheet', { max: 24, target: { sel: 'nav.workLink' } }),
      text('footer.copyright', 'Footer line', { max: 60, target: { sel: 'footer.copyright' } }),
      text('footer.top', 'Footer · back-to-top label', { max: 30, target: { sel: 'footer.top' } }),
      socialField,
    ],
  },
  {
    id: 'stages',
    group: 'Home page',
    title: 'Stages',
    intro: 'The six scroll stages of the page, top to bottom. Each has a small index label and one line.',
    fields: [
      text('hero.word', 'Stage 1 · Hero wordmark', { max: 8, target: { sel: 'hero.word', letters: true }, help: 'Also the word the stars spell at stage 4 after the next deploy. Keep it short — each letter animates in.' }),
      text('hero.sub', 'Stage 1 · Sub-line', { max: 24, target: { sel: 'hero.sub' } }),
      text('hero.tagline', 'Stage 1 · Tagline', { max: 60, target: { sel: 'hero.tagline' } }),
      text('stage1.index', 'Stage 2 · Index', { max: 30, target: { sel: 'stage1.index' } }),
      text('stage1.line', 'Stage 2 · Line', { max: 60, target: { sel: 'stage1.line' } }),
      text('stage2.index', 'Stage 3 · Index', { max: 30, target: { sel: 'stage2.index' } }),
      text('stage2.line', 'Stage 3 · Line', { max: 60, target: { sel: 'stage2.line' } }),
      text('stage3.index', 'Stage 4 · Index', { max: 30, target: { sel: 'stage3.index' } }),
      text('stage3.line', 'Stage 4 · Line', { max: 60, target: { sel: 'stage3.line' } }),
      text('stage3.d1', 'Stage 4 · Discipline 1', { max: 16, target: { sel: 'stage3.d1' } }),
      text('stage3.d2', 'Stage 4 · Discipline 2', { max: 16, target: { sel: 'stage3.d2' } }),
      text('stage3.d3', 'Stage 4 · Discipline 3', { max: 16, target: { sel: 'stage3.d3' } }),
      text('stage4.index', 'Stage 5 · Index', { max: 30, target: { sel: 'stage4.index' } }),
      text('stage4.line', 'Stage 5 · Line', { max: 60, target: { sel: 'stage4.line' } }),
      text('stage5.index', 'Stage 6 · Index', { max: 30, target: { sel: 'stage5.index' } }),
      text('stage5.line', 'Stage 6 · Line', { max: 60, target: { sel: 'stage5.line' } }),
      text('cta.summit', 'Stage 6 · Button label', { max: 24, target: { sel: 'cta.summit' } }),
    ],
  },
  {
    id: 'contact',
    group: 'Home page',
    title: 'Contact form',
    intro: 'The panel that opens from every contact button on the home page. The labels are shared with the Contact page form.',
    fields: [
      text('contact.eyebrow', 'Eyebrow', { max: 30, target: { sel: 'contact.eyebrow' } }),
      text('contact.title', 'Title', { max: 60, target: { sel: 'contact.title' } }),
      area('contact.lede', 'Intro text', { max: 240, target: { sel: 'contact.lede' } }),
      text('contact.nameLabel', 'Field label · name', { max: 24, target: { sel: 'contact.nameLabel' } }),
      text('contact.emailLabel', 'Field label · email', { max: 24, target: { sel: 'contact.emailLabel' } }),
      text('contact.messageLabel', 'Field label · message', { max: 40, target: { sel: 'contact.messageLabel' } }),
      text('contact.budgetLabel', 'Field label · budget', { max: 30, target: { sel: 'contact.budgetLabel' } }),
      text('contact.submit', 'Submit button', { max: 20, target: { sel: 'contact.submit' } }),
      text('contact.doneTitle', 'Success · title', { max: 60, target: { sel: 'contact.doneTitle' } }),
      area('contact.doneText', 'Success · text', { max: 200, target: { sel: 'contact.doneText' } }),
    ],
  },
  {
    id: 'work',
    group: 'Home page',
    title: 'Launch log',
    intro: 'The projects shown in the home-page sheet and on the Portfolio page. Wrap a word in *asterisks* in the title to set it in italic gold.',
    fields: [
      text('work.tab', 'Sheet tab label', { max: 24, target: { sel: 'work.tab' } }),
      text('work.eyebrow', 'Eyebrow', { max: 30, target: { sel: 'work.eyebrow' } }),
      text('work.title', 'Title', { max: 60, type: 'rich', target: { sel: 'work.title' } }),
      area('work.lede', 'Intro text', { max: 260, target: { sel: 'work.lede' } }),
      area('work.footText', 'Footer text', { max: 200, target: { sel: 'work.footText' } }),
      text('work.footCta', 'Footer button', { max: 24, target: { sel: 'work.footCta' } }),
      {
        key: 'work.items',
        label: 'Projects',
        type: 'list',
        target: { list: 'work' },
        itemLabel: 'title',
        addLabel: 'Add project',
        item: [
          text('title', 'Title', { max: 60 }),
          text('meta', 'Meta line', { max: 60, help: 'e.g. Client · Type · Year' }),
          area('description', 'Description', { max: 260 }),
          text('href', 'Link', { type: 'url' }),
          text('tags', 'Tags', { max: 60, help: 'Comma-separated, three reads best.' }),
          { key: 'image', label: 'Thumbnail', type: 'image', help: '16:10 works best (1600×1000).' },
          text('alt', 'Image alt text', { max: 160, help: 'Describe the image for screen readers and search engines.' }),
        ],
        default: [
          { title: 'A Year of Discovery', meta: 'OceanX · Year in review · 2025', description: 'Twelve months of ocean missions retold as one continuous voyage: you scroll, the globe turns, and each expedition surfaces where it happened.', href: 'https://2025.oceanx.org/', tags: 'WebGL, Narrative, Scroll', image: '/work/oceanx-2025.jpg', alt: 'OceanX 2025 Year in Review — a globe over a deep-sea blue field' },
          { title: 'The Intelligent File Browser', meta: 'Poly · Product site', description: 'A file browser you talk to, introduced on a rendered desk the camera settles into — search, chat and sync shown in place, not in a feature grid.', href: 'https://poly.app/', tags: '3D, Product, Motion', image: '/work/poly.jpg', alt: 'Poly — the intelligent file browser, shown on a laptop on a sunlit desk' },
          { title: 'You Are Limitless', meta: 'Organimo · Brand commerce', description: 'A supplement sold the way a fragrance is: dark, slow, sound-led, with the product held up like an object worth wanting.', href: 'https://organimo.com/', tags: 'Commerce, Brand, Audio', image: '/work/organimo.jpg', alt: 'Organimo — Limitless begins here: a pastel dreamscape with floating stone, a shell and a goldfish' },
          { title: 'Yard Operating System', meta: 'Terminal Industries · Product site', description: 'Logistics software given the treatment of a car film: wide photography, product renders, and a page that moves at the pace of a trailer.', href: 'https://terminal-industries.com/', tags: 'Industrial, Photography, Scroll', image: '/work/terminal-industries.jpg', alt: 'Terminal Industries — a semi truck silhouetted against a sunset' },
        ],
      },
    ],
  },
];

export const sections = [...settingsAndHome, ...pageSections, ...blogSections];

/** Every editable field, flat, keyed. */
export const fields = Object.fromEntries(sections.flatMap((s) => s.fields.map((f) => [f.key, f])));

export const targetsOf = (f) => (Array.isArray(f.target) ? f.target : f.target ? [f.target] : []);
