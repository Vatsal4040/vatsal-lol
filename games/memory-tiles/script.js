let mode="",gridSize=4,targets=new Set(),selected=new Set();
let clickable=false,mistakes=0,solved=0;
let timer=0,timerInt,startTime,totalTime=0;
let trainingLevel=0;
const HINT_FLASH_MS=600;
const HINT_COOLDOWN_S=5;
let hintReady=true,hintCooldownInt=null;
const grid=document.getElementById("grid");
const phaseEl=document.getElementById("phase");
const infoEl=document.getElementById("info");
const app=document.getElementById("app");
const startScreen=document.getElementById("startScreen");
const hintBtn=document.getElementById("hintBtn");

function useHint(){
    if(!clickable||!hintReady)return;
    const remaining=[...targets].filter(i=>!selected.has(i));
    if(remaining.length===0)return;
    remaining.forEach(i=>grid.children[i].classList.add("hint"));
    setTimeout(()=>{
        remaining.forEach(i=>{
            if(!selected.has(i))grid.children[i].classList.remove("hint");
        });
    },HINT_FLASH_MS);
    hintReady=false;
    let secs=HINT_COOLDOWN_S;
    hintBtn.disabled=true;
    hintBtn.textContent=`💡 ${secs}s`;
    hintCooldownInt=setInterval(()=>{
        secs--;
        if(secs<=0){
            clearInterval(hintCooldownInt);
            hintReady=true;
            hintBtn.disabled=false;
            hintBtn.textContent="💡 Hint";
        }else{
            hintBtn.textContent=`💡 ${secs}s`;
        }
    },1000);
}

function resetHint(){
    clearInterval(hintCooldownInt);
    hintReady=true;
    hintBtn.disabled=false;
    hintBtn.textContent="💡 Hint";
}
const overlay=document.getElementById("overlay");

