import fetch from 'cseed-frame/services/_fetch'

export function getSkillListAPI (params) {
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/tag/skill',
    params
  })
}
