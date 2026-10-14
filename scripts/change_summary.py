"""Readable summary of what changed in the criteria between two versions.

    python scripts/change_summary.py                 # compare HEAD with the previous tag
    python scripts/change_summary.py --from v1.0.0   # compare HEAD with v1.0.0
    python scripts/change_summary.py --from v1.0.0 --to v1.1.0 --out dist/CHANGE-SUMMARY.md

Built from the criteria files themselves (not from commit messages), so it is complete even
when a commit message is vague. Each item links to the commits that touched that file.
"""
from __future__ import annotations

import argparse
import io
import os
import subprocess
import tarfile
import tempfile
from pathlib import Path

from common import ROOT, active, active_subs, load_criteria, load_scoring, load_sheets

FIELDS = [("title", "title"), ("section", "section"), ("critical", "critical"), ("weight", "weight"),
          ("scoring", "scoring type"), ("validation_role", "validation role"), ("evidence", "evidence")]
TEXT_FIELDS = [("developer_guide", "developer's guide"), ("validator_guide", "validator's guide")]


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()


def previous_tag(ref):
    """Tag to compare with: for a final release the previous final release (release
    candidates are skipped), otherwise the previous tag of any kind."""
    try:
        tags = git("tag", "--merged", f"{ref}^", "--sort=-creatordate", "--list", "v*").split()
    except subprocess.CalledProcessError:
        return None
    is_final = ref.startswith("v") and "-rc" not in ref
    for t in tags:
        if t == ref:
            continue
        if is_final and "-rc" in t:
            continue
        return t
    return None


def snapshot(ref, dest: Path) -> Path:
    data = subprocess.run(["git", "archive", ref, "criteria", "scoring.yaml"], cwd=ROOT, capture_output=True, check=True).stdout
    with tarfile.open(fileobj=io.BytesIO(data)) as tar:
        tar.extractall(dest, filter="data")
    return dest


def index(root: Path):
    sheets = load_sheets(root)
    crit = load_criteria(root)
    by_id = {}
    for s in sheets:
        for c in crit[s["key"]]:
            by_id[c["id"]] = (s["key"], c)
    return sheets, crit, by_id, load_scoring(root)


def counts(crit):
    out = {}
    for key, items in crit.items():
        act = active(items)
        out[key] = (len(act), sum(c["critical"] == "yes" for c in act),
                    sum(s["critical"] for c in act for s in active_subs(c)), sum(len(active_subs(c)) for c in act))
    return out


def fmt(v):
    if isinstance(v, float):
        return f"{v:.0%}" if v <= 1 else str(v)
    return str(v)


