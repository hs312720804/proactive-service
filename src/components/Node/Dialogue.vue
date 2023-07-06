<template>
  <div class="dialogue-wrapper">
    <span class="desc">判断框**</span>
    <p class="title">content</p>
    <div class="flex-end-box">
      <ul class="button-wrapper" v-if="buttonList && buttonList.length > 0">
        <li
          class="button-item"
          v-for="(item) in buttonList"
          :key="item.buttonId"
        >
          {{ item.title }}</li>
      </ul>
      <ul class="static-button-wrapper">
        <li>自动消失</li>
        <li>用户返回</li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      buttonList: []
    }
  },
  inject: ['getNode', 'getGraph'],
  computed: {
  },
  watch: {

  },
  methods: {
  },
  mounted () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    // console.debug(self.getNode())
    const node = self.getNode()
    // console.debug('node: ', node)
    self.buttonList = node.getData().buttonList
    const graph = self.getGraph()
    // console.debug('graph: ', graph.toJSON())
    node.on('change:data', ({ current }) => {
      self.buttonList = node.getData().buttonList
    //   console.debug('buttonList: ', self.buttonList)
    //   console.debug('change:data', current)
    })
  }
}
</script>
<style lang="stylus" scoped>
    .dialogue-wrapper {
        border 1px solid #5f95ff
        padding 10px
        background #eff4ff
        position relative
        .desc {
            position absolute
            left -20px
            top -20px
            font-size 12px
            color #000
        }
        .flex-end-box {
            display flex
            align-items flex-end
            .button-wrapper {
                display flex
                align-items center
                flex-wrap nowrap
                .button-item {
                    border 1px solid #5f95ff
                    padding 5px 10px
                    margin-right 5px
                    font-size 12px
                    color #000
                    white-space nowrap
                    width 35px
                    overflow hidden
                    text-overflow ellipsis
                }
            }
            .static-button-wrapper {
                display flex
                align-items center
                flex-direction column
                margin-left 10px
                li {
                    border 1px solid #5f95ff
                    padding 5px 10px
                    margin-right 5px
                    font-size 12px
                    color #000
                    white-space nowrap
                    margin-bottom 10px

                    &:last-child {
                        margin-bottom 0
                    }
                }
            }
        }
    }
</style>
