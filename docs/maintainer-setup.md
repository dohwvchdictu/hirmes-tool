# One-time GitHub setup

Done once by an organization owner. Takes about 15 minutes.

## 1. Organization and repository

1. Create the GitHub organization for DOH WV CHD (github.com → **+** → *New organization*, free plan).
2. *Settings → Authentication security*: require two-factor authentication.
3. Create the repository **`hirmes-tool`** — **Public**, no README, no .gitignore, no license
   (they are already in this package).
4. *Settings → Collaborators and teams*: give the maintainer and the backup maintainer **Maintain**
   access; TWG and workstream members **Triage** (they can comment and label issues); everyone else
   reads the public repository.

## 2. First push

From the folder that contains this repository:

```bash
git remote add origin https://github.com/<organization>/hirmes-tool.git
git push -u origin main
```

## 3. GitHub Pages (web scorecard)

*Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
Then *Actions → Publish web scorecard → Run workflow* (or push to `main`). The page address is shown
on the workflow run and under *Settings → Pages*. Add it to the repository description.

## 4. Protect `main` and release tags

*Settings → Rules → Rulesets → New branch ruleset*

- Target: default branch (`main`)
- Require status checks to pass: **check** (from *Check and build*)
- Block force pushes; restrict deletions

*New tag ruleset*: target `v*`, restrict creation, update and deletion to the maintainers.

## 5. First release candidate

```bash
git tag v1.0.0-rc1 -m "Revision 1, release candidate 1 for TWG review"
git push origin v1.0.0-rc1
```

The *Release* workflow publishes the workbook, change summary and change log under *Releases*
(marked pre-release), and the web scorecard switches to that version.
After TWG approval: record the decision, update `scoring.yaml` if thresholds were approved, then tag
`v1.0.0` on the approved commit.
