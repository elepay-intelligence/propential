#!/usr/bin/env python3
"""List every text run in a PDF with its point size and font, smallest first.

usage: pdf_text_sizes.py file.pdf [--min-pt 8] [--page 1]

Use it to prove a claim like "the footer copy is 5.5 pt" instead of estimating from
an image. Sizes are the PDF's own font sizes at 100% scale, so they are the printed
sizes if the PDF is printed at 100%. A flattened (image-only) PDF has no text runs;
the script says so, and the reviewer has to measure from the image instead.

Needs pdfplumber:  pip install pdfplumber
"""
import sys
from collections import defaultdict

def main(argv):
    if not argv:
        print(__doc__)
        return 2
    path = argv[0]
    min_pt = None
    only_page = None
    if '--min-pt' in argv:
        min_pt = float(argv[argv.index('--min-pt') + 1])
    if '--page' in argv:
        only_page = int(argv[argv.index('--page') + 1])
    try:
        import pdfplumber
    except ImportError:
        print('pdfplumber is not installed. Run: pip install pdfplumber')
        return 1
    with pdfplumber.open(path) as pdf:
        for pno, page in enumerate(pdf.pages, start=1):
            if only_page and pno != only_page:
                continue
            w_mm, h_mm = page.width * 25.4 / 72, page.height * 25.4 / 72
            print(f'\n=== page {pno}: {w_mm:.0f} x {h_mm:.0f} mm ===')
            chars = page.chars
            if not chars:
                print('no live text on this page (flattened or image-only)')
                continue
            # group characters into runs by (size, font, line)
            runs = defaultdict(list)
            for c in chars:
                key = (round(c['size'], 1), c.get('fontname', '?'), round(c['top']))
                runs[key].append(c)
            rows = []
            for (size, font, top), cs in runs.items():
                text = ''.join(ch['text'] for ch in sorted(cs, key=lambda k: k['x0'])).strip()
                if text:
                    rows.append((size, font, top, text))
            rows.sort(key=lambda r: (r[0], r[2]))
            for size, font, top, text in rows:
                if min_pt is not None and size > min_pt:
                    continue
                flag = '  <-- below 8 pt' if size < 8 else ''
                print(f'{size:5.1f} pt  {font[:28]:28s} y={top:4.0f}  {text[:90]}{flag}')
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
