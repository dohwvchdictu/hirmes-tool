**HIE System Validation**

Technical Reference Guide

Companion to the workbook **HIE_System_Validation_Testing_Criteria_rev9.xlsx** · Revision 9 · October 2026 · DRAFT for DOH review

The workbook is the scoring tool and is kept short on purpose. This guide holds the explanations and reference tables the workbook points to: the full instructions, the glossary, the Technical Baseline (TB-), the Terminology & Registry Sources (SRC-), the FHIR Traceability matrix (TR-), the Indicator Definitions (IND-) and the Certification & Revalidation rules. Values marked PROPOSED take effect only after DOH approval, which is recorded on the workbook's Summary sheet.

## Contents

- Chapter 1 — Using the testing criteria

- Chapter 2 — Glossary and ID prefixes

- Chapter 3 — Technical Baseline (TB-01 to TB-14)

- Chapter 4 — Terminology & Registry Sources (SRC-01 to SRC-15)

- Chapter 5 — FHIR Traceability (TR-001 to TR-050)

- Chapter 6 — Indicator Definitions for Level 3 (IND-01 to IND-11)

- Chapter 7 — Certification & Revalidation

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

- **Outcome, not design:** criteria state WHAT must be achieved and how it is verified. Architecture, language, database, hosting, screen layout and integration method are the vendor's choice and are never scored.

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

## 2.1 Validation process and roles

| **Term**                                          | **Meaning**                                                                                                                                                                          |
|---------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Validation process**                            | The four steps this tool follows: 1.0 Registration, 2.0 Assessment of submitted documents, 3.0 Validation (testing), 4.0 Issuance of certificate.                                    |
| **Applicant**                                     | The vendor or in-house developer that applies to have its EMR system validated.                                                                                                      |
| **Vendor / developer**                            | The company (third-party EMR provider) or the facility's own IT team (in-house developer) that builds and maintains the EMR system.                                                  |
| **Third-party EMR provider / in-house system**    | Applicant categories: a commercial product offered to many facilities, or a system developed by or for one facility / LGU.                                                           |
| **Regional Validation Team**                      | The team that conducts the evaluation: 1 Technical Lead, 2 to 3 Validators, 1 Administrator and 1 to 2 Observers. Recorded in System Profile section C.                              |
| **Technical Lead**                                | Supervises the evaluation, decides on equivalent controls, and approves the validation results and the conformance decision.                                                         |
| **Validator**                                     | Conducts the testing using the Validator's Guide, records results and evidence references, re-tests corrected items and recommends approval.                                         |
| **Administrator**                                 | Processes the application, assigns the Application No., keeps the logbook and evidence repository, schedules sessions, invites Observers and facilitates signing of the certificate. |
| **Observer**                                      | A representative of an LGU, hospital, academic or research institution or other agency who witnesses the validation to ensure unbiased processing. Observers do not score.           |
| **Conducting office**                             | The DOH office or region that conducts the validation (System Profile C.14); printed on the report letterhead.                                                                       |
| **Application No.**                               | The reference number the Administrator assigns when the application is registered (System Profile A.0).                                                                              |
| **Letter of application**                         | The signed letter by which the vendor formally applies for validation (L0-01).                                                                                                       |
| **Authorized signatory / proof of authority**     | The officer allowed to sign for the company, shown by a document such as a secretary's certificate, board resolution or office order.                                                |
| **Undertaking**                                   | A signed promise by the vendor — here, to follow the IGs, to be re-tested after changes, and to use only test data (L0-04).                                                          |
| **Attestation (signed)**                          | A signed statement by an authorized officer that something is true (e.g., that backups are encrypted), accepted as evidence when the full document is confidential.                  |
| **Confidentiality undertaking**                   | A signed promise by the Regional Validation Team to use the vendor's evidence only for this validation and keep it private.                                                          |
| **Coordination meeting**                          | The first meeting between the vendor's contact persons and the Regional Validation Team before testing (L0-05).                                                                      |
| **Sign-Off**                                      | The signature section of the Printed Evaluation Report; names come from System Profile section C.                                                                                    |
| **Conforme**                                      | Signature of the vendor's authorized signatory acknowledging the evaluation result.                                                                                                  |
| **Certificate of conformance**                    | The document issued after approval stating that a specific product version passed Levels 0 to 3 (see Chapter 7).                                                                     |
| **Conformance / conformant**                      | Meeting the rules of the standard. A system is conformant for use in the HIE when Levels 0 to 3 are PASSED and no critical item is Not Met.                                          |
| **Revalidation**                                  | Repeating the validation (fully or partly) after a new major release, a change in the IGs, or another trigger in Chapter 7.                                                          |
| **Retest / regression test**                      | Retest: testing a failed item again after the vendor corrects it. Regression test: re-testing related items to make sure a change did not break them; needed when the build changes. |
| **Deployment type (cloud / on-premise / hybrid)** | Where the system runs: on an internet provider's servers (cloud), on the facility's own servers (on-premise), or both (hybrid).                                                      |
| **Certificate validity**                          | How long a certificate remains valid before revalidation is due (proposed: 2 years or until a major change / IG major version).                                                      |
| **Release / version / build**                     | A release is a published version of the software; the version or build number identifies exactly which code was tested (System Profile A.3 and D.1).                                 |
| **Release notes**                                 | The vendor's list of what changed in a version (L1-06).                                                                                                                              |
| **Major change / minor change / patch**           | Change classes that decide whether a new version needs full revalidation, partial regression testing or only a notice (Chapter 7).                                                   |
| **Transition period**                             | The time allowed for certified systems to adopt a new IG version before revalidation is due (proposed: 6 months).                                                                    |
| **Surveillance**                                  | Spot checks of a certified system in production to confirm it still conforms.                                                                                                        |
| **Suspension / revocation**                       | Temporary (suspension) or permanent (revocation) withdrawal of a certificate for the reasons listed in Chapter 7.                                                                    |
| **Proposed (policy value)**                       | A threshold, default or rule drafted in this tool that takes effect only after DOH approval is recorded on the Summary sheet.                                                        |
| **Provisional result**                            | A conformance result shown while the pass thresholds are still PROPOSED.                                                                                                             |
| **DOH policy default**                            | A value (e.g., idle time-out of 15 minutes) set by the DOH before evaluation and applied equally to all systems; may be adjusted only by the DOH.                                    |
| **Equivalent control**                            | A different security measure the vendor considers equal to or stronger than the Technical Baseline; accepted only if the Technical Lead approves it before testing.                  |
| **Connectathon**                                  | An interoperability testing event where vendors exchange data with each other; items tagged "(Connectathon Issue \#n)" come from the June 2026 PHeReF Connectathon issue log.        |

## 2.2 Workbook, scoring and reporting terms

| **Term**                                            | **Meaning**                                                                                                                                                                                                                   |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Level**                                           | One of five gated stages (0 to 4). Each must be PASSED before the next counts.                                                                                                                                                |
| **Gate**                                            | A level or part that must be passed before the next one counts. TS0 is the gate inside Level 2.                                                                                                                               |
| **Part (2A to 2D)**                                 | The four sub-sections of Level 2: 2A TS0 Terminology & Registries, 2B TS1 Submission, 2C TS2 Retrieval, 2D Security, Reliability & Exception Handling.                                                                        |
| **Test Scenario (TS)**                              | A scripted test performed on the sandbox: TS0 terminology, TS1 submission, TS2 retrieval, TS3 exception (error-path) scenarios. Not a real-world use of the EMR.                                                              |
| **TEC**                                             | Prefix of the TECHNICAL security and reliability criteria in Level 2D (TEC-01 to TEC-14), e.g., encryption, accounts, roles, audit log, backup.                                                                               |
| **TS3 (exception scenarios)**                       | The error-path tests in Level 2D (TS3-01 to TS3-09): missing or malformed data, invalid references, duplicate submission, interruption and retry, partial failure, service outage, credential failure, receiving-side outage. |
| **Core-track / Maturity**                           | Level 4 tags. Core-track items are fundamental and will move to Level 2 when the IG models them; Maturity items stay optional targets.                                                                                        |
| **Criterion / Ref ID**                              | One requirement row with its own ID (e.g., TS1-04). IDs are never renumbered or reused.                                                                                                                                       |
| **Sub-item (↳)**                                    | One countable part of a Count criterion, with its own ID (e.g., TS1-04.2).                                                                                                                                                    |
| **Critical criterion (★ / "Yes")**                  | A criterion that must be Met for the level to pass, whatever the score.                                                                                                                                                       |
| **★ Critical sub-item**                             | A sub-item that must be Met; if it is Not Met or N/A the whole criterion counts as a critical failure, although other sub-items still give partial credit. Shown as "★ subs" in the Critical column of the parent.            |
| **Binary scoring**                                  | Met = 100%, Not Met = 0%.                                                                                                                                                                                                     |
| **Count scoring**                                   | Partial credit: score = sub-items Met ÷ applicable sub-items (e.g., 8 of 10 = 80%).                                                                                                                                           |
| **All-or-nothing scoring**                          | Marked like Count, but 100% only when every sub-item is Met; otherwise 0%.                                                                                                                                                    |
| **Tier scoring / integration level**                | Used only for L1-04: Fully integrated = 100%; Standalone – manual encoding = 50%; Not Met = 0%.                                                                                                                               |
| **Fully integrated / standalone – manual encoding** | Fully integrated: patient details already in the EMR reach the referral without re-typing. Standalone – manual encoding: some details must be typed again.                                                                    |
| **Info only (W0)**                                  | An item recorded for information, with weight 0, that does not affect the score.                                                                                                                                              |
| **Weight (W)**                                      | How much a criterion counts in the score: critical items 2, others 1, information-only 0.                                                                                                                                     |
| **Required (n) / Achieved (n)**                     | For Count criteria: number of applicable sub-items / number Met (calculated).                                                                                                                                                 |
| **Result**                                          | The evaluator's choice for a row (Met, Not Met, Not Tested, N/A, or the Tier level); for Count criteria it is calculated ("Counted").                                                                                         |
| **Not Tested**                                      | Not yet evaluated; scores 0% and makes the sheet INCOMPLETE.                                                                                                                                                                  |
| **N/A (not applicable)**                            | Removes a non-critical item from the score; on a critical item it counts as Not Met. The reason must be written in Notes.                                                                                                     |
| **Outstanding**                                     | The column that lists automatically which sub-items still need compliance.                                                                                                                                                    |
| **Needs compliance**                                | A criterion or sub-item that is Not Met or only partly met; listed automatically in report section D.                                                                                                                         |
| **Threshold / pass mark**                           | The minimum level score needed to pass (Summary column D).                                                                                                                                                                    |
| **PASSED / NOT PASSED / INCOMPLETE / LOCKED**       | Sheet and level statuses: all tested, critical items Met and threshold reached / a condition failed / some items Not Tested / previous level not yet passed.                                                                  |
| **Evaluation progress**                             | Share of items already evaluated (not the score).                                                                                                                                                                             |
| **Count register**                                  | The live table on the Summary sheet that counts criteria, critical items and sub-items per part; quote these figures in presentations.                                                                                        |
| **Developer's Guide / Validator's Guide**           | For each row: what the vendor must prepare or implement / the steps the Validators follow to verify it.                                                                                                                       |
| **Evidence / evidence reference**                   | What a result is based on, written in the Notes column: file or screenshot name, SHR resource ID and version, IOL transaction ID.                                                                                             |
| **Evidence option (documents)**                     | The ways a vendor may prove a confidential design: full document, redacted copy plus signed attestation, independent certification, or view-only presentation.                                                                |
| **Redacted**                                        | With confidential parts blacked out or removed.                                                                                                                                                                               |
| **View-only presentation / "sighted"**              | The vendor shows a document on screen without handing it over; the Validator records it as "sighted".                                                                                                                         |
| **Server-side check / server-side evidence**        | Verification done on the Shared Health Record, not on the EMR screen, using one of: the Interoperability Layer log, a validator / Inferno report, or the raw request and response payload.                                    |
| **Black-box testing**                               | Testing by using the system as a user would, without seeing its source code or internals.                                                                                                                                     |
| **Design-neutral (outcome-based)**                  | A criterion states WHAT must be achieved, not HOW; the vendor's technology choices are never scored.                                                                                                                          |
| **Test Data**                                       | The fictional values and expected results in the Test Data sheet: Section A test referral, Section B 10 known referrals, Section C Level 3 edge cases, Section D error inputs.                                                |
| **Reconciliation set / reconciliation**             | Known test referrals whose expected report values are calculated in advance; reconciliation means checking that the system's reports equal those values.                                                                      |
| **Edge case / boundary case**                       | An unusual but valid situation (e.g., a referral at 23:50 on the last day of a month) used to check that rules hold at the limits.                                                                                            |
| **Pre-loaded fixtures**                             | Test records the DOH places on the SHR in advance with fixed timestamps (Test Data Section C).                                                                                                                                |
| **Placeholder \[bracketed value\]**                 | A value in brackets in the Test Data that must be replaced with the official dummy value issued by the DOH.                                                                                                                   |
| **Dummy / fictional / synthetic data**              | Made-up test values that do not belong to any real person or facility.                                                                                                                                                        |
| **Printed Evaluation Report**                       | The A4 report sheet that collects all results automatically for printing and signing; it has no input cells.                                                                                                                  |
| **Letterhead**                                      | The heading at the top of each report page (Republic of the Philippines · Department of Health · conducting office).                                                                                                          |
| **Retired / moved ID**                              | A criterion ID no longer used on its sheet; it is never reused (list in section 2.12).                                                                                                                                        |

## 2.3 Health care, referral and reporting terms

