/* ═══════════════════════════════════════════════════════════════════════
   cms/pages.js — Astro Motions' content pages and their default copy.
   Every string here is only a default: the dashboard overrides it.
   Voice: launch / orbit / gravity — calm, specific, no invented claims.
   ═══════════════════════════════════════════════════════════════════════ */
import {
  serviceSection,
  servicesHubSection,
  portfolioSection,
  teamSection,
  contactSection,
  blogPageSection,
  postsSection,
} from './fields.js';

const CTA = 'Book a launch';

/* ── Services hub ───────────────────────────────────────────────────── */
const services = servicesHubSection({
  seoTitle: 'Services — Web Design, SEO, PPC & Social | Astro Motions',
  metaDescription:
    'Web design, organic SEO, PPC and social media marketing from one small crew — every channel built to pull people in and keep them in orbit.',
  eyebrow: 'Services',
  h1: 'Four ways we build gravity.',
  lede: 'A website is the centre of mass. Search, paid media and social are the orbits around it. We design, build and run all four — with one crew, one plan and one set of numbers.',
  cardsTitle: 'What we do',
  body: `<h2>Why one crew for all four</h2>
<p>Most brands split their growth across three or four agencies: one builds the website, another does SEO, a third runs ads and a fourth posts on social. Each optimises its own slice and nobody owns the whole journey from first impression to enquiry.</p>
<p>We work the other way round. The people who design your website also plan the pages search engines should find, build the landing pages your ads send traffic to, and create the social content that points back to it all. One plan, one set of numbers, no hand-offs.</p>
<h2>Start with one, add the rest</h2>
<p>You don't need everything at once. Many clients begin with <a href="/web-design/">web design</a> or <a href="/organic-seo/">organic SEO</a>, then add <a href="/ppc-marketing/">PPC</a> or <a href="/social-media-marketing/">social media marketing</a> when the foundations are in place.</p>`,
  ctaTitle: 'Not sure where to start?',
  ctaText: "Tell us where you are and where you want to be. We'll recommend the first step — even if it's a small one.",
  ctaLabel: CTA,
});

