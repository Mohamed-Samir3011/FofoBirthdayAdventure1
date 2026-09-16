const slideLine = document.getElementById("slideLine");
const subLine = document.getElementById("subLine");
const textStage = document.getElementById("textStage");
const finalCard = document.getElementById("finalCard");
const mainMenuButton = document.getElementById("mainMenuButton");
const birthdayMusic = document.getElementById("birthdayMusic");
const musicStart = document.getElementById("musicStart");
const sparkLayer = document.getElementById("sparkLayer");
const confettiLayer = document.getElementById("confettiLayer");

const slides = [
  {
    main:"Four levels.",
    sub:"Four little worlds made just for you.",
    dir:"left"
  },
  {
    main:"Three gifts.",
    sub:"Each one carrying a tiny piece of our story.",
    dir:"right"
  },
  {
    main:"One date.",
    sub:"A memory we haven't lived yet.",
    dir:"up"
  },
  {
    main:"But this game was never really about gifts.",
    sub:"",
    dir:"left"
  },
  {
    main:"It was about remembering.",
    sub:"The small things you say. The things you love. The moments I never want to forget.",
    dir:"right"
  },
  {
    main:"The chocolate.",
    sub:"Because I still remember your face when you opened the very first gift.",
    dir:"left"
  },
  {
    main:"The flower that never wilts.",
    sub:"Because some beautiful things deserve to stay.",
    dir:"right"
  },
  {
    main:"The headphones.",
    sub:"Because even the smallest thing you say matters to me.",
    dir:"left"
  },
  {
    main:"And the pyramids.",
    sub:"Because the best gift at the end wasn't a thing. It was time together.",
    dir:"up"
  },
  {
    main:"Same girl. Bigger horizons.",
    sub:"Same us. More memories.",
    dir:"right"
  },
  {
    main:"Happy Birthday, Fofo.",
    sub:"And this was only the beginning. ♡",
    dir:"up"
  }
];

let started = false;

birthdayMusic.volume = 0.68;

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function enterClass(dir){
  if(dir === "right") return "enter-right";
  if(dir === "up") return "enter-up";
  return "enter-left";
}

function exitClass(dir){
  if(dir === "right") return "exit-left";
  if(dir === "up") return "exit-up";
  return "exit-right";
}

function clearSlideClasses(){
  slideLine.className = "slide-line";
}

async function showSlide(slide){
  clearSlideClasses();

  slideLine.textContent = slide.main;
  subLine.textContent = slide.sub;

  slideLine.classList.add(enterClass(slide.dir));

  if(slide.sub){
    await sleep(520);
    subLine.classList.add("show");
  }

  /*
    Keep each completed sentence on-screen long enough to actually read it.
    Short lines stay for about 3.6 seconds.
    Longer lines stay for about 4.7 seconds.
    Slides with a longer subtitle get extra reading time.
  */
  const holdTime =
    slide.sub.length > 70
      ? 5200
      : (
          slide.main.length > 30
            ? 4700
            : 3600
        );

  await sleep(holdTime);

  subLine.classList.remove("show");

  clearSlideClasses();
  slideLine.classList.add(exitClass(slide.dir));

  await sleep(800);
}

async function runEnding(){
  if(started) return;
  started = true;

  musicStart.classList.add("hidden");

  birthdayMusic
    .play()
    .catch(() => {
      musicStart.classList.remove("hidden");
    });

  for(const slide of slides){
    await showSlide(slide);
  }

  textStage.classList.add("hidden");
  launchConfetti(90);

  await sleep(320);

  finalCard.classList.remove("hidden");
}

musicStart.addEventListener("click", async () => {
  try{
    await birthdayMusic.play();
  }catch(e){}

  if(!started){
    runEnding();
  }else{
    musicStart.classList.add("hidden");
  }
});

mainMenuButton.addEventListener("click", () => {
  localStorage.setItem("fofoShowLevelSelect","true");
  window.location.href = "index.html";
});

function createSparks(){
  for(let i=0;i<34;i++){
    const s = document.createElement("span");
    s.className = "spark";
    s.style.left = Math.random()*100 + "%";
    s.style.bottom = (-5 - Math.random()*20) + "vh";
    s.style.animationDuration = (5 + Math.random()*8) + "s";
    s.style.animationDelay = (-Math.random()*10) + "s";
    s.style.opacity = 0.3 + Math.random()*0.7;
    sparkLayer.appendChild(s);
  }
}

function launchConfetti(count=60){
  const palette = [
    "#f5ca83",
    "#b71f50",
    "#ff839d",
    "#f5eee0",
    "#922342"
  ];

  for(let i=0;i<count;i++){
    const c = document.createElement("span");
    c.className = "confetti";
    c.style.left = Math.random()*100 + "%";
    c.style.top = (-10 - Math.random()*20) + "vh";
    c.style.background = palette[Math.floor(Math.random()*palette.length)];
    c.style.setProperty("--drift", ((Math.random()-.5)*34) + "vw");
    c.style.animationDuration = (3.8 + Math.random()*3.5) + "s";
    c.style.animationDelay = (Math.random()*1.6) + "s";
    confettiLayer.appendChild(c);

    setTimeout(() => c.remove(), 8500);
  }
}

createSparks();

/*
  Try to start immediately.
  Browsers may block audio autoplay, so the visible "Tap for the finale"
  button remains as a fallback.
*/
setTimeout(() => {
  runEnding();
}, 450);
