from pathlib import Path
import unittest
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]

class Tags(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

class NavigationStructure(unittest.TestCase):
    def test_root_is_a_named_same_origin_shell_with_separate_home_content(self):
        doc = Tags((ROOT / 'index.html').read_text(encoding='utf-8-sig'))
        frames = [a for t, a in doc.tags if t == 'iframe']
        self.assertEqual(len(frames), 1, 'Root must host exactly one same-origin view')
        self.assertEqual(frames[0].get('id'), 'arcPage')
        self.assertTrue(frames[0].get('title'), 'Frame needs an accessible name')
        self.assertTrue((ROOT / 'home.html').exists())
        sources = [a.get('src') for t, a in doc.tags if t == 'script']
        self.assertIn('root-navigation.js', sources)
        for page in ROOT.glob('*.html'):
            if page.name == 'index.html':
                continue
            with self.subTest(page=page.name):
                tags = Tags(page.read_text(encoding='utf-8-sig')).tags
                scripts = [a.get('src') for t, a in tags if t == 'script']
                self.assertIn('view-navigation.js', scripts)

if __name__ == '__main__':
    unittest.main()
