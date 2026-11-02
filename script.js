
// Water Quest - Project 6
// Game settings for each difficulty level

const difficulties = {
  easy: {
    goal: 10,
    time: 30,
    speed: 900,
    dirtyChance: 0.10
  },

  normal: {
    goal: 20,
    time: 30,
    speed: 650,
    dirtyChance: 0.18
  },

  hard: {
    goal: 25,
    time: 25,
    speed: 450,
    dirtyChance: 0.25
  }
};

// Game variables
let currentCans = 0;
let timeLeft = 30;
let gameActive = false;
let spawnInterval;
let timerInterval;
let currentDifficulty = difficulties.normal;

// Winning and losing messages
const winningMessages = [
  "Amazing! You reached the clean water goal!",
  "Fantastic! Every drop counts!",
  "Great job! You completed Water Quest!"
];

const losingMessages = [
  "Good effort! Try again!",
  "Almost there! You can do it!",
  "Keep trying! Every drop counts!"
];

// Extra credit: milestone messages stored in an array
const milestones = [
  { percent: 25, message: "Great start! 25% completed!" },
  { percent: 50, message: "Halfway there! Keep going!" },
  { percent: 75, message: "Almost there! 75% completed!" },
  { percent: 100, message: "Goal reached! Amazing work!" }
];

let reachedMilestones = [];

// HTML elements
const scoreDisplay = document.getElementById("current-cans");
const timerDisplay = document.getElementById("timer");
const goalDisplay = document.getElementById("goal");
const messageDisplay = document.getElementById("achievements");

const startButton = document.getElementById("start-game");
const resetButton = document.getElementById("reset-game");

const difficultySelect = document.getElementById("difficulty");
const difficultyInfo = document.getElementById("difficulty-info");

const progressBar = document.getElementById("progress-bar");
const confettiLayer = document.getElementById("confetti");
const soundToggle = document.getElementById("sound-toggle");

// Sound effects using JavaScript
// No additional audio files are required

let audioContext;