def summarise(old_root: Path | None, new_root: Path, title: str, repo_url: str = "") -> str:
    _, new_crit, new_ids, new_scoring = index(new_root)
    lines = [f"# {title}", ""]
    new_counts = counts(new_crit)
    if old_root is None:
        lines += ["**Initial release.** The criteria below are the starting content of the repository "
                  "(imported from the legacy Rev 9 workbook).", "",
                  "| Sheet | Criteria | Critical | ★ sub-items | Sub-items |", "| --- | --- | --- | --- | --- |"]
        for k, (a, b, c, d) in new_counts.items():
            lines.append(f"| {k} | {a} | {b} | {c} | {d} |")
        tot = [sum(v[i] for v in new_counts.values()) for i in range(4)]
        lines.append(f"| **Total** | **{tot[0]}** | **{tot[1]}** | **{tot[2]}** | **{tot[3]}** |")
        return "\n".join(lines) + "\n"

    _, old_crit, old_ids, old_scoring = index(old_root)
    added, retired, changed = [], [], []
    for cid, (key, c) in new_ids.items():
        st = c.get("status", "active")
        if cid not in old_ids:
            if st == "active":
                crit = " (critical)" if c["critical"] == "yes" else (" (★ sub-items)" if c["critical"] == "subs" else "")
                added.append(f"**{cid}** {c['title']}{crit} — sheet {key}")
            continue
        okey, o = old_ids[cid]
        ost = o.get("status", "active")
        if ost == "active" and st != "active":
            to = f", replaced by {c['replaced_by']}" if c.get("replaced_by") else ""
            retired.append(f"**{cid}** {st}{to} — {c.get('reason', '')}")
            continue
        if st != "active":
            continue
        diffs = []
        if okey != key:
            diffs.append(f"moved from sheet {okey} to {key}")
        for f, label in FIELDS:
            if o.get(f) != c.get(f):
                diffs.append(f"{label} {fmt(o.get(f))} → {fmt(c.get(f))}" if f not in ("title", "evidence")
                             else f"{label} updated")
        for f, label in TEXT_FIELDS:
            if (o.get(f) or "").strip() != (c.get(f) or "").strip():
                diffs.append(f"{label} updated")
        osubs = {s["id"]: s for s in active_subs(o)}
        nsubs = {s["id"]: s for s in active_subs(c)}
        for sid in nsubs.keys() - osubs.keys():
            diffs.append(f"sub-item {sid} added" + (" (★)" if nsubs[sid]["critical"] else ""))
        for sid in osubs.keys() - nsubs.keys():
            diffs.append(f"sub-item {sid} removed")
        for sid in nsubs.keys() & osubs.keys():
            if nsubs[sid]["text"] != osubs[sid]["text"]:
                diffs.append(f"sub-item {sid} text updated")
            if nsubs[sid]["critical"] != osubs[sid]["critical"]:
                diffs.append(f"sub-item {sid} ★ {'added' if nsubs[sid]['critical'] else 'removed'}")
        if o.get("traces") != c.get("traces"):
            diffs.append("traces updated")
        if diffs:
            changed.append(f"**{cid}** " + "; ".join(diffs))
    for cid, (key, o) in old_ids.items():
        if cid not in new_ids and o.get("status", "active") == "active":
            retired.append(f"**{cid}** file deleted (IDs must be retired, not deleted)")

    policy = []
    for k in sorted(set(old_scoring["thresholds"]) | set(new_scoring["thresholds"])):
        a, b = old_scoring["thresholds"].get(k), new_scoring["thresholds"].get(k)
        if a != b:
            policy.append(f"Threshold {k}: {fmt(a)} → {fmt(b)}")
    for k in ("status", "approved_by", "date_approved", "reference"):
        a, b = old_scoring["policy"].get(k), new_scoring["policy"].get(k)
        if a != b:
            policy.append(f"Policy {k.replace('_', ' ')}: {a or '—'} → {b or '—'}")

    def section(name, items):
        lines.extend([f"## {name}", ""] + ([f"- {i}" for i in items] if items else ["- None"]) + [""])

    section("Added", added)
    section("Changed", changed)
    section("Retired, moved or merged", retired)
    section("Policy", policy)
    old_counts = counts(old_crit)
    impact = []
    for k in new_counts:
        a, b = old_counts.get(k, (0, 0, 0, 0)), new_counts[k]
        if a != b:
            impact.append(f"| {k} | {a[0]} → {b[0]} | {a[1]} → {b[1]} | {a[2]} → {b[2]} | {a[3]} → {b[3]} |")
    lines += ["## Impact on counts", ""]
    if impact:
        lines += ["| Sheet | Criteria | Critical | ★ sub-items | Sub-items |", "| --- | --- | --- | --- | --- |"] + impact
    else:
        lines.append("- No change in counts")
    lines.append("")
    if repo_url:
        lines.append(f"Full history of each file: {repo_url}/commits")
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="old", help="earlier tag or commit (default: previous tag)")
    ap.add_argument("--to", dest="new", default="HEAD")
    ap.add_argument("--out", type=Path)
    ap.add_argument("--print-previous", action="store_true", help="only print the tag that would be compared with")
    args = ap.parse_args()
    old = args.old or previous_tag(args.new)
    if args.print_previous:
        print(old or "")
        return
    repo = os.environ.get("GITHUB_SERVER_URL", "") + ("/" + os.environ["GITHUB_REPOSITORY"] if os.environ.get("GITHUB_REPOSITORY") else "")
    label = args.new if args.new != "HEAD" else "current draft"
    with tempfile.TemporaryDirectory() as tmp:
        new_root = snapshot(args.new, Path(tmp) / "new")
        old_root = snapshot(old, Path(tmp) / "old") if old else None
        title = f"Change summary — {label}" + (f" (compared with {old})" if old else "")
        text = summarise(old_root, new_root, title, repo if repo != "" else "")
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text, encoding="utf-8")
        print(f"Wrote {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
