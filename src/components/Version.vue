<template>
  <div class="version-component-wrapper">
    <div class="version-wrapper">
      <span class="edit-statu-title">线上版本*** {{ editStatuStr }}</span>
      <div class="button-group-wrapper">
        <el-button type="primary">保存</el-button>
        <el-button plain>上线</el-button>
        <div class="more" @click.stop>
          <el-dropdown
            placement="bottom-end"
            trigger="click"
            :hide-on-click="false"
            @command="handleCommand"
          >
            <i class="el-icon-more"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="reset">重置</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <span class="save-text">09:30:30 已保存</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    serviceId: {
      type: Number
    }
  },
  data () {
    return {
      editStatuStr: '未编辑'
    }
  },
  methods: {
    handleCommand () {
      console.debug('handleCommand')
    }
  }
}
</script>
<style lang="stylus" scoped>
.version-component-wrapper {
    display flex
    width 100%
    height 40px
    justify-content flex-end
    .version-wrapper {
        display flex
        align-items center
        .edit-statu-title {
            font-size 14px
            color #999
            margin-right 10px
        }
        .button-group-wrapper {
            display flex
            align-items center
            position relative
            .more {
                width 20px
                height 20px
                display block
                cursor pointer
                margin-left 10px
                i {
                    font-size 16px
                    color #999
                    transform rotate(90deg)
                }
            }
            .save-text {
                font-size 12px
                color #999
                position absolute
                bottom -20px
                left 0
            }
        }
    }

}
</style>
