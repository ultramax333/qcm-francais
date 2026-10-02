'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Unit harness only: production app.js is executed unmodified except for private
// test accessors. Browser/device Back and Safari gestures require browser QA too.
class Element {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.listeners = {};
    this.className = '';
    this.style = {};
    this.textContent = '';
    this.classList = { add: (...names) => { this.className += ' ' + names.join(' '); } };
  }
  set innerHTML(value) { this.children = []; }
  setAttribute(name, value) { this[name] = value; }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  click() {
    (this.listeners.click || []).forEach(fn => fn({ target: this }));
    if (this.parent) this.parent.click();
  }
  querySelector(selector) { return this.all().find(node => node.className.split(' ').includes(selector.slice(1))); }
  all() { return [this, ...this.children.flatMap(child => child.all())]; }
}

function launch() {
  const app = new Element('main');
  const storage = new Map();
  const listeners = {};
  const entries = [{ state: null, external: true }, { state: null }];
  let position = 1;
  let exited = false;
  const window = {
    scrollY: 0,
    CONFIG: {},
    scrollTo(x, y) { this.scrollY = y; },
    addEventListener(name, fn) { (listeners[name] ||= []).push(fn); },
    history: {
      scrollRestoration: 'auto',
      get state() { return entries[position].state; },
      replaceState(state) { entries[position].state = structuredClone(state); },
      pushState(state) {
        entries.splice(position + 1);
        entries.push({ state: structuredClone(state) });
        position++;
      },
      back() { this.go(-1); },
      forward() { this.go(1); },
      go(delta) {
        const target = position + delta;
        if (target < 0 || target >= entries.length) return;
        position = target;
        if (entries[position].external) { exited = true; return; }
        (listeners.popstate || []).forEach(fn => fn({ state: entries[position].state }));
      },
    },
  };
  const questions = [1, 2].map(n => ({
    id: 'navigation-' + n, rule: 'test', type: 'sentences', answer: '1',
    options: ['1', '2', '3', '4', 'A', 'T'].map(key => ({ key, text: 'Proposition ' + key })),
    instruction: 'Consigne neutre', explanation: 'Explication.', hep: {},
  }));
  const context = {
    window, document: { getElementById: () => app,
      createElement: tag => new Element(tag), createTextNode: text => {
        const node = new Element('#text'); node.textContent = text; return node;
      } },
    navigator: {}, CONFIG: window.CONFIG, QUESTIONS: questions,
    RULES: [{ id: 'test', label: 'Règle test', desc: 'Deux questions' }],
    DRIVE: { configured: () => false },
    localStorage: { getItem: key => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    confirm: () => true, setTimeout, clearTimeout, console,
  };
  const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(source.replace(/\}\)\(\);\s*$/, `
    window.testApp = { getState: () => state, startQuiz, selectAnswer, nextQuestion,
      navigate, navigateBack, navigateHome };
  })();`), context);
  const button = text => {
    const node = app.all().find(node => node.textContent === text);
    assert(node, 'Visible control: ' + text);
    return node;
  };
  return { app, window, storage, entries, button, api: window.testApp,
    get exited() { return exited; },
    beforeUnload() {
      const event = { prevented: false, preventDefault() { this.prevented = true; } };
      (listeners.beforeunload || []).forEach(fn => fn(event));
      return event;
    } };
}

