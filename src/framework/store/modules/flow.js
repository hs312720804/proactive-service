export default {
  namespaced: true,
  state: {
    nodeDetailInfo: null,
    nodeType: '' // 'start' || 'judge' || 'dialogue' || 'skill'
  },
  mutations: {
    setNodeDetailInfo (state, payload) {
      state.nodeDetailInfo = payload
      console.debug('nodeDetailInfo', state.nodeDetailInfo)
    },
    setNodeType (state, payload) {
      state.nodeType = payload
    }
  }
}
