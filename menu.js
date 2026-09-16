// =========================================================
// FOFO BIRTHDAY ADVENTURE
// MAIN MENU + LEVEL PROGRESS + LEVEL 4 LINK
// =========================================================

const menuRoot = document.getElementById("menuRoot");
const mainMenuView = document.getElementById("mainMenuView");
const levelSelectView = document.getElementById("levelSelectView");
const settingsView = document.getElementById("settingsView");

const playMenuButton = document.getElementById("playMenuButton");
const continueMenuButton = document.getElementById("continueMenuButton");
const newGameMenuButton = document.getElementById("newGameMenuButton");
const settingsMenuButton = document.getElementById("settingsMenuButton");
const levelBackButton = document.getElementById("levelBackButton");
const settingsBackButton = document.getElementById("settingsBackButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const menuToast = document.getElementById("menuToast");
const levelCards = document.querySelectorAll(".level-card");

const musicToggle = document.getElementById("musicToggle");
const sfxToggle = document.getElementById("sfxToggle");
const musicVolumeSlider = document.getElementById("musicVolumeSlider");
const sfxVolumeSlider = document.getElementById("sfxVolumeSlider");
const musicVolumeText = document.getElementById("musicVolumeText");
const sfxVolumeText = document.getElementById("sfxVolumeText");

const STORAGE = {
  highestUnlocked: "fofoHighestUnlockedLevel",
  lastLevel: "fofoLastPlayedLevel",
  levelOneCompleted: "fofoLevel1Completed",
  levelTwoCompleted: "fofoLevel2Completed",
  levelThreeCompleted: "fofoLevel3Completed",
  levelFourCompleted: "fofoLevel4Completed",
  levelThreeUnlockSeen: "fofoLevel3UnlockSeen",
  levelFourUnlockSeen: "fofoLevel4UnlockSeen",
  musicEnabled: "fofoMusicEnabled",
  sfxEnabled: "fofoSfxEnabled",
  musicVolume: "fofoMusicVolume",
  sfxVolume: "fofoSfxVolume"
};

// =========================================================
// SECRET GIFT CARD STYLES
// =========================================================

function installGiftCardStyles() {
  if (document.getElementById("fofoGiftCardStyles")) return;

  const style = document.createElement("style");
  style.id = "fofoGiftCardStyles";
  style.textContent = `
    .level-card-image {
      position: relative !important;
      overflow: hidden !important;
      border-radius: 24px 24px 0 0 !important;
      isolation: isolate;
    }

    .level-card-image .level-number-badge {
      position: absolute !important;
      top: 14px !important;
      left: 14px !important;
      right: auto !important;
      bottom: auto !important;
      margin: 0 !important;
      z-index: 70 !important;
      transform: none !important;
    }

    .level-card-image.gift-secret::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 20;
      border-radius: 24px 24px 0 0;
      background: linear-gradient(135deg, rgba(87,29,66,.30), rgba(36,19,55,.27));
      box-shadow: inset 0 0 65px rgba(24,7,32,.35);
      pointer-events: none;
    }

    .level-card-image.gift-secret::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 21;
      border-radius: 24px 24px 0 0;
      background: rgba(84,35,73,.08);
      backdrop-filter: blur(18px) saturate(.72);
      -webkit-backdrop-filter: blur(18px) saturate(.72);
      pointer-events: none;
    }

    .level-card-image .level-lock-overlay {
      z-index: 80 !important;
    }

    .level-card-image.gift-revealed {
      filter: none !important;
    }
  `;

  document.head.appendChild(style);
}

// =========================================================
// PROGRESS
// =========================================================

function completed(key) {
  return localStorage.getItem(key) === "true";
}

function hasCompletedLevelOne() {
  return completed(STORAGE.levelOneCompleted);
}

function hasCompletedLevelTwo() {
  return completed(STORAGE.levelTwoCompleted);
}

function hasCompletedLevelThree() {
  return completed(STORAGE.levelThreeCompleted);
}

function hasCompletedLevelFour() {
  return completed(STORAGE.levelFourCompleted);
}

function isLevelCompleted(level) {
  if (level === 1) return hasCompletedLevelOne();
  if (level === 2) return hasCompletedLevelTwo();
  if (level === 3) return hasCompletedLevelThree();
  if (level === 4) return hasCompletedLevelFour();
  return false;
}

function getHighestUnlockedLevel() {
  if (!hasCompletedLevelOne()) return 1;
  if (!hasCompletedLevelTwo()) return 2;
  if (!hasCompletedLevelThree()) return 3;
  return 4;
}

function getNextLevel() {
  if (!hasCompletedLevelOne()) return 1;
  if (!hasCompletedLevelTwo()) return 2;
  if (!hasCompletedLevelThree()) return 3;
  return 4;
}

function ensureProgressDefaults() {
  const defaults = {
    [STORAGE.levelOneCompleted]: "false",
    [STORAGE.levelTwoCompleted]: "false",
    [STORAGE.levelThreeCompleted]: "false",
    [STORAGE.levelFourCompleted]: "false",
    [STORAGE.levelThreeUnlockSeen]: "false",
    [STORAGE.levelFourUnlockSeen]: "false"
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, value);
    }
  });
}

