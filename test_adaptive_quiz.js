'use strict';

const assert = require('assert');
const adaptive = require('./adaptive-quiz.js');

const rules = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id }));
const questions = rules.flatMap((rule) => Array.from({ length: 10 }, (_, index) => ({
  id: `${rule.id}-${index + 1}`,
  rule: rule.id,
})));
const mastery = {
  a: { correct: 10, total: 10 },
  b: { correct: 2, total: 10 },
  c: { correct: 5, total: 10 },
  e: { correct: 8, total: 10 },
  f: { correct: 9, total: 10 },
};
const result = adaptive.build({ questions, rules, mastery, limit: 20, random: () => 0.5 });
assert.strictEqual(result.questions.length, 20);
assert.strictEqual(new Set(result.questions.map((question) => question.id)).size, 20);
assert.deepStrictEqual(result.rankedThemes.slice(0, 3).map((item) => item.ruleId), ['b', 'c', 'e']);
assert(result.questions.filter((question) => ['b', 'c', 'e', 'f'].includes(question.rule)).length >= 16);

const seenIds = new Set(questions.filter((question) => question.rule === 'b').slice(0, 8).map((q) => q.id));
const unseenFirst = adaptive.build({
  questions,
  rules,
  mastery,
  seenIds,
  limit: 2,
  themeCount: 1,
  random: () => 0.5,
});
assert(unseenFirst.questions.every((question) => !seenIds.has(question.id)));

const scarceQuestions = [
  { id: 'weak-only', rule: 'weak' },
  ...Array.from({ length: 24 }, (_, index) => ({ id: `other-${index}`, rule: 'other' })),
];
const redistributed = adaptive.build({
  questions: scarceQuestions,
  rules: [{ id: 'weak' }, { id: 'other' }],
  mastery: { weak: { correct: 0, total: 4 }, other: { correct: 8, total: 10 } },
  limit: 20,
  random: () => 0.5,
});
assert.strictEqual(redistributed.questions.length, 20);
assert(redistributed.questions.some((question) => question.id === 'weak-only'));

const profile = require('./error-profile.js');
const preciseBank = ['avoir', 'etre', 'infinitif'].flatMap((mechanism) =>
  Array.from({ length: 30 }, (_, i) => ({ id: `${mechanism}-${i}`, rule: 'participe', answer: '1',
    hep: { family: 'accord_participe_passe', mechanism_id: mechanism, detail_id: null, tense_id: null } })));
const attempts = (mechanism, correct, count) => Array.from({ length: count }, (_, i) => ({
  id: `${mechanism}-${i}`, rule: 'participe', answer: '1', selected: correct ? '1' : '2', correct,
}));
const preciseHistory = [{ sessionId: 's1', date: '2026-08-01', log: [
  ...attempts('avoir', false, 20), ...attempts('etre', true, 20),
] }];
const settings = { questions: preciseBank, history: preciseHistory, errorProfile: profile, random: () => 0.5 };
const focused = adaptive.build(settings);
assert(focused.questions.filter((q) => q.hep.mechanism_id === 'avoir').length >= 16,
  'Les erreurs avec avoir doivent cibler avoir, même si être appartient à la même carte.');
assert(focused.questions.some((q) => q.hep.mechanism_id !== 'avoir'), 'La révision variée doit rester accessible.');
const recovered = adaptive.build({ ...settings, history: [...preciseHistory,
  { sessionId: 's2', date: '2026-08-02', log: attempts('avoir', true, 20) }] });
assert(recovered.questions.filter((q) => q.hep.mechanism_id === 'avoir').length < 16,
  'Les réussites récentes doivent permettre de sortir d’une ancienne difficulté.');
const flaggedHistory = [{ ...preciseHistory[0], log: preciseHistory[0].log.map((a) =>
  ({ ...a, deletionRequested: a.id === 'avoir-0' })) }];
assert(!adaptive.build({ ...settings, history: flaggedHistory }).questions.some((q) => q.id === 'avoir-0'));
assert.deepStrictEqual(adaptive.build({ ...settings, limit: 0 }).questions, []);
assert.strictEqual(adaptive.build({ questions: [preciseBank[0], preciseBank[0]], limit: 20 }).questions.length, 1);
assert.strictEqual(adaptive.build({ questions: [], history: [null] }).questions.length, 0);
const repeated = { ...settings, history: [preciseHistory[0], preciseHistory[0]] };
assert.deepStrictEqual(adaptive.build(repeated).questions, focused.questions);
const changedKey = preciseBank.map((q) => ({ ...q, answer: '4' }));
const stale = adaptive.build({ ...settings, questions: changedKey });
assert(stale.questions.filter((q) => q.hep.mechanism_id === 'avoir').length < 16,
  'Une ancienne clé ne doit pas peser sur la sélection courante.');
const smoothed = adaptive.rankThemes([{ id: 'one', rule: 'one' }, { id: 'many', rule: 'many' }], [], {
  one: { total: 1, correct: 0 }, many: { total: 20, correct: 4 },
});
assert.strictEqual(smoothed[0].ruleId, 'many', 'Une erreur isolée ne doit pas dominer un déficit confirmé.');
for (let seed = 1; seed <= 50; seed += 1) {
  let state = seed;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const sample = adaptive.build({ ...settings, random }).questions;
  assert.strictEqual(sample.length, 20);
  assert.strictEqual(new Set(sample.map((q) => q.id)).size, 20);
  assert(sample.filter((q) => q.hep.mechanism_id === 'avoir').length >= 16);
}

console.log('OK — sélection adaptative des quiz.');
