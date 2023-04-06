// 路由配置
export default {
  base: window.__POWERED_BY_QIANKUN__ ? `/${process.env.VUE_APP_PROJECT_CODE}/` : '/',
  mode: 'history'
}
