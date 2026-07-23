/* ===========================
PARTICLES
=========================== */

for(let i=0;i<80;i++){

    const p=document.createElement("div");
    p.classList.add("particle");

    p.style.left=Math.random()*100+"%";
    p.style.animationDuration=(5+Math.random()*10)+"s";
    p.style.animationDelay=Math.random()*5+"s";

    document.getElementById("particles").appendChild(p);
}

/* ===========================
MOVIES
=========================== */

const hollywoodMovies = [

{emoji:"🦁👑",answer:"lion king",hint:"Disney jungle king"},
{emoji:"🚢💔",answer:"titanic",hint:"Ship romance"},
{emoji:"🕷️🧑",answer:"spider man",hint:"Marvel hero"},
{emoji:"🧠💭🌌",answer:"inception",hint:"Dreams"},
{emoji:"🧙💍",answer:"lord of the rings",hint:"One ring"},
{emoji:"🦖🏝️",answer:"jurassic park",hint:"Dinosaurs"},
{emoji:"🤖❤️🚀",answer:"wall e",hint:"Robot love"},
{emoji:"❄️⛄👸",answer:"frozen",hint:"Ice queen"},
{emoji:"🃏🦇",answer:"the dark knight",hint:"Batman"},
{emoji:"👽📞🚲",answer:"et",hint:"Phone home"},
{emoji:"🐼🥋",answer:"kung fu panda",hint:"Po"},
{emoji:"🚗⏱️💨",answer:"fast and furious",hint:"Racing"},
{emoji:"👁️💊🖥️",answer:"the matrix",hint:"Red pill"},
{emoji:"🧼👊",answer:"fight club",hint:"First rule"},
{emoji:"🌽🔥🎯",answer:"the hunger games",hint:"Survival"},
{emoji:"🛸🌽👨‍🌾",answer:"interstellar",hint:"Space"},
{emoji:"🧑‍🚀🌕",answer:"apollo 13",hint:"Moon mission"},
{emoji:"🧛🩸",answer:"dracula",hint:"Vampire"},
{emoji:"🦈🌊",answer:"jaws",hint:"Shark"},
{emoji:"🐒🏢",answer:"king kong",hint:"Giant ape"},
{emoji:"🧑⚡🧙",answer:"harry potter",hint:"Wizard"},
{emoji:"👻🚫",answer:"ghostbusters",hint:"Ghost hunters"},
{emoji:"🚀⭐⚔️",answer:"star wars",hint:"Jedi"},
{emoji:"🦸‍♂️🛡️",answer:"captain america",hint:"Shield"},
{emoji:"🧤💎",answer:"avengers endgame",hint:"Infinity"},
{emoji:"🐠🔍",answer:"finding nemo",hint:"Fish"},
{emoji:"🚓🤖",answer:"transformers",hint:"Robots"},
{emoji:"🐯🚣",answer:"life of pi",hint:"Tiger"},
{emoji:"🦍🗽",answer:"planet of the apes",hint:"Apes"},
{emoji:"🚂🧙",answer:"polar express",hint:"Christmas train"},
{emoji:"👨🍫",answer:"willy wonka",hint:"Chocolate"},
{emoji:"🐀🍝",answer:"ratatouille",hint:"Cooking rat"},
{emoji:"🚔💊",answer:"21 jump street",hint:"Undercover"},
{emoji:"🦸‍♂️⚡",answer:"shazam",hint:"Magic hero"},
{emoji:"🏹🍎",answer:"brave",hint:"Pixar princess"},
{emoji:"🧸🤠",answer:"toy story",hint:"Woody & Buzz"},
{emoji:"🐟💙",answer:"finding dory",hint:"Forgetful blue fish"},
{emoji:"🧞‍♂️🕌",answer:"aladdin",hint:"Magic lamp"},
{emoji:"👸🥀",answer:"beauty and the beast",hint:"Enchanted castle"},
{emoji:"👠🎃",answer:"cinderella",hint:"Glass slipper"},
{emoji:"🧜‍♀️🌊",answer:"the little mermaid",hint:"Under the sea"},
{emoji:"👸🍎",answer:"snow white",hint:"Seven dwarfs"},
{emoji:"🦌❄️",answer:"bambi",hint:"Young deer"},
{emoji:"🚗🏁",answer:"cars",hint:"Lightning McQueen"},
{emoji:"🐉👦",answer:"how to train your dragon",hint:"Toothless"},
{emoji:"👾🎮",answer:"wreck it ralph",hint:"Arcade villain"},
{emoji:"👹🏭",answer:"monsters inc",hint:"Sulley & Mike"},
{emoji:"🎈🎈👴",answer:"up",hint:"Flying house"},
{emoji:"🌮🐢🥋",answer:"teenage mutant ninja turtles",hint:"Pizza lovers"},
{emoji:"🦇🌆",answer:"batman begins",hint:"Origin of Batman"},
{emoji:"⚡🔨",answer:"thor",hint:"God of thunder"},
{emoji:"🟢👊",answer:"the incredible hulk",hint:"Green giant"},
{emoji:"🕶️🤖",answer:"men in black",hint:"Alien hunters"},
{emoji:"🚀🌍",answer:"gravity",hint:"Lost in space"},
{emoji:"🪐🌌",answer:"the martian",hint:"Stranded on Mars"},
{emoji:"🧟‍♂️🌍",answer:"world war z",hint:"Zombie apocalypse"},
{emoji:"🦍💥",answer:"rampage",hint:"Giant creatures"},
{emoji:"🐧🎵",answer:"happy feet",hint:"Dancing penguin"},
{emoji:"🚢🌊",answer:"poseidon",hint:"Disaster at sea"},
{emoji:"🏹🟩",answer:"the green arrow",hint:"DC archer"},
{emoji:"🚂❄️",answer:"snowpiercer",hint:"Train survives apocalypse"},
{emoji:"🐼👊",answer:"puss in boots",hint:"Sword fighting cat"},
{emoji:"🧙‍♀️🌪️",answer:"the wizard of oz",hint:"Yellow brick road"},
{emoji:"👨🟩🎭",answer:"the mask",hint:"Green face"},
{emoji:"🧑‍🚒🌋",answer:"dante's peak",hint:"Volcano disaster"},
{emoji:"🏹🔥",answer:"robin hood",hint:"Legendary outlaw"},
{emoji:"🛩️🏝️",answer:"cast away",hint:"Island survival"},
{emoji:"🦖🌋",answer:"the lost world jurassic park",hint:"Second Jurassic adventure"},
{emoji:"🚓🤠",answer:"rush hour",hint:"Jackie Chan & Chris Tucker"},
{emoji:"🛳️🌊",answer:"pirates of the caribbean",hint:"Captain Jack Sparrow"},
{emoji:"🐼🐉",answer:"kung fu panda 2",hint:"Peacock villain"},
{emoji:"👨⚡⚙️",answer:"iron man",hint:"Tony Stark"},
{emoji:"🕸️🦹",answer:"venom",hint:"Alien symbiote"},
{emoji:"⚡👨‍👦",answer:"shazam fury of the gods",hint:"Magic family"},
{emoji:"🧙⚔️",answer:"doctor strange",hint:"Master of mystic arts"},
{emoji:"🦝🌌",answer:"guardians of the galaxy",hint:"Star-Lord's team"},
{emoji:"👑🦍",answer:"godzilla vs kong",hint:"Monster showdown"},
{emoji:"🦕🏃",answer:"jurassic world",hint:"Dinosaur theme park"},
{emoji:"🤖🌍",answer:"i robot",hint:"Will Smith robots"},
{emoji:"🤠🐎",answer:"the lone ranger",hint:"Masked cowboy"},
{emoji:"🚔💥",answer:"die hard",hint:"John McClane"},
{emoji:"💣⏳",answer:"mission impossible",hint:"Ethan Hunt"},
{emoji:"🚁🔥",answer:"top gun",hint:"Fighter pilots"},
{emoji:"🛩️⚽",answer:"air force one",hint:"President on a plane"},
{emoji:"🏃💨",answer:"forrest gump",hint:"Life is like a box of chocolates"},
{emoji:"🧒👻",answer:"the sixth sense",hint:"I see dead people"},
{emoji:"🧠🕵️",answer:"shutter island",hint:"Mental asylum mystery"},
{emoji:"🦢🩰",answer:"black swan",hint:"Psychological ballet"},
{emoji:"🚓💊",answer:"training day",hint:"Corrupt detective"},
{emoji:"🌧️🤖",answer:"blade runner 2049",hint:"Future replicants"},
{emoji:"🚙🏜️",answer:"mad max fury road",hint:"Post-apocalyptic chase"},
{emoji:"🐺💰",answer:"the wolf of wall street",hint:"Stockbroker excess"},
{emoji:"🚢🦈",answer:"the meg",hint:"Giant prehistoric shark"},
{emoji:"🪂⚔️",answer:"300",hint:"Spartan warriors"},
{emoji:"🧑‍🚀☀️",answer:"sunshine",hint:"Mission to save the Sun"},
{emoji:"🚓👨‍👦",answer:"bad boys for life",hint:"Mike & Marcus return"},
{emoji:"🤫👽",answer:"a quiet place",hint:"Silence saves lives"},
{emoji:"👻🏚️",answer:"the conjuring",hint:"Haunted farmhouse"}
];

