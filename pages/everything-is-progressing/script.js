const events = [

{
    emoji:"🕑",
    title:"Next Minute",
    type:"minute",
    color:"blue"
},

{
    emoji:"🕑",
    title:"Next Hour",
    type:"hour",
    color:"blue"
},

{
    emoji:"🌅",
    title:"Next Day",
    type:"day",
    color:"blue"
},

{
    emoji:"📅",
    title:"Next Month",
    type:"month",
    color:"purple"
},

{
    emoji:"🎆",
    title:"Next Year",
    type:"year",
    color:"purple"
},

{
    emoji:"💘",
    title:"Next Valentine's Day",
    type:"valentine",
    color:"purple"
},

{
    emoji:"🍀",
    title:"Next Saint Patrick's Day",
    type:"patrick",
    color:"green"
},

{
    emoji:"🐇",
    title:"Next Easter",
    type:"easter",
    color:"orange"
},

{
    emoji:"👻",
    title:"Next Halloween",
    type:"halloween",
    color:"orange"
},

{
    emoji:"🎅",
    title:"Next Christmas",
    type:"christmas",
    color:"orange"
},

{
    emoji:"💻",
    title:"End Of This Page",
    type:"scroll",
    color:"green"
},

{
    emoji:"🌕",
    title:"Next Full Moon",
    type:"moon",
    color:"blue"
},

{
    emoji:"📅",
    title:"Next Decade",
    type:"decade",
    color:"purple"
},

{
    emoji:"📅",
    title:"Next Century",
    type:"century",
    color:"purple"
},

{
    emoji:"☄️",
    title:"Halley's Comet Returns",
    type:"halley",
    color:"blue"
},

{
    emoji:"☀️",
    title:"The Sun Dies",
    type:"sun",
    color:"orange"
},

{
    emoji:"❄️",
    title:"Final Cosmic Logout",
    subtitle:"All progress eventually completes.",
    message:"Loading something new...",
    type:"final",
    color:"final"
}

];

const grid = document.getElementById("grid");

events.forEach(item=>{

    const card = document.createElement("div");

    if(item.type === "final"){

        card.className = "final-card";

        card.innerHTML = `

            <div class="final-stars"></div>

            <div class="final-inner">

                <div class="final-emoji">
                    ${item.emoji}
                </div>

                <div class="final-title">
                    ${item.title}
                </div>

                <div class="final-subtitle">
                    ${item.subtitle}
                </div>

                <div class="final-message">
                    ${item.message}
                </div>

                <div class="final-bar">
                    <div class="final-bar-fill"></div>
                </div>

            </div>

        `;

        grid.appendChild(card);

        return;
    }

    const normal = document.createElement("div");

    normal.className = `card ${item.color}`;

    normal.innerHTML = `
    
        <div class="top">
            <div class="emoji">${item.emoji}</div>
            <div class="label">${item.title}</div>
        </div>

        <div class="time">0</div>

        <div class="left">Loading...</div>

        <div class="bar-shell">
            <div class="bar-fill"></div>
        </div>

        <div class="meta">
            <span class="percent">0%</span>
            <span class="range">...</span>
        </div>
    `;

    normal.dataset.type = item.type;

    grid.appendChild(normal);
});

function pad(n){
    return String(n).padStart(2,'0');
}

