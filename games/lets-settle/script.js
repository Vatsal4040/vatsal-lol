const asset = n => `./assets/${n}`;

const polls = [
  {
    q:"How do you pronounce gif?",
    icon:asset("gif.svg"),
    a:[{text:"Gif",icon:asset("gif.svg")},{text:"Jif",icon:asset("jif.svg")}],
    p:[84,16],
    verdict:"The internet says: gif.",
    votes:"14,371,614"
  },
  {
    q:"Is the dress blue & black or white & gold?",
    icon:asset("blue-dress.svg"),
    a:[{text:"Blue & black",icon:asset("blue-dress.svg")},{text:"White & gold",icon:asset("gold-dress.svg")}],
    p:[67,33],
    verdict:"The dress is blue and black.",
    votes:"13,359,055"
  },
  {
    q:"What came first, the chicken or the egg?",
    icon:asset("chicken.svg"),
    a:[{text:"Chicken",icon:asset("chicken.svg")},{text:"Egg",icon:asset("egg.svg")}],
    p:[49,51],
    verdict:"The egg came first.",
    votes:"13,186,489"
  },
  {
    q:"Why is orange called orange?",
    sub:"Was the fruit named first, or the color?",
    icon:"🍊",
    a:[{text:"Color first",emoji:"🎨"},{text:"Fruit first",emoji:"🍊"}],
    p:[19,81],
    verdict:"The fruit came first — then the color.",
    votes:"10,472,218"
  },
  {
    q:"Is cereal a soup?",
    icon:"🥣",
    a:[{text:"Yes",emoji:"🥣"},{text:"No",emoji:"🍲"}],
    p:[21,79],
    verdict:"Cereal is NOT soup.",
    votes:"12,846,994"
  },
  {
    q:"Toilet paper: over or under?",
    icon:asset("over-t.svg"),
    a:[{text:"Over",icon:asset("over-t.svg")},{text:"Under",icon:asset("under-t.svg")}],
    p:[87,13],
    verdict:"The correct way is OVER.",
    votes:"12,657,258"
  },
  {
    q:"Marvel or DC?",
    icon:asset("marvel.svg"),
    a:[{text:"Marvel",icon:asset("marvel.svg")},{text:"DC",icon:asset("dc.svg")}],
    p:[81,19],
    verdict:"Marvel wins.",
    votes:"11,225,817"
  },
  {
    q:"Xbox or PlayStation?",
    icon:asset("ps.svg"),
    a:[{text:"Xbox",icon:asset("ps (2).svg")},{text:"PlayStation",icon:asset("ps.svg")}],
    p:[36,64],
    verdict:"PlayStation is better.",
    votes:"10,932,581"
  },
  {
    q:"iPhone or Android?",
    icon:asset("ios.svg"),
    a:[{text:"iPhone",icon:asset("ios.svg")},{text:"Android",icon:asset("andriod.svg")}],
    p:[61,39],
    verdict:"iPhone wins.",
    votes:"10,284,766"
  },
  {
    q:"Smooth or chunky peanut butter?",
    icon:asset("p-smooth.svg"),
    a:[{text:"Smooth",icon:asset("p-smooth.svg")},{text:"Chunky",icon:asset("p-crunchy.svg")}],
    p:[73,27],
    verdict:"Smooth peanut butter wins.",
    votes:"9,922,899"
  },
  {
    q:"Is a hot dog a sandwich?",
    icon:"🌭",
    a:[{text:"Yes",emoji:"🥪"},{text:"No",emoji:"🌭"}],
    p:[32,68],
    verdict:"The internet says no. The dictionary disagrees.",
    votes:"11,847,332"
  },
  {
    q:"Do you wash your legs in the shower?",
    icon:"🚿",
    a:[{text:"Yes",emoji:"🚿"},{text:"No",emoji:"🛁"}],
    p:[71,29],
    verdict:"71% wash their legs. The other 29% rely on gravity.",
    votes:"9,554,108"
  },
  {
    q:"Is water wet?",
    icon:"💧",
    a:[{text:"Yes",emoji:"💧"},{text:"No",emoji:"🧪"}],
    p:[53,47],
    verdict:"Still unsettled. Scientists genuinely disagree.",
    votes:"14,882,001"
  },
  {
    q:"Do you put on socks before or after trousers?",
    icon:"🧦",
    a:[{text:"Socks first",emoji:"🧦"},{text:"Trousers first",emoji:"👖"}],
    p:[62,38],
    verdict:"62% go socks first. Logistically questionable.",
    votes:"8,773,519"
  },
  {
    q:"Is a burger eaten sideways or straight?",
    sub:"Do you rotate the burger 90° before biting?",
    icon:"🍔",
    a:[{text:"Straight bite",emoji:"🍔"},{text:"Side bite",emoji:"↔️"}],
    p:[44,56],
    verdict:"The side-biters have the structural advantage.",
    votes:"7,234,886"
  },
  {
    q:"Is the floor clean enough to eat off?",
    sub:"5-second rule: real or cope?",
    icon:"⏱️",
    a:[{text:"Real rule",emoji:"✅"},{text:"Total myth",emoji:"🦠"}],
    p:[38,62],
    verdict:"Bacteria don't wait 5 seconds. But we do anyway.",
    votes:"8,129,445"
  },
  {
    q:"Do you bite or lick ice cream?",
    icon:"🍦",
    a:[{text:"Lick",emoji:"👅"},{text:"Bite",emoji:"🦷"}],
    p:[78,22],
    verdict:"78% lick. The 22% who bite are built different.",
    votes:"10,667,003"
  },
  {
    q:"Is Die Hard a Christmas movie?",
    icon:"🎄",
    a:[{text:"Yes",emoji:"🎄"},{text:"No",emoji:"💥"}],
    p:[46,54],
    verdict:"Yippee-ki-yay. Still contested every December.",
    votes:"12,991,774"
  },
  {
    q:"Do you fold or scrunch toilet paper?",
    icon:"🧻",
    a:[{text:"Fold",emoji:"📄"},{text:"Scrunch",emoji:"🤏"}],
    p:[64,36],
    verdict:"Folders claim efficiency. Scrunchers claim freedom.",
    votes:"9,301,558"
  },
  {
    q:"Tea or coffee?",
    icon:"☕",
    a:[{text:"Coffee",emoji:"☕"},{text:"Tea",emoji:"🍵"}],
    p:[64,36],
    verdict:"Coffee wins globally. Tea drinkers are at peace with losing.",
    votes:"13,887,002"
  },
  {
    q:"Is a tomato a fruit or vegetable?",
    icon:"🍅",
    a:[{text:"Fruit",emoji:"🍅"},{text:"Vegetable",emoji:"🥦"}],
    p:[58,42],
    verdict:"Botanically a fruit. Culinarily a vegetable. The Supreme Court ruled vegetable in 1893.",
    votes:"11,093,887"
  },
  {
    q:"Mountains or beach?",
    icon:"🏔️",
    a:[{text:"Mountains",emoji:"🏔️"},{text:"Beach",emoji:"🏖️"}],
    p:[43,57],
    verdict:"Beach wins. Mountain people have better stories though.",
    votes:"14,201,993"
  },
  {
    q:"Do you make your bed every morning?",
    icon:"🛏️",
    a:[{text:"Every day",emoji:"✅"},{text:"Never/rarely",emoji:"😴"}],
    p:[41,59],
    verdict:"Most people don't. Life is short and the duvet is warm.",
    votes:"9,002,118"
  },
  {
    q:"Do you reply to texts immediately?",
    icon:"📱",
    a:[{text:"Right away",emoji:"⚡"},{text:"Later",emoji:"🕰️"}],
    p:[44,56],
    verdict:"Most people let it sit. It's not personal. (It might be personal.)",
    votes:"10,238,554"
  },
  {
    q:"Cats or dogs?",
    icon:"🐶",
    a:[{text:"Dogs",emoji:"🐶"},{text:"Cats",emoji:"🐱"}],
    p:[67,33],
    verdict:"Dogs win. Cat people already knew this and don't care.",
    votes:"15,774,002"
  },
  {
    q:"Do you talk to yourself out loud?",
    icon:"🗣️",
    a:[{text:"Yes",emoji:"🗣️"},{text:"No",emoji:"🤐"}],
    p:[72,28],
    verdict:"72% do. The quiet ones are lying.",
    votes:"8,441,229"
  },
  {
    q:"Do you count stairs as you climb them?",
    icon:"🪜",
    a:[{text:"Yes",emoji:"🔢"},{text:"No",emoji:"🚶"}],
    p:[34,66],
    verdict:"One in three people silently count stairs. They know something we don't.",
    votes:"7,338,209"
  },
  {
    q:"Night owl or early bird?",
    icon:"🦉",
    a:[{text:"Night owl",emoji:"🦉"},{text:"Early bird",emoji:"🐦"}],
    p:[61,39],
    verdict:"Night owls dominate. Morning people are suspiciously cheerful.",
    votes:"12,009,441"
  },
  {
    q:"Would you rather know when you die or how you die?",
    icon:"💀",
    a:[{text:"When",emoji:"📅"},{text:"How",emoji:"💀"}],
    p:[54,46],
    verdict:"Most pick 'when'. Knowing 'how' is too vivid to live with.",
    votes:"11,203,445"
  },
  {
    q:"If you had to lose one, which would you give up?",
    sub:"Taste or smell — they're more linked than you think.",
    icon:"👃",
    a:[{text:"Taste",emoji:"👅"},{text:"Smell",emoji:"👃"}],
    p:[58,42],
    verdict:"Most sacrifice smell. Food without taste is just sad fuel.",
    votes:"9,887,112"
  },
  {
    q:"Would you press a button that gave you $1M but a stranger loses everything?",
    icon:"🔴",
    a:[{text:"Press it",emoji:"💰"},{text:"Never",emoji:"🚫"}],
    p:[23,77],
    verdict:"77% say no. The 23% are honest.",
    votes:"13,441,008"
  },
  {
    q:"Is it ever okay to lie to protect someone's feelings?",
    icon:"🤥",
    a:[{text:"Yes",emoji:"💛"},{text:"No, always honest",emoji:"🪞"}],
    p:[81,19],
    verdict:"81% justify the kind lie. Radical honesty has a small but intense fanbase.",
    votes:"12,009,334"
  },
  {
    q:"Would you rather be loved but poor or rich but lonely?",
    icon:"❤️",
    a:[{text:"Loved & poor",emoji:"❤️"},{text:"Rich & lonely",emoji:"💸"}],
    p:[74,26],
    verdict:"Love wins on paper. The 26% have thought this through more carefully.",
    votes:"14,772,009"
  },
  {
    q:"If you found $500 cash on the street, would you keep it?",
    icon:"💵",
    a:[{text:"Keep it",emoji:"💵"},{text:"Turn it in",emoji:"🚔"}],
    p:[69,31],
    verdict:"69% keep it. The 31% are either saints or lying.",
    votes:"10,334,887"
  },
  {
    q:"Is it cheating to look at your phone during a movie at home?",
    icon:"🎬",
    a:[{text:"Yes",emoji:"🎬"},{text:"No",emoji:"📱"}],
    p:[38,62],
    verdict:"Most say no. The yes camp takes movie night very seriously.",
    votes:"8,229,001"
  },
  {
    q:"Would you read your partner's messages if you knew there was no consequence?",
    icon:"🔍",
    a:[{text:"Yes",emoji:"🔍"},{text:"No",emoji:"🔒"}],
    p:[44,56],
    verdict:"Almost half would. The other half aren't curious enough or trust too much.",
    votes:"11,778,443"
  },
  {
    q:"Is karma real?",
    icon:"🔄",
    a:[{text:"Yes",emoji:"✨"},{text:"No",emoji:"🎲"}],
    p:[61,39],
    verdict:"Most believe. The universe remains professionally uncommitted.",
    votes:"13,002,117"
  },
  {
    q:"Would you take a pill that removed all your bad memories?",
    icon:"💊",
    a:[{text:"Yes",emoji:"💊"},{text:"No",emoji:"🧠"}],
    p:[47,53],
    verdict:"Slightly more people want to keep the pain. It made them who they are.",
    votes:"9,554,772"
  },
  {
    q:"Is it rude to recline your seat on a plane?",
    icon:"✈️",
    a:[{text:"It's my right",emoji:"💺"},{text:"Yes, don't do it",emoji:"😤"}],
    p:[41,59],
    verdict:"Most say don't recline. The ones in front of you agree strongly.",
    votes:"10,887,334"
  },
  {
    q:"Do you think you're a good driver?",
    icon:"🚗",
    a:[{text:"Above average",emoji:"🏎️"},{text:"Average or below",emoji:"🚗"}],
    p:[84,16],
    verdict:"84% think they're above average drivers. Statistically impossible. Collectively delusional.",
    votes:"12,441,009"
  }
];
// Track user answers
const userAnswers = new Array(polls.length).fill(null);

