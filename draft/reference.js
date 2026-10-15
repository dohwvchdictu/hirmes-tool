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
  /** ⓘ button with HTML supplied by the page (e.g. the per-sheet guide built from live scores). */
  var custom = {};
  function tip(id, html, labelText) {
    custom[id] = html;
    return '<span class="help" tabindex="0" role="button" aria-label="Help: ' + esc(labelText || id) + '" data-ref="x:' + esc(id) + '">i</span>';
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
    } else if (kind === "x") {
      h = custom[id] || "";
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
  var drawer = null, drawerFor = null, drawerTab = "dev", follow = true;
  try { follow = localStorage.getItem("guide-follow") !== "0"; } catch (x) { /* ignore */ }
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
        if (b) { drawerTab = b.getAttribute("data-dtab"); renderDrawer(drawerFor.c, drawerFor.sheet, drawerTab); }
        if (e.target.closest(".d-close")) closeDrawer();
      });
      drawer.addEventListener("change", function (e) {
        if (e.target.id === "d-follow") { follow = e.target.checked; try { localStorage.setItem("guide-follow", follow ? "1" : "0"); } catch (x) { /* ignore */ } }
      });
    }
    drawerTab = tab || drawerTab || "dev";
    renderDrawer(c, sheet, drawerTab);
    drawer.classList.add("open");
    document.body.classList.add("drawer-open");
    markCard(c.id);
  }
  /** Guide panel follows the criterion being answered (when "Follow" is ticked). */
  function guideFollow(cid) {
    if (!drawer || !drawer.classList.contains("open") || !follow || (drawerFor && drawerFor.c.id === cid)) return;
    var x = idx.crit[cid] || (idx.c[cid] && idx.crit[idx.c[cid].criterion]);
    if (x) { renderDrawer(x.c, x.sheet, drawerTab); markCard(x.c.id); }
  }
  function markCard(cid) {
    document.querySelectorAll(".crit.in-guide").forEach(function (el) { el.classList.remove("in-guide"); });
    var el = document.getElementById("card-" + cid); if (el) el.classList.add("in-guide");
  }
  function renderDrawer(c, sheet, tab) {
    drawerFor = { c: c, sheet: sheet };
    var n = counts(c);
    drawer.innerHTML = '<div class="d-head"><div><div class="xp-kind">Guide · ' + esc(sheet.tab) + " · " + esc(c.section) + '</div><h2 tabindex="-1"><a href="#' + esc(sheet.key) + "/" + esc(c.id) + '" title="Go to this criterion">' + esc(c.id) + "</a></h2></div>" +
      '<label class="d-follow" title="Show the guide of the criterion you are answering"><input type="checkbox" id="d-follow"' + (follow ? " checked" : "") + "> Follow</label>" +
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
    if (drawer) { drawer.classList.remove("open"); document.body.classList.remove("drawer-open"); markCard(""); }
  }

  // ------------------------------------------------------------------ reference pages
  // The Reference is the Technical Reference Guide: one page per chapter. Where the guide's
  // source has a "register:" marker, the structured table from registers/ is shown in place,
  // linked to the criteria. Old addresses (#ref/TB/TB-03, #ref/glossary/…) open the chapter
  // that holds that register, at the entry.
  var refFilter = "";
  var REG_LABEL = { glossary: "Glossary", abbreviations: "Abbreviations", prefixes: "ID prefixes", retired: "Retired and moved IDs",
    TB: "Technical Baseline", SRC: "Terminology & Registry Sources", TR: "FHIR Traceability", IND: "Indicator Definitions" };

  function guide() { return R.docs[0] || { chapters: [], title: "", source: "" }; }
  function chapters() { return guide().chapters.filter(function (c) { return c.num; }); }
  function chapterOf(regKey) { return chapters().filter(function (c) { return c.registers.indexOf(regKey) >= 0; })[0]; }
  /** "#ref/<path>" → {ch, target} (ch null = overview). */
  function resolve(path) {
    var parts = String(path || "").split("/"), page = parts[0] || "", target = parts[1] || "";
    var m = /^doc:[^:]+:(.+)$/.exec(page); if (m) page = m[1];
    var ch = chapters().filter(function (c) { return c.id === page; })[0];
    if (!ch && REG_LABEL[page]) { ch = chapterOf(page); if (!target) target = "reg-" + page; }
    return { ch: ch || null, target: target };
  }
  function chHref(ch, target) { return "#ref/" + ch.id + (target ? "/" + target : ""); }
  function glossSections() {
    var seen = [], out = [];
    R.glossary.forEach(function (g) { if (seen.indexOf(g.section) < 0) { seen.push(g.section); out.push({ id: "gs-" + slugify(g.section), title: g.section }); } });
    return out;
  }
  function slugify(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  /** Sections listed under a chapter: its headings, with the glossary expanded into its topics. */
  function sectionsOf(ch) {
    var out = [];
    ch.sections.forEach(function (sc) {
      if (/glossary/i.test(sc.title) && ch.registers.indexOf("glossary") >= 0) out = out.concat(glossSections());
      else out.push(sc);
    });
    return out;
  }

  /** Reference contents for the sidebar: overview, then the guide's chapters; the open chapter lists its sections. */
  function navTree(path) {
    if (!R) return "";
    var cur = path == null ? { ch: undefined } : resolve(path);
    var a = function (href, label, on, cls) { return '<a href="' + href + '"' + (on ? ' aria-current="page"' : "") + (cls ? ' class="' + cls + '"' : "") + ">" + label + "</a>"; };
    return a("#ref/", "Tool Overview", path != null && cur.ch === null) +
      chapters().map(function (ch) {
        var on = cur.ch === ch;
        return a(chHref(ch), '<span class="sd-num">' + esc(ch.num) + "</span><span>" + esc(ch.short) + "</span>", on, "sd-ch") +
          (on ? '<div class="sd-secs">' + sectionsOf(ch).map(function (sc) { return '<a href="' + chHref(ch, sc.id) + '">' + esc(sc.title) + "</a>"; }).join("") + "</div>" : "");
      }).join("");
  }
  function picker(path) {
    var cur = resolve(path);
    var opt = function (v, label, sel) { return '<option value="' + esc(v) + '"' + (sel ? " selected" : "") + ">" + esc(label) + "</option>"; };
    return '<label class="ref-picker"><span>Contents</span><select id="ref-pick">' + opt("", "Tool Overview", !cur.ch) +
      chapters().map(function (ch) {
        var o = opt(ch.id, ch.num + " · " + ch.short, cur.ch === ch && !/^(sec|gs)-/.test(cur.target));
        if (cur.ch === ch) o += sectionsOf(ch).map(function (sc) { return opt(ch.id + "/" + sc.id, "    " + sc.title, cur.target === sc.id); }).join("");
        return o;
      }).join("") + "</select></label>";
  }
  document.addEventListener("change", function (e) { if (e.target.id === "ref-pick") location.hash = "#ref/" + e.target.value; });

  function match(text) { return !refFilter || String(text).toLowerCase().indexOf(refFilter.toLowerCase()) >= 0; }

  /** The structured table of one register, as shown inside its chapter. */
  function registerBlock(key) {
    var file = (R.register_files || {})[key] || "", body = "", n = 0;
    if (key === "glossary") {
      var bySec = {};
      R.glossary.forEach(function (g) { if (match(g.term + " " + g.meaning)) { n++; (bySec[g.section] = bySec[g.section] || []).push(g); } });
      body = glossSections().filter(function (sc) { return bySec[sc.title]; }).map(function (sc) {
        return '<h3 id="' + sc.id + '">' + esc(sc.title) + '</h3><dl class="gl">' + bySec[sc.title].map(function (g) {
          return '<dt id="' + esc(g.id) + '">' + esc(g.term) + srcBtn(glossSrc(g), "hov") + "</dt><dd>" + link(g.meaning, null, { idsOnly: true }) + "</dd>";
        }).join("") + "</dl>";
      }).join("");
    } else if (key === "abbreviations") {
      var rows = R.abbreviations.filter(function (a) { return match(a.abbreviation + " " + a.stands_for); }); n = rows.length;
      body = rows.length ? '<table class="grid abbr"><tbody>' + rows.map(function (a) {
        return '<tr id="' + esc(a.id) + '"><th>' + esc(a.abbreviation) + "</th><td>" + esc(a.stands_for) + srcBtn(abbrSrc(a), "hov") + "</td></tr>";
      }).join("") + "</tbody></table>" : "";
    } else if (key === "prefixes") {
      var ps = R.prefixes.filter(function (p) { return match(p.prefix + " " + p.meaning + " " + p.where); }); n = ps.length;
      body = ps.length ? '<table class="grid"><thead><tr><th>Prefix</th><th>Meaning</th><th>Where</th></tr></thead><tbody>' + ps.map(function (p) {
        return "<tr><th>" + esc(p.prefix) + "</th><td>" + esc(p.meaning) + "</td><td>" + esc(p.where) +
          (p.src ? srcBtn({ title: "ID prefix " + p.prefix, id: p.prefix, p: p.src.p, l: p.src.l, text: p.meaning }, "hov") : "") + "</td></tr>";
      }).join("") + "</tbody></table>" : "";
    } else if (key === "retired") {
      var rs = (R.retired || []).filter(function (r) { return match(r.id + " " + r.action + " " + r.now + " " + r.reason); }); n = rs.length;
      body = rs.length ? '<table class="grid"><thead><tr><th>ID</th><th>Revision</th><th>Action</th><th>Now tested in</th><th>Reason</th></tr></thead><tbody>' + rs.map(function (r) {
        return '<tr id="' + esc(r.id) + '"><th>' + esc(r.id) + "</th><td>" + esc(r.revision) + "</td><td>" + esc(r.action) + "</td><td>" + link(r.now, null, { idsOnly: true }) +
          "</td><td>" + esc(r.reason) + (r.src ? srcBtn({ title: "Retired ID " + r.id, id: r.id, p: r.src.p, l: r.src.l, text: r.reason }, "hov") : "") + "</td></tr>";
      }).join("") + "</tbody></table>" : "";
    } else {
      var reg = R.registers.filter(function (r) { return r.key === key; })[0];
      if (reg) {
        var es = reg.entries.filter(function (e) { return match(e.id + " " + e.title + " " + e.fields.map(function (f) { return f[1]; }).join(" ")); }); n = es.length;
        body = es.map(function (e) {
          var main = e.fields.slice(0, 2), rest = e.fields.slice(2);
          var dl = function (fs) { return '<dl class="xp-dl">' + fs.map(function (f) { return "<dt>" + esc(f[0]) + "</dt><dd>" + link(f[1], null, { idsOnly: true }) + "</dd>"; }).join("") + "</dl>"; };
          return '<article class="rcard" id="' + esc(e.id) + '"><h3><span class="rid">' + esc(e.id) + "</span> " + esc(e.title) + srcBtn(regSrc(e)) + "</h3>" + dl(main) +
            (rest.length ? "<details><summary>All fields (" + e.fields.length + ")</summary>" + dl(rest) + "</details>" : "") +
            (e.criteria.length ? '<div class="xp-used">Used by ' + chipsFor(e.criteria) + "</div>" : "") + "</article>";
        }).join("");
      }
    }
    return '<section class="reg-block" id="reg-' + esc(key) + '"><div class="reg-note"><span class="reg-tag">Register</span>' +
      "<span>" + esc(REG_LABEL[key] || key) + " — kept as structured data in <code>" + esc(file) + "</code> and linked to the criteria that use it" +
      (refFilter ? " · " + n + " matching" : "") + "</span>" + editLink(file, "Edit register") + "</div>" +
      (body || '<p class="muted">No entries match “' + esc(refFilter) + '”.</p>') + "</section>";
  }

  function chapterHtml(ch) {
    var g = guide(), list = chapters(), i = list.indexOf(ch), prev = list[i - 1], next = list[i + 1];
    var srcE = { title: g.title + ": " + ch.title, id: ch.title, p: g.source, l: ch.l, text: "" };
    var html = ch.html.replace(/<!--\s*register:\s*([\w-]+)\s*-->/g, function (_, key) { return registerBlock(key); });
    var filter = ch.registers.length ? '<div class="ref-tools"><input type="search" id="ref-filter" placeholder="Filter the ' +
      esc(ch.registers.map(function (k) { return (REG_LABEL[k] || k).toLowerCase(); }).join(", ")) + '" value="' + esc(refFilter) + '"></div>' : "";
    return '<div class="xp-kind">' + esc(g.title) + " · Chapter " + esc(ch.num) + '</div><h2 class="ch-title">' + esc(ch.short) + srcBtn(srcE) + "</h2>" +
      srcLine(srcE) + filter + '<div class="doc">' + html + '</div><nav class="docnav" aria-label="Chapters">' +
      (prev ? '<a href="' + chHref(prev) + '">‹ ' + esc(prev.num + " · " + prev.short) + "</a>" : '<a href="#ref/">‹ Tool Overview</a>') +
      (next ? '<a href="' + chHref(next) + '">' + esc(next.num + " · " + next.short) + " ›</a>" : "<span></span>") + "</nav>";
  }

  function homeHtml() {
    var g = guide(), intro = g.chapters.filter(function (c) { return !c.num; })[0];
    var count = function (ch) {
      var parts = ch.registers.map(function (k) {
        var n = k === "glossary" ? R.glossary.length : k === "abbreviations" ? R.abbreviations.length : k === "prefixes" ? R.prefixes.length :
          k === "retired" ? (R.retired || []).length : ((R.registers.filter(function (r) { return r.key === k; })[0] || { entries: [] }).entries.length);
        return n + " " + ({ glossary: "terms", abbreviations: "abbreviations", prefixes: "ID prefixes", retired: "retired IDs" }[k] || "entries");
      });
      return parts.length ? parts.join(" · ") : ch.sections.length + " sections";
    };
    var quick = [["glossary", "Glossary"], ["abbreviations", "Abbreviations"], ["prefixes", "ID prefixes"], ["TB", "TB-"], ["SRC", "SRC-"], ["TR", "TR-"], ["IND", "IND-"], ["retired", "Retired IDs"]];
    return '<div class="xp-kind">Reference · ' + esc(g.title) + "</div><h2>Tool Overview</h2>" + (intro ? '<div class="doc">' + intro.html + "</div>" : "") +
      '<p class="muted">Tip: hover or tap an underlined term or ID anywhere in the scorecard to see it here without leaving the page. Press <kbd>/</kbd> to search.</p>' +
      '<div class="quick">' + quick.map(function (q) { return '<a href="#ref/' + q[0] + '">' + esc(q[1]) + "</a>"; }).join("") + "</div>" +
      '<div class="rhome">' + chapters().map(function (ch) {
        return '<a class="rtile" href="' + chHref(ch) + '"><span class="rt-num">' + esc(ch.num) + "</span><b>" + esc(ch.short) + "</b><span>" + esc(count(ch)) + "</span></a>";
      }).join("") + "</div>";
  }

  function pageHtml(path) { var r = resolve(path); return r.ch ? chapterHtml(r.ch) : homeHtml(); }

  function viewReference(path) {
    var r = resolve(path);
    return '<div class="refview">' + picker(path) + '<section class="panel rbody" data-path="' + esc(path) + '" data-target="' + esc(r.target) + '">' + pageHtml(path) + "</section></div>";
  }

  /** Link IDs inside the guide's prose (terms are not linked there, to keep long text calm). */
  function linkProse(body) {
    body.querySelectorAll(".doc").forEach(function (docEl) {
      var w = document.createTreeWalker(docEl, NodeFilter.SHOW_TEXT, { acceptNode: function (nd) { return nd.parentNode.closest(".reg-block, .xref, a, code") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
      var nodes = [], n, test = new RegExp(reIds.source);
      while ((n = w.nextNode())) if (test.test(n.nodeValue)) nodes.push(n);
      nodes.forEach(function (tn) { var span = document.createElement("span"); span.innerHTML = link(tn.nodeValue, null, { idsOnly: true }); tn.parentNode.replaceChild(span, tn); });
    });
  }
  function afterReference() {
    var body = document.querySelector(".rbody");
    if (!body) return;
    linkProse(body);
    var t = body.getAttribute("data-target");
    var el = t && document.getElementById(t);
    if (el) {
      el.classList.add("target");
      var top = document.getElementById("top"), off = (top ? top.offsetHeight : 0) + 12;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - (/^(sec|gs|reg)-/.test(t) ? off : Math.max(off, window.innerHeight / 3)));
    }
  }

  document.addEventListener("input", function (e) {
    if (e.target.id !== "ref-filter") return;
    refFilter = e.target.value;
    var body = document.querySelector(".rbody");
    var pos = e.target.selectionStart;
    body.innerHTML = pageHtml(body.getAttribute("data-path"));
    linkProse(body);
    var box = document.getElementById("ref-filter");
    if (box) { box.focus(); box.setSelectionRange(pos, pos); }
  });
  window.addEventListener("hashchange", function () { if (!/^#ref\//.test(location.hash)) refFilter = ""; });

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
        var lbl = ch.num ? "Chapter " + ch.num + " · " + ch.short : ch.title;
        if (ch.title.toLowerCase().indexOf(q) >= 0) add(2, d.title, lbl, "", "#ref/" + ch.id);
        else (ch.sections || []).some(function (sc) { if (sc.title.toLowerCase().indexOf(q) >= 0) { add(2, d.title, sc.title, lbl, "#ref/" + ch.id + "/" + sc.id); return true; } return false; }) ||
          (ch.html.replace(/<[^>]+>/g, " ").toLowerCase().indexOf(q) >= 0 && add(6, d.title, lbl, "mentions “" + q + "”", "#ref/" + ch.id));
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
    base: function (data) { D = data; }, src: srcBtn, srcLine: srcLine, tip: tip, getHelp: function (p) { return R ? getHelp(p) : null; }, critSrc: critSrc, sheetSrc: sheetSrc,
    init: init, link: link, help: help, openDrawer: openDrawer, closeDrawer: closeDrawer, counts: counts,
    viewReference: viewReference, afterReference: afterReference, navTree: navTree, guideFollow: guideFollow, guideId: function () { return drawer && drawer.classList.contains("open") && drawerFor ? drawerFor.c.id : null; }, initSearch: initSearch, ready: function () { return !!R; }
  };
})(this);
