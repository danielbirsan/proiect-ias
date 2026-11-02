# M2 · Validation 1 (idea) · 2 November 2026

## Sources and scope

- `Raspunsuri.xlsx`: supplied questionnaire export, with response timestamps from 30 October to 1 November 2026. Original source remains outside the public site.
- `Raspunsuri - Răspunsuri la formular 1.pdf`: supplied rendering of the same response table, not an independent study. Used to cross-check the questionnaire and responses.
- `../../WhatsApp Audio 2026-11-02 at 01.41.51.mp4`: pre-existing AAC audio in an MP4 container, duration approximately 8:07. Linked as interview material supplied by the team. No transcript, participant metadata, interview question list, or verified quotes were supplied; the report does not infer its contents.
- Recruitment through Facebook owner/tenant groups and relevant subreddits, including r/imobiliare, is reported by the team. Post URLs, screenshots, reach, and channel attribution were not supplied and are not asserted as verified evidence.

## Reproduce the statistics

From `/workspace/proiect-ias`, run:

```sh
python3 scripts/summarize_discovery.py /path/to/Raspunsuri.xlsx --output /tmp/m2-summary.json
cmp assets/research/m2/summary.json /tmp/m2-summary.json
```

The script uses only the Python standard library. The SHA-256 fingerprint in `summary.json` identifies the XLSX input. It deliberately publishes aggregates rather than respondent-level records. Preserve the originals for examiner review; the public aggregate is not a substitute for access to source evidence.

Primary-role routing avoids mixing tenant, resident-owner and landlord branches. A tenant response also filled an owner branch: retain its tenant answers and exclude its owner-branch answers. This is branch contamination, not evidence of a duplicate person. No identity-based deduplication is possible from this export. Conditional follow-ups sometimes conflict with their parent answer; do not reinterpret them as confirmed incidents. The photo-location question was answered even by people who did not select photos, so no photo-loss prevalence is claimed.

Use nonempty answers within the relevant primary-role cohort for each question. Missing answers are not negative answers. Split multi-select answers at commas; their shares need not sum to 100%. Round shares to the nearest five percentage points, half up. Small, self-selected sample; no population estimates, significance claims or causal conclusions. Segment sizes differ; do not compare their percentages as though they were equally reliable. The page avoids precise sample-size headlines and explicitly identifies the study as small and exploratory.

Free-text findings on the page are anonymized paraphrases. Reported deposit deductions and repair costs are recollections, not independently adjudicated losses. Do not combine deposits, repair expenses, and penalties into an average cost. No survey question tested the FirstFlat solution, AI preference, conversion, or FirstFlat willingness to pay.

## Evidence still to collect

Recruitment permalinks/screenshots, original form URL and routing, interview guide and time-coded transcript, participant context and permission metadata, prototype task observations, and behavioral purchase evidence. Follow-up interview prompts and pilot thresholds on the page are proposed next steps, not completed work or criteria set before this survey.
