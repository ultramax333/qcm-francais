(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HEP_PEDAGOGY = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const LABELS_VERSION = 'hep-pedagogy-labels/2.5';

  const TENSES = {
    present: 'présent',
    imparfait: 'imparfait',
    passe_simple: 'passé simple',
    passe_compose: 'passé composé',
    plus_que_parfait: 'plus-que-parfait',
    futur_simple: 'futur simple',
    futur_anterieur: 'futur antérieur',
    conditionnel_present: 'conditionnel présent',
    conditionnel_passe: 'conditionnel passé',
    subjonctif_present: 'subjonctif présent',
    subjonctif_passe: 'subjonctif passé',
    imperatif_present: 'impératif présent',
  };

  const FAMILIES = {
    accord_adjectif_nom: 'Accord de l’adjectif avec le nom',
    accord_participe_passe: 'Accord du participe passé',
    accord_sujet_verbe: 'Accord du verbe avec son sujet',
    adjectif_verbal_participe_present: 'Adjectif verbal ou participe présent',
    concordance_temps: 'Concordance des temps',
    conjugaison: 'Conjugaison',
    connecteurs_logiques: 'Connecteurs logiques',
    discours_indirect: 'Discours indirect',
    formes_de_phrase: 'Formes de phrase',
    gentiles_majuscules: 'Majuscule des gentilés',
    homophones_grammaticaux: 'Homophones grammaticaux',
    interrogation_indirecte: 'Interrogation indirecte',
    negation: 'Négation',
    nombres_traits_union: 'Écriture des nombres',
    orthographe_lexicale: 'Orthographe lexicale',
    ponctuation: 'Ponctuation',
    prepositions_regies: 'Prépositions imposées',
    pronoms_relatifs: 'Pronoms relatifs',
    pronoms_reprise: 'Pronoms de reprise',
    revision_transversale: 'Révision de plusieurs mécanismes',
    rupture_syntaxique: 'Construction détachée et sujet implicite',
    subjonctif_indicatif: 'Choix entre subjonctif et indicatif',
    vocabulaire_contexte: 'Vocabulaire en contexte',
  };

  const FAMILY_GUIDANCE = {
    accord_adjectif_nom: 'Retrouve le nom donneur, puis accorde l’adjectif avec lui en genre et en nombre.',
    accord_participe_passe: 'Identifie l’auxiliaire et la fonction du complément direct avant de décider l’accord.',
    accord_sujet_verbe: 'Repère le noyau du sujet, puis reporte sa personne et son nombre sur le verbe.',
    adjectif_verbal_participe_present: 'Détermine si la forme décrit un nom ou exprime une action avant de l’accorder ou de la laisser invariable.',
    concordance_temps: 'Place les actions sur une ligne du temps et choisis le temps qui exprime leur ordre.',
    conjugaison: 'Identifie le temps, le radical et la personne avant d’ajouter la terminaison.',
    connecteurs_logiques: 'Nomme la relation entre les deux idées avant de choisir le connecteur.',
    discours_indirect: 'Recalcule séparément les temps, les personnes et les repères depuis le nouveau point de vue.',
    formes_de_phrase: 'Pars de la phrase neutre, puis choisis qui pour mettre le sujet en évidence et que pour un autre élément.',
    gentiles_majuscules: 'Distingue le nom de personne, l’adjectif et la langue avant de choisir la majuscule.',
    homophones_grammaticaux: 'Identifie la catégorie et la fonction du mot, puis utilise un test de remplacement.',
    interrogation_indirecte: 'Après le verbe introducteur, conserve une subordonnée à l’ordre déclaratif.',
    negation: 'Dans un écrit scolaire ou formel, vérifie que la négation entoure correctement le verbe conjugué.',
    nombres_traits_union: 'Décompose le nombre et applique séparément la règle de chaque élément.',
    orthographe_lexicale: 'Compare la forme attendue au sens et à la construction de la phrase.',
    ponctuation: 'Repère les groupes syntaxiques et la relation entre eux avant de placer le signe.',
    prepositions_regies: 'Retrouve le mot recteur et la préposition qu’il impose dans cette construction.',
    pronoms_relatifs: 'Détermine la fonction du relatif et la préposition exigée dans sa proposition.',
    pronoms_reprise: 'Identifie le groupe repris, sa fonction et son nombre avant de choisir le pronom.',
    revision_transversale: 'Isole la difficulté de chaque zone et vérifie les règles l’une après l’autre.',
    rupture_syntaxique: 'Vérifie que le groupe détaché se rattache bien au sujet de la proposition principale.',
    subjonctif_indicatif: 'Repère le déclencheur et demande si le fait est affirmé ou seulement envisagé.',
    vocabulaire_contexte: 'Teste le sens, le registre et la construction de chaque mot dans la phrase complète.',
  };

  // Chaque mécanisme actif possède sa propre fiche apprenant. La taxonomie et
  // les chemins canoniques restent séparés et inchangés plus bas.
  function learnerGuide(title, explanation, steps) {
    return { title, explanation, steps };
  }

  function revisionTitle(familyLabel, learnerTitle) {
    if (!familyLabel) return learnerTitle || 'Règle à préciser';
    if (!learnerTitle) return familyLabel;
    if (learnerTitle.toLocaleLowerCase('fr').startsWith(familyLabel.toLocaleLowerCase('fr'))) {
      return learnerTitle;
    }
    return `${familyLabel} — ${learnerTitle}`;
  }

  const DEFAULT_LEARNER_GUIDANCE = {
    title: 'Reprendre cette difficulté pas à pas',
    explanation: 'Exemple : une réponse isolée ne suffit pas à expliquer pourquoi l’erreur a eu lieu. La correction détaillée reste la source la plus fiable.',
    steps: ['Relis la phrase et ta réponse.', 'Compare-les avec la correction détaillée.', 'Note la différence observable sans inventer la cause de ton erreur.'],
  };

  const LEARNER_GUIDANCE = {
    // Accord adjectif-nom
    donneur_eloigne: learnerGuide(
      'Accorder un adjectif éloigné du nom',
      'Exemple : dans « Les décisions prises hier sont, malgré les critiques, difficiles à appliquer », « difficiles » décrit « décisions ». L’adjectif s’accorde avec le nom qu’il décrit, même si plusieurs mots les séparent.',
      ['Repère l’adjectif.', 'Demande quel nom il décrit réellement.', 'Accorde-le au genre et au nombre de ce nom.']
    ),

    // Accord du participe passé
    avoir_cvd_apres: learnerGuide(
      'Avec « avoir » : le COD vient après',
      'Exemple : « Elle a rangé les feuilles. » Le COD « les feuilles » vient après « rangé » : le participe passé ne s’accorde pas.',
      ['Repère l’auxiliaire « avoir ».', 'Trouve le COD en posant « qui ? » ou « quoi ? » après le verbe.', 'S’il vient après le participe, ne fais pas l’accord.']
    ),
    avoir_cvd_avant: learnerGuide(
      'Avec « avoir » : le COD vient avant',
      'Exemple : « Les feuilles qu’elle a rangées. » Le COD « que », qui reprend « feuilles », vient avant « rangées » : le participe passé s’accorde avec lui.',
      ['Repère l’auxiliaire « avoir ».', 'Trouve le COD et vérifie s’il est placé avant le participe.', 'S’il est avant, accorde le participe avec le mot qu’il reprend.']
    ),
    avoir_en_invariable: learnerGuide(
      'Avec « en » : le participe change rarement',
      'Exemple : « Des lettres, j’en ai écrit trois. » Quand « en » reprend ce qui est compté, le participe passé employé avec « avoir » reste généralement inchangé.',
      ['Repère le pronom « en ».', 'Vérifie qu’il reprend le complément lié au participe.', 'Dans ce cas, laisse généralement le participe au masculin singulier.']
    ),
    participe_suivi_infinitif: learnerGuide(
      'Participe passé suivi d’un infinitif',
      'Exemple : « Les élèves que j’ai entendus chanter » s’accorde, car les élèves chantent. Dans « les chansons que j’ai entendu chanter », les chansons ne chantent pas : pas d’accord.',
      ['Trouve le COD placé avant le participe.', 'Demande si ce COD fait lui-même l’action de l’infinitif.', 'Accorde seulement si le COD accomplit cette action.']
    ),
    etre_accord_sujet: learnerGuide(
      'Avec « être » : accord avec le sujet',
      'Exemple : « Elles sont parties. » Avec l’auxiliaire « être », le participe passé s’accorde avec le sujet.',
      ['Repère l’auxiliaire « être ».', 'Trouve le sujet du verbe.', 'Accorde le participe au genre et au nombre du sujet.']
    ),
    fait_suivi_infinitif: learnerGuide(
      '« Fait » suivi d’un infinitif',
      'Exemple : « Elles se sont fait surprendre. » Le participe « fait » reste toujours inchangé lorsqu’un infinitif le suit immédiatement.',
      ['Repère la forme « fait ».', 'Vérifie qu’un infinitif vient juste après.', 'Si oui, écris toujours « fait », sans accord.']
    ),
    impersonnel_participe_invariable: learnerGuide(
      'Participe dans une tournure impersonnelle',
      'Exemple : « Les efforts qu’il a fallu. » Dans une tournure comme « il a fallu » ou « il y a eu », le « il » ne désigne personne et le participe reste inchangé.',
      ['Repère une tournure avec « il » qui ne désigne personne.', 'Vérifie qu’aucun COD placé avant ne commande l’accord.', 'Laisse le participe au masculin singulier.']
    ),
    infinitif_sous_entendu_invariable: learnerGuide(
      'Infinitif sous-entendu après « pu », « voulu », « dû »',
      'Exemple : « J’ai fait toutes les démarches que j’ai pu [faire]. » Le COD dépend de l’infinitif sous-entendu « faire » ; « pu » reste inchangé.',
      ['Repère un participe comme « pu », « voulu », « dû » ou « cru ».', 'Rétablis l’infinitif sous-entendu après lui.', 'Si le complément dépend de cet infinitif, ne fais pas l’accord.']
    ),
    matrice_avoir_etre: learnerGuide(
      'Choisir entre la règle de « avoir » et celle de « être »',
      'Exemple : « Elles sont arrivées », mais « elles ont terminé ». L’auxiliaire décide de la première règle d’accord à appliquer.',
      ['Repère l’auxiliaire réellement employé.', 'Avec « être », cherche le sujet ; avec « avoir », cherche le COD et sa place.', 'Applique uniquement la règle correspondant à cet auxiliaire.']
    ),
    matrice_participes_speciaux: learnerGuide(
      'Vérifier plusieurs cas spéciaux du participe',
      'Exemple : « elles se sont parlé », « les cent francs qu’il a coûté » et « elles se sont évanouies » suivent trois règles différentes. Chaque phrase doit être analysée séparément.',
      ['Lis une seule phrase à la fois.', 'Identifie son cas précis : pronominal, mesure, tournure impersonnelle ou forme spéciale.', 'Applique la règle de ce cas avant de passer à la phrase suivante.']
    ),
    mesure_duree_prix: learnerGuide(
      'Participe avec une mesure, une durée ou un prix',
      'Exemple : « Les cent francs que ce meuble a coûté. » « Cent francs » répond à « combien ? », pas à « quoi ? » : il exprime un prix et ne commande pas l’accord.',
      ['Repère le groupe placé avant le participe.', 'Demande s’il répond à « combien ? » en indiquant un prix, une durée, un poids ou une distance.', 'Si oui, laisse le participe inchangé.']
    ),
    participe_adjectival_selon_position: learnerGuide(
      'Accorder « ci-joint », « excepté » ou « mis à part »',
      'Exemple : « Ci-joint les copies », mais « les copies ci-jointes ». Ces formes restent souvent inchangées avant le nom et s’accordent comme des adjectifs après le nom.',
      ['Repère la forme spéciale et le nom concerné.', 'Vérifie si la forme est placée avant ou après ce nom.', 'Avant le nom, laisse-la généralement inchangée ; après, accorde-la avec le nom.']
    ),
    participe_sans_auxiliaire: learnerGuide(
      'Participe passé employé sans auxiliaire',
      'Exemple : « Déçue, elle est partie. » Sans auxiliaire, le participe passé fonctionne comme un adjectif et s’accorde avec le nom ou le pronom qu’il qualifie.',
      ['Vérifie que le participe est employé sans auxiliaire.', 'Trouve le nom ou le pronom qu’il qualifie.', 'Accorde-le au genre et au nombre de ce donneur.']
    ),
    pronominal_cvd_avant: learnerGuide(
      'Verbe pronominal : « se » est COD',
      'Exemple : « Elles se sont lavées. » Elles ont lavé qui ? Elles-mêmes : « se » est COD placé avant, donc le participe s’accorde.',
      ['Repère le pronom « se ».', 'Pose la question « elles ont lavé qui ou quoi ? ».', 'Si la réponse est « se », accorde le participe avec le sujet.']
    ),
    pronominal_accord_sujet: learnerGuide(
      'Pronominal : le sujet commande l’accord',
      'Exemple : « Elles se sont évanouies. » Dans un emploi essentiellement pronominal, autonome ou de sens passif, le participe s’accorde avec le sujet.',
      ['Identifie l’emploi pronominal précis.', 'Vérifie que « se » n’est pas un COD à analyser.', 'Accorde le participe avec le sujet.']
    ),
    pronominal_se_coi: learnerGuide(
      'Verbe pronominal : « se » est COI',
      'Exemple : « Elles se sont parlé. » Elles ont parlé à qui ? L’une à l’autre : « se » est COI et ne commande pas l’accord.',
      ['Repère le pronom « se ».', 'Pose la question « à qui ? » ou « à quoi ? ».', 'Si « se » est COI, il ne commande pas l’accord : cherche alors un éventuel COD et sa place.']
    ),
    laisse_suivi_infinitif: learnerGuide(
      '« Laissé » suivi d’un infinitif : deux normes admises',
      'Exemple : « Elle s’est laissée tomber » et « elle s’est laissé tomber » illustrent deux normes admises. Ce cas sert à expliquer la variation, pas à départager une réponse unique.',
      ['Repère « laissé » suivi immédiatement d’un infinitif.', 'Reconnais que deux normes sont admises.', 'N’utilise pas ce cas comme piège à réponse unique.']
    ),
    avoir_pronom_l: learnerGuide(
      'Avec « l’ » : idée neutre ou nom repris',
      'Exemple : « La réussite a été plus grande que je ne l’avais imaginé. » Si « l’ » reprend une idée entière, le participe reste au masculin singulier ; s’il reprend un nom, il peut commander l’accord.',
      ['Repère ce que remplace « l’ ».', 'Distingue une idée entière d’un nom précis.', 'Idée neutre : masculin singulier ; nom : accord selon son genre et son nombre.']
    ),
    participe_attribut_cod: learnerGuide(
      'Participe suivi d’un attribut du COD',
      'Exemple : avec un participe suivi d’un attribut du COD, l’analyse et l’usage peuvent admettre plusieurs accords. La question doit être relue indépendamment avant tout entraînement ciblé.',
      ['Identifie le COD et son attribut.', 'Vérifie l’analyse et la norme retenues.', 'N’impose une réponse unique que si elle est démontrée.']
    ),

    // Accord sujet-verbe
    coordination_comparative_incise: learnerGuide(
      'Sujet suivi de « ainsi que » entre virgules',
      'Exemple : « Paul, ainsi que sa sœur, viendra. » Entre virgules, « ainsi que sa sœur » ajoute une comparaison ; le verbe s’accorde avec « Paul » seul.',
      ['Repère le groupe entre virgules introduit par « ainsi que » ou « comme ».', 'Retire provisoirement ce groupe.', 'Accorde le verbe avec le sujet qui reste.']
    ),
    deux_sujets_deux_verbes: learnerGuide(
      'Relier chaque verbe à son sujet',
      'Exemple : « Paul écrit et ses collègues relisent. » Les deux verbes n’ont pas le même sujet ; chacun reçoit son propre accord.',
      ['Sépare les deux propositions.', 'Pose « qui est-ce qui ? » devant chaque verbe.', 'Accorde chaque verbe avec la réponse correspondante.']
    ),
    nom_collectif: learnerGuide(
      'Accord avec un nom collectif',
      'Exemple : dans « une foule de visiteurs avance », on insiste sur la foule ; dans certains contextes, le pluriel peut mettre l’accent sur ses membres. Le sens et la construction décident.',
      ['Repère le nom collectif et le groupe introduit par « de ».', 'Demande si la phrase insiste sur l’ensemble ou sur ses membres.', 'Choisis l’accord admis par cette construction et cohérent avec le sens.']
    ),
    noyau_singulier_complement_pluriel: learnerGuide(
      'Ne pas accorder avec le nom pluriel le plus proche',
      'Exemple : « La liste des élèves est prête. » Le sujet principal est « la liste », au singulier ; « des élèves » ne commande pas le verbe.',
      ['Repère tout le groupe sujet.', 'Trouve son nom principal en retirant le complément introduit par « de ».', 'Accorde le verbe avec ce nom principal.']
    ),
    priorite_personnes_coordonnees: learnerGuide(
      'Choisir la personne avec plusieurs sujets',
      'Exemple : « Toi et moi irons » se met à la 1re personne du pluriel. Avec plusieurs sujets, « je/nous » l’emporte sur « tu/vous », qui l’emporte sur « il/elle/ils/elles ».',
      ['Repère toutes les personnes du sujet.', 'Cherche d’abord « je » ou « nous », puis « tu » ou « vous ».', 'Conjugue au pluriel à la personne qui a priorité.']
    ),
    pronom_sujet_renforce: learnerGuide(
      'Accord avec « vous seuls », « eux seuls », « vous tous »',
      'Exemple : « Vous seuls pouvez répondre. » « Seuls » renforce « vous », mais ne change ni sa personne ni son nombre.',
      ['Repère le pronom sujet.', 'Ignore provisoirement « seul(s) » ou « tous ».', 'Accorde le verbe avec le pronom restant.']
    ),
    quantifieur_pluriel: learnerGuide(
      'Expressions qui demandent le pluriel',
      'Exemple : « La plupart des élèves sont présents. » Des expressions comme « la plupart », « bien des », « nombre de » ou « moins de deux » commandent normalement le pluriel.',
      ['Repère l’expression de quantité.', 'Vérifie qu’elle appartient aux constructions qui commandent le pluriel.', 'Mets le verbe au pluriel.']
    ),
    quantifieur_singulier: learnerGuide(
      'Expressions qui demandent le singulier',
      'Exemple : « Chacun répond » et « plus d’un élève hésite ». « Chacun », « plus d’un », « tout le monde » et « aucun » restent au singulier.',
      ['Repère l’expression de quantité.', 'Vérifie que son noyau est « chacun », « plus d’un », « tout le monde » ou « aucun ».', 'Mets le verbe au singulier.']
    ),
    relative_qui_antecedent: learnerGuide(
      'Accorder le verbe après « qui »',
      'Exemple : « Les élèves qui travaillent réussissent. » « Qui » reprend « les élèves » ; le verbe placé après s’accorde donc au pluriel.',
      ['Repère « qui » devant le verbe.', 'Trouve le nom ou le pronom repris par « qui ».', 'Accorde le verbe au même nombre.']
    ),
    relative_qui_antecedent_personne: learnerGuide(
      'Choisir la personne du verbe après « qui »',
      'Exemple : « C’est moi qui ai répondu », pas « qui a ». « Qui » transmet au verbe la personne du mot qu’il reprend.',
      ['Repère « qui » devant le verbe.', 'Remplace « qui » par le mot repris : moi, toi, nous, vous, etc.', 'Conjugue le verbe à cette personne.']
    ),
    sujet_eloigne: learnerGuide(
      'Retrouver un sujet éloigné du verbe',
      'Exemple : « La qualité de ces travaux, malgré les retards, reste remarquable. » Le sujet de « reste » est « la qualité », même s’il est éloigné.',
      ['Repère le verbe.', 'Pose « qui est-ce qui ? » en ignorant les groupes entre le sujet et le verbe.', 'Accorde avec le noyau de la réponse.']
    ),
    sujet_infinitif: learnerGuide(
      'Un infinitif sujet commande le singulier',
      'Exemple : « Lire régulièrement aide à progresser. » Un infinitif ou un groupe infinitif pris comme sujet est grammaticalement singulier.',
      ['Repère le groupe à l’infinitif placé comme sujet.', 'Vérifie qu’il forme une seule idée ou activité.', 'Mets le verbe principal au singulier.']
    ),
    sujet_inverse: learnerGuide(
      'Accorder avec un sujet placé après le verbe',
      'Exemple : « Arrivent ensuite les résultats. » Même après le verbe, « les résultats » reste le sujet et impose le pluriel.',
      ['Repère le verbe.', 'Cherche qui fait l’action, y compris après le verbe.', 'Accorde le verbe avec ce sujet.']
    ),
    sujets_coordonnees: learnerGuide(
      'Accorder avec plusieurs sujets',
      'Exemple : « Paul et Léa viennent. » Deux sujets ajoutés par « et » forment normalement un ensemble pluriel.',
      ['Repère les sujets reliés par « et ».', 'Vérifie qu’ils s’ajoutent réellement l’un à l’autre.', 'Mets le verbe au pluriel.']
    ),

    // Adjectif verbal ou participe présent
    accord_adjectif_invariabilite_participe: learnerGuide(
      'Distinguer adjectif verbal et participe présent',
      'Exemple : « des enfants fatigants » décrit les enfants, mais « des enfants fatiguant leurs parents » exprime une action. L’adjectif s’accorde ; le participe présent ne change pas.',
      ['Repère la forme en « -ant ».', 'Demande si elle décrit un nom ou si elle garde une action de verbe.', 'Accorde la description ; laisse la forme d’action inchangée.']
    ),
    convaincant_convainquant: learnerGuide(
      'Écrire « convaincant » ou « convainquant »',
      'Exemple : « un argument convaincant », mais « convainquant le jury ». L’adjectif s’écrit avec « c » ; la forme du verbe « convaincre » en action garde « qu ».',
      ['Demande si la forme décrit un nom ou exprime l’action de convaincre.', 'Description : choisis « convaincant » et accorde-le.', 'Action : choisis « convainquant » et ne l’accorde pas.']
    ),
    fatigant_fatiguant: learnerGuide(
      'Écrire « fatigant » ou « fatiguant »',
      'Exemple : « un trajet fatigant », mais « le trajet fatiguant les enfants ». L’adjectif perd le « u » ; la forme du verbe « fatiguer » en action le garde.',
      ['Demande si la forme décrit un nom ou exprime l’action de fatiguer.', 'Description : choisis « fatigant » et accorde-le.', 'Action : choisis « fatiguant » et ne l’accorde pas.']
    ),
    participe_present_avec_complement: learnerGuide(
      'Forme en « -ant » suivie d’un complément',
      'Exemple : « des élèves préparant leur examen ». « Préparant » garde le complément « leur examen » : il exprime une action et ne s’accorde pas.',
      ['Repère la forme en « -ant ».', 'Vérifie si elle garde un complément ou un autre élément demandé par le verbe.', 'Si oui, traite-la comme une action et ne l’accorde pas.']
    ),

    // Concordance des temps
    anteriorite_plus_que_parfait: learnerGuide(
      'Exprimer une action passée plus ancienne',
      'Exemple : « Quand il est arrivé, nous avions déjà mangé. » L’action achevée avant un autre moment passé se met au plus-que-parfait.',
      ['Repère les deux actions passées.', 'Trouve celle qui était déjà terminée avant l’autre.', 'Mets cette action au plus-que-parfait.']
    ),
    au_cas_ou_conditionnel: learnerGuide(
      'Après « au cas où »',
      'Exemple : « Prends un parapluie au cas où il pleuvrait. » La locution « au cas où » se construit avec le conditionnel.',
      ['Repère « au cas où ».', 'Situe l’éventualité dans le présent ou le passé.', 'Conjugue le verbe au conditionnel au temps adapté.']
    ),
    futur_dans_le_passe: learnerGuide(
      'Exprimer le futur depuis un moment passé',
      'Exemple : « Il a dit qu’il viendrait. » Une action future vue depuis un verbe au passé se met généralement au conditionnel présent.',
      ['Repère le verbe principal au passé.', 'Trouve l’action qui devait arriver plus tard.', 'Mets cette action au conditionnel présent.']
    ),
    hypothese_si_imparfait_conditionnel: learnerGuide(
      'Hypothèse présente avec « si »',
      'Exemple : « Si j’avais le temps, je viendrais. » Pour une situation présente imaginée ou peu réelle, on emploie « si » + imparfait, puis le conditionnel présent.',
      ['Repère la condition introduite par « si ».', 'Mets son verbe à l’imparfait.', 'Mets le résultat au conditionnel présent.']
    ),
    hypothese_si_plus_que_parfait_conditionnel_passe: learnerGuide(
      'Hypothèse passée qui ne s’est pas réalisée',
      'Exemple : « Si j’avais su, je serais venu. » La condition passée prend le plus-que-parfait ; son résultat non réalisé prend le conditionnel passé.',
      ['Repère la condition passée introduite par « si ».', 'Mets cette condition au plus-que-parfait.', 'Mets la conséquence au conditionnel passé.']
    ),
    reperage_temporel: learnerGuide(
      'Choisir le temps selon l’ordre des actions',
      'Exemple : dans « quand il arrivera, nous aurons fini », finir se produit avant arriver. Le temps choisi doit montrer clairement avant, pendant ou après.',
      ['Repère le moment qui sert de point de comparaison.', 'Place chaque action avant, pendant ou après ce moment.', 'Choisis le temps qui exprime cette relation sans ajouter une information absente.']
    ),

    // Conjugaison
    alternance_radical_conjugaison: learnerGuide(
      'Adapter le radical du verbe',
      'Exemple : « j’appelle », mais « nous appelons ». Certains verbes doublent une consonne ou changent un accent devant certaines terminaisons.',
      ['Repère le verbe, le temps et la personne.', 'Compare avec une forme connue du même modèle.', 'Adapte le radical, puis ajoute la terminaison normale.']
    ),
    conditionnel: learnerGuide(
      'Former le conditionnel',
      'Exemple : « je viendrais » combine le radical du futur « viendr- » et la terminaison de l’imparfait « -ais ». Le conditionnel suit ce modèle.',
      ['Repère la personne du sujet.', 'Prends le radical du futur du verbe.', 'Ajoute la terminaison de l’imparfait correspondant à cette personne.']
    ),
    forme_irreguliere_selon_temps: learnerGuide(
      'Choisir une forme irrégulière au bon temps',
      'Exemple : on écrit « vous dites », mais « vous direz ». Un verbe irrégulier peut changer de radical selon le temps et la personne.',
      ['Repère le temps demandé par la phrase.', 'Repère la personne du sujet.', 'Choisis la forme irrégulière attestée pour ce temps et cette personne.']
    ),
    futur_irregulier: learnerGuide(
      'Utiliser un radical irrégulier au futur',
      'Exemple : « j’irai », pas « j’allerai ». Certains verbes ont un radical spécial au futur, auquel on ajoute les terminaisons habituelles.',
      ['Repère le verbe et la personne.', 'Rappelle le radical particulier du futur.', 'Ajoute la terminaison du futur correspondant à la personne.']
    ),
    futur_simple_regulier: learnerGuide(
      'Former le futur simple régulier',
      'Exemple : « je finirai ». Pour un verbe régulier, le futur prend l’infinitif comme base, puis la terminaison de la personne ; les verbes en « -re » perdent leur « e » final.',
      ['Repère l’infinitif et la personne.', 'Garde l’infinitif, ou retire le « e » final d’un verbe en « -re ».', 'Ajoute « -ai, -as, -a, -ons, -ez » ou « -ont ».']
    ),
    imparfait_selon_personne: learnerGuide(
      'Former l’imparfait',
      'Exemple : « nous finissons » donne « je finissais ». L’imparfait prend le radical de « nous » au présent sans « -ons », puis sa terminaison ; « être » utilise « ét- ».',
      ['Mets le verbe avec « nous » au présent.', 'Retire « -ons » pour obtenir le radical, sauf pour « être » : « ét- ».', 'Ajoute la terminaison de l’imparfait correspondant au sujet.']
    ),
    imperatif_deuxieme_personne: learnerGuide(
      'Terminaison de l’impératif avec « tu »',
      'Exemple : « Mange ! », mais « Vas-y ! » et « Manges-en ! ». Les verbes en « -er » perdent généralement le « s », qui revient devant « y » ou « en » pour faciliter la prononciation.',
      ['Repère le groupe du verbe.', 'À la forme en « tu », vérifie s’il se termine normalement par « -es » ou « -as ».', 'Retire le « s » si la règle l’exige, mais garde ou ajoute-le devant « y » ou « en ».']
    ),
    imperatif_et_pronoms: learnerGuide(
      'Placer les pronoms à l’impératif',
      'Exemple : « Donne-le-moi », mais « Ne me le donne pas ». À l’impératif affirmatif, les pronoms suivent le verbe avec des traits d’union ; à la forme négative, ils le précèdent.',
      ['Repère si l’ordre est affirmatif ou négatif.', 'Affirmatif : place les pronoms après le verbe dans l’ordre attendu.', 'Négatif : replace-les avant le verbe et encadre le groupe avec « ne… pas ».']
    ),
    infinitif_participe: learnerGuide(
      'Choisir entre infinitif et participe passé',
      'Exemple : « Je vais manger », mais « j’ai mangé ». Après un verbe conjugué ou une préposition, on attend souvent l’infinitif ; après « avoir » ou « être », on attend le participe passé.',
      ['Repère le mot placé juste avant la forme hésitante.', 'Remplace par « prendre/pris » : « prendre » signale l’infinitif, « pris » le participe.', 'Écris la terminaison correspondant au test.']
    ),
    participe_passe_irregulier: learnerGuide(
      'Écrire un participe passé irrégulier',
      'Exemple : « prendre » donne « pris », pas « prendu ». Certains participes passés ont une forme particulière qu’on ne peut pas fabriquer par analogie.',
      ['Repère l’infinitif du verbe.', 'Rappelle ou vérifie sa forme de participe passé.', 'Ajoute seulement les marques d’accord réellement nécessaires.']
    ),
    passe_simple: learnerGuide(
      'Conjuguer au passé simple',
      'Exemple : « il parla », « il finit », « il vint ». Le radical et la série de terminaisons du passé simple dépendent du verbe.',
      ['Repère l’infinitif et le groupe du verbe.', 'Choisis le radical et la série du passé simple propres à ce verbe.', 'Ajoute la terminaison correspondant au sujet.']
    ),
    present_selon_personne: learnerGuide(
      'Conjuguer au présent',
      'Exemple : « tu prends », mais « ils prennent ». Au présent, le radical et la terminaison doivent correspondre au verbe et à la personne du sujet.',
      ['Repère l’infinitif du verbe.', 'Trouve la personne et le nombre du sujet.', 'Choisis le radical et la terminaison du présent pour cette personne.']
    ),
    subjonctif_selon_personne: learnerGuide(
      'Conjuguer un verbe au subjonctif',
      'Exemple : « il faut que nous venions ». Une fois le subjonctif imposé, le radical et la terminaison doivent encore correspondre au sujet.',
      ['Repère l’expression qui impose le subjonctif.', 'Trouve la personne du sujet après « que ».', 'Conjugue le verbe au subjonctif à cette personne.']
    ),

    // Connecteurs logiques
    addition: learnerGuide(
      'Ajouter une idée dans le même sens',
      'Exemple : « Il est compétent ; de plus, il est ponctuel. » Un connecteur d’addition ajoute un argument sans changer l’orientation de la phrase.',
      ['Lis les deux idées séparément.', 'Vérifie que la seconde s’ajoute à la première.', 'Choisis un lien comme « de plus », « aussi » ou « en outre ».']
    ),
    alternative_correlation: learnerGuide(
      'Présenter deux possibilités parallèles',
      'Exemple : « Soit tu viens, soit tu préviens. » Les deux mots de la paire doivent annoncer des choix et introduire des constructions de même forme.',
      ['Repère les deux possibilités.', 'Vérifie la présence des deux éléments de la paire.', 'Construis les deux branches de manière parallèle.']
    ),
    but: learnerGuide(
      'Exprimer le résultat recherché',
      'Exemple : « Il ferme la porte afin que le bruit cesse. » Le connecteur de but introduit ce que l’action cherche à obtenir.',
      ['Repère l’action principale.', 'Demande « dans quel but ? ».', 'Choisis un connecteur qui introduit l’objectif recherché.']
    ),
    cause: learnerGuide(
      'Introduire la cause',
      'Exemple : « Il est absent parce qu’il est malade. » La cause explique pourquoi le fait principal se produit.',
      ['Repère le fait principal.', 'Demande « pourquoi ? ».', 'Place un connecteur de cause devant la raison.']
    ),
    concession: learnerGuide(
      'Exprimer un obstacle qui n’empêche pas le résultat',
      'Exemple : « Bien qu’il pleuve, nous sortons. » La pluie devrait empêcher la sortie, mais le résultat se produit quand même : c’est une concession.',
      ['Repère l’obstacle et le résultat inattendu.', 'Vérifie que l’obstacle n’annule pas le résultat.', 'Choisis le connecteur de concession et le mode qu’il exige.']
    ),
    condition_restriction: learnerGuide(
      'Poser une condition ou une limite',
      'Exemple : « Tu peux sortir à condition de rentrer tôt. » Le connecteur précise dans quelle limite l’énoncé reste valable.',
      ['Repère l’idée principale.', 'Demande quelle condition ou limite doit être respectée.', 'Choisis une expression qui introduit exactement cette limite.']
    ),
    consequence: learnerGuide(
      'Introduire la conséquence',
      'Exemple : « Il pleut ; donc la route est glissante. » La conséquence est le résultat produit par le fait précédent.',
      ['Repère le fait de départ.', 'Demande quel résultat il entraîne.', 'Place un connecteur comme « donc » ou « par conséquent » devant ce résultat.']
    ),
    correlation: learnerGuide(
      'Compléter une expression en deux parties',
      'Exemple : « Non seulement il écoute, mais encore il répond. » Certaines expressions exigent deux marqueurs et deux constructions parallèles.',
      ['Repère le premier marqueur.', 'Retrouve le second élément attendu par cette expression.', 'Vérifie que les deux groupes ont une construction parallèle.']
    ),
    explication_confirmation: learnerGuide(
      'Confirmer ou expliquer une idée',
      'Exemple : « Il est fiable ; en effet, il tient toujours ses promesses. » La seconde phrase apporte une preuve ou une explication, pas un nouveau résultat.',
      ['Lis la première affirmation.', 'Demande si la suite la prouve ou l’explique.', 'Choisis un lien comme « en effet » plutôt qu’un lien de conséquence.']
    ),
    inclusion_exclusion: learnerGuide(
      'Inclure ou exclure un élément',
      'Exemple : « Tous viendront, y compris Léa », mais « tous viendront, sauf Léa ». Le connecteur indique si l’élément appartient à l’ensemble ou en est retiré.',
      ['Repère l’ensemble de départ.', 'Vérifie si l’élément visé est ajouté ou retiré.', 'Choisis une expression d’inclusion ou d’exclusion conforme au sens.']
    ),
    opposition: learnerGuide(
      'Mettre deux faits en contraste',
      'Exemple : « Paul préfère le thé ; Léa, en revanche, choisit le café. » L’opposition rapproche deux faits différents sans dire que l’un cause l’autre.',
      ['Repère les deux faits comparés.', 'Vérifie qu’ils se contrastent sans relation de cause.', 'Choisis un lien comme « en revanche » ou « tandis que ».']
    ),
    precision_reformulation: learnerGuide(
      'Préciser ou reformuler une idée',
      'Exemple : « Plusieurs outils sont utiles, notamment le dictionnaire. » Le connecteur rend l’idée précédente plus précise ou la dit autrement.',
      ['Repère l’idée générale.', 'Vérifie si la suite donne un détail, un exemple ou une reformulation.', 'Choisis un lien comme « notamment », « c’est-à-dire » ou « autrement dit ».']
    ),
    progression_temporelle: learnerGuide(
      'Montrer l’ordre dans le temps',
      'Exemple : « D’abord, il lit ; ensuite, il répond. » Un connecteur temporel situe les étapes dans un ordre ou une progression.',
      ['Repère les différentes étapes.', 'Classe-les dans l’ordre où elles arrivent.', 'Choisis un marqueur de temps correspondant à chaque étape.']
    ),
    relation_circonstancielle: learnerGuide(
      'Préciser le cadre d’une idée',
      'Exemple : « En ce qui concerne le budget, la décision est reportée. » La locution indique le point de vue, le domaine, la conformité ou une autre circonstance clairement donnée.',
      ['Repère le cadre précisé par la phrase.', 'Dis s’il s’agit d’un domaine, d’un point de vue, d’une conformité ou d’une autre circonstance.', 'Choisis la locution qui exprime exactement ce cadre.']
    ),
    relations_logiques_multiples: learnerGuide(
      'Vérifier plusieurs liens logiques',
      'Exemple : une phrase peut exprimer une cause et une autre une opposition. Le même connecteur ne convient donc pas automatiquement partout.',
      ['Lis une phrase à la fois.', 'Nomme le lien entre ses deux idées.', 'Choisis le connecteur adapté avant de passer à la phrase suivante.']
    ),

    // Discours indirect
    deictiques_ancres: learnerGuide(
      'Adapter « ici », « demain », « hier »',
      'Exemple : lundi, elle dit « je viendrai demain » ; raconté mercredi, cela devient « elle a dit qu’elle viendrait le lendemain ». Les repères changent avec le moment et le lieu du récit.',
      ['Repère le moment et le lieu des paroles originales.', 'Repère le nouveau moment et le nouveau lieu du récit.', 'Adapte chaque mot de temps ou de lieu à ce nouveau point de vue.']
    ),
    futur_vers_conditionnel: learnerGuide(
      'Transformer le futur dans un récit au passé',
      'Exemple : « Je viendrai » devient « il a dit qu’il viendrait ». Après un verbe introducteur au passé, le futur devient normalement un conditionnel.',
      ['Repère le verbe introducteur au passé.', 'Trouve le verbe qui était au futur dans les paroles directes.', 'Transpose ce verbe au conditionnel.']
    ),
    imperatif_vers_de_infinitif: learnerGuide(
      'Rapporter un ordre avec « de » + infinitif',
      'Exemple : « Fermez la porte ! » devient « il leur demande de fermer la porte ». Un ordre rapporté perd l’impératif et prend « de » devant l’infinitif.',
      ['Repère l’ordre dans les paroles directes.', 'Choisis un verbe comme « demander » ou « ordonner ».', 'Ajoute « de » puis l’infinitif du verbe ordonné.']
    ),
    passe_compose_vers_plus_que_parfait: learnerGuide(
      'Reculer le passé composé au plus-que-parfait',
      'Exemple : « J’ai terminé » devient « elle a dit qu’elle avait terminé ». Après un verbe introducteur au passé, l’action déjà achevée recule au plus-que-parfait.',
      ['Repère le verbe introducteur au passé.', 'Trouve le passé composé des paroles directes.', 'Transpose-le au plus-que-parfait.']
    ),
    present_vers_imparfait: learnerGuide(
      'Reculer le présent à l’imparfait',
      'Exemple : « Je suis prêt » devient « il a dit qu’il était prêt ». Quand le point de vue passe au passé, le présent devient normalement un imparfait.',
      ['Repère le verbe introducteur au passé.', 'Trouve le présent des paroles directes.', 'Mets-le à l’imparfait si la situation est vue depuis ce passé.']
    ),
    pronoms_et_possessifs: learnerGuide(
      'Adapter les personnes et les possessifs',
      'Exemple : Marie dit à Paul « je prends ton livre » ; on rapporte « Marie dit qu’elle prend son livre ». Les pronoms et possessifs dépendent de qui parle et de qui possède.',
      ['Identifie la personne qui parlait et celle à qui elle parlait.', 'Remplace « je, tu, mon, ton » selon les personnes du récit.', 'Relis pour vérifier que chaque pronom désigne clairement la bonne personne.']
    ),
    transposition_complete_discours_indirect: learnerGuide(
      'Transformer complètement des paroles rapportées',
      'Exemple : « Je finirai ici demain » peut devenir « il a dit qu’il finirait là le lendemain ». Temps, personnes et repères doivent tous suivre le nouveau point de vue.',
      ['Repère le nouveau locuteur, le moment et le lieu du récit.', 'Adapte séparément pronoms, possessifs, temps et mots comme « ici » ou « demain ».', 'Relis la phrase entière pour vérifier la cohérence de toutes les transformations.']
    ),

    // Formes de phrase
    mise_en_evidence_c_est_qui_que: learnerGuide(
      'Mettre un élément en évidence avec « c’est… qui/que »',
      'Exemple : « Paul présente le dossier à Genève » devient « C’est Paul qui présente le dossier » pour insister sur le sujet, ou « C’est à Genève que Paul présente le dossier » pour insister sur le lieu.',
      ['Retrouve la phrase neutre.', 'Repère l’élément mis en évidence et sa fonction.', 'Choisis « qui » pour le sujet et « que » pour un autre élément.']
    ),

    // Majuscules des peuples et des langues
    nom_peuple_adjectif_langue: learnerGuide(
      'Majuscule au peuple, minuscule à l’adjectif et à la langue',
      'Exemple : « une Suissesse parle français et lit un journal suisse ». Le nom d’une personne ou d’un peuple prend une majuscule ; l’adjectif et le nom de langue gardent une minuscule.',
      ['Demande si le mot nomme une personne ou s’il décrit un nom.', 'Personne ou peuple : mets une majuscule.', 'Adjectif ou langue : garde une minuscule.']
    ),

    // Homophones grammaticaux
    ce_se: learnerGuide(
      'Choisir entre « ce » et « se »',
      'Exemple : « ce livre », mais « il se lève ». « Ce » montre ou désigne ; « se » appartient à un verbe pronominal et peut devenir « me » ou « te ».',
      ['Repère le mot qui suit.', 'Essaie de changer la personne : « je me… », « tu te… ».', 'Si le changement fonctionne, écris « se » ; sinon, vérifie « ce ».']
    ),
    ces_ses_cest_sest: learnerGuide(
      'Choisir « ces », « ses », « c’est » ou « s’est »',
      'Exemple : « ces livres » montre des livres ; « ses livres » indique le possesseur ; « c’est utile » signifie « cela est utile » ; « il s’est levé » contient un verbe pronominal.',
      ['Devant un nom, oppose « ces » qui montre à « ses » qui indique la possession.', 'Devant un adjectif ou un nom isolé, teste « cela est » pour choisir « c’est ».', 'Avec un participe passé et un sujet précis, change la personne pour vérifier « s’est ».']
    ),
    davantage_davantage: learnerGuide(
      'Choisir « davantage » ou « d’avantage »',
      'Exemple : « Il travaille davantage » signifie « plus » ; « il ne tire pas d’avantage de cette situation » parle d’un bénéfice. « Davantage » est un seul mot quand il signifie « plus ».',
      ['Remplace la forme par « plus ».', 'Si la phrase garde son sens, écris « davantage ».', 'Si elle parle d’un bénéfice ou d’un intérêt, écris « d’avantage ».']
    ),
    du_du_accent: learnerGuide(
      'Choisir « du » ou « dû »',
      'Exemple : « du pain » signifie « de le pain », tandis que « le montant dû » vient du verbe « devoir ». L’accent distingue le participe passé masculin singulier du mot « du ».',
      ['Essaie de remplacer par « de la » ou « des ».', 'Si le remplacement fonctionne, écris « du » sans accent.', 'Si la forme vient de « devoir », écris « dû » au masculin singulier, puis « due, dus » ou « dues » si l’accord l’exige.']
    ),
    homophones_multiples_en_contexte: learnerGuide(
      'Vérifier plusieurs homophones dans la même phrase',
      'Exemple : « Ces élèves se sont relus » contient deux choix différents : « ces/ses » et « ce/se ». Chaque son identique demande son propre test.',
      ['Traite un seul emplacement à la fois.', 'Applique à cet emplacement un remplacement fiable.', 'Relis la phrase complète, puis passe à l’homophone suivant.']
    ),
    leur_leurs: learnerGuide(
      'Choisir « leur » ou « leurs »',
      'Exemple : « Je leur parle », mais « leurs livres ». Le pronom devant un verbe reste « leur » ; le déterminant devant un nom prend un « s » si ce nom est pluriel.',
      ['Regarde si un nom vient juste après.', 'Sans nom, teste « lui » : si cela fonctionne, écris toujours « leur ».', 'Devant un nom, accorde « leur/leurs » avec ce nom.']
    ),
    on_on_n: learnerGuide(
      'Entendre le « n’ » après « on »',
      'Exemple : « On n’entend rien », mais « on entend tout ». La liaison de « on » devant une voyelle ne remplace pas le « n’ » d’une négation.',
      ['Cherche un second mot négatif comme « pas », « plus », « jamais » ou « rien ».', 'Si ce mot est présent, ajoute « n’ » devant le verbe.', 'Relis en distinguant la négation de la simple liaison.']
    ),
    qu_en_quant_quand: learnerGuide(
      'Choisir « qu’en », « quant » ou « quand »',
      'Exemple : « Quand viendras-tu ? » parle du temps ; « quant à ce dossier » signifie « en ce qui concerne ce dossier » ; « je ne sais qu’en penser » contient « que » suivi de « en ».',
      ['Essaie « lorsque » ou « à quel moment » pour vérifier « quand ».', 'Essaie « en ce qui concerne » devant « à, au, aux » pour vérifier « quant ».', 'Vérifie si la phrase contient vraiment « que » suivi de « en » pour écrire « qu’en ».']
    ),
    la_la_l_a_l_as: learnerGuide(
      'Choisir « la », « là », « l’a » ou « l’as »',
      'Exemple : « la porte » contient un déterminant ; « pose-la là » contient un pronom puis un mot de lieu ; « il l’a fermée » et « tu l’as fermée » contiennent le verbe avoir.',
      ['Regarde si la forme accompagne ou remplace un nom féminin : choisis alors « la ».', 'Remplace par « ici » : si le lieu reste clair, écris « là ».', 'Passe le verbe à l’imparfait : « l’avait » donne « l’a » et « l’avais » donne « l’as ».']
    ),
    ca_sa: learnerGuide(
      'Choisir « ça » ou « sa »',
      'Exemple : « Ça fonctionne » peut devenir « cela fonctionne » ; dans « sa méthode fonctionne », « sa » accompagne le nom féminin « méthode » et indique un lien de possession.',
      ['Remplace la forme par « cela ».', 'Si la phrase reste correcte, écris « ça ».', 'Sinon, vérifie qu’elle accompagne un nom féminin et peut devenir « ma » ou « ta » avant d’écrire « sa ».']
    ),
    son_sont: learnerGuide(
      'Choisir « son » ou « sont »',
      'Exemple : « son dossier est complet » contient un mot qui accompagne le nom « dossier » ; « les dossiers sont complets » contient le verbe « être » conjugué au pluriel.',
      ['Remplace la forme par « étaient ».', 'Si la phrase reste correcte, écris « sont ».', 'Sinon, vérifie qu’un nom suit et remplace par « mon » ou « ton » avant d’écrire « son ».']
    ),
    on_ont: learnerGuide(
      'Choisir « on » ou « ont »',
      'Exemple : « On termine le travail » contient un pronom sujet ; « ils ont terminé le travail » contient le verbe « avoir » conjugué avec « ils ».',
      ['Remplace la forme par « avaient ».', 'Si la phrase reste correcte, écris « ont ».', 'Sinon, vérifie que le mot est le sujet et qu’il peut devenir « quelqu’un » ou parfois « nous » avant d’écrire « on ».']
    ),
    genre_des_noms: learnerGuide(
      'Reconnaître le genre d’un nom',
      'Exemple : on dit « une espèce », même dans « une espèce de problème ». Le genre appartient au nom lui-même et commande le déterminant ainsi que les accords qui dépendent de ce nom.',
      ['Repère le nom principal.', 'Teste-le avec « un » ou « une » et vérifie au dictionnaire si tu hésites.', 'Accorde ensuite les mots qui dépendent de ce nom.']
    ),
    phrase_non_verbale: learnerGuide(
      'Reconnaître une phrase sans verbe',
      'Exemple : le titre « Fermeture exceptionnelle du guichet » ne contient pas de verbe conjugué, mais il forme un message complet et correct dans ce contexte.',
      ['Vérifie si le texte est un titre, une légende ou une formule courte.', 'Demande si le message reste complet et compréhensible.', 'Ne compte pas automatiquement l’absence de verbe comme une faute.']
    ),
    determinant_contracte: learnerGuide(
      'Former « au », « aux », « du » ou « des »',
      'Exemple : on écrit « parler aux élèves », car la préposition « à » placée devant « les » forme obligatoirement « aux » ; on n’écrit pas « à les élèves ».',
      ['Repère la préposition « à » ou « de ».', 'Regarde si elle est suivie de « le » ou « les ».', 'Réunis les deux mots : « au », « aux », « du » ou « des ».']
    ),
    accord_adjectif_avec_nom: learnerGuide(
      'Accorder l’adjectif avec le bon nom',
      'Exemple : dans « des mesures simples », l’adjectif « simples » décrit le nom féminin pluriel « mesures » ; il reçoit donc les mêmes marques de genre et de nombre.',
      ['Repère l’adjectif.', 'Trouve le nom ou le pronom qu’il décrit.', 'Reporte le genre et le nombre de ce mot sur l’adjectif.']
    ),
    nombre_du_nom: learnerGuide(
      'Choisir le singulier ou le pluriel du nom',
      'Exemple : on écrit « chaque dossier », mais « plusieurs dossiers ». Le déterminant ou l’expression de quantité indique si le nom désigne une seule unité ou plusieurs.',
      ['Repère le nom et le mot qui indique sa quantité.', 'Décide si une ou plusieurs unités sont désignées.', 'Ajoute normalement la marque du pluriel, puis vérifie les exceptions.']
    ),
    pluriel_noms_en_al: learnerGuide(
      'Former le pluriel des noms en « -al »',
      'Exemple : « un journal » devient « des journaux », mais « un festival » devient « des festivals ». La règle générale donne « -aux » ; certains noms gardent « -als ».',
      ['Remets le nom au singulier.', 'S’il finit par « -al », essaie d’abord le pluriel en « -aux ».', 'Vérifie si le nom appartient aux exceptions en « -als ».']
    ),
    et_est: learnerGuide(
      'Choisir « et » ou « est »',
      'Exemple : dans « le dossier est prêt et complet », « est » devient « était », tandis que « et » relie les deux adjectifs « prêt » et « complet ».',
      ['Remplace le mot par « était ».', 'Si la phrase fonctionne, écris « est ».', 'Sinon, vérifie que le mot relie deux éléments et écris « et ».']
    ),
    ma_m_a_m_as: learnerGuide(
      'Choisir « ma », « m’a » ou « m’as »',
      'Exemple : « ma collègue m’a répondu » contient le possessif « ma » devant un nom et le verbe avoir dans « m’a » ; avec « tu », on écrit « tu m’as répondu ».',
      ['Devant un nom féminin, remplace par « ta » ou « sa » pour vérifier « ma ».', 'Avec « il » ou « elle », remplace par « m’avait » pour vérifier « m’a ».', 'Avec « tu », remplace par « m’avais » pour vérifier « m’as ».']
    ),
    dans_d_en: learnerGuide(
      'Choisir « dans » ou « d’en »',
      'Exemple : « dans deux jours » indique un délai ; dans « il promet d’en parler », « d’en » se décompose en « de » suivi du pronom « en ».',
      ['Vérifie si le mot introduit directement un lieu, un délai ou un nom.', 'Sinon, cherche si « en » reprend un complément précédé de « de ».', 'Écris « dans » dans le premier cas et « d’en » dans le second.']
    ),
    abreviation_titres_civilite: learnerGuide(
      'Abréger correctement « Monsieur » et « Madame »',
      'Exemple : on écrit « M. Dupont » avec un point, mais « Mme Dupont » sans point. Chaque titre de civilité possède une abréviation normalisée.',
      ['Identifie le titre de civilité.', 'Vérifie sa forme abrégée normalisée.', 'Écris « M. » pour Monsieur et « Mme » pour Madame.']
    ),
    abreviation_adjectifs_ordinaux: learnerGuide(
      'Abréger un adjectif ordinal',
      'Exemple : « premier » s’abrège « 1er », « première » s’abrège « 1re » et « deuxième » s’abrège « 2e ». La fin de l’abréviation dépend du rang et parfois du genre.',
      ['Retrouve l’adjectif ordinal complet et son genre.', 'Conserve le chiffre qui indique le rang.', 'Ajoute la finale normalisée « er », « re » ou « e ».']
    ),
    ecriture_heures_symbole_h: learnerGuide(
      'Écrire une heure avec le symbole « h »',
      'Exemple : dans un texte courant, on écrit « 14 h 30 ». Le symbole « h » reste en minuscule, ne prend ni point ni marque du pluriel et est séparé des nombres.',
      ['Repère le nombre qui indique l’heure.', 'Place « h » en minuscule après ce nombre.', 'Laisse une espace autour de « h » et n’ajoute ni point ni « s ».']
    ),
    virgule_enumeration_simple: learnerGuide(
      'Ponctuer une énumération simple',
      'Exemple : on écrit « du pain, du lait et des fruits ». Les virgules séparent les éléments de la liste, tandis que « et » relie normalement les deux derniers.',
      ['Repère les éléments qui ont la même fonction.', 'Sépare les premiers éléments par des virgules.', 'Relie les deux derniers par « et », normalement sans virgule.']
    ),
    regime_verbal_en: learnerGuide(
      'Employer « en » après le verbe qui l’exige',
      'Exemple : dans « cette décision consiste en trois mesures », le verbe « consister » se construit ici avec la préposition « en ». Une autre préposition rendrait la construction incorrecte.',
      ['Repère le verbe dont dépend le complément.', 'Reconstitue sa construction dans le sens de la phrase.', 'Vérifie si ce verbe demande la préposition « en ».']
    ),
    a_a: learnerGuide(
      'Choisir « a » ou « à »',
      'Exemple : dans « Léa a parlé à son collègue », le premier mot est le verbe avoir et peut devenir « avait » ; le second est une préposition et garde son accent.',
      ['Remplace la forme par « avait ».', 'Si la phrase reste correcte, écris « a » sans accent.', 'Sinon, écris la préposition « à » avec un accent.']
    ),
    ou_ou: learnerGuide(
      'Choisir « ou » ou « où »',
      'Exemple : « thé ou café » présente un choix, mais « la ville où il habite » indique un lieu. L’accent distingue ces deux fonctions.',
      ['Remplace par « ou bien ».', 'Si le sens de choix reste correct, écris « ou ».', 'Si le mot indique un lieu ou un moment, écris « où ».']
    ),
    t_euphonique_inversion: learnerGuide(
      'Écrire le « t » ajouté dans une question',
      'Exemple : on écrit « a-t-il compris ? » et « ira-t-on demain ? ». Le « t » ajouté entre le verbe et le pronom est entouré de deux traits d’union, sans apostrophe.',
      ['Repère l’inversion entre le verbe et « il », « elle » ou « on ».', 'Vérifie si un « t » est ajouté pour faciliter la prononciation.', 'Écris alors deux traits d’union, comme dans « a-t-il ».']
    ),
    quel_que_quelque: learnerGuide(
      'Choisir « quel que » ou « quelque »',
      'Exemple : « Quels que soient les résultats », mais « quelques résultats ». Devant « être », « quel que » s’écrit en deux mots et « quel » s’accorde ; devant un nom, « quelque » est en un mot et peut prendre un « s ».',
      ['Repère la construction qui suit.', 'Devant une forme de « être », écris « quel que » et accorde « quel ».', 'Sinon, vérifie si « quelque » accompagne un nom ou signifie « environ ».']
    ),
    quoique_quoi_que: learnerGuide(
      'Choisir « quoique » ou « quoi que »',
      'Exemple : « Quoique fatigué » signifie « bien que fatigué » ; « quoi que tu choisisses » signifie « quelle que soit la chose que tu choisis ». Le test du sens décide si l’on écrit un ou deux mots.',
      ['Essaie de remplacer par « bien que ».', 'Si le sens convient, écris « quoique » en un mot.', 'Sinon, si le sens est « quelle que soit la chose que », écris « quoi que ».']
    ),
    si_sy: learnerGuide(
      'Choisir « si » ou « s’y »',
      'Exemple : « Si tu viens » pose une condition ; « il s’y rend » peut se décomposer en « il se rend là-bas ». « S’y » réunit les pronoms « se » et « y ».',
      ['Demande si le mot introduit une condition ou une question rapportée.', 'Si oui, écris « si ».', 'Sinon, vérifie si tu peux séparer en « se » + « y » et écris « s’y ».']
    ),
    tout_tous_toute_toutes: learnerGuide(
      'Accorder « tout » selon son rôle',
      'Exemple : « tous les élèves », « elles sont toutes venues », mais « elles sont tout étonnées ». « Tout » s’accorde devant un nom ou quand il le remplace ; comme adverbe au sens de « complètement », il reste généralement inchangé.',
      ['Repère ce que « tout » accompagne ou remplace.', 'Devant un nom ou à la place d’un nom, accorde-le.', 'S’il signifie « complètement », laisse-le généralement inchangé et vérifie l’exception devant un adjectif féminin commençant par une consonne ou un h aspiré.']
    ),

    // Négation
    negation_complete_ne_pas: learnerGuide(
      'Construire une négation complète à l’écrit',
      'Exemple : « Nous n’avons jamais oublié ce rendez-vous. » Dans un écrit scolaire ou formel, la négation comporte « ne » ou « n’ » avant le verbe conjugué et un second terme négatif comme « pas », « plus », « jamais », « rien » ou « personne ».',
      ['Repère le verbe conjugué sur lequel porte la négation.', 'Place « ne » devant une consonne ou « n’ » devant une voyelle ou un h muet.', 'Vérifie que le second terme négatif attendu est bien présent et qu’il porte sur le même verbe.']
    ),

    // Interrogation indirecte
    ce_qui_ce_que: learnerGuide(
      'Choisir « ce qui » ou « ce que »',
      'Exemple : « Je demande ce qui manque », mais « je demande ce que tu veux ». « Ce qui » est sujet du verbe suivant ; « ce que » est COD de ce verbe.',
      ['Regarde le verbe placé après « ce qui/ce que ».', 'S’il n’a pas encore de sujet, choisis « ce qui ».', 'S’il a déjà un sujet et attend un COD, choisis « ce que ».']
    ),
    coordination_interrogative: learnerGuide(
      'Relier deux questions rapportées',
      'Exemple : « Je demande où il va et quand il reviendra. » Chaque question dépend du même verbe introducteur et garde l’ordre sujet-verbe.',
      ['Repère le verbe qui introduit les questions.', 'Sépare les deux questions reliées par « et » ou « ou ».', 'Vérifie dans chacune le mot interrogatif et l’ordre sujet-verbe.']
    ),
    ordre_declaratif: learnerGuide(
      'Garder l’ordre sujet-verbe dans une question rapportée',
      'Exemple : « Je demande où Paul va », pas « où va Paul ». Dans une interrogation indirecte, les mots suivent l’ordre normal d’une phrase déclarative.',
      ['Repère le verbe comme « demander » ou « savoir ».', 'Repère le mot interrogatif.', 'Place ensuite le sujet avant le verbe.']
    ),
    si_sans_est_ce_que: learnerGuide(
      'Rapporter une question par « si »',
      'Exemple : « Est-ce qu’il vient ? » devient « Je demande s’il vient ». Une question à laquelle on répond par oui ou non prend « si » et perd « est-ce que ».',
      ['Vérifie que la réponse attendue est oui ou non.', 'Introduis la question rapportée par « si ».', 'Supprime « est-ce que » et garde l’ordre sujet-verbe.']
    ),
    suppression_inversion: learnerGuide(
      'Supprimer l’inversion dans une question rapportée',
      'Exemple : « Quand viendra-t-il ? » devient « Je demande quand il viendra ». L’inversion et le « -t- » appartiennent à la question directe, pas à la question rapportée.',
      ['Repère la question intégrée dans une phrase.', 'Replace le sujet avant le verbe.', 'Supprime le trait d’union et le « -t- » ajouté pour l’inversion.']
    ),
    suppression_point_interrogation: learnerGuide(
      'Choisir le signe final d’une question rapportée',
      'Exemple : « Je me demande où il est. » La phrase entière affirme que l’on se pose une question ; elle se termine donc par un point ordinaire.',
      ['Identifie le type de la phrase principale.', 'Si elle est déclarative, ne te laisse pas tromper par le mot interrogatif intérieur.', 'Termine par un point ; garde « ? » seulement si la phrase entière est une question.']
    ),

    // Nombres
    cent_vingt_mille: learnerGuide(
      'Accorder « cent », « vingt » et « mille »',
      'Exemple : « deux cents », mais « deux cent trois » ; « quatre-vingts », mais « quatre-vingt-deux » ; « mille » ne prend jamais de « s ». « Cent » et « vingt » prennent « s » seulement quand ils sont multipliés et terminent le nombre.',
      ['Découpe le nombre autour de « cent », « vingt » et « mille ».', 'Pour « cent » et « vingt », vérifie qu’ils sont multipliés et qu’aucun autre nombre ne suit.', 'Ajoute alors « s » ; laisse toujours « mille » sans « s ».']
    ),
    mille_invariable: learnerGuide(
      'Écrire « mille » sans « s »',
      'Exemple : « deux mille élèves ». Le nombre « mille » ne prend jamais de « s », même lorsqu’il est multiplié.',
      ['Repère « mille » employé comme nombre.', 'Ignore la quantité placée devant.', 'Écris toujours « mille » sans « s ».']
    ),
    noms_de_nombre: learnerGuide(
      'Mettre « million », « milliard » et « millier » au pluriel',
      'Exemple : « deux millions d’habitants ». « Million », « milliard » et « millier » sont des noms communs et prennent un « s » quand ils désignent plusieurs unités.',
      ['Repère « million », « milliard » ou « millier ».', 'Vérifie si le mot désigne plusieurs unités de cette quantité.', 'Ajoute alors la marque du pluriel comme pour un nom ordinaire.']
    ),

    // Orthographe lexicale
    accentuation: learnerGuide(
      'Choisir le bon accent dans un mot',
      'Exemple : « événement » et « forêt » gardent leurs accents. L’accent fait partie de l’orthographe du mot et peut parfois distinguer deux formes.',
      ['Repère la voyelle qui pose problème.', 'Rappelle ou vérifie l’orthographe du mot entier.', 'Recopie l’accent exact, puis relis le mot dans la phrase.']
    ),
    accord_mots_particuliers: learnerGuide(
      'Accorder un mot à règle particulière',
      'Exemple : « une demi-heure », mais « deux heures et demie ». Des mots comme « demi », « même », « tel », « tout » ou certains noms de couleur changent selon leur place et leur rôle.',
      ['Repère le mot particulier.', 'Observe sa place et le mot auquel il se rapporte.', 'Applique la règle propre à ce mot, sans généraliser celle d’un adjectif ordinaire.']
    ),
    adverbes_amment_emment: learnerGuide(
      'Choisir « -amment » ou « -emment »',
      'Exemple : « constant » donne « constamment » ; « prudent » donne « prudemment ». Un adjectif en « -ant » mène à « -amment » et un adjectif en « -ent » à « -emment ».',
      ['Retrouve l’adjectif de départ.', 'Regarde s’il se termine par « -ant » ou « -ent ».', 'Écris « -amment » après « -ant » et « -emment » après « -ent ».']
    ),
    consonne_double: learnerGuide(
      'Choisir une consonne simple ou double',
      'Exemple : « adresse » prend deux « s », mais « adresse » ne prend qu’un « d ». Le son ne suffit pas : le doublement appartient à l’orthographe de chaque mot.',
      ['Repère la consonne qui te fait hésiter.', 'Rappelle ou vérifie une forme sûre du même mot.', 'Écris la consonne simple ou double attestée, sans copier le modèle d’un autre mot.']
    ),
    finale_muette_par_famille: learnerGuide(
      'Retrouver une consonne finale muette',
      'Exemple : « grand » garde un « d » que l’on entend dans « grande ». Un mot de la même famille ou une forme féminine peut révéler la consonne finale.',
      ['Repère la fin que l’on n’entend pas.', 'Cherche un mot de la même famille ou une forme où cette consonne se prononce.', 'Reporte la consonne révélée sur le mot de départ.']
    ),
    genre_change_sens: learnerGuide(
      'Comprendre un nom dont le sens change avec le genre',
      'Exemple : « un mémoire » est un travail écrit ; « la mémoire » est la capacité de se souvenir. L’article masculin ou féminin peut changer le sens du nom.',
      ['Repère l’article et le nom.', 'Compare les sens masculin et féminin possibles.', 'Choisis le genre qui correspond au sens de la phrase.']
    ),
    graphie_composee: learnerGuide(
      'Écrire un mot composé ou une locution',
      'Exemple : « portefeuille » est soudé, « compte rendu » séparé et « arc-en-ciel » relié par des traits d’union. Cette séparation fait partie de l’orthographe du mot.',
      ['Repère tous les éléments de l’expression.', 'Vérifie sa forme attestée : soudure, espace, apostrophe ou trait d’union.', 'Recopie cette forme entière sans mélanger plusieurs variantes.']
    ),
    graphie_lexicale_usage: learnerGuide(
      'Mémoriser l’orthographe propre à un mot',
      'Exemple : l’écriture de « acquérir » ne se déduit pas sûrement de sa prononciation. La forme correcte doit être mémorisée avec une phrase qui en fixe le sens.',
      ['Repère précisément le mot et son sens.', 'Vérifie sa forme dans une source fiable.', 'Mémorise le mot dans une courte phrase plutôt qu’isolément.']
    ),
    graphies_lexicales_multiples: learnerGuide(
      'Vérifier plusieurs mots différents',
      'Exemple : une question peut opposer quatre phrases contenant quatre mots sans rapport. Une erreur dans une phrase ne permet pas de décider pour les autres.',
      ['Lis une seule phrase à la fois.', 'Repère le mot dont l’écriture te fait hésiter.', 'Vérifie ce mot dans son sens précis, puis recommence avec la phrase suivante.']
    ),
    paronyme_lexical: learnerGuide(
      'Choisir entre deux mots qui se ressemblent',
      'Exemple : « une collision » est un choc, tandis qu’une « collusion » est une entente secrète. Deux mots proches par la forme peuvent avoir des sens différents.',
      ['Explique avec tes mots le sens attendu par la phrase.', 'Compare la définition des deux mots proches.', 'Garde celui dont le sens correspond exactement au contexte.']
    ),

    // Ponctuation
    apostrophe_vocative: learnerGuide(
      'Détacher le nom de la personne appelée',
      'Exemple : « Marie, viens ici » et « Viens ici, Marie ». Le nom de la personne à qui l’on parle est séparé du reste de la phrase par une virgule, ou par deux s’il est au milieu.',
      ['Repère le nom utilisé pour appeler quelqu’un.', 'Vérifie sa place au début, au milieu ou à la fin.', 'Place une virgule à chaque frontière entre ce nom et le reste de la phrase.']
    ),
    apposition: learnerGuide(
      'Encadrer une précision ajoutée à un nom',
      'Exemple : « Léa, ma voisine, arrive. » « Ma voisine » ajoute une précision que l’on peut retirer ; elle est encadrée par deux virgules.',
      ['Repère le groupe qui précise un nom.', 'Retire-le pour vérifier que la phrase reste complète.', 'S’il est détachable, ouvre et ferme ce groupe par des virgules.']
    ),
    citation_directe: learnerGuide(
      'Ponctuer des paroles citées',
      'Exemple : « Il a répondu : “Je viendrai.” » Une citation complète est annoncée par deux-points, placée entre guillemets et garde son signe final à l’intérieur.',
      ['Repère le verbe de parole et la citation complète.', 'Place les deux-points après l’annonce.', 'Encadre les paroles de guillemets et mets leur signe final avant le guillemet fermant.']
    ),
    complement_initial: learnerGuide(
      'Mettre une virgule après un complément initial',
      'Exemple : « Après plusieurs semaines de travail, le projet est prêt. » Un complément placé en tête est généralement séparé de la phrase principale par une virgule.',
      ['Repère le groupe placé avant la proposition principale.', 'Trouve l’endroit où ce groupe initial se termine.', 'Place généralement une virgule à cette frontière.']
    ),
    enumeration_deux_points: learnerGuide(
      'Introduire une liste par deux-points',
      'Exemple : « Il faut trois documents : une pièce d’identité, une photo et le formulaire. » Les deux-points viennent après une annonce complète qui prépare la liste.',
      ['Repère l’annonce de la liste.', 'Vérifie que les mots avant le signe forment une phrase complète.', 'Place les deux-points juste avant l’énumération.']
    ),
    incise_double_virgule: learnerGuide(
      'Fermer une incise avec une deuxième virgule',
      'Exemple : « Le résultat, selon le rapport, reste incertain. » Un groupe ajouté au milieu doit être ouvert et fermé par deux virgules.',
      ['Repère le segment que l’on peut retirer.', 'Place une virgule à son début.', 'Place la seconde à sa fin avant de reprendre la phrase principale.']
    ),
    interdiction_virgule_sujet_verbe: learnerGuide(
      'Ne pas séparer le sujet du verbe',
      'Exemple : « La liste des candidats retenus sera publiée », sans virgule avant « sera ». Même long, le sujet reste directement lié à son verbe.',
      ['Repère le verbe principal.', 'Pose « qui est-ce qui ? » pour trouver tout son sujet.', 'Ne mets pas de virgule entre ce sujet et le verbe.']
    ),
    interdiction_virgule_verbe_complement: learnerGuide(
      'Ne pas séparer le verbe de son complément essentiel',
      'Exemple : « Elle attend la réponse », sans virgule après « attend ». Le complément nécessaire au sens du verbe reste attaché à lui.',
      ['Repère le verbe.', 'Trouve le complément demandé par ce verbe.', 'Ne place pas de virgule entre les deux.']
    ),
    point_abreviatif_etc: learnerGuide(
      'Ponctuer correctement « etc. »',
      'Exemple : « des cahiers, des stylos, etc. » « Etc. » est précédé d’une virgule et contient déjà son point ; on n’ajoute pas de points de suspension.',
      ['Repère la fin de l’énumération.', 'Place une virgule avant « etc. ».', 'Écris un seul point après « etc » et n’ajoute pas « … ».']
    ),
    point_virgule_propositions: learnerGuide(
      'Relier deux propositions par un point-virgule',
      'Exemple : « Le délai est court ; l’équipe reste confiante. » Chaque partie pourrait former une phrase complète, mais leur sens est étroitement lié.',
      ['Sépare les deux propositions.', 'Vérifie que chacune peut être une phrase autonome.', 'Utilise le point-virgule si tu veux marquer un lien plus fort qu’avec un point.']
    ),
    ponctuation_interrogation: learnerGuide(
      'Choisir le point d’interrogation',
      'Exemple : « Où va-t-il ? », mais « Je demande où il va. » Une question directe prend « ? » ; une question intégrée dans une affirmation prend le signe de la phrase principale.',
      ['Demande si la phrase entière pose directement une question.', 'Si oui, termine par « ? ».', 'Sinon, choisis le signe correspondant à la phrase principale.']
    ),
    ponctuation_multi_regles: learnerGuide(
      'Vérifier plusieurs règles de ponctuation',
      'Exemple : une phrase peut tester une virgule d’incise et une autre un point-virgule. Chaque signe doit être jugé selon la structure de sa propre phrase.',
      ['Lis une seule phrase à la fois.', 'Repère les groupes et le lien entre eux.', 'Applique la règle du signe concerné avant de passer à la phrase suivante.']
    ),
    relative_determinative_sans_virgules: learnerGuide(
      'Pas de virgules pour une relative indispensable',
      'Exemple : « Les élèves qui ont terminé peuvent partir. » « Qui ont terminé » sélectionne seulement certains élèves ; cette information indispensable ne se détache pas.',
      ['Repère le groupe introduit par « qui », « que » ou « dont ».', 'Demande s’il sert à identifier précisément les personnes ou choses visées.', 'S’il est indispensable à ce choix, ne mets pas de virgules.']
    ),
    relative_explicative_avec_virgules: learnerGuide(
      'Deux virgules pour une précision non indispensable',
      'Exemple : « Mes élèves, qui ont tous terminé, peuvent partir. » Le groupe ajoute une précision sur des élèves déjà identifiés ; il se détache par deux virgules.',
      ['Repère le groupe introduit par « qui », « que » ou « dont ».', 'Retire-le pour vérifier que les personnes ou choses restent clairement identifiées.', 'S’il ajoute seulement une précision, encadre-le de deux virgules.']
    ),
    signes_doubles_parentheses_tirets: learnerGuide(
      'Fermer parenthèses et tirets',
      'Exemple : « Le projet (encore provisoire) sera présenté. » Un segment ouvert par une parenthèse ou un tiret doit être fermé par le signe correspondant.',
      ['Repère le signe qui ouvre le segment ajouté.', 'Trouve la fin exacte de ce segment.', 'Ajoute le signe fermant correspondant avant de reprendre la phrase.']
    ),
    virgule_coordination: learnerGuide(
      'Placer la virgule avant « mais » ou « car »',
      'Exemple : « Il voulait venir, mais il était malade. » Quand le mot de liaison relie deux propositions, la virgule se place avant lui, jamais juste après.',
      ['Repère le mot de coordination.', 'Vérifie qu’il relie deux propositions complètes.', 'Place la virgule avant le mot de liaison et non après.']
    ),

    // Prépositions imposées
    adjectif_et_preposition: learnerGuide(
      'Préposition demandée par un adjectif',
      'Exemple : on est « fier de » un résultat et « prêt à » partir. Chaque adjectif se construit avec une préposition précise.',
      ['Repère l’adjectif.', 'Rappelle l’expression complète formée avec son complément.', 'Conserve la préposition exigée par cet adjectif.']
    ),
    coordination_regimes_differents: learnerGuide(
      'Garder la préposition propre à chaque mot',
      'Exemple : « Il dépend de cette décision et participe à sa mise en œuvre. » Les deux verbes n’exigent pas la même préposition.',
      ['Sépare les deux mots coordonnés.', 'Reconstruis chacun avec son propre complément.', 'Écris devant chaque complément la préposition demandée.']
    ),
    locution_prepositive: learnerGuide(
      'Compléter une locution avec la bonne préposition',
      'Exemple : « en raison de la pluie » et « conformément à la règle ». Une locution complète contient une préposition fixe.',
      ['Repère la locution.', 'Rappelle-la entièrement avec un complément simple.', 'Écris la préposition qui appartient à cette expression.']
    ),
    regime_verbal_a: learnerGuide(
      'Verbe construit avec « à »',
      'Exemple : on « participe à un projet ». Certains verbes demandent toujours « à » devant leur complément.',
      ['Repère le verbe.', 'Teste sa construction avec un nom simple.', 'S’il se construit avec « à », garde cette préposition devant le complément.']
    ),
    regime_verbal_de: learnerGuide(
      'Verbe construit avec « de »',
      'Exemple : on « dépend de la décision ». Certains verbes demandent toujours « de » devant leur complément.',
      ['Repère le verbe.', 'Teste sa construction avec un nom simple.', 'S’il se construit avec « de », garde cette préposition devant le complément.']
    ),
    regime_verbal_direct: learnerGuide(
      'Verbe construit sans préposition',
      'Exemple : on « attend le bus », pas « attend pour le bus ». Certains verbes prennent directement leur COD sans « à » ni « de ».',
      ['Repère le verbe.', 'Pose « qui ? » ou « quoi ? » après lui.', 'Si la réponse vient directement, n’ajoute aucune préposition.']
    ),
    regimes_multiples: learnerGuide(
      'Vérifier plusieurs constructions avec préposition',
      'Exemple : une phrase peut contenir « penser à », une autre « dépendre de ». Chaque verbe ou adjectif demande sa propre vérification.',
      ['Lis une seule phrase à la fois.', 'Repère le mot qui commande le complément.', 'Reconstruis son expression complète et choisis sa préposition.']
    ),

    // Pronoms relatifs
    ou_lieu_temps_verrouille: learnerGuide(
      'Employer « où » pour un lieu ou un moment',
      'Exemple : « la ville où je vis » et « le jour où je pars ». Le pronom « où » reprend clairement un lieu ou un moment.',
      ['Repère le nom repris.', 'Demande s’il indique un lieu ou un moment.', 'Si oui et qu’aucune autre préposition n’est exigée, choisis « où ».']
    ),
    possession_dont: learnerGuide(
      'Exprimer la possession avec « dont »',
      'Exemple : « l’élève dont le dossier est complet » signifie « le dossier de l’élève ». « Dont » remplace le groupe en « de » qui complète le nom.',
      ['Sépare les deux idées.', 'Reconstruis dans la seconde « le nom de… ».', 'Si le groupe repris suit « de », remplace-le par « dont ».']
    ),
    preposition_plus_lequel: learnerGuide(
      'Employer une préposition avec « lequel »',
      'Exemple : « la table sur laquelle il écrit ». On garde la préposition demandée, puis on accorde « lequel » avec le nom repris.',
      ['Repère la préposition exigée dans la seconde partie.', 'Trouve le genre et le nombre du nom repris.', 'Choisis « lequel, laquelle, lesquels » ou « lesquelles » et fais la contraction nécessaire.']
    ),
    preposition_plus_qui_humain: learnerGuide(
      'Employer une préposition avec « qui » pour une personne',
      'Exemple : « la collègue avec qui je travaille ». Après une préposition simple, « qui » peut reprendre une personne.',
      ['Repère la personne reprise.', 'Retrouve la préposition demandée dans la seconde partie.', 'Garde cette préposition devant « qui ».']
    ),
    preposition_plus_quoi_neutre: learnerGuide(
      'Employer « ce à quoi », « ce pour quoi », « ce en quoi »',
      'Exemple : « Voilà ce à quoi je pense. » Quand « ce » reprend une idée entière, la préposition demandée se place devant « quoi ».',
      ['Repère l’idée reprise par « ce ».', 'Retrouve la préposition demandée par le verbe ou l’expression.', 'Écris « ce » + cette préposition + « quoi ».']
    ),
    redondance_relative_pronom: learnerGuide(
      'Ne pas ajouter un second pronom après le relatif',
      'Exemple : « le livre dont je parle », pas « dont j’en parle ». « Dont » remplit déjà le rôle du groupe en « de » ; « en » le répéterait inutilement.',
      ['Repère le pronom relatif.', 'Reconstruis le rôle qu’il remplit dans la seconde partie.', 'Supprime tout autre pronom qui remplirait exactement le même rôle.']
    ),
    regime_a_auquel: learnerGuide(
      'Transformer « à + lequel »',
      'Exemple : « le projet auquel je participe ». Le verbe « participer à » impose « à » ; « à + lequel » devient « auquel » ou « auxquels », mais reste séparé devant « laquelle/lesquelles ».',
      ['Retrouve la construction avec « à ».', 'Trouve le genre et le nombre du nom repris.', 'Choisis « auquel, à laquelle, auxquels » ou « auxquelles ».']
    ),
    regime_de_dont: learnerGuide(
      'Remplacer un complément en « de » par « dont »',
      'Exemple : « le sujet dont nous parlons » vient de « nous parlons de ce sujet ». « Dont » remplace le complément en « de » sans répéter cette préposition.',
      ['Reconstruis la seconde partie avec le nom répété.', 'Vérifie que le verbe ou l’expression demande « de ».', 'Remplace « de + nom » par « dont » et n’ajoute pas un autre « de ».']
    ),
    regime_direct_que: learnerGuide(
      'Employer « que » comme COD',
      'Exemple : « le livre que je lis » vient de « je lis le livre ». Le nom repris est COD direct, sans préposition : on choisit « que ».',
      ['Reconstruis la seconde partie avec le nom répété.', 'Pose « je lis quoi ? » pour vérifier le COD direct.', 'Remplace ce COD par « que ».']
    ),
    regime_sur_sur_lequel: learnerGuide(
      'Garder « sur » devant « lequel »',
      'Exemple : « la règle sur laquelle je m’appuie ». L’expression « s’appuyer sur » impose « sur », qui reste devant « lequel » accordé.',
      ['Reconstruis la seconde partie avec le nom répété.', 'Vérifie que le verbe demande « sur ».', 'Écris « sur » puis la forme de « lequel » accordée avec le nom.']
    ),
    sujet_qui: learnerGuide(
      'Employer « qui » comme sujet',
      'Exemple : « l’élève qui répond ». Le pronom relatif fait lui-même l’action du verbe suivant : on choisit « qui ».',
      ['Reconstruis la seconde partie avec le nom répété.', 'Demande qui fait l’action du verbe.', 'Si le nom repris est ce sujet, remplace-le par « qui ».']
    ),

    // Pronoms de reprise
    coi_lui_leur: learnerGuide(
      'Choisir « lui » ou « leur » pour une personne',
      'Exemple : « Je parle à Léa » devient « je lui parle » ; « je parle aux élèves » devient « je leur parle ». « Lui » reprend une personne, « leur » plusieurs.',
      ['Repère le complément de personne introduit par « à ».', 'Vérifie s’il est singulier ou pluriel.', 'Choisis « lui » au singulier et « leur » au pluriel.']
    ),
    complement_de_en: learnerGuide(
      'Remplacer un complément en « de » par « en »',
      'Exemple : « Je parle de ce projet » devient « j’en parle ». « En » reprend généralement une chose introduite par « de ».',
      ['Repère le complément introduit par « de ».', 'Vérifie qu’il désigne une chose ou une quantité.', 'Remplace le groupe entier par « en ».']
    ),
    cvd_le_la_les: learnerGuide(
      'Remplacer un COD par « le », « la » ou « les »',
      'Exemple : « Je lis la lettre » devient « je la lis ». Un COD se reprend par « le », « la » ou « les » selon son genre et son nombre.',
      ['Trouve le COD en posant « qui ? » ou « quoi ? » après le verbe.', 'Repère son genre et son nombre.', 'Choisis « le », « la » ou « les » et place-le avant le verbe.']
    ),
    lieu_ou_a_y: learnerGuide(
      'Remplacer un lieu ou un complément en « à » par « y »',
      'Exemple : « Je vais à Lausanne » devient « j’y vais » ; « je pense au projet » devient « j’y pense ». « Y » reprend souvent un lieu ou une chose introduite par « à ».',
      ['Repère le lieu ou le complément introduit par « à ».', 'Vérifie qu’il ne désigne pas une personne.', 'Remplace ce groupe par « y ».']
    ),
    locution_pronominale_figee: learnerGuide(
      'Conserver « en » ou « y » dans une expression figée',
      'Exemple : « s’en aller » et « il y a » forment des expressions complètes. Le pronom « en » ou « y » appartient à la locution et ne peut pas être supprimé librement.',
      ['Repère le verbe avec « en » ou « y ».', 'Vérifie si l’ensemble forme une expression figée.', 'Si oui, conserve tous ses éléments dans l’ordre attendu.']
    ),
    ordre_pronoms_complements: learnerGuide(
      'Placer plusieurs pronoms dans le bon ordre',
      'Exemple : « Je donne le livre à Paul » devient « je le lui donne ». Devant un verbe, les pronoms suivent un ordre fixe ; l’impératif affirmatif suit un autre ordre.',
      ['Identifie le rôle de chaque pronom.', 'Repère si le verbe est déclaratif, négatif ou à l’impératif affirmatif.', 'Place les pronoms selon l’ordre propre à cette construction.']
    ),
    pronom_possessif_accord: learnerGuide(
      'Accorder « le mien », « la vôtre », « les leurs »',
      'Exemple : « mon livre » devient « le mien » et « mes clés » devient « les miennes ». Le pronom possessif s’accorde avec l’objet possédé, pas avec son propriétaire.',
      ['Repère le nom remplacé.', 'Trouve son genre et son nombre.', 'Choisis l’article et la forme du pronom possessif correspondants.']
    ),
    pronom_reflechi_indefini_soi: learnerGuide(
      'Employer « soi » avec un sujet indéfini',
      'Exemple : « Chacun doit penser à soi. » Avec « chacun », « on », « personne » ou un sujet non précisément identifié, le pronom réfléchi tonique est « soi ».',
      ['Repère le sujet.', 'Vérifie qu’il est indéfini et ne désigne pas une personne précise.', 'Choisis « soi » après la préposition.']
    ),
    pronom_tonique_coordonne: learnerGuide(
      'Employer « moi », « toi », « lui » après « et »',
      'Exemple : « Paul et moi viendrons », pas « Paul et je ». Dans un groupe coordonné, on emploie la forme tonique du pronom.',
      ['Repère le pronom relié à un autre groupe par « et » ou « ou ».', 'Choisis sa forme tonique : moi, toi, lui, elle, nous, vous, eux ou elles.', 'Accorde ensuite le verbe avec l’ensemble du sujet.']
    ),
    pronoms_reciproques_toniques: learnerGuide(
      'Employer « l’un l’autre » avec la bonne préposition',
      'Exemple : « Ils parlent l’un à l’autre » conserve le « à » de « parler à ». La forme réciproque garde la préposition du verbe et s’accorde avec les personnes concernées.',
      ['Repère l’action que les personnes font réciproquement.', 'Retrouve la préposition demandée par le verbe.', 'Choisis « l’un l’autre » ou « les uns les autres » au genre et au nombre adaptés.']
    ),
    redondance_pronominale: learnerGuide(
      'Éviter de reprendre deux fois le même complément',
      'Exemple : « Le livre dont je parle », pas « le livre dont j’en parle ». Un pronom suffit pour remplir un rôle dans la phrase.',
      ['Repère tous les pronoms qui renvoient au même groupe.', 'Vérifie le rôle déjà rempli par le premier.', 'Supprime le second s’il répète exactement ce rôle.']
    ),
    reprise_proposition_le: learnerGuide(
      'Reprendre une idée entière par « le »',
      'Exemple : « Il viendra ; je le sais. » Quand le pronom reprend une phrase ou une idée entière, on emploie le « le » neutre.',
      ['Repère ce que le pronom doit remplacer.', 'Vérifie qu’il s’agit d’une idée complète et non d’un nom précis.', 'Choisis « le », sans accord de genre ou de nombre.']
    ),

    // Révisions mêlant plusieurs règles
    aucune_hypercorrections: learnerGuide(
      'Repérer quatre phrases toutes incorrectes',
      'Exemple : une tournure peut sembler plus soignée parce qu’elle ajoute un accord ou un mot, tout en devenant fautive. Si chaque phrase contient ce type de correction excessive, la réponse peut être « Aucune ».',
      ['Analyse chaque phrase sans supposer qu’une option chiffrée est juste.', 'Repère la règle réellement applicable, puis l’ajout ou l’accord inutile.', 'Choisis « Aucune » seulement après avoir établi une faute dans les quatre phrases.']
    ),
    phrases_eleves_heterogenes: learnerGuide(
      'Relire des phrases qui testent des règles différentes',
      'Exemple : une phrase d’élève peut contenir un accord fautif, une autre un mauvais pronom et une troisième une ponctuation correcte. Il faut isoler la difficulté décisive de chacune.',
      ['Lis une seule production à la fois.', 'Repère la zone précise qui paraît juste ou fautive.', 'Applique sa règle propre avant de comparer les quatre productions.']
    ),
    revision_homophones_et_accords: learnerGuide(
      'Vérifier séparément homophone et accord',
      'Exemple : dans « ces élèves sont arrivés », « ces/ses » se choisit par le sens et « arrivés » par l’accord. Réussir un test ne valide pas automatiquement l’autre.',
      ['Repère d’abord chaque homophone et applique son test de remplacement.', 'Trouve ensuite le mot qui commande chaque accord.', 'Valide les deux zones avant de juger la phrase.']
    ),
    revision_modes_et_temps: learnerGuide(
      'Choisir d’abord le mode, puis le temps',
      'Exemple : « Il faut qu’il soit venu avant midi » demande le subjonctif après « il faut », puis un temps qui marque une action déjà accomplie. Mode et temps répondent à deux questions différentes.',
      ['Repère l’expression qui impose indicatif, subjonctif ou conditionnel.', 'Situe ensuite l’action dans le temps par rapport au repère.', 'Conjugue avec le mode et le temps obtenus.']
    ),
    revision_participes_et_infinitifs: learnerGuide(
      'Distinguer plusieurs formes verbales',
      'Exemple : « après avoir terminé, il peut partir » contient un participe passé puis un infinitif. Chaque forme doit être identifiée avant de décider sa terminaison ou son accord.',
      ['Repère toutes les formes verbales non conjuguées.', 'Classe chacune comme infinitif, participe présent ou participe passé.', 'Applique séparément la règle de terminaison ou d’accord de chaque forme.']
    ),
    revision_ponctuation_et_syntaxe: learnerGuide(
      'Construire la phrase avant de la ponctuer',
      'Exemple : on ne place pas une virgule seulement parce qu’on entend une pause. Le signe dépend du lien entre le sujet, le verbe, les compléments et les groupes ajoutés.',
      ['Repère le sujet, le verbe et les compléments essentiels.', 'Isole les groupes ajoutés ou les propositions autonomes.', 'Place la ponctuation selon ces frontières réelles.']
    ),
    revision_regimes_et_relatives: learnerGuide(
      'Trouver la préposition avant le pronom relatif',
      'Exemple : « le projet auquel je participe » vient de « participer à ce projet ». La construction du verbe donne d’abord « à », puis le pronom relatif prend la forme compatible.',
      ['Reconstruis la seconde partie avec le nom répété.', 'Trouve la préposition demandée par le verbe, le nom ou l’adjectif.', 'Choisis le pronom relatif qui conserve cette préposition.']
    ),
    toutes_correctes_suspectes: learnerGuide(
      'Vérifier quatre phrases qui peuvent toutes être correctes',
      'Exemple : une forme rare peut sembler fautive tout en suivant une règle exacte. Si les quatre phrases résistent à leur vérification propre, la réponse peut être « Toutes ».',
      ['Analyse chaque phrase séparément.', 'Nomme la règle qui justifie précisément sa forme.', 'Choisis « Toutes » seulement après avoir validé les quatre phrases.']
    ),

    // Rattachement d’un groupe détaché
    gerondif_sujet_implicite: learnerGuide(
      'Donner le même sujet au gérondif et au verbe principal',
      'Exemple : « En arrivant, Paul a téléphoné » signifie que Paul est arrivé et a téléphoné. Le sujet non écrit du gérondif doit normalement être celui du verbe principal.',
      ['Repère le groupe formé avec « en » + forme en « -ant ».', 'Demande qui accomplit cette action.', 'Vérifie que cette même personne ou chose est le sujet du verbe principal.']
    ),
    groupe_detache_sujet_implicite: learnerGuide(
      'Rattacher le groupe initial au bon sujet',
      'Exemple : « Pour réussir, Léa travaille régulièrement. » C’est Léa qui veut réussir ; le groupe détaché doit donc décrire clairement le sujet principal.',
      ['Repère le groupe séparé au début de la phrase.', 'Demande qui est concerné par ce groupe.', 'Vérifie que cette personne ou chose est le sujet de la proposition principale.']
    ),
    participe_detache_sujet_implicite: learnerGuide(
      'Rattacher un participe détaché au bon nom',
      'Exemple : « Arrivée tôt, Léa a préparé la salle. » « Arrivée » décrit Léa, qui apparaît clairement comme sujet de la suite.',
      ['Repère le participe séparé par une virgule.', 'Demande qui accomplit ou subit l’action exprimée.', 'Vérifie que ce nom est clairement présent comme sujet ou support dans la proposition principale.']
    ),

    // Indicatif ou subjonctif
    declencheur_mode_selon_sens: learnerGuide(
      'Choisir le mode d’après la construction et le sens',
      'Exemple : « le rapport établit que les résultats ont progressé », mais « le comité recommande que le projet soit poursuivi ». La première construction présente un constat ; la seconde introduit une recommandation. Le mode dépend donc de la construction précise et du sens qu’elle prend ici.',
      ['Repère les mots qui introduisent la proposition.', 'Vérifie s’ils présentent le fait comme constaté ou s’ils imposent un autre mode, par exemple pour une recommandation.', 'Choisis le mode exigé dans cette construction, puis vérifie le temps et la personne du verbe.']
    ),
    anteriorite_avant_que: learnerGuide(
      'Employer le subjonctif après « avant que »',
      'Exemple : « Pars avant qu’il ne soit trop tard. » L’action après « avant que » n’est pas encore réalisée au moment de l’action principale ; elle se met au subjonctif.',
      ['Repère « avant que ».', 'Vérifie que l’événement annoncé doit arriver plus tard.', 'Conjugue le verbe qui suit au subjonctif.']
    ),
    apres_que_indicatif: learnerGuide(
      'Employer l’indicatif après « après que »',
      'Exemple : « Il est parti après qu’il a terminé. » « Après que » présente l’action comme réalisée et demande l’indicatif, au temps adapté à l’ordre des faits.',
      ['Repère « après que ».', 'Situe l’action terminée par rapport à l’autre.', 'Conjugue-la à l’indicatif au temps qui marque cet ordre.']
    ),
    but_crainte_subjonctif: learnerGuide(
      'Subjonctif après un but ou une crainte',
      'Exemple : « Je répète afin qu’il comprenne » et « je ferme la porte de peur qu’il sorte ». Le résultat recherché ou redouté se met au subjonctif.',
      ['Repère « pour que », « afin que », « de peur que » ou une expression voisine.', 'Vérifie qu’elle introduit un but ou une crainte.', 'Conjugue le verbe qui suit au subjonctif.']
    ),
    certitude_indicatif: learnerGuide(
      'Indicatif pour un fait affirmé',
      'Exemple : « Il est certain qu’elle vient. » Quand le locuteur présente le fait comme certain, probable ou constaté, il emploie l’indicatif.',
      ['Repère l’expression avant « que ».', 'Demande si elle affirme le fait comme réel ou probable.', 'Si oui, conjugue le verbe à l’indicatif.']
    ),
    concession_bien_que: learnerGuide(
      'Subjonctif après « bien que »',
      'Exemple : « Bien qu’il soit tard, nous continuons. » « Bien que » introduit un obstacle qui n’empêche pas le résultat et demande le subjonctif.',
      ['Repère « bien que ».', 'Vérifie le contraste entre l’obstacle et le résultat.', 'Conjugue le verbe après « bien que » au subjonctif.']
    ),
    concession_et_constat: learnerGuide(
      'Distinguer concession et fait constaté',
      'Exemple : « Bien qu’il pleuve » concède un obstacle ; « je constate qu’il pleut » affirme un fait. La première construction demande le subjonctif, la seconde l’indicatif.',
      ['Repère l’expression qui introduit la proposition.', 'Demande si elle concède un obstacle ou affirme un constat.', 'Choisis le mode exigé par cette valeur et cette expression.']
    ),
    concession_subjonctif: learnerGuide(
      'Subjonctif après une expression de concession',
      'Exemple : « Quoiqu’il soit fatigué, il continue. » « Bien que », « quoique » et « sans que » présentent un fait admis ou écarté et demandent le subjonctif.',
      ['Repère l’expression de concession.', 'Vérifie qu’un fait est admis malgré le résultat.', 'Conjugue le verbe qui suit au subjonctif.']
    ),
    double_contraste_modes: learnerGuide(
      'Comparer deux expressions qui commandent des modes différents',
      'Exemple : « Je sais qu’il vient, mais je doute qu’il reste. » « Savoir » affirme un fait ; « douter » le présente comme incertain.',
      ['Sépare les deux propositions introduites par « que ».', 'Analyse dans chacune l’expression qui précède et le sens donné au fait.', 'Choisis indépendamment l’indicatif ou le subjonctif pour chaque verbe.']
    ),
    doute_possibilite: learnerGuide(
      'Subjonctif pour le doute ou la possibilité',
      'Exemple : « Je doute qu’il vienne. » Quand un fait est présenté comme douteux, possible ou peu probable, le subjonctif marque qu’il n’est pas affirmé.',
      ['Repère l’expression de doute ou de possibilité.', 'Vérifie que le fait n’est pas présenté comme certain.', 'Conjugue le verbe après « que » au subjonctif.']
    ),
    hypothese_condition_subjonctif: learnerGuide(
      'Subjonctif après certaines conditions',
      'Exemple : « Je viendrai à condition que tu sois là. » « À condition que », « à moins que » et « à supposer que » introduisent une condition envisagée et demandent le subjonctif.',
      ['Repère la locution de condition.', 'Vérifie qu’elle est suivie de « que ».', 'Conjugue le verbe de cette condition au subjonctif.']
    ),
    locution_subjonctive_figee: learnerGuide(
      'Reconnaître une locution figée au subjonctif',
      'Exemple : « que je sache » et « quoi qu’il en soit » gardent une forme fixée par l’usage. Le subjonctif fait partie de ces expressions.',
      ['Repère la locution complète.', 'Vérifie qu’elle correspond à une expression figée connue.', 'Conserve sa forme au subjonctif sans la reconstruire mot par mot.']
    ),
    obligation_necessite: learnerGuide(
      'Subjonctif après une obligation ou une nécessité',
      'Exemple : « Il faut que tu viennes. » Une obligation, une nécessité ou un jugement d’importance suivi de « que » demande normalement le subjonctif.',
      ['Repère l’expression d’obligation ou de nécessité.', 'Trouve la proposition introduite par « que ».', 'Conjugue son verbe au subjonctif.']
    ),
    si_coordonne_que_subjonctif: learnerGuide(
      'Après « si… et que… »',
      'Exemple : « Si tu viens et que tu veuilles rester, préviens-nous. » Quand « que » reprend une condition déjà introduite par « si », le verbe coordonné se met au subjonctif.',
      ['Repère la première condition introduite par « si ».', 'Vérifie que « et que » ajoute une seconde condition sans répéter « si ».', 'Conjugue le verbe après « et que » au subjonctif.']
    ),
    souhait_volonte: learnerGuide(
      'Subjonctif après un souhait ou une volonté',
      'Exemple : « Je veux que tu viennes. » Après un verbe de souhait, de volonté ou d’ordre, la proposition introduite par « que » se met au subjonctif.',
      ['Repère le verbe de souhait, de volonté ou d’ordre.', 'Trouve l’action voulue après « que ».', 'Conjugue cette action au subjonctif.']
    ),

    // Vocabulaire en contexte
    polysemie_contextuelle: learnerGuide(
      'Choisir le bon sens d’un mot',
      'Exemple : « une feuille » peut appartenir à un arbre ou être une page. Les autres mots de la phrase indiquent le sens qui convient.',
      ['Relève les indices de sens autour du mot.', 'Essaie chaque définition possible dans la phrase.', 'Garde celle qui rend l’ensemble cohérent.']
    ),
    synonyme_exact: learnerGuide(
      'Choisir un synonyme exact dans la phrase',
      'Exemple : deux mots proches ne sont pas toujours interchangeables dans tous les contextes. Le bon synonyme garde le sens, le niveau de langue et la construction de la phrase.',
      ['Explique le mot source dans cette phrase précise.', 'Remplace-le mentalement par chaque proposition.', 'Garde seulement le mot qui préserve le sens et une construction naturelle.']
    ),
  };

  const TOKEN_LABELS = {
    a: 'à',
    apres: 'après',
    anteriorite: 'antériorité',
    etre: 'être',
    cvd: 'COD',
    coi: 'COI',
    cod: 'COD',
    passe: 'passé',
    preposition: 'préposition',
    present: 'présent',
    pronominal: 'pronominal',
    reciproque: 'réciproque',
    reflechi: 'réfléchi',
    regie: 'régie',
    sujet: 'sujet',
  };

  function humanizeMechanismId(mechanismId) {
    return String(mechanismId || '')
      .split('_')
      .map((token) => TOKEN_LABELS[token] || token)
      .join(' ');
  }

  function humanizeDetailId(detailId) {
    if (!detailId) return null;
    if (detailId === 'core') return 'Règle générale';
    return String(detailId)
      .split('_')
      .map((token) => TOKEN_LABELS[token] || token)
      .join(' ');
  }

  // Organisation pédagogique de la famille « Accord du participe passé » sur
  // l’écran d’accueil. Les identifiants restent ceux de la taxonomie canonique :
  // l’interface n’invente donc aucune seconde classification. Un mécanisme sans
  // question active est masqué automatiquement et apparaîtra dès qu’un lot
  // publié l’emploiera.
  const PARTICIPLE_MENU_GROUPS = [
    {
      id: 'regles_generales',
      label: 'Règles générales',
      cases: [
        'etre_accord_sujet/core',
        'avoir_cvd_apres/core',
        'avoir_cvd_apres/cod_apres',
        'avoir_cvd_apres/sans_cod',
        'avoir_cvd_avant/core',
        'participe_sans_auxiliaire/core',
        'avoir_pronom_l/neutre',
        'avoir_pronom_l/nominal',
      ],
    },
    {
      id: 'avec_infinitif',
      label: 'Participe passé suivi d’un infinitif',
      cases: [
        'participe_suivi_infinitif/core',
        'fait_suivi_infinitif/core',
        'infinitif_sous_entendu_invariable/core',
      ],
    },
    {
      id: 'verbes_pronominaux',
      label: 'Verbes pronominaux',
      cases: [
        'pronominal_cvd_avant/core',
        'pronominal_se_coi/core',
        'pronominal_se_coi/sans_cod',
        'pronominal_se_coi/cod_apres',
        'pronominal_se_coi/cod_avant',
        'pronominal_se_coi/contraste_place_cod',
        'pronominal_se_coi/rendre_compte',
        'pronominal_accord_sujet/core',
        'pronominal_accord_sujet/essentiellement',
        'pronominal_accord_sujet/sens_passif',
        'pronominal_accord_sujet/autonome',
      ],
    },
    {
      id: 'cas_particuliers',
      label: 'Cas particuliers et formes invariables',
      cases: [
        'avoir_en_invariable/core',
        'mesure_duree_prix/core',
        'impersonnel_participe_invariable/core',
        'participe_adjectival_selon_position/core',
        'participe_adjectival_selon_position/avant_stable',
        'participe_adjectival_selon_position/apres_stable',
      ],
    },
    {
      id: 'syntheses',
      label: 'Révisions combinées',
      cases: [
        'matrice_avoir_etre/core',
        'matrice_participes_speciaux/core',
      ],
    },
  ];

  const NON_DISCRIMINANT_PARTICIPLE_CASES = new Set([
    'laisse_suivi_infinitif/core',
    'participe_adjectival_selon_position/zone_facultative',
    'participe_attribut_cod/core',
    'participe_attribut_cod/avoir',
    'participe_attribut_cod/pronominal',
    'participe_attribut_cod/infinitif_complement',
    'participe_attribut_cod/contraste',
  ]);

  // Chaque entrée associe un identifiant canonique de la banque à un libellé
  // pédagogique stable et à la règle minimale nécessaire pour raisonner.
  const MECHANISMS = {
    donneur_eloigne: ['nom donneur éloigné de l’adjectif', 'Retrouve le nom que l’adjectif décrit, même s’ils sont séparés, puis accorde en genre et en nombre.'],
    avoir_cvd_apres: ['avoir + COD placé après', 'Avec avoir, si le COD vient après le participe, le participe reste invariable.', ['forme composée', 'auxiliaire avoir', 'COD après', 'participe invariable']],
    avoir_cvd_avant: ['avoir + COD placé avant', 'Avec avoir, trouve le COD : s’il est placé avant le participe, accorde le participe avec lui.', ['forme composée', 'auxiliaire avoir', 'COD avant', 'accord avec le COD']],
    etre_accord_sujet: ['être : accord avec le sujet', 'Avec être, le participe s’accorde avec le sujet en genre et en nombre.', ['forme composée', 'auxiliaire être', 'accord avec le sujet']],
    fait_suivi_infinitif: ['fait + infinitif', 'Dans fait suivi d’un infinitif, fait reste toujours invariable.', ['participe passé', 'fait + infinitif', 'fait invariable']],
    matrice_avoir_etre: ['choisir la règle de avoir ou de être', 'Identifie d’abord l’auxiliaire, puis applique la règle propre à avoir ou à être.', ['forme composée', 'identifier avoir ou être', 'appliquer la règle de l’auxiliaire']],
    pronominal_cvd_avant: ['verbe pronominal : se COD placé avant', 'Demande qui ou quoi subit l’action : si se est COD placé avant, le participe s’accorde avec ce COD.', ['verbe pronominal', 'fonction de se', 'se COD avant', 'accord avec le COD']],
    pronominal_se_coi: ['verbe pronominal : se COI', 'Cherche la fonction de se : s’il signifie à l’un l’autre et est COI, il ne commande pas l’accord.', ['verbe pronominal', 'fonction de se', 'se COI', 'chercher un autre COD']],
    // Identifiants prêts pour les futures métadonnées de la banque. Leur présence
    // ici ne classe aucune question tant qu'un q.hep.mechanism_id ne les emploie pas.
    participe_suivi_infinitif: ['participe passé suivi d’un infinitif', 'Repère si le COD placé avant accomplit lui-même l’action de l’infinitif avant de décider l’accord.', ['participe passé', 'COD placé avant', 'infinitif après', 'identifier l’auteur de l’infinitif']],
    laisse_suivi_infinitif: ['laissé + infinitif', 'Dans la norme rectifiée actuelle, laissé suivi immédiatement d’un infinitif reste invariable.', ['participe passé', 'laissé + infinitif', 'laissé invariable']],
    pronominal_accord_sujet: ['pronominal : accord avec le sujet', 'Dans un emploi essentiellement pronominal, autonome ou de sens passif, le participe s’accorde avec le sujet.', ['verbe pronominal', 'emploi à identifier', 'sujet donneur', 'accord avec le sujet']],
    participe_sans_auxiliaire: ['participe passé sans auxiliaire', 'Employé sans auxiliaire, le participe fonctionne comme un adjectif et s’accorde avec le nom ou le pronom qu’il qualifie.', ['participe sans auxiliaire', 'donneur à identifier', 'accord avec le donneur']],
    avoir_pronom_l: ['avoir avec le pronom l’', 'Détermine si « l’ » reprend une idée entière, qui laisse le participe au masculin singulier, ou un nom qui commande l’accord.', ['auxiliaire avoir', 'référent de l’', 'idée neutre ou nom', 'invariabilité ou accord']],
    participe_attribut_cod: ['participe suivi d’un attribut du COD', 'L’accord peut varier selon l’analyse et l’usage ; ce cas exige une validation normative indépendante.', ['participe passé', 'COD et attribut', 'analyse normative', 'variante à établir']],
    deux_sujets_deux_verbes: ['deux sujets reliés à deux verbes', 'Associe chaque verbe à son propre sujet avant de choisir sa personne et son nombre.'],
    noyau_singulier_complement_pluriel: ['sujet singulier avec complément pluriel', 'Le verbe s’accorde avec le noyau du sujet, pas avec le nom pluriel placé dans son complément.'],
    relative_qui_antecedent: ['qui sujet : accord avec l’antécédent', 'Dans la relative, qui est sujet ; le verbe prend la personne et le nombre de son antécédent.'],
    relative_qui_antecedent_personne: ['qui sujet : personne de l’antécédent', 'Remplace qui par son antécédent : je impose la 1re personne, tu la 2e, etc.'],
    sujet_inverse: ['sujet placé après le verbe', 'Même placé après le verbe, le sujet reste le donneur de personne et de nombre.'],
    accord_adjectif_invariabilite_participe: ['adjectif verbal accordé ou participe présent invariable', 'Vérifie si la forme décrit un nom ou exprime une action : adjectif, elle s’accorde ; participe présent, elle reste invariable.'],
    convaincant_convainquant: ['convaincant / convainquant', 'Écris convaincant pour l’adjectif ; convainquant avec qu pour le participe présent du verbe convaincre.'],
    fatigant_fatiguant: ['fatigant / fatiguant', 'Écris fatigant sans u pour l’adjectif ; fatiguant avec u pour le participe présent du verbe fatiguer.'],
    participe_present_avec_complement: ['participe présent avec complément', 'Une forme qui garde un complément de verbe exprime une action : c’est un participe présent, donc elle est invariable.'],
    anteriorite_plus_que_parfait: ['antériorité au plus-que-parfait', 'Pour une action achevée avant une autre action passée, emploie le plus-que-parfait.'],
    futur_dans_le_passe: ['futur vu depuis le passé', 'Quand le point de départ est au passé, le futur devient généralement un conditionnel présent.'],
    hypothese_si_imparfait_conditionnel: ['si + imparfait, conditionnel', 'Dans une hypothèse présente irréelle : si + imparfait dans la condition, conditionnel présent dans le résultat.'],
    reperage_temporel: ['repérage de l’ordre des actions', 'Place les actions sur une ligne du temps, puis choisis le temps qui marque avant, pendant ou après.'],
    conditionnel: ['formation et emploi du conditionnel', 'Forme le conditionnel avec le radical du futur et les terminaisons de l’imparfait.'],
    futur_irregulier: ['radical irrégulier du futur', 'Repère le verbe, utilise son radical particulier du futur, puis ajoute la terminaison correcte.'],
    imperatif_et_pronoms: ['impératif avec pronoms', 'À l’impératif affirmatif, place les pronoms après le verbe avec des traits d’union ; à la forme négative, replace-les avant.'],
    alternative_correlation: ['corrélation d’alternative', 'Vérifie que les deux éléments corrélatifs présentent bien deux possibilités construites de la même manière.'],
    concession: ['relation de concession', 'Choisis un connecteur qui signifie “malgré cela”, puis vérifie le mode qu’il impose.'],
    consequence: ['relation de conséquence', 'Choisis un connecteur qui introduit le résultat de ce qui précède, sans le confondre avec la cause.'],
    correlation: ['deux éléments corrélatifs', 'Une locution corrélative fonctionne par paire : vérifie la présence et le parallélisme des deux éléments.'],
    opposition: ['relation d’opposition', 'Choisis un connecteur qui met deux faits en contraste, sans exprimer une cause ou une conséquence.'],
    deictiques_ancres: ['repères de temps et de lieu au discours indirect', 'Recalcule les mots comme ici, demain ou hier depuis le nouveau point de vue du narrateur.'],
    futur_vers_conditionnel: ['futur transformé en conditionnel', 'Après un verbe introducteur au passé, transforme le futur du discours direct en conditionnel.'],
    imperatif_vers_de_infinitif: ['impératif transformé en de + infinitif', 'Pour rapporter un ordre, emploie demander/ordonner de suivi de l’infinitif.'],
    mise_en_evidence_c_est_qui_que: ['phrase emphatique : mise en évidence avec c’est… que', 'Dans une phrase emphatique, choisis qui pour mettre le sujet en évidence et que pour mettre en évidence un autre élément.'],
    nom_peuple_adjectif_langue: ['nom de peuple, adjectif ou langue', 'Mets une majuscule au nom d’un peuple ; garde la minuscule pour l’adjectif et pour le nom de la langue.'],
    leur_leurs: ['leur déterminant ou leur pronom', 'Devant un nom, leur est un déterminant et peut devenir leurs ; devant un verbe ou sans nom, le pronom leur reste invariable.'],
    quel_que_quelque: ['quel que / quelque', 'Écris quel que en deux mots devant être et accorde quel ; ailleurs, vérifie si quelque est déterminant ou adverbe.'],
    ce_qui_ce_que: ['ce qui sujet / ce que complément', 'Dans la proposition qui suit, choisis ce qui si le pronom est sujet, ce que s’il est complément direct.'],
    coordination_interrogative: ['coordination de questions indirectes', 'Après le verbe introducteur, chaque élément coordonné doit garder une construction d’interrogation indirecte.'],
    cent_vingt_mille: ['accord de cent, vingt et mille', 'Cent et vingt prennent s seulement lorsqu’ils sont multipliés et terminent le nombre ; mille reste toujours invariable.'],
    mille_invariable: ['mille toujours invariable', 'Le nombre mille ne prend jamais de s, même lorsqu’il est multiplié.'],
    negation_complete_ne_pas: ['négation complète avec ne ou n’', 'Dans un écrit scolaire ou formel, place ne ou n’ avant le verbe conjugué et conserve le second terme négatif qui porte sur ce verbe.'],
    adverbes_amment_emment: ['adverbes en -amment / -emment', 'Pars de l’adjectif : -ant donne souvent -amment et -ent donne -emment, avec la même prononciation.'],
    apposition: ['apposition détachée', 'Encadre de virgules le groupe qui ajoute une précision détachable sur un nom.'],
    enumeration_deux_points: ['deux-points avant une énumération', 'Place les deux-points après une annonce complète qui introduit la liste.'],
    incise_double_virgule: ['incise encadrée par deux virgules', 'Si le segment peut être retiré sans casser la phrase, ouvre et ferme l’incise avec deux virgules.'],
    adjectif_et_preposition: ['préposition imposée par un adjectif', 'Repère l’adjectif et rappelle la préposition qu’il commande ; elle ne se choisit pas seulement au sens général.'],
    coordination_regimes_differents: ['coordination de régimes différents', 'Pour chaque terme coordonné, vérifie séparément la préposition exigée par le mot dont il dépend.'],
    regime_verbal_de: ['verbe construit avec de', 'Teste la construction du verbe avec un groupe nominal : s’il exige de, conserve de devant son complément.'],
    possession_dont: ['dont complément du nom', 'Utilise dont quand le relatif remplace un groupe introduit par de, notamment pour exprimer la possession.'],
    preposition_plus_lequel: ['préposition + lequel', 'Conserve la préposition exigée, puis accorde lequel avec son antécédent et fais les contractions nécessaires.'],
    redondance_relative_pronom: ['éviter la reprise après un relatif', 'Le pronom relatif occupe déjà une fonction dans la relative : ne la remplis pas une seconde fois avec un autre pronom.'],
    regime_a_auquel: ['construction avec à et forme de lequel', 'Avec un antécédent non humain, si la construction exige à et qu’une forme de lequel convient, choisis auquel, à laquelle, auxquels ou auxquelles.'],
    regime_de_dont: ['verbe construit avec de : dont', 'Si le mot de la relative exige de, dont reprend ce complément sans ajouter un autre de.'],
    coi_lui_leur: ['COI de personne : lui / leur', 'Demande à qui : lui reprend une personne, leur plusieurs, sans accord en genre.'],
    complement_de_en: ['complément introduit par de : en', 'Le pronom en remplace généralement un complément de chose introduit par de.'],
    reprise_proposition_le: ['reprendre une proposition par le', 'Pour reprendre une idée ou une proposition entière, emploie le pronom neutre le.'],
    revision_homophones_et_accords: ['homophones et accords combinés', 'Traite chaque zone séparément : identifie d’abord la nature du mot, puis cherche son donneur d’accord.'],
    revision_modes_et_temps: ['modes et temps combinés', 'Repère le déclencheur du mode, puis situe les actions dans le temps avant de conjuguer.'],
    revision_participes_et_infinitifs: ['participes et infinitifs combinés', 'Pour chaque forme verbale, identifie infinitif, participe présent ou participe passé avant d’appliquer sa règle.'],
    revision_ponctuation_et_syntaxe: ['ponctuation et syntaxe combinées', 'Construis d’abord les groupes de la phrase, puis place la ponctuation selon leur rôle.'],
    revision_regimes_et_relatives: ['régimes et relatifs combinés', 'Trouve la préposition exigée par le mot, puis choisis le relatif qui reprend ce régime.'],
    gerondif_sujet_implicite: ['gérondif : même sujet implicite', 'Le sujet non écrit du gérondif doit normalement être le même que le sujet du verbe principal.'],
    participe_detache_sujet_implicite: ['participe détaché : rattachement au sujet', 'Le participe détaché doit se rattacher clairement au nom ou au sujet qui accomplit ou subit l’action.'],
    apres_que_indicatif: ['après que + indicatif', 'Après que présente un fait comme réalisé : emploie l’indicatif, au temps qui respecte l’ordre des actions.'],
    concession_bien_que: ['bien que + subjonctif', 'Bien que introduit une concession et commande le subjonctif.'],
    concession_et_constat: ['concession ou constat', 'Demande si la subordonnée présente un fait constaté ou une concession, puis choisis le mode exigé par le connecteur.'],
    double_contraste_modes: ['deux déclencheurs de mode à comparer', 'Analyse chaque proposition séparément : identifie son déclencheur, puis applique indicatif ou subjonctif.'],
    polysemie_contextuelle: ['sens d’un mot selon le contexte', 'Remplace le mot par chaque sens possible et garde celui qui rend la phrase cohérente.'],
    synonyme_exact: ['synonyme exact en contexte', 'Compare le sens, le registre et la construction : un synonyme doit convenir dans cette phrase précise.'],
    si_sy: ['si ou s’y', 'Si introduit une condition ou une interrogation indirecte ; s’y réunit le pronom réfléchi se et le pronom de lieu y.'],
    qu_en_quant_quand: ['qu’en, quant ou quand', 'Quand exprime le temps ; quant s’emploie dans quant à, au ou aux ; qu’en correspond à que suivi de en.'],
    la_la_l_a_l_as: ['la, là, l’a ou l’as', 'La est déterminant ou pronom, là indique notamment un lieu, et l’a ou l’as contient le verbe avoir.'],
    ca_sa: ['ça ou sa', 'Ça est un pronom remplaçable par cela ; sa est un déterminant possessif féminin singulier.'],
    son_sont: ['son ou sont', 'Son est un déterminant possessif placé devant un nom ; sont est le verbe être au pluriel.'],
    on_ont: ['on ou ont', 'On est un pronom sujet ; ont est le verbe avoir à la troisième personne du pluriel.'],
    genre_des_noms: ['genre grammatical des noms', 'Chaque nom possède un genre grammatical, masculin ou féminin, qui commande les accords des mots qui dépendent de lui.'],
    phrase_non_verbale: ['phrase non verbale', 'Une phrase sans verbe prédicat peut former un message autonome dans un titre, une légende ou une formule courte.'],
    determinant_contracte: ['déterminants contractés au, aux, du et des', 'À et de se contractent avec le ou les pour former au, aux, du et des.'],
    accord_adjectif_avec_nom: ['accord de l’adjectif avec le nom', 'L’adjectif reçoit le genre et le nombre du nom ou du pronom auquel il se rapporte.'],
    nombre_du_nom: ['singulier ou pluriel du nom', 'Le déterminant et la quantité permettent de choisir la marque de nombre du nom.'],
    pluriel_noms_en_al: ['pluriel des noms en -al', 'La plupart des noms en -al font leur pluriel en -aux, avec quelques exceptions en -als.'],
    et_est: ['et ou est', 'Et relie des éléments ; est est le verbe être au présent et peut être remplacé par était.'],
    ma_m_a_m_as: ['ma, m’a ou m’as', 'Ma est un déterminant possessif ; m’a et m’as contiennent le pronom me suivi du verbe avoir.'],
    dans_d_en: ['dans ou d’en', 'Dans est une préposition ; d’en se décompose en de suivi du pronom en.'],
    abreviation_titres_civilite: ['abréviation des titres de civilité', 'Monsieur s’abrège M. avec un point, tandis que Madame s’abrège Mme sans point.'],
    abreviation_adjectifs_ordinaux: ['abréviation des adjectifs ordinaux', 'Les adjectifs ordinaux abrégés prennent une finale normalisée comme er, re ou e.'],
    ecriture_heures_symbole_h: ['écriture de l’heure avec h', 'Le symbole h reste en minuscule, sans point ni pluriel, et se sépare des nombres par des espaces.'],
    virgule_enumeration_simple: ['virgules dans une énumération simple', 'La virgule sépare les éléments juxtaposés et le dernier et remplace normalement la dernière virgule.'],
    regime_verbal_en: ['verbe construit avec en', 'Certains verbes imposent la préposition en devant leur complément indirect.'],
    a_a: ['a ou à', 'A sans accent est le verbe avoir ; à avec accent est une préposition.'],
    ou_ou: ['ou ou où', 'Ou sans accent exprime généralement un choix ; où avec accent indique un lieu ou un moment.'],
    t_euphonique_inversion: ['t euphonique dans l’inversion', 'Le t ajouté entre le verbe et il, elle ou on est encadré par deux traits d’union, sans apostrophe.'],
    genre_change_sens: ['genre du nom qui change le sens', 'Certains noms ont une forme identique mais un sens différent au masculin et au féminin ; l’article permet d’identifier le sens attendu.'],
  };

  // Copie générée des chemins par défaut de pedagogy_HEP.json. Les questions
  // ne stockent que le detail_id court; aucun long texte n'est dupliqué dans
  // les observations.
  const PATHS = {
    donneur_eloigne: ['adjectif qualificatif', 'nom donneur éloigné', 'genre et nombre du nom', 'accord de l’adjectif'],
    avoir_cvd_apres: ['temps composé non précisé', 'auxiliaire avoir', 'aucun COD antéposé', 'participe passé invariable'],
    avoir_cvd_avant: ['temps composé non précisé', 'auxiliaire avoir', 'COD placé avant', 'accord avec le COD'],
    etre_accord_sujet: ['temps composé non précisé', 'auxiliaire être', 'sujet donneur', 'accord avec le sujet'],
    fait_suivi_infinitif: ['participe passé', 'construction factitive', 'fait + infinitif', 'fait invariable'],
    matrice_avoir_etre: ['temps composé non précisé', 'auxiliaire à identifier dans chaque phrase', 'donneur d’accord à identifier', 'règle de l’auxiliaire'],
    pronominal_cvd_avant: ['verbe pronominal', 'fonction de se', 'se COD placé avant', 'accord avec le COD'],
    pronominal_se_coi: ['verbe pronominal', 'fonction de se', 'se COI', 'accord selon l’éventuel COD'],
    participe_suivi_infinitif: ['participe passé', 'COD placé avant', 'infinitif après', 'auteur de l’infinitif à établir', 'accord seulement si le COD agit'],
    laisse_suivi_infinitif: ['participe passé', 'laissé + infinitif', 'deux normes admises', 'cas non discriminant'],
    pronominal_accord_sujet: ['verbe pronominal', 'emploi à identifier', 'sujet donneur', 'accord avec le sujet'],
    deux_sujets_deux_verbes: ['propositions coordonnées', 'deux couples sujet-verbe', 'personne et nombre de chaque sujet', 'deux accords distincts'],
    noyau_singulier_complement_pluriel: ['sujet complexe', 'noyau singulier + complément pluriel', '3e personne du singulier', 'accord avec le noyau'],
    relative_qui_antecedent: ['proposition relative', 'qui sujet', 'antécédent donneur', 'accord en nombre avec l’antécédent'],
    relative_qui_antecedent_personne: ['proposition relative', 'qui sujet', 'personne de l’antécédent', 'terminaison à cette personne'],
    sujet_inverse: ['ordre inversé', 'sujet placé après le verbe', 'personne et nombre du sujet', 'accord du verbe'],
    accord_adjectif_invariabilite_participe: ['forme en -ant', 'nature non précisée', 'fonction à établir', 'accord ou invariabilité'],
    convaincant_convainquant: ['opposition lexicale exacte', 'adjectif convaincant', 'participe présent convainquant', 'nature dictée par la syntaxe'],
    fatigant_fatiguant: ['opposition lexicale exacte', 'adjectif fatigant', 'participe présent fatiguant', 'nature dictée par la syntaxe'],
    participe_present_avec_complement: ['forme en -ant', 'complément du verbe conservé', 'participe présent', 'forme invariable'],
    anteriorite_plus_que_parfait: ['deux actions passées', 'action antérieure', 'antériorité accomplie', 'plus-que-parfait'],
    futur_dans_le_passe: ['repère principal au passé', 'action postérieure', 'futur dans le passé', 'conditionnel présent'],
    hypothese_si_imparfait_conditionnel: ['hypothèse présente irréelle', 'si + imparfait', 'résultat envisagé', 'conditionnel présent'],
    reperage_temporel: ['repère temporel', 'relation non précisée', 'aspect non précisé', 'temps à établir'],
    conditionnel: ['conditionnel non précisé', 'régularité non précisée', 'personne non précisée', 'terminaison à établir'],
    futur_irregulier: ['futur simple', 'radical irrégulier du verbe', 'personne à relever', 'terminaison du futur'],
    imperatif_et_pronoms: ['impératif présent', 'polarité non précisée', 'ordre des pronoms à établir', 'graphie à vérifier'],
    alternative_correlation: ['relation d’alternative', 'paire corrélative', 'deux possibilités parallèles', 'connecteurs appariés'],
    concession: ['relation concessive', 'fait admis', 'résultat inattendu', 'connecteur de concession'],
    consequence: ['relation cause-résultat', 'fait source', 'résultat logique', 'connecteur de conséquence'],
    correlation: ['relation corrélative', 'premier marqueur', 'structure parallèle', 'second marqueur'],
    opposition: ['relation d’opposition', 'deux faits contrastés', 'absence de causalité', 'connecteur oppositif'],
    deictiques_ancres: ['discours indirect', 'nouvelle ancre énonciative', 'repère non précisé', 'déictique transposé'],
    futur_vers_conditionnel: ['introducteur au passé', 'futur du discours direct', 'transposition des temps', 'conditionnel au discours indirect'],
    imperatif_vers_de_infinitif: ['ordre au discours direct', 'verbe introducteur de demande', 'suppression de l’impératif', 'de + infinitif'],
    mise_en_evidence_c_est_qui_que: ['phrase neutre', 'élément mis en évidence', 'fonction sujet ou autre', 'c’est… qui ou c’est… que'],
    nom_peuple_adjectif_langue: ['gentilé', 'nature non précisée', 'fonction à établir', 'majuscule ou minuscule'],
    leur_leurs: ['opposition leur / leurs', 'nature non précisée', 'test du nom suivant', 'variation ou invariabilité'],
    quel_que_quelque: ['opposition quel que / quelque', 'construction non précisée', 'nature à établir', 'graphie et accord'],
    ce_qui_ce_que: ['antécédent neutre ce', 'fonction non précisée', 'test sujet ou COD', 'ce qui ou ce que'],
    coordination_interrogative: ['verbe interrogatif introducteur', 'deux interrogatives coordonnées', 'subordination de chaque membre', 'ordre déclaratif'],
    cent_vingt_mille: ['nombre composé', 'cent / vingt / mille', 'position et multiplication à établir', 'marque du pluriel'],
    mille_invariable: ['nombre composé', 'mille', 'multiplication éventuelle', 'mille invariable'],
    negation_complete_ne_pas: ['phrase négative à l’écrit', 'verbe conjugué', 'ne ou n’ et second terme négatif', 'négation complète'],
    adverbes_amment_emment: ['adjectif source', 'finale non précisée', 'dérivation adverbiale', '-amment ou -emment'],
    apposition: ['groupe nominal apposé', 'précision détachable', 'lien au nom support', 'virgules d’encadrement'],
    enumeration_deux_points: ['phrase d’annonce complète', 'relation d’explicitation', 'énumération annoncée', 'deux-points'],
    incise_double_virgule: ['phrase matrice', 'segment médian détachable', 'continuité sans l’incise', 'deux virgules'],
    adjectif_et_preposition: ['adjectif recteur attesté', 'complément de l’adjectif', 'régime lexical imposé', 'préposition attendue'],
    coordination_regimes_differents: ['deux mots recteurs', 'compléments coordonnés', 'deux régimes à vérifier séparément', 'préposition propre à chaque recteur'],
    regime_verbal_de: ['verbe recteur attesté', 'complément du verbe', 'régime en de', 'préposition de'],
    possession_dont: ['antécédent', 'nom régi par de', 'complément du nom possessif', 'pronom relatif dont'],
    preposition_plus_lequel: ['antécédent nominal', 'préposition régie', 'complément prépositionnel', 'préposition + lequel accordé'],
    redondance_relative_pronom: ['antécédent', 'pronom relatif déjà fonctionnel', 'fonction remplie dans la relative', 'absence de pronom redondant'],
    regime_a_auquel: ['antécédent nominal non humain', 'construction avec à', 'forme de lequel appropriée', 'auquel / à laquelle / auxquels / auxquelles'],
    regime_de_dont: ['antécédent', 'recteur construit avec de', 'complément en de', 'pronom relatif dont'],
    coi_lui_leur: ['référent humain', 'COI introduit par à', 'nombre non précisé', 'lui ou leur'],
    complement_de_en: ['référent non humain', 'complément introduit par de', 'reprise pronominale', 'pronom en'],
    reprise_proposition_le: ['proposition référente', 'contenu propositionnel', 'reprise neutre', 'pronom le'],
    revision_homophones_et_accords: ['révision multizone', 'opposition homophonique exacte', 'donneur d’accord distinct', 'deux validations indépendantes'],
    revision_modes_et_temps: ['révision multizone', 'construction déclencheuse du mode', 'relation temporelle', 'mode puis temps'],
    revision_participes_et_infinitifs: ['révision multizone', 'nature de chaque forme verbale', 'construction propre à chaque forme', 'accord ou invariabilité séparés'],
    revision_ponctuation_et_syntaxe: ['révision multizone', 'groupes syntaxiques', 'relation entre les groupes', 'ponctuation correspondante'],
    revision_regimes_et_relatives: ['révision multizone', 'mot recteur', 'régime prépositionnel', 'pronom relatif compatible'],
    gerondif_sujet_implicite: ['gérondif détaché', 'sujet implicite', 'sujet du verbe principal', 'coréférence obligatoire'],
    participe_detache_sujet_implicite: ['participe détaché', 'support implicite', 'sujet ou nom de la principale', 'rattachement syntaxique cohérent'],
    apres_que_indicatif: ['construction après que', 'fait présenté comme réalisé', 'mode indicatif', 'temps selon la relation temporelle'],
    concession_bien_que: ['construction bien que', 'valeur concessive', 'mode subjonctif', 'temps selon le repère'],
    concession_et_constat: ['construction déclencheuse', 'valeur non précisée', 'mode à établir', 'temps selon le repère'],
    double_contraste_modes: ['deux subordonnées', 'deux constructions déclencheuses', 'deux valeurs de sens', 'modes vérifiés séparément'],
    polysemie_contextuelle: ['mot polysémique exact', 'sens candidats', 'indices sémantiques du contexte', 'sens compatible'],
    synonyme_exact: ['mot source exact', 'candidats synonymiques', 'sens + registre + construction', 'synonyme compatible'],
  };

  // Chemins générés depuis les détails par défaut de
  // analyse_gpt/pedagogy_HEP.json. Le test Python impose une copie exacte afin
  // que l'application et le pipeline expliquent toujours la même règle.
  Object.assign(PATHS, {
    avoir_en_invariable: ['auxiliaire avoir', 'complément repris par en', 'absence d’accord avec en', 'participe invariable'],
    mesure_duree_prix: ['verbe de mesure', 'complément de durée, prix, poids ou distance', 'pas de COD accordable', 'participe invariable'],
    participe_adjectival_selon_position: ['forme participiale spéciale', 'position et fonction à établir', 'valeur prépositive ou adjectivale', 'invariabilité ou accord'],
    infinitif_sous_entendu_invariable: ['auxiliaire avoir', 'infinitif exprimé ou sous-entendu', 'complément rattaché à l’infinitif', 'participe invariable'],
    impersonnel_participe_invariable: ['tournure impersonnelle', 'il sans référent', 'absence de COD accordable', 'participe invariable'],
    matrice_participes_speciaux: ['révision de participes', 'plusieurs constructions attestées', 'analyse séparée de chaque phrase', 'accord ou invariabilité propre'],
    participe_sans_auxiliaire: ['participe sans auxiliaire', 'nom ou pronom support', 'genre et nombre du support', 'accord comme un adjectif'],
    avoir_pronom_l: ['auxiliaire avoir', 'pronom l’', 'antécédent à identifier', 'accord selon le référent'],
    participe_attribut_cod: ['participe avec avoir ou pronominal', 'COD placé avant', 'attribut du COD', 'cas à norme variable'],
    quantifieur_singulier: ['sujet quantifié', 'noyau singulier', 'sens parfois collectif', 'verbe au singulier'],
    quantifieur_pluriel: ['sujet quantifié', 'complément pluriel', 'accord selon la construction', 'verbe au pluriel'],
    priorite_personnes_coordonnees: ['plusieurs sujets', 'personnes différentes', 'hiérarchie 1re puis 2e puis 3e', 'accord à la personne résultante'],
    coordination_comparative_incise: ['sujet principal', 'groupe comparatif entre virgules', 'pas de coordination additive', 'accord avec le sujet principal'],
    sujet_infinitif: ['groupe infinitif', 'fonction sujet', 'noyau non nominal', 'verbe au singulier'],
    sujets_coordonnees: ['deux sujets ou plus', 'coordination additive', 'ensemble pluriel', 'verbe au pluriel'],
    pronom_sujet_renforce: ['pronom personnel sujet', 'renforcement par seul ou tous', 'personne et nombre du pronom', 'accord du verbe'],
    nom_collectif: ['nom collectif', 'noyau et complément', 'sens de l’ensemble', 'accord justifié par la construction'],
    sujet_eloigne: ['groupe sujet complexe', 'éléments intercalés', 'noyau du sujet', 'accord du verbe'],
    obligation_necessite: ['expression d’obligation ou nécessité', 'subordonnée en que', 'fait envisagé', 'mode subjonctif'],
    souhait_volonte: ['souhait, volonté ou ordre', 'subordonnée en que', 'action voulue', 'mode subjonctif'],
    doute_possibilite: ['doute ou possibilité', 'fait non affirmé', 'subordonnée en que', 'mode subjonctif'],
    certitude_indicatif: ['certitude ou constat', 'fait affirmé', 'subordonnée en que', 'mode indicatif'],
    anteriorite_avant_que: ['construction avant que', 'événement attendu', 'antériorité visée', 'mode subjonctif'],
    but_crainte_subjonctif: ['but ou crainte', 'subordonnée en que', 'résultat recherché ou redouté', 'mode subjonctif'],
    restriction_superlatif_subjonctif: ['antécédent restreint', 'unicité ou superlatif', 'référent évalué', 'mode subjonctif'],
    concession_subjonctif: ['construction concessive', 'fait admis malgré un obstacle', 'subordonnée', 'mode subjonctif'],
    declencheur_mode_selon_sens: ['construction introductrice', 'sens pris dans la phrase', 'mode régi par la construction', 'forme verbale attendue'],
    ou_lieu_temps_verrouille: ['antécédent de lieu ou temps', 'fonction circonstancielle', 'absence de régime en de ou à', 'pronom où'],
    regime_sur_sur_lequel: ['antécédent nominal', 'recteur construit avec sur', 'complément prépositionnel', 'sur lequel accordé'],
    sujet_qui: ['antécédent', 'fonction sujet dans la relative', 'aucune préposition', 'pronom qui'],
    regime_direct_que: ['antécédent', 'verbe transitif direct', 'fonction COD dans la relative', 'pronom que'],
    preposition_plus_qui_humain: ['antécédent humain', 'préposition régie', 'complément prépositionnel', 'préposition + qui'],
    groupe_detache_sujet_implicite: ['groupe détaché', 'support implicite', 'sujet de la principale', 'rattachement cohérent'],
    pronom_possessif_accord: ['nom remplacé', 'article défini', 'genre et nombre du nom', 'forme du pronom possessif'],
    pronom_reflechi_indefini_soi: ['sujet indéfini', 'reprise réfléchie', 'absence de référent précis', 'pronom soi'],
    ordre_pronoms_complements: ['deux pronoms compléments', 'fonctions COD, COI, y ou en', 'ordre syntaxique fixe', 'groupe pronominal correct'],
    locution_pronominale_figee: ['locution verbale', 'pronom en ou y lexicalisé', 'construction complète', 'forme figée'],
    lieu_ou_a_y: ['complément de lieu ou en à', 'référent non humain', 'reprise pronominale', 'pronom y'],
    cvd_le_la_les: ['complément direct', 'genre et nombre du référent', 'reprise pronominale', 'le, la ou les'],
    pronom_tonique_coordonne: ['sujet coordonné', 'pronom personnel', 'forme tonique', 'moi, toi, lui ou autre'],
    redondance_pronominale: ['complément déjà repris', 'second pronom inutile', 'fonction en double', 'suppression de la redondance'],
    relations_logiques_multiples: ['plusieurs phrases', 'relations logiques distinctes', 'analyse séparée', 'connecteur compatible dans chaque phrase'],
    cause: ['fait principal', 'raison explicative', 'orientation cause vers effet', 'connecteur causal'],
    addition: ['premier élément', 'ajout cohérent', 'même orientation argumentative', 'connecteur additif'],
    but: ['action principale', 'objectif recherché', 'relation finalisée', 'connecteur de but'],
    condition_restriction: ['énoncé principal', 'condition ou limite', 'portée restreinte', 'connecteur conditionnel'],
    progression_temporelle: ['deux étapes temporelles', 'ordre ou progression', 'repère explicite', 'connecteur temporel'],
    precision_reformulation: ['énoncé général', 'précision ou reformulation', 'contenu détaillé', 'connecteur d’explicitation'],
    explication_confirmation: ['premier constat', 'preuve ou explication', 'confirmation argumentative', 'connecteur compatible'],
    inclusion_exclusion: ['ensemble de départ', 'élément visé', 'inclusion ou exclusion', 'locution appropriée'],
    relation_circonstancielle: ['énoncé principal', 'circonstance explicitée', 'valeur de la locution', 'relation cohérente'],
    interdiction_virgule_sujet_verbe: ['groupe sujet', 'frontière sujet-verbe', 'groupe syntaxique essentiel', 'absence de virgule'],
    interdiction_virgule_verbe_complement: ['verbe recteur', 'complément essentiel', 'groupe syntaxique insécable', 'absence de virgule'],
    relative_determinative_sans_virgules: ['nom antécédent', 'relative restrictive', 'information indispensable', 'absence de virgules'],
    relative_explicative_avec_virgules: ['nom antécédent', 'relative explicative', 'information détachable', 'deux virgules'],
    point_abreviatif_etc: ['fin d’énumération', 'abréviation etc.', 'virgule avant', 'un seul point'],
    point_virgule_propositions: ['deux propositions autonomes', 'lien sémantique', 'séparation intermédiaire', 'point-virgule'],
    citation_directe: ['verbe de parole', 'deux-points d’annonce', 'guillemets', 'signe final de la citation'],
    apostrophe_vocative: ['terme d’adresse', 'fonction vocative', 'segment détaché', 'virgule ou virgules'],
    signes_doubles_parentheses_tirets: ['segment incident', 'signe ouvrant', 'signe fermant correspondant', 'ponctuation appariée'],
    ponctuation_interrogation: ['type de question', 'directe ou indirecte', 'fin de phrase', 'signe approprié'],
    virgule_coordination: ['deux propositions', 'coordonnant', 'frontière propositionnelle', 'virgule avant le lien'],
    deux_points_explication: ['proposition d’annonce', 'relation d’explication', 'développement attendu', 'deux-points'],
    complement_initial: ['complément circonstanciel', 'position initiale', 'frontière du complément', 'virgule finale'],
    ponctuation_multi_regles: ['plusieurs phrases', 'règles de ponctuation distinctes', 'analyse séparée', 'ponctuation normative'],
    si_sans_est_ce_que: ['verbe interrogatif introducteur', 'question totale', 'subordonnant si', 'absence de est-ce que'],
    suppression_point_interrogation: ['interrogation intégrée', 'phrase principale déclarative', 'fin d’assertion', 'point ordinaire'],
    suppression_inversion: ['question indirecte', 'ordre sujet-verbe', 'marque directe supprimée', 'ordre déclaratif'],
    ordre_declaratif: ['verbe introducteur', 'mot interrogatif', 'ordre sujet-verbe', 'subordonnée déclarative'],
    present_vers_imparfait: ['introducteur au passé', 'présent du discours direct', 'recul du repère', 'imparfait'],
    passe_compose_vers_plus_que_parfait: ['introducteur au passé', 'passé composé source', 'antériorité', 'plus-que-parfait'],
    pronoms_et_possessifs: ['changement d’énonciateur', 'personnes du discours', 'pronoms et possessifs', 'formes adaptées'],
    transposition_complete_discours_indirect: ['discours direct source', 'plusieurs dimensions à transposer', 'nouveau repère énonciatif', 'discours indirect cohérent'],
    regime_verbal_direct: ['verbe recteur', 'complément direct', 'absence de préposition', 'construction transitive'],
    regime_verbal_a: ['verbe recteur', 'complément indirect', 'régime lexical', 'préposition à'],
    regime_verbal_sur: ['verbe recteur', 'complément prépositionnel', 'régime lexical', 'préposition sur'],
    locution_prepositive: ['locution rectrice', 'complément', 'construction figée', 'préposition attendue'],
    imperatif_deuxieme_personne: ['mode impératif', 'deuxième personne', 'groupe du verbe', 'terminaison correcte'],
    passe_simple: ['temps passé simple', 'groupe ou radical du verbe', 'personne du sujet', 'terminaison correspondante'],
    imparfait_selon_personne: ['temps imparfait', 'radical verbal', 'personne du sujet', 'terminaison de l’imparfait'],
    subjonctif_selon_personne: ['mode subjonctif', 'radical du verbe', 'personne du sujet', 'terminaison correcte'],
    alternance_radical_conjugaison: ['verbe à alternance', 'temps et personne', 'radical adapté', 'terminaison régulière'],
    futur_simple_regulier: ['temps futur simple', 'radical de l’infinitif', 'personne du sujet', 'terminaison du futur'],
    participe_passe_irregulier: ['verbe irrégulier', 'forme du participe passé', 'genre ou nombre éventuel', 'graphie attestée'],
    infinitif_participe: ['forme verbale homophone', 'construction précédente', 'infinitif ou participe', 'terminaison correcte'],
    present_selon_personne: ['temps présent', 'verbe et radical', 'personne du sujet', 'terminaison correcte'],
    forme_irreguliere_selon_temps: ['repère temporel', 'temps verbal', 'personne du sujet', 'forme irrégulière attestée'],
    toutes_correctes_suspectes: ['quatre phrases', 'règles distinctes', 'vérifications séparées', 'toutes correctes'],
    aucune_hypercorrections: ['quatre phrases', 'hypercorrections plausibles', 'règles distinctes', 'aucune correcte'],
    phrases_eleves_heterogenes: ['quatre productions', 'mécanismes différents', 'analyse phrase par phrase', 'sélection de la phrase correcte'],
    noms_de_nombre: ['nom de quantité', 'millier, million ou milliard', 'nombre supérieur à un', 'marque du pluriel'],
    ces_ses_cest_sest: ['suite homophone', 'catégorie grammaticale', 'test de remplacement', 'graphie correcte'],
    ce_se: ['homophones ce et se', 'fonction grammaticale', 'test de personne', 'graphie correcte'],
    on_on_n: ['pronom on', 'négation', 'liaison trompeuse', 'présence de n’'],
    qu_en_quant_quand: ['homophones qu’en, quant et quand', 'fonction ou construction', 'test de remplacement', 'graphie correcte'],
    la_la_l_a_l_as: ['homophones la, là, l’a et l’as', 'catégorie grammaticale', 'test de remplacement', 'graphie correcte'],
    ca_sa: ['homophones ça et sa', 'pronom ou déterminant possessif', 'test par cela, ma ou ta', 'graphie correcte'],
    son_sont: ['homophones son et sont', 'déterminant ou verbe être', 'test par mon ou étaient', 'graphie correcte'],
    on_ont: ['homophones on et ont', 'pronom sujet ou verbe avoir', 'test par quelqu’un ou avaient', 'graphie correcte'],
    genre_des_noms: ['nom noyau', 'genre masculin ou féminin', 'vérification de l’usage', 'accords commandés par le nom'],
    phrase_non_verbale: ['phrase sans verbe prédicat', 'contexte de titre ou légende', 'message autonome', 'construction admise'],
    determinant_contracte: ['préposition à ou de', 'déterminant le ou les', 'contraction obligatoire', 'forme au, aux, du ou des'],
    accord_adjectif_avec_nom: ['adjectif', 'donneur d’accord', 'genre et nombre', 'terminaison accordée'],
    nombre_du_nom: ['nom dénombrable', 'déterminant ou quantité', 'singulier ou pluriel', 'marque du nombre'],
    pluriel_noms_en_al: ['nom en -al', 'règle en -aux', 'liste d’exceptions', 'pluriel correct'],
    et_est: ['homophones et et est', 'coordonnant ou verbe', 'test par était', 'graphie correcte'],
    ma_m_a_m_as: ['homophones ma, m’a et m’as', 'déterminant ou pronom plus avoir', 'sujet du verbe', 'graphie correcte'],
    dans_d_en: ['homophones dans et d’en', 'préposition ou de plus en', 'construction de la phrase', 'graphie correcte'],
    abreviation_titres_civilite: ['titre de civilité', 'abréviation normalisée', 'point abréviatif', 'forme M. ou Mme'],
    abreviation_adjectifs_ordinaux: ['adjectif ordinal', 'rang et genre', 'finale abréviative', 'forme normalisée'],
    ecriture_heures_symbole_h: ['heure en chiffres', 'symbole h', 'espacement', 'absence de point et de pluriel'],
    virgule_enumeration_simple: ['éléments de même fonction', 'juxtaposition', 'coordonnant final', 'virgules correctes'],
    regime_verbal_en: ['verbe', 'complément indirect', 'préposition en', 'construction imposée'],
    a_a: ['homophones a et à', 'verbe ou préposition', 'test par avait', 'graphie correcte'],
    ou_ou: ['homophones ou et où', 'choix ou lieu/temps', 'test par ou bien', 'graphie correcte'],
    t_euphonique_inversion: ['inversion verbe-pronom', 't euphonique', 'deux traits d’union', 'absence d’apostrophe'],
    du_du_accent: ['homophones du et dû', 'catégorie grammaticale', 'test de remplacement ou accord', 'accent correct'],
    tout_tous_toute_toutes: ['formes de tout', 'catégorie grammaticale', 'donneur éventuel', 'accord ou invariabilité'],
    quoique_quoi_que: ['locutions homophones', 'sens concessif ou indéfini', 'test de remplacement', 'un ou deux mots'],
    davantage_davantage: ['homophones', 'adverbe ou groupe nominal', 'test par plus ou bénéfice', 'graphie correcte'],
    homophones_multiples_en_contexte: ['suite homophonique', 'fonction grammaticale', 'test de remplacement', 'forme compatible'],
    si_sy: ['si / s’y', 'fonction grammaticale', 'test de décomposition', 'forme compatible'],
    graphie_composee: ['mot composé ou locution', 'frontières des éléments', 'soudure, espace ou trait d’union', 'graphie attestée'],
    accentuation: ['mot lexical', 'voyelle accentuée', 'accent attesté', 'graphie correcte'],
    consonne_double: ['mot lexical', 'position de la consonne', 'simple ou double', 'graphie attestée'],
    paronyme_lexical: ['deux mots proches', 'définitions distinctes', 'indices du contexte', 'lexème approprié'],
    finale_muette_par_famille: ['mot à finale peu audible', 'mot de la même famille', 'consonne révélée', 'graphie correcte'],
    graphie_lexicale_usage: ['mot lexical', 'absence de règle productive sûre', 'graphie attestée', 'mémorisation en contexte'],
    genre_change_sens: ['nom à deux genres', 'article masculin ou féminin', 'sens lié au genre', 'forme compatible'],
    hypothese_si_plus_que_parfait_conditionnel_passe: ['hypothèse passée irréelle', 'si + plus-que-parfait', 'conséquence non réalisée', 'conditionnel passé'],
    au_cas_ou_conditionnel: ['locution au cas où', 'éventualité', 'mode conditionnel', 'temps selon le repère'],
    hypothese_condition_subjonctif: ['locution hypothétique ou conditionnelle', 'fait envisagé', 'subordonnée en que', 'mode subjonctif'],
    locution_subjonctive_figee: ['locution figée', 'valeur non assertive', 'forme verbale stabilisée', 'subjonctif'],
    si_coordonne_que_subjonctif: ['première condition en si', 'coordination par et que', 'reprise de la condition', 'subjonctif'],
    dont_partitif: ['ensemble antécédent', 'sous-ensemble', 'valeur partitive', 'pronom dont'],
    preposition_plus_quoi_neutre: ['antécédent neutre ce', 'préposition régie', 'complément prépositionnel', 'préposition + quoi'],
    pronoms_reciproques_toniques: ['relation réciproque', 'préposition du verbe', 'genre et nombre des personnes', 'forme l’un l’autre'],
    pronom_tonique_apres_preposition: ['préposition exprimée', 'référent humain', 'forme tonique', 'lui, elle, eux ou elles'],
    accord_mots_particuliers: ['mot à comportement particulier', 'position ou fonction', 'donneur éventuel', 'accord ou invariabilité'],
    graphies_lexicales_multiples: ['plusieurs phrases', 'lexèmes distincts', 'vérification séparée', 'graphies attestées'],
    regimes_multiples: ['plusieurs phrases', 'recteurs distincts', 'régimes séparés', 'prépositions propres'],
  });

  const DETAIL_PATHS = {
    avoir_cvd_apres: {
      cod_apres: ['temps composé non précisé', 'auxiliaire avoir', 'COD placé après', 'participe passé invariable'],
      sans_cod: ['temps composé non précisé', 'auxiliaire avoir', 'aucun COD', 'participe passé invariable'],
    },
    pronominal_se_coi: {
      sans_cod: ['verbe pronominal', 'construction indirecte ou sans COD', 'aucun COD accordable', 'participe invariable'],
      cod_apres: ['verbe pronominal', 'se COI', 'COD placé après', 'participe invariable'],
      cod_avant: ['verbe pronominal', 'se COI', 'autre COD placé avant', 'accord avec cet autre COD'],
      contraste_place_cod: ['verbe pronominal', 'se COI', 'COD à chercher avant ou après', 'accord selon la place du COD'],
      rendre_compte: ['verbe pronominal', 'locution se rendre compte', 'compte COD placé après', 'rendu invariable'],
    },
    pronominal_accord_sujet: {
      essentiellement: ['verbe essentiellement pronominal', 'se sans fonction COD ou COI', 'sujet donneur', 'accord avec le sujet'],
      sens_passif: ['verbe pronominal', 'sujet qui subit l’action', 'sens passif', 'accord avec le sujet'],
      autonome: ['verbe pronominal autonome', 'se sans fonction COD ou COI', 'sujet donneur', 'accord avec le sujet'],
    },
    participe_adjectival_selon_position: {
      avant_stable: ['forme participiale spéciale', 'placée avant le nom sans déterminant introducteur', 'valeur prépositive stable', 'forme invariable'],
      apres_stable: ['forme participiale spéciale', 'placée après le nom', 'valeur adjectivale stable', 'accord avec le nom'],
      zone_facultative: ['ci-joint, ci-inclus ou ci-annexé', 'placé avant un groupe nominal déterminé', 'deux analyses admises', 'cas non discriminant'],
    },
    avoir_pronom_l: {
      neutre: ['auxiliaire avoir', 'l’ reprend une proposition ou une idée', 'reprise neutre', 'participe au masculin singulier'],
      nominal: ['auxiliaire avoir', 'l’ reprend un nom', 'genre et nombre du nom', 'accord avec le nom'],
    },
    participe_attribut_cod: {
      avoir: ['auxiliaire avoir', 'COD placé avant', 'attribut du COD', 'accord ou invariabilité admis selon le verbe'],
      pronominal: ['verbe pronominal', 'se COD placé avant', 'attribut du COD', 'accord à soumettre à revue normative'],
      infinitif_complement: ['auxiliaire avoir', 'attribut lié à un infinitif', 'analyse de la construction', 'invariabilité possible'],
      contraste: ['participe suivi d’un attribut', 'deux constructions à comparer', 'analyse propre à chaque segment', 'cas à soumettre à revue normative'],
    },
    accord_adjectif_invariabilite_participe: {
      adjectif: ['forme en -ant', 'propriété d’un nom', 'adjectif verbal', 'accord avec le nom'],
      participe: ['forme en -ant', 'action verbale', 'participe présent', 'forme invariable'],
    },
    reperage_temporel: {
      anterieur: ['repère temporel', 'action antérieure', 'accomplissement à vérifier', 'temps d’antériorité'],
      simultane: ['repère temporel', 'action simultanée', 'aspect à vérifier', 'temps de simultanéité'],
      posterieur: ['repère temporel', 'action postérieure', 'point de vue du repère', 'temps de postériorité'],
    },
    conditionnel: {
      present_regulier: ['conditionnel présent', 'radical régulier du futur', 'personne à relever', 'terminaison de l’imparfait'],
      present_irregulier: ['conditionnel présent', 'radical irrégulier du futur', 'personne à relever', 'terminaison de l’imparfait'],
      passe: ['conditionnel passé', 'auxiliaire au conditionnel présent', 'personne à relever', 'participe passé et accord éventuel'],
    },
    imperatif_et_pronoms: {
      affirmatif: ['impératif affirmatif', 'pronoms postposés', 'ordre impératif', 'traits d’union'],
      negatif: ['impératif négatif', 'pronoms antéposés', 'ordre déclaratif des pronoms', 'ne…pas autour du groupe verbal'],
    },
    deictiques_ancres: {
      temps: ['discours indirect', 'nouvelle date de narration', 'repère temporel direct', 'repère temporel transposé'],
      lieu: ['discours indirect', 'nouveau lieu de narration', 'repère spatial direct', 'repère spatial transposé'],
    },
    nom_peuple_adjectif_langue: {
      contraste_mixte: ['plusieurs gentilés', 'nom de personne ou de peuple', 'nom de langue et adjectif', 'fonctions contrastées dans la même question'],
      peuple: ['gentilé', 'nom de personne ou de peuple', 'emploi nominal', 'majuscule'],
      adjectif: ['gentilé', 'adjectif relationnel', 'emploi adjectival', 'minuscule'],
      langue: ['gentilé', 'nom de langue', 'désignation linguistique', 'minuscule'],
    },
    leur_leurs: {
      determinant: ['opposition leur / leurs', 'déterminant devant un nom', 'nombre du nom', 'leur ou leurs'],
      pronom: ['opposition leur / leurs', 'pronom personnel COI', 'remplacement par lui', 'leur invariable'],
    },
    quel_que_quelque: {
      quel_que: ['opposition quel que / quelque', 'quel que + être', 'accord de quel avec le sujet', 'graphie en deux mots'],
      determinant: ['opposition quel que / quelque', 'quelque devant un nom', 'déterminant indéfini', 'accord en nombre'],
      adverbe: ['opposition quel que / quelque', 'quelque devant adjectif ou nombre', 'adverbe', 'forme invariable'],
    },
    ce_qui_ce_que: {
      sujet: ['antécédent neutre ce', 'aucune préposition', 'sujet du verbe suivant', 'ce qui'],
      cod: ['antécédent neutre ce', 'aucune préposition', 'COD du verbe suivant', 'ce que'],
    },
    cent_vingt_mille: {
      cent: ['nombre composé', 'cent multiplié', 'position finale ou suivie', 'cents ou cent'],
      vingt: ['nombre composé', 'vingt multiplié', 'position finale ou suivie', 'vingts ou vingt'],
      mille: ['nombre composé', 'mille', 'valeur multiplicative', 'mille invariable'],
    },
    adverbes_amment_emment: {
      ant: ['adjectif en -ant', 'base morphologique', 'dérivation adverbiale', 'adverbe en -amment'],
      ent: ['adjectif en -ent', 'base morphologique', 'dérivation adverbiale', 'adverbe en -emment'],
    },
    coi_lui_leur: {
      singulier: ['référent humain singulier', 'COI introduit par à', 'remplacement indirect', 'pronom lui'],
      pluriel: ['référent humain pluriel', 'COI introduit par à', 'remplacement indirect', 'pronom leur'],
    },
    concession_et_constat: {
      concession: ['construction concessive', 'fait admis malgré un obstacle', 'mode subjonctif', 'temps selon le repère'],
      constat: ['construction de constat', 'fait présenté comme avéré', 'mode indicatif', 'temps selon le repère'],
    },
  };

  function describe(family, mechanismId, tenseId, detailId) {
    const known = family && mechanismId && family !== 'UNK' && mechanismId !== 'UNK';
    const familyLabel = FAMILIES[family] || family;
    const generatedLabel = known ? humanizeMechanismId(mechanismId) : null;
    const mechanism = known
      ? (MECHANISMS[mechanismId] || [
        generatedLabel,
        FAMILY_GUIDANCE[family]
          || 'Applique la règle précise donnée dans la correction de la question.',
      ])
      : null;
    const canonicalPath = known
      ? (PATHS[mechanismId] || [
        familyLabel,
        generatedLabel,
        'règle précise expliquée dans la correction',
      ])
      : null;
    if (!known) {
      const knownTense = tenseId
        ? (TENSES[tenseId] || `temps canonique non libellé : ${tenseId}`)
        : null;
      return {
        familyId: family || 'UNK',
        mechanismId: mechanismId || 'UNK',
        detailId: detailId || null,
        detailLabel: humanizeDetailId(detailId),
        tenseId: tenseId || null,
        familyLabel: FAMILIES[family] || 'Famille grammaticale non renseignée',
        mechanismLabel: 'Mécanisme précis non renseigné',
        path: [
          knownTense || FAMILIES[family] || 'famille inconnue',
          'mécanisme inconnu (métadonnée absente)',
        ],
        steps: [
          'La banque ne fournit pas ici un mécanisme canonique assez précis.',
          'Relis l’explication de la question et repère les mots qui commandent la construction.',
          'Aucune cause personnelle de l’erreur n’est déduite de cette seule réponse.',
        ],
        learnerTitle: 'Cette erreur doit encore être précisée',
        revisionTitle: 'Règle grammaticale à préciser',
        learnerExplanation: 'La question ne contient pas encore assez d’informations pour nommer précisément la règle. Relis sa correction détaillée : elle reste la source la plus fiable.',
        learnerSteps: [
          'Relis la phrase et la réponse que tu avais choisie.',
          'Compare-les avec la correction détaillée de la question.',
          'Ne déduis pas une cause générale à partir de cette seule erreur.',
        ],
        learnerSource: 'unknown',
        fallback: true,
      };
    }
    const detailPath = detailId && DETAIL_PATHS[mechanismId]
      ? DETAIL_PATHS[mechanismId][detailId]
      : null;
    const path = (detailPath || canonicalPath).slice();
    if (
      tenseId
      && ['temps composé non précisé', 'conditionnel non précisé'].includes(path[0])
    ) {
      path[0] = TENSES[tenseId] || `temps canonique non libellé : ${tenseId}`;
    }
    const middle = path.slice(1, -1).join(' → ');
    const specificLearner = LEARNER_GUIDANCE[mechanismId];
    const learner = specificLearner || DEFAULT_LEARNER_GUIDANCE;
    return {
      familyId: family,
      mechanismId,
      familyLabel: FAMILIES[family] || family,
      mechanismLabel: mechanism[0],
      detailId: detailId || null,
      detailLabel: humanizeDetailId(detailId),
      tenseId: tenseId || null,
      tenseLabel: tenseId ? (TENSES[tenseId] || null) : null,
      path,
      steps: [
        `Repère : ${path[0]}.`,
        `Vérifie : ${middle}.`,
        mechanism[1],
        `Conclusion attendue : ${path[path.length - 1]}.`,
      ],
      learnerTitle: learner.title,
      revisionTitle: revisionTitle(FAMILIES[family] || family, learner.title),
      learnerExplanation: learner.explanation,
      learnerSteps: learner.steps.slice(),
      learnerSource: specificLearner ? 'mechanism' : 'unknown',
      fallback: false,
    };
  }

  function summarize(log) {
    const groups = new Map();
    (log || []).filter((attempt) => !attempt.correct).forEach((attempt) => {
      const family = attempt.family || 'UNK';
      const mechanismId = attempt.mechanismId || 'UNK';
      const tenseId = attempt.tenseId || null;
      const detailId = attempt.detailId || null;
      const key = `${family}\u0000${mechanismId}\u0000${detailId || ''}\u0000${tenseId || ''}`;
      const current = groups.get(key) || {
        family,
        mechanismId,
        detailId,
        tenseId,
        count: 0,
        questionIds: [],
        misconceptionCounts: {},
      };
      current.count += 1;
      current.questionIds.push(attempt.id);
      const misconceptionId = attempt.misconceptionId || 'UNK';
      current.misconceptionCounts[misconceptionId]
        = (current.misconceptionCounts[misconceptionId] || 0) + 1;
      groups.set(key, current);
    });
    return Array.from(groups.values())
      .map((group) => Object.assign(
        group,
        describe(group.family, group.mechanismId, group.tenseId, group.detailId)
      ))
      .sort((a, b) => b.count - a.count || a.mechanismLabel.localeCompare(b.mechanismLabel, 'fr'));
  }

  return {
    LABELS_VERSION,
    TENSES,
    FAMILIES,
    PARTICIPLE_MENU_GROUPS,
    NON_DISCRIMINANT_PARTICIPLE_CASES,
    MECHANISMS,
    LEARNER_GUIDANCE,
    PATHS,
    DETAIL_PATHS,
    describe,
    summarize,
  };
}));
