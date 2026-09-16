// =====================================================
// FOFO BIRTHDAY ADVENTURE
// LEVEL 1
// FAIR PIPE ENEMY COLLISION VERSION
// =====================================================


// =====================================================
// DOM
// =====================================================

const fofo =
  document.getElementById("fofo");

const gameArea =
  document.getElementById("gameArea");

const world =
  document.getElementById("world");

const treatCounterImage =
  document.getElementById("treatCounterImage");

const treatHud =
  document.getElementById("treatHud");

const exitGate =
  document.getElementById("exitGate");

const gateImage =
  document.getElementById("gateImage");

const message =
  document.getElementById("message");

const healthDisplay =
  document.getElementById("healthDisplay");

const finishScreen =
  document.getElementById("finishScreen");

const giftButton =
  document.getElementById("giftButton");

const gameOverScreen =
  document.getElementById("gameOverScreen");

const retryButton =
  document.getElementById("retryButton");

const groundElement =
  document.querySelector(".ground");


// =====================================================
// WORLD
// =====================================================

const WORLD_WIDTH =
  7600;

const GROUND_HEIGHT =
  110;

const GATE_X =
  7390;


world.style.width =
  WORLD_WIDTH + "px";


groundElement.style.width =
  WORLD_WIDTH + "px";


exitGate.style.left =
  GATE_X + "px";


// =====================================================
// GATE
// =====================================================

const GATE_LOCKED_IMAGE =
  "assets/gate/gate_locked.png";

const GATE_UNLOCKED_IMAGE =
  "assets/gate/gate_unlocked.png";

const GATE_OPEN_IMAGE =
  "assets/gate/gate_open.png";


let gateUnlocked =
  false;

let gateOpening =
  false;


// =====================================================
// PLAYER
// =====================================================

let playerX =
  120;

let playerY =
  GROUND_HEIGHT;

let velocityY =
  0;

let jumping =
  false;

let facingRight =
  true;

let gameFinished =
  false;


// بنحتفظ بمكان وسرعة فوفو قبل حل التصادمات.
// مهم جدًا علشان نعرف إنها كانت نازلة على الوحش من فوق
// حتى لو الأنبوبة وقفتها في نفس الفريم.

let previousPlayerY =
  playerY;

let velocityBeforeVerticalCollision =
  0;


// =====================================================
// HEALTH
// =====================================================

let health =
  3;

let invincible =
  false;

let invincibleUntil =
  0;

let respawnX =
  120;


// =====================================================
// PLAYER SIZE
// =====================================================

const FOFO_BASE_WIDTH =
  88;

const FOFO_BASE_HEIGHT =
  112;

const PLAYER_HITBOX_WIDTH =
  52;

const PLAYER_HITBOX_HEIGHT =
  92;

const PLAYER_HITBOX_OFFSET_X =
  18;


// =====================================================
// MOVEMENT
// =====================================================

const SPEED =
  2.45;

const GRAVITY =
  0.255;

const JUMP_POWER =
  10.9;

const MAX_FALL_SPEED =
  -6.6;

let jumpHoldFrames =
  0;

const MAX_JUMP_HOLD =
  12;



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


// =====================================================
// FOFO IMAGES
// =====================================================

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


// =====================================================
// HUD
// =====================================================

const HEART_FULL_IMAGE =
  "assets/hud/heart_full.png";

const HEART_EMPTY_IMAGE =
  "assets/hud/heart_empty.png";


const TREAT_COUNTER_IMAGES =
  Array.from(
    { length: 13 },
    (_, index) =>
      `assets/hud/treat_${index}.png`
  );


// =====================================================
// MAP ASSETS
// =====================================================

const PLATFORM_LONG_IMAGE =
  "assets/platform_long.png";

const PLATFORM_BLOCK_IMAGE =
  "assets/platform_block.png";

const PIPE_IMAGE =
  "assets/candy_pipe.png";

const PIPE_ENEMY_IMAGE =
  "assets/pipe_enemy.png";


// =====================================================
// TREAT IMAGES
// =====================================================

const TREAT_IMAGES = {

  candy:
    "assets/treats/treat_candy.png",

  chocolate:
    "assets/treats/treat_chocolate.png",

  noodles:
    "assets/treats/treat_noodles.png",

  golden:
    "assets/treats/treat_golden_chocolate.png"

};


// =====================================================
// ENEMY FOLDERS
// =====================================================

const candyFolder =
  "assets/fofo_enemy_candy_monster/";

const cupcakeFolder =
  "assets/fofo_enemy_cupcake_monster/";

const chocolateFolder =
  "assets/fofo_enemy_chocolate_monster/";


// =====================================================
// ENEMY ASSETS
// =====================================================

const enemyAssets = {

  candy: {

    walk: [

      candyFolder + "enemy_walk_1.png",
      candyFolder + "enemy_walk_2.png",
      candyFolder + "enemy_walk_3.png",
      candyFolder + "enemy_walk_4.png",
      candyFolder + "enemy_walk_5.png",
      candyFolder + "enemy_walk_6.png"

    ],

    hurt: [

      candyFolder + "enemy_hurt_1.png",
      candyFolder + "enemy_hurt_2.png",
      candyFolder + "enemy_hurt_3.png",
      candyFolder + "enemy_hurt_4.png"

    ],

    death: [

      candyFolder + "enemy_death_1.png",
      candyFolder + "enemy_death_2.png",
      candyFolder + "enemy_death_3.png",
      candyFolder + "enemy_death_4.png",
      candyFolder + "enemy_death_5.png",
      candyFolder + "enemy_death_6.png"

    ]

  },


  cupcake: {

    walk: [

      cupcakeFolder + "cupcake_walk_1.png",
      cupcakeFolder + "cupcake_walk_2.png",
      cupcakeFolder + "cupcake_walk_3.png",
      cupcakeFolder + "cupcake_walk_4.png",
      cupcakeFolder + "cupcake_walk_5.png",
      cupcakeFolder + "cupcake_walk_6.png"

    ],

    hurt: [

      cupcakeFolder + "cupcake_hurt_1.png",
      cupcakeFolder + "cupcake_hurt_2.png",
      cupcakeFolder + "cupcake_hurt_3.png",
      cupcakeFolder + "cupcake_hurt_4.png"

    ],

    death: [

      cupcakeFolder + "cupcake_death_1.png",
      cupcakeFolder + "cupcake_death_2.png",
      cupcakeFolder + "cupcake_death_3.png",
      cupcakeFolder + "cupcake_death_4.png",
      cupcakeFolder + "cupcake_death_5.png",
      cupcakeFolder + "cupcake_death_6.png"

    ]

  },


  chocolate: {

    walk: [

      chocolateFolder + "chocolate_walk_1.png",
      chocolateFolder + "chocolate_walk_2.png",
      chocolateFolder + "chocolate_walk_3.png",
      chocolateFolder + "chocolate_walk_4.png",
      chocolateFolder + "chocolate_walk_5.png",
      chocolateFolder + "chocolate_walk_6.png"

    ],

    hurt: [

      chocolateFolder + "chocolate_hurt_1.png",
      chocolateFolder + "chocolate_hurt_2.png",
      chocolateFolder + "chocolate_hurt_3.png",
      chocolateFolder + "chocolate_hurt_4.png"

    ],

    death: [

      chocolateFolder + "chocolate_death_1.png",
      chocolateFolder + "chocolate_death_2.png",
      chocolateFolder + "chocolate_death_3.png",
      chocolateFolder + "chocolate_death_4.png",
      chocolateFolder + "chocolate_death_5.png",
      chocolateFolder + "chocolate_death_6.png"

    ]

  }

};


