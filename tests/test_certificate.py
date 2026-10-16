# SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
# SPDX-License-Identifier: GPL-3.0-or-later
"""Certificate integrity: the web scorecard and the check script must agree.

    python tests/test_certificate.py

- tool/cert.js computes the same SHA-256 as hashlib, and the same fingerprints as
  scripts/common.py (check.py uses those to guard the register of issued certificates): version 1
  (details only) and version 2 (details, FHIR release and the Level 2-4 results).
- Every entry in criteria/certificates-issued.yaml has the fingerprint of its details.
- The security emblem: its tick ring spells the fingerprint's 64 bits, its lobe count stays
  countable, and its QR code is exactly the level-L code of the verification address.
- End to end: from a built scorecard and a scored evaluation (Level 4 failing), the register entry
  the Certificate page generates parses as YAML, matches the register schema, carries the
  fingerprint check.py computes, and its validation record adds up and matches the printed results.
- When the Python package qrcode is installed (pip install qrcode), the QR matrices of tool/cert.js
  are compared module by module with it at levels L, M and Q, versions 1-10 and all eight masks.
  Otherwise that part is skipped.
Needs Node.js.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from common import CERT_FIELDS, ISSUED_FILE, RESULT_KEYS, certificate_fingerprint, load_yaml  # noqa: E402

SAMPLE = {"number": "HIE-WV-2026-0001", "issued": "2026-10-15", "expires": "2028-10-15", "vendor": "Sample  Vendor\tInc. ",
          "category": "Third-party EMR provider", "product": "Kalusugan EMR — Ñ edition", "version": "4.2.1 (build 2026.10.03)",
          "ph_core": "0.2.0", "pheref": "0.1.0", "level": "Level 3", "criteria": "v1.0.0", "signatory": "Head of KMITS",
          "signatory_name": "Name of signatory"}
SAMPLE_V2 = SAMPLE | {"fhir_release": "R4", "results": {"L2A": "100.0% PASSED", "L2B": "96.2% PASSED", "L2C": "92.3% PASSED", "L2D": "90.9% PASSED",
                                  "L3": "88.1% PASSED", "L4": "57.1% NOT PASSED"}}
HASH_TEXTS = ["", "abc", "a" * 55, "a" * 56, "a" * 64, "a" * 119, "Kagawaran ng Kalusugan ✓ ★", "x" * 1000]
QR_TEXTS = ["HI", "https://example.org/hirmes/draft/#verify/HIE-WV-2026-0001/3F9A2C7D1E5B8A60", "y" * 150, "z" * 210,
            "Ñoño ✓ " * 10] + ["q" * n for n in (11, 14, 17, 26, 32, 42, 53, 62, 78, 84, 106, 107, 122, 134, 180)]
LEVELS = ("L", "M", "Q")
EMBLEM_URL = "https://example.org/hirmes/draft/#verify/HIE-WV-2026-0001/CA24D37BBF6D53B7"

JS = r"""
const C = require(process.argv[1]); const inp = JSON.parse(process.argv[2]);
const out = { sha: inp.texts.map(t => C.sha256(t)), fp: C.fingerprint(inp.sample), fp2: C.fingerprint(inp.sample2),
  fields: C.FIELDS, resultKeys: C.RESULT_KEYS,
  incomplete: C.fingerprint(Object.assign({}, inp.sample, { version: " " })),
  incomplete2: C.fingerprint(Object.assign({}, inp.sample2, { results: Object.assign({}, inp.sample2.results, { L3: "" }) })) ||
    C.fingerprint(Object.assign({}, inp.sample2, { fhir_release: "" })), qr: {} };
