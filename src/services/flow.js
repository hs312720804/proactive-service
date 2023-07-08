import fetch from 'cseed-frame/services/_fetch'

export function addJudgeNodeAPI (data) { // 添加判断节点
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/node/assert/add',
    data
  })
}

export function deleteNodeAPI (params) { // 删除节点
  return fetch({
    method: 'delete',
    url: 'proactive_admin_api/interactify/node/del',
    params
  })
}

export function addDialogueNodeAPI (data) { // 添加对话框节点
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/node/dialog/add',
    data
  })
}

export function getDialogueNodeDetailAPI (params) { // 获取对话框节点详情
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/node/dialog/get',
    params
  })
}

export function updateDialogueDetailAPI (data) { // 更新对话框节点详情
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/node/dialog/update',
    data
  })
}

export function getTreeDataAPI (params) { // 获取树形结构数据
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/node/tree/get',
    params
  })
}

export function getVersionIdAPI (params) { // 根据serverId获取versionId
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/node/versionId',
    params
  })
}
