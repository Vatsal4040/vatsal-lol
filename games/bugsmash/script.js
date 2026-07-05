/* ==================================================
BUG SMASH : EXTERMINATOR EDITION
SCRIPT.JS
PART 1
================================================== */

/* ==========================================
BUG DATABASE
========================================== */

const BUGS = [
{ name: "Fly",       emoji: "🪰" },
{ name: "Mosquito",  emoji: "🦟" },
{ name: "Spider",    emoji: "🕷️" },
{ name: "Cockroach", emoji: "🪳" },
{ name: "Ant",       emoji: "🐜" },
{ name: "Bed Bug",   emoji: "🐛" },
{ name: "Centipede", emoji: "🦂" },
{ name: "Scorpion",  emoji: "🦂" },
{ name: "Lizard",    emoji: "🦎" }
];

/* ==========================================
DIFFICULTY CURVES
========================================== */

const SPRAY_CURVE = [
{ second: 0, rate: 1 },
{ second: 4, rate: 2 },
{ second: 10, rate: 3 },
{ second: 16, rate: 4 },
{ second: 21, rate: 5 },
{ second: 26, rate: 6 },
{ second: 31, rate: 7 },
{ second: 36, rate: 8 },
{ second: 41, rate: 9 },
{ second: 46, rate: 10 },
{ second: 51, rate: 12 },
{ second: 56, rate: 15 }
];

const CHAPPAL_CURVE = [
{ second: 1, rate: 2 },
{ second: 4, rate: 5 },
{ second: 7, rate: 10 },
{ second: 11, rate: 15 },
{ second: 16, rate: 20 },
{ second: 21, rate: 25 },
{ second: 26, rate: 30 },
{ second: 31, rate: 35 },
{ second: 36, rate: 40 },
{ second: 41, rate: 45 },
{ second: 46, rate: 50 },
{ second: 51, rate: 55 },
{ second: 56, rate: 60 }
];

/* ==========================================
STORAGE
========================================== */

const STORAGE_KEY = "bugSmashExterminator";

/* ==========================================
DOM
========================================== */

const startScreen =
document.getElementById("startScreen");

const selectionScreen =
document.getElementById("selectionScreen");

const gameScreen =
document.getElementById("gameScreen");

const resultsScreen =
document.getElementById("resultsScreen");

const sprayModeBtn =
document.getElementById("sprayModeBtn");

const chappalModeBtn =
document.getElementById("chappalModeBtn");

const startSprayGameBtn =
document.getElementById("startSprayGameBtn");

const bugCards =
document.querySelectorAll(".bug-card");

const gameArea =
document.getElementById("gameArea");

const scoreDisplay =
document.getElementById("scoreDisplay");

const comboDisplay =
document.getElementById("comboDisplay");

const timeDisplay =
document.getElementById("timeDisplay");

const bestDisplay =
document.getElementById("bestDisplay");

const centerAlert =
document.getElementById("centerAlert");

const comboBanner =
document.getElementById("comboBanner");

const countdownBanner =
document.getElementById("countdownBanner");

const infestationWrapper =
document.getElementById("infestationWrapper");

const infestationFill =
document.getElementById("infestationFill");

const bossAnnouncement =
document.getElementById("bossAnnouncement");

const bossNameDisplay =
document.getElementById("bossNameDisplay");

/* RESULTS */

const finalScore =
document.getElementById("finalScore");

const finalBest =
document.getElementById("finalBest");

const finalKills =
document.getElementById("finalKills");

const finalCombo =
document.getElementById("finalCombo");

const finalCriticals =
document.getElementById("finalCriticals");

const finalAccuracy =
document.getElementById("finalAccuracy");

const finalTime =
document.getElementById("finalTime");

const gamesPlayed =
document.getElementById("gamesPlayed");

const medalBadge =
document.getElementById("medalBadge");

const killBreakdown =
document.getElementById("killBreakdown");

const playAgainBtn =
document.getElementById("playAgainBtn");