out.emblem = inp.fps.map(f => {
  const p = C.rosetteParams(f), svg = C.emblemSvg(inp.url, f);
  // the code is drawn as runs of dark modules on a grid: read it back and compare with the level-L matrix
  const M = C.qrMatrix(inp.url, null, "L"), n = M.length, mod = 46 / (n + 6), x0 = 50 - 23 + 3 * mod;
  const d = (svg.match(/class="cg-qr"[^>]* d="([^"]*)"/) || ["", ""])[1], grid = M.map(r => r.map(() => 0));
  for (const m of d.matchAll(/M([\d.]+) ([\d.]+)h([\d.]+)/g)) {
    const x = Math.round((+m[1] - x0) / mod), y = Math.round((+m[2] - x0) / mod), w = Math.round(+m[3] / mod);
    for (let i = 0; i < w; i++) if (grid[y]) grid[y][x + i] = 1;
  }
  return { bits: p.bits.join(""), lobes: p.lobes, qrOk: grid.every((r, y) => r.every((v, x) => !!v === M[y][x])) };
});
for (const L of inp.levels) for (const t of inp.qr) for (let m = 0; m < 8; m++) {
  try { out.qr[L + "|" + t + "|" + m] = C.qrMatrix(t, m, L).map(r => r.map(v => v ? 1 : 0).join("")).join("/"); }
  catch (e) { /* longer than version 10 holds at this level */ }
}
console.log(JSON.stringify(out));
"""


ISSUE_JS = r"""
const [scoringJs, certJs, dataFile] = process.argv.slice(1);
const Scoring = require(scoringJs), C = require(certJs), data = JSON.parse(require("fs").readFileSync(dataFile, "utf8"));
C.init(data);
const answers = {};
for (const s of data.sheets) for (const c of s.criteria) {
  const ids = c.sub_items.length ? c.sub_items.map(x => x.id) : [c.id];
  const v = s.key === "L4" ? "Not Met" : (c.scoring === "tier" && !c.sub_items.length ? "Fully integrated" : "Met");
  for (const id of ids) answers[id] = v;
}
const result = Scoring.scoreAll(data, answers);
const profile = { certificate_no: "TEST-2026-0001", certificate_date: "2026-10-15", vendor: "Test Vendor", category: "Third-party EMR provider",
  system_name: "Test EMR", version: "1.0.0", fhir_release: "R4", ph_core: "0.2.0", pheref: "0.1.0", signatory: "Head of KMITS",
  signatory_name: "Name of signatory", evaluation_type: "Initial", test_dates: "2026-10-12 to 2026-10-14", application_no: "APP-1" };
