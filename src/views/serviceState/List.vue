<template>
  <div class="detail-page-wrapper">
    <el-form>
      <el-form-item label="当前交互服务状态:">
        <el-switch v-model="form.interInterfaceState"
                   active-text=""
                   inactive-text=""
                   @change="onSwitchChange('INTER_INTERFACE_STATE', form.interInterfaceState)"
        >
        </el-switch>
        <span>{{ form.interInterfaceState ? '打开' : '关闭' }}</span>
      </el-form-item>
      <el-form-item label="当前时机服务状态:">
        <el-switch
          style="display: block"
          v-model="form.interMomentState"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text=""
          inactive-text=""
          @change="onSwitchChange('INTER_MOMENT_STATE', form.interMomentState)"
        ></el-switch>
        <span>{{ form.interMomentState ? '打开' : '关闭' }}</span>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { getSwitchStatesAPI, updateStateAPI } from '@/services/services'
export default {
  data () {
    return {
      form: {
        interMomentState: false,
        interInterfaceState: false
      }
    }
  },
  mounted () {
    // 当页面挂载时，获取当前状态
    this.getSwitchInitialStates()
  },
  methods: {
    async getSwitchInitialStates () {
      try {
        const response = await getSwitchStatesAPI()
        if (response && response.code === 1000 && response.data) {
          this.form.interMomentState = Boolean(response.data.INTER_MOMENT_STATE)
          this.form.interInterfaceState = Boolean(response.data.INTER_INTERFACE_STATE)
        } else {
          console.warn('Received incorrect data structure or wrong code from API')
        }
      } catch (error) {
        console.error('An error occurred while fetching switch states:', error)
        this.form.interMomentState = 0 // 默认值
        this.form.interInterfaceState = 0 // 默认值
      }
    },
    async onSwitchChange (stateKey, stateValue) {
      const params = {
        stateKey,
        stateValue: stateValue ? 1 : 0
      }
      try {
        debugger
        console.log(params)
        await updateStateAPI(params)
        console.log(`${stateKey} turned ${stateValue ? 'on' : 'off'}`)
      } catch (error) {
        console.error(`Failed to update the state of ${stateKey}:`, error)
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
.detail-page-wrapper {
    width 100%
    // height 100%
    background-color #fff
    padding 20px
    box-sizing border-box
    // >>>.el-page-header {
    //     .el-page-header__title {
    //         font-size 16px
    //     }
    // }
}
.el-form-item {
  display: flex;
  align-items: center;
}

.el-form-item__content {
  display: flex;
  align-items: center;
}

.el-form-item__label,
.el-switch,
span {
  margin-right: 10px;
}
</style>
