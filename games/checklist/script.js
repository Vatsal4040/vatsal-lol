const items = [
"👶 Be born",
"🚶 Take first steps",
"📣 Say first words",
"👨‍🏫 Learn to read",
"🤗 Make a friend",
"🚴 Learn to ride a bike",
"📗 Read a book",
"🏊 Learn to swim",
"🏫 Finish elementary school",
"⚽ Play a sport",
"🛫 Fly in a plane",
"🛥️ Ride a boat",
"🚆 Ride in a train",
"🚁 Ride a helicopter",
"🌊 See the ocean",
"❄️ See snow",
"☃️ Make a snowman",
"🏫 Finish middle school",
"🎶 Go to a concert",
"🏕️ Go camping",
"🎢 Ride a rollercoaster",
"🎻 Play an instrument",
"💋 Get kissed",
"💳 Get a credit card",
"🚘 Start driving",
"🗺️ Go on a roadtrip",
"🧠 Forgot why you opened the fridge",
"📱 Reopened app 6 times",
"😭 Cried because of a fictional character",
"🍜 Ate noodles at midnight",
"🗾 Visit another country",
"🎤 Give a speech",
"🏫 Graduate high school",
"🌐 Learn another language",
"💸 Invest some money",
"📷 Meet an idol",
"😩 Make a terrible mistake",
"🏆 Win a trophy",
"⛰️ Climb a mountain",
"🎽 Run a marathon",
"🍳 Learn to cook",
"🔦 Explore a cave",
"🌋 See a volcano",
"🎓 Graduate college",
"💕 Have a long relationship",
"🗑️ Get dumped",
"🖊️ Sign a contract",
"🏢 Get a job",
"☝️ Get promoted",
"💵 Get a paycheck",
"🔥 Get fired",
"📰 Get in the news",
"🗳️ Vote in an election",
"🤡 Switch careers",
"🏠 Buy a house",
"💍 Get engaged",
"👰 Get married",
"👶 Have a kid",
"🚶 Teach your kid to walk",
"🎓 Watch your kid graduate",
"👰 Watch your kid get married",
"👴 Become a grandparent",
"🏖️ Retire",
"📔 Tell your grandkid a story",
"🌑 See a solar eclipse",
"🌷 Plant a garden",
"🌎 Travel the world",
"🕒 Accidentally stayed awake 24 hours",
"📱 Deleted a message instantly after sending",
"🧠 Forgot why you entered a room",
"🍜 Ate noodles at 2AM",
"🛒 Went shopping for 1 item and bought 12",
"😭 Laughed during serious moment",
"🧠 Wonder if everyone secretly hates you",
"📦 Keep useless boxes 'just in case'",
"😬 Rehearse fake arguments in shower",
"📱 Open app and forget why",
"☕ Drink coffee for energy and still feel tired",
"📦 Keep charger at weird angle to work",
"🧦 Lose one sock forever",
"🌅 Watch a sunrise alone",
"💌 Receive unexpected kindness",
"🫂 Hug someone after a long time",
"🌌 Sleep under the stars",
"🚂 Miss a train dramatically",
"🧭 Get lost in another city",
"🎂 Turn 100",
"✔️ Complete Life Checklist"
];

const grid = document.getElementById("grid");
const countEl = document.getElementById("count");
const totalEl = document.getElementById("total");
const ending = document.getElementById("ending");

totalEl.textContent = items.length;

const endings = [
    "Still buffering through existence.",
    "Human experience partially completed.",
    "You survived more than you think.",
    "Somehow still alive. Impressive."
];

items.forEach((text, index) => {

    const item = document.createElement("div");
    item.className = "item";

    item.innerHTML = `
        <div class="checkbox">
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12"
                    stroke="#04110b"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
        </div>

        <div class="label">${text}</div>
    `;

    item.addEventListener("click", () => {
        item.classList.toggle("checked");
        updateCounter();
        saveState();
    });

    grid.appendChild(item);
});

function updateCounter(){

    const checked =
        document.querySelectorAll(".item.checked").length;
        countEl.textContent = checked;

  const progressFill = document.getElementById("progressFill");

if(progressFill){
    progressFill.style.width =
        `${(checked / items.length) * 100}%`;
}
    const ratio = checked / items.length;
document.documentElement.style.setProperty(
  '--timeline-progress',
  `${ratio * 100}%`
);

    if(ratio < .2){
        ending.textContent =
            endings[0];
    }
    else if(ratio < .45){
        ending.textContent =
            endings[1];
    }
    else if(ratio < .75){
        ending.textContent =
            endings[2];
    }
    else{
        ending.textContent =
            endings[3];
    }

    if (checked === items.length) {
        window.VatsalLolGameComplete?.();
    } else {
        document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
    }
}

function saveState(){

    const states = [];

    document.querySelectorAll(".item").forEach(item => {
        states.push(item.classList.contains("checked"));
    });

    localStorage.setItem(
        "lifeChecklistState",
        JSON.stringify(states)
    );
}

function loadState(){

    const saved =
        JSON.parse(localStorage.getItem("lifeChecklistState"));

    if(!saved) return;

    document.querySelectorAll(".item").forEach((item,i) => {

        if(saved[i]){
            item.classList.add("checked");
        }

    });

    updateCounter();
}

loadState();
