export default {
  namespaced: true,
  state: {
    tabsArr: [],
    activeTab: null,
    abc: true
  },
  mutations: {
    setABC (state, payload) {
      state.abc = payload
    },
    addTab (state, payload) {
      const findTab = state.tabsArr.find(item => item.id === payload.id)
      if (findTab) {
        state.activeTab = findTab
        return
      }
      state.tabsArr.push(payload)
      state.activeTab = payload
    },
    updateSelectTab (state, payload) {
      state.activeTab = payload // info or index
    },
    removeTab (state, tabIndex) {
      state.tabsArr.splice(tabIndex, 1)
    }
  }
}
