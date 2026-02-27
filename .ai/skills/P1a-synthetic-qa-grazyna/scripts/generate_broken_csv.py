"""Generate broken CSV files with mixed delimiters, quotes in quotes, line breaks in cells."""
import argparse
import csv
import random

HEADER = ["Imię", "Nazwisko", "PESEL", "Stanowisko", "Wynagrodzenie brutto", "Płeć"]
NAMES = [
    ("Anna", "Kowalska"), ("Jan", "Nowak"), ("Maria", "Wiśniewska"), ("Piotr", "Lewandowski"),
    ("Katarzyna", "Kamińska"), ("Tomasz", "Zieliński"), ("Magdalena", "Szymańska"),
]
POSITIONS = ["Programista", "HR Manager", "Księgowa", "Dyrektor", "Specjalista"]


def _pesel():
    y, m, d = random.randint(50, 99), random.randint(1, 12), random.randint(1, 28)
    rest = "".join(str(random.randint(0, 9)) for _ in range(5))
    return f"{y:02d}{m:02d}{d:02d}{rest}"


def generate_broken_csv(employees: int, bugs: list, output: str):
    """Write CSV with intentional chaos: mixed delimiters, quotes in quotes, newlines in cells."""
    use_bom = "bom" in bugs
    mixed_delimiters = "mixed_delimiters" in bugs
    quotes_in_quotes = "quotes_in_quotes" in bugs
    line_breaks_in_cells = "line_breaks_in_cells" in bugs

    with open(output, "w", encoding="utf-8-sig" if use_bom else "utf-8", newline="") as f:
        # Header: semicolon or comma
        delim_header = ";" if (mixed_delimiters and random.random() < 0.5) else ","
        w = csv.writer(f, delimiter=delim_header, quoting=csv.QUOTE_MINIMAL)
        w.writerow(HEADER)

        for i in range(employees):
            first, last = random.choice(NAMES)
            if quotes_in_quotes and i % 7 == 0:
                first = f'Jan "Janek"'
                last = f'Kowalski "Junior"'
            pesel = _pesel()
            position = random.choice(POSITIONS)
            salary = random.randint(5000, 15000)
            gender = random.choice(["K", "M"])

            if line_breaks_in_cells and i % 5 == 0:
                position = "Specjalista\nDS. HR"

            row = [first, last, pesel, position, str(salary), gender]
            delim = ";" if (mixed_delimiters and i % 2 == 1) else ","
            w = csv.writer(f, delimiter=delim, quoting=csv.QUOTE_MINIMAL)
            w.writerow(row)

    print(f"Generated {output}: {employees} rows, bugs={bugs}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--employees", type=int, required=True)
    parser.add_argument("--bugs", type=str, required=True, help="Comma-separated: mixed_delimiters,quotes_in_quotes,line_breaks_in_cells,bom")
    parser.add_argument("--output", type=str, required=True)
    args = parser.parse_args()
    bugs = [b.strip() for b in args.bugs.split(",")]
    generate_broken_csv(args.employees, bugs, args.output)


if __name__ == "__main__":
    main()
