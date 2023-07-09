<template>
  <div class="behavior-wrapper">
    <ul class="all-list-wrapper">
      <li
        class="list-item"
        v-for="(item, index) in list"
        :key="index"
      >
        <span class="head-text">{{ desc }} :</span>
        <el-select class="short-select-width" v-model="item.callType" placeholder="调用" style="margin-right: 5px;">
          <el-option label="调用技能" :value="1"></el-option>
          <el-option label="调用节点" :value="2"></el-option>
        </el-select>
        <el-select
          class="short-select-width"
          v-if="item.callType === 1"
          v-model="item.nextSkillId"
          placeholder="请选择技能"
          filterable
          @change="updateSkillPicked(item)"
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
          v-model="item.nextNodeId"
          placeholder="请选择节点"
          @change="updateNodePicked(item)"
          filterable
        >
          <el-option
            v-for="nodeItem in childNodeList"
            :key="nodeItem.id"
            :label="nodeItem.data.title"
            :value="getNodeId(nodeItem)"
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
    <el-button v-if="!isLimitOnly" type="text" @click="add">+添加{{ desc }}</el-button>
    <el-button v-else-if="isLimitOnly && list.length < 1" type="text" @click="add">+添加{{ desc }}</el-button>
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
    }
  },
  data () {
    return {
    }
  },
  computed: {
    //
  },
  watch: {
    //
  },
  methods: {
    getCurrentSkillItem (index) {
      const res = this.skillList.find(item => item.skillId.toString() === this.list[index].nextSkillId.toString()) || []
      return res
    },
    updateSkillPicked (payload) {
      console.debug('updateSkillPicked', payload)
    },
    updateNodePicked () {
      console.debug('updateNodePicked')
    },
    getNodeId (node) {
      console.debug('getNodeId', this.childNodeList)
      const data = node.getData()
      if (data.nodeType === 3 || data.nodeType === 2 || data.nodeType === 1) {
        return data.nodeId
      } else if (data.type === 1 && data['button-type'] === 'dialogue-button') {
        return data.buttonId
      }
      return ''
    },
    add () { // 添加操作
      console.debug('add')
      this.$emit('add')
    },
    del (index) {
      console.debug('delete', index)
      this.$emit('del', index)
    }
  },
  mounted () {
    // console.debug('mounted nodeList: ', this.skillList)
  }
}
</script>
<style lang="stylus" scoped>
    .behavior-wrapper {
        padding-left 10px
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
                .short-select-width {
                    width 120px
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
