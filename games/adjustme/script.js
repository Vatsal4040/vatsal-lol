/* ========================== SEEDED RNG ========================== */
function mkRng(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ========================== PUZZLE GENERATOR ========================== */
function generatePuzzle(width, height, seed){
  const rng = mkRng(seed);
  const grid = Array.from({length:height}, () => new Array(width).fill(-1));
  const regions = [];
  let rid = 0;

  for(let attempt = 0; attempt < 3000; attempt++){
    let fr=-1, fc=-1;
    outer: for(let r=0;r<height;r++) for(let c=0;c<width;c++) if(grid[r][c]===-1){fr=r;fc=c;break outer;}
    if(fr===-1) break;

    let maxW = 0;
    for(let c=fc;c<width;c++){if(grid[fr][c]!==-1)break; maxW++;}

    let maxH = 0;
    for(let r=fr;r<height;r++){
      let ok=true;
      for(let c=fc;c<fc+maxW;c++) if(grid[r][c]!==-1){ok=false;break;}
      if(!ok) break;
      maxH++;
    }
// pick w and h, but never both 1 (no 1×1 cells)
    // If only a 1×1 gap remains, skip it — generator will fail → return null
    if(maxW === 1 && maxH === 1) continue;
    let w, h;
    do {
      w = 1 + Math.floor(rng() * maxW);
      h = 1 + Math.floor(rng() * maxH);
    } while(w === 1 && h === 1);

    let valid = true;
    for(let r=fr;r<fr+h&&valid;r++) for(let c=fc;c<fc+w;c++) if(grid[r][c]!==-1){valid=false;break;}
    if(!valid) continue;

    for(let r=fr;r<fr+h;r++) for(let c=fc;c<fc+w;c++) grid[r][c]=rid;

    const clueR = fr + Math.floor(rng() * h);
    const clueC = fc + Math.floor(rng() * w);
    regions.push({id:rid, r:fr, c:fc, w, h, clueR, clueC, area:w*h});
    rid++;
  }

  for(let r=0;r<height;r++) for(let c=0;c<width;c++) if(grid[r][c]===-1) return null;
  if(regions.length < 2) return null;

  return {
    width, height,
    clues: regions.map(reg=>({r:reg.clueR, c:reg.clueC, v:reg.area})),
    solution: regions.map(reg=>({r:reg.r, c:reg.c, w:reg.w, h:reg.h}))
  };
}

/* ========================== BUILD BANKS ========================== */
const BANK = {easy:[], normal:[], hard:[], expert:[], master:[], grandmaster:[], daily:[]};

// tier config: [w, h, prefix, seedBase, count per size]
const TIER_CONFIG = {
  easy:   [ [[4,4],[4,5],[4,6]], 'E', 1000, 20 ],
  normal: [ [[5,5],[5,6],[5,7]], 'N', 2000, 20 ],
  hard:   [ [[6,6],[6,7],[7,7]], 'H', 3000, 20 ],
  expert: [ [[7,8],[8,8],[9,9]], 'X', 4000, 15 ],
  master: [ [[10,10],[10,12],[12,12]],'M', 5000, 15 ],
  grandmaster:[ [[14,14],[15,15]],'G', 6000, 10 ],
};

(function(){
  Object.entries(TIER_CONFIG).forEach(([tier,[sizes,prefix,seedBase,perSize]])=>{
    sizes.forEach(([w,h],si)=>{
      let filled=0, i=0;
      const seed0=seedBase + si*500;
      while(filled<perSize && i<perSize*4){
        const p=generatePuzzle(w,h,seed0+i);
        if(p){
          const n=BANK[tier].length+1;
          p.id=prefix+w+''+h+'-'+String(n).padStart(3,'0');
          BANK[tier].push(p);
          filled++;
        }
        i++;
      }
    });
  });

  // Daily — rotate through a variety of sizes
  const epoch=new Date('2025-01-01').getTime();
  const dayNum=Math.floor((Date.now()-epoch)/(1000*60*60*24));
  const dailySizes=[[4,4],[4,5],[5,5],[5,6],[6,6],[6,7],[7,7]];
  const[dw,dh]=dailySizes[dayNum%dailySizes.length];
  for(let i=0;i<100;i++){
    const p=generatePuzzle(dw,dh,9000+dayNum+i);
    if(p){
      const d=new Date();
      p.id='DAILY-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
      BANK.daily.push(p);
      break;
    }
  }
  console.log('Banks: easy='+BANK.easy.length+' normal='+BANK.normal.length+' hard='+BANK.hard.length+' expert='+BANK.expert.length);
})();

/* ========================== STATE ========================== */
const REGION_COLORS=['region-1','region-2','region-3','region-4','region-5','region-6','region-7','region-8'];

let currentPool=[], currentPoolIndex=0, currentMode='easy', puzzle=null;
let selectedStart=null, selectedRegion=null, regions=[], regionCounter=0, history=[];
let hintsLeft=1, assistedThisPuzzle=false;

/* ========================== STATS ========================== */
function loadStats(){try{return JSON.parse(localStorage.getItem('adjustme_stats')||'{}');}catch{return {};}}
function isMasterUnlocked(){
  const s=loadStats();
  return (s.hardSolved||0)>=5;
}
function saveStats(s){try{localStorage.setItem('adjustme_stats',JSON.stringify(s));}catch{}}

function renderStats(){
  const s=loadStats();
  document.getElementById('statSolved').textContent=s.solved||0;
  document.getElementById('statStreak').textContent=s.streak||0;
  document.getElementById('statBest').textContent=s.best||0;
 document.getElementById('statDaily').textContent=s.daily||0;
  document.getElementById('statAssisted').textContent=s.assisted||0;
}

function recordSolve(isDaily){
  const s=loadStats();
  s.solved=(s.solved||0)+1;
  if(isDaily) s.daily=(s.daily||0)+1;
  if(assistedThisPuzzle) s.assisted=(s.assisted||0)+1;
  if(['hard','expert','master','grandmaster'].includes(currentMode)) s.hardSolved=(s.hardSolved||0)+1;
  const today=new Date().toDateString();
  const yesterday=new Date(Date.now()-86400000).toDateString();
  if(s.lastSolve===yesterday) s.streak=(s.streak||0)+1;
  else if(s.lastSolve!==today) s.streak=1;
  s.lastSolve=today;
  s.best=Math.max(s.best||0,s.streak||1);
  saveStats(s);
}

/* ========================== SCREEN NAV ========================== */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active');s.classList.add('hidden');});
  const el=document.getElementById(id);
  el.classList.remove('hidden');
  el.classList.add('active');
  document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
}

