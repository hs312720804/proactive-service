import fetch from 'cseed-frame/services/_fetch'
const apiDict = {
  getSkill: {
    url: '/proactive_admin_api/scene/skill/get'
  },
  updateSkill: {
    url: '/proactive_admin_api/scene/skill/update',
    method: 'post'
  },
  addSkill: {
    url: '/proactive_admin_api/scene/skill/add',
    method: 'post'
  }
}
export function ApiRequest (api, data) {
  const method = apiDict[api].method || 'get'
  const parameter = {
    method,
    url: `${apiDict[api].url}`
  }
  const isFile = apiDict[api].isFile
  if (isFile) {
    parameter.isFile = isFile
  }
  if (method === 'post') {
    parameter.data = data
  } else {
    parameter.params = data
  }
  if (!apiDict[api].isAllData) {
    return fetch(parameter).then(({ data }) => {
      return data
    })
  } else {
    return fetch(parameter).then((data) => {
      return data
    })
  }
}
