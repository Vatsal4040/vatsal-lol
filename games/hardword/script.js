let WORDS = [
"ABLE","ACID","AGED","ALSO","ATOM","AUNT","AUTO","BAND","BANK","BATH",
"BEAR","BEND","BIRD","BLOW","BLUE","BOAT","BOND","BOWL","BULK","BURN",
"CALM","CAMP","CARD","CARE","CAST","CHAT","CHIP","CITY","CLUB","COAL",
"COAT","CODE","COLD","CORE","COST","CREW","CROP","CURE","DARK","DATE",
"DAWN","DEAL","DECK","DESK","DIAL","DIET","DISH","DOWN","DRAW","DROP",
"DUAL","DUST","DUTY","EACH","EARN","EAST","ECHO","EDGE","EVIL","EXAM",
"EXIT","FACE","FACT","FAIR","FARM","FAST","FATE","FEAR","FILE","FILM",
"FIND","FIRE","FIRM","FISH","FIVE","FLAG","FLAT","FLOW","FOLD","FORK",
"FORM","FORT","FOUR","FUEL","FUND","GAIN","GAME","GATE","GIFT","GIRL",
"GIVE","GLAD","GOAL","GOLD","GOLF","GRAY","GROW","HAIL","HAIR","HALE",
"HALF","HAND","HANG","HARD","HARE","HARM","HARP","HASH","HATE","HAWK",
"HAZE","HEAD","HEAL","HEAP","HEAT","HEIR","HELD","HELM","HELP","HERB",
"HERO","HIDE","HIKE","HILT","HIND","HINT","HIRE","HOAX","HOLD","HOLE",
"HOLY","HOME","HONE","HOPE","HORN","HOSE","HOST","HOUR","HOWL","HUGE",
"HULK","HUMP","HUNK","HUNT","HURL","HURT","HUSK","ICED","ICON","IDEA",
"IDLE","IDOL","IMPS","INTO","IRON","ITEM","JADE","JAIL","JOIN","JOKE",
"JOLT","JUMP","JUNK","JURY","JUST","KELP","KEPT","KEYS","KICK","KIDS",
"KILN","KILT","KIND","KING","KITE","KNOB","KNOT","LACE","LACK","LADS",
"LAIR","LAKE","LAMB","LAME","LAMP","LAND","LANE","LARD","LARK","LAST",
"LAWN","LEAD","LEAF","LEAN","LEAP","LEFT","LEND","LENS","LICE","LIED",
"LIES","LIFE","LIFT","LIKE","LIMB","LIME","LIMP","LIMO","LINE","LINK",
"LIPS","LISP","LIST","LIVE","LOAD","LOAF","LOAN","LOBE","LOCK","LODE",
"LOFT","LONE","LONG","LORD","LOSE","LOST","LOUD","LOVE","LUCK","LUMP",
"LUNG","LURE","LUSH","LUST","LUTE","LYNX","MACE","MADE","MAID","MAIL",
"MAIN","MAKE","MALE","MALT","MAPS","MARE","MARK","MARS","MASH","MASK",
"MAST","MATE","MAUL","MAZE","MEAL","MEAN","MEAT","MELD","MELT","MEND",
"MENU","MERE","MESH","MICE","MILD","MILE","MILK","MIND","MINE","MINT",
"MIRE","MIST","MOAN","MOAT","MOCK","MODE","MOLD","MONK","MORE","MOTH",
"MOVE","MUCH","MULE","MUSE","MUST","MUTE","NAIL","NAME","NAVY","NEAR",
"NEAT","NECK","NERD","NEST","NEWS","NEXT","NICE","NODE","NOSE","NOTE",
"NUDE","OATH","OPAL","OPEN","OPTS","ORAL","PACE","PACK","PAGE","PAID",
"PAIL","PAIN","PALE","PALM","PANE","PANG","PANS","PANT","PARK","PART",
"PATH","PEAK","PEAR","PEAS","PECK","PENS","PERK","PETS","PICK","PIER",
"PIES","PILE","PINE","PINK","PINT","PITS","PLAN","PLAY","PLEA","PLOT",
"PLOW","PLUG","PLUM","PLUS","POEM","POET","POKE","POLE","POND","PONY",
"PORE","PORK","PORT","POSE","POST","POUR","PRAY","PREY","PROD","PROM",
"PROS","PULS","PUNK","PURE","PUSH","QUIT","QUIZ","RACE","RAGE","RAID",
"RAIL","RAIN","RAKE","RAMP","RANG","RANK","RASH","RATE","RAYS","READ",
"REAL","REAP","REIN","RELY","RENT","REST","RIBS","RICE","RICH","RIDE",
"RIFE","RIFT","RIGS","RIMS","RING","RINK","RIOT","RIPE","RISE","RISK",
"ROAD","ROAM","ROBE","ROCK","RODE","ROLE","ROPE","ROSE","ROTS","ROWS",
"RUBS","RUDE","RUGS","RULE","RUMP","RUNG","RUST","SACK","SAFE","SAGE",
"SAID","SAIL","SALE","SALT","SAND","SAVE","SCAN","SCAR","SEAL","SEAM",
"SEAT","SELF","SEND","SENT","SHED","SHIP","SHOE","SHOP","SHOT","SHOW",
"SHUT","SICK","SIDE","SIGH","SIGN","SILK","SILO","SILT","SING","SINK",
"SITE","SIZE","SKID","SKIM","SKIN","SKIP","SKIT","SLAB","SLAM","SLAP",
"SLAT","SLAY","SLED","SLID","SLIM","SLIP","SLIT","SLOB","SLOG","SLOP",
"SLOT","SLOW","SLUG","SLUM","SLUR","SNAG","SNAP","SNOB","SNOW","SOAK",
"SOAP","SOFA","SOIL","SOLD","SOLE","SOME","SONG","SORE","SORT","SOUL",
"SOUP","SOUR","SPAN","SPAR","SPAT","SPIN","SPIT","SPRY","SPUR","STAB",
"STAR","STAY","STEM","STEW","STIR","STOP","STUB","STUD","STUN","SUCH",
"SUED","SUIT","SUNK","SURE","SWAB","SWAN","SWAP","SWAT","SWAY","SWIG",
"SWIM","TACK","TACO","TAIL","TAKE","TALE","TALK","TANK","TAPE","TARP",
"TARS","TASK","TEAM","TEAR","TECH","TEND","TENS","TERM","TERN","TEXT",
"THAN","THAW","THEM","THEN","THIN","THIS","THUD","THUG","THUS","TICK",
"TIDE","TIDY","TIED","TIER","TILE","TIME","TINS","TINY","TIPS","TOAD",
"TOIL","TOLD","TONE","TONS","TOPS","TORE","TORN","TOUR","TOWN","TOYS",
"TRAM","TRAP","TRAY","TREK","TRIM","TRIP","TROD","TRUE","TUBE","TUCK",
"TUNA","TUNE","TURF","TURN","TWIG","TWIN","TYPE","UGLY","UNDO","UNIT",
"UPON","URGE","USED","USER","VAIN","VARY","VAST","VEIL","VEIN","VENT",
"VERB","VERY","VEST","VETO","VIAL","VICE","VIEW","VINE","VISA","VOID",
"VOTE","WAGE","WAGS","WAIL","WAIT","WAKE","WALK","WAND","WANE","WANT",
"WARD","WARM","WARN","WARP","WARS","WASH","WAVE","WAVY","WAYS","WEAK",
"WEAR","WEDS","WELD","WEPT","WEST","WHIM","WHIP","WHIT","WICK","WIDE",
"WIFE","WILD","WILT","WILY","WIND","WINE","WING","WINK","WIPE","WIRE",
"WISE","WISH","WITH","WOES","WOKE","WOLF","WORD","WORE","WORK","WORM",
"WORN","WRAP","YARD","YARN","YEAR","YELP","YETI","YOGA","YOLK","ZEAL",
"ZEST","ZINC","ZONE"
];
WORDS = WORDS.filter(w => new Set(w).size === 4);

