// THE MASKS - Shell Game

const MasksGame = {
    wins: 0,
    losses: 0,
    consecutiveLosses: 0,
    correctShell: null,
    gameActive: false,
    isShuffling: false,
    roundInProgress: false,
    devilLaughing: false,
    knifeActive: false,
    puzzles: {
        puzzle1Complete: false,
        puzzle2Complete: false,
        puzzle3Complete: false
    }
};

const SHELL_SOUNDS = {
    shuffle: new Audio('assets/sounds/shuffle.mp3'),
    win: new Audio('assets/sounds/win.mp3'),
    lose: new Audio('assets/sounds/loose.mp3'),
    devilLaugh: new Audio('assets/sounds/devil_laugh.mp3'),
    stab: new Audio('assets/sounds/stab.mp3')
};

// Initialize Masks Game
document.addEventListener('DOMContentLoaded', () => {
    initMasksGame();
});

function initMasksGame() {
    // Load saved progress (this session only)
    const progress = window.GameApp.Store.get('masksProgress');
    if (progress) {
        MasksGame.wins = progress.wins || 0;
        MasksGame.losses = progress.losses || 0;
        MasksGame.consecutiveLosses = progress.consecutiveLosses || 0;
        MasksGame.puzzles = progress.puzzles || MasksGame.puzzles;
        MasksGame.devilLaughing = progress.devilLaughing || false;

        updateMasksDisplay();

        if (MasksGame.puzzles.puzzle3Complete) {
            showDevilDefeated();
        } else if (MasksGame.devilLaughing) {
            startDevilLaugh();
        }
    }

    // Start game button
    const startBtn = document.getElementById('start-shell-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startShellGame);
    }

    // One click handler for all shells (no stacked listeners between rounds)
    const shellsEl = document.getElementById('shells-container');
    if (shellsEl) {
        shellsEl.addEventListener('click', (e) => {
            const shell = e.target.closest('.shell');
            if (!shell || !MasksGame.gameActive) return;
            selectShell(parseInt(shell.getAttribute('data-shell'), 10));
        });
    }

    // Angel click handler
    const angel = document.getElementById('angel');
    if (angel) {
        angel.addEventListener('click', showAngelMessage);
    }

    // Knife: press and drag straight away (mouse or touch)
    const knife = document.getElementById('knife');
    if (knife) {
        knife.addEventListener('pointerdown', activateKnife);
    }
}

// Update display
function updateMasksDisplay() {
    const winCount = document.getElementById('win-count');
    const lossCount = document.getElementById('loss-count');
    bumpText(winCount, `${MasksGame.wins}/3`);
    bumpText(lossCount, MasksGame.losses);
}

function bumpText(el, value) {
    if (!el || el.textContent === String(value)) return;
    el.textContent = value;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
}

function setShellStartEnabled(on) {
    const startBtn = document.getElementById('start-shell-btn');
    if (startBtn) startBtn.disabled = !on;
}

// Start shell game
function startShellGame() {
    if (MasksGame.gameActive || MasksGame.isShuffling || MasksGame.roundInProgress) return;
    MasksGame.roundInProgress = true;
    setShellStartEnabled(false);

    // Reset shells
    document.querySelectorAll('.shell').forEach(shell => {
        shell.classList.remove('correct', 'wrong', 'disabled', 'has-ball', 'lifted', 'pickable');
        shell.style.pointerEvents = 'none';
    });

    // Pick random shell for the ball
    MasksGame.correctShell = Math.floor(Math.random() * 3);

    // Show the ball briefly under correct shell
    showBallBriefly();
}

// Show ball briefly before shuffle
function showBallBriefly() {
    const shells = document.querySelectorAll('.shell');
    const correctShell = shells[MasksGame.correctShell];

    // Lift shell to show ball
    correctShell.classList.add('lifted');
    correctShell.classList.add('has-ball');

    window.GameApp.showNotification('Remember which shell has the ball!');

    // Play shuffle sound slightly early for better timing
    setTimeout(() => {
        playSound(SHELL_SOUNDS.shuffle);
    }, 1700);

    // Wait 2 seconds then shuffle
    setTimeout(() => {
        correctShell.classList.remove('lifted');
        // Hide ball once the shell is back down
        setTimeout(() => {
            correctShell.classList.remove('has-ball');
            shuffleShells();
        }, 300);
    }, 2000);
}

