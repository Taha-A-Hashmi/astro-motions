/* ═══════════════════════════════════════════════════════════════════════
   server/sanitize.js — the HTML allowlist for rich text (blog posts, page
   body copy) and the slug rule for blog URLs. Everything the dashboard
   saves as HTML passes through cleanHtml() on save AND on render.

   Deliberately dependency-free: sanitize-html pulls in an ESM-only
   htmlparser2 that Vercel's function runtime cannot require(), which took
   the whole site down on 2026-09-18. This is a small tokenizer: allowed
   tags are rebuilt from scratch with only allowed attributes; everything
   else is dropped (script-like tags together with their content); stray
   text is escaped; unclosed tags are closed.
   ═══════════════════════════════════════════════════════════════════════ */

const ALLOWED = new Set([
  'p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
  'blockquote', 'img', 'figure', 'figcaption', 'hr', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);
const RENAME = { h1: 'h2', b: 'strong', i: 'em', strike: 's', del: 's', div: 'p' };
const VOID = new Set(['br', 'img', 'hr']);
// dropped together with everything inside them
const DROP_CONTENT = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'math',
  'textarea', 'select', 'option', 'title', 'head', 'button', 'form', 'frameset', 'frame', 'canvas', 'video', 'audio',
]);
// a new <li> / <p> implicitly closes an open one, as browsers do
const AUTO_CLOSE = { li: ['li'], p: ['p'], tr: ['tr', 'td', 'th'], td: ['td', 'th'], th: ['td', 'th'] };
const ATTRS = {
  a: ['href', 'title', 'target'],
  img: ['src', 'alt', 'width', 'height'],
  th: ['colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
};

const TAG_RE =
  /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\?[^>]*>|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;
const ATTR_RE = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
// built from char codes so no editor/encoding step can mangle them
const CONTROL_RE = new RegExp(`[${String.fromCharCode(0)}-${String.fromCharCode(0x20)}${String.fromCharCode(0x7f)}-${String.fromCharCode(0x9f)}]`, 'g');
const COMBINING_RE = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, 'g');

/** Escape text but keep entities that are already there (&amp; &nbsp; &#39;…). */
const escText = (t) =>
  t
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#x[0-9a-fA-F]{1,6});)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const escAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const decode = (v) =>
  String(v)
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]{1,6});?/gi, (m, h) => safeCodePoint(parseInt(h, 16)))
    .replace(/&#(\d{1,7});?/g, (m, d) => safeCodePoint(Number(d)))
    .replace(/&amp;/g, '&');
const safeCodePoint = (n) => (n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '');

/** Only http(s)/mailto/tel URLs, or relative ones. Blocks javascript:, data: … */
function safeUrl(raw, { image = false } = {}) {
  const v = decode(raw).trim();
  // browsers ignore whitespace/control characters inside a scheme — so do we
  const probe = v.replace(CONTROL_RE, '');
  if (!probe) return null;
  if (probe.startsWith('//') || probe.startsWith('\\\\')) return null; // protocol-relative
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(probe);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    const ok = image ? ['http', 'https'] : ['http', 'https', 'mailto', 'tel'];
    return ok.includes(s) ? v.replace(CONTROL_RE, (c) => (c === ' ' ? '%20' : '')) : null;
  }
  return v.replace(CONTROL_RE, (c) => (c === ' ' ? '%20' : '')); // relative: /page/, #anchor, image.jpg
}

function cleanAttrs(tag, raw) {
  const allowed = ATTRS[tag];
  const out = {};
  if (allowed && raw) {
    ATTR_RE.lastIndex = 0;
    let m;
    while ((m = ATTR_RE.exec(raw))) {
      const name = m[1].toLowerCase();
      if (!allowed.includes(name) || name in out) continue;
      const value = m[2] ?? m[3] ?? m[4] ?? '';
      if (name === 'href') {
        const u = safeUrl(value);
        if (u) out.href = u;
      } else if (name === 'src') {
        const u = safeUrl(value, { image: true });
        if (u) out.src = u;
      } else if (name === 'target') {
        if (decode(value).trim() === '_blank') out.target = '_blank';
      } else if (['width', 'height', 'colspan', 'rowspan'].includes(name)) {
        if (/^\d{1,4}$/.test(value.trim())) out[name] = value.trim();
      } else {
        out[name] = decode(value).slice(0, 300);
      }
    }
  }
  if (tag === 'img') {
    if (!out.src) return null; // an image without a usable source is dropped
    out.loading = 'lazy';
  }
  if (tag === 'a' && out.target === '_blank') out.rel = 'noopener noreferrer';
  return Object.entries(out)
    .map(([k, v]) => ` ${k}="${escAttr(v)}"`)
    .join('');
}

export function cleanHtml(input) {
  const html = String(input ?? '');
  const out = [];
  const stack = [];
  let dropTag = null;
  let dropDepth = 0;
  let last = 0;
  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(html))) {
    if (!dropTag) out.push(escText(html.slice(last, m.index)));
    last = TAG_RE.lastIndex;
    if (!m[2]) continue; // comment, doctype, CDATA, processing instruction
    const closing = m[1] === '/';
    let tag = m[2].toLowerCase();
    const selfClosing = m[0].endsWith('/>');

    if (dropTag) {
      if (tag === dropTag) {
        if (closing) dropDepth -= 1;
        else if (!selfClosing) dropDepth += 1;
        if (dropDepth <= 0) dropTag = null;
      }
      continue;
    }
    if (DROP_CONTENT.has(tag)) {
      // drop the element with its content — but only when it is actually
      // closed later; an unclosed <svg> must not swallow the rest of a post
      if (!closing && !selfClosing && new RegExp(`</${tag}\\s*>`, 'i').test(html.slice(last))) {
        dropTag = tag;
        dropDepth = 1;
      }
      continue;
    }
    tag = RENAME[tag] || tag;
    if (!ALLOWED.has(tag)) continue; // unknown wrapper (span, font…): keep its text only

    if (closing) {
      const at = stack.lastIndexOf(tag);
      if (at === -1) continue; // stray closer
      while (stack.length > at) out.push(`</${stack.pop()}>`);
      continue;
    }
    const closes = AUTO_CLOSE[tag];
    if (closes && stack.length && closes.includes(stack[stack.length - 1])) out.push(`</${stack.pop()}>`);
    const attrs = cleanAttrs(tag, m[3] || '');
    if (attrs === null) continue;
    out.push(`<${tag}${attrs}>`);
    if (!VOID.has(tag)) stack.push(tag);
  }
  if (!dropTag) out.push(escText(html.slice(last)));
  while (stack.length) out.push(`</${stack.pop()}>`);

  // contenteditable leaves <p><br></p> behind — drop empty blocks
  let result = out.join('');
  let prev;
  do {
    prev = result;
    result = result.replace(/<(p|h2|h3|h4|li|blockquote|figcaption|strong|em|u|s)>(?:\s|&nbsp;|<br>)*<\/\1>/g, '');
  } while (result !== prev);
  return result.trim();
}

/** "Why a Beautiful Website…" → "why-a-beautiful-website" */
export function slugify(s) {
  return String(s ?? '')
    .normalize('NFKD')
    .replace(COMBINING_RE, '')
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
