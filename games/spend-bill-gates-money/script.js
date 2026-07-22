// ================= DATA =================
const DIFFICULTIES = {
  easy:       100000000000,
  medium:      10000000000,
  hard:         1000000000,
  impossible:    100000000
};

let START_MONEY = DIFFICULTIES.easy;
let cart = {};

const ITEMS = {
  "🎁 Everyday": [
    {name:"Coffee",price:2,emoji:"☕",tag:"everyday"},
    {name:"Big Mac",price:5,emoji:"🍔",tag:"everyday"},
    {name:"Burger King Whopper",price:6,emoji:"🍔",tag:"everyday"},
    {name:"Ice Cream Cone",price:3,emoji:"🍦",tag:"everyday"},
    {name:"Pack of Chips",price:2,emoji:"🍟",tag:"everyday"},
    {name:"Chocolate Bar",price:1,emoji:"🍫",tag:"everyday"},
    {name:"Soda",price:2,emoji:"🥤",tag:"everyday"},
    {name:"Water Bottle",price:1,emoji:"💧",tag:"everyday"},
    {name:"Pizza Slice",price:4,emoji:"🍕",tag:"everyday"},
    {name:"Donut",price:2,emoji:"🍩",tag:"everyday"},
    {name:"Sandwich",price:3,emoji:"🥪",tag:"everyday"},
    {name:"Taco",price:4,emoji:"🌮",tag:"everyday"},
    {name:"Pancakes",price:5,emoji:"🥞",tag:"everyday"},
    {name:"French Fries",price:3,emoji:"🍟",tag:"everyday"},
    {name:"Bagel",price:2,emoji:"🥯",tag:"everyday"},
    {name:"Muffin",price:3,emoji:"🧁",tag:"everyday"},
    {name:"Cookie",price:1,emoji:"🍪",tag:"everyday"},
    {name:"Smoothie",price:4,emoji:"🍹",tag:"everyday"},
    {name:"Juice",price:3,emoji:"🧃",tag:"everyday"},
    {name:"Milkshake",price:5,emoji:"🥛",tag:"everyday"}
  ],

  "📱 Tech & Lifestyle": [
    {name:"Smartphone",price:1000,emoji:"📱",tag:"tech"},
    {name:"Laptop",price:1200,emoji:"💻",tag:"tech"},
    {name:"Smartwatch",price:400,emoji:"⌚",tag:"tech"},
    {name:"Wireless Earbuds",price:150,emoji:"🎧",tag:"tech"},
    {name:"VR Headset",price:500,emoji:"🕶️",tag:"tech"},
    {name:"Gaming Console",price:500,emoji:"🎮",tag:"tech"},
    {name:"Drone",price:700,emoji:"🛸",tag:"tech"},
    {name:"Electric Scooter",price:800,emoji:"🛴",tag:"tech"},
    {name:"Fitness Tracker",price:120,emoji:"🏃‍♂️",tag:"tech"},
    {name:"Camera",price:900,emoji:"📷",tag:"tech"},
    {name:"Tablet",price:600,emoji:"📲",tag:"tech"},
    {name:"3D Printer",price:2000,emoji:"🖨️",tag:"tech"},
    {name:"Smart Glasses",price:1000,emoji:"🕶️",tag:"tech"},
    {name:"Gaming Mouse",price:80,emoji:"🖱️",tag:"tech"},
    {name:"Mechanical Keyboard",price:120,emoji:"⌨️",tag:"tech"}
  ],

  "🚗 Vehicles": [
    {name:"Bicycle",price:150,emoji:"🚲",tag:"vehicle"},
    {name:"Motorbike",price:1000,emoji:"🏍️",tag:"vehicle"},
    {name:"Car",price:20000,emoji:"🚗",tag:"vehicle"},
    {name:"Electric Car",price:35000,emoji:"🚙",tag:"vehicle"},
    {name:"Yacht",price:5000000,emoji:"🛥️",tag:"vehicle"},
    {name:"Private Jet",price:50000000,emoji:"✈️",tag:"vehicle"},
    {name:"Skateboard",price:50,emoji:"🛹",tag:"vehicle"},
    {name:"Truck",price:30000,emoji:"🚚",tag:"vehicle"},
    {name:"Helicopter",price:2000000,emoji:"🚁",tag:"vehicle"},
    {name:"Tractor",price:15000,emoji:"🚜",tag:"vehicle"},
    {name:"Segway",price:600,emoji:"🛴",tag:"vehicle"},
    {name:"Roller Skates",price:80,emoji:"🛼",tag:"vehicle"},
    {name:"Electric Bike",price:1200,emoji:"🚲",tag:"vehicle"},
    {name:"Scooter",price:400,emoji:"🛵",tag:"vehicle"},
    {name:"Bus",price:50000,emoji:"🚌",tag:"vehicle"}
  ],

  "🏠 Property": [
    {name:"Small Apartment",price:100000,emoji:"🏢",tag:"property"},
    {name:"Family House",price:300000,emoji:"🏠",tag:"property"},
    {name:"Luxury Villa",price:2000000,emoji:"🏡",tag:"property"},
    {name:"Castle",price:10000000,emoji:"🏰",tag:"property"},
    {name:"Penthouse",price:5000000,emoji:"🏙️",tag:"property"},
    {name:"Beach House",price:4000000,emoji:"🏖️",tag:"property"},
    {name:"Farmhouse",price:700000,emoji:"🌾",tag:"property"},
    {name:"Treehouse",price:100000,emoji:"🌳",tag:"property"},
    {name:"Igloo",price:50000,emoji:"🧊",tag:"property"},
    {name:"Cave Home",price:80000,emoji:"🕳️",tag:"property"},
    {name:"Mansion",price:8000000,emoji:"🏛️",tag:"property"},
    {name:"Studio Apartment",price:90000,emoji:"🏘️",tag:"property"},
    {name:"Loft",price:150000,emoji:"🏚️",tag:"property"},
    {name:"Cabin",price:120000,emoji:"🛖",tag:"property"},
    {name:"Chalet",price:300000,emoji:"⛷️",tag:"property"}
  ],

  "✈️ Air & Sea": [
    {name:"Commercial Plane Ticket",price:500,emoji:"✈️",tag:"travel"},
    {name:"Private Jet Flight",price:100000,emoji:"🛩️",tag:"travel"},
    {name:"Cruise Ticket",price:2000,emoji:"🚢",tag:"travel"},
    {name:"Submarine",price:10000000,emoji:"🛳️",tag:"travel"},
    {name:"Hot Air Balloon Ride",price:300,emoji:"🎈",tag:"travel"},
    {name:"Paragliding Session",price:150,emoji:"🪂",tag:"travel"},
    {name:"Sailboat",price:50000,emoji:"⛵",tag:"travel"},
    {name:"Jet Ski",price:8000,emoji:"🛥️",tag:"travel"},
    {name:"Ferry Ticket",price:20,emoji:"⛴️",tag:"travel"},
    {name:"Space Shuttle Ticket",price:5000000,emoji:"🚀",tag:"travel"},
    {name:"Kayak",price:500,emoji:"🛶",tag:"travel"},
    {name:"Fishing Boat",price:10000,emoji:"🎣",tag:"travel"},
    {name:"Luxury Cruise",price:200000,emoji:"🛳️",tag:"travel"},
    {name:"Hovercraft",price:500000,emoji:"🛴",tag:"travel"},
    {name:"Speedboat",price:80000,emoji:"🚤",tag:"travel"}
  ],

  "🟣 Science & Future": [
    {name:"Human Longevity Research",price:1500000,emoji:"🧬",tag:"future"},
    {name:"Global Solar Infrastructure",price:2200000,emoji:"☀️",tag:"future"},
    {name:"Climate Repair Program",price:3000000,emoji:"🌱",tag:"future"},
    {name:"Cure for a Rare Disease",price:4500000,emoji:"🧪",tag:"future"},
    {name:"Planetary Defense System",price:4000000,emoji:"🌍",tag:"future"},
    {name:"Synthetic Life Lab",price:11000000,emoji:"🧫",tag:"future"},
    {name:"Artificial General Intelligence",price:60000000,emoji:"🧠",tag:"future"},
    {name:"Deep Space Observatory",price:9500000,emoji:"🛰️",tag:"future"},
    {name:"Mars Colonization Program",price:80000000,emoji:"🧑‍🚀",tag:"future"},
    {name:"Black Hole Research Facility",price:25000000,emoji:"🕳️",tag:"future"}
  ],

  "🟠 World-Scale Projects": [
    {name:"Global Internet Access",price:10000000,emoji:"🌐",tag:"world"},
    {name:"Worldwide High-Speed Rail",price:12000000,emoji:"🚄",tag:"world"},
    {name:"Ocean Cleanup Network",price:9000000,emoji:"🌊",tag:"world"},
    {name:"Rebuild a Country",price:25000000,emoji:"🏗️",tag:"world"},
    {name:"Terraform a Desert",price:18000000,emoji:"🌍",tag:"world"},
    {name:"Stop Climate Change (Temporarily)",price:3000000,emoji:"❄️",tag:"world"},
    {name:"Infinite Energy Prototype",price:22000000,emoji:"🔋",tag:"world"},
    {name:"Global Navigation System",price:75000000,emoji:"🧭",tag:"world"},
    {name:"Floating Cities",price:14000000,emoji:"🏙️",tag:"world"},
    {name:"Interplanetary Trade Network",price:40000000,emoji:"🚀",tag:"world"}
  ],

  "🔴 Absurd / Endgame": [
    {name:"Buy Human Attention",price:100000000,emoji:"🧠",tag:"absurd"},
    {name:"Delete the Stock Market",price:85000000,emoji:"📉",tag:"absurd"},
    {name:"Pause Time for Everyone Else",price:200000000,emoji:"⏳",tag:"absurd"},
    {name:"Own the Observable Universe",price:900000000,emoji:"🌌",tag:"absurd"},
    {name:"Rewrite History Books",price:70000000,emoji:"🧾",tag:"absurd"},
    {name:"Buy Physics DLC",price:3500000000,emoji:"🪐",tag:"absurd"},
    {name:"Silence the Internet for 1 Hour",price:600000000,emoji:"📡",tag:"absurd"},
    {name:"Understand Everything",price:4200000000,emoji:"🤯",tag:"absurd"},
    {name:"End Irony",price:150000000,emoji:"🎭",tag:"absurd"},
    {name:"Reset Capitalism",price:8888888888,emoji:"🧨",tag:"absurd"}
  ]
};

