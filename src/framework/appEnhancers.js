import CSeedFrameSSO from 'cseed-frame/plugins/_sso'
import adminToolkit from '@cseed/admin-toolkit'
import cUtils from '@ccprivate/utils/dist/ccUtil.cjs'

import '@/assets/icon/iconfont.css'
import '@/assets/global.styl'

export default ({
  Vue, //  Vue 构造函数
  options, // 附加到 Vue 根实例的一些选项
  router, // 当前应用的路由实例
  store, // 当前应用的vuex实例
  i18n, // 当前应用的 i18n 实例
  qiankunProps // 乾坤
}) => {
  console.log('app start')
  Vue.use(CSeedFrameSSO, {
    enabled: true, // 是否开启SSO功能（单应用被qiankun加载时不支持SSO，就算enabled为true也不支持）
    checkLoginUrl: `/${process.env.VUE_APP_API_PREFIX}/auth/user/checkLogin`, // 校验是否已经进行单点登录
    logoutUrl: `/${process.env.VUE_APP_API_PREFIX}/auth/user/logout`, // 单点登出接口
    userDetailServiceUrl: 'auth/user/detail', // 用户详情接口
    /**
     * 请确保用户详情接口返回的数据格式为
     * {"result":"success","code":1000,"data":{"userName":"xxx@coocaa.com","userNickname":"xxx"},"msg":"成功"}
     */
    menusServiceUrl: 'auth/menu/tenantMenus' // 获取菜单接口
    /**
     * 请确保菜单接口返回的数据格式为
     * {
     *    "result": "success",
     *    "code": 1000,
     *    "data": {
     *      "tenantMenus": [
     *        {
     *          "template": "",
     *          "productEnName": "ugc",
     *          "icon": "el-icon-bell",
     *          "description": null,
     *          "pid": 0,
     *          "advancedFields": "[]",
     *          "type": "",
     *          "path": "/message",
     *          "children": [],
     *          "alias": "message",
     *          "id": 316,
     *          "advancedFlag": 1,
     *          "serId": null,
     *          "pUniqueId": "0",
     *          "apiJson": "{}",
     *          "productId": 61,
     *          "productVerUniqueId": "1559777366111158273",
     *          "fieldsJson": "[{\"label\":\"\",\"prop\":\"\",\"width\":\"\",\"inputType\":\"\",\"use\":[],\"render\":\"\"}]",
     *          "productUniqueId": "1559777366111158272",
     *          "sort": 0,
     *          "mType": 2,
     *          "productResource": null,
     *          "name": "消息管理",
     *          "publisher": null,
     *          "extraJson": "{}",
     *          "operation": null,
     *          "uniqueId": "1559778858872340480",
     *          "status": 1
     *        }
     *      ],
     *      "buttons": ["22081814jqGe"],
     *      "productId": 61
     *    },
     *    "msg": "成功"
     * }
     */
  })
  Vue.use(adminToolkit)
  // 做一些应用级别的优化
  Vue.prototype.$cUtils = cUtils
}
