/**
 * Tribal Roll viewer — Tabulator grid + read-only SQL console, with a
 * recordkeeper edit modal and per-member change history.
 *   GET  /api/admin/member-list   -> roster + summary + isRecordkeeper
 *   POST /api/query               -> read-only SQL, results replace the grid
 *   GET  /api/members/:id         -> full record (edit form)
 *   PUT  /api/members/:id         -> recordkeeper edit (audit-logged)
 *   GET  /api/members/:id/history -> change history
 *   GET  /api/dev-login           -> local-only test session
 */
(function () {
  const TOKEN_KEY = CONFIG.STORAGE_KEYS.SESSION_TOKEN;
  const $ = (id) => document.getElementById(id);
  let ALL = [];
  let IS_RK = false;
  let EDIT_ID = null;
  let table = null;
  let mode = "roster"; // "roster" | "query"

  const MEMBER_TYPES = ["regular", "honorary", "spousal", "associate", "minor", "hunka"];
  const STATUSES = ["active", "inactive", "resigned", "retired", "deceased", "revoked", "void", "unknown"];
  const TIERS = ["tribal_member", "executive_leadership", "public"];
  const FIELDS = [
    { k: "first_name", l: "First name" }, { k: "last_name", l: "Last name" },
    { k: "initial", l: "Initial" }, { k: "maiden_name", l: "Maiden name" },
    { k: "email", l: "Email" }, { k: "phone", l: "Phone" },
    { k: "address", l: "Address" }, { k: "address2", l: "Address 2" },
    { k: "city", l: "City" }, { k: "state", l: "State" },
    { k: "zipcode", l: "Zip" }, { k: "county", l: "County" },
    { k: "gender", l: "Gender" }, { k: "position", l: "Position" },
    { k: "date_of_birth", l: "Date of birth", t: "date" },
    { k: "enrollment_date", l: "Enrolled", t: "date" },
    { k: "expiration_date", l: "Expires", t: "date" },
    { k: "member_type", l: "Member type", t: "select", opts: MEMBER_TYPES },
    { k: "status", l: "Status", t: "select", opts: STATUSES },
    { k: "portal_acl_tier", l: "Portal tier", t: "select", opts: TIERS },
    { k: "voter", l: "Voter", t: "check" },
    { k: "at_risk", l: "At risk", t: "check" },
    { k: "newsletter_opt_in", l: "Newsletter (paper)", t: "check" },
    { k: "needs_status_review", l: "Needs status review", t: "check" },
    { k: "notes", l: "Notes", t: "textarea", full: true },
  ];

  function token() { return localStorage.getItem(TOKEN_KEY); }

  async function api(path, opts = {}) {
    const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
    const t = token();
    if (t) headers["Authorization"] = `Bearer ${t}`;
    const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, { ...opts, headers });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  }

  function show(view) {
    ["roll-auth", "roll-loading", "roll-content", "roll-error"].forEach((id) => {
      const el = $(id);
      if (el) el.style.display = id === view ? "" : "none";
    });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  }

  async function devLogin() {
    const email = $("roll-dev-email").value.trim();
    if (!email) return;
    const { res, data } = await api(`/api/dev-login?email=${encodeURIComponent(email)}`);
    if (res.ok && data.sessionToken) {
      localStorage.setItem(TOKEN_KEY, data.sessionToken);
      load();
    } else {
      $("roll-auth-msg").textContent = data.error || "Dev login unavailable.";
    }
  }

  function renderSummary(s) {
    if (!s) return;
    const card = (label, val, cls) =>
      `<div class="roll-stat ${cls || ""}"><div class="roll-stat-n">${val}</div><div class="roll-stat-l">${label}</div></div>`;
    const active = (s.by_status.find((x) => x.status === "active") || {}).n || 0;
    $("roll-summary").innerHTML =
      card("Total", s.total) + card("Active", active) +
      card("Voting eligible", s.voting_eligible) +
      card("Needs review", s.needs_review, "warn");
  }

  function fillFilterOptions(s) {
    if (!s) return;
    $("roll-filter-status").innerHTML =
      '<option value="">All statuses</option>' +
      s.by_status.map((x) => `<option value="${esc(x.status)}">${esc(x.status)} (${x.n})</option>`).join("");
    $("roll-filter-type").innerHTML =
      '<option value="">All types</option>' +
      s.by_type.map((x) => `<option value="${esc(x.member_type)}">${esc(x.member_type)} (${x.n})</option>`).join("");
  }

  // ---- Tabulator grid --------------------------------------------------------
  function rosterColumns() {
    const cols = [
      { title: "Name", field: "last_name", widthGrow: 2, sorter: "string",
        formatter: (cell) => {
          const d = cell.getRow().getData();
          const n = `${esc(d.last_name)}${d.last_name && d.first_name ? ", " : ""}${esc(d.first_name)}`;
          return n.trim() || "<em>(no name)</em>";
        } },
      { title: "TRB ID", field: "trb_id", width: 95 },
      { title: "Type", field: "member_type", width: 95 },
      { title: "Status", field: "status", width: 110,
        formatter: (cell) => { const v = cell.getValue() || ""; return `<span class="rs rs-${esc(v)}">${esc(v)}</span>`; } },
      { title: "Position", field: "position", widthGrow: 1 },
      { title: "Location", field: "city", widthGrow: 1, sorter: "string",
        formatter: (cell) => { const d = cell.getRow().getData(); return esc([d.city, d.state].filter(Boolean).join(", ")); } },
      { title: "Email", field: "email", widthGrow: 2 },
      { title: "Phone", field: "phone", width: 125 },
      { title: "Expires", field: "expiration_date", width: 105 },
      { title: "Flags", field: "needs_status_review", headerSort: false, width: 115,
        formatter: (cell) => {
          const d = cell.getRow().getData();
          return (d.voting_eligible ? '<span class="rp rp-v">vote</span>' : "") +
                 (d.needs_status_review ? '<span class="rp rp-w">review</span>' : "");
        } },
    ];
    if (IS_RK) {
      cols.push({ title: "", headerSort: false, width: 70, hozAlign: "center",
        formatter: () => '<button class="roll-edit-btn">Edit</button>',
        cellClick: (e, cell) => openEditor(cell.getRow().getData().trb_id) });
    }
    return cols;
  }

  function initGrid() {
    return new Promise((resolve) => {
      table = new Tabulator("#roll-grid", {
        height: "62vh",
        layout: "fitColumns",
        index: "trb_id",
        placeholder: "No members match.",
        columnDefaults: { headerSortTristate: true, resizable: true },
        columns: rosterColumns(),
        data: [],
      });
      table.on("dataFiltered", (filters, rows) => {
        if (mode === "roster") $("roll-count").textContent = `${rows.length} of ${ALL.length} members`;
      });
      table.on("tableBuilt", resolve);
    });
  }

  // Fit the Tabulator body to the height the flex layout allotted #roll-grid,
  // so the grid reaches the bottom of the viewport (tactical view).
  function sizeGrid() {
    if (!table) return;
    const h = $("roll-grid").clientHeight;
    if (h > 120) table.setHeight(h);
  }

  function applyFilters() {
    if (!table || mode !== "roster") return;
    const q = $("roll-search").value.trim().toLowerCase();
    const status = $("roll-filter-status").value;
    const type = $("roll-filter-type").value;
    const review = $("roll-filter-review").checked;
    table.setFilter((data) => {
      if (status && data.status !== status) return false;
      if (type && data.member_type !== type) return false;
      if (review && !data.needs_status_review) return false;
      if (q) {
        const hay = `${data.first_name || ""} ${data.last_name || ""} ${data.email || ""} ${data.trb_id || ""} ${data.city || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  async function loadRoster() {
    const { res, data } = await api("/api/admin/member-list");
    if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); show("roll-auth"); return; }
    if (res.status === 403) { $("roll-error-msg").textContent = "Access denied — the tribal roll is restricted to executive leadership / the recordkeeper."; show("roll-error"); return; }
    if (!res.ok || !data.success) { $("roll-error-msg").textContent = data.error || "Failed to load the roll."; show("roll-error"); return; }
    ALL = data.members || [];
    IS_RK = !!data.isRecordkeeper;
    renderSummary(data.summary);
    fillFilterOptions(data.summary);
    show("roll-content");
    $("roll-actions").style.display = "";
    if (!table) await initGrid();
    mode = "roster";
    $("roll-sql-roster").style.display = "none";
    table.setColumns(rosterColumns());
    await table.setData(ALL);
    applyFilters();
    sizeGrid();
  }

  // ---- SQL console -----------------------------------------------------------
  async function runQuery() {
    const sql = $("roll-sql-input").value.trim();
    if (!sql) return;
    const msg = $("roll-sql-msg");
    msg.style.color = "#666";
    msg.textContent = "Running…";
    const { res, data } = await api("/api/query", { method: "POST", body: JSON.stringify({ sql }) });
    if (!res.ok || !data.success) {
      msg.style.color = "#9b3030";
      msg.textContent = data.error || "Query failed.";
      return;
    }
    mode = "query";
    table.clearFilter();
    const cols = (data.columns || []).map((k) => ({ title: k, field: k }));
    table.setColumns(cols.length ? cols : [{ title: "(no rows)", field: "_none" }]);
    await table.setData(data.rows || []);
    msg.style.color = "#2e6b2e";
    msg.textContent = `${data.count} row(s)`;
    $("roll-count").textContent = `${data.count} rows · query result`;
    $("roll-sql-roster").style.display = "";
  }

  async function backToRoster() {
    mode = "roster";
    $("roll-sql-roster").style.display = "none";
    $("roll-sql-msg").textContent = "";
    table.setColumns(rosterColumns());
    await table.setData(ALL);
    applyFilters();
    sizeGrid();
  }

  // Download whatever the grid is currently showing (filtered roster OR query
  // result), with its full row data, as CSV.
  function downloadCsv() {
    if (!table) return;
    const rows = table.getData("active"); // current filter + sort order
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const cell = (v) => {
      v = v == null ? "" : String(v);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    const csv = [keys.join(",")]
      .concat(rows.map((r) => keys.map((k) => cell(r[k])).join(",")))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mode === "query" ? "query-result" : "tribal-roll"}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---- Recordkeeper edit modal + history ------------------------------------
  function fieldHtml(f, member) {
    const v = member[f.k];
    const id = `f_${f.k}`;
    if (f.t === "check") {
      return `<div class="roll-field check"><input type="checkbox" id="${id}" ${v ? "checked" : ""}/><label for="${id}">${f.l}</label></div>`;
    }
    let control;
    if (f.t === "select") {
      control = `<select id="${id}">${f.opts.map((o) => `<option value="${o}" ${String(v) === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
    } else if (f.t === "textarea") {
      control = `<textarea id="${id}" rows="3">${esc(v)}</textarea>`;
    } else {
      const val = f.t === "date" && v ? esc(String(v).slice(0, 10)) : esc(v);
      control = `<input type="${f.t || "text"}" id="${id}" value="${val}"/>`;
    }
    return `<div class="roll-field${f.full ? " full" : ""}"><label for="${id}">${f.l}</label>${control}</div>`;
  }

  async function openEditor(trbId) {
    $("roll-modal-msg").textContent = "Loading…";
    $("roll-modal").style.display = "flex";
    EDIT_ID = trbId;
    const { res, data } = await api(`/api/members/${encodeURIComponent(trbId)}`);
    if (!res.ok || !data.success) {
      $("roll-modal-body").innerHTML = `<p style="color:#9b3030;">${esc((data && data.error) || "Failed to load member.")}</p>`;
      $("roll-modal-msg").textContent = "";
      return;
    }
    const m = data.member;
    $("roll-modal-title").textContent = `Edit — ${esc(m.first_name)} ${esc(m.last_name)} (${esc(m.trb_id)})`;
    $("roll-modal-body").innerHTML = FIELDS.map((f) => fieldHtml(f, m)).join("");
    $("roll-modal-msg").textContent = "";
    renderPhoto(m);
    loadHistory(trbId);
  }

  function photoSrc(trbId) {
    return `${CONFIG.API_BASE_URL}/api/member-photo/${encodeURIComponent(trbId)}?token=${encodeURIComponent(token())}&cb=${Date.now()}`;
  }

  function showPhoto(trbId) {
    const img = $("roll-photo-img");
    const ph = $("roll-photo-ph");
    if (!img) return;
    img.onload = () => { img.style.display = ""; if (ph) ph.style.display = "none"; };
    img.onerror = () => { img.style.display = "none"; if (ph) ph.style.display = ""; };
    img.src = photoSrc(trbId);
  }

  function renderPhoto(m) {
    const box = $("roll-modal-photo");
    box.innerHTML =
      '<img id="roll-photo-img" alt="member photo" style="display:none">' +
      '<div class="roll-photo-ph" id="roll-photo-ph">👤</div>' +
      '<div class="roll-photo-controls">' +
      '<input type="file" id="roll-photo-file" accept="image/png,image/jpeg,image/gif,image/webp">' +
      '<div><button class="roll-btn-secondary" id="roll-photo-upload">Upload photo</button>' +
      '<span class="roll-photo-msg" id="roll-photo-msg"></span></div></div>';
    if (m.photo_key) showPhoto(m.trb_id);
    $("roll-photo-upload").addEventListener("click", () => uploadPhoto(m.trb_id));
  }

  async function uploadPhoto(trbId) {
    const file = $("roll-photo-file").files[0];
    const msg = $("roll-photo-msg");
    if (!file) { msg.textContent = "Choose a file first."; return; }
    msg.textContent = "Uploading…";
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch(`${CONFIG.API_BASE_URL}/api/members/${encodeURIComponent(trbId)}/photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      msg.textContent = "Uploaded ✓";
      showPhoto(trbId);
      const row = ALL.find((r) => r.trb_id === trbId);
      if (row) row.had_id_picture = 1;
    } else {
      msg.textContent = (data && data.error) || "Upload failed.";
    }
  }

  async function loadHistory(trbId) {
    const box = $("roll-modal-history");
    box.innerHTML = '<h4>Change history</h4><div class="roll-history-empty">Loading…</div>';
    const { res, data } = await api(`/api/members/${encodeURIComponent(trbId)}/history`);
    if (!res.ok || !data.success) { box.innerHTML = ""; return; }
    const rows = data.history || [];
    if (!rows.length) { box.innerHTML = '<h4>Change history</h4><div class="roll-history-empty">No changes recorded yet.</div>'; return; }
    const fmt = (ts) => { try { return new Date(ts * 1000).toLocaleString(); } catch (e) { return ts; } };
    const actor = (a) => (a || "").split("@")[0];
    box.innerHTML = '<h4>Change history</h4><div class="roll-history-list">' +
      rows.map((h) =>
        `<div class="roll-history-row"><span class="when">${esc(fmt(h.timestamp))}</span>` +
        `<span class="chg"><b>${esc(actor(h.actor))}</b> · ${esc(h.field_changed || h.action)}: ` +
        `<span class="old">${esc(h.old_value) || "∅"}</span> → <span class="new">${esc(h.new_value) || "∅"}</span></span></div>`
      ).join("") + "</div>";
  }

  function collectForm() {
    const out = {};
    FIELDS.forEach((f) => {
      const el = document.getElementById(`f_${f.k}`);
      if (!el) return;
      out[f.k] = f.t === "check" ? el.checked : el.value;
    });
    return out;
  }

  function votingEligible(status, dob) {
    if (status !== "active" || !dob) return 0;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return 0;
    d.setFullYear(d.getFullYear() + 18);
    return d <= new Date() ? 1 : 0;
  }

  function mergeRow(trbId, vals) {
    const upd = { trb_id: trbId };
    Object.keys(vals).forEach((k) => {
      upd[k] = typeof vals[k] === "boolean" ? (vals[k] ? 1 : 0) : vals[k] === "" ? null : vals[k];
    });
    upd.voting_eligible = votingEligible(vals.status, vals.date_of_birth);
    const row = ALL.find((m) => m.trb_id === trbId);
    if (row) Object.assign(row, upd);
    if (table && mode === "roster") table.updateData([upd]).catch(() => {});
  }

  async function saveEditor() {
    if (!EDIT_ID) return;
    $("roll-modal-msg").textContent = "Saving…";
    const vals = collectForm();
    const { res, data } = await api(`/api/members/${encodeURIComponent(EDIT_ID)}`, {
      method: "PUT",
      body: JSON.stringify(vals),
    });
    if (res.ok && data.success) {
      mergeRow(EDIT_ID, vals);
      closeModal();
    } else {
      $("roll-modal-msg").textContent = (data && data.error) || "Save failed.";
    }
  }

  function closeModal() {
    $("roll-modal").style.display = "none";
    EDIT_ID = null;
    $("roll-modal-msg").textContent = "";
    $("roll-modal-history").innerHTML = "";
    $("roll-modal-photo").innerHTML = "";
  }

  // ---- bootstrap -------------------------------------------------------------
  async function load() {
    if (!token()) {
      show("roll-auth");
      $("roll-actions").style.display = "none";
      const isProd = /members\.waccamaw\.org/.test(CONFIG.API_BASE_URL);
      $("roll-dev").style.display = isProd ? "none" : "";
      return;
    }
    show("roll-loading");
    await loadRoster();
  }

  function init() {
    ["roll-search", "roll-filter-status", "roll-filter-type", "roll-filter-review"].forEach((id) => {
      const el = $(id);
      el.addEventListener(id === "roll-search" ? "input" : "change", applyFilters);
    });
    $("roll-dev-go").addEventListener("click", devLogin);
    $("roll-dev-email").addEventListener("keydown", (e) => { if (e.key === "Enter") devLogin(); });
    const logout = $("roll-logout");
    if (logout) logout.addEventListener("click", () => { localStorage.removeItem(TOKEN_KEY); load(); });

    window.addEventListener("resize", sizeGrid);

    // top actions
    $("roll-download").addEventListener("click", downloadCsv);
    $("roll-sql-toggle").addEventListener("click", () => $("roll-drawer").classList.toggle("open"));
    $("roll-drawer-close").addEventListener("click", () => $("roll-drawer").classList.remove("open"));

    // drag the grip to resize the drawer height
    const grip = $("roll-drawer-grip");
    const drawer = $("roll-drawer");
    let dragging = false, startY = 0, startH = 0;
    grip.addEventListener("pointerdown", (e) => {
      dragging = true;
      startY = e.clientY;
      startH = drawer.offsetHeight;
      drawer.classList.add("dragging");
      try { grip.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      e.preventDefault();
    });
    grip.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const h = Math.min(window.innerHeight * 0.88, Math.max(112, startH + (startY - e.clientY)));
      drawer.style.height = h + "px";
    });
    const endDrag = () => { dragging = false; drawer.classList.remove("dragging"); };
    grip.addEventListener("pointerup", endDrag);
    grip.addEventListener("pointercancel", endDrag);

    // SQL console
    $("roll-sql-run").addEventListener("click", runQuery);
    $("roll-sql-roster").addEventListener("click", backToRoster);
    $("roll-sql-input").addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runQuery();
    });
    document.querySelectorAll(".roll-sql-examples code").forEach((c) => {
      c.addEventListener("click", () => { $("roll-sql-input").value = c.getAttribute("data-sql"); runQuery(); });
    });

    // modal
    $("roll-modal-save").addEventListener("click", saveEditor);
    $("roll-modal-cancel").addEventListener("click", closeModal);
    $("roll-modal-x").addEventListener("click", closeModal);
    $("roll-modal").addEventListener("click", (e) => { if (e.target.id === "roll-modal") closeModal(); });

    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
