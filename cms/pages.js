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
// Focus keyword: "web design company". Secondary: custom website design,
// website redesign, responsive web design, web development, SEO-friendly website.
const webDesign = serviceSection('web-design', {
  name: 'Web design',
  summary: 'Custom, fast, search-ready websites — designed and engineered by the same hands.',
  seoTitle: 'Web Design Company for Custom, Fast Websites | Astro Motions',
  metaDescription:
    'A web design company for custom, fast, SEO-friendly websites: strategy, 3D and motion, responsive development and an editor your team can run.',
  eyebrow: 'Web design',
  h1: 'A web design company for sites that hold people in orbit.',
  lede: 'Astro Motions is a small web design company that plans, designs and engineers custom websites in one pass — immersive where it earns attention, instant where it counts, and structured so search engines understand every page from launch day.',
  featuresTitle: "What's in the build",
  features: [
    { title: 'Strategy & site structure', text: 'Positioning, audience and page architecture worked out before a pixel moves, so the site answers the questions buyers actually ask — in the order they ask them.' },
    { title: 'Custom website design', text: 'A visual system with its own type, colour and motion language, applied consistently from the hero to the privacy policy. No theme, no template pack.' },
    { title: '3D & motion', text: 'WebGL scenes, scroll choreography and micro-interactions — used to explain and persuade, never as decoration for its own sake.' },
    { title: 'Responsive web development', text: 'Hand-built front ends with quality tiers for phones, lazy-loaded media and Core Web Vitals checked on real devices before launch.' },
    { title: 'SEO-friendly foundations', text: 'Clean URLs, one H1 per page, structured data, an XML sitemap and titles and descriptions you can edit yourself — no plugins required.' },
    { title: 'An editor you will use', text: 'A simple dashboard for copy, meta tags, pages and blog posts, so the site keeps moving after launch day.' },
  ],
  processTitle: 'From countdown to launch',
  process: [
    { title: 'Discovery', text: 'A working session on goals, audience and competitors. You leave with a sitemap, a content plan and a clear scope.' },
    { title: 'Design', text: 'Key screens and the motion language in high fidelity. You review real layouts in the browser, not static mock-ups.' },
    { title: 'Build', text: 'We engineer the site, wire up the editor and test on real phones, tablets and desktops throughout.' },
    { title: 'Launch & orbit', text: 'Redirects, analytics, Search Console and a performance pass on launch day — then a month of fixes and tuning included.' },
  ],
  body: `<h2>What a web design company should hand you on launch day</h2>
<p>Hiring a web design company should get you more than a set of attractive screens. It should get you a working business tool: pages that answer real questions, a structure search engines can follow, and an editor your team is not afraid to open. That is the standard we hold every custom website design to, whether it is a five-page studio site or a large product site with a blog and a portfolio.</p>
<p>On launch day, every project we deliver includes:</p>
<ul>
<li><strong>A documented sitemap</strong> — every page, its purpose and the search it is meant to answer.</li>
<li><strong>Responsive templates</strong> tested on real phones, tablets and desktops, not just a resized browser window.</li>
<li><strong>Technical SEO basics</strong> — descriptive URLs, one H1 per page, structured data, an XML sitemap and a clean robots.txt.</li>
<li><strong>Analytics and Search Console</strong> connected and verified, so you can see traffic and indexing from the first day.</li>
<li><strong>A redirect map</strong> when we replace an existing site, so old links and rankings carry over.</li>
<li><strong>The editor</strong> and a short walkthrough for whoever will update the site.</li>
</ul>
<h2>Custom website design vs. a template</h2>
<p>Templates are a fine start for some businesses. They become a problem when you need to look different from competitors who bought the same theme, or when the template's structure fights the way your customers actually buy. Custom design starts from your content and your audience instead of from a layout someone else chose.</p>
<h3>A worked example: planning the pages</h3>
<p>Take a hypothetical architecture practice with twelve finished projects, three services and a growing list of press mentions. A template would give it a home page, an "about" page and a gallery. A planned structure looks more like this:</p>
<ul>
<li>A home page that states what the practice designs, for whom and where — in text, not only in imagery.</li>
<li>One page per service (residential, commercial, interiors), each targeting the searches people make for that service.</li>
<li>One page per project with its own title, description and images with alt text, so each project can be found on its own.</li>
<li>A journal for process notes and planning guides, linked to the relevant services.</li>
<li>A contact page with a short form and the practice's location, which matters for local search.</li>
</ul>
<p>Same content, very different result: each page now has one clear job, and search engines have many more ways in.</p>
<h2>Responsive web design, measured</h2>
<p>Most visits now start on a phone, so we design for small screens first and treat speed as a design constraint. Heavy effects are scaled down on weaker devices, images are served in modern formats and sized for the screen, and text pages stay light. Before launch we check the three Core Web Vitals against Google's "good" thresholds: Largest Contentful Paint within 2.5 seconds, Interaction to Next Paint within 200 milliseconds and Cumulative Layout Shift below 0.1.</p>
<h2>Website redesign without losing your rankings</h2>
<p>A redesign is the riskiest moment for search visibility. Before we move anything we export the pages that currently rank or earn links, decide where each one lives on the new site and set up permanent (301) redirects. After launch we watch Search Console for crawl errors and fix them in the first weeks. If your current site is not showing on Google at all, read <a href="/blog/website-not-showing-on-google/">why a beautiful website can stay invisible</a> first.</p>
<h2>Who it's for</h2>
<p>Studios, product companies, consultancies and brands that are judged on how they present themselves — and would rather have one remarkable, well-structured website than a dozen forgettable pages. You can see the kind of work we do in the <a href="/portfolio/">portfolio</a>.</p>
<h2>What shapes the price of a website build</h2>
<p>We fix the price once discovery is done, because the honest answer to "how much?" comes down to a handful of variables:</p>
<ul>
<li>The number of unique page templates (not the number of pages).</li>
<li>How much 3D, animation and custom interaction the concept calls for.</li>
<li>Who writes the content, and how much of it there is.</li>
<li>Integrations such as booking, CRM, newsletters or e-commerce.</li>
<li>The size of any migration from an existing site, and the number of languages.</li>
</ul>
<h2>More than a website</h2>
<p>A site is the centre of your marketing, not the whole of it. Many clients pair a build with <a href="/organic-seo/">organic SEO services</a> so the content plan starts on day one, with <a href="/ppc-marketing/">PPC management</a> to send traffic to purpose-built landing pages, or with <a href="/social-media-marketing/">social media marketing</a> that points people back to it. When you are ready, <a href="/contact/">tell us about the project</a>.</p>`,
  faqTitle: 'Questions before liftoff',
  faqs: [
    { q: 'How long does it take a web design company to build a website?', a: 'Most of our projects run six to ten weeks from discovery to launch. Sites with heavy 3D, lots of new content or a large migration take longer. You get a dated plan after the discovery session, so you know what happens each week.' },
    { q: 'What does a custom website cost?', a: 'The price is set by how many unique templates the site needs, how much 3D and motion it uses, who writes the content, integrations and any migration. You get a fixed quote after discovery, and it only moves if the scope does.' },
    { q: 'Will a 3D website be slow or hurt SEO?', a: 'Not if it is engineered properly. We detect the device, scale effects down on phones and keep every important message as real text in the HTML, so the experience stays smooth and search engines can read the page.' },
    { q: 'Can we update the website ourselves?', a: 'Yes. You get a dashboard for page copy, SEO titles and descriptions, social images, portfolio entries and blog posts — no code and no plugins.' },
    { q: 'Do you redesign existing websites without losing rankings?', a: 'Often. We audit what is working first — pages that rank, links that convert — and carry them across with 301 redirects, then monitor Search Console after launch so you keep the visibility you have earned.' },
    { q: 'Do you write the website content?', a: 'We can. Some clients send finished copy, others want us to write it from interviews and existing material. Either way, we plan the content around what your buyers search for before design starts.' },
  ],
  ctaTitle: 'Ready to leave the ground?',
  ctaText: 'Tell us what you are building. We reply to every message ourselves, usually within two days.',
  ctaLabel: CTA,
});

