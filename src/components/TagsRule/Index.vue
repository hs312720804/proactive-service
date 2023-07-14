<template>
  <div class="tags-rule-wrapper">
    <!-- v-if="tagList && tagList.length > 0" -->
    <template>
      <div
        class="label-or-space"
        :key="parentIndex + 'or'"
        v-show="ruleJson.rules.length > 1"
      >
        <el-button
          type="success"
          round
          :key="'button2' + '_' + parentIndex"
          @click="handleRulesConditionChange(ruleJson)"
        >
          {{ ruleJson.condition === 'AND' ? '且' : '或' }}
        </el-button>
      </div>
      <template
        v-for="(item, index) in ruleJson.rules"
      >
        <div class="label-ground" :key="parentIndex + '_' + index">
          <div class="tag-condition--parent">
            <div class="tag-condition" v-show="item.rules.length > 1">
              <el-button
                type="warning"
                @click="handleRulesConditionChange(item)"
                round
                size="small"
                :key="'button' + index + '_' + parentIndex"
              >
                {{ item.condition === 'AND' ? '且' : '或' }}
              </el-button>
            </div>
            <div
              v-for="(childItem, n) in item.rules"
              :key="index + 'tagId' + n"
              :class="{ 'label-item': true, paddingTop: n > 0 }"
            >
              <!-- 渲染动态表单 -->
              <!-- 按钮点击 -->
              <template v-if="childItem.tagKey === 'button_click'">
                <span class="txt">{{ childItem.tagName }}</span>
                <el-select
                  v-if="cache[childItem.tagKey].list"
                  style="width: 130px"
                  :key="n + 'dialogue'"
                  v-model="childItem.dialogueNodeId"
                  filterable
                  clearable
                  placeholder="请选择对话框"
                  @change="getDialogueButtonList(childItem.dialogueNodeId, childItem.tagKey)"
                >
                  <el-option
                    v-for="dialogueItem in cache[childItem.tagKey].list"
                    :key="dialogueItem.id"
                    :value="dialogueItem.id"
                    :label="dialogueItem.name"
                  >
                  </el-option>
                </el-select>
                <el-select
                  v-if="childItem.dialogueNodeId"
                  style="width: 150px;margin-left: 5px;"
                  :key="n + 'button'"
                  v-model="childItem.buttonId"
                  filterable
                  clearable
                  placeholder="请选择按钮"
                >
                  <el-option
                    v-for="buttonItem in cache[childItem.tagKey + '_button'].list"
                    :key="buttonItem.id"
                    :value="buttonItem.id.toString()"
                    :label="buttonItem.name"
                  >
                  </el-option>
                </el-select>
                <el-input
                  v-if="childItem.dialogueNodeId && childItem.buttonId"
                  size="mini"
                  class="short-input"
                  v-model="childItem.count"
                ></el-input>
                <span
                  class="txt end-text"
                  v-if="childItem.dialogueNodeId && childItem.buttonId"
                >{{ getTagUnit(childItem.tagKey) }}
                </span>
              </template>
              <!-- 节点曝光 -->
              <template v-else-if="childItem.tagKey === 'dialog_show'">
                <span class="txt">{{ childItem.tagName }}</span>
                <el-select
                  style="width: 130px"
                  :key="n + '-dialogue-show'"
                  v-model="childItem.showDialogueNodeId"
                  filterable
                  clearable
                  placeholder="请选择对话框"
                >
                  <el-option
                    v-for="dialogueItem in cache['button_click'].list"
                    :key="dialogueItem.id"
                    :value="dialogueItem.id"
                    :label="dialogueItem.name"
                  >
                  </el-option>
                </el-select>
                <el-input
                  v-if="childItem.showDialogueNodeId"
                  size="mini"
                  class="short-input"
                  v-model="childItem.showCount"
                ></el-input>
                <span
                  class="txt end-text"
                  v-if="childItem.showDialogueNodeId"
                >{{ getTagUnit(childItem.tagKey) }}
                </span>
              </template>
              <!-- 睡觉提醒是否冻结 -->
              <!-- <template v-else-if="childItem.tagKey === 'is_lock'">
                <span class="txt">{{ childItem.tagName }}</span>
                <el-select
                  style="width: 80px"
                  :key="n + childItem.tagKey"
                  v-model="childItem.value"
                  filterable
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="boolItem in [
                      { id: 1, name: '是' },
                      { id: 0, name: '否' }
                    ]"
                    :key="boolItem.id"
                    :value="boolItem.id"
                    :label="boolItem.name"
                  >
                  </el-option>
                </el-select>
              </template> -->
              <!-- 是否有睡觉提醒经验值 -->
              <template v-else-if="childItem.tagKey === 'sleep_time'">
                <span class="txt">{{ childItem.tagName }}</span>
                <el-select
                  style="width: 80px"
                  :key="n + childItem.tagKey"
                  v-model="childItem.value"
                  filterable
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="boolItem in [
                      { id: 1, name: '是' },
                      { id: 0, name: '否' }
                    ]"
                    :key="boolItem.id"
                    :value="boolItem.id"
                    :label="boolItem.name"
                  >
                  </el-option>
                </el-select>
              </template>
              <!-- 人群满足 -->
              <template v-else-if="childItem.tagKey === 'dmp_crowd'">
                <span class="txt">{{ childItem.tagName }}</span>
                <el-select
                  style="width: 150px"
                  :key="n + childItem.tagKey"
                  v-model="childItem.value"
                  filterable
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="crowdItem in cache[childItem.tagKey].list"
                    :key="crowdItem.id"
                    :value="crowdItem.id"
                    :label="crowdItem.name"
                  >
                  </el-option>
                </el-select>
              </template>
              <!-- 用户行为满足 -->
              <template v-else-if="childItem.tagKey === 'event_hit'">
                <span class="txt">{{ childItem.tagName }}</span>
                <el-select
                  style="width: 130px"
                  :key="n + childItem.tagKey"
                  v-model="childItem.value"
                  filterable
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="eventItem in cache[childItem.tagKey].list"
                    :key="eventItem.eventCode"
                    :value="eventItem.eventCode"
                    :label="eventItem.eventName"
                  >
                  </el-option>
                </el-select>
              </template>
              <!-- 时间到达 -->
              <template v-else-if="childItem.tagKey === 'time_hit'">
                <span class="txt">{{ childItem.tagName }}</span>
                <el-select
                  style="width: 150px"
                  :key="n + childItem.tagKey"
                  v-model="childItem.type"
                  filterable
                  clearable
                  placeholder="请选择时间类型"
                >
                  <el-option
                    v-for="timeTypeItem in [
                      { type: 1, name: '固定时间' },
                      { type: 2, name: '推理时间' },
                      { type: 3, name: '时间区间' },
                      { type: 4, name: '区间推理时间' }
                    ]"
                    :key="timeTypeItem.type"
                    :value="timeTypeItem.type"
                    :label="timeTypeItem.name"
                  >
                  </el-option>
                </el-select>
                <el-time-picker
                  v-if="childItem.type === 1"
                  v-model="childItem.staticTimeVal"
                  value-format="HH:mm:ss"
                  placeholder="选择时间"
                >
                </el-time-picker>
                <el-select
                  v-else-if="childItem.type === 2"
                  style="width: 150px"
                  :key="n + childItem.tagKey + childItem.type"
                  v-model="childItem.inferenceTimeVal"
                  filterable
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="inferenceItem in [
                      { id: 1, name: childItem.type + '_[PRESJTXTIME]', cname: childItem.type + '_睡觉时间'},
                    ]"
                    :key="inferenceItem.id"
                    :value="inferenceItem.name"
                    :label="inferenceItem.cname"
                  >
                  </el-option>
                </el-select>
                <el-time-picker
                  v-else-if="childItem.type === 3"
                  is-range
                  v-model="childItem.intervalTimeVal"
                  value-format="HH:mm:ss"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                >
                </el-time-picker>
                <template v-else-if="childItem.type === 4">
                  <el-select
                    style="width: 150px"
                    :key="n + childItem.tagKey + childItem.type + 'region-type'"
                    v-model="childItem.inferRegionStartVal"
                    filterable
                    clearable
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="timeItem in [
                        { id: 1, name: 'YJYLBEGINTIME', cname: '静音开机开始时间' },
                      ]"
                      :key="timeItem.id"
                      :value="timeItem.name"
                      :label="timeItem.cname"
                    >
                    </el-option>
                  </el-select>
                  <span style="color: #666">-</span>
                  <el-select
                    style="width: 150px;margin-left: 5px;"
                    :key="n + childItem.tagKey + childItem.type"
                    v-model="childItem.inferRegionEndVal"
                    filterable
                    clearable
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="timeItem in [
                        { id: 1, name: 'YJYLENDTIME', cname: '静音开机结束时间' },
                      ]"
                      :key="timeItem.id"
                      :value="timeItem.name"
                      :label="timeItem.cname"
                    >
                    </el-option>
                  </el-select>
                </template>
              </template>
              <!-- 其他 都按是否下拉框处理-->
              <template v-else>
                <span class="txt">{{ childItem.tagName }}</span>
                <el-select
                  style="width: 80px"
                  :key="n + childItem.tagKey"
                  v-model="childItem.value"
                  filterable
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="boolItem in [
                      { id: '1', name: '是' },
                      { id: '0', name: '否' }
                    ]"
                    :key="boolItem.id"
                    :value="boolItem.id"
                    :label="boolItem.name"
                  >
                  </el-option>
                </el-select>
              </template>
              <!-- delete -->
              <span class="i" @click="handleRemoveRule(item, childItem)">
                <i class="icon iconfont el-icon-cc-delete"></i>
              </span>
            </div>
            <!-- 一级标签列表 -->
            <div class="label-add">
              <div class="optional-condition">
                <el-tag
                  class="oc-item"
                  v-for="tagItem in tagList"
                  :key="tagItem.tagItem"
                  @click.native="handleAddChildRule(item, tagItem)"
                  :type="dataSourceColorEnum[tagItem.dataSource]"
                >{{ tagItem.tagName }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div class="label-or">
        <div
          class="optional-condition"
          v-if="tagList.length"
          :style="{
            'padding-top': ruleJson.rules.length > 0 ? '10px' : 0,
          }"
        >
          <el-tag
            class="oc-item"
            v-for="item in tagList"
            :key="item.tagName"
            @click.native="handleAddRule(item)"
            :type="dataSourceColorEnum[item.dataSource]"
          >{{ item.tagName }}
          </el-tag>
          <div v-if="showHitTip" class="introjs-hint" style="font-size: 28px; position: absolute; bottom: -28px; left: 20px; color: #999">
            <i class="el-icon-thumb" style="font-size: 18px;"></i>
            <span style="font-size: 12px;">点击标签来编辑人群条件</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import { dataSourceColorEnum } from '@/utils/tag'
