const DATA_FILES = [
  { file: 'famous-people.json', icon: '👤' },
  { file: 'movies-tv.json', icon: '🎬' },
  { file: 'food-drink.json', icon: '🍔' },
  { file: 'animals.json', icon: '🐾' },
  { file: 'technology.json', icon: '💻' },
  { file: 'everyday-life.json', icon: '🏠' },
  { file: 'weird-random.json', icon: '🎲' },
  { file: 'questions.json', icon: '❓' }
];

const state = {
  datasets: [],
  categoryIndex: 0,
  roundIndex: 0,
  found: new Set(),
  strikes: 0,
  score: 0,
  ended: false,
  isEnding: false
};

const $ = (id) => document.getElementById(id);
const screens = {
  categories: $('categoryScreen'),
  game: $('gameScreen'),
  summary: $('summaryScreen')
};

// ==========================================
// STRING & CANDIDATE NORMALIZATION
// ==========================================

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9']+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(value) {
  return normalize(value).replace(/['\s]+/g, '');
}

function formatScore(n) {
  return Number(n).toLocaleString('en-US');
}

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));
}

function getCategory() {
  return state.datasets[state.categoryIndex];
}

function getRound() {
  return getCategory().rounds[state.roundIndex];
}

/**
 * Splits an answer into its prompt prefix and completion part.
 * Handles cases where answer.text starts with the prompt,
 * equals the prompt, or is just the completion.
 */
function getAnswerParts(answer, prompt) {
  const pNorm = normalize(prompt);
  const textNorm = normalize(answer.text);

  if (textNorm.startsWith(pNorm + ' ')) {
    const promptLen = prompt.length;
    return {
      promptPart: answer.text.slice(0, promptLen),
      completionPart: answer.text.slice(promptLen).trim(),
      fullText: answer.text
    };
  } else if (textNorm === pNorm) {
    return {
      promptPart: '',
      completionPart: answer.text,
      fullText: answer.text
    };
  } else {
    return {
      promptPart: prompt,
      completionPart: answer.text,
      fullText: `${prompt} ${answer.text}`
    };
  }
}

/**
 * Generates all valid candidate strings for matching player input.
 * Supports:
 * - full search queries
 * - completion-only guesses
 * - aliases (both full and completion-only)
 */
function getAnswerCandidates(answer, prompt) {
  const pNorm = normalize(prompt);
  const candidates = new Set();
  const allStrings = [answer.text, ...(answer.aliases || [])];

  allStrings.forEach(str => {
    const sNorm = normalize(str);
    if (!sNorm) return;
    candidates.add(sNorm);

    if (sNorm.startsWith(pNorm + ' ')) {
      const rest = sNorm.slice(pNorm.length + 1).trim();
      if (rest) candidates.add(rest);
    } else if (sNorm !== pNorm) {
      candidates.add((pNorm + ' ' + sNorm).trim());
    }
  });

  return candidates;
}

function matchesAnswer(input, answer, prompt) {
  const typedNorm = normalize(input);
  if (!typedNorm) return false;
  const typedCompact = compact(input);

  const candidates = getAnswerCandidates(answer, prompt);
  for (const c of candidates) {
    if (typedNorm === c || typedCompact === compact(c)) {
      return true;
    }
  }
  return false;
}

// ==========================================
// DATA LOADING
// ==========================================

async function loadData() {
  try {
    const loaded = await Promise.all(DATA_FILES.map(async (item) => {
      const res = await fetch(`data/${item.file}`);
      if (!res.ok) throw new Error(`Could not load ${item.file}`);
      const json = await res.json();
      return {
        ...json,
        icon: item.icon
      };
    }));
    state.datasets = loaded;
    renderCategories();

    // Optional query parameter for automated testing and view verification
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'game') {
      startCategory(7); // Questions
    } else if (viewParam === 'summary') {
      startCategory(7); // Questions
      state.found.add('questions_001_a01');
      state.found.add('questions_001_a02');
      state.found.add('questions_001_a03');
      state.score = 23159;
      showSummaryScreen('strikes');
    }
  } catch (error) {
    console.error('Error loading game data:', error);
    document.body.innerHTML = `
      <div style="padding:48px 20px;max-width:600px;margin:40px auto;color:#f8fafc;font-family:Inter,system-ui;text-align:center;">
        <h2 style="font-size:24px;margin-bottom:12px;">Game Data Could Not Be Loaded</h2>
        <p style="color:#94a3b8;line-height:1.6;margin-bottom:20px;">
          Browser security policies restrict <code>fetch()</code> when opening HTML files via <code>file://</code> directly.
        </p>
        <p style="color:#e2e8f0;line-height:1.6;">
          Please run this project using a local web server (for example, double-click <code>start.bat</code> or use VS Code Live Server) and visit <strong>http://localhost:5500</strong>.
        </p>
      </div>
    `;
  }
}

