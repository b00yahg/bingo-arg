// THE SCHEMES - Simon Says Balloon Game

const SchemesGame = {
    colors: ['red', 'blue', 'yellow'],
    pattern: [],
    playerInput: [],
    round: 0,
    isShowingPattern: false,
    isPlayerTurn: false,
    inGameMode: false, // Track if in active game
    score: 0,          // consecutive rounds cleared in the current game
    bestScore: 0,      // best run this session (shown as "Best")
    // Track clicks per color for 666 puzzle
    colorClicks: {
        red: 0,
        blue: 0,
        yellow: 0
    },
    puzzles: {
        puzzle1Complete: false,
        puzzle2Complete: false
    }
};

const SOUNDS = {
    balloonPop: new Audio('assets/sounds/balloon_pop.mp3'),
    correctChime: new Audio('assets/sounds/correct_chime.mp3'),
    wrongBuzzer: new Audio('assets/sounds/wrong_buzzer.mp3')
};

// Each balloon gets its own note, Simon-style, so the pattern is easier to remember by ear
const BALLOON_NOTES = { red: 330, blue: 440, yellow: 554 };
const BALLOON_COLORS = { red: '#ff3030', blue: '#3aa0ff', yellow: '#ffe03a' };

// Initialize Schemes Game
document.addEventListener('DOMContentLoaded', () => {
    initSchemesGame();
});

function initSchemesGame() {
    // Load saved progress
    const progress = window.GameApp.Store.get('schemesProgress');
    if (progress) {
        SchemesGame.bestScore = progress.bestScore || 0;
        SchemesGame.puzzles = progress.puzzles || SchemesGame.puzzles;
        SchemesGame.colorClicks = progress.colorClicks || SchemesGame.colorClicks;
    }

    // Generate balloon buttons
    generateBalloons();

    // Start button
    const startBtn = document.getElementById('start-balloon-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startNewGame);
    }

    updateDisplay();
}

// Generate balloon buttons
function generateBalloons() {
    const grid = document.getElementById('balloon-grid');
    grid.innerHTML = '';

    SchemesGame.colors.forEach((color, index) => {
        const balloonBtn = createBalloonButton(color, index);
        grid.appendChild(balloonBtn);
    });
}

// Create balloon button
function createBalloonButton(color, index) {
    const container = document.createElement('div');
    container.className = 'balloon-container';

    const balloon = document.createElement('div');
    balloon.className = `balloon ${color}`;
    balloon.setAttribute('data-color', color);
    balloon.setAttribute('role', 'button');
    balloon.setAttribute('aria-label', `${color} balloon`);

    // Use image if available, fallback to emoji
    const img = document.createElement('img');
    img.src = `assets/images/balloons/${color}_balloon.png`;
    img.alt = `${color} balloon`;
    img.draggable = false;
    img.onerror = () => {
        // Fallback to emoji if image not found
        balloon.innerHTML = '<span class="balloon-emoji">🎈</span>';
    };
    balloon.appendChild(img);

    balloon.style.animationDelay = `${index * -0.9}s`;

    balloon.addEventListener('click', () => {
        if (SchemesGame.inGameMode) {
            // In game mode: Simon Says logic
            if (SchemesGame.isPlayerTurn && !SchemesGame.isShowingPattern) {
                handlePlayerClick(color, balloon);
            }
        } else {
            // Outside game mode: Free clicking for 666 puzzle
            handleFreeClick(color, balloon);
        }
    });

    container.appendChild(balloon);
    return container;
}

// Start new game
function startNewGame() {
    if (SchemesGame.inGameMode) return; // no overlapping games
    SchemesGame.inGameMode = true;
    SchemesGame.pattern = [];
    SchemesGame.playerInput = [];
    SchemesGame.round = 0;
    SchemesGame.score = 0;
    setStartEnabled(false);
    nextRound();
}

// Next round
function nextRound() {
    if (!SchemesGame.inGameMode) return;
    SchemesGame.round++;
    SchemesGame.playerInput = [];

    // Add new color to pattern
    const randomColor = SchemesGame.colors[Math.floor(Math.random() * SchemesGame.colors.length)];
    SchemesGame.pattern.push(randomColor);

    updateDisplay();

    // Show pattern to player
    setTimeout(() => {
        showPattern();
    }, 700);
}

