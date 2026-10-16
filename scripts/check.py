# SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
# SPDX-License-Identifier: GPL-3.0-or-later
"""Check the repository content before anything is built.

    python scripts/check.py            # human-readable report, exit 1 on errors
    python scripts/check.py --counts   # also print the Count Register

Checks: schema of every file, unique and never-reused IDs, sub-item IDs belong to their
criterion, scoring type matches sub-items, sheet order lists, retired-ID links, register
links in traces, scoring policy completeness.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

from common import (CERTIFICATE_FILE, ISSUED_FILE, ROOT, active, active_subs, certificate_fingerprint, load_criteria, load_legacy_retired,
                    load_scoring, load_sheets, load_yaml)

errors: list[str] = []
warnings: list[str] = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def validator(name):
    return Draft202012Validator(json.loads((ROOT / "schema" / name).read_text(encoding="utf-8")))


def validate(v, data, where):
    for e in sorted(v.iter_errors(data), key=lambda e: list(e.path)):
        path = "/".join(str(p) for p in e.path) or "(file)"
        err(f"{where}: {path}: {e.message}")


def register_ids(name, key):
    path = ROOT / "registers" / name
    if not path.exists():
        return set()
    return {e[key] for e in load_yaml(path).get("entries", []) if e.get(key)}


def counts(criteria_by_sheet):
    rows = {}
    for key, items in criteria_by_sheet.items():
        act = active(items)
        subs = [s for c in act for s in active_subs(c)]
        rows[key] = {
            "criteria": len(act),
            "critical_criteria": sum(1 for c in act if c["critical"] == "yes"),
            "critical_sub_items": sum(1 for s in subs if s["critical"]),
            "sub_items": len(subs),
            "info_only": sum(1 for c in act if c["weight"] == 0),
            "scored_criteria": sum(1 for c in act if c["weight"] > 0),
        }
    return rows


def check_reference(err, warn):
    """Every `see` in registers/form-help.yaml and every `terms` entry of a criterion must name a
    glossary term (or one of its aliases), an abbreviation, a register ID or a criterion ID."""
    from build_reference import build_reference  # local import: needs Markdown

    ref = build_reference()
    known = {k.lower() for g in ref["glossary"] for k in g["keys"]}
    known |= {g["term"].lower() for g in ref["glossary"]}
    known |= {a["abbreviation"].lower() for a in ref["abbreviations"]}
    known |= {e["id"].lower() for r in ref["registers"] for e in r["entries"]}
    known |= {k.lower() for k in ref["criteria"]}
    terms = [g["term"].lower() for g in ref["glossary"]]

    def ok(name: str) -> bool:
        n = name.lower()
        return n in known or any(t.startswith(n) for t in terms)

    def walk(node, path):
        if isinstance(node, dict):
            for k, v in node.items():
                if k == "see":
                    for x in v or []:
                        if not ok(str(x)):
                            err(f"registers/form-help.yaml: {path}.see '{x}' is not a glossary term, abbreviation or register ID")
                else:
                    walk(v, f"{path}.{k}" if path else str(k))
    walk(ref["help"], "")
    from build_reference import REGISTER_FILES
    used = [k for d in ref["docs"] for ch in d["chapters"] for k in ch["registers"]]
    for k in used:
        if k not in REGISTER_FILES:
            err(f"docs/reference-guide/reference-guide.md: unknown register marker '{k}' (known: {', '.join(REGISTER_FILES)})")
    for k in {k for k in used if used.count(k) > 1}:
        err(f"docs/reference-guide/reference-guide.md: register '{k}' is inserted more than once")
    for items in load_criteria().values():
        for c in active(items):
            for x in c.get("terms") or []:
                if not ok(str(x)):
                    err(f"criteria/{c['id']}: terms '{x}' is not a glossary term, abbreviation or register ID")


# System Profile keys that tool/app.js reads by name (Summary, Printed Report, file name)
PROFILE_KEYS_USED = ("application_no", "date_received", "vendor", "system_name", "version", "category", "deployment",
                     "evaluation_type", "technical_lead", "administrator", "office", "test_dates",
                     "ph_core", "pheref", "terminology", "certificate_no", "certificate_date", "valid_until", "conditions",
                     "supersedes", "signatory", "signatory_name", "signatory_designation", "certificate_orientation")


def check_certificates(profile_doc, err):
    """certificate.yaml wording, the signatory choices, and every entry of the register of issued certificates."""
    cert = load_yaml(CERTIFICATE_FILE)
    validate(validator("certificate.schema.json"), cert, "criteria/certificate.yaml")
    labels = [s.get("label") for s in cert.get("signatories") or []]
    field = next((f for s in profile_doc.get("sections") or [] for f in s.get("fields") or [] if f.get("key") == "signatory"), None)
    if field and sorted(field.get("options") or []) != sorted(labels):
        err("criteria/profile.yaml: the options of 'signatory' must be the signatory labels of criteria/certificate.yaml "
            f"({', '.join(labels)})")
    orient = next((f for s in profile_doc.get("sections") or [] for f in s.get("fields") or [] if f.get("key") == "certificate_orientation"), None)
    if orient and sorted(o.lower() for o in orient.get("options") or []) != ["landscape", "portrait"]:
        err("criteria/profile.yaml: the options of 'certificate_orientation' must be Landscape and Portrait (tool/cert.js reads them)")
    issued = load_yaml(ISSUED_FILE) or {}
    validate(validator("certificates-issued.schema.json"), issued, "criteria/certificates-issued.yaml")
    entries = issued.get("certificates") or []
    numbers = [str(e.get("number", "")) for e in entries]
    for n in sorted({n for n in numbers if numbers.count(n) > 1}):
        err(f"criteria/certificates-issued.yaml: certificate {n} is recorded more than once")
    for e in entries:
        n = e.get("number", "?")
        if not all(isinstance(e.get(k), str) for k in ("issued", "expires")):
            continue   # the schema already reported it (quote dates so YAML keeps them as text)
        if e["expires"] <= e["issued"]:
            err(f"criteria/certificates-issued.yaml: certificate {n} expires on or before its date of issuance")
        fp = certificate_fingerprint(e)
        if e.get("fingerprint") != fp:
            err(f"criteria/certificates-issued.yaml: certificate {n} has fingerprint {e.get('fingerprint')} but its details give {fp}; "
                "the details were changed after issue (issue a new certificate that supersedes it instead)")
        if e.get("supersedes") and e["supersedes"] not in numbers:
            err(f"criteria/certificates-issued.yaml: certificate {n} supersedes {e['supersedes']}, which is not in the register")
        if e.get("supersedes") == n:
            err(f"criteria/certificates-issued.yaml: certificate {n} supersedes itself")
        if e.get("status") == "revoked" and not e.get("reason"):
            err(f"criteria/certificates-issued.yaml: certificate {n} is revoked without a reason")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--counts", action="store_true", help="print the Count Register")
    args = ap.parse_args()

    # ---- schema
    sheets_doc = load_yaml(ROOT / "criteria" / "sheets.yaml")
    validate(validator("sheets.schema.json"), sheets_doc, "criteria/sheets.yaml")
    scoring = load_scoring()
    validate(validator("scoring.schema.json"), scoring, "scoring.yaml")
    legacy_doc = load_yaml(ROOT / "criteria" / "retired-legacy.yaml") or {"retired": []}
    validate(validator("retired-legacy.schema.json"), legacy_doc, "criteria/retired-legacy.yaml")
    profile_doc = load_yaml(ROOT / "criteria" / "profile.yaml")
    validate(validator("profile.schema.json"), profile_doc, "criteria/profile.yaml")
    profile_keys = []
    for s in profile_doc.get("sections") or []:
        profile_keys += [f.get("key") for f in s.get("fields") or []]
        team = s.get("team") or {}
        roles = [r.get("key") for r in team.get("roles") or []]
        profile_keys += [k + x for k in roles for x in ("", "_agency", "_designation")]
        for k in team.get("sign_off") or []:
            if k not in roles:
                err(f"criteria/profile.yaml: sign_off '{k}' is not a role of the team")
        for k in roles:
            if k not in (team.get("sign_off") or []):
                err(f"criteria/profile.yaml: role '{k}' is missing from sign_off, so it would have no row to sign")
    for k in sorted({k for k in profile_keys if profile_keys.count(k) > 1}):
        err(f"criteria/profile.yaml: key '{k}' is used more than once (a role key also uses <key>_agency and <key>_designation)")
    for k in PROFILE_KEYS_USED:
        if k not in profile_keys:
            err(f"criteria/profile.yaml: field key '{k}' is missing; the Summary, Printed Report, Certificate or team check reads it")
    check_certificates(profile_doc, err)
    reg_v = validator("register.schema.json")
    for p in sorted((ROOT / "registers").glob("*.yaml")):
        validate(reg_v, load_yaml(p), str(p.relative_to(ROOT)))

    sheets = load_sheets()
    sheet_keys = [s["key"] for s in sheets]
    crit_v = validator("criterion.schema.json")

    # files in unknown folders
    for p in (ROOT / "criteria").glob("*/*.yaml"):
        if p.parent.name not in sheet_keys:
            err(f"{p.relative_to(ROOT)}: folder '{p.parent.name}' is not a sheet in criteria/sheets.yaml")

    criteria = load_criteria()
    seen: dict[str, str] = {}

    def claim(i, where):
        if i in seen:
            err(f"{where}: ID {i} is already used in {seen[i]} (IDs are never reused)")
        else:
            seen[i] = where

    for legacy in load_legacy_retired():
        claim(legacy["id"], "criteria/retired-legacy.yaml")

    tb, src, tr = register_ids("technical-baseline.yaml", "ref"), register_ids("sources.yaml", "ref"), register_ids("traceability.yaml", "id")

    for sheet in sheets:
        key = sheet["key"]
        files = {c["id"] for c in criteria[key]}
        for i in sheet["order"]:
            if i not in files:
                err(f"criteria/sheets.yaml: sheet {key} lists {i} in 'order' but criteria/{key}/{i}.yaml does not exist")
        for i in sorted(files - set(sheet["order"])):
            warn(f"criteria/{key}/{i}.yaml is not in the 'order' list of sheet {key} in criteria/sheets.yaml; it is placed at the end")
        if key not in scoring["thresholds"]:
            err(f"scoring.yaml: no threshold for sheet {key}")
        for c in criteria[key]:
            where = c.pop("_file")
            c["_file"] = where
            data = {k: v for k, v in c.items() if not k.startswith("_")}
            validate(crit_v, data, where)
            if Path(where).stem != c.get("id"):
                err(f"{where}: file name must match id '{c.get('id')}'")
            claim(c["id"], where)
            subs = c.get("sub_items") or []
            for n, s in enumerate(subs, 1):
                claim(s["id"], where)
                if not s["id"].startswith(c["id"] + "."):
                    err(f"{where}: sub-item {s['id']} must start with {c['id']}.")
            if c.get("status", "active") != "active":
                if c.get("replaced_by") and c["replaced_by"] not in seen and not any(
                        c["replaced_by"] == x["id"] or c["replaced_by"] in [s["id"] for s in x.get("sub_items") or []]
                        for items in criteria.values() for x in items):
                    err(f"{where}: replaced_by {c['replaced_by']} does not exist")
                if not c.get("retired_in") or not c.get("reason"):
                    err(f"{where}: a {c['status']} criterion needs retired_in and reason")
                continue
            act_subs = active_subs(c)
            if c["scoring"] in ("count", "all-or-nothing") and not act_subs:
                err(f"{where}: scoring '{c['scoring']}' needs at least one active sub-item")
            if c["scoring"] in ("binary", "tier") and act_subs:
                err(f"{where}: scoring '{c['scoring']}' cannot have sub-items (use count or all-or-nothing)")
            if c["critical"] == "subs" and not any(s["critical"] for s in act_subs):
                err(f"{where}: critical is 'subs' but no sub-item is critical")
            t = c.get("traces", {})
            for x in t.get("technical_baseline", []):
                if tb and x not in tb:
                    err(f"{where}: trace {x} not found in registers/technical-baseline.yaml")
            for x in t.get("sources", []):
                if src and x not in src:
                    err(f"{where}: trace {x} not found in registers/sources.yaml")
            for x in t.get("fhir_traceability", []):
                if tr and x not in tr:
                    err(f"{where}: trace {x} not found in registers/traceability.yaml")

    for legacy in load_legacy_retired():
        r = legacy.get("replaced_by")
        if r and r not in seen:
            err(f"criteria/retired-legacy.yaml: {legacy['id']} replaced_by {r} does not exist")

    pol = scoring["policy"]
    if pol["status"] == "Approved" and not all(pol[k] for k in ("approved_by", "date_approved", "reference")):
        err("scoring.yaml: policy status is Approved but approved_by, date_approved or reference is empty")

    # tab names become Excel sheet names
    fixed = {"Instructions", "Summary", "System Profile", "Test Data", "Printed Evaluation Report"}
    tabs = [s["tab"] for s in sheets]
    for t in tabs:
        bad = sorted(set(t) & set(":\\/?*[]'"))
        if len(t) > 31 or bad or not t.strip():
            err(f"criteria/sheets.yaml: tab '{t}' is not a valid Excel sheet name "
                f"(at most 31 characters, none of : \\ / ? * [ ] ')" + (f" — found {' '.join(bad)}" if bad else f" — {len(t)} characters"))
        if t in fixed:
            err(f"criteria/sheets.yaml: tab '{t}' clashes with a fixed sheet of the workbook")
    for t in {t for t in tabs if tabs.count(t) > 1}:
        err(f"criteria/sheets.yaml: tab '{t}' is used by more than one sheet")

    level_parts = [p for lvl in scoring["levels"] for p in lvl["parts"]]
    if sorted(level_parts) != sorted(sheet_keys):
        err("scoring.yaml: levels.parts must list every sheet exactly once")

    # ---- reference layer: form help and criterion `terms` must resolve to something the web tool can link
    check_reference(err, warn)

    # ---- report
    for w in warnings:
        print(f"WARNING  {w}")
    for e in errors:
        print(f"ERROR    {e}")
    rows = counts(criteria)
    total = {k: sum(r[k] for r in rows.values()) for k in next(iter(rows.values()))}
    if args.counts or not errors:
        print("\nCount Register")
        print(f"{'Sheet':6} {'Criteria':>8} {'Critical':>8} {'★ subs':>7} {'Subs':>5} {'Info':>5} {'Scored':>6}")
        for k, r in list(rows.items()) + [("TOTAL", total)]:
            print(f"{k:6} {r['criteria']:>8} {r['critical_criteria']:>8} {r['critical_sub_items']:>7} {r['sub_items']:>5} {r['info_only']:>5} {r['scored_criteria']:>6}")
    print(f"\n{len(errors)} error(s), {len(warnings)} warning(s).")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
