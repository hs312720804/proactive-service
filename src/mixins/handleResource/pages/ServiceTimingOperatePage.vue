<template>
  <div class="service-timing-wrapper">
    <el-form :model="form" :rules="rules" ref="timingForm" label-width="150px">
      <el-form-item label="对应服务" prop="serviceId">
        <el-select v-model="form.serviceId" placeholder="请选择对应服务">
          <el-option
            v-for="item in serviceList"
            :key="item.id"
            :label="item.serviceName"
            :value="Number(item.id)"
          ></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时机名称" prop="name">
        <el-input v-model="form.name" style="width: 500px;"></el-input>
      </el-form-item>
      <el-form-item>
        <TagsRule
          v-if="ruleTagsList.length > 0"
          ref="tagRule"
          :tagList="ruleTagsList"
          :ruleJson.sync="form.ruleJsonObj"
          :serviceId="0"
          :parentIndex="0"
        ></TagsRule>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveForm">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { getServicesListAPI } from '@/services/services'
import { getRuleTagsListAPI } from '@/services/tag'
import { addServiceTimingAPI, getServiceTimingDetail, updateServiceTimingAPI } from '@/services/timing'
import TagsRule from '@/components/TagsRule/Index.vue'
export default {
  props: {
    mode: {
      type: String
    },
    row: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    TagsRule
  },
  provide () {
    return {
      serviceId: this.form.serviceId
    }
  },
  data () {
    return {
      ruleTagsList: [],
      rules: {
        name: [
          { required: true, message: '请输入时机名称', trigger: ['blur', 'change'] }
        ]
      },
      rowId: '',
      form: {
        name: '',
        serviceId: '',
        ruleJson: JSON.stringify({ rules: [], condition: 'AND' }),
        ruleJsonObj: {
          rules: [],
          condition: 'AND'
        }
      },
      serviceList: []
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    async getRuleTagsList () {
      try {
        const res = await getRuleTagsListAPI()
        if (res.code === 1000) {
          this.ruleTagsList = res.data.map((item) => {
            return {
              ...item,
              ruleJson: item.ruleJson ? JSON.parse(item.ruleJson) : {}
            }
          })
        }
      } catch (error) {
        console.error('getRuleTagsList error: ', error)
      }
    },
    async getServiceList () {
      try {
        const res = await getServicesListAPI({
          page: 1,
          pageSize: 1000
        })
        if (res.code === 1000) {
          this.serviceList = res.data
        }
      } catch (error) {
        console.error('获取服务列表失败', error)
      }
    },
    saveForm () {
      this.$refs.timingForm.validate(valid => {
        if (valid) {
          if (this.$refs.tagRule) {
            if (Array.isArray(this.$refs.tagRule)) { // 页面存在多个标签规则组件
              this.$refs.tagRule.map((component) => {
                component.transformSaveRules()
              })
            } else {
              this.$refs.tagRule.transformSaveRules()
            }
          }
          this.form.ruleJson = this.form.ruleJsonObj ? JSON.stringify(this.form.ruleJsonObj) : '{}'
          if (this.mode === 'add') {
            this.addServiceTiming()
          } else if (this.mode === 'edit') {
            this.editServiceTiming()
          }
          return true
        } else {
          return false
        }
      })
    },
    async addServiceTiming () {
      try {
        const res = await addServiceTimingAPI(this.form)
        if (res.code === 1000) {
          this.$message({
            type: 'success',
            message: '添加成功'
          })
          this.$emit('go-back', true)
        }
      } catch (error) {
        console.error('addServiceTiming error: ', error)
      }
    },
    async editServiceTiming () {
      try {
        const res = await updateServiceTimingAPI({
          ...this.form,
          id: this.row.id
        })
        if (res.code === 1000) {
          this.$emit('go-back', true)
          this.$message({
            type: 'success',
            message: '修改成功'
          })
        }
      } catch (error) {
        console.error('editServiceTiming error: ', error)
      }
    },
    async refill () {
      if (this.mode === 'edit') {
        try {
          const res = await getServiceTimingDetail({
            id: this.row.id
          })
          if (res.code === 1000) {
            this.form = res.data
            if (res.data.ruleJson) { // 动态设置form中的ruleJsonObj, 解决丢失响应式，造成子组件无法更新问题
              this.$set(this.form, 'ruleJsonObj', JSON.parse(res.data.ruleJson))
            } else {
              this.$set(this.form, 'ruleJsonObj', {
                rules: [],
                condition: 'AND'
              })
            }
          }
        } catch (error) {
          console.error('getServiceTimingDetail error: ', error)
        }
      }
    }
  },
  mounted () {
    // this.refill()
  },
  async created () {
    this.getServiceList()
    await this.getRuleTagsList()
    this.refill()
  }
}
</script>
<style lang="stylus" scoped>
    .service-timing-wrapper {

    }

</style>
