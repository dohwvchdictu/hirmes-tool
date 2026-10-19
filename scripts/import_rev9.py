# SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
# SPDX-License-Identifier: GPL-3.0-or-later
"""One-time import of the legacy Rev 9 workbook (and Technical Reference Guide registers).

Usage:
    python scripts/import_rev9.py --workbook path/to/rev9.xlsx [--guide path/to/reference-guide.docx]

Writes criteria/<sheet>/<ID>.yaml, criteria/sheets.yaml, criteria/retired-legacy.yaml,
scoring.yaml and registers/*.yaml. Run once to seed the repository; afterwards the YAML
files are the source of truth and this script is kept only for reference.
"""
from __future__ import annotations

import argparse
import re
import warnings
from pathlib import Path

import openpyxl

from common import (CRITERIA_DIR, CRITICAL_FROM_XLSX, REGISTERS_DIR, ROOT, SCORING_FROM_XLSX, SCORING_FILE,
                    dump_yaml)

warnings.filterwarnings("ignore")

# key, workbook tab, folder, summary row (for thresholds), printed-report heading row label
SHEETS = [
    ("L0", "L0 Application", 7),
    ("L1", "L1 Documentation", 8),
    ("L2A", "L2-TS0 Terminology", 10),
    ("L2B", "L2-TS1 Submission", 11),
    ("L2C", "L2-TS2 Retrieval", 12),
    ("L2D", "L2-Security", 13),
    ("L3", "L3 Reports", 14),
    ("L4", "L4 Advanced", 15),
]
FIRST_ROW = 10


def text(v):
    if v is None:
        return None
    s = str(v).replace("\r\n", "\n").strip()
    return s or None


def import_workbook(path: Path):
    wb = openpyxl.load_workbook(path)
    summary = wb["Summary"]
    report = wb["Printed Evaluation Report"]
    report_headings = {}
    for r in range(1, report.max_row + 1):
        v = report.cell(r, 1).value
        if isinstance(v, str) and v.startswith("LEVEL "):
            report_headings[len(report_headings)] = v

    sheets_meta = []
    thresholds = {}
    total = 0
    for idx, (key, tab, srow) in enumerate(SHEETS):
        ws = wb[tab]
        order = []
        current = None
        folder = CRITERIA_DIR / key
        folder.mkdir(parents=True, exist_ok=True)
        criteria = []
        for r in range(FIRST_ROW, ws.max_row + 1):
            row_type = ws.cell(r, 20).value
            rid = text(ws.cell(r, 1).value)
            if not rid:
                continue
            if row_type == "Criterion":
                current = {
                    "id": rid,
                    "status": "active",
                    "section": text(ws.cell(r, 2).value),
                    "title": text(ws.cell(r, 3).value),
                    "critical": CRITICAL_FROM_XLSX[ws.cell(r, 8).value],
                    "weight": ws.cell(r, 9).value,
                    "scoring": SCORING_FROM_XLSX[ws.cell(r, 10).value],
                    "validation_role": text(ws.cell(r, 7).value),
                    "evidence": text(ws.cell(r, 6).value),
                    "developer_guide": text(ws.cell(r, 4).value),
                    "validator_guide": text(ws.cell(r, 5).value),
                }
                criteria.append(current)
                order.append(rid)
            elif row_type == "Sub":
                sub = {"id": rid, "text": text(ws.cell(r, 3).value), "critical": ws.cell(r, 8).value == "Yes"}
                current.setdefault("sub_items", []).append(sub)
        for c in criteria:
            c["traces"] = {"fhir_traceability": [], "technical_baseline": [], "sources": [], "ig_requirements": []}
            dump_yaml(c, folder / f"{c['id']}.yaml")
        total += len(criteria)
        thresholds[key] = summary.cell(srow, 4).value
        sheets_meta.append({
            "key": key,
            "tab": tab,
            "title": text(ws["A1"].value),
            "intro": text(ws["A2"].value),
            "note": text(ws["G4"].value),
            "report_heading": report_headings.get(idx),
            "order": order,
        })

    dump_yaml({"sheets": sheets_meta}, CRITERIA_DIR / "sheets.yaml")

    # Legacy retired / moved IDs (Summary table)
    retired = []
    r = 43
    while summary.cell(r, 2).value:
        retired.append({
            "id": text(summary.cell(r, 2).value),
            "legacy_revision": text(summary.cell(r, 3).value),
            "action": text(summary.cell(r, 4).value),
            "replaced_by": None if text(summary.cell(r, 5).value) in (None, "—") else text(summary.cell(r, 5).value),
            "reason": text(summary.cell(r, 6).value),
        })
        r += 1
    dump_yaml({"retired": retired}, CRITERIA_DIR / "retired-legacy.yaml")

    scoring = {
        "policy": {
            "status": text(summary["C23"].value) or "Proposed",
            "approved_by": text(summary["C24"].value) or "",
            "date_approved": text(summary["C25"].value) or "",
            "reference": text(summary["C26"].value) or "",
        },
        "thresholds": thresholds,
        "levels": [
            {"key": "L0", "name": "Level 0 — Application & Commitment", "parts": ["L0"]},
            {"key": "L1", "name": "Level 1 — Product Documentation", "parts": ["L1"]},
            {"key": "L2", "name": "Level 2 — Interoperability Testing (all parts)", "parts": ["L2A", "L2B", "L2C", "L2D"]},
            {"key": "L3", "name": "Level 3 — Reports & Dashboard", "parts": ["L3"]},
            {"key": "L4", "name": "Level 4 — Advanced Interoperability", "parts": ["L4"]},
        ],
        "conformant_after": "L3",
        "answers": {
            "standard": ["Met", "Not Met", "Not Tested", "N/A"],
            "tier": ["Fully integrated", "Standalone - manual encoding", "Not Met", "Not Tested"],
        },
        "tier_scores": {"Fully integrated": 1, "Standalone - manual encoding": 0.5, "Not Met": 0, "Not Tested": 0},
    }
    header = ("# Scoring policy. Thresholds and pass rules are DOH policy: change them only with a recorded\n"
              "# Project Workstreams decision, and commit with type `policy` citing that decision.\n")
    SCORING_FILE.write_text(header + dump_yaml(scoring), encoding="utf-8")
    print(f"Imported {total} criteria from {len(SHEETS)} sheets and {len(retired)} legacy retired IDs.")


