'use strict';

const assert = require('assert');
const { QUESTIONS } = require('./questions.js');
const pedagogy = require('./pedagogy.js');
const canonicalPedagogy = require('../analyse_gpt/pedagogy_HEP.json');

const canonicalPairs = new Set(
  QUESTIONS
    .filter((question) => (
      question.hep
      && question.hep.family
      && question.hep.family !== 'UNK'
      && question.hep.mechanism_id
      && question.hep.mechanism_id !== 'UNK'
    ))
    .map((question) => `${question.hep.family}\u0000${question.hep.mechanism_id}`)
);
const activeMechanismIds = new Set(
  Array.from(canonicalPairs, (pair) => pair.split('\u0000')[1])
);
const activeParticipleMechanismIds = new Set(
  QUESTIONS
    .filter((question) => question.rule === 'participe')
    .map((question) => question.hep && question.hep.mechanism_id)
    .filter((mechanismId) => mechanismId && mechanismId !== 'UNK')
);
const activeParticipleCaseIds = new Set(
  QUESTIONS
    .filter((question) => question.rule === 'participe')
    .map((question) => question.hep && `${question.hep.mechanism_id}/${question.hep.detail_id}`)
    .filter((caseId) => (
      caseId
      && !caseId.includes('UNK')
      && !pedagogy.NON_DISCRIMINANT_PARTICIPLE_CASES.has(caseId)
    ))
);

assert.ok(canonicalPairs.size > 0, 'La banque doit contenir des couples canoniques.');
assert.ok(activeMechanismIds.size > 0, 'La banque doit contenir des mécanismes actifs.');
assert.ok(
  QUESTIONS.some((question) => question.rule === 'participe'),
  'Le menu ciblé doit conserver les questions actives du participe.'
);
const groupedParticipleMechanismIds = pedagogy.PARTICIPLE_MENU_GROUPS
  .flatMap((group) => group.cases);
assert.strictEqual(
  new Set(groupedParticipleMechanismIds).size,
  groupedParticipleMechanismIds.length,
  'Un cas du participe ne doit apparaître que dans un seul groupe du menu.'
);
activeParticipleCaseIds.forEach((caseId) => {
  assert.ok(
    groupedParticipleMechanismIds.includes(caseId),
    `Sous-cas actif absent du menu du participe : ${caseId}`
  );
  const [mechanismId, detailId] = caseId.split('/');
  const guide = pedagogy.describe('accord_participe_passe', mechanismId, null, detailId);
  assert.strictEqual(guide.learnerSource, 'mechanism');
  assert.strictEqual(guide.learnerSteps.length, 3);
});
assert.deepStrictEqual(
  Array.from(activeMechanismIds).filter((id) => !pedagogy.LEARNER_GUIDANCE[id]),
  [],
  'Chaque mécanisme actif doit avoir une fiche apprenant explicite.'
);
Object.entries(canonicalPedagogy.mechanisms)
  .filter(([, mechanism]) => mechanism.family === 'accord_participe_passe')
  .forEach(([mechanismId]) => assert.ok(
    pedagogy.LEARNER_GUIDANCE[mechanismId],
    `Fiche apprenant absente pour le mécanisme publié ${mechanismId}`
  ));

[
  'qu_en_quant_quand',
  'la_la_l_a_l_as',
  'ca_sa',
  'son_sont',
  'on_ont',
].forEach((mechanismId) => {
  assert.ok(pedagogy.LEARNER_GUIDANCE[mechanismId]);
  const description = pedagogy.describe('homophones_grammaticaux', mechanismId);
  assert.strictEqual(description.fallback, false);
  assert.strictEqual(description.learnerSource, 'mechanism');
  assert.strictEqual(description.learnerSteps.length, 3);
  assert.deepStrictEqual(
    description.path,
    canonicalPedagogy.mechanisms[mechanismId].details.core
  );
});

