// THE THREADS - Fortune Wheel Game

const ThreadsGame = {
    spinCount: 0,
    spinning: false,
    currentRotation: 0,
    spinHistory: [],
    lastLandedFortune: null,
    threadDiscovered: false,
    promptRevealed: false,
    puzzles: {
        puzzle1Complete: false,
        puzzle2Complete: false,
        puzzle3Complete: false
    },
    fortunes: [
        { text: 'YOU WIN', color: '#ff00ff', hint: 'surface', message: '🎉 The wheel smiles upon you!' },
        { text: 'SEVEN SPINS THEN STAY', color: '#00ffff', hint: 'hidden', message: '🍀 Lucky seven... if you know when to wait...' },
        { text: 'PULL THE THREAD AWAY', color: '#ffff00', hint: 'thread', message: '🧵 Some threads dangle... waiting to be tugged...' },
        { text: 'REVERSE THE TURN', color: '#ff3366', hint: 'thread', message: '⏪ What spins forward can spin back... with the right words...' },
        { text: 'THE FOOL KNOWS', color: '#00ff88', hint: 'lore', message: '🤡 The jester\'s wisdom hides in plain sight...' },
        { text: 'FATE BENDS TO WORDS', color: '#ff8800', hint: 'lore', message: '📜 Commands can change destiny itself...' },
        { text: 'NIW UOY', color: '#8800ff', hint: 'reverse', message: '💀 Something feels... wrong...' },
        { text: 'WHAT GOES AROUND', color: '#ff0088', hint: 'lore', message: '🎡 The wheel always returns to where it began...' }
    ]
};

// The spin is voiced by synthesized ticks (one per peg), so the sound always matches the wheel.
// Fragment chimes are played centrally by GameApp.revealFragment.

let canvas, ctx;
let wheelInitialized = false;
let bulbPhase = 0;
let pointerKick = 0;
let idleTimer = null;

const TAU = Math.PI * 2;

// Initialize Threads Game - ONLY call this when entering the game screen!
function initThreadsGame() {
    if (wheelInitialized) {
        drawWheel(ThreadsGame.currentRotation);
        startIdleLights();
        return;
    }

    canvas = document.getElementById('wheel-canvas');
    if (!canvas) {
        console.error('❌ Canvas element not found!');
        return;
    }
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ Could not get 2d context!');
        return;
    }

    // Update spin count display
    updateSpinCount();

    // Draw now, then again once the bundled fonts are ready
    drawWheel(ThreadsGame.currentRotation);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => drawWheel(ThreadsGame.currentRotation));
    }

    // Spin button
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.addEventListener('click', spinWheel);

    // Command prompt setup
    setupCommandPrompt();

    wheelInitialized = true;
    startIdleLights();
}

// Restore progress from this session
document.addEventListener('DOMContentLoaded', () => {
    const saved = window.GameApp.Store.get('threadsProgress');
    if (saved) {
        ThreadsGame.spinCount = saved.spinCount || 0;
        ThreadsGame.puzzles = saved.puzzles || ThreadsGame.puzzles;
        ThreadsGame.spinHistory = saved.spinHistory || [];
        ThreadsGame.currentRotation = saved.currentRotation || 0;
        ThreadsGame.promptRevealed = !!saved.promptRevealed;
        if (ThreadsGame.promptRevealed) {
            ThreadsGame.threadDiscovered = true;
            document.getElementById('command-prompt').classList.remove('hidden');
        } else if (saved.threadDiscovered) {
            enableThreadDrag();
        }
    }
});

// Leaving and coming back gives the wheel a fresh count if you overshot seven
document.addEventListener('screenchange', (e) => {
    if (e.detail.to === 'threads-game' && e.detail.from !== 'threads-game') {
        if (!ThreadsGame.puzzles.puzzle2Complete && !ThreadsGame.spinning && ThreadsGame.spinCount > 7) {
            ThreadsGame.spinCount = 0;
            updateSpinCount();
            saveThreadsProgress();
        }
    }
    if (e.detail.to !== 'threads-game') stopIdleLights();
});

