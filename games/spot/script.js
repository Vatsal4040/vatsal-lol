/*==================================================
SPOT
v1.0
Part 1
Engine + State + Startup
==================================================*/

/*=========================================
DOM
=========================================*/

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const playButton = document.getElementById("playButton");
const playAgain = document.getElementById("playAgain");
const changeMode = document.getElementById("changeMode");

const grid = document.getElementById("grid");

const modeButtons = document.querySelectorAll(".mode-btn");

const modeName = document.getElementById("modeName");

const levelText = document.getElementById("level");
const timerText = document.getElementById("timer");
const scoreText = document.getElementById("score");

const bestScoreText = document.getElementById("bestScore");
const bestLevelText = document.getElementById("bestLevel");

const finalScore = document.getElementById("finalScore");
const highestLevel = document.getElementById("highestLevel");
const focus = document.getElementById("focus");
const mistakes = document.getElementById("mistakes");
const perfectLevels = document.getElementById("perfectLevels");

/*=========================================
CONSTANTS
=========================================*/

const STORAGE_KEY = "spot-v1";

const TOTAL_LEVELS = 20;

const MODE_NAMES = {

    color : "Color Hunt",

    shape : "Shape Hunt",

   number : "Number Hunt",
};

/*=========================================
GAME STATE
=========================================*/

const game = {

    mode : "color",

    level : 1,

    score : 0,

    timer : 20,

    gridSize : 3,

    answer : -1,

    tiles : [],

    interval : null,

    timeout : null,

    accepting : false,

    startedAt : 0,

    mistakes : 0,

    perfect : 0,

    solved : 0,

    bestScore : 0,

    bestLevel : 1,

    lives : 3,

  freezeActive : false,

    freezeCooldown : false,

    isZen : false,

    zenSeed : 0,

    zenModeSequence : []

};
/*=========================================
SCREENS
=========================================*/

function showScreen(screen){

    startScreen.classList.remove("active");

    gameScreen.classList.remove("active");

    resultScreen.classList.remove("active");

    screen.classList.add("active");

    window.scrollTo?.(0,0);

}

/*=========================================
HEADER
=========================================*/

function setHeader(show){

    const header=document.getElementById("vatsalHeader");

    if(!header) return;

    header.classList.toggle("hidden",!show);

}

/*=========================================
MODE SELECT
=========================================*/

modeButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        modeButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        game.mode=button.dataset.mode;

    });

});

/*=========================================
BUTTONS
=========================================*/

playButton.addEventListener(

    "click",

    startGame

);
document.getElementById("zenButton")?.addEventListener(

    "click",

    startZen

);
playAgain.addEventListener(

    "click",

    startGame

);

changeMode.addEventListener(

    "click",

    ()=>{

        clearInterval(

            game.interval

        );

        clearTimeout(

            game.timeout

        );

        game.accepting=false;

        setHeader(true);

        showScreen(startScreen);

    }

);

/*=========================================
RESET
=========================================*/

function resetGame(){

    clearInterval(game.interval);

    clearTimeout(game.timeout);

    game.accepting=false;

    game.level=1;

    game.score=0;

    game.timer=20;

    game.gridSize=3;

    game.answer=-1;

    game.tiles=[];

    game.mistakes=0;

    game.perfect=0;

    game.solved=0;

      game.lives=3;

    game.freezeActive=false;

    game.freezeCooldown=false;


}

/*=========================================
START GAME
=========================================*/

function startGame(){

    resetGame();

    setHeader(false);

    modeName.textContent=

        MODE_NAMES[game.mode];

    showScreen(gameScreen);

    nextLevel();

}

/*=========================================
NEXT LEVEL
=========================================*/

