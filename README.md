# HIE System Validation — Testing Criteria

Source of the tiered (Level 0–4) testing criteria used to check whether an EMR system conforms to the
national HL7 FHIR standards (PH Core and PHeReF) and may be used in the Health Information Exchange
for electronic referral.

The criteria are kept as plain text. Every output is generated from them, so a change is made once
and every file stays in sync.

| You want to… | Go to |
| --- | --- |
| Try the criteria in the browser | The **web scorecard** on this repository's GitHub Pages site |
| Download the official files | [Releases](../../releases): scorecard workbook, change summary, change log |
| See what changed and why | `CHANGE-SUMMARY.md` in each release, or the [commit history](../../commits) |
| Propose a change | [Open an issue](../../issues/new/choose) |
| Edit the criteria | [CONTRIBUTING.md](CONTRIBUTING.md) |

## What is in this repository

```
criteria/            one YAML file per criterion, in a folder per sheet (L0, L1, L2A–L2D, L3, L4)
criteria/sheets.yaml sheet titles, introductions and the display order of criteria
criteria/retired-legacy.yaml  IDs retired before this repository existed (kept reserved)
scoring.yaml         pass thresholds, level gating and the TWG approval record
registers/           Technical Baseline (TB-), sources (SRC-), FHIR traceability (TR-), indicators (IND-), glossary
schema/              rules every YAML file must follow
templates/           workbook layout used to generate the scorecard
scripts/             check, build and change-summary scripts
tool/                web scorecard (static page)
tests/               round-trip and scoring tests
docs/                narrative chapters (being converted; see docs/README.md)
```

## How outputs are produced

| Output | Built by | When |
| --- | --- | --- |
| Scorecard workbook (`.xlsx`) | `scripts/build_xlsx.py` | Every push (download from the workflow run) and every release |
| Web scorecard | `scripts/build_web.py` | Every push to `main` and every release tag (GitHub Pages) |
| Change summary | `scripts/change_summary.py` | Every release (compared with the previous release) |
| Change log | git-cliff, from commit messages | Every release |

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

Content is released under CC0-1.0 (see [LICENSE](LICENSE)), the same as the PH Core and PHeReF
implementation guides. Confirm with the TWG before the first release.
