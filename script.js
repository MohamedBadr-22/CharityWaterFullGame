
// Game settings
const GOAL_CANS = 20;
const GAME_LENGTH = 30;

let currentCans = 0;
let timeLeft = GAME_LENGTH;
let gameActive = false;
let spawnInterval;
let timerInterval;

// Random winning and losing messages
const winningMessages = [
  'Amazing! You collected enough clean water cans!',
  'You did it! Every drop counts!',
  'Fantastic work! You reached the clean water goal!'
];

const losingMessages = [
  'Good effort! Try again to collect 20 cans!',
  'Almost there! Give Water Quest another try!',
  'Keep going! You can reach the clean water goal!'
];

const scoreDisplay = document.getElementById('current-cans');
const timerDisplay = document.getElementById('timer');
const messageDisplay = document.getElementById('achievements');
const startButton = document.getElementById('start-game');
const confettiLayer = document.getElementById('confetti');

// Create the 3x3 game grid
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

// Update the displayed score
function updateScore() {
  scoreDisplay.textContent = currentCans;
}

// Choose a random message from an array
function randomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Spawn a clean water can or dirty water obstacle
function spawnWaterCan() {
  if (!gameActive) return;

  const cells = document.querySelectorAll('.grid-cell');

  // Remove previous items
  cells.forEach(cell => {
    cell.innerHTML = '';
  });

  // Choose a random grid cell
  const randomCell =
    cells[Math.floor(Math.random() * cells.length)];

  // Extra credit: 18% chance of dirty water appearing
  const isDirty = Math.random() < 0.18;

  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'game-item';

  item.setAttribute(
    'aria-label',
    isDirty
      ? 'Dirty water: lose 2 points'
      : 'Yellow water can: earn 1 point'
  );

  item.innerHTML = isDirty
    ? '<span class="dirty-drop" aria-hidden="true">💧</span>'
    : '<span class="water-can" aria-hidden="true"></span>';

  // Add or subtract points when clicked
  item.addEventListener('click', () => {
    if (!gameActive) return;

    if (isDirty) {
      currentCans = Math.max(0, currentCans - 2);
      messageDisplay.textContent =
        'Oops! Dirty water: −2 points.';
    } else {
      currentCans++;
      messageDisplay.textContent =
        'Clean water collected! +1 point!';
    }

    updateScore();

    // Prevent collecting the same item twice
    item.remove();
  }, { once: true });

  randomCell.appendChild(item);
}

// Start a new game
function startGame() {
  if (gameActive) return;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  currentCans = 0;
  timeLeft = GAME_LENGTH;
  gameActive = true;

  updateScore();
  timerDisplay.textContent = timeLeft;

  messageDisplay.textContent =
    'Go! Tap yellow water cans as fast as you can!';

  confettiLayer.innerHTML = '';
  startButton.disabled = true;

  createGrid();
  spawnWaterCan();

  // New water can appears every 0.7 seconds
  spawnInterval = setInterval(spawnWaterCan, 700);

  // Countdown timer
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Extra credit: confetti celebration
function celebrateWin() {
  const colors = [
    '#FFC907',
    '#2E9DF7',
    '#8BD1CB',
    '#4FCB53',
    '#FF902A'
  ];

  for (let i = 0; i < 65; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';

    piece.style.left = `${Math.random() * 100}%`;

    piece.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    piece.style.animationDelay =
      `${Math.random() * 0.7}s`;

    confettiLayer.appendChild(piece);
  }

  setTimeout(() => {
    confettiLayer.innerHTML = '';
  }, 3500);
}

// End the game after 30 seconds
function endGame() {
  if (!gameActive) return;

  gameActive = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.innerHTML = '';
  });

  startButton.disabled = false;
  startButton.textContent = 'Play Again';

  const won = currentCans >= GOAL_CANS;

  const message = randomMessage(
    won ? winningMessages : losingMessages
  );

  messageDisplay.textContent =
    `${won ? '🏆 WIN!' : '⏰ Time is up!'} ${message} Final score: ${currentCans}.`;

  if (won) {
    celebrateWin();
  }
}

// Extra credit: reset button
function resetGame() {
  gameActive = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  currentCans = 0;
  timeLeft = GAME_LENGTH;

  updateScore();
  timerDisplay.textContent = timeLeft;

  messageDisplay.textContent =
    'Game reset. Press Start Game to begin!';

  startButton.disabled = false;
  startButton.textContent = 'Start Game';

  confettiLayer.innerHTML = '';

  createGrid();
}

// Initialize the game
createGrid();

startButton.addEventListener('click', startGame);

document.getElementById('reset-game')
  .addEventListener('click', resetGame);

