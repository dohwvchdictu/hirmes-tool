# HIE System Validation Testing Criteria — Review Edition (Rev 9)

Oct 15, 2026 · Department of Health — draft for review

## How to use this document

This is a review copy of workbook **HIE_System_Validation_Testing_Criteria_rev9.xlsx** and its companion **HIE System Validation — Technical Reference Guide**. It shows every criterion on one page, grouped by **what the criterion is trying to protect** (its concept), not by the sheet it sits in. The workbook stays the official scoring tool; this document is where reviewers read, discuss and propose changes.

**Reading it fast.** Each concept opens with a one-line *Objective* and a *Linked concepts* line. Read only those two lines to get the whole picture in a few minutes. Open the table only when you need the detail.

**What the tables show.** Every row keeps its workbook ID (for example TS1-04 or TEC-02) so changes can be traced back. Columns:

| Column          | Meaning                                                                                                          |
|-----------------|------------------------------------------------------------------------------------------------------------------|
| ID · Level      | Workbook row ID and the level/part it is scored in (Level 4 rows also show Core-track or Maturity)               |
| What is checked | The requirement, in plain words                                                                                  |
| Passes when     | What the Validator must see for a Met                                                                            |
| ★               | Critical — must be Met or the level fails, whatever the score. A ★ inside the text marks a critical sub-item     |
| Score           | Binary (Met/Not Met), Count (partial credit per sub-item), All (all sub-items or 0%), Tier, or Info (not scored) |

**How to comment.** Use either way — both reach the revision agent:

1.  **Highlight and comment** on any word, row or cell (in Google Docs: *Insert → Comment*). Good for quick questions.

2.  **Write in the Reviewer notes table** under each concept. Good for proposed changes that must be applied to the workbook.

Start each note with one tag so the agent knows what to do:

| Tag          | Use it to                                                        |
|--------------|------------------------------------------------------------------|
| \[CHANGE\]   | Reword or modify an existing criterion, sub-item, weight or rule |
| \[ADD\]      | Propose a new criterion or sub-item                              |
| \[REMOVE\]   | Propose deleting a criterion or sub-item                         |
| \[MOVE\]     | Move an item to another level or part                            |
| \[QUESTION\] | Ask for clarification — no change to the workbook yet            |
| \[OK\]       | Confirm the concept is acceptable as written                     |

Always name the **ID** your note is about. Notes without an ID are treated as \[QUESTION\].

## What changed in Rev 8 and Rev 9

Rev 8 and Rev 9 keep every Rev 7 criterion but make the workbook lighter and national in scope.

- **Lighter workbook:** the run / evidence log and the findings register were removed. Evidence is a reference in each row's Notes column; items needing compliance are listed automatically in section D of the Printed Evaluation Report; versions tested and certificate details are in System Profile section D.

- **Reference material moved out:** Glossary, Technical Baseline (TB-), Terminology & Registry Sources (SRC-), FHIR Traceability (TR-), Indicator Definitions (IND-) and Certification & Revalidation rules are now in the companion Technical Reference Guide. The Instructions sheet is one page.

- **Test Data simplified:** Section C (Level 3 edge cases) kept; Section D trimmed to the inputs used by TS3 and Security.

- **National form:** the former local exchange name is replaced by "Health Information Exchange (HIE)"; agency functions refer to the DOH; the report letterhead shows the conducting DOH office / region entered in the System Profile.

- **Rev 9 — 2D and 2E combined:** security checks (TEC-) and exception scenarios (TS3-) are now one part, 2D Security, Reliability & Exception Handling, on one sheet; IDs unchanged. Level 2 has four parts again.

- **Rev 9 — Glossary completed:** the Reference Guide glossary now defines every technical term and abbreviation used (including TEC, TS3, TB, SRC, TR, IND, FHIR elements, codes and security terms).

- **Unchanged from Rev 7:** the exception scenarios, expanded security checks, items moved from Level 4 into Level 2, and PROPOSED pass marks pending DOH approval.

## At a glance

An EMR system is **conformant** for the HIE once it passes Levels 0 to 3 with no critical item Not Met; Level 4 is the maturity target. The tool checks the *product* on the DOH test servers (sandbox) with fictional test data. Contracts, facility privacy duties, hardware and training are handled later, outside this tool.

| Level                                              | What it proves                                                                                                | Pass mark | Opens after              |
|----------------------------------------------------|---------------------------------------------------------------------------------------------------------------|-----------|--------------------------|
| 0 — Application                                    | The vendor has formally applied and named who is accountable                                                  | 90%       | —                        |
| 1 — Documentation                                  | The product is described: flows, manual, interfaces, design                                                   | 85%       | Level 0                  |
| 2A — Codes & registries (TS0)                      | Coded values and IDs come from official sources. Test first.                                                  | 85%       | Level 1                  |
| 2B — Sending (TS1)                                 | A referral reaches the central server complete, correct and without duplicating the patient                   | 85%       | Level 1                  |
| 2C — Receiving (TS2)                               | The receiving facility gets, shows and updates the referral, with time-stamped status                         | 85%       | Level 1                  |
| 2D — Security, reliability & exceptions (TEC, TS3) | Safeguards and access boundaries work, and wrong, duplicated or interrupted exchanges fail safely and recover | 85%       | Level 1                  |
| 3 — Reports                                        | Reports count the test referrals exactly, by documented rules                                                 | 85%       | Level 2 (all four parts) |
| 4 — Advanced                                       | Core-track: back-referral, chains · Maturity: no re-typing, attachments, cancellation                         | 75%       | Level 3                  |

