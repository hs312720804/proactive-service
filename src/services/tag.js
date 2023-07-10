import fetch from 'cseed-frame/services/_fetch'

export function getRuleTagsListAPI (params) { // 获取规则标签列表
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/tag/list',
    params
  })
}
