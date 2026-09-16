// =========================================================
// LEVEL 4 — BRIGHTER HORIZONS
// Final Birthday Level
// =========================================================

const game = document.getElementById("game");
const world = document.getElementById("world");

const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const btnJump = document.getElementById("btnJump");

const heartImages = [
  document.getElementById("heart1"),
  document.getElementById("heart2"),
  document.getElementById("heart3")
];

const counterImage = document.getElementById("counterImage");
const messageBox = document.getElementById("messageBox");

const finale = document.getElementById("finale");
const revealPage = document.getElementById("revealPage");
const datePage = document.getElementById("datePage");
const storyPage = document.getElementById("storyPage");

const revealDateButton = document.getElementById("revealDateButton");
const giftStoryButton = document.getElementById("giftStoryButton");
const continueButton = document.getElementById("continueButton");

// =========================================================
// WORLD / PLAYER
// =========================================================

const WORLD_WIDTH = 11250;
const GROUND_Y = 112;

world.style.width = WORLD_WIDTH + "px";

const SPEED = 2.5;
const GRAVITY = .255;
const JUMP_POWER = 10.9;
const MAX_FALL = -6.7;

const PLAYER_W = 88;
const HITBOX_W = 48;
const HITBOX_H = 91;
const HITBOX_X = 20;

let playerX = 120;
let playerY = GROUND_Y;
let previousY = playerY;
let velocityY = 0;
let velocityBeforeCollision = 0;

let jumping = false;
let facingRight = true;
let health = 3;
let invincible = false;
let invincibleUntil = 0;
let finished = false;

let respawnX = 120;
let respawnY = GROUND_Y;

let currentSurface = null;
let standingMoving = null;

const keys = {
  left:false,
  right:false,
  jump:false
};

const surfaces = [];
const movingPlatforms = [];
const shards = [];
const groundEnemies = [];
const flyingEnemies = [];
const checkpoints = [];
const steamVents = [];

let collected = 0;
const TOTAL = 25;

let puzzleSolved = false;
let portal = null;


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
// PLAYER
// =========================================================

// =========================================================
// OLD FOFO CHARACTER — SAME CHARACTER USED IN THE EARLIER LEVELS
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

[
  idleImage,
  ...runFrames,
  ...jumpFrames
].forEach(src => {
  const preload = new Image();
  preload.src = src;
});

const POSE_SETTINGS = {
  idle: {
    scale: 1,
    offsetY: -8
  },

  run: {
    scale: .92,
    offsetY: -14
  },

  jump: {
    scale: .95,
    offsetY: -12
  }
};

let currentPose =
  "idle";

let currentRunFrame =
  0;

let lastRunAnimationTime =
  0;

const RUN_FRAME_SPEED =
  115;


const player =
  document.createElement("img");

player.className =
  "player";

player.src =
  idleImage;

player.draggable =
  false;

world.appendChild(
  player
);


function playerRect(){

  return {
    left:
      playerX +
      HITBOX_X,

    right:
      playerX +
      HITBOX_X +
      HITBOX_W,

    bottom:
      playerY,

    top:
      playerY +
      HITBOX_H
  };
}


function overlap(a,b){

  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.top < b.bottom ||
    a.bottom > b.top
  );
}


function setPlayerImage(src){

  if(
    player.getAttribute("src") !==
    src
  ){
    player.src =
      src;
  }
}


function applyPlayerVisual(){

  const pose =
    POSE_SETTINGS[
      currentPose
    ];

  const scale =
    pose.scale;

  const flip =
    facingRight
      ? scale
      : -scale;

  player.style.transform =
    `scaleX(${flip}) scaleY(${scale})`;
}


function renderPlayer(){

  const pose =
    POSE_SETTINGS[
      currentPose
    ];

  /*
    Keep the old Fofo animation exactly as before,
    but visually lower her a little so her shoes sit on
    the actual stone surface instead of floating above it.
  */
  let surfaceAdjustment =
    0;

  if(
    !jumping &&
    currentSurface
  ){
    /*
      New visual alignment for Level 4:
      - on ground: raise Fofo a little
      - on platforms / moving platforms: lower her a little
        so her feet sit naturally on top surfaces.
    */
    surfaceAdjustment =
      currentSurface.type === "ground"
        ? -2
        : -14;
  }

  player.style.left =
    playerX + "px";

  player.style.bottom =
    (
      playerY +
      pose.offsetY +
      surfaceAdjustment
    ) + "px";

  applyPlayerVisual();
}

