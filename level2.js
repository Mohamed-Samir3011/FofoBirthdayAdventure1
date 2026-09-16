// =========================================================
// FOFO BIRTHDAY ADVENTURE
// LEVEL 2 — BURGUNDY BLOOM
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


const hearts = [
    document.getElementById("heart1"),
    document.getElementById("heart2"),
    document.getElementById("heart3")
];


const counterImage =
    document.getElementById("counterImage");


const finaleOverlay =
    document.getElementById("finaleOverlay");

const plantScreen =
    document.getElementById("plantScreen");

const plantGiftButton =
    document.getElementById("plantGiftButton");

const plantSmoke =
    document.getElementById("plantSmoke");

const giftScreen =
    document.getElementById("giftScreen");

const floatingGift =
    document.getElementById("floatingGift");

const giftStoryButton =
    document.getElementById("giftStoryButton");

const storyScreen =
    document.getElementById("storyScreen");

const backToGiftButton =
    document.getElementById("backToGiftButton");

const continueButton =
    document.getElementById("continueButton");


// =========================================================
// WORLD
// =========================================================

const WORLD_WIDTH =
    7800;

const GROUND_HEIGHT =
    110;

world.style.width =
    WORLD_WIDTH + "px";


// =========================================================
// PHYSICS
// =========================================================

const SPEED =
    2.45;

const GRAVITY =
    0.255;

const JUMP_POWER =
    10.9;

const MAX_FALL_SPEED =
    -6.6;


const HITBOX_WIDTH =
    52;

const HITBOX_HEIGHT =
    92;

const HITBOX_OFFSET_X =
    18;



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
    120;

let playerY =
    GROUND_HEIGHT;

let previousPlayerY =
    GROUND_HEIGHT;

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

let respawnX =
    120;

let respawnY =
    GROUND_HEIGHT;

let standingOnMovingPlatform =
    null;

let standingSurface =
    null;

let gameFinished =
    false;


// =========================================================
// JUMP HOLD
// =========================================================

let jumpHoldFrames =
    0;

const MAX_JUMP_HOLD =
    12;


// =========================================================
// INPUT
// =========================================================

const keys = {
    left: false,
    right: false,
    jump: false
};


// =========================================================
// PLAYER IMAGES
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


// =========================================================
// LEVEL ASSETS
// =========================================================

const ASSETS = {

    platform:
        "assets/level2_assets/platform_long.png",

    flowerPlatform:
        "assets/level2_assets/platform_flower.png",

    roseEnemy:
        "assets/level2_assets/rose_enemy.png",

    bee:
        "assets/level2_assets/bee_enemy.png",

    groundLong:
        "assets/level2_ground/ground_long.png",

    groundShort:
        "assets/level2_ground/ground_short.png",

    column:
        "assets/level2_ground/garden_column.png",

    thorns:
        "assets/level2_ground/thorn_strip.png",

    gate:
        "assets/level2_finale/secret_garden_gate.png"

};


// =========================================================
// AUDIO
// =========================================================

const levelMusic =
    new Audio(
        "assets/level2_audio/level2_music.mp3"
    );

levelMusic.loop =
    true;

levelMusic.volume =
    0.88;


const jumpSound =
    new Audio(
        "assets/level2_audio/jump.wav"
    );


const bounceSound =
    new Audio(
        "assets/level2_audio/flower_bounce.wav"
    );


const enemySound =
    new Audio(
        "assets/level2_audio/enemy_defeat.wav"
    );


const bloomSound =
    new Audio(
        "assets/level2_audio/bloom_collect.wav"
    );


jumpSound.volume =
    0.78;

bounceSound.volume =
    0.9;

enemySound.volume =
    0.9;

bloomSound.volume =
    0.8;


let audioStarted =
    false;


// =========================================================
// AUDIO FUNCTIONS
// =========================================================

function startAudio() {

    if (audioStarted) {
        return;
    }

    audioStarted =
        true;

    levelMusic
        .play()
        .catch(() => {});
}


