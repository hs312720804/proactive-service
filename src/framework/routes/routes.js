export default function createRoutes (frameRoutes = []) {
  console.log(frameRoutes)
  frameRoutes = frameRoutes.concat([
    {
      path: '/baseListTest',
      name: 'baseListTest',
      component: () => import(/* webpackChunkName: "baseList" */ '@/views/baseList/Index.vue')
    },
    {
      path: '/lowcodeEngineTest',
      name: 'lowcodeEngineTest',
      component: () => import(/* webpackChunkName: "LowcodeEngine" */ '@/views/LowcodeEngine/Index.vue')
    },
    {
      path: '*',
      name: 'not-found',
      meta: {
        isNoAuth: true,
        title: '404'
      },
      component: () => import('cseed-frame/components/NotFound.vue')
    }
  ])
  return frameRoutes
}
