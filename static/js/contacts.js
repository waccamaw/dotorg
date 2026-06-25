/**
 * Contacts & Directory — executive-leadership view (read/write + list management).
 * contact-service (CONFIG.CONTACT_API_BASE_URL):
 *   GET    /api/admin/lists
 *   GET    /api/admin/contacts?q&list&member&dnc
 *   GET    /api/admin/contacts/:id
 *   POST/PUT  /api/admin/contacts[/:id]
 *   POST/PUT/DELETE /api/admin/lists[/:id]
 *   POST/DELETE     /api/admin/lists/:listId/subscriptions[/:contactId]
 * Auth: Bearer JWT from the member-portal session (same token as the roll book).
 */
(function () {
  const CFG = (typeof CONFIG !== 'undefined') ? CONFIG : (window.CONFIG || {});
  const TOKEN_KEY = (CFG.STORAGE_KEYS && CFG.STORAGE_KEYS.SESSION_TOKEN) || 'waccamaw_session_token';

  let table = null, allLists = [], activeList = '', searchTerm = '', pillFilter = '', searchTimer = null;
  let current = null;     // contact being edited
  let lastSummary = null;

  const $ = id => document.getElementById(id);
  function token() { return localStorage.getItem(TOKEN_KEY); }

  async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const t = token(); if (t) headers['Authorization'] = `Bearer ${t}`;
    const res = await fetch(`${CFG.CONTACT_API_BASE_URL || ''}${path}`, { ...opts, headers });
    if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); window.location.href = '/members/'; return null; }
    if (res.status === 403) { alert('This area is restricted to executive leadership.'); window.location.href = '/members/'; return null; }
    return { res, data: await res.json().catch(() => ({})) };
  }
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function displayName(r) { return [r.first_name, r.last_name].filter(Boolean).join(' ').trim() || r.org_name || '(no name)'; }

  // ---------- clickable summary pills ----------
  function renderSummary(s) {
    if (s) lastSummary = s; s = lastSummary; if (!s) return;
    const pill = (key, n, l, cls) => `<div class="dir-stat ${cls || ''} ${pillFilter === key ? 'sel' : ''}" data-filter="${key}"><div class="dir-stat-n">${n}</div><div class="dir-stat-l">${l}</div></div>`;
    $('dir-summary').innerHTML =
      pill('', s.contacts, 'Contacts') + pill('member', s.members, 'Members') +
      pill('external', s.external, 'External') +
      `<div class="dir-stat" style="cursor:default;"><div class="dir-stat-n">${s.lists}</div><div class="dir-stat-l">Lists</div></div>` +
      pill('dnc', s.do_not_contact, 'Do-not-contact', 'dnc');
    $('dir-summary').querySelectorAll('.dir-stat[data-filter]').forEach(node =>
      node.addEventListener('click', () => { pillFilter = node.getAttribute('data-filter'); renderSummary(); loadContacts(); }));
  }

  // ---------- lists sidebar ----------
  const KIND_LABEL = { distribution: 'Mailing / distribution', committee: 'Committees', governance: 'Governance', event: 'Events & pow-wow', external: 'External orgs', system: 'System' };
  function setActiveListLabel() {
    const el = $('dir-active-list');
    if (!activeList) { el.innerHTML = ''; return; }
    const l = allLists.find(x => x.slug === activeList);
    el.innerHTML = `Filtered by list: <b>${esc(l ? l.name : activeList)}</b> <button type="button" class="dir-btn ghost sm" id="dir-edit-list">✎ Edit list</button>`;
    $('dir-edit-list').addEventListener('click', () => openListModal(l));
  }
  function renderLists(lists) {
    const el = $('dir-lists'), byKind = {};
    lists.forEach(l => { (byKind[l.kind] = byKind[l.kind] || []).push(l); });
    let html = `<div class="dir-list-item dir-list-all${activeList === '' ? ' sel' : ''}" data-slug="">All contacts</div>`;
    Object.keys(KIND_LABEL).forEach(kind => {
      const items = (byKind[kind] || []).filter(l => l.member_count > 0 || kind === 'system');
      if (!items.length) return;
      html += `<h3>${KIND_LABEL[kind]}</h3>`;
      items.sort((a, b) => b.member_count - a.member_count);
      items.forEach(l => { html += `<div class="dir-list-item${activeList === l.slug ? ' sel' : ''}" data-slug="${esc(l.slug)}" title="${esc(l.name)}"><span>${esc(l.name)}</span><span class="cnt">${l.member_count}</span></div>`; });
    });
    el.innerHTML = html;
    el.querySelectorAll('.dir-list-item').forEach(node => node.addEventListener('click', () => {
      activeList = node.getAttribute('data-slug');
      el.querySelectorAll('.dir-list-item').forEach(n => n.classList.remove('sel'));
      node.classList.add('sel');
      setActiveListLabel();
      loadContacts();
    }));
    setActiveListLabel();
  }

  // ---------- grid ----------
  function columns() {
    return [
      { title: 'Name', field: 'name', widthGrow: 2, formatter: c => { const r = c.getData(); const sub = r.org_title ? `<div style="font-size:.78rem;color:#888;">${esc(r.org_title)}${r.org_name ? ' · ' + esc(r.org_name) : ''}</div>` : (r.org_name ? `<div style="font-size:.78rem;color:#888;">${esc(r.org_name)}</div>` : ''); return `<strong>${esc(c.getValue())}</strong>${sub}`; } },
      { title: 'Type', field: 'is_member', width: 120, formatter: c => { const r = c.getData(); if (r.do_not_contact) return '<span class="pill pill-dnc">do-not-contact</span>'; return r.is_member ? `<span class="pill pill-member">member${r.trb_id ? ' · ' + esc(r.trb_id) : ''}</span>` : '<span class="pill pill-ext">external</span>'; } },
      { title: 'Email', field: 'email', widthGrow: 2, formatter: c => c.getValue() ? esc(c.getValue()) : '<span style="color:#bbb;">—</span>' },
      { title: 'Phone', field: 'phone', width: 130, formatter: c => esc(c.getValue() || '—') },
      { title: 'Location', field: 'loc', width: 140, formatter: c => { const r = c.getData(); return esc([r.city, r.state].filter(Boolean).join(', ')); } },
      { title: 'Lists', field: 'list_count', width: 64, hozAlign: 'center' },
    ];
  }
  async function loadContacts() {
    const p = new URLSearchParams();
    if (searchTerm) p.set('q', searchTerm);
    if (activeList) p.set('list', activeList);
    if (pillFilter === 'member') p.set('member', '1');
    else if (pillFilter === 'external') p.set('member', '0');
    else if (pillFilter === 'dnc') p.set('dnc', '1');
    const r = await api(`/api/admin/contacts?${p.toString()}`); if (!r) return;
    const rows = (r.data.contacts || []).map(x => ({ ...x, name: displayName(x) }));
    if (!table) {
      table = new Tabulator('#dir-grid', { data: rows, columns: columns(), layout: 'fitColumns', height: '100%', placeholder: 'No contacts match.' });
      table.on('rowClick', (e, row) => openContact(row.getData().id));
    } else { table.replaceData(rows); }
  }

  // ---------- contact modal ----------
  function openModal() { $('dir-modal-bg').classList.add('open'); }
  function closeModal() { $('dir-modal-bg').classList.remove('open'); current = null; }
  function fill(c) {
    $('f-id').value = c.id || ''; $('f-first').value = c.first_name || ''; $('f-last').value = c.last_name || '';
    $('f-org').value = c.org_name || ''; $('f-title').value = c.org_title || ''; $('f-email').value = c.email || '';
    $('f-phone').value = c.phone || ''; $('f-city').value = c.city || ''; $('f-state').value = c.state || '';
    $('f-dnc').checked = !!c.do_not_contact; $('f-msg').textContent = '';
  }
  function renderModalLists(lists) {
    const el = $('f-lists');
    el.innerHTML = (lists && lists.length) ? lists.map(l => `<span class="dir-chip">${esc(l.name)}<span class="dir-chip-x" data-slug="${esc(l.slug)}">&times;</span></span>`).join('') : '<span style="color:#aaa;font-size:.85rem;">No lists</span>';
    const have = new Set((lists || []).map(l => l.slug));
    $('f-addlist').innerHTML = '<option value="">Add to list…</option>' + allLists.filter(l => !have.has(l.slug)).map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join('');
    el.querySelectorAll('.dir-chip-x').forEach(x => x.addEventListener('click', () => unsubscribe(x.getAttribute('data-slug'))));
  }
  async function openContact(id) {
    const r = await api(`/api/admin/contacts/${id}`); if (!r || !r.data.contact) return;
    current = r.data.contact;
    $('dir-modal-title').textContent = 'Edit contact'; fill(current);
    $('f-member-note').textContent = current.is_member ? `Tribal member${current.trb_id ? ' · ' + current.trb_id : ''} — edit roll details in the Roll Book` : '';
    $('f-lists-wrap').style.display = ''; renderModalLists(r.data.lists); openModal();
  }
  function openNew() { current = {}; $('dir-modal-title').textContent = 'New contact'; fill({}); $('f-member-note').textContent = ''; $('f-lists-wrap').style.display = 'none'; openModal(); }
  async function saveContact() {
    const body = { first_name: $('f-first').value.trim(), last_name: $('f-last').value.trim(), org_name: $('f-org').value.trim(), org_title: $('f-title').value.trim(), email: $('f-email').value.trim(), phone: $('f-phone').value.trim(), city: $('f-city').value.trim(), state: $('f-state').value.trim(), do_not_contact: $('f-dnc').checked };
    const id = $('f-id').value;
    const r = id ? await api(`/api/admin/contacts/${id}`, { method: 'PUT', body: JSON.stringify(body) }) : await api('/api/admin/contacts', { method: 'POST', body: JSON.stringify(body) });
    if (!r) return;
    if (!r.res.ok) { $('f-msg').textContent = r.data.error || 'Save failed'; return; }
    closeModal(); await refresh();
  }
  async function subscribe() {
    const listId = $('f-addlist').value; if (!listId || !current || !current.id) return;
    const r = await api(`/api/admin/lists/${listId}/subscriptions`, { method: 'POST', body: JSON.stringify({ contact_id: current.id }) });
    if (r && r.res.ok) { const d = await api(`/api/admin/contacts/${current.id}`); renderModalLists(d.data.lists); reloadListsSidebar(); }
  }
  async function unsubscribe(slug) {
    const list = allLists.find(l => l.slug === slug); if (!list || !current || !current.id) return;
    const r = await api(`/api/admin/lists/${list.id}/subscriptions/${current.id}`, { method: 'DELETE' });
    if (r && r.res.ok) { const d = await api(`/api/admin/contacts/${current.id}`); renderModalLists(d.data.lists); reloadListsSidebar(); }
  }

  // ---------- list modal (create / edit / delete) ----------
  let editingList = null;
  function openListModal(list) {
    editingList = list || null;
    $('list-modal-title').textContent = list ? 'Edit list' : 'New list';
    $('l-id').value = list ? list.id : '';
    $('l-name').value = list ? list.name : '';
    $('l-kind').value = list ? list.kind : 'distribution';
    $('l-desc').value = (list && list.description) || '';
    $('l-msg').textContent = '';
    $('l-delete').style.visibility = list ? 'visible' : 'hidden';
    $('list-modal-bg').classList.add('open');
  }
  function closeListModal() { $('list-modal-bg').classList.remove('open'); editingList = null; }
  async function saveList() {
    const body = { name: $('l-name').value.trim(), kind: $('l-kind').value, description: $('l-desc').value.trim() };
    if (!body.name) { $('l-msg').textContent = 'Name is required'; return; }
    const id = $('l-id').value;
    const r = id ? await api(`/api/admin/lists/${id}`, { method: 'PUT', body: JSON.stringify(body) }) : await api('/api/admin/lists', { method: 'POST', body: JSON.stringify(body) });
    if (!r) return;
    if (!r.res.ok) { $('l-msg').textContent = r.data.error || 'Save failed'; return; }
    closeListModal(); await reloadListsSidebar();
  }
  async function deleteList() {
    const id = $('l-id').value; if (!id) return;
    if (!confirm('Delete this list and all its memberships? This cannot be undone.')) return;
    const r = await api(`/api/admin/lists/${id}`, { method: 'DELETE' });
    if (r && r.res.ok) { if (editingList && editingList.slug === activeList) { activeList = ''; } closeListModal(); await refresh(); }
  }

  async function reloadListsSidebar() {
    const r = await api('/api/admin/lists'); if (!r) return;
    allLists = r.data.lists || []; renderSummary(r.data.summary); renderLists(allLists);
  }
  async function refresh() { await reloadListsSidebar(); await loadContacts(); }

  function measureBar() {
    const bar = $('dir-sticky');
    if (bar) document.documentElement.style.setProperty('--bar-h', bar.offsetHeight + 'px');
  }
  function wireSticky() {
    const sentinel = $('dir-sentinel'), bar = $('dir-sticky');
    measureBar();
    window.addEventListener('resize', measureBar);
    if (!sentinel || !bar || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(([e]) => bar.classList.toggle('stuck', !e.isIntersecting), { threshold: 0 }).observe(sentinel);
  }

  async function init() {
    const r = await api('/api/admin/lists'); if (!r) return;
    allLists = r.data.lists || []; renderSummary(r.data.summary); renderLists(allLists);
    await loadContacts();
    wireSticky();
    $('dir-search').addEventListener('input', e => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { searchTerm = e.target.value.trim(); loadContacts(); }, 250); });
    $('dir-new').addEventListener('click', openNew);
    $('dir-new-list').addEventListener('click', () => openListModal(null));
    $('f-save').addEventListener('click', saveContact);
    $('f-cancel').addEventListener('click', closeModal);
    $('dir-modal-x').addEventListener('click', closeModal);
    $('f-addlist-btn').addEventListener('click', subscribe);
    $('dir-modal-bg').addEventListener('click', e => { if (e.target === $('dir-modal-bg')) closeModal(); });
    $('l-save').addEventListener('click', saveList);
    $('l-cancel').addEventListener('click', closeListModal);
    $('list-modal-x').addEventListener('click', closeListModal);
    $('l-delete').addEventListener('click', deleteList);
    $('list-modal-bg').addEventListener('click', e => { if (e.target === $('list-modal-bg')) closeListModal(); });
  }
  document.addEventListener('DOMContentLoaded', init);
})();
