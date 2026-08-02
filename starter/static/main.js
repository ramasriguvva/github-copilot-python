// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let currentSolution = [];
let timerInterval = null;
let elapsedSeconds = 0;
let timerStarted = false;
let hintsUsed = 0;

function collectBoard() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimerDisplay() {
  const timer = document.getElementById('timer');
  if (timer) {
    timer.textContent = `Time: ${formatTime(elapsedSeconds)}`;
  }
}

function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  elapsedSeconds = 0;
  hintsUsed = 0;
  timerStarted = true;
  updateTimerDisplay();
  timerInterval = window.setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerStarted = false;
}

function showCompletionMessage() {
  const msg = document.getElementById('message');
  const difficulty = document.getElementById('difficulty-select').value;
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  msg.style.color = '#388e3c';
  msg.innerText = `Congratulations! Puzzle solved in ${formatTime(elapsedSeconds)} on ${difficultyLabel} difficulty with ${hintsUsed} hint${hintsUsed === 1 ? '' : 's'}.`;
}

function getLeaderboardEntries() {
  const stored = localStorage.getItem('sudoku-leaderboard');
  return stored ? JSON.parse(stored) : [];
}

function saveLeaderboardEntries(entries) {
  localStorage.setItem('sudoku-leaderboard', JSON.stringify(entries));
}

function renderLeaderboard() {
  const leaderboardList = document.getElementById('leaderboard-list');
  if (!leaderboardList) {
    return;
  }

  const entries = getLeaderboardEntries()
    .sort((a, b) => {
      if (a.timeSeconds !== b.timeSeconds) {
        return a.timeSeconds - b.timeSeconds;
      }
      return a.hintsUsed - b.hintsUsed;
    })
    .slice(0, 10);

  leaderboardList.innerHTML = '';
  if (entries.length === 0) {
    leaderboardList.innerHTML = '<li>No scores yet.</li>';
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    item.textContent = `${index + 1}. ${entry.name} — ${formatTime(entry.timeSeconds)} — ${entry.difficulty} — ${entry.hintsUsed} hint${entry.hintsUsed === 1 ? '' : 's'}`;
    leaderboardList.appendChild(item);
  });
}

function applyTheme(theme) {
  document.body.classList.remove('light-theme', 'dark-theme');
  document.body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
  localStorage.setItem('sudoku-theme', theme);
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
  applyTheme(nextTheme);
}

function saveScore() {
  const nameInput = document.getElementById('player-name');
  const name = (nameInput ? nameInput.value.trim() : '').slice(0, 20) || 'Anonymous';
  const difficulty = document.getElementById('difficulty-select').value;
  const entries = getLeaderboardEntries();
  entries.push({
    name,
    timeSeconds: elapsedSeconds,
    difficulty,
    hintsUsed
  });
  saveLeaderboardEntries(entries);
  renderLeaderboard();
}

function isBoardSolved() {
  if (!currentSolution || currentSolution.length === 0) {
    return false;
  }

  const board = collectBoard();
  return board.every((row, rowIndex) => row.every((value, colIndex) => value === currentSolution[rowIndex][colIndex]));
}

function validateBoard() {
  const board = collectBoard();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const invalidIndices = new Set();

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col];
      if (!value) continue;

      const idx = row * SIZE + col;
      const input = inputs[idx];
      if (input.disabled) continue;

      const rowHasDuplicate = Array.from({length: SIZE}, (_, c) => c)
        .some((otherCol) => otherCol !== col && board[row][otherCol] === value);
      const colHasDuplicate = Array.from({length: SIZE}, (_, r) => r)
        .some((otherRow) => otherRow !== row && board[otherRow][col] === value);
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      const boxHasDuplicate = Array.from({length: 3}, (_, offsetRow) => boxRow + offsetRow)
        .some((boxRowIndex) => Array.from({length: 3}, (_, offsetCol) => boxCol + offsetCol)
          .some((boxColIndex) => (boxRowIndex !== row || boxColIndex !== col) && board[boxRowIndex][boxColIndex] === value));

      if (rowHasDuplicate || colHasDuplicate || boxHasDuplicate) {
        invalidIndices.add(idx);
      }
    }
  }

  for (let idx = 0; idx < inputs.length; idx++) {
    const input = inputs[idx];
    input.classList.remove('invalid-input');
    if (!input.disabled && invalidIndices.has(idx)) {
      input.classList.add('invalid-input');
    }
  }

  if (timerStarted && isBoardSolved()) {
    stopTimer();
  }
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        validateBoard();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
  validateBoard();
}

async function newGame() {
  const difficulty = document.getElementById('difficulty-select').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  currentSolution = data.solution || [];
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
  startTimer();
}

function applyHint() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const emptyIndices = [];

  for (let idx = 0; idx < inputs.length; idx++) {
    const input = inputs[idx];
    if (!input.disabled && input.value === '') {
      emptyIndices.push(idx);
    }
  }

  if (emptyIndices.length === 0) {
    return;
  }

  const targetIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  const row = Math.floor(targetIndex / SIZE);
  const col = targetIndex % SIZE;
  const value = currentSolution[row][col];
  const input = inputs[targetIndex];
  hintsUsed += 1;
  input.value = value;
  input.disabled = true;
  input.classList.remove('invalid-input');
  input.classList.remove('incorrect');
  input.classList.add('prefilled');
  validateBoard();
}

function clearCellHighlights() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.classList.remove('incorrect');
    inp.classList.remove('invalid-input');
  }
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = collectBoard();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.className = 'sudoku-cell';
    if (incorrect.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
    }
  }
  if (incorrect.size === 0) {
    stopTimer();
    showCompletionMessage();
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

async function checkPuzzle() {
  clearCellHighlights();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = collectBoard();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    if (incorrect.has(idx)) {
      inp.classList.add('incorrect');
    }
  }
  if (incorrect.size === 0) {
    stopTimer();
    showCompletionMessage();
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Incorrect cells highlighted.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('sudoku-theme') || 'light';
  applyTheme(savedTheme);

  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('check-puzzle').addEventListener('click', checkPuzzle);
  document.getElementById('hint-button').addEventListener('click', applyHint);
  document.getElementById('save-score').addEventListener('click', saveScore);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  renderLeaderboard();
  // initialize
  newGame();
});