/* ── Organic SEO ────────────────────────────────────────────────────── */
// Focus keyword: "organic SEO services". Secondary: keyword research,
// technical SEO audit, local SEO, link building, on-page optimisation.
const organicSeo = serviceSection('organic-seo', {
  name: 'Organic SEO',
  summary: "Technical fixes, content and authority that compound — traffic you don't pay for by the click.",
  seoTitle: 'Organic SEO Services for Lasting Traffic | Astro Motions',
  metaDescription:
    'Organic SEO services that compound: keyword research, technical fixes, content, local SEO and earned links — with a plain-language report every month.',
  eyebrow: 'Organic SEO',
  h1: 'Organic SEO services that keep compounding.',
  lede: 'Paid clicks stop the moment the budget does; organic rankings keep working. Our organic SEO services fix what holds your site back, publish what your buyers are searching for and earn the authority that moves you up.',
  featuresTitle: 'What we work on',
  features: [
    { title: 'Technical SEO audit', text: 'Crawlability, indexing, site speed, Core Web Vitals, structured data and internal links — prioritised by impact, not by tool score.' },
    { title: 'Keyword research', text: 'The searches your buyers actually make, grouped by intent and mapped to pages you have or pages you need.' },
    { title: 'On-page SEO', text: 'Titles, headings, copy, media and internal links tuned page by page, so every URL has one clear job.' },
    { title: 'Content that ranks', text: 'Service pages, guides and articles planned around real demand and written to be the best answer on the results page.' },
    { title: 'Local SEO', text: 'Google Business Profile, consistent business listings and location pages for teams that sell to a city or region.' },
    { title: 'Link building & digital PR', text: 'Links earned from relevant publications and partners — no link farms, no private networks, nothing that puts your domain at risk.' },
  ],
  processTitle: 'How a campaign runs',
  process: [
    { title: 'Audit', text: 'A full technical and content audit with a ranked list of fixes and the opportunities worth chasing first.' },
    { title: 'Roadmap', text: 'A 90-day plan: which pages to fix, which to create and which searches to target, agreed with you up front.' },
    { title: 'Execution', text: 'We ship the fixes, write and optimise the content and build authority — month after month.' },
    { title: 'Reporting', text: "A monthly report in plain language: rankings, organic traffic, enquiries and what we're doing next." },
  ],
  body: `<h2>What our organic SEO services cover</h2>
<p>Our organic SEO services work on the three things rankings depend on: a site search engines can crawl and understand, content that answers the search better than anything else on the page, and enough authority for Google to trust it. Fix one and ignore the others and results stall, so we work on all three — in the order that moves the needle fastest for your site.</p>
<h3>What a technical SEO audit checks</h3>
<p>Every engagement starts with an audit. It is not a 200-page export from a tool; it is a ranked list of problems with the fix for each. Typically it covers:</p>
<ul>
<li><strong>Crawling</strong> — robots.txt rules, XML sitemaps, broken links, redirect chains and server errors.</li>
<li><strong>Indexing</strong> — the Page indexing report in Google Search Console, stray noindex tags, and URLs Google crawled but decided to leave out.</li>
<li><strong>Duplicates and canonicals</strong> — HTTP and HTTPS, www and non-www, trailing slashes, filters and tracking parameters creating copies of the same page.</li>
<li><strong>Rendering</strong> — whether content and links built with JavaScript are visible in the rendered HTML Google sees.</li>
<li><strong>Speed</strong> — Core Web Vitals from real users: LCP, INP and CLS on mobile.</li>
<li><strong>Structure</strong> — how many clicks important pages sit from the home page, orphan pages and internal anchor text.</li>
<li><strong>Structured data</strong> — whether schema markup is valid and matches what the page shows.</li>
</ul>
<h3>Keyword research, with an example</h3>
<p>Keyword research is less about volume and more about intent. Imagine a hypothetical physiotherapy clinic in Leeds. Its searches fall into three very different groups:</p>
<ul>
<li><strong>Commercial</strong> — "sports physio Leeds", "physiotherapist for back pain": each deserves a dedicated service page with prices, booking and clear location details.</li>
<li><strong>Informational</strong> — "how long does a sprained ankle take to heal": a helpful guide that links to the relevant treatment page.</li>
<li><strong>Local</strong> — "physio near me": won mostly through the Google Business Profile, reviews and a well-marked-up contact page.</li>
</ul>
<p>Mapping every group to one page stops pages competing with each other and shows exactly which pages are missing.</p>
<h3>On-page optimisation and new content</h3>
<p>Page-level work makes each page's job obvious: a title and H1 that match the search, a first paragraph that answers it, descriptive subheadings, images with alt text and links to related pages. New content is planned from the keyword map, written with your expertise and reviewed by you before it goes live.</p>
<h3>Local SEO and link building</h3>
<p>For businesses that serve a place, the Google Business Profile, matching business details on every directory listing, and genuine reviews often matter as much as the website. Authority comes from links on relevant sites: partners, suppliers, trade bodies, local press and resources worth citing. We earn them; we do not buy them.</p>
<h2>How long organic SEO takes</h2>
<p>SEO is a compounding channel. The first months usually go into removing technical blockers and publishing the pages that were missing; impressions and rankings tend to follow, and qualified traffic builds from there. We agree targets at the start and report against them every month — no vanity metrics.</p>
<h2>Who it's for</h2>
<p>Companies whose buyers research on Google before they get in touch: service firms, clinics, B2B companies, e-commerce stores and local businesses that want a steady flow of enquiries that does not stop when an ad budget does.</p>
<h2>What sets the scope of an SEO campaign</h2>
<ul>
<li>How large the site is and how healthy it is technically — a 30-page site and a 30,000-page store need different effort.</li>
<li>How competitive your searches are, and how far behind the current top results you start.</li>
<li>How much new content the plan needs each month.</li>
<li>Whether local SEO across several locations is in scope.</li>
<li>Whether we can make technical fixes directly or have to work through another developer.</li>
</ul>
<h2>Pairs well with</h2>
<p>A fast, well-structured site makes every SEO hour go further, which is why many clients combine this with <a href="/web-design/">web design</a>. While rankings build, <a href="/ppc-marketing/">PPC management</a> captures demand immediately and shows which keywords convert, and <a href="/social-media-marketing/">social media marketing</a> gets new content seen. If your site is missing from Google entirely, start with our guide to <a href="/blog/website-not-showing-on-google/">why a website isn't showing on Google</a>, or <a href="/contact/">send us your URL</a>.</p>`,
  faqTitle: 'SEO questions, answered',
  faqs: [
    { q: 'How long does SEO take to work?', a: 'Technical fixes can show up within weeks; meaningful ranking and traffic growth usually takes three to six months, depending on competition, the site’s history and how much content is missing.' },
    { q: 'Do you guarantee first-place rankings?', a: "No — and be wary of anyone who does. Nobody controls Google's results. We commit to the work, the targets we agree and complete transparency about what's happening." },
    { q: 'What is the difference between organic SEO and PPC?', a: 'Organic SEO earns unpaid listings in the main search results; PPC buys ad placements that appear as soon as a campaign is live. SEO builds slowly but keeps working; PPC is immediate but stops when the budget does. Many businesses use both.' },
    { q: 'Do you write the content?', a: 'Yes. Our writers work from the keyword plan and your expertise; you review and approve everything before it goes live.' },
    { q: 'Do you offer local SEO?', a: 'Yes. For businesses that serve a city or region we optimise the Google Business Profile, business listings, reviews and location pages alongside the website itself.' },
    { q: 'What do monthly SEO reports include?', a: 'Rankings for the agreed keywords, organic traffic and enquiries from Google Search Console and Analytics, the work completed that month and the plan for the next. You keep access to all of the data.' },
  ],
  ctaTitle: "Let's get you found.",
  ctaText: "Share your site and your goals — we'll reply with a first read on what's holding it back.",
  ctaLabel: CTA,
});