Object.entries({
  genre_des_noms: 'orthographe_lexicale',
  phrase_non_verbale: 'formes_de_phrase',
  determinant_contracte: 'prepositions_regies',
  accord_adjectif_avec_nom: 'accord_adjectif_nom',
  nombre_du_nom: 'orthographe_lexicale',
  pluriel_noms_en_al: 'orthographe_lexicale',
  et_est: 'homophones_grammaticaux',
  ma_m_a_m_as: 'homophones_grammaticaux',
  dans_d_en: 'homophones_grammaticaux',
  abreviation_titres_civilite: 'orthographe_lexicale',
  abreviation_adjectifs_ordinaux: 'nombres_traits_union',
  ecriture_heures_symbole_h: 'nombres_traits_union',
  virgule_enumeration_simple: 'ponctuation',
  regime_verbal_en: 'prepositions_regies',
  a_a: 'homophones_grammaticaux',
  ou_ou: 'homophones_grammaticaux',
  t_euphonique_inversion: 'ponctuation',
}).forEach(([mechanismId, family]) => {
  assert.ok(pedagogy.LEARNER_GUIDANCE[mechanismId]);
  const description = pedagogy.describe(family, mechanismId);
  assert.strictEqual(description.fallback, false);
  assert.strictEqual(description.learnerSource, 'mechanism');
  assert.strictEqual(description.learnerSteps.length, 3);
  assert.deepStrictEqual(
    description.path,
    canonicalPedagogy.mechanisms[mechanismId].details.core
  );
});

const learnerTitles = new Set();
const learnerExplanations = new Set();

Object.entries(pedagogy.LEARNER_GUIDANCE).forEach(([mechanismId, guide]) => {
  assert.deepStrictEqual(
    Object.keys(guide).sort(),
    ['explanation', 'steps', 'title'],
    `Structure de fiche inattendue pour ${mechanismId}`
  );
});

canonicalPairs.forEach((pair) => {
  const [family, mechanismId] = pair.split('\u0000');
  const description = pedagogy.describe(family, mechanismId);
  assert.strictEqual(
    description.fallback,
    false,
    `Libellé pédagogique manquant pour ${family}/${mechanismId}`
  );
  assert.ok(description.steps.length >= 4);
  assert.ok(description.path.length >= 3);
  assert.ok(description.learnerTitle.length >= 8);
  assert.ok(description.learnerExplanation.length >= 80);
  assert.match(description.learnerExplanation, /^Exemple :/);
  assert.strictEqual(description.learnerSteps.length, 3);
  assert.strictEqual(
    description.learnerSource,
    'mechanism',
    `Repli familial interdit pour ${family}/${mechanismId}`
  );
  description.learnerSteps.forEach((step) => assert.ok(step.length >= 10));
  assert.doesNotMatch(
    [description.learnerTitle, description.learnerExplanation, ...description.learnerSteps].join(' '),
    /(?:_|→|lexème|recteur|valeur prépositive|actant|valence|morphème|anaphore|déictique|ancre énonciative|coréférence|polarité|assertif|misconception_id|\bUNK\b)/i,
    `Terme interne exposé dans le guide apprenant de ${family}/${mechanismId}`
  );
  assert.doesNotMatch(
    [description.learnerTitle, description.learnerExplanation, ...description.learnerSteps].join(' '),
    /Applique cette règle|règle précise donnée dans la correction|À retravailler/i,
    `Fiche trop générique pour ${family}/${mechanismId}`
  );
  learnerTitles.add(description.learnerTitle);
  learnerExplanations.add(description.learnerExplanation);
  assert.notDeepStrictEqual(
    description.path,
    [description.familyLabel],
    `Repli générique sur la famille interdit pour ${family}/${mechanismId}`
  );
  assert.notStrictEqual(
    description.path.join(' → '),
    description.familyLabel,
    `Le chemin doit être plus précis que la famille pour ${family}/${mechanismId}`
  );
});

assert.strictEqual(
  learnerTitles.size,
  activeMechanismIds.size,
  'Chaque mécanisme actif doit avoir un titre propre.'
);
assert.strictEqual(
  learnerExplanations.size,
  activeMechanismIds.size,
  'Chaque mécanisme actif doit avoir une explication propre.'
);

