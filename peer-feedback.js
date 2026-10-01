(function (root) {
  'use strict';
  // Shared remarks deliberately contain no answers, scores or personal history.
  function build(entries, bankRelease, feedbackId) {
    const reports = [];
    for (const entry of entries || []) {
      for (const item of entry.log || []) {
        const comment = String(item.memo || '').trim();
        if (!comment && !item.like && !item.deletionRequested) continue;
        reports.push({ question_id: String(item.id), comment,
          positive_feedback: !!item.like, deletion_requested: !!item.deletionRequested });
      }
    }
    if (!reports.length) return null;
    return { schema_version: 'hep-peer-feedback/1.0', feedback_id: feedbackId,
      bank_release: String(bankRelease || 'UNK'), reports };
  }
  function markdown(payload) {
    return '# Remarques sur les questions QCM Français\n\n' +
      'Cet envoi contient uniquement les remarques sur les questions, sans résultats personnels.\n\n' +
      '```json hep-peer-feedback/1.0\n' + JSON.stringify(payload, null, 2) + '\n```\n';
  }
  function formLink(config, payload) {
    if (!config || !payload) return null;
    let url;
    try { url = new URL(config.url); } catch (_) { return null; }
    if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' ||
        !/^\/forms\/d\/e\/[^/]+\/viewform$/.test(url.pathname)) return null;
    for (const key of ['question', 'comment', 'release']) {
      if (!/^entry\.\d+$/.test(config[key] || '')) return null;
    }
    const text = payload.reports.map((r) => {
      const flags = [r.positive_feedback ? 'Question appréciée.' : '',
        r.deletion_requested ? 'Suppression proposée : à vérifier.' : ''].filter(Boolean).join(' ');
      return (payload.reports.length > 1 ? r.question_id + ' : ' : '') +
        [r.comment, flags].filter(Boolean).join('\n');
    }).join('\n\n');
    url.searchParams.set('usp', 'pp_url');
    url.searchParams.set(config.question, payload.reports.map(r => r.question_id).join(', '));
    url.searchParams.set(config.comment, text);
    url.searchParams.set(config.release, payload.bank_release);
    return url.href;
  }
  const api = { build, markdown, formLink };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HEP_PEER_FEEDBACK = api;
})(typeof window !== 'undefined' ? window : globalThis);