const h = launch();
assert.strictEqual(h.entries.length, 2, 'Initial home replaces the entry, no artificial Back trap.');
h.button('Voir l’historique de mes tentatives').click();
assert.strictEqual(h.api.getState().view, 'history');
h.button('← Accueil').click();
assert.strictEqual(h.api.getState().view, 'home');
h.window.history.forward();
assert.strictEqual(h.api.getState().view, 'history');
h.window.history.back();
h.button('📊 Mes erreurs').click();
assert.strictEqual(h.api.getState().view, 'errors');
h.window.scrollY = 420;
h.api.startQuiz('review', 'learn', null, null, ['navigation-2', 'navigation-1']);
const quiz = h.api.getState();
const ids = quiz.questions.map(q => q.id).join(',');
assert.strictEqual(ids, 'navigation-2,navigation-1', 'Source-question order is preserved.');
h.button('← Mes erreurs');
assert(!h.beforeUnload().prevented, 'An untouched quiz/source question does not need confirmation.');
quiz.memos['navigation-2'] = 'Remarque conservée';
quiz.detailsOpen['navigation-2'] = true;
quiz.likes['navigation-2'] = true;
quiz.deletionRequests['navigation-2'] = true;
h.api.selectAnswer('2');
h.api.nextQuestion();
assert.strictEqual(h.entries.length, 4, 'Answers and question advance do not push routes.');
const masteryBefore = h.storage.get('qcm-mastery-v1');
assert(h.beforeUnload().prevented, 'Reload/close warns while a quiz is live (best effort).');
h.window.history.back();
assert.strictEqual(h.api.getState().view, 'errors');
assert.strictEqual(h.window.scrollY, 420);
assert(!h.beforeUnload().prevented, 'Back to an app screen does not block unloading there.');
h.window.history.forward();
assert.strictEqual(h.api.getState(), quiz, 'Forward restores the live session, not a new draw.');
assert.strictEqual(quiz.index, 1);
assert.strictEqual(quiz.questions.map(q => q.id).join(','), ids);
assert.strictEqual(quiz.memos['navigation-2'], 'Remarque conservée');
assert.strictEqual(quiz.detailsOpen['navigation-2'], true);
assert.strictEqual(quiz.likes['navigation-2'], true);
assert.strictEqual(quiz.deletionRequests['navigation-2'], true);
assert.strictEqual(h.storage.get('qcm-mastery-v1'), masteryBefore, 'Navigation never re-records answers.');
h.api.selectAnswer('1');
h.api.nextQuestion();
assert.strictEqual(h.api.getState().view, 'result');
assert.strictEqual(h.entries.length, 4, 'Results replace the completed quiz.');
const completed = h.api.getState();
const historyBefore = h.storage.get('qcm-op001-history-v1');
const pendingBefore = h.storage.get('qcm-pending-feedback-v1');
const completedMastery = h.storage.get('qcm-mastery-v1');
h.window.history.back();
assert.strictEqual(h.api.getState().view, 'errors');
h.window.history.forward();
assert.strictEqual(h.api.getState(), completed);
assert.strictEqual(h.storage.get('qcm-op001-history-v1'), historyBefore);
assert.strictEqual(h.storage.get('qcm-pending-feedback-v1'), pendingBefore);
assert.strictEqual(h.storage.get('qcm-mastery-v1'), completedMastery);
assert.strictEqual(JSON.parse(historyBefore).length, 1);
h.button('Recommencer').click();
assert.strictEqual(h.api.getState().view, 'quiz');
assert.notStrictEqual(h.api.getState(), quiz, 'Explicit retry alone draws a new session.');
h.button('← Résultat').click();
assert.strictEqual(h.api.getState(), completed);
h.button('Accueil').click();
assert.strictEqual(h.api.getState().view, 'home');
h.window.history.forward();
assert.strictEqual(h.api.getState().view, 'errors');
h.api.navigate({ view: 'pending' });
assert.strictEqual(h.api.getState().view, 'pending');
h.button('← Mes erreurs').click();
assert.strictEqual(h.api.getState().view, 'errors');
h.api.navigateHome();
h.window.history.back();
assert(h.exited, 'A further Back from the original home can leave the site.');

const exam = launch();
exam.api.startQuiz('test', 'exam');
const examState = exam.api.getState();
exam.api.selectAnswer('2');
assert(!exam.storage.has('qcm-mastery-v1'));
exam.window.history.back();
exam.window.history.forward();
assert.strictEqual(exam.api.getState(), examState);
assert.strictEqual(examState.selectedKey, '2');
exam.api.nextQuestion();
assert.strictEqual(JSON.parse(exam.storage.get('qcm-mastery-v1')).test.total, 1);
exam.window.history.back();
exam.window.history.forward();
assert.strictEqual(JSON.parse(exam.storage.get('qcm-mastery-v1')).test.total, 1);
console.log('OK — navigation écrans, Retour/Avancer, quiz/examen conservés, résultats idempotents, accueil sans piège.');