// Shuffle shells animation
async function shuffleShells() {
    MasksGame.isShuffling = true;
    MasksGame.gameActive = false;

    const devil = document.getElementById('devil');
    if (devil && !MasksGame.devilLaughing) devil.style.animation = 'devil-shuffle 0.5s ease-in-out infinite';

    window.GameApp.showNotification('The devil shuffles...');

    const shells = document.querySelectorAll('.shell');

    // Make absolutely sure all balls are hidden during shuffle
    shells.forEach(shell => {
        shell.classList.remove('has-ball');
    });

    // Perform shuffle: always two different shells, arcing past each other
    for (let i = 0; i < 5; i++) {
        const shell1 = Math.floor(Math.random() * 3);
        let shell2 = Math.floor(Math.random() * 2);
        if (shell2 >= shell1) shell2++;

        await swapShells(shells[shell1], shells[shell2], shell1, shell2);
        await new Promise(resolve => setTimeout(resolve, 120));
    }

    if (devil) devil.style.animation = '';

    MasksGame.isShuffling = false;
    MasksGame.gameActive = true;

    // Enable shell selection
    shells.forEach(shell => {
        shell.style.pointerEvents = 'auto';
        shell.classList.add('pickable');
    });

    window.GameApp.showNotification('Pick a shell!');
}

// Swap two shells with an arcing animation
async function swapShells(shell1, shell2, index1, index2) {
    const rect1 = shell1.getBoundingClientRect();
    const rect2 = shell2.getBoundingClientRect();
    const deltaX = rect2.left - rect1.left;
    const duration = 380;

    window.GameApp.Sound.blip(300 + Math.random() * 120, 0.05, 'triangle', 0.05);

    const a1 = shell1.animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${deltaX / 2}px, -34px) rotate(${deltaX > 0 ? 8 : -8}deg)` },
        { transform: `translate(${deltaX}px, 0)` }
    ], { duration, easing: 'ease-in-out' });
    shell2.animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${-deltaX / 2}px, 12px) scale(0.94)` },
        { transform: `translate(${-deltaX}px, 0)` }
    ], { duration, easing: 'ease-in-out' });

    await a1.finished.catch(() => {});

    // Track which position has the ball (the shells snap back invisibly: they all look alike)
    if (MasksGame.correctShell === index1) {
        MasksGame.correctShell = index2;
    } else if (MasksGame.correctShell === index2) {
        MasksGame.correctShell = index1;
    }
}

// Select a shell
function selectShell(index) {
    if (!MasksGame.gameActive) return;

    MasksGame.gameActive = false;

    const shells = document.querySelectorAll('.shell');
    const selectedShell = shells[index];
    const correctShell = shells[MasksGame.correctShell];

    // Disable all shells
    shells.forEach(s => {
        s.style.pointerEvents = 'none';
        s.classList.remove('pickable');
    });

    // Lift selected shell
    selectedShell.classList.add('lifted');

    setTimeout(() => {
        if (index === MasksGame.correctShell) {
            // Correct choice - WIN
            selectedShell.classList.add('correct', 'has-ball');
            MasksGame.wins++;
            MasksGame.consecutiveLosses = 0;

            playSound(SHELL_SOUNDS.win);
            window.GameApp.showNotification('🎉 You found the truth!');
            window.GameApp.launchConfetti(24);

            // PUZZLE 1: Win 3 times (SURFACE)
            if (!MasksGame.puzzles.puzzle1Complete && MasksGame.wins >= 3) {
                MasksGame.puzzles.puzzle1Complete = true;
                setTimeout(() => {
                    window.GameApp.revealFragment(6); // Reveals "178.9012"
                }, 1000);
            }
        } else {
            // Wrong choice - LOSS
            selectedShell.classList.add('wrong');
            correctShell.classList.add('lifted', 'has-ball');

            MasksGame.losses++;
            MasksGame.consecutiveLosses++;

            console.log('🎭 Loss! Total losses:', MasksGame.losses);

            playSound(SHELL_SOUNDS.lose);
            window.GameApp.showNotification('❌ The devil deceived you!');

            // PUZZLE 2: Lose 3 times total (HIDDEN)
            if (!MasksGame.puzzles.puzzle2Complete && MasksGame.losses >= 3) {
                console.log('🎭 THREE LOSSES TOTAL! Unlocking fragment 7...');
                MasksGame.puzzles.puzzle2Complete = true;

                setTimeout(() => {
                    // First reveal the fragment
                    window.GameApp.revealFragment(7); // Reveals "T"
                    window.GameApp.showNotification('🔥 The devil laughs at your failures! 🔥');

                    // Then start the devil laughing (which enables the knife for fragment 8)
                    setTimeout(() => {
                        startDevilLaugh();
                    }, 500);
                }, 1000);
            }
        }

        updateMasksDisplay();
        saveMasksProgress();

        // Reset button text
        setTimeout(() => {
            const startBtn = document.getElementById('start-shell-btn');
            if (startBtn) startBtn.textContent = 'PLAY AGAIN';

            // Reset shells after a moment
            setTimeout(() => {
                shells.forEach(s => {
                    s.classList.remove('lifted', 'correct', 'wrong');
                });
                setTimeout(() => {
                    shells.forEach(s => s.classList.remove('has-ball'));
                    MasksGame.roundInProgress = false;
                    setShellStartEnabled(true);
                }, 300);
            }, 1500);
        }, 1500);
    }, 800);
}

