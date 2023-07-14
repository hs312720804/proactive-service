export default {
  namespaced: true,
  state: {
    cellRenderData: null, // 节点的cell格式渲染数据
    nodeType: '', // 'start' || 'judge' || 'dialogue' || 'skill'
    graphList: [], // 画布所有信息 [id + 画布x6对象]
    nodeList: [], // 画布节点数据
    nodeId: '' // 节点id 是用来请求后台的id 不是节点渲染的id
  },
  mutations: {
    setCellRenderData (state, payload) {
      state.cellRenderData = payload
      console.debug('cellRenderData', state.cellRenderData)
    },
    setNodeType (state, payload) {
      state.nodeType = payload
    },
    setNodeId (state, payload) {
      state.nodeId = payload
    },
    // 画布每次渲染 fromJSON 时，都会触发该方法
    setGraphList (state, payload) { // 存储画布信息
      const findGraph = state.graphList.find(item => item.serviceId === payload.serviceId)
      if (findGraph) {
        findGraph.graphInfo = Object.assign(findGraph.graphInfo, payload.graphInfo)
      } else {
        state.graphList.push(payload)
      }
      // console.debug('mutations setGraphList', state.graphList)
    },
    updateStartNodeLink (state, payload) {
      // 更新开始节点的连线
    },
    updateDialogueDetail (state, payload) {
      // 更新对话框节点详情 目前仅用于跨组件事件传递
      // console.debug('updateDialogueDetail payload:', payload)
    },
    updateJudgeNodeDetail (state, payload) {
      // 更新判定节点详情 目前仅用于跨组件事件传递
    },
    updateStatuTitle () {
      // 更新画布右上角标题
    },
    updateGraphTree () {
      // 更新画布树
    },
    setAnyliseFilterForm () {
      // 更新了分析筛选
    },
    // 存储时机:
    // 1. 画布初始化时
    // 2. 新添加节点到画布
    // 3. 删除画布节点
    setNodeList (state, payload) {
      const { serviceId, nodeList } = payload
      const findGraph = state.graphList.find(item => item.serviceId === serviceId)
      if (findGraph) {
        findGraph.nodeList = nodeList
      }
      // console.debug('mutations setNodeList', state.graphList)
    }
  }
}
