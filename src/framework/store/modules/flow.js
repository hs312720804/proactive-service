export default {
  namespaced: true,
  state: {
    nodeDetailInfo: null,
    nodeType: '', // 'start' || 'judge' || 'dialogue' || 'skill'
    graphList: [], // 画布所有信息 [id + 画布x6对象]
    nodeList: [] // 画布节点数据
  },
  mutations: {
    setNodeDetailInfo (state, payload) {
      state.nodeDetailInfo = payload
      console.debug('nodeDetailInfo', state.nodeDetailInfo)
    },
    setNodeType (state, payload) {
      state.nodeType = payload
    },
    // 画布每次渲染 fromJSON 时，都会触发该方法
    setGraphList (state, payload) { // 存储画布信息
      const findGraph = state.graphList.find(item => item.serviceId === payload.serviceId)
      if (findGraph) {
        findGraph.graphInfo = Object.assign(findGraph.graphInfo, payload.graphInfo)
      } else {
        state.graphList.push(payload)
      }
      console.debug('mutations setGraphList', state.graphList)
    },
    updateGraphNodeInfo (state, payload) { // 更新画布节点信息
      // const findGraph = state.graphList.find(item => item.serviceId === payload.serviceId)
      // if (findGraph) {
      // findNode
      // }
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
      console.debug('mutations setNodeList', state.graphList)
    }
  }
}
