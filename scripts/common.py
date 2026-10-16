# SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
# SPDX-License-Identifier: GPL-3.0-or-later
"""Shared helpers: load the criteria, sheets, scoring rules and version information.

Every build and check script reads the repository through these functions, so the
workbook, the web scorecard and the change summary always see the same data.
"""
from __future__ import annotations

import datetime as _dt
import os
import re
import subprocess
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CRITERIA_DIR = ROOT / "criteria"
SHEETS_FILE = CRITERIA_DIR / "sheets.yaml"
LEGACY_RETIRED_FILE = CRITERIA_DIR / "retired-legacy.yaml"
SCORING_FILE = ROOT / "scoring.yaml"
REGISTERS_DIR = ROOT / "registers"
TEMPLATE_XLSX = ROOT / "templates" / "scorecard-template.xlsx"
CERTIFICATE_FILE = CRITERIA_DIR / "certificate.yaml"
ISSUED_FILE = CRITERIA_DIR / "certificates-issued.yaml"

TITLE = "Healthcare Interoperability Readiness Matrix for EMR Systems"
OWNER = "Department of Health – Western Visayas Center for Health Development"
CONTENT_LICENSE = "CC BY 4.0"
CODE_LICENSE = "GPL-3.0-or-later"
# Licence notices on the web pages, the printed report and the workbook. Off for now; the LICENSE
# files and the per-file licence headers in this repository are unaffected.
SHOW_LICENSE_NOTICE = False
# Times are stored in UTC (ISO 8601) and shown in the reader's own time zone on the web; where a
# fixed text is needed (workbook, fallback) Philippine Standard Time is used.
PHT = _dt.timezone(_dt.timedelta(hours=8), "PHT")


def now_stamp() -> dict:
    """{"built": "2026-10-15 14:32 PHT", "built_iso": "2026-10-15T06:32:00+00:00"}"""
    now = _dt.datetime.now(_dt.timezone.utc).replace(microsecond=0)
    return {"built": now.astimezone(PHT).strftime("%Y-%m-%d %H:%M PHT"), "built_iso": now.isoformat()}


CREDIT = f"Healthcare Interoperability Readiness Matrix for EMR Systems, {OWNER}, licensed under {CONTENT_LICENSE}"

# Values as they appear in the workbook <-> values stored in YAML
CRITICAL_TO_XLSX = {"yes": "Yes", "no": "No", "subs": "★ subs"}
CRITICAL_FROM_XLSX = {v: k for k, v in CRITICAL_TO_XLSX.items()}
SCORING_TO_XLSX = {"binary": "Binary", "count": "Count", "all-or-nothing": "All-or-nothing", "tier": "Tier"}
SCORING_FROM_XLSX = {v: k for k, v in SCORING_TO_XLSX.items()}


# --------------------------------------------------------------------------- YAML
class _Dumper(yaml.SafeDumper):
    pass


def _str_presenter(dumper, data):
    if "\n" in data:
        return dumper.represent_scalar("tag:yaml.org,2002:str", data.rstrip("\n") + "\n", style="|")
    return dumper.represent_scalar("tag:yaml.org,2002:str", data)


_Dumper.add_representer(str, _str_presenter)


def dump_yaml(data, path: Path | None = None) -> str:
    text = yaml.dump(data, Dumper=_Dumper, sort_keys=False, allow_unicode=True, width=10_000, indent=2)
    if path is not None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    return text


def load_yaml(path: Path):
    with open(path, encoding="utf-8") as fh:
        return yaml.safe_load(fh)


# --------------------------------------------------------------------------- certificates
# Details covered by a certificate's fingerprint, in order. Keep in step with FIELDS in tool/cert.js:
# changing the list or the order changes every fingerprint.
CERT_FIELDS = ("number", "issued", "expires", "vendor", "category", "product", "version", "ph_core", "pheref",
               "level", "criteria", "signatory", "signatory_name")
# Sheets of Levels 2-4 whose results are printed and recorded. A register entry with `results` has a
# version-2 fingerprint that covers them and `fhir_release` too. Keep in step with RESULT_KEYS in tool/cert.js.
RESULT_KEYS = ("L2A", "L2B", "L2C", "L2D", "L3", "L4")


def certificate_fingerprint(entry: dict) -> str:
    """First 16 hex digits (uppercase) of SHA-256 over the certificate's details (and its Level 2-4
    results, when recorded), as tool/cert.js computes it."""
    import hashlib
    import unicodedata

    def norm(v) -> str:
        return " ".join(unicodedata.normalize("NFC", "" if v is None else str(v)).split())

    lines = [f"{k}={norm(entry.get(k))}" for k in CERT_FIELDS]
    results = entry.get("results")
    if results:
        text = "HIE-CERT-2\n" + "\n".join(lines + [f"fhir_release={norm(entry.get('fhir_release'))}"]
                                            + [f"results.{k}={norm(results.get(k))}" for k in RESULT_KEYS])
    else:
        text = "HIE-CERT-1\n" + "\n".join(lines)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16].upper()


