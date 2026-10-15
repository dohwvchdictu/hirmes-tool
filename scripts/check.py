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

from common import ROOT, active, active_subs, load_criteria, load_legacy_retired, load_scoring, load_sheets, load_yaml

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
    for items in load_criteria().values():
        for c in active(items):
            for x in c.get("terms") or []:
                if not ok(str(x)):
                    err(f"criteria/{c['id']}: terms '{x}' is not a glossary term, abbreviation or register ID")


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
