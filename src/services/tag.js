import fetch from 'cseed-frame/services/_fetch'

export function getRuleTagsListAPI (params) { // 获取规则标签列表
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/tag/list',
    params
  })
}

// 人群满足标签(tagKey: dmp_crowd)
export function getCrowdListAPI (params) { // 获取主动服务(生活助手)下的人群列表
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/setting/admin/crowd/list',
    params
  })
}

// 按钮点击(tagKey: button_click)
export function getDialogueListAPI (params) { // 获取当前画布下对话框列表
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/tag/node',
    params
  })
}

// 按钮点击(tagKey: button_click)
export function getButtonListAPI (params) { // 获取当前对话框下的按钮列表
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/tag/button',
    params
  })
}

// 用户行为满足(tagkey: event_hit)
export function getUserEventListAPI (params) { // 获取用户行为 事件列表
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/scene/event/list',
    params
  })
}
