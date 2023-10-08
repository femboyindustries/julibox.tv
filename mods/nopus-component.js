_t({
  components: { Beatlines: xk },
  props: {
    manager: { type: Object, required: !0 },
    isDesktop: { type: Boolean, required: !0 },
    showCta: { type: Boolean, required: !0 },
  },
  computed: {
    layout() {
      return l2(this.manager.lanes.length);
    },
    scrollStyles() {
      return { transform: `translateY(${this.manager.progress * 100}%)` };
    },
    laneLines() {
      return this.layout.lanes.map((t) => ({
        classes: [],
        styles: { left: `${t.center * 100}%` },
      }));
    },
    hitIndicators() {
      return this.manager.lanes.map((t, e) => {
        const n = [];
        const time = this.manager.progress * this.manager.duration / 1000;
        return (
          this.manager.lanes[e].isActive && n.push("active"),
          this.manager.lanes[e].isFlubbing && n.push("flubbing"),
          this.showCta && n.push("alert"),
          {
            classes: n,
            text: this.layout.hotKeys[e],
            styles: {
              width: `${this.layout.hit * 100}%`,
              left: `calc(${this.layout.lanes[e].center * 100}% + ${$$getNoteX(0, time, e)}px)`,
              bottom: `calc(20% - ${$$getNoteY(0, time, e)}px)`
            },
            items: t.feedback.map((r) =>
              r === 0
                ? { textKey: "QUALITY.PERFECT", classes: ["perfect"] }
                : r === 1
                ? { textKey: "QUALITY.GOOD", classes: ["good"] }
                : { textKey: "QUALITY.OKAY", classes: ["okay"] }
            ),
          }
        );
      });
    },
    inputs() {
      const t = [];
      return (
        this.manager.inputs.forEach((e) => {
          e.forEach((n) => {
            n.isVisible &&
              n.indicators.forEach((r) => {
                const s = this.layout.lanes[r.lane];
                if (s === void 0) {
                  console.warn("unrenderable lane", r.lane);
                  return;
                }

                const y = (n.y - this.manager.progress) * this.manager.duration / 1000;
                const time = this.manager.progress * this.manager.duration / 1000;

                const i = {
                  classes: [],
                  isHold: n.isHold,
                  key: r.key,
                  start: n.start,
                  styles: {
                    left: `calc(${s.center * 100}% + ${$$getNoteX(y, time, r.lane)}px)`,
                    width: `${this.layout.hit * 100}%`,
                    bottom: `calc(${n.y * 100}% - ${$$getNoteY(y, time, r.lane)}px)`,
                  },
                };
                n.isHolding && i.classes.push("holding"),
                  n.isMissed && i.classes.push("missed"),
                  n.isTaken && i.classes.push("taken"),
                  n.isHold &&
                    n.height &&
                    (i.styles.height = `${n.height * 100}%`),
                  t.push(i);
              });
          });
        }),
        t
      );
    },
  },
})