// =====================================================
// PRELOAD
// =====================================================

[
  idleImage,

  ...runFrames,
  ...jumpFrames,

  HEART_FULL_IMAGE,
  HEART_EMPTY_IMAGE,

  ...TREAT_COUNTER_IMAGES,

  GATE_LOCKED_IMAGE,
  GATE_UNLOCKED_IMAGE,
  GATE_OPEN_IMAGE,

  PLATFORM_LONG_IMAGE,
  PLATFORM_BLOCK_IMAGE,

  PIPE_IMAGE,
  PIPE_ENEMY_IMAGE,

  TREAT_IMAGES.candy,
  TREAT_IMAGES.chocolate,
  TREAT_IMAGES.noodles,
  TREAT_IMAGES.golden,

  ...enemyAssets.candy.walk,
  ...enemyAssets.candy.hurt,
  ...enemyAssets.candy.death,

  ...enemyAssets.cupcake.walk,
  ...enemyAssets.cupcake.hurt,
  ...enemyAssets.cupcake.death,

  ...enemyAssets.chocolate.walk,
  ...enemyAssets.chocolate.hurt,
  ...enemyAssets.chocolate.death

].forEach((src) => {

  const image =
    new Image();

  image.src =
    src;

});


// =====================================================
// FOFO STYLE
// =====================================================

fofo.style.width =
  FOFO_BASE_WIDTH + "px";

fofo.style.height =
  FOFO_BASE_HEIGHT + "px";

fofo.style.objectFit =
  "contain";

fofo.style.objectPosition =
  "center bottom";

fofo.style.transformOrigin =
  "bottom center";


const POSE_SETTINGS = {

  idle: {
    scale: 1,
    offsetY: -8
  },

  run: {
    scale: 0.92,
    offsetY: -14
  },

  jump: {
    scale: 0.95,
    offsetY: -12
  }

};


let currentPose =
  "idle";


// =====================================================
// INPUT
// =====================================================

const keys = {};


document.addEventListener(
  "keydown",
  (event) => {

    keys[event.code] =
      true;


    if (
      event.code === "Space"
    ) {

      event.preventDefault();


      if (
        !jumping &&
        !gameFinished &&
        !gateOpening
      ) {

        velocityY =
          JUMP_POWER;

        jumping =
          true;

        jumpHoldFrames =
          MAX_JUMP_HOLD;

      }

    }

  }
);


document.addEventListener(
  "keyup",
  (event) => {

    keys[event.code] =
      false;


    if (
      event.code === "Space"
    ) {

      jumpHoldFrames =
        0;

    }

  }
);


// =====================================================
// RUN ANIMATION
// =====================================================

let currentRunFrame =
  0;

let lastRunAnimationTime =
  0;

const RUN_FRAME_SPEED =
  115;


// =====================================================
// HELPERS
// =====================================================

function setFofoImage(src) {

  if (
    fofo.getAttribute("src") !== src
  ) {

    fofo.src =
      src;

  }

}


function overlap(a, b) {

  return !(

    a.right < b.left ||

    a.left > b.right ||

    a.top < b.bottom ||

    a.bottom > b.top

  );

}


function getPlayerRect() {

  return {

    left:
      playerX +
      PLAYER_HITBOX_OFFSET_X,

    right:
      playerX +
      PLAYER_HITBOX_OFFSET_X +
      PLAYER_HITBOX_WIDTH,

    bottom:
      playerY,

    top:
      playerY +
      PLAYER_HITBOX_HEIGHT

  };

}


// =====================================================
// PLAYER RENDER
// =====================================================

function applyPlayerVisual() {

  const pose =
    POSE_SETTINGS[currentPose];


  const scale =
    pose.scale;


  const horizontalScale =
    facingRight
      ? scale
      : -scale;


  fofo.style.transform =
    `scaleX(${horizontalScale}) scaleY(${scale})`;

}


function renderPlayer() {

  const pose =
    POSE_SETTINGS[currentPose];


  fofo.style.left =
    playerX + "px";


  fofo.style.bottom =
    playerY +
    pose.offsetY +
    "px";


  applyPlayerVisual();

}


// =====================================================
// HEALTH
// =====================================================

function updateHealth() {

  healthDisplay.innerHTML =
    "";


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    const heart =
      document.createElement("img");


    const isFull =
      i < health;


    heart.src =
      isFull
        ? HEART_FULL_IMAGE
        : HEART_EMPTY_IMAGE;


    heart.className =
      "hud-heart";


    if (
      !isFull
    ) {

      heart.classList.add(
        "lost"
      );

    }


    heart.draggable =
      false;


    healthDisplay.appendChild(
      heart
    );

  }

}


// =====================================================
// TREAT HUD
// =====================================================

function updateTreatHud() {

  const value =
    Math.max(
      0,
      Math.min(
        12,
        collectedTreats
      )
    );


  treatCounterImage.src =
    TREAT_COUNTER_IMAGES[value];


  treatCounterImage.alt =
    `${value} / 12`;


  treatHud.classList.remove(
    "pulse"
  );


  void treatHud.offsetWidth;


  if (
    value > 0 &&
    value < 12
  ) {

    treatHud.classList.add(
      "pulse"
    );

  }


  if (
    value === 12
  ) {

    treatHud.classList.add(
      "complete"
    );

  }

  else {

    treatHud.classList.remove(
      "complete"
    );

  }

}


// =====================================================
// GATE
// =====================================================