// ================= RENDER CATEGORIES =================
function renderCategories(itemsObj = ITEMS) {
  const categoriesEl = document.getElementById('categories');
  categoriesEl.innerHTML = '';

  Object.entries(itemsObj).forEach(([categoryName, items]) => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';

    categoryDiv.innerHTML = `
      <div class="category-header">${categoryName}</div>
      <div class="items" id="items-${categoryName.replace(/\s+/g, '-')}"></div>
    `;

    categoriesEl.appendChild(categoryDiv);

    const itemsGrid = categoryDiv.querySelector('.items');
    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      itemDiv.innerHTML = `
        <span class="item-emoji">${item.emoji}</span>
        <div class="item-name">${item.name}</div>
        <div class="item-tag">${item.tag}</div>
        <div class="price">$${item.price.toLocaleString()}</div>
      `;
      itemDiv.onclick = () => addItem(item);
      itemsGrid.appendChild(itemDiv);
    });
  });
}

// ================= SEARCH FUNCTIONALITY =================
document.getElementById('searchInput').addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase().trim();

  if (!searchTerm) {
    renderCategories(ITEMS);
    return;
  }

  const filteredItems = {};

  Object.entries(ITEMS).forEach(([categoryName, items]) => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.tag.toLowerCase().includes(searchTerm)
    );

    if (filtered.length > 0) {
      filteredItems[categoryName] = filtered;
    }
  });

  renderCategories(filteredItems);
});

