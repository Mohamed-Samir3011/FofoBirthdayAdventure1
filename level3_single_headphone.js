// =========================================================
// LEVEL 3 — SINGLE JBL IMAGE UI FIX
// UI only. Does NOT modify player movement or animation.
// =========================================================

(function () {

  const FIRST_IMAGE =
    "assets/level3_product/jbl_black_view_1.png";


  function applySingleProduct() {

    const image =
      document.getElementById(
        "productImage"
      );


    const previous =
      document.getElementById(
        "productPrev"
      );


    const next =
      document.getElementById(
        "productNext"
      );


    const dots =
      document.getElementById(
        "productDots"
      );


    if (
      image
    ) {

      image.src =
        FIRST_IMAGE;


      image.alt =
        "Black JBL Tune 530BT";

    }


    if (
      previous
    ) {

      previous.hidden =
        true;

      previous.setAttribute(
        "aria-hidden",
        "true"
      );

      previous.tabIndex =
        -1;

    }


    if (
      next
    ) {

      next.hidden =
        true;

      next.setAttribute(
        "aria-hidden",
        "true"
      );

      next.tabIndex =
        -1;

    }


    if (
      dots
    ) {

      dots.innerHTML =
        "";

      dots.hidden =
        true;

      dots.setAttribute(
        "aria-hidden",
        "true"
      );

    }

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      applySingleProduct,
      {
        once:true
      }
    );

  }
  else {

    applySingleProduct();

  }


  /*
    Level 3's existing reveal code already resets to view 1.
    Re-apply when the gift page becomes visible as an extra guarantee.
  */
  const giftPage =
    document.getElementById(
      "giftPage"
    );


  if (
    giftPage
  ) {

    const observer =
      new MutationObserver(
        () => {

          if (
            !giftPage.classList.contains(
              "hidden"
            )
          ) {

            applySingleProduct();

          }

        }
      );


    observer.observe(
      giftPage,
      {
        attributes:true,
        attributeFilter:[
          "class"
        ]
      }
    );

  }

})();