import { getVersionIdAPI } from '@/services/flow'
import { getCrowdListAPI, getDialogueListAPI, getButtonListAPI, getUserEventListAPI } from '@/services/tag'
export default {
  inject: ['serviceId'],
  props: {
    tagList: { // 标签列表
      type: Array,
      default: () => []
    },
    ruleJson: { // 规则json
      type: Object,
      default: () => ({})
    },
    parentIndex: { // 父级索引
      type: Number,
      default: 0
    },
    tagIds: { // 标签id列表
      type: Array,
      default: () => []
    },
    serviceId: {
      type: Number
    }
  },
  data () {
    return {
      showHitTip: true,
      cache: {}, // { tagId：{ select: boolean, list: [] } }
      versionId: ''
    }
  },
  computed: {
    dataSourceColorEnum () {
      return dataSourceColorEnum
    }
  },
  watch: {
    //
  },
  methods: {
    handleRemoveRule (rule, childRule) { // 删除当前规则
      const ruleJson = this.$props.ruleJson
      rule.rules.splice(rule.rules.indexOf(childRule), 1)
      if (rule.rules.length === 0) {
        ruleJson.rules = ruleJson.rules.filter(function (item) {
          return item !== rule
        })
      }
    },
    transformSaveRules () {
      this.$props.ruleJson.rules.forEach(rule => {
        rule.rules.forEach((childRule, childIndex) => {
          // 特殊的tagkey要特殊转value
          if (childRule.tagKey === 'button_click') {
            const dialogueNodeId = childRule.dialogueNodeId || 'null'
            const buttonId = childRule.buttonId || 'null'
            const count = childRule.count.toString() || 'null'
            childRule.value = `${dialogueNodeId}_${buttonId}_${count}`
          } else if (childRule.tagKey === 'dialog_show') {
            const showDialogueNodeId = childRule.showDialogueNodeId || 'null'
            const showCount = childRule.showCount.toString() || 'null'
            childRule.value = `${showDialogueNodeId}_${showCount}`
          } else if (childRule.tagKey === 'time_hit') {
            if (childRule.type === 1) {
              const staticTimeVal = childRule.staticTimeVal || 'null'
              childRule.value = `${childRule.type}_${childRule.staticTimeVal}`
            } else if (childRule.type === 2) {
              const inferenceTimeVal = childRule.inferenceTimeVal || 'null'
              childRule.value = inferenceTimeVal
            } else if (childRule.type === 3) {
              const intervalTimeVal = childRule.intervalTimeVal || 'null'
              if (Array.isArray(childRule.intervalTimeVal) && childRule.intervalTimeVal.length > 0) {
                const intervalTimeVal = childRule.intervalTimeVal.join('-')
                childRule.value = `${childRule.type}_${intervalTimeVal}`
              } else {
                childRule.value = `${childRule.type}_null`
              }
            } else if (childRule.type === 4) {
              const inferRegionStartVal = childRule.inferRegionStartVal || 'null'
              const inferRegionEndVal = childRule.inferRegionEndVal || 'null'
              childRule.value = `${childRule.type}_[${inferRegionStartVal}]-[${inferRegionEndVal}]`
            }
          } else {
            childRule.value = childRule.value.toString()
          }
        })
      })
      this.$emit('update:ruleJson', this.$props.ruleJson)
    },
    getTagUnit (tagKey) { // 获得标签key对应的单位
      return this.$props.tagList.find((tagItem, tagIndex) => {
        return tagItem.tagKey === tagKey
      })?.tagUnit || ''
    },
    async getCrowdList (tagKey) { // 获取人群列表
      try {
        const res = await getCrowdListAPI({})
        if (res.code === 1000) {
          this.$set(this.cache, tagKey, {
            list: res.data.map((item) => {
              return {
                ...item,
                id: `${item.policyId}_${item.crowdId}`,
                name: `${item.crowdId}_${item.crowdName}`
              }
            })
          })
        }
      } catch (error) {
        console.error('getCrowdList error: ', error)
      }
    },
    async getDialogueList (tagKey) { // 获取对话框列表
      try {
        const res = await getDialogueListAPI({
          versionId: this.versionId
        })
        if (res.code === 1000) {
          this.$set(this.cache, tagKey, {
            list: res.data
          })
        }
      } catch (error) {
        console.error('getDialogueList error: ', error)
      }
    },
    async getDialogueButtonList (nodeId, tagKey) { // 获取对话框按钮列表
      console.debug('getButtonList: ', nodeId, tagKey)
      try {
        const res = await getButtonListAPI({
          nodeId
        })
        if (res.code === 1000) {
          this.$set(this.cache, `${tagKey}_button`, {
            list: res.data
          })
        }
      } catch (error) {
        console.error('getDialogueButtonList error: ', error)
      }
    },
    async getUserEventList (tagKey) { // 获取用户行为列表
      try {
        const res = await getUserEventListAPI({})
        if (res.code === 1000) {
          this.$set(this.cache, tagKey, {
            list: res.data
          })
        }
      } catch (error) {
        console.error('getUserEventList error: ', error)
      }
    },
    handleRulesConditionChange (item) { // 规则条件改变
      item.condition = item.condition === 'AND' ? 'OR' : 'AND'
    },
    fetchTagSuggestions (tagInfo) { // 获取标签建议
      const { tagKey } = tagInfo
      switch (tagKey) {
        case 'dmp_crowd':
          this.getCrowdList(tagKey)
          break
        case 'button_click':
          // this.getDialogueList(`${tagKey}_dialogue`) // 防止key重复
          this.getDialogueList(tagKey)
          // this.getDialogueButtonList(`${tagKey}_dialogue_button`)
          break
        case 'dialog_show':
          this.getDialogueList('button_click')
          break
        case 'event_hit':
          this.getUserEventList(tagKey)
          break
        default:
          break
      }
    },
    async getVersionId () {
      try {
        const res = await getVersionIdAPI({
          serviceId: this.serviceId || this.$props.serviceId
        })
        if (res.code === 1000) {
          this.versionId = res.data
        }
      } catch (error) {
        console.error('getVersionId error: ', error)
      }
    },
    getDynamicTagRuleInfo (tagInfo) { // 动态表单的添加规则 的数据结构 生成初始化规则用到
      const { tagId, tagKey } = tagInfo
      let data = null
      switch (tagKey) {
        case 'button_click': // 按钮点击
          data = {
            dialogueNodeId: '', // 对话框节点id
            buttonId: '', // 按钮id
            count: 0 // 点击次数
          }
          break
        case 'dialog_show': // 节点曝光
          data = {
            showDialogueNodeId: '', // 对话框节点id
            showCount: 0 // 曝光次数
          }
          break
        case 'time_hit': // 时间到达
          data = {
            type: 1, // 1 固定时间 2 推理时间 3区间时间 4区间推理时间
            time: '', // 时间
            staticTimeVal: '', // 固定时间value
            inferenceTimeVal: '', // 推理时间value
            intervalTimeVal: ['08:00:00', '09:00:00'], // 区间时间value [start, end]
            inferRegionStartVal: '', // 区间推理时间 start
            inferRegionEndVal: '' // 区间推理时间 end
          }
          break
        default:
          break
      }
      return data
    },
    initTagsSuggestions () { // 给父组件调用
      const dynamicFormTagKeys = ['button_click', 'dialog_show', 'dmp_crowd', 'event_hit']
      dynamicFormTagKeys.forEach(key => {
        this.fetchTagSuggestions({ tagKey: key })
      })
    },
    handleAddRule (tag) {
      console.debug('addRule: ', tag)
      this.showHitTip = false // 关闭新手指引 - 点击提示
      if (this.ruleJson.rules.length > 50) { // 控制最多50个标签
        this.$message({
          message: '已达最大数量',
          type: 'error'
        })
      }
      // if (!this.tagIds.includes(tag.tagId)) { // 防止重复添加 tagId
      //   this.tagIds.push(tag.tagId)
      // }
      // 标签设计：https://coocaa.feishu.cn/wiki/SMncwun4biFztdkmqRPcVDjGndf
      const dynamicFormTagKeys = ['button_click', 'dialog_show', 'dmp_crowd', 'event_hit']
      if (dynamicFormTagKeys.includes(tag.tagKey)) { //  规则和后台协定好对应的tagKey都是需要 请求动态表单
        if (!this.cache[tag.tagKey]) {
          this.fetchTagSuggestions(tag)
        }
      }
      let operator = ''
      if (['button_click', 'dialog_show'].includes(tag.tagKey)) {
        operator = '>='
      } else {
        operator = '='
      }
      this.ruleJson.rules.push({
        condition: 'AND',
        rules: [
          {
            dataSource: tag.dataSource,
            inputType: tag.inputType,
            tagId: tag.tagId,
            tagKey: tag.tagKey,
            tagType: tag.tagType,
            tagName: tag.tagName,
            operator,
            value: '',
            ...this.getDynamicTagRuleInfo(tag)
          }
        ]
      })
      console.debug('handleAddRule cache: ', this.cache)
    },
    handleAddChildRule (rule, tag) {
      console.debug('handleAddChildRule: ', rule, tag)
      if (rule.rules.length >= 50) {
        this.$message({
          type: 'error',
          message: '已达最大数量'
        })
        return
      }
      const dynamicFormTagKeys = ['button_click', 'dialog_show', 'dmp_crowd', 'event_hit']
      if (dynamicFormTagKeys.includes(tag.tagKey)) { //  规则和后台协定好对应的tagKey都是需要 请求动态表单
        if (!this.cache[tag.tagKey]) {
          this.fetchTagSuggestions(tag)
        }
      }
      // if (!this.tagIds.includes(tag.tagId)) { // 防止重复添加 tagId
      //   this.tagIds.push(tag.tagId)
      // }
      let operator = ''
      if (['button_click', 'dialog_show'].includes(tag.tagKey)) {
        operator = '>='
      } else {
        operator = '='
      }
      rule.rules.push({
        dataSource: tag.dataSource,
        inputType: tag.inputType,
        tagId: tag.tagId,
        tagKey: tag.tagKey,
        tagName: tag.tagName,
        operator,
        value: '',
        ...this.getDynamicTagRuleInfo(tag)
      })
      console.debug('handleAddChildRule cache: ', this.cache)
    },
    initDynamicData () {
      this.ruleJson.rules.forEach(ruleItem => {
        ruleItem.rules.forEach((childRule, childIndex) => {
          switch (childRule.tagKey) {
            case 'button_click':
              this.getDialogueButtonList(childRule.dialogueNodeId, childRule.tagKey)
              break
            default:
              break
          }
        })
      })
    }
  },
  async mounted () {
    // await this.getVersionId()
    // this.initTagsSuggestions()
    // this.initDynamicData()
  },
  async created () {
    await this.getVersionId()
    this.initTagsSuggestions()
    this.initDynamicData()
  }
}
</script>
<style lang="stylus" scoped>
@keyframes b {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0);
  }
}
.tags-rule-wrapper {
  z-index 1
  position relative
  padding-left 10px
  margin-bottom 20px
  margin-left 50px
  .label-or-space {
    position: absolute;
    top: 10px;
    right: 0;
    bottom: 5px;
    left: -50px;
    width: 3px;
    height: auto;
    margin: auto 0;
    border: 1px dashed #67C23A;
    border-right: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .label-or >>> span {
    cursor pointer
    margin-right 5px
    margin-bottom 5px
  }
  .label-or {
    .introjs-hint {
      animation b 0.5s ease 0s 3
    }
  }
  .label-ground {
    border 1px dashed #ccc
    padding 10px
    margin 10px 0
    .tag-condition--parent {
      position relative
      z-index 1
    }
    .tag-condition {
      position: absolute;
      top: 10px;
      right: 0;
      bottom: 3px;
      left: -35px;
      width: 3px;
      height: auto;
      margin: auto 0;
      border: 1px dashed #E6A23C;
      border-right: 0;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .label-item {
    display: flex;
    position: relative;
    align-items center
    flex-wrap wrap
    margin-bottom 10px
    line-height 45px
    .txt {
      margin-right: 10px;
      flex-shrink: 0;
      font-size 14px
      color #666
    }
    .end-text {
      margin-left 5px
    }
    .short-input {
      width 50px
      margin-left 5px
      margin-right 5px
    }
  }
  .oc-item {
    margin-right 5px
    margin-bottom 5px
  }
  .i {
    cursor pointer
    margin-left 5px
  }
}

</style>
