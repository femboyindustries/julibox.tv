// hiiiiiiiiiii

// in pixels
let $$laneWidth = 150;
// in pixels
let $$noteSize = 87;

let $$m = new $$Modfile();

// outputs pixels
function $$getNoteX(y, time, lane) {
  return (
    $$m.get('drunk') / 100 * Math.cos(time + y * 2 + lane * 0.2 + $$m.get('drunkoffset') / 100 * Math.PI) * $$noteSize * 0.5 +
    $$m.get('movex') / 100 * $$laneWidth + 
    $$m.get(`movex${lane}`) / 100 * $$laneWidth +
    $$m.get('flip') / 100 * $$laneWidth * (3 - lane * 2) +
    $$m.get('invert') / 100 * (((lane + 1) % 2) * 2 - 1) * $$laneWidth
  );
}
// outputs pixels
function $$getNoteY(y, time, lane) {
  return (
    $$m.get('tipsy') / 100 * Math.cos(time * 1.2 + lane * 1.8 + $$m.get('tipsyoffset') / 100 * Math.PI) * $$noteSize * 0.4 +
    $$m.get('movey') / 100 * $$laneWidth + 
    $$m.get(`movey${lane}`) / 100 * $$laneWidth +
    $$m.get('wave') / 100 * Math.sin(y * 6) * $$noteSize * 0.7
  );
}
// outputs pixels
function $$getNoteZ(y, time, lane) {
  return (
    $$m.get('bumpy') / 100 * Math.sin(y * 6 + $$m.get('bumpyoffset') / 100 * Math.PI) * 40 +
    $$m.get('movez') / 100 * $$laneWidth +
    $$m.get(`movez${lane}`) / 100 * $$laneWidth
  );
}
function $$getNoteScaleX(y, time, lane) {
  return (
    1
    - $$m.get('tiny') / 200
    - $$m.get(`tiny${lane}`) / 200
    - $$m.get('tinyx') / 200
    - $$m.get(`tinyx${lane}`) / 200
  );
}
function $$getNoteScaleY(y, time, lane) {
  return (
    1
    - $$m.get('tiny') / 200
    - $$m.get(`tiny${lane}`) / 200
    - $$m.get('tinyy') / 200
    - $$m.get(`tinyy${lane}`) / 200
  );
}
function $$getNoteScaleZ(y, time, lane) {
  return (
    1
    - $$m.get('tinyz') / 200
    - $$m.get(`tinyz${lane}`) / 200
  );
}
function $$getNoteRotationX(y, time, lane) {
  return (
    $$m.get('confusionoffsetx') +
    $$m.get(`confusionoffsetx${lane}`)
  )
}
function $$getNoteRotationY(y, time, lane) {
  return (
    $$m.get('confusionoffsety') +
    $$m.get(`confusionoffsety${lane}`)
  )
}
function $$getNoteRotationZ(y, time, lane) {
  return (
    $$m.get('confusionoffset') +
    $$m.get(`confusionoffset${lane}`) +
    $$m.get('confusionoffsetz') +
    $$m.get(`confusionoffsetz${lane}`)
  )
}

let $$debug;

function $$update(component) {
  const visualsLayer = document.querySelector('.visuals');
  if (!visualsLayer) return; // hasn't loaded yet!

  if (!$$debug) {
    const node = document.createElement('div');
    node.style.position = 'absolute';
    node.style.top = '1em';
    node.style.left = '1em';
    node.style.fontSize = '16px';
    node.style.textAlign = 'left';
    node.style.fontFamily = 'monospace';
    visualsLayer.appendChild(node);
    $$debug = node;
  }

  const constraner = document.querySelector('.constrainer');
  if (constraner) {
    $$laneWidth = constraner.clientWidth / component.layout.lanes.length;
  }
  const lane = document.querySelector('.lane');
  if (lane) {
    $$noteSize = lane.clientWidth;
  }

  const manager = component.manager;
  const beat = $$getBeat(manager, manager.now);

  $$m.update(beat);

  if ($$debug) {
    $$debug.innerText = `B${Math.floor(beat * 100) / 100} T${Math.floor((manager.now / 1000) * 100) / 100}` + '\n' +
      Object.entries($$m.modBuffer).map(([k, v]) => `${v}% ${k}`).join('\n');
  }
}

// biblically accurate
function $$getBeat(manager, s) {
  const midxR = manager.guide.findIndex(g => g[0] > s);
  if (midxR === -1 || midxR === 0) return 0;

  const measure = manager.guide[midxR - 1];
  const bidxR = measure.findIndex(b => b > s);
  if (bidxR === -1 || bidxR === 0) return ((s - measure[0]) / (manager.guide[midxR][0] - measure[0]) + (midxR - 1)) * 4; // fall back to getMeasure alg

  const beatStart = measure[bidxR - 1];
  const beatEnd = measure[bidxR];

  return (s - beatStart) / (beatEnd - beatStart) + (bidxR - 1) + (midxR - 1) * 4;
}

// slightly inaccurate
function $$getMeasure(manager, s) {
  const idxR = manager.guide.findIndex(g => g[0] > s);
  if (idxR === -1 || idxR === 0) return 0;

  const measureStart = manager.guide[idxR - 1][0];
  const measureEnd = manager.guide[idxR][0];

  return (s - measureStart) / (measureEnd - measureStart) + (idxR - 1);
}

const $$quants = [4, 8, 12, 16, 24, 32, 64, 192];
function $$quantize(m) {
  let mindist = 9e9;
  let minq = 192;
  for (let q of $$quants) {
    const rel = m * q; // 0.25 * 4 -> 1
    const dist = Math.abs(Math.round(rel) - rel); // how far off are we with the guess?
    if (dist < mindist) {
      mindist = dist;
      minq = q;
      if (dist < 0.01) break;
    }
  }
  return minq;
}

function $$transforms(t) {
  return Object.entries(t).map(([k, v]) => `${k}(${v})`).join(' ');
}

if ($$songPath !== "null") {
  let audio = new Audio($$songPath);
  $$m.func(Number.MIN_VALUE, () => {audio.play()});
}