const bollywoodMovies = [

{emoji:"🚂❤️",answer:"dilwale dulhania le jayenge",hint:"Raj & Simran"},
{emoji:"👽🏏",answer:"koi mil gaya",hint:"Alien friend"},
{emoji:"🎸❤️",answer:"rockstar",hint:"Singer"},
{emoji:"👨‍🎓3️⃣",answer:"3 idiots",hint:"Engineering"},
{emoji:"🕺💃🕌",answer:"veer zaara",hint:"Cross border love"},
{emoji:"🏏🇮🇳",answer:"lagaan",hint:"Cricket"},
{emoji:"👮‍♂️🔥",answer:"singham",hint:"Police"},
{emoji:"🚽❤️",answer:"toilet ek prem katha",hint:"Toilet"},
{emoji:"🎤👧",answer:"secret superstar",hint:"Singer girl"},
{emoji:"🧔🥊",answer:"sultan",hint:"Wrestling"},
{emoji:"👩‍👧✈️",answer:"neerja",hint:"Flight heroine"},
{emoji:"👳‍♂️🏑",answer:"chak de india",hint:"Hockey"},
{emoji:"👨‍👩‍👧‍👦🎶",answer:"hum saath saath hain",hint:"Family"},
{emoji:"💍❤️",answer:"vivah",hint:"Marriage"},
{emoji:"👑🕌",answer:"jodhaa akbar",hint:"Mughal"},
{emoji:"🧑‍🏫📚",answer:"taare zameen par",hint:"Child artist"},
{emoji:"🎭🤡",answer:"bhool bhulaiyaa",hint:"Ghost comedy"},
{emoji:"🚓💪",answer:"dabangg",hint:"Chulbul"},
{emoji:"❤️🚂",answer:"jab we met",hint:"Train"},
{emoji:"👨‍⚕️❤️",answer:"kabir singh",hint:"Doctor"},
{emoji:"🎸🔥",answer:"aashiqui 2",hint:"Musical romance"},
{emoji:"🧔🛵",answer:"pk",hint:"Alien man"},
{emoji:"👨‍👩‍👧🏠",answer:"baghban",hint:"Parents"},
{emoji:"💃🌧️",answer:"devdas",hint:"Paro"},
{emoji:"👮‍♂️🕶️",answer:"rowdy rathore",hint:"Cop"},
{emoji:"🧑‍🚀🇮🇳",answer:"swades",hint:"NASA"},
{emoji:"💰🏃",answer:"dhoom",hint:"Bikes"},
{emoji:"🧑‍🎤❤️",answer:"ae dil hai mushkil",hint:"Love pain"},
{emoji:"🏍️👊",answer:"war",hint:"Action"},
{emoji:"👩‍🦰❤️",answer:"queen",hint:"Solo trip"},
{emoji:"🎬🌟",answer:"om shanti om",hint:"Rebirth"},
{emoji:"🧑‍🎤🎵",answer:"gully boy",hint:"Rap"},
{emoji:"🏃‍♂️🥛",answer:"bhaag milkha bhaag",hint:"Runner"},
{emoji:"👮‍♂️🚔",answer:"sooryavanshi",hint:"Rohit Shetty cop universe"},
{emoji:"🎻❤️",answer:"mohabbatein",hint:"Music romance"},
{emoji:"🏫❤️",answer:"kuch kuch hota hai",hint:"Friendship"},
{emoji:"👨‍👧🥇",answer:"dangal",hint:"Wrestling daughters"},
{emoji:"🏫🎓❤️",answer:"student of the year",hint:"Elite college"},
{emoji:"👨‍⚕️😂",answer:"munna bhai mbbs",hint:"Doctor with a golden heart"},
{emoji:"📻☮️",answer:"lage raho munna bhai",hint:"Gandhigiri"},
{emoji:"🏍️💰",answer:"kick",hint:"Devil"},
{emoji:"🦸‍♂️⚡",answer:"krrish",hint:"Indian superhero"},
{emoji:"🛫🏜️",answer:"airlift",hint:"Kuwait rescue"},
{emoji:"🏏🏆",answer:"83",hint:"1983 World Cup"},
{emoji:"🥇🇮🇳",answer:"gold",hint:"Olympic dream"},
{emoji:"🕵️💣",answer:"baby",hint:"Secret mission"},
{emoji:"💰🏠",answer:"raid",hint:"Income tax officer"},
{emoji:"👨‍⚖️⚖️",answer:"jolly llb",hint:"Courtroom comedy"},
{emoji:"🚂😂",answer:"chennai express",hint:"Train journey"},
{emoji:"🎒🏔️",answer:"yeh jawaani hai deewani",hint:"Friendship trip"},
{emoji:"🚗🌍",answer:"zindagi na milegi dobara",hint:"Road trip"},
{emoji:"🎤🎶",answer:"rock on",hint:"Band reunion"},
{emoji:"🎬❤️",answer:"tamasha",hint:"Storyteller"},
{emoji:"👨‍👩‍👦🏠",answer:"kabhi khushi kabhie gham",hint:"Family drama"},
{emoji:"❤️🌧️",answer:"hum dil de chuke sanam",hint:"Love triangle"},
{emoji:"⚔️👑",answer:"bajirao mastani",hint:"Maratha warrior"},
{emoji:"🕌👸",answer:"padmaavat",hint:"Rajput queen"},
{emoji:"👻👰",answer:"stree",hint:"Horror comedy"},
{emoji:"👻👦",answer:"bhootnath",hint:"Friendly ghost"},
{emoji:"🔥🪖",answer:"uri the surgical strike",hint:"Military mission"},
{emoji:"🕵️🇮🇳",answer:"special 26",hint:"Fake CBI raid"},
{emoji:"🚔💥",answer:"wanted",hint:"Undercover cop"},
{emoji:"💼📈",answer:"guru",hint:"Business tycoon"},
{emoji:"🎤⭐",answer:"aashiqui",hint:"Classic musical romance"},
{emoji:"👰💔",answer:"humpty sharma ki dulhania",hint:"Modern romance"},
{emoji:"👨‍🎤❤️",answer:"barfi",hint:"Silent love story"},
{emoji:"🕵️‍♂️🔫",answer:"ek tha tiger",hint:"RAW agent"},
{emoji:"🕵️‍♂️🇮🇳",answer:"tiger zinda hai",hint:"Tiger returns"},
{emoji:"👨‍👦❤️",answer:"bajrangi bhaijaan",hint:"Munni"},
{emoji:"👩‍🦽🎤",answer:"hichki",hint:"Teacher with Tourette syndrome"},
{emoji:"👩‍✈️✈️",answer:"gunjan saxena",hint:"Kargil girl"},
{emoji:"🏏👧",answer:"shabaash mithu",hint:"Women's cricket"},
{emoji:"🚓👮‍♂️",answer:"simmba",hint:"Corrupt cop"},
{emoji:"🪖🏔️",answer:"shershaah",hint:"Captain Vikram Batra"},
{emoji:"🏏👨",answer:"ms dhoni the untold story",hint:"Captain Cool"},
{emoji:"🎓👩",answer:"english vinglish",hint:"Learning English"},
{emoji:"👰🏠",answer:"2 states",hint:"Interstate love"},
{emoji:"❤️🎸",answer:"wake up sid",hint:"Coming of age"},
{emoji:"👨‍🍳⭐",answer:"chef",hint:"Food truck journey"},
{emoji:"🎸🎶",answer:"dil chahta hai",hint:"Three best friends"},
{emoji:"👨‍👨‍👦✈️",answer:"znmd",hint:"Spain road trip"},
{emoji:"💌🌧️",answer:"love aaj kal",hint:"Two generations of love"},
{emoji:"🏥❤️",answer:"dear zindagi",hint:"Life lessons"},
{emoji:"🏃‍♂️🚔",answer:"bhaag johnny",hint:"Second chance"},
{emoji:"💵🎲",answer:"luck by chance",hint:"Film industry"},
{emoji:"🎬🎭",answer:"omkara",hint:"Shakespeare adaptation"},
{emoji:"👑⚔️",answer:"tanhaji",hint:"Maratha warrior"},
{emoji:"🚂👩",answer:"parineeta",hint:"Classic romance"},
{emoji:"🎤🎼",answer:"secret",hint:"Musical journey"},
{emoji:"👨‍⚖️⚖️",answer:"pink",hint:"No means no"},
{emoji:"🏫👨‍🏫",answer:"super 30",hint:"Math teacher"},
{emoji:"🚀👨‍🔬",answer:"mission mangal",hint:"Mars mission"},
{emoji:"💣🏨",answer:"phantom",hint:"Counter-terror mission"},
{emoji:"👮‍♂️🧑‍⚖️",answer:"drishyam",hint:"Perfect crime"},
{emoji:"🛵❤️",answer:"luka chuppi",hint:"Live-in relationship"},
{emoji:"👰🤵💍",answer:"band baaja baaraat",hint:"Wedding planners"},
{emoji:"🧑‍🍳🍱",answer:"the lunchbox",hint:"Wrong lunch delivery"},
{emoji:"🏃🌆",answer:"kai po che",hint:"Three friends"}
];

