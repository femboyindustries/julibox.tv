const m = $$m;
const e = $$eases;

m.set(0, 600, 'fov', 100, 'wave');

//m.ease(0, 4, e.outCirc, 100, 'bumpy');

let inv = false;
for (let b = 0; b < 128; b += 2) {
  inv = !inv;
  m.ease(b, 2, e.outExpo, inv ? 100 : 0, 'invert');
  //m.add(b, 2, e.outCirc, 20, 'drunk');
}

//m.ease(10, 20, e.inOutQuad, -360, 'confusionoffsety', 360, 'rotationy');