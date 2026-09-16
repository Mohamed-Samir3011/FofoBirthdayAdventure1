// =====================================================
// FOFO BIRTHDAY ADVENTURE
// CONTROLS + AUDIO SYSTEM
//
// MAIN MENU MUSIC:
// assets/audio/menu_birthday.mp3
//
// GAME MUSIC:
// generated platformer music
// =====================================================


// =====================================================
// CONTROL BUTTONS
// =====================================================

const btnLeft =
  document.getElementById(
    "btnLeft"
  );

const btnRight =
  document.getElementById(
    "btnRight"
  );

const btnJump =
  document.getElementById(
    "btnJump"
  );


// =====================================================
// SEND KEY TO GAME
// =====================================================

function sendGameKey(
  type,
  code
) {

  let keyValue = "";


  if (
    code === "ArrowLeft"
  ) {

    keyValue =
      "ArrowLeft";

  }


  if (
    code === "ArrowRight"
  ) {

    keyValue =
      "ArrowRight";

  }


  if (
    code === "Space"
  ) {

    keyValue =
      " ";

  }


  const event =
    new KeyboardEvent(
      type,
      {

        code,

        key:
          keyValue,

        bubbles:
          true,

        cancelable:
          true

      }
    );


  document.dispatchEvent(
    event
  );

}


// =====================================================
// HOLD CONTROL
// =====================================================

function bindHoldControl(
  button,
  code
) {

  if (
    !button
  ) {

    return;

  }


  let active =
    false;


  function press(
    event
  ) {

    event.preventDefault();


    startGameAudio();


    if (
      active
    ) {

      return;

    }


    active =
      true;


    button.classList.add(
      "pressed"
    );


    sendGameKey(
      "keydown",
      code
    );

  }


  function release(
    event
  ) {

    if (
      event
    ) {

      event.preventDefault();

    }


    if (
      !active
    ) {

      return;

    }


    active =
      false;


    button.classList.remove(
      "pressed"
    );


    sendGameKey(
      "keyup",
      code
    );

  }


  button.addEventListener(
    "pointerdown",
    (event) => {

      try {

        button.setPointerCapture(
          event.pointerId
        );

      }

      catch (_) {}


      press(
        event
      );

    }
  );


  button.addEventListener(
    "pointerup",
    release
  );


  button.addEventListener(
    "pointercancel",
    release
  );


  button.addEventListener(
    "lostpointercapture",
    release
  );


  button.addEventListener(
    "contextmenu",
    (event) => {

      event.preventDefault();

    }
  );

}


// =====================================================
// JUMP CONTROL
// =====================================================

function bindJumpControl(
  button
) {

  if (
    !button
  ) {

    return;

  }


  let active =
    false;


  function press(
    event
  ) {

    event.preventDefault();


    startGameAudio();


    if (
      active
    ) {

      return;

    }


    active =
      true;


    button.classList.add(
      "pressed"
    );


    sendGameKey(
      "keydown",
      "Space"
    );

  }


  function release(
    event
  ) {

    if (
      event
    ) {

      event.preventDefault();

    }


    if (
      !active
    ) {

      return;

    }


    active =
      false;


    button.classList.remove(
      "pressed"
    );


    sendGameKey(
      "keyup",
      "Space"
    );

  }


  button.addEventListener(
    "pointerdown",
    (event) => {

      try {

        button.setPointerCapture(
          event.pointerId
        );

      }

      catch (_) {}


      press(
        event
      );

    }
  );


  button.addEventListener(
    "pointerup",
    release
  );


  button.addEventListener(
    "pointercancel",
    release
  );


  button.addEventListener(
    "lostpointercapture",
    release
  );


  button.addEventListener(
    "contextmenu",
    (event) => {

      event.preventDefault();

    }
  );

}


// =====================================================
// CONNECT CONTROLS
// =====================================================

bindHoldControl(
  btnLeft,
  "ArrowLeft"
);


bindHoldControl(
  btnRight,
  "ArrowRight"
);


bindJumpControl(
  btnJump
);


// =====================================================
// RELEASE CONTROLS
// =====================================================

function releaseAllControls() {

  sendGameKey(
    "keyup",
    "ArrowLeft"
  );


  sendGameKey(
    "keyup",
    "ArrowRight"
  );


  sendGameKey(
    "keyup",
    "Space"
  );


  btnLeft?.classList.remove(
    "pressed"
  );


  btnRight?.classList.remove(
    "pressed"
  );


  btnJump?.classList.remove(
    "pressed"
  );

}


window.addEventListener(
  "blur",
  releaseAllControls
);


// =====================================================
// MAIN MENU MP3
// =====================================================

const menuBirthdayMusic =
  new Audio(
    "assets/audio/menu_birthday.mp3"
  );


menuBirthdayMusic.loop =
  true;


