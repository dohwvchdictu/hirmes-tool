<!--
Technical Reference Guide: narrative source. This file does not contain the tables of Chapters 2 to 6.
The tables are structured data (registers/*.yaml, criteria/retired-legacy.yaml). The build inserts
each table where a "register:" marker is below, with links to the criteria that use it. Edit the
text here and the tables in registers/.
-->

This guide gives the explanations and reference tables for the testing criteria:

- How to use the criteria (Chapter 1)
- The glossary and the ID prefixes (Chapter 2)
- The Technical Baseline (TB-, Chapter 3)
- The Terminology & Registry Sources (SRC-, Chapter 4)
- The FHIR Traceability matrix (TR-, Chapter 5)
- The Indicator Definitions (IND-, Chapter 6)
- The Certification & Revalidation rules (Chapter 7)

A value with the mark PROPOSED applies only after DOH approval. The scoring policy records the
approval, and the Summary shows it.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT",
"RECOMMENDED", "MAY", and "OPTIONAL" in this guide, in the testing criteria and in the registers are
to be interpreted as described in RFC 2119. These words have this meaning only when they are in
capital letters.

# Chapter 1: Using the testing criteria

## 1.1 Purpose and scope

The workbook decides, level by level, whether an EMR SYSTEM conforms to the national HL7 FHIR
standards (PH Core and PHeReF Implementation Guides). The EMR SYSTEM is the product as the vendor or
in-house developer supplies it. A conformant system can be used in the Health Information Exchange
(HIE) for electronic referral. Each level MUST be PASSED before the next level counts. Each score
comes from evidence, not from the opinion of the evaluator.

- **In scope:** the EMR system and its vendor or developer. This includes the application and
  commitment, the product documentation, and the conformance tests on the DOH test environment
  (sandbox). The tests use test facilities and fictional test data.

- **Out of scope:** engagement and deployment at a real health facility. This includes contracts
  and SLAs, privacy registration and impact assessments, data sharing agreements, ICT assets,
  connectivity, personnel and training. These items are handled after the system passes.

- **Not a security assessment:** the security checks of Level 2D are CONFORMANCE tests of defined
  controls. A pass in Level 2D is not equivalent to a pass in a vulnerability assessment and
  penetration test (VAPT) or in a full cybersecurity assessment. TEC-14 only checks that an
  independent assessment exists.

- **Test roles:** the "referring facility" and the "receiving facility" are TEST facilities on the
  sandbox. The evaluation tests the system in the two roles: sender (TS1) and receiver (TS2).

## 1.2 Process flow

| **Step** | **What happens** | **Level** |
|---|---|---|
| **1.0 Registration** | The vendor or developer submits the letter of application and the System Profile (sections A and B). The Administrator records the application. | 0 |
| **2.0 Assessment of submitted documents** | Validators review the product documentation. | 1 |
| **3.0 Validation** | Validators do scheduled tests on the sandbox. Observers witness the tests. Validators record the results and the evidence references, and recommend the results to the Technical Lead. | 2 to 4 |
| **4.0 Issuance of certificate** | The Technical Lead approves the certificate when Level 3 is PASSED and no critical item is Not Met. Level 4 is the maturity target. System Profile section D records the certificate details. See Chapter 7. | (none) |

## 1.3 The levels

| **Level / part** | **What it proves** | **Proposed pass mark** |
|---|---|---|
| **0: Application & Commitment** | The vendor applied formally, identified the system and gave the names of the accountable contacts. | 90% |
| **1: Product Documentation** | Process flows, user manual, supported FHIR interactions, architecture (integration level), security design, release management. | 85% |
| **2A: TS0 Terminology & Registries** | Coded values and identifiers come from official sources. This part is a gate inside Level 2. Test it first. | 85% |
| **2B: TS1 Submission** | A referral gets to the SHR complete and correct, and the patient is not duplicated. | 85% |
| **2C: TS2 Retrieval** | The receiving facility finds, shows and updates the referral. Each status has a time stamp. | 85% |
| **2D: Security, Reliability & Exception Handling** | Safeguards and access boundaries operate when a user uses the system (TEC-). Wrong, duplicated or interrupted exchanges fail safely and recover (TS3-). | 85% |
| **3: Reports & Dashboard** | Reports give exactly the values of the known test referrals, with the Indicator Definitions (Chapter 6). | 85% |
| **4: Advanced** | Core-track items (back-referral, multi-tier chain) and Maturity items. The Core-track items move to Level 2 when the IG models them. | 75% |

## 1.4 How each criterion is scored

- **Binary:** Met (100%) or Not Met (0%).

- **Count:** each countable part is a sub-item (↳). Mark each sub-item Met, Not Met, Not Tested or
  N/A. The workbook calculates Required, Achieved, Result, Score and Outstanding. Example: 8 of 10
  audit actions logged (TEC-04) = 80%.

- **All-or-nothing:** you mark it like Count. The score is 100% only when all sub-items are Met
  (for example, L1-02 user manual).

- **Tier** (L1-04 only): Fully integrated = 100%. Standalone with manual encoding = 50%. Not Met = 0%.

- **Critical (★ / "Yes"):** the item MUST be Met. A ★ sub-item that is Not Met or N/A makes the
  full criterion a critical failure. The other sub-items still give partial credit.

- **Not Tested** counts as 0% and makes the sheet INCOMPLETE. **N/A** removes a non-critical item
  from the score. On a critical item, N/A counts as Not Met. The evaluator MUST record the reason
  for each N/A.

- **Weight:** critical items 2, other items 1, information-only items 0. The weights are fixed
  before an evaluation starts.

## 1.5 Pass rule

A level is PASSED only when all three of these conditions are true:

1. The evaluator tested each applicable item.
2. Each critical item and each ★ sub-item is Met.
3. The level score is at or above the threshold on the Summary sheet.

Level 2 passes only when all four parts (2A to 2D) pass. A level shows LOCKED until the level
before it passes. The workbook still shows its score, so tests can occur in parallel. A conformant
result shows the range of levels passed, for example "YES (Levels 0–4 passed)".

## 1.6 Design neutrality and the Technical Baseline

- **Freedom in design, verified by outcome:** the criteria state the result that the system MUST
  achieve and how the evaluator verifies it. The vendor selects the architecture, language,
  database, hosting, screen layout and integration method. The evaluation never scores these
  choices.

- **Specific where necessary:** the Technical Baseline (Chapter 3) gives measurable minimums for
  these topics: encryption, password storage, log-in protection, session time-out,
  system-to-system authentication, audit log, backup, FHIR format, revocation, logging hygiene and
  vulnerability management. A product that meets or exceeds these minimums gets Met.

- **Equivalent control:** a vendor can use a different control that it considers equal or
  stronger. In that case, the vendor MUST submit a justification with evidence, together with the
  L1-05 document. The Technical Lead decides before the tests start. The decision applies to all
  applicants.

- **Named sources:** each coded value and each identifier MUST come from the source that Chapter 4
  names. The vendor selects how to connect (live look-up, scheduled sync or cached copy). The
  vendor does not select the source.

- **FHIR mapping:** Chapter 5 traces each referral data element to its profile, element,
  cardinality and binding. When an IG version changes, update Chapter 5 first.

## 1.7 Evidence

- **Server-side evidence (Levels 2 and 4):** any one of these:
  1. The Interoperability Layer transaction log on the sandbox (for example, OpenHIM).
  2. An Inferno or official FHIR validator report.
  3. The raw FHIR request / response payload captured during the session.

  A value on the screen does not prove that the system sent it.

- **Evidence reference:** for each row, write in the Notes column the evidence for the result.
  Write the file or screenshot name and the SHR resource ID (with the version, where relevant).
  Write the IOL transaction ID if available. Keep the files in the repository of the
  Administrator, under the Application No.

- **Version traceability:** record the version or build that you tested, the IG versions and the
  testing dates in System Profile sections C and D. If the build changes during the tests, test the
  affected levels again (Chapter 7).

- **Proprietary documents** (L1-04, L1-05, TEC-07, TEC-08, TEC-11, TEC-14): the vendor selects how
  to prove compliance. The vendor MAY use one of these options:
  - The full document.
  - A redacted version with a signed attestation.
  - An independent certification or report.
  - A view-only presentation, which the evaluator records as "sighted".

  The evaluation never requires source code, keys, credentials or internal network details.

- **Confidentiality:** the evidence is used only for this validation. The Regional Validation Team
  signs a confidentiality undertaking and handles the evidence under it. The tests use only
  fictional test data.

- **Black-box first:** the evaluator tests security and reliability outcomes through use of the
  system.

## 1.8 Test data

| **Section** | **Content** | **Used in** |
|---|---|---|
| **A: Test referral** | Standard fictional values. The evaluator enters them at the referring EMR and compares them at the receiving EMR. | TS0, TS1, TS2 |
| **B: Reconciliation set** | 10 known referrals with automatically calculated expected report values. | L3-03 to L3-16, L3-20.2 |
| **C: Level 3 edge cases** | 6 referrals that the DOH loads on the SHR before the test. They have fixed time stamps in a separate reporting month (month boundary, late update, duplicate, cancelled, status change, filter case). | L3-17 to L3-21 |
| **D: Error inputs** | Error, duplicate, outage and security inputs (TD-D01 to TD-D22), with expected results fixed before the test. | Level 2D: TS3-, TEC-09, TEC-13 |

All data are synthetic. The evaluation uses the same values for each vendor in a test cycle.
Before the tests, replace the \[bracketed\] placeholders with the official dummy facilities and
identifiers from the DOH.

## 1.9 Who does what: Regional Validation Team

| **Role** | **Responsibility** |
|---|---|
| **Technical Lead** | Supervises the evaluation. Decides on equivalent controls. Approves the validation results and the conformance decision. |
| **Validators (2 to 3)** | Come from the DOH-CHD or from partner agencies (for example, PhilHealth, DICT). Do the tests with the Validator's Guide. Record the results and the evidence references. Test corrected items again. Recommend approval. |
| **Administrator** | Processes the application. Keeps the logbook and the evidence repository. Schedules the sessions. Invites Observers. Prepares the certificate for signature. |
| **Observers (1 to 2)** | Come from an LGU, a hospital, an academic or research institution, or another agency. Witness the validation. Do not score. |

## 1.10 Step by step

1. Complete the System Profile. Complete sections A to C before the tests and section D after the
   tests.

2. Prepare the Test Data sheet (Sections A to D). Make sure that the DOH loaded the Section C
   fixtures.

3. Evaluate the levels in sequence, from Level 0 to Level 4. In Level 2, test TS0 first.

4. For each row, select a Result and mark the sub-items. In Notes, write the evidence reference and
   the reason for each N/A.

5. Review the Summary and the Outstanding column. Section D of the Printed Evaluation Report shows
   the items that need compliance. After the vendor corrects an item, test the item again and
   update the result. If the build changed, also test the related level again.

6. Print the Printed Evaluation Report (A4) and sign the Sign-Off.

# Chapter 2: Glossary

This chapter gives each technical or non-basic term in the workbook and in this guide, in groups by
topic. Section 2.10 is a short list of all abbreviations. Section 2.11 explains the ID prefixes
(for example TEC-, TS3-, TB-). Section 2.12 gives the retired IDs.

## 2.1 to 2.9 Glossary

<!-- register: glossary -->

## 2.10 Abbreviations: short list

<!-- register: abbreviations -->

## 2.11 ID prefixes

<!-- register: prefixes -->

## 2.12 Retired and moved IDs

<!-- register: retired -->

# Chapter 3: Technical Baseline (TB-01 to TB-14)

The criteria test OUTCOMES. The vendor selects the design. Where a measurable bar is necessary,
this sheet gives the MINIMUM that the outcome MUST meet. The minimums agree with RA 10173 and with
NPC Circular 2023-06 on the Security of Personal Data. Any product, architecture, programming
language, database or hosting that meets or exceeds the baseline is accepted. The examples are
illustrations, not endorsements.

The DOH sets the values with the mark "DOH policy default" before an evaluation starts. These
values apply equally to all systems. The Technical Lead records each decision on an equivalent
control in the Notes column of the related criterion.

<!-- register: TB -->

# Chapter 4: Terminology & Registry Sources (SRC-01 to SRC-15)

This chapter implements the "Revision of L2" matrix of the consultant. For each concept that Level
2A (TS0) tests, this sheet gives:

- The authority.
- The code system, value set or identifier to use.
- Where to get or verify it.

The vendor selects how the system gets the value (live look-up, scheduled sync or cached copy).
The values MUST match the named source. The system MUST NOT depend on external public servers such
as tx.fhir.org (Connectathon Issue \#9).

<!-- register: SRC -->

# Chapter 5: FHIR Traceability (TR-001 to TR-050)

The build makes this chapter from the published StructureDefinition snapshots of PH Core v0.2.0
(UPM-NTHC/ph-core, build of 9 Sep 2026) and PHeReF v0.1.0 (UPM-NTHC/ph-ereferral, build of 9 Sep
2026). Cardinality, Must Support and binding are as published, with the constraints that the
profiles get from PH Core.

The Interaction column follows the IG example submission. That submission is a FHIR transaction
Bundle, with conditional PUT for Patient, Practitioner, PractitionerRole and Organization, and POST
for clinical resources. Vendors MAY use any equivalent interaction that they declare in L1-03.

When an IG version changes, update this sheet first. Then update the criteria that refer to it.

Status values:

- Confirmed: the mapping matches the IG.
- TDG to confirm / IG discrepancy: the mapping has an open issue (see Notes).

<!-- register: TR -->

# Chapter 6: Indicator Definitions for Level 3 (IND-01 to IND-11) (PROPOSED)

Each Level 3 indicator has one documented rule. Thus two conformant EMRs cannot calculate the same
indicator differently. Validators compare the system reports with the Test Data Expected Results.
The Expected Results use these rules. IND-02 (duplicates) and IND-04 (status at the time of the
report run) apply to each count. The rules with the mark PROPOSED apply after DOH approval. The
Summary sheet records the approval.

<!-- register: IND -->

# Chapter 7: Certification & Revalidation (PROPOSED)

The Technical Lead approves a certificate when Level 3 is PASSED and no critical item is Not Met
(Printed Evaluation Report, section D). System Profile section D records the certificate number,
the date of approval, the validity and the conditions. Section E of the report prints them. The
values in this chapter apply after DOH approval.

## 7.1 Change classes and revalidation scope

| **Change class** | **Definition** | **Examples** | **Required action** | **Re-test** |
|---|---|---|---|---|
| **Major change** | A change to how the system exchanges, codes or secures referral data, or to its architecture tier (L1-04). | New or changed FHIR resources, profiles or interactions. Change of exchange method (for example, from calls for each resource to a transaction Bundle). New authentication method. Move from a built-in to a separate eReferral module. New major version number. Migration of the database or hosting platform. Change of PH Core / PHeReF IG major version. | Full revalidation before the HIE uses the new version. | Levels 1 to 3 (Level 4 if previously claimed) |
| **Minor change** | A functional change in the eReferral module that does not change the exchange method or the security design. | New or changed screens or fields mapped to existing elements. Report or dashboard changes. Workflow changes. A terminology value-set update that the vendor applies. | Partial regression test within 60 days (DOH policy default). Notice to the DOH, with release notes (L1-06), before deployment. | Affected TS1 / TS2 criteria, all ★ critical items of the affected part, TS3, affected Security items and affected Level 3 items |
| **Patch** | A defect fix or security fix that does not change data elements, exchange or reports. | Bug fixes, performance fixes, security patches, corrections to UI text. | Notice to the DOH with release notes within 30 days. Spot check at the next scheduled revalidation, or when a person reports a problem. | None. A spot check of TS1-T.01 / T.02 is OPTIONAL. |
| **IG / terminology update** | The DOH announces a new PH Core / PHeReF IG version, terminology release or registry release for the HIE. | IG technical correction or minor version. New SNOMED CT or PSGC release. New value-set version. | Minor version or technical correction: the vendor MUST conform within the transition period and submit a notice (re-test of affected TS0 items). IG major version: revalidation within the transition period. | Minor: TS0 and affected TS1 / TS2. Major: Levels 2 to 3. |

## 7.2 Validity, surveillance, suspension and revocation

| **Rule** | **Policy** |
|---|---|
| **Certificate validity** | The certificate stays valid until the first of these events: (1) 2 years after the date of approval. (2) A major change replaces the system version. (3) The transition period of the next IG major version ends. |
| **Transition period for new national standards** | 6 months after the DOH announces a new IG major version, or the period that the DOH sets. Systems with a certificate keep it during the transition period. They MUST get revalidation before the transition period ends. |
| **Surveillance** | The DOH MAY do a spot check of a certified system in production, with the consent of the facility. The spot check uses fictional test data on the sandbox, or the logs of the interoperability layer. |
| **Suspension (temporary)** | The DOH suspends a certificate for one of these causes: (1) An unresolved Critical finding reported in production for more than 30 days. (2) A security incident caused by the product, until the vendor corrects the root cause. (3) The vendor did not submit the required notice for a minor change or patch. (4) The vendor did not complete revalidation within the transition period. The DOH tells the facilities. Existing referrals continue. New deployments stop. |
| **Revocation (permanent)** | The DOH revokes a certificate for one of these causes: (1) Misrepresentation of the product, the version or the evidence. (2) Non-conformance that continues after suspension (not corrected within 90 days). (3) Deployment of an uncertified version that the vendor presents as certified. (4) Breach of the confidentiality or test-data undertaking (L0-04). |
| **Re-application after revocation** | Full validation from Level 0, after 6 months. |

## 7.3 Required certificate content

- Certificate number and date of approval

- Product name and exact version or build validated (System Profile A.2, A.3). It MUST match each
  test run used.

- Vendor or developer name (System Profile A.1) and applicant category

- Implementation Guide versions validated against: PH Core and PHeReF (System Profile D.2, D.3)

- Terminology and registry releases used (System Profile D.4)

- Scope and use case: electronic referral, sender (TS1) and receiver (TS2) roles, deployment type

- Validation level achieved (Summary) and date or dates of validation

- Date or dates of testing (System Profile C.8 to C.12)

- Conditions, if any (open Minor findings accepted with conditions, with due dates)

- Validity period or expiry date, and the revalidation triggers above

- Signature of the Technical Lead (approval) and reference to the Printed Evaluation Report

## 7.4 Certificate of Validation: proof of concept

> **Proof of concept.** The Certificate of Validation in this tool is a proof of concept for
> discussion. This includes its design, wording, signatories, security features and verification
> process. They do not represent the real DOH certificate or its implementation. A certificate that
> you print from this tool has no official standing. The notice comes from `notice` in
> `criteria/certificate.yaml`.

The web scorecard prints the Certificate of Validation from Output › Certificate. It checks a
certificate from Output › Verify a certificate. The repository keeps each part of the certificate as
text. Thus a person proposes and reviews a change to the certificate in the same way as a change to
a criterion (✎ Edit on each page):

| Part | Source |
| --- | --- |
| Title, subtitle, statement, microtext, signatories and their designations, verification address and its label, proof-of-concept notice, default orientation. The DOH seal and the other logos printed after it (for example, the government advocacy logo or the logo of this system). | `criteria/certificate.yaml` (image files in `tool/img/`) |
| Certificate fields (number, dates, signatory, supersedes, orientation, conditions) and the HL7 FHIR release | `criteria/profile.yaml` (System Profile) |
| Issued, revoked and superseded certificates, with their validation records | `criteria/certificates-issued.yaml` (register of issued certificates) |
| Generation, security emblem, verification page | `tool/cert.js` (the fingerprint is also in `scripts/common.py`) |

## 7.5 Generating a certificate

1. **Complete the System Profile.** Write these details:
   - The application details: vendor or developer, applicant category, product name, exact version
     or build.
   - The versions tested: HL7 FHIR release, PH Core and PHeReF IG versions.
   - The Certificate section: certificate number, date of issuance, expiry date, signatory and the
     name of the signatory. Supersedes, orientation and conditions are OPTIONAL.

   If you do not write an expiry date, the expiry date is 2 years after the date of issuance
   (PROPOSED).
2. **Open Output › Certificate.** The page checks each condition for a valid certificate:
   - All details are complete.
   - The dates are valid.
   - Levels 0 to 3 are PASSED, with no open critical item.
   - The pass thresholds are approved.
   - The criteria version is a release.

   While one condition is not satisfied, the certificate prints as a specimen, with the text
   SPECIMEN — NOT VALID across the page.
3. **Select the orientation** (landscape or portrait). In the two orientations, the layout fits on
   one A4 page. For long details, the layout first decreases the spacing. Then it decreases the
   size of the title and the product name. Then it decreases the size of all text. If the smallest
   size does not fit, the page shows a warning.
4. **Record the certificate.** The page calculates the certificate fingerprint. It shows the
   register entry to add, with the full validation record. The Administrator adds the entry to the
   register of issued certificates in one commit, or requests it through a *Certificate record*
   issue. Until the register has the entry, the Verify page answers *Not found*.
5. **Print and sign.** Print / save as PDF prints the certificate from edge to edge on white paper.
   The certificate is valid only with the signature of the signatory (the Head of KMITS or the DOH
   CHD Regional Director) and the official seal.

The certificate shows these items:

- The certificate number in the upper right corner.
- The product name and the exact version or build.
- The statement.
- A ruled table with the certificate number, the date of issuance and the validity, the developer
  and the applicant category, and the versions validated against (HL7 FHIR release, PH Core and
  PHeReF IG). The table also shows the result of each sheet of Levels 2 to 4: the score when
  passed, or "--" when not passed yet.
- The security emblem, with the verification site and the certificate fingerprint.
- The signatory.
- In the foot line: the testing criteria version, its commit and the level achieved.

## 7.6 Security features

| Feature | Function | How to check it |
| --- | --- | --- |
| **Certificate fingerprint** | The first 16 hexadecimal digits of SHA-256 over the details of the certificate, its FHIR release and its Level 2 to 4 results. A change to a printed detail gives a different fingerprint. The web scorecard and the check script calculate it with the same method. The check fails when a register entry does not match its fingerprint. | Type it on the Verify page with the certificate number. |
| **Security emblem** | The QR code in front and the security rosette behind it. The two come from the fingerprint. Thus a person cannot move them from one certificate to a different certificate without detection. | Compare it with the emblem that the Verify page draws again. |
| **QR code** | Opens the Verify page with the certificate number and the fingerprint. The QR error correction level is L, the smallest code for the address, so that its modules print large. The rosette behind it is faint, so that it does not prevent scanning. | Scan it. The address MUST be the official verification site printed next to it. |
| **Tick ring** | 64 long and short ticks around the emblem give the 64 bits of the fingerprint, clockwise from the ▼ mark. | Compare each tick with the Verify page. |
| **Guilloche** | The lobed ring of the emblem (6 to 14 lobes, counted on the Verify page), the interlaced border band and the corner rosettes. They come from the fingerprint, so each certificate has its own pattern. | Count the lobes. Compare the pattern. |
| **Microtext** | Very small text along the frame. It includes the certificate number. | Read it with a magnifier. It becomes unclear on photocopies and scans. |
| **Register of issued certificates** | The authority for each certificate. Only a reviewed commit can add, revoke or supersede an entry. Thus the register keeps the history of each certificate. | The Verify page uses the register for its answer. |

The fingerprint is not a digital signature. The method is public, so any person can calculate a
fingerprint and draw a matching emblem. But a forger cannot add an entry to the register. Thus the
authenticity comes from the register. The security features make it easy to find a paper that
does not match its entry.

## 7.7 Verifying a certificate

1. **Open the Verify page.** Use one of these methods:
   - Scan the QR code. Check that the address is the verification site printed on the certificate.
     A certificate printed from a release has the address of the draft scorecard, where the
     register gets new entries. A certificate printed from a draft or a branch preview has the
     address of that build.
   - Open Output › Verify a certificate on the official site that you know. Type the certificate
     number and the certificate fingerprint.
2. **Read the answer.** The page gives one of these answers:
   - *Valid*: the register has the certificate, and it is in its validity period.
   - *Expired*.
   - *Superseded*: a later certificate replaces it. The page gives the name of the later
     certificate.
   - *Revoked*: the page gives the reason.
   - *Not found*: the register does not have the certificate. The certificate was issued after
     this version of the page, or it is not genuine.
   - *Fingerprint does not match*: a person changed the paper or the code, or typed the
     fingerprint incorrectly.
   - *Register entry inconsistent*.
3. **Compare each detail** on the page with the paper: product, exact version or build, vendor,
   dates, versions validated against, results, signatory. A difference shows that a person changed
   the paper.
4. **Compare the security emblem** with the emblem that the page draws again. Scan the code. Compare
   the ticks clockwise from the ▼ mark, the number of lobes and the angle of the faint lines.
5. **Check the microtext** with a magnifier.

The page also shows the validation record: the evaluation details, the status of each level and
the result of each sheet. For a valid certificate, the page gives a **register copy**. The register
copy is the certificate printed again from its register entry, in either orientation. It has the
mark REGISTER COPY — NOT VALID WITHOUT SIGNATURE AND SEAL. It is a reference copy. Only the signed
and sealed original is the certificate.

## 7.8 Register of issued certificates

`criteria/certificates-issued.yaml` contains a list of all issued certificates. Each change is one
commit. Thus the repository keeps the history of each certificate:

| Event | Change | Commit message |
| --- | --- | --- |
| Issue | Add the entry that Output › Certificate shows, or request it through a *Certificate record* issue | `cert: record <number>` |
| Revoke | Set `status: revoked` and add `reason` | `cert: revoke <number> (<reference>)` |
| Re-issue after a re-evaluation | Record the new certificate with `supersedes: <old number>` | `cert: record <new number>` |

An entry contains these items:

- The printed details, the FHIR release and the Level 2 to 4 results. The fingerprint covers these
  items.
- The fingerprint.
- The status.
- The validation record.

The validation record contains:

- The evaluation details: application number, evaluation type, dates of testing, deployment model,
  terminology release, conducting office, designation of the signatory, conditions.
- The status of each level.
- For each sheet of Levels 0 to 4: its score, pass mark, status, criterion counts (met, partial,
  not met, N/A, not tested, info only), critical items not met and the criteria that still need
  compliance.

The validation record is the benchmark of the system. The certificate does not show it, and the
fingerprint does not cover it. The check script makes sure that its counts are correct and match
the printed results.

Do not edit the details of a recorded entry. If you do, the check fails because the details do not
match the fingerprint. Issue a new certificate that supersedes it.

## 7.9 Sample certificate for reviewers

The register contains one sample certificate, **SAMPLE-2026-0001** (with the mark `sample: true`).
It has fictional data. The DOH did not issue it. Reviewers can use it to try the full process:

1. Open Output › Verify a certificate.
2. Select *verify it* next to the sample, or type the number and its fingerprint.
3. Read the answer and the validation record.
4. Compare the security emblem.
5. Print the register copy. It has the mark SAMPLE — NOT A REAL CERTIFICATE.

The same code makes the sample and a real certificate. Thus the fingerprint and the validation
record of the sample pass the same checks.
