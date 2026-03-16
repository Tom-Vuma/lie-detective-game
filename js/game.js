// js/game.js
// Lie Detective — Game Engine (vanilla JS, no frameworks)
// Provides: window.GameEngine with start/stop API

(function () {
  // ====== CONFIG ======
  const BASE_TIMER_MS = 8000;       // start of session
  const MIN_TIMER_MS = 4000;        // lowest allowed
  const TIMER_STEP_MS = 250;        // decrease after each correct
  const TICK_MS = 100;              // timer update frequency
  const FEEDBACK_MS = 600;          // highlight duration before next round
  const MIN_SCORABLE_MS = 150;      // anti-spam (ignore "instant" taps)

  // Scoring config
  const BASE_POINTS = 100;
  const TIME_BONUS_MAX = 100;       // max extra points if answered immediately
  // Streak multiplier breakpoints: returns a number like 1.0, 1.2, 1.5, 2.0
  function computeMultiplier(streak) {
    if (streak >= 20) return 2.0;
    if (streak >= 15) return 1.75;
    if (streak >= 10) return 1.5;
    if (streak >= 5)  return 1.25;
    if (streak >= 3)  return 1.1;
    return 1.0;
  }

  // ====== STATE ======
  let score = 0;
  let streak = 0;
  let timerMs = BASE_TIMER_MS;
  let roundIndex = 0; // Case number (0-based)
  let currentRound = null;
  let gameRunning = false;

  let currentPack = null;
  let itemPool = [];  // shuffled indices to avoid repeats
  let timerInterval = null;
  let roundStartedAt = 0;
  let inputLocked = false;

  // ====== UI ELEMENTS ======
  const els = {};
  // Caches DOM elements for easy access
  function cacheEls() {
    els.screen = document.getElementById('screen-game');
    els.caseNo = document.getElementById('caseNo');
    els.packName = document.getElementById('packName');
    els.timerText = document.getElementById('timerText');
    els.timerBar = document.getElementById('timerBar');
    els.score = document.getElementById('scoreVal');
    els.streak = document.getElementById('streakVal');
    els.statements = Array.from(document.querySelectorAll('.statement-btn'));
    els.startBtn = document.getElementById('btnStartSession');
    els.endBtn = document.getElementById('btnEndSession');
    els.summary = document.getElementById('summary');
    els.summaryBody = document.getElementById('summaryBody');
    els.summaryRestart = document.getElementById('btnSummaryRestart');
    els.status = document.getElementById('statusMsg'); // optional
  }

  // Binds event listeners to UI elements
  function bindEvents() {
    // Statement taps
    els.statements.forEach((btn, idx) => {
      btn.addEventListener('click', () => onSelect(idx));
    });

    els.startBtn?.addEventListener('click', () => {
      if (!currentPack) {
        return setStatus("Load a pack first (above), then Start.", 'warn');
      }
      startGame(currentPack);
    });

    els.endBtn?.addEventListener('click', () => endGame('forfeit'));

    els.summaryRestart?.addEventListener('click', () => {
      hideSummary();
      startGame(currentPack);
    });
  }

  // ====== PUBLIC API ======
  // Starts a new game session with the given pack
  async function startGame(pack) {
    if (!pack || !Array.isArray(pack.items) || pack.items.length === 0) {
      setStatus("Pack is empty or invalid.", 'err');
      return;
    }

    // Reset state
    currentPack = pack;
    score = 0;
    streak = 0;
    timerMs = BASE_TIMER_MS;
    roundIndex = 0;
    currentRound = null;
    inputLocked = false;
    gameRunning = true;

    resetItemPool();
    updateHud();
    hideSummary();

    els.packName.textContent = pack.packName || 'Case File';
    setStatus(`Session started. Good luck, Detective.`, 'ok');

    // First round
    nextRound();
  }

  // Stops the current game session
  function stopGame() {
    clearTimer();
    gameRunning = false;
  }

  window.GameEngine = {
    startGame,
    stopGame,
    isRunning: () => gameRunning,
    getScore: () => score,
    getStreak: () => streak
  };

  // ====== INTERNALS ======
  // Resets and shuffles the item pool
  function resetItemPool() {
    const n = currentPack.items.length;
    itemPool = Array.from({ length: n }, (_, i) => i);
    itemPool = window.Utils?.shuffle ? window.Utils.shuffle(itemPool) : itemPool;
  }

  // Draws the next item index from the pool
  function drawNextItem() {
    if (itemPool.length === 0) resetItemPool();
    return itemPool.pop();
  }

  // Advances to the next round
  function nextRound() {
    if (!gameRunning) return;

    // Generate round
    const itemIdx = drawNextItem();
    const item = currentPack.items[itemIdx];
    const statements = (window.Utils?.shuffle
      ? window.Utils.shuffle(item.statements.map((s, idx) => ({ ...s, idx })))
      : item.statements.map((s, idx) => ({ ...s, idx }))
    );
    const lieIndex = statements.findIndex(s => s.truth === false);

    currentRound = { item, statements, lieIndex };
    roundIndex++;

    // Render
    renderRound();
    startTimer();
  }

  // Renders the current round's statements and UI
  function renderRound() {
    // Case number & HUD
    els.caseNo.textContent = String(roundIndex).padStart(3, '0');
    updateHud();

    // Fill statements
    els.statements.forEach((btn, i) => {
      const s = currentRound.statements[i];
      btn.textContent = s.text;
      btn.dataset.index = String(i);
      btn.classList.remove('correct', 'wrong', 'locked');
      btn.style.pointerEvents = 'auto';
    });

    // Reset timer UI
    updateTimerUI(timerMs, timerMs);
  }

  // Starts the countdown timer for the round
  function startTimer() {
    clearTimer();
    const start = performance.now();
    roundStartedAt = start;
    const end = start + timerMs;

    timerInterval = setInterval(() => {
      const now = performance.now();
      const remaining = Math.max(0, end - now);

      updateTimerUI(remaining, timerMs);

      if (remaining <= 0) {
        clearTimer();
        // Time's up = wrong / game over
        lockInput();
        markWrongTimeout();
        endGame('timeout');
      }
    }, TICK_MS);
  }

  // Clears the active timer interval
  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Updates the timer display and progress bar
  function updateTimerUI(remainingMs, totalMs) {
    const sec = Math.ceil(remainingMs / 1000);
    els.timerText.textContent = `⏱ ${sec}s`;
    const pct = Math.max(0, Math.min(1, remainingMs / totalMs));
    els.timerBar.style.transform = `scaleX(${pct})`;
    // Color warning when low
    if (pct <= 0.3) {
      els.timerBar.style.backgroundColor = '#FFB454'; // Amber Ember
    } else {
      els.timerBar.style.backgroundColor = '#4F8CFF'; // Royal Electric Blue
    }
  }

  // Handles the selection of a statement button
  function onSelect(index) {
    if (!gameRunning || inputLocked) return;
    lockInput();
    clearTimer();

    const now = performance.now();
    const elapsed = now - roundStartedAt;

    const isLie = index === currentRound.lieIndex;
    const clickedBtn = els.statements[index];

    if (isLie) {
      // Correct — score, streak, ramp difficulty
      clickedBtn.classList.add('correct');
      playSfx('correct');

      // Scoring with time bonus & streak multiplier
      const remaining = Math.max(0, timerMs - elapsed);
      const timeRatio = Math.max(0, Math.min(1, remaining / timerMs));
      const timeBonus = Math.round(TIME_BONUS_MAX * timeRatio);

      // Anti-spam: if answered unrealistically fast, cap bonus
      const safeBonus = elapsed < MIN_SCORABLE_MS ? 0 : timeBonus;

      streak += 1;
      const mult = computeMultiplier(streak);
      const roundPoints = Math.round((BASE_POINTS + safeBonus) * mult);
      score += roundPoints;

      // Ramp difficulty
      timerMs = Math.max(MIN_TIMER_MS, timerMs - TIMER_STEP_MS);

      updateHud();
      setStatus(`Case solved. +${roundPoints} pts (x${mult.toFixed(2)}).`, 'ok');

      // Show also which others were true (optional subtle styling)
      revealTruths(index);

      // Next case
      setTimeout(() => {
        unlockInput();
        nextRound();
      }, FEEDBACK_MS);
    } else {
      // Wrong — show right answer, end game
      clickedBtn.classList.add('wrong');
      playSfx('wrong');
      revealLie();
      endGame('wrong');
    }
  }

  // Reveals which statements are true (dimming them)
  function revealTruths(correctIndex) {
    els.statements.forEach((btn, i) => {
      if (i !== correctIndex) {
        // subtle dim for true statements
        btn.classList.add('dim-true');
      }
    });
  }

  // Reveals the correct lie (highlighting it)
  function revealLie() {
    // highlight the true lie
    els.statements.forEach((btn, i) => {
      if (i === currentRound.lieIndex) {
        btn.classList.add('correct');
      }
    });
  }

  // Locks user input to prevent multiple selections
  function lockInput() {
    inputLocked = true;
    els.statements.forEach(btn => {
      btn.classList.add('locked');
      btn.style.pointerEvents = 'none';
    });
  }

  // Unlocks user input for the next round
  function unlockInput() {
    inputLocked = false;
    els.statements.forEach(btn => {
      btn.classList.remove('locked');
      btn.style.pointerEvents = 'auto';
    });
  }

  // Ends the game and shows the summary
  function endGame(reason) {
    if (!gameRunning) return;
    gameRunning = false;
    clearTimer();
    lockInput();

    const niceReason =
      reason === 'wrong' ? 'Incorrect selection'
      : reason === 'timeout' ? 'Time ran out'
      : 'Session ended';

    setStatus(`${niceReason}.`, reason === 'forfeit' ? 'warn' : 'err');
    showSummary(niceReason);
  }

  // Updates the score and streak display
  function updateHud() {
    els.score.textContent = String(score);
    els.streak.textContent = String(streak);
  }

  // Displays the game summary modal
  function showSummary(reasonText) {
    const mult = computeMultiplier(streak);
    const body =
      `Detective, here is your case report:\n\n` +
      `• Total Score: ${score}\n` +
      `• Longest Streak (this run): ${streak}\n` +
      `• Final Multiplier Reached: x${mult.toFixed(2)}\n` +
      `• Case End: ${reasonText}`;

    els.summaryBody.textContent = body;
    els.summary.removeAttribute('hidden');
  }

  // Hides the game summary modal
  function hideSummary() {
    els.summary.setAttribute('hidden', 'true');
    els.summaryBody.textContent = '';
  }

  // Sets the status message with optional type
  function setStatus(text, type = 'info') {
    if (!els.status) return;
    els.status.textContent = text;
    els.status.className = ''; // reset
    els.status.classList.add('status', type);
  }

  // Plays a sound effect if audio is available
  function playSfx(key) {
    // Optional: if you add audio.js with window.AudioEngine.play(name)
    if (window.AudioEngine && typeof window.AudioEngine.play === 'function') {
      window.AudioEngine.play(key);
    }
  }

  // ====== BOOT ======
  // Initializes the game engine when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    cacheEls();
    bindEvents();
  });
})();

