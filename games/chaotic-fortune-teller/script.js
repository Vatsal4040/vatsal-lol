/* ==========================================
   MERA TOTA 🦜
   SCRIPT.JS
========================================== */

/* ==========================================
   ELEMENTS
========================================== */

const speechBubble =
    document.getElementById("speechBubble");

const fortuneForm =
    document.getElementById("fortuneForm");

const loadingSection =
    document.getElementById("loadingSection");

const loadingText =
    document.getElementById("loadingText");

const resultsSection =
    document.getElementById("resultsSection");

const replayBtn =
    document.getElementById("replayBtn");
    document.body.classList.add("start-screen");

const audioToggle =
    document.getElementById("audioToggle");

/* results */

const zodiacResult =
    document.getElementById("zodiacResult");

const pastLifeResult =
    document.getElementById("pastLifeResult");

const spiritResult =
    document.getElementById("spiritResult");

const futureResult =
    document.getElementById("futureResult");

const enemyResult =
    document.getElementById("enemyResult");

const roastResult =
    document.getElementById("roastResult");

const financialResult =
    document.getElementById("financialResult");

const loveResult =
    document.getElementById("loveResult");

const digitalResult =
    document.getElementById("digitalResult");

const auditResult =
    document.getElementById("auditResult");

const rareCard =
    document.getElementById("rareCard");

const rareResult =
    document.getElementById("rareResult");

/* meters */

const moneyLuck =
    document.getElementById("moneyLuck");

const loveLuck =
    document.getElementById("loveLuck");

const brainLuck =
    document.getElementById("brainLuck");

const goblinLuck =
    document.getElementById("goblinLuck");

/* ==========================================
   AUDIO
========================================== */

let soundEnabled =
    localStorage.getItem("mera-tota-audio") !== "off";

audioToggle.textContent =
    soundEnabled ? "🔊" : "🔇";

audioToggle.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    localStorage.setItem(
        "mera-tota-audio",
        soundEnabled ? "on" : "off"
    );

    audioToggle.textContent =
        soundEnabled ? "🔊" : "🔇";
});

function playTone(
    freq = 500,
    duration = 0.15
){

    if(!soundEnabled) return;

    const ctx =
        new (window.AudioContext ||
             window.webkitAudioContext)();

    const osc =
        ctx.createOscillator();

    const gain =
        ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "triangle";
    osc.frequency.value = freq;

    gain.gain.value = 0.03;

    osc.start();

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration
    );

    osc.stop(
        ctx.currentTime + duration
    );
}

/* ==========================================
   PARROT DIALOGUE
========================================== */

const idleMessages = [

"The stars have filed a complaint.",

"The pigeons know what you did.",

"You seem expensive.",

"The moon has concerns.",

"Reality is buffering.",

"Your destiny is currently updating.",

"I checked your future. Yikes.",

"Your spirit animal called in sick.",

"Even the raccoons are worried.",

"You have strong side-quest energy.",

"I know things. Disturbing things.",

"The stars gossip about you regularly."

];

function randomItem(arr){

    return arr[
        Math.floor(
            Math.random() * arr.length
        )
    ];
}

setInterval(() => {

    if(!resultsSection.classList.contains("hidden"))
        return;

    speechBubble.innerHTML =
        randomItem(idleMessages);

}, 5000);

/* ==========================================
   ZODIAC
========================================== */

function getZodiac(month, day){

    const zodiacs = [

        ["Capricorn",20],
        ["Aquarius",19],
        ["Pisces",20],
        ["Aries",20],
        ["Taurus",21],
        ["Gemini",21],
        ["Cancer",22],
        ["Leo",23],
        ["Virgo",23],
        ["Libra",23],
        ["Scorpio",22],
        ["Sagittarius",21],
        ["Capricorn",31]

    ];

    return day <= zodiacs[month][1]
        ? zodiacs[month][0]
        : zodiacs[month+1][0];
}

