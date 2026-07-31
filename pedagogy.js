(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HEP_PEDAGOGY = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const LABELS_VERSION = 'hep-pedagogy-labels/2.1';

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
    gentiles_majuscules: 'Majuscule des gentilés',
    homophones_grammaticaux: 'Homophones grammaticaux',
    interrogation_indirecte: 'Interrogation indirecte',
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
    gentiles_majuscules: 'Distingue le nom de personne, l’adjectif et la langue avant de choisir la majuscule.',
    homophones_grammaticaux: 'Identifie la catégorie et la fonction du mot, puis utilise un test de remplacement.',
    interrogation_indirecte: 'Après le verbe introducteur, conserve une subordonnée à l’ordre déclaratif.',
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
    avoir_suivi_infinitif_sujet_action: ['avoir + participe passé + infinitif : auteur de l’action', 'Avec un participe suivi d’un infinitif, repère si le COD placé avant accomplit l’action de l’infinitif avant de décider l’accord.', ['participe passé', 'auxiliaire avoir', 'infinitif après', 'identifier l’auteur de l’infinitif']],
    laisse_suivi_infinitif: ['laissé + infinitif', 'Dans la norme rectifiée actuelle, laissé suivi immédiatement d’un infinitif reste invariable.', ['participe passé', 'laissé + infinitif', 'laissé invariable']],
    pronominal_reflechi: ['verbe pronominal réfléchi', 'Dans un pronominal réfléchi, le sujet agit sur lui-même : détermine si se est COD ou COI avant d’accorder.', ['verbe pronominal', 'emploi réfléchi', 'fonction de se', 'règle du COD']],
    pronominal_reciproque: ['verbe pronominal réciproque', 'Dans un pronominal réciproque, les sujets agissent l’un sur l’autre : détermine si se est COD ou COI avant d’accorder.', ['verbe pronominal', 'emploi réciproque', 'fonction de se', 'règle du COD']],
    pronominal_essentiellement: ['verbe essentiellement pronominal', 'Quand le verbe n’existe normalement qu’à la forme pronominale, le participe s’accorde en principe avec le sujet.', ['verbe pronominal', 'emploi essentiellement pronominal', 'accord avec le sujet']],
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
    nom_peuple_adjectif_langue: ['nom de peuple, adjectif ou langue', 'Mets une majuscule au nom d’un peuple ; garde la minuscule pour l’adjectif et pour le nom de la langue.'],
    leur_leurs: ['leur déterminant ou leur pronom', 'Devant un nom, leur est un déterminant et peut devenir leurs ; devant un verbe ou sans nom, le pronom leur reste invariable.'],
    quel_que_quelque: ['quel que / quelque', 'Écris quel que en deux mots devant être et accorde quel ; ailleurs, vérifie si quelque est déterminant ou adverbe.'],
    ce_qui_ce_que: ['ce qui sujet / ce que complément', 'Dans la proposition qui suit, choisis ce qui si le pronom est sujet, ce que s’il est complément direct.'],
    coordination_interrogative: ['coordination de questions indirectes', 'Après le verbe introducteur, chaque élément coordonné doit garder une construction d’interrogation indirecte.'],
    cent_vingt_mille: ['accord de cent, vingt et mille', 'Cent et vingt prennent s seulement lorsqu’ils sont multipliés et terminent le nombre ; mille reste toujours invariable.'],
    mille_invariable: ['mille toujours invariable', 'Le nombre mille ne prend jamais de s, même lorsqu’il est multiplié.'],
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
    regime_a_auquel: ['verbe construit avec à : auquel', 'Si le mot de la relative exige à, emploie à + lequel, contracté en auquel ou auxquels selon l’antécédent.'],
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
    genre_change_sens: ['genre du nom qui change le sens', 'Certains noms ont une forme identique mais un sens différent au masculin et au féminin ; l’article permet d’identifier le sens attendu.'],
  };

  // Copie générée des chemins par défaut de pedagogy_HEP.json. Les questions
  // ne stockent que le detail_id court; aucun long texte n'est dupliqué dans
  // les observations.
  const PATHS = {
    donneur_eloigne: ['adjectif qualificatif', 'nom donneur éloigné', 'genre et nombre du nom', 'accord de l’adjectif'],
    avoir_cvd_apres: ['temps composé non précisé', 'auxiliaire avoir', 'COD placé après', 'participe passé invariable'],
    avoir_cvd_avant: ['temps composé non précisé', 'auxiliaire avoir', 'COD placé avant', 'accord avec le COD'],
    etre_accord_sujet: ['temps composé non précisé', 'auxiliaire être', 'sujet donneur', 'accord avec le sujet'],
    fait_suivi_infinitif: ['participe passé', 'construction factitive', 'fait + infinitif', 'fait invariable'],
    matrice_avoir_etre: ['temps composé non précisé', 'auxiliaire non précisé', 'donneur d’accord à identifier', 'règle de l’auxiliaire'],
    pronominal_cvd_avant: ['verbe pronominal', 'fonction de se', 'se COD placé avant', 'accord avec le COD'],
    pronominal_se_coi: ['verbe pronominal', 'fonction de se', 'se COI', 'accord selon l’éventuel COD'],
    avoir_suivi_infinitif_sujet_action: ['participe passé avec avoir', 'COD placé avant', 'infinitif après', 'auteur de l’infinitif à établir', 'accord conditionnel'],
    laisse_suivi_infinitif: ['participe passé', 'laissé + infinitif', 'norme rectifiée', 'laissé invariable'],
    pronominal_reflechi: ['verbe pronominal', 'emploi réfléchi', 'fonction de se non précisée', 'règle du COD'],
    pronominal_reciproque: ['verbe pronominal', 'emploi réciproque', 'fonction de se non précisée', 'règle du COD'],
    pronominal_essentiellement: ['verbe pronominal', 'emploi essentiellement pronominal', 'sujet donneur', 'accord avec le sujet'],
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
    nom_peuple_adjectif_langue: ['gentilé', 'nature non précisée', 'fonction à établir', 'majuscule ou minuscule'],
    leur_leurs: ['opposition leur / leurs', 'nature non précisée', 'test du nom suivant', 'variation ou invariabilité'],
    quel_que_quelque: ['opposition quel que / quelque', 'construction non précisée', 'nature à établir', 'graphie et accord'],
    ce_qui_ce_que: ['antécédent neutre ce', 'fonction non précisée', 'test sujet ou COD', 'ce qui ou ce que'],
    coordination_interrogative: ['verbe interrogatif introducteur', 'deux interrogatives coordonnées', 'subordination de chaque membre', 'ordre déclaratif'],
    cent_vingt_mille: ['nombre composé', 'cent / vingt / mille', 'position et multiplication à établir', 'marque du pluriel'],
    mille_invariable: ['nombre composé', 'mille', 'multiplication éventuelle', 'mille invariable'],
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
    regime_a_auquel: ['antécédent nominal', 'recteur construit avec à', 'complément indirect', 'auquel / à laquelle / auxquels / auxquelles'],
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
    participe_adjectival_selon_position: ['forme participiale spéciale', 'position avant ou après le nom', 'valeur prépositive ou adjectivale', 'invariabilité ou accord'],
    infinitif_sous_entendu_invariable: ['auxiliaire avoir', 'infinitif exprimé ou sous-entendu', 'complément rattaché à l’infinitif', 'participe invariable'],
    impersonnel_participe_invariable: ['tournure impersonnelle', 'il sans référent', 'absence de COD accordable', 'participe invariable'],
    matrice_participes_speciaux: ['révision de participes', 'plusieurs constructions attestées', 'analyse séparée de chaque phrase', 'accord ou invariabilité propre'],
    participe_sans_cvd_accordable: ['forme composée', 'recherche du complément direct', 'aucun CVD accordable avant', 'participe invariable'],
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
    declencheur_mode_selon_sens: ['construction introductrice', 'statut réel ou envisagé du fait', 'choix du mode', 'forme verbale attendue'],
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
    matrice_avoir_etre: {
      avoir: ['temps composé non précisé', 'auxiliaire avoir', 'position du COD à établir', 'règle du COD'],
      etre: ['temps composé non précisé', 'auxiliaire être', 'sujet donneur', 'accord avec le sujet'],
    },
    pronominal_reflechi: {
      se_cod: ['verbe pronominal', 'emploi réfléchi', 'se COD placé avant', 'accord avec se'],
      se_coi: ['verbe pronominal', 'emploi réfléchi', 'se COI', 'accord selon l’éventuel COD'],
    },
    pronominal_reciproque: {
      se_cod: ['verbe pronominal', 'emploi réciproque', 'se COD placé avant', 'accord avec se'],
      se_coi: ['verbe pronominal', 'emploi réciproque', 'se COI', 'accord selon l’éventuel COD'],
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
    return {
      familyLabel: FAMILIES[family] || family,
      mechanismLabel: mechanism[0],
      detailId: detailPath ? detailId : 'core',
      tenseLabel: tenseId ? (TENSES[tenseId] || null) : null,
      path,
      steps: [
        `Repère : ${path[0]}.`,
        `Vérifie : ${middle}.`,
        mechanism[1],
        `Conclusion attendue : ${path[path.length - 1]}.`,
      ],
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
      };
      current.count += 1;
      current.questionIds.push(attempt.id);
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
    MECHANISMS,
    PATHS,
    DETAIL_PATHS,
    describe,
    summarize,
  };
}));
