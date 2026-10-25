/*
 * TypeSpeed V1 - logique du test de frappe.
 *
 * Tout est calculé dans le navigateur. Aucune donnée n'est envoyée au serveur.
 *
 * Définitions (à garder identiques dans README.md et tests/manual-tests.md) :
 *   - Un "mot" vaut 5 caractères, espaces et ponctuation compris.
 *   - Comparaison position par position : le caractère saisi à l'indice i est correct
 *     s'il est identique au caractère attendu à l'indice i.
 *   - WPM brut = caractères saisis / 5 / minutes écoulées.
 *   - WPM net  = caractères corrects / 5 / minutes écoulées.
 *   - Précision (%) = caractères corrects / caractères saisis x 100 (null si rien saisi).
 *   - Les calculs portent sur le contenu ACTUEL du champ : un caractère effacé n'est plus
 *     compté, ni comme correct ni comme faux.
 *   - Plancher de 1 seconde sur la durée utilisée dans les formules, pour éviter des
 *     valeurs aberrantes dans la toute première seconde et toute division par zéro.
 *
 * Le fichier est utilisable dans le navigateur (init automatique) et dans Node
 * (module.exports) pour tester les fonctions de calcul sans interface.
 */
(function (root, factory) {
  'use strict';
  var core = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = core;
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { core.init(document); });
    } else {
      core.init(document);
    }
  }
})(this, function () {
  'use strict';

  // ---------------------------------------------------------------- Constantes
  var CHARS_PER_WORD = 5;
  var MIN_ELAPSED_MS = 1000;
  var TARGET_WPM = 100;      // Sert à dimensionner la longueur du texte généré.
  var TICK_MS = 100;         // Fréquence d'affichage ; le temps réel vient de performance.now().
  var DURATIONS = [30, 60, 120];
  var DEFAULT_DURATION = 60;

  // ------------------------------------------------------- Fonctions pures (calcul)

  /**
   * Calcule les statistiques d'une session.
   * @param {string} expected  Texte attendu.
   * @param {string} typed     Texte actuellement saisi.
   * @param {number} elapsedMs Durée écoulée en millisecondes.
   */
  function computeStats(expected, typed, elapsedMs) {
    var typedCount = typed.length;
    var correctCount = 0;
    for (var i = 0; i < typedCount; i++) {
      if (typed.charAt(i) === expected.charAt(i)) {
        correctCount++;
      }
    }
    var safeElapsed = (typeof elapsedMs === 'number' && isFinite(elapsedMs) && elapsedMs > 0) ? elapsedMs : 0;
    var minutes = Math.max(safeElapsed, MIN_ELAPSED_MS) / 60000;
    return {
      typedCount: typedCount,
      correctCount: correctCount,
      errorCount: typedCount - correctCount,
      grossWpm: typedCount / CHARS_PER_WORD / minutes,
      netWpm: correctCount / CHARS_PER_WORD / minutes,
      accuracy: typedCount === 0 ? null : (correctCount / typedCount) * 100
    };
  }

  function formatWpm(value) {
    return String(Math.round(isFinite(value) ? value : 0));
  }

  /** Précision tronquée à 0,1 près (évite d'afficher 100 % avec des erreurs). */
  function formatAccuracy(value) {
    if (value === null || !isFinite(value)) {
      return '\u2014';
    }
    var truncated = Math.floor(value * 10 + 1e-9) / 10;
    return truncated.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %';
  }

  function shuffle(items, random) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  /** Nettoie un texte : une seule ligne, espaces simples, forme Unicode NFC. */
  function cleanText(text) {
    return String(text).replace(/\s+/g, ' ').trim().normalize('NFC');
  }

  /**
   * Assemble des textes aléatoires jusqu'à couvrir la durée choisie
   * (référence : TARGET_WPM). Renvoie '' si aucun texte exploitable.
   */
  function buildText(texts, durationSeconds, random) {
    var rnd = typeof random === 'function' ? random : Math.random;
    var pool = (Array.isArray(texts) ? texts : [])
      .filter(function (t) { return typeof t === 'string' && t.trim() !== ''; })
      .map(cleanText);
    if (pool.length === 0) {
      return '';
    }
    // +1 : le texte assemblé a un espace de moins que le total compté ci-dessous.
    var target = Math.ceil((durationSeconds / 60) * TARGET_WPM * CHARS_PER_WORD) + 1;
    var parts = [];
    var length = 0;
    var rounds = 0;
    while (length < target && rounds < 100) {
      var order = shuffle(pool, rnd);
      for (var i = 0; i < order.length && length < target; i++) {
        parts.push(order[i]);
        length += order[i].length + 1;
      }
      rounds++;
    }
    return parts.join(' ');
  }

  // ------------------------------------------------------------ Interface (DOM)

  function readTexts(doc) {
    var node = doc.getElementById('typespeed-texts');
    if (!node) {
      return [];
    }
    try {
      var data = JSON.parse(node.textContent);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function init(doc) {
    var app = doc.getElementById('app');
    if (!app) {
      return;
    }
    var $ = function (id) { return doc.getElementById(id); };
    var ui = {
      display: $('text-display'),
      input: $('typing-input'),
      timeLeft: $('time-left'),
      timeFill: $('timebar-fill'),
      hint: $('hint'),
      wpm: $('stat-wpm'),
      accuracy: $('stat-accuracy'),
      typed: $('stat-typed'),
      errors: $('stat-errors'),
      results: $('results'),
      resWpmRaw: $('res-wpm-raw'),
      resWpmNet: $('res-wpm-net'),
      resAccuracy: $('res-accuracy'),
      resTyped: $('res-typed'),
      resErrors: $('res-errors'),
      resDuration: $('res-duration'),
      restart: $('restart-btn'),
      durationButtons: Array.prototype.slice.call(app.querySelectorAll('[data-duration]'))
    };

    var texts = readTexts(doc);
    var defaultDuration = parseInt(app.getAttribute('data-default-duration'), 10);

    var state = {
      phase: 'idle',          // 'idle' | 'running' | 'finished'
      duration: DURATIONS.indexOf(defaultDuration) !== -1 ? defaultDuration : DEFAULT_DURATION,
      text: '',
      typed: '',
      startedAt: 0,
      timerId: null
    };
    var charEls = [];

    var HINTS = {
      idle: 'Le chronomètre démarre à votre première frappe.',
      running: 'Test en cours. Continuez à recopier le texte.',
      finished: 'Test terminé. Cliquez sur « Recommencer » pour un nouvel essai.'
    };

    function durationMs() {
      return state.duration * 1000;
    }

    // ---- Chronomètre : un seul intervalle à la fois, temps réel via performance.now().
    function stopTimer() {
      if (state.timerId !== null) {
        clearInterval(state.timerId);
        state.timerId = null;
      }
    }

    function startTimer() {
      stopTimer();
      state.timerId = setInterval(tick, TICK_MS);
    }

    function tick() {
      if (state.phase !== 'running') {
        return;
      }
      var elapsed = performance.now() - state.startedAt;
      var remaining = durationMs() - elapsed;
      if (remaining <= 0) {
        finish('timeout');
        return;
      }
      ui.timeLeft.textContent = String(Math.ceil(remaining / 1000));
      ui.timeFill.style.transform = 'scaleX(' + (remaining / durationMs()).toFixed(4) + ')';
      renderStats(computeStats(state.text, state.typed, elapsed));
    }

    // ---- Affichage
    function renderStats(stats) {
      ui.wpm.textContent = formatWpm(stats.grossWpm);
      ui.accuracy.textContent = formatAccuracy(stats.accuracy);
      ui.typed.textContent = String(stats.typedCount);
      ui.errors.textContent = String(stats.errorCount);
    }

    function buildCharElements() {
      ui.display.textContent = '';
      charEls = [];
      var fragment = doc.createDocumentFragment();
      for (var i = 0; i < state.text.length; i++) {
        var span = doc.createElement('span');
        span.className = 'ch';
        span.textContent = state.text.charAt(i);
        charEls.push(span);
        fragment.appendChild(span);
      }
      ui.display.appendChild(fragment);
      ui.display.scrollTop = 0;
    }

    function renderText() {
      var typed = state.typed;
      var cursor = state.phase === 'finished' ? -1 : typed.length;
      for (var i = 0; i < charEls.length; i++) {
        var cls = 'ch';
        if (i < typed.length) {
          cls += typed.charAt(i) === state.text.charAt(i) ? ' ch--ok' : ' ch--bad';
        } else if (i === cursor) {
          cls += ' ch--current';
        }
        if (charEls[i].className !== cls) {
          charEls[i].className = cls;
        }
      }
      keepCursorVisible();
    }

    /** Fait défiler la zone de texte pour garder la ligne courante en 2e position. */
    function keepCursorVisible() {
      var index = Math.min(state.typed.length, charEls.length - 1);
      if (index < 0) {
        return;
      }
      var lineHeight = parseFloat(getComputedStyle(ui.display).lineHeight);
      if (!isFinite(lineHeight) || lineHeight <= 0) {
        return;
      }
      var line = Math.round((charEls[index].offsetTop - charEls[0].offsetTop) / lineHeight);
      ui.display.scrollTop = Math.max(0, (line - 1) * lineHeight);
    }

    function setHint(phase) {
      ui.hint.textContent = HINTS[phase];
    }

    function setDurationButtons() {
      ui.durationButtons.forEach(function (button) {
        var value = parseInt(button.getAttribute('data-duration'), 10);
        button.setAttribute('aria-pressed', value === state.duration ? 'true' : 'false');
        button.disabled = state.phase === 'running';
      });
    }

    function showFatal(message) {
      ui.display.textContent = message;
      ui.input.disabled = true;
      ui.hint.textContent = '';
    }

    // ---- Cycle de vie
    function reset(shouldFocus) {
      stopTimer();
      state.phase = 'idle';
      state.typed = '';
      state.startedAt = 0;
      state.text = buildText(texts, state.duration);

      ui.input.value = '';
      ui.results.hidden = true;
      ui.timeLeft.textContent = String(state.duration);
      ui.timeFill.style.transform = 'scaleX(1)';
      renderStats(computeStats('', '', 0));
      setDurationButtons();
      setHint('idle');

      if (state.text === '') {
        showFatal('Aucun texte disponible. Vérifiez le fichier data/texts.php.');
        return;
      }
      ui.input.disabled = false;
      buildCharElements();
      renderText();
      if (shouldFocus) {
        ui.input.focus();
      }
    }

    function start(now) {
      state.phase = 'running';
      state.startedAt = now;
      setHint('running');
      setDurationButtons();
      startTimer();
    }

    function finish(reason) {
      if (state.phase !== 'running') {
        return;
      }
      stopTimer();
      var now = performance.now();
      var elapsed = reason === 'timeout' ? durationMs() : Math.min(now - state.startedAt, durationMs());
      state.phase = 'finished';

      var stats = computeStats(state.text, state.typed, elapsed);
      renderStats(stats);
      renderText();
      ui.input.disabled = true;
      ui.timeLeft.textContent = reason === 'timeout' ? '0' : String(Math.ceil((durationMs() - elapsed) / 1000));
      if (reason === 'timeout') {
        ui.timeFill.style.transform = 'scaleX(0)';
      }

      ui.resWpmRaw.textContent = formatWpm(stats.grossWpm) + ' WPM';
      ui.resWpmNet.textContent = formatWpm(stats.netWpm) + ' WPM';
      ui.resAccuracy.textContent = stats.typedCount === 0 ? '0 %' : formatAccuracy(stats.accuracy);
      ui.resTyped.textContent = String(stats.typedCount);
      ui.resErrors.textContent = String(stats.errorCount);
      ui.resDuration.textContent = reason === 'timeout'
        ? state.duration + ' s'
        : Math.max(1, Math.round(elapsed / 1000)) + ' s sur ' + state.duration + ' s (texte terminé)';
      ui.results.hidden = false;

      setHint('finished');
      setDurationButtons();
      ui.restart.focus();
    }

    function setDuration(seconds) {
      if (state.phase === 'running' || DURATIONS.indexOf(seconds) === -1) {
        return;
      }
      state.duration = seconds;
      reset(true);
    }

    // ---- Saisie
    function onInput() {
      if (state.phase === 'finished') {
        return;
      }
      var value = ui.input.value.replace(/[\r\n]+/g, '').normalize('NFC');
      if (value.length > state.text.length) {
        value = value.slice(0, state.text.length);
      }
      if (value !== ui.input.value) {
        ui.input.value = value;
      }

      var now = performance.now();
      if (state.phase === 'running' && now - state.startedAt >= durationMs()) {
        // Frappe arrivée après la fin du temps (intervalle en retard) : on l'ignore.
        ui.input.value = state.typed;
        finish('timeout');
        return;
      }
      if (state.phase === 'idle') {
        if (value.length === 0) {
          return;
        }
        start(now);
      }

      state.typed = value;
      renderText();
      renderStats(computeStats(state.text, state.typed, now - state.startedAt));

      if (state.typed.length === state.text.length) {
        finish('complete');
      }
    }

    function caretToEnd() {
      var end = ui.input.value.length;
      ui.input.setSelectionRange(end, end);
    }

    function onKeydown(event) {
      var blocked = ['Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
      if (blocked.indexOf(event.key) !== -1) {
        event.preventDefault();
      } else if (event.key === 'Escape') {
        reset(true);
      }
    }

    function stop(event) {
      event.preventDefault();
    }

    // ---- Événements (enregistrés une seule fois)
    ui.input.addEventListener('input', onInput);
    ui.input.addEventListener('keydown', onKeydown);
    ui.input.addEventListener('paste', stop);
    ui.input.addEventListener('drop', stop);
    ui.input.addEventListener('cut', stop);
    ui.input.addEventListener('click', caretToEnd);
    ui.input.addEventListener('select', caretToEnd);
    ui.restart.addEventListener('click', function () { reset(true); });
    ui.durationButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setDuration(parseInt(button.getAttribute('data-duration'), 10));
      });
    });
    // Au retour sur l'onglet, on recalcule immédiatement depuis l'heure de départ.
    doc.addEventListener('visibilitychange', function () {
      if (!doc.hidden) {
        tick();
      }
    });

    var hasFinePointer = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    reset(hasFinePointer);
  }

  return {
    CHARS_PER_WORD: CHARS_PER_WORD,
    DURATIONS: DURATIONS,
    computeStats: computeStats,
    formatWpm: formatWpm,
    formatAccuracy: formatAccuracy,
    buildText: buildText,
    init: init
  };
});
