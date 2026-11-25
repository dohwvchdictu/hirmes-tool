/* SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
 * SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Scoring rules of the web scorecard. They mirror the workbook formulas exactly
 * (scripts/build_xlsx.py); tests/test_scoring.py runs the same scenarios through
 * both and fails if they disagree.
 */
(function (root) {
  "use strict";

  var NT = "Not Tested";

  function answerOf(answers, id) {
    return (answers && answers[id]) || NT;
  }

  /** One criterion: mirrors workbook columns K, L, M, N, O, Q, R, S, W. */
  function scoreCriterion(c, answers, tierScores) {
    var crit = c.critical === "yes";
    var subs = c.sub_items || [];
    var r = { id: c.id, K: null, L: null, M: null, N: "", Q: 0, R: 0, S: 0, outstanding: "", needs: false, subs: [] };

    if (!subs.length) {
      r.M = answerOf(answers, c.id);
      if (r.M === "N/A") r.N = crit ? 0 : "";
      else if (r.M === NT) r.N = 0;
      else if (c.scoring === "tier") r.N = tierScores && r.M in tierScores ? tierScores[r.M] : 0;
      else if (c.scoring === "binary") r.N = r.M === "Met" ? 1 : 0;
      else r.N = 0;
      r.S = crit && r.M !== NT && r.N !== "" && r.N < 1 ? 1 : 0;
      if (r.M === "Not Met") r.outstanding = "Needs compliance";
      else if (r.M === NT) r.outstanding = "Not yet tested";
      else if (c.scoring === "tier" && r.N < 1) r.outstanding = "Integration level: " + r.M;
    } else {
      var vals = subs.map(function (s) { return answerOf(answers, s.id); });
      var na = vals.filter(function (v) { return v === "N/A"; }).length;
      var met = vals.filter(function (v) { return v === "Met"; }).length;
      var nt = vals.filter(function (v) { return v === NT; }).length;
      var notMet = [];
      subs.forEach(function (s, i) {
        r.subs.push({ id: s.id, value: vals[i] });
        if (vals[i] === "Not Met") notMet.push("(" + (i + 1) + ") " + (s.critical ? "★ " : "") + s.text);
      });
      r.K = subs.length - na;
      r.L = met;
      r.M = na === subs.length ? "N/A" : nt > 0 ? NT : "Counted";
      if (r.M === "N/A") r.N = crit ? 0 : "";
      else if (r.M === NT) r.N = 0;
      else if (r.K > 0) r.N = c.scoring === "all-or-nothing" ? (r.L >= r.K ? 1 : 0) : Math.min(r.L / r.K, 1);
      else r.N = 0;
      var subFail = subs.some(function (s, i) { return s.critical && (vals[i] === "Not Met" || vals[i] === "N/A"); });
      r.S = (crit && r.M !== NT && r.N !== "" && r.N < 1) || subFail ? 1 : 0;
      if (notMet.length) r.outstanding = notMet.length + " of " + r.K + " need compliance: " + notMet.join("; ");
      else if (nt > 0) r.outstanding = nt + " of " + subs.length + " not yet tested";
      else if (r.M !== "N/A") r.outstanding = "All compliant";
      r.notMetSubs = notMet;
    }
    r.Q = r.N === "" ? 0 : c.weight;
    r.R = r.N === "" ? 0 : c.weight * r.N;
    r.needs = c.weight > 0 && r.M !== NT && r.N !== "" && (r.N < 1 || r.S === 1);
    return r;
  }

  /** One criteria sheet: mirrors the sheet header D4..F7. */
  function scoreSheet(sheet, answers, tierScores) {
    var rows = sheet.criteria.map(function (c) { return scoreCriterion(c, answers, tierScores); });
    var sumQ = 0, sumR = 0, sumS = 0, notTested = 0, na = 0;
    rows.forEach(function (x) {
      sumQ += x.Q; sumR += x.R; sumS += x.S;
      if (x.M === NT) notTested += 1;
      if (x.M === "N/A") na += 1;
    });
    var score = sumQ === 0 ? 0 : sumR / sumQ;
    var total = rows.length;
    var status = notTested > 0 ? "INCOMPLETE" : sumS === 0 && score >= sheet.threshold - 1e-12 ? "PASSED" : "NOT PASSED";
    return {
      key: sheet.key, rows: rows, sumQ: sumQ, sumR: sumR, score: score, threshold: sheet.threshold,
      criticalNotMet: sumS, notTested: notTested, na: na, total: total,
      progress: total === 0 ? 0 : (total - notTested) / total, status: status,
      needs: rows.filter(function (x) { return x.needs; }).map(function (x) { return x.id; })
    };
  }

  /** Whole evaluation: mirrors the Summary sheet (gated level status). */
  function scoreAll(data, answers) {
    var tier = data.scoring.tier_scores;
    var bySheet = {};
    data.sheets.forEach(function (s) { bySheet[s.key] = scoreSheet(s, answers, tier); });
    var levels = [];
    var prevGated = null;
    data.scoring.levels.forEach(function (lvl, i) {
      var parts = lvl.parts.map(function (k) { return bySheet[k]; });
      var sumQ = 0, sumR = 0, notTested = 0, crit = 0, total = 0;
      parts.forEach(function (p) { sumQ += p.sumQ; sumR += p.sumR; notTested += p.notTested; crit += p.criticalNotMet; total += p.total; });
      var status;
      if (parts.length === 1) status = parts[0].status;
      else status = notTested > 0 ? "INCOMPLETE" : parts.every(function (p) { return p.status === "PASSED"; }) ? "PASSED" : "NOT PASSED";
      var gated = i === 0 ? status : prevGated !== "PASSED" ? "LOCKED" : status;
      prevGated = gated;
      levels.push({
        key: lvl.key, name: lvl.name, parts: lvl.parts, score: parts.length === 1 ? parts[0].score : (sumQ === 0 ? 0 : sumR / sumQ),
        threshold: parts.length === 1 ? parts[0].threshold : null, criticalNotMet: crit, notTested: notTested,
        progress: total === 0 ? 0 : (total - notTested) / total, status: status, gated: gated
      });
    });
    var highest = "None yet";
    for (var i = 0; i < levels.length; i++) {
      if (levels[i].gated !== "PASSED") break;
      highest = "Level " + levels[i].key.replace(/^L/, "");
    }
    var conf = levels.filter(function (l) { return l.key === data.scoring.conformant_after; })[0];
    return {
      sheets: bySheet, levels: levels, highest: highest,
      conformant: !!conf && conf.gated === "PASSED",
      criticalOpen: Object.keys(bySheet).reduce(function (a, k) { return a + bySheet[k].criticalNotMet; }, 0)
    };
  }

  var api = { scoreCriterion: scoreCriterion, scoreSheet: scoreSheet, scoreAll: scoreAll, NOT_TESTED: NT };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Scoring = api;
})(this);
