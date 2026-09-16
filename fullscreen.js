// =========================================================
// FOFO BIRTHDAY ADVENTURE — SHARED FULLSCREEN
// Works across Main Menu, Level 1-4 and Ending.
// =========================================================

(function () {

  const STORAGE_KEY =
    "fofoFullscreenEnabled";


  function isWanted() {

    return localStorage.getItem(
      STORAGE_KEY
    ) === "true";
  }


  function setWanted(
    value
  ) {

    localStorage.setItem(
      STORAGE_KEY,
      value
        ? "true"
        : "false"
    );
  }


  function fullscreenElement() {

    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      null
    );
  }


  function isActive() {

    return Boolean(
      fullscreenElement()
    );
  }


  async function lockLandscape() {

    try {

      if (
        screen.orientation &&
        screen.orientation.lock
      ) {

        await screen.orientation.lock(
          "landscape"
        );
      }

    }
    catch (error) {

      // Orientation lock is optional in browsers.

    }
  }


  async function enter() {

    setWanted(
      true
    );


    if (
      isActive()
    ) {

      await lockLandscape();

      return true;
    }


    const root =
      document.documentElement;


    const request =
      root.requestFullscreen ||
      root.webkitRequestFullscreen;


    if (
      !request
    ) {

      return false;
    }


    try {

      if (
        root.requestFullscreen
      ) {

        await root.requestFullscreen({
          navigationUI:"hide"
        });

      }
      else {

        await request.call(
          root
        );
      }


      await lockLandscape();

      return true;

    }
    catch (error) {

      /*
        Normal mobile browsers require requestFullscreen()
        to happen inside a real user gesture. The global gesture
        listeners below will retry on the next tap.
      */

      return false;
    }
  }


  async function exit() {

    setWanted(
      false
    );


    const exitFullscreen =
      document.exitFullscreen ||
      document.webkitExitFullscreen;


    if (
      !fullscreenElement() ||
      !exitFullscreen
    ) {

      return true;
    }


    try {

      await exitFullscreen.call(
        document
      );

      return true;

    }
    catch (error) {

      return false;
    }
  }


  async function toggle() {

    if (
      isActive()
    ) {

      return exit();
    }


    return enter();
  }


  /*
    Moving from index.html to level2/3/4.html normally makes
    the browser leave fullscreen. If the user enabled fullscreen
    in Settings, the FIRST real tap in the new level puts it back.
  */
  async function restoreOnGesture() {

    if (
      isWanted() &&
      !isActive()
    ) {

      await enter();
    }
  }


  [
    "pointerdown",
    "touchstart",
    "click",
    "keydown"
  ].forEach(
    eventName => {

      document.addEventListener(
        eventName,
        restoreOnGesture,
        {
          capture:true,
          passive:
            eventName ===
            "touchstart"
        }
      );

    }
  );


  window.FofoFullscreen = {
    enter,
    exit,
    toggle,
    isActive,
    isWanted,
    setWanted
  };

})();
