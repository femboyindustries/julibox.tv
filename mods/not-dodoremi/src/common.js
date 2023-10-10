// hiiiiiiiiiii

function $$getArrowSize() {
  return 91;
}

let $$mbuffer = {};

function $$m(mod) {
  if ($$mbuffer[mod]) return $$mbuffer[mod] / 100;
  return 0;
}

// outputs pixels
function $$getNoteX(y, time, lane) {
  return (
    $$m('drunk') * Math.cos((time + y * 2 + lane * 0.2)) * $$getArrowSize() * 0.5
  );
}
// outputs pixels
function $$getNoteY(y, time, lane) {
  return (
    $$m('tipsy') * Math.cos((time * 1.2 + lane * 1.8)) * $$getArrowSize() * 0.4
  );
}

function $$update(component) {
  const manager = component.manager;
  const time = manager.now / 1000;
  // shhhhhhh it's ok
  const beat = $$getBeat(manager, manager.now);

  $$mbuffer['drunk'] = Math.abs(Math.sin(beat * Math.PI)) * 100;
  $$mbuffer['tipsy'] = Math.abs(Math.sin(beat * Math.PI)) * 100;
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