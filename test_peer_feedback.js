'use strict';
const assert = require('assert');
const peer = require('./peer-feedback.js');
const id = 'hep-pf1-20261001T100000Z-01234567';
const session = { correct: 0, total: 20, sessionId: 'PRIVATE_SESSION', log: [
  { id: 'q1', memo: 'Deux réponses possibles.', selected: '2', expected: '3', correct: false, family: 'PRIVATE_STATS' },
  { id: 'q2', memo: '', selected: '1', correct: true },
  { id: 'q3', like: true }, { id: 'q4', deletionRequested: true }
] };
const payload = peer.build([session], 'bank-test', id);
assert.strictEqual(payload.reports.length, 3);
const report = peer.markdown(payload);
for (const secret of ['PRIVATE_SESSION', 'PRIVATE_STATS', 'selected', 'expected', 'correct', 'total']) assert(!report.includes(secret), secret);
assert.strictEqual(peer.build([{ log: [{ id: 'q', correct: false }] }], 'bank', id), null);
const config = {url:'https://docs.google.com/forms/d/e/test/viewform',question:'entry.1',comment:'entry.2',release:'entry.3'};
const url = new URL(peer.formLink(config, payload));
assert.strictEqual(url.searchParams.get('entry.1'), 'q1, q3, q4');
assert(url.searchParams.get('entry.2').includes('Deux réponses possibles.'));
assert.strictEqual(url.searchParams.get('entry.3'), 'bank-test');
for (const secret of ['PRIVATE_SESSION','PRIVATE_STATS','selected','expected','correct','total']) assert(!url.href.includes(secret));
assert.strictEqual(peer.formLink({...config,url:'https://evil.example/forms/d/e/test/viewform'}, payload),null);
assert.strictEqual(peer.formLink({...config,comment:'not-a-field'},payload),null);
// No network, token, browser storage or history read is permitted in this projection.
const source = require('fs').readFileSync(require('path').join(__dirname, 'peer-feedback.js'), 'utf8');
assert(!/fetch\(|localStorage|access_token|HISTORY_KEY/.test(source));
console.log('OK — remarques séparées des résultats personnels.');