// ==========================================
// NAVIGATION & SCREENS
// ==========================================

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderCategories() {
  const grid = $('categoryGrid');
  grid.innerHTML = state.datasets.map((cat, index) => `
    <button class="category-card" data-category="${index}" role="listitem" aria-label="${escapeHtml(cat.category.name)} category">
      <div class="card-top">
        <span class="category-icon" aria-hidden="true">${cat.icon}</span>
        <span class="card-round-badge">${cat.rounds.length} rounds</span>
      </div>
      <div class="card-body">
        <strong>${escapeHtml(cat.category.name)}</strong>
        <p>${escapeHtml(cat.category.description)}</p>
      </div>
    </button>
  `).join('');

  grid.querySelectorAll('.category-card').forEach(btn => {
    btn.addEventListener('click', () => {
      startCategory(Number(btn.dataset.category));
    });
  });
}

function startCategory(index) {
  state.categoryIndex = index;
  state.roundIndex = 0;
  startRound();
}

// ==========================================
// GAMEPLAY LOGIC
// ==========================================

function startRound() {
  const cat = getCategory();
  const round = getRound();

  state.found = new Set();
  state.strikes = 0;
  state.score = 0;
  state.ended = false;
  state.isEnding = false;

  $('headerCategory').textContent = cat.category.name;
  $('roundCounter').textContent = `ROUND ${state.roundIndex + 1} / ${cat.rounds.length}`;
  $('searchPrompt').textContent = round.prompt;
  
  updateHeaderScore(false);
  updateStrikes();

  const inputEl = $('guessInput');
  inputEl.value = '';
  inputEl.disabled = false;
  $('guessSubmit').disabled = false;
  $('giveUp').disabled = false;

  hideFeedback();
  renderBoard();
  showScreen('game');

  setTimeout(() => {
    inputEl.focus();
  }, 60);
}

function updateHeaderScore(animate = false) {
  const scoreVal = $('currentScore');
  scoreVal.textContent = formatScore(state.score);
  if (animate) {
    scoreVal.classList.remove('bump');
    void scoreVal.offsetWidth;
    scoreVal.classList.add('bump');
  }
}

function updateStrikes() {
  const dots = document.querySelectorAll('#strikeDots .strike-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('used', index < state.strikes);
  });
}

function renderBoard() {
  const round = getRound();
  const prompt = round.prompt;
  const boardEl = $('answerBoard');

  boardEl.innerHTML = round.answers.map((answer) => {
    const isFound = state.found.has(answer.id);
    const isEnded = state.ended;
    const parts = getAnswerParts(answer, prompt);
    const barWidth = Math.min(85, Math.max(28, 24 + (parts.completionPart || answer.text).length * 3.4));

    if (isFound) {
      return `
        <div class="answer-row found" data-answer-id="${answer.id}">
          <div class="row-icon-col" aria-hidden="true">✓</div>
          <div class="row-text-col">
            ${parts.promptPart ? `<span class="row-prompt">${escapeHtml(parts.promptPart)} </span>` : ''}
            <strong class="row-completion">${escapeHtml(parts.completionPart || answer.text)}</strong>
          </div>
          <div class="row-points-col">+${formatScore(answer.points)}</div>
        </div>
      `;
    } else if (isEnded) {
      return `
        <div class="answer-row revealed" data-answer-id="${answer.id}">
          <div class="row-icon-col" aria-hidden="true">🔍</div>
          <div class="row-text-col">
            ${parts.promptPart ? `<span class="row-prompt">${escapeHtml(parts.promptPart)} </span>` : ''}
            <span class="row-completion">${escapeHtml(parts.completionPart || answer.text)}</span>
          </div>
          <div class="row-points-col">${formatScore(answer.points)}</div>
        </div>
      `;
    } else {
      return `
        <div class="answer-row hidden" data-answer-id="${answer.id}">
          <div class="row-icon-col" aria-hidden="true">🔍</div>
          <div class="row-text-col">
            <span class="row-prompt">${escapeHtml(prompt)} </span>
            <div class="placeholder-track" style="flex: 1; min-width: 0; display: flex; align-items: center;">
              <span class="placeholder-bar" style="width: ${barWidth}%;"></span>
            </div>
          </div>
          <div class="row-points-col">${formatScore(answer.points)}</div>
        </div>
      `;
    }
  }).join('');
}

function showFeedback(text, type) {
  const banner = $('feedback');
  banner.textContent = text;
  banner.className = `feedback-banner show ${type}`;
}

function hideFeedback() {
  const banner = $('feedback');
  banner.className = 'feedback-banner';
  banner.textContent = '';
}

