# Génère app/ : même application, installable en mode app (plein écran) sur iPhone.
import json, re
s = open('index.html').read()
for f in ['icon-192.png', 'icon-512.png']:
    s = s.replace(f'href="{f}"', f'href="../{f}"').replace(f"'{f}'", f"'../{f}'")
s = s.replace("if (window.navigator.standalone === true) $('iosNote').hidden = false;", "/* version app : pas de bandeau */")
open('app/index.html', 'w').write(s)
m = json.load(open('manifest.webmanifest'))
m['display'] = 'standalone'; m['name'] = 'Ondes'
for i in m['icons']: i['src'] = '../' + i['src']
json.dump(m, open('app/manifest.webmanifest', 'w'), ensure_ascii=False, indent=2)
