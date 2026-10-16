/* SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
 * SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Certificate output: the printable certificate, its fingerprint, QR code and guilloche security
 * pattern, and the Verify page that checks a certificate against the register of issued
 * certificates (criteria/certificates-issued.yaml).
 *
 * Integrity model
 *   - The fingerprint is the first 16 hex digits of SHA-256 over the certificate's details
 *     (FIELDS below, normalised). scripts/common.py computes the same value, and check.py
 *     refuses a register entry whose fingerprint does not match its details.
 *   - The guilloche rosette and border are drawn from the fingerprint, so every certificate has
 *     its own pattern and the Verify page can redraw it for comparison with the paper.
 *   - The QR code opens the Verify page with the certificate number and fingerprint. Only
 *     certificates recorded in the register (a reviewed commit) verify as issued.
 * The fingerprint is not a signature: anyone can compute one. Authenticity comes from the register.
 */
(function (root) {
  "use strict";

  // Order matters: changing it changes every fingerprint (keep in step with scripts/common.py).
  var FIELDS = ["number", "issued", "expires", "vendor", "category", "product", "version", "ph_core", "pheref",
    "level", "criteria", "signatory", "signatory_name"];
  var FP_PREFIX = "HIE-CERT-1";

  // ------------------------------------------------------------------ SHA-256
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

  function utf8(s) { return Array.prototype.slice.call(new TextEncoder().encode(String(s))); }
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  /** SHA-256 of a string (UTF-8), as 64 lowercase hex digits. */
  function sha256(text) {
    var b = utf8(text), l = b.length;
    b.push(0x80);
    while (b.length % 64 !== 56) b.push(0);
    var hi = Math.floor(l / 0x20000000), lo = (l * 8) >>> 0;
    b.push(hi >>> 24 & 255, hi >>> 16 & 255, hi >>> 8 & 255, hi & 255, lo >>> 24 & 255, lo >>> 16 & 255, lo >>> 8 & 255, lo & 255);
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], w = [];
    for (var off = 0; off < b.length; off += 64) {
      for (var t = 0; t < 64; t++) {
        if (t < 16) w[t] = (b[off + 4 * t] << 24) | (b[off + 4 * t + 1] << 16) | (b[off + 4 * t + 2] << 8) | b[off + 4 * t + 3];
        else {
          var s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
          var s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
          w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
        }
      }
      var a = H[0], c1 = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + w[t]) | 0;
        var t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & c1) ^ (a & c) ^ (c1 & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = c1; c1 = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + c1) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (x) { return ("0000000" + (x >>> 0).toString(16)).slice(-8); }).join("");
  }

  function norm(v) { return String(v == null ? "" : v).normalize("NFC").replace(/\s+/g, " ").trim(); }
  /** An optional field typed as "N/A", "none" or "-" counts as empty. */
  function given(v) { var t = norm(v); return /^(n\/?a|none|-+|—)$/i.test(t) ? "" : t; }
  function canonical(rec) { return FP_PREFIX + "\n" + FIELDS.map(function (k) { return k + "=" + norm(rec[k]); }).join("\n"); }
  /** 16 uppercase hex digits, or "" while a detail is missing. */
  function fingerprint(rec) {
    if (FIELDS.some(function (k) { return !norm(rec[k]); })) return "";
    return sha256(canonical(rec)).slice(0, 16).toUpperCase();
  }
  function fpGroups(fp) { return fp ? fp.match(/.{4}/g).join(" ") : ""; }

  // ------------------------------------------------------------------ QR code (byte mode, level M, versions 1–10)
  // [EC codewords per block, blocks in group 1, data codewords each, blocks in group 2, data codewords each]
  var EC_M = [null, [10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0],
    [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44]];
  var ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

  function gmul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; }
    return z;
  }
  function rsDivisor(deg) {
    var r = [], root = 1, i, j;
    for (i = 0; i < deg - 1; i++) r.push(0);
    r.push(1);
    for (i = 0; i < deg; i++) {
      for (j = 0; j < r.length; j++) { r[j] = gmul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      root = gmul(root, 2);
    }
    return r;
  }
  function rsRemainder(data, div) {
    var r = div.map(function () { return 0; });
    data.forEach(function (byte) {
      var f = byte ^ r.shift();
      r.push(0);
      div.forEach(function (c, i) { r[i] ^= gmul(c, f); });
    });
    return r;
  }
  function maskBit(m, x, y) {
    switch (m) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
      case 5: return x * y % 2 + x * y % 3 === 0;
      case 6: return (x * y % 2 + x * y % 3) % 2 === 0;
      default: return ((x + y) % 2 + x * y % 3) % 2 === 0;
    }
  }
  function penalty(M, n) {
    var p = 0, dark = 0, lines = [], x, y;
    for (y = 0; y < n; y++) {
      var row = "", col = "";
      for (x = 0; x < n; x++) { row += M[y][x] ? "1" : "0"; col += M[x][y] ? "1" : "0"; if (M[y][x]) dark++; }
      lines.push(row, col);
    }
    lines.forEach(function (s) {
      (s.match(/0{5,}|1{5,}/g) || []).forEach(function (run) { p += run.length - 2; });
      ["10111010000", "00001011101"].forEach(function (pat) { for (var i = s.indexOf(pat); i >= 0; i = s.indexOf(pat, i + 1)) p += 40; });
    });
    for (y = 0; y < n - 1; y++) for (x = 0; x < n - 1; x++) {
      var v = M[y][x];
      if (v === M[y][x + 1] && v === M[y + 1][x] && v === M[y + 1][x + 1]) p += 3;
    }
    return p + 10 * Math.floor(Math.abs(dark * 100 / (n * n) - 50) / 5);
  }

  /** QR matrix for text: rows of booleans (true = dark). forceMask is for tests. */
  function qrMatrix(text, forceMask) {
    var bytes = utf8(text), ver, e, cap;
    for (ver = 1; ver <= 10; ver++) {
      e = EC_M[ver]; cap = e[1] * e[2] + e[3] * e[4];
      if (4 + (ver < 10 ? 8 : 16) + 8 * bytes.length <= cap * 8) break;
    }
    if (ver > 10) throw new Error("Text too long for the certificate QR code (" + bytes.length + " bytes)");
    var bits = [], i, j;
    var put = function (val, len) { for (var k = len - 1; k >= 0; k--) bits.push((val >>> k) & 1); };
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, cap * 8 - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xec; bits.length < cap * 8; pad ^= 0xec ^ 0x11) put(pad, 8);
    var data = [];
    for (i = 0; i < bits.length; i += 8) { var v = 0; for (j = 0; j < 8; j++) v = (v << 1) | bits[i + j]; data.push(v); }

    var div = rsDivisor(e[0]), blocks = [], ecs = [], at = 0;
    for (i = 0; i < e[1] + e[3]; i++) {
      var len = i < e[1] ? e[2] : e[4];
      blocks.push(data.slice(at, at + len)); at += len;
      ecs.push(rsRemainder(blocks[i], div));
    }
    var words = [];
    for (i = 0; i < Math.max(e[2], e[4]); i++) blocks.forEach(function (b) { if (i < b.length) words.push(b[i]); });
    for (i = 0; i < e[0]; i++) ecs.forEach(function (c) { words.push(c[i]); });

    var n = 17 + 4 * ver, M = [], F = [];
    for (i = 0; i < n; i++) { M.push(new Array(n).fill(false)); F.push(new Array(n).fill(false)); }
    var set = function (x, y, dark) { M[y][x] = dark; F[y][x] = true; };
    for (i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    [[3, 3], [n - 4, 3], [3, n - 4]].forEach(function (c) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), x = c[0] + dx, y = c[1] + dy;
        if (x >= 0 && x < n && y >= 0 && y < n) set(x, y, d !== 2 && d !== 4);
      }
    });
    var al = ALIGN[ver], last = al.length - 1;
    al.forEach(function (ay, a) {
      al.forEach(function (ax, b) {
        if ((a === 0 && b === 0) || (a === 0 && b === last) || (a === last && b === 0)) return;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      });
    });
    var drawFormat = function (G, mask) {
      var d = mask, rem = d;   // level M has format bits 00
      for (var k = 0; k < 10; k++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var fb = ((d << 10) | rem) ^ 0x5412, bit = function (k) { return ((fb >>> k) & 1) === 1; };
      var s = function (x, y, v) { G[y][x] = v; F[y][x] = true; };
      for (k = 0; k <= 5; k++) s(8, k, bit(k));
      s(8, 7, bit(6)); s(8, 8, bit(7)); s(7, 8, bit(8));
      for (k = 9; k < 15; k++) s(14 - k, 8, bit(k));
      for (k = 0; k < 8; k++) s(n - 1 - k, 8, bit(k));
      for (k = 8; k < 15; k++) s(8, n - 15 + k, bit(k));
      s(8, n - 8, true);
    };
    drawFormat(M, 0);   // reserves the format areas
    if (ver >= 7) {
      var rem = ver;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var vb = (ver << 12) | rem;
      for (i = 0; i < 18; i++) {
        var dark = ((vb >>> i) & 1) === 1, a2 = n - 11 + i % 3, b2 = Math.floor(i / 3);
        set(a2, b2, dark); set(b2, a2, dark);
      }
    }
    var bi = 0;
    for (var right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < n; vert++) {
        for (j = 0; j < 2; j++) {
          var x = right - j, y = ((right + 1) & 2) === 0 ? n - 1 - vert : vert;
          if (!F[y][x] && bi < words.length * 8) { M[y][x] = ((words[bi >>> 3] >>> (7 - (bi & 7))) & 1) === 1; bi++; }
        }
      }
    }
    var masked = function (m) {
      var G = M.map(function (r, y) { return r.map(function (v, x) { return F[y][x] ? v : v !== maskBit(m, x, y); }); });
      drawFormat(G, m);
      return G;
    };
    if (forceMask != null) return masked(forceMask);
    var best = null, bestP = Infinity;
    for (var m = 0; m < 8; m++) { var G = masked(m), pp = penalty(G, n); if (pp < bestP) { bestP = pp; best = G; } }
    return best;
  }

  /** QR code as an SVG (4-module quiet zone), dark modules drawn as horizontal runs. */
  function qrSvg(text, cls) {
    var M = qrMatrix(text), n = M.length, q = 4, d = "";
    M.forEach(function (row, y) {
      for (var x = 0; x < n; x++) {
        if (!row[x]) continue;
        var s = x; while (x + 1 < n && row[x + 1]) x++;
        d += "M" + (s + q) + " " + (y + q) + "h" + (x - s + 1) + "v1h-" + (x - s + 1) + "z";
      }
    });
    var w = n + 2 * q;
    return '<svg class="' + (cls || "") + '" viewBox="0 0 ' + w + " " + w + '" shape-rendering="crispEdges" role="img" aria-label="QR code: ' + esc(text) + '">' +
      '<rect width="' + w + '" height="' + w + '" fill="#fff"/><path fill="#000" d="' + d + '"/></svg>';
  }

  // ------------------------------------------------------------------ guilloche
  function rng(fp) {
    var s = (parseInt((fp || "0").slice(0, 8), 16) ^ parseInt((fp || "0").slice(8, 16) || "0", 16)) | 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function f2(x) { return Math.round(x * 100) / 100; }
  function poly(pts) { return "M" + pts.map(function (p) { return f2(p[0]) + " " + f2(p[1]); }).join("L") + "Z"; }

  /** Rosette of closed curves r(t) = R·(a + b·cos(n·t) + c·cos(m·n·t + φ)), each copy turned a little.
   *  depth is the share of R the curves swing over (the ring runs from R·(1 − depth) to R). */
  function rosette(cx, cy, R, rand, copies, depth) {
    var n = 9 + Math.floor(rand() * 9), m = 2 + Math.floor(rand() * 4), phi = rand() * Math.PI;
    var dp = depth || 0.45, b = dp * (0.62 + rand() * 0.1) / 2, c = dp / 2 - b, a = 1 - dp / 2;
    var steps = Math.max(360, n * m * 7), out = [];
    for (var k = 0; k < copies; k++) {
      var turn = k * 2 * Math.PI / (n * copies), pts = [];
      for (var i = 0; i < steps; i++) {
        var t = i * 2 * Math.PI / steps, r = R * (a + b * Math.cos(n * t) + c * Math.cos(m * n * t + phi));
        pts.push([cx + r * Math.cos(t + turn), cy + r * Math.sin(t + turn)]);
      }
      out.push(poly(pts));
    }
    return out.join("");
  }

  /** Interlaced waves in a straight band from (x0, y0), along a length, across a width; vertical when v. */
  function band(x0, y0, length, width, v, rand) {
    var cycles = Math.round(length / (5 + rand() * 2.5)), waves = 4, d = "", mid = width / 2, amp = width / 2 - 0.35;
    for (var k = 0; k < waves; k++) {
      [0, Math.PI].forEach(function (shift) {
        var phase = k * Math.PI / waves + shift, pts = [];
        for (var s = 0; s <= length + 0.01; s += 0.6) {
          var off = mid + amp * Math.sin(2 * Math.PI * cycles * s / length + phase);
          pts.push(v ? [x0 + off, y0 + s] : [x0 + s, y0 + off]);
        }
        d += "M" + pts.map(function (p) { return f2(p[0]) + " " + f2(p[1]); }).join("L");
      });
    }
    return d;
  }

  // A4 sheet (mm) per orientation, with the frame inset and the width of the guilloche band.
  var PAGES = { landscape: { w: 297, h: 210, o: 8, b: 5.2 }, portrait: { w: 210, h: 297, o: 8, b: 5.2 } };

  /** Frame of the certificate: rules, guilloche bands, corner rosettes, microtext, and the specimen mark. */
  function frameSvg(fp, micro, specimen, orient) {
    var P = PAGES[orient] || PAGES.landscape, rand = rng(fp || "5EC1AE05EC1AE05E"), o = P.o, b = P.b, W = P.w, H = P.h;
    var inner = o + b, L = W - 2 * inner, Hh = H - 2 * inner;
    var bands = band(inner, o, L, b, false, rand) + band(inner, H - o - b, L, b, false, rand) +
      band(o, inner, Hh, b, true, rand) + band(W - o - b, inner, Hh, b, true, rand);
    var corners = [[o + b / 2, o + b / 2], [W - o - b / 2, o + b / 2], [o + b / 2, H - o - b / 2], [W - o - b / 2, H - o - b / 2]]
      .map(function (c) { return rosette(c[0], c[1], b * 0.6, rand, 3, 0.5); }).join("");
    var mt = String(micro || "").trim() + " · ", line = "";
    while (line.length < Math.round((W - 2 * (o + b)) * 2.04)) line += mt;   // about two characters per mm
    var text = function (y) {
      return '<text x="' + (inner + 1) + '" y="' + y + '" textLength="' + (L - 2) + '" lengthAdjust="spacingAndGlyphs" class="cg-micro">' + esc(line) + "</text>";
    };
    return '<svg class="cert-frame" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">' +
      '<rect class="cg-rule" x="' + (o - 1.2) + '" y="' + (o - 1.2) + '" width="' + (W - 2 * o + 2.4) + '" height="' + (H - 2 * o + 2.4) + '"/>' +
      '<rect class="cg-hair" x="' + o + '" y="' + o + '" width="' + (W - 2 * o) + '" height="' + (H - 2 * o) + '"/>' +
      '<rect class="cg-hair" x="' + inner + '" y="' + inner + '" width="' + L + '" height="' + Hh + '"/>' +
      '<path class="cg-band" d="' + bands + '"/><path class="cg-corner" d="' + corners + '"/>' +
      text(inner + 2.1) + text(H - inner - 1.1) +
      (specimen ? '<text class="cg-specimen" x="' + W / 2 + '" y="' + (H / 2 + 7) + '" transform="rotate(' + (W > H ? -18 : -54) + " " + W / 2 + " " + H / 2 + ')"' +
        (W > H ? "" : ' style="font-size:19px"') + ">SPECIMEN — NOT VALID</text>" : "") +
      "</svg>";
  }
  /** The certificate's own security rosette; the Verify page redraws it from the fingerprint. */
  function rosetteSvg(fp, cls) {
    var rand = rng(fp || "5EC1AE05EC1AE05E");
    return '<svg class="' + (cls || "ce-rosette") + '" viewBox="0 0 60 60" aria-hidden="true">' +
      '<path class="cg-ros1" d="' + rosette(30, 30, 29, rand, 9, 0.42) + '"/>' +
      '<path class="cg-ros2" d="' + rosette(30, 30, 16, rand, 4, 0.5) + '"/>' +
      '<circle class="cg-hair" cx="30" cy="30" r="6.4"/></svg>';
  }

  // ------------------------------------------------------------------ helpers
  var D = null;
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function isoDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || "")); }
  /** "2026-10-15" -> "15 October 2026"; other text unchanged. */
  function longDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    return m ? +m[3] + " " + MONTHS[+m[2] - 1] + " " + m[1] : String(s || "");
  }
  function today() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  function C() { return D.certificate; }
  /** "landscape" or "portrait": the System Profile's choice, else the default in certificate.yaml. */
  function orientation(p) {
    var v = String((p && p.certificate_orientation) || C().orientation || "landscape").toLowerCase();
    return v === "portrait" ? "portrait" : "landscape";
  }
  /** The proof-of-concept notice from certificate.yaml (blank once the feature is adopted). */
  function notice(where) {
    var n = norm(C().notice);
    return n ? '<p class="ce-poc' + (where ? " " + where : "") + '" role="note"><b>Proof of concept.</b> ' + esc(n.replace(/^Proof of concept[.:]\s*/i, "")) + "</p>" : "";
  }
  function signatoryOf(role) { return (C().signatories || []).filter(function (s) { return s.label === role; })[0] || null; }

  /** Address the QR code opens. The register grows on the default branch, so a published page
   *  points at the draft (main) build; certificate.yaml verify.url overrides it. */
  function verifyBase() {
    var v = (C().verify || {}).url;
    if (v) return v.replace(/#.*$/, "");
    if (typeof location === "undefined") return "";
    if (D.meta.home) { try { return new URL(D.meta.home + "draft/", location.href).href; } catch (e) { /* old browser */ } }
    return location.href.replace(/[?#].*$/, "");
  }
  function verifyUrl(no, fp) { return verifyBase() + "#verify/" + encodeURIComponent(no) + "/" + fp; }

  /** Register entry for a certificate number, with its derived status. */
  function lookup(no) {
    var list = D.issued || [], e = list.filter(function (x) { return norm(x.number) === norm(no); })[0];
    if (!e) return null;
    var by = list.filter(function (x) { return norm(x.supersedes) === norm(e.number); })[0];
    var status = e.status || "valid";
    if (status === "valid" && by) status = "superseded";
    if (status === "valid" && isoDate(e.expires) && e.expires < today()) status = "expired";
    return { entry: e, status: status, by: by || null, fp: fingerprint(e) };
  }

  // ------------------------------------------------------------------ certificate page
  /** The details printed on the certificate, from the System Profile and the result. */
  function record(ctx) {
    var p = ctx.profile;
    return { number: p.certificate_no, issued: p.certificate_date, expires: ctx.validUntil, vendor: p.vendor, category: p.category,
      product: p.system_name, version: p.version, ph_core: p.ph_core, pheref: p.pheref, level: ctx.result.highest,
      criteria: D.meta.version, signatory: p.signatory, signatory_name: p.signatory_name };
  }

  /** What stands between this page and a valid certificate; any open item prints the specimen mark. */
  function checks(ctx, rec) {
    var p = ctx.profile, r = ctx.result, pol = D.scoring.policy;
    var missing = [["certificate_no", "Certificate no."], ["certificate_date", "Date of issuance"], ["vendor", "Vendor / developer"],
      ["category", "Applicant category"], ["system_name", "Product name"], ["version", "Version / build"], ["ph_core", "PH Core IG version"],
      ["pheref", "PHeReF IG version"], ["signatory", "Signatory"], ["signatory_name", "Signatory's name"]]
      .filter(function (f) { return !norm(p[f[0]]); }).map(function (f) { return f[1]; });
    var dates = isoDate(rec.issued) && isoDate(rec.expires) && rec.expires > rec.issued;
    return [
      { ok: !missing.length, text: missing.length ? "Details missing: " + missing.join(", ") + "." : "All certificate details are filled in.", fix: "#profile" },
      { ok: dates, text: dates ? "Valid " + longDate(rec.issued) + " to " + longDate(rec.expires) + "." : "Date of issuance and expiry must be dates, with the expiry after the issuance.", fix: "#profile" },
      { ok: r.conformant, text: r.conformant ? "Levels 0–3 passed with no critical item open." : "Not yet conformant: Levels 0–3 must pass with no critical item open (highest level: " + r.highest + ").", fix: "#summary" },
      { ok: pol.status === "Approved", text: pol.status === "Approved" ? "Pass thresholds approved (" + pol.reference + ")." : "Pass thresholds are PROPOSED; a certificate needs approved thresholds (scoring.yaml)." },
      { ok: !!D.meta.is_release, text: D.meta.is_release ? "Criteria " + D.meta.version + " is a released version." : "This page is built from " + D.meta.label + ", not a released version of the criteria." }
    ];
  }

  function blank(v, what) { return norm(v) ? esc(v) : '<span class="ce-blank">[' + esc(what) + "]</span>"; }

  function paper(ctx, rec, fp, specimen) {
    var c = C(), p = ctx.profile, sig = signatoryOf(p.signatory) || {};
    var office = norm(p.office);
    var seal = c.seal_url ? '<img class="ce-seal" src="' + esc(c.seal_url) + '" alt="Seal of the Department of Health">' : "";
    var url = fp ? verifyUrl(rec.number, fp) : "";
    var qr = url ? qrSvg(url, "ce-qr") : '<div class="ce-qr ce-qr-none">QR code appears when every detail is filled in</div>';
    var sup = given(p.supersedes) ? " · Supersedes certificate no. " + esc(given(p.supersedes)) : "";
    var fill = function (t) {
      return esc(t).replace(/\{level\}/g, esc(rec.level)).replace(/\{criteria\}/g, esc(rec.criteria));
    };
    var cond = given(p.conditions) ? '<p class="ce-cond"><b>Conditions:</b> ' + esc(p.conditions) + "</p>" : "";
    var orient = orientation(p), poc = norm(c.notice) ? "PROOF OF CONCEPT — NOT AN OFFICIAL DOH CERTIFICATE · " : "";
    return '<div class="cert-wrap" id="cert-wrap"><article class="cert ' + orient + '" id="cert" aria-label="Certificate">' +
      frameSvg(fp, c.microtext + (norm(rec.number) ? " · " + norm(rec.number) : ""), specimen, orient) +
      '<div class="cert-body">' +
      '<header class="ce-head"><div class="ce-mark">' + seal + '<div class="ce-word"><span>Republic of the Philippines</span><b>Department of Health</b>' +
        (office ? "<span>" + esc(office) + "</span>" : "") + "</div></div>" +
        '<dl class="ce-no"><dt>Certificate no.</dt><dd class="ce-num">' + blank(rec.number, "Certificate no.") + "</dd>" +
        "<dt>Date of issuance</dt><dd>" + blank(longDate(rec.issued), "Date of issuance") + "</dd></dl></header>" +
      '<div class="ce-title"><h1>' + esc(c.title) + "</h1><p>" + esc(c.subtitle) + "</p></div>" +
      '<p class="ce-lead">' + esc(c.certifies) + '</p><p class="ce-product">' + blank(rec.product, "Product name") + "</p>" +
      '<p class="ce-build">Version / build <b>' + blank(rec.version, "Version / build") + "</b></p>" +
      '<p class="ce-statement">' + fill(c.statement) + "</p>" +
      '<dl class="ce-facts">' +
        "<div><dt>Vendor / developer</dt><dd><b>" + blank(rec.vendor, "Vendor / developer") + "</b><span>" + blank(rec.category, "Applicant category") + "</span></dd></div>" +
        "<div><dt>Product validated</dt><dd><b>" + blank(rec.product, "Product name") + "</b><span>Version / build " + blank(rec.version, "Version / build") + "</span></dd></div>" +
        "<div><dt>Validated against</dt><dd><b>PH Core IG " + blank(rec.ph_core, "version") + "</b><span>PHeReF IG " + blank(rec.pheref, "version") + "</span></dd></div>" +
        "<div><dt>Validity</dt><dd><b>Until " + blank(longDate(rec.expires), "Expiry date") + "</b><span>from " + blank(longDate(rec.issued), "Date of issuance") + "</span></dd></div>" +
      "</dl>" + cond +
      '<footer class="ce-foot">' +
        '<div class="ce-verify">' + qr + '<div><b>Verify this certificate</b><span>' + esc((c.verify || {}).note || "") + "</span>" +
          '<span class="ce-fpl">Fingerprint</span><code class="ce-fp">' + (fp ? fpGroups(fp) : "—") + "</code></div></div>" +
        '<div class="ce-ros">' + rosetteSvg(fp) + "</div>" +
        '<div class="ce-sign"><div class="ce-sigline"></div><b>' + blank(p.signatory_name, "Name of signatory") + "</b>" +
          "<span>" + (norm(p.signatory_designation) ? esc(p.signatory_designation) : esc(sig.designation || "")) + "</span>" +
          "<span>" + esc(sig.office === "conducting office" ? office : sig.office || "") + "</span></div>" +
      "</footer>" +
      '<p class="ce-validity">' + esc(c.validity_note) + "</p>" +
      '<p class="ce-trace">' + poc + "Testing criteria " + esc(rec.criteria) + " · commit " + esc(D.meta.commit) + " · level achieved " + esc(rec.level) + sup + "</p>" +
      "</div></article></div>";
  }

  function yamlEntry(rec, fp, p) {
    var q = function (v) { return '"' + norm(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"'; };
    var lines = ["- number: " + q(rec.number)];
    FIELDS.slice(1).forEach(function (k) { lines.push("  " + k + ": " + q(rec[k])); });
    lines.push("  fingerprint: " + q(fp), "  status: valid");
    if (given(p.supersedes)) lines.push("  supersedes: " + q(given(p.supersedes)));
    return lines.join("\n");
  }
  function issueUrl(title, body) {
    var repo = D.meta.repository;
    return repo ? repo + "/issues/new?template=certificate-record.yml&title=" + encodeURIComponent(title) + "&details=" + encodeURIComponent(body) : "";
  }
  function registerSrc(e) {
    var s = D.issued_src;
    if (!s) return null;
    if (!e) return { title: "Register of issued certificates", p: s.p, l: s.l, text: "" };
    return { title: "Certificate " + e.number, id: e.number, p: s.p, l: e.src_l, text: "",
      rows: [{ label: "Status", l: e.src_status, text: e.status || "valid" }] };
  }

  /** Where this certificate stands in the register, and how to record it when it is not there yet. */
  function registerPanel(rec, fp, p) {
    if (!fp) return '<p class="ce-reg-msg">The fingerprint and QR code appear when every detail is filled in. The certificate can then be recorded in the register.</p>';
    var hit = lookup(rec.number), file = (D.issued_src || {}).p || "criteria/certificates-issued.yaml";
    if (hit && hit.entry.fingerprint === fp) {
      return '<p class="ce-reg-msg ok">Recorded in the register (<code>' + esc(file) + "</code>): status <b>" + esc(hit.status) + "</b>" +
        (hit.by ? ", superseded by " + esc(hit.by.number) : "") + ". The QR code verifies." + Ref.src(registerSrc(hit.entry)) + "</p>";
    }
    if (hit) {
      return '<p class="ce-reg-msg bad">The register already holds certificate ' + esc(rec.number) + " with different details (fingerprint " + esc(fpGroups(hit.entry.fingerprint)) +
        "). A certificate printed from this page would fail verification. Correct the details, or issue a new number that supersedes it." + Ref.src(registerSrc(hit.entry)) + "</p>";
    }
    var y = yamlEntry(rec, fp, p), edit = Ref.editUrl && Ref.editUrl(file), iss = issueUrl("Record certificate " + norm(rec.number), y);
    return '<p class="ce-reg-msg">Not in the register yet, so the QR code will answer “not found”. Once the signatory approves, add this entry to <code>' + esc(file) + "</code> (one commit):</p>" +
      '<pre class="ce-yaml" id="ce-yaml">' + esc(y) + "</pre>" +
      '<div class="ce-acts"><button type="button" data-copy="ce-yaml">Copy entry</button>' +
      (edit ? '<a class="button" href="' + esc(edit) + '" target="_blank" rel="noopener">✎ Add it on GitHub</a>' : "") +
      (iss ? '<a class="button" href="' + esc(iss) + '" target="_blank" rel="noopener">✉ Ask the administrator to record it</a>' : "") + "</div>";
  }

  function certSrc() {
    var c = C(), s = c.src;
    var rows = [["title", "Title"], ["subtitle", "Subtitle"], ["certifies", "Opening line"], ["statement", "Statement"], ["validity_note", "Validity note"],
      ["microtext", "Microtext"], ["signatories", "Signatories"], ["verify", "Verification"], ["seal", "Seal file"]]
      .filter(function (f) { return s.f[f[0]]; }).map(function (f) { return { label: f[1], l: s.f[f[0]], text: typeof c[f[0]] === "string" ? c[f[0]] : "" }; });
    return { title: "Certificate wording", id: "certificate", p: s.p, l: s.l, text: c.title, rows: rows };
  }

  function view(ctx) {
    var rec = record(ctx), fp = fingerprint(rec), list = checks(ctx, rec);
    var open = list.filter(function (x) { return !x.ok; }).length, specimen = open > 0;
    var url = fp ? verifyUrl(rec.number, fp) : "";
    var orient = orientation(ctx.profile), opt = function (v, label) { return "<option value=\"" + label + "\"" + (orient === v ? " selected" : "") + ">" + label + "</option>"; };
    return '<section class="panel ce-panel noprint"><h2>Certificate' + Ref.src(certSrc()) + "</h2>" + notice() +
      '<p class="intro">Printed on one A4 page from the System Profile (section ' + ctx.certSection + ") and the result. Wording, signatories and the verification address come from <code>" +
      esc(C().src.p) + "</code>; issued certificates are recorded in <code>" + esc((D.issued_src || {}).p || "") + "</code>.</p>" +
      '<div class="ce-grid"><div><h3>' + (specimen ? "Prints as a specimen: " + open + " item" + (open === 1 ? "" : "s") + " open" : "Ready to issue") + "</h3>" +
      '<ul class="ce-checks">' + list.map(function (x) {
        return '<li class="' + (x.ok ? "ok" : "no") + '"><span aria-hidden="true">' + (x.ok ? "✓" : "✗") + "</span> " + esc(x.text) +
          (!x.ok && x.fix ? ' <a href="' + x.fix + '">Fix</a>' : "") + "</li>";
      }).join("") + "</ul>" +
      '<div class="ce-acts"><label class="ce-orient">Orientation <select data-profile="certificate_orientation" aria-label="Certificate orientation">' +
        opt("landscape", "Landscape") + opt("portrait", "Portrait") + "</select></label>" +
      '<button type="button" id="btn-print-cert" class="primary">Print / save as PDF</button>' +
      (url ? '<button type="button" data-copy-text="' + esc(url) + '">Copy verification link</button><a class="button" href="' + esc(url) + '" target="_blank" rel="noopener">Open verification page</a>' : "") +
      "</div></div>" +
      "<div><h3>Register of issued certificates</h3>" + registerPanel(rec, fp, ctx.profile) + "</div></div>" +
      (C().seal_url ? "" : '<p class="ce-reg-msg">No seal file in this build: the letterhead prints the agency name only. Add the official DOH seal at <code>tool/' + esc(C().seal || "img/doh-seal.png") +
        "</code> (full colour or grayscale, as the DOH Brand Book allows) to print it.</p>") +
      '<p class="ce-reg-msg bad" id="ce-fit" hidden>The details are too long to fit on the page even at the smallest text size: shorten the product name, the conditions or the designation.</p>' +
      "</section>" + paper(ctx, rec, fp, specimen);
  }

  /** Long details (a long product name, several lines of conditions) must stay on the one page:
   *  first close up the spacing, then shrink the title and product name, then all the text, a little
   *  at a time. The sheet's size is fixed, so its overflow is measured the same on screen and in print. */
  function shrink(cert) {
    var body = cert.querySelector(".cert-body"), ks = 1, kp = 1, k = 1;
    var set = function () { cert.style.setProperty("--ks", ks.toFixed(2)); cert.style.setProperty("--kp", kp.toFixed(2)); cert.style.setProperty("--k", k.toFixed(2)); };
    var over = function () { return body.scrollHeight > body.clientHeight + 1 || body.scrollWidth > body.clientWidth + 1; };
    set();
    while (over() && ks > 0.25) { ks -= 0.075; set(); }
    while (over() && kp > 0.63) { kp -= 0.04; set(); }
    while (over() && k > 0.66) { k -= 0.03; set(); }
    var msg = document.getElementById("ce-fit");
    if (msg) msg.hidden = !over();
  }

  /** Fit long details on the page, then scale the A4 sheet to the screen width; printing resets the scale (style.css). */
  function fit() {
    var wrap = typeof document !== "undefined" && document.getElementById("cert-wrap"), cert = wrap && document.getElementById("cert");
    if (!cert) return;
    cert.style.transform = "";
    shrink(cert);
    var s = Math.min(1, wrap.clientWidth / cert.offsetWidth);
    cert.style.transform = "scale(" + s + ")";
    wrap.style.height = cert.offsetHeight * s + "px";
  }

  // ------------------------------------------------------------------ verify page
  var STATUS = {
    valid: ["ok", "Valid", "Recorded in the register and within its validity period."],
    expired: ["warn", "Expired", "Recorded in the register, but the validity period has ended."],
    superseded: ["warn", "Superseded", "Replaced by a later certificate."],
    revoked: ["bad", "Revoked", "Withdrawn by the DOH. It must not be relied on."]
  };

  function viewVerify(rest) {
    var i = rest.lastIndexOf("/"), no = i >= 0 ? rest.slice(0, i) : rest, fp = i >= 0 ? rest.slice(i + 1).replace(/[\s-]/g, "").toUpperCase() : "";
    var form = '<form class="ce-vform" id="verify-form"><label>Certificate no.<input id="v-no" value="' + esc(no) + '" autocomplete="off" required></label>' +
      '<label>Fingerprint <span class="muted">(16 characters, printed under the QR code)</span><input id="v-fp" value="' + esc(fpGroups(fp) || fp) + '" autocomplete="off" spellcheck="false"></label>' +
      '<button type="submit" class="primary">Verify</button></form>';
    var reg = D.issued_src ? " The register on this page is <code>" + esc(D.issued_src.p) + "</code> at commit " + esc(D.meta.commit) + "." : "";
    var head = '<section class="panel"><h2>Verify a certificate' + Ref.src(registerSrc(null)) + "</h2>" +
      notice() + '<p class="intro">Scan the QR code on a certificate, or type its number and fingerprint. The answer comes from the DOH register of issued certificates; ' +
      "compare every detail below with the paper, since a difference means the paper was altered." + reg + "</p>" + form + "</section>";
    if (!no) return head;
    var hit = lookup(no), out;
    if (!hit) {
      out = '<div class="ce-verdict bad"><b>Not found</b><span>No certificate numbered ' + esc(no) + " is recorded in this register. It may have been issued after commit " +
        esc(D.meta.commit) + ", or it may not be genuine. Ask the issuing DOH office to confirm.</span></div>";
    } else {
      var e = hit.entry, st = STATUS[hit.status] || STATUS.valid;
      var fpOk = !fp || fp === e.fingerprint, regOk = hit.fp === e.fingerprint;
      var verdict = !regOk ? ["bad", "Register entry inconsistent", "The details recorded for this certificate do not match its fingerprint. Report this to the register maintainers."]
        : !fpOk ? ["bad", "Fingerprint does not match", "The fingerprint entered (" + fpGroups(fp) + ") is not the one recorded (" + fpGroups(e.fingerprint) + "). The paper or the QR code was altered, or the fingerprint was mistyped."]
        : st;
      var row = function (k, v) { return "<tr><th>" + esc(k) + "</th><td>" + v + "</td></tr>"; };
      var why = verdict === STATUS.superseded && hit.by ? "Replaced by certificate " + hit.by.number + ", issued " + longDate(hit.by.issued) + "." : verdict[2];
      out = '<div class="ce-verdict ' + verdict[0] + '"><b>' + esc(verdict[1]) + "</b><span>" + esc(why) +
        (e.reason ? " Reason: " + esc(e.reason) : "") + "</span></div>" +
        '<div class="ce-vgrid"><table class="ce-vtab"><tbody>' +
        row("Certificate no.", "<b>" + esc(e.number) + "</b>") + row("Date of issuance", esc(longDate(e.issued))) + row("Valid until", esc(longDate(e.expires))) +
        row("Vendor / developer", esc(e.vendor)) + row("Applicant category", esc(e.category)) + row("Product", "<b>" + esc(e.product) + "</b>") +
        row("Version / build", "<b>" + esc(e.version) + "</b>") + row("Validated against", "PH Core IG " + esc(e.ph_core) + " · PHeReF IG " + esc(e.pheref)) +
        row("Level achieved", esc(e.level)) + row("Testing criteria", esc(e.criteria)) + row("Signed by", esc(e.signatory_name) + " — " + esc(e.signatory)) +
        (e.supersedes ? row("Supersedes", esc(e.supersedes)) : "") + row("Fingerprint", "<code>" + esc(fpGroups(e.fingerprint)) + "</code>") +
        "</tbody></table>" +
        '<figure class="ce-vros">' + rosetteSvg(e.fingerprint, "ce-rosette big") + "<figcaption>The security rosette printed on this certificate must match this one, line for line.</figcaption></figure></div>" +
        (function (btn) { return btn ? '<p class="muted">Register entry ' + btn + "</p>" : ""; })(Ref.src(registerSrc(e)));
    }
    return head + '<section class="panel">' + out + "</section>";
  }

  var api = {
    FIELDS: FIELDS, sha256: sha256, canonical: canonical, fingerprint: fingerprint, qrMatrix: qrMatrix, qrSvg: qrSvg,
    init: function (data) { D = data; }, record: record, orientation: function (p) { return orientation(p); }, view: view, viewVerify: viewVerify, fit: fit, lookup: lookup
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Cert = api;
})(this);
