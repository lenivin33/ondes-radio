# Génère app/ : même application, installable en mode app (plein écran) sur iPhone.
# Les fichiers partagés restent à la racine : app/index.html y renvoie avec « ../ ».
import json, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
def path(*p): return os.path.join(ROOT, *p)
def read(p):
    with open(path(p), encoding='utf-8', newline='') as f: return f.read()
def write(p, s):
    with open(path(p), 'w', encoding='utf-8', newline='') as f: f.write(s)

# Chaque référence doit être trouvée : si index.html change, le script s'arrête au lieu de produire une copie cassée.
REWRITES = [
    'href="icon-192.png"',
    'href="apple-touch-icon-v2.png"',
    'src="stations-core.js"',
    "new URL('icon-512.png'",
    "const LIST_URL = 'stations.json'",
    "url('fonts/",
]
s = read('index.html')
for ref in REWRITES:
    if ref not in s:
        sys.exit(f'build-app.py : « {ref} » introuvable dans index.html')
    for q in ('"', "'"):
        i = ref.find(q)
        if i >= 0:
            s = s.replace(ref, ref[:i + 1] + '../' + ref[i + 1:])
            break
write('app/index.html', s)

m = json.loads(read('manifest.webmanifest'))
m['display'] = 'standalone'
for i in m['icons']: i['src'] = '../' + i['src']
write('app/manifest.webmanifest', json.dumps(m, ensure_ascii=False, indent=2))
print('app/ régénéré')