/* ── Web design ─────────────────────────────────────────────────────── */
const webDesign = serviceSection('web-design', {
  name: 'Web design',
  summary: 'Cinematic, fast, search-ready websites — designed and engineered by the same hands.',
  seoTitle: 'Web Design Studio — Cinematic, Fast Websites | Astro Motions',
  metaDescription:
    'Custom web design and development: immersive 3D and motion where it earns its place, fast pages everywhere else, and SEO built into the foundations.',
  eyebrow: 'Web design',
  h1: 'Websites that hold people in orbit.',
  lede: 'We design and build custom websites where every scroll has a reason. Immersive where it matters, instant where it counts, and structured so search engines understand every page.',
  featuresTitle: "What's in the build",
  features: [
    { title: 'Strategy & structure', text: 'Positioning, audience and page architecture worked out before a pixel moves, so the site answers the questions buyers actually ask.' },
    { title: 'Art direction', text: 'A visual system with its own type, colour and motion language, applied consistently from the hero to the privacy policy.' },
    { title: '3D & motion', text: 'WebGL scenes, scroll choreography and micro-interactions — used to explain and persuade, never as decoration for its own sake.' },
    { title: 'Engineering & speed', text: 'Hand-built front ends with quality tiers for phones, lazy-loaded media and Core Web Vitals checked before launch.' },
    { title: 'SEO foundations', text: 'Clean URLs, semantic headings, structured data, an XML sitemap and metadata you can edit yourself — no plugins required.' },
    { title: 'An editor you will use', text: 'A simple dashboard for copy, meta tags, pages and blog posts, so the site keeps moving after launch day.' },
  ],
  processTitle: 'From countdown to launch',
  process: [
    { title: 'Discovery', text: 'A working session on goals, audience and competitors. You leave with a sitemap, a content plan and a clear scope.' },
    { title: 'Design', text: 'Key screens and the motion language in high fidelity. You review real layouts in the browser, not static mock-ups.' },
    { title: 'Build', text: 'We engineer the site, wire up the editor and test on real phones, tablets and desktops throughout.' },
    { title: 'Launch & orbit', text: 'Redirects, analytics, Search Console and a performance pass on launch day — then a month of fixes and tuning included.' },
  ],
  body: `<h2>Design that earns attention — and keeps it</h2>
<p>Most websites are assembled from the same template and it shows: a hero, three icons, a testimonial slider, a form. They launch, and then nothing happens. We start from the other end: what should a visitor feel, understand and do in their first ten seconds, and what would make them stay for the next ten minutes?</p>
<p>That question decides where immersive 3D and motion belong and where they would only slow the page down. The result is a site with a clear point of view that still loads quickly on a mid-range phone on a train.</p>
<h2>Built to be found</h2>
<p>Beautiful and invisible is still invisible. Every build ships with semantic markup, descriptive URLs, schema.org structured data, an XML sitemap and editable titles and descriptions for every page. If you also work with us on <a href="/organic-seo/">organic SEO</a>, the content plan starts on day one instead of after launch.</p>
<h2>Who it's for</h2>
<p>Studios, product companies and brands that are judged on how they present themselves — and that would rather have one remarkable website than a dozen forgettable pages.</p>`,
  faqTitle: 'Questions before liftoff',
  faqs: [
    { q: 'How long does a website take?', a: 'Most projects run six to ten weeks from discovery to launch. Sites with heavy 3D or large content migrations take longer; you get a dated plan after the discovery session.' },
    { q: 'Will a 3D website be slow?', a: "Not if it's engineered properly. We detect the device, scale effects down on phones and keep text pages lightweight, so the experience stays smooth and the content stays fast." },
    { q: 'Can we edit the site ourselves?', a: 'Yes. You get a dashboard for page copy, SEO titles and descriptions, social images, portfolio entries and blog posts — no code and no plugins.' },
    { q: 'Do you redesign existing websites?', a: "Often. We audit what's working first — pages that rank, links that convert — and carry them across with redirects so you keep the search visibility you've earned." },
  ],
  ctaTitle: 'Ready to leave the ground?',
  ctaText: 'Tell us what you are building. We reply to every message ourselves, usually within two days.',
  ctaLabel: CTA,
});

