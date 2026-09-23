/* ═══════════════════════════════════════════════════════════════════════
   cms/fields.js — field helpers and the reusable page "section" builders.

   A section with a `page` property is a real URL rendered by
   server/pages.js; its fields carry their copy as `default`, so the page
   works before anyone opens the dashboard and "Reset to default" always
   has something to go back to. Field keys are flat: `${prefix}.${name}`.
   ═══════════════════════════════════════════════════════════════════════ */

export const text = (key, label, extra = {}) => ({ key, label, type: 'text', ...extra });
export const area = (key, label, extra = {}) => ({ key, label, type: 'textarea', ...extra });
export const html = (key, label, extra = {}) => ({ key, label, type: 'html', ...extra });
export const image = (key, label, extra = {}) => ({ key, label, type: 'image', ...extra });
export const list = (key, label, item, extra = {}) => ({ key, label, type: 'list', item, ...extra });

/* ── Building blocks ────────────────────────────────────────────────── */
export const seoFields = (p, d) => [
  text(`${p}.seoTitle`, 'SEO title', {
    max: 70,
    default: d.seoTitle,
    help: 'The blue headline in Google and the browser-tab title. Aim for 50–60 characters.',
  }),
  area(`${p}.metaDescription`, 'Meta description', {
    max: 160,
    default: d.metaDescription,
    help: 'The grey text under the headline in Google. 120–160 characters.',
  }),
  image(`${p}.ogImage`, 'Social image', {
    default: d.ogImage || '',
    help: 'Optional. 1200×630. Falls back to the site-wide social image.',
  }),
];

export const heroFields = (p, d) => [
  text(`${p}.eyebrow`, 'Eyebrow', { max: 40, default: d.eyebrow }),
  text(`${p}.h1`, 'Page heading (H1)', { max: 90, default: d.h1, help: 'One per page. Put the main keyword in it naturally.' }),
  area(`${p}.lede`, 'Intro', { max: 320, default: d.lede }),
];

export const ctaFields = (p, d) => [
  text(`${p}.ctaTitle`, 'Call to action · heading', { max: 80, default: d.ctaTitle }),
  area(`${p}.ctaText`, 'Call to action · text', { max: 240, default: d.ctaText }),
  text(`${p}.ctaLabel`, 'Call to action · button', { max: 30, default: d.ctaLabel }),
];

const pageIntro = (path, extra = '') => `Live at ${path}${extra ? ` — ${extra}` : ''}.`;

/* ── Sections ───────────────────────────────────────────────────────── */
export function serviceSection(slug, d) {
  const p = `svc.${slug}`;
  const path = `/${slug}/`;
  return {
    id: `svc-${slug}`,
    group: 'Pages',
    title: d.name,
    prefix: p,
    page: { path, template: 'service' },
    intro: pageIntro(path, 'listed on the Services hub and in the Services menu'),
    fields: [
      ...seoFields(p, d),
      text(`${p}.name`, 'Service name', { max: 40, default: d.name, target: { sel: `${p}.name` }, help: 'Used in menus, breadcrumbs, the home-page services list and marquee.' }),
      area(`${p}.summary`, 'Summary', { max: 160, default: d.summary, target: { sel: `${p}.summary` }, help: 'One line for the home page, the Services hub and the "other services" list.' }),
      ...heroFields(p, d),
      text(`${p}.featuresTitle`, 'Deliverables · heading', { max: 60, default: d.featuresTitle }),
      list(`${p}.features`, 'Deliverables', [text('title', 'Title', { max: 60 }), area('text', 'Text', { max: 300 })], {
        default: d.features,
        itemLabel: 'title',
        addLabel: 'Add deliverable',
      }),
      text(`${p}.processTitle`, 'Process · heading', { max: 60, default: d.processTitle }),
      list(`${p}.process`, 'Process steps', [text('title', 'Step', { max: 40 }), area('text', 'Text', { max: 300 })], {
        default: d.process,
        itemLabel: 'title',
        addLabel: 'Add step',
      }),
      html(`${p}.body`, 'Long-form copy', {
        default: d.body,
        help: 'The in-depth section search engines read most closely. Use H2/H3 headings and link to related pages.',
      }),
      text(`${p}.faqTitle`, 'FAQ · heading', { max: 60, default: d.faqTitle }),
      list(`${p}.faqs`, 'FAQs', [text('q', 'Question', { max: 140 }), area('a', 'Answer', { max: 600 })], {
        default: d.faqs,
        itemLabel: 'q',
        addLabel: 'Add question',
        help: 'Also published as FAQ structured data, which can show as rich results in Google.',
      }),
      ...ctaFields(p, d),
    ],
  };
}

