import fetch from 'cseed-frame/services/_fetch'

export function addJudgeNodeAPI (data) { // 添加判断节点
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/node/assert/add',
    data
  })
}

export function addDialogueNodeAPI (data) { // 添加对话框节点
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/node/dialog/add',
    data
  })
}