/* ===========================
GAME STATE
=========================== */

let currentMode = "hollywood";
let moviePool = [];
let currentMovie = null;
let currentOptions = [];
let roundLocked = false;

let score = 0;
let combo = 0;
let lives = 4;

let attempts = 0;
let corrects = 0;
let wrongs = 0;

let history = [];

let timer;
let timeLeft = 15;
let roundTime = 15;

/* ===========================
START GAME
=========================== */

function startGame(mode){

    currentMode = mode;

    moviePool = [...(
        mode === "hollywood"
        ? hollywoodMovies
        : bollywoodMovies
    )];

    shuffle(moviePool);

    document.getElementById("startScreen").style.display="none";

    document.getElementById("gameScreen").style.display="flex";
    document.getElementById("siteHeader").style.display="none";

    document.getElementById("modeTitle").innerText =
        mode.toUpperCase()+" MODE";

    document.querySelector('.vatsal-related')?.setAttribute('hidden', '');

    resetGame();

    nextQuestion();
}

/* ===========================
SHUFFLE
=========================== */

function shuffle(array){

    for(let i=array.length-1;i>0;i--){

        const j=Math.floor(Math.random()*(i+1));

        [array[i],array[j]]=[array[j],array[i]];
    }
}

/* ===========================
NEXT QUESTION
=========================== */