Pass marks are **PROPOSED — for DOH approval**; the approval is recorded on the Summary sheet and, until then, a positive result is marked provisional.

**A level passes only when all three are true:** every applicable item has been tested; every critical (★) item and ★ sub-item is Met; the score reaches the pass mark. A level stays *Locked* until the one before it passes, but testing can run in parallel.

**How items are scored.** *Binary*: Met 100% or Not Met 0%. *Count*: partial credit per sub-item (8 of 10 = 80%). *All*: every sub-item or 0%. *Tier*: used once (L1-04) — fully integrated 100%, manual encoding 50%. *Info*: recorded, weight 0. Not Tested counts as 0% and blocks the level. N/A removes a non-critical item; a critical item marked N/A fails. Weights: critical 2, others 1, unless shown otherwise.

**Evidence rules that apply everywhere.**

- *Proof from the server, not the screen.* Level 2 and 4 results must be confirmed with one of: the Interoperability Layer log (e.g., OpenHIM), an Inferno/validator report, or the raw request/response captured during the session.

- *Every result is traceable.* Write the evidence reference (file, SHR resource ID and version, transaction ID) in the Notes column, and record the version/build and IG versions tested in System Profile section D.

- *Outcome, not design.* The tool checks results. Architecture, language, database, hosting and screen layout are the vendor's choice. Minimum security bars are in the **Technical Baseline** (Reference Guide, Chapter 3) (TB-01 to TB-14).

- *Private documents stay private.* For architecture, security design, backup, encryption, logging and vulnerability assessments, the vendor may show a full or redacted copy with a signed attestation, an independent certificate, or a view-only demonstration. Source code, keys and passwords are never asked for.

- *Named sources.* Every code and registry value must come from the source named in the **Terminology & Registry Sources** (Reference Guide, Chapter 4) (SRC-01 to SRC-15).

**Who does what.** One Technical Lead approves results. Two to three Validators test, record evidence references, re-test corrected items, and recommend. One Administrator handles papers, schedules and the evidence repository. One to two Observers witness but do not score.

**Words you will see.**

| Word                    | Plain meaning                                                                                  |
|-------------------------|------------------------------------------------------------------------------------------------|
| FHIR                    | The international standard "language" health systems use to exchange data                      |
| SHR                     | Shared Health Record — the central server where referrals are stored                           |
| Sandbox                 | The DOH test servers; only fictional data is used there                                        |
| TS0 / TS1 / TS2 / TS3   | Test Scenario 0 (codes), 1 (sending), 2 (receiving), 3 (errors and exceptions)                 |
| Value set               | The official list of allowed codes for one field                                               |
| NHFR / NHWR / PSGC      | Official registries of facilities, health workers, and places                                  |
| Resource                | One type of FHIR record, such as Patient or ServiceRequest (the referral itself)               |
| TB- · SRC- · TR- · IND- | Reference IDs in the Technical Reference Guide: baseline, source, FHIR mapping, indicator rule |

## Concept map

The 103 criteria serve 14 concepts. Each concept protects one step of a referral, from the application to the reports, and most concepts draw criteria from several levels.

<img src="media/image2.png" style="width:6.3in;height:4.21875in" />

concept map · 14 concepts along the referral journey

C2 (codes) is the only gate inside Level 2: if codes are wrong, everything below it fails. Use the index below to jump from a concept to its workbook IDs.

| Concept                         | Workbook criteria                                                                                                            | Critical | Levels     |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------|----------|------------|
| C1 Applicant and product        | L0-01, L0-02, L0-03, L0-04, L0-05, L0-06, L1-01, L1-02, L1-06                                                                | 4 of 9   | 0, 1       |
| C2 Same codes, same meaning     | TS0-01, TS0-02, TS0-03, TS0-04, TS0-05                                                                                       | 3 of 5   | 2A         |
| C3 Right facility               | TS0-06, TS1-01, TS1-02, TS2-02                                                                                               | 4 of 4   | 2A, 2B, 2C |
| C4 Right practitioner           | TS1-03, TS2-03, TS2-10                                                                                                       | 3 of 3   | 2B, 2C     |
| C5 Right patient, one record    | TS0-07, TS0-08, TS1-04, TS1-05, TS2-04, TS1-16                                                                               | 4 of 6   | 2A, 2B, 2C |
| C6 Complete clinical picture    | TS1-06, TS2-05, TS1-07, TS2-06, TS1-08, TS2-07, TS1-09, TS2-08, L4-05, TS1-10, TS1-11, TS2-09, TS1-13, TS1-14, TS1-15        | 6 of 15  | 2B, 2C, 4  |
| C7 Record once                  | L1-04, L4-03, L4-04                                                                                                          | 0 of 3   | 1, 4       |
| C8 Server accepts               | L1-03, TS1-T.01, TS1-T.02, TS1-T.03                                                                                          | 3 of 4   | 1, 2B      |
| C9 Referral is noticed          | TS2-01, L3-13, L3-12                                                                                                         | 1 of 3   | 2C, 3      |
| C10 Status tracked              | TS1-12, TS2-11, TS2-12, TS2-13, L4-11                                                                                        | 4 of 5   | 2B, 2C, 4  |
| C11 Care continues              | L4-01, L4-02, TS1-T.04, L4-10                                                                                                | 1 of 4   | 4, 2B      |
| C12 Reports that add up         | L3-03, L3-04, L3-10, L3-05, L3-06, L3-07, L3-08, L3-09, L3-16, L3-01, L3-02, L3-14, L3-15, L3-17, L3-18, L3-19, L3-20, L3-21 | 3 of 18  | 3          |
| C13 Security and privacy        | L1-05, TEC-01, TEC-02, TEC-03, TEC-04, TEC-05, TEC-08, TEC-09, TEC-10, TEC-11, TEC-12, TEC-13, TEC-14, L3-11                 | 4 of 14  | 1, 2D, 3   |
| C14 Fails safely, keeps working | TS3-01, TS3-02, TS3-03, TS3-04, TS3-05, TS3-06, TS3-07, TS3-08, TS3-09, TEC-07                                               | 4 of 10  | 2D         |

