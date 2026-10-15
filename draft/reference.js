/* SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
 * SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Reference layer of the web scorecard: links terms and IDs in criteria text to the glossary,
 * abbreviations, registers and documents (reference.json), shows them in a popover on hover,
 * focus or tap, opens a criterion's guides in a side drawer, renders the Reference pages and
 * runs the site-wide search. Nothing is shown until the user asks for it.
 */
(function (root) {
  "use strict";

  var D = null, R = null;            // data.json, reference.json
  var idx = { g: {}, a: {}, r: {}, c: {}, crit: {}, regOf: {} };
  var reAcr = null, rePhrase = null, keyRef = {};
  var reIds = /\b(?:TB-\d{2}|SRC-\d{2}|TR-\d{3}|IND-\d{2}|(?:L[0-4]|TS[0-3]|TEC)-(?:T\.)?\d{2}(?:\.\d+)?)\b/g;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function clip(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s; }

  // ------------------------------------------------------------------ index
  function init(data, ref) {
    D = data; R = ref;
    R.glossary.forEach(function (g) { idx.g[g.id] = g; g.keys.forEach(function (k) { if (!keyRef[k]) keyRef[k] = "g:" + g.id; }); });
    R.abbreviations.forEach(function (a) { idx.a[a.id] = a; a.keys.forEach(function (k) { if (!keyRef[k]) keyRef[k] = "a:" + a.id; }); });
    R.registers.forEach(function (reg) { reg.entries.forEach(function (e) { idx.r[e.id] = e; idx.regOf[e.id] = reg; }); });
    Object.keys(R.criteria || {}).forEach(function (k) { idx.c[k] = R.criteria[k]; });
    D.sheets.forEach(function (s) { s.criteria.forEach(function (c) { idx.crit[c.id] = { c: c, sheet: s }; }); });
    var acr = [], phr = [];
    Object.keys(keyRef).forEach(function (k) { (/\s/.test(k) ? phr : acr).push(k); });
    var byLen = function (a, b) { return b.length - a.length; };
    if (acr.length) reAcr = new RegExp("(?<![\\w\\-])(" + acr.sort(byLen).map(reEsc).join("|") + ")(?![\\w\\-])", "g");
    if (phr.length) rePhrase = new RegExp("(?<![\\w\\-])(" + phr.sort(byLen).map(reEsc).join("|") + ")(?![\\w\\-])", "gi");
    phr.forEach(function (k) { keyRef[k.toLowerCase()] = keyRef[k]; });
  }

  function refFor(match) {
    if (/^(TB|SRC|TR|IND)-/.test(match)) return idx.r[match] ? "r:" + match : null;
    if (/^(L[0-4]|TS[0-3]|TEC)-/.test(match)) {
      var base = match.replace(/\.\d+$/, "");
      if (idx.crit[match]) return "c:" + match;
      if (idx.crit[base]) return "c:" + base;
      return idx.c[match] ? "c:" + idx.c[match].criterion : null;
    }
    return keyRef[match] || keyRef[match.toLowerCase()] || null;
  }

  /** Escape `text` and wrap known IDs and terms in popover triggers. `seen` (a Set) links each
   *  term only once per scope; IDs are always linked. */
  function link(text, seen, opts) {
    text = String(text || "");
    if (!R) return esc(text);
    opts = opts || {};
    var hits = [];
    function collect(re, kind) {
      if (!re) return;
      re.lastIndex = 0;
      var m;
      while ((m = re.exec(text))) hits.push({ s: m.index, e: m.index + m[0].length, t: m[0], kind: kind });
    }
    collect(reIds, "id");
    if (!opts.idsOnly) { collect(reAcr, "term"); collect(rePhrase, "term"); }
    hits.sort(function (a, b) { return a.s - b.s || (b.e - b.s) - (a.e - a.s); });
    var out = "", pos = 0;
    hits.forEach(function (h) {
      if (h.s < pos) return;
      var ref = refFor(h.t);
      if (!ref) return;
      if (h.kind === "term" && seen) { if (seen.has(ref)) return; seen.add(ref); }
      out += esc(text.slice(pos, h.s)) + '<span class="xref x-' + ref[0] + '" tabindex="0" role="button" data-ref="' + esc(ref) + '">' + esc(h.t) + "</span>";
      pos = h.e;
    });
    return out + esc(text.slice(pos));
  }

  /** Small ⓘ button showing help from registers/form-help.yaml, e.g. help("scoring.count"). */
  function help(path, labelText) {
    if (!R || !R.help) return "";
    var v = getHelp(path);
    if (!v) return "";
    return '<span class="help" tabindex="0" role="button" aria-label="Help: ' + esc(labelText || path) + '" data-ref="h:' + esc(path) + '">i</span>';
  }
  function getHelp(path) {
    var v = R.help;
    path.split(".").forEach(function (k) { v = v && v[k]; });
    if (v && typeof v === "object") return { label: v.label, text: v.help, see: v.see };
    return v ? { text: v } : null;
  }

  // ------------------------------------------------------------------ popover
  var pop = null, popFor = null, pinned = false, showT = null, hideT = null;

  function ensurePop() {
    if (pop) return pop;
    pop = document.createElement("div");
    pop.id = "xpop"; pop.className = "xpop"; pop.setAttribute("role", "tooltip"); pop.hidden = true;
    document.body.appendChild(pop);
    pop.addEventListener("mouseenter", function () { clearTimeout(hideT); });
    pop.addEventListener("mouseleave", function () { if (!pinned) hideSoon(); });
    return pop;
  }

  function chipsFor(ids) {
    return ids.map(function (cid) {
      var x = idx.crit[cid];
      return x ? '<a class="cchip" href="#' + x.sheet.key + "/" + esc(cid) + '" title="' + esc(x.c.title) + '">' + esc(cid) + "</a>" : "";
    }).join(" ");
  }

  function glossSrc(g) { return g.src ? { title: "Glossary: " + g.term, id: g.term, p: g.src.p, l: g.src.l, text: g.term + " — " + g.meaning } : null; }
  function abbrSrc(a) { return a.src ? { title: "Abbreviation: " + a.abbreviation, id: a.abbreviation, p: a.src.p, l: a.src.l, text: a.abbreviation + " — " + a.stands_for } : null; }
  function regSrc(e) { return e.src ? { title: e.id + " — " + clip(e.title, 60), id: e.id, p: e.src.p, l: e.src.l, text: e.title } : null; }

  function popContent(ref) {
    var kind = ref[0], id = ref.slice(2), h = "";
    if (kind === "g") {
      var g = idx.g[id]; if (!g) return "";
      h = '<div class="xp-kind">Glossary · ' + esc(g.section.replace(/^\d+(\.\d+)?\s*/, "")) + '</div><div class="xp-title">' + esc(g.term) + "</div><p>" + esc(clip(g.meaning, 420)) +
        '</p><div class="xp-links"><a href="#ref/glossary/' + esc(g.id) + '">Open in glossary ›</a></div>' + srcLine(glossSrc(g));
    } else if (kind === "a") {
      var a = idx.a[id]; if (!a) return "";
      h = '<div class="xp-kind">Abbreviation</div><div class="xp-title">' + esc(a.abbreviation) + "</div><p>" + esc(a.stands_for) +
        '</p><div class="xp-links"><a href="#ref/abbreviations/' + esc(a.id) + '">Open in abbreviations ›</a></div>' + srcLine(abbrSrc(a));
    } else if (kind === "r") {
      var e = idx.r[id], reg = idx.regOf[id]; if (!e) return "";
      var f = e.fields.slice(0, 2).map(function (x) { return "<dt>" + esc(x[0]) + "</dt><dd>" + esc(clip(x[1], 220)) + "</dd>"; }).join("");
      h = '<div class="xp-kind">' + esc(reg.name) + '</div><div class="xp-title">' + esc(id) + " — " + esc(e.title) + '</div><dl class="xp-dl">' + f + "</dl>" +
        (e.criteria.length ? '<div class="xp-used">Used by ' + chipsFor(e.criteria.slice(0, 12)) + (e.criteria.length > 12 ? " …" : "") + "</div>" : "") +
        '<div class="xp-links"><a href="#ref/' + esc(reg.key) + "/" + esc(id) + '">Open full entry ›</a></div>' + srcLine(regSrc(e));
    } else if (kind === "c") {
      var x = idx.crit[id]; if (!x) return "";
      h = '<div class="xp-kind">Criterion · ' + esc(x.sheet.tab) + '</div><div class="xp-title">' + esc(id) + "</div><p>" + esc(clip(x.c.title, 300)) +
        '</p><div class="xp-links"><a href="#' + x.sheet.key + "/" + esc(id) + '">Go to criterion ›</a> <a href="#" data-guide="' + esc(id) + '">Open guide ›</a></div>' + srcLine(critSrc(x.c));
    } else if (kind === "h") {
      var v = getHelp(id); if (!v) return "";
      var see = (v.see || []).map(function (s) {
        var r = refFor(s) || (keyRef[s] ? keyRef[s] : null);
        if (!r) { var g2 = R.glossary.filter(function (gg) { return gg.term === s || gg.term.indexOf(s) === 0; })[0]; r = g2 ? "g:" + g2.id : null; }
        return r ? '<span class="xref x-' + r[0] + '" tabindex="0" role="button" data-ref="' + esc(r) + '">' + esc(s) + "</span>" : esc(s);
      }).join(", ");
      h = '<div class="xp-kind">Help</div>' + (v.label ? '<div class="xp-title">' + esc(v.label) + "</div>" : "") + "<p>" + esc(v.text) + "</p>" +
        (see ? '<div class="xp-used">See also: ' + see + "</div>" : "") + srcLine(helpSrc(id, v));
    } else if (kind === "s") {
      h = srcPop(id);
    }
    return h;
  }

  function placePop(el) {
    var r = el.getBoundingClientRect(), p = pop;
    p.style.left = "0px"; p.style.top = "0px"; p.hidden = false;
    var w = p.offsetWidth, hgt = p.offsetHeight, vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var left = Math.min(Math.max(8, r.left), vw - w - 8);
    var top = r.bottom + 6;
    if (top + hgt > vh - 8 && r.top - hgt - 6 > 8) top = r.top - hgt - 6;
    p.style.left = left + window.scrollX + "px"; p.style.top = top + window.scrollY + "px";
  }

  function showPop(el, pin) {
    var ref = el.getAttribute("data-ref"), html = popContent(ref);
    if (!html) return;
    ensurePop();
    clearTimeout(hideT);
    pop.innerHTML = (pin ? '<button type="button" class="xp-close" aria-label="Close">×</button>' : "") + html;
    popFor = el; pinned = !!pin;
    placePop(el);
  }
  function hidePop() { if (pop) { pop.hidden = true; popFor = null; pinned = false; } }
  function hideSoon() { clearTimeout(hideT); hideT = setTimeout(hidePop, 220); }

  var hoverCapable = window.matchMedia && window.matchMedia("(hover: hover)").matches;
  document.addEventListener("mouseover", function (e) {
    if (!hoverCapable || pinned) return;
    var el = e.target.closest && e.target.closest(".xref, .help");
    if (!el || (pop && pop.contains(el))) return;
    clearTimeout(showT); clearTimeout(hideT);
    showT = setTimeout(function () { showPop(el, false); }, 280);
  });
  document.addEventListener("mouseout", function (e) {
    var el = e.target.closest && e.target.closest(".xref, .help");
    if (!el) return;
    clearTimeout(showT);
    if (!pinned) hideSoon();
  });
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains("xp-close")) { hidePop(); return; }
    var el = t.closest && t.closest(".xref, .help, .srcbtn");
    if (el) { e.preventDefault(); if (pinned && popFor === el) hidePop(); else showPop(el, true); return; }
    var g = t.closest && t.closest("[data-guide]");
    if (g) { e.preventDefault(); hidePop(); var x = idx.crit[g.getAttribute("data-guide")]; if (x) openDrawer(x.c, x.sheet, g.getAttribute("data-tab") || "dev"); return; }
    if (pop && !pop.hidden && !pop.contains(t)) hidePop();
    if (pop && pop.contains(t) && t.tagName === "A") hidePop();
  });
  document.addEventListener("keydown", function (e) {
    var el = e.target.closest && e.target.closest(".xref, .help");
    if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); showPop(el, true); }
    if (e.key === "Escape") { if (pop && !pop.hidden) hidePop(); else closeDrawer(); }
  });
  document.addEventListener("focusin", function (e) {
    var el = e.target.closest && e.target.closest(".xref, .help");
    if (el && !pinned && el.matches(":focus-visible")) showPop(el, false);
  });
  window.addEventListener("hashchange", function () { hidePop(); });
  window.addEventListener("scroll", function () { if (pop && !pop.hidden && !pinned) hidePop(); }, { passive: true });

  // ------------------------------------------------------------------ guide drawer
  var drawer = null, drawerFor = null;
  var TABS = [["dev", "Developer"], ["val", "Validator"], ["evd", "Evidence"], ["trc", "Traces"], ["trm", "Terms"]];

  // ------------------------------------------------------------------ source links (✎)
  // Every criterion, register entry, term, help text and document chapter carries `src`
  // ({p: file, l: [first, last line]}) from the build. The ✎ button opens a small menu that
  // edits that file on GitHub, shows the exact lines in the version being viewed, or opens a
  // change request with the location and current text filled in.
  var srcReg = {}, srcSeq = 0;
  var FIELD_LABELS = [["title", "Title"], ["section", "Section"], ["critical", "Critical flag"], ["scoring", "Scoring method"],
    ["weight", "Weight"], ["validation_role", "Validation role"], ["evidence", "Evidence required"], ["developer_guide", "Developer's guide"],
    ["validator_guide", "Validator's guide"], ["traces", "Traces"], ["terms", "Terms"]];
  var TAB_FIELD = { dev: "developer_guide", val: "validator_guide", evd: "evidence", trc: "traces", trm: "terms" };

  function editRef() { var m = D.meta; return m.branch || m.default_branch || "main"; }
  function encRef(r) { return encodeURIComponent(r).replace(/%2F/g, "/"); }
  function lines(l) { return l ? (l[1] > l[0] ? "lines " + l[0] + "–" + l[1] : "line " + l[0]) : ""; }
  function editUrl(p) { return D.meta.repository && p ? D.meta.repository + "/edit/" + encRef(editRef()) + "/" + p : ""; }
  function viewUrl(p, l) {
    if (!D.meta.repository || !p) return "";
    return D.meta.repository + "/blob/" + encRef(D.meta.sha || editRef()) + "/" + p + (/\.md$/.test(p) ? "?plain=1" : "") +
      (l ? "#L" + l[0] + (l[1] > l[0] ? "-L" + l[1] : "") : "");
  }
  function suggestUrl(e, row) {
    if (!D.meta.repository) return "";
    var l = row ? row.l : e.l, what = e.title + (row ? " — " + row.label : "");
    var text = String((row ? row.text : e.text) || "").trim();
    if (text.length > 1200) text = text.slice(0, 1200) + " …";
    var body = "Location: " + (row && row.p || e.p) + (l ? " (" + lines(l) + ")" : "") + "\n" + viewUrl(row && row.p || e.p, l) +
      (text ? "\n\nCurrent text:\n" + text.split("\n").map(function (x) { return "> " + x; }).join("\n") : "") + "\n\nProposed text:\n";
    return D.meta.repository + "/issues/new?template=change-request.yml&title=" + encodeURIComponent("Change: " + what) +
      "&criterion=" + encodeURIComponent(e.id || "") + "&change=" + encodeURIComponent(body);
  }
  /** ✎ button for one source location. entry: {title, id?, p, l, text?, rows?:[{label, p?, l, text?}]} */
  function srcBtn(entry, cls) {
    if (!D || !D.meta.repository || !entry || !entry.p) return "";
    var key = entry.p + "|" + entry.title;
    var id = srcReg[key] ? srcReg[key].n : "s" + (++srcSeq);
    entry.n = id; srcReg[key] = entry; srcReg[id] = entry;
    return '<button type="button" class="srcbtn' + (cls ? " " + cls : "") + '" data-ref="s:' + id + '" aria-label="Source of ' + esc(entry.title) +
      '" title="Edit or suggest a change (' + esc(entry.p) + (entry.l ? ", " + lines(entry.l) : "") + ')">✎' + (cls === "hov" ? "" : '<span class="lbl">Edit</span>') + "</button>";
  }
  /** One-line footer with the same three actions, for popovers and the guide drawer. */
  function srcLine(entry, row) {
    if (!D || !D.meta.repository || !entry || !entry.p) return "";
    var p = row && row.p || entry.p, l = row ? row.l : entry.l;
    return '<div class="xp-src"><a href="' + esc(editUrl(p)) + '" target="_blank" rel="noopener">✎ Edit</a>' +
      '<a href="' + esc(viewUrl(p, l)) + '" target="_blank" rel="noopener" title="' + esc(p) + '">' + esc(p.split("/").pop()) + (l ? " · " + lines(l) : "") + "</a>" +
      '<a href="' + esc(suggestUrl(entry, row)) + '" target="_blank" rel="noopener">Suggest a change</a></div>';
  }
  function srcPop(id) {
    var e = srcReg[id]; if (!e) return "";
    var tag = !D.meta.branch;
    var rows = (e.rows || []).filter(function (r) { return r.l; });
    return '<div class="xp-kind">Source</div><div class="xp-title">' + esc(e.title) + '</div><p class="xp-path"><code>' + esc(e.p) + "</code>" + (e.l ? " · " + lines(e.l) : "") + "</p>" +
      '<div class="src-acts">' +
      '<a href="' + esc(editUrl(e.p)) + '" target="_blank" rel="noopener"><b>✎ Edit on GitHub</b><span>Opens the file in GitHub\'s editor' + (tag ? " on " + esc(editRef()) + " (releases cannot be edited)" : " on branch " + esc(editRef())) + ". Without write access, GitHub offers a fork and pull request.</span></a>" +
      '<a href="' + esc(viewUrl(e.p, e.l)) + '" target="_blank" rel="noopener"><b>⌗ Show the lines</b><span>Highlights ' + (e.l ? esc(lines(e.l)) : "the file") + " in this exact version (commit " + esc(D.meta.commit) + ").</span></a>" +
      '<a href="' + esc(suggestUrl(e)) + '" target="_blank" rel="noopener"><b>✉ Suggest a change</b><span>Opens a change request with this location and the current text filled in. No editing needed.</span></a></div>' +
      (rows.length ? '<div class="src-rows"><div class="xp-kind">Jump to a part</div>' + rows.map(function (r) {
        return '<div><a href="' + esc(viewUrl(r.p || e.p, r.l)) + '" target="_blank" rel="noopener">' + esc(r.label) + ' <span class="muted">' + esc(lines(r.l)) + "</span></a>" +
          '<a class="sg" href="' + esc(suggestUrl(e, r)) + '" target="_blank" rel="noopener" title="Suggest a change to ' + esc(r.label) + '">✉</a></div>';
      }).join("") + "</div>" : "");
  }

  function editLink(path, labelText) {
    var u = D && editUrl(path);
    return u ? '<a class="edit-src" href="' + esc(u) + '" target="_blank" rel="noopener">✎ ' + esc(labelText || "Edit file") + "</a>" : "";
  }

  /** Source entry of a criterion, with a row per field and per sub-item. */
  function critSrc(c) {
    var s = c.src; if (!s) return null;
    var rows = FIELD_LABELS.filter(function (f) { return s.f && s.f[f[0]]; }).map(function (f) {
      var v = c[f[0]];
      return { label: f[1], l: s.f[f[0]], text: typeof v === "object" ? "" : String(v == null ? "" : v) };
    });
    (c.sub_items || []).forEach(function (sb) { if (s.s && s.s[sb.id]) rows.push({ label: "Sub-item " + sb.id, l: s.s[sb.id], text: sb.text }); });
    return { title: "Criterion " + c.id, id: c.id, p: s.p, l: s.l, text: c.title, rows: rows };
  }
  function critFieldSrc(c, field) {
    var e = critSrc(c); if (!e) return null;
    var f = FIELD_LABELS.filter(function (x) { return x[0] === field; })[0];
    return { entry: e, row: { label: f ? f[1] : field, l: c.src.f && c.src.f[field], text: typeof c[field] === "string" ? c[field] : "" } };
  }
  function sheetSrc(s) {
    if (!s.src) return null;
    return { title: "Sheet " + s.tab, id: s.key, p: s.src.p, l: s.src.l, text: s.intro,
      rows: [{ label: "Title", l: s.src.f.title, text: s.title }, { label: "Introduction", l: s.src.f.intro, text: s.intro },
        { label: "Pass threshold (scoring.yaml)", p: s.src.threshold.p, l: s.src.threshold.l, text: String(s.threshold) }] };
  }
  function helpSrc(path, v) {
    var l = R && R.help_src && R.help_src[path];
    return l ? { title: "Help: " + (v && v.label || path), p: "registers/form-help.yaml", l: l, text: v ? v.text : "" } : null;
  }

  function paras(text, seen) {
    return String(text || "").split(/\n{2,}/).map(function (p) { return "<p>" + link(p, seen).replace(/\n/g, "<br>") + "</p>"; }).join("");
  }

  function termsOf(c) {
    var seen = new Set();
    [c.title, c.developer_guide, c.validator_guide, c.evidence].concat((c.sub_items || []).map(function (s) { return s.text; }))
      .forEach(function (t) { link(t, seen); });
    (c.terms || []).forEach(function (k) { var r = refFor(k); if (r) seen.add(r); });
    return Array.from(seen).filter(function (r) { return r[0] === "g" || r[0] === "a"; });
  }
  function relatedIds(c) {
    var s = new Set(), txt = [c.developer_guide, c.validator_guide, c.evidence, c.title].join(" ");
    (txt.match(reIds) || []).forEach(function (m) { var r = refFor(m); if (r && r !== "c:" + c.id) s.add(r); });
    var t = c.traces || {};
    ["fhir_traceability", "technical_baseline", "sources"].forEach(function (k) { (t[k] || []).forEach(function (id) { if (idx.r[id]) s.add("r:" + id); }); });
    return Array.from(s);
  }

  function tabBody(c, tab) {
    if (tab === "dev") {
      var parts = String(c.developer_guide || "").split(/\n\nPurpose:\s*/);
      return paras(parts[0], new Set()) + (parts[1] ? '<p class="purpose"><b>Purpose:</b> ' + link(parts[1], new Set()) + "</p>" : "");
    }
    if (tab === "val") return paras(c.validator_guide, new Set());
    if (tab === "evd") return '<p class="evd">' + link(c.evidence, new Set()) + '</p><p class="muted">' + esc(getHelp("notes") ? getHelp("notes").text : "") + "</p>";
    if (tab === "trc") {
      var ids = relatedIds(c);
      var ig = (c.traces && c.traces.ig_requirements) || [];
      if (!ids.length && !ig.length) return '<p class="muted">No traces recorded for this criterion yet.</p>';
      return ids.map(function (r) {
        var id = r.slice(2);
        if (r[0] === "c") { var x = idx.crit[id]; return '<div class="tcard"><div class="xp-kind">Related criterion</div><b><span class="xref x-c" tabindex="0" role="button" data-ref="' + esc(r) + '">' + esc(id) + "</span></b> " + esc(clip(x.c.title, 160)) + "</div>"; }
        var e = idx.r[id], reg = idx.regOf[id];
        return '<div class="tcard"><div class="xp-kind">' + esc(reg.name) + '</div><b><a href="#ref/' + esc(reg.key) + "/" + esc(id) + '">' + esc(id) + "</a></b> " + esc(e.title) +
          '<dl class="xp-dl">' + e.fields.slice(0, 3).map(function (f) { return "<dt>" + esc(f[0]) + "</dt><dd>" + link(clip(f[1], 260), null, { idsOnly: true }) + "</dd>"; }).join("") + "</dl></div>";
      }).join("") + (ig.length ? '<div class="tcard"><div class="xp-kind">PHeReF requirements</div>' + ig.map(esc).join(", ") + "</div>" : "");
    }
    if (tab === "trm") {
      var refs = termsOf(c);
      if (!refs.length) return '<p class="muted">No glossary terms detected in this criterion.</p>';
      return '<dl class="terms">' + refs.map(function (r) {
        var g = r[0] === "g" ? idx.g[r.slice(2)] : null, a = r[0] === "a" ? idx.a[r.slice(2)] : null;
        return g ? '<dt><a href="#ref/glossary/' + esc(g.id) + '">' + esc(g.term) + "</a></dt><dd>" + esc(clip(g.meaning, 300)) + "</dd>"
          : "<dt>" + esc(a.abbreviation) + "</dt><dd>" + esc(a.stands_for) + "</dd>";
      }).join("") + "</dl>";
    }
    return "";
  }

  function counts(c) {
    return { trc: relatedIds(c).length + (((c.traces || {}).ig_requirements || []).length), trm: termsOf(c).length };
  }

  function openDrawer(c, sheet, tab) {
    if (!drawer) {
      drawer = document.createElement("aside");
      drawer.id = "drawer"; drawer.className = "drawer"; drawer.setAttribute("aria-label", "Criterion guide");
      document.body.appendChild(drawer);
      drawer.addEventListener("click", function (e) {
        var b = e.target.closest("[data-dtab]");
        if (b) { renderDrawer(drawerFor.c, drawerFor.sheet, b.getAttribute("data-dtab")); }
        if (e.target.closest(".d-close")) closeDrawer();
      });
    }
    renderDrawer(c, sheet, tab || "dev");
    drawer.classList.add("open");
    document.body.classList.add("drawer-open");
    var h = drawer.querySelector("h2"); if (h) h.focus();
  }
  function renderDrawer(c, sheet, tab) {
    drawerFor = { c: c, sheet: sheet };
    var n = counts(c);
    drawer.innerHTML = '<div class="d-head"><div><div class="xp-kind">' + esc(sheet.tab) + " · " + esc(c.section) + '</div><h2 tabindex="-1">' + esc(c.id) + "</h2></div>" +
      '<button type="button" class="d-close" aria-label="Close guide">×</button></div><p class="d-title">' + link(c.title, new Set()) + "</p>" +
      '<div class="d-tabs" role="tablist">' + TABS.map(function (t) {
        var badge = t[0] === "trc" ? n.trc : t[0] === "trm" ? n.trm : null;
        return '<button type="button" role="tab" data-dtab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + (badge != null ? ' <span class="cnt">' + badge + "</span>" : "") + "</button>";
      }).join("") + '</div><div class="d-body" role="tabpanel">' + tabBody(c, tab) + '</div><div class="d-foot">' + drawerFoot(c, tab) + "</div>";
  }
  function drawerFoot(c, tab) {
    var fs = critFieldSrc(c, TAB_FIELD[tab]), all = critSrc(c);
    if (!all) return "";
    var label = fs && fs.row.l ? fs.row.label : null;
    return (label ? '<div class="xp-kind">Source of the ' + esc(label.toLowerCase()) + "</div>" + srcLine(fs.entry, fs.row)
      : '<div class="xp-kind">' + (tab === "trm" ? "Terms are detected from the text; add more with <code>terms:</code>" : "Not set in this criterion yet") + "</div>" + srcLine(all)) +
      '<div class="d-all">Whole criterion ' + srcBtn(all) + "</div>";
  }
  function closeDrawer() {
    if (drawer) { drawer.classList.remove("open"); document.body.classList.remove("drawer-open"); }
  }

  // ------------------------------------------------------------------ reference pages
  var NAV = [["glossary", "Glossary"], ["abbreviations", "Abbreviations"], ["TB", "Technical Baseline (TB-)"], ["SRC", "Sources (SRC-)"],
    ["TR", "FHIR Traceability (TR-)"], ["IND", "Indicators (IND-)"], ["prefixes", "ID prefixes"]];
  var refFilter = "";

  function navHtml(page) {
    var docs = R.docs.map(function (d) {
      return '<div class="rn-group">' + esc(d.title) + "</div>" + d.chapters.map(function (ch) {
        var p = "doc:" + d.id + ":" + ch.id;
        return '<a href="#ref/' + p + '"' + (page === p ? ' aria-current="page"' : "") + ">" + esc(ch.title) + "</a>";
      }).join("");
    }).join("");
    return '<nav class="rnav" aria-label="Reference"><div class="rn-group">Terms</div>' +
      NAV.slice(0, 2).map(function (n) { return '<a href="#ref/' + n[0] + '"' + (page === n[0] ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join("") +
      '<div class="rn-group">Registers</div>' +
      NAV.slice(2).map(function (n) { return '<a href="#ref/' + n[0] + '"' + (page === n[0] ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join("") +
      docs + "</nav>";
  }

  function match(text) { return !refFilter || String(text).toLowerCase().indexOf(refFilter.toLowerCase()) >= 0; }

  function pageHtml(page) {
    var src = { glossary: "registers/glossary.yaml", abbreviations: "registers/abbreviations.yaml", prefixes: "registers/id-prefixes.yaml" };
    R.registers.forEach(function (r) { src[r.key] = r.src; });
    var filterBox = '<input type="search" id="ref-filter" placeholder="Filter this page" value="' + esc(refFilter) + '">';
    if (page === "glossary") {
      var bySec = {};
      R.glossary.forEach(function (g) { if (match(g.term + " " + g.meaning)) (bySec[g.section] = bySec[g.section] || []).push(g); });
      return "<h2>Glossary</h2>" + filterBox + editLink(src.glossary) + Object.keys(bySec).map(function (s) {
        return "<h3>" + esc(s) + '</h3><dl class="gl">' + bySec[s].map(function (g) {
          return '<dt id="' + esc(g.id) + '">' + esc(g.term) + srcBtn(glossSrc(g), "hov") + "</dt><dd>" + link(g.meaning, null, { idsOnly: true }) + "</dd>";
        }).join("") + "</dl>";
      }).join("") || '<p class="muted">No terms match.</p>';
    }
    if (page === "abbreviations") {
      return "<h2>Abbreviations</h2>" + filterBox + editLink(src.abbreviations) + '<table class="grid"><tbody>' + R.abbreviations.filter(function (a) { return match(a.abbreviation + " " + a.stands_for); })
        .map(function (a) { return '<tr id="' + esc(a.id) + '"><th>' + esc(a.abbreviation) + "</th><td>" + esc(a.stands_for) + srcBtn(abbrSrc(a), "hov") + "</td></tr>"; }).join("") + "</tbody></table>";
    }
    if (page === "prefixes") {
      return "<h2>ID prefixes</h2>" + editLink(src.prefixes) + '<table class="grid"><thead><tr><th>Prefix</th><th>Meaning</th><th>Where</th></tr></thead><tbody>' +
        R.prefixes.map(function (p) { return "<tr><th>" + esc(p.prefix) + "</th><td>" + esc(p.meaning) + "</td><td>" + esc(p.where) +
          (p.src ? srcBtn({ title: "ID prefix " + p.prefix, id: p.prefix, p: p.src.p, l: p.src.l, text: p.meaning }, "hov") : "") + "</td></tr>"; }).join("") + "</tbody></table>";
    }
    var reg = R.registers.filter(function (r) { return r.key === page; })[0];
    if (reg) {
      return "<h2>" + esc(reg.title) + "</h2>" + filterBox + editLink(src[reg.key]) + reg.entries.filter(function (e) {
        return match(e.id + " " + e.title + " " + e.fields.map(function (f) { return f[1]; }).join(" "));
      }).map(function (e) {
        var main = e.fields.slice(0, 2), rest = e.fields.slice(2);
        var dl = function (fs) { return '<dl class="xp-dl">' + fs.map(function (f) { return "<dt>" + esc(f[0]) + "</dt><dd>" + link(f[1], null, { idsOnly: true }) + "</dd>"; }).join("") + "</dl>"; };
        return '<article class="rcard" id="' + esc(e.id) + '"><h3><span class="rid">' + esc(e.id) + "</span> " + esc(e.title) + srcBtn(regSrc(e)) + "</h3>" + dl(main) +
          (rest.length ? "<details><summary>All fields (" + e.fields.length + ")</summary>" + dl(rest) + "</details>" : "") +
          (e.criteria.length ? '<div class="xp-used">Used by ' + chipsFor(e.criteria) + "</div>" : "") + "</article>";
      }).join("") || '<p class="muted">No entries match.</p>';
    }
    var m = /^doc:([^:]+):(.+)$/.exec(page);
    if (m) {
      var doc = R.docs.filter(function (d) { return d.id === m[1]; })[0];
      var ch = doc && doc.chapters.filter(function (c) { return c.id === m[2]; })[0];
      if (ch) {
        var i = doc.chapters.indexOf(ch), prev = doc.chapters[i - 1], next = doc.chapters[i + 1];
        return '<div class="xp-kind">' + esc(doc.title) + "</div><h2>" + esc(ch.title) +
          srcBtn({ title: doc.title + ": " + ch.title, id: ch.title, p: doc.source, l: ch.l, text: "" }) + "</h2>" + srcLine({ title: doc.title + ": " + ch.title, id: ch.title, p: doc.source, l: ch.l }) +
          '<div class="doc">' + ch.html + '</div><div class="docnav">' +
          (prev ? '<a href="#ref/doc:' + doc.id + ":" + prev.id + '">‹ ' + esc(prev.title) + "</a>" : "<span></span>") +
          (next ? '<a href="#ref/doc:' + doc.id + ":" + next.id + '">' + esc(next.title) + " ›</a>" : "") + "</div>";
      }
    }
    return '<h2>Reference</h2><p>Terms, registers and documents behind the testing criteria. Hover or tap an underlined term anywhere in the scorecard to see its meaning; the full entries are here.</p>' +
      '<div class="rhome">' + NAV.map(function (n) { return '<a class="rtile" href="#ref/' + n[0] + '"><b>' + n[1] + "</b></a>"; }).join("") +
      R.docs.map(function (d) { return '<a class="rtile" href="#ref/doc:' + d.id + ":" + d.chapters[0].id + '"><b>' + esc(d.title) + "</b><span>" + d.chapters.length + " chapters</span></a>"; }).join("") + "</div>";
  }

  function viewReference(path) {
    var parts = path.split("/"), page = parts[0] || "", target = parts[1] || "";
    return '<div class="refview">' + navHtml(page) + '<section class="panel rbody" data-page="' + esc(page) + '" data-target="' + esc(target) + '">' + pageHtml(page) + "</section></div>";
  }

  function afterReference() {
    var body = document.querySelector(".rbody");
    if (!body) return;
    // link IDs inside rendered documents (terms are not linked there, to keep long text calm)
    body.querySelectorAll(".doc").forEach(function (docEl) {
      var w = document.createTreeWalker(docEl, NodeFilter.SHOW_TEXT), nodes = [], n;
      var test = new RegExp(reIds.source);
      while ((n = w.nextNode())) if (test.test(n.nodeValue)) nodes.push(n);
      nodes.forEach(function (tn) {
        var span = document.createElement("span");
        span.innerHTML = link(tn.nodeValue, null, { idsOnly: true });
        tn.parentNode.replaceChild(span, tn);
      });
    });
    var t = body.getAttribute("data-target");
    var el = t && document.getElementById(t);
    if (el) { el.classList.add("target"); el.scrollIntoView({ block: "center" }); }
  }

  document.addEventListener("input", function (e) {
    if (e.target.id !== "ref-filter") return;
    refFilter = e.target.value;
    var body = document.querySelector(".rbody");
    var pos = e.target.selectionStart;
    body.innerHTML = pageHtml(body.getAttribute("data-page"));
    var box = document.getElementById("ref-filter");
    if (box) { box.focus(); box.setSelectionRange(pos, pos); }
  });

  // ------------------------------------------------------------------ search
  function searchAll(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) return [];
    var out = [];
    var add = function (score, kind, title, sub, href) { out.push({ score: score, kind: kind, title: title, sub: sub, href: href }); };
    D.sheets.forEach(function (s) {
      s.criteria.forEach(function (c) {
        var id = c.id.toLowerCase(), t = c.title.toLowerCase();
        if (id === q) add(0, "Criterion", c.id, c.title, "#" + s.key + "/" + c.id);
        else if (id.indexOf(q) === 0) add(1, "Criterion", c.id, c.title, "#" + s.key + "/" + c.id);
        else if (t.indexOf(q) >= 0) add(3, "Criterion", c.id, c.title, "#" + s.key + "/" + c.id);
        else if ((c.sub_items || []).some(function (x) { return x.text.toLowerCase().indexOf(q) >= 0; })) add(4, "Criterion", c.id, c.title, "#" + s.key + "/" + c.id);
      });
    });
    R.glossary.forEach(function (g) {
      var t = g.term.toLowerCase();
      if (t === q || (g.keys || []).some(function (k) { return k.toLowerCase() === q; })) add(0, "Glossary", g.term, g.meaning, "#ref/glossary/" + g.id);
      else if (t.indexOf(q) === 0) add(1, "Glossary", g.term, g.meaning, "#ref/glossary/" + g.id);
      else if (t.indexOf(q) >= 0) add(2, "Glossary", g.term, g.meaning, "#ref/glossary/" + g.id);
      else if (g.meaning.toLowerCase().indexOf(q) >= 0) add(5, "Glossary", g.term, g.meaning, "#ref/glossary/" + g.id);
    });
    R.abbreviations.forEach(function (a) {
      if (a.abbreviation.toLowerCase() === q) add(0, "Abbreviation", a.abbreviation, a.stands_for, "#ref/abbreviations/" + a.id);
      else if (a.stands_for.toLowerCase().indexOf(q) >= 0) add(4, "Abbreviation", a.abbreviation, a.stands_for, "#ref/abbreviations/" + a.id);
    });
    R.registers.forEach(function (reg) {
      reg.entries.forEach(function (e) {
        var id = e.id.toLowerCase();
        if (id === q || id.indexOf(q) === 0) add(1, reg.name, e.id, e.title, "#ref/" + reg.key + "/" + e.id);
        else if (e.title.toLowerCase().indexOf(q) >= 0) add(3, reg.name, e.id, e.title, "#ref/" + reg.key + "/" + e.id);
      });
    });
    R.docs.forEach(function (d) {
      d.chapters.forEach(function (ch) {
        if (ch.title.toLowerCase().indexOf(q) >= 0) add(2, d.title, ch.title, "", "#ref/doc:" + d.id + ":" + ch.id);
        else if (ch.html.toLowerCase().indexOf(q) >= 0) add(6, d.title, ch.title, "mentions “" + q + "”", "#ref/doc:" + d.id + ":" + ch.id);
      });
    });
    return out.sort(function (a, b) { return a.score - b.score; }).slice(0, 14);
  }

  function initSearch(input, list) {
    var sel = -1, items = [];
    function render() {
      items = searchAll(input.value);
      sel = items.length ? 0 : -1;
      list.hidden = !input.value.trim() || input.value.trim().length < 2;
      list.innerHTML = items.length ? items.map(function (it, i) {
        return '<a role="option" href="' + esc(it.href) + '"' + (i === sel ? ' aria-selected="true"' : "") + '><span class="sk">' + esc(it.kind) + "</span><b>" + esc(it.title) +
          "</b><span class=\"ss\">" + esc(clip(it.sub, 110)) + "</span></a>";
      }).join("") : '<div class="none">No matches</div>';
    }
    function go(i) { if (items[i]) { location.hash = items[i].href; input.value = ""; list.hidden = true; input.blur(); } }
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (list.hidden) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        Array.prototype.forEach.call(list.querySelectorAll("a"), function (a, i) { a.setAttribute("aria-selected", i === sel); if (i === sel) a.scrollIntoView({ block: "nearest" }); });
      } else if (e.key === "Enter") { e.preventDefault(); go(sel); }
      else if (e.key === "Escape") { list.hidden = true; }
    });
    list.addEventListener("click", function (e) { if (e.target.closest("a")) { input.value = ""; list.hidden = true; } });
    document.addEventListener("click", function (e) { if (!list.contains(e.target) && e.target !== input) list.hidden = true; });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
  }

  root.Ref = {
    base: function (data) { D = data; }, src: srcBtn, critSrc: critSrc, sheetSrc: sheetSrc,
    init: init, link: link, help: help, openDrawer: openDrawer, closeDrawer: closeDrawer, counts: counts,
    viewReference: viewReference, afterReference: afterReference, initSearch: initSearch, ready: function () { return !!R; }
  };
})(this);