function setGateLocked() {

  gateUnlocked =
    false;

  gateOpening =
    false;


  exitGate.classList.remove(
    "unlocked"
  );


  exitGate.classList.remove(
    "opening"
  );


  gateImage.src =
    GATE_LOCKED_IMAGE;

}


function setGateUnlocked() {

  if (
    gateUnlocked
  ) {

    return;

  }


  gateUnlocked =
    true;


  exitGate.classList.add(
    "unlocked"
  );


  gateImage.src =
    GATE_UNLOCKED_IMAGE;


  message.textContent =
    "All treats collected! The birthday gate is open! ✨💖";

}


function openGate() {

  if (
    gateOpening ||
    gameFinished
  ) {

    return;

  }


  gateOpening =
    true;


  keys["ArrowLeft"] =
    false;

  keys["ArrowRight"] =
    false;

  keys["Space"] =
    false;


  velocityY =
    0;


  exitGate.classList.remove(
    "unlocked"
  );


  exitGate.classList.add(
    "opening"
  );


  gateImage.src =
    GATE_OPEN_IMAGE;


  message.textContent =
    "You made it, Fofo! 🎀✨";


  setTimeout(
    () => {

      gameFinished =
        true;


      finishScreen.classList.add(
        "show"
      );

    },

    950
  );

}


// =====================================================
// GAME OVER
// =====================================================

function showGameOver() {

  gameFinished =
    true;


  gameOverScreen.classList.add(
    "show"
  );

}


// =====================================================
// RESPAWN
// =====================================================

function resetPlayerToCheckpoint() {

  playerX =
    respawnX;

  playerY =
    GROUND_HEIGHT;

  velocityY =
    0;

  jumping =
    false;

  standingOnMovingPlatform =
    null;

}


// =====================================================
// DAMAGE
// =====================================================

function damagePlayerFromEnemy(sourceX) {

  if (
    invincible ||
    gameFinished ||
    gateOpening
  ) {

    return;

  }


  health--;


  health =
    Math.max(
      0,
      health
    );


  updateHealth();


  if (
    health <= 0
  ) {

    message.textContent =
      "Fofo fainted! 💔";


    showGameOver();

    return;

  }


  invincible =
    true;


  invincibleUntil =
    performance.now() +
    1200;


  fofo.classList.add(
    "hurt"
  );


  playerX +=
    sourceX > playerX
      ? -65
      : 65;


  velocityY =
    5.6;


  jumping =
    true;


  message.textContent =
    "Ouch! Be careful Fofo! 💗";

}


function damagePlayerFromFall() {

  if (
    gameFinished ||
    gateOpening
  ) {

    return;

  }


  health--;


  health =
    Math.max(
      0,
      health
    );


  updateHealth();


  if (
    health <= 0
  ) {

    message.textContent =
      "Fofo fell! 💔";


    showGameOver();

    return;

  }


  invincible =
    true;


  invincibleUntil =
    performance.now() +
    900;


  fofo.classList.add(
    "hurt"
  );


  resetPlayerToCheckpoint();


  message.textContent =
    "You fell! Back to checkpoint 💖";

}


function updateInvincibility(timestamp) {

  if (
    invincible &&
    timestamp >= invincibleUntil
  ) {

    invincible =
      false;


    fofo.classList.remove(
      "hurt"
    );

  }

}


// =====================================================
// CLOUDS
// =====================================================

for (
  let i = 1;
  i <= 7;
  i++
) {

  const cloud =
    document.createElement("div");


  cloud.className =
    "cloud cloud" + i;


  world.appendChild(
    cloud
  );

}


// =====================================================
// ARRAYS
// =====================================================

const fixedSurfaces =
  [];

const movingPlatforms =
  [];

const pipes =
  [];

const checkpoints =
  [];

const enemies =
  [];

const pipeEnemies =
  [];

const treats =
  [];

const deathPits =
  [];


let standingOnMovingPlatform =
  null;


// =====================================================
// SURFACES
// =====================================================

function createSurface(settings) {

  const element =
    document.createElement("img");


  element.src =
    settings.image;


  element.className =
    settings.className;


  element.draggable =
    false;


  element.style.left =
    settings.x + "px";


  element.style.bottom =
    settings.y + "px";


  element.style.width =
    settings.width + "px";


  element.style.height =
    settings.height + "px";


  world.appendChild(
    element
  );


  fixedSurfaces.push({

    x:
      settings.x,

    y:
      settings.y,

    width:
      settings.width,

    height:
      settings.height,

    top:
      settings.surfaceTop,

    element

  });

}


function addLongPlatform(
  x,
  y,
  width
) {

  createSurface({

    x,
    y,
    width,

    height:
      48,

    image:
      PLATFORM_LONG_IMAGE,

    className:
      "platform-image",

    surfaceTop:
      y + 42

  });

}


function addBlockPlatform(
  x,
  y,
  width = 150
) {

  createSurface({

    x,
    y,
    width,

    height:
      92,

    image:
      PLATFORM_BLOCK_IMAGE,

    className:
      "stair-platform",

    surfaceTop:
      y + 68

  });

}


// =====================================================
// MOVING PLATFORM
// =====================================================

function addMovingPlatform(settings) {

  const element =
    document.createElement("img");


  element.src =
    PLATFORM_LONG_IMAGE;


  element.className =
    "moving-platform";


  element.draggable =
    false;


  element.style.left =
    settings.x + "px";


  element.style.bottom =
    settings.y + "px";


  element.style.width =
    settings.width + "px";


  element.style.height =
    "48px";


  world.appendChild(
    element
  );


  movingPlatforms.push({

    x:
      settings.x,

    y:
      settings.y,

    width:
      settings.width,

    axis:
      settings.axis,

    min:
      settings.min,

    max:
      settings.max,

    speed:
      settings.speed,

    direction:
      1,

    previousX:
      settings.x,

    previousY:
      settings.y,

    top:
      settings.y + 42,

    element

  });

}


// =====================================================
// PIPE
// =====================================================

function addPipe(x) {

  const width =
    136;

  const height =
    146;

  const bottom =
    GROUND_HEIGHT - 22;


  const element =
    document.createElement("img");


  element.src =
    PIPE_IMAGE;


  element.className =
    "candy-pipe";


  element.draggable =
    false;


  element.style.left =
    x + "px";


  element.style.bottom =
    bottom + "px";


  element.style.width =
    width + "px";


  element.style.height =
    height + "px";


  world.appendChild(
    element
  );


  const pipe = {

    x,

    y:
      bottom,

    width,

    height,

    top:
      bottom +
      height -
      14,

    element

  };


  pipes.push(
    pipe
  );


  return pipe;

}