// =========================================================
// AUDIO
// =========================================================

const requestedMusic =
  new Audio(
    "assets/level4/audio/egypt-egyptian-desert-music-511853.mp3"
  );

const fallbackMusic =
  new Audio(
    "assets/level4/audio/fallback_music.mp3"
  );

requestedMusic.loop = true;
fallbackMusic.loop = true;

const sounds = {
  jump:new Audio("assets/level4/audio/jump.wav"),
  collect:new Audio("assets/level4/audio/collect.wav"),
  enemy:new Audio("assets/level4/audio/enemy.wav"),
  hurt:new Audio("assets/level4/audio/hurt.wav"),
  puzzle:new Audio("assets/level4/audio/puzzle_success.wav"),
  checkpoint:new Audio("assets/level4/audio/checkpoint.wav"),
  portal:new Audio("assets/level4/audio/portal.wav"),
  finale:new Audio("assets/level4/audio/finale.wav")
};

let audioStarted = false;
let activeMusic = requestedMusic;

const musicEnabled =
  localStorage.getItem("fofoMusicEnabled") !== "false";

const sfxEnabled =
  localStorage.getItem("fofoSfxEnabled") !== "false";

const musicVolume =
  Number(localStorage.getItem("fofoMusicVolume") ?? 100) / 100;

const sfxVolume =
  Number(localStorage.getItem("fofoSfxVolume") ?? 100) / 100;

function startAudio(){

  if(audioStarted){
    return;
  }

  audioStarted = true;

  requestedMusic.volume =
    musicEnabled
      ? Math.min(1,musicVolume * .94)
      : 0;

  fallbackMusic.volume =
    musicEnabled
      ? Math.min(1,musicVolume * .56)
      : 0;

  if(!musicEnabled){
    return;
  }

  requestedMusic
    .play()
    .catch(() => {
      activeMusic = fallbackMusic;
      fallbackMusic
        .play()
        .catch(() => {});
    });
}

function sfx(name,gain=1){

  if(
    !audioStarted ||
    !sfxEnabled ||
    !sounds[name]
  ){
    return;
  }

  const audio =
    sounds[name].cloneNode(true);

  audio.volume =
    Math.min(
      1,
      sfxVolume *
      .46 *
      gain
    );

  audio
    .play()
    .catch(() => {});
}

document.addEventListener(
  "pointerdown",
  startAudio,
  {once:true}
);

document.addEventListener(
  "keydown",
  startAudio,
  {once:true}
);

// =========================================================
// HELPERS
// =========================================================

function image(
  src,
  className,
  x,
  bottom,
  width,
  height
){
  const el =
    document.createElement("img");

  el.src = src;
  el.className =
    "asset " + className;

  el.draggable = false;

  el.style.left =
    x + "px";

  el.style.bottom =
    bottom + "px";

  el.style.width =
    width + "px";

  el.style.height =
    height + "px";

  world.appendChild(el);

  return el;
}

function div(
  className,
  x,
  bottom,
  width,
  height
){
  const el =
    document.createElement("div");

  el.className = className;

  el.style.left =
    x + "px";

  el.style.bottom =
    bottom + "px";

  if(width !== null){
    el.style.width =
      width + "px";
  }

  if(height !== null){
    el.style.height =
      height + "px";
  }

  world.appendChild(el);

  return el;
}

// =========================================================
// GROUND / PLATFORMS
// =========================================================

function addGround(x,width){
  div(
    "ground",
    x,
    0,
    width,
    118
  );

  surfaces.push({
    type:"ground",
    x,
    width,
    top:GROUND_Y,
    enabled:true
  });
}

function addPlatform(
  x,
  bottom,
  width,
  kind="long"
){
  const short =
    kind === "short";

  const src =
    short
      ? "assets/level4/world/platform_short.png"
      : "assets/level4/world/platform_long.png";

  const height =
    short ? 98 : 104;

  const el =
    image(
      src,
      "platform",
      x,
      bottom,
      width,
      height
    );

  surfaces.push({
    type:"platform",
    x:x+8,
    width:width-16,
    top:bottom+height-8,
    enabled:true,
    element:el
  });

  return el;
}

