# Documents

| File | Content | Status |
| --- | --- | --- |
| `reference-guide/reference-guide.md` | Technical Reference Guide: the text of Chapters 1 to 7 | Current. The web scorecard shows it under Reference. |
| `maintainer-setup.md` | One-time GitHub setup for the repository | Current |
| `images/site-*.png` | Screenshots of the scorecard site for the main README | Take the screenshots again when the site layout changes. |

The Technical Reference Guide contains only the explanations. The guide does not contain its tables.
The tables are structured data. The build inserts each table where the guide has a marker line,
for example:

```
<!-- register: TB -->
```

| Marker | Table | Source |
| --- | --- | --- |
| `glossary` | Glossary (2.1 to 2.9) | `registers/glossary.yaml` |
| `abbreviations` | Abbreviations (2.10) | `registers/abbreviations.yaml` |
| `prefixes` | ID prefixes (2.11) | `registers/id-prefixes.yaml` |
| `retired` | Retired and moved IDs (2.12) | `criteria/retired-legacy.yaml` and retired criteria |
| `TB` | Technical Baseline (Chapter 3) | `registers/technical-baseline.yaml` |
| `SRC` | Terminology & Registry Sources (Chapter 4) | `registers/sources.yaml` |
| `TR` | FHIR Traceability (Chapter 5) | `registers/traceability.yaml` |
| `IND` | Indicator Definitions (Chapter 6) | `registers/indicators.yaml` |

You edit a table in one location. Every view shows the same entry: the Reference chapter, the term
popovers and the Traces of the criteria. The criteria are in `criteria/` and the thresholds are in
`scoring.yaml`. The guide explains them but does not repeat them.

Each `# Chapter N: Title` heading starts a page on the web scorecard. Each `##` heading is a section
in the sidebar. Each chapter and each `##` section has its own ✎ menu (Edit on GitHub, Show the
lines, Suggest a change). The menu refers to the lines of that chapter or section in this file.
