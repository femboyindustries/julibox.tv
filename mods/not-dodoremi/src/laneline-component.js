rt({
  props: {
    feedback: {
      type: Array,
      required: !0
    },
    index: {
      type: Number,
      required: !0
    },
    isActive: {
      type: Boolean,
      required: !0
    },
    isHolding: {
      type: Boolean,
      required: !0
    }
  },
  setup() {
    return {
      //timelineManager: new lN
    }
  },
  watch: {
    feedback: {
      handler: 'onFeedbackChange',
      deep: !0
    },
    isHolding: 'onIsHoldingChange'
  },
  mounted() {
    /*this.timelineManager.setup(
      this.$refs,
      {
        category: getComputedStyle(this.$refs.root).getPropertyValue('--category-color'),
        categoryDark: getComputedStyle(this.$refs.root).getPropertyValue('--category-color-dark')
      }
    )*/
  },
  methods: {
    onFeedbackChange(t) {
      /*const e = t[t.length - 1];
      if (e === 0 || e === 10) {
        this.timelineManager.play('perfect', e === 10);
        return
      }
      if (e === 1 || e === 11) {
        this.timelineManager.play('good', e === 11);
        return
      }
      if (e === 2 || e === 12) {
        this.timelineManager.play('okay', e === 12);
        return
      }
      if (e === 3) {
        this.timelineManager.play('miss', !1);
        return
      }
      this.timelineManager.play('flub', !1)*/
    },
    onIsHoldingChange(t) {
      //t ||
      //this.timelineManager.park()
    }
  }
})