function addMovingPlatform(
  x,
  bottom,
  width,
  axis,
  min,
  max,
  speed
){
  const height = 100;

  const el =
    image(
      "assets/level4/world/platform_moving.png",
      "platform moving-platform",
      x,
      bottom,
      width,
      height
    );

  const p = {
    type:"moving",
    x,
    y:bottom,
    width,
    height,
    top:bottom+height-8,
    axis,
    min,
    max,
    speed,
    direction:1,
    previousX:x,
    previousY:bottom,
    enabled:true,
    element:el
  };

  movingPlatforms.push(p);
  surfaces.push(p);

  return p;
}

function addCheckpoint(
  triggerX,
  spawnX
){
  const visualX =
    triggerX - 75;

  const el =
    image(
      "assets/level4/world/checkpoint.png",
      "checkpoint-art",
      visualX,
      GROUND_Y-4,
      145,
      168
    );

  checkpoints.push({
    triggerX,
    spawnX,
    reached:false,
    element:el
  });
}

function addShard(
  x,
  bottom,
  golden=false
){
  const el =
    image(
      "assets/level4/world/pyramid_shard.png",
      "shard",
      x,
      bottom,
      58,
      62
    );

  if(golden){
    el.style.filter +=
      " brightness(1.25) drop-shadow(0 0 16px #fff0a3)";
  }

  shards.push({
    x,
    bottom,
    width:58,
    height:62,
    collected:false,
    golden,
    element:el
  });
}

function addCat(
  x,
  min,
  max
){
  const bottom =
    GROUND_Y - 1;

  const el =
    image(
      "assets/level4/world/enemy_cat.png",
      "enemy",
      x,
      bottom,
      80,
      90
    );

  groundEnemies.push({
    x,
    min,
    max,
    bottom,
    width:80,
    height:90,
    direction:1,
    speed:.56,
    dead:false,
    element:el
  });
}

function addOwl(
  x,
  bottom,
  range,
  phase=0
){
  const el =
    image(
      "assets/level4/world/enemy_owl.png",
      "enemy",
      x,
      bottom,
      96,
      80
    );

  flyingEnemies.push({
    baseX:x,
    x,
    previousX:x,
    baseBottom:bottom,
    bottom,
    range,
    phase,
    width:96,
    height:80,
    dead:false,
    element:el
  });
}

function addSteam(x){
  const el =
    image(
      "assets/level4/world/steam_vent.png",
      "steam-vent",
      x,
      GROUND_Y-3,
      105,
      180
    );

  steamVents.push({
    x:x+20,
    width:65,
    bottom:GROUND_Y,
    top:GROUND_Y+140,
    active:false,
    phase:x%1800,
    element:el
  });
}

function addPortal(x){
  const el =
    image(
      "assets/level4/world/portal.png",
      "portal",
      x,
      GROUND_Y-5,
      280,
      270
    );

  portal = {
    x,
    width:280,
    unlocked:false,
    element:el
  };
}

// =========================================================
// MAP — EXTENDED FINAL REDESIGN
// Six connected acts with cleaner rhythm and longer playtime.
// =========================================================

// ---------------------------------------------------------
// ACT 1 — SUNSET WALK
// ---------------------------------------------------------

addGround(
  0,
  1700
);

addPlatform(
  500,
  185,
  275,
  "long"
);

addCat(
  900,
  820,
  1080
);

addPlatform(
  1220,
  245,
  225,
  "short"
);

addCheckpoint(
  1510,
  1460
);


// ---------------------------------------------------------
// ACT 2 — FLOATING TERRACES
// ---------------------------------------------------------

addMovingPlatform(
  1770,
  160,
  215,
  "y",
  155,
  300,
  .62
);

addMovingPlatform(
  2040,
  235,
  220,
  "x",
  1980,
  2160,
  .74
);

addGround(
  2300,
  1250
);

addPlatform(
  2510,
  205,
  235,
  "short"
);

addOwl(
  2920,
  330,
  110,
  .8
);

addPlatform(
  3160,
  255,
  270,
  "long"
);

addCheckpoint(
  3380,
  3330
);


// ---------------------------------------------------------
// ACT 3 — DAWN → LIFE → LOVE
// ---------------------------------------------------------

addGround(
  3600,
  1120
);

const puzzle =
  div(
    "puzzle-panel",
    3730,
    390,
    500,
    90
  );

puzzle.innerHTML =
  "<small>READ THE HORIZON</small><strong>☀ → 𓋹 → ♥</strong>";


const pads = [];


function addPad(
  x,
  symbol,
  value
){

  const el =
    div(
      "riddle-pad",
      x,
      GROUND_Y+2,
      105,
      58
    );

  el.textContent =
    symbol;

  pads.push({
    x,
    value,
    element:el,
    touching:false
  });
}


