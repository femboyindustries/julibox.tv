$$m.set(0, 600, 'fov', 100, 'wave');

//$$m.ease(0, 4, $$eases.easeOutCirc, 100, 'bumpy');

let inv = false;
for (let b = 0; b < 128; b += 2) {
  inv = !inv;
  $$m.ease(b, 2, $$eases.easeOutExpo, inv ? 100 : 0, 'invert');
}

//$$m.ease(10, 20, $$eases.easeInOutQuad, -360, 'confusionoffsety', 360, 'rotationy')

// must call this to lock everything and get it ready for play
$$m.finalize();