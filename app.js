// Main Application Logic and Fragment Collection System
// ---------------------------------------------------------------
// Remastered: progress now survives an accidental refresh (F5) but a brand
// new tab / double-clicking index.html still starts completely fresh.

// Fragment Data
const FRAGMENTS = {
    safeCode: {
        2: 'J',
        4: '3',
        5: 'S',
        7: 'T',
        // -, 3, R revealed at completion
        complete: ['J', '3', 'S', 'T', '-', '3', 'R']
    },
    coordinates: {
        1: '-47',
        3: '.3921',
        6: '178.9012',
        8: 'DmPln-2387'
    }
};

// File Unlocks
const FILE_UNLOCKS = {
    2: 'receipt.txt',
    4: 'contract.txt',
    7: 'chatlog.txt',
    8: 'heist_map.png'
};

// Game State
const gameState = {
    fragments: [],
    unlockedFiles: [],
    currentScreen: 'hub'
};

// ---------------------------------------------------------------
// Storage: sessionStorage = survives refresh, fresh on every new open.
// Everything is wrapped so a browser that blocks storage still plays fine.
// ---------------------------------------------------------------
const Store = {
    get(key) {
        try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null; }
        catch (e) { return null; }
    },
    set(key, value) {
        try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    },
    clearAll() {
        try { sessionStorage.clear(); } catch (e) { /* ignore */ }
        try { localStorage.removeItem('bingoMindState'); localStorage.removeItem('schemesProgress'); localStorage.removeItem('threadsProgress'); localStorage.removeItem('masksProgress'); } catch (e) { /* ignore */ }
    }
};

// ---------------------------------------------------------------
// Sound: one mute switch for every <audio>, plus a tiny chiptune synth
// ---------------------------------------------------------------
const Sound = {
    muted: false,
    elements: new Set(),
    ctx: null,

    init() {
        try { this.muted = localStorage.getItem('bingoMindMuted') === '1'; } catch (e) { /* ignore */ }
        // Every media element that ever plays gets registered so mute reaches it
        const nativePlay = HTMLMediaElement.prototype.play;
        const self = this;
        HTMLMediaElement.prototype.play = function () {
            self.elements.add(this);
            this.muted = self.muted;
            return nativePlay.apply(this, arguments);
        };
        this.updateButton();
    },

    toggle() {
        this.muted = !this.muted;
        try { localStorage.setItem('bingoMindMuted', this.muted ? '1' : '0'); } catch (e) { /* ignore */ }
        this.elements.forEach(el => { el.muted = this.muted; });
        const bg = document.getElementById('background-music');
        if (bg) bg.muted = this.muted;
        this.updateButton();
    },

    updateButton() {
        const btn = document.getElementById('mute-btn');
        if (btn) btn.textContent = this.muted ? '🔇' : '🔊';
    },

    audioCtx() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    },

    // Square-wave blip: freq in Hz, dur in seconds
    blip(freq = 660, dur = 0.06, type = 'square', vol = 0.04, slideTo = null) {
        if (this.muted) return;
        const ctx = this.audioCtx();
        if (!ctx) return;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    },

    tick() { this.blip(1800, 0.02, 'square', 0.03); }
};

// Shared sound helper used by every game module
function playSound(audio, volume = 0.3) {
    if (audio) {
        try {
            audio.currentTime = 0;
            audio.volume = volume;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) { /* ignore */ }
    }
}

const APP_SOUNDS = {
    fragment: new Audio('assets/sounds/fragment_get.mp3')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Fresh start on every new open; a simple refresh keeps your place.
    Sound.init();
    loadGameState();
    if (!gameState.fragments.length) console.log('🎪 Fresh circus experience! All progress cleared.');
    setupEventListeners();
    decorateWordArt();
    startClock();
    initSparkles();
    updateFragmentDisplay();
    checkCompletion();
    initBackgroundMusic();
    preloadImages([
        'assets/images/characters/devil_laughing.png',
        'assets/images/characters/devil_stabbed.png',
        'assets/images/weapons/knife.gif'
    ]);
});