function nextLevel(){

    clearInterval(game.interval);

    clearTimeout(game.timeout);

    game.accepting=false;
   if(game.isZen){

        const z=game.zenModeSequence[game.level-1];

        game.mode=z.mode;

        game.gridSize=z.gridSize;

        game.timer=9999; // effectively no timer

        modeName.textContent=

            MODE_NAMES[game.mode]||"Zen";

    } else {

        game.gridSize=

            Math.min(

                3+

                Math.floor(

                    (game.level-1)/5

                ),

                8

            );

        game.timer=

            Math.max(

                18-

                Math.floor(

                    game.level/3

                ),

                6

            );

    }
    levelText.textContent=

        game.level;

    timerText.textContent=

        game.timer;

    scoreText.textContent=

        game.score;

    grid.innerHTML="";

    grid.style.gridTemplateColumns=

        `repeat(${game.gridSize},1fr)`;

    game.tiles=[];

    game.answer=-1;

    game.startedAt=

        performance.now();

    generatePuzzle();

    renderPuzzle();

   game.accepting=true;

    updateLivesDisplay();

    if(!game.isZen){

        startTimer();

    }
}

/*=========================================
TIMER
=========================================*/

function startTimer(){

    game.interval=

        setInterval(()=>{

            game.timer--;

            timerText.textContent=

                game.timer;

            if(game.timer<=0){

                clearInterval(

                    game.interval

                );

                endGame();

            }

        },1000);

}

/*=========================================
SAVE
=========================================*/

function saveGame(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            bestScore:

            game.bestScore,

            bestLevel:

            game.bestLevel

        })

    );

}

function loadGame(){

    const save=

        localStorage.getItem(

            STORAGE_KEY

        );

    if(!save) return;

    try{

        const data=

            JSON.parse(save);

        game.bestScore=

            data.bestScore||0;

        game.bestLevel=

            data.bestLevel||1;

    }

    catch(e){}

    bestScoreText.textContent=

        game.bestScore;

    bestLevelText.textContent=

        game.bestLevel;

}

loadGame();

updateZenButton();

/*=========================================
UTILITIES
=========================================*/

function random(max){

    return Math.floor(

        Math.random()*max

    );

}

function randomBetween(min,max){

    return min+

    Math.floor(

        Math.random()*

        (max-min+1)

    );

}

function randomItem(array){

    return array[

        random(array.length)

    ];

}
/*=========================================
SEEDED RANDOM (for Daily Zen)
=========================================*/

function seededRand(seed){

    // simple LCG
    let s=seed;

    return function(){

        s=(s*1664525+1013904223)&0xffffffff;

        return (s>>>0)/0xffffffff;

    };

}

/*=========================================
ZEN DATE KEY (IST = UTC+5:30)
=========================================*/

function getISTDateKey(){

    const now=new Date();

    const ist=new Date(now.getTime()+(5.5*60*60*1000));

    return ist.toISOString().slice(0,10);

}

/*=========================================
ZEN STORAGE
=========================================*/

function getZenStorage(){

    try{

        return JSON.parse(localStorage.getItem("spot-zen")||"{}");

    }catch(e){ return {}; }

}

function saveZenResult(score){

    const data=getZenStorage();

    data[getISTDateKey()]={score:score,done:true};

    localStorage.setItem("spot-zen",JSON.stringify(data));

}

function hasPlayedZenToday(){

    const data=getZenStorage();

    const entry=data[getISTDateKey()];

    return entry&&entry.done;

}

/*=========================================
BUILD ZEN SEQUENCE
=========================================*/

function buildZenSequence(){

    const dateKey=getISTDateKey();

    // seed from date string
    const seed=dateKey.split("").reduce((a,c)=>a+c.charCodeAt(0),0)*31337;

    game.zenSeed=seed;

    const rand=seededRand(seed);

    const modes=["color","shape","number"];

    const sequence=[];

    for(let i=0;i<TOTAL_LEVELS;i++){

        // mode: seeded rotation with random shuffles
        const mode=modes[Math.floor(rand()*modes.length)];

        // difficulty: gridSize 3–7, difference for color 3–22
        const gridSize=3+Math.floor(rand()*5);

        // difficulty level for puzzle generation (1–40 range)
        const diff=1+Math.floor(rand()*40);

        sequence.push({mode,gridSize,diff});

    }

    game.zenModeSequence=sequence;

}

/*=========================================
UPDATE ZEN BUTTON
=========================================*/

function updateZenButton(){

    const btn=document.getElementById("zenButton");

    if(!btn) return;

    if(hasPlayedZenToday()){

        btn.textContent="✓ Played Today";

        btn.disabled=true;

        btn.classList.add("zen-played");

    } else {

        btn.textContent="🌿 Daily Zen";

        btn.disabled=false;

        btn.classList.remove("zen-played");

    }

}

