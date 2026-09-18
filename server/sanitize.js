/* ═══════════════════════════════════════════════════════════════════════
   server/sanitize.js — the HTML allowlist for rich text (blog posts, page
   body copy) and the slug rule for blog URLs. Everything the dashboard
   saves as HTML passes through cleanHtml() on save AND on render.
   ═══════════════════════════════════════════════════════════════════════ */
import sanitize from 'sanitize-html';

const OPTIONS = {
  allowedTags: [
    'p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
    'blockquote', 'img', 'figure', 'figcaption', 'hr', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  transformTags: {
    h1: 'h2', // the page title is the only H1
    b: 'strong',
    i: 'em',
    div: 'p',
    a: (tagName, attribs) => {
      const out = { ...attribs };
      if (out.target === '_blank') out.rel = 'noopener noreferrer';
      else delete out.target;
      return { tagName: 'a', attribs: out };
    },
    img: (tagName, attribs) => ({ tagName: 'img', attribs: { ...attribs, loading: 'lazy' } }),
  },
  // contenteditable leaves <p><br></p> behind — drop empty blocks
  exclusiveFilter: (frame) =>
    ['p', 'h2', 'h3', 'h4', 'li', 'blockquote', 'figcaption'].includes(frame.tag) &&
    !frame.text.trim() &&
    !(frame.mediaChildren && frame.mediaChildren.length),
};

export const cleanHtml = (html) => sanitize(String(html ?? ''), OPTIONS).trim();

/** "Why a Beautiful Website…" → "why-a-beautiful-website" */
export function slugify(s) {
  return String(s ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/** Plain text of an HTML fragment (for reading time, fallbacks, RSS). */
export const textOf = (html) =>
  String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
