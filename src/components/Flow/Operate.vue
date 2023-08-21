<template>
  <div class="operate-component-wrapper">
    <span
      class="operate-button"
      :class="item.command"
      v-for="(item, index) in features"
      :key="index"
      @click="handleCommand(item.command)"
    >
      {{ item.title }}
    </span>
  </div>
</template>
<script>
export default {
  data () {
    return {
      features: [
        {
          name: '放大画布',
          title: '+',
          command: 'add'
        },
        {
          name: '缩小画布',
          title: '-',
          command: 'reduce'
        }
      ]
    }
  },
  methods: {
    handleCommand (command) {
      console.debug('handleCommand: ', command)
      this.$emit(command)
    }
  }
}
</script>
  <style lang="stylus" scoped>
.operate-component-wrapper {
  position absolute
  bottom 10px
  right 0
  width 80px
  height 160px
  display flex
  flex-direction column
  justify-content center
  padding 10px 0
  box-sizing border-box
  // border 1px solid #ddd
  margin-right 0px
  z-index 100

  .operate-button {
    background-color #d3d3d347
    width 60px
    margin 0 auto
    height 60px
    font-size 60px
    line-height 60px
    text-align center
    cursor pointer
    user-select none
    margin-top 20px
  }
  .reduce {
    font-size: 97px;
    font-weight: 100;
  }
}
</style>