"Critical" counts criteria that are critical themselves or contain a ★ sub-item — 44 of 103 in total. Live counts are on the workbook's Summary sheet (count register).

## Criteria by concept

All 103 workbook criteria appear below, each exactly once, in the order a referral travels. Paired rows (send in 2B, show in 2C) sit together so both ends of the same data can be checked side by side. Sub-items are listed inside the row; ★ marks the critical ones.

### C1 · Accountable applicant, described product

**Objective:** The DOH knows who is applying, who answers for the product, and exactly which version and features are being tested.

**Linked concepts:** Builds on — (starting point) · Feeds every other concept: results apply only to the version named in L0-03 and recorded for every test run.

| ID · Level | What is checked                                                                                                                                     | Passes when                                                                     | ★   | Score             |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|-----|-------------------|
| L0-01 · 0  | Signed letter of application                                                                                                                        | On letterhead, dated, signed by an authorized signatory with proof of authority | ★   | Binary            |
| L0-02 · 0  | Three contact persons: technical lead, FHIR developer, privacy contact                                                                              | Each has name, position, email and mobile                                       | ★   | Count (3)         |
| L0-03 · 0  | System identified: name, version/build, deployment model, facility types served                                                                     | System Profile complete and matches the letter                                  | ★   | Binary            |
| L0-04 · 0  | Signed undertaking: follow PH Core and PHeReF; re-test on IG change or major release; test data only                                                | All three clauses present                                                       | ★   | Binary            |
| L0-05 · 0  | The three contacts attended the coordination meeting                                                                                                | Names appear in attendance or minutes                                           |     | Count (3)         |
| L0-06 · 0  | Sandbox access requested and granted                                                                                                                | Confirmation from the endpoint administrator                                    |     | Binary            |
| L1-01 · 1  | Process flows for referring, receiving and back-referral                                                                                            | All three exist and show the real screens and steps                             |     | Binary, weight 3  |
| L1-02 · 1  | User manual with 7 sections: overview and roles; referring; receiving; back-referral; server status and downtime; troubleshooting; support contacts | All 7 present — one missing scores 0%                                           |     | All (7), weight 2 |
| L1-06 · 1  | Release notes for the tested version and a timeline for adopting new IG versions                                                                    | Both submitted                                                                  |     | Binary            |

**Reviewer notes — C1**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C2 · Same codes, same meaning

**Objective:** Every coded field uses the official code list, so every facility and every report reads a code the same way. This is the gate inside Level 2 — test it first.

**Linked concepts:** Builds on C1 (sandbox access) · Feeds C4, C5, C6, C10 and C12 — a wrong code breaks sending, receiving and the reports.

| ID · Level  | What is checked                                                                                                                                                        | Passes when                                                                                                                   | ★   | Score               |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|-----|---------------------|
| TS0-01 · 2A | PH Core / IG-required coded fields: Sex ★, Contact number type ★, Civil status ★, Next-of-kin relationship ★                                                           | Every option or sent code is in the official list on the DOH terminology server                                               | ★   | Count (4)           |
| TS0-02 · 2A | PHeReF coded fields: Practitioner role ★, Referral category ★ (Emergency / Outpatient), Priority ★ (routine / urgent / stat), Reason for referral ★, Referral status ★ | Same as above                                                                                                                 | ★   | Count (5)           |
| TS0-03 · 2A | Wrong codes are caught                                                                                                                                                 | A code outside the list is blocked before sending, OR the server's rejection is shown clearly and the user can fix and resend | ★   | Binary              |
| TS0-04 · 2A | Official label text shown for Practitioner role, Referral category, Reason for referral                                                                                | Labels match the server; a local translation may be added, not substituted                                                    |     | Count (3)           |
| TS0-05 · 2A | International codes are real: SNOMED CT, LOINC, ICD-10                                                                                                                 | Every code in the test referral passes the server check; ICD-10 N/A if not used by the IG                                     |     | Count (3), weight 2 |

The exact source for each field is in the Reference Guide, Chapter 4 (Terminology & Registry Sources) (SRC-01 to SRC-09), and the element, cardinality and binding are in the Reference Guide, Chapter 5 (FHIR Traceability). Open point: the published PHeReF v0.1.0 build does not profile Priority (TS0-02.3) — TDG to confirm (TR-025).

**Reviewer notes — C2**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C3 · Right facility

**Objective:** Referrals carry official facility codes and addresses, so they reach the correct facility and are counted under the correct place.

