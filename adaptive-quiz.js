(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HEP_ADAPTIVE_QUIZ = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const DEFAULT_THEME_COUNT = 5;
  const DEFAULT_LIMIT = 20;
  const QUOTAS = [6, 5, 4, 3, 2];

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
    const total = Math.max(0, Number(raw.total) || 0);
    const correct = Math.min(total, Math.max(0, Number(raw.correct) || 0));
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
      a.successRate - b.successRate ||
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

  function makePool(questions, ruleId, seen, random) {
    const matching = questions.filter((question) => question.rule === ruleId);
    const unseen = shuffle(matching.filter((question) => !seen.has(question.id)), random);
    const alreadySeen = shuffle(matching.filter((question) => seen.has(question.id)), random);
    return unseen.concat(alreadySeen);
  }

  function build(options) {
    const settings = options || {};
    const questions = Array.isArray(settings.questions) ? settings.questions.filter(Boolean) : [];
    const limit = Math.max(1, Number(settings.limit) || DEFAULT_LIMIT);
    const themeCount = Math.max(1, Number(settings.themeCount) || DEFAULT_THEME_COUNT);
    const random = typeof settings.random === 'function' ? settings.random : Math.random;
    const seen = settings.seenIds instanceof Set
      ? settings.seenIds
      : new Set(Array.isArray(settings.seenIds) ? settings.seenIds : []);
    const ranked = rankThemes(questions, settings.rules, settings.mastery, random);
    const selectedStats = ranked.slice(0, Math.min(themeCount, ranked.length));
    const pools = new Map(
      ranked.map((item) => [item.ruleId, makePool(questions, item.ruleId, seen, random)])
    );
    const chosen = [];

    selectedStats.forEach((item, index) => {
      const pool = pools.get(item.ruleId);
      const quota = QUOTAS[index] || 1;
      while (chosen.length < limit && pool.length && chosen.filter((q) => q.rule === item.ruleId).length < quota) {
        chosen.push(pool.shift());
      }
    });

    // Redistribue les places laissées par une petite famille, sans abandonner
    // les thèmes prioritaires. Les autres thèmes ne servent qu'en dernier recours.
    const fillOrder = selectedStats.concat(ranked.slice(selectedStats.length));
    while (chosen.length < limit) {
      let added = false;
      fillOrder.forEach((item) => {
        if (chosen.length >= limit) return;
        const pool = pools.get(item.ruleId);
        if (pool && pool.length) {
          chosen.push(pool.shift());
          added = true;
        }
      });
      if (!added) break;
    }

    const mixed = shuffle(chosen, random);
    const chosenRules = new Set(mixed.map((question) => question.rule));
    return {
      questions: mixed,
      themeIds: ranked.filter((item) => chosenRules.has(item.ruleId)).map((item) => item.ruleId),
      rankedThemes: ranked,
    };
  }

  return { build, masteryFor, rankThemes };
}));
