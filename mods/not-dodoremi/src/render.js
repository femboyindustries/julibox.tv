(t, e, n, r, s, i) => {
  $$update(t);

  const transformObj = [
    ['translateX', Math.floor($$m.get('x') * 1000) / 1000 + '%'],
    ['translateY', Math.floor($$m.get('y') * 1000) / 1000 + '%'],
    ['translateZ', Math.floor($$m.get('z') * 1000) / 1000 + 'px'],
    ['skewX', Math.floor(($$m.get('skew') + $$m.get('skewx')) * 1000) / 1000 + 'deg'],
    ['skewY', Math.floor(($$m.get('skewy')) * 1000) / 1000 + 'deg'],
    ['scale', Math.floor(((1 - $$m.get('mini') / 200) * 1000)) / 1000],
    ['scaleX', Math.floor(((1 - $$m.get('minix') / 200) * 1000)) / 1000],
    ['scaleY', Math.floor(((1 - $$m.get('miniy') / 200) * 1000)) / 1000],
    ['rotateX', Math.floor($$m.get('rotationx') * 1000) / 1000 + 'deg'],
    ['rotateY', Math.floor($$m.get('rotationy') * 1000) / 1000 + 'deg'],
    ['rotateZ', Math.floor($$m.get('rotationz') * 1000) / 1000 + 'deg'],
  ];

  const transformsConstrainer = $$transforms([['translate', '-50%'], ...transformObj]);
  const transformsScrollWrapper = $$transforms([...transformObj, ['translateY', '-25%']]);

  document.querySelectorAll('.beatmap .visuals').forEach(elem => elem.style.perspective = `${$$m.get('fov')}px`);
  document.querySelectorAll('.transforms.constrainer').forEach(elem => elem.style.transform = transformsConstrainer);
  document.querySelectorAll('.transforms.scroll-wrapper').forEach(elem => elem.style.transform = transformsScrollWrapper);

  document.querySelectorAll('.head path').forEach(elem => {
    elem.style.filter = `invert(${Math.min($$m.get('stealth') / 50, 1) * 0.5}) brightness(${100 + $$m.get('stealth') / 50 * 100}%)`;
    elem.style.opacity = `${1 - Math.max($$m.get('stealth') - 50, 0) / 50}`;
  });

  const o = Ve('Beatlines'), a = Ve('LaneLine'), l = Ve('LaneRing'), u = Ve('LaneText'), f = fn('t');
  return q(), Y('div', {class: 'visuals'}, [
    U('div', {class : 'scroll-wrapper'}, [We(o, {
      class: 'scroll-container',
      guide: t.manager.guide,
      duration: t.manager.duration,
      style: rn(t.scrollStyles)
    }, null, 8, [
      'guide',
      'duration',
      'style'
    ])]),
    t.showCombo ? (q(), Y('div', OAe)) : Me('', true),
    U('div', {
      class: nt([
        'constrainer',
        t.homeClasses,
        'transforms',
        'preserve-3d'
      ])
    }, [
      CAe,
      (q(true), Y(pt, null, vn(t.lanes, (d, p) => (q(), At(a, {
        key: p,
        style: rn(d.styles),
        feedback: d.feedback,
        index: p,
        'is-active': d.isActive,
        'is-holding': d.isHolding
      }, null, 8, [
        'style',
        'feedback',
        'index',
        'is-active',
        'is-holding'
      ]))), 128))
    ], 2),
    U('div', {class : 'scroll-wrapper clipped transforms preserve-3d'}, [U('div', {
      class: 'scroll-container preserve-3d',
      style: rn(t.scrollStyles)
    }, [U('div', {class : 'constrainer preserve-3d'}, [(q(true), Y(pt, null, vn(t.inputs, d => (q(), Y(pt, { key: d.key }, [d.holdStyles ? (q(), Y('div', {
      key: 0,
      class: nt([
        'hold',
        d.classes
      ]),
      style: rn(d.holdStyles)
    }, null, 6)) : Me('', true)], 64))), 128))])], 4)]),
    U('div', {class : 'constrainer transforms preserve-3d'}, [(q(true), Y(pt, null, vn(t.lanes, (d, p) => (q(), At(l, {
      key: p,
      style: rn(d.styles),
      feedback: d.feedback,
      hotkey: d.hotkey,
      index: p,
      'is-active': d.isActive,
      'is-holding': d.isHolding
    }, null, 8, [
      'style',
      'feedback',
      'hotkey',
      'index',
      'is-active',
      'is-holding'
    ]))), 128))]),
    U('div', {class : 'scroll-wrapper transforms preserve-3d'}, [U('div', {
      class: 'scroll-container preserve-3d',
      style: rn(t.scrollStyles)
    }, [U('div', {class : 'constrainer preserve-3d'}, [(q(true), Y(pt, null, vn(t.inputs, d => (q(), Y('svg', {
      key: d.key,
      class: nt([
        'head',
        d.classes
      ]),
      viewBox: '0 0 110 110',
      style: rn(d.headStyles),
      ['data-v-546beebe']: '' // idk why i have to do this manually but oh well
    }, [
      //U('circle', {
      //  cx: '55',
      //  cy: '55',
      //  r: '53'
      //}, null, - 1)
      uN(() => U('path', {
        d: 'M 55,105 4,54 22,36 42,56 V 3 H 69 V 56 L 88,36 106,54 Z'
      }, null, - 1))
    ], 6))), 128))])], 4)]),
    U('div', {class : 'constrainer transforms preserve-3d'}, [(q(true), Y(pt, null, vn(t.lanes, (d, p) => (q(), At(u, {
      key: p,
      style: rn(d.styles),
      feedback: d.feedback
    }, null, 8, [
      'style',
      'feedback'
    ]))), 128))]),
    We(Ea, { name: 'cta' }, {
      default: go(() => [t.showCta ? (q(), Y('div', $Ae, [U('div', LAe, [qe(U('p', FAe, null, 512), [[
        f,
        'INFO.DISCRETE'
      ]])])])) : Me('', true)]),
      _: 1
    })
  ]);
}