/* ---------------- CONFIG ---------------- */
const QUESTIONS_PER_GAME = 10;

/* ---------------- QUESTIONS (50+) ---------------- */
const allQuestions = [
  { text:"You can instantly master any skill, but forget one you already have.", yes:64, no:36 },
  { text:"You never need sleep again, but can only dream once a year.", yes:58, no:42 },
  { text:"You get unlimited money, but every purchase is public.", yes:47, no:53 },
  { text:"You can pause time for 10 minutes a day, but age twice as fast during it.", yes:52, no:48 },
  { text:"You will always know the truth, but never be believed.", yes:41, no:59 },

  { text:"You can relive happy memories, but feel sadness afterward.", yes:55, no:45 },
  { text:"You never feel pain, but never feel physical pleasure.", yes:33, no:67 },
  { text:"You can speak all languages, but lose your inner voice.", yes:46, no:54 },
  { text:"You live twice as long, but age rapidly after 40.", yes:49, no:51 },
  { text:"You can read minds, but can’t turn it off.", yes:37, no:63 },

  { text:"You can teleport anywhere, but arrive naked.", yes:61, no:39 },
  { text:"You are immune to illness, but feel constant fatigue.", yes:44, no:56 },
  { text:"You get your dream job, but can never change careers.", yes:59, no:41 },
  { text:"You become famous overnight, but lose all privacy.", yes:48, no:52 },
  { text:"You erase one regret, but forget one loved person.", yes:29, no:71 },

  { text:"You always win arguments, but people dislike you.", yes:34, no:66 },
  { text:"You can control weather, but only minor annoying changes.", yes:62, no:38 },
  { text:"You never feel fear, but never feel excitement.", yes:35, no:65 },
  { text:"You get perfect memory, but never forget embarrassment.", yes:51, no:49 },
  { text:"You can time travel once, but never return.", yes:43, no:57 },

  { text:"You always make the right decision, but don’t know why.", yes:67, no:33 },
  { text:"You cure one disease forever, but suffer it once.", yes:73, no:27 },
  { text:"You gain unlimited creativity, but constant self-doubt.", yes:54, no:46 },
  { text:"You never feel loneliness, but enjoy solitude less.", yes:57, no:43 },
  { text:"You can talk to animals, but they constantly complain.", yes:69, no:31 },

  { text:"You know the date of your death.", yes:28, no:72 },
  { text:"You always wake motivated, but burn out faster.", yes:60, no:40 },
  { text:"You can fall asleep instantly, but wake randomly at night.", yes:63, no:37 },
  { text:"You never feel boredom, but time feels slower.", yes:56, no:44 },
  { text:"You are lucky, but only in trivial things.", yes:71, no:29 },

  { text:"You erase one global problem, but create a new unknown one.", yes:50, no:50 },
  { text:"You relive today forever without progress.", yes:32, no:68 },
  { text:"You always tell the truth, but can’t explain yourself.", yes:38, no:62 },
  { text:"You restart life once with memories intact.", yes:76, no:24 },
  { text:"You never feel regret, but never feel pride.", yes:41, no:59 },

  { text:"You save the world anonymously.", yes:88, no:12 },
  { text:"You control dreams, but forget them instantly.", yes:65, no:35 },
  { text:"You are always calm, but rarely joyful.", yes:36, no:64 },
  { text:"You change one trait daily, but it resets nightly.", yes:58, no:42 }
];

/* ---------------- GAME STATE ---------------- */
const questions = [...allQuestions]
  .sort(() => Math.random() - 0.5)
  .slice(0, QUESTIONS_PER_GAME);

let current = 0;
let answers = [];
const questionCounter = document.getElementById("questionCounter");
const pressStartBtn = document.getElementById("pressStartBtn");

/* ---------------- FUNCTIONS ---------------- */
function showQuestion() {
  if (current >= questions.length) return showSummary();
  window.scrollTo({
    top:0,
    behavior:"smooth"
});
  document.getElementById("question").innerText = questions[current].text;
  if (questionCounter) {
    questionCounter.textContent = `Question ${current + 1} / ${questions.length}`;
  }
  document.getElementById("result").innerText = "";
  document.getElementById("mostChoice").textContent = "";
  document.getElementById("yesBar").style.width = "0%";
  document.getElementById("noBar").style.width = "0%";
}

function answer(isYes) {
  const q = questions[current];
  const percent = isYes ? q.yes : q.no;

  answers.push({ type:isYes ? "yes" : "no", percent });

  document.getElementById("result").innerText =
    `${q.yes}% would press it · ${q.no}% would not`;

  document.getElementById("yesBar").style.width = q.yes + "%";
  document.getElementById("noBar").style.width = q.no + "%";

  const most =
    q.yes > q.no ? "pressed the button" :
    q.no > q.yes ? "did not press the button" :
    "were split evenly";

  const mc = document.getElementById("mostChoice");
  mc.textContent = `Most people ${most}`;
  mc.style.animation = "none";
  mc.offsetHeight;
  mc.style.animation = null;

  updateDots();
  current++;

  setTimeout(showQuestion, 1300);
}

function updateDots() {
  const dots = document.getElementById("dots");
  dots.innerHTML = answers.map(a =>
    `<div class="dot ${a.type}">${a.percent}%</div>`
  ).join("");
}

function getPersonality(yesCount) {
  if (yesCount <= 2) return "The Realist 🧠";
  if (yesCount <= 4) return "The Cautious Thinker ⚖️";
  if (yesCount <= 6) return "The Balanced Mind 🎯";
  if (yesCount <= 8) return "The Risk Taker 🔥";
  return "The Button Masher 🚀";
}

function showSummary() {
  const yesCount = answers.filter(a => a.type === "yes").length;
  const label = getPersonality(yesCount);

  document.body.classList.remove("press-playing");
  document.body.classList.add("press-finished");

  document.getElementById("summary").innerText =
    `You pressed YES ${yesCount} times.\n${label}`;

  document.getElementById("restartBtn").style.display = "inline-block";
  document.getElementById("shareBtn").style.display = "inline-block";
  window.VatsalLolGameComplete?.();
}

function startPressGame() {
  document.body.classList.add("press-playing");
  showQuestion();
}

function restart() {

  document
    .querySelector('.vatsal-related')
    ?.setAttribute('hidden','');

  location.reload();
}

function shareResult() {
  const yesCount = answers.filter(a => a.type === "yes").length;
  navigator.clipboard.writeText(
    `I played "Would You Press the Button?" and pressed YES ${yesCount} times.`
  );
  alert("Result copied to clipboard");
}

/* ---------------- START ---------------- */
pressStartBtn?.addEventListener("click", startPressGame);
