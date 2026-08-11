const MAP_WIDTH = 1000;
const MAP_HEIGHT = 450;
const COLOR_LAND = '#111111';
const COLOR_BIRTH = '#FFD54A';
const COLOR_DEATH = '#FF4D4D';

let globalBirths = 0;
let globalDeaths = 0;
let globalGrowth = 0;

const countryStats = {};

const elGlobalBirths = document.getElementById('global-births');
const elGlobalDeaths = document.getElementById('global-deaths');
const elGlobalGrowth = document.getElementById('global-growth');
const elTableBody = document.getElementById('country-table-body');
const elSvgMap = document.getElementById('world-map');

function loadAndStart() {
  if (window.WORLD_GEO_DATA && window.POPULATION_DATA) {
    initMap(window.WORLD_GEO_DATA, window.POPULATION_DATA);
    initSimulation(window.POPULATION_DATA);
  } else {
    console.error('Data not loaded. Ensure data.js is included before script.js.');
  }
}

loadAndStart();

function initMap(geoData, popData) {
  const nameToId = {};
  for (const [id, info] of Object.entries(popData)) {
    nameToId[info.name] = id;
  }

  geoData.features.forEach(feature => {
    const name = feature.properties.name;
    if (name === 'Antarctica') return;
    const id = nameToId[name];
    
    if (!feature.geometry) return;

    let pathD = '';
    if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates.forEach(ring => {
        pathD += ringToPath(ring) + ' ';
      });
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach(polygon => {
        polygon.forEach(ring => {
          pathD += ringToPath(ring) + ' ';
        });
      });
    }

    if (!pathD) return;

    const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathEl.setAttribute('d', pathD.trim());
    pathEl.setAttribute('class', 'country-path');
    
    if (id) {
      pathEl.setAttribute('id', `country-${id}`);
    }

    elSvgMap.appendChild(pathEl);
  });
}

function project(lon, lat) {
  const D3_SCALE = 154.39;
  const D3_TX = 500;
  const D3_TY = 269.415;
  const lambda = lon * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  const x = D3_TX + D3_SCALE * lambda;
  const y = D3_TY - D3_SCALE * phi;
  return [x, y];
}

