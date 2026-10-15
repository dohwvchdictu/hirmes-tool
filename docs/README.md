# Documents

| File | Content | Status |
| --- | --- | --- |
| `reference-guide/reference-guide.md` | Technical Reference Guide — the prose of Chapters 1 to 7 | Current; shown on the web scorecard under Reference |
| `maintainer-setup.md` | One-time GitHub setup for the repository | Current |

The Technical Reference Guide holds the explanations only. Its tables are not written in the guide:
they are kept as structured data and inserted where the guide has a marker line such as

```
<!-- register: TB -->
```

| Marker | Table | Source |
| --- | --- | --- |
| `glossary` | Glossary (2.1–2.9) | `registers/glossary.yaml` |
| `abbreviations` | Abbreviations (2.10) | `registers/abbreviations.yaml` |
| `prefixes` | ID prefixes (2.11) | `registers/id-prefixes.yaml` |
| `retired` | Retired and moved IDs (2.12) | `criteria/retired-legacy.yaml` and retired criteria |
| `TB` | Technical Baseline (Chapter 3) | `registers/technical-baseline.yaml` |
| `SRC` | Terminology & Registry Sources (Chapter 4) | `registers/sources.yaml` |
| `TR` | FHIR Traceability (Chapter 5) | `registers/traceability.yaml` |
| `IND` | Indicator Definitions (Chapter 6) | `registers/indicators.yaml` |

So a table is edited in one place and every view — the Reference chapter, the term popovers, the
criteria's Traces — shows the same entry. Criteria content lives in `criteria/` and thresholds in
`scoring.yaml`; the guide explains them but does not repeat them.

Each `# Chapter N — Title` heading starts a page on the web scorecard, and each `##` heading appears
as a section in the sidebar.
