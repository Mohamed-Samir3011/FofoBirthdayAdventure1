// =========================================================
// FOFO BIRTHDAY ADVENTURE — SMOOTH GAMEPLAY ENGINE
// ---------------------------------------------------------
// 1) Smart critical-first preload + idle background warmup
// 2) Render/DOM culling
// 3) Logic culling helpers
// 4) Lazy offscreen animations
// 5) Mobile GPU / effect quality helpers
// 6) HUD compositor helpers
// 7) Smooth camera + direction look-ahead
// 8) Jump Buffer + Coyote Time
// 9) Strong pointer capture for touch controls
// 10) Eager SFX/audio warmup
// 11) Adaptive quality from measured FPS
// 12) Fast scene timing helpers
// =========================================================

(function () {

  const state = {
    cameraX:null,
    lastGroundedAt:-Infinity,
    jumpBufferUntil:0,
    coyoteConsumed:false,
    qualityMode:
      localStorage.getItem("fofoQualityMode") || "auto",
    qualityTier:"high",
    fps:60,
    cullTimer:0,
    audioAssets:new Set(),
    backgroundAssets:new Set(),
    started:false
  };


  // -------------------------------------------------------
  // Device helpers
  // -------------------------------------------------------

  function isTouchDevice() {
    return (
      navigator.maxTouchPoints > 0 ||
      matchMedia("(pointer:coarse)").matches
    );
  }


  function isPhoneLike() {
    return (
      isTouchDevice() &&
      Math.min(window.innerWidth, window.innerHeight) <= 820
    );
  }


  function idle(callback, timeout=600) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(callback, {timeout});
    } else {
      setTimeout(() => callback({timeRemaining:() => 8}), 45);
    }
  }


  // -------------------------------------------------------
  // 10) AUDIO PRELOAD
  // Wrap Audio before level scripts create their SFX objects.
  // -------------------------------------------------------

  const NativeAudio = window.Audio;

  if (NativeAudio && !window.__fofoAudioWrapped) {
    function FofoAudio(src) {
      const audio = new NativeAudio(src);
      audio.preload = "auto";

      if (src) {
        state.audioAssets.add(audio);
        try { audio.load(); } catch (_) {}
      }

      return audio;
    }

    FofoAudio.prototype = NativeAudio.prototype;
    Object.setPrototypeOf(FofoAudio, NativeAudio);
    window.Audio = FofoAudio;
    window.__fofoAudioWrapped = true;
  }


  function registerAudioElement(audio) {
    if (!audio) return;
    audio.preload = "auto";
    state.audioAssets.add(audio);
  }


  function warmAudioInBackground() {
    document.querySelectorAll("audio").forEach(registerAudioElement);

    idle(() => {
      state.audioAssets.forEach(audio => {
        try {
          audio.preload = "auto";
          if (audio.readyState < 2) audio.load();
        } catch (_) {}
      });
    });
  }


  // -------------------------------------------------------
  // 1) SMART PRELOAD
  // Only block on critical/nearby assets. Warm the rest later.
  // -------------------------------------------------------

  function collectCssBackgroundUrls() {
    const found = new Set();

    function addUrls(value) {
      if (!value || value === "none") return;
      const matches = value.matchAll(/url\(["']?([^"')]+)["']?\)/g);
      for (const match of matches) {
        const url = match[1];
        if (url && !url.startsWith("data:")) found.add(url);
      }
    }

    document.querySelectorAll("*").forEach(el => {
      try { addUrls(getComputedStyle(el).backgroundImage); } catch (_) {}
    });

    return [...found];
  }


  function isCriticalImage(img) {
    if (!img || !img.src) return false;

    if (img.matches(
      "#fofo,.fofo,.player,.heart,.hud img,#hud img,.game-hud img," +
      "#controls img,.mobile-controls img,.background,.menu-background,.date-background"
    )) return true;

    const rect = img.getBoundingClientRect();
    const marginX = window.innerWidth * 1.15;
    const marginY = window.innerHeight * 1.2;

    return (
      rect.right > -marginX &&
      rect.left < window.innerWidth + marginX &&
      rect.bottom > -marginY &&
      rect.top < window.innerHeight + marginY
    );
  }


  function waitForImage(img, maxMs=650) {
    if (!img || !img.src) return Promise.resolve();
    if (img.complete && img.naturalWidth > 0) {
      if (img.decode) return img.decode().catch(() => {});
      return Promise.resolve();
    }

    return new Promise(resolve => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      img.addEventListener("load", done, {once:true});
      img.addEventListener("error", done, {once:true});
      setTimeout(done, maxMs);
    });
  }


  function warmImage(img) {
    if (!img) return;
    try {
      img.decoding = "async";
      if (img.decode) img.decode().catch(() => {});
    } catch (_) {}
  }


  function warmBackgroundUrl(url) {
    if (!url || state.backgroundAssets.has(url)) return;
    state.backgroundAssets.add(url);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }


  function backgroundWarmup(images, backgroundUrls) {
    let index = 0;

    function batch(deadline) {
      let count = 0;
      while (index < images.length && count < 8 && deadline.timeRemaining() > 1) {
        warmImage(images[index++]);
        count++;
      }

      if (index < images.length) idle(batch, 900);
    }

    idle(batch, 700);

    idle(() => {
      backgroundUrls.slice(0, 80).forEach(warmBackgroundUrl);
      warmAudioInBackground();
    }, 900);
  }


  async function smartPreload({onProgress, minDuration=560}={}) {
    const startedAt = performance.now();
    const setProgress = value => {
      if (typeof onProgress === "function") onProgress(Math.max(0, Math.min(100, value)));
    };

    setProgress(5);

    // Let the level script build dynamic world assets while the loader is visible.
    await new Promise(resolve => setTimeout(resolve, 150));

    const images = [...document.images];
    const critical = images.filter(isCriticalImage).slice(0, 36);
    const remaining = images.filter(img => !critical.includes(img));
    const backgroundUrls = collectCssBackgroundUrls();

    setProgress(18);

    let complete = 0;
    const total = Math.max(1, critical.length);

    await Promise.all(
      critical.map(async img => {
        await waitForImage(img, 700);
        complete++;
        setProgress(18 + (complete / total) * 72);
      })
    );

    const elapsed = performance.now() - startedAt;
    if (elapsed < minDuration) {
      await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
    }

    setProgress(100);
    backgroundWarmup(remaining, backgroundUrls);
  }


  // -------------------------------------------------------
  // 11) ADAPTIVE QUALITY
  // -------------------------------------------------------

  function deviceStartingTier() {
    if (!isTouchDevice()) return "high";

    const cores = navigator.hardwareConcurrency || 8;
    const memory = navigator.deviceMemory || 8;

    if (cores <= 4 || memory <= 4) return "medium";
    return "high";
  }


  function applyQuality(tier) {
    tier = ["high","medium","low"].includes(tier) ? tier : "high";
    state.qualityTier = tier;

    document.body.classList.remove(
      "fofo-quality-high",
      "fofo-quality-medium",
      "fofo-quality-low"
    );
    document.body.classList.add(`fofo-quality-${tier}`);

    // Keep compatibility with the existing polish performance class.
    document.body.classList.toggle("fofo-performance-mode", tier === "low");

    updateQualityButton();
  }


  function effectiveTierFromFps(fps) {
    const current = state.qualityTier;

    if (current === "high") {
      return fps < 48 ? "medium" : "high";
    }

    if (current === "medium") {
      if (fps < 35) return "low";
      if (fps > 57) return "high";
      return "medium";
    }

    // low
    return fps > 49 ? "medium" : "low";
  }


  function updateQualityButton() {
    const button = document.querySelector('[data-pause-action="performance"]');
    if (!button) return;

    const mode = state.qualityMode.toUpperCase();
    const tier = state.qualityTier.toUpperCase();
    button.textContent = state.qualityMode === "auto"
      ? `QUALITY: AUTO · ${tier}`
      : `QUALITY: ${mode}`;
  }


  function setQualityMode(mode) {
    if (!["auto","high","medium","low"].includes(mode)) mode = "auto";
    state.qualityMode = mode;
    localStorage.setItem("fofoQualityMode", mode);

    if (mode === "auto") {
      applyQuality(effectiveTierFromFps(state.fps || 60));
    } else {
      applyQuality(mode);
    }
  }


  function cycleQualityMode() {
    const order = ["auto","high","medium","low"];
    const next = order[(order.indexOf(state.qualityMode) + 1) % order.length];
    setQualityMode(next);
    return next;
  }


  function startAdaptiveQuality() {
    if (state.qualityMode === "auto") applyQuality(deviceStartingTier());
    else applyQuality(state.qualityMode);

    let frames = 0;
    let sampleStart = performance.now();

    function tick(now) {
      frames++;

      if (now - sampleStart >= 1800) {
        const fps = frames / ((now - sampleStart) / 1000);
        state.fps = Math.round(fps);

        if (state.qualityMode === "auto") {
          applyQuality(effectiveTierFromFps(fps));
        }

        frames = 0;
        sampleStart = now;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }


  // -------------------------------------------------------
  // 2,3,4) DOM / RENDER / LOGIC CULLING
  // -------------------------------------------------------

  const CULL_SELECTOR = [
    ".world-asset", ".asset", ".decor", ".decoration", ".cloud", ".lantern",
    ".enemy", ".ground-enemy", ".flying-enemy", ".pipe-enemy", ".steam-vent",
    ".collectible", ".treat", ".bloom", ".note", ".shard",
    ".platform", ".float-platform", ".garden-platform", ".moving-platform"
  ].join(",");


  function shouldNeverCull(el) {
    return el.matches(
      "#fofo,.fofo,.player,#gate,.gate,.portal,.checkpoint," +
      "#hud,.hud,.game-hud,#controls,.mobile-controls,.finale-page,.story-page,.date-page"
    );
  }


  function updateRenderCulling() {
    const bufferX = window.innerWidth * 0.8;
    const bufferY = window.innerHeight * 0.9;

    document.querySelectorAll(CULL_SELECTOR).forEach(el => {
      if (shouldNeverCull(el)) return;
      if (!el.isConnected) return;

      const rect = el.getBoundingClientRect();
      const offscreen = (
        rect.right < -bufferX ||
        rect.left > window.innerWidth + bufferX ||
        rect.bottom < -bufferY ||
        rect.top > window.innerHeight + bufferY
      );

      el.classList.toggle("fofo-culled", offscreen);
    });
  }


  function startRenderCulling() {
    const loop = () => {
      updateRenderCulling();
      state.cullTimer = setTimeout(loop, state.qualityTier === "low" ? 160 : 115);
    };
    loop();
  }


  function isNearX(entityX, playerX, extra=1150) {
    if (!Number.isFinite(entityX) || !Number.isFinite(playerX)) return true;
    return Math.abs(entityX - playerX) <= Math.max(extra, window.innerWidth * 1.25);
  }


  // -------------------------------------------------------
  // 7) CAMERA — easing + direction look-ahead
  // -------------------------------------------------------

  function resetCamera(value=null) {
    state.cameraX = value;
  }


  function smoothCameraX({playerX, viewportWidth, worldWidth, direction=0, frameFactor=1}) {
    const lookAhead = direction * Math.min(150, viewportWidth * 0.13);
    let target = playerX - viewportWidth * 0.36 + lookAhead;
    target = Math.max(0, Math.min(Math.max(0, worldWidth - viewportWidth), target));

    if (state.cameraX === null || Math.abs(target - state.cameraX) > viewportWidth * 1.25) {
      state.cameraX = target;
      return state.cameraX;
    }

    const easing = Math.min(0.34, 0.105 * Math.max(0.65, frameFactor));
    state.cameraX += (target - state.cameraX) * easing;

    if (Math.abs(target - state.cameraX) < 0.08) state.cameraX = target;
    return state.cameraX;
  }


  // -------------------------------------------------------
  // 8) JUMP BUFFER + COYOTE TIME
  // -------------------------------------------------------

  const COYOTE_MS = 125;
  const BUFFER_MS = 145;


  function updateGroundState(isGrounded, jumpCallback) {
    const now = performance.now();

    if (isGrounded) {
      state.lastGroundedAt = now;
      state.coyoteConsumed = false;

      if (state.jumpBufferUntil >= now && typeof jumpCallback === "function") {
        state.jumpBufferUntil = 0;
        jumpCallback();
      }
    }
  }


  function canCoyoteJump() {
    return (
      !state.coyoteConsumed &&
      performance.now() - state.lastGroundedAt <= COYOTE_MS
    );
  }


  function bufferJump() {
    state.jumpBufferUntil = performance.now() + BUFFER_MS;
  }


  function markJumped() {
    state.coyoteConsumed = true;
    state.jumpBufferUntil = 0;
    state.lastGroundedAt = -Infinity;
  }


  // -------------------------------------------------------
  // 9) TOUCH INPUT — pointer capture + no accidental release
  // -------------------------------------------------------

  const CONTROL_SELECTOR = [
    "#btnLeft", "#btnRight", "#btnJump",
    ".control-image-button", ".game-control", ".image-control",
    "#controls button", ".mobile-controls button"
  ].join(",");


  function enhanceTouchControls() {
    document.querySelectorAll(CONTROL_SELECTOR).forEach(button => {
      if (button.dataset.fofoTouchEnhanced === "1") return;
      button.dataset.fofoTouchEnhanced = "1";

      button.style.touchAction = "none";
      button.style.webkitTouchCallout = "none";
      button.style.userSelect = "none";

      button.querySelectorAll("img").forEach(img => {
        img.draggable = false;
        img.style.pointerEvents = "none";
        img.style.userSelect = "none";
        img.style.webkitTouchCallout = "none";
      });

      button.addEventListener("pointerdown", event => {
        try { button.setPointerCapture(event.pointerId); } catch (_) {}
      }, {capture:true});
    });
  }


  const touchObserver = new MutationObserver(() => enhanceTouchControls());


  // -------------------------------------------------------
  // 6) HUD compositor
  // -------------------------------------------------------

  function promoteHud() {
    document.querySelectorAll(
      "#hud,.hud,.level-hud,.game-hud,#controls,.controls,.mobile-controls,.top-hud,.health-ui"
    ).forEach(el => el.classList.add("fofo-gpu-hud"));
  }


  // -------------------------------------------------------
  // Boot
  // -------------------------------------------------------

  function start() {
    if (state.started) return;
    state.started = true;

    document.documentElement.classList.add("fofo-smooth-engine");
    enhanceTouchControls();
    promoteHud();
    warmAudioInBackground();
    startAdaptiveQuality();
    startRenderCulling();

    touchObserver.observe(document.body, {childList:true, subtree:true});

    const mutation = new MutationObserver(() => {
      promoteHud();
    });
    mutation.observe(document.body, {childList:true, subtree:true});
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, {once:true});
  } else {
    start();
  }


  window.FofoSmooth = {
    smartPreload,
    isNearX,
    smoothCameraX,
    resetCamera,
    updateGroundState,
    canCoyoteJump,
    bufferJump,
    markJumped,
    enhanceTouchControls,
    cycleQualityMode,
    setQualityMode,
    getQualityMode:() => state.qualityMode,
    getQualityTier:() => state.qualityTier,
    getFps:() => state.fps,
    updateQualityButton,
    isPhoneLike
  };

})();
