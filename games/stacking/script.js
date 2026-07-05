const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W,H,DPR;

function resize(){
    DPR = window.devicePixelRatio || 1;

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W * DPR;
    canvas.height = H * DPR;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(DPR,0,0,DPR,0,0);
}
resize();
window.addEventListener("resize", resize);

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("comboCount");
const comboText = document.getElementById("comboText");
const perfectText = document.getElementById("perfectText");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const flash = document.getElementById("flash");
const dropHint = document.querySelector(".bottom");

const COLORS = [
    "#00f5ff",
    "#ff2bd6",
    "#a8ff2f",
    "#ffd84d",
    "#7c5cff",
    "#ff6b35"
];

const COLOR_PAIRS = [
    ["#00f5ff","#0077ff"],
    ["#ff2bd6","#8a2bff"],
    ["#a8ff2f","#00e095"],
    ["#ffd84d","#ff7a1a"],
    ["#7c5cff","#00d4ff"],
    ["#ff6b35","#ff245f"]
];

let game;

class Block{
    constructor(x,y,w,h,color,type="stack"){
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.color=color;
        this.type=type;

        this.targetX=x;
        this.velY=0;
        this.falling=false;

        this.offset=0;
        this.glow=20;

        this.cut=false;
    }

    draw(cameraY, wobble){

        const sx = this.x + wobble;
        const sy = this.y - cameraY;

        ctx.save();

        ctx.shadowBlur = this.glow;
        ctx.shadowColor = this.color;

     const pair = this.type === "master"
            ? ["#10151f","#00f5ff"]
            : this.type === "magnet"
                ? ["#ffd84d","#ff2bd6"]
                : COLOR_PAIRS[this.colorIndex % COLOR_PAIRS.length];

        const grad = ctx.createLinearGradient(
            sx,
            sy,
            sx+this.w,
            sy+this.h
        );

        grad.addColorStop(0, pair[0]);
        grad.addColorStop(.52, this.type === "master" ? "#172235" : this.color);
        grad.addColorStop(1, pair[1]);

        ctx.fillStyle = grad;

        roundRect(
            sx,
            sy,
            this.w,
            this.h,
            10
        );

        ctx.fill();

        ctx.globalAlpha = this.type === "master" ? .4 : .28;

        ctx.fillStyle="#fff";

        roundRect(
            sx+8,
            sy+5,
            this.w-16,
            this.h*.22,
            8
        );

        ctx.fill();

        if(this.type === "master"){
            ctx.globalAlpha=.72;
            ctx.fillStyle="rgba(0,245,255,.9)";
            roundRect(sx+12, sy+this.h-7, this.w-24, 3, 3);
            ctx.fill();

            ctx.globalAlpha=.28;
            ctx.strokeStyle="rgba(255,216,77,.8)";
            ctx.lineWidth=2;
            roundRect(sx-4, sy-4, this.w+8, this.h+8, 12);
            ctx.stroke();
        }
        if(this.type === "magnet"){
            ctx.globalAlpha=.9;
            ctx.fillStyle="#0b0b0f";
            ctx.font = `700 ${Math.min(this.h*0.6,20)}px Orbitron, Rajdhani, sans-serif`;
            ctx.textAlign="center";
            ctx.textBaseline="middle";
            ctx.fillText("MAGNET", sx+this.w/2, sy+this.h/2);

            ctx.globalAlpha=.35;
            ctx.strokeStyle="rgba(255,255,255,.8)";
            ctx.lineWidth=2;
            roundRect(sx-3, sy-3, this.w+6, this.h+6, 12);
            ctx.stroke();
        }

        ctx.globalAlpha=.8;
        ctx.strokeStyle="rgba(255,255,255,.2)";
        ctx.lineWidth=1;
        roundRect(sx+.5, sy+.5, this.w-1, this.h-1, 10);
        ctx.stroke();

        ctx.restore();
    }
}

function roundRect(x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
}

function shadeColor(color, percent){
    const f = parseInt(color.slice(1),16);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent)/100;

    const R = f>>16;
    const G = f>>8 & 0x00FF;
    const B = f & 0x0000FF;

    return "#" + (
        0x1000000 +
        (Math.round((t-R)*p)+R)*0x10000 +
        (Math.round((t-G)*p)+G)*0x100 +
        (Math.round((t-B)*p)+B)
    ).toString(16).slice(1);
}

function lerp(a,b,t){
    return a + (b-a)*t;
}

function clamp(v,min,max){
    return Math.max(min,Math.min(max,v));
}

class Game{

    constructor(){

        this.reset();
    }

    reset(){

        this.blocks=[];
        this.particles=[];

        this.baseW=Math.min(220, Math.max(176, W * 0.18));
        this.baseH=34;

        this.score=0;
        this.combo=0;
        this.bestCombo=0;

        this.speed=3.6;

        this.cameraY=0;
        this.targetCameraY=0;
        this.baseY=H - Math.max(126, Math.min(152, H * 0.16));
        this.stackAnchorY=H - Math.max(210, Math.min(250, H * 0.26));

        this.gameOver=false;

        this.time=0;

        this.slowMo=0;

        this.skyShift=0;

        this.towerWobble=0;

        this.spawnBase();

        this.spawnMoving();
    }