function playSound(type) {
  if (!soundToggle.checked) return;

  try {
    if (!audioContext) {
      audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();

    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    let frequency = 500;

    if (type === "collect") frequency = 700;
    if (type === "dirty") frequency = 180;
    if (type === "button") frequency = 450;
    if (type === "milestone") frequency = 900;
    if (type === "win") frequency = 1100;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const now = audioContext.currentTime;

    volume.gain.setValueAtTime(0.08, now);
    volume.gain.exponentialRampToValueAtTime(
      0.001, now + 0.15
    );

    oscillator.start(now);
    oscillator.stop(now + 0.15);

  } catch (error) {
    console.log("Sound unavailable:", error);
  }
}

// Create the 3x3 game grid
function createGrid() {
  const grid = document.querySelector(".game-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    grid.appendChild(cell);
  }
}

// Update score on screen
function updateScore() {
  scoreDisplay.textContent = currentCans;

  const progress = Math.min(
    100,
    (currentCans / currentDifficulty.goal) * 100
  );

  progressBar.style.width = progress + "%";
}

// Pick a random message from an array
function randomMessage(messages) {
  return messages[
    Math.floor(Math.random() * messages.length)
  ];
}

// Display milestone messages
function checkMilestones() {
  const progress =
    (currentCans / currentDifficulty.goal) * 100;

  for (let milestone of milestones) {
    if (
      progress >= milestone.percent &&
      !reachedMilestones.includes(milestone.percent)
    ) {
      reachedMilestones.push(milestone.percent);

      messageDisplay.textContent = milestone.message;
      playSound("milestone");
    }
  }
}

// Spawn water cans randomly
function spawnWaterCan() {
  if (!gameActive) return;

  const cells = document.querySelectorAll(".grid-cell");

  // Remove previous item
  cells.forEach(cell => {
    cell.innerHTML = "";
  });

  // Select random grid cell
  const randomCell =
    cells[Math.floor(Math.random() * cells.length)];

  // Decide if item is clean or dirty
  const isDirty =
    Math.random() < currentDifficulty.dirtyChance;

  const item = document.createElement("button");
  item.type = "button";
  item.className = "game-item";

  if (isDirty) {
    item.innerHTML =
      '<span class="dirty-drop">💧</span>';

    item.setAttribute(
      "aria-label",
      "Dirty water"
    );
  } else {
    item.innerHTML =
      '<span class="water-can"></span>';

    item.setAttribute(
      "aria-label",
      "Clean water can"
    );
  }

  // Click event
  item.addEventListener("click", function() {
    if (!gameActive) return;

    if (isDirty) {
      // Extra credit: penalty for dirty water
      currentCans = Math.max(0, currentCans - 2);

      messageDisplay.textContent =
        "Oops! Dirty water! -2 points.";

      playSound("dirty");

    } else {
      currentCans++;

      messageDisplay.textContent =
        "Clean water collected! +1 point!";

      playSound("collect");
    }

    updateScore();

    // Remove item from DOM after clicking
    item.remove();

    // Check score milestones
    if (!isDirty) {
      checkMilestones();
    }

  }, { once: true });

  randomCell.appendChild(item);
}

// Update difficulty settings
function updateDifficulty() {
  if (gameActive) return;

  currentDifficulty =
    difficulties[difficultySelect.value];

  currentCans = 0;
  timeLeft = currentDifficulty.time;

  scoreDisplay.textContent = currentCans;
  timerDisplay.textContent = timeLeft;
  goalDisplay.textContent = currentDifficulty.goal;

  difficultyInfo.textContent =
    "Collect " + currentDifficulty.goal +
    " cans in " + currentDifficulty.time +
    " seconds!";

  progressBar.style.width = "0%";
  reachedMilestones = [];

  messageDisplay.textContent =
    "Press Start Game to begin!";
}

// Start the game
function startGame() {
  if (gameActive) return;

  playSound("button");

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  currentDifficulty =
    difficulties[difficultySelect.value];

  currentCans = 0;
  timeLeft = currentDifficulty.time;

  reachedMilestones = [];
  gameActive = true;

  updateScore();

  timerDisplay.textContent = timeLeft;
  goalDisplay.textContent = currentDifficulty.goal;

  messageDisplay.textContent =
    "Go! Collect the yellow water cans!";

  startButton.disabled = true;
  difficultySelect.disabled = true;

  confettiLayer.innerHTML = "";

  createGrid();
  spawnWaterCan();

  // Water cans appear based on difficulty
  spawnInterval = setInterval(
    spawnWaterCan,
    currentDifficulty.speed
  );

  // Timer countdown
  timerInterval = setInterval(function() {
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
    "#FFC907",
    "#2E9DF7",
    "#4FCB53",
    "#FF902A",
    "#8BD1CB"
  ];

  for (let i = 0; i < 65; i++) {
    const confetti = document.createElement("span");

    confetti.className = "confetti-piece";

    confetti.style.left =
      Math.random() * 100 + "%";

    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    confetti.style.animationDelay =
      Math.random() * 0.7 + "s";

    confettiLayer.appendChild(confetti);
  }

  setTimeout(function() {
    confettiLayer.innerHTML = "";
  }, 4000);
}

// End the game
function endGame() {
  if (!gameActive) return;

  gameActive = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  // Clear game board
  document.querySelectorAll(".grid-cell").forEach(cell => {
    cell.innerHTML = "";
  });

  startButton.disabled = false;
  startButton.textContent = "Play Again";
  difficultySelect.disabled = false;

  // Check winning condition
  const won = currentCans >= currentDifficulty.goal;

  const message = randomMessage(
    won ? winningMessages : losingMessages
  );

  messageDisplay.textContent =
    (won ? "🏆 YOU WIN! " : "⏰ TIME IS UP! ") +
    message +
    " Final Score: " + currentCans;

  if (won) {
    playSound("win");
    celebrateWin();
  }
}

// Reset the game
function resetGame() {
  playSound("button");

  gameActive = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  currentCans = 0;
  timeLeft = difficulties[difficultySelect.value].time;

  reachedMilestones = [];

  scoreDisplay.textContent = 0;
  timerDisplay.textContent = timeLeft;

  progressBar.style.width = "0%";

  messageDisplay.textContent =
    "Game reset. Press Start Game to begin!";

  startButton.disabled = false;
  startButton.textContent = "Start Game";
  difficultySelect.disabled = false;

  confettiLayer.innerHTML = "";

  createGrid();
  updateDifficulty();
}

// Set up the game
createGrid();
updateDifficulty();

// Button events
startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

difficultySelect.addEventListener(
  "change",
  updateDifficulty
);


