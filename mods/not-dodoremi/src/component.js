at({
  components: {
    Beatlines: QI,
    LaneLine: w7e,
    LaneRing: F7e,
    LaneText: G7e
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
      return x5(this.manager.lanes.length);
    },
    lanes() {
      return this.manager.lanes.map((t, e) => ({
        isActive: t.isActive,
        isHolding: t.activeInput !== void 0,
        feedback: t.feedback,
        hotkey: this.hotkeys.keys[e],
        styles: {
          width: `${this.layout.hit}%`,
          left: `${this.layout.lanes[e].center}%`
        }
      }));
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
            const i = {
              classes: [],
              key: r.key,
              headStyles: {
                left: `${s.center}%`,
                width: `${this.layout.hit}%`,
                bottom: `${n.y * 100}%`
              }
            };
            n.isHolding && i.classes.push('holding');
            n.isMissed && i.classes.push('missed');
            n.isTaken && i.classes.push('taken');
            n.isHold && n.height && (i.holdStyles = {
              left: i.headStyles.left,
              width: `${this.layout.hit * 0.65}%`,
              bottom: i.headStyles.bottom,
              height: `${n.height * 100}%`
            });
            t.push(i);
            ;
          });
        });
      }), t;
    }
  }
})