const changeModeBtn =
document.getElementById("changeModeBtn");

const mainMenuBtn =
document.getElementById("mainMenuBtn");

/* ==========================================
SAVE DATA
========================================== */

let saveData =
JSON.parse(
localStorage.getItem(STORAGE_KEY)
) || {

bestSprayScore: 0,

bestChappalScore: 0,

totalGames: 0,

lifetimeKills: 0,

totalCriticals: 0,

highestCombo: 0
};

/* ==========================================
GAME STATE
========================================== */

let currentMode = null;

let selectedBug = null;

let score = 0;

let combo = 0;

let maxCombo = 0;

let criticalHits = 0;

let totalKills = 0;

let totalSpawned = 0;

let accuracy = 0;

let gameTime = 60;

let currentSecond = 0;

let infestation = 0;

let gameRunning = false;

/* boss */

let activeBoss = null;

let bossCounter = 0;

/* timers */

let gameTimer = null;

let spawnTimer = null;

let comboTimer = null;

let countdownTimer = null;

/* statistics */

let killStats = {};

BUGS.forEach(bug => {

killStats[bug.name] = 0;

});

/* ==========================================
UI HELPERS
========================================== */

function updateBestDisplay(){

if(currentMode === "spray"){

bestDisplay.textContent =
saveData.bestSprayScore;

}else{

bestDisplay.textContent =
saveData.bestChappalScore;

}
}

function resetGameState(){

score = 0;

combo = 0;

maxCombo = 0;

criticalHits = 0;

totalKills = 0;

totalSpawned = 0;

accuracy = 0;

infestation = 0;

gameTime = 60;

currentSecond = 0;

bossCounter = 0;

activeBoss = null;

gameRunning = false;

killStats = {};

BUGS.forEach(bug => {

killStats[bug.name] = 0;

});

gameArea.innerHTML = "";

scoreDisplay.textContent = "0";

comboDisplay.textContent = "x0";

timeDisplay.textContent = "60";

infestationFill.style.width = "0%";
// Move footer back to body and re-hide it for next game
const related = document.querySelector('.vatsal-related');
if(related && resultsScreen.contains(related)){
  document.body.appendChild(related);
}
related?.setAttribute('hidden', '');
}

/* ==========================================
RANDOM HELPERS
========================================== */

function rand(min,max){

return Math.floor(
Math.random() *
(max - min + 1)
) + min;
}

function randomItem(array){

return array[
Math.floor(
Math.random() * array.length
)
];
}

/* ==========================================
MODE SELECT
========================================== */

sprayModeBtn.addEventListener(
"click",
() => {

currentMode = "spray";

showScreen(selectionScreen);

});

chappalModeBtn.addEventListener(
"click",
() => {

currentMode = "chappal";

selectedBug = null;

startGame();
});

/* ==========================================
BUG SELECTION
========================================== */

bugCards.forEach(card => {

card.addEventListener(
"click",
() => {

bugCards.forEach(c => {

  c.classList.remove("selected");

});

card.classList.add("selected");

selectedBug = {

  name:
  card.dataset.name,

  emoji:
  card.dataset.emoji
};

startSprayGameBtn.disabled = false;

});
});

startSprayGameBtn.addEventListener(
"click",
() => {

if(!selectedBug) return;

startGame();
});

/* ==========================================
GAME BOOT
========================================== */

function startGame(){

resetGameState();

showScreen(gameScreen);

gameRunning = true;

updateBestDisplay();

if(currentMode === "chappal"){

infestationWrapper.style.display =
"block";

}else{

infestationWrapper.style.display =
"none";

}

startCountdown();

startSpawner();
}
/* ==================================================
SCRIPT.JS
PART 2
================================================== */

/* ==========================================
TIMER ENGINE
========================================== */

