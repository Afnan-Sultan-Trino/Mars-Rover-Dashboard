"""Check CSP hashes after any inline JavaScript change (Python 3, stdlib).
Print the required policy with: python tools/security_policy.py
This checker does not modify source files.
"""
from pathlib import Path
import base64
import hashlib
import re
import sys
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]

class Scripts(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.scripts = []
        self.current = None
        self.feed(text.replace('\r\n', '\n').replace('\r', '\n'))
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.current = None if dict(attrs).get('src') else []
    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)
    def handle_endtag(self, tag):
        if tag == 'script' and self.current is not None:
            self.scripts.append(''.join(self.current))
            self.current = None

def policy(text, is_shell=False):
    hashes = ["'sha256-" + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode() + "'" for s in Scripts(text).scripts]
    return '; '.join([
        "default-src 'none'",
        "script-src 'self'" + (' ' + ' '.join(dict.fromkeys(hashes)) if hashes else ''),
        "script-src-attr 'none'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data:",
        "connect-src 'none'",
        "object-src 'none'",
        "base-uri 'none'",
        "frame-src 'self'" if is_shell else "frame-src 'none'",
        "form-action 'none'",
    ])

def main():
    check = '--check' in sys.argv
    failed = []
    for page in sorted(ROOT.glob('*.html')):
        text = page.read_text(encoding='utf-8-sig')
        expected = policy(text, is_shell=page.name == 'index.html')
        matches = re.findall(r'<meta http-equiv="Content-Security-Policy" content="([^"]*)"\s*/?>', text)
        if check:
            if matches != [expected]:
                failed.append(page.name)
        else:
            print(page.name + ':\n' + expected)
    if check:
        if failed:
            print('CSP missing or outdated: ' + ', '.join(failed), file=sys.stderr)
            return 1
        print('CSP hashes and directives match all HTML pages.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