// Load saved game state
function loadGameState() {
    const parsed = Store.get('bingoMindState');
    if (parsed) {
        gameState.fragments = parsed.fragments || [];
        gameState.unlockedFiles = parsed.unlockedFiles || [];
    }
}

// Save game state
function saveGameState() {
    Store.set('bingoMindState', {
        fragments: gameState.fragments,
        unlockedFiles: gameState.unlockedFiles
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Game navigation buttons (and the whole booth card is clickable)
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const btn = card.querySelector('.btn-game');
            if (btn) navigateToScreen(`${btn.getAttribute('data-game')}-game`);
        });
    });

    // Back buttons
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateToScreen('hub');
        });
    });

    // Taskbar
    document.querySelectorAll('#taskbar [data-nav]').forEach(btn => {
        btn.addEventListener('click', () => navigateToScreen(btn.getAttribute('data-nav')));
    });
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) muteBtn.addEventListener('click', () => Sound.toggle());

    // View Fragments button
    document.getElementById('view-fragments-btn').addEventListener('click', () => {
        showFragmentViewer();
    });

    // Close modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
        });
    });

    // Click outside modal to close (never for the completion screen)
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal && modal.id !== 'completion-screen') {
                modal.classList.remove('active');
            }
        });
    });

    // Esc closes the fragment viewer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') document.getElementById('fragment-viewer').classList.remove('active');
    });

    // Download memories button
    const downloadBtn = document.getElementById('download-memories-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAllMemories);
    }

    // Start over button
    const startOverBtn = document.getElementById('start-over-btn');
    if (startOverBtn) {
        startOverBtn.addEventListener('click', startOver);
    }

    // Chiptune click on every button
    document.addEventListener('click', (e) => {
        if (e.target.closest('button, .close-modal')) Sound.blip(880, 0.05, 'square', 0.035, 1320);
    }, true);

    // Portrait glitch effect
    const portrait = document.getElementById('bingo-portrait');
    setInterval(() => {
        if (Math.random() > 0.6) {
            portrait.classList.add('glitch');
            setTimeout(() => portrait.classList.remove('glitch'), 200);
        }
    }, 4000);
}

// Navigate between screens
function navigateToScreen(screenId) {
    const target = document.getElementById(screenId);
    if (!target) return;

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    target.classList.add('active');
    const previous = gameState.currentScreen;
    gameState.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'auto' });

    document.querySelectorAll('#taskbar [data-nav]').forEach(btn => {
        btn.classList.toggle('current', btn.getAttribute('data-nav') === screenId);
    });

    document.dispatchEvent(new CustomEvent('screenchange', { detail: { from: previous, to: screenId } }));

    // Initialize wheel when entering threads game
    if (screenId === 'threads-game') {
        setTimeout(() => {
            if (typeof initThreadsGame === 'function') {
                initThreadsGame();
            } else {
                console.error('initThreadsGame function not found!');
            }
        }, 50);
    }
}

// Reveal Fragment with memory flash effect
function revealFragment(fragmentNumber, fragmentType = 'auto') {
    // Check if already collected
    if (gameState.fragments.includes(fragmentNumber)) {
        return;
    }

    // Add to collected fragments (and save right away so a refresh can't lose it)
    gameState.fragments.push(fragmentNumber);
    saveGameState();

    // Determine fragment content
    let fragmentContent = '';
    let fragmentLabel = '';

    if (FRAGMENTS.coordinates[fragmentNumber]) {
        fragmentContent = FRAGMENTS.coordinates[fragmentNumber];
        fragmentLabel = 'COORDINATE FRAGMENT';
    } else if (FRAGMENTS.safeCode[fragmentNumber]) {
        fragmentContent = FRAGMENTS.safeCode[fragmentNumber];
        fragmentLabel = 'SAFE CODE FRAGMENT';
    }

    // Show memory flash effect
    playSound(APP_SOUNDS.fragment, 0.45);
    showMemoryFlash(fragmentContent, fragmentLabel);

    // Update displays
    setTimeout(() => {
        updateFragmentDisplay();
        checkFileUnlock(fragmentNumber);
        saveGameState();
        checkCompletion();
    }, 2000);
}