const MAX = 8;

let pool = [...WORDS], i = 0;
let target = "", row = 0, guess = "", over = false;
let mode = "infinite";

const STORAGE_KEY_DAILY = "hardword_daily";
const STORAGE_KEY_STATS = "hardword_stats";

/* ✅ KEYBOARD MEMORY */
let usedLetters = new Set();

/* ✅ DUPLICATE GUESS TRACKING */
let guessedWords = new Set();

function shuffle(a){
    for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
    }
}
shuffle(pool);

function nextWord(){
    if(i>=pool.length){ shuffle(pool); i=0; }
    return pool[i++];
}

function startGame(m){

    mode = m || "infinite";

    try{

        document.getElementById("landing").style.display="none";
        document.getElementById("game-app").style.display="grid";

        const modeLabel = document.getElementById("modeLabel");
        if(modeLabel){
            modeLabel.textContent = mode === "daily" ? "DAILY HARDWORD" : "INFINITE HARDWORD";
        }
        const statsBtn = document.getElementById("statsBtn");
        if(statsBtn) statsBtn.classList.add("show");

        const nextBtn =
            document.getElementById("nextBtn");

        if(nextBtn){
            nextBtn.style.display =
                mode === "daily"
                ? "none"
                : "";
        }

        if(mode === "daily"){
            initDaily();
        }else{
            resetGame();
        }

    }catch(err){

        document.getElementById("landing").style.display="flex";
        document.getElementById("game-app").style.display="none";

        throw err;
    }
}
function resetGame(){
    target = nextWord();
    row = 0;
    guess = "";
    over = false;

  usedLetters.clear();
    guessedWords.clear();
    resetKeyboard();

    document.getElementById("answerBar").textContent="";
    document.getElementById("nextBtn").classList.remove("show");
    document.getElementById("resultScreen")?.classList.remove("show");
    document.body.classList.remove("result-active");
    buildBoard();
}

