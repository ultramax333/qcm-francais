(function () {
  'use strict';

  const APP = document.getElementById('app');
  const HISTORY_KEY = 'qcm-op001-history-v1';
  const MIX_ID = 'mix';
  const APP_VERSION = (window.CONFIG && CONFIG.APP_VERSION) || '';

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
  function seenCount(ruleId) {
    const s = loadSeen();
    const pool = ruleId === MIX_ID ? QUESTIONS : QUESTIONS.filter((q) => q.rule === ruleId);
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

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
  }

  function ruleLabel(ruleId) {
    if (ruleId === MIX_ID) return 'Toutes les règles (mélangées)';
    const r = RULES.find((r) => r.id === ruleId);
    return r ? r.label : ruleId;
  }

  // Une séance = au plus 20 questions tirées au hasard dans le pool
  // (les règles à 40 questions et le mix varient donc d'une séance à l'autre).
  const SESSION_SIZE = 20;

  function questionsForRule(ruleId) {
    const pool = ruleId === MIX_ID ? QUESTIONS : QUESTIONS.filter((q) => q.rule === ruleId);
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
    async findOrCreateFolder(name) {
      const q = encodeURIComponent(`name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
        headers: { Authorization: 'Bearer ' + this.token },
      });
      const data = await res.json();
      if (data.files && data.files.length) return data.files[0].id;
      const create = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
      });
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
      if (!res.ok) throw new Error('Échec de l\'envoi (' + res.status + ').');
      return res.json();
    },
  };

  function feedbackFilename(entry) {
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
  }

  // ---------- views ----------
  function renderHome() {
    const wrap = el('div', {});
    if (APP_VERSION) wrap.appendChild(el('div', { class: 'version-bar', text: 'v' + APP_VERSION }));
    wrap.appendChild(el('div', { class: 'header' }, [
      el('div', { class: 'title', text: 'QCM Français — OP001' }),
      el('div', { class: 'subtitle', text: 'Entraînement par règle, phrases inédites' }),
    ]));

    const list = el('div', { class: 'rule-list' });
    RULES.forEach((rule) => {
      const stats = statsForRule(rule.id);
      const card = el('button', { class: 'rule-card' }, [
        el('div', { class: 'rule-name', text: rule.label }),
        el('div', { class: 'rule-desc', text: rule.desc }),
      ]);
      if (stats) {
        card.appendChild(el('div', {
          class: 'rule-stats',
          text: `Meilleur : ${stats.best.correct}/${stats.best.total} · Dernier : ${stats.last.correct}/${stats.last.total}`,
        }));
      } else {
        card.appendChild(el('div', { class: 'rule-stats', text: 'Pas encore tenté' }));
      }
      const sc = seenCount(rule.id);
      card.appendChild(el('div', { class: 'seen-stats', text: `Vues : ${sc.seen}/${sc.total}` }));
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

    return wrap;
  }

  function startQuiz(ruleId) {
    const questions = questionsForRule(ruleId);
    state = {
      view: 'quiz',
      ruleId,
      questions,
      index: 0,
      score: 0,
      answered: false,
      selectedKey: null,
      perRule: {},
      memos: {},       // mémo écrit par question (clé = id de la question)
      likes: {},       // 👍 « bien construite » par question (clé = id)
      responses: {},   // réponse choisie par question (clé = id)
      seenAtStart: loadSeen(), // instantané des vues AVANT cette séance (pour le badge)
    };
    render();
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
      el('span', { text: ruleLabel(state.ruleId) }),
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
      if (state.answered && state.selectedKey) {
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

    // Champ mémo : note libre pour Claude, envoyée en fin de séance
    const memoWrap = el('div', { class: 'memo-wrap' });

    // Pouce vert : marquer la question comme bien construite
    const likeBtn = el('button', {
      class: 'like-btn' + (state.likes[q.id] ? ' active' : ''),
      text: (state.likes[q.id] ? '👍 Bien construite ✓' : '👍 Bien construite'),
    });
    likeBtn.addEventListener('click', () => {
      state.likes[q.id] = !state.likes[q.id];
      render();
    });
    memoWrap.appendChild(likeBtn);

    memoWrap.appendChild(el('label', { class: 'memo-label', text: '💬 Mémo pour Claude (facultatif) — ex. « trop facile », « ambigu », « le distracteur 2 marche aussi »' }));
    const memoField = el('textarea', {
      class: 'memo-field',
      rows: '2',
      placeholder: 'Ton idée de correction sur cette question…',
    });
    memoField.value = state.memos[q.id] || '';
    memoField.addEventListener('input', (e) => { state.memos[q.id] = e.target.value; });
    memoWrap.appendChild(memoField);
    card.appendChild(memoWrap);

    // Traçabilité : modèle + niveau de réflexion ayant servi à écrire la question
    if (q.gen) {
      card.appendChild(el('div', {
        class: 'gen-tag',
        text: `✍️ ${q.gen.model} · réflexion ${q.gen.thinking}${q.gen.tracked ? '' : ' (attribution approximative)'}`,
      }));
    }

    wrap.appendChild(card);

    if (state.answered) {
      const isLast = index === questions.length - 1;
      const nextBtn = el('button', { class: 'btn', text: isLast ? 'Voir les résultats' : 'Question suivante' });
      nextBtn.style.marginTop = '16px';
      nextBtn.addEventListener('click', nextQuestion);
      wrap.appendChild(nextBtn);
    }

    return wrap;
  }

  function selectAnswer(key) {
    if (state.answered) return;
    const q = state.questions[state.index];
    state.answered = true;
    state.selectedKey = key;
    state.responses[q.id] = key;
    markSeen(q.id);
    const rule = q.rule;
    if (!state.perRule[rule]) state.perRule[rule] = { correct: 0, total: 0 };
    state.perRule[rule].total++;
    if (key === q.answer) {
      state.score++;
      state.perRule[rule].correct++;
    }
    render();
  }

  function nextQuestion() {
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
      return {
        id: q.id,
        rule: q.rule,
        prompt: q.type === 'blank' ? q.stem : (q.instruction || ''),
        selected: sel,
        answer: q.answer,
        correct: sel === q.answer,
        memo: (state.memos[q.id] || '').trim(),
        like: !!state.likes[q.id],
      };
    });
    const entry = {
      date: new Date().toISOString(),
      ruleId: state.ruleId,
      total: state.questions.length,
      correct: state.score,
      perRule: state.perRule,
      log,
      feedback: buildFeedback(state.ruleId, state.score, state.questions.length, log),
    };
    saveAttempt(entry);
    state = { view: 'result', entry };
    render();
  }

  // Construit le texte Markdown envoyé/exporté en fin de séance :
  // stats globales + toutes les questions COMMENTÉES (avec ta réponse et ton mémo).
  function buildFeedback(ruleId, correct, total, log) {
    const d = new Date();
    const stamp = d.toLocaleString('fr-CH');
    const memoed = log.filter((l) => l.memo);
    const liked = log.filter((l) => l.like);
    const lines = [];
    lines.push(`# Feedback QCM — ${stamp}`);
    lines.push(`Règle : ${ruleLabel(ruleId)} · Score : ${correct}/${total}`);
    lines.push('');
    if (liked.length) {
      lines.push(`## 👍 Questions bien construites (${liked.length})`);
      liked.forEach((l) => lines.push(`- ${l.id} : ${l.prompt}`));
      lines.push('');
    }
    if (memoed.length === 0) {
      lines.push('_(Aucun mémo écrit durant cette séance.)_');
    } else {
      lines.push(`## Questions commentées (${memoed.length})`);
      memoed.forEach((l) => {
        lines.push('');
        lines.push(`### ${l.id} — ${l.correct ? '✅ juste' : '❌ faux'}${l.like ? ' · 👍' : ''}`);
        lines.push(`Énoncé : ${l.prompt}`);
        lines.push(`Ta réponse : ${l.selected || '—'} · Attendu : ${l.answer}`);
        lines.push(`Mémo : ${l.memo}`);
      });
    }
    lines.push('');
    lines.push('---');
    lines.push('## Récap complet des réponses');
    log.forEach((l) => {
      lines.push(`- ${l.id} : ${l.correct ? 'OK' : 'KO'} (choix ${l.selected || '—'}, attendu ${l.answer})${l.like ? ' 👍' : ''}`);
    });
    return lines.join('\n');
  }

  function renderResult() {
    const { entry } = state;
    const wrap = el('div', {});
    wrap.appendChild(el('div', { class: 'header' }, [
      el('div', { class: 'title', text: 'Résultat' }),
      el('div', { class: 'subtitle', text: ruleLabel(entry.ruleId) }),
    ]));

    const pct = Math.round((entry.correct / entry.total) * 100);
    wrap.appendChild(el('div', { class: 'result-score' }, [
      el('div', { class: 'big', text: `${entry.correct} / ${entry.total}` }),
      el('div', { class: 'pct', text: `${pct}% de bonnes réponses` }),
    ]));

    if (entry.ruleId === MIX_ID) {
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

    // ---- Section feedback (mémos + pouces + stats) ----
    const memoCount = entry.log.filter((l) => l.memo).length;
    const likeCount = entry.log.filter((l) => l.like).length;
    const fb = el('div', { class: 'feedback-box' });
    fb.appendChild(el('div', { class: 'feedback-title', text: 'Feedback de la séance' }));
    const bits = [];
    if (memoCount) bits.push(`${memoCount} mémo(s)`);
    if (likeCount) bits.push(`${likeCount} 👍`);
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
          state.memos = {}; state.likes = {}; // reset après envoi réussi
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
    retry.addEventListener('click', () => startQuiz(entry.ruleId));
    const home = el('button', { class: 'btn secondary', text: 'Accueil' });
    home.addEventListener('click', () => { state = { view: 'home' }; render(); });
    row.appendChild(retry);
    row.appendChild(home);
    wrap.appendChild(row);

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
          el('span', { text: ruleLabel(a.ruleId) }),
          el('span', { text: `${a.correct}/${a.total} (${pct}%)` }),
        ]),
        el('span', { class: 'date', text: formatDate(a.date) }),
      ]);
      list.appendChild(row);
    });
    wrap.appendChild(list);
    return wrap;
  }

  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
