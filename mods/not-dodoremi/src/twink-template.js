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

  #ease(add, beat, len, ease, ...modsArray) {
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
      transient: ease(1) < 0.5,
      add: add
    });
  }
  
  ease(beat, len, ease, ...modsArray) {
    this.#ease(false, beat, len, ease, ...modsArray);
  }
  add(beat, len, ease, ...modsArray) {
    this.#ease(true, beat, len, ease, ...modsArray);
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
        f.func(beat);
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
            modOffsets[mod] = 0;
            if (e.add) {
              this.#modValues[mod] = old + value;
              e.mods[mod] = value;
            } else {
              this.#modValues[mod] = value;
              e.mods[mod] = value - old;
            }
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

  static sort(arr) {
    return arr.map((s, i) => [s, i]).sort((a, b) => (b[0].b - a[0].b) || (b[1] - a[1])).map(([s, i]) => s);
  }
  
  finalize() {
    this.modBuffer = [];
    this.#modValues = [];

    this.funcs = $$Modfile.sort(this.funcs);
    this.funcEases = $$Modfile.sort(this.funcEases);
    this.perframes = $$Modfile.sort(this.perframes);
    this.eases = $$Modfile.sort(this.eases);
    
    this.#funcsQueue = [...this.funcs];
    this.#funcEasesInactive = [...this.funcEases];
    this.#funcEasesActive = [];
    this.#perframesInactive = [...this.perframes];
    this.#perframesActive = [];
    this.#easesInactive = [...this.eases.map(e => ({...e, mods: structuredClone(e.mods)}))];
    this.#easesActive = [];

    console.info('%c[twink-template]', 'color:#aaf;background-color:#222', `loaded ${this.funcs.length} funcs, ${this.funcEases.length} func eases, ${this.perframes.length} perframes, ${this.eases.length} eases`)
  }

  reset() {
    this.modBuffer = [];
    this.#modValues = [];
    this.funcs = [];
    this.funcEases = [];
    this.perframes = [];
    this.eases = [];
    this.#funcsQueue = [];
    this.#funcEasesInactive = [];
    this.#perframesInactive = [];
    this.#easesInactive = [];
  }
}