    spawnBase(){

        const base = new Block(
            W/2 - this.baseW/2,
            this.baseY,
            this.baseW,
            this.baseH,
            COLORS[0],
            "master"
        );
        base.colorIndex = 0;

        this.blocks.push(base);
    }

    spawnMoving(){

        const prev = this.blocks[this.blocks.length-1];

        const w = prev.w;
        const startX = clamp(W < 520 ? W * 0.12 : W * 0.06, 16, W - w - 16);

        const b = new Block(
            startX,
            prev.y - this.baseH - 10,
            w,
            this.baseH,
            COLORS[(this.blocks.length)%COLORS.length]
        );
        b.colorIndex = this.blocks.length % COLOR_PAIRS.length;

    if(this.blocks.length >= 5 && this.blocks.length % 6 === 0){
        b.type = "magnet";
    }

    b.moveSpeed = this.speed;
    b.dir = 1;
    b.armed = false;
    setDropHint(false);

        this.current = b;
    }

    drop(){

        if(this.gameOver) return;

        const prev = this.blocks[this.blocks.length-1];
        const cur = this.current;

        if(!cur.armed){
            return;
        }

        if(cur.type === "magnet"){
            cur.x = prev.x;
        }

        const overlap =
            Math.min(cur.x+cur.w, prev.x+prev.w)
            -
            Math.max(cur.x, prev.x);

        if(overlap <= 0){

            this.failCollapse();
            return;
        }

        const diff = Math.abs(cur.x - prev.x);

        let perfect = diff < 6;

        if(perfect){

            cur.x = prev.x;
            this.combo++;

            this.score += 15 + this.combo * 2;

            this.speed += 0.18;

            this.triggerPerfect(cur.type === "magnet");
            this.slowMo = 1;
            this.skyShift += 0.08;

        }else{

            this.combo=0;

            this.score += 10;

            cur.w = overlap;

            if(cur.x < prev.x){
                cur.x = prev.x;
            }

            this.speed += 0.1;
        }

        this.bestCombo =
            Math.max(this.bestCombo, this.combo);

        this.towerWobble +=
            clamp(diff * 0.03, 0, 6);

        this.blocks.push(cur);

        this.targetCameraY =
            Math.max(0, cur.y - this.stackAnchorY);

        this.spawnParticles(
            cur.x + cur.w/2,
            cur.y + cur.h/2,
            perfect ? 18 : 10,
            cur.color
        );

        this.spawnMoving();

        updateHUD();
    }

   triggerPerfect(isMagnet){

        comboText.innerText = isMagnet
            ? "MAGNET LOCK"
            : (this.combo > 1
                ? `${this.combo}x PERFECT`
                : "PERFECT");

        comboText.classList.add("show");
        perfectText.classList.add("show");

        setTimeout(()=>{
            comboText.classList.remove("show");
            perfectText.classList.remove("show");
        },650);

        flash.style.transition="none";
        flash.style.opacity=".85";

        requestAnimationFrame(()=>{
            flash.style.transition="opacity .65s ease";
            flash.style.opacity="0";
        });
    }

    failCollapse(){

       this.gameOver=true;

        for(let i=1;i<this.blocks.length;i++){

            const b=this.blocks[i];

            b.falling=true;
            b.velY=Math.random()*6+3;
            b.rot=(Math.random()-.5)*0.18;
        }

        setTimeout(()=>{
            startBtn.textContent = "REBOOT STACK.EXE";

            /* show GAME OVER label above button */
            if(!document.getElementById('gameOverLabel')){
                const lbl = document.createElement('div');
                lbl.id = 'gameOverLabel';
                lbl.className = 'game-over-label';
                lbl.textContent = 'GAME OVER';
                menu.insertBefore(lbl, menu.querySelector('.start-title'));
            }
            document.getElementById('gameOverLabel').style.display = 'block';

            menu.style.display = 'flex';
            document.getElementById('siteHeader').style.display = 'flex';
            document.body.classList.add('game-ended');

            /* move footer inside menu so it scrolls with it */
            window.VatsalLolGameComplete?.();
            setTimeout(() => {
                const related = document.querySelector('.vatsal-related');
                if (related) {
                    related.removeAttribute('hidden');
                    menu.appendChild(related);
                }
            }, 100);
        },1200);
    }

    spawnParticles(x,y,count,color){

        for(let i=0;i<count;i++){

            this.particles.push({
                x,
                y,
                vx:(Math.random()-.5)*6,
                vy:(Math.random()-.5)*6,
                life:1,
                size:Math.random()*5+2,
                color
            });
        }
    }