def slug(s: str) -> str:
    s = re.sub(r"\(.*?\)", "", s).strip().lower()
    return re.sub(r"[^a-z0-9]+", "_", s).strip("_")


def table_rows(table):
    headers = [slug(c.text) for c in table.rows[0].cells]
    out = []
    for row in table.rows[1:]:
        vals = [c.text.strip() for c in row.cells]
        if not any(vals):
            continue
        out.append({h: (v or None) for h, v in zip(headers, vals)})
    return out


def import_guide(path: Path):
    import docx

    d = docx.Document(str(path))
    # Walk body in order to know the heading above each table
    body = d.element.body
    heading = None
    tables = []
    ti = 0
    for child in body.iterchildren():
        tag = child.tag.split("}")[1]
        if tag == "p":
            style = child.xpath("string(.//w:pStyle/@w:val)")
            if style.lower().startswith("heading"):
                heading = "".join(child.xpath(".//w:t/text()")).strip()
        elif tag == "tbl":
            tables.append((heading, d.tables[ti]))
            ti += 1

    REGISTERS_DIR.mkdir(exist_ok=True)
    glossary = []
    files = {
        "Ref|Area": ("technical-baseline.yaml", "Technical Baseline (TB-)"),
        "Ref|Group": ("sources.yaml", "Terminology & Registry Sources (SRC-)"),
        "ID|Data requirement": ("traceability.yaml", "FHIR Traceability (TR-)"),
        "ID|Indicator": ("indicators.yaml", "Indicator Definitions for Level 3 (IND-) — PROPOSED"),
        "Abbreviation|Stands for": ("abbreviations.yaml", "Abbreviations"),
        "Prefix|Meaning": ("id-prefixes.yaml", "ID prefixes"),
    }
    for heading, t in tables:
        head = "|".join(c.text.strip() for c in t.rows[0].cells[:2])
        if head == "Term|Meaning":
            glossary.append({"section": heading, "terms": table_rows(t)})
            continue
        if head in files:
            name, title = files[head]
            dump_yaml({"title": title, "source": "Technical Reference Guide (legacy Rev 9)", "entries": table_rows(t)},
                      REGISTERS_DIR / name)
    dump_yaml({"title": "Glossary", "source": "Technical Reference Guide (legacy Rev 9)", "sections": glossary},
              REGISTERS_DIR / "glossary.yaml")
    print(f"Imported registers: {', '.join(sorted(p.name for p in REGISTERS_DIR.glob('*.yaml')))}")
    link_traces()


ID_RE = re.compile(r"\b(?:L[0-4]|TS[0-3]|TEC)-(?:T\.)?\d{2}(?:\.\d+)?\b")


def link_traces():
    """Fill each criterion's traces from the registers' 'criteria' columns."""
    from common import load_yaml
    links = {}  # criterion id -> {kind: set(register ids)}
    plan = [("traceability.yaml", "id", "criteria", "fhir_traceability"),
            ("technical-baseline.yaml", "ref", "related_criteria", "technical_baseline"),
            ("sources.yaml", "ref", "tested_in", "sources")]
    for fname, idkey, col, kind in plan:
        data = load_yaml(REGISTERS_DIR / fname)
        for e in data["entries"]:
            for cid in ID_RE.findall(e.get(col) or ""):
                parent = re.sub(r"\.\d+$", "", cid) if re.search(r"-T\.\d{2}\.\d+$|-\d{2}\.\d+$", cid) else cid
                links.setdefault(parent, {}).setdefault(kind, set()).add(e[idkey])
    n = 0
    for path in CRITERIA_DIR.glob("*/*.yaml"):
        c = load_yaml(path)
        if c["id"] in links:
            for kind, ids in links[c["id"]].items():
                c["traces"][kind] = sorted(ids)
            dump_yaml(c, path)
            n += 1
    print(f"Linked register traces to {n} criteria.")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--workbook", required=True, type=Path)
    ap.add_argument("--guide", type=Path, help="Technical Reference Guide .docx (for registers)")
    args = ap.parse_args()
    import_workbook(args.workbook)
    if args.guide:
        import_guide(args.guide)


if __name__ == "__main__":
    main()
