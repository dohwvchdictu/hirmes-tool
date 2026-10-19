# One-time GitHub setup

Done once by an organization owner. Takes about 15 minutes.

## 1. Organization and repository

1. Create the GitHub organization for DOH WV CHD (github.com → **+** → *New organization*, free plan).
2. *Settings → Authentication security*: require two-factor authentication.
3. Create the repository **`hirmes-tool`** — **Public**, no README, no .gitignore, no license
   (they are already in this package).
4. *Settings → Collaborators and teams*: give the maintainer and the backup maintainer **Maintain**
   access; Project Workstream members **Triage** (they can comment and label issues); everyone else
   reads the public repository.

## 2. First push

From the folder that contains this repository:

```bash
git remote add origin https://github.com/<organization>/hirmes-tool.git
git push -u origin main
```

## 3. GitHub Pages (landing page and scorecards)

The *Publish scorecards* workflow writes the site to the `gh-pages` branch. It creates that branch
on its first run.

1. Push once (or run *Actions → Publish scorecards → Run workflow* with the ref left empty) so the
   `gh-pages` branch exists.
2. *Settings → Pages → Build and deployment → Source:* **Deploy from a branch**; branch **gh-pages**,
   folder **/ (root)**.
3. The landing page is at `https://<organization>.github.io/hirmes-tool/`. Add it to the repository
   description (*About → Website*).

| Site folder | Content |
| --- | --- |
| `/` | Landing page: latest release, releases, release candidates, main draft, branch previews |
| `/releases/<tag>/` | Scorecard, workbook and change summary of each release and release candidate |
| `/draft/` | The main branch |
| `/preview/<branch>/` | Every other branch; removed when the branch is deleted |

Every push to a branch or tag republishes that version and regenerates the landing page. To rebuild
everything (for example after changing the publishing scripts), run *Publish scorecards* manually
with the ref left empty; to rebuild one version, enter its branch or tag.

## 4. Protect `main` and release tags

*Settings → Rules → Rulesets → New branch ruleset*

- Target: default branch (`main`)
- Require status checks to pass: **check** (from *Check and build*)
- Block force pushes; restrict deletions

*New tag ruleset*: target `v*`, restrict creation, update and deletion to the maintainers.

## 5. First release candidate

```bash
git tag v1.0.0-rc1 -m "Revision 1, release candidate 1 for Project Workstreams review"
git push origin v1.0.0-rc1
```

The *Release* workflow publishes the workbook, change summary and change log under *Releases*
(marked pre-release), and *Publish scorecards* adds the version to the landing page.
After Project Workstreams approval: record the decision, update `scoring.yaml` if thresholds were approved, then tag
`v1.0.0` on the approved commit.
