import Vue from 'vue'
import Vuex from 'vuex'
import getters from 'cseed-frame/store/getters'
import { getMenuButton } from 'cseed-frame/utils/_permission'
import createPersistedState from 'vuex-persistedstate'

const IS_POWERED_BY_SAAS = window.__POWERED_BY_QIANKUN__

const modules = {}
const req = require.context('cseed-frame/store/modules', false, /\.js$/)
req.keys().map(key => {
  modules[key.replace(/(^\.\/|\.js$)/g, '')] = req(key).default
})

Vue.use(Vuex)

function getHttpHeaders (state) {
  return IS_POWERED_BY_SAAS ? Vue.prototype.$mainState.store.getters.httpHeaders : state.dev.httpHeaders
}

function getUserInfo (state) {
  return IS_POWERED_BY_SAAS ? Vue.prototype.$mainState.store.state.user : state.dev.user
}

export default new Vuex.Store({
  modules,
  getters: {
    httpHeaders: getHttpHeaders,
    getHttpHeaders: state => () => getHttpHeaders(state),
    getAccessMap: state => () => IS_POWERED_BY_SAAS ? Vue.prototype.$mainState.store.state.app.access : state.dev.access,
    getMenuBtnMap: (state, getters) => {
      return () => {
        const accessMap = getters.getAccessMap()
        const menus = IS_POWERED_BY_SAAS ? Vue.prototype.$mainState.store.state.app.menus : state.dev.menus
        return getMenuButton(menus, undefined, accessMap)
      }
    },
    userInfo: getUserInfo,
    getUserInfo: state => () => getUserInfo(state),
    ...getters
  },
  plugins: [
    // 针对enum模块下的数据做持久化缓存
    createPersistedState({
      key: 'example',
      paths: ['example', 'services', 'flow']
    })
  ]
})