function formatDuration(ms){

    let total = Math.floor(ms / 1000);

    const days = Math.floor(total / 86400);
    total %= 86400;

    const hours = Math.floor(total / 3600);
    total %= 3600;

    const minutes = Math.floor(total / 60);

    const seconds = total % 60;

    if(days > 0){
        return `${days}d ${hours}h`;
    }

    if(hours > 0){
        return `${hours}h ${minutes}m`;
    }

    if(minutes > 0){
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}

function nextDate(month,day){

    const now = new Date();

    let year = now.getFullYear();

    let date = new Date(year,month,day);

    if(date < now){
        date = new Date(year + 1,month,day);
    }

    return date;
}

function update(){

    const now = new Date();

    document.querySelectorAll(".card").forEach(card=>{

        const type = card.dataset.type;

        const timeEl = card.querySelector(".time");
        const leftEl = card.querySelector(".left");
        const fill = card.querySelector(".bar-fill");
        const percentEl = card.querySelector(".percent");
        const rangeEl = card.querySelector(".range");

        let progress = 0;
        let remaining = 0;
        let total = 1;

        /* MINUTE */

        if(type === "minute"){

            const seconds = now.getSeconds();
            progress = seconds / 60;

            remaining = 60 - seconds;
            total = 60;

            timeEl.textContent =
                `00:${pad(remaining)}`;

            leftEl.textContent =
                `${remaining} seconds left`;

            rangeEl.textContent = "60s";
        }

        /* HOUR */

        if(type === "hour"){

            const mins = now.getMinutes();
            const secs = now.getSeconds();

            progress =
                (mins * 60 + secs) / 3600;

            remaining =
                3600 - (mins * 60 + secs);

            total = 3600;

            timeEl.textContent =
                `${pad(59 - mins)}:${pad(60 - secs)}`;

            leftEl.textContent =
                `${59 - mins} minutes left`;

            rangeEl.textContent = "60m";
        }

        /* DAY */

        if(type === "day"){

            const passed =
                now.getHours()*3600 +
                now.getMinutes()*60 +
                now.getSeconds();

            progress = passed / 86400;

            remaining = 86400 - passed;

            total = 86400;

            timeEl.textContent =
                `${pad(23-now.getHours())}:${pad(59-now.getMinutes())}:${pad(60-now.getSeconds())}`;

            leftEl.textContent =
                `${23-now.getHours()} hours left`;

            rangeEl.textContent = "24h";
        }

        /* MONTH */

        if(type === "month"){

            const start =
                new Date(now.getFullYear(),now.getMonth(),1);

            const end =
                new Date(now.getFullYear(),now.getMonth()+1,1);

            progress =
                (now-start)/(end-start);

            remaining =
                (end-now)/1000;

            total =
                (end-start)/1000;

            timeEl.textContent =
                `${Math.ceil(remaining/86400)} days`;

            leftEl.textContent =
                `${Math.ceil(remaining/86400)} days left`;

            rangeEl.textContent = "30d";
        }

        /* YEAR */

        if(type === "year"){

            const start =
                new Date(now.getFullYear(),0,1);

            const end =
                new Date(now.getFullYear()+1,0,1);

            progress =
                (now-start)/(end-start);

            remaining =
                (end-now)/1000;

            total =
                (end-start)/1000;

            timeEl.textContent =
                `${Math.ceil(remaining/86400)} days`;

            leftEl.textContent =
                `${Math.ceil(remaining/86400)} days left`;

            rangeEl.textContent = "365d";
        }

        /* VALENTINE */

        if(type === "valentine"){

            const target = nextDate(1,14);

            remaining = (target-now)/1000;

            total = 31536000;

            progress = 1 - (remaining/total);

            timeEl.textContent =
                `${Math.ceil(remaining/86400)} days`;

            leftEl.textContent =
                `${Math.ceil(remaining/86400)} days left`;

            rangeEl.textContent = "1y";
        }

        /* PATRICK */

        if(type === "patrick"){

            const target = nextDate(2,17);

            remaining = (target-now)/1000;

            total = 31536000;

            progress = 1 - (remaining/total);

            timeEl.textContent =
                `${Math.ceil(remaining/86400)} days`;

            leftEl.textContent =
                `${Math.ceil(remaining/86400)} days left`;

            rangeEl.textContent = "1y";
        }

/* EASTER */

if(type === "easter"){

    function getEaster(year){

        const f = Math.floor;

        const G = year % 19;

        const C = f(year / 100);

        const H =
            (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;

        const I =
            H - f(H / 28) *
            (1 - f(H / 28) *
            f(29 / (H + 1)) *
            f((21 - G) / 11));

        const J =
            (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;

        const L = I - J;

        const month = 3 + f((L + 40) / 44);

        const day = L + 28 - 31 * f(month / 4);

        return new Date(year, month - 1, day);
    }

    let target = getEaster(now.getFullYear());

    if(target < now){
        target = getEaster(now.getFullYear() + 1);
    }

    const previous =
        getEaster(target.getFullYear() - 1);

    remaining = (target - now) / 1000;

    total =
        (target - previous) / 1000;

    progress =
        1 - (remaining / total);

    timeEl.textContent =
        `${Math.ceil(remaining / 86400)} days`;

    leftEl.textContent =
        `${Math.ceil(remaining / 86400)} days left`;

    rangeEl.textContent = "1y";
}


        /* HALLOWEEN */

        if(type === "halloween"){

            const target = nextDate(9,31);

            remaining = (target-now)/1000;

            total = 31536000;

            progress = 1 - (remaining/total);

            timeEl.textContent =
                `${Math.ceil(remaining/86400)} days`;

            leftEl.textContent =
                `${Math.ceil(remaining/86400)} days left`;

            rangeEl.textContent = "1y";
        }

        /* CHRISTMAS */

        if(type === "christmas"){

            const target = nextDate(11,25);

            remaining = (target-now)/1000;

            total = 31536000;

            progress = 1 - (remaining/total);

            timeEl.textContent =
                `${Math.ceil(remaining/86400)} days`;

            leftEl.textContent =
                `${Math.ceil(remaining/86400)} days left`;

            rangeEl.textContent = "1y";
        }

        /* PAGE */

        if(type === "scroll"){

            const remainingPx =
                document.documentElement.scrollHeight -
                window.innerHeight -
                window.scrollY;

            const totalPx =
                document.documentElement.scrollHeight -
                window.innerHeight;

            progress =
                window.scrollY / totalPx;

            remaining = remainingPx;

            total = totalPx;

            timeEl.textContent =
                `${Math.ceil(remainingPx)} px`;

            leftEl.textContent =
                `${Math.ceil(remainingPx)} pixels left`;

            rangeEl.textContent = "0 px";
        }

        /* MOON */

        if(type === "moon"){

            const lunarCycle = 29.530588853;

            const knownNewMoon =
                new Date("2024-01-11T11:57:00Z");

            const daysSince =
                (now-knownNewMoon) /
                86400000;

            const phase =
                daysSince % lunarCycle;

            progress =
                phase / lunarCycle;

            remaining =
                (lunarCycle-phase) * 86400;

            total =
                lunarCycle * 86400;

            timeEl.textContent =
                `${Math.floor(remaining/86400)} days`;

            leftEl.textContent =
                `${Math.floor(remaining/86400)} days left`;

            rangeEl.textContent = "29.5d";
        }

        /* DECADE */

        if(type === "decade"){

            const year = now.getFullYear();

            const next = Math.ceil(year / 10) * 10;

            const target =
                new Date(next,0,1);

            remaining = (target-now)/1000;

            total = 315360000;

            progress = 1 - (remaining/total);

            timeEl.textContent =
                `${Math.ceil(remaining/31536000)} years`;

            leftEl.textContent =
                `${Math.ceil(remaining/31536000)} years left`;

            rangeEl.textContent = "10y";
        }

        /* CENTURY */

        if(type === "century"){

            const year = now.getFullYear();

            const next =
                Math.ceil(year / 100) * 100;

            const target =
                new Date(next,0,1);

            remaining = (target-now)/1000;

            total = 3153600000;

            progress = 1 - (remaining/total);

            timeEl.textContent =
                `${Math.ceil(remaining/31536000)} years`;

            leftEl.textContent =
                `${Math.ceil(remaining/31536000)} years left`;

            rangeEl.textContent = "100y";
        }

        /* HALLEY */

        if(type === "halley"){

            const target = new Date("2061-07-28");

            remaining = (target-now)/1000;

            total = 75 * 31536000;

            progress = 1 - (remaining/total);

            timeEl.textContent =
                `${Math.ceil(remaining/31536000)} years`;

            leftEl.textContent =
                `${Math.ceil(remaining/31536000)} years left`;

            rangeEl.textContent = "75y";
        }

        /* SUN */

        if(type === "sun"){

            const remainingYears =
                5000000000;

            progress = .05;

            timeEl.textContent =
                `5B years`;

            leftEl.textContent =
                `5 billion years left`;

            rangeEl.textContent = "~5B years";
        }

        fill.style.width =
            `${Math.max(0,Math.min(progress*100,100))}%`;

        percentEl.textContent =
            `${Math.floor(progress*100)}%`;
    });

 
    requestAnimationFrame(update);
}

update();
window.addEventListener('load', () => {
    // window.VatsalLolGameComplete?.();
});