menuBirthdayMusic.preload =
  "auto";


menuBirthdayMusic.volume =
  0.75;


// =====================================================
// AUDIO VARIABLES
// =====================================================

let audioContext =
  null;


let masterGain =
  null;


let gameMusicGain =
  null;


let sfxGain =
  null;


let audioStarted =
  false;


let schedulerTimer =
  null;


let currentAudioScene =
  "menu";


let nextGameLoopTime =
  0;


// =====================================================
// USER SETTINGS
// =====================================================

let audioMusicEnabled =
  true;


let audioSfxEnabled =
  true;


let audioMusicVolume =
  1;


let audioSfxVolume =
  1;


// =====================================================
// CREATE AUDIO SYSTEM
// =====================================================

function createAudioSystem() {

  if (
    audioContext
  ) {

    return;

  }


  const AudioContextClass =

    window.AudioContext ||

    window.webkitAudioContext;


  if (
    !AudioContextClass
  ) {

    return;

  }


  audioContext =
    new AudioContextClass();


  masterGain =
    audioContext.createGain();


  masterGain.gain.value =
    0.78;


  masterGain.connect(
    audioContext.destination
  );


  gameMusicGain =
    audioContext.createGain();


  gameMusicGain.gain.value =
    0;


  gameMusicGain.connect(
    masterGain
  );


  sfxGain =
    audioContext.createGain();


  sfxGain.gain.value =
    0.52;


  sfxGain.connect(
    masterGain
  );


  refreshAudioMix();

}


// =====================================================
// AUDIO SETTINGS API
// Used by menu.js
// =====================================================

function setAudioPreferences(
  settings
) {

  if (
    typeof settings.musicEnabled ===
    "boolean"
  ) {

    audioMusicEnabled =
      settings.musicEnabled;

  }


  if (
    typeof settings.sfxEnabled ===
    "boolean"
  ) {

    audioSfxEnabled =
      settings.sfxEnabled;

  }


  if (
    Number.isFinite(
      settings.musicVolume
    )
  ) {

    audioMusicVolume =
      Math.max(
        0,
        Math.min(
          1,
          settings.musicVolume
        )
      );

  }


  if (
    Number.isFinite(
      settings.sfxVolume
    )
  ) {

    audioSfxVolume =
      Math.max(
        0,
        Math.min(
          1,
          settings.sfxVolume
        )
      );

  }


  refreshAudioMix();

}


// =====================================================
// AUDIO SCENES
//
// menu = Main Menu / Levels / Settings
// game = Level 1
// =====================================================

function setAudioScene(
  scene
) {

  if (
    scene !== "menu" &&
    scene !== "game"
  ) {

    return;

  }


  currentAudioScene =
    scene;


  if (
    scene === "menu"
  ) {

    /*
      Stop game music.
    */

    if (
      gameMusicGain &&
      audioContext
    ) {

      gameMusicGain.gain
        .setTargetAtTime(
          0,
          audioContext.currentTime,
          0.05
        );

    }


    /*
      Menu MP3 starts/restarts.
    */

    if (
      audioMusicEnabled
    ) {

      menuBirthdayMusic.volume =

        0.75 *
        audioMusicVolume;


      menuBirthdayMusic
        .play()
        .catch(
          () => {}
        );

    }

  }


  if (
    scene === "game"
  ) {

    /*
      Stop menu music immediately.
    */

    menuBirthdayMusic.pause();


    menuBirthdayMusic.currentTime =
      0;


    if (
      audioContext
    ) {

      nextGameLoopTime =
        audioContext.currentTime +
        0.05;

    }

  }


  refreshAudioMix();

}


// =====================================================
// MIX
// =====================================================

function refreshAudioMix() {

  /*
    Menu MP3
  */

  menuBirthdayMusic.volume =

    audioMusicEnabled

      ? 0.75 *
        audioMusicVolume

      : 0;


  if (
    !audioMusicEnabled
  ) {

    menuBirthdayMusic.pause();

  }

  else if (
    currentAudioScene === "menu" &&
    audioStarted
  ) {

    menuBirthdayMusic
      .play()
      .catch(
        () => {}
      );

  }


  if (
    !audioContext
  ) {

    return;

  }


  const now =
    audioContext.currentTime;


  /*
    Level 1 game music.
  */

  const gameVolume =

    currentAudioScene === "game" &&
    audioMusicEnabled

      ? 0.36 *
        audioMusicVolume

      : 0;


  /*
    Sound effects.
  */

  const effectsVolume =

    audioSfxEnabled

      ? 0.52 *
        audioSfxVolume

      : 0;


  gameMusicGain.gain
    .cancelScheduledValues(
      now
    );


  sfxGain.gain
    .cancelScheduledValues(
      now
    );


  gameMusicGain.gain
    .setTargetAtTime(
      gameVolume,
      now,
      0.06
    );


  sfxGain.gain
    .setTargetAtTime(
      effectsVolume,
      now,
      0.04
    );

}


