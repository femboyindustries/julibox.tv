(t, e, n, r, s, i) => {
  $$update(t);

  const transformObj = [
    ['rotateX', Math.floor($$m.get('rotationx') * 1000) / 1000 + 'deg'],
    ['rotateY', Math.floor($$m.get('rotationy') * 1000) / 1000 + 'deg'],
    ['rotateZ', Math.floor($$m.get('rotationz') * 1000) / 1000 + 'deg'],
  ];

  const transforms = $$transforms(transformObj);
  const transformsConstrainer = $$transforms([['translate', '-50%'], ...transformObj]);

  document.querySelectorAll('.beatmap .visuals').forEach(elem => elem.style.perspective = `${$$m.get('fov')}px`);
  document.querySelectorAll('.transforms.constrainer').forEach(elem => elem.style.transform = transformsConstrainer);
  document.querySelectorAll('.transforms:not(.constrainer)').forEach(elem => elem.style.transform = transforms);

  const o = We('Beatlines'), a = We('LaneLine'), l = We('LaneRing'), u = We('LaneText'), f = fn('t');
  return G(), K('div', {class: 'visuals'}, [
    V('div', {class : 'scroll-wrapper'}, [Ye(o, {
      class: 'scroll-container',
      guide: t.manager.guide,
      duration: t.manager.duration,
      style: an(t.scrollStyles)
    }, null, 8, [
      'guide',
      'duration',
      'style'
    ])]),
    t.showCombo ? (G(), K('div', W7e)) : De('', true),
    V('div', {
      class: nt([
        'constrainer',
        t.homeClasses,
        'transforms',
        'preserve-3d'
      ])
    }, [
      Y7e,
      (G(true), K(gt, null, wn(t.lanes, (d, p) => (G(), wt(a, {
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
    V('div', {class : 'scroll-wrapper clipped transforms preserve-3d'}, [V('div', {
      class: 'scroll-container preserve-3d',
      style: an(t.scrollStyles)
    }, [V('div', {class : 'constrainer preserve-3d'}, [(G(true), K(gt, null, wn(t.inputs, d => (G(), K(gt, { key: d.key }, [d.holdStyles ? (G(), K('div', {
      key: 0,
      class: nt([
        'hold',
        d.classes
      ]),
      style: an(d.holdStyles)
    }, null, 6)) : De('', true)], 64))), 128))])], 4)]),
    V('div', {class : 'constrainer transforms preserve-3d'}, [(G(true), K(gt, null, wn(t.lanes, (d, p) => (G(), wt(l, {
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
    V('div', {class : 'scroll-wrapper transforms preserve-3d'}, [V('div', {
      class: 'scroll-container preserve-3d',
      style: an(t.scrollStyles)
    }, [V('div', {class : 'constrainer preserve-3d'}, [(G(true), K(gt, null, wn(t.inputs, d => (G(), K('svg', {
      key: d.key,
      class: nt([
        'head',
        d.classes
      ]),
      viewBox: '0 0 110 110',
      style: an(d.headStyles)
    }, J7e, 6))), 128))])], 4)]),
    V('div', {class : 'constrainer transforms preserve-3d'}, [(G(true), K(gt, null, wn(t.lanes, (d, p) => (G(), wt(u, {
      key: p,
      style: an(d.styles),
      feedback: d.feedback
    }, null, 8, [
      'style',
      'feedback'
    ]))), 128))]),
    Ye(Ea, { name: 'cta' }, {
      default: go(() => [t.showCta ? (G(), K('div', t9e, [V('div', n9e, [qe(V('p', r9e, null, 512), [[
        f,
        'INFO.DISCRETE'
      ]])])])) : De('', true)]),
      _: 1
    })
  ]);
}