function nextQuestion(){

    if(lives<=0){
        gameOver();
        return;
    }

    if(moviePool.length===0){

        moviePool = [...(
            currentMode==="hollywood"
            ? hollywoodMovies
            : bollywoodMovies
        )];

        shuffle(moviePool);
    }

    currentMovie = moviePool.pop();
    currentOptions = createOptions(currentMovie);
    roundLocked = false;

    document.getElementById("emoji").innerText =
        currentMovie.emoji;

    document.getElementById("message").innerHTML="";
    renderOptions();

    startTimer();
}

/* ===========================
OPTIONS
=========================== */

function createOptions(movie){

    const source =
        currentMode==="hollywood"
        ? hollywoodMovies
        : bollywoodMovies;

    const answers = Array.from(
        new Set(
            source
                .map(item=>item.answer)
                .filter(answer=>answer!==movie.answer)
        )
    );

    shuffle(answers);

    const options = [
        movie.answer,
        ...answers.slice(0,3)
    ];

    shuffle(options);

    return options;
}

function formatMovieTitle(title){

    const acronyms = ["et","pk"];
    const smallWords = ["a","an","and","of","the"];

    return title
        .split(" ")
        .map((word,index)=>{
            if(acronyms.includes(word)) return word.toUpperCase();
            if(index>0 && smallWords.includes(word)) return word;
            return word.charAt(0).toUpperCase()+word.slice(1);
        })
        .join(" ");
}

