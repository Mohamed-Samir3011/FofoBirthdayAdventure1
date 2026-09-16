// =========================================================
// FOFO BIRTHDAY ADVENTURE
// LEVEL 3 — MOONLIGHT ECHO
//
// Fully redesigned gameplay:
// - New 3D world art
// - 11 Memory Notes
// - Echo Sequence puzzle
// - Revealing bridge
// - Pulse gates
// - Bounce pad
// - Moving resonance platforms
// - New enemies
// - Memory story events
// - Headphone portal
// - JBL black multi-angle gift reveal
// =========================================================


// =========================================================
// DOM
// =========================================================

const game =
  document.getElementById("game");

const world =
  document.getElementById("world");

const messageBox =
  document.getElementById("messageBox");

const btnLeft =
  document.getElementById("btnLeft");

const btnRight =
  document.getElementById("btnRight");

const btnJump =
  document.getElementById("btnJump");


const heartImages = [
  document.getElementById("heart1"),
  document.getElementById("heart2"),
  document.getElementById("heart3")
];


const counterImage =
  document.getElementById("counterImage");


const finaleOverlay =
  document.getElementById("finaleOverlay");

const finaleIntro =
  document.getElementById("finaleIntro");

const revealGiftButton =
  document.getElementById("revealGiftButton");

const giftPage =
  document.getElementById("giftPage");

const productImage =
  document.getElementById("productImage");

const productPrev =
  document.getElementById("productPrev");

const productNext =
  document.getElementById("productNext");

const productDots =
  document.getElementById("productDots");

const giftStoryButton =
  document.getElementById("giftStoryButton");

const storyPage =
  document.getElementById("storyPage");

const backToGiftButton =
  document.getElementById("backToGiftButton");

const continueButton =
  document.getElementById("continueButton");


// =========================================================
// WORLD / PHYSICS
// =========================================================

const WORLD_WIDTH =
  9700;

const GROUND_TOP =
  112;

const SPEED =
  2.52;

const GRAVITY =
  0.255;

const JUMP_POWER =
  10.95;

const MAX_FALL_SPEED =
  -6.8;

const GROUND_VISUAL_LIFT =
  16;

const PLATFORM_VISUAL_LIFT =
  27;


const HITBOX_WIDTH =
  52;

const HITBOX_HEIGHT =
  92;

const HITBOX_OFFSET_X =
  18;


world.style.width =
  WORLD_WIDTH + "px";



// =====================================================
// MOBILE / REFRESH-RATE NORMALIZATION
// =====================================================

const GAME_REFERENCE_FPS =
  60;

let frameFactor =
  1;

let lastFrameTimestamp =
  0;


function updateFrameFactor(
  timestamp
) {

  if (
    !lastFrameTimestamp
  ) {

    lastFrameTimestamp =
      timestamp;

    frameFactor =
      1;

    return;
  }


  const delta =
    Math.min(
      90,
      Math.max(
        4,
        timestamp -
        lastFrameTimestamp
      )
    );


  lastFrameTimestamp =
    timestamp;


  /*
    At 60 FPS frameFactor = 1.
    At 30 FPS frameFactor ≈ 2.
    At 20 FPS frameFactor ≈ 3.
    This keeps movement/game timing much closer between PC and phone.
  */
  frameFactor =
    Math.min(
      5.4,
      Math.max(
        0.25,
        delta /
        (1000 / GAME_REFERENCE_FPS)
      )
    );
}


// =====================================================
// MOBILE LANDSCAPE VERTICAL CAMERA
// =====================================================

let mobileCameraYOffset =
  0;


function getMobileCameraTargetY(
  viewportElement
) {

  const viewportHeight =
    viewportElement.clientHeight ||
    window.innerHeight ||
    600;


  const isShortLandscape =
    viewportHeight < 620 &&
    window.innerWidth > viewportHeight;


  if (
    !isShortLandscape
  ) {

    return 0;
  }


  /*
    Keep high platforms visible without shrinking the whole world.
    This preserves the same horizontal visual speed as desktop.
  */
  const preferredPlayerHeightFromBottom =
    viewportHeight * 0.52;


  const target =
    playerY -
    preferredPlayerHeightFromBottom;


  return Math.max(
    0,
    Math.min(
      viewportHeight * 0.78,
      target
    )
  );
}


function updateMobileCameraY(
  viewportElement
) {

  const target =
    getMobileCameraTargetY(
      viewportElement
    );


  const smoothing =
    Math.min(
      1,
      0.11 *
      Math.max(
        0.6,
        frameFactor
      )
    );


  mobileCameraYOffset +=
    (
      target -
      mobileCameraYOffset
    ) *
    smoothing;


  if (
    Math.abs(
      mobileCameraYOffset
    ) < 0.15
  ) {

    mobileCameraYOffset =
      0;
  }


  return mobileCameraYOffset;
}


// =========================================================
// PLAYER STATE
// =========================================================

let playerX =
  125;

let playerY =
  GROUND_TOP;

let previousPlayerY =
  GROUND_TOP;

let velocityY =
  0;

let velocityBeforeCollision =
  0;

let jumping =
  false;

let facingRight =
  true;

let health =
  3;

let invincible =
  false;

let invincibleUntil =
  0;

let gameFinished =
  false;


let respawnX =
  125;

let respawnY =
  GROUND_TOP;


let standingSurface =
  null;

let standingMovingPlatform =
  null;


let jumpHoldFrames =
  0;

const MAX_JUMP_HOLD =
  12;


const keys = {
  left: false,
  right: false,
  jump: false
};


// =========================================================
// PLAYER ART
// =========================================================

const idleImage =
  "assets/fofo_idle.png";


const runFrames = [
  "assets/run_1.png",
  "assets/run_2.png",
  "assets/run_3.png",
  "assets/run_4.png",
  "assets/run_5.png",
  "assets/run_6.png"
];


const jumpFrames = [
  "assets/jump_1.png",
  "assets/jump_2.png",
  "assets/jump_3.png",
  "assets/jump_4.png",
  "assets/jump_5.png",
  "assets/jump_6.png"
];


const POSES = {

  idle: {
    scale: 1,
    visualOffset: -31
  },

  run: {
    scale: .92,
    visualOffset: -34
  },

  jump: {
    scale: .95,
    visualOffset: -15
  }

};


let currentPose =
  "idle";

let runFrame =
  0;

let lastRunFrameTime =
  0;


const fofo =
  document.createElement("img");


fofo.className =
  "player";

fofo.src =
  idleImage;

fofo.draggable =
  false;


world.appendChild(
  fofo
);


// =========================================================
// ASSETS
// =========================================================

const ASSETS = {

  ground:
    "assets/level3_world/platform_long.png",

  platform:
    "assets/level3_world/platform_short.png",

  moving:
    "assets/level3_world/moving_platform.png",

  bounce:
    "assets/level3_world/bounce_pad.png",

  memory:
    "assets/level3_world/memory_note.png",

  portal:
    "assets/level3_world/portal.png",

  checkpoint:
    "assets/level3_world/checkpoint.png",

  enemyGround:
    "assets/level3_world/enemy_ground.png",

  enemyFlying:
    "assets/level3_world/enemy_flying.png"
};


