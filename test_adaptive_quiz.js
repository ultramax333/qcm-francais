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
assert.strictEqual(result.questions.filter((question) => question.rule === 'b').length, 6);
assert.strictEqual(result.questions.filter((question) => question.rule === 'a').length, 0);

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

console.log('OK — sélection adaptative des quiz.');
