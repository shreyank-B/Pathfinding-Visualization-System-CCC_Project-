// ============================================================
//   City Route Planner — script.js
//   Fetches graph data from Flask API, renders SVG,
//   calls Dijkstra endpoint and animates the result.
// ============================================================

const API = 'http://localhost:5001';

let graphData = null;   // { cities, edges }
let selectedSrc  = 0;
let selectedDest = 1;

// ── INIT ──────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch(`${API}/api/graph`);
    graphData = await res.json();
    populateDropdowns();
    drawGraph();
    setStatus('idle', 'Select source and destination cities to find the shortest path.');
  } catch (e) {
    setStatus('error', 'Cannot connect to server. Make sure app.py is running on port 5001.');
  }
}

// ── DROPDOWNS ─────────────────────────────────────────────
function populateDropdowns() {
  const srcSel  = document.getElementById('source');
  const destSel = document.getElementById('destination');
  graphData.cities.forEach(c => {
    srcSel.innerHTML  += `<option value="${c.id}">${c.name}</option>`;
    destSel.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
  destSel.value = '1'; // Default: Mumbai → Delhi
}

// ── DRAW GRAPH ────────────────────────────────────────────
function drawGraph(pathEdges = [], visitedNodes = [], pathNodes = []) {
  const svg    = document.getElementById('graphSVG');
  const eGroup = document.getElementById('edgesGroup');
  const lGroup = document.getElementById('edgeLabelsGroup');
  const nGroup = document.getElementById('nodesGroup');
  const nlGroup= document.getElementById('nodeLabelsGroup');

  eGroup.innerHTML = '';
  lGroup.innerHTML = '';
  nGroup.innerHTML = '';
  nlGroup.innerHTML = '';

  const cities = graphData.cities;
  const edges  = graphData.edges;

  // Draw edges
  edges.forEach(([u, v, w]) => {
    const cu = cities[u], cv = cities[v];
    const mx = (cu.x + cv.x) / 2, my = (cu.y + cv.y) / 2;
    const isPath    = pathEdges.some(([a,b]) => (a===u&&b===v)||(a===v&&b===u));
    const isVisited = !isPath && (visitedNodes.includes(u) || visitedNodes.includes(v));

    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', cu.x); line.setAttribute('y1', cu.y);
    line.setAttribute('x2', cv.x); line.setAttribute('y2', cv.y);
    line.setAttribute('class', `edge${isPath?' active':isVisited?' visited':''}`);
    if (isPath) line.classList.add('path-animate');
    eGroup.appendChild(line);

    // Distance label
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x', mx); txt.setAttribute('y', my - 5);
    txt.setAttribute('text-anchor','middle');
    txt.setAttribute('class', `edge-label${isPath?' active':''}`);
    txt.textContent = w + ' km';
    lGroup.appendChild(txt);
  });

  // Draw nodes
  cities.forEach(c => {
    const isSrc  = c.id === selectedSrc;
    const isDest = c.id === selectedDest;
    const inPath = pathNodes.includes(c.id);
    const isVis  = visitedNodes.includes(c.id) && !inPath;

    let cls = 'node';
    if (isSrc  && pathNodes.length) cls += ' source';
    if (isDest && pathNodes.length) cls += ' dest';
    if (inPath && !isSrc && !isDest) cls += ' active';
    else if (isVis) cls += ' visited';

    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx', c.x); circle.setAttribute('cy', c.y); circle.setAttribute('r', 18);
    circle.setAttribute('class', cls);
    circle.setAttribute('id', `node-${c.id}`);
    circle.addEventListener('click', () => onNodeClick(c.id));
    nGroup.appendChild(circle);

    // City name label
    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x', c.x); label.setAttribute('y', c.y - 24);
    label.setAttribute('text-anchor','middle');
    label.setAttribute('class','node-label');
    label.textContent = c.name;
    nlGroup.appendChild(label);

    // City ID sub-label
    const sub = document.createElementNS('http://www.w3.org/2000/svg','text');
    sub.setAttribute('x', c.x); sub.setAttribute('y', c.y + 4);
    sub.setAttribute('text-anchor','middle');
    sub.setAttribute('class','node-sub');
    sub.textContent = c.id;
    nlGroup.appendChild(sub);
  });
}

// ── NODE CLICK ────────────────────────────────────────────
let clickPhase = 'src'; // 'src' or 'dest'
function onNodeClick(id) {
  if (clickPhase === 'src') {
    document.getElementById('source').value = id;
    selectedSrc = id;
    clickPhase = 'dest';
    setStatus('idle', `Source set to ${graphData.cities[id].name}. Now click destination.`);
  } else {
    document.getElementById('destination').value = id;
    selectedDest = id;
    clickPhase = 'src';
    setStatus('idle', `Destination set to ${graphData.cities[id].name}. Click "Find Shortest Path".`);
  }
}

// ── FIND PATH ─────────────────────────────────────────────
async function findPath() {
  const srcVal = document.getElementById('source').value;
  const destVal = document.getElementById('destination').value;

  if (srcVal === "" || destVal === "") {
    setStatus('error', 'Please select both source and destination cities.');
    return;
  }

  selectedSrc  = parseInt(srcVal);
  selectedDest = parseInt(destVal);

  if (isNaN(selectedSrc) || isNaN(selectedDest)) {
    setStatus('error', 'Invalid city selection.');
    return;
  }

  if (selectedSrc === selectedDest) {
    setStatus('error', 'Source and destination must be different cities!');
    return;
  }

  setStatus('running', 'Running Dijkstra\'s Algorithm…');
  document.getElementById('findBtn').disabled = true;

  try {
    const res  = await fetch(`${API}/api/find-path`, {
      method : 'POST',
      headers: {'Content-Type':'application/json'},
      body   : JSON.stringify({ source: selectedSrc, destination: selectedDest })
    });
    const data = await res.json();

    if (data.error) {
      setStatus('error', data.error);
      document.getElementById('findBtn').disabled = false;
      return;
    }

    // Build path edges from path array
    const pathEdges = [];
    for (let i = 0; i < data.path.length - 1; i++)
      pathEdges.push([data.path[i], data.path[i+1]]);

    drawGraph(pathEdges, data.visited, data.path);
    showResult(data);
    setStatus('done',
      `✅ Shortest path found! Distance: ${data.distance} km through ${data.path.length} cities.`);
  } catch (e) {
    setStatus('error', 'Server error. Make sure app.py is running.');
  }

  document.getElementById('findBtn').disabled = false;
}

// ── SHOW RESULT ───────────────────────────────────────────
function showResult(data) {
  const card = document.getElementById('resultCard');
  card.style.display = 'block';

  document.getElementById('distValue').textContent = data.distance + ' km';

  // Path visual (city chips + arrows)
  const pathVis = document.getElementById('pathVisual');
  pathVis.innerHTML = data.path.map((id, i) => {
    const name = graphData.cities[id].name;
    const chip = `<span class="path-city">${name}</span>`;
    return i < data.path.length - 1 ? chip + `<span class="path-arrow">→</span>` : chip;
  }).join('');

  // Step breakdown
  const steps = document.getElementById('stepsList');
  steps.innerHTML = '';
  const edges = graphData.edges;
  for (let i = 0; i < data.path.length - 1; i++) {
    const u = data.path[i], v = data.path[i+1];
    const edge = edges.find(([a,b]) => (a===u&&b===v)||(a===v&&b===u));
    const dist = edge ? edge[2] : '?';
    const div = document.createElement('div');
    div.className = 'step-item';
    div.innerHTML = `
      <span class="step-cities">${graphData.cities[u].name} → ${graphData.cities[v].name}</span>
      <span class="step-dist">${dist} km</span>`;
    steps.appendChild(div);
  }
}

// ── CLEAR ─────────────────────────────────────────────────
function clearAll() {
  document.getElementById('resultCard').style.display = 'none';
  clickPhase = 'src';
  drawGraph();
  setStatus('idle', 'Cleared. Select source and destination cities to find the shortest path.');
}

// ── STATUS ────────────────────────────────────────────────
function setStatus(type, msg) {
  const dot  = document.querySelector('.status-dot');
  const text = document.getElementById('statusText');
  dot.className = `status-dot ${type}`;
  text.textContent = msg;
}

// ── EVENTS ────────────────────────────────────────────────
document.getElementById('findBtn').addEventListener('click', findPath);
document.getElementById('clearBtn').addEventListener('click', clearAll);
document.getElementById('swapBtn').addEventListener('click', () => {
  const srcSel  = document.getElementById('source');
  const destSel = document.getElementById('destination');
  const tmp = srcSel.value;
  srcSel.value  = destSel.value;
  destSel.value = tmp;
});

// ── START ─────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);
