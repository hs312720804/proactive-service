import fetch from 'cseed-frame/services/_fetch'

export function getMenusDetail (params) {
  return fetch({
    method: 'get',
    url: 'auth/menu/detail',
    params
  })
}

/**
 * 根据id去查询可视化配置
 * @param {*} params
 * @returns
 */
export function getLowerDetail (params) {
  return fetch({
    method: 'get',
    url: 'admin/pageConfiguation/detail',
    params
  })
}