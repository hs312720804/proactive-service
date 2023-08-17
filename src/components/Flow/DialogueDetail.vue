<template>
  <div class="dialogue-detail-wrapper">
    <el-form
      class="dialogue-form-wrapper"
      ref="dialogueForm"
      :rules="rules"
      :model="detailForm"
      label-width="80px"
      label-position="left"
    >
      <el-form-item label="节点ID">{{ detailForm.nodeId }}</el-form-item>
      <el-form-item label="命名" prop="title">
        <el-col :span="11">
          <el-input v-model="detailForm.title"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="显示时机">
        <el-col class="flex-box">
          <span class="text" style="margin-left: 0;">延后</span>
          <div class="delay-text-box">
            <el-input class="input-wrapper" v-model="detailForm.delayHours"></el-input><span class="text">小时</span>
            <el-input class="input-wrapper" v-model="detailForm.delayMinutes"></el-input><span class="text">分钟</span>
            <el-input class="input-wrapper" v-model="detailForm.delaySeconds"></el-input><span class="text">秒</span>
          </div>
        </el-col>
      </el-form-item>
      <el-form-item label="显示时长">
        <el-input-number
          v-model="detailForm.displayDuration"
          controls-position="right"
          @change="handleDisplayDuration"
          :min="15"
          :max="600"
        ></el-input-number><span class="text">秒</span>
      </el-form-item>
      <el-form-item label="文案" prop="content">
        <el-col :span="11">
          <el-input v-model="detailForm.content" placeholder="请编辑"></el-input>
        </el-col>
      </el-form-item>
      <!-- <el-form-item label="按钮">
      </el-form-item> -->
      <div>
        <div class="add-button-wrap">
          <div>按钮</div>
          <el-button type="primary" plain icon="el-icon-plus" @click="addButton">添加</el-button>
        </div>
        <div class="buttons-layout">
          <div class="default-btn">
            <span class="item">用户返回</span>
            <span class="item">自动消失</span>
          </div>

          <div class="buttons-wrapper" v-if="detailForm.interActifyButtonsList.length > 0">
            <draggable v-model="detailForm.interActifyButtonsList" group="buttonList">
              <div
                v-for="(item, index) in detailForm.interActifyButtonsList"
                :key="item.id"
                class="button-item"
                :class="{'button-active': buttonActiveIndex === index}"
                @click="clickOperateButton(index)"
              >
                <i class="el-icon-caret-right" :class="{'caret-active': buttonActiveIndex === index}" style="margin-right: 5px;color: #85ce61; "></i>
                <span class="button-id">{{ item.buttonId }}</span>
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
                  :type="buttonActiveIndex === index ? 'success' : ''"
                >
                  {{ item.name }}
                  <i
                    class="el-icon-edit el-icon--right"
                    @click="updateEditInput(index)"
                  ></i>
                </el-button>
                <el-button type="text" @click="deleteButton(index)" class="el-icon-close delete"></el-button>
              </div>
            </draggable>
          </div>

        </div>
        <template v-if="buttonDetail">
          <div class="add-button-wrap detail-button-wrap">
            <div>按钮详情</div>
          </div>
          <div class="button-detail">
            <el-form-item label="按钮ID：" style="margin-bottom: 3px;">
              {{ buttonDetail.buttonId }}
            </el-form-item>
            <!-- {{ childNodeList }} -->
            <Behavior
              :list="buttonDetail.nextNodeList"
              :skillList="skillList"
              :childNodeList="childNodeList"
              desc="操作"
              :isLimitOnly="false"
              @del="deleteOperate"
              @add="addOperate"
            ></Behavior>
          </div>
        </template>
      </div>

    </el-form>
    <el-button type="primary" @click="submitForm" class="save-sty">保存</el-button>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import Behavior from '@/components/Behavior/Index.vue'
