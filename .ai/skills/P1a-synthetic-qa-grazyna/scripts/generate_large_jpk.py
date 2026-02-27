"""Generate large JPK-style XML files for memory/stress testing. Streams to file to avoid OOM."""
import argparse
import random

DIACRITICS_NAMES = [
    ("Żółć", "Łódź"), ("Ćwikła", "Świątek"), ("Ącki", "Ęcki"), ("Źółć", "Źrebie"),
    ("Marcin", "Grzęda"), ("Świętosława", "Błąd"), ("Zdzisław", "Ćma"),
]
PLAIN_NAMES = [
    ("Anna", "Kowalska"), ("Jan", "Nowak"), ("Maria", "Wiśniewska"), ("Piotr", "Lewandowski"),
    ("Katarzyna", "Kamińska"), ("Tomasz", "Zieliński"), ("Magdalena", "Szymańska"),
]


def _pesel():
    y, m, d = random.randint(50, 99), random.randint(1, 12), random.randint(1, 28)
    rest = "".join(str(random.randint(0, 9)) for _ in range(5))
    return f"{y:02d}{m:02d}{d:02d}{rest}"


def generate_large_jpk(employees: int, malformed: int, output: str):
    """Write JPK-style XML to file in streaming fashion to keep memory low."""
    with open(output, "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<JPK xmlns="http://jpk.mf.gov.pl/schema">\n')
        f.write("  <Naglowek><DataOd>2024-01-01</DataOd><DataDo>2024-01-31</DataDo></Naglowek>\n")
        f.write("  <Pracownicy>\n")

        malformed_indices = set(random.sample(range(employees), min(malformed, employees)))
        diacritics_count = min(100, employees)
        diacritics_indices = set(random.sample(range(employees), diacritics_count))

        for i in range(employees):
            if i in diacritics_indices:
                first, last = random.choice(DIACRITICS_NAMES)
            else:
                first, last = random.choice(PLAIN_NAMES)
            pesel = _pesel()
            salary = random.randint(5000, 15000)

            if i in malformed_indices:
                # Unclosed tag or broken node
                if random.random() < 0.5:
                    f.write(f'    <Pracownik><Imie>{first}</Imie><Nazwisko>{last}\n')
                else:
                    f.write(f'    <Pracownik><Imie>{first}</Imie><Nazwisko>{last}</Nazwisko><PESEL>{pesel}</PESEL><Wynagrodzenie>\n')
            else:
                f.write(f'    <Pracownik><Imie>{first}</Imie><Nazwisko>{last}</Nazwisko><PESEL>{pesel}</PESEL><Wynagrodzenie>{salary}</Wynagrodzenie></Pracownik>\n')

        f.write("  </Pracownicy>\n</JPK>\n")

    print(f"Generated {output}: {employees} employees, {malformed} malformed nodes, ~100 with diacritics")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--employees", type=int, required=True)
    parser.add_argument("--malformed", type=int, default=10)
    parser.add_argument("--output", type=str, required=True)
    args = parser.parse_args()
    generate_large_jpk(args.employees, args.malformed, args.output)


if __name__ == "__main__":
    main()
