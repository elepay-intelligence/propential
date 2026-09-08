#!/usr/bin/env python3
"""Contrast ratio between two colours (WCAG 2.x formula).

usage: contrast.py '#D6B15E' '#0E0F0D' [more pairs as fg bg fg bg ...]

Prints the ratio and whether it passes 4.5:1 (body text) and 3:1 (large text:
18 pt regular / 14 pt bold, or graphics and UI parts). Print has no legal contrast
standard; these ratios are the accepted proxy (WCAG 1.4.3, CNIB Clear Print).
"""
import sys

def _lin(c):
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hex_colour):
    h = hex_colour.strip().lstrip('#')
    if len(h) == 3:
        h = ''.join(ch * 2 for ch in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)

def ratio(fg, bg):
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)

def main(argv):
    if len(argv) < 2 or len(argv) % 2:
        print(__doc__)
        return 2
    for fg, bg in zip(argv[0::2], argv[1::2]):
        r = ratio(fg, bg)
        body = 'pass' if r >= 4.5 else 'FAIL'
        large = 'pass' if r >= 3 else 'FAIL'
        print(f'{fg} on {bg}: {r:.2f}:1  body(4.5:1) {body}  large(3:1) {large}')
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