// =====================================================
// START AUDIO
// =====================================================

function startGameAudio() {

  createAudioSystem();


  if (
    audioContext &&
    audioContext.state ===
    "suspended"
  ) {

    audioContext.resume();

  }


  /*
    First user interaction.
  */

  if (
    !audioStarted
  ) {

    audioStarted =
      true;


    startGameMusicScheduler();

  }


  /*
    If we're still in menu,
    play birthday MP3.
  */

  if (
    currentAudioScene === "menu" &&
    audioMusicEnabled
  ) {

    menuBirthdayMusic.volume =

      0.75 *
      audioMusicVolume;


    menuBirthdayMusic
      .play()
      .catch(
        () => {}
      );

  }


  refreshAudioMix();

}


// =====================================================
// MIDI HELPER
// =====================================================

function midiToFrequency(
  midi
) {

  return (

    440 *

    Math.pow(
      2,
      (
        midi -
        69
      ) /
      12
    )

  );

}


// =====================================================
// GENERIC SYNTH NOTE
// =====================================================

function scheduleNote(
  destination,
  frequency,
  startTime,
  duration,
  type,
  volume
) {

  if (
    !audioContext ||
    !destination
  ) {

    return;

  }


  const oscillator =
    audioContext.createOscillator();


  const gain =
    audioContext.createGain();


  oscillator.type =
    type;


  oscillator.frequency.setValueAtTime(
    frequency,
    startTime
  );


  gain.gain.setValueAtTime(
    0.0001,
    startTime
  );


  gain.gain.exponentialRampToValueAtTime(
    volume,
    startTime + 0.018
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + duration
  );


  oscillator.connect(
    gain
  );


  gain.connect(
    destination
  );


  oscillator.start(
    startTime
  );


  oscillator.stop(
    startTime +
    duration +
    0.05
  );

}


// =====================================================
// LEVEL 1 MUSIC
// =====================================================

const GAME_BPM =
  126;


const GAME_BEAT =
  60 /
  GAME_BPM;


const GAME_STEP =
  GAME_BEAT /
  2;


const GAME_MELODY = [

  72,
  76,
  79,
  76,

  74,
  77,
  81,
  77,

  72,
  76,
  79,
  84,

  81,
  79,
  77,
  74

];


const GAME_BASS = [

  48,
  null,
  48,
  null,

  50,
  null,
  50,
  null,

  45,
  null,
  45,
  null,

  43,
  null,
  47,
  null

];


const GAME_LOOP_DURATION =

  GAME_MELODY.length *
  GAME_STEP;


// =====================================================
// SCHEDULE LEVEL 1 LOOP
// =====================================================

function scheduleGameLoop(
  startTime
) {

  GAME_MELODY.forEach(
    (
      midi,
      index
    ) => {

      const time =

        startTime +

        index *
        GAME_STEP;


      scheduleNote(

        gameMusicGain,

        midiToFrequency(
          midi
        ),

        time,

        GAME_STEP *
        0.72,

        "square",

        0.045

      );

    }
  );


  GAME_BASS.forEach(
    (
      midi,
      index
    ) => {

      if (
        midi === null
      ) {

        return;

      }


      const time =

        startTime +

        index *
        GAME_STEP;


      scheduleNote(

        gameMusicGain,

        midiToFrequency(
          midi
        ),

        time,

        GAME_STEP *
        1.4,

        "triangle",

        0.055

      );

    }
  );

}


// =====================================================
// GAME MUSIC SCHEDULER
// =====================================================

function startGameMusicScheduler() {

  if (
    schedulerTimer
  ) {

    return;

  }


  if (
    audioContext
  ) {

    nextGameLoopTime =
      audioContext.currentTime +
      0.05;

  }


  function scheduler() {

    if (
      !audioContext ||
      audioContext.state !==
      "running"
    ) {

      return;

    }


    if (
      currentAudioScene !==
      "game"
    ) {

      return;

    }


    const now =
      audioContext.currentTime;


    if (
      nextGameLoopTime <
      now - 0.5
    ) {

      nextGameLoopTime =
        now +
        0.05;

    }


    while (
      nextGameLoopTime <
      now + 1
    ) {

      scheduleGameLoop(
        nextGameLoopTime
      );


      nextGameLoopTime +=
        GAME_LOOP_DURATION;

    }

  }


  scheduler();


  schedulerTimer =
    setInterval(
      scheduler,
      220
    );

}


// =====================================================
// JUMP SOUND
// =====================================================

