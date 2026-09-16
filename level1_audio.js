// =========================================================
// FOFO BIRTHDAY ADVENTURE
// LEVEL 1 — AUDIO UPGRADE
//
// New louder / cleaner Level 1 music + SFX.
// Keeps the existing Main Menu music system untouched.
// =========================================================

(() => {
  "use strict";


  // =======================================================
  // OLD AUDIO SYSTEM
  // =======================================================

  const oldSetAudioScene =
    typeof window.setAudioScene === "function"
      ? window.setAudioScene.bind(window)
      : null;


  const oldStartGameAudio =
    typeof window.startGameAudio === "function"
      ? window.startGameAudio.bind(window)
      : null;


  const oldSetAudioPreferences =
    typeof window.setAudioPreferences === "function"
      ? window.setAudioPreferences.bind(window)
      : null;


  // =======================================================
  // ELEMENTS
  // =======================================================

  const menuRoot =
    document.getElementById("menuRoot");


  const messageBox =
    document.getElementById("message");


  const finishScreen =
    document.getElementById("finishScreen");


  const jumpButton =
    document.getElementById("btnJump");


  const giftButton =
    document.getElementById("giftButton");


  const giftBoxButton =
    document.getElementById("giftBoxButton");


  const openGiftButton =
    document.getElementById("openGiftButton");


  const giftStoryButton =
    document.getElementById("giftStoryButton");


  const backToGiftButton =
    document.getElementById("backToGiftButton");


  const closeStoryButton =
    document.getElementById("closeStoryButton");


  // =======================================================
  // SETTINGS
  // =======================================================

  const STORAGE = {

    musicEnabled:
      "fofoMusicEnabled",

    sfxEnabled:
      "fofoSfxEnabled",

    musicVolume:
      "fofoMusicVolume",

    sfxVolume:
      "fofoSfxVolume"

  };


  function clamp(
    value,
    min,
    max
  ) {

    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );

  }


  function readBoolean(
    key,
    fallback = true
  ) {

    const value =
      localStorage.getItem(
        key
      );


    if (
      value === null
    ) {

      return fallback;

    }


    return (
      value === "true"
    );

  }


  function readVolume(
    key,
    fallback = 100
  ) {

    const raw =
      localStorage.getItem(
        key
      );


    if (
      raw === null
    ) {

      return fallback / 100;

    }


    const value =
      Number(raw);


    if (
      !Number.isFinite(value)
    ) {

      return fallback / 100;

    }


    return clamp(
      value / 100,
      0,
      1
    );

  }


  let musicEnabled =
    readBoolean(
      STORAGE.musicEnabled,
      true
    );


  let sfxEnabled =
    readBoolean(
      STORAGE.sfxEnabled,
      true
    );


  let musicVolume =
    readVolume(
      STORAGE.musicVolume,
      100
    );


  let sfxVolume =
    readVolume(
      STORAGE.sfxVolume,
      100
    );


  // =======================================================
  // CURRENT SCENE
  // =======================================================

  let currentScene =

    menuRoot &&
    menuRoot.classList.contains(
      "hidden"
    )

      ? "game"

      : "menu";


  // =======================================================
  // LEVEL 1 MUSIC
  // =======================================================

  const levelMusic =
    new Audio(
      "assets/Audio/level1_music.mp3"
    );


  levelMusic.loop =
    true;


  levelMusic.preload =
    "auto";


  /*
    الميوزك نفسها Mastered بصوت أعلى،
    وده أقصى مستوى آمن تقريبًا من غير Distortion.
  */

  const MUSIC_MASTER =
    0.98;


  function updateMusicVolume() {

    levelMusic.volume =

      musicEnabled

        ? clamp(
            musicVolume *
            MUSIC_MASTER,
            0,
            1
          )

        : 0;

  }


  updateMusicVolume();


  // =======================================================
  // SOUND EFFECT FILES
  // =======================================================

  const SFX_FILES = {

    jump:
      "assets/Audio/jump.wav",

    stomp:
      "assets/Audio/stomp.wav",

    collect:
      "assets/Audio/collect.wav",

    golden:
      "assets/Audio/golden_collect.wav",

    hurt:
      "assets/Audio/hurt.wav",

    checkpoint:
      "assets/Audio/checkpoint.wav",

    gate:
      "assets/Audio/gate_unlock.wav",

    complete:
      "assets/Audio/level_complete.wav",

    ui:
      "assets/Audio/ui_click.wav"

  };


  const sfxTemplates =
    {};


  Object.entries(
    SFX_FILES
  ).forEach(
    ([name, src]) => {

      const audio =
        new Audio(src);


      audio.preload =
        "auto";


      sfxTemplates[name] =
        audio;

    }
  );


  // =======================================================
  // INDIVIDUAL SFX MIX
  // =======================================================

  const SFX_GAIN = {

    jump:
      0.95,

    stomp:
      1.00,

    collect:
      0.92,

    golden:
      1.00,

    hurt:
      0.95,

    checkpoint:
      0.92,

    gate:
      1.00,

    complete:
      1.00,

    ui:
      0.70

  };


  function playSfx(
    name,
    gain = 1
  ) {

    if (
      !sfxEnabled ||
      currentScene !== "game"
    ) {

      return;

    }


    const template =
      sfxTemplates[name];


    if (
      !template
    ) {

      return;

    }


    const sound =
      template.cloneNode(
        true
      );


    sound.volume =
      clamp(

        sfxVolume *

        (
          SFX_GAIN[name] ??
          1
        ) *

        gain,

        0,

        1
      );


    sound
      .play()
      .catch(
        () => {}
      );

  }


  // =======================================================
  // OLD AUDIO SYSTEM
  // =======================================================

  function syncOldAudioSystem() {

    if (
      !oldSetAudioPreferences
    ) {

      return;

    }


    /*
      أثناء Level 1:
      اقفل الميوزك والـSFX القديمة
      عشان متشتغلش فوق الجديدة.
    */

    if (
      currentScene === "game"
    ) {

      oldSetAudioPreferences({

        musicEnabled:
          false,

        sfxEnabled:
          false,

        musicVolume:
          0,

        sfxVolume:
          0

      });


      return;

    }


    /*
      في المين منيو:
      رجع إعدادات الصوت الطبيعية.
    */

    oldSetAudioPreferences({

      musicEnabled,

      sfxEnabled,

      musicVolume,

      sfxVolume

    });

  }


  // =======================================================
  // MUSIC CONTROL
  // =======================================================

  function startLevelMusic() {

    if (
      currentScene !== "game" ||
      !musicEnabled
    ) {

      return;

    }


    updateMusicVolume();


    levelMusic
      .play()
      .catch(
        () => {}
      );

  }


  function pauseLevelMusic(
    reset = false
  ) {

    levelMusic.pause();


    if (
      reset
    ) {

      levelMusic.currentTime =
        0;

    }

  }


  // =======================================================
  // REPLACE GLOBAL AUDIO FUNCTIONS
  // =======================================================

  window.setAudioScene =
    function setAudioScene(
      scene
    ) {

      currentScene =

        scene === "game"

          ? "game"

          : "menu";


      // ---------------------------------------------------
      // LEVEL 1
      // ---------------------------------------------------

      if (
        currentScene === "game"
      ) {

        syncOldAudioSystem();


        if (
          oldSetAudioScene
        ) {

          oldSetAudioScene(
            "game"
          );

        }


        startLevelMusic();


        return;

      }


      // ---------------------------------------------------
      // MENU
      // ---------------------------------------------------

      pauseLevelMusic(
        true
      );


      syncOldAudioSystem();


      if (
        oldSetAudioScene
      ) {

        oldSetAudioScene(
          "menu"
        );

      }

    };


  window.startGameAudio =
    function startGameAudio() {

      if (
        currentScene === "game"
      ) {

        syncOldAudioSystem();


        /*
          بنفتح Audio Context القديم
          لكن هو Muted في Level 1.
        */

        if (
          oldStartGameAudio
        ) {

          oldStartGameAudio();

        }


        startLevelMusic();


        return;

      }


      syncOldAudioSystem();


      if (
        oldStartGameAudio
      ) {

        oldStartGameAudio();

      }

    };


  window.setAudioPreferences =
    function setAudioPreferences(
      preferences = {}
    ) {

      if (
        typeof preferences.musicEnabled ===
        "boolean"
      ) {

        musicEnabled =
          preferences.musicEnabled;

      }


      if (
        typeof preferences.sfxEnabled ===
        "boolean"
      ) {

        sfxEnabled =
          preferences.sfxEnabled;

      }


      if (
        Number.isFinite(
          preferences.musicVolume
        )
      ) {

        musicVolume =
          clamp(
            preferences.musicVolume,
            0,
            1
          );

      }


      if (
        Number.isFinite(
          preferences.sfxVolume
        )
      ) {

        sfxVolume =
          clamp(
            preferences.sfxVolume,
            0,
            1
          );

      }


      updateMusicVolume();


      syncOldAudioSystem();


      if (
        !musicEnabled
      ) {

        pauseLevelMusic(
          false
        );

      }

      else if (
        currentScene === "game"
      ) {

        startLevelMusic();

      }

    };


  // =======================================================
  // AUDIO UNLOCK
  // =======================================================

  function unlockLevelAudio() {

    if (
      currentScene === "game"
    ) {

      startLevelMusic();

    }

  }


  document.addEventListener(
    "pointerdown",
    unlockLevelAudio,
    {
      passive: true
    }
  );


  document.addEventListener(
    "keydown",
    unlockLevelAudio
  );


  // =======================================================
  // JUMP SOUND
  // =======================================================

  let lastJumpSoundTime =
    0;


  function triggerJumpSound() {

    if (
      currentScene !== "game"
    ) {

      return;

    }


    const now =
      performance.now();


    /*
      يمنع إن Keyboard + Mobile
      يشغلوا الصوت مرتين.
    */

    if (
      now -
      lastJumpSoundTime <
      130
    ) {

      return;

    }


    lastJumpSoundTime =
      now;


    playSfx(
      "jump"
    );

  }


  // Keyboard jump

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.code === "Space" &&
        !event.repeat
      ) {

        triggerJumpSound();

      }

    }
  );


  // Mobile jump

  if (
    jumpButton
  ) {

    jumpButton.addEventListener(
      "pointerdown",
      triggerJumpSound
    );

  }


  // =======================================================
  // GAME MESSAGE SOUNDS
  // =======================================================

  let lastMessageText =
    "";


  let lastMessageTime =
    0;


  function handleMessageSound(
    text
  ) {

    if (
      currentScene !== "game"
    ) {

      return;

    }


    const clean =
      String(
        text || ""
      ).trim();


    if (
      !clean
    ) {

      return;

    }


    const now =
      performance.now();


    if (
      clean === lastMessageText &&
      now - lastMessageTime < 250
    ) {

      return;

    }


    lastMessageText =
      clean;


    lastMessageTime =
      now;


    // =====================================================
    // ENEMY DEFEATED
    // =====================================================

    if (
      /monster defeated|pipe monster defeated/i
        .test(clean)
    ) {

      playSfx(
        "stomp"
      );


      return;

    }


    // =====================================================
    // ALL TREATS / GATE OPEN
    // =====================================================

    if (
      /all treats collected|gate unlocked/i
        .test(clean)
    ) {

      playSfx(
        "golden"
      );


      setTimeout(
        () => {

          if (
            currentScene === "game"
          ) {

            playSfx(
              "gate",
              0.95
            );

          }

        },

        130
      );


      return;

    }


    // =====================================================
    // NORMAL COLLECTIBLE
    // =====================================================

    if (
      /treat\s+\d+\s*\/\s*\d+\s+collected/i
        .test(clean)
    ) {

      playSfx(
        "collect"
      );


      return;

    }


    // =====================================================
    // CHECKPOINT
    // =====================================================

    if (
      /checkpoint reached/i
        .test(clean)
    ) {

      playSfx(
        "checkpoint"
      );


      return;

    }


    // =====================================================
    // HURT / FALL
    // =====================================================

    if (
      /ouch|you fell|fainted|fofo fell/i
        .test(clean)
    ) {

      playSfx(
        "hurt"
      );

    }

  }


  if (
    messageBox
  ) {

    const messageObserver =
      new MutationObserver(
        () => {

          handleMessageSound(
            messageBox.textContent
          );

        }
      );


    messageObserver.observe(
      messageBox,
      {

        childList:
          true,

        characterData:
          true,

        subtree:
          true

      }
    );

  }


  // =======================================================
  // LEVEL COMPLETE SOUND
  // =======================================================

  let finishWasVisible =
    false;


  function updateFinishAudio() {

    if (
      !finishScreen
    ) {

      return;

    }


    const visible =
      finishScreen
        .classList
        .contains(
          "show"
        );


    if (
      visible &&
      !finishWasVisible &&
      currentScene === "game"
    ) {

      playSfx(
        "complete"
      );


      /*
        وطي الميوزك لحظيًا
        عشان الـLevel Complete يبان.
      */

      const originalVolume =
        levelMusic.volume;


      levelMusic.volume =
        originalVolume *
        0.34;


      setTimeout(
        () => {

          if (
            currentScene === "game" &&
            musicEnabled
          ) {

            updateMusicVolume();

          }

        },

        1850
      );

    }


    finishWasVisible =
      visible;

  }


  if (
    finishScreen
  ) {

    const finishObserver =
      new MutationObserver(
        updateFinishAudio
      );


    finishObserver.observe(
      finishScreen,
      {

        attributes:
          true,

        attributeFilter:
          ["class"]

      }
    );


    updateFinishAudio();

  }


  // =======================================================
  // GIFT BUTTON SOUNDS
  // =======================================================

  [
    giftButton,
    giftBoxButton,
    openGiftButton,
    giftStoryButton,
    backToGiftButton,
    closeStoryButton
  ]
    .filter(Boolean)
    .forEach(
      button => {

        button.addEventListener(
          "pointerdown",
          () => {

            playSfx(
              "ui"
            );

          }
        );

      }
    );


  // =======================================================
  // AUTO-DETECT MENU / GAME
  // =======================================================

  function syncSceneFromMenu() {

    if (
      !menuRoot
    ) {

      return;

    }


    const menuHidden =
      menuRoot
        .classList
        .contains(
          "hidden"
        );


    const detectedScene =

      menuHidden

        ? "game"

        : "menu";


    if (
      detectedScene ===
      currentScene
    ) {

      return;

    }


    window.setAudioScene(
      detectedScene
    );

  }


  if (
    menuRoot
  ) {

    const menuObserver =
      new MutationObserver(
        syncSceneFromMenu
      );


    menuObserver.observe(
      menuRoot,
      {

        attributes:
          true,

        attributeFilter:
          ["class"]

      }
    );

  }


  // =======================================================
  // STORAGE CHANGE
  // =======================================================

  window.addEventListener(
    "storage",
    event => {

      if (
        !Object
          .values(STORAGE)
          .includes(
            event.key
          )
      ) {

        return;

      }


      musicEnabled =
        readBoolean(
          STORAGE.musicEnabled,
          true
        );


      sfxEnabled =
        readBoolean(
          STORAGE.sfxEnabled,
          true
        );


      musicVolume =
        readVolume(
          STORAGE.musicVolume,
          100
        );


      sfxVolume =
        readVolume(
          STORAGE.sfxVolume,
          100
        );


      updateMusicVolume();


      syncOldAudioSystem();

    }
  );


  // =======================================================
  // INITIAL AUDIO STATE
  // =======================================================

  syncOldAudioSystem();


  if (
    currentScene === "game"
  ) {

    startLevelMusic();

  }

})();