function ringToPath(ring) {
  let prevLon = ring[0][0];
  return ring.map((coord, i) => {
    let lon = coord[0];
    let lat = coord[1];
    
    // Antimeridian unwrap
    if (lon - prevLon > 180) lon -= 360;
    else if (prevLon - lon > 180) lon += 360;
    prevLon = lon;
    
    const [x, y] = project(lon, lat);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';
}

const FLAGS = {
  "IND": "🇮🇳", "CHN": "🇨🇳", "USA": "🇺🇸", "IDN": "🇮🇩", "PAK": "🇵🇰",
  "NGA": "🇳🇬", "BRA": "🇧🇷", "BGD": "🇧🇩", "RUS": "🇷🇺", "MEX": "🇲🇽",
  "ETH": "🇪🇹", "JPN": "🇯🇵", "PHL": "🇵🇭", "EGY": "🇪🇬", "COD": "🇨🇩",
  "VNM": "🇻🇳", "IRN": "🇮🇷", "TUR": "🇹🇷", "DEU": "🇩🇪", "FRA": "🇫🇷",
  "GBR": "🇬🇧", "ITA": "🇮🇹", "ZAF": "🇿🇦", "KEN": "🇰🇪", "KOR": "🇰🇷",
  "CAN": "🇨🇦", "AUS": "🇦🇺"
};

const activeCountries = new Set();

function initSimulation(popData) {
  for (const [id, info] of Object.entries(popData)) {
    countryStats[id] = {
      id: id,
      name: info.name,
      population: info.population,
      births: 0,
      deaths: 0,
      birthInterval: info.birthInterval,
      deathInterval: info.deathInterval
    };
  }

  // Clear table initially
  elTableBody.innerHTML = '';

  let timeMs = 0;
  setInterval(() => {
    timeMs += 200;
    const timeSec = timeMs / 1000;
    const prevTimeSec = (timeMs - 200) / 1000;
    let tableNeedsUpdate = false;

    for (const stat of Object.values(countryStats)) {
      // Check if birth occurred in this 200ms slice
      if (Math.floor(timeSec / stat.birthInterval) > Math.floor(prevTimeSec / stat.birthInterval)) {
        handleEvent(stat.id, 'birth');
        if (!activeCountries.has(stat.id)) {
          activeCountries.add(stat.id);
          addCountryToTable(stat);
        }
        tableNeedsUpdate = true;
      }
      // Check if death occurred in this 200ms slice
      if (Math.floor(timeSec / stat.deathInterval) > Math.floor(prevTimeSec / stat.deathInterval)) {
        handleEvent(stat.id, 'death');
        if (!activeCountries.has(stat.id)) {
          activeCountries.add(stat.id);
          addCountryToTable(stat);
        }
        tableNeedsUpdate = true;
      }
    }

    if (tableNeedsUpdate) {
      updateTableValues();
    }
  }, 200);
}

function handleEvent(id, type) {
  const stat = countryStats[id];
  if (!stat) return;

  if (type === 'birth') {
    stat.births++;
    stat.population++;
    globalBirths++;
    globalGrowth++;
    blinkCountry(id, COLOR_BIRTH);
  } else {
    stat.deaths++;
    stat.population--;
    globalDeaths++;
    globalGrowth--;
    blinkCountry(id, COLOR_DEATH);
  }

  updateGlobalCounters();
}

function blinkCountry(id, color) {
  const el = document.getElementById(`country-${id}`);
  if (!el) return;

  el.style.transition = 'none';
  el.style.fill = color;

  setTimeout(() => {
    el.style.transition = 'fill 0.3s ease';
    el.style.fill = COLOR_LAND;
  }, 100);
}

function updateGlobalCounters() {
  elGlobalBirths.textContent = globalBirths.toLocaleString();
  elGlobalDeaths.textContent = globalDeaths.toLocaleString();
  
  elGlobalGrowth.textContent = (globalGrowth > 0 ? '+' : '') + globalGrowth.toLocaleString();
  if (globalGrowth < 0) {
    elGlobalGrowth.parentElement.style.color = 'var(--color-death)';
  } else if (globalGrowth > 0) {
    elGlobalGrowth.parentElement.style.color = 'var(--color-growth)';
  } else {
    elGlobalGrowth.parentElement.style.color = 'inherit';
  }
}

function addCountryToTable(stat) {
  const flag = FLAGS[stat.id] || '🏳️';
  const tr = document.createElement('tr');
  tr.id = `row-${stat.id}`;
  tr.innerHTML = `
    <td class="col-country"><span class="emoji">${flag}</span> ${stat.name}</td>
    <td class="col-number cell-birth" id="cell-birth-${stat.id}">0</td>
    <td class="col-number cell-death" id="cell-death-${stat.id}">0</td>
    <td class="col-number cell-pop" id="cell-pop-${stat.id}">${stat.population.toLocaleString()}</td>
  `;
  elTableBody.appendChild(tr);
}

function updateTableValues() {
  const rows = Array.from(elTableBody.children);
  // Sort rows based on births descending
  rows.sort((a, b) => {
    const idA = a.id.replace('row-', '');
    const idB = b.id.replace('row-', '');
    return countryStats[idB].births - countryStats[idA].births;
  });
  
  rows.forEach(row => elTableBody.appendChild(row));

  for (const id of activeCountries) {
    const stat = countryStats[id];
    const elBirth = document.getElementById(`cell-birth-${stat.id}`);
    const elDeath = document.getElementById(`cell-death-${stat.id}`);
    const elPop = document.getElementById(`cell-pop-${stat.id}`);
    
    if (elBirth && elDeath && elPop) {
      if (stat.births > 0) {
        elBirth.textContent = stat.births.toLocaleString();
        elBirth.classList.add('val-birth');
      }
      
      if (stat.deaths > 0) {
        elDeath.textContent = stat.deaths.toLocaleString();
        elDeath.classList.add('val-death');
      }
      
      elPop.textContent = stat.population.toLocaleString();
    }
  }
}