// Show memory flash overlay
let flashTimer = null;
function showMemoryFlash(content, label) {
    const flash = document.getElementById('memory-flash');
    const flashText = flash.querySelector('.flash-text');

    flashText.innerHTML = `
        <div style="margin-bottom: 20px; color: var(--accent-yellow);">${label}</div>
        <div style="font-size: 2em;">${content}</div>
        <div style="margin-top: 20px; font-size: 0.5em; color: var(--accent-cyan);">MEMORY RECOVERED</div>
    `;

    // restart CSS animations
    flash.classList.add('hidden');
    void flash.offsetWidth;
    flash.classList.remove('hidden');

    runNoise(flash.querySelector('.flash-noise'), () => !flash.classList.contains('hidden'));
    launchConfetti(60);
    Sound.blip(220, 0.25, 'sawtooth', 0.05, 880);

    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
        flash.classList.add('hidden');
    }, 2500);
}

// Animated TV static on a canvas while `isAlive()` is true
function runNoise(canvas, isAlive) {
    if (!canvas) return;
    const w = 160, h = 100;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(w, h);
    let frame = 0;
    (function draw() {
        if (!isAlive()) return;
        if (frame++ % 2 === 0) {
            const d = img.data;
            for (let i = 0; i < d.length; i += 4) {
                const v = Math.random() * 255 | 0;
                d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
            }
            ctx.putImageData(img, 0, 0);
        }
        requestAnimationFrame(draw);
    })();
}

// Chunky 90s confetti
function launchConfetti(count = 50) {
    const colors = ['#e8262d', '#1f5fe0', '#ffd21f', '#2fe36b', '#ff3fa4', '#3ff3ff'];
    for (let i = 0; i < count; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.background = colors[i % colors.length];
        c.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
        c.style.setProperty('--r', (Math.random() * 1080 - 540) + 'deg');
        c.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
        c.style.animationDelay = (Math.random() * 0.4) + 's';
        document.body.appendChild(c);
        c.addEventListener('animationend', () => c.remove());
    }
}

// Update fragment display
function updateFragmentDisplay() {
    // Update count
    document.getElementById('fragment-count').textContent = `${gameState.fragments.length}/8`;
    const bar = document.getElementById('fragment-progress');
    if (bar) bar.style.width = `${(gameState.fragments.length / 8) * 100}%`;

    // Update fragment slots
    document.querySelectorAll('.fragment-slot').forEach(slot => {
        const fragmentNum = parseInt(slot.getAttribute('data-fragment'));
        if (gameState.fragments.includes(fragmentNum) && !slot.classList.contains('collected')) {
            slot.classList.add('collected');
            slot.textContent = '✓';
        }
    });

    // Update fragment viewer if open
    updateFragmentViewer();
}

// Show fragment viewer modal
function showFragmentViewer() {
    updateFragmentViewer();
    document.getElementById('fragment-viewer').classList.add('active');
}

// Update fragment viewer content
function updateFragmentViewer() {
    // Update safe code
    const safeCodeMap = {0: 2, 1: 4, 2: 5, 3: 7, 4: 'auto', 5: 'auto', 6: 'auto'};
    document.querySelectorAll('.code-char').forEach((char, index) => {
        const fragmentNum = safeCodeMap[index];
        if (fragmentNum === 'auto') {
            // These are revealed at completion
            if (gameState.fragments.length === 8) {
                const chars = ['J', '3', 'S', 'T', '-', '3', 'R'];
                char.textContent = chars[index];
                char.classList.add('revealed');
            }
        } else if (gameState.fragments.includes(fragmentNum)) {
            char.textContent = FRAGMENTS.safeCode[fragmentNum];
            char.classList.add('revealed');
        }
    });

    // Update coordinates
    const coordMap = {0: 1, 1: 3, 2: 6, 3: 8};
    document.querySelectorAll('.coord-part').forEach((part, index) => {
        const fragmentNum = coordMap[index];
        if (gameState.fragments.includes(fragmentNum)) {
            part.textContent = FRAGMENTS.coordinates[fragmentNum];
            part.classList.add('revealed');
        }
    });

    // Update unlocked files
    const filesList = document.getElementById('files-list');
    filesList.innerHTML = '';
    if (gameState.unlockedFiles.length > 0) {
        gameState.unlockedFiles.forEach(file => {
            const li = document.createElement('li');
            li.textContent = `📄 ${file}`;
            li.addEventListener('click', () => downloadFile(file));
            filesList.appendChild(li);
        });
    } else {
        filesList.innerHTML = '<li style="opacity: 0.6;">No files unlocked yet...</li>';
    }
}

