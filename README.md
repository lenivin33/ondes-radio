# Ondes

**Toutes les radios françaises en direct, sur ton smartphone, sans publicité.**
Une web-app pensée pour remplacer l'autoradio : grands logos, gros boutons, lecture écran verrouillé.

👉 **[lenivin33.github.io/ondes-radio](https://lenivin33.github.io/ondes-radio/)**

---

## Fonctionnalités

- **Toutes les radios françaises** : métropole et outre-mer, plusieurs milliers de stations, liste mise à jour automatiquement chaque semaine.
- **Logo de chaque radio** : récupéré dans l'annuaire, puis sur le site de la station. Si aucun logo n'est trouvé, l'app affiche les initiales de la radio.
- **Meilleure qualité disponible** : pour chaque station, le flux au débit le plus élevé est choisi automatiquement (AAC privilégié, **HiFi 192 kbps** pour Radio France). Le son est joué tel quel, sans recompression.
- **Lecture écran verrouillé** : commandes sur l'écran de verrouillage, compatibles avec les boutons du volant en Bluetooth (station suivante et précédente).
- **Mode conduite** : plein écran, boutons géants, changement de station en glissant le doigt, option « écran allumé ».
- **Favoris** : affichés à l'ouverture et enregistrés de façon fiable (fusion entre fenêtres, copie de secours).
- **Recherche et filtres** : catégories (Info, Hits, Années 80-90, Rock, Électro, Rap & RnB, Jazz & Classique, Sport, Radio France), région, tri par popularité ou de A à Z.
- **Reconnexion automatique** après un tunnel ou une perte de réseau, avec bascule sur un flux de secours si nécessaire.
- **Aucune publicité, aucun compte, aucun suivi.** Les favoris restent sur ton téléphone.

## Installation

Aucune boutique d'applications n'est nécessaire.

**iPhone (Safari)**
1. Ouvre [lenivin33.github.io/ondes-radio](https://lenivin33.github.io/ondes-radio/) dans **Safari**.
2. Touche **Partager**, puis **Sur l'écran d'accueil**.
3. Laisse l'option « Ouvrir en tant qu'app web » activée, puis touche **Ajouter**.

**Android (Chrome)**
1. Ouvre le lien dans **Chrome**.
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
| `index.html` | L'application complète : interface, lecteur, logique (HTML, CSS et JavaScript, sans dépendance) |
| `manifest.webmanifest` | Nom, icônes et mode d'affichage pour l'installation sur l'écran d'accueil |
| `app/` | Copie installable en mode app, générée par `build-app.py` |
| `build-app.py` | Régénère `app/` à partir de `index.html` |
| `sw.js` | Ancien service worker : il se désinstalle lui-même des appareils où il était présent |
| `icon-*.png` | Icônes de l'application |

Après toute modification de `index.html`, lance `python3 build-app.py` pour mettre `app/` à jour.

## Hébergement

Le site est publié gratuitement par GitHub Pages depuis la branche `gh-pages`. Pour publier une nouvelle version, pousse les changements sur `main`, puis sur `gh-pages` :

```bash
git push origin main
git push origin main:gh-pages
```
