<template>
  <div class="judge-detail-wrapper">
    <el-form
      class="judge-form-wrapper"
      ref="judgeForm"
      :rules="rules"
      :model="form"
      label-width="100px"
    >
      <el-form-item label="节点ID：">{{ form.nodeId }}</el-form-item>
      <el-form-item label="命名/展示：" prop="title">
        <el-col :span="20">
          <el-input v-model="form.title"></el-input>
        </el-col>
      </el-form-item>
      <div class="grey-box">
        <p class="title">兜底</p>
        <div class="flex-box">
          <span class="text">进入分支:</span>
          <Behavior
            :list="backupList"
            :skillList="skillList"
            :childNodeList="childNodeList"
            desc="调用"
            :isLimitOnly="false"
            @del="deleteBackupItem"
            @add="addBackupItem"
          ></Behavior>
        </div>
      </div>
      <el-form-item style="margin-top: 10px;">
        <el-button type="primary" @click="submitForm('judgeForm')">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import Behavior from '@/components/Behavior/Index.vue'
export default {
  components: {
    Behavior
  },
  props: {
    skillList: {
      type: Array,
      default: () => []
    },
    childNodeList: {
      type: Array,
      default: () => []
    },
    renderData: { // 后台返回的详情结构
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      form: {
        nodeId: '',
        title: '',
        interActifyAssertsList: [], // 判断列表
        content: ''
      },
      backupList: [], // 兜底列表 @todo 后续要合并进 form.interActifyAssertsList
      unBackupList: [], // 非兜底列表
      rules: {
        title: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 50, message: '不可超过50个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    //
  },
  watch: {
    renderData: function (newval, oldval) {
      console.debug('watch renderData : ', newval)
      this.initData()
    }
  },
  methods: {
    addBackupItem () {
      this.backupList.push({
        isBackup: 1
      })
    },
    deleteBackupItem (index) {
      console.debug('deleteBackupItem', index)
      this.backupList.splice(index, 1)
    },
    transformSubmitData (data) {
      const info = JSON.parse(JSON.stringify(data))
      info.interActifyAssertsList = [...this.backupList, ...this.unBackupList]
      this.form.interActifyAssertsList = info.interActifyAssertsList
      return info
    },
    initData () {
      const renderData = JSON.parse(JSON.stringify(this.$props.renderData))
      // console.debug('init renderData: ', renderData)
      this.form = {
        ...this.form,
        ...renderData
      }
      this.backupList = this.form.interActifyAssertsList.filter(item => item.isBackup === 1)
      this.unBackupList = this.form.interActifyAssertsList.filter(item => item.isBackup === 0)
    },
    submitForm () {
      this.$refs.judgeForm.validate(valid => {
        if (valid) {
          const info = this.transformSubmitData(this.form)
          // console.debug('after transform : ', info)
          this.$emit('submit', info)
          return true
        } else {
          console.debug('submitForm valid fail')
          return false
        }
      })
    }
  },
  mounted () {
    //
  }
}
</script>
<style lang="stylus" scoped>
  >>>.judge-form-wrapper {
    .el-form-item__label {
      white-space nowrap
    }
    .grey-box {
      margin-top 10px
      background-color #f1f0f0
      padding 10px
      .title {
        font-weight bold
        font-size 14px
        text-align center
        height 25px
        line-height 25px
        color #918e8e
      }
      .flex-box {
        // display flex
        // flex-wrap nowrap
        // align-items flex-start
        .text {
          font-size 14px
          color #606266
          display flex
          // background-color #fff
          width 70px
          height 32px
          box-sizing border-box
          // padding 2px 10px
          white-space nowrap
          align-items center
          justify-content center
          margin-right 10px
        }
      }
    }
  }
</style>
