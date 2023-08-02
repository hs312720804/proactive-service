<template>
  <div class="behavior-wrapper">
    <ul class="all-list-wrapper" v-if="list.length > 0">
      <li
        class="list-item"
        v-for="(item, index) in list"
        :key="index"
      >
        <span class="head-text">{{ desc }} :</span>
        <el-select
          class="short-select-width"
          v-model="item.callType"
          placeholder="调用"
          style="margin-right: 5px;"
          @change="updatePicked"
        >
          <el-option label="调用技能" :value="1"></el-option>
          <el-option label="调用节点" :value="2" :disabled="disableAdd"></el-option>
        </el-select>
        <el-select
          class="short-select-width"
          v-if="item.callType === 1"
          v-model="item.nextSkillId"
          placeholder="选择技能"
          filterable
          @change="updateSkillPicked"
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
          v-else-if="item.callType === 2"
          v-model="item.nextNodeId"
          placeholder="选择节点"
          @change="updateNodePicked"
          filterable
        >
          <el-option
            v-for="nodeItem in childNodeList"
            :key="nodeItem.nodeId"
            :label="nodeItem.title"
            :value="nodeItem.nodeId"
          ></el-option>
        </el-select>
        <template v-if="item.callType === 1 && item.nextSkillId && getCurrentSkillItem(index).paramList.length > 0">
          <el-form-item
            v-for="(paramItem) in getCurrentSkillItem(index).paramList"
            :key="paramItem.paramKey"
            :label="paramItem.paramName"
          >
            <el-input
              style="margin-top: 5px;height: 30px;"
              :type="paramItem.dataType === 1 ? 'number': 'text'"
              v-model="item[paramItem.paramKey]"
            >
            </el-input>
          </el-form-item>
        </template>
        <el-button type="text" @click="del(index)" class="el-icon-close delete"></el-button>
      </li>
    </ul>
    <el-button type="text" @click="add">+添加{{ desc }}</el-button>
  </div>
</template>
<script>
export default {
  props: {
    isLimitOnly: { // 是否限制唯一一个
      type: Boolean,
      default: false
    },
    desc: { // 描述: 调用 | 操作
      type: String,
      default: ''
    },
    skillList: { // 数据来源 - 技能列表
      type: Array,
      default: () => []
    },
    childNodeList: { // 数据来源 - 节点列表
      type: Array,
      default: () => []
    },
    list: { // 数据来源 - 下一节点列表
      type: Array,
      default: () => []
    },
    parentIndex: { // list的父级节点索引 多层结构会用到
      type: Number,
      default: 0
    }
  },
  data () {
    return {
    }
  },
  computed: {
    disableAdd () {
      return this.list.filter((item) => {
        return item.callType === 2
      }).length >= 1
    }
  },
  watch: {
    //
  },
  methods: {
    getCurrentSkillItem (index) {
      const res = this.skillList.find(item => item.skillId.toString() === this.list[index].nextSkillId.toString()) || []
      return res
    },
    updatePicked () {
    //
    },
    updateSkillPicked () {
      // this.list[index].nextSkillId = listItem.nextSkillId
    },
    updateNodePicked () {
      // console.debug('updateNodePicked', listItem)
    },
    getNodeId (node) {
      const data = node.getData()
      if (data.nodeType === 3 || data.nodeType === 2 || data.nodeType === 1) {
        return data.nodeId
      } else if (data.type === 1 && data['button-type'] === 'dialogue-button') {
        return data.buttonId
      }
      return ''
    },
    add () { // 添加操作
      this.$emit('add', { parentIndex: this.$props.parentIndex })
    },
    del (index) {
      this.$emit('del', { levelIndex: index, parentIndex: this.$props.parentIndex })
    }
  },
  mounted () {
    // console.debug('mounted nodeList: ', this.skillList)
  }
}
</script>
<style lang="stylus" scoped>
    .behavior-wrapper {
        // padding-left 10px
        .all-list-wrapper {
            .head-text {
                white-space nowrap
                margin-right 5px
                color #666
                font-size 14px
            }
            .list-item {
                display flex
                align-items center
                flex-wrap wrap
                padding 10px
                .short-select-width {
                    width 110px
                    margin-bottom 5px
                    margin-left 5px
                }
                .delete {
                    color #666
                    font-size 14px
                    margin-left 10px
                }
            }
        }
    }

</style>
