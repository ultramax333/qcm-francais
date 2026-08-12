'use strict';

const assert = require('assert');
const profile = require('./error-profile.js');

const history = [
  {
    date: '2026-07-20T10:00:00Z',
    sessionId: 's1',
    log: [
      {
        id: 'q1', correct: false, selected: '2', misconceptionId: 'cod_apres_suppose',
        family: 'accord_participe_passe',
        mechanismId: 'avoir_cvd_avant', detailId: 'pronom_relatif_que', tenseId: 'passe_compose',
      },
      {
        id: 'q2', correct: true, family: 'accord_participe_passe',
        mechanismId: 'avoir_cvd_avant', detailId: 'pronom_relatif_que', tenseId: 'passe_compose',
      },
    ],
  },
  {
    date: '2026-07-21T10:00:00Z',
    sessionId: 's2',
    log: [
      {
        id: 'q3', correct: false, selected: '2', misconceptionId: 'cod_apres_suppose',
        family: 'accord_participe_passe',
        mechanismId: 'avoir_cvd_avant', detailId: 'pronom_relatif_que', tenseId: 'passe_compose',
      },
      {
        id: 'q4', correct: false, selected: '4', misconceptionId: null,
        family: null, mechanismId: null,
        detailId: null, tenseId: null,
      },
    ],
  },
  {
    date: '2026-07-22T10:00:00Z',
    sessionId: 's3',
    log: [
      {
        id: 'q5', correct: true, family: 'accord_participe_passe',
        mechanismId: 'avoir_cvd_avant', detailId: 'pronom_relatif_que', tenseId: 'passe_compose',
      },
    ],
  },
];

const result = profile.build(history);
assert.strictEqual(result.schemaVersion, 'hep-local-error-profile/1.2');
assert.strictEqual(result.sessions, 3);
assert.strictEqual(result.attempts, 5);
assert.strictEqual(result.errors, 3);
assert.strictEqual(result.knownErrors, 2);
assert.strictEqual(result.rows.length, 2);

const known = result.rows.find((row) => row.mechanismId === 'avoir_cvd_avant');
assert.strictEqual(known.attempts, 4);
assert.strictEqual(known.errors, 2);
assert.strictEqual(known.sessions, 3);
assert.strictEqual(known.errorSessions, 2);
assert.strictEqual(known.currentCorrectStreak, 1);
assert.deepStrictEqual(known.questionIds, ['q1', 'q2', 'q3', 'q5']);
assert.deepStrictEqual(known.errorQuestionIds, ['q1', 'q3']);
assert.deepStrictEqual(known.distractors, [
  { misconceptionId: 'cod_apres_suppose', selected: '2', count: 2 },
]);

const unknown = result.rows.find((row) => row.mechanismId === 'UNK');
assert.strictEqual(unknown.errors, 1);
assert.strictEqual(unknown.errorRate, 1);
assert.deepStrictEqual(unknown.errorQuestionIds, ['q4']);
assert.deepStrictEqual(unknown.distractors, [
  { misconceptionId: 'UNK', selected: '4', count: 1 },
]);

assert.deepStrictEqual(profile.build([]), {
  schemaVersion: 'hep-local-error-profile/1.2',
  sessions: 0,
  attempts: 0,
  errors: 0,
  errorRate: 0,
  knownErrors: 0,
  rows: [],
});

const legacyHistory = [{
  date: '2026-07-23T10:00:00Z',
  log: [{
    id: 'legacy-active',
    rule: 'participe',
    answer: '2',
    selected: '1',
    correct: false,
    family: null,
    mechanismId: 'UNK',
    misconceptionId: 'UNK',
  }],
}];
const bank = [{
  id: 'legacy-active',
  rule: 'participe',
  answer: '2',
  hep: {
    family: 'accord_participe_passe',
    mechanism_id: 'avoir_cvd_avant',
    detail_id: 'core',
    tense_id: 'passe_compose',
    option_misconceptions: {
      1: 'cod_apres_suppose',
      2: null,
      3: 'UNK',
      4: 'UNK',
    },
  },
}];
const enriched = profile.build(legacyHistory, bank);
assert.strictEqual(enriched.rows[0].family, 'accord_participe_passe');
assert.strictEqual(enriched.rows[0].mechanismId, 'avoir_cvd_avant');
assert.strictEqual(enriched.rows[0].detailId, 'core');
assert.strictEqual(enriched.rows[0].tenseId, 'passe_compose');
assert.deepStrictEqual(enriched.rows[0].distractors, [{
  misconceptionId: 'cod_apres_suppose',
  selected: '1',
  count: 1,
}]);

const changedQuestion = JSON.parse(JSON.stringify(bank));
changedQuestion[0].answer = '4';
const notEnriched = profile.build(legacyHistory, changedQuestion);
assert.strictEqual(notEnriched.rows[0].mechanismId, 'UNK');

const classifiedHistory = JSON.parse(JSON.stringify(legacyHistory));
classifiedHistory[0].log[0].family = 'accord_participe_passe';
classifiedHistory[0].log[0].mechanismId = 'avoir_cvd_apres';
const reconciledSnapshot = profile.build(classifiedHistory, bank);
assert.strictEqual(reconciledSnapshot.rows[0].mechanismId, 'avoir_cvd_avant');

console.log('OK — profil cumulatif des erreurs.');
