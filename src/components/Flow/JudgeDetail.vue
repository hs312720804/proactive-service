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
      <el-form-item>
        <el-button type="primary" @click="submitForm('judgeForm')">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  props: {
    skillList: {
      type: Array,
      default: () => []
    },
    childNodeList: {
      type: Array,
      default: () => []
    },
    renderData: {
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
      rules: {
        title: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 50, message: '不可超过50个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
  },
  watch: {
    renderData: function (newval, oldval) {
      console.debug('watch renderData : ', newval)
      this.initData()
    }
  },
  methods: {
    transformSubmitData (data) {
      const info = JSON.parse(JSON.stringify(data))
      console.debug('before transform : ', info)
      return info
    },
    initData () {
      const renderData = JSON.parse(JSON.stringify(this.$props.renderData))
      console.debug('init renderData: ', renderData)
      this.form = {
        ...this.form,
        ...renderData
      }
    },
    submitForm () {
      this.$refs.judgeForm.validate(valid => {
        if (valid) {
          const info = this.transformSubmitData(this.form)
          console.debug('after transform : ', info)
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
  }
</style>
