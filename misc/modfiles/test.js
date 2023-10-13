const m = $$m;

m.set(0, 600, 'fov', 100, 'wave');

//$$m.ease(0, 4, $$eases.easeOutCirc, 100, 'bumpy');

let inv = false;
for (let b = 0; b < 128; b += 2) {
  inv = !inv;
  m.ease(b, 2, $$eases.easeOutExpo, inv ? 100 : 0, 'invert');
  //m.add(b, 2, $$eases.easeOutCirc, 20, 'drunk');
}

//m.ease(10, 20, $$eases.easeInOutQuad, -360, 'confusionoffsety', 360, 'rotationy')