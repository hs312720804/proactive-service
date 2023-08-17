<template>
  <div class="flow-composition-wrapper">
    <div class="composition-header">组件</div>
    <div class="composition-content">
      <!-- <svg
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
      </svg> -->
      <div data-type="judge" data-ctype="判定" class="rhombic judge" @mousedown="startDrag">
        <span>判定</span>
      </div>

      <div data-type="dialogue" data-ctype="对话框" class="dnd-rect" @mousedown="startDrag">
        对话框
        <div class="dnd-rect-btn"></div>
      </div>

      <div data-type="end" data-ctype="结束" class="end-sty" @mousedown="startDrag">
        结束
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
  top: 10%;
  left: 0;
  width: 91px;
  // height: 218px;
  box-sizing: border-box;
  z-index: 100;
  background-color: #ffffff;
}
 .composition-header {
  border-bottom 1px solid #000
  background #000
  height 30px
  font-size 14px
  line-height 30px
  color #fff
  padding-left 10px
  user-select none
  text-align: center;
}
.composition-content {
  border: 1px dashed #000000;
  display flex
  flex-direction column
  justify-content center
  align-items center
  padding 15px 0
  box-sizing border-box
  width 100%
  >div {
    margin-top 15px
  }
  // height 180px
  .rhombic {
    width: 45px;
    height: 45px;
    text-align: center;
    border: 1px solid rgb(196, 196, 196);
    background-color: rgb(228, 228, 228);
    color: rgb(125, 118, 113);
    transform rotate(45deg)
    display: inline-block;
    font-size: 12px
    display: flex;
    justify-content: center;
    align-items: center;
    color: #303133;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    margin: 12px 0;
    span {
      transform: rotate(-45deg);
    }
  }
  .dnd-rect {
    width 80px
    line-height 24px
    text-align center
    cursor move
    font-size 14px
    user-select none
    color #000
    border 1px solid #5F95FF
    background-color #5F95FF
    .dnd-rect-btn {
      border 1px solid #5F95FF
      background-color #EFF4FF
      height 24px
    }
  }
}
.end-sty {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #feebe7;
  border: 2px solid #ff645a;
  line-height: 60px;
  text-align: center;
  color: #303133;
  font-size: 12px;
}
</style>
