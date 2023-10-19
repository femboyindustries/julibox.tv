(t, e, n, r, s, i) => {
  if (!$$manager) return E7e(t, e, n, r, s, i);

  const screenHeight = document.querySelector('.recording').clientHeight;

  const viewWidth = 400;
  const viewHeight = screenHeight;
  const width = $$noteSize * 4;
  const height = viewHeight / viewWidth * width;
  const scrollHeight = ($$manager.duration * 0.05 / 100) * screenHeight;

  const time = $$manager.progress * $$manager.duration / 1000;

  let points = [];

  const baseX = $$getNoteX(0, time, t.index),
        baseY = $$getNoteY(0, time, t.index)

  for (let pxY = 0; pxY < height; pxY += 25) {
    let y = (pxY / scrollHeight) * $$manager.duration / 1000;
    //console.log(pxY, y, width, height, scrollHeight, $$manager.duration, document.querySelector('.recording').clientHeight);
    points.push([
      viewHeight - (pxY + ($$getNoteY(y, time, t.index) - baseY)) / height * viewHeight,
      ($$getNoteX(y, time, t.index) - baseX) / width * viewWidth
    ]);
  }

  const d = points.map(([y,x], i) => `${i === 0 ? 'M' : 'L'}${Math.floor((viewWidth/2+x) * 100) / 100},${Math.floor(y * 100) / 100}`).join(' ');
  const viewBox = `0 0 ${viewWidth} ${viewHeight}`;

  const paths = document.querySelectorAll('path.base.straight');
  paths.forEach(path => {
    path.setAttribute('d', d);
  });
  const svgs = document.querySelectorAll('svg.line');
  svgs.forEach(svg => {
    svg.setAttribute('viewBox', viewBox);
  });

  const rings = document.querySelectorAll('svg.ring');
  rings.forEach((ring, i) => {
    const transforms = [
      ['skewX', `${$$getNoteSkewX(0, time, i)}deg`],
      ['skewY', `${$$getNoteSkewY(0, time, i)}deg`],
      ['rotateX', `${$$getNoteRotationX(0, time, i)}deg`],
      ['rotateY', `${$$getNoteRotationY(0, time, i)}deg`],
      ['rotateZ', `${$$getNoteRotationZ(0, time, i)}deg`],
      ['scaleX', `${$$getNoteScaleX(0, time, i)}`],
      ['scaleY', `${$$getNoteScaleY(0, time, i)}`],
      ['scaleZ', `${$$getNoteScaleZ(0, time, i)}`],
      ['translateZ', `${$$getNoteZ(0, time, i)}px`]
    ];
    const ringTransforms = $$transforms([
      ['translateY', '50%'],
      ...transforms,
    ]);
    ring.style.transform = ringTransforms;
  });

  return q(),
  Y(
    'div',
    {
      ref: 'root',
      class : nt(['lane',
      {
        active: t.isActive,
        holding: t.isHolding
      }
      ])
    },
    [
      (
        q(),
        Y(
          'svg',
          {
            viewBox: viewBox,
            class : 'line'
          },
          [
            U('path', {
              ref: 'dynamic',
              class : 'base straight',
              d: d
            }, null, 512)
          ]
        )
      )
    ],
    2
  )
}