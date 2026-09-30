# 🎨 ASSETS NEEDED FOR BINGO'S MIND

This document lists **ALL** assets needed for the game. The code is already written to use these assets with automatic fallbacks if they're missing.

---

## 📁 Folder Structure

Create this exact folder structure:

```
bingo-mind/
├── assets/
│   ├── images/
│   │   ├── balloons/
│   │   ├── shells/
│   │   ├── characters/
│   │   ├── weapons/
│   │   └── backgrounds/
│   ├── sounds/
│   └── music/
```

---

## 🎈 BALLOON IMAGES (Simon Says Game)

**Location:** `assets/images/balloons/`

### Required Files:

1. **`red_balloon.png`**
   - **Dimensions:** 300x400px minimum
   - **Format:** PNG with transparency
   - **Description:** Bright red cartoon balloon
   - **Style:** Glossy, 3D-ish, colorful circus style (think Amazing Digital Circus aesthetic)

2. **`blue_balloon.png`**
   - **Dimensions:** 300x400px minimum
   - **Format:** PNG with transparency
   - **Description:** Bright blue cartoon balloon
   - **Style:** Same as red balloon

3. **`yellow_balloon.png`**
   - **Dimensions:** 300x400px minimum
   - **Format:** PNG with transparency
   - **Description:** Bright yellow cartoon balloon
   - **Style:** Same as red balloon

**Note:** If these are missing, the game will fallback to balloon emojis (🎈) with color filters.

---

## 🥥 SHELL GAME IMAGES

**Location:** `assets/images/shells/`

### Required Files:

1. **`shell_closed.png`**
   - **Dimensions:** 200x150px minimum
   - **Format:** PNG with transparency
   - **Description:** A closed shell or cup (like a carnival shell game cup)
   - **Style:** Brown/wooden circus-style cup, 3D appearance
   - **Note:** This is the default state

2. **`shell_open.png`** (Optional - not currently used but good to have)
   - **Dimensions:** 200x150px minimum
   - **Format:** PNG with transparency
   - **Description:** Shell lifted/tilted up
   - **Style:** Same style as closed

**Note:** The ball (⚫) is rendered with CSS/emoji, no image needed for it.

---

## 👹 CHARACTER IMAGES

**Location:** `assets/images/characters/`

### Required Files:

1. **`devil_normal.png`**
   - **Dimensions:** 200x200px minimum
   - **Format:** PNG with transparency
   - **Description:** A carnival devil character, grinning/neutral expression
   - **Style:** Colorful, slightly menacing but cartoonish (not too scary)
   - **Used:** Default devil state in shell game

2. **`devil_laughing.gif`** or **`devil_laughing.png`**
   - **Dimensions:** 200x200px minimum
   - **Format:** Animated GIF preferred, or PNG
   - **Description:** Same devil character, laughing/mocking animation
   - **Style:** If GIF: 3-5 frame loop. If PNG: single frame with exaggerated laugh
   - **Used:** After player loses 3 times in a row

3. **`devil_stabbed.png`**
   - **Dimensions:** 200x200px minimum
   - **Format:** PNG with transparency
   - **Description:** Devil character defeated/collapsed (not gory, keep it cartoony)
   - **Style:** Maybe knocked out stars, X eyes, tongue out - cartoonish defeat
   - **Used:** After player stabs the devil

4. **`angel.png`**
   - **Dimensions:** 100x100px minimum
   - **Format:** PNG with transparency
   - **Description:** Small angel character (can be simple/cute)
   - **Style:** Friendly helper angel, glowing/golden
   - **Used:** Clickable angel in corner of shell game

5. **`bingo_portrait.png`** (Optional)
   - **Dimensions:** 400x400px minimum
   - **Format:** PNG with transparency
   - **Description:** Portrait of Bingo (cybernetic tiefling clown/jester)
   - **Style:** Half-machine, half-devil, jester makeup, glowing cybernetic parts
   - **Used:** Hub page portrait (currently uses 🤡 emoji)

**Fallback:** If missing, emojis are used (😈 for devil, 👼 for angel, 🤡 for Bingo).

---

## 🔪 WEAPON IMAGES

**Location:** `assets/images/weapons/`

### Required Files:

