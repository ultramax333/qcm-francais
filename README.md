# QCM Français — OP001 (HEP Vaud)

Version **1.40**, du 02.10.2026, cache `qcm-op001-v140` :
21 réparations du scan et neuf corrigés supplémentaires acceptés indépendamment,
soit 30 questions modifiées et 29 corrigés enrichis. Les 1 782 identifiants et toutes
les clés sont conservés ; release `questions-20261002-6a71b2f4`.
Les corrections réinitialisent le progrès des seules questions révisées, sans effacer
les séances archivées. Les propositions encore en revue et la carte protégée restent intactes.
Préparation de publication : `2026-10-02T19:41:46Z`, soit le 02.10.2026 à 21:41 en heure suisse.
Validation de la banque : 372 tests Python ; neuf suites JavaScript revérifiées pour la release.
Preuves : `../analyse_gpt/audit_banque/reparations_scan_20261002/application.json`
et `../analyse_gpt/audit_banque/remediation_erreurs_20261002/application_01.json`.

Version **1.39**, du 02.10.2026, cache `qcm-op001-v139` :
refonte visuelle sombre, palette bleu nuit/pervenche, textes et corrigés plus lisibles,
accueil organisé par mode puis par règle. L’installation et la conservation locale
restent expliquées en haut ; l’historique est directement accessible au clavier.
Grille sur tablette/ordinateur, quiz en une colonne, zoom et zones tactiles conservés.
La banque, les règles de tirage et le stockage des résultats sont inchangés.
Préparation de publication : `2026-10-02T12:27:35Z`, soit le 02.10.2026 à 14:27 en heure suisse.
Neuf suites JavaScript et 37 contrôles responsive réussis ; banque de 1 782 questions
inchangée, release `questions-20261002-2d53e15e`.
Preuves responsive Chromium et limites :
`../analyse_gpt/audit_banque/design_site_20261002/rapport.md`.

Version **1.38**, du 02.10.2026, cache `qcm-op001-v138` :
question `orth-L22-1` (vice / vis) supprimée sur demande, corrigé de `dis-L40-6` enrichi
pour expliquer la conservation de la négation au discours indirect. Banque unique de
1 782 questions, dont 30 négations ; release `questions-20261002-2d53e15e`.
Les quatre nouveaux feedbacks Drive sont importés dans le suivi privé ; une appréciation
publique positive est conservée séparément. Aucun score de camarade ne pèse sur les erreurs
personnelles. Preuves : `../analyse_gpt/audit_banque/retours_20261002/rapport_retours.json`.
Trois réparations de négation acceptées indépendamment (un énoncé et deux explications)
sont incluses, sans changement de clé ni d'option. Validation finale avant publication :
372 tests Python et quatre suites JavaScript ; huit suites JavaScript revérifiées pour la release.
Préparation de publication : `2026-10-02T11:35:58Z`, soit le 02.10.2026 à 13:35 en heure suisse.
L'accueil explique désormais l'ajout à l'écran d'accueil et la conservation locale :
l'installation n'est ni obligatoire pour enregistrer l'historique ni une sauvegarde.
La navigation privée et l'effacement des données du site peuvent faire perdre les progrès.

### Progrès après correction d'une question (1.38)

Chaque correction via le pipeline avance automatiquement `progress_revision` si l'énoncé,
les options, la clé, la consigne ou le corrigé changent. Une simple mise à jour de classement
ou une nouvelle version de l'application ne réinitialise rien.
Au chargement d'une banque plus récente, seule la question révisée redevient non vue et sort
de l'ancienne pile de révision. Ses anciennes tentatives restent archivées, mais ne comptent
plus dans la maîtrise, « Mes erreurs » ou le test adaptatif. Les nouvelles tentatives comptent
normalement ; la migration ne se répète pas à chaque visite. Le marquage couvre aussi les
personnes qui sautent plusieurs versions. Aucun effet à distance avant leur mise à jour.
Les compteurs des familles concernées sont reconstruits depuis les tentatives détaillées
compatibles. Un ancien compteur sans journal détaillé ne permet pas de séparer les questions :
il est remplacé par les seules tentatives prouvables, sans supprimer les anciennes séances.
`question-progress.js` est chargé avant l'application et inclus dans le cache hors ligne.
Export courant `hep-feedback/1.3` : `progress_revision` est transmis au pipeline privé,
qui conserve les archives et exclut les anciennes versions du poids actif de génération.
La validation historique de ce mécanisme précédait les réparations ciblées ; la validation
finale de la banque et de la release figure en tête de ce document.