function nextWordGame(){ resetGame(); }

function buildBoard(){
    const b=document.getElementById("board");
    b.innerHTML="";
    for(let r=0;r<MAX;r++){
        const rowDiv=document.createElement("div");
        rowDiv.className="guess-row";
        for(let c=0;c<4;c++){
            const box=document.createElement("div");
            box.className="letter-box";
            box.id=`c-${r}-${c}`;
            rowDiv.appendChild(box);
        }
        const s=document.createElement("div");
        s.className="score-container";
        s.innerHTML=`<div class="score" id="g-${r}"></div><div class="score" id="y-${r}"></div>`;
        rowDiv.appendChild(s);
        b.appendChild(rowDiv);
    }
}

function updateRow(){
    for(let i=0;i<4;i++){
        document.getElementById(`c-${row}-${i}`).textContent=guess[i]||"";
    }
}

function submit(){
    if(guess.length!==4 || over) {
        shakeCurrentRow();
        return;
    }
    if(!WORDS.includes(guess)) {
        shakeCurrentRow();
        return;
    }
    if(new Set(guess).size !== 4) {
        shakeCurrentRow();
        return;
    }
    if(guessedWords.has(guess)) {
        shakeCurrentRow();
        return;
    }

    guessedWords.add(guess);

    for(const letter of guess){
        if(!usedLetters.has(letter)){
            usedLetters.add(letter);
            muteKey(letter);
        }
    }

    let g=0,y=0;
    for(let i=0;i<4;i++){
        if(guess[i]===target[i]) g++;
        else if(target.includes(guess[i])) y++;
    }

    document.getElementById(`g-${row}`).textContent=g;
    document.getElementById(`y-${row}`).textContent=y;
    if(g) document.getElementById(`g-${row}`).classList.add("green");
    if(y) document.getElementById(`y-${row}`).classList.add("yellow");

    if(mode === "daily"){
        saveDailyGuess(guess, g, y);
    }

    if(g===4 || row===MAX-1){
        const win = (g===4);
        over=true;

        if(mode === "daily"){
            finishDaily(win);
        } else {
            updateStats(win, row);
            showResultScreen(win, { target, win, row, date: getISTDateString() });
        }

        // window.VatsalLolGameComplete?.();
        return;
    }

    row++;
    guess="";

    if(mode === "daily"){
        updateDailyProgress();
    }
}

function shakeCurrentRow(){
    const rows = document.querySelectorAll(".guess-row");
    const activeRow = rows[row];
    if(!activeRow) return;
    activeRow.classList.remove("shake");
    void activeRow.offsetWidth;
    activeRow.classList.add("shake");
    setTimeout(()=>activeRow.classList.remove("shake"), 280);
}