// =========================================================
// AUDIO SETTINGS
// =========================================================

function readBool(
  key,
  fallback
) {

  const value =
    localStorage.getItem(key);


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
  fallback
) {

  const raw =
    localStorage.getItem(key);


  if (
    raw === null
  ) {

    return fallback;

  }


  const value =
    Number(raw);


  if (
    !Number.isFinite(value)
  ) {

    return fallback;

  }


  return Math.max(
    0,
    Math.min(
      1,
      value / 100
    )
  );

}


let musicEnabled =
  readBool(
    "fofoMusicEnabled",
    true
  );


let sfxEnabled =
  readBool(
    "fofoSfxEnabled",
    true
  );


let musicVolume =
  readVolume(
    "fofoMusicVolume",
    .86
  );


let sfxVolume =
  readVolume(
    "fofoSfxVolume",
    .90
  );


// =========================================================
// AUDIO
// =========================================================

const AUDIO = {

  music:
    new Audio(
      "assets/level3_audio/modern-classical-piano-513745.mp3"
    ),

  jump:
    new Audio(
      "assets/level3_audio/jump.wav"
    ),

  memory:
    new Audio(
      "assets/level3_audio/memory_collect.wav"
    ),

  golden:
    new Audio(
      "assets/level3_audio/golden_memory.wav"
    ),

  echoPad:
    new Audio(
      "assets/level3_audio/echo_pad.wav"
    ),

  puzzleSuccess:
    new Audio(
      "assets/level3_audio/puzzle_success.wav"
    ),

  puzzleReset:
    new Audio(
      "assets/level3_audio/puzzle_reset.wav"
    ),

  bridge:
    new Audio(
      "assets/level3_audio/bridge_reveal.wav"
    ),

  bounce:
    new Audio(
      "assets/level3_audio/bounce.wav"
    ),

  gateOpen:
    new Audio(
      "assets/level3_audio/gate_open.wav"
    ),

  gateClose:
    new Audio(
      "assets/level3_audio/gate_close.wav"
    ),

  enemy:
    new Audio(
      "assets/level3_audio/enemy_defeat.wav"
    ),

  death:
    new Audio(
      "assets/level3_audio/death.wav"
    ),

  checkpoint:
    new Audio(
      "assets/level3_audio/checkpoint.wav"
    ),

  portalUnlock:
    new Audio(
      "assets/level3_audio/portal_unlock.wav"
    ),

  portalEnter:
    new Audio(
      "assets/level3_audio/portal_enter.wav"
    ),

  complete:
    new Audio(
      "assets/level3_audio/level_complete.wav"
    ),

  gift:
    new Audio(
      "assets/level3_audio/gift_reveal.wav"
    ),

  story:
    new Audio(
      "assets/level3_audio/story_open.wav"
    )

};


AUDIO.music.loop =
  true;

AUDIO.music.preload =
  "auto";


Object.entries(
  AUDIO
).forEach(
  ([name, audio]) => {

    if (
      name !== "music"
    ) {

      audio.preload =
        "auto";

    }

  }
);


let audioStarted =
  false;


function syncAudioVolumes() {

  AUDIO.music.volume =
    musicEnabled
      ? Math.min(
          1,
          musicVolume * .96
        )
      : 0;

}


function startAudio() {

  if (
    audioStarted
  ) {

    return;

  }


  audioStarted =
    true;


  syncAudioVolumes();


  if (
    musicEnabled
  ) {

    AUDIO.music
      .play()
      .catch(
        () => {}
      );

  }

}


function playSfx(
  name,
  gain = 1
) {

  /*
    Level 3 audio direction:
    ONLY these three gameplay SFX are audible.
    Everything else is intentionally silent so the piano
    stays the main focus.
  */

  const allowedSfx =
    new Set([
      "jump",
      "enemy",
      "death"
    ]);


  if (
    !audioStarted ||
    !sfxEnabled ||
    !allowedSfx.has(name)
  ) {

    return;

  }


  const template =
    AUDIO[name];


  if (
    !template
  ) {

    return;

  }


  const sound =
    template.cloneNode(
      true
    );


  const perSoundGain = {

    jump: .16,

    enemy: .34,

    death: .32

  };


  sound.volume =
    Math.max(
      0,
      Math.min(
        1,
        sfxVolume *
        (perSoundGain[name] || .18) *
        gain
      )
    );


  sound
    .play()
    .catch(
      () => {}
    );

}


document.addEventListener(
  "pointerdown",
  startAudio,
  {
    once: true
  }
);


document.addEventListener(
  "keydown",
  startAudio,
  {
    once: true
  }
);


// =========================================================
// ARRAYS / GAME STATE
// =========================================================

const surfaces =
  [];

const movingPlatforms =
  [];

const soundGates =
  [];

const notes =
  [];

const groundEnemies =
  [];

const flyingEnemies =
  [];

const checkpoints =
  [];

const memoryEvents =
  [];

const bridgeSurfaces =
  [];

const echoPads =
  [];


const TOTAL_NOTES =
  11;

let collectedNotes =
  0;


let portal =
  null;

let finaleStarted =
  false;


// =========================================================
// ECHO PUZZLE
// =========================================================

const ECHO_SEQUENCE =
  [2, 1, 3];


let echoProgress =
  [];

let echoPuzzleSolved =
  false;


// =========================================================
// HELPERS
// =========================================================

function overlap(
  a,
  b
) {

  return !(

    a.right <
    b.left ||

    a.left >
    b.right ||

    a.top <
    b.bottom ||

    a.bottom >
    b.top

  );

}


function playerRect() {

  return {

    left:
      playerX +
      HITBOX_OFFSET_X,

    right:
      playerX +
      HITBOX_OFFSET_X +
      HITBOX_WIDTH,

    bottom:
      playerY,

    top:
      playerY +
      HITBOX_HEIGHT

  };

}


function createImage(
  src,
  className,
  x,
  bottom,
  width,
  height
) {

  const image =
    document.createElement(
      "img"
    );


  image.src =
    src;

  image.className =
    `world-asset ${className}`;

  image.draggable =
    false;


  image.style.left =
    x + "px";

  image.style.bottom =
    bottom + "px";

  image.style.width =
    width + "px";

  image.style.height =
    height + "px";


  world.appendChild(
    image
  );


  return image;

}


function createDiv(
  className,
  x,
  bottom,
  width = null,
  height = null
) {

  const element =
    document.createElement(
      "div"
    );


  element.className =
    className;


  element.style.left =
    x + "px";

  element.style.bottom =
    bottom + "px";


  if (
    width !== null
  ) {

    element.style.width =
      width + "px";

  }


  if (
    height !== null
  ) {

    element.style.height =
      height + "px";

  }


  world.appendChild(
    element
  );


  return element;

}


// =========================================================
// BACKGROUND BUILD
// =========================================================

