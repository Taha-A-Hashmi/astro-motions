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
/* The mark: a cobalt planet cut by its ring. Masks need ids that are
   unique on the page, so every copy is minted with its own suffix. */
export const mark = (id = 'm') =>
  `<svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><defs><mask id="mk-${id}"><rect width="48" height="48" fill="#fff"/><path d="M2 24A22 6.5 0 0 0 46 24" transform="rotate(-24 24 24)" fill="none" stroke="#000" stroke-width="5.5"/></mask><mask id="mb-${id}"><rect width="48" height="48" fill="#fff"/><circle cx="24" cy="24" r="16.4" fill="#000"/></mask></defs><circle cx="24" cy="24" r="14" fill="currentColor" mask="url(#mk-${id})"/><g transform="rotate(-24 24 24)" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 24A22 6.5 0 0 0 46 24"/><path d="M2 24A22 6.5 0 0 1 46 24" mask="url(#mb-${id})"/></g></svg>`;

export const site = {
  name: 'Astro Motions',
  accent: '#2b3bff',
  url: 'https://www.astromotions.com/',
  themeColor: '#06070b',
  ogImage: '/og-image.jpg',
  logo: '/apple-touch-icon.png',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap',
  mark,
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
  homeLink: { label: 'Home', href: '/', menuLabel: 'Home' },
  budgetUndecided: 'Not sure yet',
  notFound: {
    h1: 'This page drifted out of orbit.',
    lede: 'The link may be old or mistyped. Try one of these instead.',
  },
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
      text('seo.title', 'Page title', { max: 70, target: { title: true }, help: 'The browser-tab title and the headline in Google results. Aim for 50–60 characters.' }),
      area('seo.description', 'Meta description', { max: 160, target: { meta: 'description' }, help: 'The grey text under the headline in Google. 120–160 characters.' }),
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
      text('brand.wordmark', 'Wordmark (header + footer)', { max: 20, target: { sel: 'brand.wordmark' }, help: 'Set in the display face next to the mark, and huge across the home-page footer.' }),
      text('nav.services', 'Menu · Services', { max: 24, target: { sel: 'nav.services' } }),
      text('nav.portfolio', 'Menu · Portfolio', { max: 24, target: { sel: 'nav.portfolio' } }),
      text('nav.team', 'Menu · Team', { max: 24, target: { sel: 'nav.team' } }),
      text('nav.blog', 'Menu · Blog', { max: 24, target: { sel: 'nav.blog' } }),
      text('nav.contact', 'Menu button · contact', { max: 24, target: { sel: 'nav.contact' } }),
      text('nav.workLink', 'Home page · hero link to the launch log', { max: 24, target: { sel: 'nav.workLink' } }),
      text('footer.copyright', 'Footer line', { max: 60, target: { sel: 'footer.copyright' } }),
      text('footer.top', 'Footer · back-to-top label', { max: 30, target: { sel: 'footer.top' } }),
      socialField,
    ],
  },
  {
    id: 'stages',
    group: 'Home page',
    title: 'Sections',
    intro: 'The home page from top to bottom: the hero, the three-line manifesto, the services list, the process and the closing call to action. (Service names and summaries come from each service page.)',
    fields: [
      text('hero.word', 'Hero · wordmark, line 1', { max: 8, target: { sel: 'hero.word', letters: true }, help: 'Set huge across the hero. Keep it short — each letter rises in on load.' }),
      text('hero.sub', 'Hero · wordmark, line 2', { max: 12, target: { sel: 'hero.sub' } }),
      text('hero.tagline', 'Hero · tagline', { max: 60, target: { sel: 'hero.tagline' }, help: 'Also shown at the top of the footer.' }),
      area('hero.intro', 'Hero · intro', { max: 200, target: { sel: 'hero.intro' } }),
      text('hero.cta', 'Hero · button', { max: 24, target: { sel: 'hero.cta' } }),
      text('stage1.index', 'Manifesto · label 1', { max: 30, target: { sel: 'stage1.index' } }),
      text('stage1.line', 'Manifesto · line 1', { max: 60, target: { sel: 'stage1.line' } }),
      text('stage2.index', 'Manifesto · label 2', { max: 30, target: { sel: 'stage2.index' } }),
      text('stage2.line', 'Manifesto · line 2', { max: 60, target: { sel: 'stage2.line' } }),
      text('stage3.index', 'Manifesto · label 3', { max: 30, target: { sel: 'stage3.index' } }),
      text('stage3.line', 'Manifesto · line 3 (in cobalt)', { max: 60, target: { sel: 'stage3.line' } }),
      text('stage3.d1', 'Discipline 1', { max: 16, target: { sel: 'stage3.d1' }, help: 'The three disciplines under the manifesto; they also run in the cobalt marquee.' }),
      text('stage3.d2', 'Discipline 2', { max: 16, target: { sel: 'stage3.d2' } }),
      text('stage3.d3', 'Discipline 3', { max: 16, target: { sel: 'stage3.d3' } }),
      text('home.servicesLabel', 'Services · label', { max: 30, target: { sel: 'home.servicesLabel' } }),
      text('home.servicesTitle', 'Services · heading', { max: 60, target: { sel: 'home.servicesTitle' } }),
      text('home.servicesLink', 'Services · link label', { max: 30, target: { sel: 'home.servicesLink' } }),
      text('stage4.index', 'Process · label', { max: 30, target: { sel: 'stage4.index' } }),
      text('stage4.line', 'Process · heading', { max: 60, target: { sel: 'stage4.line' } }),
      list('process.items', 'Process · steps', [text('n', 'Marker', { max: 6, help: 'e.g. T–3' }), text('title', 'Step', { max: 40 }), area('text', 'Text', { max: 240 })], {
        target: { list: 'process' },
        itemLabel: 'title',
        addLabel: 'Add step',
        default: [
          { n: 'T–3', title: 'Countdown', text: 'A working session on goals, audience and competitors. You leave with a sitemap, a scope and a dated plan.' },
          { n: 'T–2', title: 'Design', text: 'Key screens and the motion language, reviewed as real layouts in the browser rather than static mock-ups.' },
          { n: 'T–1', title: 'Build', text: 'A hand-built front end, the editor wired up, and testing on real phones, tablets and desktops throughout.' },
          { n: 'T–0', title: 'Orbit', text: 'Launch-day redirects, analytics and a speed pass — then a month of tuning, and growth work if you want it.' },
        ],
      }),
      text('stage5.index', 'Call to action · label', { max: 30, target: { sel: 'stage5.index' } }),
      text('stage5.line', 'Call to action · heading', { max: 60, target: { sel: 'stage5.line' } }),
      area('cta.text', 'Call to action · text', { max: 200, target: { sel: 'cta.text' } }),
      text('cta.summit', 'Call to action · button', { max: 24, target: { sel: 'cta.summit' } }),
    ],
  },
  {
    id: 'contact',
    group: 'Home page',
    title: 'Contact form',
    intro: 'The drawer that slides in from every "Book a launch" button on the home page. The labels are shared with the Contact page form.',
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
    intro: 'The projects on the home page and the Portfolio page. Wrap words in *asterisks* in the title to set them in the accent colour.',
    fields: [
      text('work.eyebrow', 'Eyebrow', { max: 30, target: { sel: 'work.eyebrow' } }),
      text('work.title', 'Title', { max: 60, type: 'rich', target: { sel: 'work.title' } }),
      area('work.lede', 'Intro text', { max: 260, target: { sel: 'work.lede' } }),
      area('work.footText', 'Closing line', { max: 200, target: { sel: 'work.footText' } }),
      text('work.footCta', 'Closing button', { max: 24, target: { sel: 'work.footCta' } }),
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
