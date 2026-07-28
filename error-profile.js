(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HEP_ERROR_PROFILE = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 'hep-local-error-profile/1.0';

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

  function validDate(value) {
    const timestamp = Date.parse(value || '');
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
  }

  function build(history) {
    const rows = new Map();
    const sessions = (Array.isArray(history) ? history : [])
      .filter((entry) => entry && Array.isArray(entry.log))
      .slice()
      .sort((a, b) => Date.parse(a.date || 0) - Date.parse(b.date || 0));

    sessions.forEach((entry) => {
      const touched = new Map();
      const sessionDate = validDate(entry.date);

      entry.log.forEach((attempt) => {
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
