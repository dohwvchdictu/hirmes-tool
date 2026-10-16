# SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
# SPDX-License-Identifier: GPL-3.0-or-later
"""Certificate integrity: the web scorecard and the check script must agree.

    python tests/test_certificate.py

- tool/cert.js computes the same SHA-256 as hashlib, and the same fingerprint as
  scripts/common.py (check.py uses that one to guard the register of issued certificates).
- Every entry in criteria/certificates-issued.yaml has the fingerprint of its details.
- When the Python package qrcode is installed (pip install qrcode), the QR matrices of tool/cert.js
  are compared module by module with it for versions 1-10 and all eight masks. Otherwise that part
  is skipped.
Needs Node.js.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from common import CERT_FIELDS, ISSUED_FILE, certificate_fingerprint, load_yaml  # noqa: E402

SAMPLE = {"number": "HIE-WV-2026-0001", "issued": "2026-10-15", "expires": "2028-10-15", "vendor": "Sample  Vendor\tInc. ",
          "category": "Third-party EMR provider", "product": "Kalusugan EMR — Ñ edition", "version": "4.2.1 (build 2026.10.03)",
          "ph_core": "0.2.0", "pheref": "0.1.0", "level": "Level 3", "criteria": "v1.0.0", "signatory": "Head of KMITS",
          "signatory_name": "Name of signatory"}
HASH_TEXTS = ["", "abc", "a" * 55, "a" * 56, "a" * 64, "a" * 119, "Kagawaran ng Kalusugan ✓ ★", "x" * 1000]
QR_TEXTS = ["HI", "https://example.org/hirmes/draft/#verify/HIE-WV-2026-0001/3F9A2C7D1E5B8A60", "y" * 150, "z" * 210,
            "Ñoño ✓ " * 10] + ["q" * n for n in (14, 26, 42, 62, 84, 106, 122, 180)]

JS = r"""
const C = require(process.argv[1]); const inp = JSON.parse(process.argv[2]);
const out = { sha: inp.texts.map(t => C.sha256(t)), fp: C.fingerprint(inp.sample), fields: C.FIELDS,
  incomplete: C.fingerprint(Object.assign({}, inp.sample, { version: " " })), qr: {} };
for (const t of inp.qr) for (let m = 0; m < 8; m++) out.qr[t + "\u0000" + m] = C.qrMatrix(t, m).map(r => r.map(v => v ? 1 : 0).join("")).join("/");
console.log(JSON.stringify(out));
"""


def main() -> int:
    if not shutil.which("node"):
        print("SKIP: Node.js is not installed")
        return 0
    arg = json.dumps({"texts": HASH_TEXTS, "sample": SAMPLE, "qr": QR_TEXTS})
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
    if out["fp"] != certificate_fingerprint(SAMPLE):
        fails.append(f"fingerprint differs: cert.js {out['fp']}, common.py {certificate_fingerprint(SAMPLE)}")
    if out["incomplete"] != "":
        fails.append("cert.js gives a fingerprint to a certificate with a blank detail")
    for e in (load_yaml(ISSUED_FILE) or {}).get("certificates") or []:
        if e.get("fingerprint") != certificate_fingerprint(e):
            fails.append(f"register entry {e.get('number')} does not match its fingerprint")

    try:
        import qrcode
        from qrcode.util import MODE_8BIT_BYTE, QRData
    except ImportError:
        print("QR comparison skipped (pip install qrcode to run it)")
    else:
        for t in QR_TEXTS:
            data = t.encode("utf-8")
            ver = (out["qr"][t + "\0" + "0"].count("/") + 1 - 17) // 4
            for m in range(8):
                q = qrcode.QRCode(version=ver, error_correction=qrcode.constants.ERROR_CORRECT_M, border=0, mask_pattern=m)
                q.add_data(QRData(data, mode=MODE_8BIT_BYTE))
                q.make(fit=False)
                ref = "/".join("".join("1" if v else "0" for v in row) for row in q.get_matrix())
                if ref != out["qr"][f"{t}\0{m}"]:
                    fails.append(f"QR differs: {len(data)} bytes, version {ver}, mask {m}")
            q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M)
            q.add_data(QRData(data, mode=MODE_8BIT_BYTE))
            q.make(fit=True)
            if q.version != ver:
                fails.append(f"QR version for {len(data)} bytes: cert.js {ver}, smallest possible {q.version}")
        print(f"QR: {len(QR_TEXTS) * 8} matrices compared with the qrcode package")

    for f in fails:
        print("FAIL", f)
    print(f"{len(fails)} failure(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