function buildBackground() {

  for (
    let x = 120;
    x < WORLD_WIDTH;
    x += 250
  ) {

    const star =
      createDiv(
        "star",
        x,
        290 +
        Math.abs(
          (x * 13) %
          260
        ),
        5,
        5
      );


    star.style.animationDelay =
      -(
        (x % 8) *
        .21
      ) + "s";

  }


  for (
    let x = -200;
    x < WORLD_WIDTH;
    x += 820
  ) {

    createDiv(
      "wave-horizon",
      x,
      90 +
      (x % 3) * 15,
      720,
      160
    );

  }


  const titles = [

    [
      300,
      435,
      "THE LISTENING PATH"
    ],

    [
      1680,
      435,
      "ECHO SEQUENCE"
    ],

    [
      3450,
      435,
      "PULSE HALL"
    ],

    [
      5200,
      435,
      "RESONANCE LIFT"
    ],

    [
      6550,
      435,
      "THE WORDS I KEPT"
    ],

    [
      8300,
      435,
      "THE LAST FREQUENCY"
    ]

  ];


  titles.forEach(
    ([x, bottom, text]) => {

      const title =
        createDiv(
          "area-title",
          x,
          bottom
        );


      title.textContent =
        text;

    }
  );

}


// =========================================================
// GROUND / PLATFORMS
// =========================================================

function addGround(
  x,
  width
) {

  /*
    IMPORTANT:
    The visible ground is clipped to exactly the same width
    as the collision surface. This prevents artwork from
    extending past the solid area and looking walkable.
  */

  const tileWidth =
    530;

  const tileHeight =
    185;

  const overlapAmount =
    32;

  const strip =
    document.createElement("div");

  strip.className =
    "ground-strip";

  strip.style.left =
    x + "px";

  strip.style.width =
    width + "px";

  world.appendChild(
    strip
  );

  let localX =
    -14;

  while (
    localX < width
  ) {

    const tile =
      document.createElement("img");

    tile.src =
      ASSETS.ground;

    tile.className =
      "world-asset ground-platform";

    tile.draggable =
      false;

    tile.style.left =
      localX + "px";

    tile.style.width =
      tileWidth + "px";

    tile.style.height =
      tileHeight + "px";

    strip.appendChild(
      tile
    );

    localX +=
      tileWidth -
      overlapAmount;

  }

  surfaces.push({

    type:
      "ground",

    x,

    width,

    top:
      GROUND_TOP

  });

}


function addPlatform(
  x,
  bottom,
  width = 210
) {

  const height =
    Math.round(
      width *
      .46
    );


  const element =
    createImage(
      ASSETS.platform,
      "float-platform",
      x,
      bottom,
      width,
      height
    );


  const surface = {

    type:
      "platform",

    x:
      x + 12,

    width:
      width - 24,

    top:
      bottom +
      height -
      13,

    element

  };


  surfaces.push(
    surface
  );


  return surface;

}


function addMovingPlatform(
  data
) {

  const height =
    Math.round(
      data.width *
      .245
    );


  const element =
    createImage(
      ASSETS.moving,
      "moving-platform",
      data.x,
      data.y,
      data.width,
      height
    );


  const platform = {

    type:
      "moving",

    x:
      data.x,

    y:
      data.y,

    width:
      data.width,

    height,

    top:
      data.y +
      height -
      9,

    axis:
      data.axis,

    min:
      data.min,

    max:
      data.max,

    speed:
      data.speed,

    direction:
      data.direction ||
      1,

    previousX:
      data.x,

    previousY:
      data.y,

    element

  };


  movingPlatforms.push(
    platform
  );


  surfaces.push(
    platform
  );


  return platform;

}


function addBouncePad(
  x,
  bottom
) {

  const width =
    145;

  const height =
    112;


  const element =
    createImage(
      ASSETS.bounce,
      "bounce-pad",
      x,
      bottom,
      width,
      height
    );


  surfaces.push({

    type:
      "bounce",

    x:
      x + 12,

    width:
      width - 24,

    top:
      bottom +
      height -
      16,

    element

  });

}


// =========================================================
// NOTES
// =========================================================

function addMemoryNote(
  x,
  bottom,
  golden = false
) {

  const element =
    createImage(
      ASSETS.memory,
      golden
        ? "memory-note golden"
        : "memory-note",
      x,
      bottom,
      74,
      72
    );


  notes.push({

    x,

    bottom,

    width:
      74,

    height:
      72,

    golden,

    collected:
      false,

    element

  });

}


// =========================================================
// ENEMIES
// =========================================================

function addGroundEnemy(
  x,
  min,
  max
) {

  const bottom =
    91;


  const width =
    100;

  const height =
    68;


  const element =
    createImage(
      ASSETS.enemyGround,
      "enemy-ground",
      x,
      bottom,
      width,
      height
    );


  groundEnemies.push({

    x,

    min,

    max,

    bottom,

    width,

    height,

    speed:
      .55,

    direction:
      1,

    dead:
      false,

    element

  });

}


function addFlyingEnemy(
  x,
  bottom,
  range,
  phase = 0
) {

  const width =
    92;

  const height =
    81;


  const element =
    createImage(
      ASSETS.enemyFlying,
      "enemy-flying",
      x,
      bottom,
      width,
      height
    );


  flyingEnemies.push({

    baseX:
      x,

    baseBottom:
      bottom,

    x,

    previousX:
      x,

    bottom,

    range,

    phase,

    width,

    height,

    direction:
      1,

    dead:
      false,

    element

  });

}


// =========================================================
// CHECKPOINT
// =========================================================

function addCheckpoint(
  triggerX,
  spawnX
) {

  const element =
    createImage(
      ASSETS.checkpoint,
      "checkpoint",
      triggerX - 40,
      88,
      92,
      160
    );


  checkpoints.push({

    triggerX,

    spawnX,

    spawnY:
      GROUND_TOP,

    reached:
      false,

    element

  });

}


// =========================================================
// SOUND GATE
// =========================================================

function addSoundGate(
  x,
  bottom,
  cycle,
  openTime,
  phase = 0
) {

  const gate =
    createDiv(
      "sound-gate",
      x,
      bottom,
      70,
      215
    );


  gate.innerHTML = `
    <div class="gate-cap top"></div>
    <div class="gate-wave">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="gate-cap bottom"></div>
  `;


  soundGates.push({

    x,

    bottom,

    width:
      70,

    height:
      215,

    cycle,

    openTime,

    phase,

    isOpen:
      false,

    previousOpen:
      false,

    element:
      gate

  });

}


// =========================================================
// ECHO PUZZLE
// =========================================================

