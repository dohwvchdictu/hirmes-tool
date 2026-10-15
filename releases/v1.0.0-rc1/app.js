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
    ["ph_core", "PH Core IG version"], ["pheref", "PHeReF IG version"]
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
    if (m.is_release) {
      b.className = "banner release";
      b.textContent = "Released version " + m.version + " · commit " + m.commit + " · built " + m.built;
    } else {
      b.className = "banner draft";
      b.textContent = "DRAFT — " + m.label + " · built " + m.built + " — for review only, not for official evaluation.";
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
    $("#tabs").innerHTML = items.map(function (it) {
      var dot = "";
      if (result.sheets[it[0]]) {
        var st = result.sheets[it[0]].status;
        var col = st === "PASSED" ? "var(--good)" : st === "NOT PASSED" ? "var(--bad)" : "var(--warn)";
        dot = '<span class="dot" style="background:' + col + '" title="' + st + '"></span>';
      }
      return '<a href="#' + it[0] + '"' + (current === it[0] ? ' aria-current="page"' : "") + ">" + esc(it[1]) + dot + "</a>";
    }).join("");
  }

  function route() {
    var h = (location.hash || "#summary").slice(1);
    current = h;
    renderTabs();
    var main = $("#main");
    if (h === "summary") main.innerHTML = viewSummary();
    else if (h === "profile") main.innerHTML = viewProfile();
    else if (h === "report") main.innerHTML = viewReport();
    else if (sheetByKey(h)) main.innerHTML = viewSheet(sheetByKey(h));
    else { location.hash = "#summary"; return; }
    window.scrollTo(0, 0);
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
      '<div class="stat"><div class="k">Conformant for use in the HIE?</div><div class="v">' + (r.conformant ? "YES" + (pol.status !== "Approved" ? " (provisional)" : "") : "NOT YET") + "</div></div>" +
      '<div class="stat"><div class="k">Critical items not met</div><div class="v">' + r.criticalOpen + "</div></div></div></section>" +
      '<section class="panel"><table class="grid"><thead><tr><th>Level</th><th class="num">Score</th><th class="num">Pass threshold</th>' +
      '<th class="num">Critical not met</th><th class="num">Items not tested</th><th class="num">Progress</th><th>Sheet status</th><th>Level status (gated)</th></tr></thead><tbody>' +
      rows + "</tbody></table>" +
      '<p class="sub" style="margin-top:10px">A level is LOCKED until the level before it passes. Level 2 passes only when all four parts pass. Conformant = Levels 0 to 3 passed and no critical item not met.</p></section>';
  }

  // ------------------------------------------------------------------ profile
  function viewProfile() {
    return '<section class="panel"><h2>System Profile</h2><p class="intro">These details appear on the Summary and the Printed Report.</p><div class="profile">' +
      PROFILE_FIELDS.map(function (f) {
        return '<div><label for="pf-' + f[0] + '">' + esc(f[1]) + '</label><input id="pf-' + f[0] + '" data-profile="' + f[0] + '" value="' + esc(state.profile[f[0]] || "") + '"></div>';
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
    var crit = c.critical === "yes" ? '<span class="tag critical">★ CRITICAL</span>' : c.critical === "subs" ? '<span class="tag critical">★ critical sub-items</span>' : "";
    var answer;
    if (!c.sub_items.length) {
      var list = c.scoring === "tier" ? tier : std;
      answer = '<div class="answer"><label for="a-' + esc(c.id) + '">Result</label><select id="a-' + esc(c.id) + '" data-answer="' + esc(c.id) + '">' +
        options(list, state.answers[c.id] || Scoring.NOT_TESTED) + "</select></div>";
    } else {
      answer = '<ul class="subs">' + c.sub_items.map(function (s) {
        return '<li><span class="sid">' + esc(s.id) + "</span><span>" + (s.critical ? '<span class="tag critical">★</span> ' : "") + esc(s.text) +
          '</span><select aria-label="Result for ' + esc(s.id) + '" data-answer="' + esc(s.id) + '">' + options(std, state.answers[s.id] || Scoring.NOT_TESTED) + "</select></li>";
      }).join("") + "</ul>";
    }
    var t = c.traces || {};
    var traces = ["fhir_traceability", "technical_baseline", "sources", "ig_requirements"].filter(function (k) { return t[k] && t[k].length; })
      .map(function (k) { return t[k].join(", "); }).join(" · ");
    return '<article class="crit ' + cardClass(x) + '" id="card-' + esc(c.id) + '">' +
      '<div class="crit-head"><span class="cid">' + esc(c.id) + '</span><span class="section">' + esc(c.section) + "</span>" + crit +
      '<span class="tag">' + esc(c.scoring) + " · weight " + esc(c.weight) + (c.weight === 0 ? " (info only)" : "") + '</span><span class="tag">' + esc(c.validation_role) + "</span></div>" +
      '<p class="title">' + esc(c.title) + "</p>" + answer +
      '<div class="result" id="res-' + esc(c.id) + '">' + resultLine(c, x) + "</div>" +
      '<textarea class="notes" placeholder="Evidence reference / notes" data-note="' + esc(c.id) + '" aria-label="Notes for ' + esc(c.id) + '">' + esc(state.notes[c.id] || "") + "</textarea>" +
      "<details><summary>Guides, evidence and traces</summary><div class=\"guide\"><h4>Developer's guide</h4>" + esc(c.developer_guide) +
      "<h4>Validator's guide</h4>" + esc(c.validator_guide) + "<h4>Evidence required</h4>" + esc(c.evidence) +
      (traces ? "<h4>Traces</h4>" + esc(traces) : "") + "</div></details></article>";
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
    return '<section class="panel"><h2>' + esc(s.title) + '</h2><p class="intro">' + esc(s.intro) + "</p>" + sheetStats(s) + "</section>" +
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
  function viewReport() {
    var p = state.profile, r = result, m = data.meta;
    var prof = PROFILE_FIELDS.map(function (f) { return "<tr><th>" + esc(f[1]) + "</th><td>" + esc(p[f[0]] || "—") + "</td></tr>"; }).join("");
    var levels = r.levels.map(function (l) {
      return "<tr><td>" + esc(l.name) + '</td><td class="num">' + (l.threshold == null ? "all parts" : pct(l.threshold, 0)) + "</td><td>" + esc(l.gated) +
        '</td><td class="num">' + pct(l.score) + '</td><td class="num">' + pct(l.progress, 0) + " evaluated</td></tr>";
    }).join("");
    var needs = data.sheets.map(function (s) {
      var x = r.sheets[s.key];
      return "<tr><td>" + esc(s.title) + '</td><td class="num">' + x.criticalNotMet + "</td><td>" + esc(x.needs.join(", ") || "—") + "</td></tr>";
    }).join("");
    var breakdown = data.sheets.map(function (s) {
      var x = r.sheets[s.key];
      var rows = s.criteria.map(function (c, i) {
        var y = x.rows[i];
        var res = c.weight === 0 ? "— Not scored" : y.M === "Met" ? "✓ MET" : y.M === "Not Met" ? "✗ NOT MET" : y.M === Scoring.NOT_TESTED ? "○ NOT TESTED" :
          y.M === "N/A" ? "— N/A" : (y.N >= 1 ? "✓ " : "◐ ") + String(y.M).toUpperCase();
        var row = '<tr><td class="ref">' + esc(c.id) + "</td><td>" + esc(c.title) + "</td><td>" + (c.critical === "yes" ? "★ CRITICAL " : "") + esc(c.scoring) + " · W" + esc(c.weight) +
          "</td><td>" + esc(res) + '</td><td class="num">' + (y.N === "" ? "—" : pct(y.N, 0)) + "</td><td>" + esc(y.outstanding) + (state.notes[c.id] ? "<br>Notes: " + esc(state.notes[c.id]) : "") + "</td></tr>";
        row += c.sub_items.map(function (sbi) {
          var v = state.answers[sbi.id] || Scoring.NOT_TESTED;
          return '<tr class="subrow"><td class="ref">' + esc(sbi.id) + '</td><td colspan="2">↳ ' + (sbi.critical ? "★ " : "") + esc(sbi.text) + "</td><td>" +
            esc(v === "Met" ? "✓ Met" : v === "Not Met" ? "✗ Not met" : v === "N/A" ? "— N/A" : "○ Not tested") + '</td><td></td><td></td></tr>';
        }).join("");
        return row;
      }).join("");
      return "<h2>" + esc(s.title) + '</h2><p class="rep-sub">Score ' + pct(x.score) + " · Threshold " + pct(x.threshold, 0) + " · Critical not met " + x.criticalNotMet +
        " · Not tested " + x.notTested + " of " + x.total + " · Status " + esc(x.status) + "</p>" +
        '<table class="grid"><thead><tr><th>Ref</th><th>Criterion</th><th>Type · W</th><th>Result</th><th class="num">Score</th><th>Outstanding / notes</th></tr></thead><tbody>' + rows + "</tbody></table>";
    }).join("");
    return '<section class="panel" id="report"><div class="rep-head"><p>Republic of the Philippines<br>Department of Health<br>' + esc((p.office || "[DOH OFFICE / REGION]").toUpperCase()) +
      '</p><h2>HIE SYSTEM VALIDATION TESTING CRITERIA — EVALUATION REPORT</h2><p class="rep-sub">Criteria version ' + esc(m.label) +
      (m.is_release ? "" : " — DRAFT, not for official evaluation") + "</p></div>" +
      '<h2>A. System profile</h2><table class="grid kv">' + prof + "</table>" +
      '<h2>B. Summary scorecard</h2><table class="grid"><thead><tr><th>Level</th><th class="num">Threshold</th><th>Status</th><th class="num">Score</th><th class="num">Progress</th></tr></thead><tbody>' + levels + "</tbody></table>" +
      '<p class="big">Highest level achieved: ' + esc(r.highest) + " · HIE use: " + (r.conformant ? "✓ CONFORMANT (Levels 0–3 passed)" : "NOT YET CONFORMANT") + "</p>" +
      '<h2>C. Items needing compliance</h2><table class="grid"><thead><tr><th>Level / part</th><th class="num">Critical not met</th><th>Criteria needing compliance</th></tr></thead><tbody>' + needs +
      "</tbody></table><p><b>Certificate condition (no critical item Not Met): " + (r.criticalOpen === 0 ? "✓ MET" : "✗ NOT MET — certificate cannot be issued") + "</b></p>" +
      '<h2>D. Sign-off</h2><table class="grid sign"><thead><tr><th>Role</th><th>Name · Designation · Agency</th><th>Signature</th><th>Date</th></tr></thead><tbody>' +
      ["Validated by", "Witnessed by", "Processed by (Administrator)", "Approved by (Technical Lead)", "Conforme (Vendor / Developer)"].map(function (x) {
        return "<tr><td>" + x + "</td><td></td><td></td><td></td></tr>";
      }).join("") + "</tbody></table>" +
      "<h2>E. Testing criteria breakdown</h2>" + breakdown +
      '<p class="rep-sub">' + esc(m.credit || "") + "</p></section>";
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
    } else if (t.id === "btn-print") {
      location.hash = "#report"; setTimeout(function () { window.print(); }, 300);
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
  fetch("data.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
    data = d;
    restore();
    recompute();
    renderBanner();
    route();
  }).catch(function (err) {
    $("#main").innerHTML = '<p class="out-bad">Could not load the criteria (data.json). Open this page through a web server. ' + esc(err) + "</p>";
  });
})();
