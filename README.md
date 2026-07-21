# QCM Français — OP001 (HEP Vaud)

Petite app web (PWA) d'entraînement aux QCM de français de l'examen OP001, par règle
de grammaire. Phrases originales au format de l'examen (options 1-4 + « Aucune » / « Toutes »),
correction immédiate avec explication par option, suivi de progression, mémo par question
et pouce « bien construite » exportables en fin de séance.

État local vérifié le 21.07.2026 : version `1.10`, cache
`qcm-op001-v110`, 1 249 questions uniques et release
`questions-20260721-9776333a`. La publication sur `main` est effectuée après les
contrôles décrits ci-dessous.

## Utilisation locale
Ouvre `index.html` via un petit serveur statique (les Service Workers ne fonctionnent pas
en `file://`). Par exemple, avec le script fourni sous Windows :

```powershell
powershell -ExecutionPolicy Bypass -File static-server.ps1 -Port 5500
```

Puis ouvre http://localhost:5500

## Hébergement (GitHub Pages)
Le site est 100 % statique : pousse ce dossier sur un dépôt GitHub, puis active
**Settings → Pages → Deploy from a branch → main / root**.

## Google Drive (facultatif)
Pour l'envoi automatique des mémos/stats vers Google Drive, renseigne `GOOGLE_CLIENT_ID`
dans `config.js` (voir les instructions détaillées en tête de ce fichier). Tant que c'est
vide, les boutons **Copier** et **Télécharger** du feedback restent disponibles.

Chaque nouvelle séance exporte un Markdown humain avec un bloc machine
`hep-feedback/1.0`. Le fichier est nommé
`qcm-feedback--<session_id>--<quiz_id>.md`; un envoi regroupé utilise
`qcm-feedback-bundle--<horodatage UTC>--<suffixe>.md`. La version courte de la
banque, les classifications disponibles et les codes de distracteur sont conservés
dans cet export sans texte historique supplémentaire.

La banque doit être enrichie avec `analyse_gpt/pipeline_HEP.py integrate-js`.
Cette commande met automatiquement `BANK_RELEASE` à jour dans `config.js`; une
intégration manuelle de `questions.js` rendrait l'identifiant de banque obsolète.

## Fichiers
- `index.html`, `style.css`, `app.js` — l'application
- `questions.js` — la banque active de 1 249 questions
- `config.js` — configuration (ID client Google Drive)
- `manifest.json`, `sw.js`, `icon.svg` — installation PWA / hors-ligne
- `static-server.ps1` — serveur statique local (développement, Windows)
