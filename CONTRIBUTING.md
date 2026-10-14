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
TWG has reviewed it. Use hyphens, not slashes, in branch names.

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

## What the checks enforce

- every file matches its schema (`schema/`)
- IDs are unique across active, retired and legacy IDs; sub-item IDs start with their criterion's ID
- `count` / `all-or-nothing` criteria have sub-items; `binary` / `tier` criteria do not
- `critical: subs` has at least one ★ sub-item
- retired criteria have `retired_in` and `reason`; `replaced_by` points to an existing ID
- trace IDs (TR-, TB-, SRC-) exist in the registers
- every sheet has a threshold; an Approved policy has its approval details
- the generated workbook matches the YAML (round trip), and the workbook and web scorecard score the
  same test scenarios identically