function input(k){
    if(over) return;
    if (k === "ENTER" || k === "ENT") submit();
    else if(k==="⌫"){
        guess = guess.slice(0,-1);
        updateRow();
    }
    else if(/^[A-Z]$/.test(k) && guess.length<4){
        guess += k;
        updateRow();
    }
}

/* ===== KEYBOARD HELPERS ===== */
function muteKey(letter){
    document.querySelectorAll(".key").forEach(k=>{
        if(k.textContent === letter){
            k.classList.add("used");
        }
    });
}

function resetKeyboard(){
    document.querySelectorAll(".key").forEach(k=>{
        k.classList.remove("used");
    });
}

document.querySelectorAll(".key").forEach(k=>k.onclick=()=>input(k.textContent));
document.addEventListener("keydown", e => {
    if (e.key === "Backspace") {
        input("⌫");
    } else if (e.key === "Enter") {
        input("ENTER");
    } else if (/^[a-zA-Z]$/.test(e.key)) {
        input(e.key.toUpperCase());
    }
})
/* ===== IST DATE HELPERS ===== */
function getISTDateString(){
    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istMs = utcMs + (5.5 * 60 * 60 * 1000);
    return new Date(istMs).toISOString().slice(0,10);
    /* ===== MOBILE NATIVE KEYBOARD SUPPORT ===== */
(function(){
    const mobileInput = document.getElementById("mobile-input");
    if(!mobileInput) return;

    // Focus hidden input when tapping game area (not keys, which handle themselves)
    document.getElementById("game-app")?.addEventListener("click", function(e){
        if(!over && !e.target.classList.contains("key")){
            mobileInput.focus();
        }
    });

    mobileInput.addEventListener("input", function(){
        const val = mobileInput.value.toUpperCase().replace(/[^A-Z]/g,"");
        mobileInput.value = "";
        if(val) input(val[val.length - 1]);
    });

    mobileInput.addEventListener("keydown", function(e){
        if(e.key === "Enter"){ input("ENTER"); e.preventDefault(); }
        if(e.key === "Backspace"){ input("⌫"); }
    });
})();
}

function getMsUntilNextISTReset(){
    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istMs = utcMs + (5.5 * 60 * 60 * 1000);
    const ist = new Date(istMs);
    const next = new Date(ist);
    next.setHours(24,0,0,0);
    return next.getTime() - ist.getTime();
}

/* ===== DAILY WORD SELECTION ===== */
function getDailyWord(dateStr){
    let hash = 0;
    for(let i=0;i<dateStr.length;i++){
        hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
    }
    return WORDS[hash % WORDS.length];
}
/* ===== DAILY MODE ===== */
function loadDailyState(){
    let saved = null;
    try{ saved = JSON.parse(localStorage.getItem(STORAGE_KEY_DAILY)); }catch(e){ saved = null; }

    const today = getISTDateString();
    if(!saved || saved.date !== today){
        saved = { date: today, target: getDailyWord(today), row:0, guesses:[], usedLetters:[], over:false, win:false };
        localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(saved));
    }
    return saved;
}

function initDaily(){
    const saved = loadDailyState();

    target = saved.target;
    row = saved.row;
    guess = "";
    over = saved.over;
    usedLetters = new Set(saved.usedLetters);
    guessedWords = new Set(saved.guesses.map(g => g.word));

    buildBoard();
    resetKeyboard();
    document.getElementById("answerBar").textContent="";
    document.getElementById("resultScreen")?.classList.remove("show");
    document.body.classList.remove("result-active");

    saved.guesses.forEach((g, idx)=>{
        for(let c=0;c<4;c++){
            document.getElementById(`c-${idx}-${c}`).textContent = g.word[c];
        }
        const gEl = document.getElementById(`g-${idx}`);
        const yEl = document.getElementById(`y-${idx}`);
        gEl.textContent = g.g;
        yEl.textContent = g.y;
        if(g.g) gEl.classList.add("green");
        if(g.y) yEl.classList.add("yellow");
    });

    usedLetters.forEach(l => muteKey(l));

    if(over){
        showResultScreen(saved.win, saved);
    }
}

function saveDailyGuess(word, g, y){
    const saved = loadDailyState();
    saved.guesses.push({ word, g, y });
    saved.usedLetters = Array.from(usedLetters);
    saved.row = row;
    localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(saved));
}

function updateDailyProgress(){
    const saved = loadDailyState();
    saved.row = row;
    localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(saved));
}