    update(dt){

        this.time += dt;

        this.slowMo = lerp(this.slowMo,0,dt*2.5);

        const timeScale =
            1 - this.slowMo * 0.45;

        dt *= timeScale;

        this.skyShift += dt * 0.02;

        this.cameraY =
            lerp(
                this.cameraY,
                this.targetCameraY,
                dt * 2.5
            );

        this.towerWobble =
            lerp(this.towerWobble,0,dt*1.4);

        if(!this.gameOver){

            this.current.x +=
                this.current.moveSpeed *
                this.current.dir *
                dt * 60;

            const prev = this.blocks[this.blocks.length-1];
            if(!this.current.armed && this.current.x + this.current.w >= prev.x){
                this.current.armed = true;
                setDropHint(true);
            }

            if(this.current.x > W-80){
                this.current.dir=-1;
            }

            if(this.current.x < -this.current.w+80){
                this.current.dir=1;
            }
        }

        for(let p of this.particles){

            p.x += p.vx;
            p.y += p.vy;

            p.vy += 0.04;

            p.life -= dt * 1.5;
        }

        this.particles =
            this.particles.filter(p=>p.life>0);

        if(this.gameOver){

            for(let b of this.blocks){

                if(b.falling){

                    b.y += b.velY;
                    b.velY += 0.22;

                    b.x += Math.sin(b.velY*.1)*2;
                }
            }
        }
    }

    drawBackground(){

        const g = ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

        g.addColorStop(
            0,
            "#000"
        );

        g.addColorStop(
            .55,
            `hsl(${190 + Math.sin(this.skyShift) * 80}, 80%, 4%)`
        );

        g.addColorStop(
            1,
            "#020305"
        );

        ctx.fillStyle=g;
        ctx.fillRect(0,0,W,H);

        for(let i=0;i<18;i++){

            const y =
                (i*160 + this.time*8) % (H+200)-100;

            const x =
                Math.sin(i*99 + this.time*.2) * 240
                + W/2;

            const size = 120 + Math.sin(i)*80;

            const grad = ctx.createRadialGradient(
                x,y,0,
                x,y,size
            );

            grad.addColorStop(
                0,
                i % 2
                ? `rgba(255,43,214,.07)`
                : `rgba(0,245,255,.075)`
            );

            grad.addColorStop(
                1,
                "rgba(0,245,255,0)"
            );

            ctx.fillStyle=grad;

            ctx.beginPath();
            ctx.arc(x,y,size,0,Math.PI*2);
            ctx.fill();
        }

        // horizon glow

        ctx.fillStyle=
            "rgba(0,245,255,.055)";

        ctx.fillRect(0,H-170,W,170);
    }

    drawTower(){

        const wobble =
            Math.sin(this.time*2.2)
            * this.towerWobble;

        for(let b of this.blocks){
            b.draw(this.cameraY,wobble);
        }

        if(!this.gameOver){
            this.current.draw(
                this.cameraY,
                wobble*0.35
            );
        }
    }

    drawParticles(){

        for(let p of this.particles){

            ctx.save();

            ctx.globalAlpha=p.life;

            ctx.fillStyle=p.color;
            ctx.shadowBlur=12;
            ctx.shadowColor=p.color;

            ctx.beginPath();
            ctx.arc(
                p.x,
                p.y-this.cameraY,
                p.size,
                0,
                Math.PI*2
            );

            ctx.fill();

            ctx.restore();
        }
    }

    render(){

        this.drawBackground();

        this.drawTower();

        this.drawParticles();

        this.drawVignette();
    }

    drawVignette(){

        const g = ctx.createRadialGradient(
            W/2,
            H/2,
            H*.2,
            W/2,
            H/2,
            H*.8
        );

        g.addColorStop(0,"rgba(0,0,0,0)");
        g.addColorStop(1,"rgba(0,0,0,.45)");

        ctx.fillStyle=g;
        ctx.fillRect(0,0,W,H);
    }
}

function updateHUD(){

    scoreEl.textContent = game.score;
    comboEl.textContent = game.combo + "x";
}

function setDropHint(ready){

    dropHint.textContent =
        ready
        ? "CLICK / TAP TO DROP"
        : "BLOCK INBOUND";

    dropHint.classList.toggle("waiting", !ready);
}

function startGame(){

    document.body.classList.remove('game-ended');

    /* move footer back to body and hide */
    const related = document.querySelector('.vatsal-related');
    if (related) {
        related.setAttribute('hidden','');
        document.body.appendChild(related);
    }

    /* hide game over label */
    const lbl = document.getElementById('gameOverLabel');
    if (lbl) lbl.style.display = 'none';

    startBtn.textContent = "BOOT STACK.EXE";
    menu.style.display = 'none';
    document.getElementById('siteHeader').style.display = 'none';

    game = new Game();
    updateHUD();
}

startBtn.addEventListener("click", startGame);
window.addEventListener("pointerdown", (e)=>{

    if(!game || game.gameOver) return;

    /* ignore clicks on the menu/header/footer */
    if(e.target.closest('#menu') ||
       e.target.closest('#siteHeader') ||
       e.target.closest('.vatsal-related')) return;

    game.drop();
});

let last = performance.now();

function loop(now){

    requestAnimationFrame(loop);

    const dt =
        Math.min((now-last)/1000,0.033);

    last = now;

    if(game){

        game.update(dt);
        game.render();
    }
}

requestAnimationFrame(loop);