// Check if fragment unlocks a file
function checkFileUnlock(fragmentNumber) {
    if (FILE_UNLOCKS[fragmentNumber]) {
        const file = FILE_UNLOCKS[fragmentNumber];
        if (!gameState.unlockedFiles.includes(file)) {
            gameState.unlockedFiles.push(file);
            saveGameState();
            showNotification(`🔓 FILE UNLOCKED: ${file} - Downloading...`);

            // Auto-download the file after a brief delay
            setTimeout(() => {
                downloadFile(file);
                showNotification(`📄 ${file} downloaded to your browser!`);
            }, 1500);
        }
    }
}

// Show notification (stacking pop-up "tooltips" instead of overlapping boxes)
function showNotification(message) {
    const stack = document.getElementById('toast-stack');
    const notification = document.createElement('div');
    notification.className = 'toast';
    const text = document.createElement('span');
    text.textContent = message;
    notification.appendChild(text);
    stack.appendChild(notification);

    // Keep the stack short
    while (stack.children.length > 4) stack.firstElementChild.remove();

    Sound.blip(1046, 0.05, 'square', 0.025);

    setTimeout(() => {
        notification.classList.add('out');
        setTimeout(() => notification.remove(), 400);
    }, 3200);
}

// Check if all fragments collected (completion)
let completionShown = false;
function checkCompletion() {
    if (gameState.fragments.length === 8 && !completionShown) {
        completionShown = true;
        setTimeout(() => {
            showCompletionScreen();
        }, 1000);
    }
}

// Show completion screen
function showCompletionScreen() {
    // Cut the background music
    const bgMusic = document.getElementById('background-music');
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    // Play looping white noise
    const whiteNoise = new Audio('assets/sounds/white_noise.mp3');
    whiteNoise.volume = 0.2;
    whiteNoise.loop = true;
    whiteNoise.play().catch(e => console.log('White noise failed:', e));

    // Store reference to stop it later if needed
    window.completionWhiteNoise = whiteNoise;

    const modal = document.getElementById('completion-screen');
    document.getElementById('final-safe-code').textContent = 'J3ST-3R';
    document.getElementById('final-coordinates').textContent = '-47.3921, 178.9012 DmPln-2387';
    modal.classList.add('active');

    runNoise(document.getElementById('completion-static'), () => modal.classList.contains('active'));
    typewriteCompletion();

    // Add screen glitch effect
    document.body.style.animation = 'screenShake 0.3s ease-in-out 3';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 1000);
}