function finishDaily(win){
    const saved = loadDailyState();
    saved.over = true;
    saved.win = win;
    saved.row = row;
    localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(saved));

    updateStats(win, row);
    showResultScreen(win, saved);
}
/* ===== STATISTICS ===== */
function loadStats(){
    let stats = null;
    try{ stats = JSON.parse(localStorage.getItem(STORAGE_KEY_STATS)); }catch(e){ stats = null; }
    if(!stats){
        stats = { played:0, wins:0, currentStreak:0, maxStreak:0, distribution:[0,0,0,0,0,0,0,0], lastPlayedDate:"" };
    }
    return stats;
}

function updateStats(win, rowIndex){
    if(mode !== "daily") return; // Infinite mode does not affect stats

    const stats = loadStats();
    const today = getISTDateString();

    if(stats.lastPlayedDate === today) return; // already counted today

    stats.played += 1;
    if(win){
        stats.wins += 1;
        stats.currentStreak += 1;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        stats.distribution[rowIndex] += 1;
    } else {
        stats.currentStreak = 0;
    }
    stats.lastPlayedDate = today;

    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
}
/* ===== SHARE RESULTS ===== */
function shareResults(){
    const saved = loadDailyState();
    const lines = [];
    lines.push(`HARDWORD ${saved.date}`);
    lines.push(saved.win ? `${saved.row + 1}/${MAX}` : `X/${MAX}`);
    lines.push("");

    saved.guesses.forEach(rec=>{
        const greens = "🟢".repeat(rec.g);
        const yellows = "🟡".repeat(rec.y);
        const grays = "⚪".repeat(4 - rec.g - rec.y);
        lines.push(greens + yellows + grays);
    });

    const text = lines.join("\n");

    if(navigator.share){
        navigator.share({ text }).catch(()=>{ copyToClipboard(text); });
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text){
    navigator.clipboard?.writeText(text).then(()=>{
        const btn = document.getElementById("shareBtn");
        if(btn){
            const original = btn.textContent;
            btn.textContent = "COPIED!";
            setTimeout(()=>{ btn.textContent = original; }, 1500);
        }
    });
}
/* ===== RESULT SCREEN ===== */
function showResultScreen(win, saved){
    const panel = document.getElementById("resultScreen");
    if(!panel) return;

    document.getElementById("resultTitle").textContent = win ? "🎉 SOLVED" : "❌ GAME OVER";
    document.getElementById("resultAnswer").innerHTML = `Answer: <strong>${saved.target}</strong>`;

    panel.classList.remove("mode-daily", "mode-infinite");
    panel.classList.add(mode === "daily" ? "mode-daily" : "mode-infinite");

    panel.classList.add("show");
    document.body.classList.add("result-active");

    if(mode === "daily"){
        startCountdown("countdown");
    } else {
        stopCountdown();
    }
}

let countdownTimer = null;
function startCountdown(targetId){
    const el = document.getElementById(targetId);
    if(!el) return;
    stopCountdown();

    function tick(){
        const ms = getMsUntilNextISTReset();
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        el.textContent = `Next HARDWORD in ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
}

function stopCountdown(){
    if(countdownTimer){
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}

/* ===== STATS MODAL ===== */
function openStatsModal(){
    const stats = loadStats();
    document.getElementById("modalPlayed").textContent = stats.played;
    document.getElementById("modalWinPct").textContent = stats.played ? Math.round((stats.wins/stats.played)*100) : 0;
    document.getElementById("modalStreak").textContent = stats.currentStreak;
    document.getElementById("modalMaxStreak").textContent = stats.maxStreak;
    document.getElementById("statsModal")?.classList.add("show");
}

function closeStatsModal(){
    document.getElementById("statsModal")?.classList.remove("show");
}
/* ===== LANDING DAILY STATUS ===== */
(function(){
    const saved = loadDailyState();
    const statusEl = document.getElementById("dailyStatus");
    if(!statusEl) return;

  if(saved.over){
        statusEl.innerHTML = `
            <div class="completed-today">
                <strong>Completed Today</strong>
                <div class="result-answer">Come back tomorrow</div>
                <div class="countdown" id="landingCountdown">Next HARDWORD in --:--:--</div>
            </div>
        `;
        startCountdown("landingCountdown");
    }
})();