function reconcileProgress() {
  if (hasCompletedLevelFour()) {
    localStorage.setItem(STORAGE.levelOneCompleted, "true");
    localStorage.setItem(STORAGE.levelTwoCompleted, "true");
    localStorage.setItem(STORAGE.levelThreeCompleted, "true");
  }

  if (hasCompletedLevelThree()) {
    localStorage.setItem(STORAGE.levelOneCompleted, "true");
    localStorage.setItem(STORAGE.levelTwoCompleted, "true");
  }

  if (hasCompletedLevelTwo()) {
    localStorage.setItem(STORAGE.levelOneCompleted, "true");
  }

  const highest = getHighestUnlockedLevel();
  localStorage.setItem(STORAGE.highestUnlocked, String(highest));

  if (!hasCompletedLevelOne()) {
    localStorage.setItem(STORAGE.lastLevel, "1");
  }
}

// =========================================================
// VIEW / TOAST
// =========================================================

function showMenuView(view) {
  [mainMenuView, levelSelectView, settingsView].forEach(currentView => {
    currentView?.classList.remove("active");
  });
  view?.classList.add("active");
}

let toastTimer = null;

function showMenuToast(text) {
  if (!menuToast) return;

  clearTimeout(toastTimer);
  menuToast.textContent = text;
  menuToast.classList.add("show");

  toastTimer = setTimeout(() => {
    menuToast.classList.remove("show");
  }, 2400);
}

// =========================================================
// LEVEL CARD ARTWORK
// =========================================================

function applyLevelTwoCardArtwork() {
  const card = document.querySelector('.level-card[data-level="2"]');
  if (!card) return;

  const image = card.querySelector(".level-card-image");
  const fallback = card.querySelector(".level-art-fallback");
  const title = card.querySelector("h3");
  const description = card.querySelector("p");

  if (image) {
    image.style.backgroundImage = `
      linear-gradient(rgba(72,20,48,.03), rgba(72,20,48,.13)),
      url("assets/level2_assets/bouquet_final.png"),
      linear-gradient(135deg, #e8bdca, #7c214a)
    `;
    image.style.backgroundSize = "cover, contain, cover";
    image.style.backgroundPosition = "center, center, center";
    image.style.backgroundRepeat = "no-repeat";
  }

  if (fallback) fallback.style.opacity = "0";
  if (title) title.textContent = "Burgundy Bloom";
  if (description) description.textContent = "A romantic garden adventure.";
}

function applyLevelThreeCardArtwork() {
  const card = document.querySelector('.level-card[data-level="3"]');
  if (!card) return;

  const image = card.querySelector(".level-card-image");
  const fallback = card.querySelector(".level-art-fallback");
  const title = card.querySelector("h3");
  const description = card.querySelector("p");

  if (image) {
    image.style.backgroundImage = `
      radial-gradient(circle at 50% 52%, rgba(156,53,110,.22), transparent 53%),
      url("assets/level3_product/jbl_black_view_1.png"),
      linear-gradient(135deg, #15142f 0%, #31152e 55%, #5b1636 100%)
    `;
    image.style.backgroundSize = "cover, contain, cover";
    image.style.backgroundPosition = "center, center, center";
    image.style.backgroundRepeat = "no-repeat";
  }

  if (fallback) fallback.style.opacity = "0";
  if (title) title.textContent = "Moonlight Echo";
  if (description) description.textContent = "A little sentence I never forgot.";
}