// Show pattern to player
async function showPattern() {
    SchemesGame.isShowingPattern = true;
    SchemesGame.isPlayerTurn = false;

    setStatus("Watch the pattern!");
    disableAllBalloons();

    for (let i = 0; i < SchemesGame.pattern.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 450));
        if (!SchemesGame.inGameMode) return;
        flashBalloon(SchemesGame.pattern[i]);
        await new Promise(resolve => setTimeout(resolve, 450));
    }

    SchemesGame.isShowingPattern = false;
    SchemesGame.isPlayerTurn = true;
    setStatus("Your turn! Repeat the pattern!");
    enableAllBalloons();
}

// Flash balloon
function flashBalloon(color) {
    const balloon = document.querySelector(`.balloon[data-color="${color}"]`);
    if (balloon) {
        balloon.classList.remove('flash');
        void balloon.offsetWidth;
        balloon.classList.add('flash');
        playSound(SOUNDS.balloonPop, 0.18);
        window.GameApp.Sound.blip(BALLOON_NOTES[color], 0.32, 'triangle', 0.12);
        burst(balloon, color);

        setTimeout(() => {
            balloon.classList.remove('flash');
        }, 500);
    }
}

// Little pixel-confetti burst from a balloon
function burst(balloon, color) {
    const b = document.createElement('div');
    b.className = 'pop-burst';
    for (let i = 0; i < 10; i++) {
        const p = document.createElement('i');
        const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
        const r = 50 + Math.random() * 40;
        p.style.setProperty('--x', `${Math.cos(a) * r}px`);
        p.style.setProperty('--y', `${Math.sin(a) * r}px`);
        p.style.setProperty('--c', i % 3 ? BALLOON_COLORS[color] : '#fff');
        b.appendChild(p);
    }
    balloon.appendChild(b);
    setTimeout(() => b.remove(), 600);
}

// Handle player click (during game)
function handlePlayerClick(color, balloon) {
    SchemesGame.playerInput.push(color);

    // Visual feedback
    balloon.classList.remove('flash');
    void balloon.offsetWidth;
    balloon.classList.add('flash');
    playSound(SOUNDS.balloonPop, 0.18);
    window.GameApp.Sound.blip(BALLOON_NOTES[color], 0.22, 'triangle', 0.12);
    burst(balloon, color);
    setTimeout(() => {
        balloon.classList.remove('flash');
    }, 300);

    // Check if pattern matches so far
    const currentIndex = SchemesGame.playerInput.length - 1;

    if (SchemesGame.playerInput[currentIndex] !== SchemesGame.pattern[currentIndex]) {
        // Wrong! Reset progress
        gameOver();
        return;
    }

    // Check if pattern complete
    if (SchemesGame.playerInput.length === SchemesGame.pattern.length) {
        // Correct!
        patternComplete();
    }
}

// Handle free click (outside game, for 666 puzzle)
function handleFreeClick(color, balloon) {
    // Visual feedback
    balloon.classList.remove('flash');
    void balloon.offsetWidth;
    balloon.classList.add('flash');
    playSound(SOUNDS.balloonPop, 0.3);
    burst(balloon, color);
    setTimeout(() => {
        balloon.classList.remove('flash');
    }, 300);

    // Track clicks per color for 666 puzzle
    SchemesGame.colorClicks[color]++;
    console.log(`[666 Puzzle] ${color}: ${SchemesGame.colorClicks[color]}/6 clicks`);

    check666Puzzle();
    saveSchemesProgress();
}