/* ── PPC marketing ──────────────────────────────────────────────────── */
// Focus keyword: "PPC management agency". Secondary: Google Ads management,
// Microsoft Ads, conversion tracking, landing pages, paid social advertising.
const ppc = serviceSection('ppc-marketing', {
  name: 'PPC marketing',
  summary: 'Google, Microsoft and paid social campaigns built around profit, not clicks.',
  seoTitle: 'PPC Management Agency for Google Ads | Astro Motions',
  metaDescription:
    'A PPC management agency running Google Ads, Microsoft Ads and social ads: accurate conversion tracking, landing pages that convert, weekly optimisation.',
  eyebrow: 'PPC marketing',
  h1: 'A PPC management agency with a flight plan.',
  lede: 'Pay-per-click is the fastest way to get in front of buyers — and the fastest way to burn a budget. As a PPC management agency we build campaigns around the value of each customer to your business, track every conversion properly and optimise every week.',
  featuresTitle: "What's in the campaign",
  features: [
    { title: 'Account audit', text: 'A line-by-line review of an existing account: wasted spend, missing negatives, tracking gaps and quick wins.' },
    { title: 'Google Ads management', text: 'Keyword research, match-type strategy and ad copy on Google and Microsoft Ads, structured so budget follows performance.' },
    { title: 'Performance Max & Shopping', text: 'Feed optimisation, asset groups and audience signals for e-commerce and lead-gen accounts that are ready to scale.' },
    { title: 'Paid social advertising', text: 'Meta, LinkedIn and TikTok campaigns with creative made for each placement, not resized from a banner.' },
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
  body: `<h2>How our PPC management agency builds an account</h2>
<p>A good PPC management agency spends more time on structure and measurement than on clever ads. A cheap click that never converts is the most expensive click in the account, so we start with what a lead or sale is actually worth to your business and build bidding, budgets and targeting backwards from that number.</p>
<h3>A sample account structure</h3>
<p>Here is how we might structure Google Ads for a hypothetical kitchen fitter serving one region. The point is separation: each campaign has its own budget and goal, so spend can move to what works.</p>
<ul>
<li><strong>Brand search</strong> — the company's own name. Cheap, high-converting, and it protects the name from competitors bidding on it.</li>
<li><strong>Service search</strong> — one ad group per service ("kitchen fitting", "worktop replacement", "kitchen design"), each with its own ads and a matching landing page. Exact and phrase match first; broad match only once conversion data is reliable.</li>
<li><strong>Location targeting</strong> — the counties they actually serve, with bids adjusted by area once results come in.</li>
<li><strong>Remarketing</strong> — visitors who viewed a service page but did not enquire, with a short, specific message.</li>
<li><strong>Shared negative keywords</strong> — terms like "jobs", "course", "DIY", "free" and "second hand" that attract clicks with no intention to buy.</li>
</ul>
<h3>Conversion tracking comes first</h3>
<p>Before any budget moves we check that every form, call and purchase is recorded once and only once, with a value where possible. Google Ads and Meta both optimise toward whatever you tell them is a conversion; if that signal is wrong, the automation works hard in the wrong direction.</p>
<h3>Ads and landing pages as one system</h3>
<p>Most wasted spend happens after the click, on a slow or generic page. Because we also do <a href="/web-design/">web design</a>, we build a focused landing page for each campaign — one message, one action, fast on a phone — and test it properly, something ad-only agencies rarely do.</p>
<h3>What we check every week</h3>
<ul>
<li>The search terms report, adding negatives and new keywords.</li>
<li>Budget pacing against the month's target.</li>
<li>Cost per conversion by campaign, device, location and time of day.</li>
<li>Ad and landing-page tests, retired when there is a clear winner.</li>
<li>Tracking health — sudden drops usually mean a broken tag, not a broken market.</li>
</ul>
<h2>Search and social ads, side by side</h2>
<p>Search ads catch people who already know what they want; paid social reaches people before they search. Running Google Ads management, Microsoft Ads and paid social advertising side by side lets us move budget toward whichever channel produces the best cost per result, and your strongest <a href="/social-media-marketing/">social content</a> can be promoted quickly.</p>
<h2>Who it's for</h2>
<p>Businesses that need enquiries or sales now — a launch, a new service, a seasonal peak — and companies already spending on ads that want to know where the money goes.</p>
<h2>What sets the cost of PPC management</h2>
<p>You pay two separate things: media spend, billed directly by Google, Microsoft or Meta, and our fee for running it, set before we start and never tucked inside the spend. The fee reflects:</p>
<ul>
<li>The number of platforms and campaigns.</li>
<li>Product feeds for Shopping and Performance Max.</li>
<li>How many landing pages and creative assets are needed.</li>
<li>How complex the tracking is — offline sales and CRM imports take more setup.</li>
</ul>
<h2>Transparent by default</h2>
<p>The ad accounts are yours, in your name, with full access. While ads bring traffic today, <a href="/organic-seo/">organic SEO</a> builds the traffic you will not pay for by the click. See the kind of sites we launch in the <a href="/portfolio/">portfolio</a>, read our <a href="/blog/">guides</a>, or <a href="/contact/">tell us what you spend now</a>.</p>`,
  faqTitle: 'PPC questions, answered',
  faqs: [
    { q: 'What budget do I need for PPC?', a: 'It depends on your market and cost per click. After the audit we recommend a starting budget that can produce statistically useful results, then scale what works.' },
    { q: 'How quickly will we see results from Google Ads?', a: 'Paid campaigns deliver traffic from day one. Expect two to four weeks of learning and optimisation before performance settles, longer for accounts with few conversions.' },
    { q: 'Do we own the ad accounts?', a: 'Always. Accounts, data and creative stay in your name, and you keep full access whether or not we keep working together.' },
    { q: 'How do you charge for PPC management?', a: 'A management fee agreed before we start, separate from your ad spend, which you pay directly to Google, Microsoft or Meta. We never take a hidden margin on media.' },
    { q: 'Will you manage our current Google Ads account?', a: 'Yes. The first step is a review of the account and its tracking; we keep what is working and restructure the rest gradually, so performance history is not thrown away.' },
    { q: 'Do you run Google Ads and social ads together?', a: 'Yes. Running search and paid social side by side lets us move budget toward whichever channel is producing the best cost per result.' },
  ],
  ctaTitle: 'Ready for a sharper account?',
  ctaText: "Tell us what you spend and what you need from it. We'll reply with where we'd start.",
  ctaLabel: CTA,
});

/* ── Social media marketing ─────────────────────────────────────────── */
// Focus keyword: "social media marketing services". Secondary: social media
// management, content creation, community management, paid social, strategy.
const social = serviceSection('social-media-marketing', {
  name: 'Social media marketing',
  summary: 'Strategy, content and community management that turns followers into an audience.',
  seoTitle: 'Social Media Marketing Services & Content | Astro Motions',
  metaDescription:
    'Social media marketing services that build an audience: channel strategy, content creation and motion design, community management and monthly reports.',
  eyebrow: 'Social media marketing',
  h1: 'Social media marketing services with their own pull.',
  lede: 'Feeds reward work that stops the thumb. Our social media marketing services plan, design and publish content with the same motion craft we bring to websites — and manage the conversations it starts.',
  featuresTitle: 'What we handle',
  features: [
    { title: 'Social media strategy', text: 'Which platforms matter for your audience, what each one is for and how often to show up — written down and agreed.' },
    { title: 'Content creation', text: 'Posts, carousels, short-form video and motion graphics designed in your brand system, not from a template pack.' },
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
  body: `<h2>What our social media marketing services include</h2>
<p>Our social media marketing services cover the whole loop: deciding where you should show up, making content worth stopping for, publishing it consistently, answering the people who respond and measuring what it does for the business. A post has about a second to earn attention, which makes social a motion-design problem as much as a copywriting one — and that is where our background in animation and 3D pays off.</p>
<h3>Choosing the right platforms</h3>
<p>Being everywhere usually means being forgettable everywhere. We pick two or three channels based on where your buyers actually spend time: LinkedIn for most B2B services, Instagram and TikTok for consumer brands with something visual to show, YouTube for anything that needs explaining, Pinterest for products people plan around. Each channel gets its own role — reach, trust or conversation — so the content is not the same post copied five times.</p>
<h3>A sample monthly content mix</h3>
<p>To make that concrete, here is an illustrative month for a hypothetical specialty coffee roaster on Instagram and TikTok:</p>
<ul>
<li><strong>Four short-form videos</strong> — brewing how-tos and a behind-the-scenes look at a roast.</li>
<li><strong>Three carousels</strong> — the story of a single origin, a grind-size guide, a "which roast suits you" explainer.</li>
<li><strong>Four single posts</strong> — a new release, a customer photo shared with permission, a café stockist, an event.</li>
<li><strong>Weekly stories</strong> — polls, questions and quick updates that keep the account active between posts.</li>
<li><strong>One creator collaboration</strong> — a home-barista account testing a new blend.</li>
</ul>
<p>The mix shifts every month based on what the numbers say; the pillars behind it stay stable.</p>
<h3>Social media management and community</h3>
<p>Social media management does not end at publishing. We reply to comments and messages in your voice, flag complaints and sales enquiries to the right person quickly, and keep a simple log of recurring questions — which often become the next month's content or a new page on your site.</p>
<h3>Paid social when you need reach on demand</h3>
<p>Organic reach builds slowly. When a launch or an offer needs to reach people now, we promote the posts that are already performing through <a href="/ppc-marketing/">paid social campaigns</a>, targeted and tracked like any other ad spend.</p>
<h2>Measuring what social actually does</h2>
<p>Followers are only useful if some of them become customers. Alongside reach and engagement we track saves, shares, profile visits and link clicks, tag every link so visits show up in your analytics, and connect enquiries back to the channel they came from. The monthly report says what worked, what did not and what changes next.</p>
<h2>Who it's for</h2>
<p>Brands with something worth showing — products, places, craft, expertise — that want a consistent, recognisable presence without building an in-house content team.</p>
<h2>What sets the scope of a social retainer</h2>
<ul>
<li>The number of platforms and the posting rhythm on each.</li>
<li>The formats: video and motion graphics take more production than static posts.</li>
<li>Whether we shoot new footage or work from your existing photos and video.</li>
<li>How much community management and response cover is needed.</li>
<li>Whether creator partnerships or paid promotion are part of the plan.</li>
</ul>
<h2>Social that sends people somewhere</h2>
<p>Social works best when it points to a website that deserves the visit — see our approach to <a href="/web-design/">web design</a> and the sites in our <a href="/portfolio/">portfolio</a>. Content that answers real questions can also rank in search through <a href="/organic-seo/">organic SEO</a>. Read more in the <a href="/blog/">blog</a>, or <a href="/contact/">send us a note about your channels</a>.</p>`,
  faqTitle: 'Social questions, answered',
  faqs: [
    { q: 'Which social media platforms do you manage?', a: 'Instagram, LinkedIn, TikTok, Facebook, X, YouTube and Pinterest. We recommend focusing on the two or three where your audience actually spends its time.' },
    { q: 'How many posts will we get each month?', a: 'It depends on the platforms and formats in your plan. We agree a monthly content volume up front and stick to it.' },
    { q: 'Do we approve content before it goes live?', a: "Yes. You review each month's calendar in advance and nothing is published without your sign-off." },
    { q: 'Do you create video content?', a: 'Yes — short-form video, motion graphics and animated carousels are the core of what we make. We can work from your existing footage, film new material or build it entirely in motion design.' },
    { q: 'How do you measure the ROI of social media marketing?', a: 'We tag every link, track visits and enquiries in your analytics, and report the traffic and leads social sends alongside reach and engagement, so you can see what it contributes to the business.' },
    { q: 'Can you run paid social ads too?', a: 'Yes — paid social is part of our PPC service, and running both together means your best organic posts can be promoted quickly.' },
  ],
  ctaTitle: 'Want a feed people stop for?',
  ctaText: "Tell us about your brand and your channels. We'll reply with a first idea of where to start.",
  ctaLabel: CTA,
});

/* ── Portfolio / Team / Contact / Blog page ─────────────────────────── */
const portfolio = portfolioSection({
  seoTitle: 'Web Design Portfolio: Immersive Websites | Astro Motions',
  metaDescription:
    'Our web design portfolio: custom, immersive websites where 3D, typography and motion were designed together — then engineered to load fast and be found.',
  eyebrow: 'Portfolio',
  h1: "Web design portfolio: immersive websites we've launched.",
  lede: 'A selection of custom websites from our web design portfolio — each built as one continuous piece, with 3D, typography and motion designed together, then engineered to stay fast on phones.',
  // Long-form copy for the portfolio page. portfolioSection() has no body
  // field yet, so this default is only used once the section/template add one.
  body: `<h2>The kind of websites we design and build</h2>
<p>Every project in this web design portfolio started from the same brief, even when the brands had nothing in common: be remembered, and be found. That means custom website design rather than a theme, with a visual language — type, colour, motion and sometimes real-time 3D — built for one brand and nobody else.</p>
<p>What you cannot see in a screenshot matters just as much. Behind each site is a planned page structure, real text in the HTML for every important message, descriptive URLs, structured data and an editor the client's team uses without calling us. Effects are scaled to the device, so a scene that feels cinematic on a desktop still loads quickly on a mid-range phone.</p>
<h3>What to look for as you browse</h3>
<ul>
<li><strong>Immersive web design</strong> — scroll-driven scenes and WebGL used to explain a product or tell a story, not as decoration.</li>
<li><strong>Responsive layouts</strong> designed for small screens first.</li>
<li><strong>Clear paths to action</strong> — every page knows what the visitor should do next.</li>
</ul>
<p>If you are planning a new site or a redesign, read how we approach <a href="/web-design/">web design</a> and <a href="/organic-seo/">organic SEO</a>, browse the <a href="/blog/">blog</a> for practical guides, or <a href="/contact/">start a conversation about your project</a>.</p>`,
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
  seoTitle: 'Contact Us — Web Design & Digital Marketing | Astro Motions',
  metaDescription:
    'Contact Astro Motions, a web design and digital marketing studio. Tell us about your website, SEO, PPC or social media project — we reply within two days.',
  eyebrow: 'Contact',
  h1: 'Contact our web design & digital marketing studio.',
  lede: 'Planning a new website, a redesign, or help with SEO, PPC or social? Tell us what you are building — a few sentences is plenty. Every message is read by the people who would do the work, and you will hear back within two working days.',
  formTitle: 'Tell us about the project',
  email: '',
  responseLine: 'Replies within two working days.',
});

const blog = blogPageSection({
  seoTitle: 'Web Design, SEO & Digital Marketing Blog | Astro Motions',
  metaDescription:
    'Practical guides to web design, SEO, PPC and social — how to get a website found on Google, fix what holds it back and turn visits into enquiries.',
  eyebrow: 'Blog',
  h1: 'Transmissions: web design, SEO and digital marketing guides.',
  lede: 'Hands-on guides to web design, SEO, paid ads and social from the crew — how to get a site found, what holds it back and what to fix first.',
  emptyText: 'The first transmission is on its way.',
  moreTitle: 'More transmissions',
  ctaTitle: 'Want this thinking on your site?',
  ctaText: 'Tell us what you are building and where you want it to go.',
  ctaLabel: CTA,
});

/* ── A starter post, so /blog/ is never empty on day one ────────────── */
// Slug changed 2026-09-28 from why-a-beautiful-website-can-still-be-invisible
// (the router 301s the old URL). Keep the id stable.
const starterPost = {
  id: 'starter-invisible-website',
  title: 'Website Not Showing on Google? 9 Reasons a Beautiful Site Stays Invisible',
  slug: 'website-not-showing-on-google',
  status: 'published',
  date: '2026-09-18',
  updated: '2026-09-28',
  excerpt:
    "Your website looks great but won't show up on Google? Here are nine common reasons — from a stray noindex tag to slow pages — how to check each one and how to fix it.",
  cover: '/blog/website-not-showing-on-google-cover.webp',
  coverAlt: 'Illustration: a site: search returning no results next to a halftone planet, titled "Website not showing on Google?"',
  tags: 'SEO, Web design, Google Search Console, Technical SEO',
  seoTitle: 'Website Not Showing on Google? 9 Reasons and Fixes',
  metaDescription:
    "Website not showing on Google? Nine common causes — robots.txt, noindex, canonicals, JavaScript, thin content, links, speed — and how to fix each.",
  body: `<p>You launched a website you are proud of. It looks sharp, it moves beautifully, and your team loves it. Then someone searches for you — and it is nowhere. If your website is not showing on Google, the design is rarely the problem. The problem is that search engines experience a site very differently from people: they read code, follow links and make decisions about what deserves a place in the index.</p>
<p>This guide walks through the nine most common reasons a site stays invisible, with a clearly hypothetical example for each, how to check it yourself and how to fix it. None of it needs special software beyond <strong>Google Search Console</strong>, which is free.</p>
<h2>First: is the site missing, or just not ranking?</h2>
<p>"Not showing on Google" can mean two very different things, and the fix depends on which one you have.</p>
<ul>
<li><strong>Not indexed</strong> — Google has not stored the page at all, so it cannot appear for any search.</li>
<li><strong>Indexed but not ranking</strong> — Google has the page, but it appears so far down the results that nobody sees it.</li>
</ul>
<p>Two quick checks tell them apart. Search Google for <code>site:yourdomain.com</code> to see a rough sample of the pages it has indexed (the count is an estimate, not an audit). Then open Search Console, paste a URL into <strong>URL Inspection</strong> and read the verdict: "URL is on Google" or "URL is not on Google", with the reason. The <strong>Page indexing</strong> report then shows which pages are excluded across the whole site and why.</p>
<figure><img src="/blog/website-not-showing-on-google-infographic.webp" alt="Diagram of the four steps Google takes — crawl, render, index, rank — with what blocks each step, such as robots.txt rules, content hidden in canvas, noindex tags and slow Core Web Vitals" width="1600" height="1060"><figcaption>A page has to be crawled, rendered and indexed before it can rank. Each of the nine reasons below breaks one of these steps.</figcaption></figure>
<h2>1. Google hasn't found the site yet</h2>
<p>Google discovers pages by following links and reading sitemaps. A brand-new domain with no links pointing to it and no sitemap submitted can sit undiscovered for a while.</p>
<p><strong>Example:</strong> a hypothetical bakery launches a new site on a fresh domain. Its old social profiles still link to the previous address, nobody has linked to the new one and no sitemap was submitted. Google has no path to it.</p>
<p><strong>How to check:</strong> URL Inspection says "URL is not on Google", and the Page indexing report may list pages as "Discovered – currently not indexed" or not list them at all.</p>
<p><strong>How to fix:</strong> verify the domain in Search Console, submit your XML sitemap under <strong>Sitemaps</strong>, update your social profiles and business listings to the new address, and use "Request indexing" for the most important pages. Then be patient — discovery on a new domain can take days to weeks.</p>
<h2>2. robots.txt is blocking Google</h2>
<p>The robots.txt file tells crawlers which parts of a site they may visit. A single line — <code>Disallow: /</code> — blocks the whole site, and it is surprisingly often left over from a staging server.</p>
<p><strong>Example:</strong> a hypothetical agency builds a client site on a staging domain with crawling blocked, copies the files to the live domain on launch day and forgets the robots.txt came too.</p>
<p><strong>How to check:</strong> open <code>yourdomain.com/robots.txt</code> in a browser and look for <code>Disallow</code> rules covering pages you want found. In Search Console, look for "Blocked by robots.txt" in the Page indexing report, and check the robots.txt report under Settings.</p>
<p><strong>How to fix:</strong> remove or narrow the rule, make sure the file lists your sitemap, and request indexing again. Note that robots.txt controls crawling, not indexing: a blocked URL can still appear without a description, and Google cannot see a noindex tag on a page it is not allowed to fetch.</p>
<h2>3. A noindex tag was left on</h2>
<p>A <code>noindex</code> robots meta tag — or an <code>X-Robots-Tag: noindex</code> HTTP header — tells Google not to include a page even if it crawls it. Many website builders and CMS plugins have a "discourage search engines" switch that adds it everywhere.</p>
<p><strong>Example:</strong> a hypothetical consultancy ticks "hide site from search engines" while the site is being built and nobody unticks it at launch.</p>
<p><strong>How to check:</strong> URL Inspection reports "Excluded by 'noindex' tag". You can also view the page source and search for "noindex", or check the response headers in your browser's developer tools.</p>
<p><strong>How to fix:</strong> remove the tag or header (or switch the CMS setting off), then request indexing for key pages.</p>
<h2>4. The canonical tag points somewhere else</h2>
<p>A canonical tag tells Google which URL is the "original" when several addresses show the same content. If it points to the wrong URL, Google will index that one instead — or nothing useful at all.</p>
<p><strong>Example:</strong> a hypothetical online shop's template sets every product page's canonical to the home page, so Google treats hundreds of products as duplicates of it.</p>
<p><strong>How to check:</strong> in URL Inspection, compare the "User-declared canonical" with the "Google-selected canonical". In the Page indexing report, look for "Alternate page with proper canonical tag" or "Duplicate, Google chose different canonical than user" on pages that should stand alone.</p>
<p><strong>How to fix:</strong> give each page a self-referencing canonical on its preferred, live HTTPS address, and redirect the variants (http, non-www, trailing slash or not) to it.</p>
<h2>5. The content only exists in JavaScript, images or a canvas</h2>
<p>Google renders JavaScript, but it reads text, not pictures of text. Words painted into a WebGL canvas, baked into an image or buried in a video are, for search purposes, close to invisible. Links built without a real <code>&lt;a href&gt;</code> may not be followed at all.</p>
<p><strong>Example:</strong> a hypothetical bakery's menu is a beautifully designed image. People can read "sourdough", "cinnamon buns" and "gluten-free" — Google sees one picture with no text, so the page never appears for those searches.</p>
<p><strong>How to check:</strong> in URL Inspection, run <strong>Test live URL</strong>, then <strong>View tested page</strong> and read the rendered HTML. If your headline, prices or product names are not there as text, Google does not have them. Viewing the page with JavaScript switched off is a quick second test.</p>
<p><strong>How to fix:</strong> put every important message in real HTML text, even if the design also shows it visually. Keep one clear H1 per page, use proper links, and give meaningful images descriptive alt text. Immersive design is fine — it just needs real text alongside it.</p>
<h2>6. The pages are thin or duplicated</h2>
<p>Google does not index everything it crawls. Pages that add little — a few lines of text, near-copies of other pages, auto-generated location pages — are often crawled and then left out.</p>
<p><strong>Example:</strong> a hypothetical plumber publishes forty "plumber in [town]" pages with the same paragraph and only the town name changed. Most of them are never indexed.</p>
<p><strong>How to check:</strong> look for "Crawled – currently not indexed" and "Duplicate without user-selected canonical" in the Page indexing report. Then compare your page honestly with the pages that do rank for the search.</p>
<p><strong>How to fix:</strong> merge thin pages into fewer, stronger ones, and make each remaining page genuinely useful: specific details, real answers, examples and clear next steps. Fewer good pages beat many empty ones.</p>
<h2>7. Nothing links to the page</h2>
<p>An orphan page is one that no other page on your site links to. Google may never find it, and even if it is in the sitemap, the lack of internal links signals that it is not important.</p>
<p><strong>Example:</strong> a hypothetical studio publishes a detailed case study but only shares it on social media. It is not linked from the portfolio, the menu or any related service page.</p>
<p><strong>How to check:</strong> crawl your site with any SEO crawler and compare the URLs it finds with the URLs in your sitemap; pages in the sitemap but missing from the crawl are orphans. Search Console's <strong>Links</strong> report also shows your most internally linked pages.</p>
<p><strong>How to fix:</strong> link every important page from at least one relevant page, using descriptive anchor text ("our <a href="/organic-seo/">organic SEO services</a>", not "click here"), and keep key pages within a few clicks of the home page.</p>
<h2>8. The site has no authority yet</h2>
<p>This one is about ranking rather than indexing. Links from other websites are still one of the ways Google judges whether a site is trustworthy. A new site with no mentions anywhere usually ranks only for its own brand name at first.</p>
<p><strong>Example:</strong> a hypothetical interior designer's site is fully indexed and appears when you search the studio's name, but not for "interior designer" in its city, where competitors have years of press, directory listings and partner links.</p>
<p><strong>How to check:</strong> Search Console's Links report shows "Top linking sites". If the list is empty or full of irrelevant directories, authority is the gap.</p>
<p><strong>How to fix:</strong> earn links rather than buy them — suppliers and partners, trade associations, local press, a complete Google Business Profile and content useful enough that others cite it. It is slow, and it compounds.</p>
<h2>9. The site is slow on real phones</h2>
<p>Speed rarely stops a page being indexed, but it affects how well it ranks and how many visitors stay. Google measures real-user experience with three <strong>Core Web Vitals</strong>, and a page passes when at least 75% of real visits (the 75th percentile) meet each threshold:</p>
<ul>
<li><strong>Largest Contentful Paint (LCP)</strong> — the main content appears within <strong>2.5 seconds</strong>.</li>
<li><strong>Interaction to Next Paint (INP)</strong> — the page responds to taps and clicks within <strong>200 milliseconds</strong>.</li>
<li><strong>Cumulative Layout Shift (CLS)</strong> — the layout moves less than <strong>0.1</strong> while loading.</li>
</ul>
<p><strong>Example:</strong> a hypothetical architecture practice opens its home page with an uncompressed 12 MB video and a 3D model. On office Wi-Fi it feels fine; on a phone on 4G the headline takes several seconds to appear.</p>
<p><strong>How to check:</strong> the <strong>Core Web Vitals</strong> report in Search Console groups your URLs as good, needs improvement or poor. PageSpeed Insights shows the same field data for a single URL, plus lab suggestions.</p>
<p><strong>How to fix:</strong> compress and correctly size images and video, lazy-load anything below the fold, reserve space for images and embeds so the layout does not jump, cut unused JavaScript, and scale heavy effects down on weaker devices.</p>
<figure><img src="/blog/website-not-showing-on-google-checklist.webp" alt="Checklist of nine indexing checks — sitemap, robots.txt, noindex, canonical, real HTML text, useful content, internal links, outside links and Core Web Vitals — with where to check each one" width="1600" height="1280"><figcaption>The indexing checklist. Checks 1–4 decide whether a page can be indexed at all; 5–9 decide how well it ranks.</figcaption></figure>
<h2>Summary: problems, symptoms and fixes</h2>
<table>
<thead><tr><th>Problem</th><th>Symptom</th><th>How to check</th><th>Fix</th></tr></thead>
<tbody>
<tr><td>Not discovered</td><td>New site missing entirely</td><td>URL Inspection, Sitemaps report</td><td>Submit sitemap, add links, request indexing</td></tr>
<tr><td>robots.txt block</td><td>"Blocked by robots.txt"</td><td>yourdomain.com/robots.txt</td><td>Remove the Disallow rule</td></tr>
<tr><td>noindex left on</td><td>"Excluded by 'noindex' tag"</td><td>URL Inspection, page source</td><td>Remove tag or header</td></tr>
<tr><td>Wrong canonical</td><td>Another URL indexed instead</td><td>User- vs Google-selected canonical</td><td>Self-referencing canonicals, redirects</td></tr>
<tr><td>Text not in HTML</td><td>Indexed but invisible for key terms</td><td>Rendered HTML in URL Inspection</td><td>Real text, real links, alt text</td></tr>
<tr><td>Thin or duplicate pages</td><td>"Crawled – currently not indexed"</td><td>Page indexing report</td><td>Merge and improve content</td></tr>
<tr><td>Orphan pages</td><td>Pages found late or never</td><td>Site crawl vs sitemap</td><td>Internal links with clear anchors</td></tr>
<tr><td>No authority</td><td>Ranks for brand name only</td><td>Links report</td><td>Earn relevant links and mentions</td></tr>
<tr><td>Slow on mobile</td><td>Poor Core Web Vitals</td><td>Core Web Vitals report</td><td>Lighter media, less JS, stable layout</td></tr>
</tbody>
</table>
<h2>Frequently asked questions</h2>
<h3>How long does it take a new website to show up on Google?</h3>
<p>There is no fixed time. Some pages are indexed within days of submitting a sitemap; on a brand-new domain with no links it can take a few weeks. Ranking for competitive searches takes much longer than being indexed.</p>
<h3>Does submitting a sitemap guarantee my pages will be indexed?</h3>
<p>No. A sitemap helps Google find pages; it does not oblige Google to index them. Pages still need to be crawlable, free of noindex tags and worth indexing.</p>
<h3>Why does my site appear for its name but not for my services?</h3>
<p>That usually means it is indexed but not ranking. Look at reasons 5 to 9: whether your service pages have real, specific text, whether they are linked internally, whether other sites mention you and how fast the pages are.</p>
<h3>Can I pay Google to index my site faster?</h3>
<p>No. Ads appear in their own labelled slots and have no effect on organic indexing or rankings. <a href="/ppc-marketing/">PPC</a> can bring traffic while SEO builds, but the two are separate systems.</p>
<h2>The best of both</h2>
<p>A remarkable website and strong search visibility are not opposites. Build the experience for people and the structure for search engines, and you get a site that is remembered <em>and</em> found. That is how we approach every <a href="/web-design/">web design</a> project, and it is where our <a href="/organic-seo/">organic SEO</a> work begins. If you have worked through this list and your site is still missing, <a href="/contact/">send us the URL</a> — we will tell you what we see.</p>`,
};

// The Services hub and the Team page were retired (2026-09-28): /services/ 301s
// to /#services and /team/ to / (server/pages.js LEGACY_REDIRECTS).
export const pageSections = [webDesign, organicSeo, ppc, social, portfolio, contact, blog];
export const blogSections = [postsSection([starterPost])];