1. **`knife.png`**
   - **Dimensions:** 100x100px minimum
   - **Format:** PNG with transparency
   - **Description:** A carnival/jester knife or dagger
   - **Style:** Colorful, stylized, not realistic
   - **Used:** Appears after devil laughs, click to equip

2. **`knife_cursor.png`**
   - **Dimensions:** 32x32px (cursor size)
   - **Format:** PNG with transparency
   - **Description:** Smaller knife icon for cursor
   - **Style:** Same as knife.png but cursor-sized
   - **Used:** Custom cursor when knife is equipped

**Fallback:** If missing, uses emoji 🔪 and system crosshair cursor.

---

## 🎪 BACKGROUND IMAGES (Optional)

**Location:** `assets/images/backgrounds/`

### Optional Files:

1. **`circus_tent_bg.jpg`** or **`carnival_bg.jpg`**
   - **Dimensions:** 1920x1080px minimum
   - **Format:** JPG or PNG
   - **Description:** Colorful circus tent interior or carnival midway background
   - **Style:** Vibrant, colorful, slightly surreal (Amazing Digital Circus vibe)
   - **Used:** Can be added to CSS as body background

**Note:** Currently uses CSS gradient. This is optional for enhanced theming.

---

## 🎵 SOUND EFFECTS

**Location:** `assets/sounds/`

### Required Files:

1. **`balloon_pop.mp3`**
   - **Format:** MP3
   - **Duration:** 0.3-0.5 seconds
   - **Description:** Balloon popping sound (cartoony, not harsh)

2. **`correct_chime.mp3`**
   - **Format:** MP3
   - **Duration:** 0.5-1 second
   - **Description:** Happy success chime (player got pattern right)

3. **`wrong_buzzer.mp3`**
   - **Format:** MP3
   - **Duration:** 0.5-1 second
   - **Description:** Buzzer/fail sound (player got pattern wrong)

4. **`wheel_spin.mp3`**
   - **Format:** MP3
   - **Duration:** 2-3 seconds
   - **Description:** Spinning wheel sound (ratcheting/clicking while spinning)

5. **`wheel_stop.mp3`**
   - **Format:** MP3
   - **Duration:** 0.5 seconds
   - **Description:** Wheel stopping sound (final click/stop)

6. **`shuffle.mp3`**
   - **Format:** MP3
   - **Duration:** 1-2 seconds
   - **Description:** Shell shuffling sound (cups sliding on table)

7. **`win.mp3`**
   - **Format:** MP3
   - **Duration:** 1-2 seconds
   - **Description:** Victory fanfare (player wins shell game)

8. **`lose.mp3`**
   - **Format:** MP3
   - **Duration:** 1-2 seconds
   - **Description:** Sad trombone or fail sound (player loses shell game)

9. **`devil_laugh.mp3`**
   - **Format:** MP3
   - **Duration:** 2-3 seconds
   - **Description:** Evil carnival laugh (when devil mocks player)

10. **`stab.mp3`**
    - **Format:** MP3
    - **Duration:** 0.5 seconds
    - **Description:** Cartoon stab sound (not gory, think "poof" or "bonk")

11. **`fragment_get.mp3`**
    - **Format:** MP3
    - **Duration:** 1-2 seconds
    - **Description:** Magical/mystical "memory unlocked" sound

12. **`creepy_reverse.mp3`**
    - **Format:** MP3
    - **Duration:** 2-3 seconds
    - **Description:** Eerie reversed audio or distorted sound (for "NIW UOY" creepy effect)

13. **`static_whoosh.mp3`** (Optional)
    - **Format:** MP3
    - **Duration:** 1-2 seconds
    - **Description:** TV static + whoosh for memory flash overlay

**Fallback:** If sounds are missing, the game will fail silently and continue without audio.

---

## 🎶 MUSIC (Optional)

**Location:** `assets/music/`

### Optional Files:

1. **`circus_theme.mp3`**
   - **Format:** MP3
   - **Duration:** 2-3 minutes (loopable)
   - **Description:** Upbeat carnival/circus music
   - **Style:** Slightly unsettling undertones (think carnival horror vibes)
   - **Used:** Background music for main hub