const ctx = { profile, result, validUntil: "2028-10-15", certSection: 4 };
const rec = C.record(ctx), fp = C.fingerprint(rec);
console.log(JSON.stringify({ fp, yaml: C.yamlEntry(rec, fp, ctx) }));
"""


def end_to_end(fails: list) -> None:
    """Issue a certificate as the Certificate page does and check the register entry it gives."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from build_web import export
    with tempfile.TemporaryDirectory() as tmp:
        site = export(Path(tmp) / "site")
        r = subprocess.run(["node", "-e", ISSUE_JS, str(site / "scoring.js"), str(site / "cert.js"), str(site / "data.json")],
                           capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        fails.append("issuing a test certificate failed: " + r.stderr.strip().splitlines()[-1])
        return
    out = json.loads(r.stdout)
    entry = yaml.safe_load(out["yaml"])[0]
    schema = json.loads((ROOT / "schema" / "certificates-issued.schema.json").read_text(encoding="utf-8"))
    for e in Draft202012Validator(schema).iter_errors({"certificates": [entry]}):
        fails.append(f"generated register entry breaks the schema at {'/'.join(map(str, e.path))}: {e.message}")
    if not out["fp"] or entry.get("fingerprint") != certificate_fingerprint(entry):
        fails.append(f"generated register entry: fingerprint {entry.get('fingerprint')} but check.py computes {certificate_fingerprint(entry)}")
    sheets = (entry.get("validation") or {}).get("sheets") or {}
    for k, x in sheets.items():
        if sum(x[c] for c in ("met", "partial", "not_met", "na", "not_tested", "info")) != x["criteria"]:
            fails.append(f"validation record, sheet {k}: the counts do not add up to {x['criteria']}")
        if k in entry["results"] and entry["results"][k] != f"{x['score']} {x['status']}":
            fails.append(f"validation record, sheet {k}: {x['score']} {x['status']} differs from the printed {entry['results'][k]}")
    l4 = sheets.get("L4") or {}
    if l4.get("status") != "NOT PASSED" or not l4.get("needs_compliance"):
        fails.append("validation record: the failed Level 4 is not recorded as NOT PASSED with its criteria needing compliance")
    if (entry.get("validation") or {}).get("levels", {}).get("L4") != "NOT PASSED":
        fails.append("validation record: Level 4 status missing")


def main() -> int:
    if not shutil.which("node"):
        print("SKIP: Node.js is not installed")
        return 0
    fps = ["CA24D37BBF6D53B7", "CA24D37BBF6D53B6", "0000000000000000", "FFFFFFFFFFFFFFFF"]
    arg = json.dumps({"texts": HASH_TEXTS, "sample": SAMPLE, "sample2": SAMPLE_V2, "qr": QR_TEXTS, "levels": LEVELS,
                      "fps": fps, "url": EMBLEM_URL})
    r = subprocess.run(["node", "-e", JS, str(ROOT / "tool" / "cert.js"), arg], capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        print(r.stderr)
        return 1
    out = json.loads(r.stdout)
    fails = []
    for t, h in zip(HASH_TEXTS, out["sha"]):
        if h != hashlib.sha256(t.encode("utf-8")).hexdigest():
            fails.append(f"SHA-256 differs for {t[:20]!r}")
    if tuple(out["fields"]) != CERT_FIELDS:
        fails.append("FIELDS in tool/cert.js and CERT_FIELDS in scripts/common.py differ")
    if tuple(out["resultKeys"]) != RESULT_KEYS:
        fails.append("RESULT_KEYS in tool/cert.js and scripts/common.py differ")
    if out["fp"] != certificate_fingerprint(SAMPLE):
        fails.append(f"fingerprint differs: cert.js {out['fp']}, common.py {certificate_fingerprint(SAMPLE)}")
    if out["fp2"] != certificate_fingerprint(SAMPLE_V2):
        fails.append(f"version-2 fingerprint differs: cert.js {out['fp2']}, common.py {certificate_fingerprint(SAMPLE_V2)}")
    if out["fp2"] == out["fp"]:
        fails.append("the results do not change the fingerprint")
    if out["incomplete"] != "" or out["incomplete2"] != "":
        fails.append("cert.js gives a fingerprint to a certificate with a blank detail or result")
    for f, e in zip(fps, out["emblem"]):
        if e["bits"] != bin(int(f, 16))[2:].zfill(64):
            fails.append(f"emblem ticks of {f} do not spell its bits")
        if not 6 <= e["lobes"] <= 14:
            fails.append(f"emblem of {f} has {e['lobes']} lobes (expected 6-14)")
        if not e["qrOk"]:
            fails.append(f"emblem of {f}: the drawn QR code is not the level-L code of its address")
    for e in (load_yaml(ISSUED_FILE) or {}).get("certificates") or []:
        if e.get("fingerprint") != certificate_fingerprint(e):
            fails.append(f"register entry {e.get('number')} does not match its fingerprint")
    end_to_end(fails)

    try:
        import qrcode
        from qrcode.util import MODE_8BIT_BYTE, QRData
    except ImportError:
        print("QR comparison skipped (pip install qrcode to run it)")
    else:
        ecl = {"L": qrcode.constants.ERROR_CORRECT_L, "M": qrcode.constants.ERROR_CORRECT_M, "Q": qrcode.constants.ERROR_CORRECT_Q}
        compared = 0
        for lv in LEVELS:
            for t in QR_TEXTS:
                data = t.encode("utf-8")
                fit = qrcode.QRCode(error_correction=ecl[lv])
                fit.add_data(QRData(data, mode=MODE_8BIT_BYTE))
                fit.make(fit=True)
                mine = out["qr"].get(f"{lv}|{t}|0")
                if fit.version > 10:
                    if mine is not None:
                        fails.append(f"QR level {lv}: cert.js encoded {len(data)} bytes, which need version {fit.version}")
                    continue
                if mine is None:
                    fails.append(f"QR level {lv}: cert.js could not encode {len(data)} bytes (version {fit.version})")
                    continue
                ver = (mine.count("/") + 1 - 17) // 4
                if ver != fit.version:
                    fails.append(f"QR level {lv}, {len(data)} bytes: cert.js version {ver}, smallest possible {fit.version}")
                    continue
                for m in range(8):
                    ref = qrcode.QRCode(version=ver, error_correction=ecl[lv], border=0, mask_pattern=m)
                    ref.add_data(QRData(data, mode=MODE_8BIT_BYTE))
                    ref.make(fit=False)
                    compared += 1
                    if "/".join("".join("1" if v else "0" for v in row) for row in ref.get_matrix()) != out["qr"][f"{lv}|{t}|{m}"]:
                        fails.append(f"QR differs: level {lv}, {len(data)} bytes, version {ver}, mask {m}")
        print(f"QR: {compared} matrices at levels {', '.join(LEVELS)} compared with the qrcode package")

    for f in fails:
        print("FAIL", f)
    print(f"{len(fails)} failure(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
