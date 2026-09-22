'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Exercise the actual pure helper, without starting the browser/Drive UI.
const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const helper = source.match(/  function questionContext\(question\) \{[\s\S]*?\n  \}/);
assert(helper, 'Question context helper must exist in the renderer.');
const context = vm.runInNewContext(`(${helper[0]})`);
const sandbox = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'questions.js'), 'utf8') +
  '\nthis.questions = QUESTIONS;', sandbox);
const bank = sandbox.questions;
const byId = id => bank.find(q => q.id === id);
assert(context(byId('voc-1')).includes('ENTÉRINÉ'));
assert(context(byId('ponc-10')).includes('seuls les dossiers incomplets'));
assert(context(byId('ponc-20')).includes('tous les stagiaires'));
assert(context(byId('ponc-30')).includes('tous les élèves'));
assert(context(byId('ponc-31')).includes('seule la version contenant les corrections'));
assert(context(byId('solmaj-05-1')).includes("une seule personne"));
assert(context(byId('ponc-L52-10')).includes('tous les élèves de la salle'));
assert.strictEqual(context(byId('drill40t-33-4')), byId('drill40t-33-4').stem);
assert(context(byId('pond40rrrrrrrr-28-1')).includes('20 %'));
assert.strictEqual(context({ type: 'sentences', instruction: 'Accord avec avoir : seule phrase correcte' }), '');
assert.strictEqual(context({ type: 'blank', stem: 'Les décisions ___ prêtes.' }), 'Les décisions ___ prêtes.');
for (const q of bank) {
  if (q.stem && q.stem.trim()) assert.strictEqual(context(q), q.stem.trim(), q.id);
}
assert(source.includes('const context = questionContext(q);'));
assert(source.includes("const parts = context.split('___');"));
assert(source.includes("text: 'Examinez les propositions puis choisissez votre réponse.'"));
console.log('Question context: all stored stems preserved; vocabulary restored; ordinary titles hidden.');
