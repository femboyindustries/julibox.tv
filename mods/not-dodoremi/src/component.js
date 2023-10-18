at({
  components: {
    Beatlines: QI,
    LaneLine: k8e,
    LaneRing: V8e,
    LaneText: z8e
  },
  props: {
    manager: {
      type: Object,
      required: true
    },
    showCta: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    hotkeys() {
      return this.$hotkeyManager.mappings.get(this.manager.lanes.length);
    },
    layout() {
      return Pb(this.manager.lanes.length);
    },
    lanes() {
      return this.manager.lanes.map((t, e) => {
        const time = this.manager.progress * this.manager.duration / 1000;
        const transforms = [
          ['translateZ', `${$$getNoteZ(0, time, e)}px`],
          ['rotateY', `${$$getNoteRotationY(0, time, e)}deg`]
        ]
        const laneTransforms = $$transforms([['translate', '-50%'], ...transforms]);
        return {
          isActive: t.isActive,
          isHolding: t.activeInput !== void 0,
          feedback: t.feedback,
          hotkey: this.hotkeys.keys[e],
          styles: {
            width: `${this.layout.hit}%`,
            left: `calc(${this.layout.lanes[e].center}% + ${$$getNoteX(0, time, e)}px)`,
            bottom: `calc(var(--judgement-position) - ${$$getNoteY(0, time, e)}px)`,
            //transform: laneTransforms,
            ['transform-style']: 'preserve-3d'
          }
        }
      });
    },
    scrollStyles() {
      return { transform: `translateY(${this.manager.progress * 100}%)` };
    },
    showCombo() {
      return this.manager.currentCombo > this.manager.minimumDisplayCombo;
    },
    homeClasses() {
      return this.showCta ? ['alert'] : [];
    },
    inputs() {
      const t = [];
      return this.manager.inputs.forEach(e => {
        e.forEach(n => {
          n.isVisible && n.indicators.forEach(r => {
            const s = this.layout.lanes[r.lane];
            if (s === void 0) {
              console.warn('unrenderable lane', r.lane);
              return;
            }
            const y = (n.y - this.manager.progress) * this.manager.duration / 1000;
            const time = this.manager.progress * this.manager.duration / 1000;
            const quant = $$quantize($$getMeasure(this.manager, n.start));
            const transforms = [
              ['rotateX', `${$$getNoteRotationX(y, time, r.lane)}deg`],
              ['rotateY', `${$$getNoteRotationY(y, time, r.lane)}deg`],
              ['scaleX', `${$$getNoteScaleX(y, time, r.lane)}`],
              ['scaleZ', `${$$getNoteScaleZ(y, time, r.lane)}`],
              ['translateZ', `${$$getNoteZ(y, time, r.lane)}px`]
            ];
            const noteTransforms = $$transforms([
              ['translate', '-50%,50%'],
              ['skewX', `${$$getNoteSkewX(y, time, r.lane)}deg`],
              ['skewY', `${$$getNoteSkewY(y, time, r.lane)}deg`],
              ['rotateZ', `${$$getNoteRotationZ(y, time, r.lane) + $$getArrowOrientation(r.lane)}deg`],
              ...transforms,
              ['scaleY', `${$$getNoteScaleY(y, time, r.lane)}`],
            ]);
            const holdTransforms = $$transforms([['translate', '-50%'], ...transforms]);
            const i = {
              classes: [`quant-${quant}`, 'preserve-3d'],
              key: r.key,
              headStyles: {
                left: `calc(${s.center}% + ${$$getNoteX(y, time, r.lane)}px)`,
                width: `${this.layout.hit}%`,
                bottom: `calc(${n.y * 100}% - ${$$getNoteY(y, time, r.lane)}px)`,
                transform: noteTransforms
              }
            };
            n.isHolding && i.classes.push('holding');
            n.isMissed && i.classes.push('missed');
            n.isTaken && i.classes.push('taken');
            n.isHold && n.height && (i.holdStyles = {
              left: i.headStyles.left,
              width: `${this.layout.hit * 0.65}%`,
              bottom: i.headStyles.bottom,
              height: `${n.height * 100}%`,
              transform: holdTransforms
            });
            t.push(i);
            ;
          });
        });
      }), t;
    }
  }
})