/*=========================================
START ZEN
=========================================*/

function startZen(){

    if(hasPlayedZenToday()) return;

    resetGame();

    game.isZen=true;

    buildZenSequence();

    setHeader(false);

    modeName.textContent="Daily Zen";

    // hide lives and freeze bar in zen
    const bar=document.querySelector(".lives-freeze-bar");

    if(bar) bar.style.display="none";

    // hide timer card in zen
    const timerCard=timerText.closest(".hud-card");

    if(timerCard) timerCard.style.display="none";

    showScreen(gameScreen);

    nextLevel();

}

/*=========================================
MODE DATA
=========================================*/

const NUMBERS=[

"0",

"1",

"2",

"3",

"4",

"5",

"6",

"7",

"8",

"9"

];

const SHAPES=[

"■",

"▲",

"●",

"◆",

"⬟",

"⬢",

"★",

"♥"

];
/*=========================================
MASTER GENERATOR
=========================================*/

function generatePuzzle(){

    switch(game.mode){

        case "color":

            generateColor();

            break;

        case "shape":

            generateShape();

            break;

         case "number":

            generateNumber();

            break;

        }

}

/*=========================================
COLOR MODE
=========================================*/

function generateColor(){

    const total=

    game.gridSize*

    game.gridSize;

    game.answer=

    random(total);

    const hue=

    random(360);

    const saturation=75;

    const lightness=55;

    const difference=

    Math.max(

        24-

        Math.floor(

            game.level/2

        ),

        3

    );

    const normal=

    `hsl(${hue},${saturation}%,${lightness}%)`;

    const odd=

    `hsl(${hue+difference},${saturation}%,${lightness}%)`;

    for(

        let i=0;

        i<total;

        i++

    ){

        game.tiles.push({

            type:"color",

            value:

            i===game.answer

            ?odd

            :normal

        });

    }

}

/*=========================================
SHAPE MODE
=========================================*/

function generateShape(){

    const total=

    game.gridSize*

    game.gridSize;

    game.answer=

    random(total);

    const main=

    randomItem(

        SHAPES

    );

    let odd=

    randomItem(

        SHAPES

    );

    while(

        odd===main

    ){

        odd=

        randomItem(

            SHAPES

        );

    }

    for(

        let i=0;

        i<total;

        i++

    ){

        game.tiles.push({

            type:"shape",

            value:

            i===game.answer

            ?odd

            :main

        });

    }

}

/*=========================================
NUMBER MODE
=========================================*/

function generateNumber(){

    const total=

    game.gridSize*

    game.gridSize;

    game.answer=

    random(total);

    const main=

    randomItem(NUMBERS);

    let odd=

    randomItem(NUMBERS);

    while(odd===main){

        odd=

        randomItem(NUMBERS);

    }

    for(

        let i=0;

        i<total;

        i++

    ){

        game.tiles.push({

            type:"number",

            value:

            i===game.answer

            ?odd

            :main

        });

    }

}
/*=========================================
RENDER
=========================================*/

function renderPuzzle(){

    grid.innerHTML="";

    game.tiles.forEach((tile,index)=>{

        const cell=document.createElement("button");

        cell.type="button";

        cell.className=`tile ${tile.type}`;

        cell.dataset.index=index;

        switch(tile.type){

            case "color":

                cell.style.background=tile.value;

                break;

            case "shape":

                cell.textContent=tile.value;

                break;

            case "number":

                cell.textContent=tile.value;

                break;

            case "rotation":

                cell.textContent=tile.value;

                break;

            case "gap":

                cell.textContent=tile.value;

                break;

        }

        cell.addEventListener("click",()=>{

            tileClicked(index);

        });

        grid.appendChild(cell);

    });

}

/*=========================================
CLICK
=========================================*/

function tileClicked(index){

    if(

        !game.accepting ||

        !gameScreen.classList.contains(

            "active"

        )

    ) return;

    game.accepting=false;

    clearInterval(game.interval);

    if(index===game.answer){

        levelSolved(index);

    }

    else{

        levelFailed(index);

    }

}

