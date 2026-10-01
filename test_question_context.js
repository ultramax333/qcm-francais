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
const instructionHelper = source.match(/  function questionInstruction\(question\) \{[\s\S]*?\n  \}/);
assert(instructionHelper, 'A visible task instruction must exist.');
const instruction = vm.runInNewContext(`(${instructionHelper[0]})`, { questionContext: context });
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
assert.strictEqual(context(byId('drill40h-30-4')), '');
assert.strictEqual(context({ type: 'sentences', instruction: 'Accord avec avoir : seule phrase correcte' }), '');
assert.strictEqual(context({ type: 'blank', stem: 'Les décisions ___ prêtes.' }), 'Les décisions ___ prêtes.');
for (const q of bank) {
  if (q.stem && q.stem.trim() && q.id !== 'drill40h-30-4') {
    assert.strictEqual(context(q), q.stem.trim(), q.id);
  }
  const displayed = instruction(q);
  assert(displayed.length > 30, q.id);
  // Never derive the task from the key, taxonomy, distractors or legacy clue-bearing title.
  assert.strictEqual(instruction({ ...q, answer: 'T', hep: {}, options: [], gen: null }), displayed, q.id);
  if (q.rule !== 'vocabulaire' && q.type !== 'vocabulary') {
    assert.strictEqual(instruction({ ...q, instruction: 'La seule phrase correcte : accord avec avoir' }), displayed, q.id);
  }
}
const counts = { completion: 0, meaning: 0, transformation: 0, sentences: 0 };
for (const q of bank) {
  const text = instruction(q);
  if (text.includes('complètent')) counts.completion++;
  else if (text.includes('sens du mot')) counts.meaning++;
  else if (text.includes('reformulations')) counts.transformation++;
  else counts.sentences++;
}
assert.strictEqual(Object.values(counts).reduce((sum, n) => sum + n, 0), bank.length);
assert(Object.values(counts).every((n) => n > 0));
assert(instruction(byId('eleves-L64-3')).includes('phrases correctement écrites'));
assert(instruction(byId('dis-L30-9')).includes('complètent'));
assert(instruction(byId('pond40rrrrrrrr-28-1')).includes('complètent'));
assert(instruction(byId('pond40rrrrrrrr-34-4')).includes('complètent'));
assert(instruction(byId('voc-1')).includes('sens du mot'));
assert(instruction(byId('drill40t-33-4')).includes('reformulations'));
assert(instruction(byId('ponc-20')).includes('contexte donné'));
assert(source.includes('const context = questionContext(q);'));
assert(source.includes("const parts = context.split('___');"));
assert(source.includes('text: questionInstruction(q)'));
assert(source.includes('Un seul choix :'));
assert(source.includes('« Aucune » si aucune ne convient'));
assert(source.includes('« Toutes » si les quatre conviennent'));
assert(source.includes(' Remarque / signalement'));
assert(!source.includes(' mémo / infos'));
console.log(`OK — consignes explicites sur les ${bank.length} questions, sans indice de réponse ; contextes et signalement préservés.`);
