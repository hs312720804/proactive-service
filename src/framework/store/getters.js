export default {
  isRelogin: state => state.dev.isRelogin, // 使用 @ccprivate/framework-saas-mirco 框架中内置的 dev 模块
  isExample: state => state.example.isExample,
  tabsArr: state => state.services.tabsArr,
  activeTab: state => state.services.activeTab,
  nodeType: state => state.flow.nodeType,
  nodeId: state => state.flow.nodeId,
  cellRenderData: state => state.flow.cellRenderData,
  graphList: state => state.flow.graphList
}
