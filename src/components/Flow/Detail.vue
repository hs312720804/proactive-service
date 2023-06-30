<template>
  <div class="graph-info-detail-component">
    <!-- :wrapperClosable="false" -->
    <el-drawer
      custom-class="detail-drawer"
      :title="title"
      :visible.sync="showBool"
      :direction="direction"
      :before-close="handleClose"
      :close-on-press-escape="false"
      :modal-append-to-body="false"
      :wrapperClosable="true"
      :modal="false"
      :size="400"
    >
      <template v-if="nodeType === 'start'">
        <el-form :model="startForm" label-width="70px">
          <el-form-item label="操作：">
            <el-col :span="11">
              <el-select v-model="startForm.NodeOrSkill" placeholder="调用">
                <el-option label="调用技能" value="1"></el-option>
                <el-option label="调用节点" value="2"></el-option>
              </el-select>
            </el-col>
            <el-col :span="1">&nbsp;&nbsp;</el-col>
            <el-col :span="11">
              <el-select
                v-if="startForm.NodeOrSkill === '1'"
                v-model="startForm.NodeOrSkillVal"
                placeholder="请选择技能"
                filterable
                @change="updateSkillPicked"
              >
                <el-option
                  v-for="item in skillList"
                  :key="item.id"
                  :label="item.skillName"
                  :value="item.id"
                ></el-option>
              </el-select>
              <el-select
                v-else
                v-model="startForm.NodeOrSkillVal"
                placeholder="请选择节点"
                @change="updateNodePicked"
                filterable
              >
                <el-option
                  v-for="item in childNodeList"
                  :key="item.id"
                  :label="item.attrs.text.text"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-col>
          </el-form-item>
        </el-form>
      </template>
      <template v-else-if="nodeType === 'judge'">
        judge
      </template>
      <template v-else-if="nodeType === 'dialogue'">
        dialogue
      </template>
    </el-drawer>
  </div>
</template>
<script>
import store from 'cseed-frame/store/_index'
import { getSkillListAPI } from '@/services/skill'
export default {
  props: {
    showNodeDetail: {
      type: Boolean,
      default: false
    },
    serviceId: {
      type: Number
    }
  },
  data () {
    return {
      direction: 'rtl',
      showBool: this.showNodeDetail,
      nodeType: store.getters.nodeType,
      startForm: {
        NodeOrSkill: '',
        NodeOrSkillVal: null
      },
      skillList: []
    }
  },
  methods: {
    handleClose (done) {
      // if (true) { // 业务判断
      //   done()
      //   this.$emit('updateDetail', true)
      // }
      done()
      this.$emit('update:showNodeDetail', this.showBool)
    },
    async getSkillList () {
      try {
        const res = await getSkillListAPI()
        console.debug('getSkillList res：', res)
        if (res.code === 1000) {
          this.skillList = res.data
        }
      } catch (error) {
        console.error('getSkillList error：', error)
      }
    },
    updateSkillPicked () { // 更新选择的技能
      // 提交到父组件 （1） 生成节点 生成连线 （2） 删除旧线旧节点(不用删除，直接覆盖)
      store.commit('flow/updateGraphNodeInfo', {
        serviceId: this.$props.serviceId,
        nodeType: this.nodeType, // judge start dialogue
        type: 'skill',
        targetNodeInfo: {
          id: this.startForm.NodeOrSkillVal,
          label: this.skillList.find(item => item.id === this.startForm.NodeOrSkillVal).skillName
        }
      })
    },
    updateNodePicked () { // 更新选择的节点
      // 提交到父组件 （1） 生成节点 生成连线 （2） 删除旧线旧节点(不用删除，直接覆盖)
      const pickNode = this.childNodeList.find(item => item.id === this.startForm.NodeOrSkillVal)
      store.commit('flow/updateGraphNodeInfo', {
        serviceId: this.$props.serviceId,
        nodeType: this.nodeType, // judge start dialogue
        type: 'node', // skill node
        targetNodeInfo: pickNode
        // targetNodePayload: { // 目标节点的额外数据
        //   id: this.startForm.NodeOrSkillVal
        // }
      })
    },
    reFill () {
      // 回填（重新打开drawer的时候）
      console.debug('getters: ', store.getters.nodeDetailInfo)
      const nodeDetailInfo = store.getters.nodeDetailInfo
      if (nodeDetailInfo.id === 'start') {
        if (Object.keys(nodeDetailInfo.model.incomings).length > 0) {
          // id
          // this.startForm.NodeOrSkillVal = Object.keys(nodeDetailInfo.model.incomings)[0].toString()
        }
      }
    }
  },
  computed: {
    title () {
      if (store.getters.nodeType === 'start') {
        return '开始'
      } else {
        return store.getters.nodeDetailInfo.getAttrs('label/text').text.text
      }
    },
    childNodeList () { // 除了开始节点以外的所有节点
      const currentGraph = store.getters.graphList.find(item => item.serviceId === this.$props.serviceId)
      return currentGraph?.nodeList.filter(item => item.id !== 'start')
    }
  },
  mounted () {
    this.getSkillList()
    // 回填（重新打开drawer的时候）
    this.reFill()
  }
}
</script>
<style lang="stylus" scoped>
.graph-info-detail-component {
  >>>.detail-drawer {
    .el-drawer__header {
      font-weight bold
      font-size 25px
      color #5f95ff
    }
  }
}
</style>
