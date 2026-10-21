# Génère app/ : même application, installable en mode app (plein écran) sur iPhone.
import json, re
s = open('index.html').read()
s = s.replace('<meta name="apple-mobile-web-app-title" content="Ondes">',
  '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="Ondes">')
for f in ['icon-192.png', 'icon-512.png']:
    s = s.replace(f'href="{f}"', f'href="../{f}"').replace(f"'{f}'", f"'../{f}'")
s = s.replace("if (window.navigator.standalone === true) $('iosNote').hidden = false;", "/* version app : pas de bandeau */")
open('app/index.html', 'w').write(s)
m = json.load(open('manifest.webmanifest'))
m['display'] = 'standalone'; m['name'] = 'Ondes'
for i in m['icons']: i['src'] = '../' + i['src']
json.dump(m, open('app/manifest.webmanifest', 'w'), ensure_ascii=False, indent=2)