/* ── Organic SEO ────────────────────────────────────────────────────── */
const organicSeo = serviceSection('organic-seo', {
  name: 'Organic SEO',
  summary: "Technical fixes, content and authority that compound — traffic you don't pay for by the click.",
  seoTitle: 'Organic SEO Services That Compound | Astro Motions',
  metaDescription:
    'Organic SEO for ambitious brands: technical audits, keyword strategy, on-page optimisation, content and link earning — reported in plain language every month.',
  eyebrow: 'Organic SEO',
  h1: 'Search visibility that keeps compounding.',
  lede: 'Paid clicks stop the moment the budget does. Organic rankings keep working. We fix what holds your site back, publish what your buyers are searching for, and earn the authority that moves you up.',
  featuresTitle: 'What we work on',
  features: [
    { title: 'Technical SEO audit', text: 'Crawlability, indexing, site speed, Core Web Vitals, structured data and internal links — prioritised by impact, not by tool score.' },
    { title: 'Keyword & intent research', text: 'The searches your buyers actually make, grouped by intent and mapped to pages you have or pages you need.' },
    { title: 'On-page optimisation', text: 'Titles, headings, copy, media and internal links tuned page by page, so every URL has one clear job.' },
    { title: 'Content that ranks', text: 'Service pages, guides and articles planned around real demand and written to be the best answer on the results page.' },
    { title: 'Local SEO', text: 'Google Business Profile, citations and location pages for teams that sell to a city or region.' },
    { title: 'Authority & digital PR', text: 'Links earned from relevant publications and partners — no link farms, no private networks, nothing that puts your domain at risk.' },
  ],
  processTitle: 'How a campaign runs',
  process: [
    { title: 'Audit', text: 'A full technical and content audit with a ranked list of fixes and the opportunities worth chasing first.' },
    { title: 'Roadmap', text: 'A 90-day plan: which pages to fix, which to create and which searches to target, agreed with you up front.' },
    { title: 'Execution', text: 'We ship the fixes, write and optimise the content and build authority — month after month.' },
    { title: 'Reporting', text: "A monthly report in plain language: rankings, organic traffic, enquiries and what we're doing next." },
  ],
  body: `<h2>SEO is a system, not a checklist</h2>
<p>Rankings come from three things working together: a site search engines can crawl and understand, content that answers the query better than anything else on the page, and enough authority for Google to trust it. Fix one and ignore the others and results stall. We work on all three at once, in the order that moves the needle fastest for your site.</p>
<h2>What progress looks like</h2>
<p>SEO is a compounding channel. The first months usually go into removing technical blockers and publishing the pages that were missing; growth in impressions and rankings tends to follow, and qualified traffic builds from there. We agree targets at the start and report against them every month — no vanity metrics.</p>
<h2>Pairs well with</h2>
<p>A fast, well-structured site makes every SEO hour go further, which is why many clients combine this with <a href="/web-design/">web design</a>. While rankings build, <a href="/ppc-marketing/">PPC</a> can capture demand immediately and tell us which keywords convert.</p>`,
  faqTitle: 'SEO questions, answered',
  faqs: [
    { q: 'How long does SEO take to work?', a: 'Technical fixes can show up within weeks; meaningful ranking and traffic growth usually takes three to six months, depending on competition and where the site starts.' },
    { q: 'Do you guarantee first-place rankings?', a: "No — and be wary of anyone who does. Nobody controls Google's results. We commit to the work, the targets we agree and complete transparency about what's happening." },
    { q: 'Do you write the content?', a: 'Yes. Our writers work from the keyword plan and your expertise; you review and approve everything before it goes live.' },
    { q: 'Which tools do you use?', a: 'Google Search Console and Analytics as the source of truth, plus industry-standard crawlers and rank trackers. You keep access to all of the data.' },
  ],
  ctaTitle: "Let's get you found.",
  ctaText: "Share your site and your goals — we'll reply with a first read on what's holding it back.",
  ctaLabel: CTA,
});

