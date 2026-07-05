(() => {
      const $ = (selector, root = document) => root.querySelector(selector);
      const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
      const now = new Date();
      const todayIso = now.toISOString().slice(0, 10);
      const state = { stats: null, audio: null, audioOn: false };
      const counters = new Map();
      const formatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
      const birthInput = $("#birthDate");
      const form = $("#birthForm");
      const error = $("#error");
      const params = new URLSearchParams(location.search);
      const dobFromUrl = params.get("dob");
      const isRefresh = performance.getEntriesByType("navigation")[0]?.type === "reload";

      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }

      if (isRefresh) {
        localStorage.removeItem("lifeBirthDate");
      }

      birthInput.max = todayIso;
      birthInput.value = isRefresh ? "" : (dobFromUrl || localStorage.getItem("lifeBirthDate") || "");

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          entry.target.querySelectorAll("[data-counter]").forEach((node) => {
            const key = node.dataset.counter;
            if (state.stats && key in state.stats) animateCounter(node, state.stats[key]);
          });
        });
      }, { threshold: 0.22, rootMargin: "0px 0px -8% 0px" });

      $$(".reveal").forEach((el) => revealObserver.observe(el));

      function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
      }

      function compactNumber(value, digits = 1) {
        return new Intl.NumberFormat("en", {
          notation: "compact",
          maximumFractionDigits: digits
        }).format(value);
      }

      function countLeapYears(startYear, endYear) {
        let count = 0;
        for (let year = startYear; year <= endYear; year++) {
          if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) count++;
        }
        return count;
      }

      function calculateStats(dateString) {
        const birth = new Date(`${dateString}T00:00:00`);
        const ageMs = now - birth;
        const days = Math.max(0, Math.floor(ageMs / 86400000));
        const years = days / 365.2425;
        const birthYear = birth.getFullYear();
        const currentYear = now.getFullYear();
        const hours = days * 24;
        const minutes = hours * 60;
        const seconds = Math.floor(ageMs / 1000);
        const populationAtBirth = clamp(2.55 + (birthYear - 1950) * 0.073, 2.5, 8.1);
        const co2AtBirth = clamp(312 + (birthYear - 1950) * 1.72, 312, 424);
        const literacyAtBirth = clamp(56 + (birthYear - 1950) * 0.47, 50, 88);
        const electricityAtBirth = clamp(45 + (birthYear - 1950) * 0.66, 40, 92);
        const lifeAtBirth = clamp(47 + (birthYear - 1950) * 0.39, 45, 73);
        const internetEra = birthYear < 1995 ? "From dial-up to AI" : birthYear < 2007 ? "Web kid" : birthYear < 2016 ? "Smartphone native" : "Post-feed native";

        return {
          birth,
          birthYear,
          daysAlive: days,
          hoursAlive: hours,
          minutesAlive: minutes,
          secondsAlive: seconds,
          yearsAlive: Math.floor(years),
          heartbeats: Math.round(minutes * 72),
          breaths: Math.round(minutes * 16),
          blinks: Math.round(days * 14400),
          bloodPumped: Math.round(days * 7200),
          sleepYears: +(years * 0.33).toFixed(1),
          redCells: Math.round(days * 200000000000),
          sunDistance: Math.round(years * 940000000),
          galaxyDistance: Math.round(seconds * 230),
          moonOrbits: Math.round(days / 27.3),
          earthRotations: days,
          populationGrowth: +(8.1 - populationAtBirth).toFixed(1),
          co2Increase: Math.round(424 - co2AtBirth),
          inflation: Math.round(Math.max(0, (Math.pow(1.036, Math.max(0, currentYear - birthYear)) - 1) * 100)),
          electricity: Math.round(92 - electricityAtBirth),
          literacy: Math.round(88 - literacyAtBirth),
          lifeExpectancy: +(73 - lifeAtBirth).toFixed(1),
          iplSeasons: Math.max(0, currentYear - Math.max(birthYear, 2008) + 1),
          olympics: Math.max(0, Math.floor((currentYear - Math.max(birthYear, 1896)) / 2) + 1),
          leapYears: countLeapYears(birthYear, currentYear),
          internetEra
        };
      }

      function animateCounter(node, target) {
        const old = counters.get(node);
        if (old) cancelAnimationFrame(old);
        const duration = 1450;
        const decimal = !Number.isInteger(Number(target));
        const start = performance.now();
        let lastFlash = 0;

        const tick = (time) => {
          const progress = clamp((time - start) / duration, 0, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          const value = Number(target) * eased;
          node.textContent = Math.abs(target) >= 1000000
            ? compactNumber(value)
            : decimal
              ? value.toFixed(1)
              : formatter.format(Math.round(value));
if (time - lastFlash > 90) {
  node.classList.remove("counting");
  void node.offsetWidth;
  node.classList.add("counting");
  lastFlash = time;
}
          if (progress < 1) counters.set(node, requestAnimationFrame(tick));
        };

        counters.set(node, requestAnimationFrame(tick));
      }
function fillStats(stats) {
        $$("[data-counter]").forEach((node) => {
          const key = node.dataset.counter;
          const section = node.closest(".reveal");
          if (key in stats && (!section || section.classList.contains("visible"))) {
            animateCounter(node, stats[key]);
          }
        });

        $("#daysCopy").textContent = `You have existed for ${formatter.format(stats.daysAlive)} days. Some vanished. Some stayed. All of them brought you here.`;
        $("#internetEra").textContent = stats.internetEra;
        $("#summaryDays").textContent = compactNumber(stats.daysAlive, 1);
        $("#summaryHeart").textContent = compactNumber(stats.heartbeats, 1);
        $("#summarySpace").textContent = compactNumber(stats.sunDistance, 1);
        $("#summaryLine").textContent = `Born in ${stats.birthYear}, you have crossed ${formatter.format(stats.daysAlive)} days, about ${compactNumber(stats.heartbeats)} heartbeats, and ${compactNumber(stats.sunDistance)} kilometers around the Sun.`;
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = birthInput.value;
        const birth = new Date(`${value}T00:00:00`);
        if (!value || Number.isNaN(birth.getTime()) || birth > now) {
          error.textContent = "Choose a real birthday from this timeline.";
          return;
        }

        error.textContent = "";
        localStorage.setItem("lifeBirthDate", value);

        window.setTimeout(() => {
          state.stats = calculateStats(value);
          fillStats(state.stats);
          document.body.classList.add("revealed");
          setTimeout(()=>{

    window.VatsalLolGameComplete?.();

},1000);
          
          $("#days").scrollIntoView({ behavior: "smooth", block: "start" });
        }, 900);
      });

      $("#resetBtn").addEventListener("click", () => {
        document.body.classList.remove("revealed");
        birthInput.focus();
        document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
        $("#hero").scrollIntoView({ behavior: "smooth", block: "start" });
      });

      $("#shareBtn").addEventListener("click", async () => {
        const stats = state.stats;
        const text = stats
          ? `I have lived ${formatter.format(stats.daysAlive)} days, felt about ${compactNumber(stats.heartbeats)} heartbeats, and travelled ${compactNumber(stats.sunDistance)} km around the Sun.`
          : "Your Life in Numbers turns a birthday into a cinematic journey.";
        const shareUrl = stats
          ? `${location.href.split("?")[0]}?dob=${birthInput.value}`
          : location.href;
        if (navigator.share) {
          try {
            await navigator.share({ title: "Your Life in Numbers", text, url: shareUrl });
            return;
          } catch (err) {}
        }
        await navigator.clipboard.writeText(`${text} ${shareUrl}`);
        $("#shareBtn").textContent = "Copied";
        setTimeout(() => { $("#shareBtn").textContent = "Share"; }, 1400);
      });

      $("#downloadBtn").addEventListener("click", () => {
        const stats = state.stats || calculateStats(birthInput.value || "2000-01-01");
        const canvas = document.createElement("canvas");
        const width = 1200;
        const height = 1500;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const grd = ctx.createRadialGradient(220, 120, 80, 600, 700, 940);
        grd.addColorStop(0, "#11323a");
        grd.addColorStop(.34, "#05070d");
        grd.addColorStop(1, "#000000");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < 220; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * .65})`;
          ctx.beginPath();
          ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.7, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = "#f7fbff";
        ctx.font = "900 96px system-ui, sans-serif";
        ctx.fillText("My life,", 80, 190);
        ctx.fillText("so far.", 80, 300);
        ctx.fillStyle = "rgba(247,251,255,.74)";
        ctx.font = "500 34px system-ui, sans-serif";
        wrapText(ctx, `Born in ${stats.birthYear}. ${formatter.format(stats.daysAlive)} days on Earth. ${compactNumber(stats.heartbeats)} heartbeats. ${compactNumber(stats.sunDistance)} kilometers around the Sun.`, 84, 390, 980, 50);

        drawShareStat(ctx, "DAYS ALIVE", formatter.format(stats.daysAlive), 90, 620);
        drawShareStat(ctx, "HEARTBEATS", compactNumber(stats.heartbeats), 90, 820);
        drawShareStat(ctx, "KM AROUND SUN", compactNumber(stats.sunDistance), 90, 1020);
        ctx.fillStyle = "rgba(247,251,255,.5)";
        ctx.font = "800 24px system-ui, sans-serif";
        ctx.fillText("YOUR LIFE IN NUMBERS", 84, 1360);

        const link = document.createElement("a");
        link.download = "your-life-in-numbers.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });

      function drawShareStat(ctx, label, value, x, y) {
        ctx.fillStyle = "rgba(255,255,255,.1)";
        roundRect(ctx, x - 10, y - 82, 1010, 142, 34);
        ctx.fill();
        ctx.fillStyle = "#7df9ff";
        ctx.font = "900 70px system-ui, sans-serif";
        ctx.fillText(value, x + 24, y);
        ctx.fillStyle = "rgba(247,251,255,.54)";
        ctx.font = "800 24px system-ui, sans-serif";
        ctx.fillText(label, x + 28, y + 42);
      }

      function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";
        words.forEach((word, index) => {
          const test = `${line}${word} `;
          if (ctx.measureText(test).width > maxWidth && index > 0) {
            ctx.fillText(line, x, y);
            line = `${word} `;
            y += lineHeight;
          } else {
            line = test;
          }
        });
        ctx.fillText(line, x, y);
      }
  
      
      let stars = [];
      let dpr = 1;

      function resizeStars() {
        const canvas = $("#stars");
        if (!canvas) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(innerWidth * dpr);
        canvas.height = Math.round(innerHeight * dpr);
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        stars = [];
      }

        function handleParallax() {
        const y = window.scrollY;
        $$(".parallax").forEach((el) => {
          const rect = el.getBoundingClientRect();
          const offset = (rect.top + rect.height / 2 - innerHeight / 2) * -0.025;
          el.style.transform = `translate3d(0, ${offset}px, 0)`;
        });
        document.documentElement.style.setProperty("--scroll", y);
        requestAnimationFrame(handleParallax);
      }

    
    
      handleParallax();
      addEventListener("resize", () => {
        const canvas = $("#stars");
        if (!canvas) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(innerWidth * dpr);
        canvas.height = Math.round(innerHeight * dpr);
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        stars = [];
      }, { passive: true });

if (isRefresh) {
  // Clear everything and stay at top
  birthInput.value = "";
  document.body.classList.remove("revealed");
  requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
} else if (birthInput.value) {
  state.stats = calculateStats(birthInput.value);
  fillStats(state.stats);
  if (dobFromUrl) {
    document.body.classList.add("revealed");
    window.setTimeout(() => $("#days").scrollIntoView({ behavior: "smooth", block: "start" }), 500);
  }
}
const endingSection = document.getElementById("ending");

if(endingSection){

    const endingObserver = new IntersectionObserver(
      (entries)=>{
          if(entries[0].isIntersecting){

              setTimeout(()=>{

                  window.VatsalLolGameComplete?.();

              },300);

              endingObserver.disconnect();

          }
      },
      {
        threshold:0.6
      }
    );

    endingObserver.observe(endingSection);
}
  })();
  
