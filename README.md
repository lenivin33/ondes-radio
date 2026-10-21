# Ondes

**Toutes les radios françaises en direct, sur ton smartphone, sans publicité.**
Une web-app pensée pour remplacer l'autoradio : grands logos, gros boutons, lecture écran verrouillé.
Aucune version publique n'est proposée : chacun héberge sa propre copie, gratuitement (voir [Héberger ta copie](#héberger-ta-copie)).

---

## Fonctionnalités

- **Toutes les radios françaises** : métropole et outre-mer, plusieurs milliers de stations. La liste est recalculée chaque semaine par GitHub Actions et servie avec l'app (environ 250 Ko), avec l'annuaire en direct comme secours.
- **Logo de chaque radio** : récupéré dans l'annuaire, puis sur le site de la station. Si aucun logo n'est trouvé, l'app affiche les initiales de la radio. Les logos manquants sont complétés via le service d'icônes de Google ; une option des réglages permet de le désactiver.
- **Meilleure qualité disponible** : pour chaque station, le flux au débit le plus élevé est choisi automatiquement (AAC privilégié, **HiFi 192 kbps** pour Radio France). Le son est joué tel quel, sans recompression.
- **Lecture écran verrouillé** : commandes sur l'écran de verrouillage, compatibles avec les boutons du volant en Bluetooth (station suivante et précédente).
- **Mode conduite** : plein écran, boutons géants, changement de station en glissant le doigt, option « écran allumé ».
- **Favoris** : affichés à l'ouverture et enregistrés de façon fiable (fusion entre fenêtres, copie de secours).
- **Recherche et filtres** : catégories (Info, Hits, Années 80-90, Rock, Électro, Rap & RnB, Jazz & Classique, Sport, Radio France), région, tri par popularité ou de A à Z.
- **Reconnexion automatique** après un tunnel ou une perte de réseau, avec bascule sur un flux de secours si nécessaire.
- **Aucune publicité, aucun compte, aucun suivi.** Les favoris restent sur ton téléphone, les polices sont hébergées avec l'app. Seules les icônes des radios sans logo sont demandées à Google, ce que tu peux désactiver dans les réglages (« Logos complémentaires »).

## Héberger ta copie

L'app tient dans des fichiers statiques, sans serveur ni base de données. Elle doit être servie en **https**.

**Option 1 : GitHub Pages (gratuit)**
1. Clique sur **Fork** en haut de cette page pour copier le dépôt sur ton compte.
2. Dans ton fork, va dans **Settings → Pages**.
3. Dans « Source », choisis **Deploy from a branch**, puis la branche **main** et le dossier **/ (root)**. Clique sur **Save**.
4. Après une à deux minutes, l'adresse de ton site s'affiche en haut de cette même page.
5. Va dans l'onglet **Actions** de ton fork et clique sur **I understand my workflows, go ahead and enable them** : GitHub désactive les tâches planifiées des forks tant que tu ne les as pas autorisées. Sans cette étape, ta liste de radios ne se met plus à jour (l'app bascule alors sur l'annuaire en direct au bout de trois semaines).

**Option 2 : autre hébergeur**
1. Télécharge le projet : bouton **Code → Download ZIP**.
2. Décompresse-le et dépose le dossier sur n'importe quel hébergement statique en https (Netlify, Cloudflare Pages, Vercel, ton propre serveur…).
3. Pour rafraîchir la liste des radios, lance `node tools/build-stations.cjs` (Node 20 ou plus) puis republie `stations.json`. Sinon, l'app interroge l'annuaire en direct une fois la liste vieille de trois semaines.

## Installation sur le téléphone

Aucune boutique d'applications n'est nécessaire.

**iPhone (Safari)**
1. Ouvre l'adresse de ta copie dans **Safari**.
2. Touche **Partager**, puis **Sur l'écran d'accueil**.
3. Laisse l'option « Ouvrir en tant qu'app web » activée, puis touche **Ajouter**.

**Android (Chrome)**
1. Ouvre l'adresse de ta copie dans **Chrome**.
2. Ouvre le menu **⋮**, puis touche **Ajouter à l'écran d'accueil** (ou **Installer l'application**).

## Qualité audio

Les radios diffusent toutes un flux déjà compressé (MP3 ou AAC) : aucune station ne propose de flux non compressé. Ondes sélectionne systématiquement le meilleur flux proposé et ne le modifie jamais. Le codec et le débit en cours d'écoute sont affichés dans le mode conduite.

Pour comparaison, la radio numérique d'un autoradio (DAB+) est souvent diffusée entre 64 et 128 kbps.

Les publicités diffusées à l'antenne par les stations elles-mêmes restent présentes, comme à la radio classique. L'app, elle, n'en ajoute aucune.

## Problème connu sur iPhone

Sur certaines versions d'iOS 26, une app installée sur l'écran d'accueil peut perdre le son après avoir été fermée puis relancée : la radio s'affiche « En direct », mais rien ne sort. C'est un bug d'iOS, pas de l'app ([WebKit bug 295518](https://bugs.webkit.org/show_bug.cgi?id=295518)). Il est annoncé comme corrigé à partir d'iOS 26.2.

Si le problème apparaît :
1. Mets ton iPhone à jour.
2. Si le son ne revient toujours pas, supprime l'icône et ajoute-la de nouveau **en désactivant** « Ouvrir en tant qu'app web ». L'app s'ouvre alors dans Safari, où le bug n'existe pas.

## Source des données

Les stations proviennent de [Radio Browser](https://www.radio-browser.info), un annuaire libre et gratuit de radios en ligne. Le filtre conserve les pays FR, RE, GP, MQ, GF, YT, NC, PF, PM, BL, MF et WF.

## Structure du projet

| Fichier | Rôle |
|---|---|
| `index.html` | L'application : interface, lecteur, logique (HTML, CSS et JavaScript, sans dépendance) |
| `stations-core.js` | Traitement de l'annuaire (regroupement des doublons, choix des flux), partagé par l'app et le script de la liste |
| `stations.json` | Liste des radios pré-calculée, régénérée chaque semaine |
| `tools/build-stations.cjs` | Régénère `stations.json` depuis l'annuaire Radio Browser |
| `.github/workflows/stations.yml` | Lance ce script chaque lundi et publie la liste si elle a changé |
| `fonts/` | Polices Barlow et Barlow Condensed (licence SIL OFL, voir `fonts/OFL.txt`) |
| `manifest.webmanifest` | Nom, icônes et mode d'affichage pour l'installation sur l'écran d'accueil |
| `app/` | Copie installable en mode app, générée par `build-app.py` |
| `build-app.py` | Régénère `app/` à partir de `index.html` |
| `sw.js` | Ancien service worker : il se désinstalle lui-même des appareils où il était présent |
| `icon-*.png` | Icônes de l'application |

Après toute modification de `index.html`, lance `python3 build-app.py` (ou `python build-app.py` sous Windows) pour mettre `app/` à jour. Le script s'arrête avec un message si une référence attendue a disparu de `index.html`.

## Mettre à jour ta copie

Après toute modification, publie de nouveau les fichiers. Avec GitHub Pages, il suffit de pousser sur la branche choisie dans **Settings → Pages**.
