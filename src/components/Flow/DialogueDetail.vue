<template>
  <div class="dialogue-detail-wrapper">
    <el-form class="dialogue-form-wrapper" ref="dialogueForm" :rules="rules" :model="detailForm"
             label-width="80px"
    >
      <el-form-item label="命名：">
        <el-col :span="11">
          <el-input v-model="detailForm.title"></el-input>
        </el-col>
        <el-col :span="2">&nbsp;&nbsp;</el-col>
        <el-col :span="11" :title="detailForm.nodeId">节点ID：{{ detailForm.nodeId }}</el-col>
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
        <el-input-number v-model="detailForm.displayDuration" controls-position="right" @change="handleDisplayDuration" :min="0"
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
            <ul class="buttons-wrapper">
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
                <el-button type="text" @click="deleteButton" class="el-icon-close delete"></el-button>
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
        <div class="button-detail">
          <span class="button-id">按钮ID：{{ buttonDetail.buttonId }}</span>
          <ul class="operate-list-wrapper">
            <li
              class="operate-list-item"
              v-for="operateItem in buttonDetail.nextNodeList"
              :key="operateItem.buttonId"
            >
              <span class="head-text">操作：</span>
              <el-select class="short-select-width" v-model="operateItem.NodeOrSkill" placeholder="调用" style="margin-right: 5px;">
                <el-option label="调用技能" value="1"></el-option>
                <el-option label="调用节点" value="2"></el-option>
              </el-select>
              <el-select
                class="short-select-width"
                v-if="operateItem.NodeOrSkill === '1'"
                v-model="operateItem.nextSkillId"
                placeholder="请选择技能"
                filterable
                @change="updateSkillPicked(operateItem)"
              >
                <el-option
                  v-for="skillItem in skillList"
                  :key="skillItem.skillId"
                  :label="skillItem.skillName"
                  :value="skillItem.skillId"
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
              <el-button type="text" @click="deleteOperate(buttonDetail)" class="el-icon-close delete"></el-button>
            </li>
            <el-button type="text" @click="addOperate(buttonDetail)">添加操作</el-button>
          </ul>
        </div>
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
    }
  },
  data () {
    return {
      detailForm: {
        title: '', // 命名
        nodeId: '123', // 节点id
        interActifyButtonsList: [{}], // 交互按钮列表
        delayHours: null,
        delayMinutes: null,
        delaySeconds: null,
        displayDuration: null,
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
  computed: {
  },
  watch: {
  },
  methods: {
    handleDisplayDuration () {
      console.debug('handleDisplayDuration', this.detailForm.displayDuration)
    },
    addButton () {
      console.debug('addButton')
      if (this.detailForm.interActifyButtonsList.length >= 4) {
        this.$message.warning('最多添加4个按钮')
        return
      }
      this.detailForm.interActifyButtonsList.push({
        name: '按钮'
      })
    },
    updateSkillPicked (data) {
      console.debug('updateSkillPicked', data)
    },
    updateNodePicked (data) {
      console.debug('updateNodePicked', data)
    },
    deleteButton () {
      console.debug('deleteButton')
    },
    deleteOperate (data) {
      console.debug('deleteOperate', data)
    },
    addOperate (item) {
      console.debug('addOperate', item)
      const buttonItem = this.detailForm.interActifyButtonsList[this.buttonActiveIndex]
      if (!buttonItem?.nextNodeList) {
        this.$set(buttonItem, 'nextNodeList', [{ abc: 1 }])
      } else {
        buttonItem.nextNodeList.push({ abc: 1 })
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
    }
  },
  mounted () {
    //
  },
  created () {
    this.clickOperateButton(0)
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
        flex-wrap nowrap
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