/*=========================================
CORRECT
=========================================*/

function levelSolved(index){

    const reaction=

    performance.now()-game.startedAt;

    const clicked=

    grid.children[index];

    clicked.classList.add("correct");

    showTimerBonus();

    const timeBonus=

    game.timer*15;

    const levelBonus=

    game.level*25;

    const speedBonus=

    Math.max(

        0,

        1000-

        Math.floor(reaction)

    );

    const earned=

    timeBonus+

    levelBonus+

    speedBonus;

    game.score+=earned;

    game.solved++;

    if(game.timer===

        Math.max(

            18-

            Math.floor(

                game.level/3

            ),

            6

        )

    ){

        game.perfect++;

    }

    scoreText.textContent=

    game.score;

    if(game.level>

        game.bestLevel){

        game.bestLevel=

        game.level;

    }

    if(game.score>

        game.bestScore){

        game.bestScore=

        game.score;

    }

    saveGame();

    game.timeout=setTimeout(()=>{

        game.level++;

        if(

            game.level>

            TOTAL_LEVELS

        ){

            endGame();

            return;

        }

        nextLevel();

    },250);

}

/*=========================================
WRONG
=========================================*/

function levelFailed(index){

    game.mistakes++;

    if(!game.isZen) game.lives--;

    const wrong=

    grid.children[index];

    const answer=

    grid.children[game.answer];

    wrong.classList.add(

        "wrong",

        "selectedWrong"

    );

    answer.classList.add(

        "answer"

    );

   updateLivesDisplay();

    if(!game.isZen && game.lives<=0){

        game.timeout=setTimeout(()=>{

            endGame();

        },700);

    } else {

        game.timeout=setTimeout(()=>{

            nextLevel();

        },700);

    }

}

/*=========================================
KEYBOARD
=========================================*/

document.addEventListener(

    "keydown",

    event=>{

        if(

            !gameScreen.classList.contains(

                "active"

            )

        ) return;

        const key=

        Number(event.key);

        if(

            Number.isNaN(key)

        ) return;

        if(

            key<1 ||

            key>

            game.tiles.length

        ) return;

        tileClicked(

            key-1

        );

    }

);

/*=========================================
ESCAPE
=========================================*/

document.addEventListener(

    "keydown",

    event=>{

        if(

            event.key==="Escape"

        ){

            clearInterval(

                game.interval

            );

            clearTimeout(

                game.timeout

            );

            game.accepting=false;

            setHeader(true);

            showScreen(

                startScreen

            );

        }

    }

);
/*==================================================
SPOT
v1.0
Part 4
Game Over + Results
==================================================*/

/*=========================================
END GAME
=========================================*/

function endGame(){

    clearInterval(game.interval);

    clearTimeout(game.timeout);

    game.accepting=false;

    // restore lives/freeze bar and timer card visibility

    const bar=document.querySelector(".lives-freeze-bar");

    if(bar) bar.style.display="";

    const timerCard=timerText.closest(".hud-card");

    if(timerCard) timerCard.style.display="";

    if(game.isZen){

        saveZenResult(game.score);

        updateZenButton();

        game.isZen=false;

    }

    setHeader(true);

    if(game.score>game.bestScore){

        game.bestScore=game.score;

    }

    if(game.level>game.bestLevel){

        game.bestLevel=game.level;

    }

    saveGame();

    bestScoreText.textContent=

        game.bestScore;

    bestLevelText.textContent=

        game.bestLevel;

    finalScore.textContent=

        game.score;

    highestLevel.textContent=

        Math.max(

            1,

            game.level-

            (game.level>TOTAL_LEVELS?0:1)

        );

    mistakes.textContent=

        game.mistakes;

    perfectLevels.textContent=

        game.perfect;

    focus.textContent=

        getFocus()+"%";

    showScreen(

        resultScreen

    );
    document.querySelector(".vatsal-related")?.removeAttribute("hidden");
    window.VatsalLolGameComplete?.();

}
/*=========================================
TIMER BONUS POPUP
=========================================*/

