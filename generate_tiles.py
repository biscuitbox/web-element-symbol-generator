#!/usr/bin/env python3
"""Generate multiple element tiles from a spreadsheet-like file.

Supported input formats:
- .csv (recommended for easy Git diff/review)
- .tsv

Expected columns (Korean or English):
- symbol (기호)
- name (이름)
- number (원자량)
- atomic_number (원자번호)
"""

from __future__ import annotations

import argparse
import csv
import re
import subprocess
from pathlib import Path

COLUMN_ALIASES = {
    "symbol": ["symbol", "기호"],
    "name": ["name", "이름", "원소명"],
    "number": ["number", "원자량"],
    "atomic_number": ["atomic_number", "원자번호", "atomic number"],
}


def find_column(fieldnames: list[str], aliases: list[str]) -> str:
    lower_map = {c.strip().lower(): c for c in fieldnames}
    for alias in aliases:
        key = alias.strip().lower()
        if key in lower_map:
            return lower_map[key]
    raise ValueError(f"Missing one of columns: {aliases}")


def sanitize_filename(text: str) -> str:
    text = str(text).strip()
    text = re.sub(r"[\\/:*?\"<>|]+", "_", text)
    return text or "element"


def load_rows(path: Path) -> list[dict[str, str]]:
    suffix = path.suffix.lower()
    if suffix not in {".csv", ".tsv"}:
        raise ValueError("Only .csv and .tsv are supported in this environment.")

    delimiter = "," if suffix == ".csv" else "\t"
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f, delimiter=delimiter)
        if not reader.fieldnames:
            raise ValueError("Input file has no header row.")
        return list(reader)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("table", help="Path to .csv or .tsv file")
    parser.add_argument("--scad", default="element_tiles.scad", help="Path to SCAD template")
    parser.add_argument("--out", default="out", help="Output directory for STL files")
    parser.add_argument("--openscad", default="openscad", help="OpenSCAD executable")
    args = parser.parse_args()

    in_path = Path(args.table)
    rows = load_rows(in_path)
    if not rows:
        raise ValueError("Input file has no data rows.")

    fields = list(rows[0].keys())
    symbol_col = find_column(fields, COLUMN_ALIASES["symbol"])
    name_col = find_column(fields, COLUMN_ALIASES["name"])
    number_col = find_column(fields, COLUMN_ALIASES["number"])
    atomic_col = find_column(fields, COLUMN_ALIASES["atomic_number"])

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    for row in rows:
        symbol = str(row.get(symbol_col, "")).strip()
        name = str(row.get(name_col, "")).strip()
        number = str(row.get(number_col, "")).strip()
        atomic_number = str(row.get(atomic_col, "")).strip()

        if not symbol:
            continue

        outfile = out_dir / f"{sanitize_filename(atomic_number)}_{sanitize_filename(symbol)}.stl"
        cmd = [
            args.openscad,
            "-o",
            str(outfile),
            "-D",
            f"symbol=\"{symbol}\"",
            "-D",
            f"name=\"{name}\"",
            "-D",
            f"number=\"{number}\"",
            "-D",
            f"atomic_number=\"{atomic_number}\"",
            str(args.scad),
        ]
        print("Running:", " ".join(cmd))
        subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