/* ==========================================
   DATA
========================================== */

const zodiacComments = {

Aries:
"SQUAWK! Aries. Walking first, thinking later.",

Taurus:
"SQUAWK! Taurus. Impossible to move once comfortable.",

Gemini:
"SQUAWK! Gemini. Two personalities. Both chaotic.",

Cancer:
"SQUAWK! Cancer. Emotional damage specialist.",

Leo:
"SQUAWK! Leo. Main character detected.",

Virgo:
"SQUAWK! Virgo. Professional overthinker.",

Libra:
"SQUAWK! Libra. Decision loading forever.",

Scorpio:
"SQUAWK! Scorpio. Mysterious for no reason.",

Sagittarius:
"SQUAWK! Sagittarius. Adventure before logic.",

Capricorn:
"SQUAWK! Capricorn. Productivity machine.",

Aquarius:
"SQUAWK! Aquarius. Strange but impressive.",

Pisces:
"SQUAWK! Pisces. Living in another dimension."
};

const pastLives = [

"Captain Noodlebeard, pirate and seagull investor.",

"Queen Trashcania, ruler of poor decisions.",

"The Goblin Accountant.",

"Lord Balthazar the Moist.",

"A wizard banned from 7 kingdoms.",

"Professional dragon annoyer.",

"A knight defeated by a staircase.",

"An emotionally unavailable mermaid."

];

const spiritAnimals = [

"Overworked Raccoon",

"Sleep-Deprived Owl",

"Confused Penguin",

"Caffeinated Squirrel",

"Suspicious Goose",

"Anxious Capybara",

"Dramatic Cat",

"Corporate Sloth"

];

const futureDisasters = [

"You will accidentally like a photo from 2018.",

"You will open the fridge 5 times expecting answers.",

"You will start a new hobby and abandon it tomorrow.",

"You will send a risky message to the wrong person.",

"You will trust auto-correct. Bad idea.",

"You will lose an argument to a child."

];

const enemies = [

"Monday Morning",

"Low Battery Notifications",

"Group Projects",

"Captcha Tests",

"Slow WiFi",

"Alarm Clocks",

"Unexpected Phone Calls"

];

const roasts = [

"You radiate 'trust me bro' energy.",

"The stars are impressed you survived this long.",

"You look emotionally sponsored by energy drinks.",

"Your aura resembles expired garlic bread.",

"You have strong NPC side quest vibes.",

"The moon has concerns."

];
const financialForecasts = [

"SQUAWK! Your wallet is currently hiding from you.",

"SQUAWK! The stars predict an unnecessary purchase within 48 hours.",

"SQUAWK! You will financially recover. Probably.",

"SQUAWK! The universe recommends not opening Amazon tonight.",

"SQUAWK! Your bank account has entered stealth mode."

];

const loveReports = [

"SQUAWK! Romance approaches. Hide.",

"SQUAWK! Someone likes you. They also need therapy.",

"SQUAWK! Love is in the air. Unfortunately so is pollen.",

"SQUAWK! Your soulmate is currently ignoring a text.",

"SQUAWK! Venus says 'good luck'. That's all."

];

const digitalDestiny = [

"SQUAWK! You will accidentally open the same app 17 times today.",

"SQUAWK! Your screen time report fears you.",

"SQUAWK! A notification will ruin your mood.",

"SQUAWK! Someone is typing... forever.",

"SQUAWK! The algorithm has chosen violence."

];

const lifeAudit = [

"Productivity: 14% | Snacks: 96% | Questionable Choices: 88%",

"Motivation: Loading... | Sleep: Missing | Luck: Weirdly Fine",

"Chaos: 91% | Wisdom: 12% | Confidence: 103%",

"Energy: 24% | Delusion: 94% | Success: Pending",

"Focus: 11% | Curiosity: 89% | Self-Control: Error 404"

];

