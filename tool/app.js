/* SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
 * SPDX-License-Identifier: GPL-3.0-or-later */
/* Web scorecard: renders the criteria from data.json and scores answers with scoring.js. */
(function () {
  "use strict";

  var STORE_KEY = "testing-criteria-evaluation";
  var data = null;
  var state = { answers: {}, notes: {}, profile: {} };
  var result = null;
  var current = "summary";
  var filter = { text: "", show: "all" };

  // ------------------------------------------------------------------ utilities
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /** "2026-10-15 14:32 (PH time, UTC+8)" in the reader's time zone; falls back to the stored text. */
  function when(iso, fallback) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d)) return fallback || "";
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    var off = -d.getTimezoneOffset(), oh = Math.floor(Math.abs(off) / 60), om = Math.abs(off) % 60;
    var utc = "UTC" + (off >= 0 ? "+" : "−") + oh + (om ? ":" + p(om) : "");
    var zone = ""; try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { /* old browser */ }
    var label = zone === "Asia/Manila" ? "PH time, " + utc : "your time, " + utc;
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + " (" + label + ")";
  }
  function pct(x, d) { return (x * 100).toFixed(d == null ? 1 : d) + "%"; }
  function statusPill(s) { return '<span class="status s-' + s.replace(/ /g, "-") + '">' + esc(s) + "</span>"; }
  function $(sel) { return document.querySelector(sel); }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }
  function restore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        state.answers = s.answers || {}; state.notes = s.notes || {}; state.profile = migrateProfile(s.profile || {});
      }
    } catch (e) { /* ignore */ }
  }
  function recompute() { result = Scoring.scoreAll(data, state.answers); }

  function sheetByKey(k) { return data.sheets.filter(function (s) { return s.key === k; })[0]; }

  // ------------------------------------------------------------------ chrome
  function renderBanner() {
    var m = data.meta, b = $("#banner");
    var home = m.home ? ' · <a href="' + esc(m.home) + '">All published versions</a>' : "";
    if (m.is_release) {
      b.className = "banner release";
      b.innerHTML = "Released version " + esc(m.version) + " · commit " + esc(m.commit) + " · built " + esc(when(m.built_iso, m.built)) + home;
    } else {
      b.className = "banner draft";
      var what = m.kind === "candidate" ? "RELEASE CANDIDATE" : m.kind === "branch" ? "BRANCH PREVIEW" : "DRAFT";
      b.innerHTML = what + " — " + esc(m.label) + " · built " + esc(when(m.built_iso, m.built)) + " — for review only, not for official evaluation." + home;
    }
    $("#foot").innerHTML = "Criteria version " + esc(m.label) +
      (m.repository ? ' · <a href="' + esc(m.repository) + '">source repository</a>' : "") +
      " · Scores follow the same rules as the scorecard workbook." +
      (m.show_license ? "<br>Content © " + esc(m.owner || "") + ' · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · Web scorecard code ' +
        '<a href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0-or-later</a>' : "");
  }

  var PHONE = 767;
  function tabState(key) {
    var r = result.sheets[key]; if (!r) return "";
    if (r.status === "PASSED") return "pass";
    if (r.status === "NOT PASSED") return "fail";
    return r.progress > 0 ? "prog" : "todo";
  }
  function tabParts(tab) { var m = /^(\S+)\s+(.*)$/.exec(tab); return m ? [m[1], m[2]] : [tab, ""]; }

  /** Sidebar: overall progress, then Overview, Levels (status and progress each), Output and
   *  the Reference contents (expanded while a reference page is open). */
  function renderTabs() {
    var head = current.split("/")[0];
    var link = function (key, inner, title, cls) {
      return '<a href="#' + key + '" class="' + (cls || "") + '"' + (head === key ? ' aria-current="page"' : "") + (title ? ' title="' + esc(title) + '"' : "") + ">" + inner + "</a>";
    };
    var all = 0, done = 0;
    var levels = data.sheets.map(function (s) {
      var r = result.sheets[s.key], st = tabState(s.key), tp = tabParts(s.tab);
      var tested = r.total - r.notTested; all += r.total; done += tested;
      return link(s.key, '<span class="t-code">' + esc(tp[0]) + '</span><span class="t-name">' + esc(tp[1]) + "</span>" +
        '<span class="t-count">' + tested + "/" + r.total + '</span><span class="ts ts-' + st + '" aria-hidden="true"></span>' +
        '<span class="t-meter"><span class="ts-' + st + '" style="width:' + (r.progress * 100).toFixed(0) + '%"></span></span>',
        s.title + " — " + r.status + " · " + tested + " of " + r.total + " evaluated · score " + pct(r.score) + " (threshold " + pct(r.threshold, 0) + ")", "lvl");
    }).join("");
    var onRef = head === "ref";
    $("#tabs").innerHTML =
      '<div class="sd-prog"><div><b>' + esc(result.highest) + '</b><span>highest level achieved</span></div><div class="bar"><span style="width:' + (all ? done / all * 100 : 0).toFixed(0) + '%"></span></div>' +
        '<span class="sd-small">' + done + " of " + all + " criteria evaluated</span></div>" +
      '<div class="tg"><span class="tg-l">Overview</span>' + link("summary", "Summary") + link("profile", "System profile") + "</div>" +
      '<div class="tg tg-levels"><span class="tg-l">Levels</span>' + levels + "</div>" +
      '<div class="tg"><span class="tg-l">Output</span>' + link("report", "Printed report") + link("certificate", "Certificate") + link("verify", "Verify a certificate") + "</div>" +
      (Ref.ready() ? '<div class="tg tg-ref"><span class="tg-l">Reference</span>' + Ref.navTree(onRef ? current.slice(4) : null) + "</div>" : "");
    var cur = head === "summary" ? "Summary" : head === "profile" ? "System profile" : head === "report" ? "Printed report" : head === "ref" ? "Reference" :
      head === "certificate" ? "Certificate" : head === "verify" ? "Verify a certificate" :
      (sheetByKey(head) ? sheetByKey(head).tab : "");
    $("#nav-cur").textContent = cur;
  }

  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    $("#nav-toggle").setAttribute("aria-expanded", String(open));
    $("#scrim").hidden = !open;
  }
  function setMenu(open) {
    $("#menu-list").hidden = !open;
    $("#menu-btn").setAttribute("aria-expanded", String(open));
  }
  function measureHeader() {
    document.documentElement.style.setProperty("--hdr", $("#top").offsetHeight + "px");
  }

  var lastHash = null;
  /** Render the page for the address. The page scrolls only when the address changes (a link or
   *  tab was followed); re-rendering after an answer, a filter or a load keeps the position. */
  function route() {
    var h = decodeURIComponent((location.hash || "#summary").slice(1));
    var head = h.split("/")[0], rest = h.slice(head.length + 1);
    var moved = h !== lastHash, y = window.scrollY;
    lastHash = h;
    current = h;
    setNav(false);
    renderTabs();
    var main = $("#main"), focus = null;
    if (head === "summary") main.innerHTML = viewSummary();
    else if (head === "profile") main.innerHTML = viewProfile();
    else if (head === "report") { Ref.closeDrawer(); main.innerHTML = viewReport(); }
    else if (head === "certificate") {
      Ref.closeDrawer(); main.innerHTML = Cert.view(certCtx()); loadCertFonts(); Cert.fit();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(Cert.fit);   // the brand fonts change the line breaks
    }
    else if (head === "verify") {
      Ref.closeDrawer(); main.innerHTML = Cert.viewVerify(rest); loadCertFonts(); Cert.fit();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(Cert.fit);
    }
    else if (head === "ref" && Ref.ready()) { main.innerHTML = Ref.viewReference(rest); if (moved) window.scrollTo(0, 0); Ref.afterReference(); measureHeader(); return; }
    else if (sheetByKey(head)) {
      if (rest && moved) { filter.text = ""; filter.show = "all"; }
      focus = rest;
      main.innerHTML = viewSheet(sheetByKey(head));
    }
    else { location.hash = "#summary"; return; }
    measureHeader();
    var card = focus && document.getElementById("card-" + focus);
    if (card) card.classList.add("target");
    if (!moved) window.scrollTo(0, y);
    else if (card) scrollToCard(card);
    else window.scrollTo(0, 0);
  }

  function scrollToCard(card) {
    var off = $("#top").offsetHeight + (($(".tracker") || {}).offsetHeight || 0) + 12;
    window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - off, behavior: "auto" });
  }

  // ------------------------------------------------------------------ summary
  function viewSummary() {
    var r = result, p = state.profile;
    var rows = r.levels.map(function (l) {
      var partRows = "";
      if (l.parts.length > 1) {
        partRows = l.parts.map(function (k) {
          var s = r.sheets[k], sh = sheetByKey(k);
          return '<tr><td style="padding-left:24px"><a href="#' + k + '">' + esc(sh.title) + '</a></td><td class="num">' + pct(s.score) +
            '</td><td class="num">' + pct(s.threshold, 0) + '</td><td class="num">' + s.criticalNotMet + '</td><td class="num">' +
            s.notTested + '</td><td class="num">' + pct(s.progress, 0) + "</td><td>" + statusPill(s.status) + "</td><td>(part of Level 2)</td></tr>";
        }).join("");
      }
      var link = l.parts.length === 1 ? '<a href="#' + l.parts[0] + '">' + esc(l.name) + "</a>" : esc(l.name);
      return "<tr><td><b>" + link + '</b></td><td class="num">' + pct(l.score) + '</td><td class="num">' +
        (l.threshold == null ? "All parts" : pct(l.threshold, 0)) + '</td><td class="num">' + l.criticalNotMet + '</td><td class="num">' +
        l.notTested + '</td><td class="num">' + pct(l.progress, 0) + "</td><td>" + statusPill(l.status) + "</td><td>" + statusPill(l.gated) + "</td></tr>" + partRows;
    }).join("");
    var pol = data.scoring.policy;
    return '<section class="panel"><h2>Summary scorecard</h2>' +
      "<p>System under test: <b>" + esc((p.system_name || "—") + " " + (p.version || "")) + "</b> · Service provider: <b>" + esc(p.vendor || "—") + "</b></p>" +
      '<p class="sub">Threshold status: ' + (pol.status === "Approved"
        ? "APPROVED by " + esc(pol.approved_by) + " on " + esc(pol.date_approved) + " (" + esc(pol.reference) + ")"
        : "PROPOSED — for DOH approval") + "</p>" +
      '<div class="stats"><div class="stat"><div class="k">Highest level achieved</div><div class="v">' + esc(r.highest) + "</div></div>" +
      '<div class="stat"><div class="k">Conformant for use in the HIE? ' + Ref.help("summary.conformant", "Conformant") + '</div><div class="v">' + (r.conformant ? "YES" + (pol.status !== "Approved" ? " (provisional)" : "") : "NOT YET") + "</div></div>" +
      '<div class="stat"><div class="k">Critical items not met</div><div class="v">' + r.criticalOpen + "</div></div></div></section>" +
      '<section class="panel"><table class="grid"><thead><tr><th>Level</th><th class="num">Score</th><th class="num">Pass threshold ' + Ref.help("summary.threshold", "Pass threshold") + '</th>' +
      '<th class="num">Critical not met</th><th class="num">Items not tested</th><th class="num">Progress ' + Ref.help("summary.progress", "Progress") + '</th><th>Sheet status</th><th>Level status (gated) ' + Ref.help("status.LOCKED", "Level status") + '</th></tr></thead><tbody>' +
      rows + "</tbody></table>" +
      '<p class="sub" style="margin-top:10px">A level is LOCKED until the level before it passes. Level 2 passes only when all four parts pass. Conformant = Levels 0 to 3 passed and no critical item not met.</p></section>';
  }

  // ------------------------------------------------------------------ profile
  // The team (profile section with `team` in criteria/profile.yaml): one row per person. A role's key
  // stores the name, <key>_agency and <key>_designation the rest, as in System Profile section C of the workbook.
  function teamSection() { return data.profile.sections.filter(function (g) { return g.team; })[0] || null; }
  function teamRoles() { var g = teamSection(); return g ? g.team.roles : []; }
  function person(key) {
    var p = state.profile;
    return { name: String(p[key] || "").trim(), agency: String(p[key + "_agency"] || "").trim(), designation: String(p[key + "_designation"] || "").trim() };
  }
  /** Names of the roles whose key starts with prefix, e.g. every validator_*. */
  function namesOf(prefix) {
    return teamRoles().filter(function (r) { return r.key.indexOf(prefix) === 0; }).map(function (r) { return person(r.key).name; }).filter(Boolean);
  }
  /** Older saves kept validators and observers in one box, one name per line: move them to the numbered roles. */
  function migrateProfile(p) {
    [["validators", "validator_"], ["observers", "observer_"]].forEach(function (m) {
      if (p[m[0]] == null) return;
      var names = String(p[m[0]]).split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
      var slots = teamRoles().filter(function (r) { return r.key.indexOf(m[1]) === 0 && !p[r.key]; }).map(function (r) { return r.key; });
      slots.forEach(function (k, i) {
        var take = i === slots.length - 1 ? names.slice(i) : names.slice(i, i + 1);   // extra names go to the last free row
        if (take.length) p[k] = take.join("; ");
      });
      delete p[m[0]];
    });
    return p;
  }
  /** Default validity, as in the workbook: 2 years from the certificate date (PROPOSED). */
  function validDefault() {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(state.profile.certificate_date || "");
    return m ? (+m[1] + 2) + "-" + m[2] + "-" + (m[2] + m[3] === "0229" ? "28" : m[3]) : "";
  }
  function validPlaceholder() {
    var d = validDefault();
    return d ? "Leave blank for " + d + " (2 years, PROPOSED)" : "Leave blank for 2 years from the certificate date";
  }
  /** The roles marked required in profile.yaml must have a name: the same rule as the workbook's team composition check. */
  function teamCheck() {
    var miss = teamRoles().filter(function (r) { return r.required && !person(r.key).name; }).map(function (r) { return r.label; });
    var v = namesOf("validator_").length, o = namesOf("observer_").length;
    return miss.length ? '<span class="pf-warn">Team incomplete: enter the name of ' + esc(miss.join(", ")) + ".</span>"
      : '<span class="pf-ok">✓ Team complete: ' + v + " validator" + (v === 1 ? "" : "s") + ", " + o + " observer" + (o === 1 ? "" : "s") + ".</span>";
  }
  function groupCount(g) {
    var keys = g.fields.map(function (f) { return f.key; }).concat(g.team ? g.team.roles.map(function (r) { return r.key; }) : []);
    var n = keys.filter(function (k) { return String(state.profile[k] || "").trim(); }).length;
    return n + " of " + keys.length + " filled";
  }

  // Source entries for the ✎ buttons and popover footers: the page, each section and each field
  // point to their lines in criteria/profile.yaml, as criteria point to their own files.
  var PF_PARTS = [["label", "Label"], ["help", "Help"], ["options", "Choices"], ["placeholder", "Placeholder"]];
  function profilePageSrc() {
    var P = data.profile, s = P.src;
    return { title: "System Profile", id: "profile", p: s.p, l: s.l, text: P.intro,
      rows: [{ label: "Page title", l: s.f.title, text: P.title }, { label: "Introduction", l: s.f.intro, text: P.intro }].filter(function (r) { return r.l; }) };
  }
  function sectionSrc(g, n) {
    var rows = [{ label: "Section title", l: g.src.f.title, text: g.title }, { label: "Section note", l: g.src.f.note, text: g.note }];
    if (g.team) {
      rows = rows.concat(g.team.roles.map(function (r) { return { label: "Role: " + r.label, l: r.src.l, text: r.help || "" }; }))
        .concat([{ label: "Agency choices", l: g.team.src.f.agencies, text: g.team.agencies.join("\n") },
          { label: "Sign-off order", l: g.team.src.f.sign_off, text: g.team.sign_off.join(", ") }]);
    }
    rows = rows.concat(g.fields.map(function (f) { return { label: f.label, l: f.src.l, text: f.help || "" }; }));
    return { title: "System Profile — " + n + ". " + g.title, id: "profile-" + n, p: data.profile.src.p, l: g.src.l, text: g.title, rows: rows.filter(function (r) { return r.l; }) };
  }
  function fieldSrc(f) {
    return { title: "System Profile field: " + f.label, id: f.key, p: data.profile.src.p, l: f.src.l, text: f.help || "",
      rows: PF_PARTS.filter(function (x) { return f.src.f[x[0]]; }).map(function (x) {
        return { label: x[1], l: f.src.f[x[0]], text: Array.isArray(f[x[0]]) ? f[x[0]].join("\n") : f[x[0]] };
      }) };
  }
  /** ⓘ next to a field label: the help, the choices and the stored key(s), with Edit / Show the lines / Suggest a change. */
  function fieldTip(f, extra) {
    var html = '<div class="xp-kind">System Profile</div><div class="xp-title">' + esc(f.label) + "</div>" + (f.help ? "<p>" + esc(f.help) + "</p>" : "") +
      '<dl class="xp-dl">' + (f.options ? "<dt>Choices</dt><dd>" + esc(f.options.join("\n")) + "</dd>" : "") + (extra || "") +
      "<dt>Saved as</dt><dd><code>" + esc(f.saved || f.key) + "</code></dd></dl>" + Ref.srcLine(fieldSrc(f));
    return Ref.tip("pf-" + f.key, html, f.label);
  }
  function roleTip(r) {
    return fieldTip({ key: r.key, label: r.label, help: r.help, src: r.src, saved: r.key + ", " + r.key + "_agency, " + r.key + "_designation" },
      "<dt>Signs as</dt><dd>" + esc(r.sign_as) + "</dd><dt>Needed</dt><dd>" + (r.required ? "Required" : "Optional") + "</dd>");
  }

  /** Section 2: one row per person with name, agency and designation, as in System Profile section C of the workbook. */
  function teamTable(t) {
    var cell = function (r, part, label, ctl) {
      return '<div class="pf-tc"><label class="pf-tl" for="pf-' + r.key + part + '">' + label + "</label>" + ctl + "</div>";
    };
    var rows = t.roles.map(function (r) {
      var x = person(r.key), agency = state.profile[r.key + "_agency"] || "";
      var opts = agency && t.agencies.indexOf(agency) < 0 ? t.agencies.concat([agency]) : t.agencies;
      var input = function (part, v, what) {
        return '<input type="text" id="pf-' + r.key + part + '" data-profile="' + r.key + part + '" value="' + esc(v) + '" aria-label="' + esc(r.label + " " + what) + '"' +
          (part === "" && r.required ? ' aria-required="true"' : "") + ' autocomplete="off">';
      };
      return '<div class="pf-trow' + (r.required ? "" : " opt") + '"><div class="pf-role"><b>' + esc(r.label) + "</b> " + roleTip(r) +
        '<span class="pf-req">' + (r.required ? "required" : "optional") + "</span></div>" +
        cell(r, "", "Name", input("", state.profile[r.key] || "", "name")) +
        cell(r, "_agency", "Agency", '<select id="pf-' + r.key + '_agency" data-profile="' + r.key + '_agency" aria-label="' + esc(r.label + " agency") + '"><option value="">Choose…</option>' +
          opts.map(function (o) { return "<option" + (o === agency ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>") +
        cell(r, "_designation", "Designation", input("_designation", state.profile[r.key + "_designation"] || "", "designation")) + "</div>";
    }).join("");
    return (t.help ? '<p class="pf-hint pf-team-help">' + esc(t.help) + "</p>" : "") +
      '<div class="pf-team-tbl"><div class="pf-trow pf-thead" aria-hidden="true"><span>Role</span><span>Name</span><span>Agency</span><span>Designation</span></div>' + rows + "</div>" +
      '<p class="pf-team" id="pf-team" role="status">' + teamCheck() + "</p>";
  }

  function profileField(f) {
    var v = state.profile[f.key] || "", id = "pf-" + f.key;
    var attrs = ' id="' + id + '" data-profile="' + f.key + '"' + (f.help ? ' aria-describedby="' + id + '-h"' : "") + (f.required ? ' aria-required="true"' : "");
    var ctl;
    if (f.options) {
      var opts = v && f.options.indexOf(v) < 0 ? f.options.concat([v]) : f.options;   // keep a value typed before the list existed
      ctl = "<select" + attrs + '><option value="">Choose…</option>' +
        opts.map(function (o) { return "<option" + (o === v ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>";
    } else if (f.type === "long") {
      ctl = "<textarea" + attrs + ' rows="3"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "") + ">" + esc(v) + "</textarea>";
    } else {
      var date = f.type === "date" && (!v || /^\d{4}-\d{2}-\d{2}$/.test(v));   // older free-text dates stay editable as text
      var ph = f.key === "valid_until" ? validPlaceholder() : f.placeholder;
      ctl = '<input type="' + (date ? "date" : "text") + '"' + attrs + ' value="' + esc(v) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : "") + ">";
    }
    return '<div class="pf-field' + (f.type === "long" ? " wide" : "") + '"><div class="pf-lab"><label for="' + id + '">' + esc(f.label) +
      (f.required ? ' <span class="pf-req">' + esc(f.required) + "</span>" : "") + "</label>" + fieldTip(f) + "</div>" + ctl +
      (f.help ? '<span class="pf-hint" id="' + id + '-h">' + esc(f.help) + "</span>" : "") + "</div>";
  }

  function viewProfile() {
    var P = data.profile, first = data.sheets[0];
    return '<section class="panel"><h2>' + esc(P.title) + Ref.src(profilePageSrc()) + '</h2><p class="intro">' + esc(P.intro) +
      " Each change is saved in this browser as you type; use <b>Evaluation › Save evaluation</b> to keep a copy as a file.</p></section>" +
      P.sections.map(function (g, i) {
        var n = i + 1;
        return '<section class="panel pf-group" role="group" aria-labelledby="pf-h-' + n + '"><div class="pf-head">' +
          '<h3 class="pf-title" id="pf-h-' + n + '"><span class="pf-num">' + n + "</span>" + esc(g.title) + "</h3>" +
          '<span class="pf-count" id="pf-cnt-' + n + '">' + groupCount(g) + "</span>" + Ref.src(sectionSrc(g, n)) + "</div>" +
          (g.note ? '<p class="pf-note">' + esc(g.note) + "</p>" : "") + (g.team ? teamTable(g.team) : "") +
          '<div class="profile">' + g.fields.map(profileField).join("") + "</div></section>";
      }).join("") +
      '<nav class="pager noprint" aria-label="Pages"><a href="#summary">‹ Summary</a><a href="#' + first.key + '">' + esc(first.tab) + " ›</a></nav>";
  }
  /** Refresh the counts, the team check and the default validity while typing, without re-rendering the form. */
  function refreshProfile() {
    data.profile.sections.forEach(function (g, i) { var el = document.getElementById("pf-cnt-" + (i + 1)); if (el) el.textContent = groupCount(g); });
    var team = $("#pf-team"); if (team) team.innerHTML = teamCheck();
    var vu = $("#pf-valid_until"); if (vu) vu.placeholder = validPlaceholder();
  }

  // ------------------------------------------------------------------ criteria sheet
  /** Visual state of a criterion: met, fail, partial, na, prog (some sub-items answered), nt. */
  function cardState(c, x) {
    if (x.S === 1) return "fail";   // a critical item or ★ sub-item already failed, even if others are untested
    if (x.M === Scoring.NOT_TESTED) {
      var answered = (x.subs || []).filter(function (sb) { return sb.value !== Scoring.NOT_TESTED; }).length;
      return answered ? "prog" : "nt";
    }
    if (x.N === "") return "na";
    if (x.S === 1 || x.N === 0) return "fail";
    if (x.N >= 1) return "met";
    return "partial";
  }
  function cardClass(c, x) { return "st-" + cardState(c, x) + (c.weight === 0 ? " info" : ""); }
  function badge(c, x) {
    var st = cardState(c, x), t;
    if (st === "met") t = "✓ Met";
    else if (st === "fail") t = x.S ? "✗ Critical failure" : "✗ Not met";
    else if (st === "partial") t = "Met – for compliance " + pct(x.N, 0);
    else if (st === "na") t = "— N/A";
    else if (st === "prog") {
      var done = x.subs.filter(function (sb) { return sb.value !== Scoring.NOT_TESTED; }).length;
      t = "In progress " + done + "/" + x.subs.length;
    } else t = "Not tested";
    return '<span class="badge b-' + st + '">' + t + "</span>";
  }
  function valClass(v) { return v === "Met" || v === "Fully integrated" ? "v-met" : v === "Not Met" ? "v-fail" : v === "N/A" ? "v-na" : v === Scoring.NOT_TESTED ? "v-nt" : "v-partial"; }

  function options(list, value) {
    return list.map(function (o) { return "<option" + (o === value ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("");
  }

  function resultLine(c, x) {
    var parts = [];
    if (c.sub_items.length) parts.push("Required <b>" + x.K + "</b> · Achieved <b>" + x.L + "</b>");
    parts.push("Result <b>" + esc(x.M) + "</b>");
    parts.push("Score <b>" + (x.N === "" ? "—" : pct(x.N, 0)) + "</b>");
    if (x.S) parts.push('<span class="out-bad">critical failure</span>');
    if (x.outstanding) parts.push('<span class="' + (/need|Needs/.test(x.outstanding) ? "out-bad" : "") + '">' + esc(x.outstanding) + "</span>");
    return parts.join(" · ");
  }

  function renderCard(c, x) {
    var std = data.scoring.answers.standard, tier = data.scoring.answers.tier;
    var seen = new Set();
    var crit = c.critical === "yes" ? '<span class="tag critical">★ CRITICAL ' + Ref.help("critical.yes", "Critical") + "</span>"
      : c.critical === "subs" ? '<span class="tag critical">★ critical sub-items ' + Ref.help("critical.subs", "Critical sub-items") + "</span>" : "";
    var answer;
    if (!c.sub_items.length) {
      var list = c.scoring === "tier" ? tier : std;
      answer = '<div class="answer"><label for="a-' + esc(c.id) + '">Result</label> ' + Ref.help("result", "Result") + '<select id="a-' + esc(c.id) + '" data-answer="' + esc(c.id) + '">' +
        options(list, state.answers[c.id] || Scoring.NOT_TESTED) + "</select></div>";
      answer = answer.replace("<select ", '<select class="' + valClass(state.answers[c.id] || Scoring.NOT_TESTED) + '" ');
    } else {
      answer = '<ul class="subs">' + c.sub_items.map(function (s) {
        var v = state.answers[s.id] || Scoring.NOT_TESTED;
        return '<li class="' + valClass(v) + '"><span class="sid">' + esc(s.id) + "</span><span>" + (s.critical ? '<span class="tag critical">★</span> ' : "") + Ref.link(s.text, seen) +
          '</span><select class="' + valClass(v) + '" aria-label="Result for ' + esc(s.id) + '" data-answer="' + esc(s.id) + '">' + options(std, state.answers[s.id] || Scoring.NOT_TESTED) + "</select></li>";
      }).join("") + "</ul>";
    }
    var n = Ref.ready() ? Ref.counts(c) : { trc: 0, trm: 0 };
    var g = function (tab, label, cnt) {
      return '<button type="button" class="gbtn" data-guide="' + esc(c.id) + '" data-tab="' + tab + '">' + label + (cnt != null ? ' <span class="cnt">' + cnt + "</span>" : "") + "</button>";
    };
    return '<article class="crit ' + cardClass(c, x) + (Ref.guideId && Ref.guideId() === c.id ? " in-guide" : "") + '" id="card-' + esc(c.id) + '">' +
      '<div class="crit-head"><a class="cid" href="#' + esc(current.split("/")[0]) + "/" + esc(c.id) + '" title="Link to this criterion">' + esc(c.id) + '</a><span class="section">' + esc(c.section) + "</span>" + crit +
      '<span class="tag">' + esc(c.scoring) + " " + Ref.help("scoring." + c.scoring, c.scoring) + " · weight " + esc(c.weight) + (c.weight === 0 ? " (info only)" : "") + " " + Ref.help("weight", "Weight") +
      '</span><span class="tag">' + esc(c.validation_role) + " " + Ref.help("validation_role", "Validation role") + "</span>" + '<span class="badge-slot" id="bdg-' + esc(c.id) + '">' + badge(c, x) + "</span>" + Ref.src(Ref.critSrc(c), "card") + "</div>" +
      '<p class="title">' + Ref.link(c.title, seen) + "</p>" + answer +
      '<div class="result" id="res-' + esc(c.id) + '">' + resultLine(c, x) + "</div>" +
      '<textarea class="notes" placeholder="Evidence reference / notes" data-note="' + esc(c.id) + '" aria-label="Notes for ' + esc(c.id) + '">' + esc(state.notes[c.id] || "") + "</textarea>" +
      '<div class="gbar" aria-label="Guides and references">' + g("dev", "Developer's guide") + g("val", "Validator's guide") + g("evd", "Evidence required") +
      g("trc", "Traces", n.trc) + g("trm", "Terms", n.trm) + "</div></article>";
  }

  function sheetStats(s) {
    var r = result.sheets[s.key];
    var scoreCls = r.score >= r.threshold ? "good" : r.progress > 0 ? "bad" : "";
    return '<div class="stats" id="stats">' +
      '<div class="stat ' + scoreCls + '"><div class="k">Score</div><div class="v">' + pct(r.score) + '</div><div class="bar thr"><span style="width:' + Math.min(r.score, 1) * 100 + '%"></span><i style="left:' + r.threshold * 100 + '%"></i></div></div>' +
      '<div class="stat"><div class="k">Pass threshold ' + Ref.help("summary.threshold", "Pass threshold") + '</div><div class="v">' + pct(r.threshold, 0) + "</div></div>" +
      '<div class="stat ' + (r.criticalNotMet ? "bad" : "") + '"><div class="k">Critical not met</div><div class="v">' + r.criticalNotMet + "</div></div>" +
      '<div class="stat ' + (r.notTested ? "warn" : "good") + '"><div class="k">Not yet tested</div><div class="v">' + r.notTested + " / " + r.total + "</div></div>" +
      '<div class="stat"><div class="k">Progress ' + Ref.help("summary.progress", "Progress") + '</div><div class="v">' + pct(r.progress, 0) + '</div><div class="bar"><span style="width:' + r.progress * 100 + '%"></span></div></div>' +
      '<div class="stat"><div class="k">Sheet status ' + Ref.help("status." + r.status, r.status) + '</div><div class="v">' + statusPill(r.status) + "</div></div></div>";
  }

  /** Sticky strip: where the sheet stands, and one square per criterion to jump to it. */
  function tracker(s) {
    var r = result.sheets[s.key], counts = { met: 0, fail: 0, partial: 0, na: 0, prog: 0, nt: 0 };
    var squares = s.criteria.map(function (c, i) {
      var st = cardState(c, r.rows[i]); counts[st]++;
      return '<a href="#" class="sq st-' + st + (c.critical !== "no" ? " crit-sq" : "") + '" data-jump="' + esc(c.id) + '" title="' + esc(c.id + " — " + c.title.slice(0, 90)) + '"><span class="sr">' + esc(c.id) + "</span></a>";
    }).join("");
    var NAMES = { met: "Met", fail: "Not met", partial: "For compliance", prog: "In progress", na: "N/A", nt: "Not tested" };
    var chip = function (k) { return counts[k] ? '<span class="tchip" title="' + NAMES[k] + '"><i class="sq st-' + k + '"></i>' + counts[k] + '<span class="tc-l"> ' + NAMES[k].toLowerCase() + "</span></span>" : ""; };
    return '<div class="tracker noprint" id="tracker"><div class="tr-row"><b class="tr-name">' + esc(tabParts(s.tab)[0]) + "</b>" + statusPill(r.status) +
      '<span class="tr-score">Score <b>' + pct(r.score, 0) + "</b> / " + pct(r.threshold, 0) + "</span>" +
      chip("fail") + chip("partial") + chip("prog") + chip("nt") + chip("na") + chip("met") +
      '<span class="tr-prog">' + (r.total - r.notTested) + " of " + r.total + " evaluated</span></div>" +
      '<div class="minimap" aria-label="Criteria in this sheet">' + squares + "</div></div>";
  }

  function sheetGuide(s) {
    var h = Ref.getHelp("sheet"), r = result.sheets[s.key];
    var crit = s.criteria.filter(function (c) { return c.critical !== "no"; }).length;
    return '<div class="xp-kind">Guide</div><div class="xp-title">' + esc(h && h.label || "How to evaluate this sheet") + "</div>" +
      (h ? "<p>" + esc(h.text) + "</p>" : "") + (s.note ? "<p>" + esc(s.note) + "</p>" : "") +
      '<dl class="xp-dl"><dt>Pass threshold</dt><dd>' + pct(r.threshold, 0) + ' (scoring.yaml)</dd><dt>Criteria</dt><dd>' + s.criteria.length + " · " + crit + " critical (★)</dd></dl>" +
      '<div class="legend"><span class="badge b-met">✓ Met</span><span class="badge b-partial">Met – for compliance</span><span class="badge b-fail">✗ Not met</span>' +
      '<span class="badge b-prog">In progress</span><span class="badge b-na">— N/A</span><span class="badge b-nt">Not tested</span></div>';
  }

  function pager(s) {
    var i = data.sheets.indexOf(s), prev = data.sheets[i - 1], next = data.sheets[i + 1];
    return '<nav class="pager noprint" aria-label="Sheets">' + (prev ? '<a href="#' + prev.key + '">‹ ' + esc(prev.tab) + "</a>" : '<a href="#profile">‹ System profile</a>') +
      (next ? '<a href="#' + next.key + '">' + esc(next.tab) + " ›</a>" : '<a href="#summary">Summary ›</a>') + "</nav>";
  }

  function visible(c, x) {
    var t = filter.text.toLowerCase();
    if (t && (c.id + " " + c.title + " " + c.section + " " + c.sub_items.map(function (s) { return s.text; }).join(" ")).toLowerCase().indexOf(t) < 0) return false;
    if (filter.show === "untested") return x.M === Scoring.NOT_TESTED;
    if (filter.show === "needs") return x.needs;
    if (filter.show === "critical") return c.critical !== "no";
    return true;
  }

  function viewSheet(s) {
    var r = result.sheets[s.key];
    var cards = s.criteria.map(function (c, i) { return visible(c, r.rows[i]) ? renderCard(c, r.rows[i]) : ""; }).join("");
    return '<section class="panel sheet-head"><h2>' + esc(s.title) + Ref.src(Ref.sheetSrc(s)) + '</h2><p class="intro">' + Ref.link(s.intro, new Set()) + " " +
      Ref.tip("sheet-" + s.key, sheetGuide(s), "How to evaluate this sheet") + "</p>" + sheetStats(s) + "</section>" + tracker(s) +
      '<div class="toolbar noprint"><input type="search" id="flt-text" placeholder="Search this sheet" value="' + esc(filter.text) + '">' +
      '<select id="flt-show"><option value="all">All criteria</option><option value="untested">Not yet tested</option>' +
      '<option value="needs">Needing compliance</option><option value="critical">Critical only</option></select>' +
      '<button type="button" data-bulk="' + s.key + '">Mark untested items in this sheet as…</button></div>' +
      (cards || '<p class="sub">No criteria match the filter.</p>') + pager(s);
  }

  function refreshSheet(s, changedId) {
    recompute();
    var r = result.sheets[s.key];
    var stats = $("#stats");
    if (stats) stats.outerHTML = sheetStats(s);
    var tr = $("#tracker");
    if (tr) tr.outerHTML = tracker(s);
    s.criteria.forEach(function (c, i) {
      var hit = c.id === changedId || c.sub_items.some(function (x) { return x.id === changedId; });
      if (!hit) return;
      var res = document.getElementById("res-" + c.id);
      if (res) res.innerHTML = resultLine(c, r.rows[i]);
      var card = document.getElementById("card-" + c.id);
      if (card) card.className = "crit " + cardClass(c, r.rows[i]) + (card.classList.contains("target") ? " target" : "") + (card.classList.contains("in-guide") ? " in-guide" : "");
      var bd = document.getElementById("bdg-" + c.id);
      if (bd) bd.innerHTML = badge(c, r.rows[i]);
    });
    renderTabs();
  }

  // ------------------------------------------------------------------ printed report
  var reportOpts = { guides: false, subs: true, attention: false };

  function rowClass(c, y) {
    if (c.weight === 0) return "st-info";
    if (y.M === Scoring.NOT_TESTED) return "st-nt";
    if (y.N === "") return "st-na";
    if (y.S === 1 || y.N === 0) return "st-fail";
    if (y.N >= 1) return "st-met";
    return "st-partial";
  }
  function resultText(c, y) {
    if (c.weight === 0) return "— Not scored";
    if (y.M === Scoring.NOT_TESTED) return "○ NOT TESTED";
    if (y.M === "N/A") return "— N/A";
    if (c.scoring === "tier") return (y.N >= 1 ? "✓ " : y.N > 0 ? "◐ " : "✗ ") + String(y.M).toUpperCase();
    if (c.sub_items.length) {
      var of = " (" + y.L + " of " + y.K + ")";
      return y.N >= 1 ? "✓ MET" + of : y.N === 0 ? "✗ NOT MET" + of : "◐ MET – FOR COMPLIANCE" + of;
    }
    return y.M === "Met" ? "✓ MET" : "✗ NOT MET";
  }
  function subMark(v) { return v === "Met" ? "✓" : v === "Not Met" ? "✗" : v === "N/A" ? "—" : "○"; }
  function subClass(v) { return v === "Met" ? "st-met" : v === "Not Met" ? "st-fail" : v === "N/A" ? "st-na" : "st-nt"; }
  function stClass(s) { return "st-" + String(s).toLowerCase().replace(/ /g, "-"); }
  function bar(x, cls, marker) {
    var w = Math.max(0, Math.min(1, x || 0)) * 100;
    return '<span class="rp-bar ' + (cls || "") + '"><span style="width:' + w.toFixed(1) + '%"></span>' +
      (marker != null ? '<i style="left:' + (marker * 100).toFixed(1) + '%"></i>' : "") + "</span>";
  }
  function kv(pairs) {
    var cells = pairs.map(function (p) { return "<th>" + esc(p[0]) + "</th><td>" + (p[2] ? p[1] : esc(p[1] || "—")) + "</td>"; });
    var rows = [];
    for (var i = 0; i < cells.length; i += 2) rows.push("<tr>" + cells[i] + (cells[i + 1] || "<th></th><td></td>") + "</tr>");
    return '<table class="rp-kv">' + rows.join("") + "</table>";
  }

  function viewReport() {
    var p = state.profile, r = result, m = data.meta, rt = data.report || {};
    var title = m.title || "Healthcare Interoperability Readiness Matrix for EMR Systems";
    var draft = m.is_release ? "" : '<span class="rp-draft">' + esc(m.kind === "candidate" ? "Release candidate" : "Draft") + " — not for official evaluation</span>";
    var conf = r.conformant ? '<span class="chip st-met">✓ CONFORMANT (Levels 0–3 passed)' + (data.scoring.policy.status !== "Approved" ? " — PROVISIONAL" : "") + "</span>"
      : '<span class="chip st-fail">NOT YET CONFORMANT</span>';

    // B. summary rows
    var sumRows = [];
    var totalItems = 0, totalTested = 0, totalCrit = 0;
    r.levels.forEach(function (l) {
      var parts = l.parts.map(function (k) { return r.sheets[k]; });
      var crit = 0, critTotal = 0, needs = 0, tested = 0, items = 0;
      parts.forEach(function (s) { needs += s.needs.length; tested += s.total - s.notTested; items += s.total; crit += s.criticalNotMet; });
      totalItems += items; totalTested += tested; totalCrit += crit;
      var code = l.key;
      sumRows.push('<tr class="rp-lvl"><td class="c">' + esc(code) + "</td><td><b>" + esc(l.name) + "</b>" + bar(l.progress, "thin") +
        '<span class="muted">' + pct(l.progress, 0) + " evaluated</span></td><td class=\"c\">" + (l.threshold == null ? "all parts" : pct(l.threshold, 0)) +
        '</td><td class="c"><span class="chip ' + stClass(l.gated) + '">' + esc(l.gated) + '</span></td><td class="c"><b>' + pct(l.score) + "</b>" +
        bar(l.score, "score", l.threshold) + "</td><td>" + tested + " of " + items + " tested · critical not met " + crit + (needs ? ' · <span class="t-fail">' + needs + " need compliance</span>" : "") + "</td></tr>");
      if (l.parts.length > 1) l.parts.forEach(function (k) {
        var s = r.sheets[k], sh = sheetByKey(k);
        sumRows.push('<tr class="rp-part"><td class="c">' + esc(k.replace("L2", "2")) + "</td><td>" + esc(sh.title.replace(/^Level 2[A-D] — /, "")) + bar(s.progress, "thin") +
          '<span class="muted">' + pct(s.progress, 0) + ' evaluated</span></td><td class="c">' + pct(s.threshold, 0) + '</td><td class="c"><span class="chip ' + stClass(s.status) + '">' + esc(s.status) +
          '</span></td><td class="c">' + pct(s.score) + bar(s.score, "score", s.threshold) + "</td><td>" + (s.total - s.notTested) + " of " + s.total + " tested · critical not met " + s.criticalNotMet +
          (s.needs.length ? ' · <span class="t-fail">' + s.needs.length + " need compliance</span>" : "") + "</td></tr>");
      });
    });

    // D. needs compliance
    var needRows = data.sheets.map(function (s) {
      var x = r.sheets[s.key];
      var chips = x.rows.filter(function (y) { return y.needs; }).map(function (y) {
        return '<span class="idchip ' + (y.S ? "st-fail" : "st-partial") + '">' + esc(y.id) + "</span>";
      }).join(" ");
      return '<tr><td>' + esc(s.title) + '</td><td class="c ' + (x.criticalNotMet ? "t-fail" : "") + '">' + x.criticalNotMet + "</td><td>" + (chips || "—") + "</td></tr>";
    }).join("");

    // G. breakdown
    var breakdown = data.sheets.map(function (s) {
      var x = r.sheets[s.key];
      var rows = s.criteria.map(function (c, i) {
        var y = x.rows[i], cls = rowClass(c, y);
        if (reportOpts.attention && (cls === "st-met" || cls === "st-na" || cls === "st-info")) return "";
        var badge = c.critical === "yes" ? '<span class="rp-critb">★ CRITICAL</span>' : c.critical === "subs" ? '<span class="rp-critb">★ critical sub-items</span>' : "";
        var subs = "";
        if (reportOpts.subs && c.sub_items.length) {
          subs = '<div class="rp-subs">' + c.sub_items.map(function (sb, k) {
            var v = state.answers[sb.id] || Scoring.NOT_TESTED;
            return '<span class="sub ' + subClass(v) + '" title="' + esc(sb.id + " — " + v) + '"><b>' + subMark(v) + " " + (k + 1) + "</b> " + (sb.critical ? "★ " : "") + esc(sb.text) + "</span>";
          }).join("") + "</div>";
        }
        var note = state.notes[c.id] ? '<div class="note">Notes: ' + esc(state.notes[c.id]) + "</div>" : "";
        var row = '<tr class="rp-crit ' + cls + '"><td class="ref">' + esc(c.id) + '</td><td><div class="ttl">' + esc(c.title) + '</div><div class="muted">' +
          esc(c.section) + " · " + esc(c.validation_role) + "</div>" + subs + '</td><td class="c">' + badge + '<div class="muted">' + esc(c.scoring) + " · W" + esc(c.weight) +
          '</div></td><td class="c"><span class="res">' + esc(resultText(c, y)) + '</span></td><td class="c">' + (y.N === "" ? "—" : pct(y.N, 0)) +
          (y.N === "" ? "" : bar(y.N, "thin")) + '</td><td class="out">' + esc(y.outstanding) + note + "</td></tr>";
        if (reportOpts.guides) {
          row += '<tr class="rp-guide"><td></td><td colspan="2"><b>Developer\'s guide:</b> ' + esc(c.developer_guide.split("\n\nPurpose:")[0]) +
            '</td><td colspan="3"><b>Validator\'s guide:</b> ' + esc(c.validator_guide) + "<br><b>Evidence:</b> " + esc(c.evidence) + "</td></tr>";
        }
        return row;
      }).join("");
      return '<tbody class="rp-sheet"><tr class="rp-band"><td colspan="6"><b>' + esc(s.title) + '</b><span class="band-stats">Score <b>' + pct(x.score) + "</b> · Threshold " + pct(x.threshold, 0) +
        " · Critical not met " + x.criticalNotMet + " · Not tested " + x.notTested + " of " + x.total + ' <span class="chip ' + stClass(x.status) + '">' + esc(x.status) + "</span></span></td></tr>" +
        (rows || '<tr><td colspan="6" class="muted">No items to show with the current filter.</td></tr>') + "</tbody>";
    }).join("");

    var legend = '<div class="rp-legend"><span class="chip st-met">✓ Met / passed</span><span class="chip st-partial">◐ Met – for compliance</span><span class="chip st-incomplete">INCOMPLETE</span><span class="chip st-fail">✗ Not met / critical</span>' +
      '<span class="chip st-nt">○ Not tested</span><span class="chip st-na">— N/A</span><span class="chip st-locked">LOCKED</span><span class="rp-critb">★ Critical</span></div>';
    // Letterhead in the layout of the DOH-HIRMES forms (Application Form L0): seal | agency and title | document
    // control, with the kind of document under the title. The conducting office is not printed here (section A
    // and the certificate carry it).
    var seal = (data.certificate || {}).seal_url;
    var head = '<table class="rp-head"><colgroup><col class="w-logo"><col><col class="w-side"></colgroup><tbody><tr>' +
      '<td class="rp-logo" rowspan="2">' + (seal ? '<img src="' + esc(seal) + '" alt="Seal of the Department of Health">' : "") + "</td>" +
      '<td class="rp-agency">Department of Health<b>' + esc(title).replace(/\s+(for EMR Systems)$/i, "<br>$1") + "</b></td>" +
      '<td class="rp-doc" rowspan="2"><span>Criteria version: <b>' + esc(m.label) + "</b></span><span>Built: " + esc(when(m.built_iso, m.built)) +
      "</span><span>Printed: " + esc(when(new Date().toISOString())) + "</span>" + draft + "</td></tr>" +
      '<tr><td class="rp-kind">Evaluation Report</td></tr>' +
      // identification row: ties every printed page to the one evaluation, so a loose page can be matched to the signed report
      '<tr class="rp-id"><td colspan="3">' + [["Application no.", p.application_no], ["System · version", [p.system_name, p.version].filter(Boolean).join(" · ")],
        ["Vendor / developer", p.vendor], ["Certificate no.", p.certificate_no]].map(function (x) {
          return "<span><i>" + esc(x[0]) + ":</i> <b>" + esc(x[1] || "—") + "</b></span>";
        }).join("") + "</td></tr></tbody></table>";

    var controls = '<div class="rp-controls noprint"><label><input type="checkbox" data-ropt="guides"' + (reportOpts.guides ? " checked" : "") + "> Developer's and validator's guides</label>" +
      '<label><input type="checkbox" data-ropt="subs"' + (reportOpts.subs ? " checked" : "") + "> Sub-item results</label>" +
      '<label><input type="checkbox" data-ropt="attention"' + (reportOpts.attention ? " checked" : "") + "> Only items not met, partial or not tested</label>" +
      '<button type="button" id="btn-print-report">Print / save as PDF</button></div>';

    // The letterhead sits in the <thead> of a frame table so that the browser repeats it at the top of every printed page.
    return controls + '<article id="report" class="paper"><table class="rp-frame"><thead><tr><td>' +
      '<header class="rp-letter">' + head + "</header></td></tr></thead><tbody><tr><td>" +
      (rt.background ? '<section class="rp-text"><h3>Background</h3><p>' + esc(rt.background).replace(/\n\n/g, "</p><p>") + "</p>" +
        (rt.scope ? "<h3>Scope and coverage</h3><p>" + esc(rt.scope).replace(/\n\n/g, "</p><p>") + "</p>" : "") + "</section>" : "") +
      '<h2 class="rp-h">A. System profile</h2>' + kv([["System name", p.system_name], ["Version / build", p.version], ["Vendor / developer", p.vendor], ["Applicant category", p.category],
        ["Deployment model", p.deployment], ["Evaluation type", p.evaluation_type], ["Application no.", p.application_no], ["Date application received", p.date_received],
        ["Technical Lead", p.technical_lead], ["Administrator", p.administrator], ["Validators", namesOf("validator_").join("; ")], ["Observers", namesOf("observer_").join("; ")],
        ["Versions tested", "FHIR " + (p.fhir_release || "—") + " · PH Core IG " + (p.ph_core || "—") + " · PHeReF IG " + (p.pheref || "—")], ["Conducting office", p.office]]) +
      '<h2 class="rp-h">B. Summary scorecard</h2>' + legend +
      '<table class="rp-table rp-sum"><thead><tr><th>Level</th><th>Level name · evaluation progress</th><th>Threshold</th><th>Status</th><th>Score</th><th>Items &amp; findings</th></tr></thead><tbody>' +
      sumRows.join("") + '<tr class="rp-total"><td colspan="2"><b>Highest level achieved:</b> ' + esc(r.highest) + '</td><td colspan="4"><b>HIE use:</b> ' + conf + "</td></tr>" +
      '<tr><td colspan="2"><b>Overall progress (all levels):</b>' + bar(totalItems ? totalTested / totalItems : 0, "thin") + '</td><td colspan="4">' + totalTested + " of " + totalItems +
      " criteria evaluated · critical not met " + totalCrit + "</td></tr></tbody></table>" +
      '<h2 class="rp-h">C. Level 3 reconciliation</h2><p class="muted rp-note">The Level 3 reconciliation (Test Data sections B and C) is recorded in the scorecard workbook; it is not captured in the web scorecard.</p>' +
      '<h2 class="rp-h">D. Items needing compliance</h2><table class="rp-table"><thead><tr><th>Level / part</th><th>Critical not met</th><th>Criteria needing compliance (red = critical failure)</th></tr></thead><tbody>' +
      needRows + '<tr class="rp-total"><td><b>Certificate condition: no critical item Not Met</b></td><td class="c">' + r.criticalOpen + "</td><td>" +
      (r.criticalOpen === 0 ? '<span class="chip st-met">✓ MET — no critical item open</span>' : '<span class="chip st-fail">✗ NOT MET — certificate cannot be issued</span>') + "</td></tr></tbody></table>" +
      '<h2 class="rp-h">E. Certificate details</h2>' + kv([["Certificate no.", p.certificate_no], ["Certificate date", p.certificate_date], ["Product · version", (p.system_name || "—") + " · " + (p.version || "—")],
        ["Versions tested", "FHIR " + (p.fhir_release || "—") + " · PH Core IG " + (p.ph_core || "—") + " · PHeReF IG " + (p.pheref || "—")], ["Terminology release", p.terminology], ["Level achieved", r.highest + (data.scoring.policy.status !== "Approved" ? " (thresholds PROPOSED — provisional)" : "")],
        ["Date(s) of testing", p.test_dates], ["Valid until", p.valid_until || (validDefault() ? validDefault() + " — 2 years from approval or until a major change / IG major version (PROPOSED)" : "2 years from approval or until a major change / IG major version (PROPOSED)")], ["Scope", "Electronic referral — sender (TS1) and receiver (TS2); deployment: " + (p.deployment || "—")], ["Conditions", p.conditions || "None recorded"],
        ["Signatory", [p.signatory_name, p.signatory].filter(Boolean).join(" — ")], ["Certificate fingerprint", certFingerprint() || "— (details incomplete; see Output › Certificate)"]]) +
      '<h2 class="rp-h">F. Sign-off</h2>' + signOff(p) +
      '<h2 class="rp-h rp-break">G. Testing criteria breakdown</h2>' + legend +
      '<table class="rp-table rp-crits"><colgroup><col class="w-ref"><col><col class="w-type"><col class="w-res"><col class="w-score"><col class="w-out"></colgroup>' +
      "<thead><tr><th>Ref</th><th>Criterion</th><th>Type · W</th><th>Result</th><th>Score</th><th>Outstanding / notes</th></tr></thead>" + breakdown + "</table>" +
      (m.show_license ? '<p class="rp-credit">' + esc(m.credit || "") + "</p>" : "") + "</td></tr></tbody></table></article>";
  }

  /** F. Sign-off, as in the workbook: one row per person in the sign_off order of profile.yaml, the name
   *  over "designation · agency"; a required role without a name asks for it, an optional one is "not assigned". */
  function signOff(p) {
    var g = teamSection(), sec = data.profile.sections.indexOf(g) + 1, byKey = {};
    g.team.roles.forEach(function (r) { byKey[r.key] = r; });
    var rows = g.team.sign_off.map(function (k) {
      var r = byKey[k], x = person(k), detail = [x.designation, x.agency].filter(Boolean).join(" · "), who;
      if (x.name) who = "<b>" + esc(x.name) + "</b>" + (detail ? '<br><span class="rp-desig">' + esc(detail) + "</span>" : "");
      else who = '<span class="rp-unset">' + (r.required ? "(name to be entered in System Profile " + sec + ")" : "— not assigned —") + "</span>";
      var off = !x.name && !r.required;
      return '<tr' + (off ? ' class="rp-off"' : "") + "><td>" + esc(r.sign_as) + "<br>" + esc(r.label) + "</td><td>" + who + "</td><td></td><td>" + (off ? "—" : "") + "</td></tr>";
    });
    rows.push("<tr><td>Conforme<br>Vendor / Developer</td><td>Authorized signatory" + (p.vendor ? " of " + esc(p.vendor) : "") +
      ':<br><span class="rp-desig">Name · Designation</span></td><td></td><td></td></tr>');
    return '<p class="muted rp-note">Names, agencies and designations are taken from System Profile section ' + sec + '. Optional roles that are not assigned are marked "— not assigned —".</p>' +
      '<table class="rp-table rp-sign"><colgroup><col class="w-role"><col><col class="w-sig"><col class="w-date"></colgroup>' +
      "<thead><tr><th>Role</th><th>Name · Designation · Agency</th><th>Signature</th><th>Date</th></tr></thead><tbody>" + rows.join("") + "</tbody></table>";
  }

  // ------------------------------------------------------------------ certificate
  /** What the certificate is printed from: the profile, the result and the default expiry. */
  function certCtx() {
    var sec = data.profile.sections.filter(function (g) { return g.fields.some(function (f) { return f.key === "certificate_no"; }); })[0];
    return { profile: state.profile, result: result, validUntil: state.profile.valid_until || validDefault(), certSection: data.profile.sections.indexOf(sec) + 1 };
  }
  function certFingerprint() { var fp = Cert.fingerprint(Cert.record(certCtx())); return fp ? fp.match(/.{4}/g).join(" ") : ""; }
  /** Montserrat and Lora, the DOH Brand Book typefaces, loaded only for the certificate pages; Arial and Georgia stand in offline. */
  function loadCertFonts() {
    if (document.getElementById("cert-fonts")) return;
    var l = document.createElement("link");
    l.id = "cert-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Montserrat:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
  }
  function printCert() {
    pageStyle("certificate");
    var go = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { Cert.fit(); window.print(); }); };
    if (location.hash !== "#certificate") { location.hash = "#certificate"; setTimeout(go, 400); } else go();
  }
  function copyText(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = t; }, 1500); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* the text stays selectable on the page */ }
    ta.remove();
  }

  /** @page for the output being printed: the report on A4 portrait with footers, the certificate edge to edge in its own orientation. */
  function pageStyle(kind, orient) {
    var m = data.meta, el = document.getElementById("page-style");
    if (!el) { el = document.createElement("style"); el.id = "page-style"; document.head.appendChild(el); }
    document.body.classList.toggle("print-cert", kind === "certificate");
    if (kind === "certificate") { el.textContent = "@page { size: A4 " + (orient || Cert.orientation(state.profile)) + "; margin: 0; }"; return; }
    var q = function (s) { return '"' + String(s).replace(/["\\]/g, "") + '"'; };
    el.textContent = "@page { size: A4; margin: 11mm 9mm 13mm; " +
      "@bottom-left { content: " + q((m.title || "") + " — Evaluation Report · " + m.label) + "; font: 7pt Arial, sans-serif; color: #555; } " +
      "@bottom-right { content: \"Page \" counter(page) \" of \" counter(pages); font: 7pt Arial, sans-serif; color: #555; } }";
  }

  // ------------------------------------------------------------------ events
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.dataset.answer) {
      var id = t.dataset.answer;
      if (t.value === Scoring.NOT_TESTED) delete state.answers[id]; else state.answers[id] = t.value;
      save();
      t.className = valClass(t.value);
      followFrom(t);
      var li = t.closest("li"); if (li) li.className = valClass(t.value);
      var s = sheetByKey(current.split("/")[0]);
      if (s) refreshSheet(s, id); else { recompute(); route(); }
    } else if (t.hasAttribute && t.hasAttribute("data-copy-orient")) {
      Cert.setCopyOrientation(t.value); route();
    } else if (t.dataset.ropt) {
      reportOpts[t.dataset.ropt] = t.checked; route();
    } else if (t.id === "flt-show") {
      filter.show = t.value; route(); $("#flt-show").value = filter.show;
    } else if (t.id === "file-load" && t.files && t.files[0]) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var loaded = JSON.parse(reader.result);
          if (loaded.criteria_version && loaded.criteria_version !== data.meta.version &&
              !confirm("This evaluation was made with criteria version " + loaded.criteria_version + "; this page shows " + data.meta.version + ". Load anyway?")) return;
          state = { answers: loaded.answers || {}, notes: loaded.notes || {}, profile: migrateProfile(loaded.profile || {}) };
          save(); recompute(); route();
        } catch (err) { alert("This file is not a saved evaluation."); }
      };
      reader.readAsText(t.files[0]);
      t.value = "";
    }
  });

  // The guide panel follows the criterion being worked on: any click, tap or keyboard focus inside a
  // card (text, sub-items, answers, notes, buttons) switches it to that criterion.
  function followFrom(el) {
    var cardEl = el && el.closest && el.closest(".crit");
    if (cardEl && cardEl.id) Ref.guideFollow(cardEl.id.slice(5));
  }
  document.addEventListener("pointerdown", function (e) { if (!e.target.closest(".gbtn")) followFrom(e.target); }, true);
  document.addEventListener("focusin", function (e) { followFrom(e.target); });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.dataset.note) { if (t.value) state.notes[t.dataset.note] = t.value; else delete state.notes[t.dataset.note]; save(); }
    else if (t.dataset.profile) {
      if (t.value) state.profile[t.dataset.profile] = t.value; else delete state.profile[t.dataset.profile];
      save(); refreshProfile();
      if (t.dataset.profile === "certificate_orientation" && current.split("/")[0] === "certificate") route();
    }
    else if (t.id === "flt-text") {
      filter.text = t.value;
      var pos = t.selectionStart; route();
      var box = $("#flt-text"); if (box) { box.focus(); box.setSelectionRange(pos, pos); }
      if ($("#flt-show")) $("#flt-show").value = filter.show;
    }
  });

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? (e.target.closest("button, a, label") || e.target) : e.target;
    if (t.getAttribute && t.getAttribute("aria-disabled") === "true") { e.preventDefault(); return; }
    if (t.id === "menu-btn") { setMenu($("#menu-list").hidden); return; }
    if (!t.closest || !t.closest(".menu")) setMenu(false); else if (t.getAttribute("role") === "menuitem") setMenu(false);
    if (t.id === "nav-toggle") { setNav(!document.body.classList.contains("nav-open")); return; }
    if (e.target.id === "scrim") { setNav(false); return; }
    if (t.dataset && t.dataset.jump) {
      e.preventDefault();
      var card = document.getElementById("card-" + t.dataset.jump);
      if (!card) { filter.text = ""; filter.show = "all"; route(); card = document.getElementById("card-" + t.dataset.jump); }
      if (card) {
        document.querySelectorAll(".crit.target").forEach(function (x) { x.classList.remove("target"); });
        card.classList.add("target"); scrollToCard(card);
        history.replaceState(null, "", "#" + current.split("/")[0] + "/" + t.dataset.jump);
        current = lastHash = current.split("/")[0] + "/" + t.dataset.jump;
      }
      return;
    }
    if (t.id === "btn-save") {
      var blob = new Blob([JSON.stringify({ criteria_version: data.meta.version, commit: data.meta.commit, saved: new Date().toISOString(),
        answers: state.answers, notes: state.notes, profile: state.profile }, null, 1)], { type: "application/json" });
      var a = document.createElement("a");
      var name = (state.profile.system_name || "evaluation").replace(/[^A-Za-z0-9_-]+/g, "-");
      a.href = URL.createObjectURL(blob); a.download = name + "-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a); a.click(); a.remove();
    } else if (t.id === "btn-print-cert" || t.id === "btn-print-cert-menu") {
      printCert();
    } else if (t.id === "btn-print-copy") {
      printingCopy = true;
      pageStyle("certificate", Cert.copyOrientation());
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { Cert.fit(); window.print(); });
    } else if (t.dataset && t.dataset.copy) {
      var src = document.getElementById(t.dataset.copy); if (src) copyText(src.textContent, t);
    } else if (t.dataset && t.dataset.copyText) {
      copyText(t.dataset.copyText, t);
    } else if (t.id === "btn-print" || t.id === "btn-print-report") {
      pageStyle("report");
      if (location.hash !== "#report") { location.hash = "#report"; setTimeout(function () { window.print(); }, 400); }
      else window.print();
    } else if (t.id === "btn-reset") {
      if (confirm("Clear all answers, notes and the system profile in this browser?")) { state = { answers: {}, notes: {}, profile: {} }; save(); recompute(); route(); }
    } else if (t.dataset.bulk) {
      var choice = prompt("Set every NOT TESTED item in this sheet to (Met, Not Met or N/A):", "Met");
      if (!choice || ["Met", "Not Met", "N/A"].indexOf(choice) < 0) return;
      sheetByKey(t.dataset.bulk).criteria.forEach(function (c) {
        var ids = c.sub_items.length ? c.sub_items.map(function (s) { return s.id; }) : (c.scoring === "tier" ? [] : [c.id]);
        ids.forEach(function (id) { if (!state.answers[id]) state.answers[id] = choice; });
      });
      save(); recompute(); route();
    }
  });

  document.addEventListener("submit", function (e) {
    if (e.target.id !== "verify-form") return;
    e.preventDefault();
    var no = $("#v-no").value.trim(), fp = $("#v-fp").value.replace(/[\s-]/g, "").toUpperCase();
    if (no) location.hash = "#verify/" + encodeURIComponent(no) + "/" + fp;
  });
  // Ctrl+P on the certificate page prints the certificate layout, elsewhere the report layout;
  // the Verify page's print button prints its register copy.
  var printingCopy = false;
  window.addEventListener("beforeprint", function () {
    if (printingCopy) return;
    pageStyle(current.split("/")[0] === "certificate" ? "certificate" : "report");
  });
  window.addEventListener("afterprint", function () { printingCopy = false; });

  window.addEventListener("hashchange", route);
  window.addEventListener("resize", function () { measureHeader(); Cert.fit(); if (window.innerWidth > PHONE) setNav(false); });
  // phones: tuck the search row and banner away while scrolling down; bring them back on the way up
  var lastY = 0, quietUntil = 0;
  function setMin(on) {
    document.body.classList.toggle("hdr-min", on); measureHeader();
    // the header changes height, which shifts the page; ignore the scroll events that shift causes
    quietUntil = Date.now() + 350;
    requestAnimationFrame(function () { lastY = window.scrollY; });
  }
  window.addEventListener("scroll", function () {
    var y = window.scrollY, min = document.body.classList.contains("hdr-min");
    if (window.innerWidth > PHONE) { if (min) setMin(false); lastY = y; return; }
    if (Date.now() < quietUntil) { lastY = y; return; }
    if (y < 60) { if (min) setMin(false); }
    else if (y > lastY + 24 && y > 140 && !min && !(document.activeElement && document.activeElement.id === "q")) setMin(true);
    else if (y < lastY - 24 && min) setMin(false);
    else if (Math.abs(y - lastY) < 24) return;
    lastY = y;
  }, { passive: true });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMenu(false); setNav(false); } });

  // ------------------------------------------------------------------ start
  var BUILD = (document.querySelector('meta[name="build"]') || {}).content || "";
  var getJSON = function (u) {
    return fetch(u + (BUILD ? "?v=" + BUILD : ""), { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(u + " " + r.status); return r.json(); });
  };

  // ------------------------------------------------------------------ workbook download
  // The publishing workflow puts this version's workbook next to the scorecard (data.meta.workbook).
  // A local build has none, so the link is checked first and explained when the file is missing.
  function setupWorkbookLink() {
    var a = $("#dl-blank"), note = $("#dl-blank-note"), name = data.meta.workbook;
    var off = function (why) { a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); a.classList.add("soon"); note.textContent = why; };
    if (!name) { off("Not available for this build."); return; }
    a.href = name + (BUILD ? "?v=" + BUILD : "");
    a.setAttribute("download", name);
    fetch(a.href, { method: "HEAD", cache: "no-store" }).then(function (r) {
      if (!r.ok) off("Not in this build — the workbook is added when the version is published (or download it from the release).");
    }).catch(function () { /* offline: leave the link as is */ });
  }

  // ------------------------------------------------------------------ newer build published?
  // The page may come from the browser cache (GitHub Pages allows 10 minutes). version.json is
  // always fetched fresh: on opening, a stale page reloads itself once; a page left open shows a
  // bar instead, so nobody loses their place. Answers are kept in this browser either way.
  function checkVersion(onOpen) {
    if (!BUILD) return;
    fetch("version.json?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (v) {
      if (!v || !v.build || v.build === BUILD) return;
      var key = "reloaded-for-" + v.build, already = false;
      try { already = sessionStorage.getItem(key); sessionStorage.setItem(key, "1"); } catch (e) { already = true; }
      if (onOpen && !already) { location.reload(); return; }
      if ($("#update-bar")) return;
      var bar = document.createElement("div");
      bar.id = "update-bar"; bar.className = "update-bar noprint"; bar.setAttribute("role", "status");
      bar.innerHTML = "A newer version of this scorecard was published" + (v.commit ? " (commit " + esc(v.commit) + ")" : "") +
        '. <button type="button" id="btn-update">Reload now</button> <span class="muted">Your answers are kept.</span>' +
        '<button type="button" class="ub-close" aria-label="Dismiss">×</button>';
      document.body.appendChild(bar);
    }).catch(function () { /* offline: keep working */ });
  }
  document.addEventListener("click", function (e) {
    if (e.target.id === "btn-update") location.reload();
    else if (e.target.classList && e.target.classList.contains("ub-close")) e.target.parentNode.remove();
  });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") checkVersion(false); });
  setInterval(function () { checkVersion(false); }, 10 * 60 * 1000);
  checkVersion(true);

  Promise.all([getJSON("data.json"), getJSON("reference.json").catch(function () { return null; })]).then(function (res) {
    data = res[0];
    Ref.base(data);
    Cert.init(data);
    if (res[1]) Ref.init(data, res[1]);
    restore();
    recompute();
    renderBanner();
    setupWorkbookLink();
    if (Ref.ready()) Ref.initSearch($("#q"), $("#q-list")); else $(".search").hidden = true;
    route();
  }).catch(function (err) {
    $("#main").innerHTML = '<p class="out-bad">Could not load the criteria (data.json). Open this page through a web server. ' + esc(err) + "</p>";
  });
})();