Version **1.37**, du 02.10.2026, cache `qcm-op001-v137` :
navigation Retour/Avancer entre écrans, reprise de la même séance pendant la visite,
retour des questions sources vers « Mes erreurs » et aucun recomptage des résultats.
À l'accueil, Retour peut quitter normalement : aucun piège d'historique.
Zoom autorisé, marges d'encoche sur les quatre côtés, boutons tactiles de 44 px minimum,
saisie des remarques de 16 px sur mobile et mode paysage autorisé.
Banque inchangée : 1 783 questions, dont 30 négations, même release.
Sept suites JavaScript réussies ; essais navigateur aux largeurs 320, 360, 390 et 844 px.
Ces essais responsive ne sont pas une certification Safari/iPhone ou Android physique.
Après rechargement ou fermeture, une séance inachevée n'est pas restaurée automatiquement ;
les séances terminées et statistiques persistées restent conservées. L'avertissement de fermeture
est un repli du navigateur, non garanti sur mobile.
Publication autorisée le 02.10.2026 avec les 29 ajouts de négation de la version locale 1.36.

Version **1.36 locale, non publiée**, du 02.10.2026, cache `qcm-op001-v136` :
29 questions de négation ajoutées après contrôles indépendants, soit 30 dans cette carte et
1 783 questions / IDs uniques. Les 1 754 anciennes questions sont conservées à l'identique.
Release `questions-20261002-43f33f4d`. Cinq suites JavaScript et 320 tests Python réussis.
État historique avant la publication 1.37 : site public en 1.35, sauvegardes et interface inchangées.

Version **1.35** du 01.10.2026, cache `qcm-op001-v135` : consignes
explicites selon la tâche, rappel du choix unique 1–4/Aucune/Toutes et panneau
« Remarque / signalement ». Le contexte utile est conservé ; une consigne générique stockée comme
contexte n'est pas répétée. Banque, clés, métadonnées et sauvegardes personnelles inchangées.

Version **1.34** du 01.10.2026, cache `qcm-op001-v134` : 688 questions réparées après contre-revue indépendante,
dont dix clés, sans ajout ni retrait. Banque de 1 754 IDs, release `questions-20261001-6ef235f2`.
Des sous-règles et deux fiches apprenant ont aussi été précisées. Les arbitrages et la revue des
titres sont traités. Validation : 307 tests Python et cinq suites JavaScript réussis ;
les indications sur la version 1.33 ci-dessous sont historiques.

Le bouton « Signaler un problème » ouvre un formulaire Google prérempli avec l'ID de la
question et la version de banque. Ni réponses, ni scores, ni historique personnel ne sont transmis.
Les sauvegardes Drive restent sur le compte de leur propriétaire ; sur un même navigateur/profil,
le stockage local est commun. Les remarques de tiers sont une revue qualité, jamais des erreurs
personnelles ajoutées à la pondération. Les réponses du formulaire restent privées ; leur récupération
automatique dans le projet n'est pas encore raccordée.

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
À l’écran, chaque difficulté commence par « La règle, simplement », puis
« Comment faire » en trois étapes. Famille, mécanisme, détail, temps, chemin canonique et
codes de cause restent disponibles uniquement dans « Catégorie technique ».

Version `1.33` du 05.09.2026 : cache `qcm-op001-v133`. Validation : 255 tests Python et les
trois suites JavaScript réussis. Base pédagogique synchronisée (214 mécanismes), avec une règle
générale des possessifs conservée et la distinction votre/vôtre explicitée. **1 754 questions uniques**, release
`questions-20260814-4b135c45`. Le lot `hep-b1-20260814-0001` ajoute dix questions produites et
contrôlées par la boucle Sol High complète, sans remplacement d’une question existante. La famille
canonique **Négation** possède désormais sa propre carte d’entraînement, portant le menu à 16 cartes.
Le nouveau **Test adaptatif — 20 questions** utilise uniquement les résultats conservés sur l’appareil :
il cible le chemin famille/mécanisme/détail/temps avec les 20 dernières tentatives de chaque chemin.
80 % des places favorisent les difficultés observées ; 20 % sont tirées parmi l'ensemble des cas.
Le poids `(erreurs + 1) / (tentatives + 4)` tempère les petits échantillons. Les cas sont tirés
proportionnellement au poids, avec réduction des répétitions dans la séance et priorité aux questions
inédites au sein de chaque cas. Les places des petits groupes sont redistribuées. Les anciennes clés
incompatibles, les questions retirées et les demandes locales « À supprimer » ne renforcent pas le ciblage.
Sans journal détaillé, les compteurs familiaux servent de repli. Le test aléatoire reste disponible.
Le tableau cumulatif conserve toutes les tentatives historiques ; la fenêtre récente sert seulement
au ciblage adaptatif. Une séance avec le même identifiant est comptée une seule fois.
Les trois
questions normativement ambiguës restent retirées et le corrigé de `drill40h-08-2` conserve sa
version pédagogique corrigée. Le tableau
« Mes erreurs » affiche désormais une rubrique scolaire cherchable dans un Bescherelle, une règle
courte, le résultat et un raccourci vers les seules questions effectivement ratées ; la méthode et
les données techniques restent repliées.

