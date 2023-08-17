<template>
  <div
    class="graph-info-detail-component"
    style="animation: all 0.5s;"
    :class="{'detail-component-hide': !showDetail}"
  >
    <!-- <el-drawer
      ref="drawer"
      custom-class="detail-drawer"
      :title="title"
      :visible.sync="showBool"
      :direction="direction"
      :before-close="handleClose"
      :close-on-press-escape="false"
      :modal-append-to-body="true"
      :wrapperClosable="true"
      :modal="false"
      :size="400"
    >

    </el-drawer> -->
    <div
      class="flex-item"
      :class="showDetail ? 'el-icon-s-unfold' :'el-icon-s-fold'"
      @click="showDetail = !showDetail"
    >
    </div>
    <div v-if="show">
      <div class="title">{{ title }}</div>
      <template v-if="nodeType === 'start'">
        <el-form :model="startForm" label-width="80px" label-position="left" style="margin: 20px 10px 65px;">
          <el-form-item label="操作">
            <el-col :span="11">
              <el-select
                v-model="startForm.NodeOrSkill"
                placeholder="调用"
                @change="updateNodeOrSkillPick"
              >
                <el-option label="调用技能" :value="1"></el-option>
                <el-option label="调用节点" :value="2"></el-option>
              </el-select>
            </el-col>
            <el-col :span="1">&nbsp;&nbsp;</el-col>
            <el-col :span="11">
              <!-- @change="updateSkillPicked" -->
              <el-select
                v-if="startForm.NodeOrSkill === 1"
                v-model="startForm.NodeOrSkillVal"
                placeholder="请选择技能"
                filterable
              >
                <el-option
                  v-for="item in skillList"
                  :key="item.skillId"
                  :label="item.skillName"
                  :value="Number(item.skillId)"
                ></el-option>
              </el-select>
              <!-- @change="updateNodePicked" -->
              <el-select
                v-else
                v-model="startForm.NodeOrSkillVal"
                placeholder="请选择节点"
                filterable
              >
                <el-option
                  v-for="item in nodeSelectList"
                  :key="item.nodeId"
                  :label="item.title"
                  :value="item.nodeId"
                ></el-option>
              </el-select>
            </el-col>
          </el-form-item>
          <el-button type="primary" @click="saveStartNodeOperate" style="width: 100%">保存</el-button>
        </el-form>
      </template>
      <template v-else-if="nodeType === 'judge'">
        <JudgeDetail
          ref="judgeDetailComponent"
          :versionId="versionId"
          :skillList="skillList"
          :childNodeList="nodeSelectList"
          :renderData="judgeDetailData"
          @submit="handleSubmitJudge"
        ></JudgeDetail>
      </template>
      <template v-else-if="nodeType === 'dialogue'">
        <DialogueDetail
          ref="dialogueDetailComponent"
          :versionId="versionId"
          :skillList="skillList"
          :childNodeList="nodeSelectList"
          :renderData="dialogueDetailData"
          @submit="handleSubmitDialogue"
        ></DialogueDetail>
      </template>
    </div>
  </div>
