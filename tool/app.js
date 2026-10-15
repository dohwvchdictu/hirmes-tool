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

  var PROFILE_FIELDS = [
    ["application_no", "Application no."], ["vendor", "Service provider / vendor"], ["system_name", "System name"],
    ["version", "Version / build under test"], ["category", "Applicant category"], ["deployment", "Deployment model"],
    ["test_dates", "Date(s) of testing"], ["technical_lead", "Technical Lead"], ["validators", "Validators"],
    ["observers", "Observers"], ["administrator", "Administrator"], ["office", "Conducting office"],
    ["ph_core", "PH Core IG version"], ["pheref", "PHeReF IG version"], ["terminology", "Terminology release"],
    ["evaluation_type", "Evaluation type"], ["date_received", "Date application received"],
    ["certificate_no", "Certificate no. (assigned on approval)"], ["certificate_date", "Certificate date"],
    ["valid_until", "Valid until"], ["conditions", "Conditions"]
  ];

  // ------------------------------------------------------------------ utilities
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
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
        state.answers = s.answers || {}; state.notes = s.notes || {}; state.profile = s.profile || {};
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
      b.innerHTML = "Released version " + esc(m.version) + " · commit " + esc(m.commit) + " · built " + esc(m.built) + home;
    } else {
      b.className = "banner draft";
      var what = m.kind === "candidate" ? "RELEASE CANDIDATE" : m.kind === "branch" ? "BRANCH PREVIEW" : "DRAFT";
      b.innerHTML = what + " — " + esc(m.label) + " · built " + esc(m.built) + " — for review only, not for official evaluation." + home;
    }
    $("#foot").innerHTML = "Criteria version " + esc(m.label) +
      (m.repository ? ' · <a href="' + esc(m.repository) + '">source repository</a>' : "") +
      " · Scores follow the same rules as the scorecard workbook.<br>Content © " + esc(m.owner || "") +
      ' · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · Web scorecard code ' +
      '<a href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0-or-later</a>';
  }

  function renderTabs() {
    var items = [["summary", "Summary"], ["profile", "System Profile"]];
    data.sheets.forEach(function (s) { items.push([s.key, s.tab]); });
    items.push(["report", "Printed Report"]);
    if (Ref.ready()) items.push(["ref", "Reference"]);
    $("#tabs").innerHTML = items.map(function (it) {
      var dot = "";
      if (result.sheets[it[0]]) {
        var st = result.sheets[it[0]].status;
        var col = st === "PASSED" ? "var(--good)" : st === "NOT PASSED" ? "var(--bad)" : "var(--warn)";
        dot = '<span class="dot" style="background:' + col + '" title="' + st + '"></span>';
      }
      return '<a href="#' + it[0] + '"' + (current.split("/")[0] === it[0] ? ' aria-current="page"' : "") + ">" + esc(it[1]) + dot + "</a>";
    }).join("");
  }

  function route() {
    var h = decodeURIComponent((location.hash || "#summary").slice(1));
    var head = h.split("/")[0], rest = h.slice(head.length + 1);
    current = h;
    renderTabs();
    var main = $("#main"), focus = null;
    if (head === "summary") main.innerHTML = viewSummary();
    else if (head === "profile") main.innerHTML = viewProfile();
    else if (head === "report") main.innerHTML = viewReport();
    else if (head === "ref" && Ref.ready()) { main.innerHTML = Ref.viewReference(rest); Ref.afterReference(); return; }
    else if (sheetByKey(head)) {
      if (rest) { filter.text = ""; filter.show = "all"; focus = rest; }
      main.innerHTML = viewSheet(sheetByKey(head));
    }
    else { location.hash = "#summary"; return; }
    var card = focus && document.getElementById("card-" + focus);
    if (card) { card.classList.add("target"); card.scrollIntoView({ block: "start" }); window.scrollBy(0, -150); }
    else window.scrollTo(0, 0);
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
  function viewProfile() {
    return '<section class="panel"><h2>System Profile</h2><p class="intro">These details appear on the Summary and the Printed Report.</p><div class="profile">' +
      PROFILE_FIELDS.map(function (f) {
        return '<div><label for="pf-' + f[0] + '">' + esc(f[1]) + "</label> " + Ref.help("profile." + f[0], f[1]) + '<input id="pf-' + f[0] + '" data-profile="' + f[0] + '" value="' + esc(state.profile[f[0]] || "") + '"></div>';
      }).join("") + "</div></section>";
  }

  // ------------------------------------------------------------------ criteria sheet
  function cardClass(x) {
    if (x.M === Scoring.NOT_TESTED) return "";
    if (x.S === 1 || x.N === 0) return "st-fail";
    if (x.N === "" || x.N >= 1) return "st-met";
    return "st-partial";
  }

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
    } else {
      answer = '<ul class="subs">' + c.sub_items.map(function (s) {
        return '<li><span class="sid">' + esc(s.id) + "</span><span>" + (s.critical ? '<span class="tag critical">★</span> ' : "") + Ref.link(s.text, seen) +
          '</span><select aria-label="Result for ' + esc(s.id) + '" data-answer="' + esc(s.id) + '">' + options(std, state.answers[s.id] || Scoring.NOT_TESTED) + "</select></li>";
      }).join("") + "</ul>";
    }
    var n = Ref.ready() ? Ref.counts(c) : { trc: 0, trm: 0 };
    var g = function (tab, label, cnt) {
      return '<button type="button" class="gbtn" data-guide="' + esc(c.id) + '" data-tab="' + tab + '">' + label + (cnt != null ? ' <span class="cnt">' + cnt + "</span>" : "") + "</button>";
    };
    return '<article class="crit ' + cardClass(x) + '" id="card-' + esc(c.id) + '">' +
      '<div class="crit-head"><a class="cid" href="#' + esc(current.split("/")[0]) + "/" + esc(c.id) + '" title="Link to this criterion">' + esc(c.id) + '</a><span class="section">' + esc(c.section) + "</span>" + crit +
      '<span class="tag">' + esc(c.scoring) + " " + Ref.help("scoring." + c.scoring, c.scoring) + " · weight " + esc(c.weight) + (c.weight === 0 ? " (info only)" : "") + " " + Ref.help("weight", "Weight") +
      '</span><span class="tag">' + esc(c.validation_role) + " " + Ref.help("validation_role", "Validation role") + "</span>" + Ref.src(Ref.critSrc(c), "card") + "</div>" +
      '<p class="title">' + Ref.link(c.title, seen) + "</p>" + answer +
      '<div class="result" id="res-' + esc(c.id) + '">' + resultLine(c, x) + "</div>" +
      '<textarea class="notes" placeholder="Evidence reference / notes" data-note="' + esc(c.id) + '" aria-label="Notes for ' + esc(c.id) + '">' + esc(state.notes[c.id] || "") + "</textarea>" +
      '<div class="gbar" aria-label="Guides and references">' + g("dev", "Developer's guide") + g("val", "Validator's guide") + g("evd", "Evidence required") +
      g("trc", "Traces", n.trc) + g("trm", "Terms", n.trm) + "</div></article>";
  }

  function sheetStats(s) {
    var r = result.sheets[s.key];
    return '<div class="stats" id="stats">' +
      '<div class="stat"><div class="k">Score</div><div class="v">' + pct(r.score) + '</div><div class="bar"><span style="width:' + Math.min(r.score, 1) * 100 + '%"></span></div></div>' +
      '<div class="stat"><div class="k">Pass threshold</div><div class="v">' + pct(r.threshold, 0) + "</div></div>" +
      '<div class="stat"><div class="k">Critical not met</div><div class="v">' + r.criticalNotMet + "</div></div>" +
      '<div class="stat"><div class="k">Not yet tested</div><div class="v">' + r.notTested + " / " + r.total + "</div></div>" +
      '<div class="stat"><div class="k">Progress</div><div class="v">' + pct(r.progress, 0) + '</div><div class="bar"><span style="width:' + r.progress * 100 + '%"></span></div></div>' +
      '<div class="stat"><div class="k">Sheet status</div><div class="v">' + statusPill(r.status) + "</div></div></div>";
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
    return '<section class="panel"><h2>' + esc(s.title) + Ref.src(Ref.sheetSrc(s)) + '</h2><p class="intro">' + esc(s.intro) + "</p>" + sheetStats(s) + "</section>" +
      '<div class="toolbar noprint"><input type="search" id="flt-text" placeholder="Search this sheet" value="' + esc(filter.text) + '">' +
      '<select id="flt-show"><option value="all">All criteria</option><option value="untested">Not yet tested</option>' +
      '<option value="needs">Needing compliance</option><option value="critical">Critical only</option></select>' +
      '<button type="button" data-bulk="' + s.key + '">Mark untested items in this sheet as…</button></div>' +
      (cards || '<p class="sub">No criteria match the filter.</p>');
  }

  function refreshSheet(s, changedId) {
    recompute();
    var r = result.sheets[s.key];
    var stats = $("#stats");
    if (stats) stats.outerHTML = sheetStats(s);
    s.criteria.forEach(function (c, i) {
      var hit = c.id === changedId || c.sub_items.some(function (x) { return x.id === changedId; });
      if (!hit) return;
      var res = document.getElementById("res-" + c.id);
      if (res) res.innerHTML = resultLine(c, r.rows[i]);
      var card = document.getElementById("card-" + c.id);
      if (card) card.className = "crit " + cardClass(r.rows[i]);
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
      return y.N >= 1 ? "✓ MET" + of : y.N === 0 ? "✗ NOT MET" + of : "◐ PARTIAL" + of;
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

    var legend = '<div class="rp-legend"><span class="chip st-met">✓ Met / passed</span><span class="chip st-partial">◐ Partial / in progress</span><span class="chip st-fail">✗ Not met / critical</span>' +
      '<span class="chip st-nt">○ Not tested</span><span class="chip st-na">— N/A</span><span class="chip st-locked">LOCKED</span><span class="rp-critb">★ Critical</span></div>';
    var office = p.office ? "<br><b>" + esc(p.office.toUpperCase()) + "</b>" : "";

    var controls = '<div class="rp-controls noprint"><label><input type="checkbox" data-ropt="guides"' + (reportOpts.guides ? " checked" : "") + "> Developer's and validator's guides</label>" +
      '<label><input type="checkbox" data-ropt="subs"' + (reportOpts.subs ? " checked" : "") + "> Sub-item results</label>" +
      '<label><input type="checkbox" data-ropt="attention"' + (reportOpts.attention ? " checked" : "") + "> Only items not met, partial or not tested</label>" +
      '<button type="button" id="btn-print-report">Print / save as PDF</button></div>';

    return controls + '<article id="report" class="paper">' +
      '<header class="rp-letter">Republic of the Philippines<br>Department of Health' + office + "</header>" +
      '<h1 class="rp-title">' + esc(title) + "<small>Evaluation Report</small></h1>" +
      '<p class="rp-ver">Criteria version ' + esc(m.label) + " · built " + esc(m.built) + " " + draft + "</p>" +
      (rt.background ? '<section class="rp-text"><h3>Background</h3><p>' + esc(rt.background).replace(/\n\n/g, "</p><p>") + "</p>" +
        (rt.scope ? "<h3>Scope and coverage</h3><p>" + esc(rt.scope).replace(/\n\n/g, "</p><p>") + "</p>" : "") + "</section>" : "") +
      '<h2 class="rp-h">A. System profile</h2>' + kv([["System name", p.system_name], ["Version / build", p.version], ["Vendor / developer", p.vendor], ["Applicant category", p.category],
        ["Deployment model", p.deployment], ["Evaluation type", p.evaluation_type], ["Application no.", p.application_no], ["Date application received", p.date_received],
        ["Technical Lead", p.technical_lead], ["Administrator", p.administrator], ["Validators", p.validators], ["Observers", p.observers],
        ["IG versions", "PH Core " + (p.ph_core || "—") + " · PHeReF " + (p.pheref || "—")], ["Conducting office", p.office]]) +
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
        ["IG versions", "PH Core " + (p.ph_core || "—") + " · PHeReF " + (p.pheref || "—")], ["Terminology release", p.terminology], ["Level achieved", r.highest + (data.scoring.policy.status !== "Approved" ? " (thresholds PROPOSED — provisional)" : "")],
        ["Date(s) of testing", p.test_dates], ["Valid until", p.valid_until || "2 years from approval or until a major change / IG major version (PROPOSED)"], ["Scope", "Electronic referral — sender (TS1) and receiver (TS2); deployment: " + (p.deployment || "—")], ["Conditions", p.conditions || "None recorded"]]) +
      '<h2 class="rp-h">F. Sign-off</h2><table class="rp-table rp-sign"><thead><tr><th>Role</th><th>Name · Designation · Agency</th><th>Signature</th><th>Date</th></tr></thead><tbody>' +
      [["Validated by", p.validators], ["Witnessed by", p.observers], ["Processed by — Administrator", p.administrator], ["Approved by — Technical Lead", p.technical_lead], ["Conforme — Vendor / Developer", p.vendor ? "Authorized signatory of " + p.vendor : ""]].map(function (x) {
        return "<tr><td>" + esc(x[0]) + "</td><td>" + esc(x[1] || "") + "</td><td></td><td></td></tr>";
      }).join("") + "</tbody></table>" +
      '<h2 class="rp-h rp-break">G. Testing criteria breakdown</h2>' + legend +
      '<table class="rp-table rp-crits"><colgroup><col class="w-ref"><col><col class="w-type"><col class="w-res"><col class="w-score"><col class="w-out"></colgroup>' +
      "<thead><tr><th>Ref</th><th>Criterion</th><th>Type · W</th><th>Result</th><th>Score</th><th>Outstanding / notes</th></tr></thead>" + breakdown + "</table>" +
      '<p class="rp-credit">' + esc(m.credit || "") + "</p></article>";
  }

  function pageStyle() {
    var m = data.meta, el = document.getElementById("page-style");
    if (!el) { el = document.createElement("style"); el.id = "page-style"; document.head.appendChild(el); }
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
      var s = sheetByKey(current);
      if (s) refreshSheet(s, id); else { recompute(); route(); }
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
          state = { answers: loaded.answers || {}, notes: loaded.notes || {}, profile: loaded.profile || {} };
          save(); recompute(); route();
        } catch (err) { alert("This file is not a saved evaluation."); }
      };
      reader.readAsText(t.files[0]);
      t.value = "";
    }
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.dataset.note) { if (t.value) state.notes[t.dataset.note] = t.value; else delete state.notes[t.dataset.note]; save(); }
    else if (t.dataset.profile) { state.profile[t.dataset.profile] = t.value; save(); }
    else if (t.id === "flt-text") {
      filter.text = t.value;
      var pos = t.selectionStart; route();
      var box = $("#flt-text"); if (box) { box.focus(); box.setSelectionRange(pos, pos); }
      if ($("#flt-show")) $("#flt-show").value = filter.show;
    }
  });

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.id === "btn-save") {
      var blob = new Blob([JSON.stringify({ criteria_version: data.meta.version, commit: data.meta.commit, saved: new Date().toISOString(),
        answers: state.answers, notes: state.notes, profile: state.profile }, null, 1)], { type: "application/json" });
      var a = document.createElement("a");
      var name = (state.profile.system_name || "evaluation").replace(/[^A-Za-z0-9_-]+/g, "-");
      a.href = URL.createObjectURL(blob); a.download = name + "-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a); a.click(); a.remove();
    } else if (t.id === "btn-print" || t.id === "btn-print-report") {
      pageStyle();
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

  window.addEventListener("hashchange", route);

  // ------------------------------------------------------------------ start
  var getJSON = function (u) { return fetch(u, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(u + " " + r.status); return r.json(); }); };
  Promise.all([getJSON("data.json"), getJSON("reference.json").catch(function () { return null; })]).then(function (res) {
    data = res[0];
    Ref.base(data);
    if (res[1]) Ref.init(data, res[1]);
    restore();
    recompute();
    renderBanner();
    if (Ref.ready()) Ref.initSearch($("#q"), $("#q-list")); else $(".search").hidden = true;
    route();
  }).catch(function (err) {
    $("#main").innerHTML = '<p class="out-bad">Could not load the criteria (data.json). Open this page through a web server. ' + esc(err) + "</p>";
  });
})();
