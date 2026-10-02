'use strict';
const assert = require('assert');
const progress = require('./question-progress.js');
const profile = require('./error-profile.js');
const changed = { id: 'changed', rule: 'negation', answer: '1', progress_revision: 1,
  hep: { family: 'negation', mechanism_id: 'ne_pas' } };
const unchanged = { id: 'kept', rule: 'negation', answer: '1', hep: changed.hep };
const questions = [changed, unchanged, { id: 'other', rule: 'other', answer: '2' }];
const history = [{ sessionId: 's1', log: [
  { id: 'changed', rule: 'negation', answer: '1', selected: '1', correct: true },
  { id: 'kept', rule: 'negation', answer: '1', selected: '1', correct: true },
] }];
function browser() {
  const values = new Map(Object.entries({
    'qcm-op001-history-v1': JSON.stringify(history),
    'qcm-seen-v1': JSON.stringify(['changed', 'kept', 'other']),
    'qcm-review-v1': JSON.stringify({ changed: 1, kept: 0 }),
    'qcm-mastery-v1': JSON.stringify({ negation: { correct: 2, total: 2 }, other: { correct: 9, total: 10 } }),
    'qcm-pending-feedback-v1': '[{"memo":"à conserver"}]',
  }));
  return { values, getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
}
for (let person = 0; person < 2; person++) {
  const storage = browser();
  const raw = storage.getItem('qcm-op001-history-v1');
  const pending = storage.getItem('qcm-pending-feedback-v1');
  progress.resetChanged(storage, questions);
  assert.deepStrictEqual(JSON.parse(storage.getItem('qcm-seen-v1')), ['kept', 'other']);
  assert.deepStrictEqual(JSON.parse(storage.getItem('qcm-review-v1')), { kept: 0 });
  assert.deepStrictEqual(JSON.parse(storage.getItem('qcm-mastery-v1')),
    { negation: { correct: 1, total: 1 }, other: { correct: 9, total: 10 } });
  assert.strictEqual(storage.getItem('qcm-op001-history-v1'), raw);
  assert.strictEqual(storage.getItem('qcm-pending-feedback-v1'), pending);
  const once = JSON.stringify([...storage.values]);
  progress.resetChanged(storage, questions);
  assert.strictEqual(JSON.stringify([...storage.values]), once, 'Migration is idempotent.');
  storage.setItem('qcm-seen-v1', '["changed","kept","other"]');
  progress.resetChanged(storage, questions);
  assert(JSON.parse(storage.getItem('qcm-seen-v1')).includes('changed'), 'A new success must not be reset again.');
}
assert.strictEqual(profile.build(history, questions).attempts, 1, 'Same key, but harder question: old success excluded.');
const current = { sessionId: 's2', log: [{ ...history[0].log[0], progressRevision: 1 }] };
assert.strictEqual(profile.build([...history, current], questions).attempts, 2);
assert(!progress.compatible(history[0].log[0], changed));
assert(progress.compatible(current.log[0], changed));
const skipped = browser();
progress.resetChanged(skipped, [{ ...changed, progress_revision: 3 }, unchanged]);
assert(!JSON.parse(skipped.getItem('qcm-seen-v1')).includes('changed'), 'Skipped releases still reset.');
console.log('OK — corrections ciblées : progrès réinitialisés, archives conservées, migration idempotente.');