export default {
  components: {
    Behavior,
    draggable
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
    renderData: {
      type: Object,
      default: () => ({})
    },
    versionId: {
      type: Number,
      default: 0
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
        title: [
          { required: true, message: '请输入命名', trigger: 'blur' },
          { min: 1, max: 50, message: '不可超过50个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入文案', trigger: 'blur' },
          { min: 1, max: 50, message: '不可超过50个字符', trigger: 'blur' }
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
      // this.detailForm.interActifyButtonsList.push({
      //   name: '按钮',
      //   type: 1
      // })
      this.$set(this.detailForm, 'interActifyButtonsList', [...this.detailForm.interActifyButtonsList, {
        name: '按钮',
        type: 1
      }])
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
    deleteOperate ({ levelIndex }) {
      this.buttonDetail.nextNodeList.splice(levelIndex, 1)
    },
    addOperate () {
      console.debug('addOperate')
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
      this.buttonActiveIndex = index
      this.buttonDetail = this.detailForm.interActifyButtonsList[index]
    },
    initTransformData (data) {
      data.interActifyButtonsList.forEach((buttonItem, buttonIndex) => {
        if (buttonItem.type === 2 || buttonItem.type === 3) {
          this.detailForm.staticButtonsList.push(buttonItem)
        } else {
          buttonItem.nextNodeList.forEach((operateItem, operateIndex) => {
            if (operateItem.callType === 1 && operateItem.skillParam) { // callType 1 技能 2 节点
              operateItem.skillParam = JSON.parse(operateItem.skillParam)
              operateItem.skillParam.forEach(paramItem => {
                operateItem[paramItem.key] = paramItem.value
              })
              operateItem.nextNodeId = '' // 避免回填切换节点时，出现节点id
            }
            if (operateItem.callType === 2) {
              operateItem.nextSkillId = ''
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
              operateItem.skillParam = []
              const keys = Object.keys(operateItem)
              this.skillList.forEach((skillItem, skillIndex) => {
                if (skillItem.skillId.toString() === operateItem?.nextSkillId.toString()) {
                  const paramList = skillItem.paramList
                  paramList.forEach((paramItem, paramIndex) => {
                    const key = paramItem.paramKey
                    if (!operateItem.skillParam) {
                      operateItem.skillParam = []
                    } else {
                      if (typeof operateItem.skillParam === 'string') {
                        operateItem.skillParam = JSON.parse(operateItem.skillParam)
                      }
                    }
                    if (keys.includes(key)) {
                      if (paramItem.dataType === 1) { // 1数值 2字符串
                        operateItem.skillParam.push({
                          key: paramItem.paramKey,
                          name: paramItem.paramName,
                          value: Number(operateItem[paramItem.paramKey])
                        })
                      } else if (paramItem.dataType === 2) {
                        operateItem.skillParam.push({
                          key: paramItem.paramKey,
                          name: paramItem.paramName,
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
        ],
        versionId: this.$props.versionId
      }
    },
    submitForm () {
      this.$refs.dialogueForm.validate(valid => {
        if (valid) {
          const info = this.transformSubmitData(this.detailForm)
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
    renderData: {
      handler (val) {
        console.debug('watch renderData : ', val)
        this.initData()
      },
      deep: true,
      immediate: true
    }
  }
}
</script>
<style lang="stylus" scoped>
>>>.dialogue-form-wrapper {
  position: absolute;
  bottom: 63px;
  top: 68px;
  overflow: auto;
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
      // display flex
      // align-items flex-start
      // margin-left -40px
      .buttons-wrapper {
          display flex
          // align-items center
          flex-wrap wrap
          flex-direction column

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
      // margin-left -45px
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
        position relative
        .delete {
          color #666
          font-size 14px
          margin-left 10px
          right: 18px;
          position: absolute;
        }
    }
    .short-select-width {
      width 120px
      margin-bottom 3px
      margin-top 3px
    }
}
.dialogue-detail-wrapper {
  margin 20px 10px 65px
}
.add-button-wrap {
  display: flex;
  justify-content: space-between;
  // background: #f6f6f6;
  align-items: center;
  height: 30px
  border-radius 5px 5px 0 0
  padding: 5px
  margin-top: 10px

  // display: flex;
  // justify-content: space-between;
  // background: #ffb98c12
  // align-items: center;
  // height: 22px
  // border-radius 5px 5px 0 0
  padding: 5px 5px 5px 15px
  // margin-top: 10px
  position: relative;
  // // border-bottom 1px solid #e1e1e1;
  &:before{
    content: ''
    height 65%
    width 5px
    background #ffb98c
    position: absolute;
    left: 0;
    border-radius: 3px 0 0 3px;
  }
}
.detail-button-wrap {
  &:before{
    background #85ce61
  }
}

.button-active {
  background: #f6f6f6;
}
.button-item {
  display flex
  align-items center
  position relative
  // justify-content center
  margin-bottom 3px
  height 32px
  &:last-child {
    margin-bottom 0
  }
  .delete {
    color #666
    font-size 14px
    right: 18px;
    position: absolute;
  }
}
.el-icon-caret-right {
  opacity 0
  font-size 20px
}
.caret-active {
  opacity 1
}
.default-btn {
  color: #f00;
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px
  padding: 3px 22px
  font-size: 12px;
  border-radius: 3px;
  .item {
    display: inline-block;
    height 31.6px
    line-height 31.6px
    white-space: nowrap;
    cursor: pointer;
    background: #FFF;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    font-size: 12px;
    border-radius: 4px;
    border: 1px dashed #ababab;
    color: #c1c1c1;
  }
}
.button-id{
  font-size 12px
  margin 2px 18px
}
.save-sty{
  position: absolute;
  bottom: 20px;
  right: 10px;
  left: 10px;
}
</style>