# --------------------------------------------------------------------------- data
def yaml_lines(path: Path) -> dict[tuple, list[int]]:
    """{key path: [first line, last line]} (1-based) for every value in a YAML file.

    Lets the web scorecard point a reviewer to the exact lines of an entry in its source file,
    e.g. ("sections", 0, "terms", 3) -> [12, 13] or ("developer_guide",) -> [10, 13].
    """
    with open(path, encoding="utf-8") as fh:
        root = yaml.compose(fh)
    out: dict[tuple, list[int]] = {}

    def walk(node, key: tuple, first: int) -> int:
        # a collection ends with its last value (its own end mark points at the next token)
        if isinstance(node, yaml.MappingNode):
            end = max([walk(v, key + (k.value,), k.start_mark.line + 1) for k, v in node.value] or [first])
        elif isinstance(node, yaml.SequenceNode):
            end = max([walk(v, key + (i,), v.start_mark.line + 1) for i, v in enumerate(node.value)] or [first])
        else:
            m = node.end_mark
            end = m.line if m.column == 0 and m.line > node.start_mark.line else m.line + 1
        out[key] = [first, max(first, end)]
        return out[key][1]

    if root is not None:
        walk(root, (), 1)
    return out


def load_sheets(root: Path = ROOT) -> list[dict]:
    return load_yaml(root / "criteria" / "sheets.yaml")["sheets"]


def load_scoring(root: Path = ROOT) -> dict:
    return load_yaml(root / "scoring.yaml")


def load_legacy_retired(root: Path = ROOT) -> list[dict]:
    path = root / "criteria" / "retired-legacy.yaml"
    return (load_yaml(path) or {}).get("retired", []) if path.exists() else []


def load_criteria(root: Path = ROOT) -> dict[str, list[dict]]:
    """Return {sheet_key: [criterion, ...]} in display order.

    Order comes from the sheet's `order` list in sheets.yaml; criteria files not in
    the list are appended in ID order (check.py warns about them).
    """
    result: dict[str, list[dict]] = {}
    for sheet in load_sheets(root):
        folder = root / "criteria" / sheet["key"]
        items = {}
        for path in sorted(folder.glob("*.yaml")):
            data = load_yaml(path)
            data["_file"] = str(path.relative_to(root))
            items[data["id"]] = data
        ordered = [items[i] for i in sheet.get("order", []) if i in items]
        rest = sorted(set(items) - set(sheet.get("order", [])))
        ordered += [items[i] for i in rest]
        result[sheet["key"]] = ordered
    return result


def active(items: list[dict]) -> list[dict]:
    return [c for c in items if c.get("status", "active") == "active"]


def active_subs(criterion: dict) -> list[dict]:
    return [s for s in criterion.get("sub_items", []) or [] if s.get("status", "active") == "active"]


# --------------------------------------------------------------------------- version
def _git(*args: str, root: Path = ROOT) -> str:
    try:
        return subprocess.run(["git", *args], cwd=root, capture_output=True, text=True, check=True).stdout.strip()
    except Exception:
        return ""


def workbook_name(info: dict) -> str:
    """File name of the generated scorecard workbook for a build (used by build_xlsx and the web page)."""
    safe = re.sub(r"[^A-Za-z0-9._-]+", "-", info["version"]).strip("-")
    return f"testing-criteria-scorecard-{safe}.xlsx"


def version_info(root: Path = ROOT) -> dict:
    """Version, branch and commit for stamping outputs.

    GitHub Actions sets GITHUB_REF_NAME / GITHUB_SHA; locally git is asked directly.
    """
    ref_type = os.environ.get("GITHUB_REF_TYPE", "")
    ref_name = os.environ.get("GITHUB_REF_NAME", "")
    commit = (os.environ.get("GITHUB_SHA") or _git("rev-parse", "HEAD", root=root))[:7]
    tag = ref_name if ref_type == "tag" else _git("describe", "--tags", "--exact-match", root=root)
    branch = "" if tag else (ref_name or _git("rev-parse", "--abbrev-ref", "HEAD", root=root))
    if tag:
        version = tag
    else:
        last = _git("describe", "--tags", "--abbrev=0", root=root)
        version = f"{last}+dev" if last else "unreleased draft"
    is_release = bool(tag) and "-rc" not in tag
    return {
        "version": version,
        "branch": branch,
        "commit": commit or "local",
        **now_stamp(),
        "is_release": is_release,
        "label": (f"{version}" + (f" · branch {branch}" if branch else "") + f" · commit {commit or 'local'}"),
    }