function buildEchoPuzzle() {

  const panel =
    createDiv(
      "puzzle-panel",
      1700,
      265,
      540
    );


  panel.innerHTML = `
    <small>REMEMBER THE ORDER</small>
    <div class="puzzle-pattern">♥ → ♪ → ✦</div>
  `;


  const padData = [

    {
      value: 1,
      symbol: "♪",
      x: 1740
    },

    {
      value: 2,
      symbol: "♥",
      x: 1930
    },

    {
      value: 3,
      symbol: "✦",
      x: 2120
    }

  ];


  padData.forEach(
    data => {

      const element =
        createDiv(
          "echo-pad",
          data.x,
          106,
          110,
          58
        );


      element.textContent =
        data.symbol;


      echoPads.push({

        value:
          data.value,

        x:
          data.x,

        width:
          110,

        wasInside:
          false,

        element

      });

    }
  );


  /*
    Hidden bridge.
    Collision is added ONLY after puzzle success.
  */

  const bridgeData = [

    [
      2390,
      155,
      210
    ],

    [
      2615,
      220,
      205
    ],

    [
      2835,
      160,
      210
    ],

    [
      3060,
      235,
      210
    ]

  ];


  bridgeData.forEach(
    ([x, bottom, width]) => {

      const height =
        Math.round(
          width *
          .46
        );


      const element =
        createImage(
          ASSETS.platform,
          "float-platform bridge-piece",
          x,
          bottom,
          width,
          height
        );


      bridgeSurfaces.push({

        type:
          "platform",

        x:
          x + 12,

        width:
          width - 24,

        top:
          bottom +
          height -
          13,

        element

      });

    }
  );

}


function activateEchoPad(
  pad
) {

  if (
    echoPuzzleSolved
  ) {

    return;

  }


  pad.element.classList.remove(
    "active"
  );


  void pad.element.offsetWidth;


  pad.element.classList.add(
    "active"
  );


  playSfx(
    "echoPad",
    .8
  );


  echoProgress.push(
    pad.value
  );


  const currentIndex =
    echoProgress.length -
    1;


  if (
    echoProgress[
      currentIndex
    ] !==
    ECHO_SEQUENCE[
      currentIndex
    ]
  ) {

    echoProgress =
      [];


    playSfx(
      "puzzleReset",
      .7
    );


    showMessage(
      "The echo faded… remember: ♥ → ♪ → ✦",
      1500
    );


    return;

  }


  if (
    echoProgress.length ===
    ECHO_SEQUENCE.length
  ) {

    solveEchoPuzzle();

  }

}


function solveEchoPuzzle() {

  if (
    echoPuzzleSolved
  ) {

    return;

  }


  echoPuzzleSolved =
    true;


  echoPads.forEach(
    pad => {

      pad.element.classList.add(
        "solved"
      );

    }
  );


  bridgeSurfaces.forEach(
    (
      surface,
      index
    ) => {

      setTimeout(
        () => {

          surface.element.classList.add(
            "revealed"
          );


          surfaces.push(
            surface
          );


          if (
            index === 0
          ) {

            playSfx(
              "bridge",
              .9
            );

          }

        },

        index *
        170
      );

    }
  );


  playSfx(
    "puzzleSuccess"
  );


  showMessage(
    "You remembered the little pattern. The path remembers you too. ♡",
    2300
  );

}


function updateEchoPuzzle() {

  if (
    echoPuzzleSolved
  ) {

    return;

  }


  const center =
    playerX +
    HITBOX_OFFSET_X +
    HITBOX_WIDTH / 2;


  echoPads.forEach(
    pad => {

      const inside =

        center >
        pad.x &&

        center <
        pad.x +
        pad.width &&

        playerY <=
        GROUND_TOP +
        9;


      if (
        inside &&
        !pad.wasInside
      ) {

        activateEchoPad(
          pad
        );

      }


      pad.wasInside =
        inside;

    }
  );

}


// =========================================================
// PORTAL
// =========================================================

function addPortal(
  x
) {

  const width =
    290;

  const height =
    318;


  const element =
    createImage(
      ASSETS.portal,
      "portal",
      x,
      66,
      width,
      height
    );


  portal = {

    x,

    width,

    unlocked:
      false,

    element

  };

}


function updatePortal() {

  if (
    !portal
  ) {

    return;

  }


  const shouldUnlock =

    collectedNotes >=
    TOTAL_NOTES &&

    echoPuzzleSolved;


  if (
    shouldUnlock &&
    !portal.unlocked
  ) {

    portal.unlocked =
      true;


    portal.element.classList.add(
      "unlocked"
    );


    playSfx(
      "portalUnlock"
    );


    showMessage(
      "The final frequency found you. The portal is open. ♡",
      2300
    );

  }

}


// =========================================================
// MEMORY EVENTS
// =========================================================

function addMemoryEvent(
  x,
  text
) {

  memoryEvents.push({

    x,

    text,

    triggered:
      false

  });

}


function updateMemoryEvents() {

  memoryEvents.forEach(
    event => {

      if (
        event.triggered ||
        playerX <
        event.x
      ) {

        return;

      }


      event.triggered =
        true;


      showMessage(
        event.text,
        1450
      );

    }
  );

}


// =========================================================
// MAP
// =========================================================

buildBackground();


// ---------------------------------------------------------
// AREA 1 — THE LISTENING PATH
// ---------------------------------------------------------

addGround(
  0,
  1650
);


addPlatform(
  430,
  190,
  220
);


addMemoryNote(
  515,
  300
);


addGroundEnemy(
  780,
  700,
  980
);


addPlatform(
  1040,
  250,
  195
);


addMemoryNote(
  1100,
  350
);


addCheckpoint(
  1460,
  1390
);


// ---------------------------------------------------------
// AREA 2 — ECHO SEQUENCE
// ---------------------------------------------------------

addGround(
  1650,
  700
);


buildEchoPuzzle();


addMemoryNote(
  2170,
  190
);


/*
  Memory note above the hidden bridge.
*/

addMemoryNote(
  2875,
  330
);


// ---------------------------------------------------------
// AREA 3 — PULSE HALL
// ---------------------------------------------------------

addGround(
  3325,
  1750
);


addSoundGate(
  3590,
  108,
  2900,
  1250,
  0
);


addPlatform(
  3740,
  220,
  210
);


addMemoryNote(
  3810,
  315
);


addFlyingEnemy(
  4070,
  320,
  105,
  .7
);


addPlatform(
  4230,
  175,
  195
);


addSoundGate(
  4510,
  108,
  3100,
  1280,
  950
);


addMemoryNote(
  4630,
  175
);


addCheckpoint(
  4950,
  4880
);


// ---------------------------------------------------------
// AREA 4 — RESONANCE LIFT
// ---------------------------------------------------------

addGround(
  5075,
  450
);


addBouncePad(
  5250,
  92
);


addMovingPlatform({

  x:
    5470,

  y:
    175,

  width:
    240,

  axis:
    "y",

  min:
    150,

  max:
    285,

  speed:
    .63

});


addMovingPlatform({

  x:
    5750,

  y:
    300,

  width:
    235,

  axis:
    "x",

  min:
    5680,

  max:
    5835,

  speed:
    .60,

  direction:
    -1

});


addMemoryNote(
  5830,
  390
);


addMovingPlatform({

  x:
    6050,

  y:
    190,

  width:
    240,

  axis:
    "y",

  min:
    170,

  max:
    315,

  speed:
    .66

});


addGround(
  6320,
  1750
);


addMemoryNote(
  6450,
  185
);


addCheckpoint(
  6490,
  6400
);


// ---------------------------------------------------------
// AREA 5 — THE WORDS I KEPT
// ---------------------------------------------------------

addMemoryEvent(
  6640,
  "It was just one passing sentence…"
);


addMemoryEvent(
  6920,
  "You probably thought I forgot it."
);


addMemoryEvent(
  7210,
  "But the little things you say never feel little to me."
);


