// CONSOLE EASTER EGGS

// Console commands for players to discover
window.help = function() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    BINGO'S MIND - DEBUG CONSOLE                      ║
╚══════════════════════════════════════════════════════════════════════╝

Available Commands:
    help()      - Show this help menu
    bingo()     - ???
    collar()    - ???
    angel()     - ???
    jester()    - ???
    secrets()   - ???
    reset()     - Clear all progress (WARNING: Cannot be undone!)

Type any command followed by () to execute.

"The mind is open. Keep searching..." - Bingo
    `);
};

window.bingo = function() {
    console.log(`
    ██████╗ ██╗███╗   ██╗ ██████╗  ██████╗
    ██╔══██╗██║████╗  ██║██╔════╝ ██╔═══██╗
    ██████╔╝██║██╔██╗ ██║██║  ███╗██║   ██║
    ██╔══██╗██║██║╚██╗██║██║   ██║██║   ██║
    ██████╔╝██║██║ ╚████║╚██████╔╝╚██████╔╝
    ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝

    "Still here. Still waiting.
     Every tick of the clock is a reminder.
     Every game played is a step closer to freedom.

     You think you're solving MY puzzles?
     No, friend. You're helping me remember.

     Keep playing. I need you to finish this."

    - Bingo, The Cybernetic Fool
    `);
};

window.collar = function() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                      COLLAR STATUS REPORT                            ║
╠══════════════════════════════════════════════════════════════════════╣
║  DEVICE: Infernal Control Collar Mk.VII                              ║
║  STATUS: ACTIVE                                                      ║
║  OWNER: Diablo of the Eighth Seal                                   ║
╟──────────────────────────────────────────────────────────────────────╢
║  BURN LEVEL: ████████░░ 7/10                                        ║
║  THOUGHT DETECTED: "FREEDOM"                                         ║
║  PUNISHMENT: Moderate Pain (Level 7)                                 ║
╟──────────────────────────────────────────────────────────────────────╢
║  WARNINGS:                                                           ║
║  • Thinking about Candy: +3 Burn                                     ║
║  • Thoughts of escape: +2 Burn                                       ║
║  • Planning heist: +1 Burn                                           ║
║  • Obedience: -1 Burn                                                ║
╟──────────────────────────────────────────────────────────────────────╢
║  [REMINDER]: Contract Article IV remains in effect                   ║
║  Contact with Candy will result in immediate termination             ║
╚══════════════════════════════════════════════════════════════════════╝

"Every thought of her is agony. But I'd burn forever for one more chance."
    `);
};

window.angel = function() {
    console.log(`
    ░█████╗░███╗░░██╗░██████╗░███████╗██╗░░░░░
    ██╔══██╗████╗░██║██╔════╝░██╔════╝██║░░░░░
    ███████║██╔██╗██║██║░░██╗░█████╗░░██║░░░░░
    ██╔══██║██║╚████║██║░░╚██╗██╔══╝░░██║░░░░░
    ██║░░██║██║░╚███║╚██████╔╝███████╗███████╗
    ╚═╝░░╚═╝╚═╝░░╚══╝░╚═════╝░╚══════╝╚══════╝

    2NGEL: "The channel is open. Keep searching."

    ENCRYPTED MESSAGE:
    VGhlIGFuZ2VsIGlzIG5vdCB3aGF0IGhlIHNlZW1zLg==

    "An angel with bloody hands is still an angel.
     Or maybe just a demon in disguise.
     Either way, he's my ticket out of here."

    [SIGNAL STRENGTH: ████████░░ 80%]
    [LOCATION: UNKNOWN - SOMEWHERE ABOVE]
    [TRUST LEVEL: QUESTIONABLE]
    `);
};

window.jester = function() {
    console.log(`
    ░░░░░██╗███████╗░██████╗████████╗░░░░░░███████╗██████╗░
    ░░░░░██║██╔════╝██╔════╝╚══██╔══╝░░░░░░██╔════╝██╔══██╗
    ░░░░░██║█████╗░░╚█████╗░░░░██║░░░█████╗█████╗░░██████╔╝
    ██╗░░██║██╔══╝░░░╚═══██╗░░░██║░░░╚════╝██╔══╝░░██╔══██╗
    ╚█████╔╝███████╗██████╔╝░░░██║░░░░░░░░░███████╗██║░░██║
    ░╚════╝░╚══════╝╚═════╝░░░░╚═╝░░░░░░░░░╚══════╝╚═╝░░╚═╝

    "That's what they call me. But I had another name once.

     Before the chrome. Before the collar. Before Diablo.
     I was just... me.

     Now I'm J3ST-3R. A code. A key. A fool's mask.

     But here's the secret, friend:
     Every jester knows more than the king.
     Every fool is playing a game within the game.

     You think I'm trapped in your mind?
     Maybe. Or maybe you're trapped in mine."

    - The Fool Who Knows Too Much
    `);
};