function playSound(sound) {

    if (!audioStarted) {
        return;
    }

    const copy =
        sound.cloneNode();

    copy.volume =
        sound.volume;

    copy
        .play()
        .catch(() => {});
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
// PLAYER ELEMENT
// =========================================================

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
// PLAYER VISUAL SETTINGS
// =========================================================

const POSES = {

    idle: {
        scale: 1,
        visualOffset: -31
    },

    run: {
        scale: 0.92,
        visualOffset: -34
    },

    jump: {
        scale: 0.95,
        visualOffset: -15
    }

};


let currentPose =
    "idle";


// =========================================================
// LEVEL ARRAYS
// =========================================================

const surfaces =
    [];

const movingPlatforms =
    [];

const hazards =
    [];

const blooms =
    [];

const roses =
    [];

const bees =
    [];

const checkpoints =
    [];


// =========================================================
// LEVEL STATE
// =========================================================

const TOTAL_BLOOMS =
    6;

let collectedBlooms =
    0;

let secretGate =
    null;

let endingStarted =
    false;

let gateWarningTime =
    0;


// =========================================================
// HELPERS
// =========================================================

function overlap(a, b) {

    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.top < b.bottom ||
        a.bottom > b.top
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
        document.createElement("img");

    image.src =
        src;

    image.className =
        className;

    image.draggable =
        false;

    image.style.left =
        x + "px";

    image.style.bottom =
        bottom + "px";


    if (width !== null) {

        image.style.width =
            width + "px";
    }


    if (height !== null) {

        image.style.height =
            height + "px";
    }


    world.appendChild(
        image
    );

    return image;
}


// =========================================================
// BACKGROUND
// =========================================================

function addBackgroundHill(
    x,
    bottom,
    width,
    height,
    type
) {

    const hill =
        document.createElement("div");

    hill.className =
        `background-hill ${type}`;

    hill.style.left =
        x + "px";

    hill.style.bottom =
        bottom + "px";

    hill.style.width =
        width + "px";

    hill.style.height =
        height + "px";

    world.appendChild(
        hill
    );
}


function addBackgroundLight(
    x,
    bottom,
    delay
) {

    const light =
        document.createElement("div");

    light.className =
        "background-light";

    light.style.left =
        x + "px";

    light.style.bottom =
        bottom + "px";

    light.style.animationDelay =
        delay + "s";

    world.appendChild(
        light
    );
}


// =========================================================
// BACKGROUND GENERATION
// =========================================================

for (
    let x = -180;
    x < WORLD_WIDTH;
    x += 650
) {

    addBackgroundHill(
        x,
        110,
        580,
        180 +
        Math.abs(x % 70),
        "far"
    );
}


for (
    let x = 180;
    x < WORLD_WIDTH;
    x += 970
) {

    addBackgroundHill(
        x,
        110,
        470,
        125 +
        Math.abs(x % 55),
        "near"
    );
}


for (
    let x = 270;
    x < WORLD_WIDTH;
    x += 470
) {

    addBackgroundLight(
        x,
        320 +
        Math.abs(x % 160),
        -(
            (x % 9) *
            0.17
        )
    );
}


// =========================================================
// GROUND SYSTEM
// =========================================================

const GROUND_HEIGHT_IMAGE =
    145;

const GROUND_LONG_WIDTH =
    538;

const GROUND_SHORT_WIDTH =
    316;

const GROUND_OVERLAP =
    28;


// =========================================================
// ADD GROUND
// =========================================================

function addGround(
    x,
    width
) {

    surfaces.push({

        type:
            "ground",

        x,

        width,

        top:
            GROUND_HEIGHT
    });


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


    let visualX =
        -15;

    let tileIndex =
        0;


    while (
        visualX <
        width
    ) {

        const longTile =
            tileIndex % 4 !== 2;


        const tile =
            document.createElement("img");


        tile.className =
            "ground-tile";


        tile.src =
            longTile
                ? ASSETS.groundLong
                : ASSETS.groundShort;


        tile.draggable =
            false;


        const tileWidth =
            longTile
                ? GROUND_LONG_WIDTH
                : GROUND_SHORT_WIDTH;


        tile.style.left =
            visualX + "px";


        tile.style.width =
            tileWidth + "px";


        tile.style.height =
            GROUND_HEIGHT_IMAGE + "px";


        strip.appendChild(
            tile
        );


        visualX +=
            tileWidth -
            GROUND_OVERLAP;


        tileIndex++;
    }
}


// =========================================================
// NORMAL PLATFORM
// =========================================================

function addPlatform(
    x,
    bottom,
    width
) {

    const element =
        createImage(
            ASSETS.platform,
            "garden-platform",
            x,
            bottom,
            width,
            65
        );


    surfaces.push({

        type:
            "platform",

        x:
            x + 8,

        width:
            width - 16,

        top:
            bottom + 48,

        element
    });
}


// =========================================================
// FLOWER PLATFORM
// =========================================================

function addFlowerPlatform(
    x,
    bottom,
    width,
    bounce = false
) {

    const element =
        createImage(
            ASSETS.flowerPlatform,

            bounce
                ? "flower-platform bounce-platform"
                : "flower-platform",

            x,
            bottom,
            width,
            78
        );


    surfaces.push({

        type:
            bounce
                ? "bounce"
                : "flower",

        x:
            x + 8,

        width:
            width - 16,

        top:
            bottom + 55,

        element
    });
}


// =========================================================
// MOVING PLATFORM
// =========================================================

function addMovingPlatform(data) {

    const element =
        createImage(
            ASSETS.flowerPlatform,
            "flower-platform",
            data.x,
            data.y,
            data.width,
            72
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

        top:
            data.y + 51,

        axis:
            data.axis,

        min:
            data.min,

        max:
            data.max,

        speed:
            data.speed,

        direction:
            data.direction || 1,

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
}


// =========================================================
// INTERACTIVE COLUMN
// =========================================================

function addJumpableColumn(
    x,
    width,
    baseBottom = 54
) {

    const height =
        width *
        600 /
        504;


    const element =
        createImage(
            ASSETS.column,
            "garden-column",
            x,
            baseBottom,
            width,
            height
        );


    surfaces.push({

        type:
            "column",

        x:
            x + 18,

        width:
            width - 36,

        top:
            baseBottom +
            height -
            22,

        element
    });


    return element;
}


// =========================================================
// THORNS
// =========================================================

function addThorns(
    x,
    width
) {

    const height =
        width *
        235 /
        1043;


    /*
        Lowered again.
    */

    const bottom =
        68;


    const element =
        createImage(
            ASSETS.thorns,
            "thorn-hazard",
            x,
            bottom,
            width,
            height
        );


    hazards.push({

        x:
            x + 14,

        width:
            width - 28,

        bottom:
            106,

        height:
            Math.max(
                20,
                height - 34
            ),

        element
    });
}


// =========================================================
// BLOOM
// =========================================================

function addBloom(
    x,
    bottom
) {

    const element =
        document.createElement("div");


    element.className =
        "baby-bloom";


    element.style.left =
        x + "px";


    element.style.bottom =
        bottom + "px";


    world.appendChild(
        element
    );


    blooms.push({

        x,

        bottom,

        collected:
            false,

        element
    });
}


// =========================================================
// ROSE ENEMY
// =========================================================

function addRoseEnemy(
    x,
    min,
    max
) {

    /*
        Lowered again.
    */

    const bottom =
        78;


    const element =
        createImage(
            ASSETS.roseEnemy,
            "level2-enemy",
            x,
            bottom,
            82,
            82
        );


    roses.push({

        startX:
            x,

        x,

        min,

        max,

        bottom,

        width:
            82,

        height:
            82,

        direction:
            1,

        speed:
            0.56,

        dead:
            false,

        element
    });
}


// =========================================================
// BEE
// =========================================================

function addBee(
    x,
    bottom,
    horizontalRange,
    verticalRange,
    phase = 0
) {

    const element =
        createImage(
            ASSETS.bee,
            "level2-enemy bee-enemy",
            x,
            bottom,
            76,
            76
        );


    bees.push({

        baseX:
            x,

        baseBottom:
            bottom,

        x,

        previousX:
            x,

        bottom,

        range:
            horizontalRange,

        verticalRange,

        phase,

        width:
            76,

        height:
            76,

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
    respawnAtX
) {

    checkpoints.push({

        triggerX,

        spawnX:
            respawnAtX,

        spawnY:
            GROUND_HEIGHT,

        reached:
            false
    });
}


// =========================================================
// GATE
// =========================================================

function addSecretGardenGate() {

    const x =
        7460;

    const width =
        240;

    const height =
        300;

    const bottom =
        71;


    const element =
        createImage(
            ASSETS.gate,
            "secret-garden-gate locked",
            x,
            bottom,
            width,
            height
        );


    secretGate = {
        x,
        width,
        element
    };
}


// =========================================================
// MAP — AREA 1
// =========================================================

addGround(
    0,
    1280
);


addPlatform(
    365,
    165,
    270
);


addBloom(
    465,
    245
);


addRoseEnemy(
    770,
    710,
    980
);


addJumpableColumn(
    985,
    150
);


addFlowerPlatform(
    1110,
    195,
    170
);


// =========================================================
// AREA 2
// =========================================================

addFlowerPlatform(
    1310,
    135,
    165,
    true
);


addFlowerPlatform(
    1490,
    220,
    165
);


// =========================================================
// AREA 3
// =========================================================

addGround(
    1650,
    1390
);


addCheckpoint(
    1720,
    1690
);


addPlatform(
    1760,
    165,
    240
);


addFlowerPlatform(
    2030,
    245,
    215
);


addBloom(
    2110,
    330
);


addPlatform(
    2310,
    175,
    230
);


addBee(
    2540,
    285,
    90,
    24,
    0
);


addFlowerPlatform(
    2710,
    260,
    225
);


addBloom(
    2800,
    345
);


addPlatform(
    2910,
    155,
    150
);


// =========================================================
// AREA 4 — MOVING GARDEN
// =========================================================

addMovingPlatform({

    x:
        3080,

    y:
        145,

    width:
        190,

    axis:
        "y",

    min:
        140,

    max:
        205,

    speed:
        0.58
});


addMovingPlatform({

    x:
        3275,

    y:
        235,

    width:
        190,

    axis:
        "x",

    min:
        3240,

    max:
        3320,

    speed:
        0.58
});


addMovingPlatform({

    x:
        3470,

    y:
        160,

    width:
        190,

    axis:
        "y",

    min:
        150,

    max:
        220,

    speed:
        0.58,

    direction:
        -1
});


// =========================================================
// AREA 5
// =========================================================

addGround(
    3660,
    1340
);


addCheckpoint(
    3710,
    3690
);


addPlatform(
    3750,
    170,
    230
);


addBloom(
    3830,
    250
);


addThorns(
    4090,
    250
);


addFlowerPlatform(
    4060,
    225,
    275
);


addPlatform(
    4380,
    175,
    220
);


addRoseEnemy(
    4590,
    4510,
    4760
);


addFlowerPlatform(
    4730,
    245,
    220
);


addBloom(
    4810,
    330
);


// =========================================================
// AREA 6
// =========================================================

addFlowerPlatform(
    5030,
    135,
    170,
    true
);


addMovingPlatform({

    x:
        5230,

    y:
        205,

    width:
        185,

    axis:
        "x",

    min:
        5190,

    max:
        5260,

    speed:
        0.52
});


// =========================================================
// AREA 7
// =========================================================

addGround(
    5420,
    WORLD_WIDTH - 5420
);


addCheckpoint(
    5490,
    5460
);


addPlatform(
    5560,
    165,
    235
);


addFlowerPlatform(
    5830,
    245,
    215
);


addBee(
    5950,
    350,
    85,
    24,
    1.4
);


addPlatform(
    6100,
    335,
    230
);


addFlowerPlatform(
    6380,
    245,
    215
);


addRoseEnemy(
    6610,
    6550,
    6780
);


addPlatform(
    6840,
    180,
    245
);


addBloom(
    6930,
    260
);


addJumpableColumn(
    7140,
    125
);


addSecretGardenGate();


// =========================================================
// HUD
// =========================================================

function updateHUD(
    damagedIndex = -1
) {

    hearts.forEach(
        (
            heart,
            index
        ) => {

            heart.src =
                index < health
                    ? "assets/hud/heart_full.png"
                    : "assets/hud/heart_empty.png";


            if (
                index ===
                damagedIndex
            ) {

                heart
                    .classList
                    .remove(
                        "heart-hit"
                    );


                void heart.offsetWidth;


                heart
                    .classList
                    .add(
                        "heart-hit"
                    );
            }
        }
    );


    const value =
        Math.max(
            0,
            Math.min(
                6,
                collectedBlooms
            )
        );


    counterImage.src =
        `assets/hud/counter_${value}.png`;
}


// =========================================================
// COUNTER EFFECT
// =========================================================

function animateCounter() {

    counterImage
        .classList
        .remove(
            "pop"
        );


    void counterImage.offsetWidth;


    counterImage
        .classList
        .add(
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
    duration = 1500
) {

    clearTimeout(
        messageTimer
    );


    messageBox.textContent =
        text;


    messageBox
        .classList
        .remove(
            "hidden"
        );


    messageTimer =
        setTimeout(
            () => {

                messageBox
                    .classList
                    .add(
                        "hidden"
                    );

            },
            duration
        );
}


// =========================================================
// PLAYER IMAGE
// =========================================================

function setPlayerImage(src) {

    if (
        fofo.getAttribute("src") !==
        src
    ) {

        fofo.src =
            src;
    }
}


// =========================================================
// PLAYER RENDER
// =========================================================

function renderPlayer() {

    const pose =
        POSES[currentPose];


    /*
        Ground = unchanged.
        Platforms = 17px.
        Columns = 27px.
    */

    let surfaceLift =
        0;


    if (
        !jumping &&
        standingSurface
    ) {

        if (
            standingSurface.type ===
            "ground"
        ) {

            surfaceLift =
                0;
        }

        else if (
            standingSurface.type ===
            "column"
        ) {

            surfaceLift =
                27;
        }

        else {

            surfaceLift =
                17;
        }
    }


    fofo.style.left =
        playerX + "px";


    fofo.style.bottom =
        playerY +
        pose.visualOffset +
        surfaceLift +
        "px";


    fofo.style.transform =
        facingRight
            ? `scale(${pose.scale})`
            : `scaleX(${-pose.scale}) scaleY(${pose.scale})`;
}


// =========================================================
// MOVING PLATFORMS
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
          (
            window.FofoExtras?.platformSpeedMultiplier?.(2) ||
            1
          ) *
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
          (
            window.FofoExtras?.platformSpeedMultiplier?.(2) ||
            1
          ) *
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
                platform.y + 51;


            platform.element.style.left =
                platform.x + "px";


            platform.element.style.bottom =
                platform.y + "px";


            if (
                standingOnMovingPlatform ===
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
// ROSE ENEMY UPDATE
// =========================================================

function updateRoses() {

    roses.forEach(
        enemy => {

            if (
                enemy.dead
            ) {

                return;
            }


            enemy.x +=
                enemy.speed *
          (
            window.FofoExtras?.enemySpeedMultiplier?.(2) ||
            1
          ) *
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
                enemy.direction > 0
                    ? "scaleX(1)"
                    : "scaleX(-1)";
        }
    );
}


// =========================================================
// BEE UPDATE
// =========================================================

function updateBees(timestamp) {

    bees.forEach(
        bee => {

      if (
        window.FofoSmooth &&
        !window.FofoSmooth.isNearX(
          bee.x,
          playerX
        )
      ) {

        bee.element?.classList.add(
          "fofo-logic-culled"
        );

        return;
      }


      bee.element?.classList.remove(
        "fofo-logic-culled"
      );

            if (
                bee.dead
            ) {

                return;
            }


            bee.previousX =
                bee.x;


            bee.x =
                bee.baseX +
                Math.sin(
                    timestamp *
                    0.0013 +
                    bee.phase
                ) *
                bee.range;


            bee.bottom =
                bee.baseBottom +
                Math.sin(
                    timestamp *
                    0.0023 +
                    bee.phase
                ) *
                bee.verticalRange;


            if (
                bee.x >
                bee.previousX +
                0.03
            ) {

                bee.direction =
                    1;
            }

            else if (
                bee.x <
                bee.previousX -
                0.03
            ) {

                bee.direction =
                    -1;
            }


            bee.element.style.left =
                bee.x + "px";


            bee.element.style.bottom =
                bee.bottom + "px";


            bee.element.style.transform =
                bee.direction > 0
                    ? "scaleX(1)"
                    : "scaleX(-1)";
        }
    );
}


// =========================================================
// JUMP
// =========================================================

function startJump() {

    if (
        gameFinished
    ) {

        return;
    }


    if (
        jumping &&
        !window.FofoSmooth?.canCoyoteJump?.()
    ) {

        window.FofoSmooth?.bufferJump?.();
        return;
    }


    standingSurface =
        null;


    standingOnMovingPlatform =
        null;


    velocityY =
        JUMP_POWER;


    jumping =
        true;


    window.FofoSmooth?.markJumped?.();


    jumpHoldFrames =
        MAX_JUMP_HOLD;


    playSound(
        jumpSound
    );
}


// =========================================================
// KEYBOARD
// =========================================================

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


// =========================================================
// MOBILE BUTTONS
// =========================================================

function bindButton(
    button,
    input
) {

    let active =
        false;


    function press(event) {

        event.preventDefault();

        startAudio();


        if (
            active
        ) {

            return;
        }


        active =
            true;


        keys[input] =
            true;


        button
            .classList
            .add(
                "pressed"
            );


        if (
            input ===
            "jump"
        ) {

            startJump();
        }
    }


    function release(event) {

        if (
            event
        ) {

            event.preventDefault();
        }


        active =
            false;


        keys[input] =
            false;


        button
            .classList
            .remove(
                "pressed"
            );


        if (
            input ===
            "jump"
        ) {

            jumpHoldFrames =
                0;
        }
    }


    button.addEventListener(
        "pointerdown",
        event => {

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
// HORIZONTAL MOVEMENT
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
      (
        window.FofoPolish?.getMoveMultiplier?.() ||
        1
      ) *
      frameFactor;

        facingRight =
            true;
    }


    if (
        keys.left
    ) {

        playerX -=
      SPEED *
      (
        window.FofoPolish?.getMoveMultiplier?.() ||
        1
      ) *
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


// =========================================================
// VERTICAL MOVEMENT
// =========================================================

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
      0.07 *
      frameFactor;

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


    standingOnMovingPlatform =
        null;


    let landing =
        null;


    if (
        velocityY <= 0
    ) {

        const left =
            playerX +
            HITBOX_OFFSET_X;


        const right =
            left +
            HITBOX_WIDTH;


        surfaces.forEach(
            surface => {

                const horizontal =
                    right >
                        surface.x &&
                    left <
                        surface.x +
                        surface.width;


                const crossed =
                    previousPlayerY >=
                        surface.top -
                        13 &&
                    nextY <=
                        surface.top +
                        2;


                if (
                    horizontal &&
                    crossed
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
                14.2;


            jumping =
                true;


            standingSurface =
                null;


            jumpHoldFrames =
                0;


            playSound(
                bounceSound
            );


            landing.element
                .classList
                .remove(
                    "bounced"
                );


            void landing.element.offsetWidth;


            landing.element
                .classList
                .add(
                    "bounced"
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

                standingOnMovingPlatform =
                    landing;
            }
        }
    }

    else {

        jumping =
            true;

        standingSurface =
            null;
    }


    playerY =
        nextY;


    if (
        playerY <
        -140
    ) {

        damagePlayer();
    }
}


// =========================================================
// PLAYER ANIMATION
// =========================================================

let runFrame =
    0;

let lastRun =
    0;


function updatePlayerAnimation(timestamp) {

    if (
        jumping
    ) {

        currentPose =
            "jump";


        if (
            velocityY > 6
        ) {

            setPlayerImage(
                jumpFrames[1]
            );
        }

        else if (
            velocityY > 2
        ) {

            setPlayerImage(
                jumpFrames[2]
            );
        }

        else if (
            velocityY > -1
        ) {

            setPlayerImage(
                jumpFrames[3]
            );
        }

        else if (
            velocityY > -4
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
        lastRun >=
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


        lastRun =
            timestamp;
    }
}


// =========================================================
// DAMAGE
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


    window.FofoExtras?.registerDamage?.(
    2
  );

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

        health =
            3;


        updateHUD();


        showMessage(
            "Back to the checkpoint, Fofo! 🌹",
            1500
        );
    }

    else {

        showMessage(
            "Careful, Fofo! 🌹"
        );
    }


    playerX =
        respawnX;


    playerY =
        respawnY;


    window.FofoExtras?.respawn?.(
        fofo
    );


    velocityY =
        0;


    jumping =
        false;


    standingSurface =
        null;


    standingOnMovingPlatform =
        null;


    invincible =
        true;


    invincibleUntil =
        performance.now() +
        1200;


    fofo
        .classList
        .add(
            "hurt"
        );
}


// =========================================================
// INVINCIBILITY
// =========================================================

function updateInvincibility(timestamp) {

    if (
        invincible &&
        timestamp >=
        invincibleUntil
    ) {

        invincible =
            false;


        fofo
            .classList
            .remove(
                "hurt"
            );
    }
}


// =========================================================
// NORMAL ENEMY DEATH
// =========================================================

function killEnemy(enemy) {

    enemy.dead =
        true;


    playSound(
        enemySound
    );


    enemy.element
        .classList
        .add(
            "enemy-dead"
        );


    setTimeout(
        () => {

            enemy.element.style.display =
                "none";

        },
        320
    );


    velocityY =
        7.4;


    jumping =
        true;


    standingSurface =
        null;


    jumpHoldFrames =
        0;
}


// =========================================================
// BEE DEATH
// =========================================================

function killBee(bee) {

    bee.dead =
        true;


    playSound(
        enemySound
    );


    bee.element.style.animation =
        "none";


    const facing =
        bee.direction > 0
            ? 1
            : -1;


    bee.element.animate(
        [

            {
                transform:
                    `scaleX(${facing}) translateY(0px) rotate(0deg) scale(1)`,

                opacity:
                    1
            },

            {
                transform:
                    `scaleX(${facing}) translateY(8px) rotate(20deg) scale(1.05)`,

                opacity:
                    1,

                offset:
                    0.2
            },

            {
                transform:
                    `scaleX(${facing}) translateY(34px) rotate(90deg) scale(.82)`,

                opacity:
                    0.85,

                offset:
                    0.55
            },

            {
                transform:
                    `scaleX(${facing}) translateY(105px) rotate(220deg) scale(.25)`,

                opacity:
                    0
            }

        ],

        {

            duration:
                600,

            easing:
                "cubic-bezier(.3,.7,.3,1)",

            fill:
                "forwards"
        }
    );


    setTimeout(
        () => {

            bee.element.style.display =
                "none";

        },
        600
    );


    velocityY =
        8.2;


    jumping =
        true;


    standingSurface =
        null;


    jumpHoldFrames =
        0;
}


// =========================================================
// ROSE COLLISION
// =========================================================

function checkRoses() {

    const player =
        playerRect();


    roses.forEach(
        enemy => {

            if (
                enemy.dead
            ) {

                return;
            }


            const rect = {

                left:
                    enemy.x + 10,

                right:
                    enemy.x + 72,

                bottom:
                    enemy.bottom + 17,

                top:
                    enemy.bottom + 68
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
                    -0.35 &&

                previousPlayerY >=
                    rect.top - 28;


            if (
                stomp
            ) {

                playerY =
                    rect.top + 3;


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


// =========================================================
// BEE COLLISION
// =========================================================

function checkBees() {

    const player =
        playerRect();


    bees.forEach(
        bee => {

            if (
                bee.dead
            ) {

                return;
            }


            const rect = {

                left:
                    bee.x + 12,

                right:
                    bee.x + 64,

                bottom:
                    bee.bottom + 10,

                top:
                    bee.bottom + 66
            };


            if (
                !overlap(
                    player,
                    rect
                )
            ) {

                return;
            }


            const falling =
                velocityBeforeCollision <
                -0.35;


            const cameFromAbove =
                previousPlayerY >=
                rect.top - 33;


            const reachedHead =
                playerY <=
                rect.top + 19;


            const centeredEnough =
                player.right >
                    rect.left + 7 &&

                player.left <
                    rect.right - 7;


            const stomp =
                falling &&
                cameFromAbove &&
                reachedHead &&
                centeredEnough;


            if (
                stomp
            ) {

                playerY =
                    rect.top + 2;


                killBee(
                    bee
                );
            }

            else {

                damagePlayer();
            }
        }
    );
}


// =========================================================
// HAZARDS
// =========================================================

function checkHazards() {

    if (
        invincible
    ) {

        return;
    }


    const player =
        playerRect();


    hazards.forEach(
        hazard => {

            const rect = {

                left:
                    hazard.x,

                right:
                    hazard.x +
                    hazard.width,

                bottom:
                    hazard.bottom,

                top:
                    hazard.bottom +
                    hazard.height
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
// BLOOMS
// =========================================================

function checkBlooms() {

    const player =
        playerRect();


    blooms.forEach(
        bloom => {

            if (
                bloom.collected
            ) {

                return;
            }


            const rect = {

                left:
                    bloom.x + 5,

                right:
                    bloom.x + 49,

                bottom:
                    bloom.bottom + 5,

                top:
                    bloom.bottom + 49
            };


            if (
                !overlap(
                    player,
                    rect
                )
            ) {

                return;
            }


            bloom.collected =
                true;


            bloom.element.style.display =
                "none";


            collectedBlooms++;

            window.FofoPolish?.haptic(
                "collect"
            );


            playSound(
                bloomSound
            );


            updateHUD();


            animateCounter();


            updateGate();


            if (
                collectedBlooms ===
                TOTAL_BLOOMS
            ) {

                showMessage(
                    "The Secret Garden is open! 🌹✨",
                    2200
                );
            }

            else {

                showMessage(
                    `Baby Bloom ${collectedBlooms} / 6 🤍`,
                    850
                );
            }
        }
    );
}


// =========================================================
// CHECKPOINT
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


            showMessage(
                "Checkpoint reached ✨",
                700
            );

            window.FofoPolish?.checkpoint();
        }
    );
}


// =========================================================
// GATE
// =========================================================

function updateGate() {

    if (
        !secretGate
    ) {

        return;
    }


    const unlocked =
        collectedBlooms >=
        TOTAL_BLOOMS;


    secretGate.element
        .classList
        .toggle(
            "locked",
            !unlocked
        );


    secretGate.element
        .classList
        .toggle(
            "unlocked",
            unlocked
        );
}


// =========================================================
// CHECK GATE
// =========================================================

function checkGate(timestamp) {

    if (
        endingStarted ||
        !secretGate
    ) {

        return;
    }


    if (
        playerX <
        secretGate.x -
        60
    ) {

        return;
    }


    if (
        collectedBlooms <
        TOTAL_BLOOMS
    ) {

        playerX =
            secretGate.x -
            80;


        if (
            timestamp >
            gateWarningTime
        ) {

            const remaining =
                TOTAL_BLOOMS -
                collectedBlooms;


            showMessage(
                `Find ${remaining} more Baby Bloom${remaining === 1 ? "" : "s"} 🤍`,
                1300
            );


            gateWarningTime =
                timestamp +
                1700;
        }


        return;
    }


    startFinale();
}


// =========================================================
// FINALE
// =========================================================

function startFinale() {

    if (
        endingStarted
    ) {

        return;
    }


    endingStarted =
        true;


    gameFinished =
        true;


    window.FofoExtras?.completeReplay?.(
        2
    );


    keys.left =
        false;


    keys.right =
        false;


    keys.jump =
        false;


    velocityY =
        0;


    standingSurface =
        null;


    localStorage.setItem(
        "fofoLevel2Completed",
        "true"
    );


    localStorage.setItem(
        "fofoHighestUnlockedLevel",
        "3"
    );


    localStorage.setItem(
        "fofoLastPlayedLevel",
        "3"
    );


    finaleOverlay
        .classList
        .remove(
            "hidden"
        );


    plantScreen
        .classList
        .remove(
            "hidden"
        );


    giftScreen
        .classList
        .add(
            "hidden"
        );


    storyScreen
        .classList
        .add(
            "hidden"
        );
}


// =========================================================
// PLANT
// =========================================================

plantGiftButton.addEventListener(
    "click",
    () => {

        plantGiftButton.disabled =
            true;


        plantGiftButton.style.pointerEvents =
            "none";


        plantGiftButton.style.opacity =
            ".25";


        plantSmoke
            .classList
            .remove(
                "active"
            );


        void plantSmoke.offsetWidth;


        plantSmoke
            .classList
            .add(
                "active"
            );


        setTimeout(
            () => {

                plantScreen
                    .classList
                    .add(
                        "hidden"
                    );


                giftScreen
                    .classList
                    .remove(
                        "hidden"
                    );


                floatingGift
                    .classList
                    .remove(
                        "show"
                    );


                void floatingGift.offsetWidth;


                floatingGift
                    .classList
                    .add(
                        "show"
                    );

            },
            950
        );


        setTimeout(
            () => {

                giftStoryButton
                    .classList
                    .add(
                        "show"
                    );

            },
            1900
        );
    }
);


// =========================================================
// STORY
// =========================================================

giftStoryButton.addEventListener(
    "click",
    () => {

        giftScreen
            .classList
            .add(
                "hidden"
            );


        storyScreen
            .classList
            .remove(
                "hidden"
            );
    }
);


// =========================================================
// BACK TO GIFT
// =========================================================

backToGiftButton.addEventListener(
    "click",
    () => {

        storyScreen
            .classList
            .add(
                "hidden"
            );


        giftScreen
            .classList
            .remove(
                "hidden"
            );
    }
);


// =========================================================
// CONTINUE
// =========================================================

continueButton.addEventListener(
    "click",
    () => {

        levelMusic.pause();


        levelMusic.currentTime =
            0;


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


  const cameraDirection =
    keys.right
      ? 1
      : keys.left
        ? -1
        : facingRight
          ? 1
          : -1;


  let cameraX;


  if (
    window.FofoSmooth?.smoothCameraX
  ) {

    cameraX =
      window.FofoSmooth.smoothCameraX({
        playerX,
        viewportWidth,
        worldWidth:WORLD_WIDTH,
        direction:cameraDirection,
        frameFactor
      });

  }
  else {

    cameraX =
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

  }


  const cameraY =
    updateMobileCameraY(
      game
    );


  world.style.transformOrigin =
    "left bottom";


  world.style.transform =
    `translate3d(${-cameraX}px, ${cameraY}px, 0)`;

}


// =========================================================
// INITIALIZE
// =========================================================

function initialize() {

    updateHUD();


    updateGate();


    renderPlayer();


    showMessage(
        "Collect 6 Baby Blooms and reach the Secret Garden 🌹",
        2500
    );
}


// =========================================================
// GAME LOOP
// =========================================================

function gameLoop(timestamp) {

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


        updateRoses();


        updateBees(
            timestamp
        );


        updateHorizontal();


        updateVertical();


  window.FofoSmooth?.updateGroundState(
    !jumping,
    () => startJump()
  );


        updatePlayerAnimation(
            timestamp
        );


        updateInvincibility(
            timestamp
        );


        renderPlayer();


        checkHazards();


        checkRoses();


        checkBees();


        checkBlooms();


        updateCheckpoints();


        checkGate(
            timestamp
        );


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
