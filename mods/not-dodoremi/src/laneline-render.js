(t, e, n, r, s, i) => {
  if (!$$manager) return;

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

  return G(),
  K(
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
        G(),
        K(
          'svg',
          {
            viewBox: viewBox,
            class : 'line'
          },
          [
            V('path', {
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