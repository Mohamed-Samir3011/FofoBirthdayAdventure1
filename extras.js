// =========================================================
// FOFO BIRTHDAY ADVENTURE — EXTRA GAMEPLAY FEATURES
// Respawn / Interactive decorations / Compliments
// Replay modifiers / Secret developer note
// =========================================================

(function () {

  const WORLD_WIDTHS = {
    1:7600,
    2:7800,
    3:9700,
    4:11250
  };


  const COMPLIMENTS = [
    "You make every little world brighter. ♡",
    "Still my favorite person.",
    "Fofo, even the smallest moments with you feel special. ♡",
    "You are doing amazing, birthday girl.",
    "One more little memory for us. ♡",
    "Somehow, you make every level worth building.",
    "The best part of this game was always you. ♡",
    "Keep going, Fofo — there is always one more surprise.",
    "You make ordinary days feel like something worth remembering. ♡"
  ];


  const DECOR_SYMBOLS = {
    1:["♡","✦","♡","✧","✦","♡","✧","♡"],
    2:["❀","♡","✿","✧","❀","♡","✿","✧"],
    3:["♪","✧","♫","♡","♪","✦","♫","✧"],
    4:["✦","✧","♡","✦","☼","✧","♡","✦"]
  };


  const DECOR_POSITIONS = {
    1:[
      [.10,205],[.22,285],[.34,175],[.47,255],
      [.59,205],[.71,310],[.83,180],[.93,250]
    ],

    2:[
      [.08,200],[.20,295],[.32,185],[.44,270],
      [.57,195],[.69,315],[.82,205],[.92,275]
    ],

    3:[
      [.08,230],[.19,335],[.31,205],[.43,295],
      [.56,225],[.68,350],[.81,210],[.92,310]
    ],

    4:[
      [.07,195],[.18,310],[.30,205],[.42,285],
      [.55,215],[.67,335],[.80,205],[.91,300]
    ]
  };


  const STORAGE = {
    modifier:"fofoReplayModifier",
    replayLevel:"fofoReplayLevel",
    noDamageFailed:"fofoReplayNoDamageFailed",
    secretFound:"fofoSecretDeveloperNoteFound"
  };


  let activeLevel =
    0;

  let complimentTimer =
    null;

  let decorTimer =
    null;

  let decoratedLevel =
    0;

  let replayOverlay =
    null;

  let secretOverlay =
    null;

  let replayBadge =
    null;

  let complimentPopup =
    null;

  let extraToast =
    null;


  // -------------------------------------------------------
  // Generic UI
  // -------------------------------------------------------

  function ensureSharedUI() {

    if (
      !complimentPopup
    ) {

      complimentPopup =
        document.createElement(
          "div"
        );


      complimentPopup.className =
        "fofo-compliment-popup";


      document.body.appendChild(
        complimentPopup
      );

    }


    if (
      !replayBadge
    ) {

      replayBadge =
        document.createElement(
          "div"
        );


      replayBadge.className =
        "fofo-replay-badge";


      document.body.appendChild(
        replayBadge
      );

    }


    if (
      !extraToast
    ) {

      extraToast =
        document.createElement(
          "div"
        );


      extraToast.className =
        "fofo-extra-toast";


      document.body.appendChild(
        extraToast
      );

    }

  }


  function showToast(
    text
  ) {

    ensureSharedUI();


    extraToast.textContent =
      text;


    extraToast.classList.remove(
      "fofo-show"
    );


    void extraToast.offsetWidth;


    extraToast.classList.add(
      "fofo-show"
    );

  }


  // -------------------------------------------------------
  // Detect level / game state
  // -------------------------------------------------------

  function detectStandaloneLevel() {

    const file =
      location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    if (
      file === "level2.html"
    ) {

      return 2;

    }


    if (
      file === "level3.html"
    ) {

      return 3;

    }


    if (
      file === "level4.html"
    ) {

      return 4;

    }


    return 0;

  }


  function getWorld() {

    return document.getElementById(
      "world"
    );

  }


  function getPlayer() {

    return (
      document.getElementById(
        "fofo"
      ) ||
      document.querySelector(
        "#world > .player"
      ) ||
      document.querySelector(
        ".world > .player"
      )
    );

  }


  function gameplayVisible() {

    if (
      document.hidden ||
      !activeLevel
    ) {

      return false;

    }


    if (
      window.FofoPolish?.isPaused?.()
    ) {

      return false;

    }


    const player =
      getPlayer();


    if (
      !player
    ) {

      return false;

    }


    const rect =
      player.getBoundingClientRect();


    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {

      return false;

    }


    if (
      activeLevel === 1
    ) {

      const menuRoot =
        document.getElementById(
          "menuRoot"
        );


      if (
        menuRoot &&
        !menuRoot.classList.contains(
          "hidden"
        )
      ) {

        return false;

      }

    }


    const finaleVisible =
      document.querySelector(
        ".finale-overlay:not(.hidden), .finale-screen.show, #finale:not(.hidden)"
      );


    return !finaleVisible;

  }


  // -------------------------------------------------------
  // Respawn effect
  // -------------------------------------------------------

  function respawn(
    playerElement
  ) {

    if (
      !playerElement
    ) {

      return;

    }


    requestAnimationFrame(
      () => {

        requestAnimationFrame(
          () => {

            playerElement.classList.remove(
              "fofo-respawn-pop"
            );


            void playerElement.offsetWidth;


            playerElement.classList.add(
              "fofo-respawn-pop"
            );


            setTimeout(
              () => {

                playerElement.classList.remove(
                  "fofo-respawn-pop"
                );

              },
              680
            );


            const rect =
              playerElement
                .getBoundingClientRect();


            const centerX =
              rect.left +
              rect.width /
              2;


            const centerY =
              rect.top +
              rect.height *
              .62;


            for (
              let i=0;
              i<10;
              i++
            ) {

              const particle =
                document.createElement(
                  "i"
                );


              particle.className =
                "fofo-respawn-particle";


              particle.style.left =
                centerX +
                "px";


              particle.style.top =
                centerY +
                "px";


              const angle =
                (
                  Math.PI *
                  2 *
                  i
                ) /
                10;


              const distance =
                32 +
                Math.random() *
                48;


              particle.style.setProperty(
                "--rx",
                Math.cos(
                  angle
                ) *
                distance +
                "px"
              );


              particle.style.setProperty(
                "--ry",
                Math.sin(
                  angle
                ) *
                distance +
                "px"
              );


              document.body.appendChild(
                particle
              );


              setTimeout(
                () =>
                  particle.remove(),
                780
              );

            }


            window.FofoPolish?.haptic?.(
              "light"
            );

          }
        );

      }
    );

  }


  // -------------------------------------------------------
  // Interactive decorations
  // -------------------------------------------------------

  function decorBurst(
    rect
  ) {

    const count =
      document.body.classList.contains(
        "fofo-performance-mode"
      )
        ? 3
        : 5;


    const centerX =
      rect.left +
      rect.width /
      2;


    const centerY =
      rect.top +
      rect.height /
      2;


    for (
      let i=0;
      i<count;
      i++
    ) {

      const spark =
        document.createElement(
          "i"
        );


      spark.className =
        "fofo-decor-spark";


      spark.style.left =
        centerX +
        "px";


      spark.style.top =
        centerY +
        "px";


      const angle =
        Math.random() *
        Math.PI *
        2;


      const distance =
        18 +
        Math.random() *
        30;


      spark.style.setProperty(
        "--dx",
        Math.cos(
          angle
        ) *
        distance +
        "px"
      );


      spark.style.setProperty(
        "--dy",
        Math.sin(
          angle
        ) *
        distance +
        "px"
      );


      document.body.appendChild(
        spark
      );


      setTimeout(
        () =>
          spark.remove(),
        680
      );

    }

  }


  function buildDecorations(
    level
  ) {

    const world =
      getWorld();


    if (
      !world ||
      decoratedLevel === level
    ) {

      return;
    }


    world
      .querySelectorAll(
        ".fofo-interactive-decor,.fofo-secret-note"
      )
      .forEach(
        element =>
          element.remove()
      );


    decoratedLevel =
      level;


    const worldWidth =
      WORLD_WIDTHS[level] ||
      Math.max(
        world.scrollWidth,
        7000
      );


    const symbols =
      DECOR_SYMBOLS[level] ||
      DECOR_SYMBOLS[1];


    const positions =
      DECOR_POSITIONS[level] ||
      DECOR_POSITIONS[1];


    positions.forEach(
      ([fraction,bottom],index) => {

        const decor =
          document.createElement(
            "span"
          );


        decor.className =
          `fofo-interactive-decor fofo-decor-level-${level}`;


        decor.textContent =
          symbols[
            index %
            symbols.length
          ];


        decor.style.left =
          (
            worldWidth *
            fraction
          ) +
          "px";


        decor.style.bottom =
          bottom +
          "px";


        decor.style.animationDelay =
          -(
            index *
            .37
          ) +
          "s";


        world.appendChild(
          decor
        );

      }
    );


    /*
      One hidden developer note in the final level.
      It sits near the ground in the later part of the journey,
      so it is discoverable but not placed directly on the main UI.
    */
    if (
      level === 4
    ) {

      const note =
        document.createElement(
          "button"
        );


      note.type =
        "button";


      note.className =
        "fofo-secret-note";


      note.textContent =
        "✉";


      note.setAttribute(
        "aria-label",
        "A hidden note"
      );


      note.style.left =
        (
          worldWidth *
          .735
        ) +
        "px";


      note.style.bottom =
        "160px";


      if (
        localStorage.getItem(
          STORAGE.secretFound
        ) === "true"
      ) {

        note.classList.add(
          "fofo-found"
        );

      }


      note.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          openDeveloperNote();

        }
      );


      world.appendChild(
        note
      );

    }


    startDecorationLoop();

  }


  function startDecorationLoop() {

    clearInterval(
      decorTimer
    );


    decorTimer =
      setInterval(
        () => {

          if (
            !gameplayVisible()
          ) {

            return;

          }


          const player =
            getPlayer();


          if (
            !player
          ) {

            return;

          }


          const playerRect =
            player
              .getBoundingClientRect();


          const playerX =
            playerRect.left +
            playerRect.width /
            2;


          const playerY =
            playerRect.top +
            playerRect.height /
            2;


          document
            .querySelectorAll(
              ".fofo-interactive-decor"
            )
            .forEach(
              decor => {

                const rect =
                  decor
                    .getBoundingClientRect();


                /*
                  Skip decorations that are nowhere near the viewport.
                  This keeps the feature cheap on phones.
                */
                if (
                  rect.right < -180 ||
                  rect.left >
                  window.innerWidth +
                  180
                ) {

                  decor.classList.remove(
                    "fofo-near"
                  );

                  return;
                }


                const dx =
                  Math.abs(
                    (
                      rect.left +
                      rect.width /
                      2
                    ) -
                    playerX
                  );


                const dy =
                  Math.abs(
                    (
                      rect.top +
                      rect.height /
                      2
                    ) -
                    playerY
                  );


                const close =
                  dx < 125 &&
                  dy < 150;


                decor.classList.toggle(
                  "fofo-near",
                  close
                );


                if (
                  close &&
                  decor.dataset.fofoReacted !==
                  "1"
                ) {

                  decor.dataset.fofoReacted =
                    "1";


                  decorBurst(
                    rect
                  );

                }


                if (
                  !close &&
                  dx > 210
                ) {

                  decor.dataset.fofoReacted =
                    "0";

                }

              }
            );


          const note =
            document.querySelector(
              ".fofo-secret-note"
            );


          if (
            note
          ) {

            const rect =
              note
                .getBoundingClientRect();


            const dx =
              Math.abs(
                (
                  rect.left +
                  rect.width /
                  2
                ) -
                playerX
              );


            const dy =
              Math.abs(
                (
                  rect.top +
                  rect.height /
                  2
                ) -
                playerY
              );


            const close =
              dx < 125 &&
              dy < 155;


            note.classList.toggle(
              "fofo-near",
              close
            );


            if (
              close &&
              localStorage.getItem(
                STORAGE.secretFound
              ) !== "true" &&
              note.dataset.fofoOpening !==
              "1"
            ) {

              note.dataset.fofoOpening =
                "1";


              setTimeout(
                () => {

                  if (
                    note.classList.contains(
                      "fofo-near"
                    )
                  ) {

                    openDeveloperNote();

                  }


                  note.dataset.fofoOpening =
                    "0";

                },
                420
              );

            }

          }

        },
        125
      );

  }


  // -------------------------------------------------------
  // Random compliment popup
  // -------------------------------------------------------

  function scheduleCompliment() {

    clearTimeout(
      complimentTimer
    );


    const delay =
      24000 +
      Math.random() *
      18000;


    complimentTimer =
      setTimeout(
        () => {

          if (
            gameplayVisible()
          ) {

            showCompliment();

          }


          scheduleCompliment();

        },
        delay
      );

  }


  function showCompliment() {

    ensureSharedUI();


    const previous =
      Number(
        complimentPopup.dataset.lastIndex ||
        -1
      );


    let index =
      Math.floor(
        Math.random() *
        COMPLIMENTS.length
      );


    if (
      COMPLIMENTS.length > 1 &&
      index === previous
    ) {

      index =
        (
          index +
          1
        ) %
        COMPLIMENTS.length;

    }


    complimentPopup.dataset.lastIndex =
      String(
        index
      );


    complimentPopup.textContent =
      COMPLIMENTS[index];


    complimentPopup.classList.remove(
      "fofo-show"
    );


    void complimentPopup.offsetWidth;


    complimentPopup.classList.add(
      "fofo-show"
    );

  }


  // -------------------------------------------------------
  // Replay modifiers
  // -------------------------------------------------------

  function getReplayModifier(
    level=activeLevel
  ) {

    if (
      Number(
        localStorage.getItem(
          STORAGE.replayLevel
        )
      ) !==
      Number(
        level
      )
    ) {

      return "classic";

    }


    return (
      localStorage.getItem(
        STORAGE.modifier
      ) ||
      "classic"
    );

  }


  function setReplayModifier(
    level,
    modifier
  ) {

    localStorage.setItem(
      STORAGE.replayLevel,
      String(
        level
      )
    );


    localStorage.setItem(
      STORAGE.modifier,
      modifier
    );


    localStorage.setItem(
      STORAGE.noDamageFailed,
      "false"
    );


    updateReplayBadge(
      level
    );

  }


  function clearReplayModifier(
    level
  ) {

    setReplayModifier(
      level,
      "classic"
    );

  }


  function enemySpeedMultiplier(
    level
  ) {

    return getReplayModifier(
      level
    ) === "hard"
      ? 1.35
      : 1;

  }


  function platformSpeedMultiplier(
    level
  ) {

    return getReplayModifier(
      level
    ) === "hard"
      ? 1.12
      : 1;

  }


  function registerDamage(
    level
  ) {

    if (
      getReplayModifier(
        level
      ) !== "nodamage"
    ) {

      return;

    }


    if (
      localStorage.getItem(
        STORAGE.noDamageFailed
      ) === "true"
    ) {

      return;

    }


    localStorage.setItem(
      STORAGE.noDamageFailed,
      "true"
    );


    updateReplayBadge(
      level
    );


    showToast(
      "NO DAMAGE CHALLENGE MISSED — finish the run anyway ♡"
    );

  }


  function completeReplay(
    level
  ) {

    const modifier =
      getReplayModifier(
        level
      );


    if (
      modifier === "hard"
    ) {

      setTimeout(
        () => {

          showToast(
            "HARDER RUN COMPLETE ♡"
          );

        },
        420
      );

    }


    if (
      modifier === "nodamage"
    ) {

      const failed =
        localStorage.getItem(
          STORAGE.noDamageFailed
        ) === "true";


      setTimeout(
        () => {

          showToast(
            failed
              ? "NO DAMAGE CHALLENGE — try again next run ♡"
              : "PERFECT — NO DAMAGE CHALLENGE COMPLETE ♡"
          );

        },
        420
      );

    }

  }


  function updateReplayBadge(
    level=activeLevel
  ) {

    ensureSharedUI();


    const modifier =
      getReplayModifier(
        level
      );


    replayBadge.classList.remove(
      "fofo-visible",
      "fofo-failed"
    );


    if (
      modifier === "classic"
    ) {

      return;

    }


    if (
      modifier === "hard"
    ) {

      replayBadge.textContent =
        "REPLAY • HARDER RUN";


      replayBadge.classList.add(
        "fofo-visible"
      );

      return;

    }


    const failed =
      localStorage.getItem(
        STORAGE.noDamageFailed
      ) === "true";


    replayBadge.textContent =
      failed
        ? "REPLAY • NO DAMAGE MISSED"
        : "REPLAY • NO DAMAGE";


    replayBadge.classList.add(
      "fofo-visible"
    );


    replayBadge.classList.toggle(
      "fofo-failed",
      failed
    );

  }


  function ensureReplayOverlay() {

    if (
      replayOverlay
    ) {

      return;

    }


    replayOverlay =
      document.createElement(
        "div"
      );


    replayOverlay.className =
      "fofo-replay-overlay";


    replayOverlay.innerHTML = `
      <div class="fofo-replay-card">
        <div class="fofo-replay-kicker">REPLAY MODE</div>
        <h2>How do you want to replay?</h2>
        <p>
          The story stays the same — this only changes the challenge for this replay.
        </p>

        <div class="fofo-replay-options">
          <button type="button" class="fofo-replay-option" data-replay-mode="classic">
            <strong>CLASSIC RUN</strong>
            <span>The original level, exactly as it was designed.</span>
          </button>

          <button type="button" class="fofo-replay-option" data-replay-mode="hard">
            <strong>HARDER RUN</strong>
            <span>Enemies move 35% faster and moving platforms are a little quicker.</span>
          </button>

          <button type="button" class="fofo-replay-option" data-replay-mode="nodamage">
            <strong>NO DAMAGE</strong>
            <span>Finish without losing a heart to complete the challenge.</span>
          </button>
        </div>

        <button type="button" class="fofo-replay-cancel">
          NOT NOW
        </button>
      </div>
    `;


    document.body.appendChild(
      replayOverlay
    );


    replayOverlay
      .querySelector(
        ".fofo-replay-cancel"
      )
      .addEventListener(
        "click",
        () => {

          replayOverlay.classList.remove(
            "fofo-show"
          );

          replayOverlay._callback =
            null;

        }
      );


    replayOverlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          replayOverlay
        ) {

          replayOverlay.classList.remove(
            "fofo-show"
          );

          replayOverlay._callback =
            null;

        }

      }
    );


    replayOverlay
      .querySelectorAll(
        "[data-replay-mode]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const level =
                Number(
                  replayOverlay.dataset.level
                );


              const mode =
                button.dataset.replayMode;


              setReplayModifier(
                level,
                mode
              );


              const callback =
                replayOverlay._callback;


              replayOverlay.classList.remove(
                "fofo-show"
              );


              replayOverlay._callback =
                null;


              window.FofoPolish?.haptic?.(
                "light"
              );


              callback?.();

            }
          );

        }
      );

  }


  function chooseReplayModifier(
    level,
    callback
  ) {

    ensureReplayOverlay();


    replayOverlay.dataset.level =
      String(
        level
      );


    replayOverlay._callback =
      callback;


    replayOverlay.classList.add(
      "fofo-show"
    );


    window.FofoPolish?.haptic?.(
      "light"
    );

  }


  // -------------------------------------------------------
  // Secret developer note
  // -------------------------------------------------------

  function ensureSecretOverlay() {

    if (
      secretOverlay
    ) {

      return;

    }


    secretOverlay =
      document.createElement(
        "div"
      );


    secretOverlay.className =
      "fofo-secret-note-overlay";


    secretOverlay.innerHTML = `
      <div class="fofo-secret-note-card">
        <div class="fofo-note-kicker">YOU FOUND SOMETHING HIDDEN</div>
        <h2>A little note from Mohamed ♡</h2>

        <p>
          Fofo, every jump, every flower, every light, and every tiny detail
          in this game was made because I wanted your birthday gift to feel
          like a little world that belonged only to you.
          <br><br>
          The gifts are part of it — but the real reason I built all of this
          was to give you one more memory that is completely ours.
        </p>

        <div class="fofo-note-signature">
          Made with love, just for you. ♡
        </div>

        <button type="button" class="fofo-note-close">
          KEEP GOING ♡
        </button>
      </div>
    `;


    document.body.appendChild(
      secretOverlay
    );


    secretOverlay
      .querySelector(
        ".fofo-note-close"
      )
      .addEventListener(
        "click",
        () => {

          secretOverlay.classList.remove(
            "fofo-show"
          );

        }
      );

  }


  function openDeveloperNote() {

    ensureSecretOverlay();


    localStorage.setItem(
      STORAGE.secretFound,
      "true"
    );


    const note =
      document.querySelector(
        ".fofo-secret-note"
      );


    note?.classList.add(
      "fofo-found"
    );


    secretOverlay.classList.add(
      "fofo-show"
    );


    window.FofoPolish?.haptic?.(
      "reveal"
    );

  }


  // -------------------------------------------------------
  // Level activation
  // -------------------------------------------------------

  function activateLevel(
    level
  ) {

    activeLevel =
      Number(
        level
      ) ||
      0;


    if (
      !activeLevel
    ) {

      return;

    }


    ensureSharedUI();


    updateReplayBadge(
      activeLevel
    );


    clearTimeout(
      complimentTimer
    );


    scheduleCompliment();


    /*
      World elements are created by each level script.
      Wait briefly, then retry if necessary.
    */
    let tries =
      0;


    const buildWhenReady =
      () => {

        const world =
          getWorld();


        const player =
          getPlayer();


        if (
          world &&
          player
        ) {

          buildDecorations(
            activeLevel
          );

          return;

        }


        tries++;


        if (
          tries < 18
        ) {

          setTimeout(
            buildWhenReady,
            180
          );

        }

      };


    setTimeout(
      buildWhenReady,
      240
    );

  }


  // Standalone levels can activate automatically.
  document.addEventListener(
    "DOMContentLoaded",
    () => {

      const standalone =
        detectStandaloneLevel();


      if (
        standalone
      ) {

        setTimeout(
          () => {

            activateLevel(
              standalone
            );

          },
          520
        );

      }

    },
    {
      once:true
    }
  );


  // -------------------------------------------------------
  // Public API
  // -------------------------------------------------------

  window.FofoExtras = {
    activateLevel,
    respawn,
    chooseReplayModifier,
    setReplayModifier,
    clearReplayModifier,
    getReplayModifier,
    enemySpeedMultiplier,
    platformSpeedMultiplier,
    registerDamage,
    completeReplay,
    showCompliment,
    showToast,
    openDeveloperNote
  };

})();