/* ── PPC marketing ──────────────────────────────────────────────────── */
const ppc = serviceSection('ppc-marketing', {
  name: 'PPC marketing',
  summary: 'Google, Microsoft and paid social campaigns built around profit, not clicks.',
  seoTitle: 'PPC Marketing & Google Ads Management | Astro Motions',
  metaDescription:
    'PPC management for Google Ads, Microsoft Ads and paid social — accurate tracking, landing pages that convert and weekly optimisation toward profit.',
  eyebrow: 'PPC marketing',
  h1: 'Paid traffic with a flight plan.',
  lede: 'Pay-per-click is the fastest way to get in front of buyers — and the fastest way to burn a budget. We build campaigns around what a customer is worth to you, track every conversion properly and optimise every week.',
  featuresTitle: "What's in the campaign",
  features: [
    { title: 'Account audit', text: 'A line-by-line review of an existing account: wasted spend, missing negatives, tracking gaps and quick wins.' },
    { title: 'Search campaigns', text: 'Keyword research, match-type strategy and ad copy on Google and Microsoft Ads, structured so budget follows performance.' },
    { title: 'Performance Max & Shopping', text: 'Feed optimisation, asset groups and audience signals for e-commerce and lead-gen accounts that are ready to scale.' },
    { title: 'Paid social', text: 'Meta, LinkedIn and TikTok campaigns with creative made for each placement, not resized from a banner.' },
    { title: 'Conversion tracking', text: 'GA4, Google Tag Manager, enhanced conversions and server-side tagging, so the platforms optimise toward real results.' },
    { title: 'Landing pages', text: 'Fast, focused pages designed to convert paid traffic — built by the same crew that runs the ads.' },
  ],
  processTitle: 'Our campaign cycle',
  process: [
    { title: 'Measure', text: "We fix tracking first. If a lead or sale can't be measured, it can't be optimised." },
    { title: 'Launch', text: 'Campaigns built around your margins and target cost per acquisition, with clear budgets and guardrails.' },
    { title: 'Optimise', text: 'Weekly search-term reviews, bid and budget shifts, and ad and landing-page tests.' },
    { title: 'Report', text: "Spend, conversions, cost per result and revenue in one dashboard — and a monthly call about what's next." },
  ],
  body: `<h2>Built around profit, not clicks</h2>
<p>A cheap click that never converts is the most expensive click in the account. We start with what a lead or sale is actually worth to your business and build bidding, budgets and targeting backwards from that number.</p>
<h2>Ads and pages as one system</h2>
<p>Most wasted spend happens after the click, on a slow or generic landing page. Because we design and build websites too, we can create a landing page for each campaign and test it properly — something ad-only agencies rarely do. See how we approach <a href="/web-design/">web design</a>.</p>
<h2>Transparent by default</h2>
<p>The ad accounts are yours, in your name, with full access. Our fee is agreed up front and never hidden inside your media spend.</p>`,
  faqTitle: 'PPC questions, answered',
  faqs: [
    { q: 'What budget do I need for PPC?', a: 'It depends on your market and cost per click. After the audit we recommend a starting budget that can produce statistically useful results, then scale what works.' },
    { q: 'How quickly will we see results?', a: 'Paid campaigns deliver traffic from day one. Expect two to four weeks of learning and optimisation before performance settles.' },
    { q: 'Do we own the ad accounts?', a: 'Always. Accounts, data and creative stay in your name, and you keep full access whether or not we keep working together.' },
    { q: 'Do you run Google Ads and social ads together?', a: 'Yes. Running search and paid social side by side lets us move budget toward whichever channel is producing the best cost per result.' },
  ],
  ctaTitle: 'Ready for a sharper account?',
  ctaText: "Tell us what you spend and what you need from it. We'll reply with where we'd start.",
  ctaLabel: CTA,
});