// ================= DIFFICULTY =================
function setDifficulty(level) {
  if (!DIFFICULTIES.hasOwnProperty(level)) return;

  if (Object.keys(cart).length > 0) {
    const confirmed = confirm('Changing your starting capital will clear your current portfolio. Continue?');
    if (!confirmed) return;
  }

  START_MONEY = DIFFICULTIES[level];
  cart = {};

  document.querySelectorAll('.diff-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === level);
  });

  resetPostCheckoutView();
  renderCart();
}

function resetPostCheckoutView() {
  const receiptEl = document.getElementById('receipt');
  receiptEl.style.display = 'none';
  receiptEl.innerHTML = '';

  document.querySelector('.cart').style.display = '';
  document.getElementById('categories').style.marginRight = '';
  document.querySelector('.search-bar').style.width = '';
  document.getElementById('cartHeading').textContent = 'Portfolio';

  const related = document.querySelector('.vatsal-related');
  if (related) related.setAttribute('hidden', '');
}

// ================= CART LOGIC =================
function addItem(item) {
  if (!cart[item.name]) {
    cart[item.name] = { ...item, qty: 0 };
  }
  cart[item.name].qty++;
  renderCart();
}

function decrementItem(name) {
  if (!cart[name]) return;

  cart[name].qty--;
  if (cart[name].qty <= 0) {
    delete cart[name];
  }
  renderCart();
}