export function servicesHubSection(d) {
  const p = 'page.services';
  return {
    id: 'page-services',
    group: 'Pages',
    title: 'Services',
    prefix: p,
    page: { path: '/services/', template: 'services' },
    intro: pageIntro('/services/', 'the hub for the four service pages; its cards come from each service page'),
    fields: [
      ...seoFields(p, d),
      ...heroFields(p, d),
      text(`${p}.cardsTitle`, 'Services grid · heading', { max: 60, default: d.cardsTitle }),
      html(`${p}.body`, 'Long-form copy', { default: d.body }),
      ...ctaFields(p, d),
    ],
  };
}

export function portfolioSection(d) {
  const p = 'page.portfolio';
  return {
    id: 'page-portfolio',
    group: 'Pages',
    title: 'Portfolio',
    prefix: p,
    page: { path: '/portfolio/', template: 'portfolio' },
    intro: pageIntro('/portfolio/', 'the projects themselves are edited under Home page → Launch log'),
    fields: [...seoFields(p, d), ...heroFields(p, d), ...ctaFields(p, d)],
  };
}

export function teamSection(d) {
  const p = 'page.team';
  return {
    id: 'page-team',
    group: 'Pages',
    title: 'Team',
    prefix: p,
    page: { path: '/team/', template: 'team' },
    intro: pageIntro('/team/'),
    fields: [
      ...seoFields(p, d),
      ...heroFields(p, d),
      text(`${p}.membersTitle`, 'Team · heading', { max: 60, default: d.membersTitle }),
      list(
        `${p}.members`,
        'Team members',
        [
          text('name', 'Name', { max: 60, help: 'Optional — leave empty to show the role as the heading.' }),
          text('role', 'Role', { max: 60 }),
          area('bio', 'Bio', { max: 400 }),
          image('photo', 'Photo', { help: 'Optional. Portrait, at least 800px tall.' }),
          text('alt', 'Photo alt text', { max: 160 }),
        ],
        { default: d.members, itemLabel: 'role', addLabel: 'Add team member' }
      ),
      text(`${p}.valuesTitle`, 'Values · heading', { max: 60, default: d.valuesTitle }),
      list(`${p}.values`, 'Values', [text('title', 'Title', { max: 60 }), area('text', 'Text', { max: 300 })], {
        default: d.values,
        itemLabel: 'title',
        addLabel: 'Add value',
      }),
      ...ctaFields(p, d),
    ],
  };
}

export function contactSection(d) {
  const p = 'page.contact';
  return {
    id: 'page-contact',
    group: 'Pages',
    title: 'Contact',
    prefix: p,
    page: { path: '/contact/', template: 'contact' },
    intro: pageIntro('/contact/', 'form labels are shared with Home page → Contact form'),
    fields: [
      ...seoFields(p, d),
      ...heroFields(p, d),
      text(`${p}.formTitle`, 'Form · heading', { max: 60, default: d.formTitle }),
      text(`${p}.servicesLabel`, 'Form · services question', { max: 60, default: d.servicesLabel }),
      text(`${p}.email`, 'Public email address', { max: 120, default: d.email || '', help: 'Optional. Shown on the page when set.' }),
      text(`${p}.responseLine`, 'Response time line', { max: 120, default: d.responseLine }),
    ],
  };
}

export function blogPageSection(d) {
  const p = 'page.blog';
  return {
    id: 'page-blog',
    group: 'Pages',
    title: 'Blog page',
    prefix: p,
    page: { path: '/blog/', template: 'blog' },
    intro: pageIntro('/blog/', 'posts themselves live under Blog → Posts'),
    fields: [
      ...seoFields(p, d),
      ...heroFields(p, d),
      text(`${p}.emptyText`, 'Text when there are no posts', { max: 120, default: d.emptyText }),
      text(`${p}.moreTitle`, 'Post page · "more posts" heading', { max: 60, default: d.moreTitle }),
      ...ctaFields(p, d),
    ],
  };
}

export function postsSection(defaultPosts = []) {
  return {
    id: 'posts',
    group: 'Blog',
    title: 'Posts',
    special: 'posts',
    intro: 'Every published post gets its own page at /blog/<permalink>/.',
    fields: [{ key: 'blog.posts', label: 'Posts', type: 'posts', default: defaultPosts }],
  };
}