function showTimerBonus(){

    const bonus=game.timer*15>0?Math.round(game.timer*15/15):0;

    // We show how many sec the timer currently has as a +Ns toast on the timer element

    const el=timerText;

    const pop=document.createElement("span");

    pop.className="timer-bonus-pop";

    pop.textContent="+"+game.timer+"s";

    el.parentElement.style.position="relative";

    el.parentElement.appendChild(pop);

    setTimeout(()=>pop.remove(),900);

}
/*=========================================
LIVES DISPLAY
=========================================*/

function updateLivesDisplay(){

    const el=document.getElementById("livesDisplay");

    if(!el) return;

    let html="";

    for(let i=0;i<3;i++){

        html+=`<span class="${i<game.lives?'life-full':'life-empty'}">♥</span>`;

    }

    el.innerHTML=html;

}

/*=========================================
FREEZE POWERUP
=========================================*/

function activateFreeze(){

    if(game.freezeActive||game.freezeCooldown) return;

    if(!game.accepting) return;

    game.freezeActive=true;

    clearInterval(game.interval);

    const btn=document.getElementById("freezeBtn");

    if(btn){

        btn.classList.add("freeze-active");

        btn.textContent="❄️ 5s";

    }

    let freezeLeft=5;

    // timer ticks at HALF speed (2000ms) during freeze — feels like slow motion
    const slowTick=setInterval(()=>{

        game.timer--;

        timerText.textContent=game.timer;

        if(game.timer<=0){

            clearInterval(slowTick);

            game.freezeActive=false;

            endGame();

            return;

        }

    },2000);

    const freezeTick=setInterval(()=>{

        freezeLeft--;

        if(btn) btn.textContent="❄️ "+freezeLeft+"s";

        if(freezeLeft<=0){

            clearInterval(freezeTick);

            clearInterval(slowTick);

            game.freezeActive=false;

            if(game.accepting) startTimer();

            if(btn){

                btn.classList.remove("freeze-active");

                btn.classList.add("freeze-cooldown");

                btn.textContent="⏳ 15s";

            }

            game.freezeCooldown=true;

            let cdLeft=15;

            const cdTick=setInterval(()=>{

                cdLeft--;

                if(btn) btn.textContent="⏳ "+cdLeft+"s";

                if(cdLeft<=0){

                    clearInterval(cdTick);

                    game.freezeCooldown=false;

                    if(btn){

                        btn.classList.remove("freeze-cooldown");

                        btn.textContent="❄️ Freeze";

                    }

                }

            },1000);

        }

    },1000);

}
/*=========================================
FOCUS
=========================================*/

function getFocus(){

    const total=

        Math.max(

            game.solved+

            game.mistakes,

            1

        );

    const accuracy=

        (game.solved/total)*100;

    return Math.round(

        Math.max(

            accuracy,

            0

        )

    );

}

/*=========================================
RATING
=========================================*/

function getRating(){

    const value=

        getFocus();

    if(value>=98){

        return "Legendary";

    }

    if(value>=95){

        return "Excellent";

    }

    if(value>=90){

        return "Great";

    }

    if(value>=80){

        return "Good";

    }

    if(value>=70){

        return "Nice";

    }

    return "Keep Practicing";

}

/*=========================================
UPDATE RESULT
=========================================*/

const resultTitle=

    resultScreen.querySelector("h2");

const focusRow=

    document.getElementById("focus");

const observer=new MutationObserver(()=>{

    resultTitle.textContent=

        "👀 "+getRating();

});

observer.observe(

    focusRow,

    {

        childList:true

    }

);

/*=========================================
RESTART
=========================================*/

function restartGame(){

    resetGame();

    startGame();

}

/*=========================================
PLAY AGAIN
=========================================*/

playAgain.removeEventListener(

    "click",

    startGame

);

playAgain.addEventListener(

    "click",

    restartGame

);

/*=========================================
FOOTER
=========================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        document

        .querySelector(

            ".vatsal-related"

        )

        ?.setAttribute(

            "hidden",

            ""

        );

    }

);

/*=========================================
INITIAL UI
=========================================*/

bestScoreText.textContent=

    game.bestScore;

bestLevelText.textContent=

    game.bestLevel;

/*=========================================
READY
=========================================*/

console.log(

    "SPOT v1.0 Ready"

);
