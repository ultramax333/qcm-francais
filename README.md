# QCM Français — OP001 (HEP Vaud)

Petite app web (PWA) d'entraînement aux QCM de français de l'examen OP001, par règle
de grammaire. Phrases originales au format de l'examen (options 1-4 + « Aucune » / « Toutes »),
correction immédiate avec explication par option, suivi de progression, mémo par question,
pouce « bien construite » et demande explicite « À supprimer » exportables en fin de
séance. Le bilan regroupe les erreurs par mécanisme grammatical canonique et explique
chaque règle pas à pas. La page permanente **Mes erreurs** recalcule un tableau
cumulatif depuis l'historique local : erreurs identiques regroupées, tentatives,
taux d'erreur, séances concernées, récence, réussites depuis la dernière erreur
et distribution des distracteurs choisis. Chaque distracteur conserve son option,
son `misconception_id` et son compteur ; une cause absente reste `UNK`.

Production vérifiée le 31.07.2026 : version `1.16`, cache `qcm-op001-v116`,
1 690 questions et release `questions-20260731-7e5d0453`. État local en attente
de publication au 01.08.2026 : **1 740 questions uniques**, release
`questions-20260731-7946ec4f`. Toutes portent une famille et un mécanisme
grammatical fermés. Les détails, temps et causes de distracteur non prouvés
restent `null` ou `UNK`. Le prochain déploiement devra incrémenter ensemble la
version de l'application et le cache PWA.

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
`hep-feedback/1.2`. Le booléen `deletion_requested` est indépendant de la justesse
de la réponse : il alimente la file de revue à l'import et ne supprime jamais une
question automatiquement. L'importeur reste compatible avec `hep-feedback/1.0`
et `hep-feedback/1.1` (`detail_id=null` pour ces historiques). Le champ nullable
`tense_id` permet de conserver un temps canonique futur dans le chemin pédagogique
(`passé composé → auxiliaire avoir → COD placé avant → accord avec le COD`) ;
`detail_id` sélectionne une variante courte du dictionnaire versionné. Sans preuve,
l’application affiche explicitement « non précisé » au lieu d’inventer une dimension.
Le fichier est nommé
`qcm-feedback--<session_id>--<quiz_id>.md`; un envoi regroupé utilise
`qcm-feedback-bundle--<horodatage UTC>--<suffixe>.md`. La version courte de la
banque, les classifications disponibles et les codes de distracteur sont conservés
dans cet export sans texte historique supplémentaire.

À partir de la version 1.14, toute séance terminée reste dans **Séances à
synchroniser** jusqu'à un envoi confirmé. Le tableau local est immédiat et
rétroactif pour les historiques qui contiennent encore leur journal détaillé.
À partir de la version 1.16, il complète aussi une ancienne famille, un ancien
mécanisme ou un code de distracteur depuis la banque courante uniquement lorsque
l'identifiant, la clé attendue et la règle concordent. L'historique brut n'est
jamais réécrit; une question supprimée ou non vérifiable reste inconnue.
La génération future n'utilise pas ce tableau comme un second compteur : elle
importe les séances brutes, les déduplique par `session_id`, puis applique les
seuils, la récence et la confiance définis dans le pipeline.

La banque doit être enrichie avec `analyse_gpt/pipeline_HEP.py integrate-js`.
Cette commande met automatiquement `BANK_RELEASE` à jour dans `config.js`; une
intégration manuelle de `questions.js` rendrait l'identifiant de banque obsolète.

## Fichiers
- `index.html`, `style.css`, `app.js` — l'application
- `pedagogy.js` — libellés pédagogiques versionnés, chemins grammaticaux précis
  et agrégation prudente des erreurs. Le catalogue
  prévoit aussi des identifiants encore absents de la banque (`avoir_suivi_infinitif_sujet_action`,
  `laisse_suivi_infinitif`, pronominaux réfléchi/réciproque/essentiellement pronominal);
  ils ne sont jamais appliqués sans métadonnée canonique correspondante.
- `error-profile.js` — agrégation cumulative locale, sans dupliquer les séances
  dans la mémoire de génération
- `questions.js` — la banque locale active de 1 740 questions
- `config.js` — configuration (ID client Google Drive)
- `manifest.json`, `sw.js`, `icon.svg` — installation PWA / hors-ligne
- `static-server.ps1` — serveur statique local (développement, Windows)

## Tests ciblés

```powershell
node test_pedagogy.js
node test_error_profile.js
python -m pytest ..\analyse_gpt\test_feedback_import_HEP.py -q
```
