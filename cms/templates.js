/* ═══════════════════════════════════════════════════════════════════════
   cms/templates.js — HTML for list-type content (work cards, process steps, socials) plus the
   escaping helpers, shared by the server renderer and the dev client.
   ═══════════════════════════════════════════════════════════════════════ */

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Escaped text with line breaks kept (textarea fields). */
export const multiline = (s) => esc(s).replace(/\r?\n/g, '<br />');

/** Escaped text where *word* becomes <em>word</em> (rich fields). */
export const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

/** One <span class="ch"> per character (the hero wordmark). */
export const letters = (s) =>
  [...String(s ?? '')].map((ch) => `<span class="ch">${esc(ch)}</span>`).join('');

import { socialIcon, socialLabel } from './icons.js';

export const safeHref = (h) => {
  const s = String(h ?? '').trim();
  return /^(https?:)?\/\//i.test(s) || s.startsWith('/') || s.startsWith('#') ? s : '#';
};

export const lists = {
  work: (items) =>
    items
      .map(
        (it, i) => `
            <a class="wk" href="${esc(safeHref(it.href))}" target="_blank" rel="noopener">
              <figure class="wk-media">${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.alt || it.title || '')}" loading="lazy" width="1600" height="1000" />` : ''}</figure>
              <div class="wk-info">
                <span class="wk-n">${String(i + 1).padStart(2, '0')}</span>
                <div class="wk-text">
                  <h3 class="wk-title">${esc(it.title)}</h3>
                  <p class="wk-meta">${esc(it.meta)}</p>
                  <p class="wk-desc">${multiline(it.description)}</p>
                  <ul class="wk-tags">${String(it.tags || '')
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t) => `<li>${esc(t)}</li>`)
                    .join('')}</ul>
                </div>
                <span class="wk-go" aria-hidden="true">↗</span>
              </div>
            </a>`
      )
      .join('\n'),

  // the home page's process steps
  process: (items) =>
    (Array.isArray(items) ? items : [])
      .filter((it) => it && (it.title || it.text))
      .map(
        (it, i) => `
            <li class="step">
              <span class="step-n">${esc(it.n || String(i + 1).padStart(2, '0'))}</span>
              <h3 class="step-title">${esc(it.title)}</h3>
              <p class="step-text">${multiline(it.text)}</p>
            </li>`
      )
      .join('\n'),

  // social profile icons — only entries with a real http(s) URL render
  socials: (items) =>
    (Array.isArray(items) ? items : [])
      .filter((it) => it && /^https?:\/\//i.test(String(it.url || '').trim()) && socialIcon(it.network))
      .map(
        (it) =>
          `<a class="social-link" href="${esc(String(it.url).trim())}" target="_blank" rel="noopener me" aria-label="${esc(socialLabel(it.network))}" title="${esc(socialLabel(it.network))}">${socialIcon(it.network)}</a>`
      )
      .join(''),
};