// =====================================================
// PIPE ENEMY
// =====================================================

function addPipeEnemy(pipe) {

  const width =
    84;

  const height =
    96;


  const hiddenBottom =
    pipe.top -
    height -
    4;


  const visibleBottom =
    pipe.top -
    8;


  const x =
    pipe.x +
    pipe.width / 2 -
    width / 2;


  const element =
    document.createElement("img");


  element.src =
    PIPE_ENEMY_IMAGE;


  element.className =
    "pipe-monster";


  element.draggable =
    false;


  element.style.left =
    x + "px";


  element.style.bottom =
    hiddenBottom + "px";


  element.style.width =
    width + "px";


  element.style.height =
    height + "px";


  element.style.display =
    "block";


  element.style.clipPath =
    `inset(0 0 ${height}px 0)`;


  element.style.webkitClipPath =
    `inset(0 0 ${height}px 0)`;


  world.appendChild(
    element
  );


  pipeEnemies.push({

    pipe,

    x,

    width,

    height,

    hiddenBottom,

    visibleBottom,

    bottom:
      hiddenBottom,

    state:
      "hidden",

    stateStarted:
      performance.now(),

    dead:
      false,

    element

  });

}


// =====================================================
// PIPE CLIP
// =====================================================

function updatePipeEnemyClip(enemy) {

  const amountInsidePipe =
    enemy.pipe.top -
    enemy.bottom;


  const clipBottom =
    Math.max(
      0,
      Math.min(
        enemy.height,
        amountInsidePipe
      )
    );


  const clipValue =
    `inset(0 0 ${clipBottom}px 0)`;


  enemy.element.style.clipPath =
    clipValue;


  enemy.element.style.webkitClipPath =
    clipValue;

}


// =====================================================
// EASING
// =====================================================

function easeOutCubic(t) {

  return (
    1 -
    Math.pow(
      1 - t,
      3
    )
  );

}


function easeInCubic(t) {

  return (
    t *
    t *
    t
  );

}


// =====================================================
// CHECKPOINT
// =====================================================

function addCheckpoint(x) {

  checkpoints.push({

    x,

    activated:
      false

  });

}


// =====================================================
// PIT
// =====================================================

function addPit(
  x,
  width
) {

  const chocolateTop =
    GROUND_HEIGHT - 22;


  const mask =
    document.createElement("div");


  mask.style.position =
    "absolute";

  mask.style.left =
    x + "px";

  mask.style.bottom =
    "0";

  mask.style.width =
    width + "px";

  mask.style.height =
    GROUND_HEIGHT + "px";

  mask.style.zIndex =
    "55";

  mask.style.background =
    "#dff6ff";


  world.appendChild(
    mask
  );


  const chocolate =
    document.createElement("div");


  chocolate.style.position =
    "absolute";

  chocolate.style.left =
    x + "px";

  chocolate.style.bottom =
    "0";

  chocolate.style.width =
    width + "px";

  chocolate.style.height =
    chocolateTop + "px";

  chocolate.style.zIndex =
    "60";

  chocolate.style.background =
    "linear-gradient(180deg,#7c381a 0%,#5c260f 45%,#351207 100%)";


  world.appendChild(
    chocolate
  );


  const top =
    document.createElement("div");


  top.style.position =
    "absolute";

  top.style.left =
    "0";

  top.style.top =
    "-12px";

  top.style.width =
    "100%";

  top.style.height =
    "20px";

  top.style.background =
    "radial-gradient(circle at 22px 18px,#7b472d 0 20px,transparent 21px)";

  top.style.backgroundSize =
    "44px 20px";


  chocolate.appendChild(
    top
  );


  deathPits.push({

    x,

    width

  });

}


function isInsideDeathPit(centerX) {

  return deathPits.some(

    (pit) =>
      centerX >= pit.x &&
      centerX <=
      pit.x + pit.width

  );

}


// =====================================================
// GROUND ENEMY
// =====================================================

function addGroundEnemy(
  type,
  x,
  minX,
  maxX,
  speed
) {

  const element =
    document.createElement("img");


  element.className =
    "enemy";


  element.draggable =
    false;


  element.src =
    enemyAssets[type].walk[0];


  let size =
    86;


  let bottom =
    GROUND_HEIGHT - 18;


  if (
    type === "cupcake"
  ) {

    size =
      70;

    bottom =
      GROUND_HEIGHT - 22;

  }


  if (
    type === "chocolate"
  ) {

    size =
      72;

    bottom =
      GROUND_HEIGHT - 22;

  }


  element.style.left =
    x + "px";


  element.style.bottom =
    bottom + "px";


  element.style.width =
    size + "px";


  element.style.height =
    size + "px";


  world.appendChild(
    element
  );


  enemies.push({

    type,

    startX:
      x,

    x,

    minX,

    maxX,

    speed,

    direction:
      1,

    state:
      "walk",

    frame:
      0,

    lastFrameTime:
      0,

    dead:
      false,

    size,

    bottom,

    element

  });

}


// =====================================================
// TREAT
// =====================================================

function addTreat(
  type,
  x,
  y,
  golden = false
) {

  const element =
    document.createElement("img");


  element.className =
    "collectible";


  element.src =
    golden
      ? TREAT_IMAGES.golden
      : TREAT_IMAGES[type];


  let size =
    62;


  if (
    type === "candy"
  ) {

    size =
      65;

  }


  if (
    type === "chocolate"
  ) {

    size =
      60;

  }


  if (
    type === "noodles"
  ) {

    size =
      68;

  }


  if (
    golden
  ) {

    size =
      74;


    element.classList.add(
      "golden"
    );

  }


  element.draggable =
    false;


  element.style.left =
    x + "px";


  element.style.bottom =
    y + "px";


  element.style.width =
    size + "px";


  element.style.height =
    size + "px";


  world.appendChild(
    element
  );


  treats.push({

    type,

    x,

    y,

    size,

    golden,

    collected:
      false,

    element

  });

}


// =====================================================
// MAP
// =====================================================

addLongPlatform(
  520,
  185,
  240
);


addLongPlatform(
  860,
  255,
  210
);


const pipe1 =
  addPipe(
    1120
  );


addLongPlatform(
  1380,
  205,
  270
);


addBlockPlatform(
  1710,
  130,
  145
);


addBlockPlatform(
  1850,
  200,
  145
);


addBlockPlatform(
  1990,
  270,
  145
);


addLongPlatform(
  2160,
  345,
  300
);


addLongPlatform(
  2550,
  230,
  220
);


