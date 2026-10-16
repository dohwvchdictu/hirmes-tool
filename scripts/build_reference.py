# SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
# SPDX-License-Identifier: GPL-3.0-or-later
"""Build the reference data of the web scorecard: glossary, abbreviations, registers, form help
and documents, with the links between them and the criteria.

Called by build_web.py; writes reference.json next to data.json. Editors never touch the output:
they edit registers/*.yaml, registers/form-help.yaml and docs/reference-guide/reference-guide.md.
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

from common import ROOT, active, load_criteria, load_sheets, load_yaml, yaml_lines

# register file, id field, title field, short key, display name
REGISTERS = [
    ("technical-baseline.yaml", "ref", "area", "TB", "Technical Baseline"),
    ("sources.yaml", "ref", "concept", "SRC", "Terminology & Registry Sources"),
    ("traceability.yaml", "id", "data_requirement", "TR", "FHIR Traceability"),
    ("indicators.yaml", "id", "indicator", "IND", "Indicator Definitions (PROPOSED)"),
]
# which register field lists the criteria an entry applies to
CRITERIA_FIELD = {"TB": "related_criteria", "SRC": "tested_in", "TR": "criteria", "IND": "criteria"}
# The Technical Reference Guide (docs/reference-guide/reference-guide.md) is prose only: a line
# "<!-- register: KEY -->" marks where a structured table from registers/ is shown.
GUIDE = ROOT / "docs" / "reference-guide" / "reference-guide.md"
MARKER = re.compile(r"<!--\s*register:\s*([\w-]+)\s*-->")
REGISTER_FILES = {"glossary": "registers/glossary.yaml", "abbreviations": "registers/abbreviations.yaml",
                  "prefixes": "registers/id-prefixes.yaml", "retired": "criteria/retired-legacy.yaml",
                  "TB": "registers/technical-baseline.yaml", "SRC": "registers/sources.yaml",
                  "TR": "registers/traceability.yaml", "IND": "registers/indicators.yaml"}
LABELS = {"card": "Cardinality", "fhir_source": "FHIR source", "notes_doh_decision": "Notes / DOH decision",
          "source_authority": "Source / authority", "resource_profile": "Resource / profile",
          "binding_fixed": "Binding / fixed value", "how_the_validators_verify": "How the Validators verify",
          "where_to_retrieve_verify": "Where to retrieve / verify", "numerator_value": "Numerator / value",
          "formula_rounding": "Formula / rounding", "date_status_rule": "Date & status rule",
          "inclusions_exclusions": "Inclusions / exclusions", "expected": "Expected (submission)"}
# never auto-linked: ID prefixes (they link to their registers instead) and status words of the tool itself
SKIP_KEYS = {"TS", "TB", "TR", "SRC", "IND", "TEC", "ID", "N/A", "PASSED", "NOT PASSED", "INCOMPLETE", "LOCKED", "Not Tested"}
CRIT_ID = re.compile(r"\b(?:L[0-4]|TS[0-3]|TEC)-(?:T\.)?\d{2}(?:\.\d+)?\b")


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60]


def label(key: str) -> str:
    return LABELS.get(key, key.replace("_", " ").capitalize())


def match_keys(term: str) -> list[str]:
    """Words in criteria text that should link to this glossary term.

    Linked automatically: acronyms (FHIR, NHFR, PSGC), CamelCase names (ServiceRequest) and
    phrases of two or more words. Single ordinary words (Level, Task, priority) are not linked,
    so the text is not flooded; add them through `aliases` in glossary.yaml when needed.
    """
    keys = set()
    inner = [x for grp in re.findall(r"\(([^)]*)\)", term) for x in re.split(r",\s*|\s+/\s+", grp)]
    base = re.sub(r"\s*\([^)]*\)?", "", term)
    for cand in [p.strip(" .,") for p in re.split(r"\s+/\s+|;\s*", base)] + [i.strip(" .,") for i in inner]:
        if not cand or len(cand) > 60 or re.search(r"[…★\"“”=]", cand) or cand in SKIP_KEYS:
            continue
        words = cand.split()
        if re.fullmatch(r"[A-Z][A-Za-z0-9\-\.]*[A-Z0-9]", cand) and sum(ch.isupper() for ch in cand) >= 2 and len(cand) >= 3:
            keys.add(cand)
        elif len(words) == 1 and re.fullmatch(r"[A-Z][a-z]+[A-Z][A-Za-z0-9]+", cand):
            keys.add(cand)
        elif len(words) >= 2 and len(cand) >= 8 and not re.match(r"(?i)(the|a|an|to|of)\b", cand) and not re.search(r"\d", words[0]):
            keys.add(cand)
    return sorted(keys)


def criteria_index():
    """{criterion or sub-item id: (sheet key, criterion id, title)}"""
    out = {}
    crit = load_criteria()
    for s in load_sheets():
        for c in active(crit[s["key"]]):
            out[c["id"]] = (s["key"], c["id"], c["title"])
            for sb in c.get("sub_items") or []:
                out[sb["id"]] = (s["key"], c["id"], sb["text"])
    return out, crit


_warned: list = []


def render_md(text: str) -> str:
    try:
        import markdown  # in requirements.txt; imported here so check.py does not depend on it
    except ImportError:
        if not _warned:
            _warned.append(1)
            print("WARNING  Markdown is not installed (pip install -r requirements.txt); "
                  "document chapters are shown as plain text", file=sys.stderr)
        return "".join(f"<p>{html.escape(p).replace(chr(10), '<br>')}</p>" for p in text.split("\n\n") if p.strip())
    return markdown.markdown(text, extensions=["tables", "sane_lists", "attr_list"], output_format="html")


def split_doc(path: Path, doc_id: str, title: str) -> dict:
    """Split a document into chapters (one page each) at its repeated top heading level.

    Each chapter keeps its source line range (for the edit links), its second-level sections
    (for the sidebar, each with its own line range for its edit link) and the registers its
    markers insert.
    """
    lines = path.read_text(encoding="utf-8").split("\n")
    levels = [len(m.group(1)) for line in lines if (m := re.match(r"^(#{1,2}) ", line))]
    split_level = 1 if levels.count(1) > 1 else 2
    chapters, current = [], {"title": "Introduction", "lines": [], "start": 1}
    for n, line in enumerate(lines, 1):
        m = re.match(r"^(#{1,6}) (.*)", line)
        if m and len(m.group(1)) == split_level:
            current["end"] = n - 1
            if any(x.strip() and not x.lstrip().startswith("<!--") for x in current["lines"]) or current["title"] != "Introduction":
                chapters.append(current)
            current = {"title": m.group(2).strip(), "lines": [], "start": n}
        elif m and len(m.group(1)) < split_level:
            continue  # document title
        else:
            current["lines"].append(line)
    current["end"] = len(lines)
    chapters.append(current)
    out = []
    for ch in chapters:
        end = ch["end"]
        while end > ch["start"] and not lines[end - 1].strip():
            end -= 1
        sections, body = [], []
        first = ch["start"] + (0 if ch["title"] == "Introduction" and ch["start"] == 1 and not lines[0].startswith("#") else 1)
        for i, line in enumerate(ch["lines"]):
            m = re.match(r"^(#{%d}) (.*)$" % (split_level + 1), line)
            if m:
                sid = "sec-" + slug(m.group(2))
                if sections:
                    sections[-1]["l"][1] = first + i - 1
                sections.append({"id": sid, "title": m.group(2).strip(), "l": [first + i, end]})
                line = f"{line} {{#{sid}}}"
            body.append(line)
        for sc in sections:   # a section ends at its last non-blank line
            while sc["l"][1] > sc["l"][0] and not lines[sc["l"][1] - 1].strip():
                sc["l"][1] -= 1
        text = "\n".join(body)
        num = re.match(r"Chapter (\d+)\s*[—-]\s*(.*)", ch["title"])
        out.append({"id": f"ch{num.group(1)}" if num else (slug(ch["title"]) or "intro"),
                    "num": num.group(1) if num else "", "title": ch["title"], "short": num.group(2) if num else ch["title"],
                    "html": render_md(text), "l": [ch["start"], end], "sections": sections,
                    "registers": MARKER.findall(text)})
    return {"id": doc_id, "title": title, "source": path.relative_to(ROOT).as_posix(), "chapters": out}


def build_reference() -> dict:
    reg_dir = ROOT / "registers"
    cindex, crit = criteria_index()

    # glossary + abbreviations
    glossary = []
    gdoc = load_yaml(reg_dir / "glossary.yaml")
    gl = yaml_lines(reg_dir / "glossary.yaml")
    for si, sec in enumerate(gdoc.get("sections", [])):
        for ti, t in enumerate(sec["terms"]):
            term = t.get("term") or ""
            keys = [] if t.get("link") is False else sorted(set(match_keys(term)) | set(t.get("aliases") or []))
            glossary.append({"id": "g-" + slug(term), "term": term, "meaning": t.get("meaning") or "",
                             "section": sec["section"], "keys": keys,
                             "src": {"p": "registers/glossary.yaml", "l": gl.get(("sections", si, "terms", ti))}})
    gkeys = {k for g in glossary for k in g["keys"]}
    abbreviations = []
    al = yaml_lines(reg_dir / "abbreviations.yaml")
    for ai, a in enumerate(load_yaml(reg_dir / "abbreviations.yaml").get("entries", [])):
        ab = a.get("abbreviation") or ""
        keys = [ab] if (re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9\-\.&]*", ab) and sum(c.isupper() for c in ab) >= 2
                        and len(ab) >= 3 and ab not in gkeys and ab not in SKIP_KEYS) else []
        abbreviations.append({"id": "a-" + slug(ab), "abbreviation": ab, "stands_for": a.get("stands_for") or "", "keys": keys,
                              "src": {"p": "registers/abbreviations.yaml", "l": al.get(("entries", ai))}})

    # registers, with reverse links to criteria
    used_by: dict[str, set] = {}
    for items in crit.values():
        for c in active(items):
            for ids in (c.get("traces") or {}).values():
                for rid in ids:
                    used_by.setdefault(rid, set()).add(c["id"])
    registers = []
    for fname, idf, titlef, key, name in REGISTERS:
        doc = load_yaml(reg_dir / fname)
        rl = yaml_lines(reg_dir / fname)
        entries = []
        for ei, e in enumerate(doc.get("entries", [])):
            rid = e.get(idf)
            if not rid:
                continue
            crits = set(used_by.get(rid, set()))
            for cid in CRIT_ID.findall(e.get(CRITERIA_FIELD[key]) or ""):
                if cid in cindex:
                    crits.add(cindex[cid][1])
            fields = [[label(k), v] for k, v in e.items() if k not in (idf, titlef) and v]
            entries.append({"id": rid, "title": e.get(titlef) or "", "fields": fields,
                            "criteria": sorted(crits), "src": {"p": "registers/" + fname, "l": rl.get(("entries", ei))}})
        registers.append({"key": key, "name": name, "title": doc.get("title", name), "entries": entries, "src": "registers/" + fname})
    pl = yaml_lines(reg_dir / "id-prefixes.yaml")
    prefixes = [dict(p, src={"p": "registers/id-prefixes.yaml", "l": pl.get(("entries", i))})
                for i, p in enumerate(load_yaml(reg_dir / "id-prefixes.yaml").get("entries", []))]

    docs = [split_doc(GUIDE, "reference-guide", "Technical Reference Guide")] if GUIDE.exists() else []

    # retired and moved IDs (legacy list plus criteria retired in this repository)
    from build_xlsx import retired_list
    rl = yaml_lines(ROOT / "criteria" / "retired-legacy.yaml")
    retired = retired_list(crit)
    for i, r in enumerate(retired):
        r["src"] = {"p": "criteria/retired-legacy.yaml", "l": rl.get(("retired", i))} if ("retired", i) in rl else None

    help_doc, help_src = {}, {}
    if (reg_dir / "form-help.yaml").exists():
        help_doc = load_yaml(reg_dir / "form-help.yaml")
        help_src = {".".join(map(str, k)): v for k, v in yaml_lines(reg_dir / "form-help.yaml").items() if k}
    crit_titles = {k: {"sheet": v[0], "criterion": v[1], "title": v[2]} for k, v in cindex.items()}
    return {"glossary": glossary, "abbreviations": abbreviations, "registers": registers, "prefixes": prefixes,
            "docs": docs, "retired": retired, "register_files": REGISTER_FILES, "help": help_doc, "help_src": help_src, "criteria": crit_titles}
