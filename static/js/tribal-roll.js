/**
 * Tribal Roll viewer — executive-leadership / recordkeeper view of the full
 * member roster. Talks to the members-service Worker (CONFIG.API_BASE_URL):
 *   GET /api/admin/member-list  (Bearer JWT, exec-only)  -> { members, summary }
 *   GET /api/dev-login?email=    (local ENVIRONMENT only) -> { sessionToken }
 *
 * Auth: reuses the portal's localStorage session token. When none is present
 * and the API is local, a dev-login control is offered for testing.
 */
(function () {
  const TOKEN_KEY = CONFIG.STORAGE_KEYS.SESSION_TOKEN;
  const $ = (id) => document.getElementById(id);
  let ALL = [];
  let IS_RK = false; // is the signed-in user a Recordkeeper (can edit)
  let EDIT_ID = null; // trb_id currently being edited

  // Recordkeeper-editable fields (must match RECORDKEEPER_EDITABLE in members-db.js)
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

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

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
    const { res, data } = await api(
      `/api/dev-login?email=${encodeURIComponent(email)}`
    );
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
      card("Total", s.total) +
      card("Active", active) +
      card("Voting eligible", s.voting_eligible) +
      card("Needs review", s.needs_review, "warn");
  }

  function applyFilters() {
    const q = $("roll-search").value.trim().toLowerCase();
    const status = $("roll-filter-status").value;
    const type = $("roll-filter-type").value;
    const reviewOnly = $("roll-filter-review").checked;
    const rows = ALL.filter((m) => {
      if (status && m.status !== status) return false;
      if (type && m.member_type !== type) return false;
      if (reviewOnly && !m.needs_status_review) return false;
      if (q) {
        const hay = `${m.first_name || ""} ${m.last_name || ""} ${m.email || ""} ${m.trb_id || ""} ${m.city || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    renderRows(rows);
  }

  function renderRows(rows) {
    $("roll-count").textContent = `${rows.length} of ${ALL.length} members`;
    const body = rows
      .map((m) => {
        const name = `${esc(m.last_name)}${m.last_name && m.first_name ? ", " : ""}${esc(m.first_name)}`;
        const loc = [m.city, m.state].filter(Boolean).map(esc).join(", ");
        const flags =
          (m.voting_eligible ? '<span class="roll-pill vote" title="Voting eligible">vote</span>' : "") +
          (m.needs_status_review ? '<span class="roll-pill warn" title="Status needs review vs current records">review</span>' : "");
        return `<tr>
          <td>${name || "<em>(no name)</em>"}</td>
          <td class="mono idcell" title="${esc(m.trb_id)}">${esc(m.trb_id)}</td>
          <td>${esc(m.member_type)}</td>
          <td><span class="roll-status s-${esc(m.status)}">${esc(m.status)}</span></td>
          <td>${esc(m.position)}</td>
          <td>${loc}</td>
          <td class="emailcell" title="${esc(m.email)}">${esc(m.email)}</td>
          <td>${esc(m.phone)}</td>
          <td>${esc(m.expiration_date)}</td>
          <td>${flags}</td>
          <td>${IS_RK ? `<button class="roll-edit-btn" data-edit="${esc(m.trb_id)}">Edit</button>` : ""}</td>
        </tr>`;
      })
      .join("");
    $("roll-tbody").innerHTML =
      body || '<tr><td colspan="11" style="text-align:center;padding:2rem;">No members match.</td></tr>';
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

  async function load() {
    if (!token()) {
      show("roll-auth");
      // Offer dev login whenever we're not pointed at the production Worker
      // (localhost or a private LAN address). It still 404s unless the Worker
      // has DEV_LOGIN enabled, so showing it is harmless on prod.
      const isProd = /members\.waccamaw\.org/.test(CONFIG.API_BASE_URL);
      $("roll-dev").style.display = isProd ? "none" : "";
      return;
    }
    show("roll-loading");
    const { res, data } = await api("/api/admin/member-list");
    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      show("roll-auth");
      return;
    }
    if (res.status === 403) {
      $("roll-error-msg").textContent =
        "Access denied — the tribal roll is restricted to executive leadership / the recordkeeper.";
      show("roll-error");
      return;
    }
    if (!res.ok || !data.success) {
      $("roll-error-msg").textContent = data.error || "Failed to load the roll.";
      show("roll-error");
      return;
    }
    ALL = data.members || [];
    IS_RK = !!data.isRecordkeeper;
    $("roll-th-edit").style.display = IS_RK ? "" : "none";
    renderSummary(data.summary);
    fillFilterOptions(data.summary);
    applyFilters();
    show("roll-content");
  }

  // ---- Recordkeeper edit modal ----------------------------------------------
  function fieldHtml(f, member) {
    const v = member[f.k];
    const id = `f_${f.k}`;
    if (f.t === "check") {
      return `<div class="roll-field check"><input type="checkbox" id="${id}" ${v ? "checked" : ""}/><label for="${id}">${f.l}</label></div>`;
    }
    let control;
    if (f.t === "select") {
      const opts = f.opts
        .map((o) => `<option value="${o}" ${String(v) === o ? "selected" : ""}>${o}</option>`)
        .join("");
      control = `<select id="${id}">${opts}</select>`;
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
    $("roll-modal-title").textContent =
      `Edit — ${esc(m.first_name)} ${esc(m.last_name)} (${esc(m.trb_id)})`;
    $("roll-modal-body").innerHTML = FIELDS.map((f) => fieldHtml(f, m)).join("");
    $("roll-modal-msg").textContent = "";
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
    const row = ALL.find((m) => m.trb_id === trbId);
    if (!row) return;
    Object.keys(vals).forEach((k) => {
      if (k in row) {
        if (typeof row[k] === "number" || typeof vals[k] === "boolean") {
          row[k] = vals[k] ? 1 : 0;
        } else {
          row[k] = vals[k] === "" ? null : vals[k];
        }
      }
    });
    row.voting_eligible = votingEligible(vals.status, vals.date_of_birth);
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
      applyFilters();
      closeModal();
    } else {
      $("roll-modal-msg").textContent = (data && data.error) || "Save failed.";
    }
  }

  function closeModal() {
    $("roll-modal").style.display = "none";
    EDIT_ID = null;
    $("roll-modal-msg").textContent = "";
  }

  function init() {
    $("roll-search").addEventListener("input", applyFilters);
    $("roll-filter-status").addEventListener("change", applyFilters);
    $("roll-filter-type").addEventListener("change", applyFilters);
    $("roll-filter-review").addEventListener("change", applyFilters);
    $("roll-dev-go").addEventListener("click", devLogin);
    $("roll-dev-email").addEventListener("keydown", (e) => {
      if (e.key === "Enter") devLogin();
    });
    const logout = $("roll-logout");
    if (logout)
      logout.addEventListener("click", () => {
        localStorage.removeItem(TOKEN_KEY);
        load();
      });

    // Edit buttons (delegated, since rows re-render on filter)
    $("roll-tbody").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-edit]");
      if (btn) openEditor(btn.getAttribute("data-edit"));
    });
    $("roll-modal-save").addEventListener("click", saveEditor);
    $("roll-modal-cancel").addEventListener("click", closeModal);
    $("roll-modal-x").addEventListener("click", closeModal);
    $("roll-modal").addEventListener("click", (e) => {
      if (e.target.id === "roll-modal") closeModal();
    });

    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