function updateSpinCount() {
    const el = document.getElementById('spin-count');
    if (!el) return;
    el.textContent = ThreadsGame.spinCount;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
}

// Chasing marquee lights while the wheel is idle
function startIdleLights() {
    stopIdleLights();
    idleTimer = setInterval(() => {
        if (!ThreadsGame.spinning) {
            bulbPhase++;
            drawWheel(ThreadsGame.currentRotation);
        }
    }, 260);
}
function stopIdleLights() {
    if (idleTimer) clearInterval(idleTimer);
    idleTimer = null;
}

// Draw the fortune wheel (with text on segments)
function drawWheel(rotation = 0) {
    if (!canvas || !ctx) return;

    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const radius = 206;
    const numSegments = ThreadsGame.fortunes.length;
    const anglePerSegment = TAU / numSegments;

    ctx.clearRect(0, 0, W, H);

    // Outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 30, 0, TAU);
    ctx.fillStyle = '#120a1c';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 24, 0, TAU);
    const rimGrad = ctx.createLinearGradient(0, 0, W, H);
    rimGrad.addColorStop(0, '#ffe98a');
    rimGrad.addColorStop(0.5, '#ffd21f');
    rimGrad.addColorStop(1, '#b07c00');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Segments
    for (let i = 0; i < numSegments; i++) {
        const startAngle = (i * anglePerSegment) + rotation - (Math.PI / 2); // Start at top
        const endAngle = ((i + 1) * anglePerSegment) + rotation - (Math.PI / 2);
        const f = ThreadsGame.fortunes[i];

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        const g = ctx.createRadialGradient(cx, cy, 30, cx, cy, radius);
        g.addColorStop(0, shade(f.color, -0.35));
        g.addColorStop(0.55, f.color);
        g.addColorStop(1, shade(f.color, 0.25));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = '#120a1c';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Fortune text
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '15px Bungee, Impact, sans-serif';
        ctx.lineJoin = 'round';
        const tx = radius * 0.62;
        const words = f.text.split(' ');
        let rows;
        if (words.length > 2) rows = [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
        else if (words.length === 2) rows = [words[0], words[1]];
        else rows = [f.text];
        const gap = 18;
        rows.forEach((row, r) => {
            const y = (r - (rows.length - 1) / 2) * gap;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.strokeText(row, tx, y);
            ctx.fillStyle = '#120a1c';
            ctx.fillText(row, tx, y);
        });
        ctx.restore();
    }

    // Pegs between segments
    for (let i = 0; i < numSegments; i++) {
        const a = (i * anglePerSegment) + rotation - Math.PI / 2;
        const px = cx + Math.cos(a) * (radius - 6), py = cy + Math.sin(a) * (radius - 6);
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, TAU);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#120a1c';
        ctx.stroke();
    }

    // Marquee bulbs on the rim (they don't rotate with the wheel)
    const bulbs = 24;
    for (let i = 0; i < bulbs; i++) {
        const a = (i / bulbs) * TAU;
        const bx = cx + Math.cos(a) * (radius + 13), by = cy + Math.sin(a) * (radius + 13);
        const lit = (i + bulbPhase) % 3 === 0;
        ctx.beginPath();
        ctx.arc(bx, by, 6.5, 0, TAU);
        ctx.fillStyle = lit ? '#fffbe0' : '#9a6a00';
        ctx.shadowColor = lit ? '#fff3a0' : 'transparent';
        ctx.shadowBlur = lit ? 14 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#120a1c';
        ctx.stroke();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, TAU);
    ctx.fillStyle = '#120a1c';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, TAU);
    const hubGrad = ctx.createRadialGradient(cx - 12, cy - 14, 4, cx, cy, 44);
    hubGrad.addColorStop(0, '#ff7a7a');
    hubGrad.addColorStop(1, '#9e0f17');
    ctx.fillStyle = hubGrad;
    ctx.fill();

    // Draw "FATE" text in center
    ctx.font = '20px Bungee, Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#120a1c';
    ctx.strokeText('FATE', cx, cy + 1);
    ctx.fillStyle = '#FFD700';
    ctx.fillText('FATE', cx, cy + 1);

    // Pointer at top (a flapper that kicks on every peg)
    ctx.save();
    ctx.translate(cx, 16);
    ctx.rotate(-pointerKick * 0.45);
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.lineTo(20, -4);
    ctx.lineTo(0, 44);
    ctx.closePath();
    ctx.fillStyle = '#e8262d';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#120a1c';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 4, 6, 0, TAU);
    ctx.fillStyle = '#ffd21f';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

