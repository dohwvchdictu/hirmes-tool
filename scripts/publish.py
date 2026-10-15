# SPDX-FileCopyrightText: 2026 Department of Health – Western Visayas Center for Health Development
# SPDX-License-Identifier: GPL-3.0-or-later
"""Publish scorecards for branches and tags to the gh-pages site, and regenerate the landing page.

    python scripts/publish.py --pages <gh-pages checkout> --ref main --ref-type branch
    python scripts/publish.py --pages <dir> --ref v1.0.0-rc1 --ref-type tag
    python scripts/publish.py --pages <dir> --all                    # rebuild every branch and tag
    python scripts/publish.py --pages <dir> --delete old-branch --ref-type branch
    python scripts/publish.py --pages <dir> --landing-only

Site layout:
    index.html, versions.json     landing page (generated)
    releases/<tag>/                each release and release candidate
    draft/                         the main branch
    preview/<branch>/              every other branch

Each folder holds the web scorecard, the generated workbook, the change summary and meta.json.
Every ref is built with its own scripts, so an old release is shown exactly as it was released.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_BRANCH = os.environ.get("DEFAULT_BRANCH", "main")
REPO = os.environ.get("GITHUB_REPOSITORY", "")
REPO_URL = f"https://github.com/{REPO}" if REPO else ""
sys.path.insert(0, str(ROOT / "scripts"))
from common import SHOW_LICENSE_NOTICE, now_stamp  # noqa: E402

LICENSE_HTML = ('<br>Content © Department of Health – Western Visayas Center for Health Development · '
                '<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · '
                'Code <a href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0-or-later</a>')


def git(*args, cwd=ROOT, check=True):
    return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, check=check).stdout.strip()


def safe(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-") or "unnamed"


def folder_for(ref: str, ref_type: str) -> str:
    if ref_type == "tag":
        return f"releases/{safe(ref)}"
    if ref == DEFAULT_BRANCH:
        return "draft"
    return f"preview/{safe(ref)}"


def kind_for(ref: str, ref_type: str) -> str:
    if ref_type == "tag":
        return "candidate" if re.search(r"-rc", ref) else "release"
    return "draft" if ref == DEFAULT_BRANCH else "branch"


def remote_ref(ref: str, ref_type: str) -> str:
    return f"refs/tags/{ref}" if ref_type == "tag" else f"refs/remotes/origin/{ref}"


# --------------------------------------------------------------------------- build one ref
def build_ref(pages: Path, ref: str, ref_type: str) -> dict:
    target = pages / folder_for(ref, ref_type)
    sha = git("rev-parse", remote_ref(ref, ref_type) + "^{commit}")
    date = git("show", "-s", "--format=%cI", sha)
    subject = git("show", "-s", "--format=%s", sha)
    meta = {"ref": ref, "ref_type": ref_type, "kind": kind_for(ref, ref_type), "path": folder_for(ref, ref_type),
            "commit": sha[:7], "commit_date": date, "subject": subject,
            **now_stamp(), "ok": False, "files": {}}
    with tempfile.TemporaryDirectory() as tmp:
        wt = Path(tmp) / "src"
        git("worktree", "add", "--detach", str(wt), sha)
        try:
            env = {**os.environ, "GITHUB_REF_TYPE": ref_type, "GITHUB_REF_NAME": ref, "GITHUB_SHA": sha}
            out = Path(tmp) / "out"
            log = []
            steps = [
                [sys.executable, "scripts/check.py"],
                [sys.executable, "scripts/build_web.py", "--out", str(out)],
                [sys.executable, "scripts/build_xlsx.py", "--out", str(out)],
                [sys.executable, "scripts/change_summary.py", "--to", sha if ref_type != "tag" else ref,
                 "--out", str(out / "CHANGE-SUMMARY.md")],
            ]
            if ref_type != "tag" and '"--label"' in (wt / "scripts" / "change_summary.py").read_text(encoding="utf-8"):
                steps[-1] += ["--label", f"branch {ref}"]
            # Each ref may pin different packages (a branch can add one that the default branch does
            # not have yet), so install the ref's own requirements before building it.
            if (wt / "requirements.txt").exists():
                steps.insert(0, [sys.executable, "-m", "pip", "install", "--quiet", "--disable-pip-version-check",
                                 "-r", "requirements.txt"])
            for cmd in steps:
                r = subprocess.run(cmd, cwd=wt, env=env, capture_output=True, text=True)
                log.append(f"$ {' '.join(cmd[1:])}\n{r.stdout}{r.stderr}")
                if r.returncode != 0:
                    meta["error"] = f"{cmd[-1] if cmd[1] == '-m' else cmd[1]} failed"
                    break
            else:
                meta["ok"] = True
            if target.exists():
                shutil.rmtree(target)
            target.mkdir(parents=True)
            if out.exists():
                for p in out.iterdir():
                    shutil.move(str(p), target / p.name)
            (target / "build-log.txt").write_text("\n".join(log), encoding="utf-8")
        finally:
            git("worktree", "remove", "--force", str(wt), check=False)

    xlsx = sorted(target.glob("*.xlsx"))
    if xlsx:
        meta["files"]["workbook"] = xlsx[0].name
    if (target / "CHANGE-SUMMARY.md").exists():
        meta["files"]["change_summary"] = "CHANGE-SUMMARY.md"
    if (target / "index.html").exists():
        meta["files"]["scorecard"] = "index.html"
    data_file = target / "data.json"
    if data_file.exists():
        data = json.loads(data_file.read_text(encoding="utf-8"))
        depth = meta["path"].count("/") + 1
        data["meta"]["home"] = "../" * depth
        data["meta"]["kind"] = meta["kind"]
        data_file.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        meta["version"] = data["meta"].get("version")
        meta["label"] = data["meta"].get("label")
        meta["counts"] = {"criteria": sum(len(s["criteria"]) for s in data["sheets"]),
                          "sub_items": sum(len(c.get("sub_items", [])) for s in data["sheets"] for c in s["criteria"])}
    (target / "meta.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
    print(f"{'built' if meta['ok'] else 'FAILED'} {ref} ({ref_type}) -> {meta['path']}")
    return meta


def remove_ref(pages: Path, ref: str, ref_type: str):
    target = pages / folder_for(ref, ref_type)
    if target.exists():
        shutil.rmtree(target)
        print(f"removed {target.relative_to(pages)}")


def all_refs():
    branches = [b.split("/", 1)[1] for b in git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin").split()
                if "/" in b and not b.endswith("/HEAD") and b.split("/", 1)[1] not in ("gh-pages", "HEAD")]
    tags = git("tag", "--list", "v*").split()
    return [(b, "branch") for b in branches] + [(t, "tag") for t in tags]


def prune(pages: Path, refs):
    keep = {folder_for(r, t) for r, t in refs}
    for parent in ("releases", "preview"):
        for d in (pages / parent).glob("*") if (pages / parent).exists() else []:
            if f"{parent}/{d.name}" not in keep:
                shutil.rmtree(d)
                print(f"pruned {parent}/{d.name}")


# --------------------------------------------------------------------------- landing page
def version_key(tag: str):
    m = re.match(r"v?(\d+)\.(\d+)\.(\d+)(?:-rc\.?(\d+))?", tag)
    if not m:
        return (0, 0, 0, 0)
    a, b, c, rc = m.groups()
    return (int(a), int(b), int(c), int(rc) if rc else 10_000)


def load_metas(pages: Path):
    metas = []
    for f in pages.glob("**/meta.json"):
        try:
            metas.append(json.loads(f.read_text(encoding="utf-8")))
        except Exception:
            pass
    return metas


def build_landing(pages: Path):
    metas = load_metas(pages)
    releases = sorted([m for m in metas if m["kind"] == "release"], key=lambda m: version_key(m["ref"]), reverse=True)
    candidates = sorted([m for m in metas if m["kind"] == "candidate"], key=lambda m: version_key(m["ref"]), reverse=True)
    drafts = [m for m in metas if m["kind"] == "draft"]
    branches = sorted([m for m in metas if m["kind"] == "branch"], key=lambda m: m["commit_date"], reverse=True)
    latest = releases[0] if releases else (candidates[0] if candidates else None)
    generated = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    (pages / "versions.json").write_text(json.dumps(
        {"generated": generated, "repository": REPO_URL,
         "latest": latest["ref"] if latest else None,
         "releases": releases, "candidates": candidates, "draft": drafts, "branches": branches}, indent=1), encoding="utf-8")
    template = (ROOT / "tool" / "landing.html").read_text(encoding="utf-8")

    def e(s):
        return html.escape(str(s or ""))

    def when(m):
        """PH time text; the page script rewrites it in the reader's time zone."""
        iso = m.get("built_iso")
        return f'<time datetime="{e(iso)}">{e(m.get("built"))}</time>' if iso else e(m.get("built"))

    def links(m):
        base = m["path"] + "/"
        out = []
        if m.get("ok") and "scorecard" in m["files"]:
            out.append(f'<a class="btn primary" href="{e(base)}">Open scorecard</a>')
        if "workbook" in m["files"]:
            out.append(f'<a class="btn" href="{e(base + m["files"]["workbook"])}" download>Workbook (.xlsx)</a>')
        if "change_summary" in m["files"]:
            out.append(f'<a class="btn" href="{e(base + m["files"]["change_summary"])}">Change summary</a>')
        if REPO_URL:
            if m["ref_type"] == "tag":
                out.append(f'<a class="btn" href="{e(REPO_URL)}/releases/tag/{e(m["ref"])}">Release notes</a>')
            else:
                out.append(f'<a class="btn" href="{e(REPO_URL)}/tree/{e(m["ref"])}">Source</a>')
            out.append(f'<a class="btn subtle" href="{e(REPO_URL)}/commit/{e(m["commit"])}">Commit {e(m["commit"])}</a>')
        if not m.get("ok"):
            out.append(f'<a class="btn warn" href="{e(base)}build-log.txt">Build failed — log</a>')
        return " ".join(out)

    badge = {"release": ("Release", "b-release"), "candidate": ("Release candidate", "b-candidate"),
             "draft": ("Draft · main", "b-draft"), "branch": ("Branch preview", "b-branch")}

    def row(m):
        name, cls = badge[m["kind"]]
        counts = m.get("counts") or {}
        return (f'<tr><td><span class="ref">{e(m["ref"])}</span><div class="muted">{e(m.get("subject"))}</div></td>'
                f'<td><span class="badge {cls}">{name}</span></td>'
                f'<td>{e(m["commit_date"][:10])}<div class="muted">built {when(m)}</div></td>'
                f'<td class="num">{e(counts.get("criteria", "—"))} / {e(counts.get("sub_items", "—"))}</td>'
                f'<td class="actions">{links(m)}</td></tr>')

    def table(title, items, note):
        if not items:
            return f'<section><h2>{title}</h2><p class="muted">{note}</p></section>'
        return (f'<section><h2>{title}</h2><table><thead><tr><th>Version / branch</th><th>Type</th><th>Date</th>'
                f'<th class="num">Criteria / sub-items</th><th>Open or download</th></tr></thead><tbody>'
                + "".join(row(m) for m in items) + "</tbody></table></section>")

    if latest:
        name, cls = badge[latest["kind"]]
        hero = (f'<section class="hero"><div><div class="muted">Latest {"release" if latest["kind"] == "release" else "release candidate"}</div>'
                f'<div class="big">{e(latest["ref"])} <span class="badge {cls}">{name}</span></div>'
                f'<div class="muted">{e(latest["commit_date"][:10])} · commit {e(latest["commit"])}</div></div>'
                f'<div class="actions">{links(latest)}</div></section>')
    else:
        hero = '<section class="hero"><div class="big">No release yet</div><div class="muted">Use the draft below.</div></section>'

    body = (hero
            + table("Releases", releases, "No final release yet. Final releases are tagged vX.Y.Z after TWG approval.")
            + table("Release candidates", candidates, "No release candidates.")
            + table("Draft (main branch)", drafts, "The main branch has not been published yet.")
            + table("Branch previews", branches, "No other branches. Every pushed branch gets a preview here."))
    actions = (f'{e(REPO_URL)}/actions/workflows/publish.yml' if REPO_URL else "#")
    page = (template.replace("{{BODY}}", body).replace("{{REPO_URL}}", e(REPO_URL)).replace("{{ACTIONS_URL}}", actions)
            .replace("{{GENERATED}}", when(now_stamp()))
            .replace("{{LICENSE}}", LICENSE_HTML if SHOW_LICENSE_NOTICE else "")
            .replace("{{GENERATED_ISO}}", generated))
    (pages / "index.html").write_text(page, encoding="utf-8")
    (pages / ".nojekyll").write_text("", encoding="utf-8")
    print(f"landing page: {len(releases)} releases, {len(candidates)} candidates, {len(drafts)} draft, {len(branches)} branches")


# --------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pages", required=True, type=Path, help="checkout of the gh-pages branch")
    ap.add_argument("--ref")
    ap.add_argument("--ref-type", choices=["branch", "tag"])
    ap.add_argument("--all", action="store_true", help="rebuild every branch and tag and prune deleted ones")
    ap.add_argument("--delete", help="remove the folder of a deleted branch or tag")
    ap.add_argument("--landing-only", action="store_true")
    args = ap.parse_args()
    pages = args.pages.resolve()
    pages.mkdir(parents=True, exist_ok=True)
    failed = False
    if args.all:
        refs = all_refs()
        prune(pages, refs)
        for r, t in refs:
            failed |= not build_ref(pages, r, t)["ok"]
    elif args.delete:
        remove_ref(pages, args.delete, args.ref_type or "branch")
    elif args.ref:
        ref_type = args.ref_type or ("tag" if git("tag", "--list", args.ref) else "branch")
        if ref_type == "branch" and args.ref == "gh-pages":
            print("gh-pages is the site itself; nothing to build")
        else:
            failed = not build_ref(pages, args.ref, ref_type)["ok"]
    build_landing(pages)
    if failed:
        print("One or more builds failed; the landing page links to their build logs.")


if __name__ == "__main__":
    main()