/* ── Social media marketing ─────────────────────────────────────────── */
const social = serviceSection('social-media-marketing', {
  name: 'Social media marketing',
  summary: 'Strategy, content and community management that turns followers into an audience.',
  seoTitle: 'Social Media Marketing & Content | Astro Motions',
  metaDescription:
    'Social media marketing that builds an audience: channel strategy, scroll-stopping content and motion design, community management and monthly reporting.',
  eyebrow: 'Social media marketing',
  h1: 'Content with its own pull.',
  lede: 'Feeds reward work that stops the thumb. We plan, design and publish social content with the same motion craft we bring to websites — and manage the conversations it starts.',
  featuresTitle: 'What we handle',
  features: [
    { title: 'Channel strategy', text: 'Which platforms matter for your audience, what each one is for and how often to show up — written down and agreed.' },
    { title: 'Content production', text: 'Posts, carousels, short-form video and motion graphics designed in your brand system, not from a template pack.' },
    { title: 'Publishing calendar', text: 'A monthly calendar you approve in advance, scheduled for the times your audience is actually online.' },
    { title: 'Community management', text: 'Replies, comments and messages handled in your voice, with anything sensitive escalated to you.' },
    { title: 'Creator & partner content', text: 'Collaborations with creators and partners that fit your brand and reach new audiences.' },
    { title: 'Reporting & insight', text: "Reach, engagement, follower growth and traffic to your site each month — with what we learned and what we'll change." },
  ],
  processTitle: 'How we run your channels',
  process: [
    { title: 'Audit', text: 'A look at your channels, competitors and audience to find the gaps and the openings.' },
    { title: 'Strategy', text: 'Content pillars, formats, tone of voice and a posting rhythm, documented in one playbook.' },
    { title: 'Create & publish', text: 'Monthly content produced, approved by you and published on schedule.' },
    { title: 'Learn & refine', text: "We watch what resonates, double down on it and retire what doesn't." },
  ],
  body: `<h2>Made for the feed, not resized for it</h2>
<p>A post has about a second to earn attention. That's a motion-design problem as much as a copywriting one, which is where our background in animation and 3D pays off: content built for each placement, in your visual language, that still looks like you at a glance.</p>
<h2>Social that sends people somewhere</h2>
<p>Followers are only useful if some of them become customers. We connect your social content to your website and campaigns, track the traffic it drives, and pair organic posting with <a href="/ppc-marketing/">paid social</a> when you want reach on demand.</p>`,
  faqTitle: 'Social questions, answered',
  faqs: [
    { q: 'Which platforms do you manage?', a: 'Instagram, LinkedIn, TikTok, Facebook, X, YouTube and Pinterest. We recommend focusing on the two or three where your audience actually spends its time.' },
    { q: 'How many posts will we get each month?', a: 'It depends on the platforms and formats in your plan. We agree a monthly content volume up front and stick to it.' },
    { q: 'Do we approve content before it goes live?', a: "Yes. You review each month's calendar in advance and nothing is published without your sign-off." },
    { q: 'Can you run paid social ads too?', a: 'Yes — paid social is part of our PPC service, and running both together means your best organic posts can be promoted quickly.' },
  ],
  ctaTitle: 'Want a feed people stop for?',
  ctaText: "Tell us about your brand and your channels. We'll reply with a first idea of where to start.",
  ctaLabel: CTA,
});

/* ── Portfolio / Team / Contact / Blog page ─────────────────────────── */
const portfolio = portfolioSection({
  seoTitle: 'Portfolio — Immersive Web Projects | Astro Motions',
  metaDescription:
    'Selected immersive web projects: single continuous experiences where the 3D, the type and the motion were designed as one.',
  eyebrow: 'Portfolio',
  h1: 'Launch log.',
  lede: 'A selection of immersive web projects — each a single continuous experience where the 3D, the type and the motion were designed as one.',
  ctaTitle: 'Your launch could be next.',
  ctaText: 'Tell us what you are building. We take on a handful of projects a year and read every message ourselves.',
  ctaLabel: CTA,
});

const team = teamSection({
  seoTitle: 'Team — One Small Crew | Astro Motions',
  metaDescription:
    'The crew behind Astro Motions: creative direction, motion and 3D, engineering, and search and growth — the people you talk to are the people who build.',
  eyebrow: 'Team',
  h1: 'One small crew, every discipline.',
  lede: 'No account managers and no hand-offs. The people on your first call are the people who design, animate, build and grow your site.',
  membersTitle: 'The crew',
  members: [
    { name: '', role: 'Creative direction', bio: 'Positioning, art direction and the visual system — the reason every page feels like it belongs to the same world.', photo: '', alt: '' },
    { name: '', role: 'Motion & 3D', bio: 'WebGL scenes, scroll choreography and the animation language that gives a site its own gravity.', photo: '', alt: '' },
    { name: '', role: 'Engineering', bio: 'Front ends, performance, the editor and integrations — making the ambitious parts fast, stable and easy to update.', photo: '', alt: '' },
    { name: '', role: 'Search & growth', bio: 'Organic SEO, paid campaigns and social — getting the finished site in front of the people it was built for.', photo: '', alt: '' },
  ],
  valuesTitle: 'How we work',
  values: [
    { title: 'Small on purpose', text: 'We take on a handful of projects at a time, so every one gets senior attention from start to finish.' },
    { title: 'One crew, start to finish', text: 'Strategy, design, build and growth under one roof — nothing lost between agencies.' },
    { title: 'Straight answers', text: "Clear scopes, fixed milestones and honest advice, including when something isn't worth doing." },
  ],
  ctaTitle: 'Want to work with the crew?',
  ctaText: 'Tell us about the project. We reply to every message ourselves, usually within two days.',
  ctaLabel: CTA,
});