2. **`victory_music.mp3`**
   - **Format:** MP3
   - **Duration:** 10-20 seconds
   - **Description:** Triumphant completion music
   - **Used:** When all 8 fragments collected

**Note:** Music is currently not implemented in code. You can add it later if desired.

---

## 🎯 PRIORITY LEVELS

### 🔴 HIGH PRIORITY (Game-breaking if missing):
- **NONE** - All assets have fallbacks!

### 🟡 MEDIUM PRIORITY (Significantly improves experience):
- Balloon images (red, blue, yellow)
- Shell image (shell_closed.png)
- Devil images (all 3 states)
- Sound effects (all of them)

### 🟢 LOW PRIORITY (Nice to have):
- Knife images
- Angel image
- Bingo portrait
- Background images
- Music

---

## 🛠️ HOW TO ADD ASSETS

1. **Create the folder structure** exactly as shown at the top
2. **Add your asset files** with the exact names listed above
3. **Refresh the game** - assets will load automatically
4. **Test each game** to see your assets in action

### Quick Test:
- Open browser console (F12)
- Check for "404" errors to see which assets are missing
- The game will work even without assets, but will look better with them!

---

## 🎨 ART STYLE GUIDELINES

### Overall Theme: **Amazing Digital Circus**
- Bright, saturated primary colors
- Slightly surreal/uncanny 3D aesthetic
- Glossy, plastic-like textures
- Colorful but with subtle dark/creepy undertones
- Carnival/circus motifs throughout
- NOT realistic - keep it cartoony and stylized

### Color Palette:
- **Primary:** Bright red (#FF3366), Blue (#3366FF), Yellow (#FFFF33)
- **Accents:** Magenta (#FF00FF), Cyan (#00FFFF)
- **Darks:** Deep purple (#1A0033), Black (#000033)

### References:
- Amazing Digital Circus (web series)
- Vintage carnival posters
- Y2K web aesthetic
- Psychedelic circus art

---

## 📝 CHECKLIST

Copy this checklist to track your progress:

### Images - Balloons:
- [ ] red_balloon.png
- [ ] blue_balloon.png
- [ ] yellow_balloon.png

### Images - Shells:
- [ ] shell_closed.png

### Images - Characters:
- [ ] devil_normal.png
- [ ] devil_laughing.gif (or .png)
- [ ] devil_stabbed.png
- [ ] angel.png
- [ ] bingo_portrait.png (optional)

### Images - Weapons:
- [ ] knife.png
- [ ] knife_cursor.png

### Sounds - Balloon Game:
- [ ] balloon_pop.mp3
- [ ] correct_chime.mp3
- [ ] wrong_buzzer.mp3

### Sounds - Wheel Game:
- [ ] wheel_spin.mp3
- [ ] wheel_stop.mp3
- [ ] fragment_get.mp3
- [ ] creepy_reverse.mp3

### Sounds - Shell Game:
- [ ] shuffle.mp3
- [ ] win.mp3
- [ ] lose.mp3
- [ ] devil_laugh.mp3
- [ ] stab.mp3

### Music (Optional):
- [ ] circus_theme.mp3
- [ ] victory_music.mp3

---

## 💡 WHERE TO GET ASSETS

### Free Resources:
- **Sounds:** Freesound.org, Zapsplat.com, Pixabay
- **Music:** Incompetech.com, FreeMusicArchive.org
- **Images:** Create with AI (Midjourney, DALL-E, Stable Diffusion)
- **Icons:** The Noun Project, Flaticon

### AI Prompts for Image Generation:
```
"Bright cartoon red balloon, glossy 3D render, circus style, PNG transparent background, Amazing Digital Circus aesthetic"

"Carnival devil character, colorful, laughing expression, 3D cartoon style, not scary, circus aesthetic"

"Wooden shell game cup, brown carnival cup, 3D render, circus style, PNG transparent"
```

---

## ✅ TESTING

After adding assets:
1. Open `index.html` in browser
2. Open Developer Console (F12)
3. Look for any 404 errors
4. Play each game to test:
   - Balloons should show your images
   - Sounds should play when interacting
   - Devil should change images
   - Shell should show your image

**Remember:** The game works perfectly fine WITHOUT assets - they just make it look and sound better!

---

**Questions?** Check console errors or test with missing assets to see fallback behavior.
