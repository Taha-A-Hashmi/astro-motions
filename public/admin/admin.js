/* ═══════════════════════════════════════════════════════════════════════
   admin.js — the site editor. One page, no framework.

   Talks to:
     GET  /api/admin/schema    sections + defaults (+ site name/accent)
     GET  /api/admin/content   saved values
     PUT  /api/admin/content   save
     POST /api/admin/upload    images
     POST /api/admin/preview   render an unsaved blog post
     GET  /api/inquiries       form entries (+ PATCH /api/inquiries/:id)
   Auth is the editor password sent as a Bearer token.

   Sections come from cms/schema.js, grouped in the sidebar (Settings,
   Home page, Pages, Blog). A section with `page` is a real URL and gets
   a Google preview + "View page"; `special: 'posts'` is the blog editor.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v !== false && v !== null && v !== undefined) el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return el;
  };
  const clone = (v) => JSON.parse(JSON.stringify(v ?? null));
  const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const slugify = (s) =>
    String(s ?? '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/g, '');
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

  /* ── State ──────────────────────────────────────────────────────────── */
  const state = {
    token: sessionStorage.getItem('editor.token') || localStorage.getItem('editor.token') || '',
    schema: null,
    defaults: {},
    saved: {}, // as on the server
    values: {}, // being edited
    section: location.hash.replace('#', '') || 'seo',
    postEdit: null, // { draft } while a blog post is open
    dirty: false,
    saving: false,
  };
  const deepEq = (a, b) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '');
  const siteOrigin = () => (state.schema?.site?.url || location.origin + '/').replace(/\/$/, '');

  /* ── API ────────────────────────────────────────────────────────────── */
  async function api(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}`, ...(opts.headers || {}) },
    });
    if (res.status === 401) throw Object.assign(new Error('Wrong password'), { status: 401 });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.ok === false) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { status: res.status });
    return body;
  }

  /* ── Boot / login ───────────────────────────────────────────────────── */
  const loginEl = $('#login');
  const appEl = $('#app');

  async function boot() {
    if (!state.token) return showLogin();
    try {
      const [schema, content] = await Promise.all([api('/api/admin/schema'), api('/api/admin/content')]);
      state.schema = schema;
      state.defaults = schema.defaults || {};
      state.saved = content.values || {};
      state.values = clone(state.saved);
      document.documentElement.style.setProperty('--accent', schema.site.accent || '#2271b1');
      document.documentElement.style.setProperty('--accent-ink', '#1d2327');
      $('#side-name').textContent = schema.site.name;
      document.title = `${schema.site.name} · Site editor`;
      loginEl.hidden = true;
      appEl.hidden = false;
      renderNav();
      renderSection();
      loadInquiryCount();
    } catch (err) {
      if (err.status === 401) {
        showLogin(state.token ? 'That password was not accepted.' : '');
        state.token = '';
        sessionStorage.removeItem('editor.token');
        localStorage.removeItem('editor.token');
      } else {
        showLogin(`Could not reach the site's API: ${err.message}`);
      }
    }
  }
  function showLogin(message = '') {
    appEl.hidden = true;
    loginEl.hidden = false;
    const err = $('#login-err');
    err.textContent = message;
    err.hidden = !message;
    $('#login-token').focus();
  }
  $('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.token = $('#login-token').value.trim();
    if ($('#login-remember').checked) localStorage.setItem('editor.token', state.token);
    else sessionStorage.setItem('editor.token', state.token);
    boot();
  });
  $('#logout').addEventListener('click', () => {
    if (state.dirty && !confirm('You have unsaved changes. Sign out anyway?')) return;
    sessionStorage.removeItem('editor.token');
    localStorage.removeItem('editor.token');
    location.reload();
  });

  /* ── Navigation ─────────────────────────────────────────────────────── */
  function renderNav() {
    const nav = $('#side-nav');
    nav.innerHTML = '';
    let group = null;
    for (const s of state.schema.sections) {
      if (s.group && s.group !== group) {
        group = s.group;
        nav.append(h('div', { class: 'nav-group' }, group));
      }
      nav.append(h('button', { type: 'button', class: s.id === state.section ? 'active' : '', onclick: () => go(s.id) }, s.title));
    }
    nav.append(h('div', { class: 'sep' }));
    nav.append(h('button', { type: 'button', id: 'nav-inquiries', class: state.section === 'inquiries' ? 'active' : '', onclick: () => go('inquiries') }, 'Form entries', h('span', { class: 'badge', id: 'inq-badge', hidden: true })));
    nav.append(h('button', { type: 'button', class: state.section === 'help' ? 'active' : '', onclick: () => go('help') }, 'Help'));
  }
  function go(id) {
    state.section = id;
    state.postEdit = null;
    location.hash = id;
    renderNav();
    renderSection();
    window.scrollTo(0, 0);
  }

  /* ── Dirty tracking + save ──────────────────────────────────────────── */
  function setDirty() {
    state.dirty = !deepEq(state.values, state.saved);
    const status = $('#status');
    status.className = 'topbar-status' + (state.dirty ? ' dirty' : '');
    status.textContent = state.dirty ? 'Unsaved changes' : 'All changes saved';
    $('#save').disabled = !state.dirty || state.saving;
    $('#discard').disabled = !state.dirty || state.saving;
  }
  window.addEventListener('beforeunload', (e) => {
    if (state.dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  $('#discard').addEventListener('click', () => {
    if (!confirm('Throw away your unsaved changes?')) return;
    state.values = clone(state.saved);
    if (state.postEdit) {
      const back = (get('blog.posts') || []).find((p) => p.id === state.postEdit.draft.id);
      state.postEdit = back ? { draft: clone(back) } : null;
    }
    setDirty();
    renderSection();
  });
  $('#save').addEventListener('click', () => save());
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (state.dirty) save();
    }
  });
  async function save(message = 'Saved. The live site updates within about a minute.') {
    if (state.saving) return false;
    state.saving = true;
    const status = $('#status');
    status.className = 'topbar-status saving';
    status.textContent = 'Saving…';
    $('#save').disabled = true;
    try {
      const res = await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ values: state.values }) });
      state.saved = res.values || {};
      state.values = clone(state.saved);
      // the server finalises slugs/ids — pick the open post back up from it
      if (state.postEdit) {
        const fresh = (get('blog.posts') || []).find((p) => p.id === state.postEdit.draft.id);
        if (fresh) state.postEdit = { draft: clone(fresh) };
      }
      toast(message);
      renderSection();
      return true;
    } catch (err) {
      status.className = 'topbar-status err';
      status.textContent = err.message;
      toast(err.message, true);
      if (err.status === 401) showLogin('Your session expired — sign in again.');
      return false;
    } finally {
      state.saving = false;
      setDirty();
    }
  }
  let toastTimer;
  function toast(msg, isErr = false) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast' + (isErr ? ' err' : '');
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 3600);
  }

  /* ── Values: saved overrides default; '' means "use default" ────────── */
  const get = (key) => (state.values[key] !== undefined && state.values[key] !== '' ? state.values[key] : state.defaults[key] ?? '');
  const isChanged = (key) => state.values[key] !== undefined && state.values[key] !== '' && !deepEq(state.values[key], state.defaults[key]);
  function set(key, v) {
    if (v === '' || deepEq(v, state.defaults[key])) delete state.values[key];
    else state.values[key] = v;
    setDirty();
  }

  /* ── Rendering ──────────────────────────────────────────────────────── */
  function renderSection() {
    const content = $('#content');
    content.innerHTML = '';
    previewEls = null;
    if (state.section === 'inquiries') return renderInquiries(content);
    if (state.section === 'help') return renderHelp(content);
    const section = state.schema.sections.find((s) => s.id === state.section) || state.schema.sections[0];
    state.section = section.id;
    if (section.special === 'posts') return renderPosts(content, section);
    $('#section-title').textContent = section.title;
    const introRow = h('div', { class: 'intro-row' });
    if (section.intro) introRow.append(h('p', { class: 'intro' }, section.intro));
    if (section.page) introRow.append(h('a', { class: 'btn btn-sm', href: section.page.path, target: '_blank', rel: 'noopener' }, 'View page ↗'));
    content.append(introRow);
    if (section.id === 'seo') {
      content.append(renderPreviews({ title: 'seo.title', desc: 'seo.description', ogTitle: 'seo.ogTitle', ogDesc: 'seo.ogDescription', image: 'seo.ogImage', path: '/' }));
    } else if (section.page && section.prefix) {
      const p = section.prefix;
      content.append(renderPreviews({ title: `${p}.seoTitle`, desc: `${p}.metaDescription`, image: `${p}.ogImage`, path: section.page.path }));
    }
    const card = h('div', { class: 'card' }, h('div', { class: 'card-body' }));
    for (const f of section.fields) $('.card-body', card).append(renderField(f));
    content.append(card);
    setDirty();
  }

  function counter(f, value) {
    if (!f.max) return null;
    const n = [...String(value || '')].length;
    const cls = n > f.max ? 'over' : f.max >= 50 && n >= f.max * 0.7 ? 'good' : '';
    return h('span', { class: `count ${cls}` }, `${n} / ${f.max}`);
  }

  function renderField(f, opts = {}) {
    // opts: { value, onChange, wide } for list sub-fields
    const nested = 'value' in opts;
    const value = nested ? opts.value : get(f.key);
    const changed = nested ? false : isChanged(f.key);
    const wrap = h('div', { class: `field${changed ? ' changed' : ''}${opts.wide ? ' wide' : ''}` });
    const label = h('div', { class: 'field-label' }, h('span', {}, f.label));
    const cnt = counter(f, value);
    if (cnt) label.append(cnt);
    wrap.append(label);

    const commit = (v) => {
      if (nested) opts.onChange(v);
      else set(f.key, v);
      const c = counter(f, v);
      if (c) label.querySelector('.count').replaceWith(c);
      wrap.classList.toggle('changed', !nested && isChanged(f.key));
      if (!nested) refreshDefaultNote();
      if (!nested) updatePreviews();
    };

    let input;
    if (f.type === 'textarea' || f.type === 'code') {
      input = h('textarea', { class: f.type === 'code' ? 'code' : '', oninput: (e) => commit(e.target.value), placeholder: opts.placeholder || null });
      input.value = value;
    } else if (f.type === 'select') {
      input = h('select', { onchange: (e) => commit(e.target.value) }, h('option', { value: '' }, '— choose —'), ...f.options.map(([v, l]) => h('option', { value: v, selected: v === value }, l)));
    } else if (f.type === 'image') {
      input = renderImage(f, value, commit);
    } else if (f.type === 'list') {
      input = renderList(f);
    } else if (f.type === 'html') {
      input = htmlEditor(value, commit);
    } else {
      input = h('input', { type: f.type === 'url' ? 'url' : 'text', oninput: (e) => commit(e.target.value), placeholder: opts.placeholder || null });
      input.value = value;
    }
    wrap.append(input);
    if (f.help) wrap.append(h('p', { class: 'field-help' }, f.help));

    let note;
    const refreshDefaultNote = () => {
      if (nested || f.type === 'list') return;
      const def = state.defaults[f.key];
      note?.remove();
      if (isChanged(f.key) && def !== undefined && def !== '') {
        const showDefault = f.type !== 'html' && f.type !== 'code';
        note = h(
          'div',
          { class: 'field-foot' },
          showDefault ? h('span', { class: 'field-default' }, 'Default: ', h('em', {}, String(def).slice(0, 90) + (String(def).length > 90 ? '…' : ''))) : h('span'),
          h('button', { type: 'button', class: 'btn-link', onclick: () => { set(f.key, ''); renderSection(); } }, 'Reset to default')
        );
        wrap.append(note);
      }
    };
    refreshDefaultNote();
    return wrap;
  }

  function renderImage(f, value, commit) {
    const preview = h('div', { class: 'image-preview' }, value ? h('img', { src: value, alt: '' }) : 'No image');
    const url = h('input', {
      type: 'url',
      placeholder: 'https://… or /path.jpg',
      oninput: (e) => {
        commit(e.target.value);
        preview.innerHTML = '';
        preview.append(e.target.value ? h('img', { src: e.target.value, alt: '' }) : 'No image');
      },
    });
    url.value = value;
    const file = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml' });
    const uploadBtn = h('button', { type: 'button', class: 'btn btn-sm', onclick: () => file.click() }, 'Upload image');
    const clearBtn = h('button', { type: 'button', class: 'btn-link', onclick: () => { url.value = ''; commit(''); preview.innerHTML = 'No image'; } }, 'Remove');
    file.addEventListener('change', async () => {
      const fl = file.files[0];
      if (!fl) return;
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Uploading…';
      try {
        const out = await uploadFile(fl);
        url.value = out;
        commit(out);
        preview.innerHTML = '';
        preview.append(h('img', { src: out, alt: '' }));
        toast('Image uploaded — remember to save.');
      } catch (err) {
        toast(err.message, true);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload image';
        file.value = '';
      }
    });
    return h('div', { class: 'image-field' }, preview, h('div', { class: 'image-controls' }, url, h('div', { class: 'row' }, uploadBtn, file, clearBtn, h('span', { class: 'field-help' }, 'JPG, PNG, WebP, GIF or SVG · up to 4 MB'))));
  }
  async function uploadFile(fl) {
    if (fl.size > 4 * 1024 * 1024) throw new Error('Images must be under 4 MB');
    const data = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(',')[1]);
      r.onerror = rej;
      r.readAsDataURL(fl);
    });
    const out = await api('/api/admin/upload', { method: 'POST', body: JSON.stringify({ name: fl.name, type: fl.type, data }) });
    return out.url;
  }

  function itemTitle(f, it, i) {
    const sub = f.item.find((s) => s.key === f.itemLabel);
    let v = it[f.itemLabel];
    if (sub?.type === 'select') v = (sub.options.find(([k]) => k === v) || [])[1] || v;
    return v || it.name || it.title || `Item ${i + 1}`;
  }

  function renderList(f) {
    const items = clone(get(f.key) || []);
    const box = h('div', { class: 'list' });
    const commit = () => set(f.key, clone(items));
    const draw = () => {
      box.innerHTML = '';
      items.forEach((it, i) => {
        const title = h('strong', {}, itemTitle(f, it, i));
        const body = h('div', { class: 'list-item-body' });
        for (const sub of f.item) {
          body.append(
            renderField(sub, {
              value: it[sub.key] ?? '',
              onChange: (v) => {
                it[sub.key] = v;
                commit();
                title.textContent = itemTitle(f, it, i);
              },
              wide: sub.type === 'textarea' || sub.type === 'image' || sub.type === 'html',
            })
          );
        }
        box.append(
          h(
            'div',
            { class: 'list-item' },
            h(
              'div',
              { class: 'list-item-head' },
              h('span', { class: 'idx' }, String(i + 1).padStart(2, '0')),
              title,
              h('button', { type: 'button', class: 'btn btn-sm', title: 'Move up', disabled: i === 0, onclick: () => { [items[i - 1], items[i]] = [items[i], items[i - 1]]; commit(); draw(); } }, '↑'),
              h('button', { type: 'button', class: 'btn btn-sm', title: 'Move down', disabled: i === items.length - 1, onclick: () => { [items[i + 1], items[i]] = [items[i], items[i + 1]]; commit(); draw(); } }, '↓'),
              h('button', { type: 'button', class: 'btn btn-sm btn-danger', onclick: () => { if (confirm(`Remove "${itemTitle(f, it, i)}"?`)) { items.splice(i, 1); commit(); draw(); } } }, 'Remove')
            ),
            body
          )
        );
      });
      box.append(
        h('button', { type: 'button', class: 'btn list-add', onclick: () => { items.push(Object.fromEntries(f.item.map((s) => [s.key, '']))); commit(); draw(); } }, `+ ${f.addLabel || 'Add item'}`)
      );
      if (isChanged(f.key) && Array.isArray(state.defaults[f.key]) && state.defaults[f.key].length) {
        box.append(h('button', { type: 'button', class: 'btn-link', onclick: () => { if (confirm('Put back the original items?')) { set(f.key, ''); renderSection(); } } }, 'Reset list to the original items'));
      }
    };
    draw();
    return box;
  }

  /* ── Rich text editor (WordPress-style "Visual" / "HTML" tabs) ──────── */
  const PASTE_OK = new Set(['P', 'BR', 'H2', 'H3', 'H4', 'STRONG', 'EM', 'U', 'S', 'A', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'IMG', 'HR', 'CODE', 'PRE', 'FIGURE', 'FIGCAPTION', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD']);
  const RENAME = { B: 'STRONG', I: 'EM', H1: 'H2', STRIKE: 'S' };
  const VOID = new Set(['BR', 'IMG', 'HR']);
  const DROP = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'IFRAME', 'OBJECT', 'NOSCRIPT', 'SVG', 'BUTTON', 'INPUT', 'FORM']);
  function cleanPasted(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const walk = (node) => {
      if (node.nodeType === 3) return escHtml(node.textContent);
      if (node.nodeType !== 1) return '';
      let tag = node.tagName;
      if (DROP.has(tag)) return '';
      const kids = [...node.childNodes].map(walk).join('');
      // Google Docs wraps everything in <b style="font-weight:normal" id="docs-internal-guid…">
      if (tag === 'B' && (/^docs-internal-guid/.test(node.id) || /font-weight:\s*(normal|400)/.test(node.getAttribute('style') || ''))) return kids;
      if (tag === 'SPAN') {
        const st = node.getAttribute('style') || '';
        let out = kids;
        if (/font-weight:\s*(bold|[6-9]00)/.test(st)) out = `<strong>${out}</strong>`;
        if (/font-style:\s*italic/.test(st)) out = `<em>${out}</em>`;
        return out;
      }
      tag = RENAME[tag] || tag;
      if (tag === 'DIV') return kids ? `<p>${kids}</p>` : '';
      if (!PASTE_OK.has(tag)) return kids;
      const t = tag.toLowerCase();
      let attrs = '';
      if (tag === 'A') {
        const href = node.getAttribute('href') || '';
        if (!/^(https?:|mailto:|tel:|\/|#)/i.test(href)) return kids;
        attrs = ` href="${escHtml(href)}"${node.getAttribute('target') === '_blank' ? ' target="_blank"' : ''}`;
      }
      if (tag === 'IMG') {
        const src = node.getAttribute('src') || '';
        if (!/^(https?:|\/)/i.test(src)) return '';
        return `<img src="${escHtml(src)}" alt="${escHtml(node.getAttribute('alt') || '')}">`;
      }
      if (VOID.has(tag)) return `<${t}>`;
      return `<${t}${attrs}>${kids}</${t}>`;
    };
    return [...doc.body.childNodes].map(walk).join('');
  }
  const tidy = (html) => {
    const s = String(html || '').replace(/(<p><br><\/p>\s*)+$/, '').trim();
    return s === '<p><br></p>' || s === '<br>' ? '' : s;
  };
  const pretty = (html) => String(html || '').replace(/(<\/(p|h2|h3|h4|ul|ol|li|blockquote|pre|figure|table|tr)>|<hr>|<br>)(?!\n)/g, '$1\n');

  function htmlEditor(value, onChange) {
    const wrap = h('div', { class: 'wys' });
    const area = h('div', { class: 'wys-area prose', contenteditable: 'true', role: 'textbox', 'aria-multiline': 'true', spellcheck: 'true' });
    area.innerHTML = value || '<p><br></p>';
    const src = h('textarea', { class: 'wys-src code', spellcheck: 'false', hidden: true });
    const panel = h('div', { class: 'wys-panel', hidden: true });
    let mode = 'visual';
    let range = null;

    const emit = () => onChange(mode === 'visual' ? tidy(area.innerHTML) : src.value);
    const keepSel = () => {
      const s = getSelection();
      if (s.rangeCount && area.contains(s.anchorNode)) range = s.getRangeAt(0).cloneRange();
    };
    const restoreSel = () => {
      area.focus();
      if (range) {
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(range);
      }
    };
    const exec = (cmd, arg = null) => {
      if (mode !== 'visual') return;
      restoreSel();
      document.execCommand(cmd, false, arg);
      keepSel();
      emit();
      refresh();
    };

    area.addEventListener('focus', () => document.execCommand('defaultParagraphSeparator', false, 'p'));
    area.addEventListener('input', () => { keepSel(); emit(); });
    area.addEventListener('keyup', () => { keepSel(); refresh(); });
    area.addEventListener('mouseup', () => { keepSel(); refresh(); });
    area.addEventListener('paste', (e) => {
      e.preventDefault();
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      const out = html
        ? cleanPasted(html)
        : text.split(/\n{2,}/).map((p) => `<p>${escHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
      document.execCommand('insertHTML', false, out);
      emit();
    });
    src.addEventListener('input', emit);

    const btn = (label, title, onclick, cmd) => {
      const b = h('button', { type: 'button', class: 'wys-btn', title, 'aria-label': title, onmousedown: (e) => e.preventDefault(), onclick }, label);
      if (cmd) b.dataset.cmd = cmd;
      return b;
    };
    const block = h(
      'select',
      { class: 'wys-block', title: 'Text style', onmousedown: keepSel, onchange: (e) => exec('formatBlock', `<${e.target.value}>`) },
      ...[['p', 'Paragraph'], ['h2', 'Heading 2'], ['h3', 'Heading 3'], ['h4', 'Heading 4'], ['blockquote', 'Quote'], ['pre', 'Code block']].map(([v, l]) => h('option', { value: v }, l))
    );

    const openPanel = (build) => {
      keepSel();
      panel.innerHTML = '';
      panel.hidden = false;
      build(panel, () => { panel.hidden = true; panel.innerHTML = ''; });
    };
    const linkPanel = () =>
      openPanel((p, close) => {
        const existing = getSelection().anchorNode?.parentElement?.closest('a');
        const url = h('input', { type: 'url', placeholder: 'https://… or /page/', value: existing?.getAttribute('href') || '' });
        const blank = h('input', { type: 'checkbox', checked: existing?.target === '_blank' });
        const apply = () => {
          const href = url.value.trim();
          if (!href) return close();
          restoreSel();
          const s = getSelection();
          if (existing) {
            existing.setAttribute('href', href);
            existing.toggleAttribute('target', blank.checked);
            if (blank.checked) existing.target = '_blank';
          } else if (s.isCollapsed) {
            document.execCommand('insertHTML', false, `<a href="${escHtml(href)}"${blank.checked ? ' target="_blank"' : ''}>${escHtml(href)}</a>`);
          } else {
            document.execCommand('createLink', false, href);
            if (blank.checked) area.querySelectorAll(`a[href="${CSS.escape(href)}"]`).forEach((a) => (a.target = '_blank'));
          }
          emit();
          close();
        };
        url.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } });
        p.append(
          h('strong', {}, 'Link'),
          url,
          h('label', { class: 'wys-check' }, blank, ' Open in new tab'),
          h('button', { type: 'button', class: 'btn btn-sm btn-primary', onclick: apply }, 'Apply'),
          h('button', { type: 'button', class: 'btn btn-sm', onclick: close }, 'Cancel')
        );
        url.focus();
      });
    const imagePanel = () =>
      openPanel((p, close) => {
        const url = h('input', { type: 'url', placeholder: 'Image URL' });
        const alt = h('input', { type: 'text', placeholder: 'Alt text (describe the image)' });
        const file = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml', hidden: true });
        const up = h('button', { type: 'button', class: 'btn btn-sm', onclick: () => file.click() }, 'Upload…');
        file.addEventListener('change', async () => {
          if (!file.files[0]) return;
          up.disabled = true;
          up.textContent = 'Uploading…';
          try {
            url.value = await uploadFile(file.files[0]);
          } catch (err) {
            toast(err.message, true);
          } finally {
            up.disabled = false;
            up.textContent = 'Upload…';
          }
        });
        const insert = () => {
          if (!url.value.trim()) return close();
          restoreSel();
          document.execCommand('insertHTML', false, `<img src="${escHtml(url.value.trim())}" alt="${escHtml(alt.value.trim())}">`);
          emit();
          close();
        };
        p.append(h('strong', {}, 'Image'), up, file, url, alt, h('button', { type: 'button', class: 'btn btn-sm btn-primary', onclick: insert }, 'Insert'), h('button', { type: 'button', class: 'btn btn-sm', onclick: close }, 'Cancel'));
      });

    const modeBtn = h('button', { type: 'button', class: 'wys-mode', onclick: () => setMode(mode === 'visual' ? 'html' : 'visual') }, 'HTML');
    const setMode = (m) => {
      if (m === mode) return;
      if (m === 'html') {
        src.value = pretty(tidy(area.innerHTML));
        area.hidden = true;
        src.hidden = false;
        wrap.classList.add('is-src');
      } else {
        area.innerHTML = cleanPasted(src.value) || '<p><br></p>';
        area.hidden = false;
        src.hidden = true;
        wrap.classList.remove('is-src');
      }
      mode = m;
      modeBtn.textContent = m === 'visual' ? 'HTML' : 'Visual';
      emit();
    };

    const tools = h(
      'div',
      { class: 'wys-tools' },
      block,
      h('span', { class: 'wys-sep' }),
      btn(h('b', {}, 'B'), 'Bold', () => exec('bold'), 'bold'),
      btn(h('i', {}, 'I'), 'Italic', () => exec('italic'), 'italic'),
      btn(h('u', {}, 'U'), 'Underline', () => exec('underline'), 'underline'),
      h('span', { class: 'wys-sep' }),
      btn('• List', 'Bulleted list', () => exec('insertUnorderedList'), 'insertUnorderedList'),
      btn('1. List', 'Numbered list', () => exec('insertOrderedList'), 'insertOrderedList'),
      h('span', { class: 'wys-sep' }),
      btn('Link', 'Insert or edit link', linkPanel),
      btn('Unlink', 'Remove link', () => exec('unlink')),
      btn('Image', 'Insert image', imagePanel),
      btn('—', 'Horizontal line', () => exec('insertHorizontalRule')),
      btn('Clear', 'Clear formatting', () => { exec('removeFormat'); exec('formatBlock', '<p>'); }),
      h('span', { class: 'wys-grow' }),
      modeBtn
    );

    function refresh() {
      if (mode !== 'visual') return;
      for (const b of tools.querySelectorAll('[data-cmd]')) {
        let on = false;
        try { on = document.queryCommandState(b.dataset.cmd); } catch {}
        b.classList.toggle('on', on);
      }
      try {
        const v = String(document.queryCommandValue('formatBlock') || 'p').toLowerCase().replace(/[<>]/g, '');
        block.value = ['h2', 'h3', 'h4', 'blockquote', 'pre'].includes(v) ? v : 'p';
      } catch {}
    }

    wrap.append(tools, panel, area, src);
    return wrap;
  }

  /* ── Google / social previews ───────────────────────────────────────── */
  let previewEls = null;
  function renderPreviews(cfg) {
    const url = siteOrigin() + cfg.path;
    const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    previewEls = {
      cfg,
      serpTitle: h('div', { class: 'serp-title' }),
      serpDesc: h('div', { class: 'serp-desc' }),
      socImg: h('div', { class: 'social-img' }),
      socTitle: h('div', { class: 'social-title' }),
      socDesc: h('div', { class: 'social-desc' }),
    };
    const el = h(
      'div',
      { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', {}, 'Previews'), h('span', { class: 'field-help' }, 'Update live as you type')),
      h(
        'div',
        { class: 'card-body' },
        h(
          'div',
          { class: 'preview' },
          h('div', {}, h('p', { class: 'preview-label' }, 'Google result'), h('div', { class: 'serp' }, h('div', { class: 'serp-url' }, h('img', { src: '/favicon-32.png', alt: '' }), h('span', {}, host)), previewEls.serpTitle, previewEls.serpDesc)),
          h('div', {}, h('p', { class: 'preview-label' }, 'Shared link (LinkedIn, X, Slack…)'), h('div', { class: 'social' }, previewEls.socImg, h('div', { class: 'social-body' }, h('div', { class: 'social-host' }, host.split('/')[0]), previewEls.socTitle, previewEls.socDesc)))
        )
      )
    );
    updatePreviews();
    return el;
  }
  function updatePreviews() {
    if (!previewEls) return;
    const { cfg } = previewEls;
    const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
    const title = get(cfg.title);
    const desc = get(cfg.desc);
    previewEls.serpTitle.textContent = clip(title, 60);
    previewEls.serpDesc.textContent = clip(desc, 160);
    previewEls.socTitle.textContent = clip((cfg.ogTitle && get(cfg.ogTitle)) || title, 70);
    previewEls.socDesc.textContent = clip((cfg.ogDesc && get(cfg.ogDesc)) || desc, 120);
    const img = get(cfg.image) || get('seo.ogImage');
    previewEls.socImg.innerHTML = '';
    if (img) previewEls.socImg.append(h('img', { src: img, alt: '' }));
  }

  /* ── Blog: posts list ───────────────────────────────────────────────── */
  const posts = () => (Array.isArray(get('blog.posts')) ? get('blog.posts') : []);
  function setPosts(list) {
    set('blog.posts', clone(list));
  }
  const fmtDate = (d) => {
    const t = new Date(`${d}T12:00:00`);
    return Number.isNaN(t.getTime()) ? d || '—' : t.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  function renderPosts(content, section) {
    if (state.postEdit) return renderPostEditor(content);
    $('#section-title').textContent = 'Posts';
    const list = posts();
    const pub = list.filter((p) => p.status === 'published').length;
    content.append(
      h('div', { class: 'intro-row' }, h('p', { class: 'intro' }, section.intro), h('div', { class: 'row' }, h('a', { class: 'btn btn-sm', href: '/blog/', target: '_blank', rel: 'noopener' }, 'View blog ↗'), h('button', { type: 'button', class: 'btn btn-primary', onclick: () => openPost(null) }, 'Add new post')))
    );
    const card = h('div', { class: 'card' });
    card.append(h('div', { class: 'card-head' }, h('h2', {}, `All (${list.length})`), h('span', { class: 'field-help' }, `${pub} published · ${list.length - pub} draft${list.length - pub === 1 ? '' : 's'}`)));
    if (!list.length) {
      card.append(h('div', { class: 'empty' }, 'No posts yet. ', h('button', { type: 'button', class: 'btn-link', onclick: () => openPost(null) }, 'Write the first one.')));
    } else {
      const rows = [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const tbody = h('tbody');
      for (const p of rows) {
        tbody.append(
          h(
            'tr',
            { class: 'row' },
            h('td', {}, h('button', { type: 'button', class: 'post-link', onclick: () => openPost(p.id) }, p.title || '(no title)'), p.status !== 'published' ? h('span', { class: 'post-state' }, ' — Draft') : null, h('div', { class: 'field-help' }, `/blog/${p.slug || slugify(p.title)}/`)),
            h('td', {}, p.tags || '—'),
            h('td', {}, h('span', { class: `pill ${p.status === 'published' ? 'replied' : 'new'}` }, p.status === 'published' ? 'Published' : 'Draft'), h('div', { class: 'field-help' }, fmtDate(p.date))),
            h(
              'td',
              { class: 'actions-cell' },
              h('button', { type: 'button', class: 'btn-link', onclick: () => openPost(p.id) }, 'Edit'),
              p.status === 'published' && p.slug ? h('a', { class: 'btn-link', href: `/blog/${p.slug}/`, target: '_blank', rel: 'noopener' }, 'View') : null,
              h('button', { type: 'button', class: 'btn-link danger', onclick: () => trashPost(p) }, 'Trash')
            )
          )
        );
      }
      card.append(h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Title'), h('th', {}, 'Tags'), h('th', {}, 'Status'), h('th', {}, ''))), tbody));
    }
    content.append(card);
    setDirty();
  }

  function openPost(id) {
    const existing = id ? posts().find((p) => p.id === id) : null;
    state.postEdit = {
      draft: existing
        ? clone(existing)
        : { id: newId(), title: '', slug: '', status: 'draft', date: today(), excerpt: '', cover: '', coverAlt: '', body: '', tags: '', seoTitle: '', metaDescription: '' },
    };
    renderSection();
    window.scrollTo(0, 0);
  }

  async function trashPost(p) {
    if (!confirm(`Move "${p.title || 'this post'}" to the trash? It will disappear from the site once saved.`)) return;
    setPosts(posts().filter((x) => x.id !== p.id));
    state.postEdit = null;
    await save('Post deleted.');
  }

  /* ── Blog: the post editor ──────────────────────────────────────────── */
  function renderPostEditor(content) {
    const P = state.postEdit.draft;
    // "saved" = on the server now (saved values, or the built-in defaults)
    const savedList = state.saved['blog.posts'] !== undefined ? state.saved['blog.posts'] : state.defaults['blog.posts'] || [];
    const savedCopy = savedList.find((p) => p.id === P.id);
    const isSaved = Boolean(savedCopy);
    $('#section-title').textContent = P.title ? `Edit post` : 'Add new post';

    const sync = () => {
      const list = clone(posts());
      const i = list.findIndex((p) => p.id === P.id);
      if (i >= 0) list[i] = clone(P);
      else list.unshift(clone(P));
      setPosts(list);
    };
    const upd = (k, v) => {
      P[k] = v;
      sync();
      if (k === 'title' || k === 'slug') drawPermalink();
      if (['title', 'seoTitle', 'metaDescription', 'excerpt', 'slug'].includes(k)) drawSerp();
    };

    // ── main column
    const title = h('input', { class: 'post-title-input', type: 'text', placeholder: 'Add title', maxlength: 200, oninput: (e) => upd('title', e.target.value) });
    title.value = P.title;
    const permalink = h('div', { class: 'permalink' });
    function drawPermalink() {
      const slug = P.slug || slugify(P.title) || 'your-post-title';
      permalink.innerHTML = '';
      const editBtn = h('button', { type: 'button', class: 'btn btn-sm', onclick: () => {
        permalink.innerHTML = '';
        const input = h('input', { type: 'text', value: slug, class: 'slug-input' });
        const ok = () => { upd('slug', slugify(input.value)); };
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ok(); } });
        permalink.append(h('span', { class: 'permalink-k' }, 'Permalink:'), h('span', {}, `${siteOrigin()}/blog/`), input, h('span', {}, '/'), h('button', { type: 'button', class: 'btn btn-sm btn-primary', onclick: ok }, 'OK'), h('button', { type: 'button', class: 'btn-link', onclick: drawPermalink }, 'Cancel'));
        input.focus();
        input.select();
      } }, 'Edit');
      permalink.append(h('span', { class: 'permalink-k' }, 'Permalink:'), h('a', { href: P.status === 'published' && savedCopy ? `/blog/${slug}/` : null, target: '_blank', rel: 'noopener' }, `${siteOrigin()}/blog/`, h('b', {}, slug), '/'), editBtn);
      if (!P.slug) permalink.append(h('span', { class: 'field-help' }, 'Set from the title when you first save.'));
    }
    drawPermalink();
    const body = htmlEditor(P.body, (v) => upd('body', v));

    // SEO box
    const serpTitle = h('div', { class: 'serp-title' });
    const serpDesc = h('div', { class: 'serp-desc' });
    const serpUrl = h('span');
    function drawSerp() {
      const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
      serpTitle.textContent = clip(P.seoTitle || `${P.title || 'Post title'} | ${state.schema.site.name}`, 60);
      serpDesc.textContent = clip(P.metaDescription || P.excerpt || 'Write an excerpt or a meta description — it is what Google shows under the title.', 160);
      serpUrl.textContent = `${siteOrigin().replace(/^https?:\/\//, '')} › blog › ${P.slug || slugify(P.title) || '…'}`;
    }
    drawSerp();
    const fieldIn = (label, key, max, help, textarea = false, placeholder = '') =>
      renderField({ key: `post.${key}`, label, type: textarea ? 'textarea' : 'text', max, help }, { value: P[key] || '', onChange: (v) => upd(key, v), placeholder });

    const main = h(
      'div',
      { class: 'post-main' },
      title,
      permalink,
      body,
      h(
        'div',
        { class: 'card' },
        h('div', { class: 'card-head' }, h('h2', {}, 'SEO'), h('span', { class: 'field-help' }, 'Leave empty to use the title and excerpt')),
        h(
          'div',
          { class: 'card-body' },
          h('div', { class: 'serp' }, h('div', { class: 'serp-url' }, h('img', { src: '/favicon-32.png', alt: '' }), serpUrl), serpTitle, serpDesc),
          fieldIn('SEO title', 'seoTitle', 60, 'The blue headline in Google. 50–60 characters.', false, `${P.title || 'Post title'} | ${state.schema.site.name}`),
          fieldIn('Meta description', 'metaDescription', 160, 'The grey text under the headline. 120–160 characters.', true)
        )
      )
    );

    // ── sidebar
    const statusSel = h('select', { onchange: (e) => { upd('status', e.target.value); renderSection(); } }, h('option', { value: 'draft', selected: P.status !== 'published' }, 'Draft'), h('option', { value: 'published', selected: P.status === 'published' }, 'Published'));
    const date = h('input', { type: 'date', value: P.date || today(), onchange: (e) => upd('date', e.target.value) });
    const publishNow = async (status) => {
      if (!P.title.trim()) {
        title.focus();
        return toast('Give the post a title first.', true);
      }
      P.status = status;
      if (!P.date) P.date = today();
      sync();
      const ok = await save(status === 'published' ? 'Published. It will be live within about a minute.' : 'Draft saved.');
      if (ok && !P.slug) drawPermalink();
    };
    const preview = async () => {
      const w = window.open('', '_blank');
      if (!w) return toast('Allow pop-ups for this site to preview.', true);
      w.document.write('<p style="font:16px system-ui;padding:2rem">Rendering preview…</p>');
      try {
        const res = await api('/api/admin/preview', { method: 'POST', body: JSON.stringify({ post: P }) });
        w.document.open();
        w.document.write(res.html);
        w.document.close();
      } catch (err) {
        w.close();
        toast(err.message, true);
      }
    };
    const published = P.status === 'published';
    const side = h(
      'aside',
      { class: 'post-side' },
      h(
        'div',
        { class: 'card' },
        h('div', { class: 'card-head' }, h('h2', {}, 'Publish')),
        h(
          'div',
          { class: 'card-body' },
          h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Status'), statusSel),
          h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Publish date'), date),
          h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: preview }, 'Preview'), published && savedCopy?.status === 'published' ? h('a', { class: 'btn', href: `/blog/${savedCopy.slug}/`, target: '_blank', rel: 'noopener' }, 'View post ↗') : null),
          h(
            'div',
            { class: 'publish-actions' },
            isSaved ? h('button', { type: 'button', class: 'btn-link danger', onclick: () => trashPost(P) }, 'Move to trash') : h('span'),
            published
              ? h('button', { type: 'button', class: 'btn btn-primary', onclick: () => publishNow('published') }, 'Update')
              : h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: () => publishNow('draft') }, 'Save draft'), h('button', { type: 'button', class: 'btn btn-primary', onclick: () => publishNow('published') }, 'Publish'))
          )
        )
      ),
      h(
        'div',
        { class: 'card' },
        h('div', { class: 'card-head' }, h('h2', {}, 'Featured image')),
        h('div', { class: 'card-body' }, renderImage({}, P.cover || '', (v) => upd('cover', v)), fieldIn('Alt text', 'coverAlt', 160, 'Describe the image for screen readers and Google Images.'))
      ),
      h('div', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', {}, 'Excerpt')), h('div', { class: 'card-body' }, fieldIn('Excerpt', 'excerpt', 300, 'Shown on the blog page and used as the meta description when that is empty.', true))),
      h('div', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', {}, 'Tags')), h('div', { class: 'card-body' }, fieldIn('Tags', 'tags', 200, 'Separate with commas, e.g. Web design, SEO')))
    );

    content.append(
      h('div', { class: 'intro-row' }, h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { state.postEdit = null; renderSection(); } }, '← All posts'), h('span', { class: 'field-help' }, isSaved ? `Last updated ${savedCopy?.updated ? new Date(savedCopy.updated).toLocaleString() : '—'}` : 'Not saved yet')),
      h('div', { class: 'post-editor' }, main, side)
    );
    setDirty();
    if (!P.title) title.focus();
  }

  /* ── Inquiries (form entries) ───────────────────────────────────────── */
  async function loadInquiryCount() {
    try {
      const res = await api('/api/inquiries?limit=1');
      const n = res.counts?.new || 0;
      const b = $('#inq-badge');
      if (b) {
        b.textContent = n;
        b.hidden = !n;
      }
    } catch {}
  }
  async function renderInquiries(content) {
    $('#section-title').textContent = 'Form entries';
    content.append(h('p', { class: 'intro' }, 'Every message sent through the contact forms. Click a row to read it.'));
    const card = h('div', { class: 'card' });
    content.append(card);
    card.append(h('div', { class: 'empty' }, 'Loading…'));
    try {
      const res = await api('/api/inquiries?limit=200');
      const items = res.items || [];
      card.innerHTML = '';
      const c = res.counts || {};
      card.append(h('div', { class: 'card-head' }, h('h2', {}, `${c.total || 0} entries`), h('span', { class: 'field-help' }, `${c.new || 0} new · ${c.replied || 0} replied · ${c.archived || 0} archived`)));
      if (!items.length) return card.append(h('div', { class: 'empty' }, 'No entries yet. Note: on Vercel, entries are only kept when email delivery is configured — the notification email is the durable record.'));
      const table = h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'From'), h('th', {}, items.some((i) => i.phone) ? 'Country · phone' : 'Budget'), h('th', {}, 'Received'), h('th', {}, 'Status'))));
      const tbody = h('tbody');
      for (const it of items) {
        tbody.append(
          h('tr', { class: `row${it.status === 'new' ? ' is-new' : ''}`, onclick: () => showInquiry(it) }, h('td', {}, it.name, h('div', { class: 'field-help' }, it.email)), h('td', {}, it.phone ? `${it.country || ''} · ${it.phone}` : it.budget), h('td', {}, new Date(it.created_at).toLocaleString()), h('td', {}, h('span', { class: `pill ${it.status}` }, it.status)))
        );
      }
      table.append(tbody);
      card.append(table);
    } catch (err) {
      card.innerHTML = '';
      card.append(h('div', { class: 'empty' }, err.message));
    }
  }
  function showInquiry(it) {
    const content = $('#content');
    content.innerHTML = '';
    $('#section-title').textContent = it.name;
    const card = h(
      'div',
      { class: 'card' },
      h(
        'div',
        { class: 'card-body detail' },
        h('dl', {}, h('dt', {}, 'Email'), h('dd', {}, h('a', { href: `mailto:${it.email}` }, it.email)), ...(it.phone ? [h('dt', {}, 'Phone'), h('dd', {}, h('a', { href: `tel:${String(it.phone).replace(/[^\d+]/g, '')}` }, it.phone)), h('dt', {}, 'Country'), h('dd', {}, it.country || '')] : [h('dt', {}, 'Budget'), h('dd', {}, it.budget)]), h('dt', {}, 'Received'), h('dd', {}, new Date(it.created_at).toLocaleString()), h('dt', {}, 'Emailed'), h('dd', {}, it.emailed ? 'yes' : `no${it.email_error ? ` — ${it.email_error}` : ''}`)),
        h('pre', {}, it.message),
        h(
          'div',
          { class: 'actions' },
          ...['new', 'read', 'replied', 'archived'].map((s) =>
            h('button', { type: 'button', class: `btn btn-sm${it.status === s ? ' btn-primary' : ''}`, onclick: async () => { try { await api(`/api/inquiries/${it.id}`, { method: 'PATCH', body: JSON.stringify({ status: s }) }); it.status = s; toast(`Marked as ${s}`); showInquiry(it); loadInquiryCount(); } catch (e) { toast(e.message, true); } } }, `Mark ${s}`)
          ),
          h('button', { type: 'button', class: 'btn btn-sm', onclick: () => go('inquiries') }, '← All entries')
        )
      )
    );
    content.append(card);
  }

  /* ── Help ───────────────────────────────────────────────────────────── */
  function renderHelp(content) {
    $('#section-title').textContent = 'Help';
    content.append(
      h(
        'div',
        { class: 'card' },
        h('div', {
          class: 'card-body',
          html: `
      <h2>How this editor works</h2>
      <p>Every field maps to one place on the live site. Change it, press <b>Save changes</b> (or <span class="kbd">Ctrl</span>+<span class="kbd">S</span>), and the live page picks it up within about a minute — no developer, no deploy.</p>
      <p>Leaving a field empty means "use the built-in default". <b>Reset to default</b> appears under any field you have changed.</p>
      <h2>Pages</h2>
      <p>Everything under <b>Pages</b> is a real page with its own address: the Services hub, one page per service, and the rest of the studio pages. Each has its own SEO title, meta description and social image, with a Google preview at the top. <b>View page ↗</b> opens it on the live site.</p>
      <p><b>Long-form copy</b> fields use a visual editor: pick <i>Heading 2 / Heading 3</i> from the style menu for sub-headings, select text and press <i>Link</i> to link to another page (e.g. <code>/organic-seo/</code>), or switch to <b>HTML</b> to edit the code directly.</p>
      <h2>Blog</h2>
      <p><b>Blog → Posts → Add new post</b>. Give it a title, write the post, then <b>Publish</b>. It appears at <code>/blog/your-post-title/</code> and on the blog page, the sitemap and the RSS feed. <b>Save draft</b> keeps it private; <b>Preview</b> shows exactly how it will look.</p>
      <p>The permalink is set from the title the first time you save and then stays put, so links to the post keep working if you later change the title. Use <b>Edit</b> next to the permalink to change it deliberately.</p>
      <h2>SEO checklist</h2>
      <ul>
        <li><b>SEO title</b> — 50–60 characters, most important words first, brand at the end.</li>
        <li><b>Meta description</b> — 120–160 characters, a real sentence with a reason to click.</li>
        <li><b>One H1 per page</b> — the page heading field. Use Heading 2/3 inside long-form copy.</li>
        <li><b>Alt text</b> on every image.</li>
        <li><b>Search engine visibility</b> (Site &amp; SEO) — keep it "Visible" unless the site is being rebuilt.</li>
        <li><b>Custom &lt;head&gt; code</b> — Search Console / Bing verification tags and analytics snippets; applied to every page.</li>
      </ul>
      <p>The sitemap lives at <code>/sitemap.xml</code> — submit it once in Google Search Console and new pages and posts are picked up automatically.</p>
      <h2>What needs a developer</h2>
      <p>Layout, colours, fonts, the 3D scenes and new page types. Everything that is words, links, images and metadata lives here.</p>
    `,
        })
      )
    );
  }

  boot();
})();