function applyLevelFourCardArtwork() {
  const card = document.querySelector('.level-card[data-level="4"]');
  if (!card) return;

  const image = card.querySelector(".level-card-image");
  const fallback = card.querySelector(".level-art-fallback");
  const title = card.querySelector("h3");
  const description = card.querySelector("p");

  if (image) {
    image.style.backgroundImage = `
      linear-gradient(rgba(67,24,23,.03), rgba(67,24,23,.17)),
      url("assets/level4/world/level4_card_art.png"),
      linear-gradient(135deg, #efb391, #7d2d32)
    `;
    image.style.backgroundSize = "cover, cover, cover";
    image.style.backgroundPosition = "center, center, center";
    image.style.backgroundRepeat = "no-repeat";
  }

  if (fallback) fallback.style.opacity = "0";
  if (title) title.textContent = "Brighter Horizons";
  if (description) description.textContent = "The final surprise is a memory we get to live.";
}

function refreshGiftVisibility() {
  levelCards.forEach(card => {
    const level = Number(card.dataset.level);
    const image = card.querySelector(".level-card-image");
    if (!image) return;

    const isComplete = isLevelCompleted(level);
    image.classList.toggle("gift-secret", !isComplete);
    image.classList.toggle("gift-revealed", isComplete);
  });
}

// =========================================================
// LEVEL CARDS / CONTINUE
// =========================================================

function updateContinueButton() {
  if (!continueMenuButton) return;

  const enabled = hasCompletedLevelOne();
  continueMenuButton.disabled = !enabled;
  continueMenuButton.classList.toggle("menu-button-disabled", !enabled);

  if (!enabled) {
    continueMenuButton.title = "Complete Level 1 first";
    return;
  }

  continueMenuButton.title = `Continue to Level ${getNextLevel()}`;
}

function updateLevelCards() {
  const highestUnlocked = getHighestUnlockedLevel();
  localStorage.setItem(STORAGE.highestUnlocked, String(highestUnlocked));

  levelCards.forEach(card => {
    const level = Number(card.dataset.level);
    const locked = level > highestUnlocked;
    const isComplete = isLevelCompleted(level);

    card.classList.toggle("locked", locked);
    card.setAttribute("aria-disabled", locked ? "true" : "false");

    const status = card.querySelector(".level-status");
    const label = card.querySelector(".level-label");

    status?.classList.remove("level-play-icon");

    if (isComplete) {
      if (status) {
        status.textContent = "✓";
        status.classList.add("level-play-icon");
      }
      if (label) {
        label.textContent = level === 4
          ? "FINAL LEVEL • COMPLETED"
          : `LEVEL ${level} • COMPLETED`;
      }
      return;
    }

    if (locked) {
      if (status) status.textContent = "🔒";
      if (label) label.textContent = level === 4 ? "FINAL LEVEL" : `LEVEL ${level}`;
      return;
    }

    if (status) {
      status.textContent = "▶";
      status.classList.add("level-play-icon");
    }

    if (label) {
      if (level === 1) {
        label.textContent = "LEVEL 1";
      } else if (level === highestUnlocked) {
        label.textContent = level === 4
          ? "NEW ✨ • FINAL LEVEL"
          : `NEW ✨ • LEVEL ${level}`;
      } else {
        label.textContent = `LEVEL ${level}`;
      }
    }
  });

  refreshGiftVisibility();
  updateContinueButton();
}

// =========================================================
// OPEN LEVELS
// =========================================================

function enterLevelOne() {
  localStorage.setItem(STORAGE.lastLevel, "1");

  if (typeof setAudioScene === "function") {
    setAudioScene("game");
  }

  if (typeof startGameAudio === "function") {
    startGameAudio();
  }

  menuRoot?.classList.add("hidden");
  applyAudioSettings();
}

