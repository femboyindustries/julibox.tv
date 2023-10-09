(t, e, n, r, s, i) => {
  const o = We('Beatlines'), a = We('LaneLine'), l = We('LaneRing'), u = We('LaneText'), f = fn('t');
  return G(), K('div', W7e, [
    V('div', H7e, [Ye(o, {
      class: 'scroll-container',
      guide: t.manager.guide,
      duration: t.manager.duration,
      style: an(t.scrollStyles)
    }, null, 8, [
      'guide',
      'duration',
      'style'
    ])]),
    t.showCombo ? (G(), K('div', z7e)) : De('', true),
    V('div', {
      class: nt([
        'constrainer',
        t.homeClasses
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
    V('div', K7e, [V('div', {
      class: 'scroll-container',
      style: an(t.scrollStyles)
    }, [V('div', Z7e, [(G(true), K(gt, null, wn(t.inputs, d => (G(), K(gt, { key: d.key }, [d.holdStyles ? (G(), K('div', {
      key: 0,
      class: nt([
        'hold',
        d.classes
      ]),
      style: an(d.holdStyles)
    }, null, 6)) : De('', true)], 64))), 128))])], 4)]),
    V('div', X7e, [(G(true), K(gt, null, wn(t.lanes, (d, p) => (G(), wt(l, {
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
    V('div', Q7e, [V('div', {
      class: 'scroll-container',
      style: an(t.scrollStyles)
    }, [V('div', J7e, [(G(true), K(gt, null, wn(t.inputs, d => (G(), K('svg', {
      key: d.key,
      class: nt([
        'head',
        d.classes
      ]),
      viewBox: '0 0 110 110',
      style: an(d.headStyles)
    }, t9e, 6))), 128))])], 4)]),
    V('div', n9e, [(G(true), K(gt, null, wn(t.lanes, (d, p) => (G(), wt(u, {
      key: p,
      style: an(d.styles),
      feedback: d.feedback
    }, null, 8, [
      'style',
      'feedback'
    ]))), 128))]),
    Ye(Ta, { name: 'cta' }, {
      default: go(() => [t.showCta ? (G(), K('div', r9e, [V('div', s9e, [qe(V('p', i9e, null, 512), [[
        f,
        'INFO.DISCRETE'
      ]])])])) : De('', true)]),
      _: 1
    })
  ]);
}