/* ========================== START SCREEN ========================== */
const freePlayBtn=document.getElementById('freePlayBtn');
const difficultyPanel=document.getElementById('difficultyPanel');

freePlayBtn.addEventListener('click',()=>{
  const hidden=difficultyPanel.classList.contains('hidden');
  if(hidden){difficultyPanel.classList.remove('hidden');freePlayBtn.textContent='Free Play \u25b2';}
  else{difficultyPanel.classList.add('hidden');freePlayBtn.textContent='Free Play';}
});

document.querySelectorAll('.difficulty-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const mode=btn.dataset.difficulty;
    if((mode==='master'||mode==='grandmaster') && !isMasterUnlocked()){
      alert('Complete 5 puzzles in Hard, Expert, Master, or Grandmaster first!');
      return;
    }
    currentMode=mode;
    currentPool=BANK[currentMode].slice().sort(()=>Math.random()-0.5);
    currentPoolIndex=0;
    if(!currentPool.length){alert('No puzzles available for this difficulty.');return;}
    startGame(currentPool[0]);
  });
});

document.getElementById('dailyBtn').addEventListener('click',()=>{
  currentMode='daily';
  currentPool=BANK.daily.slice();
  currentPoolIndex=0;
  if(!currentPool.length){alert('No daily puzzle today.');return;}
  startGame(currentPool[0]);
});