addPad(
  3790,
  "☀",
  0
);

addPad(
  4000,
  "𓋹",
  1
);

addPad(
  4210,
  "♥",
  2
);

addCat(
  4450,
  4380,
  4600
);


// ---------------------------------------------------------
// PUZZLE BRIDGE
// ---------------------------------------------------------

const bridgeSurfaces =
  [];


for(
  let i=0;
  i<4;
  i++
){

  const bx =
    4800 +
    i*165;


  const el =
    image(
      "assets/level4/world/platform_short.png",
      "platform bridge",
      bx,
      178,
      174,
      96
    );


  const surface = {
    type:"bridge",

    x:
      bx+8,

    width:
      158,

    top:
      178+88,

    enabled:
      false,

    element:
      el
  };


  el.style.opacity =
    "0";

  el.style.transform =
    "translateY(30px)";


  surfaces.push(
    surface
  );

  bridgeSurfaces.push(
    surface
  );
}


addGround(
  5500,
  1120
);

addCheckpoint(
  5710,
  5660
);


// ---------------------------------------------------------
// ACT 4 — LANTERN PROMENADE
// ---------------------------------------------------------

addSteam(
  5940
);

addPlatform(
  6140,
  210,
  235,
  "short"
);

addOwl(
  6500,
  335,
  115,
  1.4
);

addSteam(
  6760
);

addPlatform(
  6990,
  255,
  265,
  "long"
);

addGround(
  6620,
  980
);


// ---------------------------------------------------------
// ACT 5 — HIGH HORIZON
// ---------------------------------------------------------

addMovingPlatform(
  7680,
  190,
  215,
  "y",
  180,
  330,
  .64
);

addPlatform(
  7970,
  220,
  215,
  "short"
);

addGround(
  8200,
  1150
);

addCat(
  8500,
  8420,
  8700
);

addPlatform(
  8830,
  255,
  260,
  "long"
);

addSteam(
  9140
);

addCheckpoint(
  9250,
  9200
);


// ---------------------------------------------------------
// ACT 6 — THE LAST VIEW
// A longer final traversal before the date portal.
// ---------------------------------------------------------

addMovingPlatform(
  9470,
  180,
  215,
  "x",
  9410,
  9600,
  .70
);

addMovingPlatform(
  9730,
  245,
  210,
  "y",
  165,
  295,
  .66
);

addOwl(
  9940,
  340,
  100,
  2.0
);

addPlatform(
  10110,
  200,
  230,
  "short"
);

addGround(
  10050,
  WORLD_WIDTH-
  10050
);

addCheckpoint(
  10240,
  10190
);

addCat(
  10460,
  10380,
  10670
);

addPlatform(
  10680,
  255,
  255,
  "long"
);

addPortal(
  10910
);


// ---------------------------------------------------------
// EXACTLY 25 PYRAMID MEMORIES
// ---------------------------------------------------------

const shardLayout = [

  [280,154,false],
  [610,268,false],
  [1080,154,false],
  [1320,358,false],

  [1835,281,false],
  [2095,368,false],
  [2390,154,false],
  [2600,281,false],

  [3230,378,false],
  [3690,154,false],
  [4330,154,false],
  [4620,156,false],

  [4910,314,false],
  [5230,314,false],
  [5600,154,false],
  [6215,311,false],

  [6700,154,false],
  [7070,381,false],
  [7760,321,false],
  [8290,154,false],

  [8900,378,false],
  [9290,154,false],
  [9800,371,false],
  [10320,306,false],

  [10770,154,true]
];


shardLayout.forEach(
  item => {

    addShard(
      item[0],
      item[1],
      item[2]
    );
  }
);

// =========================================================
// HUD / MESSAGE
// =========================================================

let messageTimer = null;

function showMessage(
  text,
  duration=1250
){
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
      () =>
        messageBox.classList.add(
          "hidden"
        ),
      duration
    );
}

function updateHUD(){

  heartImages.forEach(
    (heart,index) => {

      heart.src =
        index < health
          ? "assets/level4/ui/heart_full.png"
          : "assets/level4/ui/heart_empty.png";

    }
  );

  const c =
    Math.max(
      0,
      Math.min(
        25,
        collected
      )
    );

  counterImage.src =
    `assets/level4/ui/counter_${c}.png`;

  counterImage.alt =
    `${c} of 25`;
}

