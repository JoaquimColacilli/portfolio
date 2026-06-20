#!/usr/bin/env python3
"""
build_document.py — Build a beautiful technical document from Markdown.

Pipeline:
  1. Find every ```mermaid fenced block and render it to SVG via mmdc.
  2. Replace blocks with <img> references to the rendered SVGs.
  3. Convert the processed Markdown to HTML with the bundled CSS theme.
  4. Produce a PDF via weasyprint (preferred) or Chrome/Chromium headless.
  5. If PDF fails, produce a DOCX via pandoc or python-docx.
  6. If everything fails, dump the processed Markdown as the final artifact.

Usage:
    python build_document.py INPUT.md \\
        [--output-dir DIR] [--format pdf|docx|md|auto] \\
        [--title TITLE] [--css PATH]

Exit code:
    0 — at least one output artifact was produced
    1 — nothing could be produced (should never happen: raw MD is always a fallback)

Optional third-party deps (all degrade gracefully):
    - markdown (pip install markdown pygments)
    - weasyprint (pip install weasyprint)
    - python-docx (pip install python-docx)
    - mmdc (npm install -g @mermaid-js/mermaid-cli)
    - chromium / google-chrome (system)
    - pandoc (system)
"""
from __future__ import annotations

import argparse
import hashlib
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

# ----- Mermaid rendering ----- #

MERMAID_BLOCK_RE = re.compile(r"```mermaid\s*\n(.*?)\n```", re.DOTALL)


def which(cmd: str) -> Optional[str]:
    return shutil.which(cmd)


def log_info(msg: str) -> None:
    print(f"[info] {msg}", file=sys.stderr)


def log_warn(msg: str) -> None:
    print(f"[warn] {msg}", file=sys.stderr)


def log_ok(msg: str) -> None:
    print(f"[ok] {msg}", file=sys.stderr)


def render_mermaid_blocks(md_text: str, work_dir: Path) -> tuple[str, list[Path]]:
    """Replace ```mermaid blocks with image references to rendered SVGs.

    Returns (processed_markdown, list_of_rendered_svgs). If mmdc is not
    available, leaves blocks unchanged (they will be shown as code in the PDF).
    """
    diagrams_dir = work_dir / "diagrams"
    diagrams_dir.mkdir(parents=True, exist_ok=True)

    mmdc = which("mmdc")
    if not mmdc:
        log_warn("mmdc not found — Mermaid blocks will be rendered as code. "
                 "Install with: npm install -g @mermaid-js/mermaid-cli")
        return md_text, []

    rendered: list[Path] = []
    diagram_index = 0

    def repl(match: re.Match) -> str:
        nonlocal diagram_index
        diagram_index += 1
        code = match.group(1).strip()
        digest = hashlib.md5(code.encode("utf-8")).hexdigest()[:10]
        stem = f"diagram-{diagram_index:02d}-{digest}"
        mmd_path = diagrams_dir / f"{stem}.mmd"
        svg_path = diagrams_dir / f"{stem}.svg"
        mmd_path.write_text(code, encoding="utf-8")
        try:
            subprocess.run(
                [mmdc, "-i", str(mmd_path), "-o", str(svg_path),
                 "-b", "transparent", "--quiet"],
                check=True, capture_output=True, timeout=60,
            )
            rendered.append(svg_path)
            rel = svg_path.as_posix()
            return f"\n\n![Diagrama {diagram_index}]({rel})\n\n"
        except subprocess.TimeoutExpired:
            log_warn(f"mmdc timeout on diagram {diagram_index}")
            return match.group(0)
        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode("utf-8", errors="ignore")[:200] if e.stderr else ""
            log_warn(f"mmdc failed on diagram {diagram_index}: {stderr}")
            return match.group(0)

    processed = MERMAID_BLOCK_RE.sub(repl, md_text)
    return processed, rendered


# ----- Markdown → HTML ----- #

