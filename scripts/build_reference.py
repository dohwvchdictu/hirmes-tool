# SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
# SPDX-License-Identifier: GPL-3.0-or-later
"""Build the reference data of the web scorecard: glossary, abbreviations, registers, form help
and documents, with the links between them and the criteria.

Called by build_web.py; writes reference.json next to data.json. Editors never touch the output:
they edit registers/*.yaml, registers/form-help.yaml and docs/**/*.md.
"""
from __future__ import annotations

import re
from pathlib import Path

import markdown

from common import ROOT, active, load_criteria, load_sheets, load_yaml

# register file, id field, title field, short key, display name
REGISTERS = [
    ("technical-baseline.yaml", "ref", "area", "TB", "Technical Baseline"),
    ("sources.yaml", "ref", "concept", "SRC", "Terminology & Registry Sources"),
    ("traceability.yaml", "id", "data_requirement", "TR", "FHIR Traceability"),
    ("indicators.yaml", "id", "indicator", "IND", "Indicator Definitions (PROPOSED)"),
]
# which register field lists the criteria an entry applies to
CRITERIA_FIELD = {"TB": "related_criteria", "SRC": "tested_in", "TR": "criteria", "IND": "criteria"}
# chapters of the Reference Guide that are now generated from registers/ (shown as links instead)
CHAPTER_TO_PAGE = [("Glossary", "glossary"), ("Technical Baseline", "TB"), ("Terminology & Registry Sources", "SRC"),
                   ("FHIR Traceability", "TR"), ("Indicator Definitions", "IND")]
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


def render_md(text: str) -> str:
    return markdown.markdown(text, extensions=["tables", "sane_lists", "attr_list"], output_format="html")


def split_doc(path: Path, doc_id: str, title: str) -> dict:
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")
    levels = [len(m.group(1)) for line in lines if (m := re.match(r"^(#{1,2}) ", line))]
    split_level = 1 if levels.count(1) > 1 else 2
    chapters, current = [], {"title": "Introduction", "lines": []}
    for line in lines:
        m = re.match(r"^(#{1,6}) (.*)", line)
        if m and len(m.group(1)) == split_level:
            if any(x.strip() for x in current["lines"]):
                chapters.append(current)
            current = {"title": m.group(2).strip(), "lines": []}
        elif m and len(m.group(1)) < split_level:
            continue  # document title
        else:
            current["lines"].append(line)
    chapters.append(current)
    out = []
    for ch in chapters:
        page = next((p for k, p in CHAPTER_TO_PAGE if k in ch["title"]), None)
        if page and doc_id == "reference-guide":
            html = (f'<p class="ref-moved">This chapter is maintained as structured data and shown on its own page, '
                    f'linked to the criteria: <a href="#ref/{page}">open {page if page == "glossary" else page + "-"} '
                    f'{"" if page == "glossary" else "register"}</a>.</p>')
        else:
            html = render_md("\n".join(ch["lines"]))
        out.append({"id": slug(ch["title"]) or "intro", "title": ch["title"], "html": html})
    return {"id": doc_id, "title": title, "source": str(path.relative_to(ROOT)), "chapters": out}


def build_reference() -> dict:
    reg_dir = ROOT / "registers"
    cindex, crit = criteria_index()

    # glossary + abbreviations
    glossary = []
    gdoc = load_yaml(reg_dir / "glossary.yaml")
    for sec in gdoc.get("sections", []):
        for t in sec["terms"]:
            term = t.get("term") or ""
            keys = [] if t.get("link") is False else sorted(set(match_keys(term)) | set(t.get("aliases") or []))
            glossary.append({"id": "g-" + slug(term), "term": term, "meaning": t.get("meaning") or "",
                             "section": sec["section"], "keys": keys})
    gkeys = {k for g in glossary for k in g["keys"]}
    abbreviations = []
    for a in load_yaml(reg_dir / "abbreviations.yaml").get("entries", []):
        ab = a.get("abbreviation") or ""
        keys = [ab] if (re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9\-\.&]*", ab) and sum(c.isupper() for c in ab) >= 2
                        and len(ab) >= 3 and ab not in gkeys and ab not in SKIP_KEYS) else []
        abbreviations.append({"id": "a-" + slug(ab), "abbreviation": ab, "stands_for": a.get("stands_for") or "", "keys": keys})

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
        entries = []
        for e in doc.get("entries", []):
            rid = e.get(idf)
            if not rid:
                continue
            crits = set(used_by.get(rid, set()))
            for cid in CRIT_ID.findall(e.get(CRITERIA_FIELD[key]) or ""):
                if cid in cindex:
                    crits.add(cindex[cid][1])
            fields = [[label(k), v] for k, v in e.items() if k not in (idf, titlef) and v]
            entries.append({"id": rid, "title": e.get(titlef) or "", "fields": fields,
                            "criteria": sorted(crits)})
        registers.append({"key": key, "name": name, "title": doc.get("title", name), "entries": entries})
    prefixes = load_yaml(reg_dir / "id-prefixes.yaml").get("entries", [])

    docs = []
    for path, doc_id, title in ((ROOT / "docs/reference-guide/reference-guide.md", "reference-guide", "Technical Reference Guide"),
                                (ROOT / "docs/review-edition/review-edition.md", "review-edition", "Review Edition")):
        if path.exists():
            docs.append(split_doc(path, doc_id, title))

    help_doc = load_yaml(reg_dir / "form-help.yaml") if (reg_dir / "form-help.yaml").exists() else {}
    crit_titles = {k: {"sheet": v[0], "criterion": v[1], "title": v[2]} for k, v in cindex.items()}
    return {"glossary": glossary, "abbreviations": abbreviations, "registers": registers, "prefixes": prefixes,
            "docs": docs, "help": help_doc, "criteria": crit_titles}
