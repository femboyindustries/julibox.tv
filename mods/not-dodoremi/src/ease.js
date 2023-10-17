// js port of a lua port of an easing library:
// https://github.com/XeroOl/notitg-mirin/blob/master/template/ease.lua

let $$eases = {};

if (true) {
const e = $$eases;

let sqrt = Math.sqrt;
let sin = Math.sin;
let asin = Math.asin;
let cos = Math.cos;
let pow = Math.pow;
let exp = Math.exp;
let pi = Math.PI;
let abs = Math.abs;

// Flip any easing function, making it go from 1 to 0
e.flip = (fn) => (x) => 1 - fn(x);

// Mix two easing functions together into a new ease
// the new ease starts by acting like the first argument, and then ends like the second argument
// Example: ease {0, 20, blendease(inQuad, outQuad), 100, 'modname'}
e.blendease = (fn1, fn2) => (x) => {
  let mixFactor = 3 * Math.pow(x, 2) - 2 * Math.pow(x, 3);
  return (1 - mixFactor) * fn1(x) + mixFactor * fn2(x);
}

// Function for caching params
// sorry! I don't know how to get around the "this" keyword, so the functions just. exist now
function param1cache(param1) {
  return this.cache[param1] = this.cache[param1] || ((x) => {
    return this.fn(x, param1);
  });
}

function param2cache(param1, param2) {
  this.cache[param1] = this.cache[param1] || {};
  return this.cache[param1][param2] = this.cache[param1][param2] || ((x) => {
    return this.fn(x, param1, param2);
  });
}

// is. is that how metatables work in javascripe. I feel like this is a tiny bit redundant but I'll keep it mirin-like
let param1mt = {
  call: function(x, param1) {
    return this.fn(x, param1 || this.dp1);
  },
  param: param1cache,
  params: param1cache
}

let param2mt = {
  call: function(x, param1, param2) {
    return this.fn(x, param1 || this.dp1, param2 || this.dp2);
  },
  param: param2cache,
  params: param2cache
}

// Function for declaring an easing function with custom parameters
function with1param(fn, defaultparam1) {
  return Object.assign({
    fn: fn,
    dp1: defaultparam1,
    cache: {}
  }, param1mt);
}

function with2params(fn, defaultparam1, defaultparam2) {
  return Object.assign({
    fn: fn,
    dp1: defaultparam1,
    dp2: defaultparam2,
    cache: {}
  }, param2mt);
}

e.bounce = (t) => 4 * t * (1 - t)
e.tri = (t) => 1 - abs(2 * t - 1);
e.bell = (t) => inOutQuint(tri(t));
e.pop = (t) => 3.5 * (1 - t) * (1 - t) * sqrt(t);
e.tap = (t) => 3.5 * t * t * sqrt(1 - t);
e.pulse = (t) => t < .5 ? e.tap(t * 2) : -e.pop(t * 2 - 1);

e.spike = (t) => exp(-10 * abs(2 * t - 1));
e.inverse = (t) => t * t * (1 - t) * (1 - t) / (0.5 - t);

let popElasticInternal = (t, damp, count) => {
  return (Math.pow(1000, -(Math.pow(t, damp))) - 0.001) * sin(count * pi * t);
}

let fofElasticInternal = (t, damp, count) => { // don't ask, I stole ease.lua from another file and felt importing it
  return (Math.pow(1000, -(Math.pow(t, damp))) - 0.001) * cos(count * pi * t);
}

let tapElasticInternal = (t, damp, count) => {
  return (Math.pow(1000, -(Math.pow(1 - t, damp))) - 0.001) * sin(count * pi * (1 - t));
}

let babElasticInternal = (t, damp, count) => {
  return (Math.pow(1000, -(Math.pow(1 - t, damp))) - 0.001) * cos(count * pi * (1 - t));
}

let pulseElasticInternal = (t, damp, count) => {
  if (t < 0.5) {
    return tapElasticInternal(t * 2, damp, count);
  } else {
    return -popElasticInternal(t * 2 - 1, damp, count);
  }
}

e.popElastic = with2params(popElasticInternal, 1.4, 6);
e.tapElastic = with2params(tapElasticInternal, 1.4, 6);
e.fofElastic = with2params(fofElasticInternal, 1.4, 6);
e.babElastic = with2params(babElasticInternal, 1.4, 6);
e.pulseElastic = with2params(pulseElasticInternal, 1.4, 6);

let impulseInternal = (t, damp) => {
  t = pow(t, damp);
  return t * (pow(1000, -t) - 0.001) * 18.6;
};

e.impulse = (x) => impulseInternal(x, 0.9);

e.instant = () => 1;
e.linear = (t) => t;
e.inQuad = (t) => t * t;
e.outQuad = (t) => -t * (t - 2);
e.inOutQuad = (t) => {
	t = t * 2;
  return t < 1
    ? 0.5 * pow(t, 2)
    : 1 - 0.5 * pow(2 - t, 2);
};
e.outInQuad = (t) => {
	t = t * 2;
	return t < 1
		? 0.5 - 0.5 * pow(1 - t, 2)
	  : 0.5 + 0.5 * pow(t - 1, 2);
};
e.inCubic = (t) => t * t * t;
e.outCubic = (t) => 1 - pow(1 - t, 3);
e.inOutCubic = (t) => {
	t = t * 2;
	return t < 1
		? 0.5 * pow(t, 3)
	  : 1 - 0.5 * pow(2 - t, 3);
};
e.outInCubic = (t) => {
	t = t * 2;
	return t < 1
		? 0.5 - 0.5 * pow(1 - t, 3)
	  : 0.5 + 0.5 * pow(t - 1, 3);
}
e.inQuart = (t) => t * t * t * t;
e.outQuart = (t) => 1 - pow(1 - t, 4);
e.inOutQuart = (t) => {
	t = t * 2;
	return t < 1
		? 0.5 * pow(t, 4)
	  : 1 - 0.5 * pow(2 - t, 4);
};
e.outInQuart = (t) => {
  t = t * 2;
  return t < 1
    ? 0.5 - 0.5 * pow(1 - t, 4)
    : 0.5 + 0.5 * pow(t - 1, 4);
};
e.inQuint = (t) => pow(t, 5);
e.outQuint = (t) => 1 - pow(1 - t, 5);
e.inOutQuint = (t) => {
  t = t * 2;
  return t < 1
    ? 0.5 * pow(t, 5)
    : 1 - 0.5 * pow(2 - t, 5);
};
e.outInQuint = (t) => {
  t = t * 2;
  return t < 1
    ? 0.5 - 0.5 * pow(1 - t, 5)
    : 0.5 + 0.5 * pow(t - 1, 5);
};
e.inExpo = (t) => pow(1000, t - 1) - 0.001;
e.outExpo = (t) => 1.001 - pow(1000, -t);
e.inOutExpo = (t) => {
  t = t * 2;
  return t < 1
    ? 0.5 * pow(1000, t - 1) - 0.0005
    : 1.0005 - 0.5 * pow(1000, 1 - t);
};
e.outInExpo = (t) =>
	t < 0.5
		? outExpo(t * 2) * 0.5
	  : inExpo(t * 2 - 1) * 0.5 + 0.5;

e.inCirc = (t) => 1 - sqrt(1 - t * t);
e.outCirc = (t) => sqrt(-t * t + 2 * t);
e.inOutCirc = (t) => {
	t = t * 2;
	if (t < 1) {
    return 0.5 - 0.5 * sqrt(1 - t * t)
  } else {
    t = t - 2
    return 0.5 + 0.5 * sqrt(1 - t * t)
  }
};
e.outInCirc = (t) =>
	t < 0.5
		? outCirc(t * 2) * 0.5
	  : inCirc(t * 2 - 1) * 0.5 + 0.5;

e.outBounce = (t) => {
	if (t < 1 / 2.75)
		return 7.5625 * t * t

	if (t < 2 / 2.75) {
		t = t - 1.5 / 2.75
		return 7.5625 * t * t + 0.75
  }

	if (t < 2.5 / 2.75) {
		t = t - 2.25 / 2.75
		return 7.5625 * t * t + 0.9375
  }

	t = t - 2.625 / 2.75
	return 7.5625 * t * t + 0.984375
}

e.inBounce = (t) => 1 - outBounce(1 - t);
e.inOutBounce = (t) =>
	t < 0.5
		? inBounce(t * 2) * 0.5
	  : outBounce(t * 2 - 1) * 0.5 + 0.5;
e.outInBounce = (t) => 
	t < 0.5
		? outBounce(t * 2) * 0.5
	  : inBounce(t * 2 - 1) * 0.5 + 0.5;

e.inSine = (x) => 1 - cos(x * (pi * 0.5));
e.outSine = (x) => sin(x * (pi * 0.5));
e.inOutSine = (x) => 0.5 - 0.5 * cos(x * pi);
e.outInSine = (t) =>
	t < 0.5
		? outSine(t * 2) * 0.5
	  : inSine(t * 2 - 1) * 0.5 + 0.5;

let outElasticInternal = (t, a, p) => {
  return a * pow(2, -10 * t) * sin((t - p / (2 * pi) * asin(1 / a)) * 2 * pi / p) + 1;
}

let inElasticInternal = (t, a, p) => {
  return 1 - outElasticInternal(1 - t, a, p);
}

let inOutElasticInternal = (t, a, p) => {
  return t < 0.5
    ? 0.5 * inElasticInternal(t * 2, a, p)
    : 0.5 + 0.5 * outElasticInternal(t * 2 - 1, a, p);
}

let outInElasticInternal = (t, a, p) => {
  return t < 0.5
    ? 0.5 * outElasticInternal(t * 2, a, p)
    : 0.5 + 0.5 * inElasticInternal(t * 2 - 1, a, p);
}

e.inElastic = with2params(inElasticInternal, 1, 0.3);
e.outElastic = with2params(outElasticInternal, 1, 0.3);
e.inOutElastic = with2params(inOutElasticInternal, 1, 0.3);
e.outInElastic = with2params(outInElasticInternal, 1, 0.3);

let inBackInternal = (t, a) => {
  return t * t * (a * t + t - a);
}

let outBackInternal = (t, a) => {
  t = t - 1;
  return t * t * ((a + 1) * t + a) + 1;
}

let inOutBackInternal = (t, a) => {
  return t < 0.5
    ? 0.5 * inBackInternal(t * 2, a)
    : 0.5 + 0.5 * outBackInternal(t * 2 - 1, a);
}

let outInBackInternal = (t, a) => {
  return t < 0.5
    ? 0.5 * outBackInternal(t * 2, a)
    : 0.5 + 0.5 * inBackInternal(t * 2 - 1, a);
}

e.inBack = with1param(inBackInternal, 1.70158);
e.outBack = with1param(outBackInternal, 1.70158);
e.inOutBack = with1param(inOutBackInternal, 1.70158);
e.outInBack = with1param(outInBackInternal, 1.70158);
}