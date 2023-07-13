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
      <ul class="draglist-wrapper">
        <draggable v-model="unBackupList" group="people" @start="drag=true" @end="drag=false">
          <li
            class="list-item"
            v-for="(item,index) in unBackupList"
            :key="index"
          >
            <TagsRule
              ref="tagRule"
              :tagList="ruleTagsList"
              :ruleJson.sync="item.ruleJsonObj"
              :tagIds.sync="item.tagIds"
              :parentIndex="index"
            ></TagsRule>
            <span class="text">进入分支:</span>
            <Behavior
              :list="item.nextNodeList"
              :skillList="skillList"
              :childNodeList="childNodeList"
              :parentIndex="index"
              desc="调用"
              :isLimitOnly="false"
              @del="deleteUnBackupItemBehavior"
              @add="addUnBackupItemBehavior"
            ></Behavior>
          </li>
        </draggable>
        <el-form-item>
          <el-button type="text" style="font-size: 14px;" @click="addUnBackupItem">+添加判定</el-button>
        </el-form-item>
      </ul>
      <div class="gurantee-box">
        <p class="title">兜底</p>
        <div class="flex-box">
          <span class="text">进入分支:</span>
          <Behavior
            :list="nextNodeList"
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
import TagsRule from '@/components/TagsRule/Index.vue'
import draggable from 'vuedraggable'
import { getRuleTagsListAPI } from '@/services/tag'
export default {
  components: {
    Behavior,
    draggable,
    TagsRule
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
    },
    versionId: {
      type: Number
    }
  },
  data () {
    return {
      drag: false,
      ruleTagsList: [], // 规则标签列表
      form: {
        nodeId: '',
        title: '',
        interActifyAssertsList: [], // 判断列表
        content: ''
      },
      backupList: [], // 兜底列表 唯一
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
    nextNodeList () {
      if (this.backupList.length > 0) {
        return this.backupList[0].nextNodeList
      }
      return []
    }
  },
  watch: {
    renderData: function (newval, oldval) {
      console.debug('watch renderData : ', newval)
      this.initData()
    }
  },
  methods: {
    addUnBackupItem () {
      this.unBackupList.push({
        isBackup: 0,
        nextNodeList: [],
        // ruleJson: '',
        ruleJsonObj: {
          rules: [],
          condition: 'AND'
        },
        ruleJson: JSON.stringify({ rules: [], condition: 'AND' })
      })
    },
    getUnBackupNextNodeList (list) {
      if (list.length > 0) {
        return list
      }
      return []
    },
    addUnBackupItemBehavior ({ parentIndex }) {
      // console.debug('unBackupList: ', this.unBackupList)
      if (this.unBackupList.length === 0) {
        this.unBackupList.push({
          isBackup: 0,
          nextNodeList: []
        })
      }
      const nextNodeList = this.unBackupList[parentIndex].nextNodeList
      nextNodeList.push({})
    },
    deleteUnBackupItemBehavior ({ levelIndex, parentIndex }) {
      // console.debug('deleteUnBackupItemBehavior', levelIndex, parentIndex)
      this.unBackupList[parentIndex].nextNodeList.splice(levelIndex, 1)
    },
    addBackupItem () {
      // console.debug('backupList: ', this.backupList)
      if (this.backupList.length === 0) {
        this.backupList.push({
          isBackup: 1,
          nextNodeList: []
        })
      }
      const nextNodeList = this.backupList[0].nextNodeList
      nextNodeList.push({})
    },
    deleteBackupItem ({ levelIndex, parentIndex }) {
      // console.debug('deleteBackupItem', index)
      this.backupList[0].nextNodeList.splice(levelIndex, 1)
    },
    transformSubmitData (data) {
      const info = JSON.parse(JSON.stringify(data))
      info.interActifyAssertsList = [...this.backupList, ...this.unBackupList]
      info.interActifyAssertsList.forEach(item => {
        if (item?.nextNodeList?.length > 0) { // 技能 / 节点 处理
          item.nextNodeList.forEach((nextNodeItem, nextNodeIndex) => {
            const keys = Object.keys(nextNodeItem)
            this.skillList.forEach((skillItem, skillIndex) => {
              if (nextNodeItem?.callType === 1 && nextNodeItem?.nextSkillId) {
                if (skillItem.skillId.toString() === nextNodeItem?.nextSkillId.toString()) {
                  const paramList = skillItem.paramList
                  paramList.forEach((paramItem, paramIndex) => {
                    const key = paramItem.paramKey
                    if (!nextNodeItem.skillParam) {
                      nextNodeItem.skillParam = []
                    } else {
                      if (typeof nextNodeItem.skillParam === 'string') {
                        nextNodeItem.skillParam = JSON.parse(nextNodeItem.skillParam)
                      }
                    }
                    if (keys.includes(key)) {
                      if (paramItem.dataType === 1) { // 1数值 2字符串
                        nextNodeItem.skillParam.push({
                          key: paramItem.paramKey,
                          value: Number(nextNodeItem[paramItem.paramKey])
                        })
                      } else if (paramItem.dataType === 2) {
                        nextNodeItem.skillParam.push({
                          key: paramItem.paramKey,
                          value: nextNodeItem[paramItem.paramKey].toString()
                        })
                      }
                    }
                  })
                }
              } else {
                nextNodeItem.skillParam = []
              }
            })
            nextNodeItem.skillParam = JSON.stringify(nextNodeItem.skillParam) || ''
          })
        }
        if (item?.ruleJsonObj?.rules && item?.ruleJsonObj?.rules?.length > 0) { // 非兜底的子节点规则json 字符串化
          item.ruleJson = JSON.stringify(item.ruleJsonObj)
        }
      })
      this.form.interActifyAssertsList = info.interActifyAssertsList
      // console.debug('tranform info: ', info)
      info.versionId = this.versionId
      return info
    },
    initTransformData (data) {
      data.interActifyAssertsList && data.interActifyAssertsList.forEach((item, index) => {
        item.nextNodeList.forEach((nextNodeItem, nextNodeIndex) => {
          if (nextNodeItem.callType === 1) { // 回填技能 额外框
            if (nextNodeItem.skillParam === '') {
              nextNodeItem.skillParam = []
            } else {
              nextNodeItem.skillParam = JSON.parse(nextNodeItem.skillParam)
            }
            nextNodeItem.skillParam.forEach(paramItem => {
              nextNodeItem[paramItem.key] = paramItem.value
            })
          }
        })
        if (item.isBackup === 0 && (item.ruleJson !== '' || item.ruleJson !== '[]')) { // 处理非兜底节点的规则回填
          item.ruleJsonObj = JSON.parse(item.ruleJson)
        }
      })
      return data
    },
    initData () {
      let renderData = JSON.parse(JSON.stringify(this.$props.renderData))
      // console.debug('init renderData: ', renderData)
      renderData = this.initTransformData(renderData)
      this.form = {
        ...this.form,
        ...renderData
      }
      this.backupList = this.form.interActifyAssertsList.filter(item => item.isBackup === 1)
      this.unBackupList = this.form.interActifyAssertsList.filter(item => item.isBackup === 0)
      if (this.unBackupList.length === 0) {
        this.unBackupList.push({
          isBackup: 0,
          nextNodeList: [],
          ruleJsonObj: {
            rules: [],
            condition: 'AND'
          },
          ruleJson: JSON.stringify({ rules: [], condition: 'AND' }),
          tagIds: [] // 存储标签id数组
        })
      } else {
        this.unBackupList = this.unBackupList.map(item => {
          return {
            ...item,
            tagIds: [],
            ruleJsonObj: item.ruleJson
              ? JSON.parse(item.ruleJson)
              : {
                  rules: [],
                  condition: 'AND'
                }
          }
        })
      }
    },
    submitForm () {
      this.$refs.judgeForm.validate(valid => {
        if (valid) {
          this.$refs.tagRule && this.$refs.tagRule.map((component) => {
            component.transformSaveRules()
          })
          const info = this.transformSubmitData(this.form)
          console.debug('after transform : ', info)
          this.$emit('submit', info)
          return true
        } else {
          console.debug('submitForm valid fail')
          return false
        }
      })
    },
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
    }
  },
  mounted () {
    this.getRuleTagsList()
  }
}
</script>
<style lang="stylus" scoped>
  >>>.judge-form-wrapper {
    .el-form-item__label {
      white-space nowrap
    }
    .draglist-wrapper {
      width 92%
      margin 10px auto 0
      .list-item {
        background-color rgb(239, 244, 255)
        padding 10px
        margin-bottom 10px
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
    .gurantee-box {
      margin-top 10px
      background-color rgb(239, 244, 255)
      padding 10px
      width 92%
      margin 0 auto
      box-sizing border-box
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
