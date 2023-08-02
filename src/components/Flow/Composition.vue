<template>
  <div class="flow-composition-wrapper">
    <div class="composition-header">组件：</div>
    <div class="composition-content">
      <svg
        class="rhombic judge"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 246 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        data-type="judge"
        data-ctype="判定"
        @mousedown="startDrag"
      >
        <path
          vector-effect="non-scaling-stroke"
          d="M3.16228 41L123 1.05409L242.838 41L123 80.9459L3.16228 41Z"
          fill="#EFF4FF"
          fill-opacity="0.6"
          stroke="#5F95FF"
          stroke-width="1"
        />
        <text x="90" y="40" dominant-baseline="middle"
              font-size="40" stroke="#000" fill="#0000ff"
        >判定</text>
      </svg>
      <div data-type="dialogue" data-ctype="对话框" class="dnd-rect" @mousedown="startDrag">
        对话框
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
    }
  },
  methods: {
    startDrag (e) {
      console.debug('startDrag: ', e)
      this.$emit('drag', e)
    }
  }
}
</script>
<style lang="stylus" scoped>
 .flow-composition-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100px;
    height: 200px;
    border 1px solid #ddd
    box-sizing border-box
    z-index 100
    background-color #fff
 }
 .composition-header {
  border-bottom 1px solid #ddd
  height 30px
  font-size 14px
  line-height 30px
  color #ccc
  padding-left 10px
  user-select none
 }
  .composition-content {
    display flex
    flex-direction column
    justify-content center
    align-items center
    padding 20px
    box-sizing border-box
    width 100%
    height calc(100% - 30px)
    .rhombic {
      width 80px
      display flex
      flex-direction column
      justify-content center
      align-items center
      cursor move
      user-select none
    }
    .dnd-rect {
      width 80px
      height 30px
      // margin 16px
      margin-top 20px
      line-height 30px
      text-align center
      border 1px solid #5F95FF
      border-radius 6px
      cursor move
      font-size 14px
      user-select none
      color #000
      background-color #EFF4FF
    }
  }
</style>
