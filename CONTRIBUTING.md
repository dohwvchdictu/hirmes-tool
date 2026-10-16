# Contributing

A change is **one edit and one commit**. The workflows check it and regenerate every output.
Never edit a generated workbook or document by hand; change the source file instead.

## The routine

1. Edit the criterion file (`criteria/<sheet>/<ID>.yaml`), `scoring.yaml`, a register or a sheet
   introduction (`criteria/sheets.yaml`). VS Code with the YAML extension checks the fields as you type.
2. Run `python scripts/check.py` (optional locally; CI always runs it).
3. Commit with a structured message (below) and push.
4. Check the workflow run: it must be green. Download the generated workbook from the run if needed.
5. When a revision is ready for the TWG, tag a release candidate (see *Releasing*).

For a larger revision, work on a branch (for example `next-release`) and merge it into `main` when the
TWG has reviewed it. Every pushed branch gets its own scorecard preview on the landing page, so the TWG
can try the changes before they are merged; the preview disappears when the branch is deleted.

## Commit messages

```
type(scope): what changed (reason or TWG reference)
```

| type | Use for | Example |
| --- | --- | --- |
| `feat` | A criterion or sub-item added | `feat(TS2): add TS2-14 status history timestamps` |
| `fix` | A correction | `fix(TS1-16): correct validator guide reference to TS0-07` |
| `docs` | Guide or introduction text only, no scoring effect | `docs(L3): clarify reconciliation steps` |
| `policy` | Thresholds, weights, critical flags, approval record | `policy!: raise Level 2 threshold to 0.90 (TWG res. 2026-14)` |
| `retire` | A criterion retired, moved or merged | `retire(L4)!: retire L4-12 (TWG decision 2026-09)` |
| `chore` / `ci` / `build` | Repository housekeeping, workflows, scripts | `ci: cache pip downloads` |

Add `!` after the type when the change affects scoring (weights, critical flags, thresholds, items
added or removed). The change log groups commits by type.

## Adding a criterion

1. Create `criteria/<sheet>/<NEW-ID>.yaml` using the **next unused ID**. Copy an existing file of the
   same scoring type as a starting point.
2. Set `status: active` and `added_in:` the release it will appear in (for example `1.1.0`).
3. Add the ID to the sheet's `order` list in `criteria/sheets.yaml` where it should appear.
4. Commit: `feat(<sheet>): add <ID> <short title>`.

Scoring types:

| `scoring` | Result is entered on | Score |
| --- | --- | --- |
| `binary` | the criterion (Met / Not Met / Not Tested / N/A) | 1 if Met |
| `tier` | the criterion (Fully integrated / Standalone - manual encoding / Not Met / Not Tested) | 1 / 0.5 / 0 |
| `count` | each sub-item | share of applicable sub-items Met |
| `all-or-nothing` | each sub-item | 1 only if every applicable sub-item is Met |

`critical`: `yes` (must be Met), `subs` (the ★ sub-items decide), `no`. A sub-item with
`critical: true` is a ★ item: Not Met or N/A makes its criterion a critical failure.

## Removing a criterion — never delete the file

IDs are never deleted, renumbered or reused.

```yaml
status: retired          # or moved / merged
retired_in: 1.1.0
reason: Official conformance suite removed until a PHeReF test kit exists
replaced_by: TS0-07      # only for moved / merged
```

Commit: `retire(<sheet>)!: retire <ID> (<decision reference>)`. The criterion disappears from the sheets
and scoring and is listed in the Retired / Moved IDs table. To retire a sub-item, add
`status: retired`, `retired_in` and `reason` to that sub-item.

## Moving a criterion to another level

Retire the old ID with `status: moved` and `replaced_by: <new ID>`, then add the new criterion (with a
new ID) in the other sheet with a `history` entry pointing to the old ID.

## Policy changes

Thresholds and pass rules are DOH policy. Change `scoring.yaml` only after the TWG decision, cite the
decision in the commit message, and when the thresholds are approved set `policy.status: Approved`
with `approved_by`, `date_approved` and `reference` filled in (the check fails otherwise).

## Releasing

```bash
git tag v1.0.0-rc1 -m "Release candidate 1 for TWG review"
git push origin v1.0.0-rc1
```

The release workflow builds the workbook, the change summary (compared with the previous tag) and the
change log, and publishes them as a GitHub Release. Tags with `-rc` are marked as pre-releases.
After TWG approval, tag the final version (`v1.0.0`) on the approved commit.

## Certificates

> **Proof of concept.** The certificate feature is a proof of concept for discussion. Its design,
> wording, signatories, integrity features and verification process do not represent the actual DOH
> certificate or its implementation. The Certificate and Verify pages say so, and every printed
> certificate carries "PROOF OF CONCEPT — NOT AN OFFICIAL DOH CERTIFICATE". The notice comes from
> `notice` in `criteria/certificate.yaml`; blank it only when the DOH adopts the feature.

