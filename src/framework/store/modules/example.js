export default {
  namespaced: true,
  state: {
    isExample: true
  },
  mutations: {
    setExample (state, payload) {
      state.isExample = payload
    }
  }
}