// Pattern complete
function patternComplete() {
    SchemesGame.isPlayerTurn = false;
    SchemesGame.score++;
    SchemesGame.bestScore = Math.max(SchemesGame.bestScore, SchemesGame.score);

    playSound(SOUNDS.correctChime);
    setStatus("Correct! Get ready...");

    updateDisplay();
    saveSchemesProgress();

    // PUZZLE 1: Complete 5 rounds successfully (SURFACE)
    if (!SchemesGame.puzzles.puzzle1Complete && SchemesGame.score >= 5) {
        SchemesGame.puzzles.puzzle1Complete = true;
        saveSchemesProgress();
        setTimeout(() => {
            window.GameApp.revealFragment(1); // Reveals "-47"
        }, 500);
    }

    // Next round
    setTimeout(() => {
        nextRound();
    }, 1000);
}

// Game over - RESET PROGRESS
function gameOver() {
    SchemesGame.isPlayerTurn = false;
    SchemesGame.inGameMode = false;
    playSound(SOUNDS.wrongBuzzer);
    window.GameApp.Sound.blip(160, 0.4, 'sawtooth', 0.06, 70);

    setStatus(`Wrong! You reached round ${SchemesGame.round}. Your progress has been reset.`);
    document.querySelector('#schemes-game .stage').animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }],
        { duration: 300, iterations: 2 }
    );

    // RESET SCORE
    SchemesGame.score = 0;
    SchemesGame.round = 0;
    SchemesGame.pattern = [];
    SchemesGame.playerInput = [];

    updateDisplay(true);
    saveSchemesProgress();
    enableAllBalloons();

    // Reset button
    setTimeout(() => {
        setStartEnabled(true);
        if (!SchemesGame.inGameMode) setStatus("Click 'Start Game' to try again!");
    }, 2000);
}

// Check 666 puzzle (each color clicked 6 times)
function check666Puzzle() {
    if (SchemesGame.puzzles.puzzle2Complete) return;

    // Check if ALL three colors have been clicked 6 times each
    const red = SchemesGame.colorClicks.red;
    const blue = SchemesGame.colorClicks.blue;
    const yellow = SchemesGame.colorClicks.yellow;

    console.log(`[666 Puzzle] Progress: Red=${red}/6, Blue=${blue}/6, Yellow=${yellow}/6`);

    if (red >= 6 && blue >= 6 && yellow >= 6) {
        SchemesGame.puzzles.puzzle2Complete = true;
        window.GameApp.revealFragment(2); // Reveals "J"
        window.GameApp.showNotification('🔥 THE DEVIL\'S SIGNATURE DECODED! 🔥');

        // Visual effect
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = '';
        }, 1000);

        // Reset counter
        SchemesGame.colorClicks = { red: 0, blue: 0, yellow: 0 };
        saveSchemesProgress();
    }
}

// Utility functions
function setStatus(text) {
    const el = document.getElementById('game-status');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('flash-msg');
    void el.offsetWidth;
    el.classList.add('flash-msg');
}

function setStartEnabled(on) {
    const btn = document.getElementById('start-balloon-btn');
    if (btn) btn.disabled = !on;
}

function disableAllBalloons() {
    document.querySelectorAll('.balloon').forEach(b => {
        b.style.pointerEvents = 'none';
        b.style.opacity = '0.55';
    });
}

function enableAllBalloons() {
    document.querySelectorAll('.balloon').forEach(b => {
        b.style.pointerEvents = 'auto';
        b.style.opacity = '1';
    });
}

function setStat(el, value) {
    if (!el || el.textContent === String(value)) return;
    el.textContent = value;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
}

function updateDisplay(keepStatus = false) {
    const statusEl = document.getElementById('game-status');
    const roundEl = document.getElementById('balloon-round');
    const scoreEl = document.getElementById('balloon-score');

    if (!keepStatus && statusEl && SchemesGame.round === 0 && !SchemesGame.inGameMode) {
        statusEl.textContent = "Click 'Start Game' to begin! (Or click balloons freely...)";
    }
    setStat(roundEl, SchemesGame.round);
    setStat(scoreEl, SchemesGame.bestScore);
}

function saveSchemesProgress() {
    window.GameApp.Store.set('schemesProgress', {
        bestScore: SchemesGame.bestScore,
        puzzles: SchemesGame.puzzles,
        colorClicks: SchemesGame.colorClicks
    });
}

// Export for debugging
window.SchemesGame = SchemesGame;