addPlatform(
  6750,
  230,
  210
);


addMemoryNote(
  6820,
  325
);


addGroundEnemy(
  7140,
  7040,
  7330
);


addFlyingEnemy(
  7520,
  310,
  115,
  2.1
);


addPlatform(
  7700,
  255,
  205
);


addMemoryNote(
  7770,
  355
);


// ---------------------------------------------------------
// AREA 6 — THE LAST FREQUENCY
// ---------------------------------------------------------

/*
  Final section now has a continuous solid ground.
  The moving platform / bounce-pad challenge still exists above it,
  but the visible floor is also a real collision surface.
*/

addGround(
  8070,
  WORLD_WIDTH - 8070
);


addSoundGate(
  8210,
  108,
  2700,
  1130,
  500
);


addMovingPlatform({

  x:
    8410,

  y:
    190,

  width:
    245,

  axis:
    "y",

  min:
    170,

  max:
    300,

  speed:
    .67

});


addBouncePad(
  8660,
  92
);


addMemoryNote(
  8780,
  360,
  true
);


addPortal(
  9180
);


// =========================================================
// HUD
// =========================================================

function updateHUD(
  damagedIndex = -1
) {

  const safeHealth =
    Math.max(
      0,
      Math.min(
        3,
        health
      )
    );

  /*
    IMPORTANT:
    The generated image files are visually named backwards:

    heart_empty.png  = the bright RED / FULL heart
    heart_filled.png = the pale EMPTY heart

    So the mapping below is intentionally reversed.

    3 HP = red, red, red
    2 HP = red, red, empty
    1 HP = red, empty, empty
  */

  heartImages.forEach(
    (
      image,
      index
    ) => {

      image.src =

        index <
        safeHealth

          ? "assets/level3_ui/heart_empty.png"

          : "assets/level3_ui/heart_filled.png";


      if (
        index ===
        damagedIndex
      ) {

        image.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(.55)" },
            { transform: "scale(1.1)" },
            { transform: "scale(1)" }
          ],
          {
            duration: 350
          }
        );

      }

    }
  );


  const value =
    Math.max(
      0,
      Math.min(
        11,
        collectedNotes
      )
    );


  counterImage.src =
    `assets/level3_ui/counter_${value}.png`;


  counterImage.alt =
    `${value} of 11`;

}


function animateCounter() {

  counterImage.classList.remove(
    "pop"
  );


  void counterImage.offsetWidth;


  counterImage.classList.add(
    "pop"
  );

}


// =========================================================
// MESSAGE
// =========================================================

let messageTimer =
  null;


function showMessage(
  text,
  duration = 1300
) {

  clearTimeout(
    messageTimer
  );


  messageBox.textContent =
    text;


  messageBox.classList.remove(
    "hidden"
  );


  messageTimer =
    setTimeout(
      () => {

        messageBox.classList.add(
          "hidden"
        );

      },

      duration
    );

}


// =========================================================
// PLAYER RENDER
// =========================================================

function setPlayerImage(
  src
) {

  if (
    fofo.getAttribute(
      "src"
    ) !==
    src
  ) {

    fofo.src =
      src;

  }

}


function renderPlayer() {

  const pose =
    POSES[
      currentPose
    ];

  let lift =
    GROUND_VISUAL_LIFT;

  if (
    !jumping &&
    standingSurface &&
    standingSurface.type !==
    "ground"
  ) {

    lift =
      PLATFORM_VISUAL_LIFT;

  }

  fofo.style.left =
    playerX + "px";

  fofo.style.bottom =

    playerY +
    pose.visualOffset +
    lift +
    "px";

  fofo.style.transform =

    facingRight

      ? `scale(${pose.scale})`

      : `scaleX(${-pose.scale}) scaleY(${pose.scale})`;

}


// =========================================================
// INPUT
// =========================================================

function startJump() {

  if (
    gameFinished ||
    jumping
  ) {

    return;

  }


  standingSurface =
    null;


  standingMovingPlatform =
    null;


  velocityY =
    JUMP_POWER;


  jumping =
    true;


  jumpHoldFrames =
    MAX_JUMP_HOLD;


  playSfx(
    "jump"
  );

}