// Lighten (amt > 0) or darken (amt < 0) a hex color
function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return `rgb(${r},${g},${b})`;
}

// Spin the wheel
function spinWheel() {
    if (ThreadsGame.spinning) {
        return;
    }

    ThreadsGame.spinning = true;
    ThreadsGame.spinCount++;
    updateSpinCount();
    setSpinEnabled(false);

    // Random spin amount (multiple rotations + random position)
    const baseSpins = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = baseSpins * TAU + (Math.random() * TAU);

    animateSpin(finalRotation);
    saveThreadsProgress();
}

function setSpinEnabled(on) {
    const btn = document.getElementById('spin-btn');
    if (btn) btn.disabled = !on;
}

// Shared animation driver: ticks on every peg, chases the lights, eases out
function runWheelAnimation(startRotation, delta, duration, onDone) {
    const anglePerSegment = TAU / ThreadsGame.fortunes.length;
    const startTime = performance.now();
    let lastPeg = Math.floor(startRotation / anglePerSegment);

    function animate(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease out cubic

        ThreadsGame.currentRotation = startRotation + delta * easeProgress;

        const peg = Math.floor(ThreadsGame.currentRotation / anglePerSegment);
        if (peg !== lastPeg) {
            lastPeg = peg;
            pointerKick = Math.sign(delta);
            window.GameApp.Sound.tick();
        }
        pointerKick *= 0.82;
        if (progress < 1) bulbPhase = Math.floor(now / 70);

        drawWheel(ThreadsGame.currentRotation);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            pointerKick = 0;
            drawWheel(ThreadsGame.currentRotation);
            onDone();
        }
    }
    requestAnimationFrame(animate);
}

// Animate wheel spin
function animateSpin(targetRotation) {
    runWheelAnimation(ThreadsGame.currentRotation, targetRotation, 3000, () => {
        // Spin complete
        ThreadsGame.spinning = false;
        setSpinEnabled(true);
        window.GameApp.Sound.blip(523, 0.08, 'square', 0.05, 784);

        const landedFortune = getLandedFortune();
        ThreadsGame.lastLandedFortune = landedFortune;
        ThreadsGame.spinHistory.push(landedFortune.text);
        handleFortuneResult(landedFortune);
    });
}

// Which fortune the pointer landed on
function getLandedFortune() {
    const numSegments = ThreadsGame.fortunes.length;
    const anglePerSegment = TAU / numSegments;

    // Normalize rotation to 0-2π
    let normalizedRotation = ThreadsGame.currentRotation % TAU;
    if (normalizedRotation < 0) normalizedRotation += TAU;

    // The wheel spins clockwise, so we need to invert and account for top start
    normalizedRotation = (TAU - normalizedRotation) % TAU;

    const segmentIndex = Math.floor(normalizedRotation / anglePerSegment) % numSegments;
    return ThreadsGame.fortunes[segmentIndex];
}

