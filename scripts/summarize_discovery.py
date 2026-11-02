#!/usr/bin/env python3
"""Build privacy-preserving M2 aggregates from the original XLSX export.

Usage: python3 scripts/summarize_discovery.py /path/to/Raspunsuri.xlsx
Uses only the Python standard library. Never emits respondent-level records.
"""

import argparse
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET
from zipfile import ZipFile

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def read_rows(path):
    with ZipFile(path) as archive:
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            strings = ["".join(n.itertext()) for n in
                       ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("s:si", NS)]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows = []
        for row in sheet.findall("s:sheetData/s:row", NS):
            values = [None] * 38
            for cell in row.findall("s:c", NS):
                column = 0
                for char in cell.attrib["r"]:
                    if not char.isalpha():
                        break
                    column = column * 26 + ord(char) - ord("A") + 1
                value = cell.find("s:v", NS)
                text = value.text if value is not None else None
                kind = cell.attrib.get("t")
                if kind == "s":
                    text = strings[int(text)]
                elif kind == "inlineStr":
                    text = "".join(cell.find("s:is", NS).itertext())
                values[column - 1] = text.strip() if text else None
            rows.append(values)
        return rows


def percentage(numerator, denominator):
    if not denominator:
        return None
    return int((Decimal(numerator * 100) / denominator / 5)
               .quantize(Decimal("1"), rounding=ROUND_HALF_UP) * 5)


def summarize(path):
    headers, *rows = read_rows(path)
    rows = [row for row in rows if row[1] in ("Chiriaș", "Proprietar")]
    tenants = [row for row in rows if row[1] == "Chiriaș"]
    owners = [row for row in rows if row[1] == "Proprietar"]
    residents = [row for row in owners if row[18] and "nu o închiriez" in row[18]]
    landlords = [row for row in owners if row[18] and "către chiriași" in row[18]]
    cohorts = {"all": rows, "tenants": tenants, "owners": owners,
               "resident_owners": residents, "landlords": landlords}
    multi = {4, 16, 20}
    # Free text is summarized editorially, never published as raw records.
    free_text = {7, 11, 13, 15, 17, 21, 24, 25, 26, 31, 35, 37}
    questions = []
    for column in range(1, 38):
        cohort = ("all" if column == 1 else "tenants" if column < 18 else
                  "owners" if column == 18 else "resident_owners" if column < 27 else "landlords")
        answers = [r[column] for r in cohorts[cohort] if r[column] is not None]
        item = {"column": column + 1, "question": headers[column], "cohort": cohort,
                "has_answers": bool(answers), "has_missing": len(answers) < len(cohorts[cohort]),
                "type": "free_text" if column in free_text else "multiple_choice" if column in multi else "single_choice"}
        if column not in free_text:
            options = Counter(option.strip() for answer in answers
                              for option in (answer.split(",") if column in multi else [answer]))
            item["distribution_percent_approx"] = {
                option: percentage(count, len(answers)) for option, count in sorted(options.items())}
        questions.append(item)
    metrics = []
    for key, column, predicate in [
        ("unclear_cost_responsibility", 10, lambda a: a == "Da"),
        ("contract_only_at_signing", 9, lambda a: a == "Doar la semnare"),
        ("repair_later_reported_not_theirs", 12, lambda a: a == "Da"),
        ("memory_for_bills", 14, lambda a: a == "Memorie"),
        ("deposit_withheld", 6, lambda a: a.startswith("Da")),
        ("no_listed_bill_incident", 16, lambda a: a == "Nimic din cele de mai sus"),
    ]:
        answers = [r[column] for r in tenants if r[column] is not None]
        metrics.append({"id": key, "question_column": column + 1, "cohort": "tenants",
                        "percent_approx": percentage(sum(predicate(a) for a in answers), len(answers))})
    return {"source_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "method": "Small, self-selected exploratory sample; not representative. Primary role determines routing. Tenant rows with owner-branch answers are excluded from owner analysis. Empty answers are missing, not No. Each percentage uses nonempty answers to its question within the stated cohort. Multiple-choice options are split on commas; shares can exceed 100% in total. Percentages rounded to nearest five percentage points, half up. No respondent records or timestamps are published. No causal or willingness-to-pay inference.",
            "metrics": metrics, "questions": questions}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("xlsx", type=Path)
    parser.add_argument("--output", type=Path, default=Path("assets/research/m2/summary.json"))
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(summarize(args.xlsx), ensure_ascii=False, indent=2) + "\n")
    print(f"Aggregate report written to {args.output}")