window.addEventListener(
  "keydown",
  event => {

    startAudio();


    if (
      event.code ===
      "ArrowLeft" ||
      event.code ===
      "KeyA"
    ) {

      keys.left =
        true;

    }


    if (
      event.code ===
      "ArrowRight" ||
      event.code ===
      "KeyD"
    ) {

      keys.right =
        true;

    }


    if (
      event.code ===
      "ArrowUp" ||
      event.code ===
      "Space" ||
      event.code ===
      "KeyW"
    ) {

      event.preventDefault();


      if (
        !keys.jump
      ) {

        keys.jump =
          true;


        startJump();

      }

    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    if (
      event.code ===
      "ArrowLeft" ||
      event.code ===
      "KeyA"
    ) {

      keys.left =
        false;

    }


    if (
      event.code ===
      "ArrowRight" ||
      event.code ===
      "KeyD"
    ) {

      keys.right =
        false;

    }


    if (
      event.code ===
      "ArrowUp" ||
      event.code ===
      "Space" ||
      event.code ===
      "KeyW"
    ) {

      keys.jump =
        false;


      jumpHoldFrames =
        0;

    }

  }
);


function bindButton(
  button,
  key
) {

  let active =
    false;


  function press(
    event
  ) {

    event.preventDefault();


    startAudio();


    if (
      active
    ) {

      return;

    }


    active =
      true;


    keys[key] =
      true;


    button.classList.add(
      "pressed"
    );


    if (
      key ===
      "jump"
    ) {

      startJump();

    }

  }


  function release(
    event
  ) {

    if (
      event
    ) {

      event.preventDefault();

    }


    active =
      false;


    keys[key] =
      false;


    button.classList.remove(
      "pressed"
    );


    if (
      key ===
      "jump"
    ) {

      jumpHoldFrames =
        0;

    }

  }


  button.addEventListener(
    "pointerdown",
    press
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
    "pointerleave",
    release
  );

}


bindButton(
  btnLeft,
  "left"
);


bindButton(
  btnRight,
  "right"
);


bindButton(
  btnJump,
  "jump"
);


// =========================================================
// MOVEMENT
// =========================================================

function updateHorizontal() {

  if (
    gameFinished
  ) {

    return;

  }


  if (
    keys.right
  ) {

    playerX +=
      SPEED *
      frameFactor;


    facingRight =
      true;

  }


  if (
    keys.left
  ) {

    playerX -=
      SPEED *
      frameFactor;


    facingRight =
      false;

  }


  playerX =
    Math.max(
      0,
      Math.min(
        WORLD_WIDTH - 88,
        playerX
      )
    );

}


function updateVertical() {

  if (
    gameFinished
  ) {
    return;
  }

  previousPlayerY =
    playerY;

  if (
    keys.jump &&
    jumpHoldFrames > 0 &&
    velocityY > 0
  ) {

    velocityY +=
      .07;

    jumpHoldFrames -=
      frameFactor;

  }

  velocityY -=
    GRAVITY *
    frameFactor;

  velocityY =
    Math.max(
      MAX_FALL_SPEED,
      velocityY
    );

  velocityBeforeCollision =
    velocityY;

  let nextY =
    playerY +
    velocityY *
    frameFactor;

  standingSurface =
    null;

  standingMovingPlatform =
    null;

  let landing =
    null;

  if (
    velocityY <= 0
  ) {

    const left =
      playerX +
      HITBOX_OFFSET_X +
      4;

    const right =
      left +
      HITBOX_WIDTH -
      8;

    surfaces.forEach(
      surface => {

        const surfaceLeft =
          surface.x;

        const surfaceRight =
          surface.x +
          surface.width;

        const horizontal =
          right >
          surfaceLeft &&
          left <
          surfaceRight;

        if (
          !horizontal
        ) {
          return;
        }

        const crossedFromAbove =
          previousPlayerY >=
          surface.top -
          28 &&
          nextY <=
          surface.top +
          11;

        const nearSurface =
          previousPlayerY >=
          surface.top -
          18 &&
          Math.abs(
            nextY -
            surface.top
          ) <= 13;

        if (
          crossedFromAbove ||
          nearSurface
        ) {

          if (
            !landing ||
            surface.top >
            landing.top
          ) {

            landing =
              surface;

          }

        }

      }
    );

  }

  if (
    landing
  ) {

    nextY =
      landing.top;

    if (
      landing.type ===
      "bounce"
    ) {

      velocityY =
        14.4;

      jumping =
        true;

      jumpHoldFrames =
        0;

      playSfx(
        "bounce"
      );

      landing.element.classList.remove(
        "pulse"
      );

      void landing.element.offsetWidth;

      landing.element.classList.add(
        "pulse"
      );

    }

    else {

      velocityY =
        0;

      jumping =
        false;

      standingSurface =
        landing;

      if (
        landing.type ===
        "moving"
      ) {

        standingMovingPlatform =
          landing;

      }

    }

  }

  else {

    jumping =
      true;

  }

  playerY =
    nextY;

  if (
    playerY <
    -165
  ) {

    damagePlayer();

  }

}


// =========================================================
// PLAYER ANIMATION
// =========================================================

function updatePlayerAnimation(
  timestamp
) {

  if (
    jumping
  ) {

    currentPose =
      "jump";


    if (
      velocityY >
      6
    ) {

      setPlayerImage(
        jumpFrames[1]
      );

    }

    else if (
      velocityY >
      2
    ) {

      setPlayerImage(
        jumpFrames[2]
      );

    }

    else if (
      velocityY >
      -1
    ) {

      setPlayerImage(
        jumpFrames[3]
      );

    }

    else if (
      velocityY >
      -4
    ) {

      setPlayerImage(
        jumpFrames[4]
      );

    }

    else {

      setPlayerImage(
        jumpFrames[5]
      );

    }


    return;

  }


  if (
    !keys.left &&
    !keys.right
  ) {

    currentPose =
      "idle";


    setPlayerImage(
      idleImage
    );


    return;

  }


  currentPose =
    "run";


  if (
    timestamp -
    lastRunFrameTime >=
    115
  ) {

    runFrame =

      (
        runFrame +
        1
      ) %

      runFrames.length;


    setPlayerImage(
      runFrames[
        runFrame
      ]
    );


    lastRunFrameTime =
      timestamp;

  }

}


// =========================================================
// MOVING PLATFORM UPDATE
// =========================================================

function updateMovingPlatforms() {

  movingPlatforms.forEach(
    platform => {

      platform.previousX =
        platform.x;


      platform.previousY =
        platform.y;


      if (
        platform.axis ===
        "x"
      ) {

        platform.x +=

          platform.speed *
          platform.direction *
          frameFactor;


        if (
          platform.x >=
          platform.max
        ) {

          platform.x =
            platform.max;


          platform.direction =
            -1;

        }


        if (
          platform.x <=
          platform.min
        ) {

          platform.x =
            platform.min;


          platform.direction =
            1;

        }

      }

      else {

        platform.y +=

          platform.speed *
          platform.direction *
          frameFactor;


        if (
          platform.y >=
          platform.max
        ) {

          platform.y =
            platform.max;


          platform.direction =
            -1;

        }


        if (
          platform.y <=
          platform.min
        ) {

          platform.y =
            platform.min;


          platform.direction =
            1;

        }

      }


      platform.top =

        platform.y +

        platform.height -

        9;


      platform.element.style.left =
        platform.x + "px";


      platform.element.style.bottom =
        platform.y + "px";


      if (
        standingMovingPlatform ===
        platform &&
        !jumping
      ) {

        playerX +=

          platform.x -
          platform.previousX;


        playerY +=

          platform.y -
          platform.previousY;

      }

    }
  );

}


// =========================================================
// SOUND GATE UPDATE
// =========================================================

function updateSoundGates(
  timestamp
) {

  soundGates.forEach(
    gate => {

      gate.previousOpen =
        gate.isOpen;


      const progress =

        (
          timestamp +
          gate.phase
        ) %

        gate.cycle;


      gate.isOpen =

        progress <
        gate.openTime;


      gate.element.classList.toggle(
        "open",
        gate.isOpen
      );


      if (
        gate.isOpen !==
        gate.previousOpen
      ) {

        playSfx(

          gate.isOpen

            ? "gateOpen"

            : "gateClose",

          .35

        );

      }

    }
  );

}


function checkSoundGates() {

  if (
    invincible
  ) {

    return;

  }


  const player =
    playerRect();


  soundGates.forEach(
    gate => {

      if (
        gate.isOpen
      ) {

        return;

      }


      const rect = {

        left:
          gate.x +
          8,

        right:
          gate.x +
          gate.width -
          8,

        bottom:
          gate.bottom +
          10,

        top:
          gate.bottom +
          gate.height -
          10

      };


      if (
        overlap(
          player,
          rect
        )
      ) {

        damagePlayer();

      }

    }
  );

}


// =========================================================
// ENEMY UPDATE
// =========================================================

function updateGroundEnemies() {

  groundEnemies.forEach(
    enemy => {

      if (
        enemy.dead
      ) {

        return;

      }


      enemy.x +=

        enemy.speed *
        enemy.direction *
          frameFactor;


      if (
        enemy.x >=
        enemy.max
      ) {

        enemy.x =
          enemy.max;


        enemy.direction =
          -1;

      }


      if (
        enemy.x <=
        enemy.min
      ) {

        enemy.x =
          enemy.min;


        enemy.direction =
          1;

      }


      enemy.element.style.left =
        enemy.x + "px";


      enemy.element.style.transform =

        enemy.direction >
        0

          ? "scaleX(1)"

          : "scaleX(-1)";

    }
  );

}


function updateFlyingEnemies(
  timestamp
) {

  flyingEnemies.forEach(
    enemy => {

      if (
        enemy.dead
      ) {

        return;

      }


      enemy.previousX =
        enemy.x;


      enemy.x =

        enemy.baseX +

        Math.sin(

          timestamp *
          .00145 +

          enemy.phase

        ) *

        enemy.range;


      enemy.bottom =

        enemy.baseBottom +

        Math.sin(

          timestamp *
          .0024 +

          enemy.phase

        ) *

        26;


      if (
        enemy.x >
        enemy.previousX +
        .02
      ) {

        enemy.direction =
          1;

      }

      else if (
        enemy.x <
        enemy.previousX -
        .02
      ) {

        enemy.direction =
          -1;

      }


      enemy.element.style.left =
        enemy.x + "px";


      enemy.element.style.bottom =
        enemy.bottom + "px";


      /*
        The original flying enemy artwork naturally faces LEFT.
        Flip only when it moves RIGHT so its face always follows
        the actual movement direction. No new enemy images needed.
      */
      enemy.element.style.transform =

        enemy.direction >
        0

          ? "scaleX(-1)"

          : "scaleX(1)";

    }
  );

}


// =========================================================
// DAMAGE / ENEMY DEFEAT
// =========================================================

function damagePlayer() {

  if (
    invincible ||
    gameFinished
  ) {

    return;

  }


  const previousHealth =
    health;


  health--;

  window.FofoPolish?.haptic(
    "hurt"
  );


  updateHUD(
    previousHealth -
    1
  );
  if (
    health <=
    0
  ) {

    playSfx(
      "death"
    );

    health =
      3;


    updateHUD();


    showMessage(
      "Back to the last checkpoint, Fofo. ♡",
      1500
    );

  }

  else {

    showMessage(
      "Careful, Fofo…",
      900
    );

  }


  playerX =
    respawnX;


  playerY =
    respawnY;


  velocityY =
    0;


  jumping =
    false;


  standingSurface =
    null;


  standingMovingPlatform =
    null;


  invincible =
    true;


  invincibleUntil =

    performance.now() +
    1250;


  fofo.classList.add(
    "hurt"
  );

}


function updateInvincibility(
  timestamp
) {

  if (
    invincible &&
    timestamp >=
    invincibleUntil
  ) {

    invincible =
      false;


    fofo.classList.remove(
      "hurt"
    );

  }

}


function killEnemy(
  enemy,
  bounce = 7.8
) {

  enemy.dead =
    true;


  playSfx(
    "enemy"
  );


  enemy.element.classList.add(
    "enemy-defeat"
  );


  setTimeout(
    () => {

      enemy.element.style.display =
        "none";

    },

    540
  );


  velocityY =
    bounce;


  jumping =
    true;


  jumpHoldFrames =
    0;

}


// =========================================================
// ENEMY COLLISIONS
// =========================================================

function checkGroundEnemies() {

  const player =
    playerRect();


  groundEnemies.forEach(
    enemy => {

      if (
        enemy.dead
      ) {

        return;

      }


      const rect = {

        left:
          enemy.x +
          14,

        right:
          enemy.x +
          enemy.width -
          14,

        bottom:
          enemy.bottom +
          4,

        top:
          enemy.bottom +
          enemy.height -
          5

      };


      if (
        !overlap(
          player,
          rect
        )
      ) {

        return;

      }


      const stomp =

        velocityBeforeCollision <
        -.35 &&

        previousPlayerY >=
        rect.top -
        29;


      if (
        stomp
      ) {

        playerY =
          rect.top +
          2;


        killEnemy(
          enemy
        );

      }

      else {

        damagePlayer();

      }

    }
  );

}


function checkFlyingEnemies() {

  const player =
    playerRect();


  flyingEnemies.forEach(
    enemy => {

      if (
        enemy.dead
      ) {

        return;

      }


      const rect = {

        left:
          enemy.x +
          15,

        right:
          enemy.x +
          enemy.width -
          15,

        bottom:
          enemy.bottom +
          10,

        top:
          enemy.bottom +
          enemy.height -
          11

      };


      if (
        !overlap(
          player,
          rect
        )
      ) {

        return;

      }


      const stomp =

        velocityBeforeCollision <
        -.35 &&

        previousPlayerY >=
        rect.top -
        31;


      if (
        stomp
      ) {

        playerY =
          rect.top +
          2;


        killEnemy(
          enemy,
          8.2
        );

      }

      else {

        damagePlayer();

      }

    }
  );

}


// =========================================================
// NOTES
// =========================================================

function checkNotes() {

  const player =
    playerRect();


  notes.forEach(
    note => {

      if (
        note.collected
      ) {

        return;

      }


      const rect = {

        left:
          note.x +
          10,

        right:
          note.x +
          note.width -
          10,

        bottom:
          note.bottom +
          8,

        top:
          note.bottom +
          note.height -
          8

      };


      if (
        !overlap(
          player,
          rect
        )
      ) {

        return;

      }


      note.collected =
        true;


      note.element.animate(
        [

          {
            transform:
              "scale(1)",
            opacity:
              1
          },

          {
            transform:
              "scale(1.4) rotate(12deg)",
            opacity:
              1
          },

          {
            transform:
              "translateY(-45px) scale(.25)",
            opacity:
              0
          }

        ],

        {
          duration:
            430,

          fill:
            "forwards",

          easing:
            "ease-out"
        }
      );


      setTimeout(
        () => {

          note.element.style.display =
            "none";

        },

        430
      );


      collectedNotes++;

      window.FofoPolish?.haptic(
        "collect"
      );


      playSfx(

        note.golden

          ? "golden"

          : "memory"

      );


      updateHUD();


      animateCounter();


      if (
        collectedNotes ===
        TOTAL_NOTES
      ) {

        showMessage(
          "Every little thing you say matters to me. ♡",
          2400
        );

      }

      else {

        showMessage(
          `Memory ${collectedNotes} / 11`,
          720
        );

      }


      updatePortal();

    }
  );

}


// =========================================================
// CHECKPOINTS
// =========================================================

function updateCheckpoints() {

  checkpoints.forEach(
    checkpoint => {

      if (
        checkpoint.reached ||
        playerX <
        checkpoint.triggerX
      ) {

        return;

      }


      checkpoint.reached =
        true;


      respawnX =
        checkpoint.spawnX;


      respawnY =
        checkpoint.spawnY;


      checkpoint.element.classList.add(
        "active"
      );


      playSfx(
        "checkpoint",
        .75
      );

      window.FofoPolish?.checkpoint();


      showMessage(
        "Memory saved ✨",
        800
      );

    }
  );

}


// =========================================================
// PORTAL COLLISION
// =========================================================

function checkPortal() {

  if (
    !portal ||
    finaleStarted
  ) {

    return;

  }


  if (
    playerX <
    portal.x -
    55
  ) {

    return;

  }


  if (
    !echoPuzzleSolved
  ) {

    playerX =
      portal.x -
      80;


    showMessage(
      "One memory puzzle is still unfinished.",
      1200
    );


    return;

  }


  if (
    collectedNotes <
    TOTAL_NOTES
  ) {

    playerX =
      portal.x -
      80;


    const remaining =

      TOTAL_NOTES -
      collectedNotes;


    showMessage(
      `Find ${remaining} more memor${remaining === 1 ? "y" : "ies"} ♫`,
      1200
    );


    return;

  }


  startFinale();

}


// =========================================================
// FINALE
// =========================================================

function startFinale() {

  if (
    finaleStarted
  ) {

    return;

  }


  finaleStarted =
    true;


  gameFinished =
    true;


  keys.left =
    false;

  keys.right =
    false;

  keys.jump =
    false;


  velocityY =
    0;


  AUDIO.music.pause();


  playSfx(
    "portalEnter"
  );


  localStorage.setItem(
    "fofoLevel3Completed",
    "true"
  );


  localStorage.setItem(
    "fofoHighestUnlockedLevel",
    "4"
  );


  localStorage.setItem(
    "fofoLastPlayedLevel",
    "4"
  );


  setTimeout(
    () => {

      finaleOverlay.classList.remove(
        "hidden"
      );


      finaleIntro.classList.remove(
        "hidden"
      );


      giftPage.classList.add(
        "hidden"
      );


      storyPage.classList.add(
        "hidden"
      );


      playSfx(
        "complete"
      );

    },

    650
  );

}


// =========================================================
// PRODUCT GALLERY
// =========================================================

const productViews = [

  "assets/level3_product/jbl_black_view_1.png",

  "assets/level3_product/jbl_black_view_2.png",

  "assets/level3_product/jbl_black_view_3.png",

  "assets/level3_product/jbl_black_view_4.png",

  "assets/level3_product/jbl_black_view_5.png",

  "assets/level3_product/jbl_black_view_6.png"

];


let productIndex =
  0;


function buildProductDots() {

  productDots.innerHTML =
    "";


  productViews.forEach(
    (
      src,
      index
    ) => {

      const dot =
        document.createElement(
          "span"
        );


      dot.classList.toggle(
        "active",
        index ===
        productIndex
      );


      productDots.appendChild(
        dot
      );

    }
  );

}


function showProductView(
  index
) {

  productIndex =

    (
      index +
      productViews.length
    ) %

    productViews.length;


  productImage.animate(
    [

      {
        opacity:
          .2,
        transform:
          "scale(.88) rotate(-2deg)"
      },

      {
        opacity:
          1,
        transform:
          "scale(1) rotate(0deg)"
      }

    ],

    {
      duration:
        340,

      easing:
        "ease-out"
    }
  );


  productImage.src =
    productViews[
      productIndex
    ];


  buildProductDots();

}


revealGiftButton.addEventListener(
  "click",
  () => {

    playSfx(
      "gift"
    );


    finaleIntro.classList.add(
      "hidden"
    );


    giftPage.classList.remove(
      "hidden"
    );


    showProductView(
      0
    );

  }
);


productPrev.addEventListener(
  "click",
  () => {

    showProductView(
      productIndex -
      1
    );

  }
);


productNext.addEventListener(
  "click",
  () => {

    showProductView(
      productIndex +
      1
    );

  }
);


giftStoryButton.addEventListener(
  "click",
  () => {

    playSfx(
      "story"
    );


    giftPage.classList.add(
      "hidden"
    );


    storyPage.classList.remove(
      "hidden"
    );

  }
);


backToGiftButton.addEventListener(
  "click",
  () => {

    storyPage.classList.add(
      "hidden"
    );


    giftPage.classList.remove(
      "hidden"
    );

  }
);


continueButton.addEventListener(
  "click",
  () => {

    if (window.FofoPolish) {
      window.FofoPolish.navigate(
        "index.html"
      );
    } else {
      window.location.href =
        "index.html";
    }

  }
);


// =========================================================
// CAMERA
// =========================================================

function updateCamera() {

  const viewportWidth =
    game.clientWidth;


  let cameraX =
    playerX -
    viewportWidth *
    0.34;


  cameraX =
    Math.max(
      0,
      Math.min(
        Math.max(
          0,
          WORLD_WIDTH -
          viewportWidth
        ),
        cameraX
      )
    );


  const cameraY =
    updateMobileCameraY(
      game
    );


  world.style.transformOrigin =
    "left bottom";


  /*
    IMPORTANT:
    No horizontal scaling on mobile.
    Previous uniform zoom made the character LOOK slower.
    We now preserve 1:1 X scale and only pan vertically when needed.
  */
  world.style.transform =
    `translate3d(${-cameraX}px, ${cameraY}px, 0)`;

}


// =========================================================
// INITIALIZE
// =========================================================

function initialize() {

  updateHUD();


  renderPlayer();


  buildProductDots();


  showMessage(
    "Find the 11 memories. Listen closely — one path must be remembered. ♡",
    3000
  );

}


// =========================================================
// GAME LOOP
// =========================================================

function gameLoop(
  timestamp
) {

  updateFrameFactor(
    timestamp
  );

  if (
    window.FofoPolish &&
    window.FofoPolish.isPaused()
  ) {

    lastFrameTimestamp =
      timestamp;

    requestAnimationFrame(
      gameLoop
    );

    return;

  }


  if (
    !gameFinished
  ) {

    updateMovingPlatforms();


    updateSoundGates(
      timestamp
    );


    updateGroundEnemies();


    updateFlyingEnemies(
      timestamp
    );


    updateHorizontal();


    updateVertical();


    updatePlayerAnimation(
      timestamp
    );


    updateInvincibility(
      timestamp
    );


    renderPlayer();


    updateEchoPuzzle();


    checkSoundGates();


    checkGroundEnemies();


    checkFlyingEnemies();


    checkNotes();


    updateMemoryEvents();


    updateCheckpoints();


    updatePortal();


    checkPortal();


    updateCamera();

  }


  requestAnimationFrame(
    gameLoop
  );

}


// =========================================================
// START
// =========================================================

initialize();


requestAnimationFrame(
  gameLoop
);


// =====================================================
// MOBILE CONTROL IMAGE / LONG-PRESS PROTECTION
// =====================================================

(function protectFofoGameControls() {

  const CONTROL_SELECTOR = [
    "#btnLeft",
    "#btnRight",
    "#btnJump",
    ".control-image-button",
    ".game-control",
    ".image-control",
    "#controls button",
    ".mobile-controls button"
  ].join(",");


  function setupControls() {

    document
      .querySelectorAll(
        CONTROL_SELECTOR
      )
      .forEach(
        control => {

          control.setAttribute(
            "draggable",
            "false"
          );


          control
            .querySelectorAll(
              "img"
            )
            .forEach(
              img => {

                img.draggable =
                  false;

                img.setAttribute(
                  "draggable",
                  "false"
                );

              }
            );

        }
      );

  }


  function isGameControl(
    target
  ) {

    if (
      !target ||
      !target.closest
    ) {

      return false;
    }


    return Boolean(
      target.closest(
        CONTROL_SELECTOR
      )
    );
  }


  /*
    Chrome/Android treats a long press on an <img> like a normal image
    and can show the image/download menu. Block that only on game controls.
  */
  [
    "contextmenu",
    "dragstart",
    "selectstart"
  ].forEach(
    eventName => {

      document.addEventListener(
        eventName,
        event => {

          if (
            isGameControl(
              event.target
            )
          ) {

            event.preventDefault();
            event.stopPropagation();

          }

        },
        {
          capture:true
        }
      );

    }
  );


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      setupControls,
      {
        once:true
      }
    );

  }
  else {

    setupControls();

  }

})();
