(t, e, n, r, s, i) => {
  $$update(t);

  const a = ot('Beatlines'),
    c = hn('t');
  return (
    K(),
    X('div', STe, [
      H('div', wTe, [
        Qe(
          a,
          {
            class: 'scroll-container',
            guide: t.manager.guide,
            duration: t.manager.duration,
            style: gn(t.scrollStyles),
          },
          null,
          8,
          ['guide', 'duration', 'style']
        ),
      ]),
      H('div', OTe, [
        H('div', ATe, [
          (K(!0),
          X(
            St,
            null,
            Dn(
              t.laneLines,
              (l, h) => (
                K(),
                X(
                  'div',
                  {
                    key: h,
                    class: rt(['lane-line', l.classes]),
                    style: gn(l.styles),
                  },
                  null,
                  6
                )
              )
            ),
            128
          )),
        ]),
        H('div', CTe, [
          (K(!0),
          X(
            St,
            null,
            Dn(
              t.hitIndicators,
              (l, h) => (
                K(),
                X(
                  'div',
                  {
                    key: h,
                    class: rt(['hit-indicator', l.classes]),
                    style: gn(l.styles),
                  },
                  null,
                  6
                )
              )
            ),
            128
          )),
        ]),
      ]),
      H('div', ITe, [
        H(
          'div',
          { class: 'scroll-container', style: gn(t.scrollStyles) },
          [
            H('div', kTe, [
              (K(!0),
              X(
                St,
                null,
                Dn(
                  t.inputs,
                  (l) => {
                    const quant = $$quantize($$getMeasure(t.manager, l.start));

                    return K(),
                      X(
                        'div',
                        {
                          key: l.key,
                          class: rt(['input', `quant-${quant}`, l.classes]),
                          style: gn(l.styles),
                        },
                        [l.isHold ? (K(), X('div', NTe)) : qe('', !0), xTe],
                        6
                      )
                  }
                ),
                128
              )),
            ]),
          ],
          4
        ),
      ]),
      H('div', PTe, [
        (K(!0),
        X(
          St,
          null,
          Dn(
            t.hitIndicators,
            (l, h) => (
              K(),
              X(
                'div',
                {
                  key: h,
                  class: rt(['hit-indicator', l.classes]),
                  style: gn(l.styles),
                },
                [
                  (K(!0),
                  X(
                    St,
                    null,
                    Dn(l.items, (d, p) =>
                      Ge(
                        (K(),
                        X(
                          'span',
                          { key: p, class: rt(['feedback-item', d.classes]) },
                          null,
                          2
                        )),
                        [[c, d.textKey]]
                      )
                    ),
                    128
                  )),
                  t.isDesktop
                    ? (K(), X('span', RTe, Dt(l.text), 1))
                    : qe('', !0),
                ],
                6
              )
            )
          ),
          128
        )),
        Qe(
          xs,
          { name: 'cta' },
          {
            default: cs(() => [
              t.showCta
                ? (K(),
                  X('div', MTe, [
                    Ge(H('p', DTe, null, 512), [[c, 'INFO.DISCRETE']]),
                  ]))
                : qe('', !0),
            ]),
            _: 1,
          }
        ),
      ]),
    ])
  );
}