function popCounter(){

  counterImage.classList.remove(
    "pop"
  );

  void counterImage.offsetWidth;

  counterImage.classList.add(
    "pop"
  );
}

// =========================================================
// INPUT
// =========================================================

function jump(){

  if(
    finished ||
    jumping
  ){
    return;
  }

  velocityY =
    JUMP_POWER;

  jumping = true;

  currentSurface = null;
  standingMoving = null;

  sfx(
    "jump",
    .60
  );
}

window.addEventListener(
  "keydown",
  event => {

    startAudio();

    if(
      event.code === "ArrowLeft" ||
      event.code === "KeyA"
    ){
      keys.left = true;
    }

    if(
      event.code === "ArrowRight" ||
      event.code === "KeyD"
    ){
      keys.right = true;
    }

    if(
      event.code === "Space" ||
      event.code === "ArrowUp" ||
      event.code === "KeyW"
    ){
      event.preventDefault();

      if(!keys.jump){
        keys.jump = true;
        jump();
      }
    }
  }
);

window.addEventListener(
  "keyup",
  event => {

    if(
      event.code === "ArrowLeft" ||
      event.code === "KeyA"
    ){
      keys.left = false;
    }

    if(
      event.code === "ArrowRight" ||
      event.code === "KeyD"
    ){
      keys.right = false;
    }

    if(
      event.code === "Space" ||
      event.code === "ArrowUp" ||
      event.code === "KeyW"
    ){
      keys.jump = false;
    }
  }
);