function renderMedia(item, size=22){
  if(item && item.icon){
    return `<img src="${item.icon}" alt="" style="width:${size}px;height:${size}px;">`;
  }
  return `<span class="emoji">${(item && item.emoji) || item || ''}</span>`;
}

function renderIconBare(item){
  if(item && item.icon){
    return `<img src="${item.icon}" alt="">`;
  }
  return `<span>${(item && item.emoji) || ''}</span>`;
}

function renderPoll(poll, idx){
  return `
  <article class="poll" id="poll-${idx}">
    <div class="card">
      <div class="question">
        <div class="q-top">
          <div class="q-icon-bare">${renderIconBare(poll.a[0])}</div>
          <div class="q-meta">
            <div class="q-text">${poll.q}</div>
            ${poll.sub ? `<div class="q-sub">${poll.sub}</div>` : ''}
          </div>
          <div class="q-icon-bare">${renderIconBare(poll.a[1])}</div>
        </div>
        <div class="options">
          ${poll.a.map((choice,ci)=>`
            <button class="option" data-choice="${ci}">
              ${renderMedia(choice, 22)}
              ${choice.text}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="result">
        <div class="result-inner">
          <div class="stats">
            <div class="side">
              <div>
                <div class="side-label">${poll.a[0].text}</div>
                <div class="side-pct" id="pct-${idx}-0">0%</div>
              </div>
            </div>
            <div class="side" style="flex-direction:row-reverse;">
              <div style="text-align:right;">
                <div class="side-label">${poll.a[1].text}</div>
                <div class="side-pct right-pct" id="pct-${idx}-1">0%</div>
              </div>
            </div>
          </div>
          <div class="bar">
            <div class="fill-left" data-w="${poll.p[0]}"></div>
            <div class="fill-right" data-w="${poll.p[1]}"></div>
          </div>
          <div class="verdict-row">
            <div class="verdict">${poll.verdict}</div>
            <div class="votes">${poll.votes} votes</div>
          </div>
        </div>
      </div>
    </div>
  </article>`;
}

const pollsWrap = document.getElementById('polls');
pollsWrap.innerHTML = polls.map(renderPoll).join('');

// Animated number counter
function animateCount(el, target, duration=700){
  const start = performance.now();
  function tick(now){
    const t = Math.min((now-start)/duration, 1);
    const ease = 1 - Math.pow(1-t, 3); // ease out cubic
    el.textContent = Math.round(ease * target) + '%';
    if(t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

document.querySelectorAll('.poll').forEach((pollEl, idx)=>{
  const poll = polls[idx];
  const buttons = pollEl.querySelectorAll('.option');
  const left = pollEl.querySelector('.fill-left');
  const right = pollEl.querySelector('.fill-right');
  const pct0 = pollEl.querySelector(`#pct-${idx}-0`);
  const pct1 = pollEl.querySelector(`#pct-${idx}-1`);

  buttons.forEach(btn => {
    btn.addEventListener('click', ()=>{
      if(pollEl.classList.contains('answered')) return;

      const choiceIdx = parseInt(btn.dataset.choice);
      userAnswers[idx] = choiceIdx;

      // Highlight chosen button
      btn.style.borderColor = 'rgba(168,85,255,.5)';
      btn.style.background = 'rgba(168,85,255,.1)';

      pollEl.classList.add('answered');

      // Animate bars after reveal
      setTimeout(()=>{
        left.style.width = left.dataset.w + '%';
        right.style.width = right.dataset.w + '%';
        animateCount(pct0, poll.p[0], 750);
        animateCount(pct1, poll.p[1], 750);
      }, 60);

      // Scroll to next or show summary
      setTimeout(()=>{
        const allAnswered = userAnswers.every(a => a !== null);
        if(allAnswered){
          showSummary();
          document.getElementById('summary').scrollIntoView({behavior:'smooth',block:'start'});
        } else {
          const next = pollEl.nextElementSibling;
          if(next) next.scrollIntoView({behavior:'smooth',block:'center'});
        }
      }, 140);
    });
  });
});