// Terminal-style typing for the completion text (click anywhere to skip)
function typewriteCompletion() {
    const root = document.querySelector('#completion-screen .command-prompt-text');
    const buttons = root.querySelector('.completion-buttons');
    const areas = [root.querySelector('.assembled-fragments'), root.querySelector('.bingo-message')];

    const nodes = [];
    areas.forEach(area => {
        const walker = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
            if (n.textContent.trim().length) nodes.push({ node: n, full: n.textContent });
        }
    });
    nodes.forEach(o => { o.node.textContent = ''; });
    buttons.classList.add('pending');

    let ni = 0, ci = 0, done = false, caretEl = null;
    const finish = () => {
        if (done) return;
        done = true;
        nodes.forEach(o => { o.node.textContent = o.full; });
        if (caretEl) caretEl.classList.remove('typing-caret');
        buttons.classList.remove('pending');
    };
    const skip = (e) => { if (!e.target.closest('button')) finish(); };
    document.getElementById('completion-screen').addEventListener('click', skip);

    setTimeout(function step() {
        if (done) return;
        if (ni >= nodes.length) { finish(); return; }
        const o = nodes[ni];
        const parent = o.node.parentElement;
        if (caretEl !== parent) {
            if (caretEl) caretEl.classList.remove('typing-caret');
            caretEl = parent; caretEl.classList.add('typing-caret');
        }
        ci += 2;
        o.node.textContent = o.full.slice(0, ci);
        if (ci % 6 === 0) Sound.blip(1400 + Math.random() * 400, 0.015, 'square', 0.015);
        if (ci >= o.full.length) { ni++; ci = 0; }
        setTimeout(step, 22);
    }, 1200);
}

// Download individual file
function downloadFile(filename) {
    if (window.DOCUMENTS && window.DOCUMENTS[filename]) {
        const content = window.DOCUMENTS[filename];
        if (/\.png$/i.test(filename)) {
            // Render the map as a real image so the .png actually opens
            renderMapImage(content).then(blob => saveBlob(blob, filename)).catch(() => {
                saveBlob(new Blob([content], {type: 'text/plain'}), filename.replace(/\.png$/i, '.txt'));
            });
            return;
        }
        saveBlob(new Blob([content], {type: 'text/plain'}), filename);
    } else {
        showNotification('File not found!');
    }
}

function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Draw the ASCII heist map onto aged paper, with a red marker circle on the vault
function renderMapImage(content) {
    return new Promise((resolve, reject) => {
        let lines = content.split('\n');
        // Skip the old placeholder note; the file really is an image now
        if (/^This would be an actual image file/.test(lines[0])) {
            lines = lines.slice(1);
            while (lines.length && !lines[0].trim()) lines.shift();
        }

        const fontSize = 20, lineH = 25, pad = 70;
        const font = `${fontSize}px Consolas, "Courier New", monospace`;
        const probe = document.createElement('canvas').getContext('2d');
        probe.font = font;
        const charW = probe.measureText('M').width;
        const maxChars = Math.max(...lines.map(l => [...l].length));
        const W = Math.ceil(maxChars * charW + pad * 2);
        const H = Math.ceil(lines.length * lineH + pad * 2);

        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Paper
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
        g.addColorStop(0, '#f7ecd0'); g.addColorStop(1, '#d9bf8a');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 9000; i++) {   // grain
            ctx.fillStyle = `rgba(90,60,20,${Math.random() * 0.06})`;
            ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
        }
        ctx.strokeStyle = 'rgba(120, 80, 30, 0.18)';   // fold lines
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
        ctx.fillStyle = 'rgba(120, 70, 20, 0.12)';     // coffee ring
        ctx.beginPath(); ctx.arc(W * 0.82, H * 0.18, 70, 0, Math.PI * 2); ctx.arc(W * 0.82, H * 0.18, 58, 0, Math.PI * 2, true); ctx.fill();

        // Ink
        ctx.font = font;
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#2b1a0e';
        lines.forEach((line, i) => ctx.fillText(line, pad, pad + i * lineH));

        // Red marker around the vault
        const vi = lines.findIndex(l => l.includes('(VAULT)'));
        if (vi >= 0) {
            const col = lines[vi].indexOf('(VAULT)');
            const cx = pad + (col + 3.5) * charW;
            const cy = pad + (vi + 0.9) * lineH;
            ctx.strokeStyle = 'rgba(200, 20, 20, 0.85)';
            ctx.lineWidth = 5; ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.ellipse(cx, cy, charW * 11, lineH * 3.4, -0.05, 0.2, Math.PI * 2 + 0.5);
            ctx.stroke();
        }

        canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
    });
}

