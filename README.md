# Healthcare Interoperability Readiness Matrix for EMR Systems Evaluation Tool

Source of the tiered (Level 0–4) testing criteria used to check whether an EMR system conforms to the
national HL7 FHIR standards (PH Core and PHeReF) and may be used in the Health Information Exchange
for electronic referral.

**Open the scorecard: <https://dohwvchdictu.github.io/hirmes-tool/>**

Everything a reviewer needs is on that site: test a system against the criteria, read the guides and
the Technical Reference Guide, print the report, and propose a change to any line. Testing needs no
installation and no GitHub account. Proposing a change needs a free GitHub account.

| You want to… | Go to |
| --- | --- |
| Test a system against the criteria | [The scorecard site](https://dohwvchdictu.github.io/hirmes-tool/), see [Using the scorecard site](#using-the-scorecard-site) |
| Review the criteria and propose a change | ✉ **Suggest a change** on any item in the site, or [open an issue](../../issues/new/choose) |
| Download the official files | [Releases](../../releases): scorecard workbook, change summary, change log, web scorecard (`.zip`) |
| See what changed and why | `CHANGE-SUMMARY.md` in each release, or the [commit history](../../commits) |
| Edit the criteria files | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Set up the GitHub repository | [docs/maintainer-setup.md](docs/maintainer-setup.md) |

## Using the scorecard site

### 1. Pick a version

The landing page lists every version of the criteria. Choose **Open scorecard** on the row you need.

![Landing page with the versions of the criteria](docs/images/site-landing.png)

| Label | What it is | Use it to |
| --- | --- | --- |
| Release | Approved by the TWG; the official version | Practise and prepare for an evaluation (the released workbook is the official, signed record) |
| Release candidate | Sent to the TWG for review | Review what the TWG is asked to approve |
| Draft · main | Latest accepted changes, not yet released | See the current state of the criteria |
| Branch preview | A proposed change in progress | Check a change before it is accepted |

Each row also links to that version's workbook (`.xlsx`), change summary and source. The yellow bar
at the top of every scorecard page names the version, branch and commit you are looking at, and
*All published versions* returns to the landing page.

### 2. Find your way around

![Search across criteria, terms, registers and documents](docs/images/site-search.png)

- **Sidebar.** *Overview* (Summary, System profile), *Levels* (one sheet per level, with its progress),
  *Output* (Printed report, Certificate, Verify a certificate) and *Reference* (the Technical Reference
  Guide, glossary and registers).
- **Search.** Press `/` or click the search box to find any criterion, term, register entry or
  document section.
- **Terms.** Underlined terms and dotted abbreviations in the criteria open a short definition.
- **ⓘ** next to a control explains it: result options, scoring types, weights, thresholds.
- **Links.** Every page and criterion has its own address (for example `#L1/L1-01`), so you can send a
  link to the exact item you mean.

### 3. Test a system

Open a level in the sidebar and set the **Result** of each criterion (Met, Not Met, Not Tested or
N/A; some criteria are answered per sub-item). Write the evidence you checked in the notes box.
Scores, sheet status and the level achieved update as you answer.

![A criteria sheet with one criterion answered and its evidence noted](docs/images/site-criteria-sheet.png)

The buttons under each criterion open the **guide drawer**: what the developer must provide, how the
validator checks it, the evidence required, its traces to the FHIR profiles and registers, and its
terms. Tick *Follow* to keep the drawer in step with the criterion you click.

![Guide drawer showing the developer's guide for L1-01](docs/images/site-guide-drawer.png)

Fill in the **System profile** (application, product, versions, testing team), then open the
**Summary** to see every level at once. A level stays LOCKED until the level before it passes; a
system is conformant when Levels 0 to 3 pass with no critical item not met.

![Summary scorecard with the result of each level](docs/images/site-summary.png)

### 4. Save, print and download

Your answers, notes and profile are kept **in this browser only** and saved as you type; nothing is
sent to a server. Use the **Evaluation** menu to keep or share them:

![The Evaluation menu](docs/images/site-evaluation-menu.png)

| Menu item | What it does |
| --- | --- |
| Save evaluation | Downloads answers, notes and profile as a `.json` file. Save often, and before clearing the browser or changing computers |
| Load evaluation… | Continues from a saved `.json` file, on any computer |
| Print report | The printed evaluation report, or a PDF through the browser's print dialog |
| Print certificate | The Certificate of Validation (proof of concept, see [step 6](#6-certificate-proof-of-concept)) |
| Clear answers | Removes everything saved in this browser |
| Blank workbook (.xlsx) | The scorecard workbook of this version, to fill in offline |

A workbook filled with the web answers is not available yet. Use *Save evaluation*, or copy the
results into the blank workbook.

### 5. Review the criteria and propose a change

Every criterion, sheet heading, guide, help text, glossary term, register entry and Reference
section has a yellow **✎ Edit** button. It shows the file and lines the item comes from and offers
three actions:

![The ✎ Edit menu of criterion L1-02](docs/images/site-edit-menu.png)

| Action | What it does | Who it suits |
| --- | --- | --- |
| ✉ Suggest a change | Opens a change request (a GitHub issue) with the item, its location and its current text filled in. Add what it should say and why | TWG members, workstreams and reviewers (no editing needed) |
| ⌗ Show the lines | Opens the source file at those lines, in the exact version the page was built from | Anyone checking where a text comes from |
| ✎ Edit on GitHub | Opens the file in GitHub's editor. Without write access GitHub makes a copy (fork) and a pull request for you | Editors |

*Jump to a part* lists each field of a criterion (title, weight, critical flag, guides, sub-items)
with its own ✉, so a suggestion can point at one field. You can also
[open a change request](../../issues/new/choose) directly and choose the kind of change: wording,
correction, new criterion, retire or move, or a policy change (weight, critical flag, threshold).

The **Reference** section holds the Technical Reference Guide, with the glossary and the registers
(Technical Baseline, sources, FHIR traceability, indicators) inserted where they belong. Each
register entry lists the criteria that use it, and every section and entry has its own ✎.

![Technical Baseline chapter in the Reference section](docs/images/site-reference.png)

**What happens next.** A maintainer answers the issue. An accepted change is made on a branch, which
gets its own *Branch preview* on the landing page so you can check it. Once merged it appears in
*Draft · main*, and it is listed in the change summary of the next release candidate sent to the TWG.

### 6. Certificate (proof of concept)

*Output › Certificate* prints a Certificate of Validation from the System Profile and the results.
The page lists what is still missing; until everything is in order it prints as a SPECIMEN. Its QR
code opens *Verify a certificate*, which checks the number and fingerprint against the register of
issued certificates. This feature is a proof of concept for discussion and is not an official DOH
certificate; see [CONTRIBUTING.md](CONTRIBUTING.md#certificates).

![Certificate page listing the open items](docs/images/site-certificate.png)

## About this repository

The criteria are kept as plain text. Every output is generated from them, so a change is made once
and every file stays in sync. The rest of this README is for maintainers and editors.

### What is in this repository

```
criteria/            one YAML file per criterion, in a folder per sheet (L0, L1, L2A–L2D, L3, L4)
criteria/sheets.yaml sheet titles, introductions and the display order of criteria
criteria/profile.yaml              sections, fields and choices of the System Profile form
criteria/certificate.yaml          wording, signatories and logos of the Certificate of Validation (proof of concept)
criteria/certificates-issued.yaml  register of issued certificates (what the QR code verifies against)
criteria/retired-legacy.yaml  IDs retired before this repository existed (kept reserved)
scoring.yaml         pass thresholds, level gating and the TWG approval record
registers/           Technical Baseline (TB-), sources (SRC-), FHIR traceability (TR-), indicators (IND-),
                     glossary, abbreviations, ID prefixes, and form-help.yaml (the ⓘ help in the web scorecard)
schema/              rules every YAML file must follow
templates/           workbook layout used to generate the scorecard
scripts/             check, build, publish and change-summary scripts (import_rev9.py: the one-time Rev 9 import)
tool/                web scorecard (static page), certificate code (cert.js), letterhead images (img/)
                     and landing page template
tests/               round-trip, scoring and certificate tests
docs/                Technical Reference Guide (prose; its tables come from registers/, see docs/README.md)
                     and the one-time GitHub setup (maintainer-setup.md)
.github/             workflows (check, publish, release) and issue templates (change request, certificate record)
```

### How outputs are produced

| Output | Built by | When |
| --- | --- | --- |
| Scorecard workbook (`.xlsx`) | `scripts/build_xlsx.py` | Every push (download from the workflow run or the web scorecard's Evaluation menu) and every release |
| Web scorecard and landing page | `scripts/build_web.py` (with `scripts/build_reference.py` for the glossary, registers and documents), `scripts/publish.py` | Every push to any branch or tag (GitHub Pages, `gh-pages` branch); a `.zip` of the scorecard with every release |
| Printed report and certificate (PDF) | The web scorecard: Output › Printed report and Output › Certificate in the sidebar, or the Evaluation menu (the certificate is a proof of concept, see [CONTRIBUTING.md](CONTRIBUTING.md#certificates)) | On demand, from an evaluation |
| Change summary | `scripts/change_summary.py` | Every release (compared with the previous release) |
| Change log | git-cliff, from commit messages | Every release |

The web scorecard also carries the glossary, registers and documents: terms in the criteria open a
short popover, each criterion has a guide drawer (Developer, Validator, Evidence, Traces, Terms), and
the Reference tab and search box (press `/`) lead to every register entry and document chapter. See
[CONTRIBUTING.md](CONTRIBUTING.md#help-terms-and-documents-in-the-web-scorecard) for how to edit them.

Every file carries its version, branch and commit, so a printed copy can be traced to its source.

### Versions

- The first release from this repository is **Revision 1** (`v1.0.0`). Legacy revisions (Rev 3–9) were
  produced outside the repository; the Rev 9 content was imported as the starting content.
- Drafts sent to the TWG for review are release candidates: `v1.0.0-rc1`, `v1.0.0-rc2`, …
- Later revisions step the major version (`v2.0.0`); text clarifications without scoring effect step
  the minor version (`v1.1.0`); fixes to a released version step the patch (`v1.0.1`).
- The released workbook is the official, signed record. The web scorecard is a review and practice tool.

### Run it locally

```bash
python -m pip install -r requirements.txt
python scripts/check.py --counts        # validate everything and print the Count Register
python scripts/build_xlsx.py            # writes dist/testing-criteria-scorecard-<version>.xlsx
python scripts/build_web.py             # writes site/
python -m http.server -d site 8000      # open http://localhost:8000
python tests/test_roundtrip.py          # workbook rows match the YAML
python tests/test_certificate.py        # certificate fingerprints and QR codes (needs Node.js; pip install qrcode for the full QR check)
python tests/test_scoring.py            # workbook and web give the same results (needs LibreOffice and Node.js)
python scripts/change_summary.py        # what changed in the criteria since the previous tag
```