</template>
<script>
import store from 'cseed-frame/store/_index'
import DialogueDetail from '@/components/Flow/DialogueDetail.vue'
import JudgeDetail from '@/components/Flow/JudgeDetail.vue'
import { getSkillListAPI } from '@/services/skill'
import { getStartNodeAPI, getDialogueNodeDetailAPI, updateStartNodeAPI, updateDialogueDetailAPI, getJudgeNodeDetailAPI, updateJudgeNodeDetailAPI, getVersionIdAPI, getNodeSelectListAPI } from '@/services/flow'
import { mapGetters } from 'vuex'
export default {
  components: {
    DialogueDetail,
    JudgeDetail
  },
  props: {
    showNodeDetail: {
      type: Boolean,
      default: false
    }
  },
  inject: ['serviceId'],
  data () {
    return {
      showDetail: true,
      direction: 'rtl',
      showBool: this.showNodeDetail,
      // nodeType: store.getters.nodeType,
      versionId: 0,
      startForm: {
        NodeOrSkill: '',
        NodeOrSkillVal: null
      },
      skillList: [],
      nodeSelectList: [],
      dialogueDetailData: {},
      judgeDetailData: {},
      startDetailData: {},
      drawerRef: null,
      show: false
    }
  },
  watch: {
    versionId (newval, oldval) {
      // console.debug('versionId: ', newval)
      this.getNodeSelectList(newval)
    },
    nodeId: {
      async handler (val) {
        this.showDetail = true
        console.log('val------>', val)
        this.show = false
        this.getVersionId()
        this.getSkillList()
        await this.reFill()
        this.initDrawerRef()
        this.$nextTick(() => {
          this.show = true
        })
      },
      immediate: true
    }
  },
  methods: {
    updateNodeOrSkillPick (val) { // 开始详情 改变选择 节点/技能
      this.startForm.NodeOrSkillVal = null
    },
    async getNodeSelectList (versionId) {
      try {
        const res = await getNodeSelectListAPI({
          versionId
        })
        if (res.code === 1000) {
          // console.debug('getNodeSelectList res: ', res)
          this.nodeSelectList = res.data
        }
      } catch (error) {
        console.error('getNodeSelectList error: ', error)
      }
    },
    getNodeId (node) {
      const data = node.data
      if (data.nodeType === 3 || data.nodeType === 2 || data.nodeType === 1) {
        return data.nodeId
      } else if (data.type === 1 && data['button-type'] === 'dialogue-button') {
        return data.buttonId
      }
      return ''
    },
    async saveStartNodeOperate () { // 保存开始节点的操作
      console.debug('saveStartNodeOperate')
      const { NodeOrSkill, NodeOrSkillVal } = this.startForm
      let payload = {}
      if (NodeOrSkill === '') {
        this.$message.error('请调用操作')
        return false
      }
      if (NodeOrSkill === 1) { // skill
        payload.nextSkillId = NodeOrSkillVal || ''
        payload = {
          nextSkillId: NodeOrSkillVal || '',
          callType: NodeOrSkill,
          nodeId: this.startDetailData.nodeId,
          skillParam: '',
          versionId: this.versionId
        }
      } else if (NodeOrSkill === 2) { // node
        payload = {
          nextNodeId: NodeOrSkillVal || '',
          callType: NodeOrSkill,
          nodeId: this.startDetailData.nodeId,
          skillParam: '',
          versionId: this.versionId
        }
      }
      try {
        const res = await updateStartNodeAPI(payload)
        if (res.code === 1000) {
          if (NodeOrSkill === 1) { // skill
            this.updateStartPickSkill()
          } else if (NodeOrSkill === 2) { // node
            this.updateStartPickNode()
          }
          return res
          // console.debug('updateStartNodeAPI res: ', res)
        }
      } catch (error) {
        console.error('updateStartNodeAPI error: ', error)
      }
    },
    handleClose (done) {
      // const nodeType = store.getters.nodeType
      // 服务交互，节点多时，每次保存都需要较长时间影响体验。建议优化。Bug: CLOUDARCH-904 先隐藏自动保存功能
      // if (nodeType === 'start') {
      //   this.saveStartNodeOperate()
      // } else if (nodeType === 'judge') {
      //   if (this.$refs.judgeDetailComponent) {
      //     this.$refs.judgeDetailComponent.submitForm()
      //   }
      // } else if (nodeType === 'dialogue') {
      //   if (this.$refs.dialogueDetailComponent) {
      //     this.$refs.dialogueDetailComponent.submitForm()
      //   }
      // }
      done()
      this.$emit('update:showNodeDetail', this.showBool)
    },
    async handleSubmitJudge (payload) {
      // console.debug('handleSubmitJudge :', payload)
      try {
        const res = await updateJudgeNodeDetailAPI(payload)
        if (res.code === 1000) {
          // this.drawerRef.closeDrawer()
          store.commit('flow/updateJudgeNodeDetail', payload)
        }
        // console.debug('updateJudgeNodeDetailAPI res: ', res)
      } catch (error) {
        console.error('handleSubmitJudge error: ', error)
      }
    },
    async handleSubmitDialogue (payload) {
      console.debug('handleSubmitDialogue payload: ', payload)
      try {
        const res = await updateDialogueDetailAPI(payload)
        if (res.code === 1000) {
          // this.drawerRef.closeDrawer()
          store.commit('flow/updateDialogueDetail', payload)
        }
      } catch (error) {
        console.error('handleSubmitDialogue error: ', error)
      }
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
    updateStartPickSkill () { // 更新开始节点 选择的技能
      // vuex监听事件 graph响应更新连线 （1） 生成节点 生成连线 （2） 删除旧线旧节点(不用删除，直接覆盖)
      console.debug('updateStartPickSkill: ', this.startForm.NodeOrSkillVal)
      store.commit('flow/updateStartNodeLink', {
        serviceId: this.serviceId,
        type: 'skill',
        sourceNodeId: this.startDetailData.nodeId,
        targetNodeInfo: {
          id: this.startForm.NodeOrSkillVal,
          label: this.skillList.find(item => Number(item.skillId) === this.startForm.NodeOrSkillVal).skillName
        }
      })
      console.debug('updateStartPickSkill end: ')
    },
    updateStartPickNode () { // 更新开始节点 选择其他子节点
      // vuex监听事件 graph响应更新连线 （1） 生成节点 生成连线 （2） 删除旧线旧节点(不用删除，直接覆盖)
      console.debug('updateStartPickNode: ', this.startForm.NodeOrSkillVal)
      const pickNode = this.childNodeList.find(item => this.getNodeId(item) === this.startForm.NodeOrSkillVal)
      store.commit('flow/updateStartNodeLink', {
        serviceId: this.serviceId,
        type: 'node', // skill node
        sourceNodeId: this.startDetailData.nodeId,
        targetNodeInfo: pickNode
      })
    },
    async reFill () { // 回填（重新打开drawer的时候）
      // console.debug('getters: ', store.getters.cellRenderData)
      const nodeId = store.getters.nodeId
      const nodeType = this.nodeType
      const cellRenderData = store.getters.cellRenderData
      if (nodeType === 'start') {
        const res = await getStartNodeAPI({
          nodeId
        })
        if (res.code === 1000) {
          console.debug('getStartNodeAPI res:', res)
          this.startDetailData = res.data
          const { callType, nextNodeId, nextSkillId } = res.data
          this.startForm = {
            NodeOrSkill: callType,
            NodeOrSkillVal: callType === 1 ? nextSkillId : nextNodeId
          }
        }
        if (Object.keys(cellRenderData.model.incomings).length > 0) {
          //
        }
      } else if (nodeType === 'judge') {
        const res = await getJudgeNodeDetailAPI({
          nodeId
        })
        if (res.code === 1000) {
          console.debug('getJudgeNodeDetailAPI res:', res)
          this.judgeDetailData = res.data
        }
      } else if (nodeType === 'dialogue') {
        // console.debug('cellRenderData 1: ', cellRenderData)
        const res = await getDialogueNodeDetailAPI({
          nodeId
        })
        // console.log('getDialogueNodeDetailAPI res:', res)
        if (res.code === 1000) {
          this.dialogueDetailData = res.data
        }
      }
    },
    async getVersionId () {
      try {
        const res = await getVersionIdAPI({
          serviceId: this.serviceId
        })
        if (res.code === 1000) {
          this.versionId = res.data
        }
      } catch (error) {
        console.error('getVersionId error: ', error)
      }
    },
    initDrawerRef () {
      this.drawerRef = this.$refs.drawer
    }
  },
  computed: {
    ...mapGetters(['nodeId', 'nodeType']),
    title () {
      if (this.nodeType === 'start') {
        return '开始'
      } else {
        // console.log('store.getters.cellRenderData', store.getters.cellRenderData.getData())
        // return store.getters.cellRenderData.getAttrs('label/text').text.text
        return store.getters.cellRenderData.getData().ctype
      }
    },
    childNodeList () { // 除了开始节点以外的所有节点 废弃 不从前端计算节点
      const currentGraph = store.getters.graphList.find(item => item.serviceId === this.serviceId)

      const flag = currentGraph?.nodeList.filter(item => {
        const data = item.data
        return data.nodeType === 2 || data.nodeType === 3 || (data.type === 1 && data['button-type'] === 'dialogue-button')
      })

      return flag || []
    }
  }
}
</script>
<style lang="stylus" scoped>
.graph-info-detail-component {
  >>>.detail-drawer {
    .el-drawer__header {
      font-weight bold
      font-size 16px
      color #5f95ff
    }
  }
  position: fixed;
  z-index: 999;
  top: 0;
  width: 400px;
  background: #fff;
  right: 0;
  height: 100%;
  border: 10px solid #f6f6f6;
  box-sizing: border-box;
}
.title {
  font-weight bold
  font-size 16px
  color #5f95ff
  padding: 15px 15px 0 10px;
}
.detail-component-hide {
  width: 0
  border: 0
}
.flex-item {
  font-size: 30px;
  color: #000000;
  position: absolute;
  left: -34px;
  top: 50%;
  background: #7777772b;
  padding: 20px 0;
  border-radius: 20px 0 0 20px;
}
</style>