assert.match(
  pedagogy.describe('accord_participe_passe', 'avoir_cvd_avant').mechanismLabel,
  /COD placé avant/
);
assert.match(
  pedagogy.describe('accord_participe_passe', 'fait_suivi_infinitif').mechanismLabel,
  /fait \+ infinitif/
);
assert.match(
  pedagogy.describe('accord_participe_passe', 'pronominal_se_coi').mechanismLabel,
  /se COI/
);
assert.deepStrictEqual(
  pedagogy.describe('accord_participe_passe', 'avoir_cvd_avant').path,
  ['temps composé non précisé', 'auxiliaire avoir', 'COD placé avant', 'accord avec le COD']
);
assert.deepStrictEqual(
  pedagogy.describe(
    'accord_participe_passe',
    'avoir_cvd_avant',
    'passe_compose'
  ).path,
  ['passé composé', 'auxiliaire avoir', 'COD placé avant', 'accord avec le COD']
);
assert.strictEqual(
  pedagogy.describe('accord_participe_passe', 'laisse_suivi_infinitif').fallback,
  false
);
assert.match(
  pedagogy.describe('accord_participe_passe', 'pronominal_accord_sujet', null, 'essentiellement').path.join(' → '),
  /essentiellement pronominal/
);
assert.deepStrictEqual(
  pedagogy.describe(
    'conjugaison',
    'conditionnel',
    'conditionnel_present',
    'present_irregulier'
  ).path,
  [
    'conditionnel présent',
    'radical irrégulier du futur',
    'personne à relever',
    'terminaison de l’imparfait',
  ]
);
assert.deepStrictEqual(
  pedagogy.describe(
    'accord_participe_passe',
    'pronominal_se_coi',
    null,
    'cod_apres'
  ).path,
  ['verbe pronominal', 'se COI', 'COD placé après', 'participe invariable']
);
assert.deepStrictEqual(
  pedagogy.describe('pronoms_relatifs', 'regime_a_auquel').path,
  [
    'antécédent nominal non humain',
    'construction avec à',
    'forme de lequel appropriée',
    'auquel / à laquelle / auxquels / auxquelles',
  ]
);

assert.deepStrictEqual(
  pedagogy.participleTypeLabels({
    hep: {
      family: 'accord_participe_passe',
      mechanism_id: 'pronominal_se_coi',
      detail_id: 'cod_avant',
      tense_id: null,
      additional_rule_paths: [
        {
          family: 'accord_participe_passe',
          mechanism_id: 'participe_sans_auxiliaire',
          detail_id: 'core',
          tense_id: null,
        },
        {
          family: 'accord_participe_passe',
          mechanism_id: 'participe_sans_auxiliaire',
          detail_id: 'core',
          tense_id: null,
        },
      ],
    },
  }),
  [
    'Verbe pronominal : « se » est COI — COD avant',
    'Participe passé employé sans auxiliaire',
  ]
);
assert.deepStrictEqual(
  pedagogy.participleTypeLabels({
    hep: {
      family: 'subjonctif_indicatif',
      mechanism_id: 'apres_que_indicatif',
      detail_id: 'core',
    },
  }),
  []
);
assert.ok(
  pedagogy.participleTypeLabels(
    QUESTIONS.find((question) => question.id === 'eleves-L66-3')
  ).includes('Verbe pronominal : « se » est COD'),
  'Le feedback Drive sur « se lever » doit produire un type de participe passé visible.'
);

const auditedParticiplePaths = {
  'part-8': ['participe_suivi_infinitif/core', 'pronominal_cvd_avant/core'],
  'part-9': ['mesure_duree_prix/core', 'pronominal_se_coi/sans_cod', 'participe_adjectival_selon_position/avant_stable', 'avoir_cvd_avant/core'],
  'part-12': ['mesure_duree_prix/core', 'avoir_cvd_avant/core'],
  'part-13': ['infinitif_sous_entendu_invariable/core', 'participe_suivi_infinitif/core'],
  'part-29': ['participe_suivi_infinitif/core', 'impersonnel_participe_invariable/core', 'pronominal_se_coi/sans_cod', 'pronominal_se_coi/cod_avant'],
  'part-39': ['pronominal_accord_sujet/essentiellement', 'participe_adjectival_selon_position/zone_facultative', 'infinitif_sous_entendu_invariable/core', 'pronominal_accord_sujet/autonome'],
  'part-45': ['avoir_cvd_avant/core', 'pronominal_se_coi/cod_apres', 'pronominal_se_coi/sans_cod'],
  'part-47': ['impersonnel_participe_invariable/core', 'avoir_cvd_avant/core', 'pronominal_se_coi/sans_cod'],
  'part-L57-10': ['mesure_duree_prix/core', 'avoir_cvd_avant/core'],
  'part-L63-7': ['mesure_duree_prix/core', 'avoir_cvd_avant/core'],
};
Object.entries(auditedParticiplePaths).forEach(([questionId, expectedPaths]) => {
  const question = QUESTIONS.find((entry) => entry.id === questionId);
  assert.ok(question, `Question auditée absente : ${questionId}`);
  const actualPaths = [
    `${question.hep.mechanism_id}/${question.hep.detail_id}`,
    ...(question.hep.additional_rule_paths || [])
      .map((path) => `${path.mechanism_id}/${path.detail_id}`),
  ];
  assert.deepStrictEqual(actualPaths, expectedPaths, `Chemins incomplets : ${questionId}`);
});