function showSummary(){
  const summaryEl = document.getElementById('summary');

  // Build personality profile
  let rareCount = 0;
  const choiceDetails = polls.map((poll, idx) => {
    const chosen = userAnswers[idx];
    const pct = poll.p[chosen];
    const isRare = pct < 50;
    if(isRare) rareCount++;
    return { q: poll.q, a: poll.a[chosen].text, pct, isRare };
  });

  const majorityMatches = polls.filter((p,i) => {
    const chosen = userAnswers[i];
    return p.p[chosen] >= 50;
  }).length;

  const rarity = Math.round((rareCount / polls.length) * 100);
  const rarityLabel = rarity >= 70 ? 'Rare Contrarian' : rarity >= 40 ? 'Independent Thinker' : rarity >= 20 ? 'Mostly Mainstream' : 'Pure Majority';
  const rarityDesc = rarity >= 70
    ? "You consistently chose the minority opinion. You either think deeply different, or just like being different — either way, you're in rare company."
    : rarity >= 40
    ? "You split your opinions between the mainstream and the minority. You're a true independent — you go with your gut, not the crowd."
    : rarity >= 20
    ? "You mostly agree with the internet, but you've got a couple of surprise takes tucked in there. Mostly mainstream, with a hint of chaos."
    : "You agreed with the majority on almost everything. You and the internet are basically the same person. Is that... good?";

  const topPercent = Math.max(3, 100 - rarity);
  const agreeStr = majorityMatches + ' of ' + polls.length;

  summaryEl.innerHTML = `
  <div class="summary-card">
    <div class="summary-tag">✦ Your results are in</div>
    <div class="summary-title">${rarityLabel}</div>
    <div class="summary-desc">${rarityDesc}</div>
    <div class="summary-stats">
      <div class="stat-box">
        <div class="stat-box-label">Majority Agreements</div>
        <div class="stat-box-value accent">${agreeStr}</div>
        <div class="stat-box-sub">questions</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-label">You're in the top</div>
        <div class="stat-box-value accent">${topPercent}%</div>
        <div class="stat-box-sub">of ${rarity > 0 ? 'contrarians' : 'majority voters'}</div>
      </div>
    </div>
    <div class="summary-choices">
      ${choiceDetails.map(c=>`
        <div class="summary-choice-row">
          <span class="sc-q">${c.q}</span>
          <span class="sc-a">${c.a}</span>
          <span class="${c.isRare ? 'sc-rare' : 'sc-common'}">${c.pct}%</span>
        </div>
      `).join('')}
    </div>
  </div>`;

summaryEl.classList.add('visible');

setTimeout(() => {

  window.VatsalLolGameComplete?.();

},100);
}
