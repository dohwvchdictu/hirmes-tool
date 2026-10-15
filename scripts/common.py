# SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
# SPDX-License-Identifier: GPL-3.0-or-later
"""Shared helpers: load the criteria, sheets, scoring rules and version information.

Every build and check script reads the repository through these functions, so the
workbook, the web scorecard and the change summary always see the same data.
"""
from __future__ import annotations

import datetime as _dt
import os
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

TITLE = "Healthcare Interoperability Readiness Matrix for EMR Systems"
OWNER = "Department of Health – Western Visayas Center for Health Development"
CONTENT_LICENSE = "CC BY 4.0"
CODE_LICENSE = "GPL-3.0-or-later"
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


# --------------------------------------------------------------------------- data
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
        "built": _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "is_release": is_release,
        "label": (f"{version}" + (f" · branch {branch}" if branch else "") + f" · commit {commit or 'local'}"),
    }