// Handle fortune result
function handleFortuneResult(fortune) {
    // Show the cryptic rhyming message
    window.GameApp.showNotification(fortune.message || `🎡 ${fortune.text}`);

    // PUZZLE 1: Land on "YOU WIN" (SURFACE)
    if (!ThreadsGame.puzzles.puzzle1Complete && fortune.text === 'YOU WIN') {
        ThreadsGame.puzzles.puzzle1Complete = true;
        setTimeout(() => {
            window.GameApp.revealFragment(3); // Reveals ".3921"
        }, 1500);
    }

    // PUZZLE 2: Spin exactly 7 times then wait (HIDDEN)
    if (!ThreadsGame.puzzles.puzzle2Complete && ThreadsGame.spinCount === 7) {
        console.log('⭐ You spun 7 times! Waiting 5 seconds...');
        // Start timer to check if they don't spin again
        setTimeout(() => {
            if (ThreadsGame.spinCount === 7 && !ThreadsGame.puzzles.puzzle2Complete) {
                ThreadsGame.puzzles.puzzle2Complete = true;
                saveThreadsProgress();
                window.GameApp.revealFragment(4); // Reveals "3"
                window.GameApp.showNotification('✨ SEVEN IS THE LUCKY NUMBER! ✨');
                console.log('✅ Fragment 4 unlocked after waiting!');
            } else {
                console.log('❌ You spun again! Spin count is now:', ThreadsGame.spinCount);
            }
        }, 5000);
    }

    // Show thread for certain fortunes
    if ((fortune.text === 'PULL THE THREAD AWAY' || fortune.text === 'REVERSE THE TURN') && !ThreadsGame.threadDiscovered) {
        enableThreadDrag();
    }

    // CREEPY EFFECT: Landing on "NIW UOY" without using /reverse
    if (fortune.text === 'NIW UOY' && !ThreadsGame.puzzles.puzzle3Complete) {
        triggerCreepyEffect();
    }

    saveThreadsProgress();
}

