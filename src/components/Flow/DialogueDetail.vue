<template>
  <div class="dialogue-detail-wrapper">
    <el-form class="dialogue-form-wrapper" ref="dialogueForm" :rules="rules" :model="detailForm"
             label-width="80px"
    >
      <el-form-item label="节点ID：">{{ detailForm.nodeId }}</el-form-item>
      <el-form-item label="命名：">
        <el-col :span="11">
          <el-input v-model="detailForm.title"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="显示时机：">
        <el-col class="flex-box">
          <span class="text" style="margin-left: 0;">延后</span>
          <div class="delay-text-box">
            <el-input class="input-wrapper" v-model="detailForm.delayHours"></el-input><span class="text">小时</span>
            <el-input class="input-wrapper" v-model="detailForm.delayMinutes"></el-input><span class="text">分钟</span>
            <el-input class="input-wrapper" v-model="detailForm.delaySeconds"></el-input><span class="text">秒</span>
          </div>
        </el-col>
      </el-form-item>
      <el-form-item label="显示时长：">
        <el-input-number v-model="detailForm.displayDuration" controls-position="right" @change="handleDisplayDuration" :min="1"
                         :max="600"
        ></el-input-number> s
      </el-form-item>
      <el-form-item label="文案" prop="content">
        <el-col :span="11">
          <el-input v-model="detailForm.content" placeholder="请编辑"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="按钮">
        <el-button type="text" @click="addButton">添加按钮</el-button>
        <div class="buttons-layout">
          <el-col :span="20">
            <ul class="buttons-wrapper" v-if="detailForm.interActifyButtonsList.length > 0">
              <li
                v-for="(item, index) in detailForm.interActifyButtonsList"
                :key="item.id"
                class="button-item"
              >
                <i v-if="buttonActiveIndex === index" class="el-icon-caret-right" style="margin-right: 5px;color: #409EFF; "></i>
                <i v-else style="width: 14px;height: 14px;margin-right: 5px;">&nbsp;</i>
                <el-input
                  v-model="item.name"
                  size="mini"
                  style="width: 200px;"
                  :maxlength="10"
                  :ref="'editInput_' + index"
                  v-if="item.showEditInput"
                  @blur="item.showEditInput = false"
                >
                </el-input>
                <el-button
                  v-else
                  style="width: 200px;"
                  @click="clickOperateButton(index)"
                >
                  {{ item.name }}
                  <i
                    class="el-icon-edit el-icon--right"
                    @click="updateEditInput(index)"
                  ></i>
                </el-button>
                <el-button type="text" @click="deleteButton(index)" class="el-icon-close delete"></el-button>
              </li>
            </ul>
          </el-col>
          <el-col :span="5">
            <ul class="static-buttons-wrapper">
              <li class="button-item">用户返回</li>
              <li class="button-item">自动消失</li>
            </ul>
          </el-col>
        </div>
        <div class="button-detail" v-if="buttonDetail">
          <span class="button-id">按钮ID：{{ buttonDetail.buttonId }}</span>
          <ul class="operate-list-wrapper">
            <li
              class="operate-list-item"
              v-for="(operateItem, operateItemIndex) in buttonDetail.nextNodeList"
              :key="operateItem.buttonId"
            >
              <span class="head-text">操作：</span>
              <el-select class="short-select-width" v-model="operateItem.callType" placeholder="调用" style="margin-right: 5px;">
                <el-option label="调用技能" :value="1"></el-option>
                <el-option label="调用节点" :value="2"></el-option>
              </el-select>
              <el-select
                class="short-select-width"
                v-if="operateItem.callType === 1"
                v-model="operateItem.nextSkillId"
                placeholder="请选择技能"
                filterable
                @change="updateSkillPicked(operateItem)"
              >
                <el-option
                  v-for="skillItem in skillList"
                  :key="skillItem.skillId"
                  :label="skillItem.skillName"
                  :value="Number(skillItem.skillId)"
                ></el-option>
              </el-select>
              <el-select
                class="short-select-width"
                v-else
                v-model="operateItem.nextNodeId"
                placeholder="请选择节点"
                @change="updateNodePicked(operateItem)"
                filterable
              >
                <el-option
                  v-for="nodeItem in childNodeList"
                  :key="nodeItem.id"
                  :label="nodeItem.attrs.text.text"
                  :value="nodeItem.id"
                ></el-option>
              </el-select>
              <template v-if="operateItem.callType === 1 && operateItem.nextSkillId && getCurrentSkillItem(operateItemIndex).paramList.length > 0">
                <el-form-item
                  v-for="(paramItem) in getCurrentSkillItem(operateItemIndex).paramList"
                  :key="paramItem.paramKey"
                  :label="paramItem.paramName"
                >
                  <el-input
                    style="margin-top: 5px;height: 30px;"
                    :type="paramItem.dataType === 1 ? 'number': 'text'"
                    v-model="operateItem[paramItem.paramKey]"
                  >
                  </el-input>
                </el-form-item>
              </template>
              <el-button type="text" @click="deleteOperate(operateItemIndex)" class="el-icon-close delete"></el-button>
            </li>
            <el-button type="text" @click="addOperate(buttonDetail)">添加操作</el-button>
          </ul>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('dialogueForm')">保存</el-button>
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
      detailForm: {
        title: '', // 命名
        nodeId: '', // 节点id
        interActifyButtonsList: [], // 交互按钮列表
        staticButtonsList: [], // 静态按钮列表
        delayHours: null,
        delayMinutes: null,
        delaySeconds: null,
        displayDuration: '',
        content: '' // 文案
      },
      rules: {
        content: [
          { required: true, message: '请输入文案', trigger: 'blur' },
          { min: 1, max: 15, message: '不可超过15个字', trigger: 'blur' }
        ]
      },
      buttonDetail: {}, // 按钮详情
      buttonActiveIndex: 0
    }
  },
  computed: {},
  methods: {
    handleDisplayDuration () {
      console.debug('handleDisplayDuration', this.detailForm.displayDuration)
    },
    getCurrentSkillItem (operateItemIndex) {
      // console.debug('buttonDetail: ', operateItemIndex)
      const res = this.skillList.find(item => item.skillId.toString() === this.buttonDetail.nextNodeList[operateItemIndex].nextSkillId.toString()) || []
      // console.debug('getCurrentSkillItem res: ', res)
      return res
    },
    addButton () {
      console.debug('addButton')
      if (this.detailForm.interActifyButtonsList.length >= 4) {
        this.$message.warning('最多添加4个按钮')
        return
      }
      this.detailForm.interActifyButtonsList.push({
        name: '按钮',
        type: 1
      })
    },
    updateSkillPicked (data) {
      console.debug('updateSkillPicked', data)
    },
    updateNodePicked (data) {
      console.debug('updateNodePicked', data)
    },
    deleteButton (index) {
      // console.debug('deleteButton', index)
      this.detailForm.interActifyButtonsList.splice(index, 1)
    },
    deleteOperate (index) {
      this.buttonDetail.nextNodeList.splice(index, 1)
    },
    addOperate (item) {
      console.debug('addOperate', item)
      const buttonItem = this.detailForm.interActifyButtonsList[this.buttonActiveIndex]
      if (!buttonItem?.nextNodeList) {
        this.$set(buttonItem, 'nextNodeList', [{ }])
      } else {
        buttonItem.nextNodeList.push({ })
      }
    },
    updateEditInput (index) {
      console.debug('updateEditInput', index)
      this.$set(this.detailForm.interActifyButtonsList[index], 'showEditInput', true)
      this.buttonDetail = this.detailForm.interActifyButtonsList[index]
      this.buttonActiveIndex = index
      this.$nextTick(() => {
        this.$refs[`editInput_${index}`][0].$refs.input.focus()
      })
    },
    clickOperateButton (index) {
      console.debug('clickOperateButton', index)
      this.buttonActiveIndex = index
      this.buttonDetail = this.detailForm.interActifyButtonsList[index]
    },
    initTransformData (data) {
      data.interActifyButtonsList.forEach((buttonItem, buttonIndex) => {
        if (buttonItem.type === 2 || buttonItem.type === 3) {
          this.detailForm.staticButtonsList.push(buttonItem)
        } else {
          buttonItem.nextNodeList.forEach((operateItem, operateIndex) => {
            if (operateItem.callType === 1 && operateItem.skillParam) {
              operateItem.skillParam = JSON.parse(operateItem.skillParam)
              operateItem.skillParam.forEach(paramItem => {
                operateItem[paramItem.key] = paramItem.value
              })
            }
          })
        }
      })
      data.interActifyButtonsList = data.interActifyButtonsList.filter(item => item.type !== 2 && item.type !== 3)
      return data
    },
    initData () {
      // console.debug('renderData: ', this.$props.renderData)
      let renderData = JSON.parse(JSON.stringify(this.$props.renderData))
      renderData = this.initTransformData(renderData)
      this.detailForm = {
        ...this.detailForm,
        ...renderData
      }
      this.clickOperateButton(0)
      // console.debug('detailForm: ', this.detailForm)
    },
    transformSubmitData (data) {
      const info = JSON.parse(JSON.stringify(data))
      let {
        nodeId,
        title,
        interActifyButtonsList,
        staticButtonsList,
        delayHours,
        delayMinutes,
        delaySeconds,
        displayDuration,
        content
      } = info
      interActifyButtonsList.forEach((buttonItem, buttonIndex) => {
        if (buttonItem?.nextNodeList?.length > 0) {
          buttonItem.nextNodeList.forEach((operateItem, operateIndex) => {
            if (operateItem?.callType === 1 && operateItem?.nextSkillId) {
              // console.debug('keys：', Object.keys(operateItem))
              const keys = Object.keys(operateItem)
              this.skillList.forEach((skillItem, skillIndex) => {
                if (skillItem.skillId === operateItem.nextSkillId) {
                  const paramList = skillItem.paramList
                  paramList.forEach((paramItem, paramIndex) => {
                    const key = paramItem.paramKey
                    if (!operateItem.skillParam) {
                      operateItem.skillParam = []
                    }
                    if (keys.includes(key)) {
                      if (paramItem.dataType === 1) { // 1数值 2字符串
                        operateItem.skillParam.push({
                          key: paramItem.paramKey,
                          value: Number(operateItem[paramItem.paramKey])
                        })
                      } else if (paramItem.dataType === 2) {
                        operateItem.skillParam.push({
                          key: paramItem.paramKey,
                          value: (operateItem[paramItem.paramKey]).toString()
                        })
                      }
                    }
                  })
                }
              })
              operateItem.skillParam = JSON.stringify(operateItem.skillParam)
            }
          })
        }
      })
      if (staticButtonsList.length === 0) {
        staticButtonsList = [{
          type: 2,
          name: '用户返回'
        },
        {
          type: 3,
          name: '自动消失'
        }]
      }
      return {
        nodeId,
        title,
        displayDuration,
        delayHours: Number(delayHours) || 0,
        delayMinutes: Number(delayMinutes) || 0,
        delaySeconds: Number(delaySeconds) || 0,
        content,
        interActifyButtonsList: [
          ...interActifyButtonsList,
          ...staticButtonsList
        ]
      }
    },
    submitForm () {
      this.$refs.dialogueForm.validate(valid => {
        if (valid) {
          const info = this.transformSubmitData(this.detailForm)
          // console.debug('after transform : ', info)
          this.$emit('submit', info)
        } else {
          // console.debug('submitForm invalid')
          return false
        }
      })
    }
  },
  mounted () {
  //
  },
  created () {
    this.clickOperateButton(0)
  },
  watch: {
    renderData: function (newval, oldval) {
      // console.debug('renderData: ', newval)
      this.initData()
    }
  }
}
</script>
<style lang="stylus" scoped>
        >>>.dialogue-form-wrapper {
            .el-form-item__label {
                white-space nowrap
            }
            .delay-text-box {
                display flex
                align-items center
                flex-wrap no-wrap
                .input-wrapper {
                    width auto
                    // margin 0 5px
                }
            }
            .buttons-layout {
                display flex
                align-items flex-start
                margin-left -40px
                .buttons-wrapper {
                    display flex
                    // align-items center
                    flex-wrap wrap
                    flex-direction column
                    .button-item {
                        display flex
                        align-items center
                        margin-bottom 15px
                        &:last-child {
                            margin-bottom 0
                        }
                        .delete {
                            color #666
                            font-size 14px
                            margin-left 10px
                        }
                    }
                }
                .static-buttons-wrapper {
                    display flex
                    flex-direction column
                    align-items center
                    .button-item {
                        border 1px dashed #ccc
                        font-size 12px
                        color #666
                        padding 2px
                        white-space nowrap
                        margin-bottom 5px
                        // &:last-child {
                        //     margin-bottom 0
                        // }
                    }
                }
            }
            .button-detail {
                margin-left -45px
            }
        }
        >>>.flex-box {
            display flex
            align-items center
        }
        .text {
            white-space nowrap
            margin 0 5px
            font-size 12px
        }

.button-id {
    margin-bottom 5px
    display inline-block
}
.operate-list-wrapper {
    .head-text {
        white-space nowrap
        margin-right 5px
    }
    .operate-list-item {
        display flex
        align-items center
        flex-wrap wrap
        .delete {
            color #666
            font-size 14px
            margin-left 10px
        }
    }
    .short-select-width {
        width 120px
        margin-bottom 5px
        margin-top 5px
    }
}
</style>