function playJumpSound() {

  if (
    !audioContext ||
    !sfxGain ||
    currentAudioScene !== "game" ||
    !audioSfxEnabled
  ) {

    return;

  }


  const now =
    audioContext.currentTime;


  const oscillator =
    audioContext.createOscillator();


  const gain =
    audioContext.createGain();


  oscillator.type =
    "square";


  oscillator.frequency.setValueAtTime(
    320,
    now
  );


  oscillator.frequency.exponentialRampToValueAtTime(
    660,
    now + 0.13
  );


  gain.gain.setValueAtTime(
    0.0001,
    now
  );


  gain.gain.exponentialRampToValueAtTime(
    0.12,
    now + 0.012
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.17
  );


  oscillator.connect(
    gain
  );


  gain.connect(
    sfxGain
  );


  oscillator.start(
    now
  );


  oscillator.stop(
    now + 0.19
  );

}


// =====================================================
// STOMP SOUND
// =====================================================

function playStompSound() {

  if (
    !audioContext ||
    !sfxGain ||
    currentAudioScene !== "game" ||
    !audioSfxEnabled
  ) {

    return;

  }


  const now =
    audioContext.currentTime;


  const lowOscillator =
    audioContext.createOscillator();


  const lowGain =
    audioContext.createGain();


  lowOscillator.type =
    "triangle";


  lowOscillator.frequency.setValueAtTime(
    190,
    now
  );


  lowOscillator.frequency.exponentialRampToValueAtTime(
    80,
    now + 0.16
  );


  lowGain.gain.setValueAtTime(
    0.16,
    now
  );


  lowGain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.20
  );


  lowOscillator.connect(
    lowGain
  );


  lowGain.connect(
    sfxGain
  );


  lowOscillator.start(
    now
  );


  lowOscillator.stop(
    now + 0.22
  );


  const popOscillator =
    audioContext.createOscillator();


  const popGain =
    audioContext.createGain();


  popOscillator.type =
    "square";


  popOscillator.frequency.setValueAtTime(
    720,
    now
  );


  popOscillator.frequency.exponentialRampToValueAtTime(
    350,
    now + 0.10
  );


  popGain.gain.setValueAtTime(
    0.08,
    now
  );


  popGain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.12
  );


  popOscillator.connect(
    popGain
  );


  popGain.connect(
    sfxGain
  );


  popOscillator.start(
    now
  );


  popOscillator.stop(
    now + 0.14
  );

}


// =====================================================
// DETECT JUMP
// =====================================================

const fofoCharacter =
  document.getElementById(
    "fofo"
  );


let wasJumpAnimation =
  false;


if (
  fofoCharacter
) {

  const jumpObserver =
    new MutationObserver(
      () => {

        const source =

          fofoCharacter
            .getAttribute(
              "src"
            ) ||
          "";


        const isJump =

          source.includes(
            "jump_"
          );


        if (
          isJump &&
          !wasJumpAnimation
        ) {

          startGameAudio();


          playJumpSound();

        }


        wasJumpAnimation =
          isJump;

      }
    );


  jumpObserver.observe(

    fofoCharacter,

    {

      attributes:
        true,

      attributeFilter:
        ["src"]

    }

  );

}


// =====================================================
// DETECT STOMP
// =====================================================

const gameMessage =
  document.getElementById(
    "message"
  );


let previousMessage =
  "";


if (
  gameMessage
) {

  const messageObserver =
    new MutationObserver(
      () => {

        const currentMessage =

          gameMessage
            .textContent
            .trim();


        if (
          currentMessage ===
          previousMessage
        ) {

          return;

        }


        previousMessage =
          currentMessage;


        const groundEnemy =

          currentMessage.includes(
            "Monster defeated!"
          );


        const pipeEnemy =

          currentMessage.includes(
            "Pipe monster defeated!"
          );


        if (
          groundEnemy ||
          pipeEnemy
        ) {

          startGameAudio();


          playStompSound();

        }

      }
    );


  messageObserver.observe(

    gameMessage,

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


// =====================================================
// FIRST USER INTERACTION
// Browsers don't allow autoplay with sound before this.
// =====================================================

function firstAudioInteraction() {

  startGameAudio();

}


document.addEventListener(
  "pointerdown",
  firstAudioInteraction,
  {
    once:
      true
  }
);


document.addEventListener(
  "keydown",
  firstAudioInteraction,
  {
    once:
      true
  }
);


// =====================================================
// PAGE VISIBILITY
// =====================================================

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      menuBirthdayMusic.pause();


      if (
        audioContext
      ) {

        audioContext.suspend();

      }

    }

    else {

      if (
        audioContext
      ) {

        audioContext.resume();

      }


      if (
        currentAudioScene === "menu" &&
        audioStarted &&
        audioMusicEnabled
      ) {

        menuBirthdayMusic
          .play()
          .catch(
            () => {}
          );

      }

    }

  }
);


// =====================================================
// SAFETY
// =====================================================

window.addEventListener(
  "beforeunload",
  () => {

    menuBirthdayMusic.pause();

  }
);