// Start devil laughing
function startDevilLaugh() {
    MasksGame.devilLaughing = true;
    const devil = document.getElementById('devil');
    if (devil) {
        devil.style.animation = '';
        devil.classList.add('laughing');
        // Update devil image
        const devilImg = devil.querySelector('img');
        if (devilImg) {
            devilImg.src = 'assets/images/characters/devil_laughing.png';
        }
    }

    // Cut background music when devil laugh starts
    const bgMusic = document.getElementById('background-music');
    if (bgMusic) {
        bgMusic.pause();
    }

    // Loop the devil laugh sound
    SHELL_SOUNDS.devilLaugh.loop = true;
    playSound(SHELL_SOUNDS.devilLaugh);

    // Show knife and hint
    const knife = document.getElementById('knife');
    if (knife) {
        knife.classList.remove('hidden');
        knife.classList.add('available');
    }

    showKnifeHint();
    saveMasksProgress();
}

// Show angel message
function showAngelMessage() {
    if (document.querySelector('.angel-popup')) return;
    window.GameApp.Sound.blip(1318, 0.3, 'sine', 0.06, 1760);

    // Create a popup modal for the angel's message
    const popup = document.createElement('div');
    popup.className = 'angel-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #000;
        font-size: 1.2em;
        text-align: center;
        z-index: 10000;
        max-width: 92vw;
        width: 620px;
    `;

    popup.innerHTML = `
        <strong style="font-size: 1.3em; color: #0066FF;">Angel's Wisdom</strong>
        <p style="margin: 15px 0; line-height: 1.5;">
            "For every win, his pride does grow,<br>
            But everyone laughs when fools fall low.<br>
            Three failures in a row will make the confident blind,<br>
            A truth emerges from his twisted mind."
        </p>
        <button id="close-angel-popup" style="
            margin-top: 20px;
            padding: 10px 30px;
            font-size: 1em;
            background: #FFD700;
            color: #120a1c;
            cursor: pointer;
            font-weight: bold;
        ">GOT IT</button>
    `;

    document.body.appendChild(popup);

    // Close button handler
    document.getElementById('close-angel-popup').addEventListener('click', () => {
        popup.remove();
    });

    // Auto remove after 20 seconds if not clicked
    setTimeout(() => {
        if (popup.parentElement) {
            popup.remove();
        }
    }, 20000);
}

// Show knife hint (kept from the original build; it only shows if a
// #hint-masks-3 element is ever added to the page)
function showKnifeHint() {
    const hintBox = document.getElementById('hint-masks-3');
    if (!hintBox) return;
    hintBox.innerHTML = `
        <strong>🔪 The Final Strike:</strong> The devil's guard is down while he laughs.
        Click and drag the knife to the devil to strike him down and reveal the final memory fragment!
        <br><br>
        <em style="color: #ff3366;">Click the knife, then drag it to the devil...</em>
    `;
    hintBox.classList.add('visible');
}

// Knife: press on it and drag it onto the devil
function activateKnife(event) {
    if (MasksGame.knifeActive || !MasksGame.devilLaughing) return;

    const knife = document.getElementById('knife');
    const devil = document.getElementById('devil');
    if (!knife) return;

    event.preventDefault();

    // Create a draggable knife element
    const draggedKnife = document.createElement('img');
    draggedKnife.src = 'assets/images/weapons/knife.gif';
    draggedKnife.className = 'knife-ghost';
    draggedKnife.style.left = event.clientX + 'px';
    draggedKnife.style.top = event.clientY + 'px';
    document.body.appendChild(draggedKnife);
    knife.classList.add('held');

    window.GameApp.showNotification('Drag the knife to the devil!');

    const overDevil = (x, y) => {
        if (!devil) return false;
        const r = devil.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    function dragKnife(e) {
        draggedKnife.style.left = e.clientX + 'px';
        draggedKnife.style.top = e.clientY + 'px';
        if (devil) devil.style.filter = overDevil(e.clientX, e.clientY) ? 'drop-shadow(0 0 16px red)' : '';
    }

    function dropKnife(e) {
        document.removeEventListener('pointermove', dragKnife);
        document.removeEventListener('pointerup', dropKnife);
        document.removeEventListener('pointercancel', dropKnife);
        draggedKnife.remove();
        knife.classList.remove('held');
        if (devil) devil.style.filter = '';

        if (e.type !== 'pointercancel' && overDevil(e.clientX, e.clientY)) {
            // Successfully stabbed!
            MasksGame.knifeActive = true;
            stabDevil();
        } else {
            window.GameApp.showNotification('You missed! Try again.');
            // Reset for another attempt
            MasksGame.knifeActive = false;
        }
    }

    document.addEventListener('pointermove', dragKnife);
    document.addEventListener('pointerup', dropKnife);
    document.addEventListener('pointercancel', dropKnife);
}

// Stab the devil
function stabDevil() {
    if (!MasksGame.puzzles.puzzle3Complete) {
        MasksGame.puzzles.puzzle3Complete = true;
        MasksGame.devilLaughing = false;

        // IMMEDIATE JUMPSCARE - Stop laughing instantly
        SHELL_SOUNDS.devilLaugh.pause();
        SHELL_SOUNDS.devilLaugh.currentTime = 0;
        SHELL_SOUNDS.devilLaugh.loop = false;

        // Play stab sound LOUD - IMMEDIATELY
        playSound(SHELL_SOUNDS.stab, 0.9);

        // Full-screen jumpscare of the stabbed devil
        const scare = document.createElement('div');
        scare.className = 'jumpscare';
        scare.innerHTML = '<img src="assets/images/characters/devil_stabbed.png" alt="">';
        document.body.appendChild(scare);
        setTimeout(() => scare.remove(), 950);

        // DRAMATIC WHITE FLASH
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 9800;
            pointer-events: none;
            animation: jumpscareFlash 0.15s ease-out forwards;
        `;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 150);

        // SCREEN SHAKE EFFECT
        const body = document.body;
        body.style.animation = 'screenShake 0.3s ease-in-out 2';
        setTimeout(() => {
            body.style.animation = '';
        }, 600);

        showDevilDefeated();

        // Restart background music after stab
        const bgMusic = document.getElementById('background-music');
        if (bgMusic) {
            setTimeout(() => bgMusic.play().catch(e => console.log('Failed to restart music:', e)), 900);
        }

        document.body.style.cursor = '';

        window.GameApp.showNotification('💀 The deceiver falls!');

        setTimeout(() => {
            window.GameApp.revealFragment(8); // Reveals "DmPln-2387" (FINAL FRAGMENT)
            if (window.GameApp.gameState.fragments.length === 8) {
                window.GameApp.showNotification('🎉 ALL FRAGMENTS RECOVERED!');
            }
        }, 1500);

        saveMasksProgress();
    }
}

// Put the room into its "devil defeated" state
function showDevilDefeated() {
    const devil = document.getElementById('devil');
    if (devil) {
        devil.style.transition = 'none';
        devil.style.animation = '';
        devil.classList.remove('laughing');
        devil.classList.add('stabbed');
        const devilImg = devil.querySelector('img');
        if (devilImg) {
            devilImg.src = 'assets/images/characters/devil_stabbed.png';
        }
    }
    const knife = document.getElementById('knife');
    if (knife) {
        knife.classList.add('hidden');
        knife.classList.remove('available');
    }
}

function saveMasksProgress() {
    window.GameApp.Store.set('masksProgress', {
        wins: MasksGame.wins,
        losses: MasksGame.losses,
        consecutiveLosses: MasksGame.consecutiveLosses,
        puzzles: MasksGame.puzzles,
        devilLaughing: MasksGame.devilLaughing
    });
}

// Export for debugging
window.MasksGame = MasksGame;
