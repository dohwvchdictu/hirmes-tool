# One-time GitHub setup

An organization owner does this setup one time. It takes approximately 15 minutes.

## 1. Organization and repository

1. Create the GitHub organization for DOH WV CHD (github.com → **+** → *New organization*, free plan).
2. In *Settings → Authentication security*, make two-factor authentication mandatory.
3. Create the repository **`hirmes-tool`**. Make it **Public**. Do not add a README, a .gitignore
   or a license, because this package already contains them.
4. In *Settings → Collaborators and teams*, set these access levels:
   - The maintainer and the backup maintainer: **Maintain**.
   - Project Workstream members: **Triage**. They can comment on issues and label them.
   - All other persons can read the public repository.

## 2. First push

Go to the folder that contains this repository. Run:

```bash
git remote add origin https://github.com/<organization>/hirmes-tool.git
git push -u origin main
```

## 3. GitHub Pages (landing page and scorecards)

The *Publish scorecards* workflow writes the site to the `gh-pages` branch. The workflow creates
that branch when it runs for the first time.

1. Push one time, or run *Actions → Publish scorecards → Run workflow* with an empty ref. This
   creates the `gh-pages` branch.
2. In *Settings → Pages → Build and deployment → Source*, select **Deploy from a branch**. Select
   the branch **gh-pages** and the folder **/ (root)**.
3. The landing page is at `https://<organization>.github.io/hirmes-tool/`. Add this address to the
   repository description (*About → Website*).

| Site folder | Content |
| --- | --- |
| `/` | Landing page: latest release, releases, release candidates, main draft, branch previews |
| `/releases/<tag>/` | Scorecard, workbook and change summary of each release and release candidate |
| `/draft/` | The main branch |
| `/preview/<branch>/` | Each other branch. The workflow removes the preview when you delete the branch. |

Each push to a branch or tag publishes that version again and makes the landing page again. To
build all versions again (for example, after a change to the publishing scripts), run *Publish
scorecards* manually with an empty ref. To build one version again, enter its branch or tag.

## 4. Protect `main` and release tags

Go to *Settings → Rules → Rulesets → New branch ruleset* and set:

- Target: default branch (`main`)
- Require status checks to pass: **check** (from *Check and build*)
- Block force pushes. Restrict deletions.

Then make a *New tag ruleset*. Set the target to `v*`. Permit only the maintainers to create,
update and delete these tags.

## 5. First release candidate

```bash
git tag v1.0.0-rc1 -m "Revision 1, release candidate 1 for Project Workstreams review"
git push origin v1.0.0-rc1
```

The *Release* workflow publishes the workbook, the change summary and the change log under
*Releases*, with the pre-release mark. *Publish scorecards* adds the version to the landing page.

After the Project Workstreams approve the release candidate:

1. Record the decision.
2. If the Project Workstreams approved thresholds, update `scoring.yaml`.
3. Put the tag `v1.0.0` on the approved commit.
