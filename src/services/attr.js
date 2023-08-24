import fetch from 'cseed-frame/services/_fetch'

// 属性配置 - 获取服务属性列表
export function getTagAttrsList (params) {
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/tagAttrs/list',
    params
  })
}

// 属性配置 - 插入服务属性
export function addTagAttrs (data) {
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/tagAttrs/add',
    data
  })
}

// 属性配置 - 删除服务属性
export function delTagAttrs (params) {
  return fetch({
    method: 'delete',
    url: 'proactive_admin_api/interactify/tagAttrs/del',
    params
  })
}
