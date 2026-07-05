// ---------------- STATE ----------------
let selectedSymbol=null;
let difficulty="easy";
let player, ai, turn, boardArr;
let gameOver=false;

// AVATARS
const avatars=[
"https://i.pravatar.cc/150?img=1",
"https://i.pravatar.cc/150?img=2",
"https://i.pravatar.cc/150?img=3",
"https://i.pravatar.cc/150?img=15",
"https://i.pravatar.cc/150?img=20",
"https://i.pravatar.cc/150?img=30"
];

// ---------------- SELECTION ----------------
function selectSymbol(sym){
  selectedSymbol=sym;
  document.querySelectorAll("[data-symbol]").forEach(btn=>{
    const isSel=btn.dataset.symbol===sym;
    btn.classList.toggle("selected",isSel);
    btn.setAttribute("aria-pressed",isSel);
  });
  updateInfo();
}
function setDifficulty(d){
  difficulty=d;
  document.querySelectorAll("[data-difficulty]").forEach(btn=>{
    const isSel=btn.dataset.difficulty===d;
    btn.classList.toggle("selected",isSel);
    btn.setAttribute("aria-pressed",isSel);
  });
  updateInfo();
}
function updateInfo(){
  document.getElementById("info").innerText=
    `Symbol: ${selectedSymbol||"-"} | Mode: ${difficulty}`;
}

// ---------------- START ----------------
function startGameFinal(){
  if(!selectedSymbol){
    alert("Select symbol!");
    return;
  }
  startGame(selectedSymbol);
}

function startGame(symbol){
  player=symbol;
  ai=symbol==="X"?"O":"X";
  turn="X";

  document.getElementById("startScreen").classList.remove("active");
  document.getElementById("gameScreen").classList.add("active");

  // avatars
  let p=avatars[Math.floor(Math.random()*avatars.length)];
  let a;
  do{ a=avatars[Math.floor(Math.random()*avatars.length)]; }
  while(a===p);

  playerAvatar.src=p;
  aiAvatar.src=a;

  initBoard();

  if(ai==="X") setTimeout(aiMove,300);
}

// ---------------- BOARD ----------------
function initBoard(){
  boardArr=["","","","","","","","",""];
  gameOver=false;
  const board=document.getElementById("board");
  board.innerHTML="";

 boardArr.forEach((_,i)=>{
    let cell=document.createElement("div");
    cell.className="cell";
    cell.setAttribute("role","button");
    cell.setAttribute("aria-label","Cell "+(i+1));
    cell.tabIndex=0;
    cell.onclick=()=>move(i);
    board.appendChild(cell);
  });

  updateStatus();
}

// ---------------- MOVE ----------------
function move(i){
  if(gameOver || boardArr[i]!=="" || turn!==player) return;

  boardArr[i]=player;
  turn=ai;
  render();

  if(checkEnd()) return;

  setTimeout(aiMove,300);
}

// ---------------- AI ----------------
function aiMove(){
  if(difficulty==="easy") easyMove();
  else brutalMove();
}

// EASY AI
function easyMove(){
  let empty=boardArr.map((v,i)=>v===""?i:null).filter(v=>v!==null);

  // win
  for(let i of empty){
    boardArr[i]=ai;
    if(checkWinner(boardArr)===ai){
      turn=player; render(); checkEnd(); return;
    }
    boardArr[i]="";
  }

  // block
  for(let i of empty){
    boardArr[i]=player;
    if(checkWinner(boardArr)===player){
      boardArr[i]=ai;
      turn=player; render(); checkEnd(); return;
    }
    boardArr[i]="";
  }

  // random
  let move=empty[Math.floor(Math.random()*empty.length)];
  boardArr[move]=ai;
  turn=player;
  render();
  checkEnd();
}

// DRAW MODE (MINIMAX)
function brutalMove(){
  let bestScore=-Infinity;
  let moveIndex;

  for(let i=0;i<9;i++){
    if(boardArr[i]===""){
      boardArr[i]=ai;
      let score=minimax(boardArr,0,false);
      boardArr[i]="";
      if(score>bestScore){
        bestScore=score;
        moveIndex=i;
      }
    }
  }

  boardArr[moveIndex]=ai;
  turn=player;
  render();
  checkEnd();
}

function minimax(board,depth,isMax){
  let result=checkWinner(board);

  if(result!==null){
    if(result===ai) return 10-depth;
    if(result===player) return depth-10;
    return 0;
  }

  if(isMax){
    let best=-Infinity;
    for(let i=0;i<9;i++){
      if(board[i]===""){
        board[i]=ai;
        best=Math.max(best,minimax(board,depth+1,false));
        board[i]="";
      }
    }
    return best;
  }else{
    let best=Infinity;
    for(let i=0;i<9;i++){
      if(board[i]===""){
        board[i]=player;
        best=Math.min(best,minimax(board,depth+1,true));
        board[i]="";
      }
    }
    return best;
  }
}

// ---------------- CHECK ----------------
function checkWinner(b){
  const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(let w of wins){
    if(b[w[0]] && b[w[0]]===b[w[1]] && b[w[1]]===b[w[2]]) return b[w[0]];
  }
  if(b.every(x=>x!=="")) return "draw";
  return null;
}

function checkEnd(){
  let res=checkWinner(boardArr);
  if(res===null) return false;

  gameOver=true;

  let text=res==="draw"?"Draw 🤝":
            res===player?"You Win 🎉":"AI Wins 🤖";

  resultText.innerText=text;

document
  .getElementById("resultSection")
  .removeAttribute("hidden");

window.VatsalLolGameComplete?.();
  return true;
}

// ---------------- UI ----------------
function render(){
  document.querySelectorAll(".cell").forEach((c,i)=>{
    c.textContent=boardArr[i];
    c.className="cell "+(boardArr[i]==="X"?"neonX":"neonO");
    c.setAttribute("aria-label","Cell "+(i+1)+(boardArr[i]?": "+boardArr[i]:""));
  });
  updateStatus();
}

function updateStatus(){
  document.getElementById("status").innerText=turn===player?"Your Turn":"AI Thinking...";
}

function restart(){
  document
  .querySelector('.vatsal-related')
  ?.setAttribute('hidden','');

document
  .getElementById("resultSection")
  ?.setAttribute("hidden","");
  initBoard();
  if(ai==="X") setTimeout(aiMove,300);
}

function playAgain(){

  document
    .querySelector('.vatsal-related')
    ?.setAttribute('hidden','');

  document
    .getElementById("resultSection")
    ?.setAttribute("hidden","");

  gameScreen.classList.remove("active");
  startScreen.classList.add("active");
}