| **Term**                                                 | **Meaning**                                                                                                                                                        |
|----------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **eReferral (electronic referral)**                      | Sending a patient referral from one facility to another electronically through the HIE instead of on paper.                                                        |
| **Referring (initiating) facility / receiving facility** | The facility that sends the referral / the facility the patient is referred to. In testing these are TEST facilities on the sandbox.                               |
| **Back-referral**                                        | The receiving facility's report back to the original facility after care (final diagnosis, treatment, follow-up instructions).                                     |
| **Onward / multi-tier referral**                         | A receiving facility refers the patient further (e.g., primary → district → apex hospital); each step must stay linked to the previous one.                        |
| **Referral chain**                                       | The linked sequence of referrals for one patient episode.                                                                                                          |
| **Referral status**                                      | Where the referral stands: requested, received, accepted, rejected (declined), completed, cancelled; also referred onward.                                         |
| **Deferred / denied, redirected**                        | Report categories: the receiving facility declined the referral (deferred / denied) or sent the patient elsewhere (redirected).                                    |
| **Cancelled (revoked) referral**                         | A referral withdrawn by the referring facility before it is completed.                                                                                             |
| **Care navigator**                                       | The staff member assigned to coordinate a referral; at the receiving side recorded as the Task owner.                                                              |
| **Referral category**                                    | Emergency or Outpatient referral (PHeReF Referral Category value set).                                                                                             |
| **Priority**                                             | How urgent a referral is (e.g., routine, urgent, stat — "stat" means immediately).                                                                                 |
| **Reason for referral (service type)**                   | What is requested of the receiving facility: Consultation, Diagnostics, Procedure or Others.                                                                       |
| **Chief complaint**                                      | The patient's main problem in their own words (e.g., headache and blurred vision).                                                                                 |
| **Working impression**                                   | The referring clinician's provisional diagnosis, coded in ICD-10.                                                                                                  |
| **Clinical history**                                     | The relevant past and present medical history written by the referring clinician.                                                                                  |
| **Vital signs**                                          | Basic body measurements: blood pressure (BP), heart rate (HR), respiratory rate (RR), oxygen saturation (SpO2), body temperature and body weight.                  |
| **BP / HR / RR / SpO2**                                  | Blood pressure; heart rate (beats per minute); respiratory (breathing) rate per minute; oxygen saturation (% of oxygen in the blood).                              |
| **mmHg**                                                 | Millimetres of mercury — the unit of blood pressure (written mm\[Hg\] in UCUM).                                                                                    |
| **G2P1, 34 weeks AOG**                                   | Obstetric shorthand in the test case: gravida 2 (second pregnancy), para 1 (one previous delivery); AOG = age of gestation (pregnancy length) in weeks.            |
| **Severe pre-eclampsia**                                 | A dangerous pregnancy condition with very high blood pressure (ICD-10 O14.1); used as the fictional test diagnosis.                                                |
| **Initial stabilization**                                | First treatment given to make the patient safe before transfer.                                                                                                    |
| **Encounter**                                            | A patient visit or stay at a facility (e.g., the emergency visit at the referring facility).                                                                       |
| **Next of kin / accompanying person**                    | The relative or companion who comes with the patient or can be contacted.                                                                                          |
| **Civil status**                                         | Marital status (single, married, widowed, etc.).                                                                                                                   |
| **De-duplication (patient matching)**                    | Making sure the same patient exists only once on the SHR by matching PhilSys / PhilHealth identifiers before creating a new record (TS1-16).                       |
| **Time Called / mode of transportation**                 | When the receiving facility was called about the referral, and how the patient travels (e.g., ambulance); recorded for information only until the IG defines them. |
| **Laboratory result attachment**                         | A file (usually PDF) of lab results sent with the referral.                                                                                                        |
| **Professional signature**                               | The referring practitioner's signature on the referral, recorded with its date and time.                                                                           |
| **HCPN (Health Care Provider Network)**                  | A group of facilities organised under the Universal Health Care Act to provide coordinated care; the referring facility's network.                                 |
| **RHU / Infirmary / Level 1, 2, 3 hospital**             | Facility service capability: Rural Health Unit (primary care), infirmary, and hospital levels of increasing capability.                                            |
| **Facility ownership (government / private)**            | Whether a facility is publicly or privately owned (used in Level 3 reports).                                                                                       |
| **Linelist**                                             | A report listing each referral as one row.                                                                                                                         |
| **Aggregated data / aggregate report**                   | Summary counts (totals) rather than individual records.                                                                                                            |
| **Disaggregation**                                       | Breaking a total down by groups such as sex, age group, municipality or facility.                                                                                  |
| **Numerator / denominator**                              | The top and bottom of a calculated rate or average (e.g., total minutes ÷ number of referrals received).                                                           |
| **TAT (turnaround time)**                                | Minutes from the time a referral is sent to the time it is first received.                                                                                         |
| **Top morbidity**                                        | The most frequent diagnoses (working impressions) among referred cases, ranked.                                                                                    |
| **Dashboard**                                            | A summary screen of indicators for managers.                                                                                                                       |
| **De-identified**                                        | Data with names and identifiers removed so a person cannot be recognised.                                                                                          |
| **Reporting period / month rule**                        | Referrals are counted in the month of the date referred (ServiceRequest.authoredOn) in Philippine Standard Time (IND-01).                                          |
| **Indicator / indicator definition**                     | A measure shown in reports, and its documented calculation rule (Chapter 6).                                                                                       |
| **Pop-up / alert notification**                          | An on-screen message telling the receiving user that a new referral arrived, without manual refresh.                                                               |
| **Universal Health Care (UHC) Act**                      | Republic Act 11223 (2019), which calls for integrated, coordinated health services and networks.                                                                   |

## 2.4 Interoperability and FHIR terms