addLongPlatform(
  2770,
  160,
  185
);


addPit(
  2980,
  720
);


addMovingPlatform({

  x: 3020,

  y: 175,

  width: 220,

  axis: "x",

  min: 3020,

  max: 3250,

  speed: 0.95

});


addMovingPlatform({

  x: 3350,

  y: 255,

  width: 220,

  axis: "x",

  min: 3250,

  max: 3500,

  speed: 1.05

});


addLongPlatform(
  3750,
  175,
  250
);


const pipe2 =
  addPipe(
    4060
  );


addLongPlatform(
  4330,
  255,
  220
);


addLongPlatform(
  4640,
  330,
  220
);


addLongPlatform(
  4950,
  255,
  240
);


const pipe3 =
  addPipe(
    5300
  );


addBlockPlatform(
  5660,
  130,
  145
);


addBlockPlatform(
  5800,
  200,
  145
);


addBlockPlatform(
  5940,
  270,
  145
);


addBlockPlatform(
  6080,
  340,
  145
);


addMovingPlatform({

  x: 6330,

  y: 180,

  width: 210,

  axis: "y",

  min: 180,

  max: 330,

  speed: 0.82

});


addLongPlatform(
  6630,
  370,
  240
);


addLongPlatform(
  6990,
  295,
  220
);


addLongPlatform(
  7250,
  225,
  180
);


// =====================================================
// PIPE ENEMIES
// =====================================================

addPipeEnemy(
  pipe1
);


addPipeEnemy(
  pipe2
);


addPipeEnemy(
  pipe3
);


// =====================================================
// CHECKPOINTS
// =====================================================

addCheckpoint(
  2500
);


addCheckpoint(
  5600
);


// =====================================================
// GROUND ENEMIES
// =====================================================

addGroundEnemy(
  "candy",
  360,
  280,
  650,
  0.72
);


addGroundEnemy(
  "cupcake",
  1450,
  1380,
  1630,
  0.62
);


addGroundEnemy(
  "chocolate",
  2360,
  2280,
  2680,
  0.58
);


addGroundEnemy(
  "candy",
  4490,
  4410,
  4820,
  0.74
);


addGroundEnemy(
  "chocolate",
  6100,
  6030,
  6280,
  0.60
);


// =====================================================
// 12 TREATS
// =====================================================

addTreat(
  "chocolate",
  260,
  145
);


addTreat(
  "candy",
  585,
  255
);


addTreat(
  "noodles",
  900,
  325
);


addTreat(
  "chocolate",
  1430,
  275
);


addTreat(
  "candy",
  1870,
  295
);


addTreat(
  "chocolate",
  2240,
  435
);


addTreat(
  "candy",
  2570,
  300
);


addTreat(
  "chocolate",
  3120,
  255
);


addTreat(
  "noodles",
  3800,
  250
);


addTreat(
  "candy",
  4660,
  415
);


addTreat(
  "chocolate",
  6120,
  440
);


addTreat(
  "golden",
  7280,
  300,
  true
);


// =====================================================
// TREAT STATE
// =====================================================

const TOTAL_TREATS =
  treats.length;


let collectedTreats =
  0;


// =====================================================
// SURFACES
// =====================================================

function getAllSurfaces() {

  const surfaces =
    [];


  fixedSurfaces.forEach(
    (surface) => {

      surfaces.push({

        x:
          surface.x,

        width:
          surface.width,

        top:
          surface.top,

        moving:
          null

      });

    }
  );


  movingPlatforms.forEach(
    (platform) => {

      surfaces.push({

        x:
          platform.x,

        width:
          platform.width,

        top:
          platform.top,

        moving:
          platform

      });

    }
  );


  pipes.forEach(
    (pipe) => {

      surfaces.push({

        x:
          pipe.x + 10,

        width:
          pipe.width - 20,

        top:
          pipe.top,

        moving:
          null

      });

    }
  );


  return surfaces;

}


// =====================================================
// MOVING PLATFORMS
// =====================================================