function startCountdown(){

clearInterval(gameTimer);

gameTimer = setInterval(() => {

currentSecond++;

gameTime--;

timeDisplay.textContent = gameTime;

updateInfestation();

checkBossSpawn();

checkWarnings();

if(gameTime <= 10){

  countdownBanner.textContent =
  gameTime;

  countdownBanner.style.display =
  "block";

}else{

  countdownBanner.style.display =
  "none";
}

if(gameTime <= 0){

  finishGame();
}

},1000);
}

/* ==========================================
DIFFICULTY LOOKUP
========================================== */

function getCurrentSpawnRate(){

let curve =
currentMode === "spray"
? SPRAY_CURVE
: CHAPPAL_CURVE;

let rate = curve[0].rate;

curve.forEach(item => {

if(currentSecond >= item.second){

  rate = item.rate;
}

});

return rate;
}

/* ==========================================
INFESTATION
========================================== */

function updateInfestation(){

if(currentMode !== "chappal") return;

infestation =
Math.min(
100,
((60 - gameTime) / 60) * 100
);

infestationFill.style.width =
infestation + "%";
}

/* ==========================================
ALERTS
========================================== */

function showAlert(text){

centerAlert.textContent = text;

centerAlert.style.opacity = "1";

centerAlert.animate([
{
transform:
"translateX(-50%) scale(.7)",
opacity:0
},
{
transform:
"translateX(-50%) scale(1)",
opacity:1
}
],{
duration:300
});

setTimeout(() => {

centerAlert.style.opacity = "0";

},1800);
}

function checkWarnings(){

if(gameTime === 45){

showAlert(
  "INFESTATION SPIKE"
);

}

if(gameTime === 30){

showAlert(
  "COLONY GROWING"
);

}

if(gameTime === 15){

showAlert(
  "TOTAL INFESTATION"
);

}

if(gameTime === 10){

showAlert(
  "CHAOS PROTOCOL"
);

}

if(gameTime === 5){

showAlert(
  "EVACUATE!"
);

}
}

/* ==========================================
SPAWNER
========================================== */

function startSpawner(){

clearInterval(spawnTimer);

spawnTimer = setInterval(() => {

if(!gameRunning) return;

const rate =
getCurrentSpawnRate();

for(
  let i=0;
  i<rate;
  i++
){

  spawnBug();
}

},1000);
}

/* ==========================================
BUG CREATION
========================================== */

function spawnBug(){

let bugData;

if(currentMode === "spray"){

bugData = selectedBug;

}else{

bugData = randomItem(BUGS);

}

const bug =
document.createElement("div");

bug.className = "bug";

bug.dataset.bug =
bugData.name;

totalSpawned++;

let size;

if(currentSecond >= 10){
size = rand(44, 80);
}else{
size = rand(60, 90);
}

const scale =
rand(85,115) / 100;

const rotation =
rand(-180,180);

const x =
rand(
10,
window.innerWidth - size - 20
);

/* HUD is ~80px on mobile (2-row), ~70px on desktop (1-row) */
const hudOffset = window.innerWidth <= 480 ? 115 : 85;
const y =
rand(
hudOffset,
window.innerHeight - size - 20
);

bug.style.fontSize = size + "px";
bug.style.width = size + "px";
bug.style.height = size + "px";

bug.style.left = x + "px";
bug.style.top  = y + "px";

bug.style.transform =
`rotate(${rotation}deg) scale(${scale})`;

bug.innerHTML =
`<span class="bug-emoji">${bugData.emoji}</span>`;

bug.addEventListener(
"pointerdown",
handleBugHit
);

gameArea.appendChild(bug);

autoRemoveBug(bug);
}

/* ==========================================
BUG LIFETIME
========================================== */

function autoRemoveBug(bug){

const lifetime =
currentMode === "spray"
? rand(5000,7000)
: rand(3500,5000);

setTimeout(() => {

if(
  bug &&
  bug.parentNode
){

  bug.remove();
}

},lifetime);
}

/* ==========================================
BOSS SYSTEM
========================================== */

const BOSS_NAMES = [

"KING COCKROACH",

"MUTANT MOSQUITO",

"ALPHA SPIDER",

"MEGA SCORPION",

"BED BUG OVERLORD",

"TOXIC CENTIPEDE"
];