function openLevel(level) {
  const highestUnlocked = getHighestUnlockedLevel();

  if (level > highestUnlocked) {
    showMenuToast("Complete the previous adventure first 💖");
    return;
  }

  if (level === 1) {
    enterLevelOne();
    return;
  }

  if (level === 2) {
    localStorage.setItem(STORAGE.lastLevel, "2");
    window.location.href = "level2.html";
    return;
  }

  if (level === 3) {
    localStorage.setItem(STORAGE.lastLevel, "3");
    window.location.href = "level3.html";
    return;
  }

  if (level === 4) {
    localStorage.setItem(STORAGE.lastLevel, "4");
    window.location.href = "level4.html";
    return;
  }
}

levelCards.forEach(card => {
  card.addEventListener("click", () => {
    openLevel(Number(card.dataset.level));
  });
});

playMenuButton?.addEventListener("click", () => {
  applyLevelTwoCardArtwork();
  applyLevelThreeCardArtwork();
  applyLevelFourCardArtwork();
  updateLevelCards();
  showMenuView(levelSelectView);
});

continueMenuButton?.addEventListener("click", () => {
  if (!hasCompletedLevelOne()) return;

  const nextLevel = getNextLevel();

  if (nextLevel === 2 || nextLevel === 3 || nextLevel === 4) {
    openLevel(nextLevel);
    return;
  }

  updateLevelCards();
  showMenuView(levelSelectView);
  showMenuToast(`Level ${nextLevel} is unlocked ✨`);
});

// =========================================================
// NEW GAME
// =========================================================

newGameMenuButton?.addEventListener("click", () => {
  const reset = window.confirm(
    "Start a new birthday adventure?\n\nYour progress will be reset."
  );

  if (!reset) return;

  localStorage.setItem(STORAGE.highestUnlocked, "1");
  localStorage.setItem(STORAGE.lastLevel, "1");
  localStorage.setItem(STORAGE.levelOneCompleted, "false");
  localStorage.setItem(STORAGE.levelTwoCompleted, "false");
  localStorage.setItem(STORAGE.levelThreeCompleted, "false");
  localStorage.setItem(STORAGE.levelFourCompleted, "false");
  localStorage.setItem(STORAGE.levelThreeUnlockSeen, "false");
  localStorage.setItem(STORAGE.levelFourUnlockSeen, "false");

  applyLevelTwoCardArtwork();
  applyLevelThreeCardArtwork();
  applyLevelFourCardArtwork();
  updateLevelCards();
  showMenuView(levelSelectView);
  showMenuToast("A brand-new birthday adventure begins 🎂✨");
});

// =========================================================
// SETTINGS
// =========================================================

function getBooleanSetting(key, defaultValue) {
  const value = localStorage.getItem(key);
  return value === null ? defaultValue : value === "true";
}

function getNumberSetting(key, defaultValue) {
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;

  const value = Number(stored);
  if (!Number.isFinite(value)) return defaultValue;
  return Math.max(0, Math.min(100, value));
}

function loadSettingsUI() {
  const musicEnabled = getBooleanSetting(STORAGE.musicEnabled, true);
  const sfxEnabled = getBooleanSetting(STORAGE.sfxEnabled, true);
  const musicVolume = getNumberSetting(STORAGE.musicVolume, 100);
  const sfxVolume = getNumberSetting(STORAGE.sfxVolume, 100);

  if (musicToggle) musicToggle.checked = musicEnabled;
  if (sfxToggle) sfxToggle.checked = sfxEnabled;
  if (musicVolumeSlider) musicVolumeSlider.value = musicVolume;
  if (sfxVolumeSlider) sfxVolumeSlider.value = sfxVolume;
  if (musicVolumeText) musicVolumeText.textContent = `${musicVolume}%`;
  if (sfxVolumeText) sfxVolumeText.textContent = `${sfxVolume}%`;
}

