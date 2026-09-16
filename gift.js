// =====================================================
// FOFO BIRTHDAY ADVENTURE
// LEVEL 1 GIFT REVEAL
// + CONTINUE TO LEVEL 2
// =====================================================


(() => {


  // =====================================================
  // ELEMENTS
  // =====================================================

  const finishScreen =
    document.getElementById(
      "finishScreen"
    );


  const giftRevealScreen =
    document.getElementById(
      "giftRevealScreen"
    );


  const giftStoryScreen =
    document.getElementById(
      "giftStoryScreen"
    );


  const giftBoxButton =
    document.getElementById(
      "giftBoxButton"
    );


  const giftBoxImage =
    document.getElementById(
      "giftBoxImage"
    );


  const openGiftButton =
    document.getElementById(
      "openGiftButton"
    );


  const giftStoryButton =
    document.getElementById(
      "giftStoryButton"
    );


  const closeStoryButton =
    document.getElementById(
      "closeStoryButton"
    );


  const backToGiftButton =
    document.getElementById(
      "backToGiftButton"
    );


  const giftHint =
    document.getElementById(
      "giftHint"
    );


  const particlesHost =
    document.getElementById(
      "giftParticles"
    );


  const storyShell =
    document.querySelector(
      ".story-shell"
    );


  // =====================================================
  // IMAGES
  // =====================================================

  const CLOSED_BOX =
    "assets/fofo_gift_level1_assets/glossy_valentine_birthday_gift_box.png";


  const OPEN_BOX =
    "assets/fofo_gift_level1_assets/luxurious_valentine_snack_gift_box.png";


  // =====================================================
  // STATE
  // =====================================================

  let opened =
    false;


  let rewardShown =
    false;


  // =====================================================
  // CREATE CONTINUE BUTTON
  // =====================================================

  let continueLevelButton =
    document.getElementById(
      "continueLevelButton"
    );


  if (
    !continueLevelButton &&
    storyShell
  ) {

    continueLevelButton =
      document.createElement(
        "button"
      );


    continueLevelButton.id =
      "continueLevelButton";


    /*
      بنستخدم نفس Style زرار Back
      علشان مش محتاجين نغير gift.css.
    */

    continueLevelButton.className =
      "back-to-gift-button";


    continueLevelButton.type =
      "button";


    continueLevelButton.innerHTML =
      "CONTINUE ✨";


    /*
      Back على الشمال
      Continue على اليمين
    */

    continueLevelButton.style.left =
      "72%";


    continueLevelButton.style.width =
      "42%";


    continueLevelButton.style.minWidth =
      "0";


    continueLevelButton.style.background =
      "linear-gradient(180deg,#d96a9e,#962d64)";


    continueLevelButton.style.boxShadow =
      "0 6px 0 #641c45, 0 9px 16px rgba(47,10,32,0.25)";


    storyShell.appendChild(
      continueLevelButton
    );

  }


  /*
    نحرك Back شوية للشمال
    عشان يبقى جنب Continue.
  */

  if (
    backToGiftButton
  ) {

    backToGiftButton.style.left =
      "28%";


    backToGiftButton.style.width =
      "42%";


    backToGiftButton.style.minWidth =
      "0";

  }


  // =====================================================
  // SCREEN CONTROL
  // =====================================================

  function setScreenVisible(
    screen,
    visible
  ) {

    if (
      !screen
    ) {

      return;

    }


    screen.classList.toggle(
      "show",
      visible
    );


    screen.setAttribute(

      "aria-hidden",

      visible
        ? "false"
        : "true"

    );

  }


  // =====================================================
  // CONFETTI
  // =====================================================

  function createConfetti(
    count = 70
  ) {

    if (
      !particlesHost
    ) {

      return;

    }


    particlesHost.innerHTML =
      "";


    const colors = [

      "#ff77ad",

      "#ffd65c",

      "#ffffff",

      "#bc4b83",

      "#7edcf7",

      "#ffb6d3"

    ];


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const particle =
        document.createElement(
          "span"
        );


      particle.className =
        "gift-particle";


      const size =
        6 +
        Math.random() *
        9;


      const left =
        Math.random() *
        100;


      const delay =
        Math.random() *
        0.55;


      const duration =
        2.2 +
        Math.random() *
        2.6;


      const rotation =
        `${Math.floor(
          Math.random() *
          180
        )}deg`;


      particle.style.left =
        `${left}%`;


      particle.style.top =
        `${-10 -
        Math.random() *
        25}px`;


      particle.style.width =
        `${size}px`;


      particle.style.height =
        `${size *
        (
          0.55 +
          Math.random() *
          0.7
        )}px`;


      particle.style.background =

        colors[
          Math.floor(
            Math.random() *
            colors.length
          )
        ];


      particle.style.animationDelay =
        `${delay}s`;


      particle.style.setProperty(

        "--duration",

        `${duration}s`

      );


      particle.style.setProperty(

        "--rotation",

        rotation

      );


      particlesHost.appendChild(
        particle
      );

    }

  }


  // =====================================================
  // RESET GIFT
  // =====================================================

  function resetGiftReveal() {

    opened =
      false;


    if (
      giftBoxImage
    ) {

      giftBoxImage.src =
        CLOSED_BOX;

    }


    giftBoxButton?.classList.remove(
      "opened"
    );


    if (
      openGiftButton
    ) {

      openGiftButton.style.display =
        "block";

    }


    giftStoryButton?.classList.remove(
      "show"
    );


    if (
      giftHint
    ) {

      giftHint.textContent =
        "Tap the box to reveal your first gift.";

    }

  }


  // =====================================================
  // SHOW LEVEL 1 REWARD
  // =====================================================

  function showReward() {

    if (
      rewardShown
    ) {

      return;

    }


    rewardShown =
      true;


    resetGiftReveal();


    setScreenVisible(
      finishScreen,
      false
    );


    setScreenVisible(
      giftStoryScreen,
      false
    );


    setScreenVisible(
      giftRevealScreen,
      true
    );


    createConfetti(
      45
    );

  }


  // =====================================================
  // OPEN GIFT
  // =====================================================

  function openGift() {

    if (
      opened
    ) {

      return;

    }


    opened =
      true;


    giftBoxImage.src =
      OPEN_BOX;


    giftBoxButton.classList.add(
      "opened"
    );


    openGiftButton.style.display =
      "none";


    if (
      giftHint
    ) {

      giftHint.textContent =
        "Your sweet snack box is here! 🍫🍜🍬";

    }


    createConfetti(
      95
    );


    window.setTimeout(

      () => {

        giftStoryButton.classList.add(
          "show"
        );

      },

      520

    );

  }


  // =====================================================
  // STORY
  // =====================================================

  function showStory() {

    setScreenVisible(
      giftStoryScreen,
      true
    );

  }


  function hideStory() {

    setScreenVisible(
      giftStoryScreen,
      false
    );

  }


  // =====================================================
  // CONTINUE AFTER LEVEL 1
  // =====================================================

  function continueAfterLevelOne() {

    /*
      اقفل البرقية.
    */

    setScreenVisible(
      giftStoryScreen,
      false
    );


    /*
      اقفل شاشة الهدية.
    */

    setScreenVisible(
      giftRevealScreen,
      false
    );


    /*
      اقفل Finish Screen لو لسه موجودة.
    */

    setScreenVisible(
      finishScreen,
      false
    );


    /*
      Reset للهدية لو احتجنا نلعب Level 1
      مرة تانية فيما بعد.
    */

    rewardShown =
      false;


    resetGiftReveal();


    /*
      menu.js هو المسؤول عن:
      - تسجيل Level 1 Complete
      - Unlock Level 2
      - فتح Level Select
      - تشغيل Menu Music
    */

    if (
      typeof window
        .completeLevelOneAndReturnToLevels ===
      "function"
    ) {

      window
        .completeLevelOneAndReturnToLevels();

    }

    else {

      console.error(
        "Menu return function not found."
      );

    }

  }


  // =====================================================
  // EVENTS
  // =====================================================

  giftBoxButton?.addEventListener(
    "click",
    openGift
  );


  openGiftButton?.addEventListener(
    "click",
    openGift
  );


  giftStoryButton?.addEventListener(
    "click",
    showStory
  );


  closeStoryButton?.addEventListener(
    "click",
    hideStory
  );


  backToGiftButton?.addEventListener(
    "click",
    hideStory
  );


  continueLevelButton?.addEventListener(
    "click",
    continueAfterLevelOne
  );


  // =====================================================
  // DETECT LEVEL COMPLETE
  // =====================================================

  if (
    finishScreen
  ) {

    const observer =
      new MutationObserver(

        () => {

          if (
            finishScreen
              .classList
              .contains(
                "show"
              )
          ) {

            finishScreen
              .classList
              .remove(
                "show"
              );


            showReward();

          }

        }

      );


    observer.observe(

      finishScreen,

      {

        attributes:
          true,

        attributeFilter:
          ["class"]

      }

    );

  }


})();