"""Security regressions for the static site; stdlib only.
Run: python -m unittest discover -s tests -v
"""
from pathlib import Path
from html.parser import HTMLParser
import base64
import hashlib
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.metas = []
        self.scripts = []
        self.events = []
        self._script = None
        self.feed(text.replace('\r\n', '\n').replace('\r', '\n'))
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            self.metas.append(attrs)
        self.events.extend(k for k in attrs if k.lower().startswith('on'))
        if tag == 'script':
            self._script = None if attrs.get('src') else []
    def handle_data(self, data):
        if self._script is not None:
            self._script.append(data)
    def handle_endtag(self, tag):
        if tag == 'script' and self._script is not None:
            self.scripts.append(''.join(self._script))
            self._script = None

class SecurityTests(unittest.TestCase):
    def test_every_page_enforces_compatible_script_policy(self):
        for page in sorted(ROOT.glob('*.html')):
            with self.subTest(page=page.name):
                doc = Document(page.read_text(encoding='utf-8-sig'))
                policies = [m['content'] for m in doc.metas if m.get('http-equiv', '').lower() == 'content-security-policy']
                self.assertEqual(len(policies), 1, 'Page must have exactly one CSP')
                directives = dict((p.strip().split()[0], p.strip().split()[1:]) for p in policies[0].split(';') if p.strip())
                self.assertEqual(directives.get('default-src'), ["'none'"])
                scripts = directives.get('script-src', [])
                self.assertIn("'self'", scripts)
                self.assertNotIn("'unsafe-inline'", scripts)
                self.assertNotIn("'unsafe-eval'", scripts)
                self.assertEqual(directives.get('script-src-attr'), ["'none'"])
                expected = {"'sha256-" + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode() + "'" for s in doc.scripts}
                actual = {s for s in scripts if s.startswith("'sha256-")}
                self.assertEqual(actual, expected, 'Inline script edit requires refreshed CSP hash')
                for key in ['object-src', 'base-uri', 'connect-src', 'form-action']:
                    self.assertEqual(directives.get(key), ["'none'"], key)
                # Only the domain shell may embed allowlisted same-origin views.
                self.assertEqual(directives.get('frame-src'), ["'self'" if page.name == 'index.html' else "'none'"])
                self.assertEqual(directives.get('img-src'), ["'self'", 'data:'])
                self.assertIn("'unsafe-inline'", directives.get('style-src', []), 'Existing inline styles must still render')
                self.assertIn('https://fonts.googleapis.com', directives.get('style-src', []))
                self.assertIn('https://fonts.gstatic.com', directives.get('font-src', []))
                self.assertEqual(doc.events, [], 'Inline event attributes are not allowed')
    def test_no_personal_data_console_logging(self):
        source = (ROOT / 'sponsor.js').read_text(encoding='utf-8-sig')
        self.assertNotRegex(source, r'console\.(?:log|info|debug)\s*\(')

    def test_text_templates_do_not_parse_data_as_html(self):
        for name in ['mars-rover.js', 'previous_workshop.html']:
            with self.subTest(file=name):
                source = (ROOT / name).read_text(encoding='utf-8-sig')
                self.assertNotRegex(source, r'\.innerHTML\s*=\s*(?:data\.|[\'\"]<)')

    def test_explicit_referrer_policy(self):
        for page in ROOT.glob('*.html'):
            with self.subTest(page=page.name):
                doc = Document(page.read_text(encoding='utf-8-sig'))
                self.assertEqual([m.get('content') for m in doc.metas if m.get('name') == 'referrer'], ['no-referrer'])

if __name__ == '__main__':
    unittest.main()