function updateMovingPlatforms() {

  movingPlatforms.forEach(
    (platform) => {

      platform.previousX =
        platform.x;


      platform.previousY =
        platform.y;


      if (
        platform.axis === "x"
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
        platform.y + 42;


      platform.element.style.left =
        platform.x + "px";


      platform.element.style.bottom =
        platform.y + "px";


      if (
        standingOnMovingPlatform === platform &&
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


// =====================================================
// HORIZONTAL
// =====================================================

function updateHorizontal() {

  if (
    gameFinished ||
    gateOpening
  ) {

    return;

  }


  const oldX =
    playerX;


  if (
    keys["ArrowRight"]
  ) {

    playerX +=
      SPEED *
      frameFactor;

    facingRight =
      true;

  }


  if (
    keys["ArrowLeft"]
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
        playerX,
        WORLD_WIDTH - 100
      )
    );


  const player =
    getPlayerRect();


  pipes.forEach(
    (pipe) => {

      const horizontalOverlap =
        player.right >
        pipe.x + 10 &&
        player.left <
        pipe.x +
        pipe.width -
        10;


      const sideCollision =
        horizontalOverlap &&
        player.bottom <
        pipe.top - 2 &&
        player.top >
        pipe.y + 10;


      if (
        sideCollision
      ) {

        playerX =
          oldX;

      }

    }
  );

}


// =====================================================
// VERTICAL
// =====================================================

function updateVertical() {

  if (
    gameFinished ||
    gateOpening
  ) {

    return;

  }


  previousPlayerY =
    playerY;


  velocityBeforeVerticalCollision =
    velocityY;


  if (
    keys["Space"] &&
    jumpHoldFrames > 0 &&
    velocityY > 0
  ) {

    velocityY +=
      0.07 *
      frameFactor;


    jumpHoldFrames -=
      frameFactor;

  }


  velocityY -=
    GRAVITY *
    frameFactor;


  /*
    نخزن السرعة بعد الجاذبية وقبل الهبوط
    على الأنبوبة أو البلاتفورم.
  */

  velocityBeforeVerticalCollision =
    velocityY;


  if (
    velocityY <
    MAX_FALL_SPEED
  ) {

    velocityY =
      MAX_FALL_SPEED;


    velocityBeforeVerticalCollision =
      velocityY;

  }


  let nextY =
    playerY +
    velocityY *
    frameFactor;


  let landed =
    false;


  standingOnMovingPlatform =
    null;


  const playerCenterX =
    playerX +
    PLAYER_HITBOX_OFFSET_X +
    PLAYER_HITBOX_WIDTH / 2;


  if (
    nextY <=
    GROUND_HEIGHT
  ) {

    if (
      isInsideDeathPit(
        playerCenterX
      )
    ) {

      damagePlayerFromFall();

      return;

    }


    nextY =
      GROUND_HEIGHT;

    velocityY =
      0;

    jumping =
      false;

    landed =
      true;

  }


  if (
    velocityY <= 0 &&
    !landed
  ) {

    const surfaces =
      getAllSurfaces();


    for (
      const surface of surfaces
    ) {

      const playerLeft =
        playerX +
        PLAYER_HITBOX_OFFSET_X;


      const playerRight =
        playerLeft +
        PLAYER_HITBOX_WIDTH;


      const horizontal =
        playerRight >
        surface.x &&
        playerLeft <
        surface.x +
        surface.width;


      const crossed =
        previousPlayerY >=
        surface.top - 7 &&
        nextY <=
        surface.top;


      if (
        horizontal &&
        crossed
      ) {

        nextY =
          surface.top;


        velocityY =
          0;


        jumping =
          false;


        landed =
          true;


        if (
          surface.moving
        ) {

          standingOnMovingPlatform =
            surface.moving;

        }


        break;

      }

    }

  }


  playerY =
    nextY;


  if (
    !landed
  ) {

    jumping =
      true;

  }

}


// =====================================================
// FOFO ANIMATION
// =====================================================

function updateFofoAnimation(timestamp) {

  if (
    gateOpening
  ) {

    currentPose =
      "idle";


    setFofoImage(
      idleImage
    );


    return;

  }


  const moving =
    keys["ArrowRight"] ||
    keys["ArrowLeft"];


  if (
    jumping
  ) {

    currentPose =
      "jump";


    if (
      velocityY > 6.2
    ) {

      setFofoImage(
        jumpFrames[1]
      );

      return;

    }


    if (
      velocityY > 2.5
    ) {

      setFofoImage(
        jumpFrames[2]
      );

      return;

    }


    if (
      velocityY > -1
    ) {

      setFofoImage(
        jumpFrames[3]
      );

      return;

    }


    if (
      velocityY > -4.2
    ) {

      setFofoImage(
        jumpFrames[4]
      );

      return;

    }


    setFofoImage(
      jumpFrames[5]
    );


    return;

  }


  if (
    !moving
  ) {

    currentPose =
      "idle";


    setFofoImage(
      idleImage
    );


    currentRunFrame =
      0;


    return;

  }


  currentPose =
    "run";


  if (
    timestamp -
    lastRunAnimationTime >=
    RUN_FRAME_SPEED
  ) {

    currentRunFrame++;


    if (
      currentRunFrame >=
      runFrames.length
    ) {

      currentRunFrame =
        0;

    }


    setFofoImage(
      runFrames[
        currentRunFrame
      ]
    );


    lastRunAnimationTime =
      timestamp;

  }

}


// =====================================================
// GROUND ENEMIES
// =====================================================

function updateGroundEnemies(timestamp) {

  enemies.forEach(
    (enemy) => {

      if (
        enemy.dead
      ) {

        return;

      }


      if (
        enemy.state === "walk"
      ) {

        enemy.x +=
          enemy.speed *
          enemy.direction *
          frameFactor;


        if (
          enemy.x >=
          enemy.maxX
        ) {

          enemy.x =
            enemy.maxX;

          enemy.direction =
            -1;

        }


        if (
          enemy.x <=
          enemy.minX
        ) {

          enemy.x =
            enemy.minX;

          enemy.direction =
            1;

        }


        enemy.element.style.left =
          enemy.x + "px";


        enemy.element.style.transform =
          enemy.direction === 1
            ? "scaleX(1)"
            : "scaleX(-1)";


        const frames =
          enemyAssets[
            enemy.type
          ].walk;


        if (
          timestamp -
          enemy.lastFrameTime >=
          120
        ) {

          enemy.frame++;


          if (
            enemy.frame >=
            frames.length
          ) {

            enemy.frame =
              0;

          }


          enemy.element.src =
            frames[
              enemy.frame
            ];


          enemy.lastFrameTime =
            timestamp;

        }

      }


      else if (
        enemy.state === "hurt"
      ) {

        const frames =
          enemyAssets[
            enemy.type
          ].hurt;


        if (
          timestamp -
          enemy.lastFrameTime >=
          95
        ) {

          enemy.frame++;


          enemy.lastFrameTime =
            timestamp;


          if (
            enemy.frame >=
            frames.length
          ) {

            enemy.state =
              "death";


            enemy.frame =
              0;


            enemy.element.src =
              enemyAssets[
                enemy.type
              ].death[0];

          }

          else {

            enemy.element.src =
              frames[
                enemy.frame
              ];

          }

        }

      }


      else if (
        enemy.state === "death"
      ) {

        const frames =
          enemyAssets[
            enemy.type
          ].death;


        if (
          timestamp -
          enemy.lastFrameTime >=
          105
        ) {

          enemy.frame++;


          enemy.lastFrameTime =
            timestamp;


          if (
            enemy.frame >=
            frames.length
          ) {

            enemy.dead =
              true;


            enemy.element.style.display =
              "none";

          }

          else {

            enemy.element.src =
              frames[
                enemy.frame
              ];

          }

        }

      }

    }
  );

}


// =====================================================
// GROUND ENEMY COLLISION
// =====================================================

function checkGroundEnemyCollision() {

  if (
    invincible ||
    gameFinished ||
    gateOpening
  ) {

    return;

  }


  const player =
    getPlayerRect();


  enemies.forEach(
    (enemy) => {

      if (
        enemy.dead ||
        enemy.state !== "walk"
      ) {

        return;

      }


      const rect = {

        left:
          enemy.x + 10,

        right:
          enemy.x +
          enemy.size -
          10,

        bottom:
          enemy.bottom,

        top:
          enemy.bottom +
          enemy.size -
          16

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
        velocityBeforeVerticalCollision < -0.5 &&
        previousPlayerY >=
        rect.top - 22;


      if (
        stomp
      ) {

        enemy.state =
          "hurt";


        enemy.frame =
          0;


        enemy.lastFrameTime =
          performance.now();


        enemy.element.src =
          enemyAssets[
            enemy.type
          ].hurt[0];


        playerY =
          rect.top + 3;


        velocityY =
          6.7;


        jumping =
          true;


        message.textContent =
          "Monster defeated! 💥";

      }

      else {

        damagePlayerFromEnemy(
          enemy.x
        );

      }

    }
  );

}


// =====================================================
// SMOOTH PIPE ENEMIES
// =====================================================

function updatePipeEnemies(timestamp) {

  const HIDDEN_TIME =
    1300;

  const RISE_TIME =
    800;

  const UP_TIME =
    1500;

  const LOWER_TIME =
    700;


  pipeEnemies.forEach(
    (enemy) => {

      if (
        enemy.dead
      ) {

        return;

      }


      const elapsed =
        timestamp -
        enemy.stateStarted;


      // -------------------------
      // HIDDEN
      // -------------------------

      if (
        enemy.state === "hidden"
      ) {

        enemy.bottom =
          enemy.hiddenBottom;


        enemy.element.style.bottom =
          enemy.bottom + "px";


        updatePipeEnemyClip(
          enemy
        );


        if (
          elapsed >=
          HIDDEN_TIME
        ) {

          enemy.state =
            "rising";


          enemy.stateStarted =
            timestamp;

        }


        return;

      }


      // -------------------------
      // RISING
      // -------------------------

      if (
        enemy.state === "rising"
      ) {

        let progress =
          elapsed /
          RISE_TIME;


        progress =
          Math.min(
            1,
            progress
          );


        const smoothProgress =
          easeOutCubic(
            progress
          );


        enemy.bottom =
          enemy.hiddenBottom +
          (
            enemy.visibleBottom -
            enemy.hiddenBottom
          ) *
          smoothProgress;


        enemy.element.style.bottom =
          enemy.bottom + "px";


        updatePipeEnemyClip(
          enemy
        );


        if (
          progress >= 1
        ) {

          enemy.bottom =
            enemy.visibleBottom;


          enemy.element.style.bottom =
            enemy.bottom + "px";


          updatePipeEnemyClip(
            enemy
          );


          enemy.state =
            "up";


          enemy.stateStarted =
            timestamp;

        }


        return;

      }


      // -------------------------
      // UP
      // -------------------------

      if (
        enemy.state === "up"
      ) {

        enemy.bottom =
          enemy.visibleBottom;


        enemy.element.style.bottom =
          enemy.bottom + "px";


        updatePipeEnemyClip(
          enemy
        );


        if (
          elapsed >=
          UP_TIME
        ) {

          enemy.state =
            "lowering";


          enemy.stateStarted =
            timestamp;

        }


        return;

      }


      // -------------------------
      // LOWERING
      // -------------------------

      if (
        enemy.state === "lowering"
      ) {

        let progress =
          elapsed /
          LOWER_TIME;


        progress =
          Math.min(
            1,
            progress
          );


        const smoothProgress =
          easeInCubic(
            progress
          );


        enemy.bottom =
          enemy.visibleBottom -
          (
            enemy.visibleBottom -
            enemy.hiddenBottom
          ) *
          smoothProgress;


        enemy.element.style.bottom =
          enemy.bottom + "px";


        updatePipeEnemyClip(
          enemy
        );


        if (
          progress >= 1
        ) {

          enemy.bottom =
            enemy.hiddenBottom;


          enemy.element.style.bottom =
            enemy.bottom + "px";


          updatePipeEnemyClip(
            enemy
          );


          enemy.state =
            "hidden";


          enemy.stateStarted =
            timestamp;

        }

      }

    }
  );

}


// =====================================================
// PIPE ENEMY COLLISION
// FAIR VERSION
// =====================================================

function checkPipeEnemyCollision() {

  if (
    invincible ||
    gameFinished ||
    gateOpening
  ) {

    return;

  }


  const player =
    getPlayerRect();


  pipeEnemies.forEach(
    (enemy) => {

      if (
        enemy.dead ||
        enemy.state === "hidden"
      ) {

        return;

      }


      /*
        رأس/أعلى صورة الوحش في العالم.
      */

      const enemyTop =
        enemy.bottom +
        enemy.height;


      /*
        قد إيه من الوحش ظاهر فعلًا فوق فتحة الأنبوبة.
      */

      const exposedHeight =
        Math.max(
          0,
          enemyTop -
          enemy.pipe.top
        );


      /*
        لو طالع منه كام Pixel بس،
        لسه مش هنحسب أي Collision.
      */

      const MIN_VISIBLE_FOR_COLLISION =
        14;


      if (
        exposedHeight <
        MIN_VISIBLE_FOR_COLLISION
      ) {

        return;

      }


      /*
        Collision العرض فقط حوالين جسم الوحش.
      */

      const enemyLeft =
        enemy.x + 8;


      const enemyRight =
        enemy.x +
        enemy.width -
        8;


      const horizontalOverlap =
        player.right >
        enemyLeft &&
        player.left <
        enemyRight;


      if (
        !horizontalOverlap
      ) {

        return;

      }


      /*
        منطقة الوحش الظاهرة تبدأ من حافة الأنبوبة
        وتنتهي عند رأس الوحش.
      */

      const visibleRect = {

        left:
          enemyLeft,

        right:
          enemyRight,

        bottom:
          enemy.pipe.top,

        top:
          enemyTop

      };


      /*
        =================================================
        STOMP

        المهم هنا إننا بنستخدم:
        velocityBeforeVerticalCollision
        previousPlayerY

        يعني حتى لو اللعبة وقفت فوفو على سطح الأنبوبة
        في نفس الفريم، لسه نعرف إنها كانت نازلة.
        =================================================
      */

      const wasFalling =
        velocityBeforeVerticalCollision <
        -0.35;


      /*
        مساحة سماح كبيرة نسبيًا علشان القفزة
        تبقى مريحة على الموبايل.
      */

      const STOMP_GRACE =
        30;


      const cameFromAbove =
        previousPlayerY >=
        enemyTop -
        STOMP_GRACE;


      const reachedMonsterTop =
        playerY <=
        enemyTop +
        15;


      const stomp =
        wasFalling &&
        cameFromAbove &&
        reachedMonsterTop;


      if (
        stomp
      ) {

        enemy.dead =
          true;


        enemy.state =
          "dead";


        enemy.element.style.display =
          "none";


        /*
          نحط فوفو فوق رأس الوحش قبل الـbounce
          علشان ما يحصلش Frame بعدها تتخبط فيه.
        */

        playerY =
          enemyTop + 4;


        velocityY =
          7.2;


        velocityBeforeVerticalCollision =
          7.2;


        jumping =
          true;


        jumpHoldFrames =
          0;


        message.textContent =
          "Pipe monster defeated! 🍰💥";


        return;

      }


      /*
        =================================================
        SIDE DAMAGE

        أثناء rising أو lowering:
        الوحش لسه داخل/خارج الأنبوبة،
        فمش هنخليه يضر فوفو من الجنب.

        الضرر يبدأ فقط لما يكون طالع بالكامل.
        =================================================
      */

      if (
        enemy.state !== "up"
      ) {

        return;

      }


      /*
        لما يكون UP بالكامل،
        نحسب جسمه المرئي كعدو عادي.
      */

      if (
        overlap(
          player,
          visibleRect
        )
      ) {

        damagePlayerFromEnemy(
          enemy.x
        );

      }

    }
  );

}


// =====================================================
// TREATS
// =====================================================

function checkTreats() {

  if (
    gateOpening
  ) {

    return;

  }


  const player =
    getPlayerRect();


  treats.forEach(
    (treat) => {

      if (
        treat.collected
      ) {

        return;

      }


      const collisionSize =
        treat.size *
        0.72;


      const padding =
        (
          treat.size -
          collisionSize
        ) /
        2;


      const rect = {

        left:
          treat.x +
          padding,

        right:
          treat.x +
          treat.size -
          padding,

        bottom:
          treat.y +
          padding,

        top:
          treat.y +
          treat.size -
          padding

      };


      if (
        overlap(
          player,
          rect
        )
      ) {

        treat.collected =
          true;


        treat.element.style.display =
          "none";


        collectedTreats++;


        updateTreatHud();


        message.textContent =
          `Treat ${collectedTreats} / ${TOTAL_TREATS} collected! 💖`;


        if (
          collectedTreats ===
          TOTAL_TREATS
        ) {

          setGateUnlocked();

        }

      }

    }
  );

}


// =====================================================
// CHECKPOINT
// =====================================================

function updateCheckpoint() {

  checkpoints.forEach(
    (checkpoint) => {

      if (
        !checkpoint.activated &&
        playerX >= checkpoint.x
      ) {

        checkpoint.activated =
          true;


        respawnX =
          checkpoint.x + 20;


        message.textContent =
          "Checkpoint reached! 💖";

      }

    }
  );

}


// =====================================================
// GATE CHECK
// =====================================================

function checkGate() {

  if (
    gameFinished ||
    gateOpening
  ) {

    return;

  }


  const playerCenter =
    playerX + 44;


  const gateCenter =
    GATE_X + 77;


  const distance =
    Math.abs(
      playerCenter -
      gateCenter
    );


  if (
    distance > 92
  ) {

    return;

  }


  if (
    collectedTreats <
    TOTAL_TREATS
  ) {

    message.textContent =
      `Gate locked! Missing ${TOTAL_TREATS - collectedTreats} treat(s) 🔒`;


    return;

  }


  facingRight =
    true;


  playerX =
    GATE_X - 28;


  playerY =
    GROUND_HEIGHT;


  openGate();

}


// =====================================================
// CAMERA
// =====================================================

function updateCamera() {

  const viewportWidth =
    gameArea.clientWidth;


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
      gameArea
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


// =====================================================
// RETRY
// =====================================================

retryButton?.addEventListener(
  "click",
  () => {

    health =
      3;


    updateHealth();


    collectedTreats =
      0;


    updateTreatHud();


    setGateLocked();


    treats.forEach(
      (treat) => {

        treat.collected =
          false;


        treat.element.style.display =
          "block";

      }
    );


    enemies.forEach(
      (enemy) => {

        enemy.dead =
          false;


        enemy.state =
          "walk";


        enemy.frame =
          0;


        enemy.x =
          enemy.startX;


        enemy.direction =
          1;


        enemy.element.style.left =
          enemy.x + "px";


        enemy.element.style.display =
          "block";


        enemy.element.src =
          enemyAssets[
            enemy.type
          ].walk[0];

      }
    );


    pipeEnemies.forEach(
      (enemy) => {

        enemy.dead =
          false;


        enemy.state =
          "hidden";


        enemy.stateStarted =
          performance.now();


        enemy.bottom =
          enemy.hiddenBottom;


        enemy.element.style.bottom =
          enemy.hiddenBottom +
          "px";


        enemy.element.style.display =
          "block";


        updatePipeEnemyClip(
          enemy
        );

      }
    );


    checkpoints.forEach(
      (checkpoint) => {

        checkpoint.activated =
          false;

      }
    );


    respawnX =
      120;


    playerX =
      120;


    playerY =
      GROUND_HEIGHT;


    previousPlayerY =
      playerY;


    velocityY =
      0;


    velocityBeforeVerticalCollision =
      0;


    jumping =
      false;


    facingRight =
      true;


    invincible =
      false;


    gameFinished =
      false;


    gateOpening =
      false;


    fofo.classList.remove(
      "hurt"
    );


    gameOverScreen.classList.remove(
      "show"
    );


    finishScreen.classList.remove(
      "show"
    );


    message.textContent =
      "Collect all treats and reach the gate! 💖";

  }
);


// =====================================================
// GIFT
// =====================================================

giftButton?.addEventListener(
  "click",
  () => {

    alert(
      "🎁 Gift reveal coming next!"
    );

  }
);


// =====================================================
// START
// =====================================================

function initializeGame() {

  health =
    3;


  collectedTreats =
    0;


  gameFinished =
    false;


  gateOpening =
    false;


  previousPlayerY =
    playerY;


  velocityBeforeVerticalCollision =
    0;


  updateHealth();


  updateTreatHud();


  setGateLocked();


  setFofoImage(
    idleImage
  );


  renderPlayer();


  pipeEnemies.forEach(
    (enemy) => {

      enemy.element.style.display =
        "block";


      updatePipeEnemyClip(
        enemy
      );

    }
  );


  message.textContent =
    "Collect all treats and reach the gate! 💖";

}


// =====================================================
// LOOP
// =====================================================

function gameLoop(timestamp) {

  updateFrameFactor(
    timestamp
  );

  updateMovingPlatforms();


  updatePipeEnemies(
    timestamp
  );


  updateGroundEnemies(
    timestamp
  );


  updateHorizontal();


  updateVertical();


  /*
    مهم:
    Collision بتاع Pipe Enemy بعد الـVertical مباشرة.
    علشان نعرف فوفو كانت جاية من فوق قبل أي حاجة تانية.
  */

  checkPipeEnemyCollision();


  updateFofoAnimation(
    timestamp
  );


  updateInvincibility(
    timestamp
  );


  renderPlayer();


  checkGroundEnemyCollision();


  checkTreats();


  updateCheckpoint();


  checkGate();


  updateCamera();


  requestAnimationFrame(
    gameLoop
  );

}


// =====================================================
// RUN
// =====================================================

initializeGame();


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