Après une réponse portant sur un ou plusieurs participes passés, l’application affiche d’abord le ou
les types précis issus de la taxonomie canonique. La règle et l’explication complètes restent dans un
volet « Voir la règle et l’explication » afin de ne pas surcharger la correction immédiate.
Le chemin pronominal réfléchi de `eleves-L66-3`, signalé par le feedback Drive, est désormais inclus
dans les types affichés ; aucun texte, aucune option et aucune clé n’ont changé.

Les 114 questions alors présentes dans la famille applicative `participe` ont été relues individuellement.
Dix métadonnées ont été précisées pour que chaque construction réellement testée apparaisse dans
la correction et dans les statistiques. Après le retrait des trois cas ambigus en version 1.30,
la banque active contient 112 questions dans cette famille depuis l'ajout du lot du 14.08.

Toutes les questions portent une famille et un mécanisme grammatical fermés. Les détails, temps et
causes de distracteur non prouvés restent `null` ou `UNK`.

La carte **Accord du participe passé** est un menu déroulant. Elle conserve un
entraînement général et propose aussi un entraînement ciblé pour les 22 sous-cas stables actifs
`mechanism_id + detail_id` de la banque, regroupés en règles générales, infinitif,
verbes pronominaux, cas particuliers et révisions combinées. Chaque cas affiche
avant le lancement sa règle en langage scolaire, un exemple et une méthode en
trois étapes. Le filtre utilise directement le couple canonique de la question;
aucune taxonomie parallèle n'est créée. Les trois couples à norme variable encore présents restent
dans le mélange général mais sont exclus du ciblage. Un sous-cas prévu sans question
active reste masqué jusqu'à la publication d'une question correspondante. Les questions composites
peuvent conserver jusqu'à trois chemins de règle secondaires pour la traçabilité, sans les compter
dans la pondération ni créer une seconde banque.

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

### Date et heure de la version

Les en-têtes affichent la version et « Mise à jour le JJ.MM.AAAA à HH:mm (heure suisse) ».
La source unique est `CONFIG.APP_PUBLISHED_AT` dans `config.js`, un instant ISO 8601 fixe
avec `Z` ou un décalage explicite, affiché dans le fuseau `Europe/Zurich` (heure d'été comprise).
Il représente la préparation de la release destinée à être publiée, pas l'heure de visite
ni la fin exacte du déploiement Pages. À chaque publication autorisée, renseigner cet instant
avec `APP_VERSION` et le nouveau `CACHE` de `sw.js`, puis vérifier les fichiers servis.
Pour une version locale non publiée, conserver `APP_PUBLISHED_AT: null` : l'interface indique
« Version locale — non publiée ». Une valeur absente, invalide ou sans fuseau utilise aussi
ce repli, sans inventer de date. La version 1.40 utilise l'instant fixe indiqué en tête.

## Google Drive (facultatif)
Pour l'envoi automatique des mémos/stats vers Google Drive, renseigne `GOOGLE_CLIENT_ID`
dans `config.js` (voir les instructions détaillées en tête de ce fichier). Tant que c'est
vide, les boutons **Copier** et **Télécharger** du feedback restent disponibles.

Chaque nouvelle séance exporte un Markdown humain avec un bloc machine
`hep-feedback/1.3`. Le booléen `deletion_requested` est indépendant de la justesse
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
- `pedagogy.js` — catégories techniques versionnées, fiche apprenant propre à
  chaque mécanisme actif et agrégation prudente des erreurs. Les sous-cas prévus
  mais encore sans question ne sont jamais affichés ni appliqués par défaut.
- `error-profile.js` — agrégation cumulative locale, sans dupliquer les séances
  dans la mémoire de génération
- `adaptive-quiz.js` — tirage par cas grammatical et résultats récents, sans modèle ni serveur
- `questions.js` — la banque active de 1 782 questions
- `config.js` — configuration (ID client Google Drive)
- `manifest.json`, `sw.js`, `icon.svg` — installation PWA / hors-ligne
- `static-server.ps1` — serveur statique local (développement, Windows)

## Tests ciblés

```powershell
node test_pedagogy.js
node test_error_profile.js
node test_adaptive_quiz.js
node test_navigation.js
node test_mobile_layout.js
node test_design.js
python -m pytest ..\analyse_gpt\test_feedback_import_HEP.py -q
```