How a certificate is generated, secured and verified, and the sample certificate for reviewers, are
explained in the Technical Reference Guide, Chapter 7.4–7.9 (`docs/reference-guide/reference-guide.md`, shown under
Reference with ✎ Edit on every section); its terms are in the glossary (`registers/glossary.yaml`, section 2.1).

The web scorecard prints a Certificate of Validation (Output › Certificate, one A4 page in landscape
or portrait, white background to save ink). Its details come from the System Profile: certificate number and date of
issuance, vendor / developer and applicant category, product name and exact version / build, PH Core
and PHeReF IG versions, expiry date, and the signatory (Head of KMITS or DOH CHD Regional Director).
Below the statement one ruled table holds the certificate number, date of issuance and validity; the
developer and applicant category; the versions validated against (HL7 FHIR release, PH Core and PHeReF
IG); and the score of each sheet of Levels 2–4 (2A–2D, 3 and 4; "--" for a sheet not passed yet, while
the register keeps every score and status). The certificate number also stands alone in the upper
right corner; the level achieved is in the line at the foot. An optional `validity_note` prints boxed under the table as the scope of validity.
The page lists what is still open; until everything is in order (details filled in, Levels 0–3
passed, thresholds approved, a released criteria version) it prints as a SPECIMEN. Long details stay
on the page: the title and product name shrink first, then all the text, and the page warns when even
the smallest size does not fit.