document.getElementById('statsBtn').addEventListener('click',()=>{renderStats();showScreen('statsScreen');});
document.getElementById('howToPlayBtn').addEventListener('click',()=>showScreen('howToPlayScreen'));
document.getElementById('closeHowToPlay').addEventListener('click',()=>showScreen('startScreen'));
document.getElementById('closeStats').addEventListener('click',()=>showScreen('startScreen'));
document.getElementById('homeBtn').addEventListener('click',()=>{
  showScreen('startScreen');
  freePlayBtn.textContent='Free Play';
  difficultyPanel.classList.add('hidden');
});

/* ========================== GAME ========================== */
function startGame(p){
  puzzle=p;
  selectedStart=null; selectedRegion=null;
  regions=[]; regionCounter=0; history=[];
  document.getElementById('eraseBtn').disabled=true;
  hintsLeft=1;
  assistedThisPuzzle=false;
  document.getElementById('hintBtn').disabled=false;
  document.getElementById('hintBtn').textContent='Hint (1)';
  document.querySelectorAll('.hint-outline').forEach(c=>c.classList.remove('hint-outline'));
  document.querySelectorAll('.check-correct,.check-wrong').forEach(c=>c.classList.remove('check-correct','check-wrong'));
  // document.getElementById('puzzleId').textContent=puzzle.id;).textContent=puzzle.id;
  document.getElementById('message').textContent='';
  document.getElementById('progress').textContent='0%';
  renderGrid();
  showScreen('gameScreen');
}

function renderGrid(){
  const grid=document.getElementById('grid');
  grid.innerHTML='';
  grid.style.gridTemplateColumns='repeat('+puzzle.width+',1fr)';
  const clueMap={};
  puzzle.clues.forEach(cl=>{clueMap[cl.r+'-'+cl.c]=cl.v;});
  for(let r=0;r<puzzle.height;r++){
    for(let c=0;c<puzzle.width;c++){
      const cell=document.createElement('div');
      cell.className='cell';
      cell.dataset.row=r;
      cell.dataset.col=c;
      const v=clueMap[r+'-'+c];
      if(v){cell.textContent=v;cell.classList.add('clue');}
      cell.addEventListener('click',handleCellClick);
      grid.appendChild(cell);
    }
  }
}

function handleCellClick(e){
  const row=Number(e.currentTarget.dataset.row);
  const col=Number(e.currentTarget.dataset.col);
  if(!selectedStart){
    selectedStart={row,col};
    clearPreview();
    e.currentTarget.classList.add('preview');
    return;
  }
  createRegion(selectedStart.row,selectedStart.col,row,col);
  selectedStart=null;
  clearPreview();
}

/* drag-to-draw: touchstart sets anchor, touchend on release fires finish */
let dragAnchor=null;

document.getElementById('grid').addEventListener('touchstart',e=>{
  e.preventDefault();
  const touch=e.changedTouches[0];
  const el=document.elementFromPoint(touch.clientX,touch.clientY);
  if(!el||!el.classList.contains('cell')) return;
  dragAnchor={row:Number(el.dataset.row),col:Number(el.dataset.col)};
  clearPreview();
  el.classList.add('preview');
},{passive:false});

document.getElementById('grid').addEventListener('touchmove',e=>{
  e.preventDefault();
  if(!dragAnchor) return;
  const touch=e.changedTouches[0];
  const el=document.elementFromPoint(touch.clientX,touch.clientY);
  if(!el||!el.classList.contains('cell')) return;
  // show live preview highlight
  clearPreview();
  const r1=Math.min(dragAnchor.row,Number(el.dataset.row));
  const r2=Math.max(dragAnchor.row,Number(el.dataset.row));
  const c1=Math.min(dragAnchor.col,Number(el.dataset.col));
  const c2=Math.max(dragAnchor.col,Number(el.dataset.col));
  for(let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++) getCell(r,c).classList.add('preview');
},{passive:false});

