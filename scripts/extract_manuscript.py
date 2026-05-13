from __future__ import annotations

import argparse
from pathlib import Path
import sys


def extract_with_pypdf(pdf_path: Path) -> list[str]:
    from pypdf import PdfReader  # type: ignore

    reader = PdfReader(str(pdf_path))
    return [(page.extract_text() or "") for page in reader.pages]


def extract_with_fitz(pdf_path: Path) -> list[str]:
    import fitz  # type: ignore

    document = fitz.open(str(pdf_path))
    try:
        return [page.get_text("text") for page in document]
    finally:
        document.close()


def extract_pages(pdf_path: Path) -> tuple[str, list[str]]:
    errors: list[str] = []

    for engine, extractor in (("pypdf", extract_with_pypdf), ("fitz", extract_with_fitz)):
        try:
            return engine, extractor(pdf_path)
        except ImportError as error:
            errors.append(f"{engine}: missing dependency ({error})")
        except Exception as error:  # pragma: no cover - diagnostic path
            errors.append(f"{engine}: {error}")

    raise RuntimeError("No PDF extractor succeeded:\n" + "\n".join(errors))


def write_draft(output_path: Path, pdf_path: Path, engine: str, pages: list[str]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        f"# Local manuscript extraction draft",
        f"source_pdf: {pdf_path}",
        f"engine: {engine}",
        f"pages: {len(pages)}",
        "",
    ]

    for index, text in enumerate(pages, start=1):
        lines.extend([f"--- PDF page {index} ---", text.strip(), ""])

    output_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Extract a local manuscript PDF to a gitignored draft text path."
    )
    parser.add_argument("pdf", type=Path, help="Path to the local PDF excerpt.")
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("test-results/content/manuscript-excerpt.txt"),
        help="Output path. Default is under gitignored test-results/.",
    )
    args = parser.parse_args()

    pdf_path = args.pdf.expanduser().resolve()
    output_path = args.out.resolve()

    if not pdf_path.exists():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        return 2

    try:
        engine, pages = extract_pages(pdf_path)
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        return 1

    write_draft(output_path, pdf_path, engine, pages)
    print(f"Extracted {len(pages)} pages with {engine} to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
