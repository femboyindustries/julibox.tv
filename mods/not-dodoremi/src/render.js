(t, e, n, r, s, i) => {
  $$update(t);

  const transformObj = [
    ['rotateX', Math.floor($$m.get('rotationx') * 1000) / 1000 + 'deg'],
    ['rotateY', Math.floor($$m.get('rotationy') * 1000) / 1000 + 'deg'],
    ['rotateZ', Math.floor($$m.get('rotationz') * 1000) / 1000 + 'deg'],
    ['scale', Math.floor(((1 - $$m.get('mini') / 200) * 1000)) / 1000],
  ];

  const transforms = $$transforms(transformObj);
  const transformsConstrainer = $$transforms([['translate', '-50%'], ...transformObj]);

  document.querySelectorAll('.beatmap .visuals').forEach(elem => elem.style.perspective = `${$$m.get('fov')}px`);
  document.querySelectorAll('.transforms.constrainer').forEach(elem => elem.style.transform = transformsConstrainer);
  document.querySelectorAll('.transforms:not(.constrainer)').forEach(elem => elem.style.transform = transforms);

  const o = We('Beatlines'), a = We('LaneLine'), l = We('LaneRing'), u = We('LaneText'), f = fn('t');
  return V(), K('div', {class: 'visuals'}, [
    G('div', {class : 'scroll-wrapper'}, [ze(o, {
      class: 'scroll-container',
      guide: t.manager.guide,
      duration: t.manager.duration,
      style: an(t.scrollStyles)
    }, null, 8, [
      'guide',
      'duration',
      'style'
    ])]),
    t.showCombo ? (V(), K('div', W7e)) : De('', true),
    G('div', {
      class: nt([
        'constrainer',
        t.homeClasses,
        'transforms',
        'preserve-3d'
      ])
    }, [
      Y7e,
      (V(true), K(gt, null, wn(t.lanes, (d, p) => (V(), Ot(a, {
        key: p,
        style: an(d.styles),
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
    G('div', {class : 'scroll-wrapper clipped transforms preserve-3d'}, [G('div', {
      class: 'scroll-container preserve-3d',
      style: an(t.scrollStyles)
    }, [G('div', {class : 'constrainer preserve-3d'}, [(V(true), K(gt, null, wn(t.inputs, d => (V(), K(gt, { key: d.key }, [d.holdStyles ? (V(), K('div', {
      key: 0,
      class: nt([
        'hold',
        d.classes
      ]),
      style: an(d.holdStyles)
    }, null, 6)) : De('', true)], 64))), 128))])], 4)]),
    G('div', {class : 'constrainer transforms preserve-3d'}, [(V(true), K(gt, null, wn(t.lanes, (d, p) => (V(), Ot(l, {
      key: p,
      style: an(d.styles),
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
    G('div', {class : 'scroll-wrapper transforms preserve-3d'}, [G('div', {
      class: 'scroll-container preserve-3d',
      style: an(t.scrollStyles)
    }, [G('div', {class : 'constrainer preserve-3d'}, [(V(true), K(gt, null, wn(t.inputs, d => (V(), K('svg', {
      key: d.key,
      class: nt([
        'head',
        d.classes
      ]),
      viewBox: '0 0 110 110',
      style: an(d.headStyles),
      ['data-v-546beebe']: '' // idk why i have to do this manually but oh well
    }, [
      //G('circle', {
      //  cx: '55',
      //  cy: '55',
      //  r: '53'
      //}, null, - 1)
      tN(() => G('path', {
        d: 'M 55,105 4,54 22,36 42,56 V 3 H 69 V 56 L 88,36 106,54 Z'
      }, null, - 1))
    ], 6))), 128))])], 4)]),
    G('div', {class : 'constrainer transforms preserve-3d'}, [(V(true), K(gt, null, wn(t.lanes, (d, p) => (V(), Ot(u, {
      key: p,
      style: an(d.styles),
      feedback: d.feedback
    }, null, 8, [
      'style',
      'feedback'
    ]))), 128))]),
    ze(Ea, { name: 'cta' }, {
      default: go(() => [t.showCta ? (V(), K('div', c9e, [G('div', l9e, [qe(G('p', u9e, null, 512), [[
        f,
        'INFO.DISCRETE'
      ]])])])) : De('', true)]),
      _: 1
    })
  ]);
}