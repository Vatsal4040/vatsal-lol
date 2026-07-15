/**
 * Future Timeline Interactive Engine
 * Art Direction & Reusable Exhibit Layouts.
 * Includes: 500-star catalog, shooting stars timer, 3D rotating globe,
 * live clock, dynamic exhibit generator, and dynamic accent colors.
 */

(function () {
  "use strict";

  // Force scroll reset to top immediately on load and disable restoration
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });

  /* ==========================================================================
     1. HANDCRAFTED 500-STAR SYSTEM (Deterministic & Twinkling)
     ========================================================================== */
  let seed = 98765;
  function lcgRandom() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function initStarfield() {
    const starField = document.getElementById("star-field");
    if (!starField) return;

    const fragment = document.createDocumentFragment();
    const numStars = 500;

    for (let i = 0; i < numStars; i++) {
      const star = document.createElement("div");
      const roll = lcgRandom();
      
      let category = "star-tiny";
      let colorClass = "";
      
      // Determine star properties based on custom categories
      if (roll < 0.55) {
        // Tiny white stars
        category = "star-tiny";
      } else if (roll < 0.75) {
        // Medium white stars
        category = "star-medium";
      } else if (roll < 0.85) {
        // Distant large breathing stars
        category = "star-distant";
      } else if (roll < 0.90) {
        // Blue glowing stars
        category = "star-blue";
      } else if (roll < 0.94) {
        // Warm yellow stars
        category = "star-yellow";
      } else if (roll < 0.97) {
        // Rare orange stars
        category = "star-orange";
      } else {
        // Very rare purple stars
        category = "star-purple";
      }

      star.className = `star ${category}`;
      if (colorClass) star.classList.add(colorClass);

      // Deterministic fixed positions
      const x = lcgRandom() * 100;
      const y = lcgRandom() * 100;
      star.style.left = `${x}vw`;
      star.style.top = `${y}vh`;

      // Set base size adjustments
      if (category === "star-distant") {
        star.style.width = "3px";
        star.style.height = "3px";
      }

      // Distribute stars evenly into Animation Groups A-E
      const animRoll = lcgRandom();
      let animGroup = "group-d"; // default static-like
      if (animRoll < 0.22) {
        animGroup = "group-a"; // Group A: slow opacity pulse (12-18s)
      } else if (animRoll < 0.44) {
        animGroup = "group-b"; // Group B: brightness pulse (8-12s)
      } else if (animRoll < 0.66) {
        animGroup = "group-c"; // Group C: scale change (14-20s)
      } else if (animRoll < 0.85) {
        animGroup = "group-d"; // Group D: almost static (20-30s)
      } else {
        animGroup = "group-e"; // Group E: occasional shimmer (25-40s)
      }
      star.classList.add(animGroup);

      // Vary animation timings
      let animDuration = 0;
      if (animGroup === "group-a") animDuration = 12 + lcgRandom() * 6;
      else if (animGroup === "group-b") animDuration = 8 + lcgRandom() * 4;
      else if (animGroup === "group-c") animDuration = 14 + lcgRandom() * 6;
      else if (animGroup === "group-d") animDuration = 20 + lcgRandom() * 10;
      else animDuration = 25 + lcgRandom() * 15;

      star.style.animationDuration = `${animDuration}s`;
      star.style.animationDelay = `${lcgRandom() * 15}s`;

      // Apply initial opacity variations
      const baseOpacity = category === "star-tiny" ? (0.2 + lcgRandom() * 0.4) :
                          category === "star-medium" ? (0.4 + lcgRandom() * 0.4) :
                          category === "star-distant" ? (0.15 + lcgRandom() * 0.25) :
                          (0.3 + lcgRandom() * 0.5);
      star.style.opacity = baseOpacity;

      fragment.appendChild(star);
    }
    starField.appendChild(fragment);
  }

  /* ==========================================================================
     2. DYNAMIC SUBTLE SHOOTING STARS ENGINE (One every 45-60s)
     ========================================================================== */
  function initShootingStars() {
    const container = document.getElementById("shooting-stars");
    if (!container) return;

    function triggerShootingStar() {
      const star = document.createElement("div");
      star.className = "shooting-star";

      // Random starting coordinates (within top-right viewport quadrant)
      const x = 30 + Math.random() * 60; // 30vw to 90vw
      const y = Math.random() * 30;       // 0vh to 30vh
      
      star.style.left = `${x}vw`;
      star.style.top = `${y}vh`;

      // Randomize animation speed slightly
      const speed = 1.0 + Math.random() * 0.6; // 1s to 1.6s
      star.style.animationDuration = `${speed}s`;

      container.appendChild(star);

      // Clean up DOM node after transition finishes
      setTimeout(() => {
        star.remove();
      }, speed * 1000);

      // Schedule next trigger: 45 to 60 seconds (as requested)
      const nextDelay = 45000 + Math.random() * 15000;
      setTimeout(triggerShootingStar, nextDelay);
    }

    // Schedule first shooting star
    const initialDelay = 10000 + Math.random() * 15000;
    setTimeout(triggerShootingStar, initialDelay);
  }

  /* ==========================================================================
     3. LIVE DATE/TIME CLOCK
     ========================================================================== */
  function updateLiveClock() {
    const dateEl = document.getElementById("live-date");
    const timeEl = document.getElementById("live-time");
    if (!dateEl || !timeEl) return;

    const now = new Date();

    // Date: DD MMM YYYY (e.g. 07 JUL 2026)
    const day = String(now.getDate()).padStart(2, "0");
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    // Time: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    dateEl.textContent = `${day} ${month} ${year}`;
    timeEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  /* ==========================================================================
     4. TIMELINE DATABASE (23 Chronological Exhibits with layouts & accents)
     ========================================================================== */
  const timelineEvents = [
    {
      year: "In 2061",
      headline: "Halley's Comet will return again.",
      svg: "halleys-comet-animated.svg",
      secondarySvg: "half-earth.svg",
      description: "After a 75-year journey through the cold solar system, Halley's Comet will once again light up Earth's night sky.",
      funFact: "It will be much closer to Earth during this visit than it was in 1986.",
      layout: "center",
      animation: "comet",
      accentColor: "#3a86ff" // Icy blue
    },
    {
      year: "In 2178",
      headline: "Pluto completes its first orbit since discovery.",
      svg: "pluto.svg",
      secondarySvg: "confetti-animated.svg",
      description: "Discovered by Clyde Tombaugh in 1930, Pluto takes 248 Earth years to complete a single revolution around the Sun.",
      funFact: "Still not officially a planet, but it's celebrating anyway.",
      layout: "center",
      animation: "confetti",
      accentColor: "#ff006e" // Pink celebration
    },
    {
      year: "In 2300",
      headline: "Voyager 1 will finally reach the Oort Cloud.",
      svg: "voyager-1.svg",
      secondarySvg: "oort-cloud.svg",
      description: "Having travelled billions of kilometers, humanity's most distant messenger will reach the inner boundary of the mysterious Oort Cloud.",
      funFact: "Don't expect any postcards; communication signals will have long faded.",
      layout: "center",
      animation: "voyager",
      accentColor: "#00b4d8" // Electric teal
    },
    {
      year: "In 50,000 years",
      headline: "The star VY Canis Majoris will explode in a supernova.",
      svg: "hypernova-animated.svg",
      description: "One of the largest known red hypergiants will exhaust its fuel, collapsing to trigger a stellar explosion of historic magnitude.",
      funFact: "The resulting blast will briefly outshine the combined light of the entire Milky Way.",
      layout: "center",
      animation: "supernova",
      accentColor: "#ff5722" // Supernova orange
    },
    {
      year: "In 75,000 years",
      headline: "A new Hawaiian island will surface.",
      svg: "hawaii-island.svg",
      secondarySvg: "hawaii-water.svg",
      description: "Lōʻihi Seamount, an active submarine volcano off the coast of Hawaii, will rise above the Pacific ocean surface to become the newest island in the chain.",
      funFact: "Lōʻihi will eventually merge with the Big Island as it expands.",
      layout: "center",
      animation: "hawaii",
      accentColor: "#2ec4b6" // Ocean green
    },
    {
      year: "In 100,000 years",
      headline: "Many of today's constellations will be unrecognizable.",
      svg: "little-dipper.svg",
      description: "The proper motion of stars through the galaxy will shift their relative positions, distorting familiar star clusters like the Big and Little Dipper.",
      funFact: "Cosmic patterns are transient; our night sky is merely a temporary snapshot.",
      layout: "center",
      animation: "none",
      accentColor: "#e9c46a" // Stellar gold
    },
    {
      year: "In 1 million years",
      headline: "Two of Uranus' moons will collide.",
      svg: "moons-collide-animated.svg",
      description: "The chaotic gravitational interactions of Uranus' tightly packed inner moon system will cause Cressida and Desdemona to crash into each other.",
      funFact: "Uranus' outer rings are composed of debris from similar ancient collisions.",
      layout: "center",
      animation: "none",
      accentColor: "#ff9f1c" // Crash orange
    },
    {
      year: "In 50 million years",
      headline: "The Martian moon Phobos will slowly break up.",
      svg: "mars.svg",
      secondarySvg: "phobos.svg",
      description: "Mars' gravitational tides will exceed Phobos' structural limits, ripping the moon apart to form a dust ring around the red planet.",
      funFact: "Mars will join Saturn and Uranus as a ringed planet, though its rings will be thin and rocky.",
      layout: "center",
      animation: "phobos-orbit",
      accentColor: "#f4a261" // Dusty orange
    },
    {
      year: "In 100 million years",
      headline: "Saturn will slowly lose its rings.",
      svg: "saturn-animated.svg",
      description: "Saturn's iconic rings will drain into the planet's atmosphere over millions of years due to gravity and magnetic fields.",
      funFact: "Oddly, Saturn will spend most of its life without rings. It's just a phase.",
      layout: "center",
      animation: "none",
      accentColor: "#e9c46a" // Ring gold
    },
    {
      year: "In 180 million years",
      headline: "Days become 25 hours long.",
      svg: "clock.svg",
      description: "Tidal friction from the Moon's gravitational pull continues to slow the Earth's rotation, gradually lengthening our day.",
      funFact: "Hopefully work hours don't also increase.",
      layout: "center",
      animation: "clock",
      accentColor: "#e76f51" // Sunset orange
    },
    {
      year: "In 600 million years",
      headline: "The last total solar eclipse happens.",
      svg: "eclipse-animated.svg",
      secondarySvg: "glasses.svg",
      description: "As the Moon slowly drifts away from the Earth at a rate of 3.8 cm per year, its apparent size will shrink until it can no longer block the Sun.",
      funFact: "Don't forget your glasses! This is one you don't want to miss.",
      layout: "center",
      animation: "eclipse",
      accentColor: "#ffb703" // Eclipse yellow
    },
    {
      year: "In 800 million years",
      headline: "Photosynthesis is no longer possible on Earth.",
      svg: "plant-wilting.svg",
      secondarySvg: "single-cell-animated.svg",
      description: "An increasingly bright Sun accelerates the weathering of silicate rocks, trapping carbon dioxide in the crust and halting plant photosynthesis.",
      funFact: "All plant and animal life will go extinct, and single-cell organisms dominate once again.",
      layout: "center",
      animation: "photosynthesis",
      accentColor: "#d62828" // Dying plant red
    },
    {
      year: "In 1.1 billion years",
      headline: "The Sun will be 10% brighter and oceans will evaporate.",
      svg: "dry-map.svg",
      secondarySvg: "mars-pretty.svg",
      description: "The Sun's rising heat output will trigger a runaway greenhouse effect, vaporizing Earth's oceans and leaving it a dry, scorched desert.",
      funFact: "But on the bright side, Mars will enter the habitable zone and could provide a new home.",
      layout: "center",
      animation: "dry-earth",
      accentColor: "#f77f00" // Evaporation orange
    },
    {
      year: "In 5 billion years",
      headline: "The Andromeda Galaxy will collide with the Milky Way.",
      svg: "galaxy-form.svg",
      secondarySvg: "milkdromeda-animated.svg",
      description: "Gravity will merge our galaxy with neighboring Andromeda, creating a new, massive elliptical galaxy.",
      funFact: "We will gain a trillion neighboring stars. Anyone left will see an incredible night sky.",
      layout: "center",
      animation: "andromeda",
      accentColor: "#7209b7" // Galaxy purple
    },
    {
      year: "In 7 billion years",
      headline: "As the Sun becomes a red giant, it grows to 256 times its current size.",
      svg: "giant-sun-animated.svg",
      description: "Our Sun will swell into a massive red giant, swallowing Mercury, Venus, and ultimately the Earth itself.",
      funFact: "It was a good run, but the Earth was freeloading for too long anyway.",
      layout: "center",
      animation: "sun-swallow",
      accentColor: "#e63946" // Red giant engulfing red
    },
    {
      year: "In 8 billion years",
      headline: "The Sun cools down and becomes a white dwarf.",
      svg: "star-background-dim.svg",
      description: "After shedding its outer layers, the Sun will shrink to a dense core, cooling down into a white dwarf star.",
      funFact: "Any remaining life will need to get a lot closer to stay warm.",
      layout: "center",
      animation: "white-dwarf",
      accentColor: "#a8dadc" // Cooling white-blue
    },
    {
      year: "In 450 billion years",
      headline: "The 50+ galaxies in the Local Group merge.",
      svg: "local-group.svg",
      description: "The gravitational attraction binding the Local Group will pull its member galaxies together into one enormous elliptical system.",
      funFact: "The group is finally back together.",
      layout: "center",
      animation: "none",
      accentColor: "#457b9d" // Group navy
    },
    {
      year: "In 1 trillion years",
      headline: "Radiation leftover from the Big Bang becomes undetectable.",
      svg: "cmb-animated.svg",
      description: "The Cosmic Microwave Background (CMB) radiation will red-shift into undetectable wavelengths, erasing the primary evidence of the Big Bang.",
      funFact: "Making it much harder to pass astronomy exams in the future.",
      layout: "center",
      animation: "none",
      accentColor: "#1d3557" // Dark cosmic navy
    },
    {
      year: "In 10 trillion years",
      headline: "Red dwarf stars turn into the first ever blue dwarf stars.",
      svg: "blue-dwarf-animated.svg",
      description: "The smallest red dwarf stars will finally exhaust their convective cores, heating up temporarily into blue dwarfs before their fuel is fully depleted.",
      funFact: "A brief cosmic glow before the lights go out.",
      layout: "center",
      animation: "none",
      accentColor: "#4361ee" // Deep star blue
    },
    {
      year: "In 100 trillion years",
      headline: "The gas clouds needed to make stars are depleted.",
      svg: "gas-cloud-animated.svg",
      description: "Interstellar gas will be locked away in stellar remnants. Star birth will cease entirely across the cosmos.",
      funFact: "Somewhere in the universe, the last star is born. And soon only white dwarf, brown dwarf, and neutron stars are left.",
      layout: "center",
      animation: "last-star",
      accentColor: "#3f37c9" // Indigo
    },
    {
      year: "In 10^15 years",
      headline: "Everything outside the Local Group is impossible to reach.",
      svg: "space-ship-2-animated.svg",
      description: "Cosmic expansion accelerates, moving all distant galaxy clusters beyond our observable horizon.",
      funFact: "Even at the speed of light, no travel or communication outside our local system will ever be possible.",
      layout: "center",
      animation: "none",
      accentColor: "#4cc9f0" // Observable horizon cyan
    },
    {
      year: "In 10^17 years",
      headline: "White dwarf stars cool to black dwarf stars. The universe is dark.",
      svg: "star-background-dim.svg",
      description: "White dwarfs cool completely, emitting no light or heat, becoming cold carbon structures.",
      funFact: "The only natural light comes from the occasional supernova.",
      layout: "center",
      animation: "none",
      accentColor: "#480ca8" // Dark carbon purple
    },
    {
      year: "In 10^30 years",
      headline: "Black holes are the only things remaining, and they are massive.",
      svg: "black-hole-animated.svg",
      secondarySvg: "black-hole-gamma-animated.svg",
      description: "Matter will disintegrate due to proton decay. The cosmos enters the Black Hole Era, populated only by black holes.",
      funFact: "In the last few seconds of a black hole's life, it will emit a burst of light. Like a final firework show, but each firework billions of years apart.",
      layout: "center",
      animation: "blackhole",
      accentColor: "#7209b7" // Hawking radiation violet
    }
  ];


  /* ==========================================================================
     5. CACHING SVG INLINER
     ========================================================================== */
  const svgCache = {};

  async function fetchAndInlineSvg(url, container, animationClass) {
    if (svgCache[url]) {
      injectSvgContent(svgCache[url], container, animationClass);
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const text = await response.text();
      svgCache[url] = text;
      injectSvgContent(text, container, animationClass);
    } catch (e) {
      container.innerHTML = `<img src="${url}" class="${animationClass || ''}" alt="Illustration" draggable="false">`;
    }
  }

  function injectSvgContent(svgText, container, animationClass) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svgElement = doc.querySelector("svg");
    if (svgElement) {
      if (animationClass) {
        svgElement.classList.add(animationClass);
      }
      svgElement.classList.add("event-svg");
      container.innerHTML = "";
      container.appendChild(svgElement);
    } else {
      container.innerHTML = svgText;
    }
  }

  /* ==========================================================================
     6. DYNAMIC EXHIBIT GENERATION
     ========================================================================== */
  function renderEvents() {
    const timelineMount = document.getElementById("timeline-mount");
    if (!timelineMount) return;

    let htmlBuffer = "";

    timelineEvents.forEach((event, index) => {
      const isLayoutLeft = event.layout === "image-left";
      const isLayoutRight = event.layout === "image-right";
      const isDouble = event.layout === "double";
      
      let mediaHtml = "";

      // Match the exact HTML tags and wrappers from original stylesheet
      if (event.animation === "comet") {
        mediaHtml = `
          <div class="event-media-container" data-svg="assets/${event.svg}" data-anim-class="halleys-commet"></div>
          <div class="event-media-container" style="padding:0; margin-top:50px;">
            <img src="assets/${event.secondarySvg}" class="half-earth">
          </div>`;
      } else if (event.animation === "confetti") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block; overflow:visible;">
            <div class="confetti"></div>
            <img src="assets/${event.svg}" class="pluto">
          </div>`;
      } else if (event.animation === "voyager") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block; overflow:visible;">
            <div class="oort-cloud"></div>
            <img src="assets/${event.svg}" class="voyager-1">
          </div>`;
      } else if (event.animation === "supernova") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block;">
            <div class="two-columns grid-vy-canis">
              <div class="vy-canis"></div>
              <p class="event-description" style="text-align:left;">The star VY Canis Majoris will explode in a supernova.</p>
            </div>
            <img src="assets/${event.svg}" class="hyper-nova">
          </div>`;
      } else if (event.animation === "hawaii") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block; overflow:visible;">
            <img src="assets/${event.svg}" class="hawaii-island">
            <div class="hawaii-water"></div>
          </div>`;
      } else if (event.animation === "phobos-orbit") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block; overflow:visible;">
            <div class="mars-orbit-wrapper">
              <img src="assets/${event.svg}" class="mars">
              <img src="assets/${event.secondarySvg}" class="phobos">
            </div>
            <div class="two-columns grid-mars-rings">
              <img src="assets/mars-rings.svg" class="mars-rings">
              <p class="event-description" style="text-align:left;">So Mars will get its own ring.</p>
            </div>
          </div>`;
      } else if (event.animation === "clock") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0;">
            <div class="clock-wrapper">
              <img src="assets/${event.svg}" class="clock">
              <div class="clock-hand"></div>
              <div class="clock-hand-small"></div>
            </div>
          </div>`;
      } else if (event.animation === "eclipse") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block;">
            <div class="eclipse-wrapper">
              <img src="assets/${event.svg}" class="eclipse">
            </div>
            <div class="two-columns grid-eclipse">
              <img src="assets/${event.secondarySvg}" class="glasses">
              <p class="event-description" style="text-align:left; font-weight:700;">Don't forget your glasses!</p>
            </div>
          </div>`;
      } else if (event.animation === "photosynthesis") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block;">
            <div class="plant-wilting-wrapper">
              <img src="assets/${event.svg}" class="plant-wilting">
            </div>
            <div class="fossils"></div>
            <img src="assets/${event.secondarySvg}" class="single-cell">
          </div>`;
      } else if (event.animation === "dry-earth") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block;">
            <div class="two-columns grid-dry-earth-1">
              <p class="event-description" style="text-align:left;">The Sun will be 10% brighter.</p>
              <div class="bright-sun"></div>
            </div>
            <div class="two-columns grid-dry-earth-2">
              <div class="earth-dry"></div>
              <p class="event-description" style="text-align:left;">And so the oceans will evaporate.</p>
            </div>
            <img src="assets/${event.secondarySvg}" class="mars-pretty">
          </div>`;
      } else if (event.animation === "andromeda") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block;">
            <img src="assets/${event.svg}" class="galaxy-form">
            <img src="assets/${event.secondarySvg}" class="milkdromeda">
            <div class="night-sky-wrapper" style="margin-top:20px;">
              <div class="night-sky"></div>
              <img src="assets/telescope-animated.svg" class="telescope" onerror="this.style.display='none'">
            </div>
          </div>`;
      } else if (event.animation === "sun-swallow") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block;">
            <img src="assets/${event.svg}" class="sun-eat-earth">
            <div class="earth-fall">
              <div class="earth-fall-sun"></div>
              <div class="earth-fall-dry-wrap">
                <div class="earth-fall-dry"></div>
              </div>
              <div class="earth-fall-sun-clip"></div>
            </div>
          </div>`;
      } else if (event.animation === "white-dwarf") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block;">
            <div class="two-columns grid-white-dwarf">
              <p class="event-description" style="text-align:left;">And becomes a white dwarf star.</p>
              <div class="white-dwarf"></div>
            </div>
          </div>`;
      } else if (event.animation === "last-star") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block;">
            <img src="assets/${event.svg}" class="gas-cloud">
            <div class="two-columns grid-last-star">
              <div class="last-star"></div>
              <p class="event-description" style="text-align:left;">Somewhere in the universe, the last star is born.</p>
            </div>
          </div>`;
      } else if (event.animation === "blackhole") {
        mediaHtml = `
          <div class="event-media-container" style="padding:0; display:block;">
            <img src="assets/${event.svg}" class="black-hole">
            <img src="assets/${event.secondarySvg}" class="black-hole">
          </div>`;
      } else {
        // Standard single SVG image
        const animClass = event.svg.includes("halleys-comet") ? "halleys-commet" :
                          event.svg.includes("pluto") ? "pluto" :
                          event.svg.includes("voyager-1") ? "voyager-1" :
                          event.svg.includes("little-dipper") ? "little-dipper" :
                          event.svg.includes("saturn") ? "saturn" :
                          event.svg.includes("local-group") ? "local-group" :
                          event.svg.includes("cmb") ? "cmb" :
                          event.svg.includes("blue-dwarf") ? "blue-dwarf" :
                          event.svg.includes("gas-cloud") ? "gas-cloud" :
                          event.svg.includes("space-ship-2") ? "space-ship" :
                          event.svg.includes("black-hole") ? "black-hole" : "";
        mediaHtml = `<div class="event-media-container" data-svg="assets/${event.svg}" data-anim-class="${animClass}"></div>`;
      }


      // Generate structures based on layout classes
      let cardBody = "";
      if (isLayoutLeft || isLayoutRight) {
        cardBody = `
          <div class="event-text-group">
            <h2 class="event-headline">${event.headline}</h2>
            <p class="event-description">${event.description}</p>
            ${event.funFact ? `<p class="event-funny">${event.funFact}</p>` : ""}
          </div>
          ${mediaHtml}
        `;
      } else {
        cardBody = `
          <h2 class="event-headline">${event.headline}</h2>
          ${mediaHtml}
          <p class="event-description">${event.description}</p>
          ${event.funFact ? `<p class="event-funny">${event.funFact}</p>` : ""}
        `;
      }

      htmlBuffer += `
        <section class="timeline-event-section" id="event-${index}">
          <div class="year-separator">
            <div class="year-separator-line">━━━━━━━━━━━━━━━━━━━━━━</div>
            <div class="year-separator-text">${event.year}</div>
            <div class="year-separator-line">━━━━━━━━━━━━━━━━━━━━━━</div>
          </div>
          <div class="event-card layout-${event.layout}">
            ${cardBody}
          </div>
        </section>
      `;
    });

    timelineMount.innerHTML = htmlBuffer;
  }

  /* ==========================================================================
     7. SCROLL-DRIVEN TRANSITIONS & AXIAL EARTH GLOBE ROTATION
     ========================================================================== */
  function handleLandingScroll() {
    const scrollY = window.scrollY;
    const landingContent = document.getElementById("landing-content");
    const landingEarth = document.getElementById("landing-earth");
    const landingYou = document.getElementById("landing-you");

    const vh = window.innerHeight;
    const progress = Math.min(scrollY / (vh * 0.85), 1);

    if (landingContent) {
      landingContent.style.opacity = 1 - progress;
      landingContent.style.transform = `translateY(${-progress * 90}px)`;
      
      if (progress >= 1) {
        landingContent.style.visibility = "hidden";
      } else {
        landingContent.style.visibility = "visible";
      }
    }

    if (landingEarth) {
      const earthScale = 1 - progress * 0.22;
      landingEarth.style.transform = `scale(${earthScale})`;
    }
    if (landingYou) {
      const youScale = 1 - progress * 0.22;
      landingYou.style.transform = `scale(${youScale})`;
    }
  }

  // Inserts a beautiful rotating 3D globe inside the landing page container
  function setupLandingGlobe() {
    const container = document.getElementById("landing-earth-container");
    if (!container) return;

    // Remove the static half-earth illustration since we are rendering a rotating blue/green 3D Earth globe
    const earthImg = document.getElementById("landing-earth");
    if (earthImg) earthImg.remove();

    const globe = document.createElement("div");
    globe.id = "landing-earth";
    globe.className = "landing-earth-globe";
    
    // Prepend inside container to keep it behind the "YOU" pointer
    container.insertBefore(globe, container.firstChild);
  }

  /* ==========================================================================
     8. INTERSECTION OBSERVER FOR VISIBILITY, SVG INLINING, & ACCENT THEMES
     ========================================================================== */
  function initTimelineObserver() {
    // Fallback if IntersectionObserver is not supported
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".timeline-event-section").forEach(section => {
        section.classList.add("active");
        const svgMounts = section.querySelectorAll("[data-svg]");
        svgMounts.forEach(mount => {
          const url = mount.getAttribute("data-svg");
          const animClass = mount.getAttribute("data-anim-class") || "";
          fetchAndInlineSvg(url, mount, animClass);
        });
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: "100px 0px 100px 0px", // Trigger 100px before entering viewport for reliability
      threshold: 0.01
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const section = entry.target;
        const isIntersecting = entry.isIntersecting;
        
        section.classList.toggle("active", isIntersecting);

        if (isIntersecting) {
          // Extract exhibit index
          const idParts = section.id.split("-");
          const index = parseInt(idParts[1], 10);
          const event = timelineEvents[index];

          if (event) {
            // Apply event accent colors dynamically
            section.style.setProperty("--event-accent", event.accentColor);
            section.style.setProperty("--event-accent-dim", `${event.accentColor}66`); // 40% opacity hex
          }

          // Inline SVGs for this section dynamically
          const svgMounts = section.querySelectorAll("[data-svg]");
          svgMounts.forEach(mount => {
            const url = mount.getAttribute("data-svg");
            const animClass = mount.getAttribute("data-anim-class") || "";
            fetchAndInlineSvg(url, mount, animClass);
          });
        }
      });
    }, observerOptions);

    document.querySelectorAll(".timeline-event-section").forEach(section => {
      observer.observe(section);
    });

    // Observer for ending transitions
    const endingDot = document.querySelector(".ending-dot");
    const endingQuote = document.querySelector(".ending-quote-wrapper");
    const endingDivider = document.querySelector(".ending-divider");

    const endingObserver = new IntersectionObserver((entries, self) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          endingDot?.classList.add("active");
          endingQuote?.classList.add("active");
          endingDivider?.classList.add("active");

          // Invoke parent footer recommend cards trigger
          if (typeof window.VatsalLolGameComplete === "function") {
            window.VatsalLolGameComplete();
          }
          self.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const endingContainer = document.getElementById("ending-container");
    if (endingContainer) {
      endingObserver.observe(endingContainer);
    }
  }

  /* ==========================================================================
     9. ENGINE LOAD INITIALIZATION
     ========================================================================== */
  window.addEventListener("DOMContentLoaded", () => {
    initStarfield();
    initShootingStars();
    renderEvents();
    setupLandingGlobe();
    initTimelineObserver();

    // Start clock ticking
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // Run initial scroll check
    handleLandingScroll();
  });

  window.addEventListener("scroll", handleLandingScroll);

})();