function reset(){
    targets.clear();selected.clear();
    clickable=false;mistakes=0;
}
function buildGrid(){
    grid.innerHTML="";
    grid.style.gridTemplateColumns=`repeat(${gridSize},1fr)`;
    for(let i=0;i<gridSize*gridSize;i++){
        const t=document.createElement("div");
        t.className="tile";
        t.dataset.i=i;
        t.onclick=()=>clickTile(t);
        grid.appendChild(t);
    }
}
function targetCount(){
    if(gridSize==4)return 7+Math.floor(Math.random()*2);
    if(gridSize==5)return 10+Math.floor(Math.random()*3);
    return Math.floor(gridSize*gridSize*0.35);
}
function memoryPhase(ms){
    phaseEl.textContent="Memorize";
    clickable=false;
    while(targets.size<targetCount())
        targets.add(Math.floor(Math.random()*gridSize*gridSize));
    targets.forEach(i=>grid.children[i].classList.add("blue"));
    setTimeout(recallPhase,ms);
}
function recallPhase(){
    phaseEl.textContent="Recall";
    targets.forEach(i=>grid.children[i].classList.remove("blue"));
    clickable=true;
    startTime=performance.now();
    resetHint();
}
function revealAndNext(next){
    targets.forEach(i=>grid.children[i].classList.add("blue"));
    setTimeout(next,600);
}
function clickTile(tile){
    if(!clickable)return;
    const i=+tile.dataset.i;
    if(selected.has(i))return;
    selected.add(i);
    if(targets.has(i)){
        tile.classList.add("blue");
        if([...targets].every(t=>selected.has(t))){
            clickable=false;
            totalTime+=(performance.now()-startTime)/1000;
            solved++;
            revealAndNext(nextLevel);
        }
    }else{
        tile.classList.add("red");
        mistakes++;
        if(mistakes>=3){
            clickable=false;
            revealAndNext(nextLevel);
        }
    }
}
function nextLevel(){
    reset();
    if(mode==="braining" && solved>=5)gridSize=5;
    if(mode==="vivekanand"){
        if(solved<5)gridSize=5;
        else if(solved<10)gridSize=6;
        else if(solved<15)gridSize=7;
        else gridSize=8;
    }
    if(mode==="training"){
        trainingLevel++;
        if(trainingLevel>=10){endTraining();return;}
    }
    buildGrid();
    memoryPhase(mode==="vivekanand"?1500:3000);
}
function startBraining(){
    document.querySelector('.vatsal-related')
?.setAttribute('hidden','');
    document.body.classList.add("no-scroll");
    mode="braining";gridSize=4;solved=0;timer=60;totalTime=0;
   startScreen.style.display="none";
app.style.display="block";
    infoEl.textContent="Time: 60s | Solved: 0";
    timerInt=setInterval(()=>{
        timer--;infoEl.textContent=`Time: ${timer}s | Solved: ${solved}`;
        if(timer<=0)
    endBraining();
    },1000);
    nextLevel();
}
function endBraining(){
    // window.VatsalLolGameComplete?.();
    clearInterval(timerInt);
    document.body.classList.remove("no-scroll");
    document.querySelector('.vatsal-related')?.removeAttribute('hidden');
    app.style.display="none";
    overlay.style.display="flex";
    overlay.innerHTML=`
    <div class="panel">
        <h1>Results</h1>
        <div class="stat">Solved: ${solved}</div>
        <div class="stat">Avg Speed: ${(totalTime/Math.max(1,solved)).toFixed(2)}s</div>
        <div class="stat">Game-based cognitive score only</div>
        <button onclick="location.reload()">Restart</button>
    </div>`;
}
function openTraining(){

    document.querySelector(".instructions").innerHTML=`

    <h2>🎯 Training Mode</h2>

    <p>Select a grid size.</p>

    <p>Complete 10 rounds.</p>

    <div class="mode-grid">

        <button onclick="startTraining(4)">4×4</button>

        <button onclick="startTraining(5)">5×5</button>

        <button onclick="startTraining(6)">6×6</button>

        <button onclick="startTraining(7)">7×7</button>

    </div>

    `;
}
function startTraining(size){
    document
.querySelector('.vatsal-related')
?.setAttribute('hidden','');
    document.body.classList.add("no-scroll");
    mode="training";gridSize=size;trainingLevel=0;solved=0;totalTime=0;
    startScreen.style.display="none"; app.style.display="block";
    infoEl.textContent="Training Mode";
    nextLevel();
}
function endTraining(){
    // window.VatsalLolGameComplete?.();
    document.body.classList.remove("no-scroll");
    document.querySelector('.vatsal-related')?.removeAttribute('hidden');
    app.style.display="none";
    overlay.style.display="flex";
    overlay.innerHTML=`
    <div class="panel">
        <h1>Training Complete</h1>
        <div class="stat">Solved: ${solved}/10</div>
        <div class="stat">Total Time: ${totalTime.toFixed(2)}s</div>
        <button onclick="location.reload()">Back</button>
    </div>`;
}
function startVivekanand(){
    document
.querySelector('.vatsal-related')
?.setAttribute('hidden','');
    document.body.classList.add("no-scroll");
    mode="vivekanand";solved=0;timer=120;totalTime=0;
    startScreen.style.display="none";
app.style.display="block";
    infoEl.textContent="Time: 120s";
    timerInt=setInterval(()=>{
        timer--;infoEl.textContent=`Time: ${timer}s`;
        if(timer<=0)endVivekanand();
    },1000);
    nextLevel();
}
function endVivekanand(){

    // window.VatsalLolGameComplete?.();

    clearInterval(timerInt);
    document.body.classList.remove("no-scroll");
    document.querySelector('.vatsal-related')?.removeAttribute('hidden');

    overlay.style.display="flex";
    app.style.display="none";

    overlay.innerHTML=`
    <div class="panel result-panel">
        <h1>Vivekanand Results</h1>
        <div class="stat">Solved: ${solved}</div>
        <div class="stat">Average Speed: ${(totalTime/Math.max(1,solved)).toFixed(2)}s</div>
        <button onclick="location.reload()">Restart</button>
    </div>`;
}