def md_to_html(md_text: str, title: str, css_path: Optional[Path]) -> Optional[str]:
    try:
        import markdown  # type: ignore
    except ImportError:
        log_warn("python package 'markdown' not installed — cannot build HTML. "
                 "Install with: pip install markdown pygments")
        return None

    extensions = [
        "extra",
        "sane_lists",
        "toc",
        "tables",
        "fenced_code",
    ]
    extension_configs: dict = {
        "toc": {"title": "Tabla de contenidos", "toc_depth": "2-4"},
    }
    try:
        import pygments  # noqa: F401
        extensions.append("codehilite")
        extension_configs["codehilite"] = {
            "css_class": "highlight",
            "guess_lang": False,
        }
    except ImportError:
        pass

    html_body = markdown.markdown(
        md_text,
        extensions=extensions,
        extension_configs=extension_configs,
        output_format="html5",
    )

    css_content = ""
    if css_path and css_path.exists():
        try:
            css_content = css_path.read_text(encoding="utf-8")
        except OSError:
            pass

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>{_escape(title)}</title>
<style>
{css_content}
</style>
</head>
<body>
<main>
{html_body}
</main>
</body>
</html>
"""
    return html


def _escape(s: str) -> str:
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;"))


# ----- PDF backends ----- #

def try_weasyprint(html_text: str, out_pdf: Path, base_url: Path) -> bool:
    try:
        from weasyprint import HTML  # type: ignore
    except ImportError:
        return False
    try:
        HTML(string=html_text, base_url=str(base_url)).write_pdf(str(out_pdf))
        return out_pdf.exists() and out_pdf.stat().st_size > 0
    except Exception as e:  # weasyprint may throw many things
        log_warn(f"weasyprint failed: {e}")
        return False


def try_chrome_headless(html_text: str, out_pdf: Path, work_dir: Path) -> bool:
    for binary in ("google-chrome", "chromium", "chromium-browser", "chrome"):
        chrome = which(binary)
        if chrome:
            break
    else:
        return False
    html_path = work_dir / "_render.html"
    html_path.write_text(html_text, encoding="utf-8")
    try:
        subprocess.run(
            [
                chrome,
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--no-pdf-header-footer",
                f"--print-to-pdf={out_pdf}",
                html_path.as_uri(),
            ],
            check=True, capture_output=True, timeout=180,
        )
        return out_pdf.exists() and out_pdf.stat().st_size > 0
    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode("utf-8", errors="ignore")[:200] if e.stderr else ""
        log_warn(f"chrome headless failed: {stderr}")
        return False
    except subprocess.TimeoutExpired:
        log_warn("chrome headless timed out")
        return False


# ----- DOCX backends ----- #

def try_pandoc_docx(md_text: str, out_docx: Path, work_dir: Path) -> bool:
    if not which("pandoc"):
        return False
    md_path = work_dir / "_pandoc_input.md"
    md_path.write_text(md_text, encoding="utf-8")
    try:
        subprocess.run(
            ["pandoc", str(md_path), "-o", str(out_docx),
             "--toc", "--toc-depth=3", "--standalone"],
            check=True, capture_output=True, timeout=120,
        )
        return out_docx.exists() and out_docx.stat().st_size > 0
    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode("utf-8", errors="ignore")[:200] if e.stderr else ""
        log_warn(f"pandoc failed: {stderr}")
        return False
    except subprocess.TimeoutExpired:
        log_warn("pandoc timed out")
        return False


def try_python_docx(md_text: str, out_docx: Path) -> bool:
    """Very simple Markdown → DOCX conversion as last DOCX fallback.

    Handles: headings (H1–H4), paragraphs, ordered/unordered lists,
    inline code, fenced code blocks. Tables are rendered as tab-separated
    preformatted text (limitation).
    """
    try:
        from docx import Document  # type: ignore
        from docx.shared import Pt
    except ImportError:
        return False

    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    in_code = False
    code_buf: list[str] = []
    for raw_line in md_text.splitlines():
        line = raw_line.rstrip()
        if line.startswith("```"):
            if in_code:
                p = doc.add_paragraph()
                run = p.add_run("\n".join(code_buf))
                run.font.name = "Consolas"
                run.font.size = Pt(9)
                code_buf = []
                in_code = False
            else:
                in_code = True
            continue
        if in_code:
            code_buf.append(line)
            continue

        if line.startswith("# "):
            doc.add_heading(line[2:], level=1)
        elif line.startswith("## "):
            doc.add_heading(line[3:], level=2)
        elif line.startswith("### "):
            doc.add_heading(line[4:], level=3)
        elif line.startswith("#### "):
            doc.add_heading(line[5:], level=4)
        elif line.startswith("> "):
            doc.add_paragraph(line[2:], style="Intense Quote")
        elif line.lstrip().startswith(("- ", "* ", "+ ")):
            stripped = line.lstrip()[2:]
            doc.add_paragraph(stripped, style="List Bullet")
        elif re.match(r"^\s*\d+\.\s", line):
            content = re.sub(r"^\s*\d+\.\s", "", line)
            doc.add_paragraph(content, style="List Number")
        elif line.strip() == "":
            doc.add_paragraph("")
        elif line.startswith("|") and line.endswith("|"):
            # crude table rendering as monospaced
            p = doc.add_paragraph()
            run = p.add_run(line)
            run.font.name = "Consolas"
            run.font.size = Pt(9)
        else:
            doc.add_paragraph(line)

    try:
        doc.save(str(out_docx))
    except OSError as e:
        log_warn(f"python-docx save failed: {e}")
        return False
    return out_docx.exists() and out_docx.stat().st_size > 0


# ----- Main driver ----- #

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build a beautiful technical document from Markdown with fallback chain.",
    )
    parser.add_argument("input", help="Input Markdown file")
    parser.add_argument("--output-dir", default="./docs/generated",
                        help="Output directory (default: ./docs/generated)")
    parser.add_argument("--format", default="auto",
                        choices=["auto", "pdf", "docx", "md"],
                        help="Target format. 'auto' tries PDF → DOCX → MD.")
    parser.add_argument("--title", default=None,
                        help="Document title (defaults to input filename stem)")
    parser.add_argument("--css", default=None,
                        help="Path to CSS file for PDF styling "
                             "(default: bundled assets/pdf-theme.css)")
    parser.add_argument("--stem", default=None,
                        help="Output filename stem (default: <input>-<YYYYMMDD>)")
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    if not input_path.exists():
        print(f"[error] input file not found: {input_path}", file=sys.stderr)
        return 1

    out_dir = Path(args.output_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    title = args.title or input_path.stem
    work_dir = out_dir / ".build"
    work_dir.mkdir(parents=True, exist_ok=True)

    # Default CSS path
    css_path: Optional[Path] = None
    if args.css:
        css_path = Path(args.css).resolve()
    else:
        candidate = Path(__file__).resolve().parent.parent / "assets" / "pdf-theme.css"
        if candidate.exists():
            css_path = candidate

    md_text = input_path.read_text(encoding="utf-8")

    log_info(f"Input: {input_path}")
    log_info(f"Output dir: {out_dir}")
    log_info(f"CSS: {css_path or '(none, using defaults)'}")

    processed, diagrams = render_mermaid_blocks(md_text, work_dir)
    log_info(f"Rendered {len(diagrams)} Mermaid diagrams")

    stem = args.stem or f"{input_path.stem}-{datetime.now().strftime('%Y%m%d')}"
    pdf_out = out_dir / f"{stem}.pdf"
    docx_out = out_dir / f"{stem}.docx"
    md_out = out_dir / f"{stem}.md"

    formats = (["pdf", "docx", "md"] if args.format == "auto" else [args.format])
    generated: list[Path] = []

    for fmt in formats:
        if fmt == "pdf":
            html = md_to_html(processed, title, css_path)
            if html is None:
                continue
            (work_dir / "_render.html").write_text(html, encoding="utf-8")
            if try_weasyprint(html, pdf_out, base_url=work_dir):
                log_ok(f"PDF via weasyprint → {pdf_out}")
                generated.append(pdf_out)
                break
            if try_chrome_headless(html, pdf_out, work_dir):
                log_ok(f"PDF via Chrome headless → {pdf_out}")
                generated.append(pdf_out)
                break
            log_warn("PDF generation failed via all backends")
        elif fmt == "docx":
            if try_pandoc_docx(processed, docx_out, work_dir):
                log_ok(f"DOCX via pandoc → {docx_out}")
                generated.append(docx_out)
                break
            if try_python_docx(processed, docx_out):
                log_ok(f"DOCX via python-docx → {docx_out}")
                generated.append(docx_out)
                break
            log_warn("DOCX generation failed via all backends")
        elif fmt == "md":
            md_out.write_text(processed, encoding="utf-8")
            log_ok(f"Markdown → {md_out}")
            generated.append(md_out)
            break

    if not generated:
        # Absolute last resort — always give the user *something*
        md_out.write_text(processed, encoding="utf-8")
        log_warn(f"All preferred backends failed. Wrote raw Markdown as fallback → {md_out}")
        generated.append(md_out)

    print("\n=== RESULT ===")
    for g in generated:
        print(f"FILE: {g}")
    print(f"DIAGRAMS_RENDERED: {len(diagrams)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
