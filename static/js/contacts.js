/**
 * Contacts & Directory — executive-leadership view.
 * Talks to contact-service (CONFIG.CONTACT_API_BASE_URL):
 *   GET /api/admin/lists            -> lists + directory summary
 *   GET /api/admin/contacts?q&list&member -> directory grid
 * Auth: Bearer JWT from the member-portal session (same token as the roll book).
 */
(function () {
  const CONFIG = window.CONFIG || {};
  const BASE = CONFIG.CONTACT_API_BASE_URL;
  const TOKEN_KEY = (CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.SESSION_TOKEN) || 'waccamaw_session_token';

  let table = null;
  let activeList = '';     // slug
  let searchTerm = '';
  let memberFilter = '';
  let searchTimer = null;

  function token() { return localStorage.getItem(TOKEN_KEY); }

  async function api(path) {
    const headers = { 'Content-Type': 'application/json' };
    const t = token();
    if (t) headers['Authorization'] = `Bearer ${t}`;
    const res = await fetch(`${BASE}${path}`, { headers });
    if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); window.location.href = '/members/'; return null; }
    if (res.status === 403) { alert('This area is restricted to executive leadership.'); window.location.href = '/members/'; return null; }
    return res.json();
  }

  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function displayName(r) {
    const nm = [r.first_name, r.last_name].filter(Boolean).join(' ').trim();
    return nm || r.org_name || '(no name)';
  }

  function renderSummary(s) {
    if (!s) return;
    const el = document.getElementById('dir-summary');
    const stat = (n, l) => `<div class="dir-stat"><div class="dir-stat-n">${n}</div><div class="dir-stat-l">${l}</div></div>`;
    el.innerHTML =
      stat(s.contacts, 'Contacts') + stat(s.members, 'Members') + stat(s.external, 'External') +
      stat(s.lists, 'Lists') + stat(s.do_not_contact, 'Do-not-contact');
  }

  const KIND_LABEL = {
    distribution: 'Mailing / distribution', committee: 'Committees',
    governance: 'Governance', event: 'Events & pow-wow', external: 'External orgs', system: 'System'
  };

  function renderLists(lists) {
    const el = document.getElementById('dir-lists');
    const byKind = {};
    lists.forEach(l => { (byKind[l.kind] = byKind[l.kind] || []).push(l); });
    let html = `<div class="dir-list-item dir-list-all${activeList === '' ? ' sel' : ''}" data-slug="">All contacts</div>`;
    Object.keys(KIND_LABEL).forEach(kind => {
      const items = (byKind[kind] || []).filter(l => l.member_count > 0 || kind === 'system');
      if (!items.length) return;
      html += `<h3>${KIND_LABEL[kind]}</h3>`;
      items.sort((a, b) => b.member_count - a.member_count);
      items.forEach(l => {
        html += `<div class="dir-list-item${activeList === l.slug ? ' sel' : ''}" data-slug="${esc(l.slug)}" title="${esc(l.name)}">
          <span>${esc(l.name)}</span><span class="cnt">${l.member_count}</span></div>`;
      });
    });
    el.innerHTML = html;
    el.querySelectorAll('.dir-list-item').forEach(node => {
      node.addEventListener('click', () => {
        activeList = node.getAttribute('data-slug');
        el.querySelectorAll('.dir-list-item').forEach(n => n.classList.remove('sel'));
        node.classList.add('sel');
        const lbl = activeList ? `Filtered by list: ${node.querySelector('span').textContent}` : '';
        document.getElementById('dir-active-list').textContent = lbl;
        loadContacts();
      });
    });
  }

  function columns() {
    return [
      { title: 'Name', field: 'name', widthGrow: 2, formatter: c => {
          const r = c.getData();
          const sub = r.org_title ? `<div style="font-size:.78rem;color:#888;">${esc(r.org_title)}${r.org_name ? ' · ' + esc(r.org_name) : ''}</div>` : (r.org_name ? `<div style="font-size:.78rem;color:#888;">${esc(r.org_name)}</div>` : '');
          return `<strong>${esc(c.getValue())}</strong>${sub}`;
        } },
      { title: 'Type', field: 'is_member', width: 110, formatter: c => {
          const r = c.getData();
          if (r.do_not_contact) return '<span class="pill pill-dnc">do-not-contact</span>';
          return r.is_member ? `<span class="pill pill-member">member${r.trb_id ? ' · ' + esc(r.trb_id) : ''}</span>` : '<span class="pill pill-ext">external</span>';
        } },
      { title: 'Email', field: 'email', widthGrow: 2, formatter: c => c.getValue() ? `<a href="mailto:${esc(c.getValue())}">${esc(c.getValue())}</a>` : '<span style="color:#bbb;">—</span>' },
      { title: 'Phone', field: 'phone', width: 130, formatter: c => esc(c.getValue() || '—') },
      { title: 'Location', field: 'loc', width: 140, formatter: c => { const r = c.getData(); return esc([r.city, r.state].filter(Boolean).join(', ')); } },
      { title: 'Lists', field: 'list_count', width: 70, hozAlign: 'center' },
    ];
  }

  async function loadContacts() {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (activeList) params.set('list', activeList);
    if (memberFilter) params.set('member', memberFilter);
    const data = await api(`/api/admin/contacts?${params.toString()}`);
    if (!data) return;
    const rows = (data.contacts || []).map(r => ({ ...r, name: displayName(r) }));
    if (!table) {
      table = new Tabulator('#dir-grid', {
        data: rows, columns: columns(), layout: 'fitColumns',
        height: '100%', placeholder: 'No contacts match.', reactiveData: false,
      });
    } else {
      table.replaceData(rows);
    }
  }

  async function init() {
    if (!token()) { window.location.href = '/members/'; return; }
    const listsData = await api('/api/admin/lists');
    if (!listsData) return;
    renderSummary(listsData.summary);
    renderLists(listsData.lists || []);
    await loadContacts();

    document.getElementById('dir-search').addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { searchTerm = e.target.value.trim(); loadContacts(); }, 250);
    });
    document.getElementById('dir-member').addEventListener('change', e => {
      memberFilter = e.target.value; loadContacts();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