function applyAudioSettings() {
  const musicEnabled = getBooleanSetting(STORAGE.musicEnabled, true);
  const sfxEnabled = getBooleanSetting(STORAGE.sfxEnabled, true);
  const musicVolume = getNumberSetting(STORAGE.musicVolume, 100);
  const sfxVolume = getNumberSetting(STORAGE.sfxVolume, 100);

  if (typeof setAudioPreferences === "function") {
    setAudioPreferences({
      musicEnabled,
      sfxEnabled,
      musicVolume: musicVolume / 100,
      sfxVolume: sfxVolume / 100
    });
  }
}

function saveSettings() {
  if (!musicToggle || !sfxToggle || !musicVolumeSlider || !sfxVolumeSlider) return;

  localStorage.setItem(STORAGE.musicEnabled, String(musicToggle.checked));
  localStorage.setItem(STORAGE.sfxEnabled, String(sfxToggle.checked));
  localStorage.setItem(STORAGE.musicVolume, musicVolumeSlider.value);
  localStorage.setItem(STORAGE.sfxVolume, sfxVolumeSlider.value);

  if (musicVolumeText) musicVolumeText.textContent = `${musicVolumeSlider.value}%`;
  if (sfxVolumeText) sfxVolumeText.textContent = `${sfxVolumeSlider.value}%`;

  applyAudioSettings();
}

musicToggle?.addEventListener("change", saveSettings);
sfxToggle?.addEventListener("change", saveSettings);
musicVolumeSlider?.addEventListener("input", saveSettings);
sfxVolumeSlider?.addEventListener("input", saveSettings);

settingsMenuButton?.addEventListener("click", () => {
  loadSettingsUI();
  showMenuView(settingsView);
});

levelBackButton?.addEventListener("click", () => showMenuView(mainMenuView));
settingsBackButton?.addEventListener("click", () => showMenuView(mainMenuView));

fullscreenButton?.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    showMenuToast("Fullscreen isn't available here.");
  }
});

// =========================================================
// LEVEL 1 COMPLETION CALLBACK
// =========================================================

window.completeLevelOneAndReturnToLevels = function () {
  localStorage.setItem(STORAGE.levelOneCompleted, "true");
  localStorage.setItem(STORAGE.highestUnlocked, "2");
  localStorage.setItem(STORAGE.lastLevel, "2");

  if (typeof releaseAllControls === "function") {
    releaseAllControls();
  }

  menuRoot?.classList.remove("hidden");
  applyLevelTwoCardArtwork();
  applyLevelThreeCardArtwork();
  applyLevelFourCardArtwork();
  updateLevelCards();
  showMenuView(levelSelectView);

  if (typeof setAudioScene === "function") {
    setAudioScene("menu");
  }

  if (typeof startGameAudio === "function") {
    startGameAudio();
  }

  applyAudioSettings();
  showMenuToast("Level 2 unlocked — Burgundy Bloom 🌹✨");
};

// =========================================================
// INITIALIZE
// =========================================================

function initializeMenu() {
  installGiftCardStyles();
  ensureProgressDefaults();
  reconcileProgress();

  applyLevelTwoCardArtwork();
  applyLevelThreeCardArtwork();
  applyLevelFourCardArtwork();
  loadSettingsUI();
  updateLevelCards();
  applyAudioSettings();

  if (typeof setAudioScene === "function") {
    setAudioScene("menu");
  }

  if (
    hasCompletedLevelThree() &&
    !hasCompletedLevelFour() &&
    localStorage.getItem(STORAGE.levelFourUnlockSeen) !== "true"
  ) {
    localStorage.setItem(STORAGE.levelFourUnlockSeen, "true");
    showMenuView(levelSelectView);
    setTimeout(() => {
      showMenuToast("Level 3 Complete — Final Level unlocked ✨");
    }, 250);
    return;
  }

  if (
    hasCompletedLevelTwo() &&
    !hasCompletedLevelThree() &&
    localStorage.getItem(STORAGE.levelThreeUnlockSeen) !== "true"
  ) {
    localStorage.setItem(STORAGE.levelThreeUnlockSeen, "true");
    showMenuView(levelSelectView);
    setTimeout(() => {
      showMenuToast("Level 2 Complete — Level 3 unlocked 🎧✨");
    }, 250);
    return;
  }

  showMenuView(mainMenuView);
}

initializeMenu();
