(t, e, n, r, s, i) => {
  if (!$$manager) return nAe(t, e, n, r, s, i);

  const screenWidth = document.querySelector('.recording').clientWidth;
  const screenHeight = document.querySelector('.recording').clientHeight;

  const width = screenWidth;
  const height = screenHeight * (1 + $$m.get('arrowpathdrawsize') / 200);
  const scrollHeight = ($$manager.duration * 0.05 / 100) * screenHeight;

  const time = $$manager.progress * $$manager.duration / 1000;

  let points = [];

  const baseX = $$getNoteX(0, time, t.index) + $$getSillyNoteX(0, time, t.index),
        baseY = $$getNoteY(0, time, t.index) + $$getSillyNoteY(0, time, t.index)

  const step = 30 * (1 + $$m.get('arrowpathgrain') / 200);
  for (let pxY = 0; pxY < (height + step); pxY += step) {
    let y = (pxY / scrollHeight) * $$manager.duration / 1000;
    //console.log(pxY, y, width, height, scrollHeight, $$manager.duration, document.querySelector('.recording').clientHeight);
    points.push([
      height - (pxY + ($$getNoteY(y, time, t.index) + $$getSillyNoteY(y, time, t.index) - baseY)),
      $$getNoteX(y, time, t.index) + $$getSillyNoteX(y, time, t.index) - baseX
    ]);
  }

  const d = points.map(([y,x], i) => `${i === 0 ? 'M' : 'L'}${Math.floor((width/2+x) * 100) / 100},${Math.floor(y * 100) / 100}`).join(' ');
  const viewBox = `0 0 ${width} ${height}`;

  const paths = document.querySelectorAll('path.base.straight');
  paths.forEach(path => {
    path.setAttribute('d', d);
    path.style.strokeWdith = 8 * (1 + $$m.get('arrowpathwidth') / 100 + $$m.get(`arrowpathwidth${t.index}`))
  });
  const svgs = document.querySelectorAll('svg.line');
  svgs.forEach(svg => {
    svg.setAttribute('viewBox', viewBox);
    svg.style.width = width + 'px';
    svg.style.left = (-width / 2 + $$noteSize / 2) + 'px';
    svg.style.height = height + 'px';
    svg.style.opacity = 1 - $$m.get('hidearrowpath') / 100 - $$m.get(`hidearrowpath${t.index}`) / 100;
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
      ['translateX', `${$$getSillyNoteX(0, time, i)}px`],
      ['translateY', `${$$getSillyNoteY(0, time, i)}px`],
      ['translateZ', `${$$getSillyNoteZ(0, time, i)}px`],
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