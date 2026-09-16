// =========================================================
// FOFO BIRTHDAY ADVENTURE — SHARED POLISH SYSTEM
// Loading / Performance / Pause / Transitions / Haptics
// Checkpoints / Level intro
// =========================================================

(function () {

  const CONFIG = {
    1:{
      title:"Sweet Surprise",
      subtitle:"A candy-filled first adventure."
    },
    2:{
      title:"Burgundy Bloom",
      subtitle:"Where a little flower becomes a forever memory."
    },
    3:{
      title:"Moonlight Echo",
      subtitle:"You said it once. I remembered."
    },
    4:{
      title:"Brighter Horizons",
      subtitle:"The final surprise is a memory we get to live."
    }
  };


  let paused =
    false;

  let introRunning =
    false;

  let currentLevel =
    0;

  const trackedAudio =
    new Set();

  const pausedAudio =
    new Set();


  // -------------------------------------------------------
  // Track normal HTML Audio objects so Pause can stop them.
  // -------------------------------------------------------

  const originalMediaPlay =
    HTMLMediaElement.prototype.play;


  HTMLMediaElement.prototype.play =
    function (...args) {

      trackedAudio.add(
        this
      );


      const musicEnabled =
        localStorage.getItem(
          "fofoMusicEnabled"
        ) !== "false";


      const sfxEnabled =
        localStorage.getItem(
          "fofoSfxEnabled"
        ) !== "false";


      const looksLikeMusic =
        this.loop ||
        /music|theme|birthday|ambient/i.test(
          this.src || ""
        );


      if (
        looksLikeMusic &&
        !musicEnabled
      ) {

        return Promise.resolve();

      }


      if (
        !looksLikeMusic &&
        !sfxEnabled
      ) {

        return Promise.resolve();

      }


      return originalMediaPlay.apply(
        this,
        args
      );
    };


  // -------------------------------------------------------
  // DOM
  // -------------------------------------------------------

  const curtain =
    document.createElement(
      "div"
    );

  curtain.className =
    "fofo-transition-curtain fofo-enter";

  document.body.appendChild(
    curtain
  );


  const checkpointToast =
    document.createElement(
      "div"
    );

  checkpointToast.className =
    "fofo-checkpoint-toast";

  checkpointToast.textContent =
    "Memory Saved ♡";

  document.body.appendChild(
    checkpointToast
  );


  const pauseButton =
    document.createElement(
      "button"
    );

  pauseButton.type =
    "button";

  pauseButton.className =
    "fofo-pause-button";

  pauseButton.innerHTML =
    "Ⅱ";

  pauseButton.setAttribute(
    "aria-label",
    "Pause"
  );

  document.body.appendChild(
    pauseButton
  );


  const pauseOverlay =
    document.createElement(
      "div"
    );

  pauseOverlay.className =
    "fofo-pause-overlay";

  pauseOverlay.innerHTML = `
    <div class="fofo-pause-card">
      <h2>Pause ♡</h2>
      <p>Your little adventure is waiting for you.</p>

      <div class="fofo-pause-actions">
        <button type="button" class="fofo-pause-action fofo-primary" data-pause-action="resume">
          RESUME
        </button>

        <button type="button" class="fofo-pause-action" data-pause-action="restart">
          RESTART LEVEL
        </button>

        <button type="button" class="fofo-pause-action" data-pause-action="menu">
          MAIN MENU
        </button>
      </div>

      <div class="fofo-pause-settings">
        <button type="button" class="fofo-toggle" data-pause-action="music"></button>
        <button type="button" class="fofo-toggle" data-pause-action="sfx"></button>
        <button type="button" class="fofo-toggle" data-pause-action="fullscreen"></button>
        <button type="button" class="fofo-toggle" data-pause-action="performance"></button>
        <button type="button" class="fofo-toggle" data-pause-action="speed"></button>
      </div>
    </div>
  `;

  document.body.appendChild(
    pauseOverlay
  );


  const intro =
    document.createElement(
      "div"
    );

  intro.className =
    "fofo-intro";

  intro.innerHTML = `
    <div class="fofo-intro-card">
      <div class="fofo-intro-level"></div>
      <h2 class="fofo-intro-title"></h2>
      <p class="fofo-intro-sub"></p>
    </div>
  `;

  document.body.appendChild(
    intro
  );


  const loader =
    document.createElement(
      "div"
    );

  loader.className =
    "fofo-loading fofo-hide";

  loader.innerHTML = `
    <div class="fofo-loader-card">
      <div class="fofo-loader-heart">♡</div>
      <h2 class="fofo-loader-title">Loading our memories...</h2>
      <p class="fofo-loader-copy">Making this little world ready for you.</p>

      <div class="fofo-progress-track">
        <div class="fofo-progress-bar"></div>
      </div>

      <div class="fofo-progress-text">0%</div>
    </div>
  `;

  document.body.appendChild(
    loader
  );


  // -------------------------------------------------------
  // HAPTICS
  // -------------------------------------------------------

  function haptic(
    type="light"
  ) {

    if (
      !navigator.vibrate
    ) {

      return;
    }


    const patterns = {
      light:7,
      jump:8,
      collect:12,
      checkpoint:[24,28,25],
      hurt:30,
      reveal:[13,22,17],
      finale:[18,25,18,25,45]
    };


    try {

      navigator.vibrate(
        patterns[type] ||
        8
      );

    }
    catch (error) {}

  }


  // Buttons feel more physical on mobile.
  document.addEventListener(
    "pointerdown",
    event => {

      const control =
        event.target.closest?.(
          "#btnLeft,#btnRight,#btnJump,.game-control,.image-control,.control-image-button,#controls .control"
        );


      if (
        control
      ) {

        haptic(
          control.id === "btnJump"
            ? "jump"
            : "light"
        );

      }


      const reveal =
        event.target.closest?.(
          ".final-image-button,.finale-image-button,.story-image-button"
        );


      if (
        reveal
      ) {

        haptic(
          "reveal"
        );

      }

    },
    {
      passive:true
    }
  );


  // -------------------------------------------------------
  // Performance mode
  // -------------------------------------------------------

  function setPerformanceMode(
    enabled,
    remember=true
  ) {

    document.body.classList.toggle(
      "fofo-performance-mode",
      enabled
    );


    if (
      remember
    ) {

      localStorage.setItem(
        "fofoPerformanceMode",
        enabled
          ? "on"
          : "off"
      );

    }


    updatePauseLabels();

  }


  function detectPerformanceMode() {

    const saved =
      localStorage.getItem(
        "fofoPerformanceMode"
      );


    if (
      saved === "on"
    ) {

      setPerformanceMode(
        true,
        false
      );

      return;

    }


    if (
      saved === "off"
    ) {

      setPerformanceMode(
        false,
        false
      );

      return;

    }


    const coarse =
      matchMedia(
        "(pointer:coarse)"
      ).matches;


    const lowCores =
      navigator.hardwareConcurrency &&
      navigator.hardwareConcurrency <= 4;


    const lowMemory =
      navigator.deviceMemory &&
      navigator.deviceMemory <= 4;


    if (
      coarse &&
      (
        lowCores ||
        lowMemory
      )
    ) {

      setPerformanceMode(
        true,
        false
      );

      return;

    }


    // Short FPS sample after page settles.
    let frames =
      0;

    let start =
      performance.now();


    function sample(
      now
    ) {

      frames++;


      if (
        now -
        start <
        950
      ) {

        requestAnimationFrame(
          sample
        );

        return;
      }


      const fps =
        frames /
        (
          (
            now -
            start
          ) /
          1000
        );


      if (
        coarse &&
        fps <
        47
      ) {

        setPerformanceMode(
          true,
          false
        );

      }

    }


    requestAnimationFrame(
      sample
    );
  }


  // -------------------------------------------------------
  // Loading
  // -------------------------------------------------------

  function setLoaderProgress(
    value
  ) {

    const safe =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            value
          )
        )
      );


    loader
      .querySelector(
        ".fofo-progress-bar"
      )
      .style.width =
        safe + "%";


    loader
      .querySelector(
        ".fofo-progress-text"
      )
      .textContent =
        safe + "%";
  }


  async function showLoader(
    minDuration=950
  ) {

    loader.classList.remove(
      "fofo-hide"
    );


    setLoaderProgress(
      5
    );


    const startTime =
      performance.now();


    const images =
      new Set();


    function register(
      img
    ) {

      if (
        !img ||
        !img.src
      ) {

        return;

      }


      images.add(
        img
      );

    }


    document
      .querySelectorAll(
        "img"
      )
      .forEach(
        register
      );


    const observer =
      new MutationObserver(
        mutations => {

          mutations.forEach(
            mutation => {

              mutation.addedNodes.forEach(
                node => {

                  if (
                    node.nodeType !== 1
                  ) {

                    return;

                  }


                  if (
                    node.tagName === "IMG"
                  ) {

                    register(
                      node
                    );

                  }


                  node
                    .querySelectorAll?.(
                      "img"
                    )
                    .forEach(
                      register
                    );

                }
              );

            }
          );

        }
      );


    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );


    // Give the level JS a moment to create dynamic world images.
    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          170
        )
    );


    const maxWait =
      performance.now() +
      4200;


    while (
      performance.now() <
      maxWait
    ) {

      const total =
        Math.max(
          1,
          images.size
        );


      let ready =
        0;


      images.forEach(
        img => {

          if (
            img.complete &&
            img.naturalWidth > 0
          ) {

            ready++;

          }

        }
      );


      const assetProgress =
        (
          ready /
          total
        ) *
        88;


      const timeProgress =
        Math.min(
          12,
          (
            (
              performance.now() -
              startTime
            ) /
            minDuration
          ) *
          12
        );


      setLoaderProgress(
        assetProgress +
        timeProgress
      );


      if (
        ready >= total &&
        performance.now() -
        startTime >=
        minDuration
      ) {

        break;

      }


      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            80
          )
      );
    }


    observer.disconnect();


    setLoaderProgress(
      100
    );


    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          180
        )
    );


    loader.classList.add(
      "fofo-hide"
    );

  }


  // -------------------------------------------------------
  // Intro card
  // -------------------------------------------------------

  async function showIntro(
    level
  ) {

    const config =
      CONFIG[level];


    if (
      !config
    ) {

      return;

    }


    introRunning =
      true;


    const levelLabel =
      intro.querySelector(
        ".fofo-intro-level"
      );


    const title =
      intro.querySelector(
        ".fofo-intro-title"
      );


    const sub =
      intro.querySelector(
        ".fofo-intro-sub"
      );


    levelLabel.textContent =
      level === 4
        ? "FINAL LEVEL"
        : `LEVEL ${level}`;


    title.textContent =
      config.title;


    sub.textContent =
      config.subtitle;


    intro.classList.remove(
      "fofo-show"
    );


    void intro.offsetWidth;


    intro.classList.add(
      "fofo-show"
    );


    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          2750
        )
    );


    intro.classList.remove(
      "fofo-show"
    );


    introRunning =
      false;

  }


  // -------------------------------------------------------
  // Audio / Pause
  // -------------------------------------------------------

  function pauseTrackedAudio() {

    pausedAudio.clear();


    trackedAudio.forEach(
      audio => {

        if (
          !audio.paused
        ) {

          pausedAudio.add(
            audio
          );


          audio.pause();

        }

      }
    );


    // Level 1 WebAudio system, if available.
    try {

      if (
        window.audioContext &&
        window.audioContext.state ===
        "running"
      ) {

        window.audioContext.suspend();

      }

    }
    catch (error) {}

  }


  function resumeTrackedAudio() {

    const musicEnabled =
      localStorage.getItem(
        "fofoMusicEnabled"
      ) !== "false";


    pausedAudio.forEach(
      audio => {

        const looksLikeMusic =
          audio.loop ||
          /music|theme|birthday|ambient/i.test(
            audio.src || ""
          );


        if (
          looksLikeMusic &&
          !musicEnabled
        ) {

          return;

        }


        originalMediaPlay
          .call(
            audio
          )
          .catch(
            () => {}
          );

      }
    );


    pausedAudio.clear();


    try {

      if (
        window.audioContext &&
        musicEnabled
      ) {

        window.audioContext.resume();

      }

    }
    catch (error) {}

  }



  // -------------------------------------------------------
  // Mobile character speed
  // -------------------------------------------------------

  function getMobileSpeedMode() {

    return (
      localStorage.getItem(
        "fofoMobileSpeed"
      ) ||
      "fast"
    );

  }


  function getMoveMultiplier() {

    const isTouchPhone =
      (
        navigator.maxTouchPoints > 0 ||
        matchMedia(
          "(pointer:coarse)"
        ).matches
      ) &&
      Math.min(
        window.innerWidth,
        window.innerHeight
      ) <= 760;


    if (
      !isTouchPhone
    ) {

      return 1;

    }


    const mode =
      getMobileSpeedMode();


    if (
      mode === "turbo"
    ) {

      return 1.55;

    }


    if (
      mode === "normal"
    ) {

      return 1.15;

    }


    /*
      Default on phones.
      Gives Fofo a noticeably faster feel without making
      collisions or platforming unstable.
    */
    return 1.38;
  }


  function cycleMobileSpeed() {

    const current =
      getMobileSpeedMode();


    const next =
      current === "normal"
        ? "fast"
        : current === "fast"
          ? "turbo"
          : "normal";


    localStorage.setItem(
      "fofoMobileSpeed",
      next
    );


    updatePauseLabels();


    haptic(
      "light"
    );

  }


  function updatePauseLabels() {

    const musicEnabled =
      localStorage.getItem(
        "fofoMusicEnabled"
      ) !== "false";


    const sfxEnabled =
      localStorage.getItem(
        "fofoSfxEnabled"
      ) !== "false";


    const performance =
      document.body.classList.contains(
        "fofo-performance-mode"
      );


    const fullscreenWanted =
      window.FofoFullscreen
        ? window.FofoFullscreen.isWanted()
        : false;


    const musicButton =
      pauseOverlay.querySelector(
        '[data-pause-action="music"]'
      );


    const sfxButton =
      pauseOverlay.querySelector(
        '[data-pause-action="sfx"]'
      );


    const fullscreenButton =
      pauseOverlay.querySelector(
        '[data-pause-action="fullscreen"]'
      );


    const performanceButton =
      pauseOverlay.querySelector(
        '[data-pause-action="performance"]'
      );


    const speedButton =
      pauseOverlay.querySelector(
        '[data-pause-action="speed"]'
      );


    if (
      musicButton
    ) {

      musicButton.textContent =
        `MUSIC: ${musicEnabled ? "ON" : "OFF"}`;

    }


    if (
      sfxButton
    ) {

      sfxButton.textContent =
        `SFX: ${sfxEnabled ? "ON" : "OFF"}`;

    }


    if (
      fullscreenButton
    ) {

      fullscreenButton.textContent =
        `FULLSCREEN: ${fullscreenWanted ? "ON" : "OFF"}`;

    }


    if (
      performanceButton
    ) {

      performanceButton.textContent =
        `PERFORMANCE: ${performance ? "ON" : "AUTO"}`;

    }


    if (
      speedButton
    ) {

      const speedMode =
        getMobileSpeedMode()
          .toUpperCase();


      speedButton.textContent =
        `PHONE SPEED: ${speedMode}`;

    }

  }


  function setAudioPreference(
    key,
    enabled
  ) {

    localStorage.setItem(
      key,
      enabled
        ? "true"
        : "false"
    );


    // Level 1 shared audio API.
    if (
      typeof window.setAudioPreferences ===
      "function"
    ) {

      window.setAudioPreferences({
        musicEnabled:
          localStorage.getItem(
            "fofoMusicEnabled"
          ) !== "false",

        sfxEnabled:
          localStorage.getItem(
            "fofoSfxEnabled"
          ) !== "false",

        musicVolume:
          Number(
            localStorage.getItem(
              "fofoMusicVolume"
            ) || 100
          ) / 100,

        sfxVolume:
          Number(
            localStorage.getItem(
              "fofoSfxVolume"
            ) || 100
          ) / 100
      });

    }


    trackedAudio.forEach(
      audio => {

        const looksLikeMusic =
          audio.loop ||
          /music|theme|birthday|ambient/i.test(
            audio.src || ""
          );


        if (
          key ===
          "fofoMusicEnabled" &&
          looksLikeMusic
        ) {

          if (
            enabled &&
            !paused
          ) {

            originalMediaPlay
              .call(
                audio
              )
              .catch(
                () => {}
              );

          }
          else {

            audio.pause();

          }

        }

      }
    );


    updatePauseLabels();
  }


  function pauseGame() {

    if (
      paused ||
      introRunning
    ) {

      return;

    }


    paused =
      true;


    pauseTrackedAudio();


    pauseOverlay.classList.add(
      "fofo-show"
    );


    updatePauseLabels();


    haptic(
      "light"
    );

  }


  function resumeGame() {

    if (
      !paused
    ) {

      return;

    }


    paused =
      false;


    pauseOverlay.classList.remove(
      "fofo-show"
    );


    resumeTrackedAudio();


    haptic(
      "light"
    );

  }


  pauseButton.addEventListener(
    "click",
    pauseGame
  );


  pauseOverlay.addEventListener(
    "click",
    async event => {

      const action =
        event.target.closest?.(
          "[data-pause-action]"
        )?.dataset.pauseAction;


      if (
        !action
      ) {

        return;

      }


      if (
        action === "resume"
      ) {

        resumeGame();

        return;

      }


      if (
        action === "restart"
      ) {

        haptic(
          "light"
        );


        navigate(
          location.href,
          420
        );

        return;

      }


      if (
        action === "menu"
      ) {

        navigate(
          "index.html",
          520
        );

        return;

      }


      if (
        action === "music"
      ) {

        const enabled =
          localStorage.getItem(
            "fofoMusicEnabled"
          ) === "false";


        setAudioPreference(
          "fofoMusicEnabled",
          enabled
        );

        return;

      }


      if (
        action === "sfx"
      ) {

        const enabled =
          localStorage.getItem(
            "fofoSfxEnabled"
          ) === "false";


        setAudioPreference(
          "fofoSfxEnabled",
          enabled
        );

        return;

      }


      if (
        action === "fullscreen"
      ) {

        if (
          window.FofoFullscreen
        ) {

          if (
            window.FofoFullscreen.isWanted()
          ) {

            await window.FofoFullscreen.exit();

          }
          else {

            window.FofoFullscreen.setWanted(
              true
            );


            await window.FofoFullscreen.enter();

          }

        }


        updatePauseLabels();

        return;

      }


      if (
        action === "performance"
      ) {

        const currentlyOn =
          document.body.classList.contains(
            "fofo-performance-mode"
          );


        setPerformanceMode(
          !currentlyOn,
          true
        );

      }


      if (
        action === "speed"
      ) {

        cycleMobileSpeed();

        return;

      }

    }
  );


  // -------------------------------------------------------
  // Checkpoint feedback
  // -------------------------------------------------------

  function checkpoint() {

    checkpointToast.classList.remove(
      "fofo-show"
    );


    void checkpointToast.offsetWidth;


    checkpointToast.classList.add(
      "fofo-show"
    );


    haptic(
      "checkpoint"
    );


    const centerX =
      window.innerWidth *
      .5;


    const centerY =
      window.innerHeight *
      .26;


    for (
      let i=0;
      i<12;
      i++
    ) {

      const spark =
        document.createElement(
          "i"
        );


      spark.className =
        "fofo-checkpoint-spark";


      spark.style.left =
        centerX + "px";


      spark.style.top =
        centerY + "px";


      const angle =
        (
          Math.PI *
          2 *
          i
        ) /
        12;


      const distance =
        34 +
        Math.random() *
        54;


      spark.style.setProperty(
        "--x",
        Math.cos(
          angle
        ) *
        distance +
        "px"
      );


      spark.style.setProperty(
        "--y",
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
        900
      );

    }

  }


  // -------------------------------------------------------
  // Scene transition
  // -------------------------------------------------------

  function petals(
    count=18
  ) {

    for (
      let i=0;
      i<count;
      i++
    ) {

      const petal =
        document.createElement(
          "i"
        );


      petal.className =
        "fofo-petal";


      petal.style.left =
        Math.random() *
        100 +
        "vw";


      petal.style.setProperty(
        "--drift",
        (
          (
            Math.random() -
            .5
          ) *
          26
        ) +
        "vw"
      );


      petal.style.setProperty(
        "--dur",
        (
          1.8 +
          Math.random() *
          1.6
        ) +
        "s"
      );


      document.body.appendChild(
        petal
      );


      setTimeout(
        () =>
          petal.remove(),
        3700
      );

    }

  }


  function sceneReveal(
    element
  ) {

    if (
      !element
    ) {

      return;

    }


    element.classList.remove(
      "fofo-scene-reveal"
    );


    void element.offsetWidth;


    element.classList.add(
      "fofo-scene-reveal"
    );

  }


  async function navigate(
    url,
    delay=560
  ) {

    if (
      document.documentElement.classList.contains(
        "fofo-transitioning"
      )
    ) {

      return;

    }


    document.documentElement.classList.add(
      "fofo-transitioning"
    );


    pauseButton.classList.remove(
      "fofo-visible"
    );


    petals(
      document.body.classList.contains(
        "fofo-performance-mode"
      )
        ? 10
        : 22
    );


    curtain.classList.remove(
      "fofo-enter"
    );


    curtain.classList.add(
      "fofo-leave"
    );


    haptic(
      "reveal"
    );


    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          delay
        )
    );


    window.location.href =
      url;

  }


  // Animate newly displayed finale/story screens.
  const sceneObserver =
    new MutationObserver(
      mutations => {

        mutations.forEach(
          mutation => {

            if (
              mutation.type !==
              "attributes" ||
              mutation.attributeName !==
              "class"
            ) {

              return;

            }


            const element =
              mutation.target;


            if (
              element.classList.contains(
                "hidden"
              )
            ) {

              return;

            }


            if (
              element.matches?.(
                ".finale-screen,.finale-page,.reveal-page,.date-page,.story-page,#finishScreen,#giftRevealScreen"
              )
            ) {

              sceneReveal(
                element
              );

            }

          }
        );

      }
    );


  sceneObserver.observe(
    document.body,
    {
      subtree:true,
      attributes:true,
      attributeFilter:[
        "class"
      ]
    }
  );


  // -------------------------------------------------------
  // Level boot
  // -------------------------------------------------------

  async function startLevel(
    level,
    options={}
  ) {

    currentLevel =
      Number(
        level
      ) ||
      0;


    paused =
      true;


    pauseButton.classList.remove(
      "fofo-visible"
    );


    if (
      options.loader !==
      false
    ) {

      await showLoader(
        options.fast
          ? 600
          : 1050
      );

    }


    if (
      options.intro !==
      false
    ) {

      await showIntro(
        currentLevel
      );

    }


    paused =
      false;


    pauseButton.classList.add(
      "fofo-visible"
    );


    detectPerformanceMode();

  }


  function isPaused() {

    return (
      paused ||
      introRunning
    );

  }


  // Level 2/3/4 are standalone pages: auto boot.
  const path =
    location.pathname
      .split("/")
      .pop()
      .toLowerCase();


  if (
    path === "level2.html"
  ) {

    startLevel(
      2
    );

  }
  else if (
    path === "level3.html"
  ) {

    startLevel(
      3
    );

  }
  else if (
    path === "level4.html"
  ) {

    startLevel(
      4
    );

  }
  else {

    detectPerformanceMode();

  }


  // -------------------------------------------------------
  // Public API
  // -------------------------------------------------------

  window.FofoPolish = {
    startLevel,
    showLoader,
    showIntro,
    isPaused,
    pause:pauseGame,
    resume:resumeGame,
    checkpoint,
    haptic,
    navigate,
    sceneReveal,
    setPerformanceMode,
    getMoveMultiplier,
    getMobileSpeedMode
  };


  setTimeout(
    () => {

      curtain.classList.remove(
        "fofo-enter"
      );

    },
    760
  );

})();


// Ending page bridge: capture Main Menu click before ending.js changes location.
document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest?.(
        '[data-fofo-main-menu-transition="true"]'
      );


    if (
      !button ||
      !window.FofoPolish
    ) {

      return;

    }


    event.preventDefault();
    event.stopImmediatePropagation();


    window.FofoPolish.navigate(
      "index.html"
    );

  },
  true
);