function checkBossSpawn(){

bossCounter++;

if(
bossCounter < 15
) return;

bossCounter = 0;

spawnBoss();
}

function spawnBoss(){

if(activeBoss) return;

const bossName =
randomItem(
BOSS_NAMES
);

bossNameDisplay.textContent =
bossName;

bossAnnouncement.classList.add(
"show"
);

setTimeout(() => {

bossAnnouncement.classList.remove(
  "show"
);

},2000);

const boss =
document.createElement("div");

boss.className =
"bug boss";

const sourceBug =
currentMode === "spray"
? selectedBug
: randomItem(BUGS);

const hp =
rand(5,15);

boss.dataset.hp = hp;
boss.dataset.maxHp = hp;
boss.dataset.bug =
sourceBug.name;

activeBoss = boss;

const size = rand(100, 140);

const x =
rand(50, window.innerWidth - size - 50);

const bossHudOffset = window.innerWidth <= 480 ? 130 : 110;
const y =
rand(bossHudOffset, window.innerHeight - size - 80);

boss.style.fontSize = size + "px";
boss.style.width = size + "px";
boss.style.height = (size + 20) + "px";
boss.style.left = x + "px";
boss.style.top  = y + "px";

boss.innerHTML =
`<div class="boss-health">
    <div class="boss-health-fill"></div>
  </div>
  <span class="bug-emoji">${sourceBug.emoji}</span>`;

boss.addEventListener(
"pointerdown",
handleBossHit
);

gameArea.appendChild(
boss
);
}

/* ==========================================
CHAOS MODE EFFECT
========================================== */

function triggerChaosMode(){

document.body.animate([
{
transform:
"translateX(-4px)"
},
{
transform:
"translateX(4px)"
},
{
transform:
"translateX(-4px)"
},
{
transform:
"translateX(0px)"
}
],{
duration:300
});
}

/* ==========================================
LAST TEN SECONDS
========================================== */

setInterval(() => {

if(
!gameRunning
) return;

if(
gameTime <= 10
){

triggerChaosMode();

}

},1000);
/* ==================================================
SCRIPT.JS
PART 3
================================================== */

/* ==========================================
SCORE VALUES
========================================== */

const SCORE_VALUES = {

normal: 1,

critical: 5,

bossHit: 2,

bossKill: 50
};

/* ==========================================
BUG HIT
========================================== */

function handleBugHit(event){

const bug =
event.currentTarget;

if(
bug.classList.contains("dead")
){
return;
}

bug.classList.add("dead");

const bugName =
bug.dataset.bug;

totalKills++;

killStats[bugName]++;

let points =
SCORE_VALUES.normal;

const critical =
Math.random() <= 0.10;

if(critical){

points =
SCORE_VALUES.critical;

criticalHits++;

saveData.totalCriticals++;

showFloatingText(
  "DIRECT HIT +5",
  bug,
  "critical"
);

}else{

showFloatingText(
  "+1",
  bug,
  "normal"
);

}

score += points;

updateScore();

registerCombo();

createParticles(
bug
);

smallShake();

setTimeout(() => {

if(
  bug &&
  bug.parentNode
){

  bug.remove();
}

},250);
}

/* ==========================================
BOSS HIT
========================================== */

function handleBossHit(event){

const boss =
event.currentTarget;

if(
!boss ||
!boss.parentNode
) return;

let hp =
Number(
boss.dataset.hp
);

hp--;

boss.dataset.hp = hp;

score +=
SCORE_VALUES.bossHit;

showFloatingText(
"+2",
boss,
"boss"
);

updateScore();

registerCombo();

updateBossHealthBar(
boss,
hp
);

boss.animate([
{
transform:
"scale(1)"
},
{
transform:
"scale(.94)"
},
{
transform:
"scale(1)"
}
],{
duration:120
});

if(hp <= 0){

killBoss(
  boss
);

}
}