// Show fortune popup
function showFortunePopup(fortune) {
    const popup = document.createElement('div');
    popup.className = 'fortune-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, ${fortune.color} 0%, #000 100%);
        color: #fff;
        padding: 40px 60px;
        font-size: 2.6em;
        text-align: center;
        z-index: 5000;
        box-shadow: 0 0 60px ${fortune.color}, 12px 12px 0 #000;
        animation: popup-appear 0.5s ease-out forwards;
        text-shadow: 3px 3px 0 #000;
    `;
    popup.textContent = fortune.text;

    document.body.appendChild(popup);

    // Auto remove after 3 seconds
    setTimeout(() => {
        popup.style.animation = 'popup-disappear 0.5s ease-out forwards';
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

// Trigger creepy effect for "NIW UOY"
function triggerCreepyEffect() {
    // Cut the background music suddenly
    const bgMusic = document.getElementById('background-music');
    let musicWasPlaying = false;
    if (bgMusic && !bgMusic.paused) {
        musicWasPlaying = true;
        bgMusic.pause();
    }

    // Create dark flash overlay with static
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 9999;
        animation: dark-flash 0.5s ease-out;
    `;
    const noise = document.createElement('canvas');
    noise.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:.18;image-rendering:pixelated;';
    flash.appendChild(noise);
    document.body.appendChild(flash);
    window.GameApp.runNoise(noise, () => flash.isConnected);

    // Glitch effect
    document.body.style.animation = 'glitch-shake 0.5s ease-in-out';
    document.body.style.filter = 'hue-rotate(180deg) invert(1)';

    // Play reversed/distorted sound if available
    const creepyAudio = new Audio('assets/sounds/creepy_reverse.mp3');
    creepyAudio.volume = 0.3;
    creepyAudio.play().catch(e => console.log('Creepy audio failed:', e));

    // Stop creepy audio after 3 seconds
    setTimeout(() => {
        creepyAudio.pause();
        creepyAudio.currentTime = 0;
    }, 3000);

    // Show warning message after flash
    setTimeout(() => {
        window.GameApp.showNotification('⚠️ Something feels... WRONG...');

        const warning = document.createElement('div');
        warning.className = 'creepy-warning';
        warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #000;
            color: #ff0000;
            padding: 40px;
            border: 3px solid #ff0000;
            text-align: center;
            z-index: 10000;
            animation: glitch-text 0.1s infinite;
            box-shadow: 0 0 30px #ff0000;
            text-shadow: 0 0 10px #ff0000;
        `;
        warning.innerHTML = `
            YOU SHOULDN'T BE HERE<br>
            THIS ISN'T YOUR WIN<br>
            <span style="font-size: 0.6em; color: #ff6666;">Type /reverse to escape...</span>
        `;
        document.body.appendChild(warning);

        // Reset after 4 seconds
        setTimeout(() => {
            document.body.style.animation = '';
            document.body.style.filter = '';
            flash.remove();
            warning.remove();

            // Resume music
            if (musicWasPlaying && bgMusic) {
                bgMusic.play();
            }
        }, 4000);
    }, 500);
}

// Enable draggable title mechanic (a rope now dangles from the title as the visual clue)
function enableThreadDrag() {
    if (ThreadsGame.threadDiscovered) return; // Already enabled

    ThreadsGame.threadDiscovered = true;
    const anchor = document.querySelector('#threads-game .thread-anchor');
    const title = document.querySelector('#threads-game .game-header h2');

    if (title && anchor) {
        anchor.classList.add('has-thread');
        title.style.userSelect = 'none';
        title.style.touchAction = 'none';

        let isDragging = false;
        let startX, startY;

        const onDown = (e) => {
            if (ThreadsGame.promptRevealed) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            title.classList.remove('snap');
            title.classList.add('dragging');
            try { title.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            window.GameApp.showNotification('🧵 The thread pulls...');
            e.preventDefault();
        };

        const onMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            title.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.05}deg)`;

            // If dragged far enough (50px), reveal command prompt
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > 50) {
                isDragging = false;
                ThreadsGame.promptRevealed = true;
                snapBack();

                anchor.classList.remove('has-thread');
                anchor.classList.add('unravelled');
                window.GameApp.Sound.blip(900, 0.35, 'sawtooth', 0.05, 120);

                // Reveal command prompt
                window.GameApp.showNotification('🧵 The thread unravels... A command prompt appears!');
                setTimeout(() => {
                    document.getElementById('command-prompt').classList.remove('hidden');
                    document.getElementById('cmd-input').focus();
                }, 500);

                title.removeEventListener('pointerdown', onDown);
                title.removeEventListener('pointermove', onMove);
                title.removeEventListener('pointerup', onUp);
                title.removeEventListener('pointercancel', onUp);
                saveThreadsProgress();
            }
        };

        const snapBack = () => {
            title.classList.remove('dragging');
            title.classList.add('snap');
            title.style.transform = 'translate(0, 0)';
        };

        const onUp = () => {
            if (isDragging) {
                isDragging = false;
                snapBack();
            }
        };

        title.addEventListener('pointerdown', onDown);
        title.addEventListener('pointermove', onMove);
        title.addEventListener('pointerup', onUp);
        title.addEventListener('pointercancel', onUp);
    }

    saveThreadsProgress();
}

// Optional hint boxes (kept from the original build; they only show if an element
// with the matching id is ever added to the page)
function showThreadHint() {
    const hintBox = document.getElementById('hint-threads-3');
    if (hintBox) {
        hintBox.innerHTML = `
            <strong>🧵 Hidden Puzzle:</strong> Some threads are woven into titles themselves.
            Pull at THE THREADS to unravel a command prompt. Commands can reverse what fate has spun.
            Type the right words, and backward it'll run!
            <br><br>
            <em style="color: #ff3366;">Try dragging "THE THREADS" title...</em>
        `;
        hintBox.classList.add('visible');
    }
}

function showSevenHint() {
    const hintBox = document.getElementById('hint-threads-2');
    if (hintBox) {
        hintBox.innerHTML = `
            <strong>🍀 Lucky Seven:</strong> You've spun ${ThreadsGame.spinCount} time(s) so far.
            Seven is a lucky number. What if you stopped at exactly seven spins?
            Don't spin eight, don't spin six - seven is the number that does the trick!
        `;
        hintBox.classList.add('visible');
    }
}