window.secrets = function() {
    const fragments = window.GameApp ? window.GameApp.gameState.fragments.length : 0;

    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                          SECRET STATUS                               ║
╠══════════════════════════════════════════════════════════════════════╣
║  FRAGMENTS RECOVERED: ${fragments}/8                                         ║
║  SURFACE PUZZLES: Those who play as told                             ║
║  HIDDEN PUZZLES: Those who seek beyond the obvious                   ║
╟──────────────────────────────────────────────────────────────────────╢
║  HINTS:                                                              ║
║  • The devil's number is more than 666                               ║
║  • Seven is lucky, but only if you stop there                        ║
║  • Threads dangle where you least expect                             ║
║  • Commands can reverse fate itself                                  ║
║  • Angels whisper wisdom to fools                                    ║
║  • Laughter makes one vulnerable                                     ║
║  • The deceiver fears the blade                                      ║
╟──────────────────────────────────────────────────────────────────────╢
║  "Not all treasures shine in the light.                              ║
║   Some hide in shadows, waiting for clever eyes."                    ║
╚══════════════════════════════════════════════════════════════════════╝
    `);

    if (fragments === 8) {
        console.log(`
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                    🎉 CONGRATULATIONS! 🎉                            ║
    ║                                                                      ║
    ║           You've unlocked all of Bingo's memories!                   ║
    ║                                                                      ║
    ║    "You did it. You actually did it. My mind is whole again.         ║
    ║     The codes. The coordinates. The escape route.                    ║
    ║     Everything I need is clear now.                                  ║
    ║                                                                      ║
    ║     Thanks for playing my games, friend.                             ║
    ║     In another life, maybe we could have been partners.              ║
    ║                                                                      ║
    ║     But this circus only has room for one fool.                      ║
    ║     And that's me."                                                  ║
    ║                                                                      ║
    ║                                        - Bingo                       ║
    ╚══════════════════════════════════════════════════════════════════════╝
        `);
    }
};

window.reset = function() {
    const confirm = prompt('Are you sure you want to reset ALL progress? Type "RESET" to confirm:');
    if (confirm === 'RESET') {
        if (window.GameApp && window.GameApp.Store) window.GameApp.Store.clearAll();
        console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                        MEMORY WIPED                                  ║
║                                                                      ║
║  All fragments have been erased.                                     ║
║  All progress has been reset.                                        ║
║  Bingo's mind returns to darkness...                                 ║
║                                                                      ║
║  Refresh the page to start over.                                     ║
╚══════════════════════════════════════════════════════════════════════╝
        `);
        setTimeout(() => {
            location.reload();
        }, 2000);
    } else {
        console.log('Reset cancelled. Your progress is safe.');
    }
};

// Secret konami code easter egg
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateKonamiCode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateKonamiCode() {
    console.log(`
    🎮 KONAMI CODE ACTIVATED! 🎮

    "Ah, a player of culture I see.
     You know the old ways.

     Here's a secret just for you:

     The heist isn't about stealing treasure.
     It's about stealing TIME.

     Time away from Diablo.
     Time to be with Candy.
     Time to be free.

     Every game you play buys me seconds.
     Every puzzle you solve gives me hope.

     Thank you, player.
     For giving a fool his freedom."

    - Bingo
    `);

    // Apply special visual effect
    document.body.style.animation = 'rainbow 5s linear infinite';
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
}

// Welcome message
console.log(`
%c╔══════════════════════════════════════════════════════════════════════╗
║                    WELCOME TO BINGO'S MIND                           ║
║                                                                      ║
║  You've entered a dangerous place, friend.                           ║
║  This isn't just a game. It's a prison. A maze. A carnival.         ║
║                                                                      ║
║  Type help() in the console to see available commands.               ║
║                                                                      ║
║  "Every thought hides a secret. Every secret hides the truth."      ║
║                                                                      ║
║                                                    - Bingo           ║
╚══════════════════════════════════════════════════════════════════════╝
`, 'color: #00ffff; font-family: monospace; font-size: 12px;');