function updateBossHealthBar(
boss,
hp
){

const maxHp =
Number(
boss.dataset.maxHp
);

const fill =
boss.querySelector(
".boss-health-fill"
);

const pct =
(hp / maxHp) * 100;

fill.style.width =
pct + "%";
}

function killBoss(
boss
){

const bugName =
boss.dataset.bug;

totalKills++;

killStats[bugName]++;

score +=
SCORE_VALUES.bossKill;

showFloatingText(
"BOSS +50",
boss,
"bosskill"
);

updateScore();

createBossExplosion(
boss
);

activeBoss = null;

setTimeout(() => {

boss.remove();

},300);
}

/* ==========================================
SCORE UPDATE
========================================== */

function updateScore(){

scoreDisplay.textContent =
score;

if(
combo > saveData.highestCombo
){

saveData.highestCombo =
combo;

}
}

/* ==========================================
COMBO SYSTEM
========================================== */

function registerCombo(){

combo++;

if(
combo > maxCombo
){

maxCombo = combo;

}

comboDisplay.textContent =
"x" + combo;

clearTimeout(
comboTimer
);

comboTimer =
setTimeout(() => {

combo = 0;

comboDisplay.textContent =
"x0";

comboBanner.textContent =
"";

},2000);

updateComboBanner();
}

function updateComboBanner(){

if(combo < 2){

comboBanner.textContent =
"";

return;

}

let label =
"STREAK";

if(combo >= 5){

label = "GOOD";

}

if(combo >= 10){

label = "GREAT";

}

if(combo >= 15){

label = "INSANE";

}

if(combo >= 25){

label =
"UNSTOPPABLE";

}

comboBanner.innerHTML =
`

  <div>
    EXTERMINATION STREAK
  </div>
  <div>
    x${combo}
  </div>
  <div>
    ${label}
  </div>
  `;

comboBanner.animate([
{
transform:
"translateX(-50%) scale(.8)"
},
{
transform:
"translateX(-50%) scale(1)"
}
],{
duration:180
});
}

/* ==========================================
FLOATING TEXT
========================================== */

function showFloatingText(
text,
target,
type
){

const rect =
target.getBoundingClientRect();

const div =
document.createElement(
"div"
);

div.className =
"float-text";

div.textContent =
text;

div.style.left =
rect.left +
rect.width/2 +
"px";

div.style.top =
rect.top +
"px";

switch(type){

case "critical":

  div.style.color =
  "#FFD166";

  div.style.fontSize =
  "1.4rem";

  break;

case "boss":

  div.style.color =
  "#06D6A0";

  break;

case "bosskill":

  div.style.color =
  "#E63946";

  div.style.fontSize =
  "1.5rem";

  break;

default:

  div.style.color =
  "#06D6A0";

}

gameArea.appendChild(
div
);

setTimeout(() => {

div.remove();

},900);
}

/* ==========================================
PARTICLES
========================================== */

function createParticles(
target
){

const rect =
target.getBoundingClientRect();

const centerX =
rect.left +
rect.width / 2;

const centerY =
rect.top +
rect.height / 2;

for(
let i=0;
i<8;
i++
){

const p =
document.createElement(
  "div"
);

p.className =
"particle";

p.style.position =
"absolute";

p.style.width =
"8px";

p.style.height =
"8px";

p.style.borderRadius =
"50%";

p.style.background =
"#06D6A0";

p.style.left =
centerX + "px";

p.style.top =
centerY + "px";

gameArea.appendChild(
  p
);

const dx =
rand(-60,60);

const dy =
rand(-60,60);

p.animate([
  {
    transform:
    "translate(0,0)",
    opacity:1
  },
  {
    transform:
    `translate(${dx}px,${dy}px)`,
    opacity:0
  }
],{
  duration:500,
  easing:"ease-out"
});

setTimeout(() => {

  p.remove();

},500);

}
}

/* ==========================================
BOSS EXPLOSION
========================================== */