// Setup command prompt
function setupCommandPrompt() {
    const input = document.getElementById('cmd-input');
    if (!input || input.dataset.bound) return;
    input.dataset.bound = '1';

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const cmd = input.value.toLowerCase().trim();
            handleCommand(cmd);
            input.value = '';
        } else if (e.key.length === 1) {
            window.GameApp.Sound.blip(1200 + Math.random() * 300, 0.012, 'square', 0.02);
        }
    });
}

// Handle command input
function handleCommand(cmd) {
    if (cmd === '/reverse' || cmd === 'reverse') {
        if (ThreadsGame.spinning) return;
        if (!ThreadsGame.puzzles.puzzle3Complete) {
            ThreadsGame.puzzles.puzzle3Complete = true;
            saveThreadsProgress();

            // Spin backwards to "NIW UOY"
            window.GameApp.showNotification('⚡ The wheel spins in REVERSE! ⚡');

            // Find NIW UOY index and land dead-center on it after two backward turns
            const targetIndex = ThreadsGame.fortunes.findIndex(f => f.text === 'NIW UOY');
            const anglePerSegment = TAU / ThreadsGame.fortunes.length;
            const current = ThreadsGame.currentRotation;
            let delta = ((targetIndex + 0.5) * anglePerSegment + current) % TAU;
            if (delta < 0) delta += TAU;
            const targetRotation = current - (Math.PI * 4) - delta;

            animateReverseSpin(targetRotation);
        } else {
            window.GameApp.showNotification('Already used /reverse!');
        }
    } else if (cmd === '/help' || cmd === 'help') {
        window.GameApp.showNotification('Available commands: /reverse');
    } else {
        window.GameApp.showNotification('Unknown command. Try /help');
    }
}

// Animate reverse spin
function animateReverseSpin(targetRotation) {
    ThreadsGame.spinning = true;
    setSpinEnabled(false);
    const startRotation = ThreadsGame.currentRotation;

    runWheelAnimation(startRotation, targetRotation - startRotation, 2000, () => {
        ThreadsGame.spinning = false;
        setSpinEnabled(true);
        saveThreadsProgress();

        // Show success popup
        const fortune = ThreadsGame.fortunes.find(f => f.text === 'NIW UOY');
        showFortunePopup(fortune);

        window.GameApp.showNotification('✨ YOU REVERSED FATE! ✨');

        setTimeout(() => {
            window.GameApp.revealFragment(5); // Reveals "S"
        }, 1500);
    });
}

function saveThreadsProgress() {
    window.GameApp.Store.set('threadsProgress', {
        spinCount: ThreadsGame.spinCount,
        puzzles: ThreadsGame.puzzles,
        spinHistory: ThreadsGame.spinHistory,
        threadDiscovered: ThreadsGame.threadDiscovered,
        promptRevealed: ThreadsGame.promptRevealed,
        currentRotation: ThreadsGame.currentRotation % TAU
    });
}

// Popup / effect animations
const threadsStyle = document.createElement('style');
threadsStyle.textContent = `
    @keyframes popup-appear {
        0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes popup-disappear {
        0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(0) rotate(180deg); opacity: 0; }
    }
    @keyframes glitch-shake {
        0%, 100% { transform: translate(0, 0); }
        10% { transform: translate(-5px, 5px); }
        20% { transform: translate(5px, -5px); }
        30% { transform: translate(-5px, -5px); }
        40% { transform: translate(5px, 5px); }
        50% { transform: translate(-5px, 5px); }
        60% { transform: translate(5px, -5px); }
        70% { transform: translate(-5px, -5px); }
        80% { transform: translate(5px, 5px); }
        90% { transform: translate(-5px, -5px); }
    }
    @keyframes glitch-text {
        0% { opacity: 1; }
        50% { opacity: 0.8; transform: translate(-50%, -50%) skew(5deg); }
        100% { opacity: 1; }
    }
    @keyframes dark-flash {
        0% { opacity: 1; }
        50% { opacity: 1; }
        100% { opacity: 0.85; }
    }
`;
document.head.appendChild(threadsStyle);

// Export for use by app.js and debugging
window.ThreadsGame = ThreadsGame;
window.initThreadsGame = initThreadsGame;