function bindButton(
  button,
  key
){
  let active = false;

  const down =
    event => {

      event.preventDefault();
      startAudio();

      if(active){
        return;
      }

      active = true;

      keys[key] = true;

      button.classList.add(
        "pressed"
      );

      if(key === "jump"){
        jump();
      }
    };

  const up =
    event => {

      if(event){
        event.preventDefault();
      }

      active = false;

      keys[key] = false;

      button.classList.remove(
        "pressed"
      );
    };

  button.addEventListener(
    "pointerdown",
    down
  );

  button.addEventListener(
    "pointerup",
    up
  );

  button.addEventListener(
    "pointercancel",
    up
  );

  button.addEventListener(
    "pointerleave",
    up
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
// PHYSICS
// =========================================================

function updateMovingPlatforms(){

  movingPlatforms.forEach(
    platform => {

      platform.previousX =
        platform.x;

      platform.previousY =
        platform.y;

      if(
        platform.axis === "x"
      ){
        platform.x +=
          platform.speed *
          platform.direction *
          frameFactor;

        if(
          platform.x >=
          platform.max
        ){
          platform.x =
            platform.max;

          platform.direction =
            -1;
        }

        if(
          platform.x <=
          platform.min
        ){
          platform.x =
            platform.min;

          platform.direction =
            1;
        }

      }else{

        platform.y +=
          platform.speed *
          platform.direction *
          frameFactor;

        if(
          platform.y >=
          platform.max
        ){
          platform.y =
            platform.max;

          platform.direction =
            -1;
        }

        if(
          platform.y <=
          platform.min
        ){
          platform.y =
            platform.min;

          platform.direction =
            1;
        }
      }

      platform.top =
        platform.y +
        platform.height -
        8;

      platform.element.style.left =
        platform.x + "px";

      platform.element.style.bottom =
        platform.y + "px";

      if(
        standingMoving ===
        platform &&
        !jumping
      ){
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

function updateHorizontal(){

  if(finished){
    return;
  }

  if(keys.right){
    playerX +=
      SPEED *
      frameFactor;
    facingRight = true;
  }

  if(keys.left){
    playerX -=
      SPEED *
      frameFactor;
    facingRight = false;
  }

  playerX =
    Math.max(
      0,
      Math.min(
        WORLD_WIDTH-PLAYER_W,
        playerX
      )
    );
}

function updateVertical(){

  if(finished){
    return;
  }

  previousY =
    playerY;

  velocityY -=
    GRAVITY *
    frameFactor;

  velocityY =
    Math.max(
      MAX_FALL,
      velocityY
    );

  velocityBeforeCollision =
    velocityY;

  let nextY =
    playerY +
    velocityY *
    frameFactor;

  currentSurface =
    null;

  standingMoving =
    null;

  let landing =
    null;

  if(
    velocityY <= 0
  ){

    const left =
      playerX +
      HITBOX_X +
      3;

    const right =
      left +
      HITBOX_W -
      6;

    surfaces.forEach(
      surface => {

        if(
          surface.enabled === false
        ){
          return;
        }

        const horizontal =
          right >
            surface.x &&
          left <
            surface.x +
            surface.width;

        const crossed =
          previousY >=
            surface.top - 24 &&
          nextY <=
            surface.top + 9;

        if(
          horizontal &&
          crossed
        ){

          if(
            !landing ||
            surface.top >
              landing.top
          ){
            landing =
              surface;
          }
        }
      }
    );
  }

  if(landing){

    nextY =
      landing.top;

    velocityY = 0;
    jumping = false;

    currentSurface =
      landing;

    if(
      landing.type ===
      "moving"
    ){
      standingMoving =
        landing;
    }

  }else{

    jumping = true;
  }

  playerY =
    nextY;

  if(
    playerY <
    -150
  ){
    damagePlayer();
  }
}

function updatePlayer(
  timestamp
){

  const moving =
    keys.left ||
    keys.right;


  if(jumping){

    currentPose =
      "jump";

    if(
      velocityY >
      6.2
    ){
      setPlayerImage(
        jumpFrames[1]
      );
      return;
    }


    if(
      velocityY >
      2.5
    ){
      setPlayerImage(
        jumpFrames[2]
      );
      return;
    }


    if(
      velocityY >
      -1.0
    ){
      setPlayerImage(
        jumpFrames[3]
      );
      return;
    }


    if(
      velocityY >
      -4.2
    ){
      setPlayerImage(
        jumpFrames[4]
      );
      return;
    }


    setPlayerImage(
      jumpFrames[5]
    );

    return;
  }


  if(!moving){

    currentPose =
      "idle";

    setPlayerImage(
      idleImage
    );

    currentRunFrame =
      0;

    return;
  }


  currentPose =
    "run";


  if(
    timestamp -
    lastRunAnimationTime >=
    RUN_FRAME_SPEED
  ){

    currentRunFrame++;

    if(
      currentRunFrame >=
      runFrames.length
    ){
      currentRunFrame =
        0;
    }


    setPlayerImage(
      runFrames[
        currentRunFrame
      ]
    );


    lastRunAnimationTime =
      timestamp;
  }
}

// =========================================================
// ENEMIES / HAZARDS
// =========================================================

function updateEnemies(
  timestamp
){

  groundEnemies.forEach(
    enemy => {

      if(enemy.dead){
        return;
      }

      enemy.x +=
        enemy.speed *
        enemy.direction *
          frameFactor;

      if(
        enemy.x >=
        enemy.max
      ){
        enemy.x =
          enemy.max;

        enemy.direction =
          -1;
      }

      if(
        enemy.x <=
        enemy.min
      ){
        enemy.x =
          enemy.min;

        enemy.direction =
          1;
      }

      enemy.element.style.left =
        enemy.x + "px";

      enemy.element.style.transform =
        enemy.direction > 0
          ? "scaleX(-1)"
          : "scaleX(1)";
    }
  );

  flyingEnemies.forEach(
    enemy => {

      if(enemy.dead){
        return;
      }

      enemy.previousX =
        enemy.x;

      enemy.x =
        enemy.baseX +
        Math.sin(
          timestamp*.0014 +
          enemy.phase
        ) *
        enemy.range;

      enemy.bottom =
        enemy.baseBottom +
        Math.sin(
          timestamp*.00225 +
          enemy.phase
        ) *
        26;

      enemy.element.style.left =
        enemy.x + "px";

      enemy.element.style.bottom =
        enemy.bottom + "px";

      enemy.element.style.transform =
        enemy.x >=
        enemy.previousX
          ? "scaleX(-1)"
          : "scaleX(1)";
    }
  );

  steamVents.forEach(
    (vent,index) => {

      const active =
        (
          timestamp +
          vent.phase +
          index*430
        ) %
        2600 <
        900;

      vent.active =
        active;

      vent.element.classList.toggle(
        "active",
        active
      );
    }
  );
}

function killEnemy(
  enemy
){

  enemy.dead =
    true;

  enemy.element.classList.add(
    "dead"
  );

  sfx(
    "enemy",
    .78
  );

  velocityY =
    7.8;

  jumping =
    true;

  setTimeout(
    () => {
      enemy.element.style.display =
        "none";
    },
    520
  );
}

function checkEnemies(){

  const p =
    playerRect();

  groundEnemies.forEach(
    enemy => {

      if(enemy.dead){
        return;
      }

      const r = {
        left:enemy.x+12,
        right:
          enemy.x+
          enemy.width-
          12,
        bottom:
          enemy.bottom+7,
        top:
          enemy.bottom+
          enemy.height-
          11
      };

      if(!overlap(p,r)){
        return;
      }

      const stomp =
        velocityBeforeCollision < -.3 &&
        previousY >=
          r.top - 30;

      if(stomp){

        playerY =
          r.top + 2;

        killEnemy(
          enemy
        );

      }else{

        damagePlayer();
      }
    }
  );

  flyingEnemies.forEach(
    enemy => {

      if(enemy.dead){
        return;
      }

      const r = {
        left:enemy.x+14,
        right:
          enemy.x+
          enemy.width-
          14,
        bottom:
          enemy.bottom+8,
        top:
          enemy.bottom+
          enemy.height-
          10
      };

      if(!overlap(p,r)){
        return;
      }

      const stomp =
        velocityBeforeCollision < -.3 &&
        previousY >=
          r.top - 28;

      if(stomp){

        playerY =
          r.top + 2;

        killEnemy(
          enemy
        );

      }else{

        damagePlayer();
      }
    }
  );

  steamVents.forEach(
    vent => {

      if(!vent.active){
        return;
      }

      const r = {
        left:vent.x,
        right:
          vent.x+
          vent.width,
        bottom:
          vent.bottom,
        top:
          vent.top
      };

      if(
        overlap(
          p,
          r
        )
      ){
        damagePlayer();
      }
    }
  );
}

function damagePlayer(){

  if(
    invincible ||
    finished
  ){
    return;
  }

  health--;

  updateHUD();

  sfx(
    "hurt",
    .62
  );

  if(
    health <= 0
  ){

    health = 3;
    updateHUD();

    showMessage(
      "The horizon is still waiting for you, Fofo. ♡",
      1300
    );

  }else{

    showMessage(
      "Careful, Fofo — keep going. ♡",
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

  invincible =
    true;

  invincibleUntil =
    performance.now() +
    1200;

  player.classList.add(
    "hurt"
  );
}

function updateInvincibility(
  timestamp
){

  if(
    invincible &&
    timestamp >=
    invincibleUntil
  ){
    invincible =
      false;

    player.classList.remove(
      "hurt"
    );
  }
}

// =========================================================
// COLLECTIBLES
// =========================================================

function checkShards(){

  const p =
    playerRect();

  shards.forEach(
    shard => {

      if(shard.collected){
        return;
      }

      const r = {
        left:shard.x,
        right:
          shard.x+
          shard.width,
        bottom:
          shard.bottom,
        top:
          shard.bottom+
          shard.height
      };

      if(
        !overlap(
          p,
          r
        )
      ){
        return;
      }

      shard.collected =
        true;

      shard.element.style.display =
        "none";

      collected++;

      updateHUD();
      popCounter();

      sfx(
        "collect",
        shard.golden
          ? 1.05
          : .75
      );

      if(
        collected ===
        TOTAL
      ){
        showMessage(
          "Every little moment led here. The final gate remembers you. ♡",
          2200
        );

        unlockPortal();
      }
    }
  );
}

// =========================================================
// PUZZLE
// =========================================================

let sequenceIndex =
  0;

const sequence =
  [0,1,2];

function solveBridge(){

  puzzleSolved =
    true;

  sfx(
    "puzzle",
    .90
  );

  bridgeSurfaces.forEach(
    (surface,index) => {

      setTimeout(
        () => {

          surface.enabled =
            true;

          surface.element.style.opacity =
            "1";

          surface.element.style.transform =
            "translateY(0)";

        },
        index*160
      );
    }
  );

  showMessage(
    "Dawn. Life. Love. The path appears. ✨",
    1800
  );

  unlockPortal();
}

function checkPuzzle(){

  if(puzzleSolved){
    return;
  }

  const p =
    playerRect();

  pads.forEach(
    pad => {

      const r = {
        left:pad.x,
        right:
          pad.x+105,
        bottom:
          GROUND_Y,
        top:
          GROUND_Y+64
      };

      const touching =
        overlap(
          p,
          r
        );

      if(
        touching &&
        !pad.touching
      ){

        pad.touching =
          true;

        pad.element.classList.add(
          "active"
        );

        setTimeout(
          () =>
            pad.element.classList.remove(
              "active"
            ),
          280
        );

        if(
          pad.value ===
          sequence[
            sequenceIndex
          ]
        ){

          pad.element.classList.add(
            "solved"
          );

          sequenceIndex++;

          if(
            sequenceIndex ===
            sequence.length
          ){
            solveBridge();
          }

        }else{

          sequenceIndex =
            0;

          pads.forEach(
            p =>
              p.element.classList.remove(
                "solved"
              )
          );

          showMessage(
            "Read the horizon: Dawn → Life → Love",
            1200
          );
        }
      }

      if(!touching){
        pad.touching =
          false;
      }
    }
  );
}

// =========================================================
// CHECKPOINTS
// =========================================================

function checkCheckpoints(){

  checkpoints.forEach(
    checkpoint => {

      if(
        checkpoint.reached ||
        playerX <
        checkpoint.triggerX
      ){
        return;
      }

      checkpoint.reached =
        true;

      respawnX =
        checkpoint.spawnX;

      respawnY =
        GROUND_Y;

      checkpoint.element.classList.add(
        "active"
      );

      sfx(
        "checkpoint",
        .72
      );

      showMessage(
        "Checkpoint — one memory closer to our date. ✨",
        900
      );
    }
  );
}

// =========================================================
// PORTAL / FINALE
// =========================================================

function unlockPortal(){

  if(
    !portal ||
    portal.unlocked
  ){
    return;
  }

  if(
    collected <
    TOTAL ||
    !puzzleSolved
  ){
    return;
  }

  portal.unlocked =
    true;

  portal.element.classList.add(
    "unlocked"
  );

  sfx(
    "portal",
    .80
  );
}

function checkPortal(){

  if(
    !portal ||
    finished ||
    playerX <
    portal.x - 45
  ){
    return;
  }

  if(!puzzleSolved){

    playerX =
      portal.x - 90;

    showMessage(
      "The final path is still hidden. Solve Dawn → Life → Love.",
      1500
    );

    return;
  }

  if(
    collected <
    TOTAL
  ){

    playerX =
      portal.x - 90;

    showMessage(
      `Find ${TOTAL-collected} more Pyramid Memor${TOTAL-collected===1?"y":"ies"} ✨`,
      1300
    );

    return;
  }

  finishLevel();
}

function finishLevel(){

  if(finished){
    return;
  }

  finished =
    true;

  keys.left =
    false;

  keys.right =
    false;

  keys.jump =
    false;

  requestedMusic.pause();
  fallbackMusic.pause();
  activeMusic.pause();

  sfx(
    "finale",
    1
  );

  localStorage.setItem(
    "fofoLevel4Completed",
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

  currentPose =
    "idle";

  setPlayerImage(
    idleImage
  );

  setTimeout(
    () => {

      finale.classList.remove(
        "hidden"
      );

      revealPage.classList.remove(
        "hidden"
      );

      datePage.classList.add(
        "hidden"
      );

      storyPage.classList.add(
        "hidden"
      );

    },
    600
  );
}

revealDateButton.addEventListener(
  "click",
  () => {

    revealPage.classList.add(
      "hidden"
    );

    datePage.classList.remove(
      "hidden"
    );
  }
);

giftStoryButton.addEventListener(
  "click",
  () => {

    datePage.classList.add(
      "hidden"
    );

    storyPage.classList.remove(
      "hidden"
    );
  }
);

continueButton.addEventListener(
  "click",
  () => {

    /*
      The final Level 4 Continue button now opens
      the birthday ending sequence first.
    */

    window.location.href =
      "ending.html";
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
// LOOP
// =========================================================

function loop(
  timestamp
){

  updateFrameFactor(
    timestamp
  );

  if(!finished){

    updateMovingPlatforms();

    updateEnemies(
      timestamp
    );

    updateHorizontal();

    updateVertical();

    updatePlayer(
      timestamp
    );

    updateInvincibility(
      timestamp
    );

    renderPlayer();

    checkEnemies();

    checkShards();

    checkPuzzle();

    checkCheckpoints();

    checkPortal();

    updateCamera();
  }

  requestAnimationFrame(
    loop
  );
}

updateHUD();

currentPose =
  "idle";

setPlayerImage(
  idleImage
);

renderPlayer();

showMessage(
  "One last journey, Fofo — six little chapters before our final memory. Collect all 25 Pyramid Memories. ♡",
  2800
);

requestAnimationFrame(
  loop
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