function createBossExplosion(
boss
){

for(
let i=0;
i<30;
i++
){

const particle =
document.createElement(
  "div"
);

particle.className =
"particle";

particle.style.position =
"absolute";

particle.style.width =
rand(8,14)+"px";

particle.style.height =
rand(8,14)+"px";

particle.style.borderRadius =
"50%";

particle.style.background =
"#E63946";

const rect =
boss.getBoundingClientRect();

particle.style.left =
rect.left +
rect.width/2 +
"px";

particle.style.top =
rect.top +
rect.height/2 +
"px";

gameArea.appendChild(
  particle
);

const dx =
rand(-220,220);

const dy =
rand(-220,220);

particle.animate([
  {
    transform:
    "translate(0,0)",
    opacity:1
  },
  {
    transform:
    `translate(${dx}px,${dy}px)`,
    opacity:0
  }
],{
  duration:800,
  easing:"ease-out"
});

setTimeout(() => {

  particle.remove();

},800);

}

bigShake();
}

/* ==========================================
SCREEN SHAKE
========================================== */

function smallShake(){

gameArea.animate([
{
transform:
"translateX(-2px)"
},
{
transform:
"translateX(2px)"
},
{
transform:
"translateX(0px)"
}
],{
duration:80
});
}

function bigShake(){

gameArea.animate([
{
transform:
"translate(-6px,-2px)"
},
{
transform:
"translate(6px,2px)"
},
{
transform:
"translate(-4px,3px)"
},
{
transform:
"translate(0,0)"
}
],{
duration:250
});
}
/* ==================================================
SCRIPT.JS
PART 4
================================================== */

/* ==========================================
MEDAL SYSTEM
========================================== */

function calculateMedal(){

if(score >= 2500){
return "S";
}

if(score >= 1800){
return "A";
}

if(score >= 1200){
return "B";
}

if(score >= 700){
return "C";
}

return "D";
}

/* ==========================================
BEST SCORE
========================================== */

function updateBestScore(){

if(currentMode === "spray"){

if(
  score >
  saveData.bestSprayScore
){

  saveData.bestSprayScore =
  score;
}

}else{

if(
  score >
  saveData.bestChappalScore
){

  saveData.bestChappalScore =
  score;
}

}
}

/* ==========================================
ACCURACY
========================================== */

function calculateAccuracy(){

if(totalSpawned <= 0){

return "0.0";

}

return (
(
totalKills /
totalSpawned
) * 100
).toFixed(1);
}

/* ==========================================
MOST KILLED BUG
========================================== */

function getMostKilledBug(){

let winner = null;

let highest = 0;

Object.entries(
killStats
).forEach(([name,count]) => {

if(count > highest){

  highest = count;

  winner = name;
}

});

return winner || "None";
}

/* ==========================================
EXTERMINATION REPORT
========================================== */

function renderKillReport(){

killBreakdown.innerHTML = "";

Object.entries(
killStats
).forEach(([name,count]) => {

if(count <= 0) return;

const row =
document.createElement("div");

row.className =
"result-row";

row.innerHTML = `
  <span>${name}</span>
  <strong>${count}</strong>
`;

killBreakdown.appendChild(
  row
);

});

if(
killBreakdown.innerHTML === ""
){

killBreakdown.innerHTML =
`
<div class="result-row">
  <span>No eliminations</span>
  <strong>0</strong>
</div>
`;

}
}

/* ==========================================
SAVE DATA
========================================== */

function saveProgress(){

saveData.totalGames++;

saveData.lifetimeKills +=
totalKills;

if(
maxCombo >
saveData.highestCombo
){

saveData.highestCombo =
maxCombo;

}

updateBestScore();

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(
saveData
)
);
}

/* ==========================================
RESULTS
========================================== */

