(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HEP_ADAPTIVE_QUIZ = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const DEFAULT_THEME_COUNT = 5;
  const DEFAULT_LIMIT = 20;
  // Un petit a priori évite qu'une erreur isolée pèse autant que dix échecs.
  function priority(errors, attempts) { return (errors + 1) / (attempts + 4); }

  function grammarKey(question) {
    const hep = question.hep || {};
    return JSON.stringify([
      hep.family || question.rule, hep.mechanism_id || 'UNK',
      hep.detail_id || 'UNK', hep.tense_id || 'UNK',
    ]);
  }

  function shuffle(values, random) {
    const result = values.slice();
    const rng = typeof random === 'function' ? random : Math.random;
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(rng() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function masteryFor(ruleId, mastery) {
    const raw = mastery && mastery[ruleId] ? mastery[ruleId] : {};
    const total = Number.isFinite(Number(raw.total)) ? Math.max(0, Number(raw.total)) : 0;
    const correct = Number.isFinite(Number(raw.correct)) ? Math.min(total, Math.max(0, Number(raw.correct))) : 0;
    return {
      total,
      correct,
      errors: total - correct,
      successRate: total ? correct / total : null,
    };
  }

  function rankThemes(questions, rules, mastery, random) {
    const available = new Set(
      (Array.isArray(questions) ? questions : [])
        .filter((question) => question && question.rule)
        .map((question) => String(question.rule))
    );
    const order = new Map(
      (Array.isArray(rules) ? rules : []).map((rule, index) => [String(rule.id), index])
    );
    const stats = Array.from(available).map((ruleId) => Object.assign(
      { ruleId, order: order.has(ruleId) ? order.get(ruleId) : Number.MAX_SAFE_INTEGER },
      masteryFor(ruleId, mastery)
    ));
    const weak = stats.filter((item) => item.errors > 0).sort((a, b) =>
      priority(b.errors, b.total) - priority(a.errors, a.total) ||
      b.errors - a.errors ||
      b.total - a.total ||
      a.order - b.order
    );
    const undiscovered = shuffle(stats.filter((item) => item.total === 0), random);
    const successful = stats.filter((item) => item.total > 0 && item.errors === 0).sort((a, b) =>
      a.successRate - b.successRate ||
      a.total - b.total ||
      a.order - b.order
    );
    return weak.concat(undiscovered, successful);
  }

  function makePool(matching, seen, random) {
    const unseen = shuffle(matching.filter((question) => !seen.has(question.id)), random);
    const alreadySeen = shuffle(matching.filter((question) => seen.has(question.id)), random);
    return unseen.concat(alreadySeen);
  }

  function build(options) {
    const settings = options || {};
    const questions = Array.from(new Map((Array.isArray(settings.questions) ? settings.questions : [])
      .filter((q) => q && q.id && q.rule).map((q) => [q.id, q])).values());
    const limit = Number.isFinite(settings.limit) ? Math.max(0, Math.floor(settings.limit)) : DEFAULT_LIMIT;
    const themeCount = Number.isFinite(settings.themeCount)
      ? Math.max(1, Math.floor(settings.themeCount)) : DEFAULT_THEME_COUNT;
    const random = typeof settings.random === 'function' ? settings.random : Math.random;
    const seen = settings.seenIds instanceof Set
      ? settings.seenIds
      : new Set(Array.isArray(settings.seenIds) ? settings.seenIds : []);
    const history = Array.isArray(settings.history) ? settings.history : [];
    const byId = new Map(questions.map((q) => [q.id, q]));
    const flagged = new Set(history.flatMap((entry) => entry && Array.isArray(entry.log) ? entry.log : [])
      .filter((attempt) => attempt && attempt.deletionRequested && byId.has(attempt.id)
        && (attempt.progressRevision || 0) === (byId.get(attempt.id).progress_revision || 0))
      .map((attempt) => attempt.id));
    // Un changement de clé ou une suppression ne doit pas renforcer une difficulté.
    const compatibleHistory = history.filter((entry) => entry && Array.isArray(entry.log)).map((entry) => ({
      ...entry,
      log: entry.log.filter((attempt) => {
        const q = attempt && byId.get(attempt.id);
        return q && !flagged.has(q.id) && (attempt.answer || attempt.expected) === q.answer
          && (attempt.progressRevision || 0) === (q.progress_revision || 0)
          && (!attempt.rule || attempt.rule === q.rule);
      }),
    }));
    const profile = settings.errorProfile && settings.errorProfile.build(compatibleHistory, questions);
    const rows = new Map((profile ? profile.rows : []).map((row) => [
      settings.errorProfile.rowKey(row), row,
    ]));
    const eligible = questions.filter((q) => !flagged.has(q.id));
    const grouped = new Map();
    eligible.forEach((q) => {
      const key = grammarKey(q);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(q);
    });
    const groups = Array.from(grouped, ([key, items]) => {
      const row = rows.get(key);
      // Repli familial seulement pour les appareils sans journal détaillé.
      const legacy = history.length ? { total: 0, errors: 0 } : masteryFor(items[0].rule, settings.mastery);
      const attempts = row ? row.recentAttempts : legacy.total;
      const errors = row ? row.recentErrors : legacy.errors;
      return { key, ruleId: items[0].rule, errors, attempts,
        weight: priority(errors, attempts), pool: makePool(items, seen, random), count: 0 };
    });
    const chosen = [];
    const target = Math.min(limit, eligible.length);
    const focused = Math.floor(target * 0.8);
    const cap = Math.max(1, Math.ceil(target / themeCount));
    for (let index = 0; index < target; index += 1) {
      let candidates = groups.filter((group) => group.pool.length);
      if (index < focused && candidates.some((group) => group.errors > 0)) {
        candidates = candidates.filter((group) => group.errors > 0);
      }
      const underCap = candidates.filter((group) => group.count < cap);
      if (underCap.length) candidates = underCap;
      const weights = candidates.map((group) =>
        (index < focused ? group.weight : 1) / (1 + group.count));
      let draw = random() * weights.reduce((sum, weight) => sum + weight, 0);
      let selected = candidates[candidates.length - 1];
      for (let i = 0; i < candidates.length; i += 1) {
        draw -= weights[i];
        if (draw < 0) { selected = candidates[i]; break; }
      }
      chosen.push(selected.pool.shift());
      selected.count += 1;
    }

    const mixed = shuffle(chosen, random);
    const chosenRules = new Set(mixed.map((question) => question.rule));
    return {
      questions: mixed,
      themeIds: Array.from(chosenRules),
      rankedThemes: rankThemes(eligible, settings.rules, settings.mastery, random),
    };
  }

  return { build, masteryFor, rankThemes, grammarKey };
}));
