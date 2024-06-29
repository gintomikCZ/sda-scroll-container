<template>
  <div class="t-scroll-wrap">
    <div
      class="scroll-container-arrow"
      :class="{'cursor-pointer': scrollableUp}"
      @mouseenter="onMouseenterUp"
      @mouseleave="onMouseleaveUp">
      <transition name="tfade">
        <div v-if="scrollableUp">hover me to scroll UP</div>
      </transition>
  </div>
    <div
      ref="container"
      class="t-scroll-container px-6 py-3"
      :style="{maxHeight: maxHeight + 'px'}">
    <slot></slot>
    </div>
    <div
      class="scroll-container-arrow"
      :class="{'cursor-pointer': scrollableDown}"
      @mouseenter="onMouseenterDown"
      @mouseleave="onMouseleaveDown"
    >
      <transition name="tfade">
        <div v-if="scrollableDown">hover me to scroll DOWN</div>
      </transition>
    </div>
  </div>
</template>

<script>
// import TScrollContainerItem from './TScrollContainerItem.vue'
import { stopWheel, setWheelBack, scrollIt } from '@/utils/scroll.js'
export default {
  name: 'TScrollContainer',
  props: {
    step: { type: Number, default: 30 },
    maxHeight: { type: Number, default: 100 },
    duration: { type: Number, default: 200 },
    defaultScrollTarget: { type: Number, default: 0 },
    delay: { type: Number, default: 400 }
  },
  data () {
    return {
      scrollHeight: null,
      clientHeight: null,
      scrollPosition: null,
      iAmScrollingDown: false,
      iAmScrollingUp: false,
      mouseOnDownArrow: false,
      mouseOnUpArrow: false,
      dataAboveRequested: false,
      timeout: null,
      observer: null
    }
  },
  mounted () {
    stopWheel()
    this.$nextTick(() => {
      return Promise.resolve().then(() => {
        this.scrollHeight = this.$refs.container.scrollHeight
        this.clientHeight = this.$refs.container.clientHeight
        this.scrollPosition = this.$refs.container.scrollTop
      }).then(() => {
        if (this.defaultScrollTargetComputed !== null) {
          const distance = this.defaultScrollTargetComputed - this.scrollPosition
          if (distance !== 0) {
            const duration = this.duration
            return scroll(this.$refs.container, distance, duration)
          }
        }
        this.observer = new MutationObserver(this.onMutation)
        this.observer.observe(this.$refs.container, { attributes: false, childList: true, subtree: true })
      })
    })
  },
  watch: {
    scrollableUp (nv) {
      if (!nv) {
        this.$emit('scroll-up-end')
        this.dataAboveRequested = true
      }
    },
    scrollableDown (nv) {
      if (!nv) {
        this.$emit('scroll-down-end')
      }
    }
  },
  computed: {
    defaultScrollTargetComputed () {
      if (this.scrollSpace === 0 || this.scrollPosition === null) return null
      if (this.scrollSpace > this.defaultScrollTarget || this.defaultScrollTarget < 0 || this.defaultScrollTarget === this.scrollPosition) return null
      return this.defaultScrollTarget
    },
    scrollSpace () {
      if (this.scrollHeight === null || this.clientHeight === null) return 0
      return this.scrollHeight - this.clientHeight
    },
    scrollableDown () {
      return this.scrollSpace > this.scrollPosition
    },
    scrollableUp () {
      return this.scrollPosition > 0
    }
  },
  beforeDestroy () {
    setWheelBack()
    this.observer.disconnect()
  },

  methods: {
    scrollDown () {
      this.iAmScrollingDown = true
      scrollIt(this.$refs.container, this.step, this.duration, 'linear', () => {
        this.scrollPosition = this.$refs.container.scrollTop
        this.iAmScrollingDown = false
        if (!this.mouseOnDownArrow) return
        if (!this.scrollableDown) {
          this.$emit('scroll-down-end', 'from scroll down')
          return
        }
        this.scrollDown()
      })
    },
    scrollUp () {
      this.iAmScrollingUp = true
      const dist = 0 - this.step
      scrollIt(this.$refs.container, dist, this.duration, 'linear', () => {
        this.scrollPosition = this.$refs.container.scrollTop
        this.iAmScrollingUp = false
        if (!this.mouseOnUpArrow) return
        if (!this.scrollableUp) {
          this.$emit('scroll-up-end', 'from scroll up')
          this.dataAboveRequested = true
          return
        }
        return this.scrollUp()
      })
    },
    onMutation () {
      return Promise.resolve().then(() => {
        const oldValue = this.scrollHeight
        this.scrollHeight = this.$refs.container.scrollHeight
        this.clientHeight = this.$refs.container.clientHeight
        if (this.dataAboveRequested) {
          this.$refs.container.scrollTop = this.scrollHeight > oldValue ? (this.scrollHeight - oldValue) : 0
          this.dataAboveRequested = false
        }
      }).then(() => {
        this.scrollPosition = this.$refs.container.scrollTop
      }).then(() => {
        if (this.mouseOnUpArrow && this.scrollableUp) {
          return this.scrollUp()
        }
        if (this.mouseOnDownArrow && this.scrollableDown) {
          return this.scrollDown()
        }
      })
    },
    onMouseenterUp () {
      this.mouseOnUpArrow = true
      if (!this.iAmScrollingUp) {
        if (this.scrollableUp) {
          this.timeout = setTimeout(() => {
            return this.scrollUp()
          }, this.delay)
          return
        }
        this.timeout = setTimeout(() => {
          this.$emit('scroll-up-end', 'from on mouseenter up')
          this.dataAboveRequested = true
        }, this.delay)
      }
    },
    onMouseleaveUp () {
      this.mouseOnUpArrow = false
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = null
      this.dataAboveRequested = false
    },
    onMouseenterDown () {
      this.mouseOnDownArrow = true
      if (!this.iAmScrollingDown) {
        if (this.scrollableDown) {
          this.timeout = setTimeout(() => {
            return this.scrollDown()
          }, this.delay)
          return
        }
        this.timeout = setTimeout(() => {
          this.$emit('scroll-down-end', 'from mouseenter down')
        }, this.delay)
      }
    },
    onMouseleaveDown () {
      this.mouseOnDownArrow = false
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = null
    }
  }
}
</script>
<style lang="stylus">
.cursor-pointer {
  cursor: pointer;
}
.t-scroll-wrap {
  overflow: hidden;
  display: block;
  border: 1px solid black;
}
.scroll-container-arrow
  min-height: 30px
  min-width: 100px
  display: flex
  justify-content: center
  align-items: center
  background: lighten(lightpink, 50%)

.scroll-container-arrow:hover {
  color: ;
}

.t-scroll-container {
  display: block;
  background: white
  min-width: 100%;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -ms-overflow-style: none;
}
</style>
