# Healthcare Interoperability Readiness Matrix for EMR Systems Evaluation Tool

This repository contains level-based testing criteria. Evaluators use them to check whether an EMR
system conforms to an interoperability standard and can be used in the Health Information Exchange
(HIE).

**Changelog:** Check the [recent changes to the testing criteria since Oct. 1, 2026, as of October 19, 2026](#changelog)

**Open the scorecard: <https://dohwvchdictu.github.io/hirmes-tool/>**

The scorecard site contains all the functions that a reviewer uses:

- Test a system against the criteria.
- Read the guides and the Technical Reference Guide.
- Print the report.
- Propose a change to a line.

Testing does not need an installation or a GitHub account. To propose a change, you need a free
GitHub account.

| To do this | Go to |
| --- | --- |
| Test a system against the criteria | [The scorecard site](https://dohwvchdictu.github.io/hirmes-tool/). See [Using the scorecard site](#using-the-scorecard-site). |
| Review the criteria and propose a change | ✉ **Suggest a change** on an item in the site, or [open an issue](../../issues/new/choose) |
| Download the official files | [Releases](../../releases): scorecard workbook, change summary, change log, web scorecard (`.zip`) |
| See what changed and why | `CHANGE-SUMMARY.md` in each release, or the [commit history](../../commits) |
| Edit the criteria files | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Set up the GitHub repository | [docs/maintainer-setup.md](docs/maintainer-setup.md) |

## Requirement key words

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT",
"RECOMMENDED", "MAY", and "OPTIONAL" in this document, in the testing criteria and in the Technical
Reference Guide are to be interpreted as described in
[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119). These words have this meaning only when they
are in capital letters.

## Using the scorecard site

### 1. Select a version

The landing page shows a list of all versions of the criteria. Select **Open scorecard** on the
row that you need.

![Landing page with the versions of the criteria](docs/images/site-landing.png)

| Label | Description | Use |
| --- | --- | --- |
| Release | The official version. The Project Workstreams approved it. | Practise and prepare for an evaluation. The released workbook is the official, signed record. |
| Release candidate | A version that the Project Workstreams review | Review the text that the Project Workstreams must approve. |
| Draft · main | The latest accepted changes. They are not released yet. | See the current state of the criteria. |
| Branch preview | A proposed change that is not complete | Check a change before a maintainer accepts it. |

Each row also has links to the workbook (`.xlsx`), the change summary and the source of that
version. The yellow bar at the top of each scorecard page shows the version, the branch and the
commit. *All published versions* opens the landing page again.

### 2. Find items on the site

![Search across criteria, terms, registers and documents](docs/images/site-search.png)

- **Sidebar.** The sidebar has four groups:
  - *Overview*: Summary, System profile.
  - *Levels*: one sheet for each level, with its progress.
  - *Output*: Printed report, Certificate, Verify a certificate.
  - *Reference*: the Technical Reference Guide, the glossary and the registers.
- **Search.** Press `/` or click the search box. You can find a criterion, a term, a register
  entry or a document section.
- **Terms.** Underlined terms and dotted abbreviations in the criteria open a short definition.
- **ⓘ.** The ⓘ icon next to a control explains the control: result options, scoring types,
  weights and thresholds.
- **Links.** Each page and each criterion has its own address (for example `#L1/L1-01`). You can
  send a link to the exact item.

### 3. Test a system

1. Open a level in the sidebar.
2. Set the **Result** of each criterion: Met, Not Met, Not Tested or N/A. For some criteria, you
   set a result for each sub-item.
3. Write the evidence that you checked in the notes box.

The scores, the sheet status and the level achieved change immediately when you set a result.

![A criteria sheet with one criterion answered and its evidence noted](docs/images/site-criteria-sheet.png)

The buttons below each criterion open the **guide drawer**. The guide drawer shows:

- The items that the developer MUST provide.
- How the validator checks the criterion.
- The evidence that the criterion requires.
- The traces to the FHIR profiles and the registers.
- The terms of the criterion.

Select *Follow* to show the guide of each criterion that you click.

![Guide drawer showing the developer's guide for L1-01](docs/images/site-guide-drawer.png)

Complete the **System profile** (application, product, versions, testing team). Then open the
**Summary** to see all levels together. A level shows LOCKED until the level before it passes. A
system is conformant when Levels 0 to 3 pass and no critical item is Not Met.

![Summary scorecard with the result of each level](docs/images/site-summary.png)

### 4. Save, print and download

The site keeps your answers, notes and profile **only in this browser**. It saves them while you
type. It does not send data to a server. Use the **Evaluation** menu to keep or share your
answers:

![The Evaluation menu](docs/images/site-evaluation-menu.png)

| Menu item | Function |
| --- | --- |
| Save evaluation | Downloads the answers, notes and profile as a `.json` file. Save frequently. Save before you clear the browser or change to a different computer. |
| Load evaluation… | Opens a saved `.json` file on any computer, so that you can continue. |
| Print report | Prints the evaluation report. To make a PDF, use the print dialog of the browser. |
| Print certificate | Prints the Certificate of Validation (proof of concept, see [step 6](#6-certificate-proof-of-concept)). |
| Clear answers | Removes all data that this browser keeps for the evaluation. |
| Blank workbook (.xlsx) | Downloads the scorecard workbook of this version. You can complete it offline. |

The site cannot make a workbook that contains the web answers. Use *Save evaluation*, or copy the
results into the blank workbook.

### 5. Review the criteria and propose a change

These items have a yellow **✎ Edit** button: each criterion, sheet heading, guide, help text,
glossary term, register entry and Reference section. The button shows the file and the lines that
contain the item. It gives three actions:

![The ✎ Edit menu of criterion L1-02](docs/images/site-edit-menu.png)

| Action | Function | Users |
| --- | --- | --- |
| ✉ Suggest a change | Opens a change request (a GitHub issue). The request already contains the item, its location and its current text. Add the new text and the reason. | Project Workstream members and reviewers. They do not edit files. |
| ⌗ Show the lines | Opens the source file at those lines, in the version that the page comes from. | All persons who check the source of a text |
| ✎ Edit on GitHub | Opens the file in the GitHub editor. If you do not have write access, GitHub makes a copy (fork) and a pull request for you. | Editors |

*Jump to a part* shows a list of the fields of a criterion: title, weight, critical flag, guides
and sub-items. Each field has its own ✉, so a suggestion can refer to one field. You can also
[open a change request](../../issues/new/choose) directly. Then select the type of change:
wording, correction, new criterion, retire or move, or policy change (weight, critical flag,
threshold).

The **Reference** section contains the Technical Reference Guide. The glossary and the registers
(Technical Baseline, sources, FHIR traceability, indicators) are in the related chapters. Each
register entry shows the criteria that use it. Each section and each entry has its own ✎.

![Technical Baseline chapter in the Reference section](docs/images/site-reference.png)

**After you send a request:**

1. A maintainer replies to the issue.
2. If the maintainer accepts the change, the maintainer makes the change on a branch.
3. The branch gets its own *Branch preview* on the landing page. You can check the change there.
4. After the merge, the change is in *Draft · main*.
5. The change summary of the next release candidate for the Project Workstreams shows the change.

### 6. Certificate (proof of concept)

*Output › Certificate* prints a Certificate of Validation from the System Profile and the results.
The page shows a list of the missing items. Until all items are complete, the certificate prints
as a SPECIMEN.

The QR code of the certificate opens *Verify a certificate*. This page compares the number and the
fingerprint with the register of issued certificates.

This function is a proof of concept for discussion. It is not an official DOH certificate. See
[CONTRIBUTING.md](CONTRIBUTING.md#certificates).

![Certificate page listing the open items](docs/images/site-certificate.png)

## About this repository

The criteria are plain text files. The build scripts make all outputs from these files. Thus you
make a change in one location, and all output files stay the same. The remaining part of this
README is for maintainers and editors.

### Contents of this repository

```
criteria/            one YAML file for each criterion, in a folder for each sheet (L0, L1, L2A to L2D, L3, L4)
criteria/sheets.yaml sheet titles, introductions and the display order of the criteria
criteria/profile.yaml              sections, fields and choices of the System Profile form
criteria/certificate.yaml          wording, signatories and logos of the Certificate of Validation (proof of concept)
criteria/certificates-issued.yaml  register of issued certificates (the QR code verification uses it)
criteria/retired-legacy.yaml  IDs retired before this repository existed (reserved)
scoring.yaml         pass thresholds, level gating and the Project Workstreams approval record
registers/           Technical Baseline (TB-), sources (SRC-), FHIR traceability (TR-), indicators (IND-),
                     glossary, abbreviations, ID prefixes, and form-help.yaml (the ⓘ help in the web scorecard)
schema/              rules for each YAML file
templates/           workbook layout for the scorecard
scripts/             check, build, publish and change-summary scripts (import_rev9.py: the one-time Rev 9 import)
tool/                web scorecard (static page), certificate code (cert.js), letterhead images (img/)
                     and landing page template
tests/               round-trip, scoring and certificate tests
docs/                Technical Reference Guide (text, with tables from registers/, see docs/README.md)
                     and the one-time GitHub setup (maintainer-setup.md)
.github/             workflows (check, publish, release) and issue templates (change request, certificate record)
```

### How the build makes the outputs

| Output | Made by | When |
| --- | --- | --- |
| Scorecard workbook (`.xlsx`) | `scripts/build_xlsx.py` | At each push and at each release. Download it from the workflow run or from the Evaluation menu of the web scorecard. |
| Web scorecard and landing page | `scripts/build_web.py` (with `scripts/build_reference.py` for the glossary, registers and documents), `scripts/publish.py` | At each push to a branch or tag (GitHub Pages, `gh-pages` branch). Each release also contains a `.zip` of the scorecard. |
| Printed report and certificate (PDF) | The web scorecard: Output › Printed report and Output › Certificate in the sidebar, or the Evaluation menu. The certificate is a proof of concept, see [CONTRIBUTING.md](CONTRIBUTING.md#certificates). | When a user prints from an evaluation |
| Change summary | `scripts/change_summary.py` | At each release (compared with the previous release) |
| Change log | git-cliff, from commit messages | At each release |

The web scorecard also contains the glossary, the registers and the documents:

- A term in the criteria opens a short popover.
- Each criterion has a guide drawer (Developer, Validator, Evidence, Traces, Terms).
- The Reference tab and the search box (press `/`) open each register entry and each document
  chapter.

To edit these items, see
[CONTRIBUTING.md](CONTRIBUTING.md#help-terms-and-documents-in-the-web-scorecard).

Each file contains its version, branch and commit. Thus you can find the source of a printed copy.

### Proposed versioning

- The first release from this repository is **Revision 1** (`v1.0.0`). The legacy revisions
  (Rev 3 to Rev 9) were made outside the repository. The Rev 9 content is the starting content of
  this repository.
- A draft for review by the Project Workstreams is a release candidate: `v1.0.0-rc1`,
  `v1.0.0-rc2`, and so on.
- A new revision increases the major version (`v2.0.0`).
- A text clarification that does not change the scores increases the minor version (`v1.1.0`).
- A correction to a released version increases the patch version (`v1.0.1`).
- The released workbook is the official, signed record. The web scorecard is a tool for review
  and practice.

### Run it locally

```bash
python -m pip install -r requirements.txt
python scripts/check.py --counts        # validate all files and print the Count Register
python scripts/build_xlsx.py            # writes dist/testing-criteria-scorecard-<version>.xlsx
python scripts/build_web.py             # writes site/
python -m http.server -d site 8000      # open http://localhost:8000
python tests/test_roundtrip.py          # workbook rows match the YAML
python tests/test_certificate.py        # certificate fingerprints and QR codes (needs Node.js; pip install qrcode for the full QR check)
python tests/test_scoring.py            # workbook and web give the same results (needs LibreOffice and Node.js)
python scripts/change_summary.py        # changes in the criteria since the previous tag
```

## Changelog

This list shows the changes to the testing criteria since the draft revision of October 1, 2026.
That draft was presented at the Aklan Health Information Exchange Pre-Deployment Workshop for the
2027 Roll-Out, at the DOH Central Office.

In this list, "affects scoring" marks a change that can change the score of an evaluation.

### Criteria added

- **TS0**: Add TS0-05, international code systems (SNOMED CT, LOINC, ICD-10) valid on the DOH terminology server (Count 3, W2) *(affects scoring)*
- **TS0**: Add TS0-06, national registries PSGC ★, NHFR ★ and NHWR. They come from rev2 TS0-01.1 to TS0-01.3. NHFR also contains L4-09. (Count 3, critical through ★, W2) *(affects scoring)*
- **TS0**: Add TS0-07, patient identifiers PhilHealth ID ★ and PhilSys ★. The EMR validates the format and rejects malformed values. Moved from L4-07, Connectathon Issue #5. (Count 2, critical, W2) *(affects scoring)*
- **TS0**: Add TS0-08, OPTIONAL DSWD household or beneficiary ID (SRC-15) (Binary, information only, W0) *(affects scoring)*
- **TS0-01**: Add the required bindings civil status (MaritalStatus) ★ and next-of-kin relationship ★ as TS0-01.3 and TS0-01.4 *(affects scoring)*
- **TS0-02**: Add TS0-02.3 Priority ★ (EReferralPriority: routine / urgent / stat). Task status moves to TS0-02.5 ★. *(affects scoring)*
- **L1-05**: Add L1-05.5, privacy by design and privacy by default: data minimisation, retention, secure disposal (TB-11, NPC Circular 2023-06) *(affects scoring)*
- **TS1**: Add TS1-01, referring facility details (Count 5, 1 ★ NHFR code, W2) *(affects scoring)*
- **TS1**: Add TS1-02, receiving facility details (Count 3, 1 ★ NHFR code, W2) *(affects scoring)*
- **TS1**: Add TS1-03, referring practitioner and care navigator, linked as requester (Count 4, 2 ★: role, and the new TS1-03.4 requester link, W2) *(affects scoring)*
- **TS1**: Add TS1-04, patient demographics and identifiers (Count 9, 3 ★: PhilSys, PhilHealth, sex. Adds TS1-04.9 PWD registration. W2) *(affects scoring)*
- **TS1**: Add TS1-05, accompanied by / next of kin, as Patient.contact or ERefRelatedPerson (TR-022) (Binary, W1) *(affects scoring)*
- **TS1**: Add TS1-06, referral request details (Count 6, 4 ★: referral category, new priority, reason for referral, new ServiceRequest links. Adds TS1-06.6 fixed values intent / status. W2) *(affects scoring)*
- **TS1**: Add TS1-07, chief complaint, working impression ★ and clinical history (Count 3, W2) *(affects scoring)*
- **TS1**: Add TS1-08, vital signs with LOINC code, vital-signs category and UCUM unit (Count 6, 1 ★ blood pressure panel, W2) *(affects scoring)*
- **TS1**: Add TS1-09, laboratory result attachment (Binary, W1) *(affects scoring)*
- **TS1**: Add TS1-10, treatment given before referral (Binary, W1) *(affects scoring)*
- **TS1**: Add TS1-11, professional signature and its date / time (Count 2, W1) *(affects scoring)*
- **TS1**: Add TS1-12, referral tracking Task: status requested ★, focus to ServiceRequest ★, requester / owner, authoredOn (Count 4, W2) *(affects scoring)*
- **TS1**: Add TS1-13, referral linked to the referring encounter (Binary, W1) *(affects scoring)*
- **TS1**: Add TS1-14, time called, for information (Binary, W0) *(affects scoring)*
- **TS1**: Add TS1-15, mode of transportation, for information (Binary, W0) *(affects scoring)*
- **TS1**: Add TS1-16, patient matching: three referrals use one existing Patient again. Moved from L4-08. (Count 3, all ★, critical, W2) *(affects scoring)*
- **TS1-T.03**: Add RelatedPerson (N/A if the EMR uses Patient.contact) to the meta.profile check. The check now has 13 resources (was 12). Procedure becomes MedicationAdministration or Procedure. *(affects scoring)*
- **TS2**: Add TS2-01, the receiving facility finds new referrals without typing an ID (new key for TS2-T.01) (Binary, critical, W2) *(affects scoring)*
- **TS2**: Add TS2-02, referring and receiving facility details (Count 7, 2 ★, W2) *(affects scoring)*
- **TS2**: Add TS2-03, referring practitioner and care navigator (Count 3, 1 ★, W2) *(affects scoring)*
- **TS2**: Add TS2-04, patient demographics and identifiers (Count 11, 3 ★, W2) *(affects scoring)*
- **TS2**: Add TS2-05, referral request details (Count 4, 3 ★, W2) *(affects scoring)*
- **TS2**: Add TS2-06, clinical findings (Count 4, 1 ★, W2) *(affects scoring)*
- **TS2**: Add TS2-07, vital signs, value and unit (Count 6, 1 ★, W2) *(affects scoring)*
- **TS2**: Add TS2-08, laboratory attachment received and shown with the referral (Binary, W1) *(affects scoring)*
- **TS2**: Add TS2-09, treatment given and professional signature (Count 3, W1) *(affects scoring)*
- **TS2**: Add TS2-10, the receiving practitioner / care navigator is separate from the referring practitioner (Count 4, 2 ★ including the new TS2-10.4, W2) *(affects scoring)*
- **TS2**: Add TS2-11, the receiving response updates the Task: received ★, accepted ★ (new), rejected with reason, completed (new) (Count 4, W2) *(affects scoring)*
- **TS2**: Add TS2-12, the referring facility shows the status changes (new key for TS2-T.02) (Binary, critical, W2) *(affects scoring)*
- **TS2**: Add TS2-13, the EMR records a time stamp for each status change and keeps it: requested ★, received ★, accepted / rejected ★, completed ★. Moved from L4-06. (Count 4, critical, W2) *(affects scoring)*
- **TEC**: Add TEC-08, encryption at rest (TB-03) and salted adaptive password hashes (TB-04) (Binary, W2) *(affects scoring)*
- **TEC**: Add TEC-09, access boundaries: failed log-ins, cross-facility access, privilege escalation (Count 5, 3 ★, critical, W2) *(affects scoring)*
- **TEC**: Add TEC-10, log-out, expiry and revocation end sessions and accounts (Count 3, W2) *(affects scoring)*
- **TEC**: Add TEC-11, error messages, client code and logs do not show secrets or more patient data than necessary (Count 3, W1) *(affects scoring)*
- **TEC**: Add TEC-12, users cannot change the audit log through the application, and the audit log records security events (Count 4, W2) *(affects scoring)*
- **TEC**: Add TEC-13, outgoing connections verify certificates, and exposed APIs have protection against abuse (Count 2, W1) *(affects scoring)*
- **TEC**: Add TEC-14, independent vulnerability assessment of the version under test, with no unresolved critical or high findings (Binary, W1) *(affects scoring)*
- **TS3**: Add TS3-01, the EMR does not show a referral without an IG-mandatory element as sent. It shows the reason and accepts the corrected referral. (Count 3, all ★, critical, W2) *(affects scoring)*
- **TS3**: Add TS3-02, the EMR prevents malformed values, or handles the SHR rejection without data loss (Count 3, W1) *(affects scoring)*
- **TS3**: Add TS3-03, the EMR prevents or handles references to a facility, practitioner or patient that does not exist (Count 2, W1) *(affects scoring)*
- **TS3**: Add TS3-04, a double submission leaves only one referral on the SHR (Count 2, all ★, critical, W2) *(affects scoring)*
- **TS3**: Add TS3-05, connection loss: no data loss, and the EMR sends the referral after recovery. Contains TEC-06. (Count 3, 2 ★, critical, W2) *(affects scoring)*
- **TS3**: Add TS3-06, a partial failure leaves no half-saved referral and no false success (Count 2, all ★, critical, W2) *(affects scoring)*
- **TS3**: Add TS3-07, graceful degradation when the terminology server or a registry is not available. The EMR does not invent codes. (Count 2, W1) *(affects scoring)*
- **TS3**: Add TS3-08, the EMR reports a rejected or expired system credential clearly and does not silently drop data (Binary, W1) *(affects scoring)*
- **TS3**: Add TS3-09, retrieval at the receiving side during an SHR outage: no referral missed, no referral shown two times (Count 3, W2) *(affects scoring)*
- **L3**: Add L3-16, top morbidity (working impression) counted and ranked correctly. Replaces the untitled rev2 row "Top Morbidity caes being referred", which had no score. (Count 4, W1) *(affects scoring)*
- **L3**: Add L3-17, month boundary: referrals go to the correct reporting period (IND-01) (Count 3, W1) *(affects scoring)*
- **L3**: Add L3-18, duplicate and cancelled referrals counted by the indicator rules (IND-02, IND-03) (Count 2, W2) *(affects scoring)*
- **L3**: Add L3-19, a new run shows late status changes, and turnaround time uses the correct time stamps (IND-04, IND-08) (Count 3, W1) *(affects scoring)*
- **L3**: Add L3-20, combined filters give the expected counts (Count 3, W1) *(affects scoring)*
- **L3**: Add L3-21, exported totals are equal to the totals on the screen and to the expected values (Binary, W1) *(affects scoring)*

### Criteria retired, moved or merged

- **TS1**: Retire TS1-1.01 to TS1-1.45. Their content is now in TS1-01 to TS1-16, with fields as sub-items (cross-walk §6.4). *(affects scoring)*
- **TS1**: Merge the duplicate rows TS1-1.38, TS1-1.39 and TS1-1.40 into TS1-03.1, TS1-03.3 and TS1-03.2 *(affects scoring)*
- **TS1**: Remove TS1-1.14 Action Point: Received and TS1-1.15 Referred (Forwarded). The referring EMR now sets Task requested (TS1-12.1 ★). *(affects scoring)*
- **TS1**: Move TS1-1.22 Age (computed) to the display check at the receiving side, TS2-04.5 *(affects scoring)*
- **TS2**: Retire TS2-2.01 to TS2-2.44 and TS2-T.01 to TS2-T.03. Their content is now in TS2-01 to TS2-13 (cross-walk §6.5). *(affects scoring)*
- **TS2**: Remove TS2-2.16 Time Called. The receiving side does not check it now (information only in TS1-14). *(affects scoring)*
- **TS2**: Remove TS2-2.18 Referred (Forwarded) as a receiving-side status. Onward referral is in TS1-T.04 / L4-10. *(affects scoring)*
- **TEC**: Move TEC-06 downtime handling to TS3-05. TS3-05 also tests retry and duplication. *(affects scoring)*
- **L4**: Move L4-06 status time stamps to TS2-13 (fundamental, now critical in Level 2) *(affects scoring)*
- **L4**: Move L4-07 identifier format validation to TS0-07 (Connectathon Issue #5. The number is not used again.) *(affects scoring)*
- **L4**: Move L4-08 patient de-duplication to TS1-16 (fundamental, now critical in Level 2) *(affects scoring)*
- **L4**: Merge L4-09 NHFR-sourced facility data into TS0-06.2 ★ *(affects scoring)*
- **L4**: Retire L4-12 Inferno / official conformance suite until an official PHeReF test kit is available. Inferno is now accepted evidence in TS1-T.02. *(affects scoring)*
- **L4**: Retire L4-13 SMART on FHIR launch (maturity target outside the current scope) *(affects scoring)*

`retired-legacy.yaml` records only TEC-06 and L4-06 to L4-13. It does not record the TS1-1.xx,
TS2-2.xx and TS2-T.xx ranges (audit §10, item 1).

### Policy (thresholds, weights, critical flags)

- **2A**: Decrease the TS0 pass threshold from 100% to 85%. Critical items and ★ sub-items MUST still be Met. *(affects scoring)*
- Add ★ critical sub-items (`critical: subs`). A criterion fails critically when a ★ sub-item is Not Met or N/A. *(affects scoring)*
- Extend the pass rule: each critical item and each ★ sub-item MUST be Met. *(affects scoring)*
- For a Conformant result, Levels 0 to 3 MUST pass and no critical item can be Not Met. The DOH issues a certificate only for a Conformant result. *(affects scoring)*
- Add the threshold policy status Proposed / Approved. While the status is Proposed, a Conformant result shows as PROVISIONAL.
- Add the all-or-nothing scoring type *(affects scoring)*
- Add information-only items with weight 0: TS0-08, TS1-14, TS1-15, L3-12. Rev2 had one such item, TS1-1.43. *(affects scoring)*
- **L1-02**: Change the scoring from Count to All-or-nothing. A manual without one of the sections gets 0%. Rev2 gave partial credit, for example 5/7 = 71%. *(affects scoring)*
- **L1-04**: Decrease the tiers from three to two. The tier depends on how patient details get to the referral. A standalone system that receives patient details automatically gets 100% (was 75%). Manual encoding stays at 50%. *(affects scoring)*
- **L3-12**: Change the weight from 1 to 0 (information only) until the DOH sets a time limit for the recommendation of the consultant. Polling, push or IOL notification is accepted. Recording is OPTIONAL. *(affects scoring)*
- **TS0-01, TS0-02**: Make them critical, with all sub-items ★ *(affects scoring)*
- **TS0-07, TS1-16**: Make identifier format validation and patient de-duplication critical. They were W1 and not critical in Level 4. *(affects scoring)*
- **TS1, TS2**: Make Reason for Referral critical as TS1-06.4 ★ and TS2-05.4 ★ (was W1 in TS1-1.18 and TS2-2.15) *(affects scoring)*
- **TS1, TS2**: Make Priority critical as TS1-06.3 ★ and TS2-05.3 ★. Rev2 had no equivalent. TR-025 IG discrepancy, TDG to confirm. *(affects scoring)*
- **TS2**: Make Date & Time Received critical as TS2-13.2 ★ (was TS2-2.44, W1) *(affects scoring)*
- **TS1, TS2**: Change blood pressure from a critical Count criterion with 4 sub-items to one ★ sub-item (TS1-08.1, TS2-07.1) *(affects scoring)*
- **TS1-14**: Change Time Called to information only, W0 (was TS1-1.07, W1) *(affects scoring)*

### Corrections

- **TS1-06.2**: Map Referral Category to ServiceRequest.category, SNOMED CT 73770003 Emergency / 440655000 Outpatient (was ServiceRequest.priority)
- **TS1-06.4**: Map Reason for Referral to ServiceRequest.reasonCode (was ServiceRequest.category)
- **TS1-10**: Map Treatment Given to MedicationAdministration or Procedure (was Procedure.note) (TR-035)
- **TS1-03.3**: Map the referring care navigator to a separate PractitionerRole, N/A if the facility assigns no care navigator (was a second Practitioner.name) (TR-011, TDG to confirm)
- **TS2-10.2**: Map the receiving care navigator to Task.owner, N/A if the facility assigns no care navigator
- **TS1-14**: Map Time Called to ServiceRequest.occurrence[x]. It was Task.authoredOn, which is now the date / time sent in TS1-12.4. (TR-043, TDG to confirm)
- **TS1-13**: Clarify the Encounter mapping as ServiceRequest.encounter to ERefEncounter (TR-042)
- **TS1-07.2**: Code the working impression in ICD-10 by DOH decision (TR-031. The IG binding is "example". TDG to confirm.)
- **TS2-04.5**: Check Age as calculated from the birth date on the day of testing. Rev2 mapped Age to birthDate as a TS1 field.
- **TS1, TS2**: Replace the Action Point model with the Task status sequence. The referring EMR sets requested (TS1-12). Then the receiving EMR sets received, accepted or rejected, and completed (TS2-11). Each status has a time stamp (TS2-13). *(affects scoring)*
- **TS1-T.04**: Require Task referred-onward, a new ServiceRequest that replaces the earlier one, and a change to the status of the earlier one. Rev2 required only the status change. (TR-049)
- **TS2-11.3**: Change "decline / redirect with a reason" to "rejected with reason" (Task.status rejected + statusReason). The criterion does not name redirect now.
- **TS1**: Remove the prescribed HTTP verbs (PUT / POST). The vendor MAY use any create or update method.
- **TS1, TS2**: Accept any one form of server-side evidence: IOL log (for example OpenHIM), Inferno / official validator report, or raw FHIR request / response captured during the session. Rev2 required a validator GET / $validate with resource ID and screenshot.
- **TS1-T.01**: Remove "as one transaction". A transaction Bundle is RECOMMENDED. The interactions declared in L1-03 are accepted. The result is Met if each resource gets HTTP 200 / 201.
- **TS1-T.02**: Accept Inferno, and the validator report of the developer on the same payload, made during the session
- **TS0**: Values MUST match the official value set or registry. The vendor MAY get them by runtime look-up, scheduled sync or cached copy. Rev2 did not permit hardcoded values. The configured endpoint MUST be the DOH HIE terminology server. The evidence is $expand / $validate-code.
- **TS0-03**: Accept, as an alternative to prevention, an EMR that shows the SHR rejection and lets the user correct and send again. The evidence MUST show the rejected and the corrected submission. (Connectathon Issue #25)
- **L1-02**: Check only the content. The vendor MAY select the titles, order and format of the manual.
- **L1-04**: Accept a high-level diagram and any integration method. Demonstrate with the Test Data patient: name, birth date, sex, PhilSys, PhilHealth, address and contact appear without typing them again.
- **L1-05**: Map each topic to the Technical Baseline TB items, or give the reason for an equivalent control
- **L1-04, L1-05, TEC-07**: Accept any one evidence option: full document, redacted version with signed attestation, independent certification, or a view-only presentation recorded as "sighted". The evaluation never requires source code, keys or credentials.
- **TEC-01**: Require TLS 1.2 or higher, strong cipher suites and a valid certificate on each endpoint (TB-01, TB-02). A TLS scan verifies them. The evidence is a scan report for each endpoint (was a certificate screenshot).
- **TEC-02**: Add the TB-05 account protection tests (short password, repeated failed log-ins). Any identity method is accepted.
- **TEC-04**: Require the TB-08 audit fields. The vendor MAY select the storage format.
- **TEC-05**: Accept a session lock with re-authentication as an alternative to log-out. The default idle period MUST NOT be more than the TB-06 value.
- **TEC-07**: Accept a dated restore-test record, or a backup report from the provider with signed attestation, as an alternative to a live restore demonstration (TB-09)
- **L3-01**: Check the printed form by 6 sections, not by 44 fields. Add a referral status section. A section is Met only when each field in it prints correctly. *(affects scoring)*

### Text and guides

- **L0-01**: Change "use in the LHIE" to "use in the HIE"
- **L0-02, L1-01, L3-02, L3-10, L3-13**: Change CHD to DOH in the criterion text and purpose
- **L0-05, L0-06**: Change "Regional SCIV Team" to "Regional Validation Team"
- **L0-03**: Change "System Profile" to "System Profile Sheet"
- **TS0**: Rename the sheet from "TS0 Terminology Server Validation" to "TS0 Terminology & Registry Validation" (tab L2-A TS0-Terminology); intro names the official source per concept (SRC-01 to SRC-15) and drops the 100% default
- **TS1**: Drop "(PUT / POST)" from the sheet title (tab L2-B TS1-Submission); intro groups fields by FHIR resource and lists the evidence options
- **TS2**: Retitle the sheet "eReferral Retrieval and Status Update by Receiving Facility", dropping "(GET; PUT for Task status)" (tab L2-C TS2-Retrieval)
- **2D**: Retitle the sheet "Security, Reliability & Exception Handling" (tab L2-D System Resilience); intro adds outcome-based testing against TB-01 to TB-14, black-box testing and a not-a-VAPT disclaimer
- **L4**: Label sections Core-track (L4-01, L4-02, L4-10) and Maturity (L4-03, L4-04, L4-05, L4-11); intro replaces the Connectathon gap text
- **L3-03**: Rename section "Aggregated Data" to "Accuracy"; cite calculation rules IND-01, IND-02
- **L3-04 to L3-10**: Add the governing calculation rule to each validator's guide (IND-05 to IND-09)
- **L3-14**: Note that export totals are reconciled in L3-21
- **L4-05**: Point the lab file to TS1-09
- **TS0-04**: Allow a local translation in addition to, not instead of, the official display text
- **TS1**: Mark addresses as PSGC-coded (TS1-01.4, TS1-02.3, TS1-04.7); relabel "Temperature" and "Weight" as "Body temperature" and "Body weight"
- **TS2-06.4**: Relabel "Encounter (FHIR Requirement)" as "Referring encounter context (date / type of visit)"
- Add Observer to the validation role of every TS0 criterion, L1-04, L1-05, TEC-02 to TEC-05, L4-01 to L4-05 and L4-11
- Drop the default weight guidance ("critical items 2, others 1") from the Instructions; weights are set per criterion (0 to 3)