function renderOptions(){

    const grid = document.getElementById("optionsGrid");
    grid.innerHTML = "";

    currentOptions.forEach(option=>{

        const btn = document.createElement("button");

        btn.className = "option-btn";
        btn.type = "button";
        btn.innerText = formatMovieTitle(option);
        btn.onclick = ()=>selectOption(option,btn);

        grid.appendChild(btn);
    });
}

/* ===========================
TIMER
=========================== */

function startTimer(){

    clearInterval(timer);

    roundTime = Math.max(9,15-Math.floor(combo/4));
    timeLeft = roundTime;

    updateTimer();

    timer = setInterval(()=>{

        timeLeft--;

        updateTimer();

        if(timeLeft<=0){

            clearInterval(timer);

            wrongAnswer("Time up!");
        }

    },1000);
}

function updateTimer(){

    document.getElementById("timerBar").style.width =
        (timeLeft/roundTime)*100+"%";
}

/* ===========================
SELECT ANSWER
=========================== */

function selectOption(option,selectedButton){

    if(roundLocked) return;

    roundLocked = true;
    clearInterval(timer);
    attempts++;

    revealOptions(selectedButton);

    if(option===currentMovie.answer){

        corrects++;
        combo++;

        let points = 100 * Math.max(combo,1);

        score += points;

        document.getElementById("message").innerHTML =
            `<span class="correct">
                ✔️ Correct! +${points}
            </span>`;

        history.push({
            emoji:currentMovie.emoji,
            answer:currentMovie.answer,
            status:"right"
        });

        updateStats();

        setTimeout(nextQuestion,850);

    }else{

        wrongAnswer("Wrong Answer!",true);
    }
}