**Linked concepts:** Builds on C2 · Feeds C9 (the incoming list is found by NHFR code) and C12 (reports by facility, ownership, municipality).

| ID · Level  | What is checked                                                                                                                           | Passes when                                                                                                      | ★     | Score     |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|-------|-----------|
| TS0-06 · 2A | Registry values: PSGC place codes ★, NHFR facility codes ★ (facilities chosen only from the NHFR — absorbs L4-09), NHWR health-worker IDs | Values match the named registry; PSGC release equals the one on the DOH server; a free-typed facility is refused | ★ sub | Count (3) |
| TS1-01 · 2B | Referring facility sent: HCPN name, facility name, NHFR code ★, PSGC-coded address, contact number                                        | Each value on the server matches the Test Data                                                                   | ★ sub | Count (5) |
| TS1-02 · 2B | Receiving facility sent: name, NHFR code ★, PSGC-coded address                                                                            | Same as above                                                                                                    | ★ sub | Count (3) |
| TS2-02 · 2C | Both facilities shown at the receiving side: HCPN, referring name, referring NHFR ★, address, contact, receiving name, receiving NHFR ★   | On-screen value matches the Test Data and was read from the server, not typed                                    | ★ sub | Count (7) |

**Reviewer notes — C3**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C4 · Right practitioner

**Objective:** Both facilities know who referred the patient, who received them and in what role — and the two people are never mixed up.

**Linked concepts:** Builds on C2 (role codes) and C3 (NHWR) · Feeds C10 (who requested and who owns the referral status) and C12 (printed form).

| ID · Level  | What is checked                                                                                                                            | Passes when                                                           | ★     | Score     |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|-------|-----------|
| TS1-03 · 2B | Referring practitioner sent: name, role ★, care navigator (if assigned), recorded as the requester of the referral and its status record ★ | Each value on the server matches the Test Data                        | ★ sub | Count (4) |
| TS2-03 · 2C | Referring practitioner shown: name, role ★, care navigator                                                                                 | Matches the Test Data and was read from the server                    | ★ sub | Count (3) |
| TS2-10 · 2C | Receiving practitioner assigned: name, receiving care navigator, role ★, kept separate from the referring practitioner ★                   | Both appear as different people; the server shows the receiving owner | ★ sub | Count (4) |

