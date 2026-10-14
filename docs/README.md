# Documents

| Folder | Content | Status |
| --- | --- | --- |
| `review-edition/` | Review Edition of the testing criteria (narrative) | Imported from the legacy Rev 9 document; reference text only |
| `reference-guide/` | Technical Reference Guide (instructions, glossary, registers, certification) | Imported from the legacy Rev 9 document; reference text only |
| `maintainer-setup.md` | One-time GitHub setup for the repository | Current |

The two documents were converted automatically and still contain their Rev 9 wording, numbering and
tables. Until the follow-on work turns them into generated documents, **do not edit them as the
source of criteria content**:

- criteria content lives in `criteria/`;
- the TB-, SRC-, TR-, IND-, glossary, abbreviation and ID-prefix tables live in `registers/`;
- thresholds and the approval record live in `scoring.yaml`.

Follow-on: split the narrative into chapters, replace the copied tables with tables generated from
`registers/` and `criteria/`, and generate DOCX/PDF with Pandoc (`scripts/build_docs.py`).
