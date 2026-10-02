(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HEP_QUESTION_PROGRESS = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const KEY = 'qcm-progress-revisions-v1';
  function revision(question) { return question.progress_revision || 0; }
  function compatible(attempt, question) {
    return !!attempt && !!question && (attempt.progressRevision || 0) === revision(question);
  }
  function resetChanged(storage, questions) {
    const read = (key, fallback) => {
      try { return JSON.parse(storage.getItem(key)) || fallback; }
      catch (_) { return fallback; }
    };
    const previous = read(KEY, {});
    const changed = questions.filter(q => revision(q) > (previous[q.id] || 0));
    if (!changed.length) return;
    const ids = new Set(changed.map(q => q.id));
    const rules = new Set(changed.map(q => q.rule));
    const byId = new Map(questions.map(q => [q.id, q]));
    const seen = read('qcm-seen-v1', []).filter(id => !ids.has(id));
    const review = read('qcm-review-v1', {});
    ids.forEach(id => { delete review[id]; });
    const mastery = read('qcm-mastery-v1', {});
    // Rebuild only affected families from provable, completed attempts. Old
    // aggregate-only counters cannot tell which question earned the points.
    rules.forEach(rule => { mastery[rule] = { correct: 0, total: 0 }; });
    const sessions = new Set();
    read('qcm-op001-history-v1', []).forEach(entry => {
      const session = entry.sessionId || entry.session_id;
      if (session && sessions.has(session)) return;
      if (session) sessions.add(session);
      (entry.log || []).forEach(attempt => {
        const q = byId.get(attempt.id);
        if (!q || !rules.has(q.rule) || !compatible(attempt, q)
            || (attempt.answer || attempt.expected) !== q.answer
            || (attempt.rule && attempt.rule !== q.rule)
            || typeof attempt.correct !== 'boolean') return;
        mastery[q.rule].total++;
        if (attempt.correct) mastery[q.rule].correct++;
      });
    });
    storage.setItem('qcm-seen-v1', JSON.stringify(seen));
    storage.setItem('qcm-review-v1', JSON.stringify(review));
    storage.setItem('qcm-mastery-v1', JSON.stringify(mastery));
    changed.forEach(q => { previous[q.id] = revision(q); });
    // Commit this marker last: an interrupted migration is safe to replay.
    storage.setItem(KEY, JSON.stringify(previous));
  }
  return { revision, compatible, resetChanged };
}));
