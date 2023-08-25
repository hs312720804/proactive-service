<template>
  <div class="version-component-wrapper">
    <div class="version-wrapper">
      <span class="edit-statu-title"> {{ editStatuStr }}</span>
      <div class="button-group-wrapper">
        <!-- <el-button
          type="primary"
          @click="$message.success('保存成功')"
        >保存</el-button> -->
        <el-button
          plain
          @click="uploadVersion"
          :disabled="!accessMap.alive"
        >上线</el-button>
        <div
          class="more"
          @click.stop
        >
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
        <!-- <span class="save-text">09:30:30 已保存</span> -->
      </div>
    </div>
  </div>
</template>
<script>
import store from 'cseed-frame/store/_index'
import { getStatuTitleAPI, resetServiceAPI } from '@/services/services'
import { getVersionIdAPI } from '@/services/flow'
import { onlineVersionAPI } from '@/services/version'
export default {
  props: {
    serviceId: {
      type: Number
    },
    accessMap: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      editStatuStr: '未编辑',
      versionId: 0
    }
  },
  methods: {
    handleCommand (payload) {
      if (payload === 'reset') {
        this.resetVersion()
        setTimeout(() => {
          store.commit('flow/updateGraphTree', {
            serviceId: this.serviceId
          })
        }, 300)
      }
    },
    async uploadVersion () {
      const res = await onlineVersionAPI({
        versionId: this.versionId
      })
      if (res.code === 1000) {
        this.$message.success(res.data)
        this.fetchStatuTitle()
        setTimeout(() => {
          store.commit('flow/updateGraphTree', {
            serviceId: this.serviceId
          })
        }, 1000)
      }
    },
    async resetVersion () {
      const res = await resetServiceAPI({
        serviceId: this.serviceId
      })
      if (res.code === 1000) {
        this.$message.success(res.data)
        this.fetchStatuTitle()
      }
    },
    async fetchStatuTitle () { // 获取编辑状态 （目前会触发的场景：上线 重置 mutation:updateStatuTitle）
      try {
        const statuRes = await getStatuTitleAPI({
          serviceId: Number(this.serviceId)
        })
        if (statuRes.code === 1000) {
          this.editStatuStr = statuRes.data
        }
      } catch (error) {
        console.error('fetchStatuTitle error: ', error)
      }
    },
    initVuexListen () {
      store.subscribe((mutation, state) => {
        // console.debug('updateStatuTitle mutation: ')
        const payload = mutation.payload

        // 只处理当前tab中的数据，其他tab中的监听，直接返回，不处理
        if (payload.serviceId && payload.serviceId !== this.serviceId) return

        if (mutation.type === 'flow/updateStatuTitle') {
          this.fetchStatuTitle()
        } else if (mutation.type === 'flow/updateVersionId') { // 更新版本id
          this.getVersionId()
        }
      })
    },
    async getVersionId () {
      try {
        const res = await getVersionIdAPI({
          serviceId: this.serviceId
        })
        if (res.code === 1000) {
          this.versionId = res.data
        }
      } catch (error) {
        console.error('getVersionId error: ', error)
      }
    }
  },
  mounted () {
    this.initVuexListen()
    this.getVersionId()
  }
}
</script>
<style lang="stylus" scoped>
.version-component-wrapper
  display flex
  width 100%
  height 40px
  margin-bottom 20px
  justify-content flex-end
  .version-wrapper
    display flex
    align-items center
    .edit-statu-title
      font-size 14px
      color #999
      margin-right 10px
    .button-group-wrapper
      display flex
      align-items center
      position relative
      .more
        width 20px
        height 20px
        display block
        cursor pointer
        margin-left 10px
        i
          font-size 16px
          color #999
          transform rotate(90deg)
      .save-text
        font-size 12px
        color #999
        position absolute
        bottom -20px
        left 0
</style>
