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

e.bounce = (t) => 4 * t * (1 - t)
e.tri = (t) => 1 - abs(2 * t - 1);
e.bell = (t) => inOutQuint(tri(t));
e.pop = (t) => 3.5 * (1 - t) * (1 - t) * sqrt(t);
e.tap = (t) => 3.5 * t * t * sqrt(1 - t);
e.pulse = (t) => t < .5 ? e.tap(t * 2) : -e.pop(t * 2 - 1);

e.spike = (t) => exp(-10 * abs(2 * t - 1));
e.inverse = (t) => t * t * (1 - t) * (1 - t) / (0.5 - t);

let popElasticInternal = (t, damp, count) =>
	(1000 ^ -pow(t, damp) - 0.001) * sin(count * pi * t);

let tapElasticInternal = (t, damp, count) =>
	(1000 ^ -(pow(1 - t, damp)) - 0.001) * sin(count * pi * (1 - t));

let pulseElasticInternal = (t, damp, count) =>
	t < .5
	  ? tapElasticInternal(t * 2, damp, count)
	  : -popElasticInternal(t * 2 - 1, damp, count);

e.popElastic = (x) => popElasticInternal(x, 1.4, 6);
e.tapElastic = (x) => tapElasticInternal(x, 1.4, 6);
e.pulseElastic = (x) => pulseElasticInternal(x, 1.4, 6);

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

let outElasticInternal = (t, a, p) =>
	a * pow(2, -10 * t) * sin((t - p / (2 * pi) * asin(1/a)) * 2 * pi / p) + 1;
let inElasticInternal = (t, a, p) =>
	1 - outElasticInternal(1 - t, a, p);
let inOutElasticInternal = (t, a, p) =>
	t < 0.5
		? 0.5 * inElasticInternal(t * 2, a, p)
		: 0.5 + 0.5 * outElasticInternal(t * 2 - 1, a, p);
let outInElasticInternal = (t, a, p) =>
	t < 0.5
		? 0.5 * outElasticInternal(t * 2, a, p)
		: 0.5 + 0.5 * inElasticInternal(t * 2 - 1, a, p);

e.inElastic = (x) => inElasticInternal(x, 1, 0.3);
e.outElastic = (x) => outElasticInternal(x, 1, 0.3);
e.inOutElastic = (x) => inOutElasticInternal(x, 1, 0.3);
e.outInElastic = (x) => outInElasticInternal(x, 1, 0.3);

e.inBackInternal = (t, a) => t * t * (a * t + t - a);
e.outBackInternal = (t, a) => {
  t = t - 1;
  return t * t * ((a + 1) * t + a) + 1;
};
e.inOutBackInternal = (t, a) =>
	t < 0.5
		? 0.5 * inBackInternal(t * 2, a)
		: 0.5 + 0.5 * outBackInternal(t * 2 - 1, a);
e.outInBackInternal = (t, a) =>
	t < 0.5
		? 0.5 * outBackInternal(t * 2, a)
		: 0.5 + 0.5 * inBackInternal(t * 2 - 1, a);

e.inBack = (x) => inBackInternal(x, 1.70158);
e.outBack = (x) => outBackInternal(x, 1.70158);
e.inOutBack = (x) => inOutBackInternal(x, 1.70158);
e.outInBack = (x) => outInBackInternal(x, 1.70158);
}