function revealOptions(selectedButton){

    const buttons = document.querySelectorAll(".option-btn");
    const correctLabel = formatMovieTitle(currentMovie.answer).toLowerCase();

    buttons.forEach(btn=>{

        btn.disabled = true;

        if(btn.innerText.toLowerCase()===correctLabel){
            btn.classList.add("correct-choice");
        }else if(btn===selectedButton){
            btn.classList.add("wrong-choice");
        }else{
            btn.classList.add("dimmed-choice");
        }
    });
}

/* ===========================
WRONG
=========================== */

function wrongAnswer(text,alreadyRevealed=false){

    if(roundLocked && !alreadyRevealed) return;

    roundLocked = true;
    clearInterval(timer);

    if(!alreadyRevealed){
        attempts++;
        revealOptions(null);
    }

    wrongs++;
    combo=0;
    lives--;

    history.push({
        emoji:currentMovie.emoji,
        answer:currentMovie.answer,
        status:"wrong"
    });

    document.getElementById("message").innerHTML =
        `<span class="wrong">
            ❌ ${text}
            <br>
            Correct: ${formatMovieTitle(currentMovie.answer)}
        </span>`;

    updateStats();

    setTimeout(nextQuestion,1400);
}

/* ===========================
UPDATE
=========================== */

function updateStats(){

    document.getElementById("score").innerText=score;

    document.getElementById("combo").innerText=
        combo+"x";

    let hearts="";

    for(let i=0;i<lives;i++){
        hearts+="❤️";
    }

    document.getElementById("lives").innerText=
        hearts || "💀";

    const quizCard = document.querySelector(".quiz-card");

    if(combo>=3){
        quizCard.classList.add("combo-hot");
    }else{
        quizCard.classList.remove("combo-hot");
    }
}

