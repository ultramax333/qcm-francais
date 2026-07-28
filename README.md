# QCM Français — OP001 (HEP Vaud)

Petite app web (PWA) d'entraînement aux QCM de français de l'examen OP001, par règle
de grammaire. Phrases originales au format de l'examen (options 1-4 + « Aucune » / « Toutes »),
correction immédiate avec explication par option, suivi de progression, mémo par question,
pouce « bien construite » et demande explicite « À supprimer » exportables en fin de
séance. Le bilan regroupe les erreurs par mécanisme grammatical canonique et explique
chaque règle pas à pas.

État local vérifié le 28.07.2026 : version `1.12`, cache
`qcm-op001-v112`, 1 690 questions uniques et release
`questions-20260727-fd4bdfd8`. La publication sur `main` est effectuée après les
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
`hep-feedback/1.1`. Le booléen `deletion_requested` est indépendant de la justesse
de la réponse : il alimente la file de revue à l'import et ne supprime jamais une
question automatiquement. L'importeur reste compatible avec `hep-feedback/1.0`
(`deletion_requested=false` et `tense_id=null` par défaut). Le champ nullable
`tense_id` permet de conserver un temps canonique futur dans le chemin pédagogique
(`passé composé → auxiliaire avoir → COD avant`) ; sans preuve, l'application garde
« forme composée » au lieu d'inventer un temps. Le fichier est nommé
`qcm-feedback--<session_id>--<quiz_id>.md`; un envoi regroupé utilise
`qcm-feedback-bundle--<horodatage UTC>--<suffixe>.md`. La version courte de la
banque, les classifications disponibles et les codes de distracteur sont conservés
dans cet export sans texte historique supplémentaire.

La banque doit être enrichie avec `analyse_gpt/pipeline_HEP.py integrate-js`.
Cette commande met automatiquement `BANK_RELEASE` à jour dans `config.js`; une
intégration manuelle de `questions.js` rendrait l'identifiant de banque obsolète.

## Fichiers
- `index.html`, `style.css`, `app.js` — l'application
- `pedagogy.js` — libellés pédagogiques versionnés, chemins
  `famille → construction → règle` et agrégation prudente des erreurs. Le catalogue
  prévoit aussi des identifiants encore absents de la banque (`avoir_suivi_infinitif_sujet_action`,
  `laisse_suivi_infinitif`, pronominaux réfléchi/réciproque/essentiellement pronominal);
  ils ne sont jamais appliqués sans métadonnée canonique correspondante.
- `questions.js` — la banque active de 1 690 questions
- `config.js` — configuration (ID client Google Drive)
- `manifest.json`, `sw.js`, `icon.svg` — installation PWA / hors-ligne
- `static-server.ps1` — serveur statique local (développement, Windows)

## Tests ciblés

```powershell
node test_pedagogy.js
python -m pytest ..\analyse_gpt\test_feedback_import_HEP.py -q
```