const contact = contactSection({
  seoTitle: 'Contact — Book a Launch | Astro Motions',
  metaDescription:
    "Start a project with Astro Motions. Tell us about your website, SEO, PPC or social media goals and we'll reply within two days.",
  eyebrow: 'Contact',
  h1: 'Book a launch.',
  lede: 'Tell us what you are building. A few sentences is plenty — we read every message ourselves and reply within two days.',
  formTitle: 'Tell us about the project',
  email: '',
  responseLine: 'Replies within two working days.',
});

const blog = blogPageSection({
  seoTitle: 'Blog — Web Design, SEO & Growth Notes | Astro Motions',
  metaDescription:
    'Notes from the crew on web design, 3D and motion, SEO, paid media and social — practical, jargon-free and written by the people doing the work.',
  eyebrow: 'Blog',
  h1: 'Transmissions.',
  lede: 'Notes on design, motion, search and growth from the crew — practical, jargon-free and written by the people doing the work.',
  emptyText: 'The first transmission is on its way.',
  moreTitle: 'More transmissions',
  ctaTitle: 'Want this thinking on your site?',
  ctaText: 'Tell us what you are building and where you want it to go.',
  ctaLabel: CTA,
});

/* ── A starter post, so /blog/ is never empty on day one ────────────── */
const starterPost = {
  id: 'starter-invisible-website',
  title: 'Why a beautiful website can still be invisible',
  slug: 'why-a-beautiful-website-can-still-be-invisible',
  status: 'published',
  date: '2026-09-18',
  excerpt: "Design gets attention, but search engines can't see a feeling. Four checks that keep a remarkable website findable.",
  cover: '',
  coverAlt: '',
  tags: 'Web design, SEO',
  seoTitle: 'Why a Beautiful Website Can Still Be Invisible to Google',
  metaDescription:
    "Design gets attention, but search engines can't see a feeling. Four checks before launch that keep an immersive website findable.",
  body: `<p>It's one of the most common stories in our industry: a brand invests in a stunning new website, launches it with pride — and watches organic traffic fall. The design isn't the problem. The problem is that search engines experience a website very differently from people.</p>
<h2>What people see and what Google sees</h2>
<p>People see motion, type and imagery. Search engines see HTML: headings, links, text, structured data and how quickly the page responds. A site built entirely inside a canvas or a slideshow can be breathtaking and still look almost empty to a crawler.</p>
<h2>Four checks before launch</h2>
<ol>
<li><strong>Real text in the HTML.</strong> Every important message should exist as text in the page source, not only inside images, video or 3D scenes.</li>
<li><strong>One clear H1 per page.</strong> Headings tell search engines what each page is about. Use them for structure, not for styling.</li>
<li><strong>Descriptive URLs and titles.</strong> <code>/web-design/</code> beats <code>/page-2/</code>, and every page deserves its own title and meta description.</li>
<li><strong>Speed on real phones.</strong> Heavy effects should scale down on mobile. Core Web Vitals affect rankings and conversions alike.</li>
</ol>
<h2>Keep your redirects</h2>
<p>If you're replacing an old site, map every URL that ranked or earned links to its new home with a permanent redirect. Skipping this step is the fastest way to lose years of search visibility in a weekend.</p>
<h2>The best of both</h2>
<p>Immersive design and strong SEO aren't opposites. Build the experience for people and the structure for search engines, and you get a site that is remembered <em>and</em> found. That's how we approach every <a href="/web-design/">web design</a> project, and it's where our <a href="/organic-seo/">organic SEO</a> work begins.</p>`,
};

export const pageSections = [services, webDesign, organicSeo, ppc, social, portfolio, team, contact, blog];
export const blogSections = [postsSection([starterPost])];