| To change | Edit |
| --- | --- |
| Title, subtitle, statement, validity note, microtext, signatory designations, verification address and its label, proof-of-concept notice, default orientation | `criteria/certificate.yaml` (✎ Edit on the Certificate page) |
| Orientation of one certificate | The *Orientation* choice on the Certificate page, or *Certificate orientation* in the System Profile (not part of the fingerprint) |
| Certificate fields in the System Profile | `criteria/profile.yaml`, section *Certificate* (the signatory choices must match `certificate.yaml`) |
| The DOH seal on the letterhead | Add the official file at `tool/img/doh-seal.png` (full colour or grayscale, per the DOH Brand Book) |
| Further logos next to the seal (government advocacy logo, this system's logo) | Add the image under `tool/img/` and list it under `logos` in `criteria/certificate.yaml` (file and alt text); they print after the seal in that order |

**Integrity.** Each certificate has a fingerprint: the first 16 hex digits of SHA-256 over its
details, its FHIR release and its Level 2–4 results (a register entry without `results`, recorded
before results were printed, keeps its details-only fingerprint), computed the same way by `tool/cert.js` and
`scripts/common.py`. The fingerprint seeds the guilloche border and the security emblem, so every
certificate has its own pattern. Microtext runs along the frame.

The **security emblem** joins the QR code and the security rosette: the code in front (error
correction level L, the smallest code for the address, so its modules print large), and behind and
around it a ring of 64 ticks spelling the fingerprint's bits clockwise from a ▼ mark, a guilloche ring
with 6–14 lobes, and very light slanted lines behind the code. The code opens *Verify a certificate*
on the published draft scorecard with the number and fingerprint; the verification address is also
printed beside the emblem. The Verify page answers from the register below, redraws the emblem and
lists what to compare (the code, the ticks, the lobe count). The fingerprint is not a signature (anyone
can compute one): a certificate counts as issued only when its entry is in the register.

**Register of issued certificates** (`criteria/certificates-issued.yaml`). Each change is one commit,
so the history of every certificate is in git:

| Event | Change | Commit |
| --- | --- | --- |
| Issue | Paste the entry shown on Output › Certificate (or ✉ ask the administrator; it opens a *Certificate record* issue with the entry filled in) | `cert: record HIE-WV-2026-0001` |
| Revoke | Set `status: revoked` and add `reason` | `cert: revoke HIE-WV-2026-0001 (memo 2027-03)` |
| Re-issue after a re-evaluation | Record the new certificate with `supersedes: <old number>`; the old one then verifies as *superseded* | `cert: record HIE-WV-2028-0004` |

Each entry generated by the Certificate page also carries the full **validation record** under
`validation`: application number, evaluation type, date(s) of testing, deployment model, terminology
release and conducting office; the status of every level; and for every sheet (Levels 0–4) its score,
pass mark, status, criterion counts (met, partial, not met, N/A, not tested, info only), critical items
not met and the IDs of the criteria still needing compliance. It is the benchmark of the system and is
shown on the Verify page. It is not printed and not part of the fingerprint; `check.py` checks that
each sheet's counts add up and that its score and status match the printed result.

Never edit the details of a recorded entry: `check.py` recomputes every fingerprint and fails when the
details no longer match, and also checks unique numbers, expiry after issuance, `supersedes`
pointing to a recorded certificate, and a reason for every revocation.

## Help, terms and documents in the web scorecard

The web scorecard links every criterion to its terms, registers and guides. Nothing is written by
hand in the tool: it is generated from the files below, so editing one file updates every view.

| To change | Edit | Shows up as |
| --- | --- | --- |
| A term's meaning | `registers/glossary.yaml` | Underlined term in criteria text → popover; Reference › Glossary |
| An abbreviation | `registers/abbreviations.yaml` | Dotted acronym → popover; Reference › Abbreviations |
| A TB-, SRC-, TR- or IND- entry | the matching file in `registers/` | ID → popover with "Used by"; register page |
| Help next to a control (ⓘ) | `registers/form-help.yaml` | ⓘ popover on Result, Scoring, Critical, Weight, Validation role, summary |
| System Profile sections, field labels, help and choices; team roles, agencies and sign-off order | `criteria/profile.yaml` | System Profile page: hint under each field, ⓘ popover, ✎ Edit on each section; one row per person on the Printed Report sign-off (keep `key` unchanged; saved evaluations use it) |
| Developer's / Validator's guide, Evidence | the criterion's YAML (`developer_guide`, `validator_guide`, `evidence`) | Guide drawer (buttons under each criterion) |
| Traces | the criterion's `traces` | Guide drawer › Traces, and "Used by" on the register entry |
| Technical Reference Guide prose | `docs/reference-guide/reference-guide.md` | Reference (one page per chapter; the register tables appear where the guide has a `<!-- register: KEY -->` marker, see `docs/README.md`) |

How terms are linked:

- Acronyms (FHIR, NHFR), CamelCase names (ServiceRequest) and multi-word phrases in a glossary term
  are linked automatically, once per criterion. Ordinary single words are not, so text is not flooded.
- To link another spelling, add `aliases: [Patient ID, PIN]` to the glossary entry.
- To stop a term being linked, add `link: false`.
- To attach a term to a criterion that does not mention it, add `terms: [Referral Hub]` to the criterion.
- `see:` in `form-help.yaml` and `terms:` in a criterion must name a glossary term, abbreviation,
  register ID or criterion ID; the check fails otherwise.

### Edit links (✎) on every item

Every criterion card, sheet heading, guide drawer tab, help popover, glossary term, abbreviation,
register entry, ID prefix and document chapter has a ✎ button (hover to reveal it on reference lists).
It knows the exact file and lines the item comes from and offers three actions:

| Action | What it does | Who it suits |
| --- | --- | --- |
| ✎ Edit on GitHub | Opens the file in GitHub's editor on the branch being viewed (releases open `main`). Without write access GitHub makes a fork and a pull request. | Editors |
| ⌗ Show the lines | Opens the file at the exact lines, in the exact commit the page was built from. | Anyone checking where text lives |
| ✉ Suggest a change | Opens a change request (issue) with the item, its location and its current text filled in. | TWG and workstream reviewers |

A criterion's ✎ menu also lists every field and sub-item with its own lines and ✉ link, and the
guide drawer shows the source of the tab you are reading (Developer's guide, Validator's guide…).
Line numbers are computed at build time, so they never need maintaining. Edit links appear only on
the published site (they need the repository address that GitHub Actions provides).

## What the checks enforce

- every file matches its schema (`schema/`)
- IDs are unique across active, retired and legacy IDs; sub-item IDs start with their criterion's ID
- `count` / `all-or-nothing` criteria have sub-items; `binary` / `tier` criteria do not
- `critical: subs` has at least one ★ sub-item
- retired criteria have `retired_in` and `reason`; `replaced_by` points to an existing ID
- trace IDs (TR-, TB-, SRC-) exist in the registers
- every file carries a license: content CC BY 4.0, code GPL-3.0-or-later (`reuse lint`; new folders need an entry in `REUSE.toml`)
- every sheet has a threshold; an Approved policy has its approval details
- every entry in `criteria/certificates-issued.yaml` matches its fingerprint, and the certificate checks above hold; `tool/cert.js` and `scripts/common.py` compute the same fingerprints, and the QR codes match the `qrcode` package (`tests/test_certificate.py`)
- the generated workbook matches the YAML (round trip), and the workbook and web scorecard score the
  same test scenarios identically
- `see:` entries in `registers/form-help.yaml` and criterion `terms:` resolve to a glossary term, abbreviation, register ID or criterion ID
- every `<!-- register: KEY -->` marker in the Technical Reference Guide names a known register, and each register appears once
- sheet `tab` names in `criteria/sheets.yaml` are valid Excel sheet names (at most 31 characters, none of `: \ / ? * [ ] '`) and unique; renaming a tab there renames the workbook sheet and every formula that refers to it