function submitGuess(e) {
  if (e) e.preventDefault();
  if (state.ended || state.isEnding) return;

  const inputEl = $('guessInput');
  const rawInput = inputEl.value.trim();
  if (!rawInput) return;

  const round = getRound();

  // 1. DUPLICATE GUESS CHECK
  const alreadyFound = round.answers.find(a =>
    state.found.has(a.id) && matchesAnswer(rawInput, a, round.prompt)
  );

  if (alreadyFound) {
    showFeedback('Already found!', 'neutral');
    inputEl.select();
    inputEl.focus();
    return;
  }

  // 2. CORRECT GUESS CHECK
  const matched = round.answers.find(a =>
    !state.found.has(a.id) && matchesAnswer(rawInput, a, round.prompt)
  );

  if (matched) {
    state.found.add(matched.id);
    state.score += Number(matched.points);
    updateHeaderScore(true);
    renderBoard();
    showFeedback(`✓ Correct! +${formatScore(matched.points)}`, 'correct');
    inputEl.value = '';

    if (state.found.size === round.answers.length) {
      endRound('all-found');
    } else {
      inputEl.focus();
    }
    return;
  }

  // 3. WRONG GUESS CHECK
  state.strikes += 1;
  updateStrikes();

  const boardEl = $('answerBoard');
  boardEl.classList.remove('shake');
  void boardEl.offsetWidth;
  boardEl.classList.add('shake');

  showFeedback('✕ Not a match!', 'wrong');
  inputEl.select();
  inputEl.focus();

  if (state.strikes >= 3) {
    endRound('strikes');
  }
}

function endRound(reason) {
  if (state.ended) return;
  state.ended = true;
  state.isEnding = true;

  const inputEl = $('guessInput');
  const submitBtn = $('guessSubmit');
  const giveUpBtn = $('giveUp');

  inputEl.disabled = true;
  submitBtn.disabled = true;
  giveUpBtn.disabled = true;

  // Reveal all answers on the board
  renderBoard();

  if (reason === 'all-found') {
    showFeedback('✓ ALL 10 ANSWERS FOUND!', 'allfound');
  } else if (reason === 'strikes') {
    showFeedback('✕ 3 Strikes! Round ended.', 'wrong');
  } else if (reason === 'give-up') {
    showFeedback('You gave up!', 'giveup');
  }

  setTimeout(() => {
    state.isEnding = false;
    showSummaryScreen(reason);
  }, 1300);
}

function showSummaryScreen(reason) {
  const round = getRound();
  const category = getCategory();

  if (reason === 'all-found') {
    $('summaryTopTag').textContent = 'PERFECT ROUND!';
    $('summaryTitle').textContent = 'All 10 Answers Found!';
    $('summarySubtitle').textContent = 'You discovered every search completion!';
  } else if (reason === 'strikes') {
    $('summaryTopTag').textContent = 'ROUND COMPLETE';
    $('summaryTitle').textContent = '3 Strikes';
    $('summarySubtitle').textContent = 'Round ended. Here are the search completions you missed.';
  } else {
    $('summaryTopTag').textContent = 'ROUND COMPLETE';
    $('summaryTitle').textContent = 'You Gave Up';
    $('summarySubtitle').textContent = 'Round ended. Here are all the search completions.';
  }

  $('summaryPromptText').textContent = round.prompt;
  $('summaryScore').textContent = formatScore(state.score);
  $('summaryFoundCount').textContent = `${state.found.size} of ${round.answers.length} found`;

  $('summaryAnswers').innerHTML = round.answers.map(answer => {
    const isFound = state.found.has(answer.id);
    const parts = getAnswerParts(answer, round.prompt);

    return `
      <div class="summary-answer-row ${isFound ? 'is-found' : 'is-missed'}">
        <span class="summary-status-icon" aria-hidden="true">${isFound ? '✓' : '—'}</span>
        <span class="summary-answer-text">
          ${parts.promptPart ? `${escapeHtml(parts.promptPart)} ` : ''}
          <strong>${escapeHtml(parts.completionPart || answer.text)}</strong>
        </span>
        <span class="summary-answer-points">${isFound ? `+${formatScore(answer.points)}` : formatScore(answer.points)}</span>
      </div>
    `;
  }).join('');

  const isLastRound = state.roundIndex >= category.rounds.length - 1;
  $('nextRound').textContent = isLastRound ? 'Category Complete →' : 'Next Round →';

  showScreen('summary');
}

// ==========================================
// EVENT LISTENERS
// ==========================================

$('guessForm').addEventListener('submit', submitGuess);

$('giveUp').addEventListener('click', () => {
  if (!state.ended && !state.isEnding) {
    endRound('give-up');
  }
});

$('backToCategories').addEventListener('click', () => {
  showScreen('categories');
});

$('chooseCategory').addEventListener('click', () => {
  showScreen('categories');
});

$('nextRound').addEventListener('click', () => {
  const category = getCategory();
  if (state.roundIndex < category.rounds.length - 1) {
    state.roundIndex += 1;
    startRound();
  } else {
    showScreen('categories');
  }
});

// Initialize game
loadData();
