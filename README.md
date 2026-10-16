# Healthcare Interoperability Readiness Matrix for EMR Systems Evaluation Tool

Source of the tiered (Level 0–4) testing criteria used to check whether an EMR system conforms to the
national HL7 FHIR standards (PH Core and PHeReF) and may be used in the Health Information Exchange
for electronic referral.

The criteria are kept as plain text. Every output is generated from them, so a change is made once
and every file stays in sync.

| You want to… | Go to |
| --- | --- |
| Try the criteria in the browser | The **landing page** on this repository's GitHub Pages site: every release, release candidate, the main draft and each branch |
| Download the official files | [Releases](../../releases): scorecard workbook, change summary, change log |
| See what changed and why | `CHANGE-SUMMARY.md` in each release, or the [commit history](../../commits) |
| Propose a change | [Open an issue](../../issues/new/choose) |
| Edit the criteria | [CONTRIBUTING.md](CONTRIBUTING.md) |

## What is in this repository

```
criteria/            one YAML file per criterion, in a folder per sheet (L0, L1, L2A–L2D, L3, L4)
criteria/sheets.yaml sheet titles, introductions and the display order of criteria
criteria/certificate.yaml          wording and signatories of the Certificate of Validation (proof of concept)
criteria/certificates-issued.yaml  register of issued certificates (what the QR code verifies against)
criteria/retired-legacy.yaml  IDs retired before this repository existed (kept reserved)
scoring.yaml         pass thresholds, level gating and the TWG approval record
registers/           Technical Baseline (TB-), sources (SRC-), FHIR traceability (TR-), indicators (IND-),
                     glossary, abbreviations, and form-help.yaml (the ⓘ help in the web scorecard)
schema/              rules every YAML file must follow
templates/           workbook layout used to generate the scorecard
scripts/             check, build and change-summary scripts
tool/                web scorecard (static page) and landing page template
tests/               round-trip and scoring tests
docs/                Technical Reference Guide (prose; its tables come from registers/, see docs/README.md)
```

## How outputs are produced

| Output | Built by | When |
| --- | --- | --- |
| Scorecard workbook (`.xlsx`) | `scripts/build_xlsx.py` | Every push (download from the workflow run) and every release |
| Web scorecard and landing page | `scripts/build_web.py`, `scripts/publish.py` | Every push to any branch or tag (GitHub Pages, `gh-pages` branch) |
| Printed report and certificate (PDF) | The web scorecard: Output › Printed report, Output › Certificate (the certificate is a proof of concept, see [CONTRIBUTING.md](CONTRIBUTING.md#certificates)) | On demand, from an evaluation |
| Change summary | `scripts/change_summary.py` | Every release (compared with the previous release) |
| Change log | git-cliff, from commit messages | Every release |

The web scorecard also carries the glossary, registers and documents: terms in the criteria open a
short popover, each criterion has a guide drawer (Developer, Validator, Evidence, Traces, Terms), and
the Reference tab and search box (press `/`) lead to every register entry and document chapter. See
[CONTRIBUTING.md](CONTRIBUTING.md#help-terms-and-documents-in-the-web-scorecard) for how to edit them.

Every file carries its version, branch and commit, so a printed copy can be traced to its source.

## Versions

- The first release from this repository is **Revision 1** (`v1.0.0`). Legacy revisions (Rev 3–9) were
  produced outside the repository; the Rev 9 content was imported as the starting content.
- Drafts sent to the TWG for review are release candidates: `v1.0.0-rc1`, `v1.0.0-rc2`, …
- Later revisions step the major version (`v2.0.0`); text clarifications without scoring effect step
  the minor version (`v1.1.0`); fixes to a released version step the patch (`v1.0.1`).
- The released workbook is the official, signed record. The web scorecard is a review and practice tool.

## Run it locally

```bash
python -m pip install -r requirements.txt
python scripts/check.py                 # validate everything; prints the Count Register
python scripts/build_xlsx.py            # writes dist/testing-criteria-scorecard-<version>.xlsx
python scripts/build_web.py             # writes site/
python -m http.server -d site 8000      # open http://localhost:8000
python tests/test_roundtrip.py          # workbook rows match the YAML
python tests/test_scoring.py            # workbook and web give the same results (needs LibreOffice and Node.js)
```

## License

| Material | License | Folders |
| --- | --- | --- |
| Content: criteria, scoring policy, registers, documents and every generated output | [CC BY 4.0](LICENSES/CC-BY-4.0.txt) | `criteria/`, `scoring.yaml`, `registers/`, `docs/`, `templates/`, Markdown files |
| Code: scripts, web scorecard, tests, schemas, workflows | [GPL-3.0-or-later](LICENSES/GPL-3.0-or-later.txt) | `scripts/`, `tool/`, `tests/`, `schema/`, `.github/` |

Copyright © 2026 Department of Health – Western Visayas Center for Health Development.
See [LICENSE](LICENSE) for the credit line to use when you reuse or adapt the content; the
file-by-file mapping is in [REUSE.toml](REUSE.toml).