document.getElementById('grid').addEventListener('touchend',e=>{
  e.preventDefault();
  if(!dragAnchor) return;
  const touch=e.changedTouches[0];
  const el=document.elementFromPoint(touch.clientX,touch.clientY);
  clearPreview();
  if(el&&el.classList.contains('cell')){
    createRegion(dragAnchor.row,dragAnchor.col,Number(el.dataset.row),Number(el.dataset.col));
  }
  dragAnchor=null;
  selectedStart=null;
},{passive:false});

function createRegion(r1,c1,r2,c2){
  const startRow=Math.min(r1,r2),endRow=Math.max(r1,r2);
  const startCol=Math.min(c1,c2),endCol=Math.max(c1,c2);
  const cells=[];
  for(let r=startRow;r<=endRow;r++){
    for(let c=startCol;c<=endCol;c++){
      if(findRegionAtCell(r,c)) return;
      cells.push({r,c});
    }
  }
  regionCounter++;
  const colorClass=REGION_COLORS[(regionCounter-1)%REGION_COLORS.length];
  const region={id:regionCounter,colorClass,cells};
  history.push({type:'add',region});
  regions.push(region);
  paintRegion(region);
  updateProgress();
  // clear any hint outlines covered by this region
  region.cells.forEach(cd=>getCell(cd.r,cd.c).classList.remove('hint-outline'));
  document.getElementById('undoBtn').disabled=false;
}

function paintRegion(region){
  region.cells.forEach(cd=>{
    const cell=getCell(cd.r,cd.c);
    cell.classList.add(region.colorClass);
    cell.dataset.regionId=region.id;
    cell.addEventListener('click',regionSelectHandler);
  });
}

function regionSelectHandler(e){
  e.stopPropagation();
  clearSelectedRegion();
  const rid=Number(e.currentTarget.dataset.regionId);
  selectedRegion=regions.find(r=>r.id===rid);
  if(!selectedRegion) return;
  selectedRegion.cells.forEach(cd=>getCell(cd.r,cd.c).classList.add('selected-region'));
  document.getElementById('eraseBtn').disabled=false;
}

function clearSelectedRegion(){
  document.querySelectorAll('.selected-region').forEach(c=>c.classList.remove('selected-region'));
}

function eraseRegion(region){
  region.cells.forEach(cd=>{
    const cell=getCell(cd.r,cd.c);
    cell.classList.remove(region.colorClass,'selected-region');
    delete cell.dataset.regionId;
  });
  regions=regions.filter(r=>r.id!==region.id);
  updateProgress();
}

document.getElementById('eraseBtn').addEventListener('click',()=>{
  if(!selectedRegion) return;
  history.push({type:'erase',region:selectedRegion});
  eraseRegion(selectedRegion);
  selectedRegion=null;
  document.getElementById('eraseBtn').disabled=true;
  document.getElementById('undoBtn').disabled=history.length===0;
});

document.getElementById('restartBtn').addEventListener('click',()=>{
  startGame(puzzle);
});

document.getElementById('nextBtn').addEventListener('click',()=>{
  if(!currentPool.length) return;
  currentPoolIndex=(currentPoolIndex+1)%currentPool.length;
  startGame(currentPool[currentPoolIndex]);
});

/* ========================== PROGRESS & VALIDATE ========================== */
function updateProgress(){
  const filled=regions.reduce((s,r)=>s+r.cells.length,0);
  const total=puzzle.width*puzzle.height;
  const pct=Math.round((filled/total)*100);
  document.getElementById('progress').textContent=pct+'%';
  if(pct===100) validatePuzzle();
}