The national practitioner ID model is still pending (Connectathon Issue \#10).

**Reviewer notes — C4**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C5 · Right patient, one record

**Objective:** Every patient is identified without doubt across facilities through the PhilHealth and PhilSys numbers, and exists only once on the server.

**Linked concepts:** Builds on C2 (sex codes) and C3 (PSGC address) · Feeds C7 (pre-filled details) and C12 (reports by sex, age, municipality).

| ID · Level  | What is checked                                                                                             | Passes when                                                                                                                                                                        | ★     | Score      |
|-------------|-------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|------------|
| TS0-07 · 2A | PhilHealth ID ★ and PhilSys number ★: captured, format-checked, sent with the official PH Core ID system    | Test value arrives correctly; a wrong-format value is refused; a verification service is used if offered. A missing number is allowed only with a recorded reason — never invented | ★     | Count (2)  |
| TS0-08 · 2A | DSWD household / beneficiary ID field (optional)                                                            | Recorded for information only                                                                                                                                                      |       | Info       |
| TS1-04 · 2B | Patient sent: name, PhilSys ★, PhilHealth ★, birth date, sex ★, civil status, PSGC address, contact, PWD ID | Each value on the server matches the Test Data; age is not sent                                                                                                                    | ★ sub | Count (9)  |
| TS1-05 · 2B | Companion / next of kin sent: name, relationship, contact                                                   | All three match (as RelatedPerson, or Patient.contact while the IG is draft)                                                                                                       |       | Binary     |
| TS2-04 · 2C | Patient shown at the receiving side: the 9 fields above, age worked out from birth date, companion          | Matches the Test Data and was read from the server                                                                                                                                 | ★ sub | Count (11) |
| TS1-16 · 2B | Same patient sent 3 times makes no duplicate (moved from L4-08)                                             | All 3 referrals link to one patient record on the server ★                                                                                                                         | ★     | Count (3)  |

**Reviewer notes — C5**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C6 · Complete clinical picture

**Objective:** The receiving clinician sees what is asked for, how urgent it is, why, and the patient's condition — exactly as recorded at the referring facility.

**Linked concepts:** Builds on C2 (codes) and C5 (patient) · Feeds C11 (back-referral) and C12 (reasons, top diagnoses).

| ID · Level         | What is checked                                                                                                                                        | Passes when                                                           | ★     | Score     |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|-------|-----------|
| TS1-06 · 2B        | Referral request sent: date, category ★, priority ★, reason ★, links to patient / referrer / receiver ★, fixed values (intent = order, status)         | Each value on the server matches the Test Data                        | ★ sub | Count (6) |
| TS2-05 · 2C        | Referral request shown: date, category ★, priority ★, reason ★                                                                                         | Matches the Test Data and was read from the server                    | ★ sub | Count (4) |
| TS1-07 · 2B        | Findings sent: chief complaint, working impression ★ (coded), clinical history                                                                         | Each value on the server matches                                      | ★ sub | Count (3) |
| TS2-06 · 2C        | Findings shown: the same three, plus the referring visit (date / type)                                                                                 | Matches, read from the server                                         | ★ sub | Count (4) |
| TS1-08 · 2B        | Vital signs sent with LOINC code and unit: blood pressure ★ (systolic / diastolic), heart rate, breathing rate, oxygen saturation, temperature, weight | Each value on the server matches                                      | ★ sub | Count (6) |
| TS2-07 · 2C        | Vital signs shown with value and unit: the same six, blood pressure ★                                                                                  | Matches, read from the server                                         | ★ sub | Count (6) |
| TS1-09 · 2B        | Lab result file attached                                                                                                                               | Server holds the file with its file type                              |       | Binary    |
| TS2-08 · 2C        | Lab file listed with the received referral                                                                                                             | The file from TS1-09 is listed                                        |       | Binary    |
| L4-05 · 4 Maturity | Lab file opens at the receiving facility                                                                                                               | The file opens correctly                                              |       | Binary    |
| TS1-10 · 2B        | Treatment given before referral sent                                                                                                                   | On the server, linked to the patient (medication or procedure record) |       | Binary    |
| TS1-11 · 2B        | Professional signature and its date / time sent                                                                                                        | Both on the server                                                    |       | Count (2) |
| TS2-09 · 2C        | Treatment, signature and signature date / time shown                                                                                                   | Match, read from the server                                           |       | Count (3) |
| TS1-13 · 2B        | Referral linked to the visit at the referring facility                                                                                                 | The visit record exists and the referral points to it                 |       | Binary    |
| TS1-14 · 2B        | Time called captured in the EMR?                                                                                                                       | Information only — no national field yet                              |       | Info      |
| TS1-15 · 2B        | Mode of transport captured in the EMR?                                                                                                                 | Information only — no national field yet                              |       | Info      |

**Reviewer notes — C6**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C7 · Record once, never re-type

**Objective:** Patient details recorded once flow into the referral, and into the receiving EMR, without re-typing. This was the main gap seen at the June 2026 Connectathon.

**Linked concepts:** Builds on C5 and C6 · Feeds C5 and C6 back — fewer typing errors in what is sent and received.

| ID · Level         | What is checked                                                                                                                                                     | Passes when                                                                                                                        | ★   | Score                |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|-----|----------------------|
| L1-04 · 1          | How patient details reach the referral, shown with the Test Data patient: name, birth date, sex, PhilSys, PhilHealth, address, contact                              | No re-typing (built-in or connected system) = 100%; manual encoding = 50%; no diagram or demo = 0%. Design choice is not penalised |     | Tier, weight 2       |
| L4-03 · 4 Maturity | Referral form pre-filled from the patient record: name, birth date, sex, PhilSys, PhilHealth, address, contact, chief complaint, working impression, blood pressure | Count of the 10 fields pre-filled correctly                                                                                        |     | Count (10), weight 2 |
| L4-04 · 4 Maturity | Receiving facility imports the same 10 fields into its own patient record                                                                                           | Count of fields imported without re-typing                                                                                         |     | Count (10), weight 2 |

**Reviewer notes — C7**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C8 · Accepted by the national server

**Objective:** The referral follows the national FHIR rules, so the central server accepts it whole and can check it.

**Linked concepts:** Builds on C2 to C6 (all the data being sent) · Feeds C9 and C10 — nothing can be received unless it is first accepted.

| ID · Level    | What is checked                                                                      | Passes when                                                                 | ★   | Score      |
|---------------|--------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-----|------------|
| L1-03 · 1     | Supported FHIR actions documented per record type (e.g., a CapabilityStatement)      | Lists every record type used in TS1 / TS2 with create, read, update, search | ★   | Binary     |
| TS1-T.01 · 2B | The complete referral is accepted                                                    | Server returns success for every part of the referral                       | ★   | Binary     |
| TS1-T.02 · 2B | The referral passes official validation                                              | 0 errors against the PHeReF / PH Core rules                                 | ★   | Binary     |
| TS1-T.03 · 2B | Each of the 13 record types states which national rule set it follows (meta.profile) | Count of record types with the correct rule set                             |     | Count (13) |

Format bar (Technical Baseline TB-10): FHIR R4, JSON, UTF-8, IG versions announced by the DOH. The FHIR Traceability sheet lists the profile, element, cardinality and binding for every field.

**Reviewer notes — C8**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C9 · The referral is noticed

**Objective:** The receiving facility sees new referrals on its own and without delay — no one has to phone in a referral number.

**Linked concepts:** Builds on C3 (addressed by NHFR code) and C8 (accepted by the server) · Feeds C10 (the facility can act on it).

| ID · Level  | What is checked                                           | Passes when                                                             | ★   | Score               |
|-------------|-----------------------------------------------------------|-------------------------------------------------------------------------|-----|---------------------|
| TS2-01 · 2C | New referrals found without typing an ID                  | The test referral appears in the incoming list on its own               | ★   | Binary              |
| L3-13 · 3   | Alert or pop-up for each new referral, without refreshing | Count of 3 test referrals that raise an alert                           |     | Count (3), weight 2 |
| L3-12 · 3   | Incoming list updates without refreshing                  | Time observed is recorded; time limit waits for the consultant's advice |     | Info                |

**Reviewer notes — C9**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C10 · Status tracked both ways

**Objective:** Both facilities, and the dashboards, always see the true status of each referral and when each step happened.

**Linked concepts:** Builds on C2 (status codes), C4 (who requests, who owns) and C8 · Feeds C11 and C12 (counts and turnaround time).

| ID · Level         | What is checked                                                                                                    | Passes when                                                                 | ★     | Score     |
|--------------------|--------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-------|-----------|
| TS1-12 · 2B        | Status record created on sending: status = requested ★, linked to the referral ★, requester and owner, date sent   | Each value on the server matches                                            | ★ sub | Count (4) |
| TS2-11 · 2C        | Receiving facility updates the status on the server: received ★, accepted ★, rejected with reason, completed       | Each status confirmed on the server (rejection uses a second test referral) | ★ sub | Count (4) |
| TS2-12 · 2C        | Referring facility sees the new status, including a rejection and its reason                                       | The referring EMR shows it                                                  | ★     | Binary    |
| TS2-13 · 2C        | Date and time kept for each status: requested ★, received ★, accepted / rejected ★, completed ★ (moved from L4-06) | Status history on the server shows all four, none overwritten               | ★     | Count (4) |
| L4-11 · 4 Maturity | Referring facility can cancel; the receiving side sees it                                                          | Receiving EMR shows "cancelled"; N/A with reason if the IG version lacks it |       | Binary    |

**Reviewer notes — C10**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C11 · Care continues across facilities

**Objective:** The patient's journey stays linked — back to the home facility and onward to higher care — so no one is lost or counted in two places.

**Linked concepts:** Builds on C6 and C10 · Feeds C12 (redirected and completed counts).

| ID · Level     | What is checked                                                                                                    | Passes when                                      | ★   | Score     |
|----------------|--------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|-----|-----------|
| L4-01 · 4 Core | Back-referral reaches the original referring facility                                                              | Appears at the referring EMR and on the server   | ★   | Binary    |
| L4-02 · 4 Core | Back-referral content: final diagnosis / outcome, treatment given, follow-up instructions                          | Count present and correct                        |     | Count (3) |
| TS1-T.04 · 2B  | Onward referral keeps the chain: status = referred onward; new referral points to the old one; old referral closed | All three seen on the server                     |     | Binary    |
| L4-10 · 4 Core | Three-step chain (primary → district → apex)                                                                       | Each step linked to the one before on the server |     | Binary    |

L4-01, L4-02 and L4-10 are Core-track: they move to Level 2 once the PHeReF IG models back-referral and the referral chain.

**Reviewer notes — C11**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C12 · Reports that add up

**Objective:** Reports and dashboards count the known test referrals exactly — nothing lost, nothing doubled — under one documented rule per indicator, so the DOH can trust the numbers.

**Linked concepts:** Builds on C3, C5, C6, C10 and C11 (all the data behind the counts) · Feeds DOH monitoring and planning.

| ID · Level | What is checked                                                                                                                   | Passes when                                                                    | ★   | Score               |
|------------|-----------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|-----|---------------------|
| L3-03 · 3  | Linelist total = number of test referrals                                                                                         | Exact match                                                                    | ★   | Binary              |
| L3-04 · 3  | Incoming, outgoing and received counts                                                                                            | All 3 match the expected values                                                | ★   | Count (3)           |
| L3-10 · 3  | Linelist totals = summary report totals                                                                                           | Same totals in both                                                            | ★   | Binary              |
| L3-05 · 3  | Deferred / denied and redirected counts                                                                                           | Both match                                                                     |     | Count (2)           |
| L3-06 · 3  | Top reasons: consultation, diagnostics, procedure, others                                                                         | Each count matches                                                             |     | Count (4)           |
| L3-07 · 3  | Government vs private, incoming and outgoing                                                                                      | Each count matches                                                             |     | Count (4)           |
| L3-08 · 3  | By receiving facility level: RHU, infirmary, Level 1, 2, 3                                                                        | Each count matches                                                             |     | Count (5)           |
| L3-09 · 3  | Average turnaround time (received minus referred)                                                                                 | Within 1 minute of expected                                                    |     | Binary              |
| L3-16 · 3  | Top 4 working impressions: J18.9, O14.1, I10, A09                                                                                 | Counts match and rank follows the counts                                       |     | Count (4)           |
| L3-01 · 3  | Printable referral form has all TS1 data, by 6 parts: facilities; patient; request; clinical; practitioners and signature; status | Each part fully printed                                                        |     | Count (6)           |
| L3-02 · 3  | Linelist columns: patient, referring facility, facility type, classification, turnaround time, month / year filter                | Count present                                                                  |     | Count (6)           |
| L3-14 · 3  | Export to CSV or Excel                                                                                                            | File opens and matches the screen                                              |     | Binary              |
| L3-15 · 3  | Filters: sex, age group, municipality, facility                                                                                   | Count available                                                                |     | Count (4)           |
| L3-17 · 3  | Month boundary (Section C): referral at 23:50 on the last day, received after midnight                                            | Counted in the month referred; month totals match (IND-01)                     |     | Count (3)           |
| L3-18 · 3  | Duplicate and cancelled referrals in the counts                                                                                   | Duplicate counted once; cancelled excluded from active totals (IND-02, IND-03) |     | Count (2), weight 2 |
| L3-19 · 3  | Late status changes and turnaround time                                                                                           | Re-run shows new statuses; TAT uses the first "received" time (IND-04, IND-08) |     | Count (3)           |
| L3-20 · 3  | Combined filters                                                                                                                  | Each listed combination matches the expected count                             |     | Count (3)           |
| L3-21 · 3  | Exported totals                                                                                                                   | Export totals = screen totals = expected values (IND-09)                       |     | Binary              |

Expected values are in Test Data Sections B and C; the calculation rules are in the Reference Guide, Chapter 6 (Indicator Definitions) (IND-01 to IND-11, proposed).

**Reviewer notes — C12**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C13 · Security and privacy

**Objective:** Only the right people see patient data, every action can be traced to a person, and data is protected in transit and in storage — in line with RA 10173 and NPC Circular 2023-06.

**Linked concepts:** Builds on the Technical Baseline (TB-01 to TB-14) · Protects every other concept; required before live patient data is exchanged.

| ID · Level  | What is checked                                                                                                                                                                  | Passes when                                                                                                       | ★   | Score               |
|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|-----|---------------------|
| L1-05 · 1   | Security and privacy design covers 5 topics: log-in and roles; audit log; encryption and passwords; backup; privacy by design (collect only what is needed, retention, disposal) | Each topic shown by any accepted evidence and mapped to the TB items                                              |     | Count (5)           |
| TEC-01 · 2D | Every connection is encrypted (TB-01, TB-02)                                                                                                                                     | Each endpoint: HTTPS only, TLS 1.2 or 1.3, no weak ciphers, valid certificate (by TLS scan)                       | ★   | Binary              |
| TEC-02 · 2D | One account per user (TB-05)                                                                                                                                                     | No shared accounts; short password refused; repeated failed log-ins locked or slowed                              | ★   | Binary              |
| TEC-03 · 2D | Roles limit access: referring clinician, receiving clinician, administrator, report viewer                                                                                       | Each role is blocked from one action outside its role                                                             |     | Count (4)           |
| TEC-04 · 2D | Audit log records 10 actions with user and time: create, view, edit, send, receive, accept, decline, print, export, log-in (TB-08)                                               | Count of actions found in the log                                                                                 |     | Count (10)          |
| TEC-05 · 2D | Automatic log-out when idle (TB-06)                                                                                                                                              | Logged out or locked after the set time; default 15 minutes or less                                               |     | Binary              |
| TEC-08 · 2D | Stored data encrypted (AES-128 or stronger) and passwords stored as salted adaptive hashes (TB-03, TB-04)                                                                        | Shown by any accepted evidence; plain text, MD5 or SHA-1 fails                                                    |     | Binary, weight 2    |
| TEC-09 · 2D | Access boundaries: safe failed log-in, other facilities' referrals blocked ★, changed IDs in URL / API blocked ★, no privilege escalation ★, no access without a valid session   | Each black-box attempt is refused (TD-D18 to TD-D21)                                                              | ★   | Count (5)           |
| TEC-10 · 2D | Sessions end when they should: after log-out, after expiry, and when an account is deactivated                                                                                   | Replayed / expired sessions refused; deactivated user locked out within the TB-12 limit                           |     | Count (3), weight 2 |
| TEC-11 · 2D | No leaks: error messages, browser code / storage, application logs                                                                                                               | No stack traces, secrets or unauthorised patient data found (TB-13)                                               |     | Count (3)           |
| TEC-12 · 2D | Audit log cannot be changed and records security events: failed log-ins, role changes, deactivation                                                                              | No role can edit or delete entries; the events appear; access restricted                                          |     | Count (4), weight 2 |
| TEC-13 · 2D | Outgoing connections check certificates; any public API is rate-limited                                                                                                          | Invalid-certificate endpoint refused (TD-D22); throttling or documented control (N/A if no API)                   |     | Count (2)           |
| TEC-14 · 2D | Independent vulnerability assessment (VAPT or authenticated scan) of the tested version                                                                                          | Within 12 months, right scope, independent, no open critical / high findings (TB-14). Not a substitute for a VAPT |     | Binary              |
| L3-11 · 3   | Dashboard viewers see only de-identified totals                                                                                                                                  | No names or IDs can be seen or exported                                                                           | ★   | Binary              |

This is security conformance testing of defined controls. Passing it is not the same as passing a vulnerability assessment and penetration test (VAPT); TEC-14 only checks that one exists.

**Reviewer notes — C13**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

### C14 · Fails safely, keeps working

**Objective:** When an exchange is wrong or interrupted, the system says so, loses nothing, never duplicates, and recovers — and data that exists only in the system can be restored.

**Linked concepts:** Builds on C1 (downtime section of the manual, L1-02.5), C8 (server acceptance) and C13 (encrypted backups) · Protects C9, C10 and C12 during errors and outages.

| ID · Level  | What is checked                                                                                          | Passes when                                                                                                                    | ★   | Score               |
|-------------|----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|-----|---------------------|
| TS3-01 · 2D | Referral missing a mandatory element (birth date ★, receiving facility ★); corrected referral accepted ★ | Blocked or rejection shown; never shown as sent; exactly one referral after correction                                         | ★   | Count (3)           |
| TS3-02 · 2D | Malformed values: impossible date, non-numeric vital sign, future birth date                             | Refused or rejection handled; other entered data kept                                                                          |     | Count (3)           |
| TS3-03 · 2D | Invalid references: unknown NHFR code, unregistered practitioner                                         | Prevented or rejection handled                                                                                                 |     | Count (2)           |
| TS3-04 · 2D | Duplicate submission: double Send ★, resend of an accepted referral ★                                    | Exactly one ServiceRequest and one Task on the server                                                                          | ★   | Count (2)           |
| TS3-05 · 2D | Connection loss before ★ or during sending ★ (absorbs TEC-06); original date referred kept               | No loss; exactly one copy after recovery; user sees the status                                                                 | ★   | Count (3)           |
| TS3-06 · 2D | Partial failure: one invalid part in the referral                                                        | No orphan or half-saved records ★; not shown as sent ★                                                                         | ★   | Count (2)           |
| TS3-07 · 2D | Terminology server or facility registry unavailable                                                      | Valid cached codes or a clear block; never invented codes or free-typed facilities                                             |     | Count (2)           |
| TS3-08 · 2D | System credential rejected or expired                                                                    | Clear failure, referral kept unsent / queued, sent after restore, no secret shown                                              |     | Binary              |
| TS3-09 · 2D | Receiving side: server outage, recovery, duplicate delivery                                              | Outage shown; nothing missed after recovery; referral listed once                                                              |     | Count (3), weight 2 |
| TEC-07 · 2D | Backup and restore of system-only data: accounts, roles, audit log, settings (TB-09)                     | Daily, encrypted, stored apart; proven by a restore demo, a dated restore record, or a provider report plus signed attestation |     | Binary              |

Inputs and expected results for every TS3 scenario are fixed in advance in Test Data Section D (TD-D01 to TD-D25).

**Reviewer notes — C14**

| ID  | Tag | Note or proposed change | Reviewer |
|-----|-----|-------------------------|----------|
|     |     |                         |          |
|     |     |                         |          |

## Revision log and instructions for the revision agent

The Technical Lead moves each proposal from the Reviewer notes tables into this log and sets its decision. The revision agent applies only rows marked Agreed, then marks them Applied.

| \#  | ID  | Tag | Agreed change (exact wording where possible) | Raised by | Decision     |
|-----|-----|-----|----------------------------------------------|-----------|--------------|
| 1   |     |     |                                              |           | \[Decision\] |
| 2   |     |     |                                              |           | \[Decision\] |
| 3   |     |     |                                              |           | \[Decision\] |
| 4   |     |     |                                              |           | \[Decision\] |
| 5   |     |     |                                              |           | \[Decision\] |

Where each ID lives in the workbook

| ID starts with | Sheet                                                                                  |
|----------------|----------------------------------------------------------------------------------------|
| L0-            | L0 Application                                                                         |
| L1-            | L1 Documentation                                                                       |
| TS0-           | L2-TS0 Terminology                                                                     |
| TS1-           | L2-TS1 Submission                                                                      |
| TS2-           | L2-TS2 Retrieval                                                                       |
| TEC-           | L2-Security, upper part (TEC-06 moved to TS3-05 — do not reuse)                        |
| TS3-           | L2-Security, lower part (exception scenarios)                                          |
| L3-            | L3 Reports                                                                             |
| L4-            | L4 Advanced (L4-06, L4-07, L4-08, L4-09, L4-12, L4-13 moved or removed — do not reuse) |
| TB- · SRC-     | Reference Guide Ch. 3 · Ch. 4                                                          |
| TR- · IND-     | Reference Guide Ch. 5 · Ch. 6                                                          |
| TD-D           | Test Data Section D                                                                    |

Instructions for the agent

1.  Inputs: this document (exported) and HIE_System_Validation_Testing_Criteria_rev9.xlsx (+ the Technical Reference Guide). Outputs: the Rev 10 workbook and a Rev 10 change log (ID · change · reason · raised by).

2.  Act only on Agreed rows in the log above. \[QUESTION\] and \[OK\] notes never change the workbook; list them in the change log as "noted".

3.  Column map for criterion rows (row 9 headers): What is checked → C; Developer's Guide → D; Validator's Guide → E ("Passes when" in this document summarises E); Evidence → F; Role → G; Critical → H (Yes / No / ★ subs; Yes on a ↳ row = ★ sub-item); Weight → I; Scoring type → J; Notes / Evidence IDs → P. Keep D, E and F consistent with any change.

4.  Adding a sub-item: insert a ↳ row under its parent, copy formulas from a sibling sub-item row (columns M to W), widen the parent's ranges in K, L, M, O, S and V, number the new ID in sequence, and fix the index in the column U formula.

5.  Adding a criterion: use the next free ID on that sheet, copy the formula pattern of a row with the same scoring type (including helper column W), and confirm the sheet and Summary ranges (rows 10 to 300) still cover it.

6.  Removing or moving: never renumber other IDs. A moved item gets the new sheet's prefix; add the old → new ID to the Retired / Moved list on the Summary sheet and to the change log.

7.  Keep linked material in step: the Reference Guide (FHIR Traceability first when an IG changes), Test Data references (Sections A to D), the "Used in" and "Tested in" columns of Terminology & Registry Sources, "Related criteria" in the Technical Baseline, Indicator Definitions for Level 3 changes, the Instructions sheet and the guide's Glossary if a rule changes, and pass marks on the Summary (column D).

8.  Check before handing back: recalculate, confirm no \#REF! or other errors, every sheet status shows INCOMPLETE on a blank evaluation, and the Summary count register matches this document (103 criteria in Rev 9, plus or minus agreed changes).

9.  Close the loop: update the matching concept table here so it matches the new workbook, and set the log row to Applied.