function populateResults(){

const bestScore =
currentMode === "spray"
? saveData.bestSprayScore
: saveData.bestChappalScore;

accuracy =
calculateAccuracy();

finalScore.textContent =
score;

finalBest.textContent =
bestScore;

finalKills.textContent =
totalKills;

finalCombo.textContent =
maxCombo;

finalCriticals.textContent =
criticalHits;

finalAccuracy.textContent =
accuracy + "%";

finalTime.textContent =
"60s";

gamesPlayed.textContent =
saveData.totalGames;

medalBadge.textContent =
calculateMedal();

renderKillReport();

const topBug =
getMostKilledBug();

const mostKilledEl =
document.getElementById("mostKilledBug");

if(mostKilledEl){
mostKilledEl.textContent = topBug;
}
}

/* ==========================================
CLEANUP
========================================== */

function clearTimers(){

clearInterval(
gameTimer
);

clearInterval(
spawnTimer
);

clearInterval(
countdownTimer
);

clearTimeout(
comboTimer
);
}

function removeAllBugs(){

const bugs =
document.querySelectorAll(
".bug"
);

bugs.forEach(bug => {

bug.remove();

});

activeBoss = null;
}

/* ==========================================
END GAME
========================================== */

function finishGame(){

if(!gameRunning){

return;

}

gameRunning = false;

clearTimers();

removeAllBugs();

updateBestScore();

saveProgress();

populateResults();

showScreen(
  resultsScreen
);

// Move footer section inside results screen so it renders below results
const related = document.querySelector('.vatsal-related');
if(related && !resultsScreen.contains(related)){
  resultsScreen.querySelector('.results-inner').after(related);
}

window.VatsalLolGameComplete?.();
}
/* ==========================================
PLAY AGAIN
========================================== */

playAgainBtn.addEventListener(
"click",
() => {

if(
  currentMode === "spray"
){

  if(!selectedBug){

    showScreen(
      selectionScreen
    );

    return;
  }
}
startGame();

}
);

/* ==========================================
CHANGE MODE
========================================== */

changeModeBtn.addEventListener(
"click",
() => {

gameRunning = false;

clearTimers();

removeAllBugs();

selectedBug = null;

currentMode = null;

bugCards.forEach(card => {

  card.classList.remove(
    "selected"
  );

});

startSprayGameBtn.disabled =
true;

showScreen(
  startScreen
);
}
)
/* ==========================================
VATSAL HEADER VISIBILITY
========================================== */

function setHeaderVisibility(visible){
  const h = document.getElementById("vatsalHeader");
  if(!h) return;
  if(visible){
    h.classList.remove("hidden");
  }else{
    h.classList.add("hidden");
  }
}

function showScreen(screen){

startScreen.classList.remove("active");
selectionScreen.classList.remove("active");
gameScreen.classList.remove("active");
resultsScreen.classList.remove("active");

screen.classList.add("active");

/* Header ONLY on menu screens */

const showHeader =
screen === startScreen ||
screen === selectionScreen;

setHeaderVisibility(showHeader);
}


/* ==========================================
MAIN MENU
========================================== */
mainMenuBtn.addEventListener(
"click",
() => {

gameRunning = false;

clearTimers();

removeAllBugs();

document.querySelector('.vatsal-related')?.setAttribute('hidden','');

showScreen(
  startScreen
);

}
);

/* ==========================================
RESIZE SAFETY
========================================== */

window.addEventListener(
"resize",
() => {

if(!gameRunning)
  return;

const bugs =
document.querySelectorAll(
  ".bug"
);

bugs.forEach(bug => {

  const rect =
  bug.getBoundingClientRect();

  if(
    rect.right >
    window.innerWidth
  ){

    bug.style.left =
    (
      window.innerWidth -
      rect.width -
      20
    ) + "px";
  }

  if(
    rect.bottom >
    window.innerHeight
  ){

    bug.style.top =
    (
      window.innerHeight -
      rect.height -
      20
    ) + "px";
  }

});

}
);

/* ==========================================
PRELOAD IMAGES
========================================== */

/* No image preloading needed — using emoji */

/* ==========================================
INITIAL BOOT
========================================== */

showScreen(
startScreen
)