const rareEvents = [

"🦜 LEGENDARY: The parrot respects you.",

"👑 MYTHIC: The stars are confused by your existence.",

"✨ RARE: Today luck accidentally found you.",

"🌟 EPIC: A pigeon recommended you for greatness."

];

/* ==========================================
   LOADING SEQUENCE
========================================== */

const loadingMessages = [

"Consulting stars...",

"Consulting moon...",

"Consulting pigeons...",

"Reading browser history...",

"Deleting browser history...",

"Too much cringe detected..."

];

/* ==========================================
   GENERATE FORTUNE
========================================== */

fortuneForm.addEventListener(
    "submit",
    async (e) => {

    e.preventDefault();

    playTone(600);

    const dob =
        document.getElementById("dob").value;
let zodiac = "Aquarius";

if(dob){

    const birthDate =
        new Date(dob);

    const zodiac =
        getZodiac(
            birthDate.getMonth(),
            birthDate.getDate()
        );

    resultsSection.classList.add("hidden");

    loadingSection.classList.remove("hidden");

    for(let i=0;i<loadingMessages.length;i++){

        loadingText.textContent =
            loadingMessages[i];

        playTone(
            300 + (i*50),
            .1
        );

        await new Promise(resolve =>
            setTimeout(resolve, 800)
        );
    }

    loadingSection.classList.add("hidden");

  resultsSection.classList.remove("hidden");

document.body.classList.remove("start-screen");



  window.VatsalLolGameComplete?.();
    /* results */

    zodiacResult.textContent =
        zodiacComments[zodiac];

    pastLifeResult.textContent =
        randomItem(pastLives);

    spiritResult.textContent =
        randomItem(spiritAnimals);

    futureResult.textContent =
        randomItem(futureDisasters);

    enemyResult.textContent =
        randomItem(enemies);

    roastResult.textContent =
        randomItem(roasts);

financialResult.textContent =
    randomItem(financialForecasts);

loveResult.textContent =
    randomItem(loveReports);

digitalResult.textContent =
    randomItem(digitalDestiny);

auditResult.textContent =
    randomItem(lifeAudit);

    /* meters */

    const money =
        Math.floor(Math.random()*100);

    const love =
        Math.floor(Math.random()*100);

    const brain =
        Math.floor(Math.random()*100);

    const goblin =
        Math.floor(Math.random()*100);

    setTimeout(() => {

        moneyLuck.style.width =
            money + "%";

        loveLuck.style.width =
            love + "%";

        brainLuck.style.width =
            brain + "%";

        goblinLuck.style.width =
            goblin + "%";

    },100);

    /* rare event */

    rareCard.classList.add("hidden");

    const roll = Math.random();

  if(roll < 0.001){

    rareResult.textContent =
    "👑 MYTHIC: The stars are confused by your existence.";

}

else if(roll < 0.01){

    rareResult.textContent =
    "🦜 LEGENDARY: The parrot respects you.";

}

else if(roll < 0.08){

    rareResult.textContent =
    "🌟 EPIC: Cosmic approval granted.";

}

else if(roll < 0.20){

    rareResult.textContent =
    "✨ RARE: Luck found you today.";

}

else{

    rareCard.classList.add("hidden");
}}

   speechBubble.innerHTML =
    "Your destiny has been professionally inspected.";
});

/* ==========================================
   REPLAY
========================================== */

replayBtn.addEventListener("click", () => {
resultsSection.classList.add("hidden");

document.body.classList.add("start-screen");


rareCard.classList.add("hidden");
    document.querySelector('.vatsal-related')
        ?.setAttribute('hidden', '');
    fortuneForm.reset();

    document
        .getElementById("name")
        .focus();

    speechBubble.innerHTML =
        randomItem(idleMessages);

    window.scrollTo({

        top:0,
        behavior:"smooth"

    });

});
/* ==========================================
   START MESSAGE
========================================== */

speechBubble.innerHTML =
    randomItem(idleMessages);