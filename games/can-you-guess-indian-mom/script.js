// ======================================================
// CAN YOU SURVIVE INDIAN MOM QUESTIONS?
// FULL GAME LOGIC - SINGLE JS FILE
// ======================================================

(function(){

// ======================================================
// AUDIO SYSTEM
// ======================================================

let audioCtx = null;

function initAudio(){

    if(audioCtx) return;

    audioCtx =
      new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(type){

    if(!audioCtx) return;

    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();

    const gain = audioCtx.createGain();

    osc.connect(gain);

    gain.connect(audioCtx.destination);

    osc.type = "square";

    gain.gain.setValueAtTime(0.12, now);

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.5
    );

    if(type === "good"){

        osc.frequency.value = 900;

        osc.frequency.exponentialRampToValueAtTime(
          500,
          now + 0.25
        );

    }else{

        osc.frequency.value = 250;

        osc.frequency.exponentialRampToValueAtTime(
          100,
          now + 0.35
        );
    }

    osc.start();

    osc.stop(now + 0.5);
}

// ======================================================
// QUESTIONS
// ======================================================

const QUESTIONS = [

{
text:"Why are you awake at 2AM?",
choices:[
{ text:"Studying hard 📚", survivalDelta:12, stressDelta:-10, isGood:true, reaction:"Mom suspiciously proud." },
{ text:"Watching reels 🤡", survivalDelta:-12, stressDelta:18, isGood:false, reaction:"Phone confiscation started." },
{ text:"Existential crisis 😭", survivalDelta:-5, stressDelta:10, isGood:false, reaction:"Mom unimpressed." },
{ text:"Learning coding 💻", survivalDelta:10, stressDelta:-12, isGood:true, reaction:"Future engineer unlocked." }
]
},

{
text:"Sharma ji's son bought a BMW.",
choices:[
{ text:"I'm building my future 🚀", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Mom slightly hopeful." },
{ text:"BMW overrated 😤", survivalDelta:-15, stressDelta:20, isGood:false, reaction:"Comparison mode activated." },
{ text:"Inner peace matters 🧘", survivalDelta:-10, stressDelta:12, isGood:false, reaction:"Mom angry meditation." },
{ text:"My time will come 💪", survivalDelta:10, stressDelta:-10, isGood:true, reaction:"Mom waiting patiently." }
]
},

{
text:"Bas phone hi chalata reh.",
choices:[
{ text:"It's for work 💼", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Mom calmed temporarily." },
{ text:"Memes are culture 🤡", survivalDelta:-15, stressDelta:20, isGood:false, reaction:"Flying slipper detected." },
{ text:"At least not drugs 😭", survivalDelta:-10, stressDelta:10, isGood:false, reaction:"Worst recovery attempt." },
{ text:"Networking online 🤝", survivalDelta:10, stressDelta:-10, isGood:true, reaction:"Mom pretending to understand." }
]
},

{
text:"Guests are coming in 5 mins!",
choices:[
{ text:"I'll help clean 🧹", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Respect unlocked." },
{ text:"Fake sleeping 😴", survivalDelta:-10, stressDelta:12, isGood:false, reaction:"Mom knows everything." },
{ text:"Namaste mode 🙏", survivalDelta:10, stressDelta:-10, isGood:true, reaction:"Aunty approval gained." },
{ text:"I disappear 🏃", survivalDelta:-15, stressDelta:15, isGood:false, reaction:"Mom remembers this forever." }
]
},

{
text:"When will you get married?",
choices:[
{ text:"After becoming stable 💼", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Mom calculating weddings." },
{ text:"Never 😎", survivalDelta:-20, stressDelta:25, isGood:false, reaction:"Emotional damage critical." },
{ text:"Married to success 📈", survivalDelta:-12, stressDelta:15, isGood:false, reaction:"Mom not impressed." },
{ text:"Soon mummy 🙏", survivalDelta:10, stressDelta:-10, isGood:true, reaction:"Relatives informed instantly." }
]
},

{
text:"Why is your room a mess?",
choices:[
{ text:"Cleaning now 🧹", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Mom shocked positively." },
{ text:"Creative environment 🎨", survivalDelta:-12, stressDelta:15, isGood:false, reaction:"Mom rage increasing." },
{ text:"It's organized chaos 🤓", survivalDelta:-10, stressDelta:10, isGood:false, reaction:"Mom not buying it." },
{ text:"I was about to clean 😭", survivalDelta:8, stressDelta:-8, isGood:true, reaction:"Temporary survival." }
]
},

{
text:"Why are lights still on?",
choices:[
{ text:"Turning off now 💡", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Electricity bill saved." },
{ text:"Ghosts need light 👻", survivalDelta:-15, stressDelta:18, isGood:false, reaction:"Mom preparing lecture." },
{ text:"Forgot mummy 😭", survivalDelta:8, stressDelta:-8, isGood:true, reaction:"Mom slightly calm." },
{ text:"Power company needs support ⚡", survivalDelta:-12, stressDelta:15, isGood:false, reaction:"Mom furious." }
]
},

{
text:"Why don't you go outside?",
choices:[
{ text:"I'll start walks 🚶", survivalDelta:12, stressDelta:-10, isGood:true, reaction:"Mom hopeful." },
{ text:"Gamers avoid sunlight 🎮", survivalDelta:-15, stressDelta:18, isGood:false, reaction:"Vitamin D lecture started." },
{ text:"Outside expensive 💸", survivalDelta:-10, stressDelta:12, isGood:false, reaction:"Mom confused." },
{ text:"Gym starts tomorrow 💪", survivalDelta:8, stressDelta:-8, isGood:true, reaction:"Mom heard this before." }
]
},

{
text:"Why are marks low?",
choices:[
{ text:"I'll improve 📚", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Mom temporary mercy." },
{ text:"Education system failed me 🤡", survivalDelta:-15, stressDelta:18, isGood:false, reaction:"Mom ignores logic." },
{ text:"Exam was hard 😭", survivalDelta:-10, stressDelta:10, isGood:false, reaction:"Mom unimpressed." },
{ text:"Learning life lessons ✨", survivalDelta:-12, stressDelta:15, isGood:false, reaction:"Mom entering rage mode." }
]
},

{
text:"Relatives asking what you do.",
choices:[
{ text:"Working hard quietly 💼", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Mom flexes proudly." },
{ text:"Professional overthinker 🤡", survivalDelta:-15, stressDelta:20, isGood:false, reaction:"Aunty judgement unlocked." },
{ text:"Building my future 🚀", survivalDelta:10, stressDelta:-10, isGood:true, reaction:"Mom hopeful again." },
{ text:"Surviving 😭", survivalDelta:-10, stressDelta:12, isGood:false, reaction:"Mom disappointed." }
]
},

{
text:"Why order food so much?",
choices:[
{ text:"Your cooking best ❤️", survivalDelta:15, stressDelta:-15, isGood:true, reaction:"Critical emotional hit." },
{ text:"Supporting economy 📈", survivalDelta:-12, stressDelta:15, isGood:false, reaction:"Mom offended." },
{ text:"Cooking difficult 😭", survivalDelta:-10, stressDelta:10, isGood:false, reaction:"Mom laughing angrily." },
{ text:"I'll eat home food 🍛", survivalDelta:10, stressDelta:-10, isGood:true, reaction:"Mom victorious." }
]
},

{
text:"Why always tired?",
choices:[
{ text:"Grinding for future 💪", survivalDelta:10, stressDelta:-10, isGood:true, reaction:"Mom mildly impressed." },
{ text:"Too many reels 😭", survivalDelta:-12, stressDelta:18, isGood:false, reaction:"Mom knew it." },
{ text:"Sleep schedule broken 🌙", survivalDelta:-8, stressDelta:10, isGood:false, reaction:"Mom starts lecture." },
{ text:"Sleeping early tonight 🛌", survivalDelta:8, stressDelta:-8, isGood:true, reaction:"Mom heard that before." }
]
},

{
text:"Who was on the phone?",
choices:[
{ text:"Office call 💼", survivalDelta:10, stressDelta:-10, isGood:true, reaction:"Mom temporarily trusts you." },
{ text:"Secret agent business 🕶️", survivalDelta:-15, stressDelta:18, isGood:false, reaction:"Mom suspicious." },
{ text:"Wrong number ☎️", survivalDelta:-8, stressDelta:10, isGood:false, reaction:"Mom doesn't believe." },
{ text:"Project discussion 📚", survivalDelta:8, stressDelta:-8, isGood:true, reaction:"Mom calmer now." }
]
},

{
text:"Kabhi ghar ke kaam bhi kar liya karo.",
choices:[
{ text:"Helping right now 🧹", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Mom happy for 3 mins." },
{ text:"I'm mentally helping 😭", survivalDelta:-15, stressDelta:18, isGood:false, reaction:"Mom furious." },
{ text:"Delegation skills 📈", survivalDelta:-10, stressDelta:12, isGood:false, reaction:"Mom ready to attack." },
{ text:"Let's clean together ❤️", survivalDelta:10, stressDelta:-10, isGood:true, reaction:"Emotional moment unlocked." }
]
},

{
text:"AC band karo. Bill aata hai!",
choices:[
{ text:"Turning it off now ❄️", survivalDelta:12, stressDelta:-12, isGood:true, reaction:"Electricity saved." },
{ text:"Heat builds character 🔥", survivalDelta:-10, stressDelta:15, isGood:false, reaction:"Mom confused." },
{ text:"I'll pay bill one day 💸", survivalDelta:8, stressDelta:-8, isGood:true, reaction:"Mom waiting." },
{ text:"Global warming anyway 🌎", survivalDelta:-15, stressDelta:18, isGood:false, reaction:"Mom enters beast mode." }
]
}

// ADD MORE QUESTIONS SAME STYLE IF NEEDED

];

// ======================================================
// AUTO DUPLICATE TO 30 QUESTIONS
// ======================================================

while(QUESTIONS.length < 30){

    QUESTIONS.push(
      JSON.parse(
        JSON.stringify(
          QUESTIONS[
            Math.floor(Math.random()*QUESTIONS.length)
          ]
        )
      )
    );
}

// ======================================================
// GAME STATE
// ======================================================

let survival = 100;
let stress = 0;
let combo = 0;
let totalScore = 0;
let gameActive = false;

let shuffledQuestions = [];
let currentQuestionIndex = 0;
let currentQuestion = null;

// ======================================================
// DOM
// ======================================================

const startScreenDiv =
  document.getElementById('startScreen');

const gameScreenDiv =
  document.getElementById('gameScreen');

const gameOverDiv =
  document.getElementById('gameOverScreen');

const startBtn =
  document.getElementById('startBtn');

const restartBtn =
  document.getElementById('restartBtn');

const shareBtn =
  document.getElementById('shareScoreBtn');

const questionTextSpan =
  document.getElementById('questionText');

const choicesContainer =
  document.getElementById('choicesContainer');

const survivalFill =
  document.getElementById('survivalFill');

const stressFill =
  document.getElementById('stressFill');

const survivalValueSpan =
  document.getElementById('survivalValue');

const stressValueSpan =
  document.getElementById('stressValue');

const comboCountSpan =
  document.getElementById('comboCount');

const scoreDisplaySpan =
  document.getElementById('scoreDisplay');

const momReactionDiv =
  document.getElementById('momReaction');

const finalScoreSpan =
  document.getElementById('finalScoreSpan');

const badgeArea =
  document.getElementById('badgeArea');

// ======================================================
// HELPERS
// ======================================================

function shuffleArray(array){

    for(let i = array.length - 1; i > 0; i--){

        const j =
          Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
        [array[j], array[i]];
    }

    return array;
}

// ======================================================
// UI
// ======================================================

function updateMeters(){

    survivalFill.style.width =
      survival + "%";

    stressFill.style.width =
      stress + "%";

    survivalValueSpan.innerText =
      survival;

    stressValueSpan.innerText =
      stress;
}

function updateScoreUI(){

    comboCountSpan.innerText =
      combo;

    scoreDisplaySpan.innerText =
      totalScore;
}

// ======================================================
// PARTICLES
// ======================================================

function spawnParticles(emoji,count){

    const area =
      document.getElementById('particleArea');

    for(let i=0;i<count;i++){

        const p =
          document.createElement('div');

        p.className = 'particle';

        p.innerText = emoji;

        p.style.left =
          Math.random()*100 + 'vw';

        p.style.top =
          Math.random()*80 + 'vh';

        area.appendChild(p);

        setTimeout(()=>{
            p.remove();
        },800);
    }
}

// ======================================================
// EFFECTS
// ======================================================

function screenShake(){

    const wrapper =
      document.getElementById('gameRoot');

    wrapper.classList.add('shake');

    setTimeout(()=>{
        wrapper.classList.remove('shake');
    },400);
}

// ======================================================
// LOAD QUESTION
// ======================================================

function loadNextQuestion(){

    if(!gameActive) return;

    if(currentQuestionIndex >= shuffledQuestions.length){

        endGame();

        return;
    }

    currentQuestion =
      shuffledQuestions[currentQuestionIndex];

    currentQuestionIndex++;

    questionTextSpan.innerText =
      currentQuestion.text;

    choicesContainer.innerHTML = "";

    const shuffledChoices =
      shuffleArray([...currentQuestion.choices]);

    shuffledChoices.forEach((choice)=>{

        const btn =
          document.createElement('button');

        btn.className = 'choice-btn';

        btn.innerText = choice.text;

        btn.addEventListener('click',()=>{

            applyChoice(choice);
        });

        choicesContainer.appendChild(btn);
    });

    momReactionDiv.innerText =
      "🤔 Mom waiting...";
}

// ======================================================
// APPLY CHOICE
// ======================================================

function applyChoice(choice){

    if(!gameActive) return;

    survival += choice.survivalDelta;

    stress += choice.stressDelta;

    survival =
      Math.max(0,Math.min(100,survival));

    stress =
      Math.max(0,Math.min(100,stress));

    if(choice.isGood){

        combo++;

        totalScore += 25 * combo;

        playTone("good");

        spawnParticles("✨",6);

    }else{

        combo = 0;

        totalScore =
          Math.max(0,totalScore - 20);

        playTone("bad");

        screenShake();

        spawnParticles("💥",8);
    }

    updateMeters();

    updateScoreUI();

    momReactionDiv.innerText =
      "👩 " + choice.reaction;

    if(survival <= 0 || stress >= 100){

        endGame();

        return;
    }

    setTimeout(()=>{
        loadNextQuestion();
    },700);
}

// ======================================================
// RESET GAME
// ======================================================

function resetGame(){

    survival = 100;

    stress = 0;

    combo = 0;

    totalScore = 0;

    currentQuestionIndex = 0;

    shuffledQuestions =
      shuffleArray([...QUESTIONS]);

    gameActive = true;

    updateMeters();

    updateScoreUI();

    loadNextQuestion();
}

// ======================================================
// START GAME
// ======================================================

function startGame(){

    initAudio();

    startScreenDiv.classList.add('hidden');

    gameScreenDiv.classList.remove('hidden');

    gameOverDiv.classList.add('hidden');

    resetGame();
   document.querySelector('.vatsal-related')
      ?.setAttribute('hidden','');
}

// ======================================================
// END GAME
// ======================================================

function endGame(){

    gameActive = false;

    gameScreenDiv.classList.add('hidden');

    gameOverDiv.classList.remove('hidden');

    finalScoreSpan.innerText =
      totalScore;

    let badge =
      "😭 Certified Disappointment";

    if(totalScore > 3000){

        badge =
          "🏆 Ultimate Sharma Ji Child";

    }else if(totalScore > 1500){

        badge =
          "🔥 Emotional Damage Survivor";

    }else if(totalScore > 500){

        badge =
          "😎 Average Indian Kid";
    }

    badgeArea.innerText = badge;
    // window.VatsalLolGameComplete?.();
}

// ======================================================
// SHARE
// ======================================================

async function shareScore(){

    const text =
`I scored ${totalScore} in Can You Survive Indian Mom Questions 😂`;

    if(navigator.share){

        try{

            await navigator.share({
                title:"Indian Mom Survival",
                text:text
            });

        }catch(e){}

    }else{

        navigator.clipboard.writeText(text);

        alert("Score copied!");
    }
}

// ======================================================
// FLOATING EMOJIS
// ======================================================

function startFloatingEmojis(){

    const emojis =
      ['🍛','📱','🥿','😤','😭','🙏','🇮🇳'];

    setInterval(()=>{

        const e =
          document.createElement('div');

        e.className = 'floating-emoji';

        e.innerText =
          emojis[
            Math.floor(Math.random()*emojis.length)
          ];

        e.style.left =
          Math.random()*100 + '%';

        e.style.animationDuration =
          (7 + Math.random()*6) + 's';

        document.body.appendChild(e);

        setTimeout(()=>{
            e.remove();
        },12000);

    },1800);
}

// ======================================================
// LOADING SCREEN
// ======================================================

function loadingOverlay(){

    const overlay =
      document.createElement('div');

    overlay.style.position='fixed';
    overlay.style.inset='0';
    overlay.style.background='#ff7700';
    overlay.style.zIndex='9999';
    overlay.style.display='flex';
    overlay.style.flexDirection='column';
    overlay.style.justifyContent='center';
    overlay.style.alignItems='center';
    overlay.style.fontFamily="'Press Start 2P'";
    overlay.style.color='white';

    overlay.innerHTML =
`
🕹️ LOADING MOM LOGIC...
<div style="margin-top:20px;font-size:.7rem;">
Heating emotional damage...
</div>
`;

    document.body.appendChild(overlay);

    setTimeout(()=>{

        overlay.style.opacity='0';

        setTimeout(()=>{
            overlay.remove();
        },500);

    },1800);
}

// ======================================================
// EVENTS
// ======================================================
const audioToggleBtn =
  document.getElementById('audioToggleBtn');

if(audioToggleBtn){
    audioToggleBtn.addEventListener('click',()=>{
        initAudio();
        audioToggleBtn.textContent =
          audioCtx && audioCtx.state === 'suspended'
            ? '🔇' : '🔊';
        if(audioCtx){
            audioCtx.state === 'suspended'
              ? audioCtx.resume()
              : audioCtx.suspend();
        }
    });
}
startBtn.addEventListener('click',startGame);

restartBtn.addEventListener('click',startGame);

shareBtn.addEventListener('click',shareScore);

// ======================================================
// INIT
// ======================================================

loadingOverlay();

startFloatingEmojis();

})();