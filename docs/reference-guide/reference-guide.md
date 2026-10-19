<!--
Technical Reference Guide — narrative source. The tables of Chapters 2 to 6 are not written here:
they are kept as structured data (registers/*.yaml, criteria/retired-legacy.yaml) and inserted where a
"register:" marker appears below, linked to the criteria that use them. Edit the prose here and the
tables in registers/.
-->

The explanations and reference tables behind the testing criteria: how to use the criteria (Chapter 1), the glossary and ID prefixes (Chapter 2), the Technical Baseline (TB-), the Terminology & Registry Sources (SRC-), the FHIR Traceability matrix (TR-), the Indicator Definitions (IND-) and the Certification & Revalidation rules (Chapter 7). Values marked PROPOSED take effect only after DOH approval, which is recorded in the scoring policy and shown on the Summary.

# Chapter 1 — Using the testing criteria

## 1.1 Purpose and scope

The workbook decides, level by level, whether an EMR SYSTEM — the product, as offered by its vendor or in-house developer — conforms to the national HL7 FHIR standards (PH Core and PHeReF Implementation Guides) and may be used in the Health Information Exchange (HIE) for electronic referral. Each level must be PASSED before the next one counts. Every score comes from evidence, not from the evaluator's opinion.

- **In scope:** the EMR system and its vendor/developer — application and commitment, product documentation, and tested conformance on the DOH test environment (sandbox), using test facilities and fictional test data.

- **Out of scope:** engagement and deployment at an actual health facility (contracts / SLA, privacy registration and impact assessments, data sharing agreements, ICT assets, connectivity, personnel, training). These are handled after the system passes.

- **Not a security assessment:** the security checks of Level 2D are CONFORMANCE testing of defined controls. Passing it is not equivalent to passing a vulnerability assessment and penetration test (VAPT) or a full cybersecurity assessment; TEC-14 only checks that an independent assessment exists.

- **Test roles:** "referring facility" and "receiving facility" are TEST facilities on the sandbox. The system is tested in both roles — sender (TS1) and receiver (TS2).

## 1.2 Process flow

| **Step**                                  | **What happens**                                                                                                                                                                                        | **Level** |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| **1.0 Registration**                      | The vendor/developer submits the letter of application and the System Profile (sections A–B); the Administrator logs the application.                                                                   | 0         |
| **2.0 Assessment of submitted documents** | Validators review the product documentation.                                                                                                                                                            | 1         |
| **3.0 Validation**                        | Scheduled testing on the sandbox, witnessed by Observers. Validators record results and evidence references and recommend the results to the Technical Lead.                                            | 2–4       |
| **4.0 Issuance of certificate**           | On approval of the Technical Lead once Level 3 is PASSED and no critical item is Not Met (Level 4 is the maturity target). Certificate details are recorded in System Profile section D. See Chapter 7. | —         |

## 1.3 The levels

| **Level / part**                                    | **What it proves**                                                                                                                                   | **Proposed pass mark** |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| **0 — Application & Commitment**                    | The vendor has formally applied, identified the system and named accountable contacts.                                                               | 90%                    |
| **1 — Product Documentation**                       | Process flows, user manual, supported FHIR interactions, architecture (integration level), security design, release management.                      | 85%                    |
| **2A — TS0 Terminology & Registries**               | Coded values and identifiers come from official sources (gate inside Level 2 — test first).                                                          | 85%                    |
| **2B — TS1 Submission**                             | A referral reaches the SHR complete and correct, without duplicating the patient.                                                                    | 85%                    |
| **2C — TS2 Retrieval**                              | The receiving facility finds, shows and updates the referral; every status is time-stamped.                                                          | 85%                    |
| **2D — Security, Reliability & Exception Handling** | Safeguards and access boundaries work when the system is used (TEC-), and wrong, duplicated or interrupted exchanges fail safely and recover (TS3-). | 85%                    |
| **3 — Reports & Dashboard**                         | Reports reproduce the known test referrals exactly under the Indicator Definitions (Chapter 6).                                                      | 85%                    |
| **4 — Advanced**                                    | Core-track (back-referral, multi-tier chain — move to Level 2 when the IG models them) and Maturity items.                                           | 75%                    |

## 1.4 How each criterion is scored

- **Binary:** Met (100%) or Not Met (0%).

- **Count:** each countable part is a sub-item (↳). Mark each sub-item Met / Not Met / Not Tested / N/A; Required, Achieved, Result, Score and Outstanding are calculated. Example: 8 of 10 audit actions logged (TEC-04) = 80%.

- **All-or-nothing:** marked like Count, but scores 100% only when all sub-items are Met (e.g., L1-02 user manual).

- **Tier** (L1-04 only): Fully integrated = 100%; Standalone – manual encoding = 50%; Not Met = 0%.

- **Critical (★ / "Yes"):** must be Met. A ★ sub-item that is Not Met or N/A makes the whole criterion a critical failure, even though the other sub-items still give partial credit.

- **Not Tested** counts as 0% and makes the sheet INCOMPLETE. **N/A** removes a non-critical item from the score; on a critical item it counts as Not Met. Always record the reason for N/A.

- **Weight:** critical items 2, others 1, information-only items 0. Weights are fixed before any evaluation starts.

## 1.5 Pass rule

A level is PASSED only when ALL THREE hold: (a) every applicable item has been tested, (b) every critical item and every ★ sub-item is Met, and (c) the level score reaches the threshold on the Summary sheet. Level 2 passes only when all four parts (2A–2D) pass. A level shows LOCKED until the level before it passes; its score is still shown so testing can run in parallel. While the thresholds are PROPOSED, a positive result is marked PROVISIONAL.

## 1.6 Design neutrality and the Technical Baseline

- **Freedom in design, verified by outcome:** criteria state WHAT must be achieved and how it is verified. Architecture, language, database, hosting, screen layout and integration method are the vendor's choice and are never scored.

- **Specific where it matters:** measurable minimums (encryption, password storage, log-in protection, session time-out, system-to-system authentication, audit log, backup, FHIR format, revocation, logging hygiene, vulnerability management) are in the Technical Baseline (Chapter 3). Meeting or exceeding them with any product is a Met.

- **Equivalent control:** a vendor using a different control it considers equal or stronger submits a justification with evidence together with the L1-05 document. The Technical Lead decides before testing starts and applies the decision to all applicants.

- **Named sources:** each coded value and identifier must come from the source named in Chapter 4; vendors choose how to connect (live look-up, scheduled sync or cached copy), not which source to use.

- **FHIR mapping:** every referral data element is traced to its profile, element, cardinality and binding in Chapter 5. Update Chapter 5 first whenever an IG version changes.

## 1.7 Evidence

- **Server-side evidence (Levels 2 and 4):** any ONE of (a) the Interoperability Layer transaction log on the sandbox (e.g., OpenHIM), (b) an Inferno or official FHIR validator report, or (c) the raw FHIR request / response payload captured during the session. A value shown on screen does not prove it was sent.

- **Evidence reference:** for each row, write in the Notes column what the result is based on — file or screenshot name, SHR resource ID (with version where relevant) and the IOL transaction ID if available. Keep the files in the Administrator's repository under the Application No.

- **Version traceability:** record the version/build actually tested, the IG versions and the testing dates in System Profile sections C and D. If the build changes during testing, the affected levels are re-tested (Chapter 7).

- **Proprietary documents** (L1-04, L1-05, TEC-07, TEC-08, TEC-11, TEC-14): the vendor chooses how to prove compliance — full document; redacted version plus signed attestation; independent certification or report; or a view-only presentation recorded as "sighted". Source code, keys, credentials and internal network details are never required.

- **Confidentiality:** evidence is used only for this validation and handled under a confidentiality undertaking signed by the Regional Validation Team. Only fictional test data is used.

- **Black-box first:** security and reliability outcomes are tested by using the system.

## 1.8 Test data

| **Section**                | **Content**                                                                                                                                                                       | **Used in**                    |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|
| **A — Test referral**      | Standard fictional values entered at the referring EMR and compared at the receiving EMR.                                                                                         | TS0, TS1, TS2                  |
| **B — Reconciliation set** | 10 known referrals with auto-calculated expected report values.                                                                                                                   | L3-03 to L3-16, L3-20.2        |
| **C — Level 3 edge cases** | 6 referrals pre-loaded by the DOH on the SHR with fixed timestamps in a separate reporting month (month boundary, late update, duplicate, cancelled, status change, filter case). | L3-17 to L3-21                 |
| **D — Error inputs**       | Error, duplicate, outage and security inputs (TD-D01 to TD-D22) with expected results fixed in advance.                                                                           | Level 2D: TS3-, TEC-09, TEC-13 |

All data are synthetic. The same values are used for every vendor in a test cycle; replace the \[bracketed\] placeholders with the official dummy facilities and identifiers issued by the DOH before testing.

## 1.9 Who does what — Regional Validation Team

| **Role**             | **Responsibility**                                                                                                                                                                                  |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Technical Lead**   | Supervises the evaluation, decides on equivalent controls, approves the validation results and the conformance decision.                                                                            |
| **Validators (2–3)** | From the DOH-CHD or partner agencies (e.g., PhilHealth, DICT). Conduct testing with the Validator's Guide, record results and evidence references, re-test corrected items, and recommend approval. |
| **Administrator**    | Processes the application, keeps the logbook and evidence repository, schedules sessions, invites Observers, facilitates signing of the certificate.                                                |
| **Observers (1–2)**  | From an LGU, hospital, academic / research institution or other agency. Witness the validation; do not score.                                                                                       |

## 1.10 Step by step

1.  Fill in the System Profile (sections A–C before testing; section D after).

2.  Prepare the Test Data sheet (Sections A–D) and confirm the DOH has loaded the Section C fixtures.

3.  Evaluate Level 0 → Level 4 in order; in Level 2 test TS0 first.

4.  For every row choose a Result, mark the sub-items, and write the evidence reference and any N/A reason in Notes.

5.  Review the Summary and the Outstanding column. Items needing compliance are listed automatically in section D of the Printed Evaluation Report; after the vendor corrects them, re-test the item (and the related level if the build changed) and update the result.

6.  Print the Printed Evaluation Report (A4) and sign the Sign-Off.

# Chapter 2 — Glossary

Every technical or non-basic term used in the workbook and in this guide, grouped by topic. Section 2.10 is a quick list of all abbreviations; section 2.11 explains the ID prefixes (such as TEC-, TS3-, TB-) and 2.12 lists retired IDs.

## 2.1–2.9 Glossary

<!-- register: glossary -->

## 2.10 Abbreviations — quick list

<!-- register: abbreviations -->

## 2.11 ID prefixes

<!-- register: prefixes -->

## 2.12 Retired and moved IDs

<!-- register: retired -->

# Chapter 3 — Technical Baseline (TB-01 to TB-14)

The criteria test OUTCOMES and leave the design to the vendor. This sheet states, only where a measurable bar is needed (aligned with RA 10173 and NPC Circular 2023-06 on the Security of Personal Data), the MINIMUM that the outcome must meet. Any product, architecture, programming language, database or hosting that meets or exceeds the baseline is accepted; the examples are illustrations, not endorsements.

Values marked "DOH policy default" are set by the DOH before any evaluation begins and are applied equally to all systems. Decisions on equivalent controls are recorded by the Technical Lead in the Notes column of the related criterion.

<!-- register: TB -->

# Chapter 4 — Terminology & Registry Sources (SRC-01 to SRC-15)

Implements the consultant's "Revision of L2" matrix. For every concept tested in Level 2A (TS0), this sheet names the authority, the code system / value set / identifier to use, and where to retrieve or verify it. HOW the system retrieves it (live look-up, scheduled sync or cached copy) remains the vendor's choice; the values must match the named source. Do not depend on external public servers such as tx.fhir.org (Connectathon Issue \#9).

<!-- register: SRC -->

# Chapter 5 — FHIR Traceability (TR-001 to TR-050)

Generated from the published StructureDefinition snapshots of PH Core v0.2.0 (UPM-NTHC/ph-core, build of 9 Sep 2026) and PHeReF v0.1.0 (UPM-NTHC/ph-ereferral, build of 9 Sep 2026). Cardinality, Must Support and binding are as published (including constraints inherited from PH Core). Interaction follows the IG example submission (a FHIR transaction Bundle: conditional PUT for Patient, Practitioner, PractitionerRole and Organization; POST for clinical resources); vendors may use any equivalent interaction declared in L1-03. When an IG version changes, update this sheet FIRST, then the criteria it points to. Status: Confirmed = matches the IG; TDG to confirm / IG discrepancy = open mapping issue (see Notes).

<!-- register: TR -->

# Chapter 6 — Indicator Definitions for Level 3 (IND-01 to IND-11) — PROPOSED

Each Level 3 indicator has ONE documented rule so that two conformant EMRs cannot legitimately compute the same indicator differently. Validators compare system reports with the Test Data Expected Results, which are calculated with these rules. IND-02 (duplicates) and IND-04 (status as of report run time) apply to every count. Rules marked PROPOSED take effect after DOH approval (recorded on the Summary sheet).

<!-- register: IND -->

# Chapter 7 — Certification & Revalidation — PROPOSED

A certificate is issued on approval of the Technical Lead when Level 3 is PASSED and no critical item is Not Met (Printed Evaluation Report, section D). Certificate number, date of approval, validity and conditions are recorded in System Profile section D and printed in section E of the report. Values below take effect after DOH approval.

## 7.1 Change classes and revalidation scope

| **Change class**            | **Definition**                                                                                                   | **Examples**                                                                                                                                                                                                                                                                                                                           | **Required action**                                                                                                                                                                           | **Re-test**                                                                                                                      |
|-----------------------------|------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| **Major change**            | A change that alters how the system exchanges, codes or secures referral data, or its architecture tier (L1-04). | New or changed FHIR resources, profiles or interactions; change of exchange method (e.g., from per-resource calls to transaction Bundle); new authentication method; move from built-in to separate eReferral module; new major version number; migration of database / hosting platform; change of PH Core / PHeReF IG major version. | Full revalidation before the new version is used in the HIE.                                                                                                                                  | Levels 1–3 (Level 4 if previously claimed)                                                                                       |
| **Minor change**            | A functional change in the eReferral module that does not alter the exchange method or security design.          | New or changed screens or fields mapped to existing elements; report / dashboard changes; workflow changes; terminology value-set update applied by the vendor.                                                                                                                                                                        | Partial regression test within 60 days (DOH policy default); notice to the DOH before deployment with release notes (L1-06).                                                                  | Affected TS1 / TS2 criteria + all ★ critical items of the affected part + TS3 + affected Security items + affected Level 3 items |
| **Patch**                   | A defect fix or security fix that does not change data elements, exchange or reports.                            | Bug fixes, performance fixes, security patches, UI text corrections.                                                                                                                                                                                                                                                                   | Notice to the DOH with release notes within 30 days; spot check at the next scheduled revalidation or if a problem is reported.                                                               | None (spot check of TS1-T.01 / T.02 optional)                                                                                    |
| **IG / terminology update** | The DOH announces a new PH Core / PHeReF IG version, terminology release or registry release for the HIE.        | IG technical correction or minor version; new SNOMED CT / PSGC release; new value-set version.                                                                                                                                                                                                                                         | Minor / technical correction: vendor conforms within the transition period and submits a notice (re-test of affected TS0 items). IG major version: revalidation within the transition period. | TS0 + affected TS1 / TS2 (minor); Levels 2–3 (major)                                                                             |

## 7.2 Validity, surveillance, suspension and revocation

| **Rule**                                         | **Policy**                                                                                                                                                                                                                                                                                                                                                                                  |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Certificate validity**                         | 2 years from the date of approval, or until the system version is replaced by a major change, or until the end of the transition period of the next IG major version — whichever comes first.                                                                                                                                                                                               |
| **Transition period for new national standards** | 6 months from the DOH announcement of a new IG major version (or as set by the DOH). Previously certified systems keep their certificate during the transition period and must be revalidated before it ends.                                                                                                                                                                               |
| **Surveillance**                                 | The DOH may spot-check a certified system in production (with facility consent) using fictional test data on the sandbox or the interoperability-layer logs.                                                                                                                                                                                                                                |
| **Suspension (temporary)**                       | \(1\) An unresolved Critical finding reported in production for more than 30 days; (2) a security incident attributable to the product until the root cause is fixed; (3) failure to submit the required notice for a minor change or patch; (4) failure to complete revalidation within the transition period. Facilities are notified; existing referrals continue, new deployments stop. |
| **Revocation (permanent)**                       | \(1\) Misrepresentation of the product, version or evidence; (2) persistent non-conformance after suspension (not corrected within 90 days); (3) deployment of an uncertified version presented as certified; (4) breach of the confidentiality or test-data undertaking (L0-04).                                                                                                           |
| **Re-application after revocation**              | Full validation from Level 0 after 6 months.                                                                                                                                                                                                                                                                                                                                                |

## 7.3 Required certificate content

- Certificate number and date of approval

- Product name and exact version / build validated (System Profile A.2, A.3) — matching every test run used

- Vendor / developer name (System Profile A.1) and applicant category

- Implementation Guide versions validated against: PH Core and PHeReF (System Profile D.2, D.3)

- Terminology / registry releases used (System Profile D.4)

- Scope / use case: electronic referral — sender (TS1) and receiver (TS2) roles; deployment type

- Validation level achieved (Summary) and date(s) of validation

- Date(s) of testing (System Profile C.8–C.12)

- Conditions, if any (open Minor findings accepted with conditions, with due dates)

- Validity period / expiry date and the revalidation triggers above

- Signature of the Technical Lead (approval) and reference to the Printed Evaluation Report

## 7.4 Certificate of Validation — proof of concept

> **Proof of concept.** The Certificate of Validation in this tool, its design, wording, signatories, security features and verification process are a proof of concept for discussion. They do not represent the actual DOH certificate or its implementation, and a certificate printed from this tool has no official standing. The notice comes from `notice` in `criteria/certificate.yaml`.

The web scorecard prints the Certificate of Validation from Output › Certificate and checks it from Output › Verify a certificate. Every part of it is kept as text in the repository, so a change is proposed and reviewed like any criterion (✎ Edit on each page):

| Part | Source |
| --- | --- |
| Title, subtitle, statement, microtext, signatories and their designations, verification address and its label, proof-of-concept notice, default orientation; the DOH seal and any further logos printed after it (e.g. the government advocacy logo or this system's logo) | `criteria/certificate.yaml` (image files under `tool/img/`) |
| Certificate fields (number, dates, signatory, supersedes, orientation, conditions) and the HL7 FHIR release | `criteria/profile.yaml` (System Profile) |
| Issued, revoked and superseded certificates, with their validation records | `criteria/certificates-issued.yaml` (register of issued certificates) |
| Generation, security emblem, verification page | `tool/cert.js` (fingerprint also in `scripts/common.py`) |

## 7.5 Generating a certificate

1. **Fill in the System Profile.** The application details (vendor / developer, applicant category, product name, exact version / build), the versions tested (HL7 FHIR release, PH Core and PHeReF IG versions) and the Certificate section (certificate number, date of issuance, expiry date, signatory and their name; optionally supersedes, orientation and conditions). If the expiry date is left blank it is 2 years from the date of issuance (PROPOSED).
2. **Open Output › Certificate.** The page checks what stands between the evaluation and a valid certificate: every detail filled in; valid dates; Levels 0 to 3 PASSED with no critical item open; pass thresholds approved; a released criteria version. While any item is open the certificate prints as a specimen, with SPECIMEN — NOT VALID across the page.
3. **Choose the orientation** (landscape or portrait). The layout fits one A4 page in both: long details first close up the spacing, then shrink the title and product name, then all the text, and the page warns when even the smallest size does not fit.
4. **Record the certificate.** The page computes the certificate fingerprint and shows the register entry to add, with the full validation record. The Administrator adds it to the register of issued certificates in one commit (or asks for it through a *Certificate record* issue). Until then the Verify page answers *Not found*.
5. **Print and sign.** Print / save as PDF prints the certificate edge to edge on white. It is valid only with the signature of the signatory (the Head of KMITS or the DOH CHD Regional Director) and the official seal.

The certificate shows: the certificate number in the upper right corner; the product name and exact version / build; the statement; a ruled table with the certificate number, date of issuance and validity, the developer and applicant category, the versions validated against (HL7 FHIR release, PH Core and PHeReF IG) and the result of each sheet of Levels 2 to 4 (the score when passed, "--" when not yet passed); the security emblem with the verification site and the certificate fingerprint; the signatory; and, in the foot line, the testing criteria version, its commit and the level achieved.

## 7.6 Security features

| Feature | What it does | How to check it |
| --- | --- | --- |
| **Certificate fingerprint** | The first 16 hexadecimal digits of SHA-256 over the certificate's details, its FHIR release and its Level 2 to 4 results. Any change to a printed detail gives a different fingerprint. The web scorecard and the check script compute it the same way, and the check fails when a register entry no longer matches its fingerprint. | Type it on the Verify page with the certificate number. |
| **Security emblem** | The QR code in front and the security rosette behind it, both drawn from the fingerprint, so neither can be moved from one certificate to another unnoticed. | Compare it with the emblem the Verify page redraws. |
| **QR code** | Opens the Verify page with the certificate number and fingerprint. QR error correction level L, the smallest code for the address, so its modules print large; the rosette behind it is kept faint enough not to disturb reading. | Scan it: the address must be the official verification site printed beside it. |
| **Tick ring** | 64 long and short ticks around the emblem spell the fingerprint's 64 bits, clockwise from the ▼ mark. | Compare tick for tick with the Verify page. |
| **Guilloche** | The lobed ring of the emblem (6 to 14 lobes, counted on the Verify page), the interlaced border band and the corner rosettes, all drawn from the fingerprint, so every certificate has its own pattern. | Count the lobes; compare the pattern. |
| **Microtext** | Very small text along the frame, including the certificate number. | Read it with a magnifier: it blurs on photocopies and scans. |
| **Register of issued certificates** | The authority for every certificate: an entry is added, revoked or superseded only by a reviewed commit, so the history of each certificate is kept. | The Verify page answers from it. |

The fingerprint is not a digital signature: the method is public, so anyone can compute a fingerprint and draw a matching emblem. What a forger cannot do is add an entry to the register; authenticity therefore comes from the register, and the security features make a paper that does not match its entry easy to spot.

## 7.7 Verifying a certificate

1. **Open the Verify page.** Scan the QR code (check that the address is the verification site printed on the certificate; a certificate printed from a release points to the draft scorecard, where the register keeps growing, and one printed from a draft or branch preview points to that build), or open Output › Verify a certificate on the official site you know and type the certificate number and the certificate fingerprint.
2. **Read the answer.** *Valid* (recorded and within its validity period), *Expired*, *Superseded* (replaced by a later certificate, which is named), *Revoked* (with the reason), *Not found* (not in the register: issued after this version of the page, or not genuine), *Fingerprint does not match* (the paper or the code was altered, or the fingerprint mistyped) or *Register entry inconsistent*.
3. **Compare every detail** shown with the paper: product, exact version / build, vendor, dates, versions validated against, results, signatory. A difference means the paper was altered.
4. **Compare the security emblem** with the one the page redraws: scan the code; the ticks clockwise from the ▼ mark; the number of lobes; the slant of the faint lines.
5. **Check the microtext** with a magnifier.

The page also shows the validation record: the evaluation details, the status of each level and the result of every sheet. For a valid certificate it offers a **register copy**: the certificate printed again from its register entry, in either orientation, marked REGISTER COPY — NOT VALID WITHOUT SIGNATURE AND SEAL. It serves as a reference copy; only the signed and sealed original is the certificate.

## 7.8 Register of issued certificates

`criteria/certificates-issued.yaml` lists every issued certificate. Each change is one commit, so the history of every certificate is kept in the repository:

| Event | Change | Commit message |
| --- | --- | --- |
| Issue | Add the entry shown on Output › Certificate (or ask through a *Certificate record* issue) | `cert: record <number>` |
| Revoke | Set `status: revoked` and add `reason` | `cert: revoke <number> (<reference>)` |
| Re-issue after a re-evaluation | Record the new certificate with `supersedes: <old number>` | `cert: record <new number>` |

An entry holds the printed details, the FHIR release and the Level 2 to 4 results (covered by the fingerprint), the fingerprint, the status and the validation record: the evaluation details (application number, evaluation type, date(s) of testing, deployment model, terminology release, conducting office, signatory's designation, conditions), the status of every level, and for every sheet of Levels 0 to 4 its score, pass mark, status, criterion counts (met, partial, not met, N/A, not tested, info only), critical items not met and the criteria still needing compliance. The validation record is the benchmark of the system; it is not printed and not part of the fingerprint, and the check script makes sure its counts add up and match the printed results.

Never edit the details of a recorded entry: the check fails when they no longer match the fingerprint. Issue a new certificate that supersedes it instead.

## 7.9 Sample certificate for reviewers

The register holds one sample certificate, **SAMPLE-2026-0001** (marked `sample: true`), with fictional data. It was never issued. Reviewers can use it to try the process end to end: open Output › Verify a certificate, choose *verify it* next to the sample (or type the number and its fingerprint), read the answer and the validation record, compare the security emblem, and print the register copy, which is marked SAMPLE — NOT A REAL CERTIFICATE. The sample is generated by the same code as a real certificate, so its fingerprint and validation record pass the same checks.
