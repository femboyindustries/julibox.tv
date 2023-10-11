// hiiiiiiiiiii

const $$_bounceOut = function (x) {
	const n1 = 7.5625;
	const d1 = 2.75;

	if (x < 1 / d1) {
		return n1 * x * x;
	} else if (x < 2 / d1) {
		return n1 * (x -= 1.5 / d1) * x + 0.75;
	} else if (x < 2.5 / d1) {
		return n1 * (x -= 2.25 / d1) * x + 0.9375;
	} else {
		return n1 * (x -= 2.625 / d1) * x + 0.984375;
	}
};

// https://github.com/ai/easings.net/blob/master/src/easings/easingsFunctions.ts#L33
const $$eases = {
	linear: (x) => x,
	easeInQuad: function (x) {
		return x * x;
	},
	easeOutQuad: function (x) {
		return 1 - (1 - x) * (1 - x);
	},
	easeInOutQuad: function (x) {
		return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
	},
	easeInCubic: function (x) {
		return x * x * x;
	},
	easeOutCubic: function (x) {
		return 1 - Math.pow(1 - x, 3);
	},
	easeInOutCubic: function (x) {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	easeInQuart: function (x) {
		return x * x * x * x;
	},
	easeOutQuart: function (x) {
		return 1 - Math.pow(1 - x, 4);
	},
	easeInOutQuart: function (x) {
		return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
	},
	easeInQuint: function (x) {
		return x * x * x * x * x;
	},
	easeOutQuint: function (x) {
		return 1 - Math.pow(1 - x, 5);
	},
	easeInOutQuint: function (x) {
		return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
	},
	easeInSine: function (x) {
		return 1 - Math.cos((x * Math.PI) / 2);
	},
	easeOutSine: function (x) {
		return Math.sin((x * Math.PI) / 2);
	},
	easeInOutSine: function (x) {
		return -(Math.cos(Math.PI * x) - 1) / 2;
	},
	easeInExpo: function (x) {
		return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
	},
	easeOutExpo: function (x) {
		return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
	},
	easeInOutExpo: function (x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: x < 0.5
			? Math.pow(2, 20 * x - 10) / 2
			: (2 - Math.pow(2, -20 * x + 10)) / 2;
	},
	easeInCirc: function (x) {
		return 1 - Math.sqrt(1 - Math.pow(x, 2));
	},
	easeOutCirc: function (x) {
		return Math.sqrt(1 - Math.pow(x - 1, 2));
	},
	easeInOutCirc: function (x) {
		return x < 0.5
			? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
			: (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
	},
	easeInBack: function (x) {
		return c3 * x * x * x - c1 * x * x;
	},
	easeOutBack: function (x) {
		return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
	},
	easeInOutBack: function (x) {
		return x < 0.5
			? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
			: (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
	},
	easeInElastic: function (x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
	},
	easeOutElastic: function (x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
	},
	easeInOutElastic: function (x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: x < 0.5
			? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
			: (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
	},
	easeInBounce: function (x) {
		return 1 - $$_bounceOut(1 - x);
	},
	easeOutBounce: $$_bounceOut,
	easeInOutBounce: function (x) {
		return x < 0.5
			? (1 - $$_bounceOut(1 - 2 * x)) / 2
			: (1 + $$_bounceOut(2 * x - 1)) / 2;
	},

  instant: (_) => 1
};

// twink template - a mirin-like minimal template
class $$Modfile {
  constructor() {
  }
  
  funcs = [];
  #funcsQueue = [];
  
  func(beat, func) {
    this.funcs.push({
      b: beat,
      func: func
    });
  }
  
  funcEases = [];
  #funcEasesActive = [];
  #funcEasesInactive = [];
  
  funcEase(beat, len, ease, from, to, func) {
    this.funcEases.push({
      b: beat,
      len: len,
      ease: ease,
      from: from,
      to: to,
      func: func
    });
  }
  
  perframes = [];
  #perframesActive = [];
  #perframesInactive = [];
  
  perframe(beat, len, func) {
    this.perframes.push({
      b: beat,
      len: len,
      func: func
    });
  }
  
  eases = [];
  #easesActive = [];
  #easesInactive = [];
  
  ease(beat, len, ease, ...modsArray) {
    let mods = {};
    let modBuffer = null;
    
    for (let arg of modsArray) {
      if (modBuffer === null) {
        modBuffer = arg
      } else {
        mods[arg] = modBuffer;
        modBuffer = null;
      }
    }
    
    if (modBuffer !== null) {
      throw new Error("Uneven count of mods and percentages");
    }
    
    this.eases.push({
      b: beat,
      len: len,
      ease: ease,
      mods: mods,
      transient: ease(1) < 0.5
    });
  }
  set(beat, ...mods) {
    this.ease(beat, 0, $$eases.instant, ...mods)
  }
  
  modBuffer = [];
  #modValues = [];
  
  get(mod) {
    return this.modBuffer[mod] || 0;
  }
  
  update(beat) {
    // funcs
    
    for (let i = this.#funcsQueue.length - 1; i >= 0; i--) {
      let f = this.#funcsQueue[i];
      if (beat >= f.b) {
        f.func(beat);
        this.#funcsQueue.splice(i, 1);
      } else {
        break;
      }
    }
    
    // perframes
    
    for (let i = this.#perframesInactive.length - 1; i >= 0; i--) {
      let f = this.#perframesInactive[i];
      if (beat >= f.b) {
        this.#perframesInactive.splice(i, 1);
        this.#perframesActive.push(f);
      } else {
        break;
      }
    }
    
    for (let i = this.#perframesActive.length - 1; i >= 0; i--) {
      let f = this.#perframesActive[i];
      if (beat < (f.b + f.len)) {
        f.func(f.b);
      } else {
        this.#perframesActive.splice(i, 1);
      }
    }
    
    // func eases
    
    for (let i = this.#funcEasesInactive.length - 1; i >= 0; i--) {
      let f = this.#funcEasesInactive[i];
      if (beat >= f.b) {
        this.#funcEasesInactive.splice(i, 1);
        this.#funcEasesActive.push(f);
      } else {
        break;
      }
    }
    
    for (let i = this.#funcEasesActive.length - 1; i >= 0; i--) {
      let f = this.#funcEasesActive[i];
      if (beat < (f.b + f.len)) {
        let a = (beat - f.b) / f.len;
        let b = f.ease(a);
        f.func(f.from * (1 - b) + f.to * b, beat);
      } else {
        if (f.ease(1) >= 0.5) {
          f.func(f.to, beat);
        } else {
          f.func(f.from, beat);
        }
        this.#funcEasesActive.splice(i, 1);
      }
    }
    
    // eases
    
    let modOffsets = {};
    
    for (let i = this.#easesInactive.length - 1; i >= 0; i--) {
      let e = this.#easesInactive[i];
      if (beat >= e.b) {
        this.#easesInactive.splice(i, 1);
        this.#easesActive.push(e);
        
        if (!e.transient) {
          for (let [mod, value] of Object.entries(e.mods)) {
            let old = this.#modValues[mod] || 0;
            this.#modValues[mod] = value;
            modOffsets[mod] = 0;
            e.mods[mod] = value - old;
          }
        }
      } else {
        break;
      }
    }
    
    for (let i = this.#easesActive.length - 1; i >= 0; i--) {
      let e = this.#easesActive[i];
      if (beat < (e.b + e.len)) {
        let a = (beat - e.b) / e.len;
        let b = e.ease(a);
        if (e.transient) {
          for (const [mod, value] of Object.entries(e.mods)) {
            modOffsets[mod] = (modOffsets[mod] || 0) + value * b;
          }
        } else {
          for (const [mod, diff] of Object.entries(e.mods)) {
            modOffsets[mod] = (modOffsets[mod] || 0) - diff * (1 - b);
          }
        }
      } else {
        this.#easesActive.splice(i, 1);
        for (let mod in e.mods) {
          modOffsets[mod] = (modOffsets[mod] || 0);
        }
      }
    }
    
    for (const [mod, offset] of Object.entries(modOffsets)) {
      this.modBuffer[mod] = (this.#modValues[mod] || 0) + offset;
    }
  }
  
  finalize() {
    this.funcs.sort((a, b) => b.b - a.b);
    this.funcEases.sort((a, b) => b.b - a.b);
    this.perframes.sort((a, b) => b.b - a.b);
    this.eases.sort((a, b) => b.b - a.b);
    
    this.#funcsQueue = [...this.funcs];
    this.#funcEasesInactive = [...this.funcEases];
    this.#perframesInactive = [...this.perframes];
    this.#easesInactive = [...this.eases];
  }
}

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