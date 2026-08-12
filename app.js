(function () {
  'use strict';

  const APP = document.getElementById('app');
  const HISTORY_KEY = 'qcm-op001-history-v1';
  const MIX_ID = 'mix';
  const APP_VERSION = (window.CONFIG && CONFIG.APP_VERSION) || '';
  const BANK_RELEASE = (window.CONFIG && CONFIG.BANK_RELEASE) || 'UNK';
  const PEDAGOGY = window.HEP_PEDAGOGY;
  const ERROR_PROFILE = window.HEP_ERROR_PROFILE;

  let state = { view: 'home' };

  // ---------- persistence ----------
  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveAttempt(entry) {
    const h = loadHistory();
    h.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  }

  // ---------- notes en attente (mémos/pouces conservés en local, envoi groupé plus tard) ----------
  // Chaque séance commentée (mémo ou 👍) est gardée ici, indépendamment du fait
  // qu'on ait réussi ou non à l'envoyer sur Drive tout de suite. On peut ainsi
  // écrire des notes sur plusieurs séances (même hors ligne / Drive en panne)
  // et tout envoyer en un seul lot quand on veut, depuis l'accueil.
  const PENDING_KEY = 'qcm-pending-feedback-v1';
  function loadPending() {
    try { return JSON.parse(localStorage.getItem(PENDING_KEY)) || []; }
    catch (e) { return []; }
  }
  function savePending(list) { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); }
  function pushPending(item) {
    const list = loadPending();
    const index = list.findIndex((pending) => pending.id === item.id);
    if (index >= 0) list[index] = item;
    else list.push(item);
    savePending(list);
  }
  function removePending(id) {
    savePending(loadPending().filter((p) => p.id !== id));
  }
  function clearPending() { localStorage.removeItem(PENDING_KEY); }

  // Fusionne toutes les notes en attente en un seul document Markdown à envoyer d'un coup.
  function buildCombinedFeedback(list) {
    const lines = [];
    lines.push(`# Feedback QCM — lot de ${list.length} séance(s)`);
    lines.push(`Généré le ${new Date().toLocaleString('fr-CH')}`);
    list.forEach((p, i) => {
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push(`## Séance ${i + 1}/${list.length} — ${new Date(p.date).toLocaleString('fr-CH')}`);
      lines.push(p.feedback);
    });
    return lines.join('\n');
  }
  function combinedFeedbackFilename() {
    const d = new Date();
    return `qcm-feedback-bundle--${utcCompact(d)}--${randomHex8()}.md`;
  }

  // ---------- suivi des questions déjà vues (par id, dans le navigateur) ----------
  const SEEN_KEY = 'qcm-seen-v1';
  function loadSeen() {
    try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY)) || []); }
    catch (e) { return new Set(); }
  }
  function markSeen(id) {
    const s = loadSeen();
    s.add(id);
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(s)));
  }
  function resetSeen() { localStorage.removeItem(SEEN_KEY); }
  function seenCount(ruleId, mechanismId, detailId) {
    const s = loadSeen();
    let pool = ruleId === MIX_ID ? QUESTIONS : QUESTIONS.filter((q) => q.rule === ruleId);
    if (mechanismId) {
      pool = pool.filter((q) => q.hep && q.hep.mechanism_id === mechanismId);
    }
    if (detailId) {
      pool = pool.filter((q) => q.hep && q.hep.detail_id === detailId);
    }
    return { seen: pool.filter((q) => s.has(q.id)).length, total: pool.length };
  }

  function statsForRule(ruleId) {
    const h = loadHistory().filter((a) => a.ruleId === ruleId);
    if (h.length === 0) return null;
    const last = h[h.length - 1];
    const best = h.reduce((m, a) => (a.correct / a.total > m.correct / m.total ? a : m), h[0]);
    return { attempts: h.length, last, best };
  }

  // ---------- helpers ----------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === 'class') e.className = attrs[k];
        else if (k === 'text') e.textContent = attrs[k];
        else e.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach((c) => c && e.appendChild(c));
    return e;
  }

  function appendTechnicalTerm(list, label, value) {
    list.appendChild(el('dt', { text: label }));
    list.appendChild(el('dd', { text: value }));
  }

  function pedagogyTechnicalPanel(description, misconceptions, extra) {
    const details = el('details', { class: 'pedagogy-technical' });
    details.appendChild(el('summary', { text: 'Catégorie technique' }));
    const list = el('dl', { class: 'pedagogy-taxonomy' });
    appendTechnicalTerm(
      list,
      'Famille',
      `${description.familyLabel} · ${description.familyId || 'UNK'}`
    );
    appendTechnicalTerm(
      list,
      'Mécanisme',
      `${description.mechanismLabel} · ${description.mechanismId || 'UNK'}`
    );
    appendTechnicalTerm(
      list,
      'Détail',
      description.detailId
        ? `${description.detailLabel || description.detailId} · ${description.detailId}`
        : 'non renseigné'
    );
    appendTechnicalTerm(
      list,
      'Temps',
      description.tenseId
        ? `${description.tenseLabel || description.tenseId} · ${description.tenseId}`
        : 'non renseigné'
    );
    const misconceptionText = (misconceptions || []).length
      ? misconceptions.map((item) => {
        const id = item.misconceptionId || item.id || 'UNK';
        const count = item.count || 0;
        return `${id === 'UNK' ? 'non renseignée' : id}${count ? ` (× ${count})` : ''}`;
      }).join(', ')
      : 'non renseignée';
    appendTechnicalTerm(list, 'Cause enregistrée (code interne)', misconceptionText);
    if (description.path && description.path.length) {
      appendTechnicalTerm(list, 'Chemin canonique', description.path.join(' → '));
    }
    if (extra) appendTechnicalTerm(list, extra.label, extra.value);
    details.appendChild(list);
    return details;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
  }

  function utcCompact(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  }

  function randomHex8() {
    if (window.crypto && window.crypto.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0].toString(16).padStart(8, '0');
    }
    return Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');
  }

  function makeTraceId(kind, date) {
    return `hep-${kind}1-${utcCompact(date)}-${randomHex8()}`;
  }

  function tsvCell(value) {
    return String(value == null ? '' : value).replace(/[\t\r\n]/g, ' ');
  }

  function ruleLabel(ruleId) {
    if (ruleId === MIX_ID) return 'Toutes les règles (mélangées)';
    if (ruleId === 'review') return 'Révision des erreurs';
    if (ruleId === 'exam') return 'Examen blanc';
    const r = RULES.find((r) => r.id === ruleId);
    return r ? r.label : ruleId;
  }

  function sessionLabel(ruleId, mechanismId, detailId) {
    if (
      ruleId === 'participe'
      && mechanismId
      && PEDAGOGY
    ) {
      return `Accord du participe passé — ${PEDAGOGY.describe(
        'accord_participe_passe',
        mechanismId,
        null,
        detailId
      ).learnerTitle}`;
    }
    return ruleLabel(ruleId);
  }

  // ---------- révision des erreurs (répétition espacée légère) ----------
  // qcm-review-v1 = { qid: nbBonnesRéponsesConsécutives }. La présence d'un id
  // = question à revoir ; on l'en retire après 2 bonnes réponses d'affilée.
  const REVIEW_KEY = 'qcm-review-v1';
  function loadReview() {
    try { return JSON.parse(localStorage.getItem(REVIEW_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveReview(r) { localStorage.setItem(REVIEW_KEY, JSON.stringify(r)); }
  function reviewCount() { return Object.keys(loadReview()).length; }

  // ---------- maîtrise par règle (cumul de toutes les réponses) ----------
  const MASTERY_KEY = 'qcm-mastery-v1';
  function loadMastery() {
    try { return JSON.parse(localStorage.getItem(MASTERY_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveMastery(m) { localStorage.setItem(MASTERY_KEY, JSON.stringify(m)); }

  // Enregistre UNE réponse dans les stockages persistants (vu, maîtrise, erreurs).
  function recordAnswer(q, key) {
    const correct = key === q.answer;
    markSeen(q.id);
    const m = loadMastery();
    const r = m[q.rule] || { correct: 0, total: 0 };
    r.total++;
    if (correct) r.correct++;
    m[q.rule] = r;
    saveMastery(m);
    const rv = loadReview();
    if (!correct) {
      rv[q.id] = 0; // (re)mise dans la pile à revoir
    } else if (q.id in rv) {
      rv[q.id]++;
      if (rv[q.id] >= 2) delete rv[q.id]; // maîtrisée : sort de la pile
    }
    saveReview(rv);
  }

  // Une séance = au plus 20 questions tirées au hasard dans le pool
  // (les règles à 40 questions et le mix varient donc d'une séance à l'autre).
  const SESSION_SIZE = 20;

  function questionsForRule(ruleId, mechanismId, detailId) {
    let pool = ruleId === MIX_ID ? QUESTIONS : QUESTIONS.filter((q) => q.rule === ruleId);
    if (mechanismId) {
      pool = pool.filter((q) => q.hep && q.hep.mechanism_id === mechanismId);
    }
    if (detailId) {
      pool = pool.filter((q) => q.hep && q.hep.detail_id === detailId);
    }
    // Priorité aux questions jamais vues ; on ne repioche dans les vues
    // qu'une fois toutes les nouvelles épuisées.
    const s = loadSeen();
    const unseen = shuffle(pool.filter((q) => !s.has(q.id)));
    const seen = shuffle(pool.filter((q) => s.has(q.id)));
    return unseen.concat(seen).slice(0, SESSION_SIZE);
  }

  // ---------- Google Drive (scope drive.file : l'app ne voit que ses fichiers) ----------
  const DRIVE = {
    token: null,
    tokenClient: null,
    configured() {
      return !!(window.CONFIG && CONFIG.GOOGLE_CLIENT_ID);
    },
    available() {
      return this.configured() && typeof google !== 'undefined' && google.accounts && google.accounts.oauth2;
    },
    connect() {
      return new Promise((resolve, reject) => {
        if (!this.available()) return reject(new Error('Google Identity non chargé ou ID client manquant.'));
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CONFIG.GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: (resp) => {
            if (resp && resp.access_token) {
              this.token = resp.access_token;
              resolve(resp.access_token);
            } else {
              reject(new Error('Autorisation refusée.'));
            }
          },
        });
        this.tokenClient.requestAccessToken({ prompt: this.token ? '' : 'consent' });
      });
    },
    // Construit un message d'erreur exploitable à partir d'une réponse Google
    // non-OK (au lieu de juste montrer le code HTTP, on remonte la vraie raison).
    async explainError(res, context) {
      let reason = '';
      try {
        const data = await res.json();
        reason = (data.error && (data.error.message || (data.error.errors && data.error.errors[0] && data.error.errors[0].reason))) || '';
      } catch (e) { /* réponse non-JSON, on garde juste le code */ }
      let hint = '';
      if (res.status === 403) {
        hint = reason.toLowerCase().indexOf('disabled') !== -1 || reason.toLowerCase().indexOf('has not been used') !== -1
          ? ' → l\'API Google Drive n\'est probablement pas activée sur le projet Google Cloud.'
          : ' → vérifie que le scope drive.file est bien accepté (écran de consentement OAuth → Accès aux données).';
      }
      return new Error(`${context} (${res.status})${reason ? ' : ' + reason : ''}${hint}`);
    },
    async findOrCreateFolder(name) {
      const q = encodeURIComponent(`name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
        headers: { Authorization: 'Bearer ' + this.token },
      });
      if (!res.ok) throw await this.explainError(res, 'Recherche du dossier Drive échouée');
      const data = await res.json();
      if (data.files && data.files.length) return data.files[0].id;
      const create = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
      });
      if (!create.ok) throw await this.explainError(create, 'Création du dossier Drive échouée');
      const folder = await create.json();
      return folder.id;
    },
    async upload(filename, content) {
      const folderId = await this.findOrCreateFolder((window.CONFIG && CONFIG.DRIVE_FOLDER_NAME) || 'QCM Français OP001');
      const metadata = { name: filename, parents: [folderId], mimeType: 'text/markdown' };
      const boundary = 'qcm' + Date.now();
      const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\nContent-Type: text/markdown\r\n\r\n` +
        content +
        `\r\n--${boundary}--`;
      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + this.token, 'Content-Type': 'multipart/related; boundary=' + boundary },
        body,
      });
      if (!res.ok) throw await this.explainError(res, 'Envoi du fichier échoué');
      return res.json();
    },
  };

  function feedbackFilename(entry) {
    if (entry.sessionId && entry.quizId) {
      return `qcm-feedback--${entry.sessionId}--${entry.quizId}.md`;
    }
    const d = new Date(entry.date);
    const p = (n) => String(n).padStart(2, '0');
    return `qcm-feedback-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.md`;
  }

  function downloadFeedback(entry) {
    const blob = new Blob([entry.feedback], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = feedbackFilename(entry);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function render() {
    APP.innerHTML = '';
    if (state.view === 'home') APP.appendChild(renderHome());
    else if (state.view === 'quiz') APP.appendChild(renderQuiz());
    else if (state.view === 'result') APP.appendChild(renderResult());
    else if (state.view === 'history') APP.appendChild(renderHistory());
    else if (state.view === 'pending') APP.appendChild(renderPending());
    else if (state.view === 'errors') APP.appendChild(renderErrorDashboard());
  }

  function appendRuleProgress(card, rule, mastery) {
    const stats = statsForRule(rule.id);
    const mr = mastery[rule.id];
    if (mr && mr.total > 0) {
      const mp = Math.round((mr.correct / mr.total) * 100);
      card.appendChild(el('div', { class: 'rule-stats', text: `Maîtrise : ${mp}% (${mr.correct}/${mr.total})` }));
    } else if (stats) {
      card.appendChild(el('div', { class: 'rule-stats', text: `Meilleur : ${stats.best.correct}/${stats.best.total}` }));
    } else {
      card.appendChild(el('div', { class: 'rule-stats', text: 'Pas encore tenté' }));
    }
    const sc = seenCount(rule.id);
    card.appendChild(el('div', { class: 'seen-stats', text: `Vues : ${sc.seen}/${sc.total}` }));
  }

  function activeParticipleCases() {
    const counts = {};
    QUESTIONS.forEach((question) => {
      const mechanismId = question.rule === 'participe'
        && question.hep
        && question.hep.mechanism_id;
      const detailId = question.hep && question.hep.detail_id;
      if (!mechanismId || mechanismId === 'UNK' || !detailId || detailId === 'UNK') return;
      const caseId = `${mechanismId}/${detailId}`;
      if (PEDAGOGY.NON_DISCRIMINANT_PARTICIPLE_CASES.has(caseId)) return;
      counts[caseId] = (counts[caseId] || 0) + 1;
    });
    return counts;
  }

  function renderParticipleCase(caseId, count) {
    const [mechanismId, detailId] = caseId.split('/');
    const description = PEDAGOGY.describe('accord_participe_passe', mechanismId, null, detailId);
    const sc = seenCount('participe', mechanismId, detailId);
    const details = el('details', { class: 'participle-case' });
    details.appendChild(el('summary', {}, [
      el('span', {
        class: 'participle-case-title',
        text: detailId === 'core'
          ? description.learnerTitle
          : `${description.learnerTitle} — ${description.path[2]}`,
      }),
      el('span', { class: 'participle-case-count', text: `${count} question${count > 1 ? 's' : ''}` }),
    ]));

    const content = el('div', { class: 'participle-case-content' });
    content.appendChild(el('div', { class: 'participle-method-label', text: 'La règle, simplement' }));
    content.appendChild(el('div', {
      class: 'participle-rule-explanation',
      text: description.learnerExplanation,
    }));
    content.appendChild(el('div', { class: 'participle-method-label', text: 'Comment faire' }));
    const steps = el('ol', { class: 'participle-method-steps' });
    description.learnerSteps.forEach((step) => steps.appendChild(el('li', { text: step })));
    content.appendChild(steps);
    content.appendChild(el('div', {
      class: 'participle-case-progress',
      text: `Questions vues : ${sc.seen}/${sc.total}`,
    }));
    const start = el('button', {
      class: 'btn participle-start',
      text: `S’entraîner sur ce cas`,
    });
    start.addEventListener('click', () => startQuiz('participe', 'learn', mechanismId, detailId));
    content.appendChild(start);
    details.appendChild(content);
    return details;
  }

  function renderParticipleMenu(rule, mastery) {
    const accordion = el('details', { class: 'rule-accordion' });
    const summary = el('summary', { class: 'rule-card rule-card-summary' }, [
      el('div', { class: 'rule-summary-heading' }, [
        el('div', { class: 'rule-name', text: rule.label }),
        el('span', { class: 'rule-chevron', text: '⌄' }),
      ]),
      el('div', { class: 'rule-desc', text: 'Choisis un cas précis, puis consulte sa règle et sa méthode.' }),
    ]);
    appendRuleProgress(summary, rule, mastery);
    accordion.appendChild(summary);

    const panel = el('div', { class: 'participle-menu' });
    const all = el('button', { class: 'participle-all' }, [
      el('span', { class: 'participle-all-title', text: 'Tous les cas mélangés' }),
      el('span', { class: 'participle-all-desc', text: 'Entraînement général sur toute la famille.' }),
    ]);
    all.addEventListener('click', () => startQuiz(rule.id));
    panel.appendChild(all);

    const counts = activeParticipleCases();
    const rendered = new Set();
    const groups = PEDAGOGY.PARTICIPLE_MENU_GROUPS || [];
    groups.forEach((group) => {
      const active = group.cases.filter((caseId) => counts[caseId]);
      if (!active.length) return;
      panel.appendChild(el('div', { class: 'participle-group-title', text: group.label }));
      active.forEach((caseId) => {
        rendered.add(caseId);
        panel.appendChild(renderParticipleCase(caseId, counts[caseId]));
      });
    });

    const ungrouped = Object.keys(counts).filter((caseId) => !rendered.has(caseId));
    if (ungrouped.length) {
      panel.appendChild(el('div', { class: 'participle-group-title', text: 'Autres cas' }));
      ungrouped.sort().forEach((caseId) => {
        panel.appendChild(renderParticipleCase(caseId, counts[caseId]));
      });
    }
    accordion.appendChild(panel);
    return accordion;
  }

  // ---------- views ----------
  function renderHome() {
    const wrap = el('div', {});
    if (APP_VERSION) wrap.appendChild(el('div', { class: 'version-bar', text: 'v' + APP_VERSION }));
    wrap.appendChild(el('div', { class: 'header' }, [
      el('div', { class: 'title', text: 'QCM Français — OP001' }),
      el('div', { class: 'subtitle', text: 'Entraînement par règle, phrases inédites' }),
    ]));

    // Séances brutes non encore synchronisées. Le pipeline importe ensuite
    // chaque session de façon idempotente pour éviter tout double comptage.
    const nPending = loadPending().length;
    if (nPending > 0) {
      const pd = el('button', { class: 'special-card pending-card' }, [
        el('div', { class: 'rule-name', text: `📤 Séances à synchroniser (${nPending})` }),
        el('div', { class: 'rule-desc', text: 'Envoie-les pour que tes erreurs puissent peser sur les futurs quiz.' }),
      ]);
      pd.addEventListener('click', () => { state = { view: 'pending' }; render(); });
      wrap.appendChild(pd);
    }

    // Carte « Revoir mes erreurs » (uniquement s'il y a des erreurs en attente)
    const nReview = reviewCount();
    if (nReview > 0) {
      const rv = el('button', { class: 'special-card review-card' }, [
        el('div', { class: 'rule-name', text: `🎯 Revoir mes erreurs (${nReview})` }),
        el('div', { class: 'rule-desc', text: 'Seulement les questions ratées ; une question sort après 2 réussites d’affilée.' }),
      ]);
      rv.addEventListener('click', () => startReview());
      wrap.appendChild(rv);
    }

    const errorProfile = ERROR_PROFILE
      ? ERROR_PROFILE.build(loadHistory(), QUESTIONS)
      : null;
    const errorRows = errorProfile ? errorProfile.rows.filter((row) => row.errors > 0).length : 0;
    const errorCard = el('button', { class: 'special-card errors-card' }, [
      el('div', { class: 'rule-name', text: '📊 Mes erreurs' }),
      el('div', {
        class: 'rule-desc',
        text: errorProfile && errorProfile.attempts
          ? `${errorProfile.errors} erreur(s) sur ${errorProfile.attempts} réponse(s) · ${errorRows} point(s) à réviser`
          : 'Tableau cumulatif détaillé par mécanisme grammatical.',
      }),
    ]);
    errorCard.addEventListener('click', () => { state = { view: 'errors' }; render(); });
    wrap.appendChild(errorCard);

    // Carte « Examen blanc »
    const exam = el('button', { class: 'special-card exam-card' }, [
      el('div', { class: 'rule-name', text: '📝 Examen blanc' }),
      el('div', { class: 'rule-desc', text: `${EXAM_SIZE} questions en conditions réelles, correction et score à la fin.` }),
    ]);
    exam.addEventListener('click', () => startExam());
    wrap.appendChild(exam);

    const mastery = loadMastery();
    const list = el('div', { class: 'rule-list' });
    RULES.forEach((rule) => {
      if (rule.id === 'participe' && PEDAGOGY) {
        list.appendChild(renderParticipleMenu(rule, mastery));
        return;
      }
      const card = el('button', { class: 'rule-card' }, [
        el('div', { class: 'rule-name', text: rule.label }),
        el('div', { class: 'rule-desc', text: rule.desc }),
      ]);
      appendRuleProgress(card, rule, mastery);
      card.addEventListener('click', () => startQuiz(rule.id));
      list.appendChild(card);
    });
    wrap.appendChild(list);

    const mixStats = statsForRule(MIX_ID);
    const mix = el('button', { class: 'mix-card' }, [
      el('div', { class: 'rule-name', text: 'Test complet mélangé' }),
      el('div', { class: 'rule-desc', text: mixStats ? `Meilleur : ${mixStats.best.correct}/${mixStats.best.total} · Dernier : ${mixStats.last.correct}/${mixStats.last.total}` : '20 questions au hasard, toutes règles mélangées' }),
    ]);
    mix.addEventListener('click', () => startQuiz(MIX_ID));
    wrap.appendChild(mix);

    const totalSeen = seenCount(MIX_ID);
    wrap.appendChild(el('div', { class: 'seen-total', text: `Progression : ${totalSeen.seen}/${totalSeen.total} questions déjà vues` }));

    const histLink = el('div', { class: 'footer-link', text: 'Voir l’historique de mes tentatives' });
    histLink.addEventListener('click', () => { state = { view: 'history' }; render(); });
    wrap.appendChild(histLink);

    const resetLink = el('div', { class: 'footer-link', text: 'Réinitialiser les questions vues' });
    resetLink.addEventListener('click', () => {
      if (confirm('Remettre à zéro le suivi des questions déjà vues ?')) { resetSeen(); render(); }
    });
    wrap.appendChild(resetLink);

    if (DRIVE.configured()) {
      const testLink = el('div', {
        class: 'footer-link',
        text: driveTestRunning ? '⏳ Test en cours…' : '🔧 Tester la connexion Google Drive',
      });
      if (!driveTestRunning) testLink.addEventListener('click', () => { testDriveConnection(); });
      wrap.appendChild(testLink);
      if (driveTestStatus) {
        wrap.appendChild(el('div', { class: 'drive-test-status', text: driveTestStatus }));
      }
    }

    return wrap;
  }

  const EXAM_SIZE = 60; // examen blanc = 60 questions, comme le vrai OP001

  function buildSession(ruleId, mode, mechanismId, detailId, questionIds) {
    if (Array.isArray(questionIds) && questionIds.length) {
      const byId = new Map(QUESTIONS.map((question) => [question.id, question]));
      return questionIds.map((id) => byId.get(id)).filter(Boolean);
    }
    if (ruleId === 'review') {
      const ids = Object.keys(loadReview());
      return shuffle(QUESTIONS.filter((q) => ids.indexOf(q.id) !== -1)).slice(0, SESSION_SIZE);
    }
    if (mode === 'exam') {
      return shuffle(QUESTIONS.slice()).slice(0, EXAM_SIZE);
    }
    return questionsForRule(ruleId, mechanismId, detailId);
  }

  function startQuiz(ruleId, mode, mechanismId, detailId, questionIds) {
    mode = mode || 'learn';
    const startedAt = new Date();
    const questions = buildSession(ruleId, mode, mechanismId, detailId, questionIds);
    if (!questions.length) return;
    state = {
      view: 'quiz',
      ruleId,
      mechanismId: mechanismId || null,
      detailId: detailId || null,
      sourceQuestionIds: Array.isArray(questionIds) ? questionIds.slice() : null,
      mode,
      questions,
      index: 0,
      answered: false,
      selectedKey: null,
      memos: {},         // mémo écrit par question (clé = id de la question)
      likes: {},         // 👍 « bien construite » par question (clé = id)
      deletionRequests: {}, // demande de revue en vue d'une suppression (jamais automatique)
      responses: {},     // réponse choisie par question (clé = id)
      detailsOpen: {},   // panneau mémo/infos déplié par question
      recorded: new Set(), // questions déjà enregistrées (vu/maîtrise/erreurs)
      seenAtStart: loadSeen(),
      startTime: startedAt.getTime(),
      quizId: makeTraceId('q', startedAt),
      sessionId: makeTraceId('s', startedAt),
    };
    render();
  }
  function startReview() { startQuiz('review', 'learn'); }
  function startExam() { startQuiz('exam', 'exam'); }

  // ---------- test de connexion Google Drive (diagnostic, sur l'accueil) ----------
  // Statut transitoire (pas persisté) affiché pendant/après le test. Ce n'est
  // pas un simulacre : ça fait le vrai aller-retour OAuth + une vraie requête
  // à l'API Drive (recherche/création du dossier), donc un « ✅ » ici garantit
  // que l'envoi réel fonctionnera.
  let driveTestStatus = null;
  let driveTestRunning = false;
  async function testDriveConnection() {
    driveTestRunning = true;
    driveTestStatus = 'Connexion à Google Drive…';
    render();
    try {
      if (!DRIVE.token) await DRIVE.connect();
      driveTestStatus = 'Vérification de l’accès au dossier…';
      render();
      const folderId = await DRIVE.findOrCreateFolder((window.CONFIG && CONFIG.DRIVE_FOLDER_NAME) || 'QCM Français OP001');
      driveTestStatus = '✅ Connexion Drive fonctionnelle — dossier prêt (id ' + String(folderId).slice(0, 10) + '…).';
    } catch (e) {
      driveTestStatus = '❌ ' + (e.message || 'Échec du test.');
    }
    driveTestRunning = false;
    render();
  }

  function recordOnce(q, key) {
    if (state.recorded.has(q.id)) return;
    state.recorded.add(q.id);
    recordAnswer(q, key);
  }

  function formatDuration(ms) {
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m} min ${s % 60} s` : `${s} s`;
  }

  function renderQuiz() {
    const { questions, index } = state;
    const q = questions[index];
    const wrap = el('div', {});

    const nav = el('div', { class: 'top-nav' }, [
      el('button', { class: 'back', text: '← Accueil' }),
      el('span', { class: 'version-tag', text: APP_VERSION ? 'v' + APP_VERSION : '' }),
    ]);
    nav.querySelector('.back').addEventListener('click', () => { state = { view: 'home' }; render(); });
    wrap.appendChild(nav);

    const alreadySeen = state.seenAtStart && state.seenAtStart.has(q.id);
    wrap.appendChild(el('div', { class: 'quiz-meta' }, [
      // Ne pas révéler la règle pendant la réponse : elle donnerait un indice
      // de résolution avant que l'utilisateur analyse réellement l'énoncé.
      el('span', { text: 'Entraînement' }),
      el('span', {}, [
        alreadySeen ? el('span', { class: 'seen-badge', text: 'déjà vue' }) : null,
        document.createTextNode(` Question ${index + 1}/${questions.length}`),
      ]),
    ]));

    const progressPct = Math.round((index / questions.length) * 100);
    wrap.appendChild(el('div', { class: 'progress-bar' }, [
      el('div', { class: 'progress-fill', style: `width:${progressPct}%` }),
    ]));

    const card = el('div', { class: 'question-card' });
    card.appendChild(el('div', {
      class: 'question-instruction',
      text: q.type === 'sentences' ? (q.instruction || 'Quelle est la seule proposition correcte ?') : 'Complétez la phrase suivante',
    }));

    if (q.type === 'blank') {
      const stemEl = el('div', { class: 'question-stem' });
      const parts = q.stem.split('___');
      const nbBlanks = parts.length - 1;
      // Après réponse, remplit les trous avec le texte choisi. Pour une phrase
      // à plusieurs trous, l'option est du type « x / y » : on répartit chaque
      // segment (séparé par « / ») dans le trou correspondant.
      let fills = null;
      if (state.selectedKey && (state.answered || state.mode === 'exam')) {
        const chosen = q.options.find((o) => o.key === state.selectedKey);
        if (chosen && chosen.key !== 'A' && chosen.key !== 'T') {
          const segs = chosen.text.split('/').map((s) => s.trim());
          fills = segs.length === nbBlanks ? segs : parts.slice(0, nbBlanks).map(() => chosen.text);
        }
      }
      parts.forEach((part, i) => {
        stemEl.appendChild(document.createTextNode(part));
        if (i < nbBlanks) {
          const blank = el('span', { class: 'blank' });
          blank.textContent = fills ? fills[i] : '…';
          stemEl.appendChild(blank);
        }
      });
      card.appendChild(stemEl);
    }

    const optsWrap = el('div', { class: 'options' });
    q.options.forEach((opt) => {
      const btn = el('button', { class: 'option' }, [
        el('div', { class: 'option-main' }, [
          el('span', { class: 'key', text: opt.key }),
          el('span', { text: opt.text }),
        ]),
      ]);
      if (state.answered) {
        btn.classList.add('locked');
        if (opt.key === q.answer) btn.classList.add('correct');
        else if (opt.key === state.selectedKey) btn.classList.add('incorrect');
        // Explication par option (pourquoi correcte / fautive)
        if (q.why && q.why[opt.key]) {
          btn.appendChild(el('div', { class: 'option-why', text: q.why[opt.key] }));
        }
      }
      if (opt.key === state.selectedKey) btn.classList.add('selected');
      btn.addEventListener('click', () => selectAnswer(opt.key));
      optsWrap.appendChild(btn);
    });
    card.appendChild(optsWrap);

    if (state.answered) {
      const isCorrect = state.selectedKey === q.answer;
      const expl = el('div', { class: 'explanation ' + (isCorrect ? 'is-correct' : 'is-incorrect') });
      const strong = el('strong', { text: isCorrect ? 'Correct. ' : 'Incorrect. ' });
      expl.appendChild(strong);
      expl.appendChild(document.createTextNode(q.explanation));
      card.appendChild(expl);
    }

    // Outils de feedback. La suppression est une demande de revue distincte :
    // elle ne modifie ni la réponse, ni la pile d'erreurs, ni la banque.
    {
      const showDetails = state.detailsOpen[q.id] || !!state.memos[q.id];

      const toolbar = el('div', { class: 'q-toolbar' });
      if (state.mode !== 'exam') {
        const likeBtn = el('button', {
          class: 'like-btn' + (state.likes[q.id] ? ' active' : ''),
          text: state.likes[q.id] ? '👍 ✓' : '👍',
          title: 'Question bien construite',
        });
        likeBtn.addEventListener('click', () => { state.likes[q.id] = !state.likes[q.id]; render(); });
        toolbar.appendChild(likeBtn);
      }

      const deletionBtn = el('button', {
        class: 'deletion-btn' + (state.deletionRequests[q.id] ? ' active' : ''),
        text: state.deletionRequests[q.id] ? 'À supprimer ✓' : 'À supprimer',
        title: 'Demander une revue de cette question en vue de sa suppression',
        'aria-pressed': state.deletionRequests[q.id] ? 'true' : 'false',
      });
      deletionBtn.addEventListener('click', () => {
        state.deletionRequests[q.id] = !state.deletionRequests[q.id];
        render();
      });
      toolbar.appendChild(deletionBtn);

      if (state.mode !== 'exam') {
        const detBtn = el('button', { class: 'details-btn', text: (showDetails ? '▾' : '▸') + ' mémo / infos' });
        detBtn.addEventListener('click', () => { state.detailsOpen[q.id] = !showDetails; render(); });
        toolbar.appendChild(detBtn);
      }
      card.appendChild(toolbar);

      if (state.mode !== 'exam' && showDetails) {
        const memoWrap = el('div', { class: 'memo-wrap' });
        memoWrap.appendChild(el('label', { class: 'memo-label', text: '💬 Mémo pour Claude (facultatif) — « trop facile », « ambigu », « le distracteur 2 marche aussi »…' }));
        const memoField = el('textarea', { class: 'memo-field', rows: '2', placeholder: 'Ton idée de correction sur cette question…' });
        memoField.value = state.memos[q.id] || '';
        memoField.addEventListener('input', (e) => { state.memos[q.id] = e.target.value; });
        memoWrap.appendChild(memoField);
        if (q.gen) {
          memoWrap.appendChild(el('div', {
            class: 'gen-tag',
            text: `✍️ ${q.gen.model} · réflexion ${q.gen.thinking}${q.gen.tracked ? '' : ' (approx.)'}`,
          }));
        }
        card.appendChild(memoWrap);
      }
    }

    wrap.appendChild(card);

    const canAdvance = state.mode === 'exam' ? !!state.selectedKey : state.answered;
    if (canAdvance) {
      const isLast = index === questions.length - 1;
      const nextBtn = el('button', { class: 'btn', text: isLast ? 'Voir les résultats' : 'Question suivante' });
      nextBtn.style.marginTop = '16px';
      nextBtn.addEventListener('click', nextQuestion);
      wrap.appendChild(nextBtn);
    }

    return wrap;
  }

  function selectAnswer(key) {
    const q = state.questions[state.index];
    if (state.mode === 'exam') {
      // Examen blanc : pas de correction immédiate, réponse modifiable jusqu'à « Suivant ».
      state.selectedKey = key;
      state.responses[q.id] = key;
      render();
      return;
    }
    if (state.answered) return;
    state.answered = true;
    state.selectedKey = key;
    state.responses[q.id] = key;
    recordOnce(q, key);
    render();
  }

  function nextQuestion() {
    if (state.mode === 'exam' && state.selectedKey) {
      recordOnce(state.questions[state.index], state.selectedKey);
    }
    if (state.index + 1 < state.questions.length) {
      state.index++;
      state.answered = false;
      state.selectedKey = null;
      render();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    // Log détaillé par question (pour le feedback à envoyer)
    const log = state.questions.map((q) => {
      const sel = state.responses[q.id] || null;
      const hep = q.hep || {};
      const optionCodes = hep.option_misconceptions || {};
      let misconception = null;
      if (sel && sel !== q.answer) {
        misconception = ['1', '2', '3', '4'].includes(sel)
          ? (typeof optionCodes[sel] === 'string' ? optionCodes[sel] : 'UNK')
          : 'UNK';
      }
      return {
        id: q.id,
        rule: q.rule,
        prompt: q.type === 'blank' ? q.stem : (q.instruction || ''),
        selected: sel,
        answer: q.answer,
        correct: sel === q.answer,
        sourceBatchId: hep.source_batch_id || null,
        family: hep.family || null,
        mechanismId: hep.mechanism_id || null,
        detailId: hep.detail_id || null,
        tenseId: hep.tense_id || null,
        misconceptionId: misconception,
        grammarConfidence: hep.family && hep.mechanism_id ? 'high' : 'unknown',
        misconceptionConfidence: misconception && misconception !== 'UNK' ? 'high' : 'unknown',
        classificationSource: hep.family && hep.mechanism_id ? 'bank_metadata' : 'missing',
        memo: (state.memos[q.id] || '').trim(),
        like: !!state.likes[q.id],
        deletionRequested: !!state.deletionRequests[q.id],
      };
    });
    const correct = log.filter((l) => l.correct).length;
    const perRule = {};
    log.forEach((l) => {
      const r = perRule[l.rule] || { correct: 0, total: 0 };
      r.total++;
      if (l.correct) r.correct++;
      perRule[l.rule] = r;
    });
    const entry = {
      date: new Date().toISOString(),
      quizId: state.quizId,
      sessionId: state.sessionId,
      bankRelease: BANK_RELEASE,
      ruleId: state.ruleId,
      mechanismId: state.mechanismId || null,
      detailId: state.detailId || null,
      sourceQuestionIds: state.sourceQuestionIds ? state.sourceQuestionIds.slice() : null,
      mode: state.mode,
      total: log.length,
      correct,
      perRule,
      durationMs: Date.now() - state.startTime,
      log,
      feedback: buildFeedback(state.ruleId, correct, log.length, log, {
        quizId: state.quizId,
        sessionId: state.sessionId,
        attemptedAt: new Date().toISOString(),
        mode: state.mode,
        mechanismId: state.mechanismId || null,
        detailId: state.detailId || null,
      }),
    };
    saveAttempt(entry);
    // Toute séance terminée reste synchronisable. Le tableau est immédiat en
    // local; la génération future ne reçoit que les sessions effectivement
    // envoyées puis importées, avec leur session_id idempotent.
    pushPending({
      id: entry.date,
      date: entry.date,
      ruleId: entry.ruleId,
      mechanismId: entry.mechanismId,
      detailId: entry.detailId,
      correct,
      total: log.length,
      feedback: entry.feedback,
    });
    state = { view: 'result', entry };
    render();
  }

  // Construit le texte Markdown envoyé/exporté en fin de séance :
  // stats globales + toutes les questions COMMENTÉES (avec ta réponse et ton mémo).
  function buildFeedback(ruleId, correct, total, log, trace) {
    const d = new Date();
    const stamp = d.toLocaleString('fr-CH');
    const memoed = log.filter((l) => l.memo);
    const liked = log.filter((l) => l.like);
    const deletionRequested = log.filter((l) => l.deletionRequested);
    const lines = [];
    const meta = {
      schema_version: 'hep-feedback/1.2',
      quiz_id: trace.quizId,
      session_id: trace.sessionId,
      attempted_at: trace.attemptedAt,
      quiz_rule: ruleId,
      mode: trace.mode,
      app_version: APP_VERSION || 'UNK',
      bank_release: BANK_RELEASE,
      pedagogy_labels_version: PEDAGOGY ? PEDAGOGY.LABELS_VERSION : 'UNK',
      pedagogy_dict_version: 'hep-pedagogy-dict/2.0',
    };
    const columns = [
      'attempt_number', 'question_id', 'rule', 'selected', 'expected', 'correct',
      'source_batch_id', 'family', 'mechanism_id', 'detail_id', 'tense_id',
      'misconception_id',
      'grammar_confidence', 'misconception_confidence', 'classification_source',
      'positive_feedback', 'deletion_requested',
    ];
    lines.push(`<!-- HEP_FEEDBACK_META ${JSON.stringify(meta)} -->`);
    lines.push('```tsv hep-feedback/1.2');
    lines.push(columns.join('\t'));
    log.forEach((l, index) => {
      lines.push([
        index + 1, l.id, l.rule, l.selected || '', l.answer, l.correct,
        l.sourceBatchId, l.family, l.mechanismId, l.detailId, l.tenseId,
        l.misconceptionId,
        l.grammarConfidence, l.misconceptionConfidence, l.classificationSource, l.like,
        l.deletionRequested,
      ].map(tsvCell).join('\t'));
    });
    lines.push('```');
    lines.push('');
    lines.push(`# Feedback QCM — ${stamp}`);
    lines.push(`Règle : ${sessionLabel(ruleId, trace.mechanismId, trace.detailId)} · Score : ${correct}/${total}`);
    lines.push('');
    if (liked.length) {
      lines.push(`## 👍 Questions bien construites (${liked.length})`);
      liked.forEach((l) => lines.push(`- ${l.id} : ${l.prompt}`));
      lines.push('');
    }
    if (deletionRequested.length) {
      lines.push(`## À revoir avant suppression (${deletionRequested.length})`);
      deletionRequested.forEach((l) => lines.push(`- ${l.id} : ${l.prompt}`));
      lines.push('');
      lines.push('_Ces demandes alimentent la file de revue ; elles ne suppriment pas automatiquement la banque._');
      lines.push('');
    }
    if (memoed.length === 0) {
      lines.push('_(Aucun mémo écrit durant cette séance.)_');
    } else {
      lines.push(`## Questions commentées (${memoed.length})`);
      memoed.forEach((l) => {
        lines.push('');
        lines.push(`### ${l.id} — ${l.correct ? '✅ juste' : '❌ faux'}${l.like ? ' · 👍' : ''}${l.deletionRequested ? ' · À supprimer' : ''}`);
        lines.push(`Énoncé : ${l.prompt}`);
        lines.push(`Ta réponse : ${l.selected || '—'} · Attendu : ${l.answer}`);
        lines.push(`Mémo : ${l.memo}`);
      });
    }
    lines.push('');
    lines.push('---');
    lines.push('## Récap complet des réponses');
    log.forEach((l) => {
      lines.push(`- ${l.id} : ${l.correct ? 'OK' : 'KO'} (choix ${l.selected || '—'}, attendu ${l.answer})${l.like ? ' 👍' : ''}${l.deletionRequested ? ' · À supprimer' : ''}`);
    });
    return lines.join('\n');
  }

  function renderResult() {
    const { entry } = state;
    const wrap = el('div', {});
    wrap.appendChild(el('div', { class: 'header' }, [
      el('div', { class: 'title', text: 'Résultat' }),
      el('div', { class: 'subtitle', text: sessionLabel(entry.ruleId, entry.mechanismId, entry.detailId) }),
    ]));

    const pct = Math.round((entry.correct / entry.total) * 100);
    wrap.appendChild(el('div', { class: 'result-score' }, [
      el('div', { class: 'big', text: `${entry.correct} / ${entry.total}` }),
      el('div', { class: 'pct', text: `${pct}% de bonnes réponses` }),
      entry.durationMs ? el('div', { class: 'result-time', text: `⏱ Temps : ${formatDuration(entry.durationMs)}` }) : null,
    ]));

    // Détail par règle (test mélangé et examen blanc)
    if (entry.ruleId === MIX_ID || entry.mode === 'exam') {
      const list = el('div', { class: 'history-list' });
      Object.keys(entry.perRule).forEach((rid) => {
        const s = entry.perRule[rid];
        list.appendChild(el('div', { class: 'history-row' }, [
          el('span', { text: ruleLabel(rid) }),
          el('span', { text: `${s.correct}/${s.total}` }),
        ]));
      });
      wrap.appendChild(list);
    }

    // ---- Bilan : les questions ratées, avec l'explication ----
    const missed = entry.log.filter((l) => !l.correct);
    if (missed.length) {
      const box = el('div', { class: 'missed-box' });
      box.appendChild(el('div', { class: 'missed-title', text: `À revoir — ${missed.length} erreur(s)` }));
      missed.forEach((l) => {
        const q = QUESTIONS.find((x) => x.id === l.id);
        const row = el('div', { class: 'missed-item' });
        row.appendChild(el('div', { class: 'missed-prompt', text: (q && (q.type === 'blank' ? q.stem : q.instruction)) || l.prompt }));
        row.appendChild(el('div', { class: 'missed-answers', text: `Ta réponse : ${l.selected || '—'} · Attendue : ${l.answer}` }));
        if (q && q.explanation) row.appendChild(el('div', { class: 'missed-expl', text: q.explanation }));
        box.appendChild(row);
      });
      wrap.appendChild(box);
    } else {
      wrap.appendChild(el('div', { class: 'missed-none', text: '🎉 Aucune erreur — sans faute !' }));
    }

    // ---- Résumé pédagogique prudent, agrégé par mécanisme canonique ----
    if (missed.length && PEDAGOGY) {
      const summary = PEDAGOGY.summarize(entry.log);
      const box = el('section', { class: 'pedagogy-box' });
      box.appendChild(el('div', { class: 'pedagogy-title', text: 'Résumé pédagogique de tes erreurs' }));
      box.appendChild(el('div', {
        class: 'pedagogy-version',
        text: 'Ce bilan indique quoi revoir sans deviner pourquoi tu t’es trompé.',
      }));
      summary.forEach((item) => {
        const row = el('div', { class: 'pedagogy-item' });
        row.appendChild(el('div', { class: 'pedagogy-mechanism' }, [
          el('span', { text: item.learnerTitle }),
          el('span', { class: 'pedagogy-count', text: `× ${item.count}` }),
        ]));
        row.appendChild(el('div', {
          class: 'pedagogy-section-label',
          text: 'La règle, simplement',
        }));
        row.appendChild(el('div', {
          class: 'pedagogy-explanation',
          text: item.learnerExplanation,
        }));
        row.appendChild(el('div', {
          class: 'pedagogy-section-label',
          text: 'Comment faire',
        }));
        const steps = el('ol', { class: 'pedagogy-steps' });
        item.learnerSteps.forEach((step) => steps.appendChild(el('li', { text: step })));
        row.appendChild(steps);
        row.appendChild(pedagogyTechnicalPanel(
          item,
          Object.keys(item.misconceptionCounts || {}).map((id) => ({
            id,
            count: item.misconceptionCounts[id],
          })),
          {
            label: 'Questions',
            value: `${item.questionIds.join(', ')} · libellés ${PEDAGOGY.LABELS_VERSION}`,
          }
        ));
        row.appendChild(el('div', {
          class: 'pedagogy-questions',
          text: `Vu dans ${item.questionIds.length} question${item.questionIds.length > 1 ? 's' : ''} de cette séance.`,
        }));
        box.appendChild(row);
      });
      wrap.appendChild(box);
    }

    // ---- Section feedback (mémos + pouces + suppressions demandées + stats) ----
    const memoCount = entry.log.filter((l) => l.memo).length;
    const likeCount = entry.log.filter((l) => l.like).length;
    const deletionCount = entry.log.filter((l) => l.deletionRequested).length;
    if (deletionCount) {
      const deletionBox = el('div', { class: 'deletion-recap' });
      deletionBox.appendChild(el('div', {
        class: 'deletion-recap-title',
        text: `À supprimer — ${deletionCount} demande${deletionCount > 1 ? 's' : ''} de revue`,
      }));
      entry.log.filter((l) => l.deletionRequested).forEach((l) => {
        deletionBox.appendChild(el('div', { text: `• ${l.id}` }));
      });
      deletionBox.appendChild(el('div', {
        class: 'deletion-recap-note',
        text: 'La banque reste inchangée jusqu’à une décision de revue.',
      }));
      wrap.appendChild(deletionBox);
    }
    const fb = el('div', { class: 'feedback-box' });
    fb.appendChild(el('div', { class: 'feedback-title', text: 'Feedback de la séance' }));
    const bits = [];
    if (memoCount) bits.push(`${memoCount} mémo(s)`);
    if (likeCount) bits.push(`${likeCount} 👍`);
    if (deletionCount) bits.push(`${deletionCount} à supprimer`);
    fb.appendChild(el('div', {
      class: 'feedback-sub',
      text: bits.length ? `${bits.join(' + ')} à envoyer, avec le récap des réponses.` : 'Aucun mémo ni pouce — tu peux quand même envoyer les stats.',
    }));

    const status = el('div', { class: 'feedback-status' });

    const fbRow = el('div', { class: 'btn-row' });
    if (DRIVE.configured()) {
      const driveBtn = el('button', { class: 'btn', text: 'Envoyer vers Google Drive' });
      driveBtn.addEventListener('click', async () => {
        driveBtn.disabled = true;
        status.textContent = 'Connexion à Google Drive…';
        try {
          if (!DRIVE.token) await DRIVE.connect();
          status.textContent = 'Envoi du fichier…';
          const r = await DRIVE.upload(feedbackFilename(entry), entry.feedback);
          status.textContent = '✅ Envoyé dans le dossier « ' + ((window.CONFIG && CONFIG.DRIVE_FOLDER_NAME) || 'Drive') + ' » : ' + r.name;
          state.memos = {}; state.likes = {}; state.deletionRequests = {}; // reset après envoi réussi
          removePending(entry.date); // déjà envoyée : plus besoin de la garder en attente
        } catch (e) {
          status.textContent = '❌ ' + (e.message || 'Échec de l\'envoi.') + ' — utilise Copier ou Télécharger.';
          driveBtn.disabled = false;
        }
      });
      fbRow.appendChild(driveBtn);
    }
    const copyBtn = el('button', { class: 'btn secondary', text: 'Copier' });
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(entry.feedback);
        status.textContent = '✅ Copié — tu peux le coller dans le chat.';
      } catch (e) {
        status.textContent = 'Copie impossible ; utilise Télécharger.';
      }
    });
    const dlBtn = el('button', { class: 'btn secondary', text: 'Télécharger' });
    dlBtn.addEventListener('click', () => {
      downloadFeedback(entry);
      status.textContent = '✅ Fichier téléchargé (' + feedbackFilename(entry) + ').';
    });
    fbRow.appendChild(copyBtn);
    fbRow.appendChild(dlBtn);
    fb.appendChild(fbRow);
    fb.appendChild(status);
    if (!DRIVE.configured()) {
      fb.appendChild(el('div', { class: 'feedback-note', text: 'Google Drive non configuré (voir config.js). En attendant : Copier ou Télécharger.' }));
    }
    wrap.appendChild(fb);

    const row = el('div', { class: 'btn-row' });
    const retry = el('button', { class: 'btn', text: 'Recommencer' });
    retry.addEventListener('click', () => startQuiz(
      entry.ruleId,
      entry.mode,
      entry.mechanismId,
      entry.detailId,
      entry.sourceQuestionIds
    ));
    const home = el('button', { class: 'btn secondary', text: 'Accueil' });
    home.addEventListener('click', () => { state = { view: 'home' }; render(); });
    row.appendChild(retry);
    row.appendChild(home);
    wrap.appendChild(row);

    return wrap;
  }

  function renderErrorDashboard() {
    const wrap = el('div', {});
    const nav = el('div', { class: 'top-nav' }, [
      el('button', { class: 'back', text: '← Accueil' }),
      el('span', { class: 'version-tag', text: APP_VERSION ? 'v' + APP_VERSION : '' }),
    ]);
    nav.querySelector('.back').addEventListener('click', () => { state = { view: 'home' }; render(); });
    wrap.appendChild(nav);

    wrap.appendChild(el('div', { class: 'header' }, [
      el('div', { class: 'title', text: 'Mes erreurs' }),
      el('div', {
        class: 'subtitle',
        text: 'Cumul détaillé des séances conservées sur cet appareil.',
      }),
    ]));

    if (!ERROR_PROFILE) {
      wrap.appendChild(el('div', {
        class: 'empty-state',
        text: 'Le module de statistiques détaillées n’est pas disponible.',
      }));
      return wrap;
    }

    const profile = ERROR_PROFILE.build(loadHistory(), QUESTIONS);
    const rows = profile.rows.filter((row) => row.errors > 0);
    const rate = profile.attempts ? Math.round(profile.errorRate * 100) : 0;

    const summary = el('div', { class: 'error-summary-grid' }, [
      el('div', { class: 'error-summary-stat' }, [
        el('strong', { text: String(profile.errors) }),
        el('span', { text: 'erreurs' }),
      ]),
      el('div', { class: 'error-summary-stat' }, [
        el('strong', { text: String(profile.attempts) }),
        el('span', { text: 'réponses' }),
      ]),
      el('div', { class: 'error-summary-stat' }, [
        el('strong', { text: `${rate} %` }),
        el('span', { text: 'taux d’erreur' }),
      ]),
      el('div', { class: 'error-summary-stat' }, [
        el('strong', { text: String(rows.length) }),
        el('span', { text: 'points à réviser' }),
      ]),
    ]);
    wrap.appendChild(summary);

    const syncCount = loadPending().length;
    const syncBox = el('div', { class: 'error-sync-note' }, [
      el('div', {
        text: syncCount
          ? `${syncCount} séance(s) attendent encore leur synchronisation.`
          : 'Toutes les séances marquées pour synchronisation ont été envoyées depuis cet appareil.',
      }),
      el('div', {
        class: 'error-sync-detail',
        text: 'Le tableau local est immédiat. Pour la génération, le pipeline utilise les séances envoyées, les déduplique par session, puis applique récence, confiance et importance d’examen.',
      }),
    ]);
    if (syncCount) {
      const syncButton = el('button', { class: 'btn secondary', text: 'Synchroniser maintenant' });
      syncButton.addEventListener('click', () => { state = { view: 'pending' }; render(); });
      syncBox.appendChild(syncButton);
    }
    wrap.appendChild(syncBox);

    if (!rows.length) {
      wrap.appendChild(el('div', {
        class: 'empty-state',
        text: profile.attempts
          ? 'Aucune erreur enregistrée — bravo !'
          : 'Termine un quiz pour commencer ton tableau cumulatif.',
      }));
      return wrap;
    }

    const tableWrap = el('div', { class: 'error-table-wrap' });
    const table = el('table', { class: 'error-table' });
    const head = el('thead', {}, [
      el('tr', {}, [
        el('th', { text: 'Point à réviser' }),
        el('th', { text: 'Mon résultat' }),
        el('th', { text: 'Questions sources' }),
      ]),
    ]);
    table.appendChild(head);
    const body = el('tbody', {});
    const currentQuestionIds = new Set(QUESTIONS.map((question) => question.id));

    rows.forEach((row) => {
      const description = PEDAGOGY
        ? PEDAGOGY.describe(
          row.family === 'UNK' ? null : row.family,
          row.mechanismId === 'UNK' ? null : row.mechanismId,
          row.tenseId === 'UNK' ? null : row.tenseId,
          row.detailId === 'UNK' ? null : row.detailId
        )
        : null;
      const label = description
        ? description.revisionTitle
        : 'Règle grammaticale à préciser';
      const streak = row.currentCorrectStreak
        ? `${row.currentCorrectStreak} réussite(s) depuis`
        : 'À retravailler';
      const distractorList = el('div', { class: 'error-distractor-list' });
      row.distractors.forEach((distractor) => {
        distractorList.appendChild(el('div', {
          class: 'error-distractor',
          text: distractor.misconceptionId === 'UNK'
            ? `Choix ${distractor.selected} · cause précise pas encore identifiée · × ${distractor.count}`
            : `Choix ${distractor.selected} · × ${distractor.count}`,
        }));
      });
      const learnerSteps = description
        ? description.learnerSteps
        : [
          'Relis la phrase et ta réponse.',
          'Compare-les avec la correction détaillée.',
          'Note la différence visible sans inventer la cause de ton erreur.',
        ];
      const steps = el('ol', { class: 'error-rule-steps' });
      learnerSteps.forEach((step) => steps.appendChild(el('li', { text: step })));

      const details = el('details', { class: 'error-review-details' });
      details.appendChild(el('summary', { text: 'Méthode et détails' }));
      details.appendChild(steps);
      details.appendChild(el('div', {
        class: 'error-detail-line',
        text: `${row.errorSessions}/${row.sessions} séance(s) avec erreur · dernière erreur ${row.lastError ? formatDate(row.lastError) : 'inconnue'}`,
      }));
      if (row.distractors.length) {
        details.appendChild(el('div', { class: 'pedagogy-section-label', text: 'Choix erronés enregistrés' }));
        details.appendChild(distractorList);
      }
      if (description) details.appendChild(pedagogyTechnicalPanel(description, row.distractors));

      const sourceIds = (row.errorQuestionIds || []).filter((id) => currentQuestionIds.has(id));
      const sourceButton = el('button', {
        class: 'btn secondary error-source-button',
        title: sourceIds.length ? `Questions : ${sourceIds.join(', ')}` : '',
        text: sourceIds.length
          ? `Revoir ${sourceIds.length} question${sourceIds.length > 1 ? 's' : ''}`
          : 'Question indisponible',
      });
      if (sourceIds.length) {
        sourceButton.addEventListener('click', () => startQuiz(
          'review',
          'learn',
          row.mechanismId === 'UNK' ? null : row.mechanismId,
          row.detailId === 'UNK' ? null : row.detailId,
          sourceIds
        ));
      } else {
        sourceButton.disabled = true;
      }

      body.appendChild(el('tr', {}, [
        el('td', { class: 'error-rule-cell', 'data-label': 'Point à réviser' }, [
          el('div', { class: 'error-reference-label', text: 'À chercher dans le Bescherelle' }),
          el('div', { class: 'error-rule-label', text: label }),
          el('div', { class: 'pedagogy-section-label', text: 'À retenir' }),
          el('div', {
            class: 'error-rule-explanation',
            text: description ? description.learnerExplanation : 'Relis la correction détaillée de la question.',
          }),
          details,
        ]),
        el('td', { class: 'error-result-cell', 'data-label': 'Mon résultat' }, [
          el('strong', { class: 'bad-number', text: `${row.errors} erreur${row.errors > 1 ? 's' : ''}` }),
          el('span', { text: ` sur ${row.attempts} essai${row.attempts > 1 ? 's' : ''} · ${Math.round(row.errorRate * 100)} %` }),
          el('div', { class: 'error-progress', text: streak }),
        ]),
        el('td', { class: 'error-source-cell', 'data-label': 'Questions sources' }, [
          sourceButton,
        ]),
      ]));
    });

    table.appendChild(body);
    tableWrap.appendChild(table);
    wrap.appendChild(tableWrap);
    wrap.appendChild(el('div', {
      class: 'error-footnote',
      text: 'Les premières lignes sont les points les plus souvent manqués. Les noms visibles utilisent des rubriques grammaticales scolaires ; les codes internes restent dans « Méthode et détails » et continuent de pondérer les futurs quiz.',
    }));
    return wrap;
  }

  function renderHistory() {
    const wrap = el('div', {});
    const nav = el('div', { class: 'top-nav' }, [
      el('button', { class: 'back', text: '← Accueil' }),
      el('span', { class: 'version-tag', text: APP_VERSION ? 'v' + APP_VERSION : '' }),
    ]);
    nav.querySelector('.back').addEventListener('click', () => { state = { view: 'home' }; render(); });
    wrap.appendChild(nav);

    wrap.appendChild(el('div', { class: 'header' }, [
      el('div', { class: 'title', text: 'Historique' }),
    ]));

    const h = loadHistory().slice().reverse();
    if (h.length === 0) {
      wrap.appendChild(el('div', { class: 'empty-state', text: 'Aucune tentative pour l’instant.' }));
      return wrap;
    }

    const list = el('div', { class: 'history-list' });
    h.forEach((a) => {
      const pct = Math.round((a.correct / a.total) * 100);
      const row = el('div', { class: 'history-row', style: 'flex-direction:column;align-items:stretch;gap:2px' }, [
        el('div', { style: 'display:flex;justify-content:space-between' }, [
          el('span', { text: sessionLabel(a.ruleId, a.mechanismId, a.detailId) }),
          el('span', { text: `${a.correct}/${a.total} (${pct}%)` }),
        ]),
        el('span', { class: 'date', text: formatDate(a.date) }),
      ]);
      list.appendChild(row);
    });
    wrap.appendChild(list);
    return wrap;
  }

  function renderPending() {
    const wrap = el('div', {});
    const nav = el('div', { class: 'top-nav' }, [
      el('button', { class: 'back', text: '← Accueil' }),
      el('span', { class: 'version-tag', text: APP_VERSION ? 'v' + APP_VERSION : '' }),
    ]);
    nav.querySelector('.back').addEventListener('click', () => { state = { view: 'home' }; render(); });
    wrap.appendChild(nav);

    wrap.appendChild(el('div', { class: 'header' }, [
      el('div', { class: 'title', text: 'Séances à synchroniser' }),
      el('div', { class: 'subtitle', text: 'Tentatives pas encore envoyées au système de pondération' }),
    ]));

    const pending = loadPending();
    if (pending.length === 0) {
      wrap.appendChild(el('div', { class: 'empty-state', text: 'Aucune séance en attente.' }));
      return wrap;
    }

    const list = el('div', { class: 'history-list' });
    pending.forEach((p) => {
      list.appendChild(el('div', { class: 'history-row', style: 'flex-direction:column;align-items:stretch;gap:2px' }, [
        el('div', { style: 'display:flex;justify-content:space-between' }, [
          el('span', { text: sessionLabel(p.ruleId, p.mechanismId, p.detailId) }),
          el('span', { text: `${p.correct}/${p.total}` }),
        ]),
        el('span', { class: 'date', text: formatDate(p.date) }),
      ]));
    });
    wrap.appendChild(list);

    const fb = el('div', { class: 'feedback-box' });
    fb.appendChild(el('div', { class: 'feedback-title', text: 'Tout envoyer en un lot' }));
    fb.appendChild(el('div', {
      class: 'feedback-sub',
      text: `${pending.length} séance${pending.length > 1 ? 's' : ''} regroupée${pending.length > 1 ? 's' : ''} en un seul fichier.`,
    }));

    const status = el('div', { class: 'feedback-status' });
    const fbRow = el('div', { class: 'btn-row' });

    if (DRIVE.configured()) {
      const driveBtn = el('button', { class: 'btn', text: 'Envoyer vers Google Drive' });
      driveBtn.addEventListener('click', async () => {
        driveBtn.disabled = true;
        status.textContent = 'Connexion à Google Drive…';
        try {
          if (!DRIVE.token) await DRIVE.connect();
          status.textContent = 'Envoi du fichier…';
          const combined = buildCombinedFeedback(loadPending());
          const r = await DRIVE.upload(combinedFeedbackFilename(), combined);
          status.textContent = '✅ Envoyé : ' + r.name;
          clearPending();
          setTimeout(() => { state = { view: 'home' }; render(); }, 900);
        } catch (e) {
          status.textContent = '❌ ' + (e.message || 'Échec de l\'envoi.') + ' — utilise Copier ou Télécharger.';
          driveBtn.disabled = false;
        }
      });
      fbRow.appendChild(driveBtn);
    }
    const copyBtn = el('button', { class: 'btn secondary', text: 'Copier' });
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(buildCombinedFeedback(loadPending()));
        status.textContent = '✅ Copié — tu peux le coller dans le chat.';
      } catch (e) {
        status.textContent = 'Copie impossible ; utilise Télécharger.';
      }
    });
    const dlBtn = el('button', { class: 'btn secondary', text: 'Télécharger' });
    dlBtn.addEventListener('click', () => {
      const combined = buildCombinedFeedback(loadPending());
      const blob = new Blob([combined], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = combinedFeedbackFilename();
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = '✅ Fichier téléchargé.';
    });
    fbRow.appendChild(copyBtn);
    fbRow.appendChild(dlBtn);
    fb.appendChild(fbRow);
    fb.appendChild(status);
    if (!DRIVE.configured()) {
      fb.appendChild(el('div', { class: 'feedback-note', text: 'Google Drive non configuré. En attendant : Copier ou Télécharger.' }));
    }
    wrap.appendChild(fb);

    const clearLink = el('div', { class: 'footer-link', text: 'Vider la liste sans envoyer' });
    clearLink.addEventListener('click', () => {
      if (confirm('Supprimer ces séances en attente sans les envoyer ? Elles resteront visibles dans le tableau local, mais ne pèseront pas sur la génération.')) {
        clearPending();
        state = { view: 'home' };
        render();
      }
    });
    wrap.appendChild(clearLink);

    return wrap;
  }

  render();

  if ('serviceWorker' in navigator) {
    let refreshingForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshingForUpdate || state.view !== 'home') return;
      refreshingForUpdate = true;
      window.location.reload();
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then((registration) => registration.update())
        .catch(() => {});
    });
  }
})();