function validatePuzzle(){
  const playerRegions=regions.map(region=>{
    const rows=region.cells.map(c=>c.r), cols=region.cells.map(c=>c.c);
    return{r:Math.min(...rows),c:Math.min(...cols),w:Math.max(...cols)-Math.min(...cols)+1,h:Math.max(...rows)-Math.min(...rows)+1};
  });
  const correct=puzzle.solution.every(sol=>playerRegions.some(pr=>pr.r===sol.r&&pr.c===sol.c&&pr.w===sol.w&&pr.h===sol.h));
  if(correct){
    recordSolve(currentMode==='daily');
    showSuccessOverlay();
  } else {
    document.getElementById('message').textContent='\u274c Not quite — keep adjusting.';
  }
}

/* ========================== SUCCESS ========================== */
function showSuccessOverlay(){
  const s=loadStats();
  document.getElementById('successMsg').textContent=
    currentMode==='daily'?'Daily streak: '+(s.streak||1)+' \uD83D\uDD25':'Puzzles solved: '+(s.solved||1);
  document.getElementById('successOverlay').classList.add('show');
}

document.getElementById('playNextBtn').addEventListener('click',()=>{
  document.getElementById('successOverlay').classList.remove('show');
  if(currentMode==='daily'){showScreen('startScreen');return;}
  currentPoolIndex=(currentPoolIndex+1)%currentPool.length;
  startGame(currentPool[currentPoolIndex]);
});

document.getElementById('backHomeBtn').addEventListener('click',()=>{
  document.getElementById('successOverlay').classList.remove('show');
  showScreen('startScreen');
  freePlayBtn.textContent='Free Play';
  difficultyPanel.classList.add('hidden');
});

/* ========================== HELPERS ========================== */
function findRegionAtCell(r,c){return regions.find(region=>region.cells.some(cell=>cell.r===r&&cell.c===c));}
function getCell(r,c){return document.querySelector('[data-row="'+r+'"][data-col="'+c+'"]');}
function clearPreview(){document.querySelectorAll('.preview').forEach(c=>c.classList.remove('preview'));}

/* HINT — outline one unplaced solution region */
document.getElementById('hintBtn').addEventListener('click',()=>{
  if(hintsLeft<=0) return;
  const unplaced=puzzle.solution.filter(sol=>
    !regions.some(pr=>{
      const rows=pr.cells.map(c=>c.r),cols=pr.cells.map(c=>c.c);
      return Math.min(...rows)===sol.r&&Math.min(...cols)===sol.c&&
             Math.max(...cols)-Math.min(...cols)+1===sol.w&&
             Math.max(...rows)-Math.min(...rows)+1===sol.h;
    })
  );
  if(!unplaced.length) return;
  const sol=unplaced[Math.floor(Math.random()*unplaced.length)];
  for(let r=sol.r;r<sol.r+sol.h;r++){
    for(let c=sol.c;c<sol.c+sol.w;c++){
      getCell(r,c).classList.add('hint-outline');
    }
  }
  hintsLeft--;
  assistedThisPuzzle=true;
  document.getElementById('hintBtn').disabled=true;
  document.getElementById('hintBtn').textContent='Hint (0)';
});

/* CHECK — green = correct placement, red = wrong */
document.getElementById('checkBtn').addEventListener('click',()=>{
  assistedThisPuzzle=true;
  document.querySelectorAll('.check-correct,.check-wrong').forEach(c=>c.classList.remove('check-correct','check-wrong'));
  regions.forEach(region=>{
    const rows=region.cells.map(c=>c.r),cols=region.cells.map(c=>c.c);
    const pr={r:Math.min(...rows),c:Math.min(...cols),
              w:Math.max(...cols)-Math.min(...cols)+1,
              h:Math.max(...rows)-Math.min(...rows)+1};
    const ok=puzzle.solution.some(sol=>sol.r===pr.r&&sol.c===pr.c&&sol.w===pr.w&&sol.h===pr.h);
    region.cells.forEach(cd=>getCell(cd.r,cd.c).classList.add(ok?'check-correct':'check-wrong'));
  });
  setTimeout(()=>{
    document.querySelectorAll('.check-correct,.check-wrong').forEach(c=>c.classList.remove('check-correct','check-wrong'));
  },1500);
});