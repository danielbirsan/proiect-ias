# M2 · Validation 1 (idea) · 2 November 2026

## Sources and scope

- `Raspunsuri.xlsx`: our questionnaire responses, collected between 30 October and 1 November 2026. We keep individual responses outside the public site.
- `Raspunsuri - Răspunsuri la formular 1.pdf`: a PDF version of the same responses, which we used to cross-check the questions and answers.
- `../../WhatsApp Audio 2026-11-02 at 01.41.51.mp4`: our customer discovery interview recording, approximately 8:07. The page includes the audio directly; the statistics come from the questionnaire.
- We distributed our questionnaire in Facebook groups for owners and tenants and relevant subreddits, including r/imobiliare. Our analysis focuses on the answers, without estimating reach or response rates by channel.

## Reproduce the statistics

From `/workspace/proiect-ias`, run:

```sh
python3 scripts/summarize_discovery.py /path/to/Raspunsuri.xlsx --output /tmp/m2-summary.json
cmp assets/research/m2/summary.json /tmp/m2-summary.json
```

We use a Python standard-library script to calculate the aggregates. The SHA-256 fingerprint in `summary.json` identifies the XLSX input. We publish grouped results to keep individual responses private.

We group responses by the participant’s main role: tenant, resident owner, or landlord. Where a tenant also answered owner questions, we include only the tenant answers. We check conditional follow-ups against the preceding question. For example, some people answered the photo-location question without selecting photos as their move-in documentation, so we do not use it to estimate a photo-loss rate.

For each question, we use completed answers within the relevant segment. Blank answers are excluded. We split multi-select answers at commas and round percentages to the nearest five points, half up. Rounding and multiple-choice answers can make totals differ from 100%. Our study is small, exploratory, and based on voluntary participation; we use the findings to choose our next experiments rather than estimate patterns across the whole market.

We summarize open answers by theme. Deposit deductions, repair expenses, and penalties describe individual experiences; we do not combine them into an average loss. We focused the questionnaire on the problem. Solution usability, the value of AI, and willingness to pay for FirstFlat will be tested separately.

## Our next experiments

We will follow up on recent incidents, observe people using the core prototype workflow, and test a clear paid-pilot offer. The interview prompts and pilot targets on the page describe these next steps. We will evaluate usability, repeat use, and actual commitment before expanding.