// Download all memories as a ZIP (simplified version - individual downloads)
function downloadAllMemories() {
    showNotification('Downloading recovered memories...');

    // Download each file sequentially
    gameState.unlockedFiles.forEach((file, index) => {
        setTimeout(() => {
            downloadFile(file);
        }, index * 500);
    });

    // Also download a summary file
    setTimeout(() => {
        const summary = `
BINGO'S MIND - MEMORY RECOVERY COMPLETE
========================================

SAFE CODE: J3ST-3R
COORDINATES: -47.3921, 178.9012 DmPln-2387

FILES RECOVERED: ${gameState.unlockedFiles.length}
${gameState.unlockedFiles.map(f => `- ${f}`).join('\n')}

"You've pieced together what I hid away,
The codes, the plans, the getaway.
My mind is clear, the path is shown,
Now use these secrets I've made known."

- Bingo
`;
        saveBlob(new Blob([summary], {type: 'text/plain'}), 'MEMORY_RECOVERY_SUMMARY.txt');
    }, gameState.unlockedFiles.length * 500 + 500);
}

// Start over - reset all game progress
function startOver() {
    if (confirm('Are you sure you want to start over? All progress will be lost.')) {
        // Clear all saved progress
        Store.clearAll();

        // Reload the page to start fresh
        window.location.reload();
    }
}

// Utility: Check if fragment is collected
function hasFragment(num) {
    return gameState.fragments.includes(num);
}

// Initialize background music (plays on first user interaction)
function initBackgroundMusic() {
    const music = document.getElementById('background-music');
    if (!music) return;

    let musicStarted = false;
    music.volume = 0.3; // Set volume to 30%

    // Try to play music on any user interaction
    const startMusic = () => {
        if (!musicStarted && !completionShown) {
            music.play().then(() => {
                musicStarted = true;
                console.log('Background music started');
            }).catch(e => {
                console.log('Background music autoplay blocked, will try on next interaction');
            });
        }
    };

    // Listen for various user interactions
    document.addEventListener('click', startMusic, { once: true });
    document.addEventListener('keydown', startMusic, { once: true });
    document.addEventListener('touchstart', startMusic, { once: true });
}

// ---------------------------------------------------------------
// Cosmetics
// ---------------------------------------------------------------

// Split WordArt headings into bobbing letters (text stays identical)
function decorateWordArt() {
    document.querySelectorAll('.wordart').forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        let i = 0;
        text.split(' ').forEach((word, w) => {
            if (w > 0) el.appendChild(document.createTextNode(' '));   // lines may only break between words
            const wordEl = document.createElement('span');
            wordEl.className = 'wa-word';
            [...word].forEach(ch => {
                const s = document.createElement('span');
                s.className = 'wa-letter';
                s.style.setProperty('--i', i++);
                s.textContent = ch;
                wordEl.appendChild(s);
            });
            el.appendChild(wordEl);
        });
        el.setAttribute('aria-label', text);
    });
}

function startClock() {
    const el = document.getElementById('tray-clock');
    if (!el) return;
    const tick = () => {
        const d = new Date();
        let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0');
        const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
        el.textContent = `${h}:${m} ${ap}`;
    };
    tick();
    setInterval(tick, 15000);
}

// 90s cursor sparkle trail
function initSparkles() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.getElementById('sparkle-layer');
    const colors = ['#ffd21f', '#3ff3ff', '#ff3fa4', '#ffffff', '#2fe36b'];
    let last = 0;
    document.addEventListener('pointermove', (e) => {
        const now = performance.now();
        if (now - last < 40 || layer.childElementCount > 40) return;
        last = now;
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        s.style.setProperty('--c', colors[(Math.random() * colors.length) | 0]);
        s.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px');
        layer.appendChild(s);
        s.addEventListener('animationend', () => s.remove());
    }, { passive: true });
}

function preloadImages(srcs) {
    srcs.forEach(src => { const i = new Image(); i.src = src; });
}

// Export functions for use by game modules
window.GameApp = {
    revealFragment,
    hasFragment,
    showNotification,
    gameState,
    Store,
    Sound,
    launchConfetti,
    runNoise
};