| **Term**                                                       | **Meaning**                                                                                                                                                                       |
|----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Interoperability**                                           | The ability of different systems to exchange data and use it correctly without re-typing.                                                                                         |
| **HIE (Health Information Exchange)**                          | The network through which facilities exchange patient and referral data using the national FHIR standards via the Shared Health Record.                                           |
| **SHR (Shared Health Record)**                                 | The central FHIR server where referrals and related records are stored and from which receiving facilities retrieve them.                                                         |
| **IOL (Interoperability Layer)**                               | The middleware between the EMRs and the SHR that routes, authenticates and logs every transaction (e.g., OpenHIM).                                                                |
| **OpenHIM**                                                    | Open Health Information Mediator — open-source interoperability-layer software that keeps a log of each transaction.                                                              |
| **Sandbox / test environment**                                 | The DOH test servers used for validation; only fictional data is used there.                                                                                                      |
| **Endpoint / base URL**                                        | The internet address of a server or service the EMR connects to.                                                                                                                  |
| **API (Application Programming Interface)**                    | A defined way for one system to request data or actions from another.                                                                                                             |
| **HL7**                                                        | Health Level Seven International — the organisation that publishes health data standards, including FHIR.                                                                         |
| **FHIR**                                                       | Fast Healthcare Interoperability Resources — the HL7 standard for exchanging health data as "resources" over the web.                                                             |
| **FHIR R4 (4.0.1)**                                            | Release 4 of FHIR, the version required by Technical Baseline TB-10.                                                                                                              |
| **IG (Implementation Guide)**                                  | A published set of FHIR rules for a country or use case.                                                                                                                          |
| **PH Core IG**                                                 | The Philippine base FHIR rules: patient, practitioner, organization, identifiers, addresses, etc.                                                                                 |
| **PHeReF IG**                                                  | The Philippine eReferral FHIR rules built on PH Core: referral request, task, clinical content, value sets.                                                                       |
| **TDG / CDG**                                                  | Technical Design Group / Clinical Design Group of the PHeReF IG project, which maintain the technical mappings and clinical content.                                              |
| **UPM-NTHC**                                                   | University of the Philippines Manila — National Telehealth Center, which hosts the PH Core and PHeReF IG source (GitHub) and the SNOMED CT National Release Center.               |
| **Resource**                                                   | One type of FHIR record, such as Patient or ServiceRequest. Each stored resource has a resource ID.                                                                               |
| **Resource ID / version**                                      | The server's identifier of a stored resource, and its version number (meta.versionId); old versions can be read through \_history.                                                |
| **Profile / StructureDefinition**                              | A profile constrains a FHIR resource for local use (which elements are required, which codes are allowed); it is published as a StructureDefinition.                              |
| **meta.profile**                                               | The element in which a resource declares which profile it follows (TS1-T.03).                                                                                                     |
| **Canonical URL**                                              | The permanent web address that identifies a profile, value set or code system (e.g., https://fhir.doh.gov.ph/pheref/StructureDefinition/ereferral-task).                          |
| **Snapshot**                                                   | The fully expanded form of a profile showing every element with its final rules; used to build the FHIR Traceability table.                                                       |
| **Element / element path**                                     | One field inside a resource, written as Resource.element (e.g., Patient.birthDate).                                                                                               |
| **Cardinality (0..1, 1..1, 0..\*, 1..\*)**                     | How many times an element may or must appear: minimum..maximum. 1..1 = exactly once (mandatory); 0..\* = optional, repeating.                                                     |
| **Mandatory element**                                          | An element with minimum cardinality 1; a resource without it is invalid.                                                                                                          |
| **Must Support (MS)**                                          | An IG flag: the sender must send the element when the data exists and the receiver must be able to use it.                                                                        |
| **Slice**                                                      | A named sub-type of a repeating element in a profile (e.g., PHCorePhilSysID and PHCorePhilHealthID of Patient.identifier; NhfrCode of Organization.identifier).                   |
| **Extension**                                                  | An extra element defined by an IG for data the base FHIR standard does not have (e.g., PWD registration, PSGC address parts).                                                     |
| **Binding / binding strength**                                 | The link between a coded element and its value set. Strength: required (only those codes), extensible, preferred or example (illustration only).                                  |
| **Fixed value**                                                | A value the profile requires exactly (e.g., ServiceRequest.intent = order).                                                                                                       |
| **Reference**                                                  | A link from one resource to another (e.g., ServiceRequest.subject → Patient).                                                                                                     |
| **Bundle / transaction Bundle**                                | A Bundle is a package of resources. A transaction Bundle is processed all-or-nothing: either every entry is saved or none.                                                        |
| **Interaction (create, read, update, search; POST, PUT, GET)** | The operations a system performs on a FHIR server: create (HTTP POST), update (HTTP PUT), read / search (HTTP GET).                                                               |
| **Conditional update / conditional create (If-None-Exist)**    | A create or update that first searches for an existing match (e.g., Patient by PhilSys number) so that no duplicate is made.                                                      |
| **Business identifier**                                        | An identifier assigned by the business process (e.g., a referral number), used to recognise the same referral across systems.                                                     |
| **Idempotent sending**                                         | Sending the same referral more than once leaves the same single result on the server.                                                                                             |
| **Polling / subscription / notification**                      | Ways the receiving EMR learns of new referrals: asking the server regularly (polling), registering to be told (subscription), or receiving a message from the IOL (notification). |
| **Payload / request / response**                               | The data sent to the server (request), what the server sends back (response), and the content they carry (payload).                                                               |
| **HTTP status code (2xx, 4xx, 401, 403)**                      | The server's reply code: 2xx = success (200 OK, 201 Created); 4xx = request error; 401 = not authenticated; 403 = not allowed.                                                    |
| **OperationOutcome**                                           | The FHIR resource a server returns to explain errors or warnings (e.g., why a submission was rejected).                                                                           |
| **CapabilityStatement**                                        | A FHIR resource (or equivalent document) listing which resources and interactions a system supports (L1-03).                                                                      |
| **\$validate**                                                 | A FHIR operation that checks a resource against its profile and reports errors.                                                                                                   |
| **\$expand**                                                   | A terminology-server operation that lists all codes of a value set.                                                                                                               |
| **\$validate-code**                                            | A terminology-server operation that checks whether one code belongs to a value set or code system.                                                                                |
| **Validator report / Inferno**                                 | Output of the official HL7 FHIR validator or of Inferno (an open-source FHIR testing tool) showing errors found in submitted resources.                                           |
| **Terminology server**                                         | A server that holds code systems and value sets and answers \$expand / \$validate-code requests; the DOH HIE terminology server runs Ontoserver.                                  |
| **Ontoserver**                                                 | A commercial FHIR terminology server used for the DOH HIE terminology server.                                                                                                     |
| **JSON / XML**                                                 | Text formats for structured data; FHIR resources are sent as JSON (application/fhir+json) or XML.                                                                                 |
| **UTF-8**                                                      | The standard character encoding that supports all letters, including ñ.                                                                                                           |
| **ISO 8601**                                                   | The international date-time format, e.g., 2026-10-14T09:30:00+08:00.                                                                                                              |
| **Philippine Standard Time (PST) / UTC**                       | Local time (UTC+8) / Coordinated Universal Time, the world reference time.                                                                                                        |
| **URI / URL**                                                  | Uniform Resource Identifier / Locator — a text identifier or web address (e.g., an identifier system).                                                                            |
| **Identifier system**                                          | The URI that says which numbering scheme an identifier belongs to (e.g., http://philsys.gov.ph/fhir/Identifier/philsys-id).                                                       |
| **Hardcoded**                                                  | Written directly into program code or screens instead of taken from the official source.                                                                                          |
| **Data type**                                                  | The kind of value an element holds (date, number, code, text).                                                                                                                    |
| **Malformed**                                                  | Not in the correct format (e.g., an impossible date, letters in a number).                                                                                                        |
| **Orphan / half-saved record**                                 | Part of a referral left on the server after a failed submission, without the rest of the referral.                                                                                |
| **Error path / negative test / exception scenario**            | A test that deliberately sends wrong or incomplete data or interrupts the exchange, to check the system fails safely.                                                             |
| **Partial failure**                                            | Some parts of a submission succeed and others fail.                                                                                                                               |
| **Queue / retry / fallback**                                   | Holding a referral to send later (queue), sending again after failure (retry), and the documented manual alternative when the system cannot send (fallback).                      |
| **Downtime / outage**                                          | A period when a server, service or network is unavailable.                                                                                                                        |
| **Cached copy / scheduled sync**                               | A local copy of a code list or registry kept by the EMR (cache), refreshed at set times (scheduled sync).                                                                         |
| **SMART on FHIR**                                              | A standard for launching apps inside an EMR with secure access to FHIR data (removed from Level 4 in Rev 6).                                                                      |
| **Traceability (FHIR Traceability matrix)**                    | The table linking each data requirement to its FHIR profile, element, rules and the criteria that test it (Chapter 5).                                                            |
| **IG discrepancy**                                             | A difference between this tool and the published IG that the TDG must resolve.                                                                                                    |
| **REF-n (TDG row)**                                            | Row numbers in the TDG's eReferral data mapping (e.g., REF-15 Time Called).                                                                                                       |

## 2.5 FHIR resources used in eReferral

| **Term**                                                                                                                                       | **Meaning**                                                                                                                   |
|------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| **ERef… profiles (ERefPatient, ERefServiceRequest, ERefTask, ERefPractitionerRole, ERefRelatedPerson, ERefEncounter, ERefDiagnosticReport …)** | The PHeReF profile names: "ERef" + the FHIR resource, i.e., the eReferral version of that resource with its Philippine rules. |
| **PHCore… profiles / PHCorePhilSysID, PHCorePhilHealthID**                                                                                     | The PH Core profile names, and the identifier slices for the PhilSys number and PhilHealth ID.                                |
| **ExampleERefSubmissionBundle**                                                                                                                | The example referral submission (transaction Bundle) published in the PHeReF IG; shows the expected interactions.             |
| **Patient**                                                                                                                                    | The person being referred: name, identifiers, birth date, sex, address, contacts.                                             |
| **Practitioner**                                                                                                                               | A health worker as a person (name, licence).                                                                                  |
| **PractitionerRole**                                                                                                                           | A practitioner's role at a specific facility (e.g., doctor at Facility A); used as the requester and as the care navigator.   |
| **Organization**                                                                                                                               | A health facility or network (name, NHFR code, address).                                                                      |
| **RelatedPerson**                                                                                                                              | A relative or companion of the patient (next of kin / accompanying person).                                                   |
| **ServiceRequest**                                                                                                                             | The referral itself: what is requested, by whom, for whom, why, how urgent.                                                   |
| **Task**                                                                                                                                       | Tracks the referral workflow and its status (requested, received, accepted, rejected, completed).                             |
| **Condition**                                                                                                                                  | A problem or diagnosis — chief complaint and working impression.                                                              |
| **Observation**                                                                                                                                | A measurement such as a vital sign.                                                                                           |
| **DiagnosticReport**                                                                                                                           | A laboratory or imaging report, which can carry the attached result file.                                                     |
| **MedicationAdministration / Procedure**                                                                                                       | Treatment given before referral — a medicine given / a procedure performed.                                                   |
| **Encounter**                                                                                                                                  | The visit at the referring facility during which the referral was made.                                                       |
| **Provenance**                                                                                                                                 | Who did what and when to a record — used for the professional signature and its date/time.                                    |
| **AuditEvent**                                                                                                                                 | A FHIR resource for audit-log entries (one accepted way to store the audit trail).                                            |
| **CodeSystem / ValueSet**                                                                                                                      | A full list of codes from one source / the subset of codes allowed for a specific field.                                      |

## 2.6 FHIR elements named in the criteria

| **Term**                                                          | **Meaning**                                                                                                                                                                           |
|-------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **identifier**                                                    | An ID number of a resource (e.g., Patient.identifier = PhilSys / PhilHealth number; Organization.identifier = NHFR code).                                                             |
| **name / telecom / address / gender / birthDate / maritalStatus** | Person or facility name; contact numbers / e-mail; address (with PSGC codes); administrative sex; date of birth; civil status.                                                        |
| **contact / contact.relationship**                                | A patient's next of kin or companion and how they are related.                                                                                                                        |
| **code / category**                                               | The main coded meaning of a record / its classification (e.g., ServiceRequest.category = Emergency or Outpatient).                                                                    |
| **subject**                                                       | The patient a record is about.                                                                                                                                                        |
| **requester / performer / owner**                                 | Who asks for the referral (referring PractitionerRole) / who is expected to perform it (receiving facility) / who is responsible for the Task (receiving facility or care navigator). |
| **focus**                                                         | The record a Task is about (Task.focus → the ServiceRequest).                                                                                                                         |
| **intent**                                                        | The kind of request; fixed to "order" for referrals.                                                                                                                                  |
| **status / statusReason / businessStatus**                        | Workflow state of a record / why it is in that state (e.g., reason for rejection) / a local workflow state such as "referred onward".                                                 |
| **authoredOn**                                                    | When the referral or task was created (date/time referred).                                                                                                                           |
| **lastModified / executionPeriod**                                | When the Task was last updated / when the work started and ended.                                                                                                                     |
| **reasonCode / reasonReference**                                  | Coded reason for referral / link to a Condition or Observation that explains it.                                                                                                      |
| **priority**                                                      | Urgency of the request (routine, urgent, asap, stat).                                                                                                                                 |
| **occurrence\[x\]**                                               | When the requested service should happen; per the IG comment, may hold Time Called.                                                                                                   |
| **supportingInfo / relevantHistory / replaces**                   | Links to supporting clinical records / to Provenance records / to the earlier referral that this one replaces (onward referral).                                                      |
| **value\[x\] / valueQuantity / component**                        | The measured value of an Observation, with its unit / the parts of a panel such as systolic and diastolic blood pressure.                                                             |
| **presentedForm**                                                 | An attached file (e.g., a PDF lab result) in a DiagnosticReport.                                                                                                                      |
| **signature / recorded**                                          | The digital signature in Provenance / the date-time it was recorded.                                                                                                                  |
| **note**                                                          | Free-text comment (used for clinical history).                                                                                                                                        |
| **\_history / meta.versionId**                                    | The list of previous versions of a resource / the current version number.                                                                                                             |

## 2.7 Code systems, value sets and registries

| **Term**                                                                                    | **Meaning**                                                                                                                                                         |
|---------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **EReferralPriority / EReferralReason / EReferralReceivingResponse**                        | PHeReF value sets for referral priority, reason for referral (service type), and the receiving facility's response (received, accepted, rejected, referred onward). |
| **PSGC API operations (provincesByRegion, municipalityByProvince, barangayByMunicipality)** | Look-up functions of the PSA PSGC service that return the provinces of a region, municipalities of a province and barangays of a municipality.                      |
| **DSWD API operations (getUBID, verifyPCN)**                                                | dxCLOUD functions to look up a Unified Beneficiary Database ID and to verify a PhilSys Card Number (PCN).                                                           |
| **PCN**                                                                                     | PhilSys Card Number — the number printed on the national ID card.                                                                                                   |
| **Code / code system / value set**                                                          | A code is a short identifier for a concept (e.g., 73770003 = Emergency); a code system is the full catalogue; a value set is the list allowed for one field.        |
| **Display text**                                                                            | The official human-readable label of a code.                                                                                                                        |
| **SNOMED CT**                                                                               | Systematized Nomenclature of Medicine — Clinical Terms; international clinical terminology used for practitioner role, referral category and reason for referral.   |
| **LOINC**                                                                                   | Logical Observation Identifiers Names and Codes; used for vital signs (e.g., 85354-9 blood pressure panel).                                                         |
| **ICD-10**                                                                                  | International Classification of Diseases, 10th revision (WHO); used for the working impression and top morbidity (e.g., J18.9, O14.1, I10, A09).                    |
| **UCUM**                                                                                    | Unified Code for Units of Measure (e.g., mm\[Hg\], /min, %, Cel for °C, kg).                                                                                        |
| **AdministrativeGender**                                                                    | FHIR value set for sex: male, female, other, unknown.                                                                                                               |
| **ContactPointSystem / ContactPointUse**                                                    | FHIR value sets for the type of contact (phone, e-mail …) and its use (home, work, mobile …).                                                                       |
| **MaritalStatus**                                                                           | FHIR value set for civil status.                                                                                                                                    |
| **TaskStatus / RequestPriority**                                                            | FHIR value sets for task states and request urgency.                                                                                                                |
| **RelatedPerson relationship type (v3 RoleCode)**                                           | HL7 version 3 codes for relationships (next of kin, spouse, parent, guardian …).                                                                                    |
| **HL7 v2 table 0203**                                                                       | HL7 version 2 list of identifier types used to label PhilSys / PhilHealth identifiers.                                                                              |
| **PSOC / PCW**                                                                              | Philippine Standard Occupational Classification (used for Barangay Health Worker) / Primary Care Worker code in the PHeReF practitioner-role list.                  |
| **Registry (national)**                                                                     | An official master list kept by a government agency (facilities, health workers, places).                                                                           |
| **NHFR**                                                                                    | National Health Facility Registry (DOH) — official list and codes of health facilities.                                                                             |
| **NHWR**                                                                                    | National Health Workforce Registry (DOH) — official list of health workers.                                                                                         |
| **PRC licence**                                                                             | Professional Regulation Commission licence number of a health professional.                                                                                         |
| **PSGC**                                                                                    | Philippine Standard Geographic Code (PSA) — official codes of regions, provinces, cities / municipalities and barangays.                                            |
| **Barangay**                                                                                | The smallest local government unit in the Philippines.                                                                                                              |
| **PhilSys number**                                                                          | The national ID number issued by the Philippine Identification System (PSA).                                                                                        |
| **PhilHealth ID (PIN)**                                                                     | The PhilHealth Identification Number of a member or dependent.                                                                                                      |
| **PWD registration**                                                                        | Registration as a person with disability; sent through a PH Core extension.                                                                                         |
| **DSWD UBD / Listahanan / Pantawid (4Ps)**                                                  | DSWD beneficiary databases: Unified Beneficiary Database, the national household targeting system, and the Pantawid Pamilyang Pilipino Program.                     |
| **dxCLOUD API**                                                                             | DSWD's data-exchange service; optional source for household / beneficiary IDs (TS0-08).                                                                             |
| **Release (of a code system or registry)**                                                  | A dated edition of a terminology or registry (e.g., PSGC 2024 release); the release used must match the DOH server.                                                 |

## 2.8 Security and reliability terms

| **Term**                                                                                                             | **Meaning**                                                                                                                                                                                         |
|----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Encryption in transit / at rest**                                                                                  | Scrambling data while it travels over the network (in transit) / while stored on disks and backups (at rest), so others cannot read it.                                                             |
| **HTTPS / TLS / SSL**                                                                                                | Secure web connection (HTTPS) using Transport Layer Security (TLS 1.2 or 1.3 required). SSL and TLS 1.0 / 1.1 are older, insecure versions.                                                         |
| **Certificate (TLS) / certificate authority (CA)**                                                                   | A digital document proving a server's identity, issued by a trusted certificate authority. Self-signed, expired or host-name-mismatched certificates are not accepted.                              |
| **Cipher suite / forward secrecy**                                                                                   | The set of encryption methods a TLS connection uses; forward secrecy (ECDHE / DHE key exchange) keeps past traffic safe even if a key is later stolen.                                              |
| **AES / AES-GCM / ChaCha20-Poly1305**                                                                                | Strong modern encryption methods (AES-128 or AES-256).                                                                                                                                              |
| **RSA / ECDSA**                                                                                                      | Methods used for certificate keys (RSA ≥ 2048-bit, ECDSA ≥ P-256).                                                                                                                                  |
| **RC4 / DES / 3DES / NULL / EXPORT ciphers**                                                                         | Weak or no-encryption methods that are not accepted.                                                                                                                                                |
| **MD5 / SHA-1 / SHA-256**                                                                                            | Hash functions. MD5 and SHA-1 are broken; a single fast SHA-256 is not acceptable for passwords.                                                                                                    |
| **Hash / salted adaptive hash**                                                                                      | A one-way fingerprint of a password; "salted adaptive" means a random value is added and the calculation is deliberately slow (Argon2id, bcrypt, scrypt, PBKDF2) — TB-04.                           |
| **Key / key management (KMS, HSM, vault)**                                                                           | Encryption keys must be stored separately from the data, e.g., in a key management service, a hardware security module (HSM) or a secrets vault.                                                    |
| **Full-disk / volume encryption (BitLocker, LUKS) / TDE**                                                            | Encrypting a whole disk (Windows BitLocker, Linux LUKS) or a database (transparent data encryption).                                                                                                |
| **Authentication / authorization**                                                                                   | Proving who you are (log-in) / what you are allowed to do.                                                                                                                                          |
| **MFA / OTP**                                                                                                        | Multi-factor authentication — a second proof besides the password, such as a one-time password (OTP) by app, SMS or e-mail.                                                                         |
| **SSO / LDAP / Active Directory / OpenID Connect**                                                                   | Ways to sign in with one central account: single sign-on, directory services, and a web sign-in standard.                                                                                           |
| **RBAC (role-based access control)**                                                                                 | Access by role: referring clinician, receiving clinician, administrator, report viewer (TEC-03).                                                                                                    |
| **Access boundary**                                                                                                  | The limit of what a user may see or do — by role and by facility (TEC-09).                                                                                                                          |
| **User enumeration**                                                                                                 | Discovering valid user names from different error messages; prevented by identical messages (TEC-09.1).                                                                                             |
| **Lock-out / throttling**                                                                                            | Blocking or slowing log-in after repeated failed attempts (TB-05).                                                                                                                                  |
| **Direct object reference (IDOR)**                                                                                   | Changing a record ID in a web address or API call to open someone else's record; must be blocked (TEC-09.3).                                                                                        |
| **Privilege escalation**                                                                                             | A user gaining rights they were not given (e.g., making themselves administrator) — must be impossible (TEC-09.4).                                                                                  |
| **Session / token / session time-out**                                                                               | A logged-in period; a token is the digital pass that represents it. Idle sessions end after the time-out (TB-06).                                                                                   |
| **Replay**                                                                                                           | Re-sending an old request or session to get access again; must be refused after log-out (TEC-10.1).                                                                                                 |
| **Revocation / deactivation**                                                                                        | Removing a user's or system's access; deactivated accounts must lose access within the TB-12 limit.                                                                                                 |
| **System-to-system authentication (OAuth 2.0 client credentials, SMART Backend Services, mutual TLS, API key, JWT)** | How the EMR proves its identity to the SHR without a person logging in; the method is issued by the SHR operator (TB-07). JWT = JSON Web Token, a signed digital pass.                              |
| **Secrets**                                                                                                          | Passwords, tokens and keys; must never appear in browser code, URLs, messages or logs.                                                                                                              |
| **Information leakage / stack trace / SQL**                                                                          | Showing internal details in errors: a stack trace is a programming error dump; SQL is the database query language.                                                                                  |
| **Audit trail / audit log**                                                                                          | A record of who did what and when (TB-08); must be append-only — entries cannot be edited or deleted.                                                                                               |
| **Security event**                                                                                                   | A security-relevant action such as a failed log-in, role change or account deactivation.                                                                                                            |
| **SIEM**                                                                                                             | Security Information and Event Management — a central system that collects and analyses logs.                                                                                                       |
| **NTP / synchronised clock**                                                                                         | Network Time Protocol — keeps server clocks accurate so log times can be trusted.                                                                                                                   |
| **Rate limiting / abuse control**                                                                                    | Limiting the number of requests a client can make, to protect an internet-facing API (TEC-13).                                                                                                      |
| **Man-in-the-middle (MITM)**                                                                                         | An attacker secretly intercepting a connection; prevented by verifying certificates.                                                                                                                |
| **Denial-of-service**                                                                                                | Making a service unavailable by flooding it with requests.                                                                                                                                          |
| **Reverse proxy / API gateway / load balancer / TLS termination**                                                    | Servers in front of an application that forward traffic, enforce security and handle the TLS connection.                                                                                            |
| **VAPT**                                                                                                             | Vulnerability assessment and penetration test — an independent security assessment that looks for weaknesses and tries to exploit them; required as evidence by TEC-14, not performed by this tool. |
| **Authenticated vulnerability scan**                                                                                 | An automated scan for known weaknesses run with a valid log-in, so it can see more of the system.                                                                                                   |
| **Critical / high finding (security)**                                                                               | The most serious weaknesses reported by a VAPT or scan.                                                                                                                                             |
| **Security conformance testing vs VAPT**                                                                             | This tool checks that defined controls work (black-box). It does not replace a VAPT or a full cybersecurity assessment.                                                                             |
| **Backup / restore / system-only data**                                                                              | Copies of data kept to recover from loss, and recovering them; system-only data = user accounts, roles, audit log and configuration that exist only in the EMR (TB-09, TEC-07).                     |
| **Privacy-by-design / privacy-by-default**                                                                           | Building privacy into the system and collecting / showing only the data needed by default (TB-11).                                                                                                  |
| **Data minimisation / retention / disposal / anonymisation**                                                         | Collecting only what is needed / keeping it only as long as required / deleting it securely / removing identity from it.                                                                            |
| **Lawful basis**                                                                                                     | The legal reason under the Data Privacy Act for processing personal data.                                                                                                                           |
| **Personal information / sensitive personal information**                                                            | Data that identifies a person; sensitive personal information includes health data and government IDs (RA 10173).                                                                                   |
| **DPO / PIA**                                                                                                        | Data Protection Officer / Privacy Impact Assessment — facility-level duties under the NPC rules, outside this tool.                                                                                 |
| **SLA (service level agreement)**                                                                                    | A contract stating the service levels a vendor commits to (e.g., support response time); facility-level, outside this tool.                                                                         |
| **Data sharing agreement**                                                                                           | A contract governing exchange of personal data between parties; facility-level, outside this tool.                                                                                                  |
| **Workstation / source IP**                                                                                          | The computer or network address from which an action was done (recorded in the audit log).                                                                                                          |
| **UI**                                                                                                               | User interface — the screens of the system.                                                                                                                                                         |
| **CSV / Excel / PDF / A4**                                                                                           | File formats for exported data (comma-separated values, spreadsheet), printable documents, and the paper size used for the report.                                                                  |

## 2.9 Agencies, laws, standards and tools

| **Term**                                | **Meaning**                                                                                                                              |
|-----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **DOH / CHD / ICTU**                    | Department of Health / Center for Health Development (DOH regional office) / Information and Communications Technology Unit.             |
| **DICT**                                | Department of Information and Communications Technology.                                                                                 |
| **PhilHealth**                          | Philippine Health Insurance Corporation.                                                                                                 |
| **PSA**                                 | Philippine Statistics Authority — issues PSGC and runs PhilSys.                                                                          |
| **DSWD**                                | Department of Social Welfare and Development.                                                                                            |
| **PRC**                                 | Professional Regulation Commission.                                                                                                      |
| **LGU**                                 | Local Government Unit.                                                                                                                   |
| **NPC / NPC Circular 2023-06**          | National Privacy Commission / its circular on the Security of Personal Data in government and private sectors.                           |
| **RA 10173 (Data Privacy Act of 2012)** | The Philippine law protecting personal information.                                                                                      |
| **RA 11223**                            | Universal Health Care Act.                                                                                                               |
| **WHO**                                 | World Health Organization (publishes ICD-10).                                                                                            |
| **NIST / NIST SP 800-52, 800-63B**      | US National Institute of Standards and Technology / its Special Publications on TLS configuration and digital identity (passwords, MFA). |
| **OWASP / ASVS**                        | Open Worldwide Application Security Project / its Application Security Verification Standard.                                            |
| **ISO/IEC 27001 / SOC 2**               | International information-security management standard / an independent audit report on a service provider's security controls.          |
| **RFC**                                 | Request for Comments — a published internet standard (e.g., for date-time formats).                                                      |
| **testssl.sh / nmap ssl-enum-ciphers**  | Free tools used to scan a server's TLS settings (TEC-01).                                                                                |
| **JavaScript**                          | The programming language running in web browsers; secrets must not be placed in it.                                                      |
| **GitHub**                              | The online service where the PH Core and PHeReF IG sources are published.                                                                |

## 2.10 Abbreviations — quick list

| **Abbreviation** | **Stands for**                                                            |
|------------------|---------------------------------------------------------------------------|
| **A4**           | International paper size (210 × 297 mm)                                   |
| **AES**          | Advanced Encryption Standard                                              |
| **AOG**          | Age of gestation                                                          |
| **API**          | Application Programming Interface                                         |
| **ASVS**         | Application Security Verification Standard (OWASP)                        |
| **BP**           | Blood pressure                                                            |
| **CA**           | Certificate authority                                                     |
| **CDG**          | Clinical Design Group                                                     |
| **CHD**          | Center for Health Development                                             |
| **CSV**          | Comma-separated values (file)                                             |
| **DES / 3DES**   | Data Encryption Standard (obsolete)                                       |
| **DHE / ECDHE**  | (Elliptic-curve) Diffie–Hellman ephemeral key exchange                    |
| **DICT**         | Department of Information and Communications Technology                   |
| **DOH**          | Department of Health                                                      |
| **DPO**          | Data Protection Officer                                                   |
| **DSWD**         | Department of Social Welfare and Development                              |
| **ECDSA**        | Elliptic Curve Digital Signature Algorithm                                |
| **EMR**          | Electronic Medical Record                                                 |
| **FHIR**         | Fast Healthcare Interoperability Resources                                |
| **GCM**          | Galois/Counter Mode (of AES)                                              |
| **HCPN**         | Health Care Provider Network                                              |
| **HIE**          | Health Information Exchange                                               |
| **HL7**          | Health Level Seven International                                          |
| **HR**           | Heart rate                                                                |
| **HSM**          | Hardware security module                                                  |
| **HTTP / HTTPS** | Hypertext Transfer Protocol / … Secure                                    |
| **ICD-10**       | International Classification of Diseases, 10th revision                   |
| **ICT / ICTU**   | Information and Communications Technology / … Unit                        |
| **ID**           | Identifier                                                                |
| **IDOR**         | Insecure direct object reference                                          |
| **IEC**          | International Electrotechnical Commission                                 |
| **IG**           | Implementation Guide                                                      |
| **IND**          | Indicator definition (Level 3 rule)                                       |
| **IOL**          | Interoperability Layer                                                    |
| **IP**           | Internet Protocol (address)                                               |
| **ISO**          | International Organization for Standardization                            |
| **JSON**         | JavaScript Object Notation                                                |
| **JWT**          | JSON Web Token                                                            |
| **KMS**          | Key management service                                                    |
| **L0–L4**        | Levels 0 to 4 of this tool                                                |
| **LDAP**         | Lightweight Directory Access Protocol                                     |
| **LGU**          | Local Government Unit                                                     |
| **LOINC**        | Logical Observation Identifiers Names and Codes                           |
| **LUKS**         | Linux Unified Key Setup (disk encryption)                                 |
| **MD5**          | Message Digest 5 (obsolete hash)                                          |
| **MFA**          | Multi-factor authentication                                               |
| **MITM**         | Man-in-the-middle                                                         |
| **MS**           | Must Support                                                              |
| **N/A**          | Not applicable                                                            |
| **NHFR**         | National Health Facility Registry                                         |
| **NHWR**         | National Health Workforce Registry                                        |
| **NIST**         | National Institute of Standards and Technology (US)                       |
| **NPC**          | National Privacy Commission                                               |
| **NTHC**         | National Telehealth Center (UP Manila)                                    |
| **NTP**          | Network Time Protocol                                                     |
| **OS**           | Operating system                                                          |
| **OTP**          | One-time password                                                         |
| **OWASP**        | Open Worldwide Application Security Project                               |
| **PBKDF2**       | Password-Based Key Derivation Function 2                                  |
| **PCN**          | PhilSys Card Number                                                       |
| **PCW**          | Primary Care Worker                                                       |
| **PDF**          | Portable Document Format                                                  |
| **PH Core**      | Philippine Core FHIR Implementation Guide                                 |
| **PHeReF**       | Philippine eReferral FHIR Implementation Guide                            |
| **PIA**          | Privacy Impact Assessment                                                 |
| **PIN**          | PhilHealth Identification Number                                          |
| **PRC**          | Professional Regulation Commission                                        |
| **PSA**          | Philippine Statistics Authority                                           |
| **PSGC**         | Philippine Standard Geographic Code                                       |
| **PSOC**         | Philippine Standard Occupational Classification                           |
| **PST**          | Philippine Standard Time (UTC+8)                                          |
| **PWD**          | Person with disability                                                    |
| **R4**           | FHIR Release 4                                                            |
| **RA**           | Republic Act                                                              |
| **RBAC**         | Role-based access control                                                 |
| **RC4**          | Rivest Cipher 4 (obsolete)                                                |
| **RFC**          | Request for Comments (internet standard)                                  |
| **RHU**          | Rural Health Unit                                                         |
| **RR**           | Respiratory rate                                                          |
| **RSA**          | Rivest–Shamir–Adleman (encryption method)                                 |
| **SHA**          | Secure Hash Algorithm                                                     |
| **SHR**          | Shared Health Record                                                      |
| **SIEM**         | Security Information and Event Management                                 |
| **SLA**          | Service level agreement                                                   |
| **SMART**        | Substitutable Medical Applications, Reusable Technologies (SMART on FHIR) |
| **SMS**          | Short Message Service (text message)                                      |
| **SNOMED CT**    | Systematized Nomenclature of Medicine — Clinical Terms                    |
| **SOC 2**        | System and Organization Controls 2 (audit report)                         |
| **SP**           | Special Publication (NIST)                                                |
| **SpO2**         | Peripheral oxygen saturation                                              |
| **SQL**          | Structured Query Language                                                 |
| **SRC**          | Terminology / registry source (Chapter 4)                                 |
| **SSL**          | Secure Sockets Layer (obsolete)                                           |
| **SSO**          | Single sign-on                                                            |
| **TAT**          | Turnaround time                                                           |
| **TB**           | Technical Baseline item (Chapter 3)                                       |
| **TD-D**         | Test Data Section D input                                                 |
| **TDE**          | Transparent data encryption                                               |
| **TDG**          | Technical Design Group                                                    |
| **TEC**          | Technical security & reliability criterion (Level 2D)                     |
| **TLS**          | Transport Layer Security                                                  |
| **TR**           | FHIR Traceability row (Chapter 5)                                         |
| **TS / TS0–TS3** | Test Scenario 0 to 3                                                      |
| **UBD**          | Unified Beneficiary Database (DSWD)                                       |
| **UCUM**         | Unified Code for Units of Measure                                         |
| **UHC**          | Universal Health Care                                                     |
| **UI**           | User interface                                                            |
| **UP / UPM**     | University of the Philippines / … Manila                                  |
| **URI / URL**    | Uniform Resource Identifier / Locator                                     |
| **UTC**          | Coordinated Universal Time                                                |
| **UTF-8**        | Unicode Transformation Format, 8-bit                                      |
| **V2 / V3**      | HL7 version 2 / version 3 standards                                       |
| **VAPT**         | Vulnerability assessment and penetration test                             |
| **VS**           | Value set                                                                 |
| **W / W0**       | Weight / weight 0 (information only)                                      |
| **WHO**          | World Health Organization                                                 |
| **XML**          | Extensible Markup Language                                                |

## 2.11 ID prefixes

| **Prefix**  | **Meaning**                                                                    | **Where**                           |
|-------------|--------------------------------------------------------------------------------|-------------------------------------|
| **L0-**     | Level 0 Application & Commitment criteria                                      | Workbook — L0 Application           |
| **L1-**     | Level 1 Product Documentation criteria                                         | Workbook — L1 Documentation         |
| **TS0-**    | Test Scenario 0 — Terminology & Registries (Level 2A)                          | Workbook — L2-TS0 Terminology       |
| **TS1-**    | Test Scenario 1 — eReferral Submission (Level 2B); TS1-T. = transaction checks | Workbook — L2-TS1 Submission        |
| **TS2-**    | Test Scenario 2 — eReferral Retrieval (Level 2C)                               | Workbook — L2-TS2 Retrieval         |
| **TEC-**    | TECHNICAL security & reliability criteria (Level 2D)                           | Workbook — L2-Security (upper part) |
| **TS3-**    | Test Scenario 3 — exception & error-path scenarios (Level 2D)                  | Workbook — L2-Security (lower part) |
| **L3-**     | Level 3 Reports & Dashboard criteria                                           | Workbook — L3 Reports               |
| **L4-**     | Level 4 Advanced Interoperability criteria (Core-track / Maturity)             | Workbook — L4 Advanced              |
| **xx-nn.n** | A ↳ sub-item of criterion xx-nn (★ = critical sub-item)                        | Workbook                            |
| **TD-D**    | Test Data Section D error / exception input                                    | Workbook — Test Data                |
| **C1–C6**   | Test Data Section C edge-case referrals                                        | Workbook — Test Data                |
| **TB-**     | Technical Baseline minimum specification                                       | Guide — Chapter 3                   |
| **SRC-**    | Terminology / registry source                                                  | Guide — Chapter 4                   |
| **TR-**     | FHIR Traceability row                                                          | Guide — Chapter 5                   |
| **IND-**    | Level 3 indicator calculation rule                                             | Guide — Chapter 6                   |

## 2.12 Retired and moved IDs

| **ID**       | **Revision** | **Action** | **Now tested in** | **Reason**                                                                                                   |
|--------------|--------------|------------|-------------------|--------------------------------------------------------------------------------------------------------------|
| **TEC-06**   | Rev 7        | Moved      | TS3-05            | Downtime handling now tested with retry / duplication checks in the TS3 exception scenarios of Level 2D.     |
| **L4-06**    | Rev 7        | Moved      | TS2-13            | Status timestamps are fundamental — now critical in Level 2.                                                 |
| **L4-08**    | Rev 7        | Moved      | TS1-16            | Patient de-duplication is fundamental — now critical in Level 2.                                             |
| **L4-09**    | Rev 7        | Merged     | TS0-06.2          | NHFR-sourced facility data checked with the NHFR critical sub-item.                                          |
| **TS2-11.5** | Rev 7        | Merged     | TS2-13.2          | Received date/time now checked in the status-history criterion.                                              |
| **L4-07**    | After Rev 2  | Moved      | TS0-07            | Identifier format validation (Connectathon Issue \#5) moved to TS0-07 as a critical item. Number not reused. |
| **L4-12**    | Rev 6        | Removed    | —                 | Official conformance suite (Inferno) — removed until an official PHeReF test kit exists.                     |
| **L4-13**    | Rev 6        | Removed    | —                 | SMART on FHIR launch — removed; maturity target outside current scope.                                       |

# Chapter 3 — Technical Baseline (TB-01 to TB-14)

The criteria test OUTCOMES and leave the design to the vendor. This sheet states, only where a measurable bar is needed (aligned with RA 10173 and NPC Circular 2023-06 on the Security of Personal Data), the MINIMUM that the outcome must meet. Any product, architecture, programming language, database or hosting that meets or exceeds the baseline is accepted; the examples are illustrations, not endorsements.

Values marked "DOH policy default" are set by the DOH before any evaluation begins and are applied equally to all systems. Decisions on equivalent controls are recorded by the Technical Lead in the Notes column of the related criterion.

| **Ref**   | **Area**                                                         | **Minimum baseline (must meet or exceed)**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **Type**                                                      | **Acceptable examples (non-exhaustive — any equivalent or stronger is accepted)**                                                                                                                                                                    | **Not acceptable**                                                                                                                                               | **How the Validators verify**                                                                                                                                                                       | **Related criteria**           | **Reference**                                                                                                                                                          |
|-----------|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **TB-01** | Encryption in transit — protocol & certificate                   | TLS 1.2 or higher on every endpoint used for the eReferral (TLS 1.3 recommended). HTTPS only — plain HTTP disabled or redirected to HTTPS. Valid certificate from a trusted certificate authority (or the CA designated by the DOH for the sandbox), unexpired, host name matching.                                                                                                                                                                                                                                                                                 | Fixed standard                                                | Any web server or reverse proxy, API gateway, load balancer or cloud TLS termination; public or commercial certificates.                                                                                                                             | SSL 2.0 / 3.0, TLS 1.0 / 1.1; plain HTTP; expired, mismatched or self-signed certificates on endpoints used for exchange.                                        | TLS scan of each endpoint (e.g., testssl.sh, nmap ssl-enum-ciphers, online TLS checker) — TEC-01.                                                                                                   | L1-05.3, TEC-01                | NPC Circular 2023-06 §11, §16 (secure encrypted links); NIST SP 800-52 Rev. 2; RFC 8446 (TLS 1.3)                                                                      |
| **TB-02** | Encryption in transit — cipher suites & keys                     | Forward-secret key exchange (ECDHE, or DHE ≥ 2048-bit) with authenticated encryption (AES-GCM or ChaCha20-Poly1305). Certificate keys RSA ≥ 2048-bit or ECDSA ≥ P-256.                                                                                                                                                                                                                                                                                                                                                                                              | Fixed standard                                                | The "modern" or "intermediate" TLS configuration profiles of current servers and cloud services.                                                                                                                                                     | RC4, DES, 3DES, NULL, EXPORT or anonymous cipher suites; RSA keys \< 2048-bit; MD5- or SHA-1-signed certificates.                                                | Same TLS scan as TB-01 — TEC-01.                                                                                                                                                                    | TEC-01                         | NIST SP 800-52 Rev. 2                                                                                                                                                  |
| **TB-03** | Encryption at rest                                               | Personal and health data held by the system — database, stored files / attachments and backups — encrypted with AES-128 or stronger (AES-256 recommended). Encryption keys stored separately from the encrypted data and never hard-coded in source code. Exports containing personal data (e.g., CSV / Excel, L3-14) can be protected (encrypted or password-protected archive) when they must leave the system on removable media.                                                                                                                                | Fixed standard                                                | Full-disk / volume encryption (e.g., BitLocker, LUKS, cloud volume encryption); database transparent data encryption; file- or field-level encryption; encrypted backup tools. Keys in a key management service, HSM, OS key store or secrets vault. | Unencrypted database or backup files; keys stored with the data or in source code; home-made or proprietary ciphers.                                             | Any one accepted evidence option (Instructions 4B): view-only demonstration, configuration screenshot with keys masked, cloud-provider / independent certification, or signed attestation — TEC-08. | L1-05.3, TEC-07, TEC-08, L3-14 | RA 10173 §20; NPC Circular 2023-06 §11 and §25 (files on removable / portable media must be encrypted); NIST SP 800-111                                                |
| **TB-04** | Password storage                                                 | Passwords stored only as salted hashes using an adaptive algorithm: Argon2id, bcrypt, scrypt, or PBKDF2 with a work factor per current OWASP guidance.                                                                                                                                                                                                                                                                                                                                                                                                              | Fixed standard                                                | Framework password hashers configured with one of these algorithms; or authentication delegated to an external identity provider that meets this baseline.                                                                                           | Plain text; reversible encryption; unsalted or fast hashes (MD5, SHA-1, single-pass SHA-256).                                                                    | Stored form of one TEST password shown view-only, or a signed attestation naming the algorithm with the framework configuration — TEC-08.                                                           | L1-05.3, TEC-08                | NPC Circular 2023-06 §11 (password strength, password policy); OWASP Password Storage Cheat Sheet; NIST SP 800-63B                                                     |
| **TB-05** | User authentication                                              | One account per user. Minimum password length 8 characters (12 or more recommended). Lock-out or throttling after no more than 10 consecutive failed log-in attempts. Default / vendor passwords must be changed at installation. Online access to patient data (sensitive personal information) uses a secure authentication mechanism — multi-factor authentication, or log-in only over encrypted links (TB-01) — and user rights are managed in the system's user-management tool. Multi-factor authentication recommended for administrator and remote access. | Fixed standard (lock-out count: DOH policy default)           | Local accounts, LDAP / Active Directory, single sign-on, OpenID Connect; authenticator apps or SMS / e-mail OTP for MFA.                                                                                                                             | Shared or generic accounts; default passwords left unchanged; unlimited log-in attempts.                                                                         | TEC-02 tests (short password, repeated failed log-ins, account list).                                                                                                                               | L1-05.1, TEC-02, TEC-03        | NPC Circular 2023-06 §11, §13 (access control, need-to-know), §16 (secure authentication, system management tool); NIST SP 800-63B                                     |
| **TB-06** | Session time-out                                                 | Idle sessions are logged out or locked (re-authentication required) after a period the facility can configure. Default: not more than 15 minutes.                                                                                                                                                                                                                                                                                                                                                                                                                   | DOH policy default (15 min)                                   | Application session time-out, OS screen lock integrated with the application, SSO session policy.                                                                                                                                                    | No time-out; time-out that cannot be configured; default above the DOH value.                                                                                    | TEC-05 idle test.                                                                                                                                                                                   | L1-05.1, TEC-05                | DOH policy setting; NPC Circular 2023-06 §13                                                                                                                           |
| **TB-07** | System-to-system authentication (EMR ↔ SHR / terminology server) | Use the authentication method issued by the HIE / SHR operator (DOH). Credentials and tokens are kept on the server side, never exposed in browser or mobile-app code, and sent only over TLS (TB-01).                                                                                                                                                                                                                                                                                                                                                              | Fixed standard (method set by the SHR operator)               | OAuth 2.0 client credentials / SMART Backend Services, mutual TLS, or API keys — whichever the SHR operator issues.                                                                                                                                  | Credentials embedded in client-side JavaScript or mobile apps; one credential shared by several facilities or vendors.                                           | Validator reviews the connection set-up during TS1 / TS2 and records it in the Notes of TS1-T.01.                                                                                                   | L1-05.1, TS1-T.01, TS0-07      | SHR / HIE connection guide (DOH); NPC Circular 2023-06 §20 (data sharing) when external registries / APIs (PSA, DSWD, PhilHealth) receive personal data                |
| **TB-08** | Audit log content                                                | Each entry records: user ID, date and time (Philippine Standard Time, or UTC with offset, from a synchronised clock such as NTP), action, patient / record affected, and source (workstation or IP). Entries cannot be edited or deleted by ordinary users. Authentication attempts and security events are logged and kept LONGER than general system logs; logs are backed up and archived (TB-09). Retention per the facility's policy, and longer when an incident is under investigation.                                                                      | Fixed standard                                                | Database audit table, append-only log files, FHIR AuditEvent, central log server / SIEM.                                                                                                                                                             | Logs editable by end users; entries without user or time; logging that can be switched off by end users.                                                         | TEC-04 action test (10 actions).                                                                                                                                                                    | L1-05.2, TEC-04                | NPC Circular 2023-06 §29 (logs retention); RA 10173 §20                                                                                                                |
| **TB-09** | Backup & recovery of system-only data                            | Automated backup of data held only in the system (user accounts / credentials, roles, audit trail, configuration) at least daily; backups encrypted (TB-03) and stored separately from the production system; restore demonstrated and the expected restoration time documented.                                                                                                                                                                                                                                                                                    | DOH policy default (daily)                                    | Database dumps or snapshots, cloud backup services, off-site or second-site copies.                                                                                                                                                                  | Backups only on the same disk / server; unencrypted backups; restore never tested.                                                                               | TEC-07: restore demonstration, dated restore-test record, or provider backup report + signed attestation.                                                                                           | L1-05.4, TEC-07                | NPC Circular 2023-06 §21 (business continuity: backup, restoration and remedial time); RA 10173 §20                                                                    |
| **TB-10** | FHIR & data format                                               | HL7 FHIR R4 (4.0.1); JSON (application/fhir+json), XML only if the SHR also accepts it; UTF-8; dates / date-times in ISO 8601 with time zone where the IG requires dateTime; the PH Core and PHeReF IG versions announced by the DOH for the test cycle.                                                                                                                                                                                                                                                                                                            | Fixed standard (IG versions announced by DOH)                 | Any FHIR library, server or platform (open-source or commercial) or a custom implementation.                                                                                                                                                         | Proprietary formats in place of FHIR; resources that fail \$validate.                                                                                            | TS1-T.02 (\$validate = 0 errors) and TS1-T.03 (meta.profile).                                                                                                                                       | L1-03, TS1-T.02, TS1-T.03      | HL7 FHIR R4; PH Core IG; PHeReF IG                                                                                                                                     |
| **TB-11** | Privacy-by-design & privacy-by-default                           | By default only the data needed for the referral is collected and shown; functions without a lawful basis can be switched off; dashboards show de-identified, aggregated data (L3-11); the database is reachable only through the application and authorised administration tools (no shared database log-ins for users); the system supports configurable retention periods and secure deletion or anonymisation at the end of retention.                                                                                                                          | Fixed standard (retention periods: facility policy)           | Role-based views and field visibility, configurable optional fields, scheduled purge / anonymisation jobs, documented disposal procedure.                                                                                                            | Hidden or unnecessary data collection switched on by default; no way to delete or anonymise records at end of retention; end users given direct database access. | L1-05.5 documentation; L3-11 dashboard test; TEC-03 role test.                                                                                                                                      | L1-05.5, L3-11, TEC-03         | NPC Circular 2023-06 §7 and §8 (privacy-by-design / by-default, privacy engineering), §9 (retention), §12 (database access via authorised programs), §28–30 (disposal) |
| **TB-12** | Account revocation & session invalidation                        | Log-out invalidates the session on the server. Expired sessions / tokens are refused. A deactivated account cannot start a new session immediately, and its active sessions end within 15 minutes (DOH policy default). Access tokens for users expire within the idle time-out (TB-06) or are refreshed only while the user is active.                                                                                                                                                                                                                             | Fixed standard (revocation window: DOH policy default 15 min) | Server-side session store, short-lived tokens with server-side revocation list, SSO / identity-provider session policies.                                                                                                                            | Log-out that only clears the browser; tokens that remain valid for days; deactivated users who keep working until their session ends naturally.                  | TEC-10 black-box test (log-out replay, expiry, deactivation).                                                                                                                                       | TEC-10                         | NPC Circular 2023-06 §13; OWASP ASVS V3 (Session Management)                                                                                                           |
| **TB-13** | Error handling & logging hygiene                                 | Users see generic error messages (no stack traces, SQL, file paths, server or library versions). Secrets (passwords, tokens, keys) are never written to messages or logs. Application / debug logs exclude full patient identifiers and clinical content unless required for the TB-08 audit log; debug logging is off in production.                                                                                                                                                                                                                               | Fixed standard                                                | Framework production error pages, structured logging with field masking, log redaction filters.                                                                                                                                                      | Stack traces or SQL shown to users; tokens in URLs or logs; full PhilHealth / PhilSys numbers in debug logs.                                                     | TEC-11 (error messages, client-side inspection, log sample or signed attestation); TS3-08.                                                                                                          | TEC-11, TS3-08                 | RA 10173 §20; NPC Circular 2023-06 §12–13; OWASP ASVS V7                                                                                                               |
| **TB-14** | Vulnerability management                                         | A vulnerability assessment and penetration test (VAPT) or an authenticated vulnerability scan of the product version (same major version) at least every 12 months and after each major release, by an independent party or a security team separate from the developers. Critical / high findings fixed before go-live or covered by a dated remediation plan accepted by the Technical Lead. Security patches for critical vulnerabilities in components applied within 30 days (DOH policy default).                                                             | DOH policy default (12 months; 30 days)                       | Third-party VAPT firm, DICT / government CERT assessment, recognised scanning tools with authenticated scans, bug-bounty reports.                                                                                                                    | No assessment; assessment of a different product; open critical / high findings without a plan; scans older than 12 months.                                      | TEC-14 document check (date, scope, independence, finding status).                                                                                                                                  | TEC-14                         | NPC Circular 2023-06 §13 (regular testing); ISO/IEC 27001 A.8.8                                                                                                        |

# Chapter 4 — Terminology & Registry Sources (SRC-01 to SRC-15)

Implements the consultant's "Revision of L2" matrix. For every concept tested in Level 2A (TS0), this sheet names the authority, the code system / value set / identifier to use, and where to retrieve or verify it. HOW the system retrieves it (live look-up, scheduled sync or cached copy) remains the vendor's choice; the values must match the named source. Do not depend on external public servers such as tx.fhir.org (Connectathon Issue \#9).

| **Ref**    | **Group**   | **Source / authority**                                                | **Concept (data element)**                                                                  | **Used in**                                                | **What the system must use**                                                                                                                                                                                                                                                                              | **Where to retrieve / verify**                                                                                                                                                                                                                                                                                                                                                                                                                          | **Retrieval method allowed**                                                                                                                                       | **Requirement**                                           | **Tested in**      | **Notes / DOH decision**                                                                                                                                                                                                  |
|------------|-------------|-----------------------------------------------------------------------|---------------------------------------------------------------------------------------------|------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **SRC-01** | Terminology | PHeReF IG (DOH / TDG)                                                 | Practitioner role                                                                           | TS1-03.2, TS2-03.2, TS2-10.3                               | PHeReF Practitioner Role value set (SNOMED CT codes, e.g., 158965000 Doctor). Store code, system and display.                                                                                                                                                                                             | DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06) — ValueSet/\$expand, CodeSystem/\$validate-code                                                                                                                                                                                                                                                                                             | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required                                                  | TS0-02.1, TS0-04.1 |                                                                                                                                                                                                                           |
| **SRC-02** | Terminology | PHeReF IG (DOH / TDG)                                                 | Referral category                                                                           | TS1-06.2, TS2-05.2                                         | PHeReF Referral Category value set → ServiceRequest.category (SNOMED CT: 73770003 Emergency; 440655000 Outpatient). Required binding.                                                                                                                                                                     | DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06)                                                                                                                                                                                                                                                                                                                                             | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required                                                  | TS0-02.2, TS0-04.2 |                                                                                                                                                                                                                           |
| **SRC-03** | Terminology | PHeReF IG (DOH / TDG)                                                 | Reason for referral (service type)                                                          | TS1-06.4, TS2-05.4, L3-06                                  | PHeReF Reason for Referral (Service Type) value set → ServiceRequest.reasonCode (e.g., Consultation — SNOMED CT 11429006)                                                                                                                                                                                 | DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06)                                                                                                                                                                                                                                                                                                                                             | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required                                                  | TS0-02.4, TS0-04.3 |                                                                                                                                                                                                                           |
| **SRC-04** | Terminology | PHeReF IG / base FHIR                                                 | Referral status (Task status)                                                               | TS1-12.1, TS2-11, TS2-12                                   | FHIR TaskStatus as used by the PHeReF Task profile: requested (referring) → received → accepted / rejected → completed (receiving); referred-onward outcome per IG                                                                                                                                        | DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06)                                                                                                                                                                                                                                                                                                                                             | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required                                                  | TS0-02.5           |                                                                                                                                                                                                                           |
| **SRC-05** | Terminology | PH Core IG (DOH)                                                      | Sex; contact point system / use; civil status; next-of-kin relationship (Rev 7)             | TS1-01.5, TS1-04.5, TS1-04.8, TS2-04.6, TS0-01.3, TS0-01.4 | Base FHIR value sets bound in PH Core: AdministrativeGender; ContactPointSystem / ContactPointUse Rev 7: also MaritalStatus (Patient.maritalStatus) and RelatedPerson relationship type (Patient.contact.relationship) — required bindings in ERefPatient (PHeReF v0.1.0).                                | DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06)                                                                                                                                                                                                                                                                                                                                             | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required                                                  | TS0-01             |                                                                                                                                                                                                                           |
| **SRC-06** | Terminology | SNOMED CT — National Release Center (UP Manila NTHC, DOH stewardship) | Codes the IG binds to SNOMED CT (practitioner role, referral category, reason for referral) | TS1 / TS2 coded elements                                   | system = http://snomed.info/sct; edition / version loaded on the DOH terminology server                                                                                                                                                                                                                   | DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06) — \$validate-code                                                                                                                                                                                                                                                                                                                           | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required                                                  | TS0-05.1           |                                                                                                                                                                                                                           |
| **SRC-07** | Terminology | LOINC (Regenstrief)                                                   | Vital-sign Observation codes                                                                | TS1-08, TS2-07                                             | system = http://loinc.org; FHIR vital-signs codes: 85354-9 BP panel (8480-6 systolic, 8462-4 diastolic), 8867-4 heart rate, 9279-1 respiratory rate, 2708-6 oxygen saturation, 8310-5 body temperature, 29463-7 body weight                                                                               | DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06) — \$validate-code                                                                                                                                                                                                                                                                                                                           | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required                                                  | TS0-05.2           |                                                                                                                                                                                                                           |
| **SRC-08** | Terminology | ICD-10 (WHO; as adopted by DOH / PhilHealth)                          | Working impression / diagnosis                                                              | TS1-07.2, TS2-06.2, L3-16                                  | system = http://hl7.org/fhir/sid/icd-10 — where the IG version binds Condition.code to ICD-10                                                                                                                                                                                                             | DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06) — \$validate-code                                                                                                                                                                                                                                                                                                                           | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required where bound (N/A if the IG binds SNOMED CT only) | TS0-05.3           |                                                                                                                                                                                                                           |
| **SRC-09** | Terminology | PHeReF IG (DOH / TDG)                                                 | Referral priority                                                                           | TS1-06.3, TS2-05.3                                         | EReferralPriority value set → ServiceRequest.priority (routine / urgent / stat). Required binding.                                                                                                                                                                                                        | DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06) — \$validate-code                                                                                                                                                                                                                                                                                                                           | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required                                                  | TS0-02.3           | Rev 7 note: the 9 Sep 2026 v0.1.0 build does not profile ServiceRequest.priority (base RequestPriority only); EReferralPriority exists only in the workflow-branch build — TDG to confirm (see FHIR Traceability TR-025). |
| **SRC-10** | Registry    | PSA — Philippine Standard Geographic Code (PSGC)                      | Region, province, city / municipality, barangay in addresses                                | TS1-01.4, TS1-02.3, TS1-04.7, L3-15                        | PSGC code using the PSGC CodeSystem URL published in PH Core (must match exactly — Connectathon Issue \#32). PSGC release announced by the DOH for the test cycle. Note: 2024 releases use a 9-digit code, 2025 and later releases a 10-digit code (as described in the DSWD dxCLOUD PSGC documentation). | Authoritative: PSA Statistical Classification Systems — https://classification.psa.gov.ph/ . Machine-readable: PSGC CodeSystem on the DOH HIE terminology server (Ontoserver, read-only, pre-loaded; base URL issued with sandbox access — L0-06); alternative API: DSWD dxCLOUD API — https://dxcloud.dswd.gov.ph/api/documentation (GET /api/psgc/regions, /provincesByRegion, /municipalityByProvince, /barangayByMunicipality; "version" parameter) | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable; the release used must equal the one on the DOH terminology server | Required                                                  | TS0-06.1           |                                                                                                                                                                                                                           |
| **SRC-11** | Registry    | DOH — National Health Facility Registry (NHFR)                        | Health facility code / name (referring and receiving)                                       | TS1-01.3, TS1-02.2, TS2-02.3, TS2-02.7, TS2-01, L4-09      | NHFR facility code as Organization.identifier per PH Core; name as registered                                                                                                                                                                                                                             | NHFR — https://nhfr.doh.gov.ph (official list), or the facility list loaded by the DOH on the sandbox                                                                                                                                                                                                                                                                                                                                                   | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable; no free-typed facilities                                          | Required (codes are critical in TS1 / TS2)                | TS0-06.2           |                                                                                                                                                                                                                           |
| **SRC-12** | Registry    | DOH — National Health Workforce Registry (NHWR); PRC licence          | Practitioner identifier / licence no.                                                       | TS1-03.1, TS2-03.1, TS2-10.1                               | Practitioner.identifier per PH Core (PRC licence no.; practitioner identifier model still pending — Connectathon Issue \#10)                                                                                                                                                                              | NHWR (DOH) / list issued by the DOH for the sandbox                                                                                                                                                                                                                                                                                                                                                                                                     | Runtime look-up, scheduled sync or cached copy (vendor's choice); endpoint must be configurable                                                                    | Required                                                  | TS0-06.3           |                                                                                                                                                                                                                           |
| **SRC-13** | Registry    | PhilHealth                                                            | PhilHealth ID (PIN)                                                                         | TS1-04.3, TS2-04.3, L4-08                                  | Patient.identifier — PH Core PhilHealth slice (PHCorePhilHealthID): identifier system and format exactly as published in PH Core                                                                                                                                                                          | Format validation in the system; PhilHealth verification service only where PhilHealth makes one available for the sandbox                                                                                                                                                                                                                                                                                                                              | Validate before save / send                                                                                                                                        | CRITICAL                                                  | TS0-07.1           |                                                                                                                                                                                                                           |
| **SRC-14** | Registry    | PSA — Philippine Identification System (PhilSys)                      | PhilSys number                                                                              | TS1-04.2, TS2-04.2, L4-08                                  | Patient.identifier — PH Core PhilSys slice (PHCorePhilSysID): identifier system and format exactly as published in PH Core                                                                                                                                                                                | Format validation in the system. Optional live verification: PhilSys Verifier (DICT / PSA), e.g., through DSWD dxCLOUD API — https://dxcloud.dswd.gov.ph/api/documentation POST /api/person/verifyPCN or /api/person/verify — JWT bearer token (POST /api/auth/login); only under an agreement with DSWD and a data sharing arrangement (NPC Circular 2023-06 §20)                                                                                      | Validate before save / send                                                                                                                                        | CRITICAL                                                  | TS0-07.2           |                                                                                                                                                                                                                           |
| **SRC-15** | Registry    | DSWD — Unified Beneficiary Database (UBD) / Listahanan / Pantawid     | DSWD household / beneficiary identifier (Household No. or UBD ID)                           | Patient record (no TS1 / TS2 element yet)                  | Patient.identifier — slice and system to be defined by the TDG (not yet in PH Core / PHeReF)                                                                                                                                                                                                              | DSWD dxCLOUD API — https://dxcloud.dswd.gov.ph/api/documentation — POST /api/person/getUBID, /api/person/getInfo, /api/person/verifyPantawid (JWT bearer). A household-number look-up endpoint is not listed in the documentation as viewed on 5 Oct 2026 — confirm with DSWD ICT.                                                                                                                                                                      | Only after DSWD grants API access and a data sharing agreement is in place                                                                                         | OPTIONAL — not scored                                     | TS0-08             |                                                                                                                                                                                                                           |

# Chapter 5 — FHIR Traceability (TR-001 to TR-050)

Generated from the published StructureDefinition snapshots of PH Core v0.2.0 (UPM-NTHC/ph-core, build of 9 Sep 2026) and PHeReF v0.1.0 (UPM-NTHC/ph-ereferral, build of 9 Sep 2026). Cardinality, Must Support and binding are as published (including constraints inherited from PH Core). Interaction follows the IG example submission (a FHIR transaction Bundle: conditional PUT for Patient, Practitioner, PractitionerRole and Organization; POST for clinical resources); vendors may use any equivalent interaction declared in L1-03. When an IG version changes, update this sheet FIRST, then the criteria it points to. Status: Confirmed = matches the IG; TDG to confirm / IG discrepancy = open mapping issue (see Notes).

Columns condensed for print: Criteria combines the TS1, TS2 and other criteria; Profile shows the profile id (canonical base https://fhir.doh.gov.ph/phcore/ or /pheref/StructureDefinition/); Card. shows cardinality and MS = Must Support. Interaction follows the IG example submission (transaction Bundle: conditional PUT for Patient, Practitioner, PractitionerRole and Organization; POST for clinical resources); vendors may use any equivalent interaction declared in L1-03.

<table>
<colgroup>
<col style="width: 4%" />
<col style="width: 10%" />
<col style="width: 10%" />
<col style="width: 10%" />
<col style="width: 13%" />
<col style="width: 4%" />
<col style="width: 11%" />
<col style="width: 4%" />
<col style="width: 10%" />
<col style="width: 18%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>ID</strong></th>
<th><strong>Data requirement</strong></th>
<th><strong>Criteria</strong></th>
<th><strong>Resource / profile</strong></th>
<th><strong>Element</strong></th>
<th><strong>Card.</strong></th>
<th><strong>Binding / fixed</strong></th>
<th><strong>Source</strong></th>
<th><strong>Expected (submission)</strong></th>
<th><strong>Status / notes</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>TR-001</strong></td>
<td>HCPN name</td>
<td>TS1 TS1-01.1 · TS2 TS2-02.1 · L3-01.1</td>
<td><p>Organization</p>
<p>ph-core-organization</p></td>
<td>Organization.identifier (HCPN)</td>
<td>0..*</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>TDG to confirm</p>
<p>No HCPN identifier slice in PH Core 0.2.0 — identifier system to be defined.</p></td>
</tr>
<tr class="even">
<td><strong>TR-002</strong></td>
<td>Initiating facility name</td>
<td>TS1 TS1-01.2 · TS2 TS2-02.2 · L3-01.1</td>
<td><p>Organization</p>
<p>ph-core-organization</p></td>
<td>Organization.name</td>
<td>0..1 MS</td>
<td></td>
<td>SRC-11</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-003</strong></td>
<td>Initiating facility NHFR code ★</td>
<td>TS1 TS1-01.3 · TS2 TS2-02.3 · TS0-06.2, TS3-03.1</td>
<td><p>Organization</p>
<p>ph-core-organization</p></td>
<td>Organization.identifier:NhfrCode (system https://fhir.doh.gov.ph/phcore/Identifier/doh-nhfr-code)</td>
<td>0..* MS</td>
<td></td>
<td>SRC-11</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>IG example uses conditional PUT Organization?identifier=&lt;NHFR system&gt;|&lt;code&gt;.</p></td>
</tr>
<tr class="even">
<td><strong>TR-004</strong></td>
<td>Initiating facility address (PSGC)</td>
<td>TS1 TS1-01.4 · TS2 TS2-02.4 · TS0-06.1</td>
<td><p>Organization</p>
<p>ph-core-organization</p></td>
<td>Organization.address (+ PH Core PSGC extensions)</td>
<td>0..* MS</td>
<td></td>
<td>SRC-10</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-005</strong></td>
<td>Initiating facility contact number</td>
<td>TS1 TS1-01.5 · TS2 TS2-02.5 · TS0-01.2</td>
<td><p>Organization</p>
<p>ph-core-organization</p></td>
<td>Organization.telecom</td>
<td>0..* MS</td>
<td></td>
<td>SRC-05</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-006</strong></td>
<td>Receiving facility name</td>
<td>TS1 TS1-02.1 · TS2 TS2-02.6 · L3-01.1</td>
<td><p>Organization</p>
<p>ph-core-organization</p></td>
<td>Organization.name (via ServiceRequest.performer)</td>
<td>0..1 MS</td>
<td></td>
<td>SRC-11</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-007</strong></td>
<td>Receiving facility NHFR code ★</td>
<td>TS1 TS1-02.2 · TS2 TS2-02.7 · TS0-06.2, TS2-01, TS3-03.1</td>
<td><p>Organization</p>
<p>ph-core-organization</p></td>
<td>Organization.identifier:NhfrCode</td>
<td>0..* MS</td>
<td></td>
<td>SRC-11</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-008</strong></td>
<td>Receiving facility address (PSGC)</td>
<td>TS1 TS1-02.3 · TS0-06.1</td>
<td><p>Organization</p>
<p>ph-core-organization</p></td>
<td>Organization.address</td>
<td>0..* MS</td>
<td></td>
<td>SRC-10</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-009</strong></td>
<td>Name of referring practitioner</td>
<td>TS1 TS1-03.1 · TS2 TS2-03.1 · TS0-06.3</td>
<td><p>Practitioner</p>
<p>ph-core-practitioner</p></td>
<td>Practitioner.name</td>
<td>0..* MS</td>
<td></td>
<td>SRC-12</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>Practitioner identifier model pending (Connectathon Issue #10); IG example uses PRC licence.</p></td>
</tr>
<tr class="even">
<td><strong>TR-010</strong></td>
<td>Referring practitioner role ★</td>
<td>TS1 TS1-03.2 · TS2 TS2-03.2 · TS0-02.1, TS0-04.1</td>
<td><p>PractitionerRole</p>
<p>ereferral-practitioner-role</p></td>
<td>PractitionerRole.code</td>
<td>0..* MS</td>
<td>required — PHeReF VS practitioner-role</td>
<td>SRC-01</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-011</strong></td>
<td>Care navigator — referring facility</td>
<td>TS1 TS1-03.3 · TS2 TS2-03.3</td>
<td><p>PractitionerRole</p>
<p>ereferral-practitioner-role</p></td>
<td>separate PractitionerRole (no dedicated element)</td>
<td>0..*</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>TDG to confirm</p>
<p>IG models the care navigator on the receiving side only (Task.owner / ServiceRequest.performer).</p></td>
</tr>
<tr class="even">
<td><strong>TR-012</strong></td>
<td>Referring practitioner is the requester ★</td>
<td>TS1 TS1-03.4 · TS2 TS2-10.4 · TS3-03.2</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.requester → ERefPractitionerRole</td>
<td>1..1 MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>Task.requester is also 1..1 (see TS1-12.3).</p></td>
</tr>
<tr class="odd">
<td><strong>TR-013</strong></td>
<td>Patient full name</td>
<td>TS1 TS1-04.1 · TS2 TS2-04.1 · TS3-01, TD-D24</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Patient.name</td>
<td>1..* MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-014</strong></td>
<td>PhilSys number ★</td>
<td>TS1 TS1-04.2 · TS2 TS2-04.2 · TS0-07.2, TS1-16</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Patient.identifier:PHCorePhilSysID (system http://philsys.gov.ph/fhir/Identifier/philsys-id)</td>
<td>0..* MS</td>
<td></td>
<td>SRC-14</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>IG example: PUT Patient?identifier=&lt;PhilSys system&gt;|&lt;number&gt; (patient matching).</p></td>
</tr>
<tr class="odd">
<td><strong>TR-015</strong></td>
<td>PhilHealth ID ★</td>
<td>TS1 TS1-04.3 · TS2 TS2-04.3 · TS0-07.1, TS1-16</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Patient.identifier:PHCorePhilHealthID (system http://philhealth.gov.ph/fhir/Identifier/philhealth-id)</td>
<td>0..* MS</td>
<td></td>
<td>SRC-13</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-016</strong></td>
<td>Birth date</td>
<td>TS1 TS1-04.4 · TS2 TS2-04.4 / .5 · TS3-01.1, TS3-02.3</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Patient.birthDate</td>
<td>1..1 MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-017</strong></td>
<td>Sex ★</td>
<td>TS1 TS1-04.5 · TS2 TS2-04.6 · TS0-01.1</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Patient.gender</td>
<td>1..1 MS</td>
<td>required — FHIR VS administrative-gender</td>
<td>SRC-05</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-018</strong></td>
<td>Civil status</td>
<td>TS1 TS1-04.6 · TS2 TS2-04.7 · TS0-01.3</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Patient.maritalStatus</td>
<td>0..1 MS</td>
<td>required — FHIR VS marital-status</td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>Required binding in the IG — added to TS0-01 in Rev 7.</p></td>
</tr>
<tr class="odd">
<td><strong>TR-019</strong></td>
<td>Patient address (PSGC)</td>
<td>TS1 TS1-04.7 · TS2 TS2-04.8 · TS0-06.1, L3-15.3</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Patient.address (+ PH Core PSGC extensions)</td>
<td>0..* MS</td>
<td></td>
<td>SRC-10</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-020</strong></td>
<td>Patient contact number</td>
<td>TS1 TS1-04.8 · TS2 TS2-04.9 · TS0-01.2</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Patient.telecom (system / use required bindings)</td>
<td>0..* MS</td>
<td></td>
<td>SRC-05</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-021</strong></td>
<td>PWD registration</td>
<td>TS1 TS1-04.9 · TS2 TS2-04.10</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Patient.extension (ph-core-pwd-disability)</td>
<td>0..*</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-022</strong></td>
<td>Accompanied by / next of kin</td>
<td>TS1 TS1-05 · TS2 TS2-04.11 · TS0-01.4</td>
<td><p>Patient / RelatedPerson</p>
<p>ereferral-patient</p></td>
<td>Patient.contact (relationship 1..*, name 1..1) or ERefRelatedPerson</td>
<td>1..* MS</td>
<td>required — FHIR VS relatedperson-relationshiptype</td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>Cardinality shown is for Patient.contact.relationship.</p></td>
</tr>
<tr class="odd">
<td><strong>TR-023</strong></td>
<td>Date of referral</td>
<td>TS1 TS1-06.1 · TS2 TS2-05.1 · IND-01, TS3-05.3</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.authoredOn</td>
<td>0..1 MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>Basis of the reporting period (IND-01).</p></td>
</tr>
<tr class="even">
<td><strong>TR-024</strong></td>
<td>Referral category ★</td>
<td>TS1 TS1-06.2 · TS2 TS2-05.2 · TS0-02.2, TS0-04.2</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.category</td>
<td>0..* MS</td>
<td>required — PHeReF VS referral-category</td>
<td>SRC-02</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-025</strong></td>
<td>Priority ★</td>
<td>TS1 TS1-06.3 · TS2 TS2-05.3 · TS0-02.3</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.priority</td>
<td>0..1</td>
<td>required — FHIR VS request-priority</td>
<td>SRC-09</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>IG discrepancy — TDG to confirm</p>
<p>Rev 6 used EReferralPriority (routine | urgent | stat), which exists only in the workflow-branch build. The 9 Sep 2026 v0.1.0 main build does not profile priority: only the base FHIR required binding applies (RequestPriority: routine | urgent | asap | stat) and it is not Must Support. TDG to confirm the value set and whether priority stays critical.</p></td>
</tr>
<tr class="even">
<td><strong>TR-026</strong></td>
<td>Reason for referral ★</td>
<td>TS1 TS1-06.4 · TS2 TS2-05.4 · TS0-02.4, TS0-04.3, IND-06</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.reasonCode</td>
<td>0..* MS</td>
<td>required — PHeReF VS reason-for-referral-service-type</td>
<td>SRC-03</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>Now a REQUIRED binding in v0.1.0 (Rev 6 noted 'example').</p></td>
</tr>
<tr class="odd">
<td><strong>TR-027</strong></td>
<td>Subject link ★</td>
<td>TS1 TS1-06.5</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.subject → ERefPatient</td>
<td>1..1 MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-028</strong></td>
<td>Performer (receiving facility)</td>
<td>TS1 TS1-06.5 · TS2 TS2-01 · TS3-01.2</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.performer → Organization / ERefPractitionerRole</td>
<td>0..* MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>0..* in the IG; mandatory by DOH rule (TS3-01.2) because the referral must be addressed.</p></td>
</tr>
<tr class="odd">
<td><strong>TR-029</strong></td>
<td>Intent / status</td>
<td>TS1 TS1-06.6</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.intent (fixed order); ServiceRequest.status</td>
<td>1..1 MS</td>
<td>required — FHIR VS request-intent; fixed Code = order</td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-030</strong></td>
<td>Chief complaint</td>
<td>TS1 TS1-07.1 · TS2 TS2-06.1</td>
<td><p>Condition</p>
<p>ereferral-condition</p></td>
<td>Condition.code.text (category problem-list-item)</td>
<td>0..1 MS</td>
<td>example — FHIR VS condition-code</td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-031</strong></td>
<td>Working impression ★</td>
<td>TS1 TS1-07.2 · TS2 TS2-06.2 · TS0-05.3, IND-10</td>
<td><p>Condition</p>
<p>ereferral-condition</p></td>
<td>Condition.code coded (category encounter-diagnosis)</td>
<td>0..1 MS</td>
<td>example — FHIR VS condition-code</td>
<td>SRC-08</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>TDG to confirm</p>
<p>Binding is 'example' in the IG; ICD-10 used by DOH decision (SRC-08).</p></td>
</tr>
<tr class="even">
<td><strong>TR-032</strong></td>
<td>Clinical history</td>
<td>TS1 TS1-07.3 · TS2 TS2-06.3</td>
<td><p>Condition</p>
<p>ereferral-condition</p></td>
<td>Condition.note</td>
<td>0..* MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-033</strong></td>
<td>Vital signs (BP, HR, RR, SpO2, temp, weight) ★BP</td>
<td>TS1 TS1-08 · TS2 TS2-07 · TS0-05.2, TS3-02.2</td>
<td><p>Observation</p>
<p>ereferral-observation</p></td>
<td>Observation.code (LOINC) + value[x] / component (UCUM)</td>
<td>1..1 MS</td>
<td>example — FHIR VS observation-codes</td>
<td>SRC-07</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>Binding of Observation.code is 'example'; LOINC vital-sign codes per SRC-07.</p></td>
</tr>
<tr class="even">
<td><strong>TR-034</strong></td>
<td>Laboratory result attachment</td>
<td>TS1 TS1-09 · TS2 TS2-08 · L4-05</td>
<td><p>DiagnosticReport</p>
<p>ereferral-diagnostic-report</p></td>
<td>DiagnosticReport.presentedForm</td>
<td>0..* MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td><p>Confirmed</p>
<p>ERefDiagnosticReport added to the IG on 9 Sep 2026.</p></td>
</tr>
<tr class="odd">
<td><strong>TR-035</strong></td>
<td>Treatment given</td>
<td>TS1 TS1-10 · TS2 TS2-09.1</td>
<td><p>MedicationAdministration / Procedure</p>
<p>ereferral-medication-administration</p></td>
<td>MedicationAdministration (or Procedure)</td>
<td>1..1 MS</td>
<td>example — FHIR VS medication-codes</td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-036</strong></td>
<td>Professional signature</td>
<td>TS1 TS1-11.1 · TS2 TS2-09.2</td>
<td><p>Provenance</p>
<p>ereferral-provenance</p></td>
<td>Provenance.signature</td>
<td>0..* MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-037</strong></td>
<td>Date &amp; time of signature</td>
<td>TS1 TS1-11.2 · TS2 TS2-09.3</td>
<td><p>Provenance</p>
<p>ereferral-provenance</p></td>
<td>Provenance.recorded</td>
<td>1..1 MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-038</strong></td>
<td>Referral task status = requested ★</td>
<td>TS1 TS1-12.1 · TS2 TS2-11 · TS0-02.5, TS2-13.1</td>
<td><p>Task</p>
<p>ereferral-task</p></td>
<td>Task.status</td>
<td>1..1 MS</td>
<td>required — FHIR VS task-status</td>
<td>SRC-04</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-039</strong></td>
<td>Task linked to referral ★</td>
<td>TS1 TS1-12.2</td>
<td><p>Task</p>
<p>ereferral-task</p></td>
<td>Task.focus → ERefServiceRequest</td>
<td>1..1 MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-040</strong></td>
<td>Task requester / owner</td>
<td>TS1 TS1-12.3 · TS2 TS2-10.2</td>
<td><p>Task</p>
<p>ereferral-task</p></td>
<td>Task.requester (1..1); Task.owner (0..1)</td>
<td>1..1 MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-041</strong></td>
<td>Date / time sent</td>
<td>TS1 TS1-12.4 · TS2-13.1</td>
<td><p>Task</p>
<p>ereferral-task</p></td>
<td>Task.authoredOn</td>
<td>0..1 MS</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-042</strong></td>
<td>Encounter at referring facility</td>
<td>TS1 TS1-13 · TS2 TS2-06.4</td>
<td><p>Encounter</p>
<p>ereferral-encounter</p></td>
<td>ServiceRequest.encounter → ERefEncounter</td>
<td>1..1 MS</td>
<td>required — FHIR VS encounter-status</td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-043</strong></td>
<td>Time called (info only)</td>
<td>TS1 TS1-14</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.occurrence[x] (per IG comment REF-15)</td>
<td>0..1 MS</td>
<td></td>
<td>—</td>
<td>Info only</td>
<td><p>TDG to confirm</p>
<p>IG v0.1.0 comments map Time Called to occurrence[x]; Rev 6 recorded 'no IG element'. Remains info-only until confirmed.</p></td>
</tr>
<tr class="even">
<td><strong>TR-044</strong></td>
<td>Mode of transportation (info only)</td>
<td>TS1 TS1-15</td>
<td><p>—</p>
<p>—</p></td>
<td>No IG element</td>
<td>—</td>
<td></td>
<td>—</td>
<td>Info only</td>
<td>TDG to confirm</td>
</tr>
<tr class="odd">
<td><strong>TR-045</strong></td>
<td>Patient matching (no duplicate) ★</td>
<td>TS1 TS1-16 · IND-02</td>
<td><p>Patient</p>
<p>ereferral-patient</p></td>
<td>Conditional update by PhilSys / PhilHealth identifier</td>
<td>0..* MS</td>
<td></td>
<td>SRC-13, SRC-14</td>
<td>Single Patient for 3 referrals</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-046</strong></td>
<td>Receiving practitioner / care navigator</td>
<td>TS2 TS2-10</td>
<td><p>Task</p>
<p>ereferral-task</p></td>
<td>Task.owner → Practitioner / PractitionerRole / Organization</td>
<td>0..1 MS</td>
<td></td>
<td>SRC-01</td>
<td>—</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-047</strong></td>
<td>Receiving response: received / accepted / rejected / completed ★</td>
<td>TS2 TS2-11, TS2-12 · TS2-13</td>
<td><p>Task</p>
<p>ereferral-task</p></td>
<td>Task.status + statusReason + businessStatus (EReferralReceivingResponse)</td>
<td>1..1 MS</td>
<td>required — FHIR VS task-status</td>
<td>SRC-04</td>
<td>—</td>
<td>Confirmed</td>
</tr>
<tr class="even">
<td><strong>TR-048</strong></td>
<td>Status timestamps ★</td>
<td>TS2 TS2-13 · IND-08</td>
<td><p>Task</p>
<p>ereferral-task</p></td>
<td>Task.authoredOn / lastModified / _history</td>
<td>0..1 MS</td>
<td></td>
<td>—</td>
<td>—</td>
<td>Confirmed</td>
</tr>
<tr class="odd">
<td><strong>TR-049</strong></td>
<td>Onward referral</td>
<td>TS1 TS1-T.04 · L4-10</td>
<td><p>ServiceRequest</p>
<p>ereferral-service-request</p></td>
<td>ServiceRequest.replaces / basedOn + Task businessStatus 'referred-onward'</td>
<td>0..*</td>
<td></td>
<td>—</td>
<td>Accepted (2xx); value on SHR = Test Data; $validate 0 errors (TS1-T.02)</td>
<td>TDG to confirm</td>
</tr>
<tr class="even">
<td><strong>TR-050</strong></td>
<td>Profile declaration (all resources)</td>
<td>TS1 TS1-T.03 · TS1-T.02</td>
<td><p>All</p>
<p>—</p></td>
<td>meta.profile = PH Core / PHeReF canonical</td>
<td>—</td>
<td></td>
<td>—</td>
<td>Declared on every resource</td>
<td>Confirmed</td>
</tr>
</tbody>
</table>

# Chapter 6 — Indicator Definitions for Level 3 (IND-01 to IND-11) — PROPOSED

Each Level 3 indicator has ONE documented rule so that two conformant EMRs cannot legitimately compute the same indicator differently. Validators compare system reports with the Test Data Expected Results, which are calculated with these rules. IND-02 (duplicates) and IND-04 (status as of report run time) apply to every count. Rules marked PROPOSED take effect after DOH approval (recorded on the Summary sheet).

<table style="width:100%;">
<colgroup>
<col style="width: 4%" />
<col style="width: 9%" />
<col style="width: 11%" />
<col style="width: 8%" />
<col style="width: 14%" />
<col style="width: 15%" />
<col style="width: 8%" />
<col style="width: 10%" />
<col style="width: 9%" />
<col style="width: 6%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>ID</strong></th>
<th><strong>Indicator</strong></th>
<th><strong>Numerator / value</strong></th>
<th><strong>Denominator</strong></th>
<th><strong>Inclusions / exclusions</strong></th>
<th><strong>Date &amp; status rule</strong></th>
<th><strong>Duplicates</strong></th>
<th><strong>Formula / rounding</strong></th>
<th><strong>FHIR source</strong></th>
<th><strong>Criteria</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>IND-01</strong></td>
<td>Total referrals (linelist total)</td>
<td>Number of distinct referrals in the period</td>
<td>—</td>
<td><p>Incl.: All referrals sent (outgoing) or addressed to (incoming) the facility</p>
<p>Excl.: Cancelled referrals (IND-03); test / draft referrals never sent</p></td>
<td><p>Period assigned by date/time referred (ServiceRequest.authoredOn) converted to Philippine Standard Time (UTC+8); a month runs 00:00:00 day 1 to 23:59:59 last day</p>
<p>Status: Any status except cancelled / entered-in-error</p></td>
<td>Count once per referral identifier (IND-02)</td>
<td>Integer</td>
<td>ServiceRequest.authoredOn, ServiceRequest.identifier, Task.status</td>
<td>L3-03, L3-10, L3-17</td>
</tr>
<tr class="even">
<td><strong>IND-02</strong></td>
<td>Duplicate rule (applies to all counts)</td>
<td>—</td>
<td>—</td>
<td><p>Incl.: —</p>
<p>Excl.: Second and later records with the same referral business identifier (or the same ServiceRequest id)</p></td>
<td><p>—</p>
<p>Status: —</p></td>
<td>Latest version of a referral is used; corrections update, not add</td>
<td>—</td>
<td>ServiceRequest.identifier / id; Resource version (meta.versionId)</td>
<td>L3-18.1, all counts</td>
</tr>
<tr class="odd">
<td><strong>IND-03</strong></td>
<td>Cancelled referrals</td>
<td>Referrals whose Task.status = cancelled (or ServiceRequest.status = revoked)</td>
<td>—</td>
<td><p>Incl.: Cancelled within the period</p>
<p>Excl.: —</p></td>
<td><p>Period by date referred</p>
<p>Status: Status as of report run time</p></td>
<td>Count once (IND-02)</td>
<td>Integer; shown separately, excluded from IND-01 and IND-05</td>
<td>Task.status, ServiceRequest.status</td>
<td>L3-18.2</td>
</tr>
<tr class="even">
<td><strong>IND-04</strong></td>
<td>Status-as-of rule (applies to all status counts)</td>
<td>—</td>
<td>—</td>
<td><p>Incl.: —</p>
<p>Excl.: —</p></td>
<td><p>—</p>
<p>Status: Status = latest Task.status at the moment the report is run (not the status at first retrieval)</p></td>
<td>—</td>
<td>—</td>
<td>Task.status, Task.lastModified</td>
<td>L3-19</td>
</tr>
<tr class="odd">
<td><strong>IND-05</strong></td>
<td>Incoming / Outgoing / Received / Deferred-Denied / Redirected</td>
<td>Distinct referrals in each category</td>
<td>—</td>
<td><p>Incl.: Outgoing = requester's organization is the facility; Incoming = performer / Task.owner is the facility; Received = incoming with status received, accepted, in-progress or completed; Deferred-Denied = rejected; Redirected = referred onward</p>
<p>Excl.: Cancelled (IND-03)</p></td>
<td><p>Period by date referred</p>
<p>Status: IND-04</p></td>
<td>IND-02</td>
<td>Integer</td>
<td>ServiceRequest.requester / performer, Task.owner, Task.status, Task.businessStatus</td>
<td>L3-04, L3-05</td>
</tr>
<tr class="even">
<td><strong>IND-06</strong></td>
<td>Top reasons for referral</td>
<td>Distinct referrals per Reason for Referral code</td>
<td>—</td>
<td><p>Incl.: All non-cancelled referrals in the period</p>
<p>Excl.: Cancelled</p></td>
<td><p>Period by date referred</p>
<p>Status: Any</p></td>
<td>IND-02</td>
<td>Rank descending by count; ties ordered by code display A–Z</td>
<td>ServiceRequest.reasonCode (EReferralReason VS)</td>
<td>L3-06</td>
</tr>
<tr class="odd">
<td><strong>IND-07</strong></td>
<td>Counts by ownership and service capability</td>
<td>Distinct referrals per ownership (Government / Private) and receiving capability</td>
<td>—</td>
<td><p>Incl.: Ownership and capability taken from the NHFR record of the facility at report time</p>
<p>Excl.: Cancelled</p></td>
<td><p>Period by date referred</p>
<p>Status: Any</p></td>
<td>IND-02</td>
<td>Integer</td>
<td>Organization.identifier (NHFR) → NHFR attributes</td>
<td>L3-07, L3-08</td>
</tr>
<tr class="even">
<td><strong>IND-08</strong></td>
<td>Turnaround time (TAT)</td>
<td>Sum of (first 'received' date/time − date/time referred) in minutes</td>
<td>Number of referrals that have a 'received' timestamp</td>
<td><p>Incl.: Incoming referrals with a received timestamp</p>
<p>Excl.: Referrals never received; cancelled before receipt</p></td>
<td><p>Period by date referred</p>
<p>Status: Uses the FIRST time status became 'received' (TS2-13.2); later updates do not change it</p></td>
<td>IND-02</td>
<td>Average in minutes, rounded to the nearest minute; tolerance ±1 minute</td>
<td>Task.authoredOn / ServiceRequest.authoredOn; Task history (received)</td>
<td>L3-09, L3-19.2</td>
</tr>
<tr class="odd">
<td><strong>IND-09</strong></td>
<td>Report consistency (linelist ↔︎ aggregates ↔︎ export)</td>
<td>Totals of linelist, aggregate report and export for the same filters</td>
<td>—</td>
<td><p>Incl.: Same filters and period</p>
<p>Excl.: —</p></td>
<td><p>Same as the report</p>
<p>Status: Same as the report</p></td>
<td>IND-02</td>
<td>All three totals equal</td>
<td>—</td>
<td>L3-10, L3-21</td>
</tr>
<tr class="even">
<td><strong>IND-10</strong></td>
<td>Top morbidity of referred cases</td>
<td>Distinct referrals per working-impression code (ICD-10)</td>
<td>—</td>
<td><p>Incl.: Non-cancelled referrals with a coded working impression</p>
<p>Excl.: Cancelled; uncoded working impression (listed separately as 'not coded')</p></td>
<td><p>Period by date referred</p>
<p>Status: Any</p></td>
<td>IND-02</td>
<td>Rank descending by count; ties by ICD-10 code A–Z</td>
<td>Condition.code (category encounter-diagnosis)</td>
<td>L3-16</td>
</tr>
<tr class="odd">
<td><strong>IND-11</strong></td>
<td>Disaggregation (sex, age group, municipality, facility)</td>
<td>Distinct referrals per group</td>
<td>—</td>
<td><p>Incl.: Non-cancelled referrals</p>
<p>Excl.: Cancelled</p></td>
<td><p>Period by date referred; age computed on the date referred</p>
<p>Status: Any</p></td>
<td>IND-02</td>
<td>Age groups: 0–4, 5–9, 10–19, 20–59, 60+ years (DOH to confirm); municipality from the patient address PSGC</td>
<td>Patient.gender, Patient.birthDate, Patient.address (PSGC)</td>
<td>L3-15</td>
</tr>
</tbody>
</table>

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
