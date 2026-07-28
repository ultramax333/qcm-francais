'use strict';

const assert = require('assert');
const { QUESTIONS } = require('./questions.js');
const pedagogy = require('./pedagogy.js');

const canonicalPairs = new Set(
  QUESTIONS
    .filter((question) => question.hep && question.hep.family && question.hep.mechanism_id)
    .map((question) => `${question.hep.family}\u0000${question.hep.mechanism_id}`)
);

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
  pedagogy.describe('accord_participe_passe', 'pronominal_essentiellement').path.join(' → '),
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
    'pronominal_reciproque',
    null,
    'se_coi'
  ).path,
  ['verbe pronominal', 'emploi réciproque', 'se COI', 'accord selon l’éventuel COD']
);
assert.deepStrictEqual(
  pedagogy.describe('pronoms_relatifs', 'regime_a_auquel').path,
  [
    'antécédent nominal',
    'recteur construit avec à',
    'complément indirect',
    'auquel / à laquelle / auxquels / auxquelles',
  ]
);

const summary = pedagogy.summarize([
  { id: 'q1', correct: false, family: 'accord_participe_passe', mechanismId: 'avoir_cvd_avant' },
  { id: 'q2', correct: false, family: 'accord_participe_passe', mechanismId: 'avoir_cvd_avant' },
  { id: 'q3', correct: true, family: 'accord_participe_passe', mechanismId: 'avoir_cvd_avant' },
  { id: 'q4', correct: false, family: null, mechanismId: null },
]);
assert.strictEqual(summary.length, 2);
assert.strictEqual(summary[0].count, 2);
assert.deepStrictEqual(summary[0].questionIds, ['q1', 'q2']);
assert.strictEqual(summary[1].fallback, true);
assert.match(summary[1].steps.join(' '), /Aucune cause personnelle/);

console.log(`OK — ${canonicalPairs.size} mécanismes canoniques couverts.`);