function removeItem(name) {
  delete cart[name];
  renderCart();
}

function calculateTotals() {
  let total = 0;
  let assets = 0;
  Object.values(cart).forEach(item => {
    total += item.price * item.qty;
    assets += item.qty;
  });
  return {
    total,
    assets,
    remaining: START_MONEY - total
  };
}

function formatSigned(amount) {
  return amount >= 0
    ? '$' + amount.toLocaleString()
    : '−$' + Math.abs(amount).toLocaleString();
}

function renderCart() {
  const cartItemsEl = document.getElementById('cartItems');
  cartItemsEl.innerHTML = '';

  Object.values(cart).forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <span>${item.emoji} ${item.name} × ${item.qty}</span>
      <div class="cart-controls">
        <button onclick="addItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">+</button>
        <button onclick="decrementItem('${item.name}')">−</button>
        <button onclick="removeItem('${item.name}')">✖</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  const { total, assets, remaining } = calculateTotals();

  const cartTotalEl = document.getElementById('cartTotal');
  const moneyFillEl = document.getElementById('moneyFill');
  const heroAmountEl = document.getElementById('heroAmount');
  const assetsCountEl = document.getElementById('assetsCount');

  cartTotalEl.innerHTML = `
    Net Worth Spent: $${total.toLocaleString()}<br>
    Remaining Fortune: ${formatSigned(remaining)}
  `;

  assetsCountEl.textContent = assets;
  heroAmountEl.textContent = formatSigned(remaining);

  const percent = Math.max(0, remaining / START_MONEY) * 100;
  moneyFillEl.style.width = percent + '%';

  if (remaining < 0) {
    moneyFillEl.classList.add('negative');
    heroAmountEl.classList.add('negative');
  } else {
    moneyFillEl.classList.remove('negative');
    heroAmountEl.classList.remove('negative');
  }
}

// ================= CHECKOUT =================
function checkout() {
  if (Object.keys(cart).length === 0) {
    alert('Your portfolio is empty! Add some assets first.');
    return;
  }

  const { total, remaining } = calculateTotals();
  const receiptEl = document.getElementById('receipt');

  let html = `
    <div class="receipt-header">Portfolio Statement</div>
    <div class="receipt-eyebrow">Bill Gates &middot; Wealth Management</div>
  `;

  Object.values(cart).forEach(item => {
    html += `
      <div class="receipt-item">
        <span>${item.emoji} ${item.name} × ${item.qty}</span>
        <span>$${(item.price * item.qty).toLocaleString()}</span>
      </div>
    `;
  });

  html += `
    <div class="gold-rule thin"></div>
    <div class="receipt-total">
      <span>Total Spent</span>
      <span style="color:#c9a961">$${total.toLocaleString()}</span>
    </div>
    <div class="receipt-total" style="color: ${remaining >= 0 ? '#eae7df' : '#e0705c'}">
      <span>Remaining Fortune</span>
      <span>${formatSigned(remaining)}</span>
    </div>
  `;

  const quote = remaining >= 0
    ? `You spent ${'$' + total.toLocaleString()}. Bill Gates is still richer than you.`
    : `You spent ${'$' + total.toLocaleString()} &mdash; ${formatSigned(remaining)} more than he has. Even Bill Gates has limits.`;

  html += `<div class="receipt-quote">${quote}</div>`;

  receiptEl.innerHTML = html;
  receiptEl.style.display = 'block';

  // Update cart header
  document.getElementById('cartHeading').textContent = 'Statement Filed';

  // Scroll to receipt
  setTimeout(() => {
    receiptEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  // Hide portfolio sidebar after checkout
  document.querySelector('.cart').style.display = 'none';
  document.getElementById('categories').style.marginRight = '0';
  document.querySelector('.search-bar').style.width = 'calc(100% - 32px)';

  // Clear cart
  cart = {};
  renderCart();

  // Show footer below receipt
  window.VatsalLolGameComplete?.();
  const related = document.querySelector('.vatsal-related');
  if (related) {
    related.removeAttribute('hidden');
    document.getElementById('receipt').after(related);
  }
}

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderCart();

  // Initialize money bar
  const moneyFillEl = document.getElementById('moneyFill');
  moneyFillEl.style.width = '100%';
});
