(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HEP_ERROR_PROFILE = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 'hep-local-error-profile/1.2';

  function valueOrUnknown(value) {
    return value == null || value === '' ? 'UNK' : String(value);
  }

  function rowKey(attempt) {
    return JSON.stringify([
      valueOrUnknown(attempt.family),
      valueOrUnknown(attempt.mechanismId),
      valueOrUnknown(attempt.detailId),
      valueOrUnknown(attempt.tenseId),
    ]);
  }

  function isKnown(value) {
    return value != null && value !== '' && value !== 'UNK';
  }

  function questionIndex(questions) {
    return new Map(
      (Array.isArray(questions) ? questions : [])
        .filter((question) => question && question.id)
        .map((question) => [String(question.id), question])
    );
  }

  function enrichFromCurrentBank(attempt, byId) {
    if (!attempt) return attempt;
    const question = byId.get(String(attempt.id || ''));
    if (!question) return attempt;
    const expected = String(attempt.answer || attempt.expected || '');
    const currentAnswer = String(question.answer || '');
    const attemptRule = String(attempt.rule || '');
    const currentRule = String(question.rule || '');
    const sameQuestion = (
      expected
      && currentAnswer
      && expected === currentAnswer
      && currentRule
      && (!attemptRule || attemptRule === currentRule)
    );
    if (!sameQuestion) return attempt;

    const hep = question.hep || {};
    const selected = String(attempt.selected || '');
    const bankMisconception = (
      hep.option_misconceptions
      && ['1', '2', '3', '4'].includes(selected)
      && selected !== currentAnswer
    )
      ? hep.option_misconceptions[selected]
      : null;
    // La séance garde son instantané brut dans l'historique. Pour le tableau
    // courant, une question dont la clé et la carte concordent reçoit toutefois
    // la taxonomie active, afin d'éviter deux lignes après un renommage de règle.
    return Object.assign({}, attempt, {
      family: isKnown(hep.family) ? hep.family : attempt.family,
      mechanismId: isKnown(hep.mechanism_id)
        ? hep.mechanism_id
        : attempt.mechanismId,
      detailId: isKnown(hep.detail_id) ? hep.detail_id : attempt.detailId,
      tenseId: isKnown(hep.tense_id) ? hep.tense_id : attempt.tenseId,
      misconceptionId: isKnown(attempt.misconceptionId)
        ? attempt.misconceptionId
        : bankMisconception,
    });
  }

  function validDate(value) {
    const timestamp = Date.parse(value || '');
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
  }

  function build(history, questions) {
    const rows = new Map();
    const byId = questionIndex(questions);
    const sessions = (Array.isArray(history) ? history : [])
      .filter((entry) => entry && Array.isArray(entry.log))
      .slice()
      .sort((a, b) => Date.parse(a.date || 0) - Date.parse(b.date || 0));

    sessions.forEach((entry) => {
      const touched = new Map();
      const sessionDate = validDate(entry.date);

      entry.log.forEach((rawAttempt) => {
        const attempt = enrichFromCurrentBank(rawAttempt, byId);
        if (!attempt) return;
        const key = rowKey(attempt);
        let row = rows.get(key);
        if (!row) {
          row = {
            family: valueOrUnknown(attempt.family),
            mechanismId: valueOrUnknown(attempt.mechanismId),
            detailId: valueOrUnknown(attempt.detailId),
            tenseId: valueOrUnknown(attempt.tenseId),
            attempts: 0,
            correct: 0,
            errors: 0,
            sessions: 0,
            errorSessions: 0,
            currentCorrectStreak: 0,
            lastSeen: null,
            lastError: null,
            questionIds: new Set(),
            errorQuestionIds: new Set(),
            distractors: new Map(),
          };
          rows.set(key, row);
        }

        const isCorrect = attempt.correct === true;
        row.attempts += 1;
        if (isCorrect) {
          row.correct += 1;
          row.currentCorrectStreak += 1;
        } else {
          row.errors += 1;
          if (attempt.id) row.errorQuestionIds.add(String(attempt.id));
          row.currentCorrectStreak = 0;
          if (sessionDate) row.lastError = sessionDate;
          const misconceptionId = valueOrUnknown(attempt.misconceptionId);
          const selected = valueOrUnknown(attempt.selected);
          const distractorKey = JSON.stringify([misconceptionId, selected]);
          const distractor = row.distractors.get(distractorKey) || {
            misconceptionId,
            selected,
            count: 0,
          };
          distractor.count += 1;
          row.distractors.set(distractorKey, distractor);
        }
        if (sessionDate) row.lastSeen = sessionDate;
        if (attempt.id) row.questionIds.add(String(attempt.id));

        const sessionState = touched.get(key) || { hadError: false };
        if (!isCorrect) sessionState.hadError = true;
        touched.set(key, sessionState);
      });

      touched.forEach((sessionState, key) => {
        const row = rows.get(key);
        row.sessions += 1;
        if (sessionState.hadError) row.errorSessions += 1;
      });
    });

    const normalizedRows = Array.from(rows.values()).map((row) => ({
      family: row.family,
      mechanismId: row.mechanismId,
      detailId: row.detailId,
      tenseId: row.tenseId,
      attempts: row.attempts,
      correct: row.correct,
      errors: row.errors,
      errorRate: row.attempts ? row.errors / row.attempts : 0,
      sessions: row.sessions,
      errorSessions: row.errorSessions,
      currentCorrectStreak: row.currentCorrectStreak,
      lastSeen: row.lastSeen,
      lastError: row.lastError,
      questionIds: Array.from(row.questionIds).sort(),
      errorQuestionIds: Array.from(row.errorQuestionIds).sort(),
      distractors: Array.from(row.distractors.values()).sort((a, b) =>
        b.count - a.count ||
        a.misconceptionId.localeCompare(b.misconceptionId, 'fr') ||
        a.selected.localeCompare(b.selected, 'fr')
      ),
    }));

    normalizedRows.sort((a, b) =>
      b.errors - a.errors ||
      b.errorRate - a.errorRate ||
      String(b.lastError || '').localeCompare(String(a.lastError || '')) ||
      a.mechanismId.localeCompare(b.mechanismId, 'fr')
    );

    const attempts = normalizedRows.reduce((sum, row) => sum + row.attempts, 0);
    const errors = normalizedRows.reduce((sum, row) => sum + row.errors, 0);
    const knownErrors = normalizedRows
      .filter((row) => row.family !== 'UNK' && row.mechanismId !== 'UNK')
      .reduce((sum, row) => sum + row.errors, 0);

    return {
      schemaVersion: SCHEMA_VERSION,
      sessions: sessions.length,
      attempts,
      errors,
      errorRate: attempts ? errors / attempts : 0,
      knownErrors,
      rows: normalizedRows,
    };
  }

  return { SCHEMA_VERSION, build, rowKey };
}));