/* ===========================
HINT
=========================== */

function showHint(){

    if(roundLocked) return;

    document.getElementById("message").innerHTML=
        "💡 "+currentMovie.hint;
}

/* ===========================
SKIP
=========================== */

function skipQuestion(){

    if(roundLocked) return;

    roundLocked = true;

    clearInterval(timer);

    document.getElementById("message").innerHTML =
    `
    ⏭ Question Skipped
    <br>
    Correct:
    ${formatMovieTitle(currentMovie.answer)}
    `;

    wrongs++;
    attempts++;
    lives--;
    combo=0;

    history.push({
        emoji:currentMovie.emoji,
        answer:currentMovie.answer,
        status:"wrong"
    });

    updateStats();

    setTimeout(nextQuestion,1200);
}

/* ===========================
GAME OVER
=========================== */

function gameOver(){

    clearInterval(timer);

    document.getElementById("gameScreen")
    .style.display="none";

    document.getElementById("scoreScreen")
    .style.display="flex";
    // window.VatsalLolGameComplete?.();
    document.getElementById("siteHeader").style.display="flex";
    const related = document.querySelector('.vatsal-related');
    if(related){
        document.getElementById('scoreScreen')
            .querySelector('.score-inner')
            .appendChild(related);
    }

    document.getElementById("finalScore")
    .innerText=score;

    document.getElementById("correctCount")
    .innerText=corrects;

    document.getElementById("wrongCount")
    .innerText=wrongs;

    document.getElementById("attemptCount")
    .innerText=attempts;

    const percent =
        (corrects / Math.max(attempts,1))*100;

    let remark="";

    if(currentMode==="hollywood"){

        if(percent>85)
            remark="🏆 Hollywood Genius";

        else if(percent>65)
            remark="🔥 Hollywood Expert";

        else if(percent>40)
            remark="🎬 Hollywood Fan";

        else
            remark="🍿 Hollywood Newcomer";

    }else{

        if(percent>85)
            remark="🏆 Bollywood Genius";

        else if(percent>65)
            remark="🔥 Bollywood Expert";

        else if(percent>40)
            remark="🎥 Bollywood Fan";

        else
            remark="🍿 Bollywood Newcomer";
    }

    document.getElementById("remark")
    .innerText=remark;

    const historyDiv =
        document.getElementById("history");

    historyDiv.innerHTML="";

    history.forEach(item=>{

        const div=document.createElement("div");

        div.className=
            item.status==="right"
            ? "history-item right"
            : "history-item wrong-item";

        div.innerHTML=
            `<span>
                ${item.emoji}
            </span>

            <span>
                ${item.answer}
            </span>

            <span>
                ${
                    item.status==="right"
                    ? "✔️"
                    : "❌"
                }
            </span>`;

        historyDiv.appendChild(div);
    });
}

/* ===========================
RESTART
=========================== */

function resetGame(){

    score=0;
    combo=0;
    lives=4;

    attempts=0;
    corrects=0;
    wrongs=0;

    history=[];

    updateStats();
}

function restartGame(){

    document.getElementById("scoreScreen").style.display="none";

    document.getElementById("startScreen") .style.display="flex"; 
     document.querySelector('.vatsal-related') ?.setAttribute('hidden','');
     const related = document.querySelector('.vatsal-related');
    if(related){
        related.setAttribute('hidden','');
        document.body.appendChild(related);
    }
}

/* ===========================
ENTER KEY
=========================== */

document.addEventListener("keydown",(e)=>{

    if(
        document.getElementById("gameScreen")
        .style.display!=="flex"
    ){
        return;
    }

    const index = Number(e.key)-1;

    if(index>=0 && index<currentOptions.length){

        const buttons = document.querySelectorAll(".option-btn");

        selectOption(currentOptions[index],buttons[index]);
    }
});