const summary = pedagogy.summarize([
  { id: 'q1', correct: false, family: 'accord_participe_passe', mechanismId: 'avoir_cvd_avant', misconceptionId: 'cod_apres_suppose' },
  { id: 'q2', correct: false, family: 'accord_participe_passe', mechanismId: 'avoir_cvd_avant', misconceptionId: null },
  { id: 'q3', correct: true, family: 'accord_participe_passe', mechanismId: 'avoir_cvd_avant' },
  { id: 'q4', correct: false, family: null, mechanismId: null },
]);
assert.strictEqual(summary.length, 2);
assert.strictEqual(summary[0].count, 2);
assert.deepStrictEqual(summary[0].questionIds, ['q1', 'q2']);
assert.deepStrictEqual(summary[0].misconceptionCounts, {
  cod_apres_suppose: 1,
  UNK: 1,
});
assert.strictEqual(summary[1].fallback, true);
assert.strictEqual(summary[1].learnerSource, 'unknown');
assert.match(summary[1].steps.join(' '), /Aucune cause personnelle/);
assert.doesNotMatch(
  [summary[1].learnerTitle, summary[1].learnerExplanation, ...summary[1].learnerSteps].join(' '),
  /\bUNK\b|misconception_id/i
);

assert.strictEqual(
  pedagogy.describe('orthographe_lexicale', 'UNK').fallback,
  true
);
assert.match(
  pedagogy.describe('orthographe_lexicale', 'paronyme_lexical').learnerTitle,
  /deux mots qui se ressemblent/
);
assert.doesNotMatch(
  pedagogy.describe('orthographe_lexicale', 'paronyme_lexical').learnerExplanation,
  /lexème/
);
assert.match(
  pedagogy.describe('accord_participe_passe', 'participe_adjectival_selon_position').learnerExplanation,
  /avant le nom/i
);
assert.match(
  pedagogy.describe('accord_participe_passe', 'participe_adjectival_selon_position').learnerExplanation,
  /Ci-joint les copies/
);
assert.match(
  pedagogy.describe('accord_participe_passe', 'participe_adjectival_selon_position').learnerExplanation,
  /copies ci-jointes/
);
assert.match(
  pedagogy.describe('orthographe_lexicale', 'graphies_lexicales_multiples').learnerExplanation,
  /quatre mots sans rapport/
);
assert.match(
  pedagogy.describe('adjectif_verbal_participe_present', 'participe_present_avec_complement').learnerExplanation,
  /exprime une action/
);
assert.strictEqual(
  pedagogy.describe('accord_participe_passe', 'participe_adjectival_selon_position').learnerSource,
  'mechanism'
);
assert.strictEqual(
  pedagogy.describe('pronoms_relatifs', 'regime_a_auquel').learnerSource,
  'mechanism'
);

const negation = pedagogy.describe(
  'negation',
  'negation_complete_ne_pas',
  null,
  'core'
);
assert.strictEqual(negation.familyLabel, 'Négation');
assert.strictEqual(negation.mechanismLabel, 'négation complète avec ne ou n’');
assert.strictEqual(negation.detailLabel, 'Règle générale');
assert.deepStrictEqual(negation.path, [
  'phrase négative à l’écrit',
  'verbe conjugué',
  'ne ou n’ et second terme négatif',
  'négation complète',
]);
assert.strictEqual(negation.learnerSource, 'mechanism');
assert.match(negation.revisionTitle, /^Négation — /);
assert.match(negation.learnerExplanation, /^Exemple :/);
assert.deepStrictEqual(negation.learnerSteps.length, 3);
assert.doesNotMatch(negation.learnerTitle, /\b(?:ne|pas|jamais|plus|rien|personne)\b|n’/i);

console.log(`OK — ${canonicalPairs.size} mécanismes canoniques couverts.`);
